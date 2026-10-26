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

export interface PdfZipPart {
	partIndex: number;
	totalParts: number;
	startPage: number;
	endPage: number;
	blob?: Blob;
	filename: string;
	sizeBytes: number;
	savedToDisk?: boolean;
}

export interface ProcessPdfResult {
	zipBlob?: Blob;
	zipParts: PdfZipPart[];
	numPages: number;
	processedPages: number;
	failedPages: number[];
	degradedPages: number[];
	savedDirectoryName?: string;
}

export interface ProcessPdfOptions {
	keepColor?: boolean;
	cropTopPx?: number;
	cropBottomPx?: number;
	startPage?: number;
	endPage?: number;
	maxPartBytes?: number;
	maxPagesPerPart?: number;
	targetDpi?: number;
	targetScale?: number;
	dirHandle?: FileSystemDirectoryHandle | null;
	onProgress?: (info: PdfProgressInfo) => void;
	signal?: AbortSignal;
}

export interface PdfJsViewport {
	width: number;
	height: number;
	scale?: number;
}

export interface PdfJsPage {
	getViewport: (options: { scale: number }) => PdfJsViewport;
	render: (options: { canvasContext: CanvasRenderingContext2D; viewport: PdfJsViewport }) => {
		promise: Promise<void>;
	};
	cleanup: () => void;
}

export interface PdfJsDocument {
	numPages: number;
	getPage: (pageNumber: number) => Promise<PdfJsPage>;
	destroy: () => void;
}

export interface PdfJsLib {
	GlobalWorkerOptions?: {
		workerSrc?: string;
	};
	getDocument: (src: { data?: ArrayBuffer | Uint8Array; url?: string }) => {
		promise: Promise<PdfJsDocument>;
	};
}
