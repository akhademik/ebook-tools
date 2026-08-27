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
