import { slugify, ensureZipExt, triggerDownload } from '$lib/helpers/helpers.js';
import { loadPdfPreview, processPdfToJpg } from './pdf-splitter.js';

export class PdfSplitterState {
	pdfSelectedFile = $state(null);
	pdfZipBlob = $state(null);
	bookName = $state('');
	keepColor = $state(false);

	selectedPreviewCount = $state(10);
	previewPages = $state([]);
	currentPreviewIndex = $state(0);
	cropTopPx = $state(0);
	cropBottomPx = $state(0);

	status = $state('');
	isError = $state(false);
	
	loadingPreview = $state(false);
	processing = $state(false);
	
	progressPercent = $state(0);
	progressLabel = $state('');

	zipNamePreview = $derived(ensureZipExt(this.bookName.trim() || 'ten-sach'));
	cropSummary = $derived(
		this.cropTopPx > 0 || this.cropBottomPx > 0
			? `Sẽ cắt ${this.cropTopPx}px trên · ${this.cropBottomPx}px dưới ở mỗi trang khi xuất.`
			: ''
	);

	handleFile(file) {
		if (!file) return;
		if (file.type !== 'application/pdf' && !/\.pdf$/i.test(file.name)) {
			this.status = 'Vui lòng chọn một tệp PDF hợp lệ.';
			this.isError = true;
			return;
		}
		this.status = '';
		this.isError = false;
		this.pdfSelectedFile = file;
		this.bookName = slugify(file.name);
		this.pdfZipBlob = null;
		
		this.previewPages = [];
		this.currentPreviewIndex = 0;
		this.cropTopPx = 0;
		this.cropBottomPx = 0;
	}

	async loadPreview() {
		if (!this.pdfSelectedFile) return;
		this.loadingPreview = true;
		this.status = '';
		this.isError = false;

		try {
			this.previewPages = await loadPdfPreview(this.pdfSelectedFile, this.selectedPreviewCount, this.keepColor);
			this.currentPreviewIndex = 0;
		} catch (err) {
			console.error(err);
			this.status = 'Không tải được xem trước: ' + err.message;
			this.isError = true;
		} finally {
			this.loadingPreview = false;
		}
	}

	prevPreviewPage() {
		if (this.previewPages.length === 0) return;
		this.currentPreviewIndex = (this.currentPreviewIndex - 1 + this.previewPages.length) % this.previewPages.length;
	}

	nextPreviewPage() {
		if (this.previewPages.length === 0) return;
		this.currentPreviewIndex = (this.currentPreviewIndex + 1) % this.previewPages.length;
	}

	adjustCrop(dir, val) {
		if (dir === 'top') {
			this.cropTopPx = Math.max(0, this.cropTopPx + val);
		} else {
			this.cropBottomPx = Math.max(0, this.cropBottomPx + val);
		}
	}

	resetCrop() {
		this.cropTopPx = 0;
		this.cropBottomPx = 0;
	}

	async processPdf() {
		if (!this.pdfSelectedFile) return;
		this.processing = true;
		this.pdfZipBlob = null;
		this.status = 'Đang bắt đầu xử lý tệp PDF...';
		this.isError = false;
		this.progressPercent = 0;

		try {
			const res = await processPdfToJpg(
				this.pdfSelectedFile,
				this.keepColor,
				this.cropTopPx,
				this.cropBottomPx,
				(p) => {
					this.progressPercent = p.progressPercent;
					this.progressLabel = p.progressLabel;
				}
			);
			this.pdfZipBlob = res.zipBlob;
			this.status = `Hoàn tất — ${res.numPages} trang đã sẵn sàng.`;
		} catch (err) {
			console.error(err);
			this.status = 'Có lỗi khi xử lý: ' + err.message;
			this.isError = true;
		} finally {
			this.processing = false;
		}
	}

	downloadZip() {
		if (!this.pdfZipBlob) return;
		triggerDownload(this.pdfZipBlob, this.zipNamePreview);
	}
}
