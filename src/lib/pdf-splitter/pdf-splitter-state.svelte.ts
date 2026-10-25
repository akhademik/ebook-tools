import { slugify, ensureZipExt, triggerDownload, Logger } from '$lib/utils';
import { MAX_PDF_FILE_SIZE } from '$lib/constants';
import {
	loadPdfPreview,
	processPdfToJpg,
	isMobileOrLowMemoryDevice,
	DEFAULT_DESKTOP_PART_BYTES,
	DEFAULT_MOBILE_PART_BYTES,
	DEFAULT_MAX_PAGES_PER_PART
} from './pdf-splitter';
import type { PdfPreviewPage, PdfZipPart } from '$lib/types';

export class PdfSplitterState {
	pdfSelectedFile = $state<File | null>(null);
	pdfZipBlob = $state<Blob | null>(null);
	pdfZipParts = $state<PdfZipPart[]>([]);
	bookName = $state<string>('');
	keepColor = $state<boolean>(false);

	totalDocPages = $state<number>(0);

	maxPartBytes = $state<number>(DEFAULT_DESKTOP_PART_BYTES);
	maxPagesPerPart = $state<number>(DEFAULT_MAX_PAGES_PER_PART);

	dirHandle = $state<FileSystemDirectoryHandle | null>(null);
	dirName = $state<string>('');
	savedDirectoryName = $state<string>('');

	selectedPreviewCount = $state<number>(10);
	previewPages = $state<PdfPreviewPage[]>([]);
	currentPreviewIndex = $state<number>(0);
	cropTopPx = $state<number>(0);
	cropBottomPx = $state<number>(0);

	status = $state<string>('');
	isError = $state<boolean>(false);
	failedPages = $state<number[]>([]);
	degradedPages = $state<number[]>([]);
	selectedDpi = $state<number>(200);

	loadingPreview = $state<boolean>(false);
	processing = $state<boolean>(false);

	progressPercent = $state<number>(0);
	progressLabel = $state<string>('');

	zipNamePreview = $derived(ensureZipExt(this.bookName.trim() || 'ten-sach'));
	cropSummary = $derived(
		this.cropTopPx > 0 || this.cropBottomPx > 0
			? `Sẽ cắt ${this.cropTopPx}px trên · ${this.cropBottomPx}px dưới ở mỗi trang khi xuất.`
			: ''
	);
	isLargeFile = $derived(!!this.pdfSelectedFile && this.pdfSelectedFile.size > 150 * 1024 * 1024);
	isMobile = $derived(isMobileOrLowMemoryDevice());
	supportsFSA = $derived(typeof window !== 'undefined' && 'showDirectoryPicker' in window);
	hasMultipleParts = $derived(this.pdfZipParts.length > 1);
	deviceMemoryGb = $derived<number | null>(
		typeof navigator !== 'undefined' && 'deviceMemory' in navigator
			? ((navigator as { deviceMemory?: number }).deviceMemory ?? null)
			: null
	);

	handleFile(file: File | null): void {
		if (!file) return;
		if (file.type !== 'application/pdf' && !/\.pdf$/i.test(file.name)) {
			this.status = 'Vui lòng chọn một tệp PDF hợp lệ.';
			this.isError = true;
			return;
		}
		if (file.size > MAX_PDF_FILE_SIZE) {
			this.status = 'Dung lượng tệp PDF vượt quá giới hạn cho phép (tối đa 1GB).';
			this.isError = true;
			return;
		}
		this.status = '';
		this.isError = false;
		this.pdfSelectedFile = file;
		this.bookName = slugify(file.name);
		this.pdfZipBlob = null;
		this.pdfZipParts = [];
		this.failedPages = [];
		this.degradedPages = [];
		this.savedDirectoryName = '';

		this.previewPages = [];
		this.currentPreviewIndex = 0;
		this.cropTopPx = 0;
		this.cropBottomPx = 0;

		// Set adaptive byte threshold
		this.maxPartBytes = this.isMobile ? DEFAULT_MOBILE_PART_BYTES : DEFAULT_DESKTOP_PART_BYTES;

		// Quick inspect total pages if PDF.js is loaded
		const globalPdfjs = typeof window !== 'undefined' ? window.pdfjsLib : null;
		if (globalPdfjs) {
			const isBlob = typeof Blob !== 'undefined' && file instanceof Blob;
			const url = isBlob ? URL.createObjectURL(file) : null;
			const src = url ? { url } : { data: file as unknown as Uint8Array };
			globalPdfjs
				.getDocument(src)
				.promise.then((d) => {
					this.totalDocPages = d.numPages;
					d.destroy();
				})
				.catch(() => {})
				.finally(() => {
					if (url) URL.revokeObjectURL(url);
				});
		}
	}

