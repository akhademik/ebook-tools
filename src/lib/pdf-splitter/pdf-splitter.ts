// src/lib/pdf-splitter/pdf-splitter.ts
import JSZip from 'jszip';
import {
	Logger,
	initPdfWorker,
	getClampedViewport,
	MAX_CANVAS_DIMENSION,
	MAX_CANVAS_PIXELS,
	MOBILE_MAX_CANVAS_PIXELS
} from '$lib/utils';
import type {
	PdfPreviewPage,
	PdfProgressInfo,
	ProcessPdfResult,
	PdfZipPart,
	ProcessPdfOptions,
	PdfJsLib,
	PdfJsDocument
} from '$lib/types';

export const DEFAULT_DPI = 200;

export function dpiToScale(dpi: number): number {
	return dpi / 72;
}

const PDF_SCALE = dpiToScale(DEFAULT_DPI);
const JPEG_QUALITY = 0.85;
const GRAY_CONTRAST = 1.08;

export const DEFAULT_DESKTOP_PART_BYTES = 80 * 1024 * 1024; // 80 MB
export const DEFAULT_MOBILE_PART_BYTES = 40 * 1024 * 1024; // 40 MB
export const DEFAULT_MAX_PAGES_PER_PART = 300;

export { getClampedViewport, MAX_CANVAS_DIMENSION, MAX_CANVAS_PIXELS };

/**
 * Check if the current device is mobile, iPad, or has low hardware RAM (<= 4GB).
 */
export function isMobileOrLowMemoryDevice(): boolean {
	if (typeof navigator === 'undefined') return false;
	const isMobileUa = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
		navigator.userAgent
	);
	const isIpadOS =
		typeof navigator.platform === 'string' &&
		navigator.platform === 'MacIntel' &&
		navigator.maxTouchPoints > 1;
	const navWithMemory = navigator as { deviceMemory?: number };
	const isLowMemory =
		typeof navWithMemory.deviceMemory === 'number' ? navWithMemory.deviceMemory <= 4 : false;
	return isMobileUa || isIpadOS || isLowMemory;
}

export function applyGrayscale(
	ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
	width: number,
	height: number,
	contrast: number
): void {
	Logger.debug(
		'[pdf-splitter]',
		`applyGrayscale called, width: ${width}, height: ${height}, contrast: ${contrast}`
	);
	const imgData = ctx.getImageData(0, 0, width, height);
	const d = imgData.data;
	for (let i = 0; i < d.length; i += 4) {
		const gray = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
		let v = (gray - 128) * contrast + 128;
		v = v < 0 ? 0 : v > 255 ? 255 : v;
		d[i] = d[i + 1] = d[i + 2] = v;
	}
	ctx.putImageData(imgData, 0, 0);
}

export function cropCanvas<T extends HTMLCanvasElement | OffscreenCanvas>(
	sourceCanvas: T,
	topPx: number,
	bottomPx: number
): T {
	const w = sourceCanvas.width;
	const h = sourceCanvas.height;
	const safeTop = Math.max(0, Math.min(topPx, h - 1));
	const safeBottom = Math.max(0, Math.min(bottomPx, h - 1 - safeTop));
	const newH = Math.max(1, h - safeTop - safeBottom);
	Logger.debug(
		'[pdf-splitter]',
		`cropCanvas called, source size: ${w}x${h}, cropping top: ${topPx}, bottom: ${bottomPx}, new height: ${newH}`
	);

	if (typeof OffscreenCanvas !== 'undefined' && sourceCanvas instanceof OffscreenCanvas) {
		const out = new OffscreenCanvas(w, newH);
		const octx = out.getContext('2d');
		if (octx) {
			octx.drawImage(sourceCanvas, 0, safeTop, w, newH, 0, 0, w, newH);
		}
		return out as T;
	}

	const out = document.createElement('canvas');
	out.width = w;
	out.height = newH;
	const octx = out.getContext('2d', { alpha: false });
	if (octx) {
		octx.drawImage(sourceCanvas, 0, safeTop, w, newH, 0, 0, w, newH);
	}
	return out as T;
}

