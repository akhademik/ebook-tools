// src/lib/epub-to-txt/epub-to-txt-state.svelte.ts
import { MAX_EPUB_FILE_SIZE } from '$lib/constants';
import { triggerDownload, Logger } from '$lib/utils';
import { extractEpubToTxt, type EpubToTxtResult } from './epub-to-txt';
import { extractEpubMedia, type EpubMediaExtractResult } from './media-extractor';

export class EpubToTxtState {
	selectedFile = $state<File | null>(null);
	isProcessing = $state<boolean>(false);
	isExtractingMedia = $state<boolean>(false);
	progressPercent = $state<number>(0);
	progressLabel = $state<string>('');
	status = $state<string>('');
	isError = $state<boolean>(false);
	result = $state<EpubToTxtResult | null>(null);
	mediaResult = $state<EpubMediaExtractResult | null>(null);
	copied = $state<boolean>(false);

	private conversionRequestId = 0;
	private mediaRequestId = 0;
	private copyTimer: ReturnType<typeof setTimeout> | null = null;

	private clearCopyTimer(): void {
		if (this.copyTimer) {
			clearTimeout(this.copyTimer);
			this.copyTimer = null;
		}
	}

	previewSnippet = $derived.by(() => {
		if (!this.result?.text) return '';
		// Show first 15000 chars for preview
		return this.result.text.length > 15000
			? this.result.text.slice(0, 15000) + '\n\n... [Văn bản còn tiếp trong file tải về] ...'
			: this.result.text;
	});

	handleFile(file: File | null): void {
		if (!file) return;

		if (!/\.epub$/i.test(file.name) && file.type !== 'application/epub+zip') {
			this.conversionRequestId++;
			this.mediaRequestId++;
			this.isProcessing = false;
			this.isExtractingMedia = false;
			this.progressPercent = 0;
			this.progressLabel = '';
			this.status = 'Vui lòng chọn một file .EPUB hợp lệ.';
			this.isError = true;
			return;
		}

		if (file.size > MAX_EPUB_FILE_SIZE) {
			this.conversionRequestId++;
			this.mediaRequestId++;
			this.isProcessing = false;
			this.isExtractingMedia = false;
			this.progressPercent = 0;
			this.progressLabel = '';
			this.status = 'Dung lượng file EPUB vượt quá giới hạn cho phép (tối đa 250MB).';
			this.isError = true;
			return;
		}

		this.conversionRequestId++;
		this.mediaRequestId++;
		this.clearCopyTimer();
		this.selectedFile = file;
		this.isProcessing = false;
		this.isExtractingMedia = false;
		this.status = '';
		this.isError = false;
		this.result = null;
		this.mediaResult = null;
		this.progressPercent = 0;
		this.progressLabel = '';
		this.copied = false;
	}

	async processEpub(): Promise<void> {
		const file = this.selectedFile;
		if (!file || this.isProcessing || this.isExtractingMedia) return;

		const requestId = ++this.conversionRequestId;
		this.isProcessing = true;
		this.isError = false;
		this.status = 'Đang tiến hành chuyển đổi...';
		this.progressPercent = 5;
		this.progressLabel = 'Bắt đầu đọc file EPUB...';

		try {
			const res = await extractEpubToTxt(file, {
				onProgress: (status, percent) => {
					if (requestId !== this.conversionRequestId) return;
					this.progressLabel = status;
					this.progressPercent = percent;
				}
			});
			if (requestId !== this.conversionRequestId) return;

			this.result = res;
			this.status = `Chuyển đổi thành công! Trích xuất ${res.chapterCount} chương (${res.wordCount.toLocaleString()} từ, ${res.charCount.toLocaleString()} ký tự).`;
			this.isError = false;
		} catch (err: unknown) {
			if (requestId !== this.conversionRequestId) return;
			const msg = err instanceof Error ? err.message : String(err);
			Logger.error('[EpubToTxtState]', 'Error converting EPUB to TXT', err);
			this.status = `Lỗi chuyển đổi: ${msg}`;
			this.isError = true;
		} finally {
			if (requestId === this.conversionRequestId) {
				this.isProcessing = false;
			}
		}
	}

	downloadTxt(): void {
		if (!this.result) return;
		triggerDownload(this.result.txtBlob, this.result.fileName);
	}

	private formatMediaSuccessStatus(res: EpubMediaExtractResult): string {
		const parts: string[] = [];
		if (res.fontCount > 0) parts.push(`${res.fontCount} font`);
		if (res.imageCount > 0) parts.push(`${res.imageCount} hình ảnh`);
		if (res.otherMediaCount > 0) parts.push(`${res.otherMediaCount} media khác`);
		const summary = parts.join(', ');
		return `Trích xuất media thành công! Đã tải ${res.fileName} (${summary}, tổng ${res.totalCount} tệp).`;
	}

	async extractMedia(): Promise<void> {
		const file = this.selectedFile;
		if (!file || this.isProcessing || this.isExtractingMedia) return;

		if (this.mediaResult) {
			triggerDownload(this.mediaResult.zipBlob, this.mediaResult.fileName);
			this.status = this.formatMediaSuccessStatus(this.mediaResult);
			this.isError = false;
			return;
		}

		const requestId = ++this.mediaRequestId;
		this.isExtractingMedia = true;
		this.isError = false;
		this.status = 'Đang trích xuất font & media...';
		this.progressPercent = 5;
		this.progressLabel = 'Bắt đầu quét media trong EPUB...';

		try {
			const res = await extractEpubMedia(file, {
				onProgress: (status, percent) => {
					if (requestId !== this.mediaRequestId) return;
					this.progressLabel = status;
					this.progressPercent = percent;
				}
			});
			if (requestId !== this.mediaRequestId) return;

			this.mediaResult = res;
			triggerDownload(res.zipBlob, res.fileName);
			this.status = this.formatMediaSuccessStatus(res);
			this.isError = false;
		} catch (err: unknown) {
			if (requestId !== this.mediaRequestId) return;
			const msg = err instanceof Error ? err.message : String(err);
			Logger.error('[EpubToTxtState]', 'Error extracting EPUB media', err);
			this.status = `Lỗi trích xuất media: ${msg}`;
			this.isError = true;
		} finally {
			if (requestId === this.mediaRequestId) {
				this.isExtractingMedia = false;
			}
		}
	}

	async copyToClipboard(): Promise<void> {
		if (!this.result?.text || typeof navigator === 'undefined' || !navigator.clipboard) return;
		try {
			await navigator.clipboard.writeText(this.result.text);
			this.copied = true;
			this.clearCopyTimer();
			this.copyTimer = setTimeout(() => {
				this.copied = false;
				this.copyTimer = null;
			}, 2500);
		} catch (err) {
			Logger.error('[EpubToTxtState]', 'Could not copy to clipboard', err);
		}
	}

	reset(): void {
		this.conversionRequestId++;
		this.mediaRequestId++;
		this.clearCopyTimer();
		this.selectedFile = null;
		this.isProcessing = false;
		this.isExtractingMedia = false;
		this.progressPercent = 0;
		this.progressLabel = '';
		this.status = '';
		this.isError = false;
		this.result = null;
		this.mediaResult = null;
		this.copied = false;
	}
}
