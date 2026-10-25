// src/lib/utils/pdf.ts
import { Logger } from './logger';
import type { PdfJsPage, PdfJsViewport } from '$lib/types';

export const MAX_CANVAS_DIMENSION = 4096;
export const MAX_CANVAS_PIXELS = 16 * 1024 * 1024; // 16 Megapixels

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
 * Safely compute viewport dimensions clamped to maximum canvas limits to prevent iOS/browser OOM.
 */
export function getClampedViewport(page: PdfJsPage, targetScale = 2.0): PdfJsViewport {
	const baseViewport = page.getViewport({ scale: 1.0 });
	let scale = targetScale;

	// Clamp max dimension
	const maxDim = Math.max(baseViewport.width * scale, baseViewport.height * scale);
	if (maxDim > MAX_CANVAS_DIMENSION) {
		scale = (MAX_CANVAS_DIMENSION / maxDim) * scale;
	}

	// Clamp total pixels to avoid canvas allocation failure / OOM
	const totalPixels = baseViewport.width * scale * (baseViewport.height * scale);
	if (totalPixels > MAX_CANVAS_PIXELS) {
		scale = scale * Math.sqrt(MAX_CANVAS_PIXELS / totalPixels);
	}

	return page.getViewport({ scale });
}

/**
 * Render a single page of PDF data (File, Blob, ArrayBuffer, or Uint8Array) to an image Blob.
 * Uses zero-copy object URL for Blobs/Files to avoid copying data into RAM.
 */
export async function renderPdfPageToBlob(
	pdfInput: File | Blob | ArrayBuffer | Uint8Array,
	pageNum = 1,
	scale = 2.0,
	quality = 0.9
): Promise<Blob | null> {
	const globalPdfjs = typeof window !== 'undefined' ? window.pdfjsLib : null;
	if (!globalPdfjs) {
		Logger.error('[pdf-utils]', 'pdfjsLib is missing');
		throw new Error('Thư viện PDF.js chưa sẵn sàng.');
	}

	let docSource: { url?: string; data?: ArrayBuffer | Uint8Array };
	let url: string | null = null;

	if (typeof Blob !== 'undefined' && pdfInput instanceof Blob) {
		url = URL.createObjectURL(pdfInput);
		docSource = { url };
	} else if (pdfInput instanceof ArrayBuffer || pdfInput instanceof Uint8Array) {
		docSource = { data: pdfInput };
	} else {
		throw new Error('Định dạng dữ liệu đầu vào PDF không hợp lệ.');
	}

	let doc;
	try {
		doc = await globalPdfjs.getDocument(docSource).promise;
	} catch (loadErr) {
		if (url) {
			URL.revokeObjectURL(url);
		}
		throw loadErr;
	}

	try {
		const targetPage = Math.min(Math.max(1, pageNum), doc.numPages);
		const page = await doc.getPage(targetPage);
		try {
			const viewport = getClampedViewport(page, scale);
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
		try {
			doc.destroy();
		} finally {
			if (url) {
				URL.revokeObjectURL(url);
			}
		}
	}
}