export function formatEta(seconds: number): string {
	if (!isFinite(seconds) || seconds < 0) return '--:--';
	const m = Math.floor(seconds / 60);
	const s = Math.round(seconds % 60);
	return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
}

/**
 * Open PDF document safely with zero-copy object URL streaming if supported,
 * falling back to a single Uint8Array arrayBuffer load without duplicate slicing.
 */
async function openPdfDocument(
	file: File,
	pdfjs: PdfJsLib
): Promise<{ doc: PdfJsDocument; cleanup: () => void }> {
	initPdfWorker();

	let objectUrl: string | null = null;
	let docSource: { url: string } | { data: Uint8Array };

	if (typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function') {
		try {
			objectUrl = URL.createObjectURL(file);
			docSource = { url: objectUrl };
		} catch {
			objectUrl = null;
			const buf = await file.arrayBuffer();
			docSource = { data: new Uint8Array(buf) };
		}
	} else {
		const buf = await file.arrayBuffer();
		docSource = { data: new Uint8Array(buf) };
	}

	let doc: PdfJsDocument;
	try {
		doc = await pdfjs.getDocument(docSource).promise;
	} catch (err) {
		if (objectUrl) {
			try {
				URL.revokeObjectURL(objectUrl);
			} catch {
				// ignore
			}
		}
		throw err;
	}

	const cleanup = () => {
		try {
			doc.destroy();
		} catch {
			// ignore
		}
		if (objectUrl) {
			try {
				URL.revokeObjectURL(objectUrl);
			} catch {
				// ignore
			}
		}
	};

	return { doc, cleanup };
}

export async function loadPdfPreview(
	pdfSelectedFile: File | null,
	selectedPreviewCount: number,
	keepColor: boolean
): Promise<PdfPreviewPage[]> {
	const globalPdfjs = typeof window !== 'undefined' ? window.pdfjsLib : null;
	if (!pdfSelectedFile || !globalPdfjs) {
		Logger.error('[pdf-splitter]', 'loadPdfPreview error: no file or pdfjsLib missing');
		throw new Error('Chưa chọn tệp PDF hoặc thư viện PDF.js chưa tải.');
	}
	Logger.debug(
		'[pdf-splitter]',
		`loadPdfPreview called, file size: ${pdfSelectedFile.size}, preview count limit: ${selectedPreviewCount}, keepColor: ${keepColor}`
	);

	const { doc, cleanup } = await openPdfDocument(pdfSelectedFile, globalPdfjs);
	try {
		const count = Math.min(selectedPreviewCount, doc.numPages);
		Logger.debug(
			'[pdf-splitter]',
			`loadPdfPreview: loading ${count} preview pages (total pages in doc: ${doc.numPages})`
		);
		const pages: PdfPreviewPage[] = [];

		for (let p = 1; p <= count; p++) {
			Logger.debug('[pdf-splitter]', `loadPdfPreview: rendering page ${p}`);
			const page = await doc.getPage(p);
			const viewport = getClampedViewport(page, PDF_SCALE);
			const canvas = document.createElement('canvas');
			canvas.width = viewport.width;
			canvas.height = viewport.height;
			const ctx = canvas.getContext('2d', { alpha: false, willReadFrequently: true });
			if (!ctx) {
				canvas.width = 0;
				canvas.height = 0;
				page.cleanup();
				throw new Error(`Không thể khởi tạo Canvas 2D context cho trang xem trước ${p}.`);
			}

			await page.render({ canvasContext: ctx, viewport }).promise;
			if (!keepColor) {
				applyGrayscale(ctx, canvas.width, canvas.height, GRAY_CONTRAST);
			}

			pages.push({
				pageNum: p,
				dataUrl: canvas.toDataURL('image/jpeg', 0.8),
				width: canvas.width,
				height: canvas.height
			});

			// Immediate memory release
			canvas.width = 0;
			canvas.height = 0;
			page.cleanup();
		}
		Logger.debug(
			'[pdf-splitter]',
			`loadPdfPreview finished, returns preview pages: ${pages.length}`
		);
		return pages;
	} finally {
		cleanup();
	}
}

