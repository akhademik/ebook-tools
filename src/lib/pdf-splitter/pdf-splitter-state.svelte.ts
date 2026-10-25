import { slugify, ensureZipExt, triggerDownload, Logger } from '$lib/utils';
import { MAX_PDF_FILE_SIZE } from '$lib/constants';
import { loadPdfPreview, processPdfToJpg, MAX_PAGES_PER_ZIP_PART } from './pdf-splitter';
import type { PdfPreviewPage, PdfZipPart } from '$lib/types';

export class PdfSplitterState {
	pdfSelectedFile = $state<File | null>(null);
	pdfZipBlob = $state<Blob | null>(null);
	pdfZipParts = $state<PdfZipPart[]>([]);
	pagesPerPart = $state<number>(MAX_PAGES_PER_ZIP_PART);
	bookName = $state<string>('');
	keepColor = $state<boolean>(false);

	selectedPreviewCount = $state<number>(10);
	previewPages = $state<PdfPreviewPage[]>([]);
	currentPreviewIndex = $state<number>(0);
	cropTopPx = $state<number>(0);
	cropBottomPx = $state<number>(0);

	status = $state<string>('');
	isError = $state<boolean>(false);

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
	isMobile = $derived(
		typeof navigator !== 'undefined' &&
			(navigator.maxTouchPoints > 0 ||
				/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))
	);
	hasMultipleParts = $derived(this.pdfZipParts.length > 1);

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

		this.previewPages = [];
		this.currentPreviewIndex = 0;
		this.cropTopPx = 0;
		this.cropBottomPx = 0;
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
		this.status = 'Đang bắt đầu xử lý tệp PDF...';
		this.isError = false;
		this.progressPercent = 0;

		try {
			const res = await processPdfToJpg(
				this.pdfSelectedFile,
				this.keepColor,
				this.cropTopPx,
				this.cropBottomPx,
				(info) => {
					this.progressPercent = info.progressPercent;
					this.status = info.progressLabel;
				},
				ac.signal,
				this.pagesPerPart
			);
			this.pdfZipBlob = res.zipBlob;
			this.pdfZipParts = res.zipParts || [];
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
		if (!part) return;
		const base = this.bookName.trim() || 'ten-sach';
		const filename =
			this.pdfZipParts.length > 1
				? `${base}-part${part.partIndex}-pages${part.startPage}-${part.endPage}.zip`
				: this.zipNamePreview;
		triggerDownload(part.blob, filename);
	}

	async downloadAllParts(): Promise<void> {
		for (let i = 0; i < this.pdfZipParts.length; i++) {
			this.downloadPart(i);
			if (i < this.pdfZipParts.length - 1) {
				await new Promise((resolve) => setTimeout(resolve, 600));
			}
		}
	}
}
