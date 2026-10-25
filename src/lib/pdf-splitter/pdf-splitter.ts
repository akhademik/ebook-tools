// src/lib/pdf-splitter/pdf-splitter.ts
import JSZip from 'jszip';
import {
	Logger,
	initPdfWorker,
	getClampedViewport,
	MAX_CANVAS_DIMENSION,
	MAX_CANVAS_PIXELS
} from '$lib/utils';
import type {
	PdfPreviewPage,
	PdfProgressInfo,
	ProcessPdfResult,
	PdfZipPart,
	PdfJsLib,
	PdfJsDocument
} from '$lib/types';

export type { PdfPreviewPage, PdfProgressInfo, ProcessPdfResult, PdfZipPart };

const PDF_SCALE = 2.0;
const JPEG_QUALITY = 0.85;
const GRAY_CONTRAST = 1.08;

export const MAX_PAGES_PER_ZIP_PART = 200;
export { getClampedViewport, MAX_CANVAS_DIMENSION, MAX_CANVAS_PIXELS };

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
	keepColor: boolean,
	cropTopPx: number,
	cropBottomPx: number,
	onProgress?: (info: PdfProgressInfo) => void,
	signal?: AbortSignal,
	maxPagesPerPart = MAX_PAGES_PER_ZIP_PART
): Promise<ProcessPdfResult> {
	if (signal?.aborted) {
		throw new DOMException('Tác vụ xử lý PDF đã bị hủy', 'AbortError');
	}
	const globalPdfjs = typeof window !== 'undefined' ? window.pdfjsLib : null;
	if (!pdfSelectedFile || !globalPdfjs) {
		Logger.error('[pdf-splitter]', 'processPdfToJpg error: no file or pdfjsLib missing');
		throw new Error('Chưa chọn tệp PDF hoặc thư viện PDF.js chưa tải.');
	}
	Logger.debug(
		'[pdf-splitter]',
		`processPdfToJpg called, size: ${pdfSelectedFile.size}, keepColor: ${keepColor}, cropTop: ${cropTopPx}, cropBottom: ${cropBottomPx}, maxPagesPerPart: ${maxPagesPerPart}`
	);

	// Load document ONCE with zero-copy stream or single-buffer reuse (eliminates O(N * fileSize) copies)
	const { doc, cleanup } = await openPdfDocument(pdfSelectedFile, globalPdfjs);

	try {
		const numPages = doc.numPages;
		const totalParts = Math.max(1, Math.ceil(numPages / maxPagesPerPart));
		Logger.debug(
			'[pdf-splitter]',
			`processPdfToJpg: total pages: ${numPages}, total parts: ${totalParts}`
		);

		const zipParts: PdfZipPart[] = [];
		let currentZip = new JSZip();
		let partStartPage = 1;
		let currentPartIndex = 1;
		let completed = 0;
		const startTime = performance.now();

		function updateProgress(customLabel?: string): void {
			const elapsedSec = (performance.now() - startTime) / 1000;
			const rate = completed / Math.max(elapsedSec, 0.001);
			const remaining = numPages - completed;
			const eta = rate > 0 ? remaining / rate : Infinity;
			const progressPercent = Math.min(99, Math.round((completed / numPages) * 100));
			const progressLabel =
				customLabel ??
				`Đang xử lý ${completed} / ${numPages} trang · ` +
					`${rate.toFixed(1)} trang/giây · còn lại ~${formatEta(eta)}`;

			if (onProgress) {
				onProgress({ progressPercent, progressLabel, completed, numPages });
			}
		}

		updateProgress();

		const ctxOpts: CanvasRenderingContext2DSettings = keepColor
			? { alpha: false }
			: { alpha: false, willReadFrequently: true };

		// Sequential rendering on a single document: ensures minimum peak RAM and stable 60fps UI
		for (let p = 1; p <= numPages; p++) {
			if (signal?.aborted) {
				throw new DOMException('Tác vụ xử lý PDF đã bị hủy', 'AbortError');
			}

			Logger.debug('[pdf-splitter]', `Processing page ${p} of ${numPages}`);
			const page = await doc.getPage(p);
			const viewport = getClampedViewport(page, PDF_SCALE);
			let canvas = document.createElement('canvas');
			canvas.width = viewport.width;
			canvas.height = viewport.height;
			let ctx = canvas.getContext('2d', ctxOpts);
			if (!ctx) {
				canvas.width = 0;
				canvas.height = 0;
				page.cleanup();
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
					page.cleanup();
					throw new Error(`Không thể khởi tạo Canvas 2D context sau khi cắt trang ${p}.`);
				}
			}

			if (!keepColor && ctx) {
				applyGrayscale(ctx, canvas.width, canvas.height, GRAY_CONTRAST);
			}

			const blob = await new Promise<Blob | null>((resolve) =>
				canvas.toBlob(resolve, 'image/jpeg', JPEG_QUALITY)
			);

			// Release canvas backing store memory immediately
			canvas.width = 0;
			canvas.height = 0;

			if (!blob) {
				page.cleanup();
				throw new Error(
					`Không thể xuất hình ảnh cho trang ${p} (trình duyệt không đủ bộ nhớ hoặc canvas vượt giới hạn).`
				);
			}

			currentZip.file('page' + p + '.jpg', blob, { compression: 'STORE' });
			page.cleanup();
			completed++;

			const isEndOfPart = p % maxPagesPerPart === 0 || p === numPages;
			if (isEndOfPart) {
				const partMsg =
					totalParts > 1
						? `Đang đóng gói Phần ${currentPartIndex}/${totalParts} (trang ${partStartPage}–${p})...`
						: 'Đang đóng gói thành tệp .ZIP...';
				updateProgress(partMsg);

				const partBlob = await currentZip.generateAsync({ type: 'blob', compression: 'STORE' });
				const cleanBase = (pdfSelectedFile.name || 'pages').replace(/\.pdf$/i, '');
				const filename =
					totalParts > 1
						? `${cleanBase}-part${currentPartIndex}-pages${partStartPage}-${p}.zip`
						: `${cleanBase}-pages.zip`;

				zipParts.push({
					partIndex: currentPartIndex,
					totalParts,
					startPage: partStartPage,
					endPage: p,
					blob: partBlob,
					filename
				});

				Logger.info(
					'[pdf-splitter]',
					`Part ${currentPartIndex}/${totalParts} generated: ${filename} (${partBlob.size} bytes)`
				);

				if (p < numPages) {
					currentPartIndex++;
					partStartPage = p + 1;
					currentZip = new JSZip(); // GC can now reclaim all previous images!
				}
			} else {
				updateProgress();
			}

			// Yield to main event loop to ensure smooth 60fps UI updates and prevent freeze
			await new Promise((resolve) => setTimeout(resolve, 0));
		}

		if (onProgress) {
			const doneLabel =
				totalParts > 1
					? `Hoàn tất — ${numPages} trang đã sẵn sàng (${totalParts} phần ZIP).`
					: `Hoàn tất — ${numPages} trang đã sẵn sàng.`;
			onProgress({
				progressPercent: 100,
				progressLabel: doneLabel,
				completed,
				numPages
			});
		}

		const zipBlob = zipParts[0]?.blob ?? new Blob();
		return { zipBlob, zipParts, numPages };
	} finally {
		cleanup();
	}
}
