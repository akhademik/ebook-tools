// src/lib/utils/pdf.ts
import { Logger } from './logger';

/**
 * Configure PDF.js worker URL (100% offline self-hosted with fallback).
 */
export function initPdfWorker(): void {
	if (typeof window !== 'undefined' && window.pdfjsLib?.GlobalWorkerOptions) {
		const localWorker = '/vendor/pdfjs/pdf.worker.min.js';
		window.pdfjsLib.GlobalWorkerOptions.workerSrc = localWorker;
		Logger.debug('[PDFWorker]', 'PDF.js worker configured locally:', localWorker);
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
			try {
				await page.render({ canvasContext: ctx, viewport }).promise;
				const blob = await new Promise<Blob | null>((resolve) =>
					canvas.toBlob(resolve, 'image/jpeg', quality)
				);
				if (!blob) {
					throw new Error('Không thể xuất Blob từ Canvas cho trang PDF.');
				}
				return blob;
			} finally {
				canvas.width = 0;
				canvas.height = 0;
			}
		} finally {
			page.cleanup();
		}
	} finally {
		doc.destroy();
	}
}
