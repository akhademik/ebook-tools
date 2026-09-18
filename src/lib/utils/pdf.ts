// src/lib/utils/pdf.ts
import { Logger } from './logger';

/**
 * Configure PDF.js worker URL if PDF.js library is loaded globally via CDN.
 */
export function initPdfWorker(): void {
	if (typeof window !== 'undefined' && window.pdfjsLib?.GlobalWorkerOptions) {
		window.pdfjsLib.GlobalWorkerOptions.workerSrc =
			'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
		Logger.debug('[PDFWorker]', 'PDF.js worker configured');
	}
}

// Auto-run if loaded in browser environment
if (typeof window !== 'undefined') {
	initPdfWorker();
}

/**
 * Render a single page of PDF data (ArrayBuffer or Uint8Array) to an image Blob.
 */
export async function renderPdfPageToBlob(
	pdfData: ArrayBuffer | Uint8Array,
	pageNum = 1,
	scale = 2.0,
	quality = 0.9
): Promise<Blob | null> {
	const globalPdfjs = typeof window !== 'undefined' ? window.pdfjsLib : null;
	if (!globalPdfjs) {
		Logger.error('[pdf-utils]', 'pdfjsLib is missing');
		throw new Error('Thư viện PDF.js chưa sẵn sàng.');
	}

	const doc = await globalPdfjs.getDocument({ data: pdfData }).promise;
	try {
		const targetPage = Math.min(Math.max(1, pageNum), doc.numPages);
		const page = await doc.getPage(targetPage);
		try {
			const viewport = page.getViewport({ scale });
			const canvas = document.createElement('canvas');
			canvas.width = viewport.width;
			canvas.height = viewport.height;
			const ctx = canvas.getContext('2d');
			if (!ctx) {
				throw new Error('Không thể khởi tạo Canvas 2D context.');
			}
			await page.render({ canvasContext: ctx, viewport }).promise;
			return await new Promise<Blob | null>((resolve) =>
				canvas.toBlob(resolve, 'image/jpeg', quality)
			);
		} finally {
			page.cleanup();
		}
	} finally {
		doc.destroy();
	}
}
