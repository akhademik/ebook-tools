// src/lib/epub-editor/epub-editor-state.svelte.ts
import JSZip from 'jszip';
import { SvelteMap, SvelteSet } from 'svelte/reactivity';
import type { EpubEditorFileItem, EpubValidationError } from '$lib/types';
import {
	parseZipEntries,
	buildPreviewHtml,
	getAssetDataUrl,
	extractLinkedCssPaths,
	validateDirtyPages,
	exportEpubBlob
} from './epub-editor';
import {
	analyzeEpub,
	cleanEpub,
	formatByteSize,
	type EpubAnalysisResult,
	type EpubCleanReport,
	type EpubCleanOptions
} from './epub-cleaner';
import {
	findOpfPath,
	extractBookMetadata,
	updateBookMetadata,
	rebuildEpubToc,
	type BookMetadataDetails
} from './epub-book-ops';
import { MAX_EPUB_FILE_SIZE } from '$lib/constants';
import { Logger, triggerDownload } from '$lib/utils';

export class EpubEditorState {
	zip = $state<JSZip | null>(null);
	fileName = $state<string>('');
	files = $state<EpubEditorFileItem[]>([]);

	// 2 distinct targets
	editorTarget = $state<string | null>(null);
	previewTarget = $state<string | null>(null);

	// Buffers & Dirty tracking
	editBuffer = new SvelteMap<string, string>();
	dirtyPaths = new SvelteSet<string>();
	originalContents = new SvelteMap<string, string>();

	// UI & modal states
	isModalOpen = $state<boolean>(false);
	isCleanerModalOpen = $state<boolean>(false);
	isValidatorModalOpen = $state<boolean>(false);
	isMetadataModalOpen = $state<boolean>(false);
	isLoading = $state<boolean>(false);
	statusMessage = $state<string>('');
	isError = $state<boolean>(false);
	isExporting = $state<boolean>(false);

	previewSrcDoc = $state<string>('');
	validationErrors = $state<EpubValidationError[]>([]);

	// Book metadata & TOC state
	bookMetadata = $state<BookMetadataDetails | null>(null);

	// Cleaner analysis & report
	cleanAnalysis = $state<EpubAnalysisResult | null>(null);
	cleanReport = $state<EpubCleanReport | null>(null);

	// Sync View (Scroll & Highlight)
	syncViewEnabled = $state<boolean>(true);
	scrollEditorTo?: (ratio: number) => void;
	scrollPreviewTo?: (ratio: number) => void;
	selectTextInEditor?: (text: string) => void;
	selectTextInPreview?: (text: string) => void;

	// Object URL tracker for memory leak prevention
	private currentObjectUrls: string[] = [];
	private previewDebounceTimer: ReturnType<typeof setTimeout> | null = null;
	private cleanerAbortController: AbortController | null = null;

	cancelCleanupTask(): void {
		if (this.cleanerAbortController) {
			this.cleanerAbortController.abort();
			this.cleanerAbortController = null;
			this.statusMessage = 'Đã hủy tác vụ dọn dẹp.';
		}
	}

