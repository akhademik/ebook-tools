// src/lib/epub-to-txt/epub-to-txt-state.svelte.ts
import { MAX_EPUB_FILE_SIZE } from '$lib/constants';
import { triggerDownload, Logger } from '$lib/utils';
import { extractEpubToTxt, type EpubToTxtResult } from './epub-to-txt';

export class EpubToTxtState {
	selectedFile = $state<File | null>(null);
	isProcessing = $state<boolean>(false);
	progressPercent = $state<number>(0);
	progressLabel = $state<string>('');
	status = $state<string>('');
	isError = $state<boolean>(false);
	result = $state<EpubToTxtResult | null>(null);
	copied = $state<boolean>(false);

	previewSnippet = $derived.by(() => {
		if (!this.result?.text) return '';
		// Show first 15000 chars for preview
		return this.result.text.length > 15000
			? this.result.text.slice(0, 15000) + '\n\n... [Văn bản còn tiếp trong tệp tải về] ...'
			: this.result.text;
	});

	handleFile(file: File | null): void {
		if (!file) return;

		if (!/\.epub$/i.test(file.name) && file.type !== 'application/epub+zip') {
			this.status = 'Vui lòng chọn một tệp .EPUB hợp lệ.';
			this.isError = true;
			return;
		}

		if (file.size > MAX_EPUB_FILE_SIZE) {
			this.status = 'Dung lượng tệp EPUB vượt quá giới hạn cho phép (tối đa 250MB).';
			this.isError = true;
			return;
		}

		this.selectedFile = file;
		this.status = '';
		this.isError = false;
		this.result = null;
		this.progressPercent = 0;
		this.progressLabel = '';
		this.copied = false;
	}

	async processEpub(): Promise<void> {
		if (!this.selectedFile) return;

		this.isProcessing = true;
		this.isError = false;
		this.status = 'Đang tiến hành chuyển đổi...';
		this.progressPercent = 5;
		this.progressLabel = 'Bắt đầu đọc tệp EPUB...';

		try {
			const res = await extractEpubToTxt(this.selectedFile, {
				onProgress: (status, percent) => {
					this.progressLabel = status;
					this.progressPercent = percent;
				}
			});

			this.result = res;
			this.status = `Chuyển đổi thành công! Trích xuất ${res.chapterCount} chương (${res.wordCount.toLocaleString()} từ, ${res.charCount.toLocaleString()} ký tự).`;
			this.isError = false;
		} catch (err: unknown) {
			const msg = err instanceof Error ? err.message : String(err);
			Logger.error('[EpubToTxtState]', 'Error converting EPUB to TXT', err);
			this.status = `Lỗi chuyển đổi: ${msg}`;
			this.isError = true;
		} finally {
			this.isProcessing = false;
		}
	}

	downloadTxt(): void {
		if (!this.result) return;
		triggerDownload(this.result.txtBlob, this.result.fileName);
	}

	async copyToClipboard(): Promise<void> {
		if (!this.result?.text || typeof navigator === 'undefined' || !navigator.clipboard) return;
		try {
			await navigator.clipboard.writeText(this.result.text);
			this.copied = true;
			setTimeout(() => {
				this.copied = false;
			}, 2500);
		} catch (err) {
			Logger.error('[EpubToTxtState]', 'Could not copy to clipboard', err);
		}
	}

	reset(): void {
		this.selectedFile = null;
		this.isProcessing = false;
		this.progressPercent = 0;
		this.progressLabel = '';
		this.status = '';
		this.isError = false;
		this.result = null;
		this.copied = false;
	}
}
