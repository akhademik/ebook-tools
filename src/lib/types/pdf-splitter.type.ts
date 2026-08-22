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