	async loadEpubFile(file: File): Promise<void> {
		this.reset();
		this.fileName = file.name;

		if (file.size > MAX_EPUB_FILE_SIZE) {
			this.statusMessage = 'Dung lượng tệp EPUB vượt quá giới hạn cho phép (tối đa 250MB).';
			this.isError = true;
			return;
		}

		this.isLoading = true;
		this.statusMessage = 'Đang giải nén tệp EPUB...';
		this.isError = false;

		try {
			const arrayBuffer = await file.arrayBuffer();
			const loadedZip = await JSZip.loadAsync(arrayBuffer);
			this.zip = loadedZip;

			// Parse entries ordered by EPUB spine and natural sorting
			this.files = await parseZipEntries(loadedZip);
			Logger.info('[EpubEditorState]', `Loaded ${this.files.length} entries from ${file.name}`);

			if (this.files.length === 0) {
				throw new Error('Tệp EPUB không chứa file nào hợp lệ.');
			}

			// Automatically select first page item
			const firstPage = this.files.find((f) => f.category === 'page');
			if (firstPage) {
				this.editorTarget = firstPage.path;
				this.previewTarget = firstPage.path;
				await this.ensureFileLoaded(firstPage.path);
				await this.renderPreview();
			} else {
				// Fallback to first available file if no page found
				const firstFile = this.files[0];
				if (firstFile) {
					this.editorTarget = firstFile.path;
					await this.ensureFileLoaded(firstFile.path);
				}
			}

			this.statusMessage = `Đã tải thành công ${file.name}`;
		} catch (err: unknown) {
			const msg = err instanceof Error ? err.message : String(err);
			Logger.error('[EpubEditorState]', 'Error loading EPUB file', err);
			this.statusMessage = `Lỗi nạp tệp EPUB: ${msg}`;
			this.isError = true;
		} finally {
			this.isLoading = false;
		}
	}

	async ensureFileLoaded(path: string): Promise<string> {
		if (this.editBuffer.has(path)) {
			return this.editBuffer.get(path)!;
		}

		if (this.zip) {
			const zipFile = this.zip.file(path);
			if (zipFile) {
				const text = await zipFile.async('text');
				this.originalContents.set(path, text);
				this.editBuffer.set(path, text);
				return text;
			}
		}

		return '';
	}

	async selectFile(item: EpubEditorFileItem, _mode: 'single' | 'double' = 'single'): Promise<void> {
		if (item.category === 'page' || item.category === 'style') {
			await this.ensureFileLoaded(item.path);
			this.editorTarget = item.path;

			// Whenever a page file is selected, update preview target and render preview immediately
			if (item.category === 'page') {
				this.previewTarget = item.path;
				await this.renderPreview();
			}
		}
		// 'image' and 'other' do nothing on click or double-click
	}

	updateFileContent(path: string, content: string): void {
		this.editBuffer.set(path, content);

		// Check if changed compared to original
		const original = this.originalContents.get(path);
		if (original !== undefined && original === content) {
			this.dirtyPaths.delete(path);
		} else {
			this.dirtyPaths.add(path);
		}

		// Trigger real-time preview update if previewTarget is affected
		this.checkAndSchedulePreviewUpdate(path);
	}

	private checkAndSchedulePreviewUpdate(modifiedPath: string): void {
		if (!this.previewTarget) return;

		let shouldUpdate = false;
		if (modifiedPath === this.previewTarget) {
			shouldUpdate = true;
		} else if (modifiedPath.endsWith('.css')) {
			// Check if previewTarget references this CSS
			const currentHtml = this.editBuffer.get(this.previewTarget) || '';
			const linkedCss = extractLinkedCssPaths(currentHtml, this.previewTarget);
			if (linkedCss.includes(modifiedPath)) {
				shouldUpdate = true;
			}
		}

		if (shouldUpdate) {
			if (this.previewDebounceTimer) {
				clearTimeout(this.previewDebounceTimer);
			}
			this.previewDebounceTimer = setTimeout(() => {
				this.renderPreview();
			}, 350);
		}
	}

	async renderPreview(): Promise<void> {
		if (!this.previewTarget || !this.zip) {
			this.previewSrcDoc = '';
			return;
		}

		const htmlContent = await this.ensureFileLoaded(this.previewTarget);

		try {
			const srcDoc = await buildPreviewHtml({
				html: htmlContent,
				baseHtmlPath: this.previewTarget,
				getFileContent: async (p) => {
					return await this.ensureFileLoaded(p);
				},
				getAssetDataUrl: async (p) => {
					if (!this.zip) return null;
					return await getAssetDataUrl(this.zip, p);
				}
			});

			this.previewSrcDoc = srcDoc;
		} catch (err) {
			Logger.error('[EpubEditorState]', 'Error rendering preview', err);
			this.previewSrcDoc = `<div style="font-family: monospace; color: red; padding: 20px;">Lỗi kết xuất Preview: ${String(err)}</div>`;
		}
	}

