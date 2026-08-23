// src/lib/types/pdf-splitter.type.ts

export interface PdfPreviewPage {
	pageNum: number;
	dataUrl: string;
	width: number;
	height: number;
}

export interface PdfProgressInfo {
	progressPercent: number;
	progressLabel: string;
	completed: number;
	numPages: number;
}

export interface ProcessPdfResult {
	zipBlob: Blob;
	numPages: number;
}

export interface PdfJsViewport {
	width: number;
	height: number;
}

export interface PdfJsPage {
	getViewport: (options: { scale: number }) => PdfJsViewport;
	render: (options: { canvasContext: CanvasRenderingContext2D; viewport: PdfJsViewport }) => { promise: Promise<void> };
	cleanup: () => void;
}

export interface PdfJsDocument {
	numPages: number;
	getPage: (pageNumber: number) => Promise<PdfJsPage>;
	destroy: () => void;
}

export interface PdfJsLib {
	getDocument: (src: { data: ArrayBuffer }) => { promise: Promise<PdfJsDocument> };
}
