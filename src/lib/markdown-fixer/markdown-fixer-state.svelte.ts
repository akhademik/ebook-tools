// src/lib/markdown-fixer/markdown-fixer-state.svelte.ts
import { slugify, ensureZipExt, triggerDownload, Logger } from '$lib/utils';
import { fixMarkdownZip } from './markdown-fixer';
import type { ProcessedMarkdownFileRow } from '$lib/types';

export class MarkdownFixerState {
	mdSelectedFile = $state<File | null>(null);
	mdOutZipBlob = $state<Blob | null>(null);
	zipOutName = $state<string>('');

	status = $state<string>('');
	isError = $state<boolean>(false);
	processing = $state<boolean>(false);

	totalFiles = $state<number>(0);
	totalReplacements = $state<number>(0);
	processedFilesList = $state<ProcessedMarkdownFileRow[]>([]);

	zipNamePreview = $derived(ensureZipExt(this.zipOutName.trim() || 'ten-file-goc-da-fix'));

	handleFile(file: File | null): void {
		if (!file) return;
		if (!/\.zip$/i.test(file.name)) {
			this.status = 'Vui lòng chọn một tệp .ZIP hợp lệ.';
			this.isError = true;
			return;
		}
		this.status = '';
		this.isError = false;
		this.mdSelectedFile = file;
		this.zipOutName = slugify(file.name) + '-da-fix';
		this.mdOutZipBlob = null;
		this.processedFilesList = [];
	}

	async processMarkdownZip(): Promise<void> {
		if (!this.mdSelectedFile) return;
		this.processing = true;
		this.status = 'Đang đọc tệp .ZIP...';
		this.isError = false;

		try {
			const res = await fixMarkdownZip(this.mdSelectedFile);
			this.mdOutZipBlob = res.zipBlob;
			this.totalFiles = res.totalFiles;
			this.totalReplacements = res.totalReplacements;
			this.processedFilesList = res.processedFilesList;

			this.status = this.totalFiles > 0
				? 'Hoàn tất — sẵn sàng tải về.'
				: 'Không tìm thấy tệp Markdown nào trong tệp .ZIP này.';
		} catch (err: unknown) {
			const errorMsg = err instanceof Error ? err.message : String(err);
			Logger.error('[MarkdownFixerState]', 'Error processing markdown zip', err);
			this.status = 'Có lỗi khi xử lý tệp: ' + errorMsg;
			this.isError = true;
		} finally {
			this.processing = false;
		}
	}

	downloadZip(): void {
		if (!this.mdOutZipBlob) return;
		triggerDownload(this.mdOutZipBlob, this.zipNamePreview);
	}
}