	validateDirty(): EpubValidationError[] {
		this.validationErrors = validateDirtyPages(this.dirtyPaths, this.editBuffer);
		return this.validationErrors;
	}

	async exportEpub(ignoreValidation = false): Promise<Blob | null> {
		if (!this.zip) return null;

		if (!ignoreValidation) {
			const errors = this.validateDirty();
			if (errors.length > 0) {
				Logger.warn('[EpubEditorState]', 'Export blocked due to validation errors', errors);
				return null;
			}
		}

		this.isExporting = true;
		this.statusMessage = 'Đang đóng gói file EPUB đã chỉnh sửa...';

		try {
			const blob = await exportEpubBlob(this.zip, this.editBuffer);
			const downloadName = this.fileName
				? this.fileName.replace(/\.epub$/i, '') + '-edited.epub'
				: 'ebook-edited.epub';
			triggerDownload(blob, downloadName);
			this.statusMessage = `Đã xuất thành công: ${downloadName}`;
			return blob;
		} catch (err: unknown) {
			const msg = err instanceof Error ? err.message : String(err);
			Logger.error('[EpubEditorState]', 'Error exporting EPUB', err);
			this.statusMessage = `Lỗi xuất EPUB: ${msg}`;
			this.isError = true;
			return null;
		} finally {
			this.isExporting = false;
		}
	}

	async analyzeForClean(): Promise<EpubAnalysisResult | null> {
		if (!this.zip) return null;
		this.cancelCleanupTask();
		const ac = new AbortController();
		this.cleanerAbortController = ac;

		try {
			this.cleanReport = null;
			this.statusMessage = 'Đang quét tài nguyên trùng lặp & không sử dụng...';
			const analysis = await analyzeEpub(
				this.zip,
				this.editBuffer,
				(current, total, filename) => {
					const shortName = filename.split('/').pop() || filename;
					this.statusMessage = `Đang quét tài nguyên (${current}/${total}): ${shortName}`;
				},
				ac.signal
			);
			this.cleanAnalysis = analysis;
			this.statusMessage = `Phân tích hoàn tất: có thể tiết kiệm ${formatByteSize(analysis.estimatedSavingsBytes)}`;
			return analysis;
		} catch (err: unknown) {
			if (err instanceof DOMException && err.name === 'AbortError') {
				this.statusMessage = 'Đã hủy phân tích dọn dẹp.';
				return null;
			}
			Logger.error('[EpubEditorState]', 'Failed to analyze EPUB for cleanup', err);
			return null;
		} finally {
			if (this.cleanerAbortController === ac) {
				this.cleanerAbortController = null;
			}
		}
	}

	async runCleanup(options?: EpubCleanOptions): Promise<EpubCleanReport | null> {
		if (!this.zip) return null;
		this.cancelCleanupTask();
		const ac = new AbortController();
		this.cleanerAbortController = ac;

		try {
			this.statusMessage = 'Đang thực hiện dọn dẹp & tối ưu hóa EPUB...';
			const report = await cleanEpub(
				this.zip,
				options,
				this.editBuffer,
				(current, total, filename) => {
					const shortName = filename.split('/').pop() || filename;
					this.statusMessage = `Đang khử trùng lặp (${current}/${total}): ${shortName}`;
				},
				ac.signal
			);
			this.cleanReport = report;
			this.cleanAnalysis = null;

			// Refresh entries after deletion
			this.files = await parseZipEntries(this.zip, this.editBuffer);

			// If current editorTarget was deleted, reselect first available page
			if (this.editorTarget && !this.files.some((f) => f.path === this.editorTarget)) {
				const firstPage = this.files.find((f) => f.category === 'page') || this.files[0];
				if (firstPage) {
					this.editorTarget = firstPage.path;
					this.previewTarget = firstPage.path;
					await this.ensureFileLoaded(firstPage.path);
					await this.renderPreview();
				}
			}

			this.statusMessage = `Đã dọn dẹp ${report.savedBytes > 0 ? formatByteSize(report.savedBytes) : 'tài nguyên'}`;
			return report;
		} catch (err: unknown) {
			if (err instanceof DOMException && err.name === 'AbortError') {
				this.statusMessage = 'Đã hủy dọn dẹp.';
				return null;
			}
			Logger.error('[EpubEditorState]', 'Failed to run EPUB cleanup', err);
			return null;
		} finally {
			if (this.cleanerAbortController === ac) {
				this.cleanerAbortController = null;
			}
		}
	}

