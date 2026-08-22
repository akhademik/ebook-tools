import { slugify, ensureZipExt, triggerDownload } from '$lib/helpers/helpers.js';
import { Logger } from '$lib/helpers/logger.js';
import { fixMarkdownZip } from './markdown-fixer.js';

export class MarkdownFixerState {
	mdSelectedFile = $state(null);
	mdOutZipBlob = $state(null);
	zipOutName = $state('');

	status = $state('');
	isError = $state(false);
	processing = $state(false);

	totalFiles = $state(0);
	totalReplacements = $state(0);
	processedFilesList = $state([]);

	zipNamePreview = $derived(ensureZipExt(this.zipOutName.trim() || 'ten-file-goc-da-fix'));

	handleFile(file) {
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

	async processMarkdownZip() {
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
		} catch (err) {
			Logger.error('[MarkdownFixerState]', 'Error processing markdown zip', err);
			this.status = 'Có lỗi khi xử lý tệp: ' + err.message;
			this.isError = true;
		} finally {
			this.processing = false;
		}
	}

	downloadZip() {
		if (!this.mdOutZipBlob) return;
		triggerDownload(this.mdOutZipBlob, this.zipNamePreview);
	}
}
