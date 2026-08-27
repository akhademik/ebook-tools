// src/lib/pdf-splitter/pdf-splitter.worker.ts
/// <reference lib="webworker" />
import { applyGrayscale, cropCanvas } from './pdf-splitter';

const PDF_SCALE = 2.0;
const JPEG_QUALITY = 0.85;
const GRAY_CONTRAST = 1.08;

export interface PdfRenderWorkerRequest {
	id: string;
	pdfBytes: ArrayBuffer;
	startPage: number;
	endPage: number;
	step: number;
	keepColor: boolean;
	cropTopPx: number;
	cropBottomPx: number;
	pdfJsCdnUrl?: string;
}

export type PdfRenderWorkerResponse =
	| { id: string; type: 'page_done'; pageNum: number; blob: Blob }
	| { id: string; type: 'success'; count: number }
	| { id: string; type: 'error'; error: string };

declare const importScripts: (...urls: string[]) => void;

interface PdfJsGlobal {
	getDocument: (src: { data: ArrayBuffer }) => {
		promise: Promise<{
			numPages: number;
			getPage: (pageNumber: number) => Promise<{
				getViewport: (opts: { scale: number }) => { width: number; height: number };
				render: (opts: {
					canvasContext: OffscreenCanvasRenderingContext2D;
					viewport: { width: number; height: number };
				}) => { promise: Promise<void> };
				cleanup: () => void;
			}>;
			destroy: () => void;
		}>;
	};
}

let loadedPdfJs: PdfJsGlobal | null = null;

function ensurePdfJsLoaded(
	cdnUrl = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js'
): PdfJsGlobal {
	if (loadedPdfJs) return loadedPdfJs;
	if (typeof (self as unknown as { pdfjsLib?: PdfJsGlobal }).pdfjsLib !== 'undefined') {
		loadedPdfJs = (self as unknown as { pdfjsLib: PdfJsGlobal }).pdfjsLib;
		return loadedPdfJs;
	}
	if (typeof importScripts === 'function') {
		importScripts(cdnUrl);
		if (typeof (self as unknown as { pdfjsLib?: PdfJsGlobal }).pdfjsLib !== 'undefined') {
			loadedPdfJs = (self as unknown as { pdfjsLib: PdfJsGlobal }).pdfjsLib;
			return loadedPdfJs;
		}
	}
	throw new Error('PDF.js library is not available in worker context.');
}

if (typeof self !== 'undefined') {
	self.onmessage = async (e: MessageEvent<PdfRenderWorkerRequest>) => {
		const {
			id,
			pdfBytes,
			startPage,
			endPage,
			step,
			keepColor,
			cropTopPx,
			cropBottomPx,
			pdfJsCdnUrl
		} = e.data;

		try {
			const pdfjs = ensurePdfJsLoaded(pdfJsCdnUrl);
			const doc = await pdfjs.getDocument({ data: pdfBytes }).promise;
			let count = 0;

			for (let p = startPage; p <= endPage; p += step) {
				const page = await doc.getPage(p);
				const viewport = page.getViewport({ scale: PDF_SCALE });
				let canvas = new OffscreenCanvas(viewport.width, viewport.height);
				const ctxOpts: CanvasRenderingContext2DSettings = keepColor
					? { alpha: false }
					: { alpha: false, willReadFrequently: true };
				const ctx = canvas.getContext('2d', ctxOpts) as OffscreenCanvasRenderingContext2D | null;

				if (ctx) {
					await page.render({ canvasContext: ctx, viewport }).promise;

					if (cropTopPx > 0 || cropBottomPx > 0) {
						canvas = cropCanvas(canvas, cropTopPx, cropBottomPx);
					}

					if (!keepColor) {
						const currentCtx = canvas.getContext(
							'2d',
							ctxOpts
						) as OffscreenCanvasRenderingContext2D | null;
						if (currentCtx) {
							applyGrayscale(currentCtx, canvas.width, canvas.height, GRAY_CONTRAST);
						}
					}
				}

				const blob = await canvas.convertToBlob({ type: 'image/jpeg', quality: JPEG_QUALITY });
				page.cleanup();
				count++;

				const pageDoneMsg: PdfRenderWorkerResponse = {
					id,
					type: 'page_done',
					pageNum: p,
					blob
				};
				self.postMessage(pageDoneMsg);
			}

			doc.destroy();
			const successMsg: PdfRenderWorkerResponse = { id, type: 'success', count };
			self.postMessage(successMsg);
		} catch (err: unknown) {
			const errorMsg = err instanceof Error ? err.message : String(err);
			const errorResponse: PdfRenderWorkerResponse = {
				id,
				type: 'error',
				error: errorMsg
			};
			self.postMessage(errorResponse);
		}
	};
}