export async function processPdfToJpg(
	pdfSelectedFile: File | null,
	optionsOrKeepColor: boolean | ProcessPdfOptions = false,
	legacyCropTopPx = 0,
	legacyCropBottomPx = 0,
	legacyOnProgress?: (info: PdfProgressInfo) => void,
	legacySignal?: AbortSignal,
	legacyMaxPagesPerPart?: number
): Promise<ProcessPdfResult> {
	const opts: ProcessPdfOptions =
		typeof optionsOrKeepColor === 'object'
			? optionsOrKeepColor
			: {
					keepColor: optionsOrKeepColor,
					cropTopPx: legacyCropTopPx,
					cropBottomPx: legacyCropBottomPx,
					onProgress: legacyOnProgress,
					signal: legacySignal,
					maxPagesPerPart: legacyMaxPagesPerPart
				};

	if (opts.signal?.aborted) {
		throw new DOMException('Tác vụ xử lý PDF đã bị hủy', 'AbortError');
	}
	const globalPdfjs = typeof window !== 'undefined' ? window.pdfjsLib : null;
	if (!pdfSelectedFile || !globalPdfjs) {
		Logger.error('[pdf-splitter]', 'processPdfToJpg error: no file or pdfjsLib missing');
		throw new Error('Chưa chọn tệp PDF hoặc thư viện PDF.js chưa tải.');
	}

	const isMobile = isMobileOrLowMemoryDevice();
	const maxPartBytes =
		opts.maxPartBytes ?? (isMobile ? DEFAULT_MOBILE_PART_BYTES : DEFAULT_DESKTOP_PART_BYTES);
	const maxPagesPerPart = opts.maxPagesPerPart ?? DEFAULT_MAX_PAGES_PER_PART;
	const targetDpi = opts.targetDpi ?? DEFAULT_DPI;
	const targetScale = opts.targetScale ?? dpiToScale(targetDpi);
	const maxCanvasPixels = isMobile ? MOBILE_MAX_CANVAS_PIXELS : MAX_CANVAS_PIXELS;
	const keepColor = opts.keepColor ?? false;
	const cropTopPx = opts.cropTopPx ?? 0;
	const cropBottomPx = opts.cropBottomPx ?? 0;

	Logger.debug(
		'[pdf-splitter]',
		`processPdfToJpg called, size: ${pdfSelectedFile.size}, keepColor: ${keepColor}, targetScale: ${targetScale}, maxPartBytes: ${maxPartBytes}, maxPagesPerPart: ${maxPagesPerPart}`
	);

	// Load document ONCE with zero-copy stream or single-buffer reuse
	const { doc, cleanup } = await openPdfDocument(pdfSelectedFile, globalPdfjs);

	try {
		const totalDocPages = doc.numPages;
		const startPage = Math.max(1, Math.min(opts.startPage ?? 1, totalDocPages));
		const endPage = Math.max(startPage, Math.min(opts.endPage ?? totalDocPages, totalDocPages));
		const totalPagesToProcess = endPage - startPage + 1;

		Logger.debug(
			'[pdf-splitter]',
			`processPdfToJpg: total doc pages: ${totalDocPages}, range: ${startPage}–${endPage} (${totalPagesToProcess} pages)`
		);

		const zipParts: PdfZipPart[] = [];
		const failedPages: number[] = [];
		const degradedPages: number[] = [];
		let currentZip = new JSZip();
		let partStartPage = startPage;
		let currentPartIndex = 1;
		let currentPartBytes = 0;
		let currentPartPagesCount = 0;
		let completed = 0;
		const startTime = performance.now();

		function updateProgress(customLabel?: string): void {
			const elapsedSec = (performance.now() - startTime) / 1000;
			const rate = completed / Math.max(elapsedSec, 0.001);
			const remaining = totalPagesToProcess - completed;
			const eta = rate > 0 ? remaining / rate : Infinity;
			const progressPercent = Math.min(99, Math.round((completed / totalPagesToProcess) * 100));
			const progressLabel =
				customLabel ??
				`Đang xử lý ${completed} / ${totalPagesToProcess} trang · ` +
					`${rate.toFixed(1)} trang/giây · còn lại ~${formatEta(eta)}`;

			if (opts.onProgress) {
				opts.onProgress({
					progressPercent,
					progressLabel,
					completed,
					numPages: totalPagesToProcess
				});
			}
		}

		updateProgress();

		const ctxOpts: CanvasRenderingContext2DSettings = keepColor
			? { alpha: false }
			: { alpha: false, willReadFrequently: true };

		// Sequential rendering on a single document
		for (let p = startPage; p <= endPage; p++) {
			if (opts.signal?.aborted) {
				throw new DOMException('Tác vụ xử lý PDF đã bị hủy', 'AbortError');
			}

			Logger.debug(
				'[pdf-splitter]',
				`Processing page ${p} of ${totalDocPages} (range ${startPage}–${endPage})`
			);
			const page = await doc.getPage(p);

			let blob: Blob | null = null;
			let renderScale = targetScale;
			let retryCount = 0;
			let isDegraded = false;

			while (retryCount <= 1) {
				try {
					const viewport = getClampedViewport(
						page,
						renderScale,
						MAX_CANVAS_DIMENSION,
						maxCanvasPixels
					);
					if (typeof viewport.scale === 'number' && viewport.scale < targetScale * 0.95) {
						isDegraded = true;
					}
					let canvas = document.createElement('canvas');
					canvas.width = viewport.width;
					canvas.height = viewport.height;
					let ctx = canvas.getContext('2d', ctxOpts);
					if (!ctx) {
						canvas.width = 0;
						canvas.height = 0;
						throw new Error(`Không thể khởi tạo Canvas 2D context cho trang ${p}.`);
					}

					await page.render({ canvasContext: ctx, viewport }).promise;

					if (cropTopPx > 0 || cropBottomPx > 0) {
						const cropped = cropCanvas(canvas, cropTopPx, cropBottomPx);
						canvas.width = 0;
						canvas.height = 0;
						canvas = cropped;
						ctx = canvas.getContext('2d', ctxOpts);
						if (!ctx) {
							canvas.width = 0;
							canvas.height = 0;
							throw new Error(`Không thể khởi tạo Canvas 2D context sau khi cắt trang ${p}.`);
						}
					}

					if (!keepColor && ctx) {
						applyGrayscale(ctx, canvas.width, canvas.height, GRAY_CONTRAST);
					}

					// Maintain quality >= 0.85 even during retry (only scale is reduced)
					blob = await new Promise<Blob | null>((resolve) =>
						canvas.toBlob(resolve, 'image/jpeg', JPEG_QUALITY)
					);

					// Release canvas backing store memory immediately
					canvas.width = 0;
					canvas.height = 0;

					if (blob) {
						break; // Successful render!
					}
					throw new Error(
						`Không thể xuất hình ảnh cho trang ${p} (trình duyệt không đủ bộ nhớ hoặc canvas vượt giới hạn).`
					);
				} catch (renderErr) {
					retryCount++;
					if (retryCount <= 1) {
						isDegraded = true;
						Logger.warn(
							'[pdf-splitter]',
							`Trang ${p} render lỗi ở scale ${renderScale}, tự động thử lại ở scale thấp hơn...`,
							renderErr
						);
						renderScale = Math.min(1.5, targetScale * 0.7);
					} else {
						Logger.error(
							'[pdf-splitter]',
							`Trang ${p} thất bại hoàn toàn sau khi thử lại:`,
							renderErr
						);
						if (totalPagesToProcess === 1) {
							page.cleanup();
							throw renderErr;
						}
					}
				}
			}

			page.cleanup();

			if (blob) {
				if (isDegraded && !degradedPages.includes(p)) {
					degradedPages.push(p);
				}
				const padLength = Math.max(4, String(totalDocPages).length);
				const paddedPageNum = String(p).padStart(padLength, '0');
				currentZip.file(`page${paddedPageNum}.jpg`, blob, { compression: 'STORE' });
				currentPartBytes += blob.size;
				currentPartPagesCount++;
				completed++;
			} else {
				failedPages.push(p);
			}

			const isLastPage = p === endPage;
			const reachedByteCeiling = currentPartBytes >= maxPartBytes && currentPartPagesCount > 0;
			const reachedPageCeiling = currentPartPagesCount >= maxPagesPerPart;
			const isEndOfPart =
				(reachedByteCeiling || reachedPageCeiling || isLastPage) && currentPartPagesCount > 0;

			if (isEndOfPart) {
				const partMsg = `Đang đóng gói Phần ${currentPartIndex} (trang ${partStartPage}–${p}, ${(currentPartBytes / (1024 * 1024)).toFixed(1)}MB)...`;
				updateProgress(partMsg);

				const partBlob = await currentZip.generateAsync({ type: 'blob', compression: 'STORE' });
				const cleanBase = (pdfSelectedFile.name || 'pages').replace(/\.pdf$/i, '');
				const filename = `${cleanBase}-part${currentPartIndex}-pages${partStartPage}-${p}.zip`;
				const partSize = partBlob.size;

				let savedToDisk = false;
				if (opts.dirHandle) {
					try {
						const fileHandle = await opts.dirHandle.getFileHandle(filename, { create: true });
						const writable = await fileHandle.createWritable();
						await writable.write(partBlob);
						await writable.close();
						savedToDisk = true;
						Logger.info(
							'[pdf-splitter]',
							`Đã lưu phần ${currentPartIndex} trực tiếp vào đĩa: ${filename}`
						);
					} catch (diskErr) {
						Logger.error(
							'[pdf-splitter]',
							`Lỗi ghi trực tiếp vào thư mục đĩa ${filename}:`,
							diskErr
						);
					}
				}

				zipParts.push({
					partIndex: currentPartIndex,
					totalParts: 0, // will be updated at the end
					startPage: partStartPage,
					endPage: p,
					blob: savedToDisk ? undefined : partBlob, // FREE BLOB FROM RAM IF SAVED TO DISK
					filename,
					sizeBytes: partSize,
					savedToDisk
				});

				Logger.info(
					'[pdf-splitter]',
					`Part ${currentPartIndex} generated: ${filename} (${partSize} bytes, savedToDisk=${savedToDisk})`
				);

				if (p < endPage) {
					currentPartIndex++;
					partStartPage = p + 1;
					currentZip = new JSZip(); // GC can now reclaim all previous images!
					currentPartBytes = 0;
					currentPartPagesCount = 0;
				}
			} else {
				updateProgress();
			}

			// Yield to main event loop
			await new Promise((resolve) => setTimeout(resolve, 0));
		}

		if (completed === 0 && failedPages.length > 0) {
			throw new Error(
				`Không thể xuất bất kỳ hình ảnh nào (tất cả ${failedPages.length} trang đều lỗi bộ nhớ canvas).`
			);
		}

		// Update totalParts for all parts
		const totalParts = zipParts.length;
		for (const part of zipParts) {
			part.totalParts = totalParts;
			if (totalParts === 1 && !opts.dirHandle) {
				const cleanBase = (pdfSelectedFile.name || 'pages').replace(/\.pdf$/i, '');
				part.filename = `${cleanBase}-pages.zip`;
			}
		}

		if (opts.onProgress) {
			let doneLabel =
				totalParts > 1
					? `Hoàn tất — ${completed} trang đã sẵn sàng (${totalParts} phần ZIP).`
					: `Hoàn tất — ${completed} trang đã sẵn sàng.`;
			if (opts.dirHandle) {
				doneLabel += ` (Đã lưu trực tiếp vào thư mục "${opts.dirHandle.name}")`;
			}
			if (failedPages.length > 0) {
				doneLabel += ` · Cảnh báo: ${failedPages.length} trang bị lỗi: ${failedPages.join(', ')}`;
			}
			if (degradedPages.length > 0) {
				doneLabel += ` · Chú ý: ${degradedPages.length} trang bị giảm độ phân giải: ${degradedPages.join(', ')}`;
			}

			opts.onProgress({
				progressPercent: 100,
				progressLabel: doneLabel,
				completed,
				numPages: totalPagesToProcess
			});
		}

		// If saved directly to disk, parts do not hold blobs in RAM, so zipBlob is undefined (avoid returning 0-byte empty Blob)
		const zipBlob = zipParts[0]?.blob;
		return {
			zipBlob,
			zipParts,
			numPages: totalDocPages,
			processedPages: completed,
			failedPages,
			degradedPages,
			savedDirectoryName: opts.dirHandle?.name
		};
	} finally {
		cleanup();
	}
}