	async loadBookMetadata(): Promise<BookMetadataDetails | null> {
		if (!this.zip) return null;
		try {
			const opfPath = await findOpfPath(this.zip);
			if (!opfPath) return null;
			await this.ensureFileLoaded(opfPath);
			const opfXml = this.editBuffer.get(opfPath) || '';
			const meta = extractBookMetadata(opfXml);
			this.bookMetadata = meta;
			return meta;
		} catch (err) {
			Logger.error('[EpubEditorState]', 'Failed to load book metadata', err);
			return null;
		}
	}

	async saveBookMetadata(newMeta: BookMetadataDetails): Promise<boolean> {
		if (!this.zip) return false;
		try {
			const opfPath = await findOpfPath(this.zip);
			if (!opfPath) return false;
			await this.ensureFileLoaded(opfPath);
			const opfXml = this.editBuffer.get(opfPath) || '';
			const updated = updateBookMetadata(opfXml, newMeta);
			this.editBuffer.set(opfPath, updated);
			this.dirtyPaths.add(opfPath);
			this.bookMetadata = newMeta;
			this.statusMessage = 'Đã cập nhật metadata trong content.opf';
			return true;
		} catch (err) {
			Logger.error('[EpubEditorState]', 'Failed to save book metadata', err);
			return false;
		}
	}

	async rebuildToc(): Promise<boolean> {
		if (!this.zip) return false;
		try {
			const res = await rebuildEpubToc(this.zip, this.editBuffer);
			if (!res) return false;

			// Write nav.xhtml & toc.ncx to editBuffer (canonical in-memory store)
			this.editBuffer.set(res.navPath, res.navXhtml);
			this.dirtyPaths.add(res.navPath);

			this.editBuffer.set(res.ncxPath, res.tocNcx);
			this.dirtyPaths.add(res.ncxPath);

			this.files = await parseZipEntries(this.zip, this.editBuffer);
			this.statusMessage = 'Đã tạo lại mục lục nav.xhtml và toc.ncx';
			return true;
		} catch (err) {
			Logger.error('[EpubEditorState]', 'Failed to rebuild TOC', err);
			return false;
		}
	}

	cleanupObjectUrls(): void {
		for (const url of this.currentObjectUrls) {
			try {
				if (typeof URL !== 'undefined' && URL.revokeObjectURL) {
					URL.revokeObjectURL(url);
				}
			} catch {
				// ignore
			}
		}
		this.currentObjectUrls = [];
	}

	closeModal(): void {
		this.cleanupObjectUrls();
		this.isModalOpen = false;
	}

	reset(): void {
		if (this.previewDebounceTimer) {
			clearTimeout(this.previewDebounceTimer);
			this.previewDebounceTimer = null;
		}
		this.cleanupObjectUrls();
		this.zip = null;
		this.fileName = '';
		this.files = [];
		this.editorTarget = null;
		this.previewTarget = null;
		this.editBuffer.clear();
		this.dirtyPaths.clear();
		this.originalContents.clear();
		this.isModalOpen = false;
		this.isCleanerModalOpen = false;
		this.isValidatorModalOpen = false;
		this.isMetadataModalOpen = false;
		this.isLoading = false;
		this.statusMessage = '';
		this.isError = false;
		this.isExporting = false;
		this.previewSrcDoc = '';
		this.validationErrors = [];
		this.cleanAnalysis = null;
		this.cleanReport = null;
		this.bookMetadata = null;
	}
}