	async selectOutputDirectory(): Promise<void> {
		if (!this.supportsFSA) return;
		try {
			const handle = await (
				window as unknown as { showDirectoryPicker: () => Promise<FileSystemDirectoryHandle> }
			).showDirectoryPicker();
			this.dirHandle = handle;
			this.dirName = handle.name;
		} catch (err: unknown) {
			if (err instanceof DOMException && err.name === 'AbortError') return;
			Logger.error('[PdfSplitterState]', 'Directory picker error:', err);
		}
	}

	clearOutputDirectory(): void {
		this.dirHandle = null;
		this.dirName = '';
	}

	async loadPreview(): Promise<void> {
		if (!this.pdfSelectedFile) return;
		this.loadingPreview = true;
		this.status = '';
		this.isError = false;

		try {
			this.previewPages = await loadPdfPreview(
				this.pdfSelectedFile,
				this.selectedPreviewCount,
				this.keepColor
			);
			this.currentPreviewIndex = 0;
		} catch (err: unknown) {
			const errorMsg = err instanceof Error ? err.message : String(err);
			Logger.error('[PdfSplitterState]', 'Failed to load preview', err);
			this.status = 'Không tải được xem trước: ' + errorMsg;
			this.isError = true;
		} finally {
			this.loadingPreview = false;
		}
	}

	prevPreviewPage(): void {
		if (this.previewPages.length === 0) return;
		this.currentPreviewIndex =
			(this.currentPreviewIndex - 1 + this.previewPages.length) % this.previewPages.length;
	}

	nextPreviewPage(): void {
		if (this.previewPages.length === 0) return;
		this.currentPreviewIndex = (this.currentPreviewIndex + 1) % this.previewPages.length;
	}

	adjustCrop(dir: 'top' | 'bottom', val: number): void {
		if (dir === 'top') {
			this.cropTopPx = Math.max(0, this.cropTopPx + val);
		} else {
			this.cropBottomPx = Math.max(0, this.cropBottomPx + val);
		}
	}

	resetCrop(): void {
		this.cropTopPx = 0;
		this.cropBottomPx = 0;
	}

	private pdfAbortController: AbortController | null = null;

	cancelProcessTask(): void {
		if (this.pdfAbortController) {
			this.pdfAbortController.abort();
			this.pdfAbortController = null;
			this.status = 'Đã hủy quá trình xử lý PDF.';
			this.processing = false;
		}
	}

	async processPdf(): Promise<void> {
		if (!this.pdfSelectedFile) return;
		this.cancelProcessTask();
		const ac = new AbortController();
		this.pdfAbortController = ac;

		this.processing = true;
		this.pdfZipBlob = null;
		this.pdfZipParts = [];
		this.failedPages = [];
		this.degradedPages = [];
		this.savedDirectoryName = '';
		this.status = 'Đang bắt đầu xử lý tệp PDF...';
		this.isError = false;
		this.progressPercent = 0;

		try {
			const res = await processPdfToJpg(this.pdfSelectedFile, {
				keepColor: this.keepColor,
				cropTopPx: this.cropTopPx,
				cropBottomPx: this.cropBottomPx,
				maxPartBytes: this.maxPartBytes,
				maxPagesPerPart: this.maxPagesPerPart,
				targetDpi: this.selectedDpi,
				dirHandle: this.dirHandle,
				onProgress: (info) => {
					this.progressPercent = info.progressPercent;
					this.status = info.progressLabel;
				},
				signal: ac.signal
			});
			this.pdfZipBlob = res.zipBlob;
			this.pdfZipParts = res.zipParts || [];
			this.failedPages = res.failedPages || [];
			this.degradedPages = res.degradedPages || [];
			this.savedDirectoryName = res.savedDirectoryName || '';
		} catch (err: unknown) {
			if (err instanceof DOMException && err.name === 'AbortError') {
				this.status = 'Đã hủy xử lý PDF.';
				return;
			}
			const errorMsg = err instanceof Error ? err.message : String(err);
			Logger.error('[PdfSplitterState]', 'Failed to process PDF', err);
			this.status = 'Lỗi xử lý PDF: ' + errorMsg;
			this.isError = true;
		} finally {
			this.processing = false;
			if (this.pdfAbortController === ac) {
				this.pdfAbortController = null;
			}
		}
	}

	downloadZip(): void {
		if (this.pdfZipParts.length > 1) {
			void this.downloadAllParts();
			return;
		}
		if (!this.pdfZipBlob) return;
		triggerDownload(this.pdfZipBlob, this.zipNamePreview);
	}

	downloadPart(index: number): void {
		const part = this.pdfZipParts[index];
		if (!part || !part.blob) return;
		triggerDownload(part.blob, part.filename);
	}

	releasePartBlob(index: number): void {
		const part = this.pdfZipParts[index];
		if (part) {
			part.blob = undefined; // Free from RAM!
		}
	}

	async downloadAllParts(): Promise<void> {
		for (let i = 0; i < this.pdfZipParts.length; i++) {
			this.downloadPart(i);
			if (i < this.pdfZipParts.length - 1) {
				await new Promise((resolve) => setTimeout(resolve, 800));
			}
		}
	}
}
