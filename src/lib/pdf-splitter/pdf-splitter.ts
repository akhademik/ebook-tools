// src/lib/pdf-splitter/pdf-splitter.ts
import JSZip from 'jszip';
import { Logger } from '$lib/utils';
import type { PdfPreviewPage, PdfProgressInfo, ProcessPdfResult } from '$lib/types';

export type { PdfPreviewPage, PdfProgressInfo, ProcessPdfResult };

const PDF_SCALE = 2.0;
const JPEG_QUALITY = 0.85;
const GRAY_CONTRAST = 1.08;

function applyGrayscale(
	ctx: CanvasRenderingContext2D,
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

function cropCanvas(
	sourceCanvas: HTMLCanvasElement,
	topPx: number,
	bottomPx: number
): HTMLCanvasElement {
	const w = sourceCanvas.width;
	const h = sourceCanvas.height;
	const safeTop = Math.max(0, Math.min(topPx, h - 1));
	const safeBottom = Math.max(0, Math.min(bottomPx, h - 1 - safeTop));
	const newH = Math.max(1, h - safeTop - safeBottom);
	Logger.debug(
		'[pdf-splitter]',
		`cropCanvas called, source size: ${w}x${h}, cropping top: ${topPx}, bottom: ${bottomPx}, new height: ${newH}`
	);
	const out = document.createElement('canvas');
	out.width = w;
	out.height = newH;
	const octx = out.getContext('2d', { alpha: false });
	if (octx) {
		octx.drawImage(sourceCanvas, 0, safeTop, w, newH, 0, 0, w, newH);
	}
	return out;
}

export function formatEta(seconds: number): string {
	if (!isFinite(seconds) || seconds < 0) return '--:--';
	const m = Math.floor(seconds / 60);
	const s = Math.round(seconds % 60);
	return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
}

function pickConcurrency(fileSizeBytes: number, numPages: number): number {
	let c =
		typeof navigator !== 'undefined' && navigator.hardwareConcurrency
			? navigator.hardwareConcurrency
			: 4;
	c = Math.min(c, 8);
	if (fileSizeBytes > 300 * 1024 * 1024) c = Math.min(c, 3);
	else if (fileSizeBytes > 150 * 1024 * 1024) c = Math.min(c, 4);
	return Math.max(1, Math.min(c, numPages));
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

	const arrayBuffer = await pdfSelectedFile.arrayBuffer();
	const doc = await globalPdfjs.getDocument({ data: arrayBuffer.slice(0) }).promise;
	const count = Math.min(selectedPreviewCount, doc.numPages);
	Logger.debug(
		'[pdf-splitter]',
		`loadPdfPreview: loading ${count} preview pages (total pages in doc: ${doc.numPages})`
	);
	const pages: PdfPreviewPage[] = [];

	for (let p = 1; p <= count; p++) {
		Logger.debug('[pdf-splitter]', `loadPdfPreview: rendering page ${p}`);
		const page = await doc.getPage(p);
		const viewport = page.getViewport({ scale: PDF_SCALE });
		const canvas = document.createElement('canvas');
		canvas.width = viewport.width;
		canvas.height = viewport.height;
		const ctx = canvas.getContext('2d', { alpha: false, willReadFrequently: true });
		if (ctx) {
			await page.render({ canvasContext: ctx, viewport }).promise;
			if (!keepColor) {
				applyGrayscale(ctx, canvas.width, canvas.height, GRAY_CONTRAST);
			}
		}
		pages.push({
			pageNum: p,
			dataUrl: canvas.toDataURL('image/jpeg', 0.8),
			width: canvas.width,
			height: canvas.height
		});
		page.cleanup();
	}
	doc.destroy();
	Logger.debug('[pdf-splitter]', `loadPdfPreview finished, returns preview pages: ${pages.length}`);
	return pages;
}

export async function processPdfToJpg(
	pdfSelectedFile: File | null,
	keepColor: boolean,
	cropTopPx: number,
	cropBottomPx: number,
	onProgress?: (info: PdfProgressInfo) => void
): Promise<ProcessPdfResult> {
	const globalPdfjs = typeof window !== 'undefined' ? window.pdfjsLib : null;
	if (!pdfSelectedFile || !globalPdfjs) {
		Logger.error('[pdf-splitter]', 'processPdfToJpg error: no file or pdfjsLib missing');
		throw new Error('Chưa chọn tệp PDF hoặc thư viện PDF.js chưa tải.');
	}
	Logger.debug(
		'[pdf-splitter]',
		`processPdfToJpg called, size: ${pdfSelectedFile.size}, keepColor: ${keepColor}, cropTop: ${cropTopPx}, cropBottom: ${cropBottomPx}`
	);

	const arrayBuffer = await pdfSelectedFile.arrayBuffer();
	const probeDoc = await globalPdfjs.getDocument({ data: arrayBuffer.slice(0) }).promise;
	const numPages = probeDoc.numPages;
	probeDoc.destroy();
	Logger.debug('[pdf-splitter]', `processPdfToJpg: total pages to process: ${numPages}`);

	const zip = new JSZip();
	const concurrency = pickConcurrency(pdfSelectedFile.size, numPages);
	let completed = 0;
	const startTime = performance.now();
	Logger.debug('[pdf-splitter]', `processPdfToJpg: starting ${concurrency} parallel workers`);

	function updateProgress(): void {
		const elapsedSec = (performance.now() - startTime) / 1000;
		const rate = completed / Math.max(elapsedSec, 0.001);
		const remaining = numPages - completed;
		const eta = rate > 0 ? remaining / rate : Infinity;
		const progressPercent = Math.round((completed / numPages) * 100);
		const progressLabel =
			`Đang xử lý ${completed} / ${numPages} trang · ` +
			(concurrency > 1 ? `${concurrency} luồng song song · ` : '') +
			`${rate.toFixed(1)} trang/giây · còn lại ~${formatEta(eta)}`;

		if (onProgress) {
			onProgress({ progressPercent, progressLabel, completed, numPages });
		}
	}

	updateProgress();

	async function runWorker(workerIndex: number): Promise<void> {
		Logger.debug('[pdf-splitter]', `Worker ${workerIndex} started`);
		const doc = await globalPdfjs.getDocument({ data: arrayBuffer.slice(0) }).promise;
		const ctxOpts: CanvasRenderingContext2DSettings = keepColor
			? { alpha: false }
			: { alpha: false, willReadFrequently: true };

		for (let p = workerIndex + 1; p <= numPages; p += concurrency) {
			Logger.debug('[pdf-splitter]', `Worker ${workerIndex} processing page ${p}`);
			const page = await doc.getPage(p);
			const viewport = page.getViewport({ scale: PDF_SCALE });
			let canvas = document.createElement('canvas');
			canvas.width = viewport.width;
			canvas.height = viewport.height;
			let ctx = canvas.getContext('2d', ctxOpts);
			if (ctx) {
				await page.render({ canvasContext: ctx, viewport }).promise;

				if (cropTopPx > 0 || cropBottomPx > 0) {
					canvas = cropCanvas(canvas, cropTopPx, cropBottomPx);
					ctx = canvas.getContext('2d', ctxOpts);
				}

				if (!keepColor && ctx) {
					applyGrayscale(ctx, canvas.width, canvas.height, GRAY_CONTRAST);
				}
			}

			const blob = await new Promise<Blob | null>((resolve) =>
				canvas.toBlob(resolve, 'image/jpeg', JPEG_QUALITY)
			);
			if (blob) {
				zip.file('page' + p + '.jpg', blob, { compression: 'STORE' });
			}
			page.cleanup();
			completed++;
			updateProgress();

			// Yield to main event loop to ensure smooth 60fps UI updates and prevent freeze
			await new Promise((resolve) => setTimeout(resolve, 0));
		}
		doc.destroy();
		Logger.debug('[pdf-splitter]', `Worker ${workerIndex} finished`);
	}

	const workers: Promise<void>[] = [];
	for (let w = 0; w < concurrency; w++) {
		workers.push(runWorker(w));
	}
	await Promise.all(workers);
	Logger.debug('[pdf-splitter]', 'All workers completed. Generating ZIP...');

	if (onProgress) {
		onProgress({
			progressPercent: 95,
			progressLabel: 'Đang đóng gói thành tệp .ZIP...',
			completed,
			numPages
		});
	}

	const zipBlob = await zip.generateAsync({ type: 'blob', compression: 'STORE' });
	Logger.info('[pdf-splitter]', `ZIP generated successfully, size: ${zipBlob.size}`);

	if (onProgress) {
		onProgress({
			progressPercent: 100,
			progressLabel: `Hoàn tất — ${numPages} trang đã sẵn sàng.`,
			completed,
			numPages
		});
	}

	return { zipBlob, numPages };
}
