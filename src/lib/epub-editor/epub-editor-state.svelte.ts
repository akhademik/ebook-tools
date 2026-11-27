// src/lib/epub-editor/epub-editor-state.svelte.ts
import JSZip from 'jszip';
import { SvelteMap, SvelteSet } from 'svelte/reactivity';
import type {
	EpubEditorFileItem,
	EpubValidationError,
	ZipExtractionBudgetTracker
} from '$lib/types';
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
import {
	Logger,
	triggerDownload,
	loadSafeEpubZip,
	createZipExtractionBudget,
	readSafeZipEntryText
} from '$lib/utils';

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
	latestPreviewRequestId = 0;
	assetDataUrlCache = new SvelteMap<string, string>();
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
	flushEditorSync?: () => void;

	// Object URL tracker for memory leak prevention
	private currentObjectUrls: string[] = [];
	private previewDebounceTimer: ReturnType<typeof setTimeout> | null = null;
	private cleanerAbortController: AbortController | null = null;
	private zipBudget: ZipExtractionBudgetTracker | null = null;
	private loadRequestId = 0;
	private selectionRequestId = 0;

	private isCurrentSession(loadGen: number, expectedZip: JSZip | null): boolean {
		return loadGen === this.loadRequestId && this.zip === expectedZip;
	}

	private abortPendingCleanup(silent = false): void {
		if (this.cleanerAbortController) {
			this.cleanerAbortController.abort();
			this.cleanerAbortController = null;
			if (!silent) {
				this.statusMessage = 'Đã hủy tác vụ dọn dẹp.';
			}
		}
	}

	cancelCleanupTask(): void {
		this.abortPendingCleanup(false);
	}

	async loadEpubFile(file: File): Promise<void> {
		this.reset();
		const requestId = this.loadRequestId;
		this.fileName = file.name;

		if (file.size > MAX_EPUB_FILE_SIZE) {
			this.statusMessage = 'Dung lượng file EPUB vượt quá giới hạn cho phép (tối đa 250MB).';
			this.isError = true;
			return;
		}

		this.isLoading = true;
		this.statusMessage = 'Đang giải nén file EPUB...';
		this.isError = false;

		try {
			const loadedZip = await loadSafeEpubZip(file);
			if (requestId !== this.loadRequestId) return;

			const budget = createZipExtractionBudget();
			// Parse entries ordered by EPUB spine and natural sorting
			const parsedFiles = await parseZipEntries(loadedZip, undefined, budget);
			if (requestId !== this.loadRequestId) return;

			this.zip = loadedZip;
			this.zipBudget = budget;
			this.files = parsedFiles;
			Logger.info('[EpubEditorState]', `Loaded ${this.files.length} entries from ${file.name}`);

			if (this.files.length === 0) {
				throw new Error('File EPUB không chứa file nào hợp lệ.');
			}

			// Automatically select first page item
			const firstPage = this.files.find((f) => f.category === 'page');
			if (firstPage) {
				this.editorTarget = firstPage.path;
				this.previewTarget = firstPage.path;
				await this.ensureFileLoaded(firstPage.path);
				if (requestId !== this.loadRequestId) return;

				await this.renderPreview();
				if (requestId !== this.loadRequestId) return;
			} else {
				// Fallback to first available file if no page found
				const firstFile = this.files[0];
				if (firstFile) {
					this.editorTarget = firstFile.path;
					await this.ensureFileLoaded(firstFile.path);
					if (requestId !== this.loadRequestId) return;
				}
			}

			this.statusMessage = `Đã tải thành công ${file.name}`;
		} catch (err: unknown) {
			if (requestId !== this.loadRequestId) return;
			const msg = err instanceof Error ? err.message : String(err);
			Logger.error('[EpubEditorState]', 'Error loading EPUB file', err);
			this.statusMessage = `Lỗi nạp file EPUB: ${msg}`;
			this.isError = true;
		} finally {
			if (requestId === this.loadRequestId) {
				this.isLoading = false;
			}
		}
	}

	async ensureFileLoaded(path: string): Promise<string> {
		if (this.editBuffer.has(path)) {
			return this.editBuffer.get(path)!;
		}

		const loadGen = this.loadRequestId;
		const activeZip = this.zip;
		const activeBudget = this.zipBudget ?? undefined;
		if (activeZip) {
			const text = await readSafeZipEntryText(activeZip, path, {
				budget: activeBudget
			});
			if (!this.isCurrentSession(loadGen, activeZip)) {
				return '';
			}
			if (text !== null) {
				if (!this.originalContents.has(path)) {
					this.originalContents.set(path, text);
				}
				if (this.editBuffer.has(path)) {
					return this.editBuffer.get(path)!;
				}
				this.editBuffer.set(path, text);
				return text;
			}
		}

		return '';
	}

	async selectFile(item: EpubEditorFileItem, _mode: 'single' | 'double' = 'single'): Promise<void> {
		if (item.category === 'page' || item.category === 'style') {
			const loadGen = this.loadRequestId;
			const activeZip = this.zip;
			const selGen = ++this.selectionRequestId;

			await this.ensureFileLoaded(item.path);
			if (!this.isCurrentSession(loadGen, activeZip) || selGen !== this.selectionRequestId) {
				return;
			}

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
		this.flushEditorSync?.();
		if (!this.previewTarget || !this.zip) {
			this.previewSrcDoc = '';
			return;
		}

		const loadGen = this.loadRequestId;
		const activeZip = this.zip;
		const activeBudget = this.zipBudget ?? undefined;
		const targetPath = this.previewTarget;
		const requestId = ++this.latestPreviewRequestId;

		const htmlContent = await this.ensureFileLoaded(targetPath);
		if (!this.isCurrentSession(loadGen, activeZip) || requestId !== this.latestPreviewRequestId) {
			return;
		}

		try {
			const srcDoc = await buildPreviewHtml({
				html: htmlContent,
				baseHtmlPath: targetPath,
				getFileContent: async (p) => {
					if (!this.isCurrentSession(loadGen, activeZip)) return '';
					return await this.ensureFileLoaded(p);
				},
				getAssetDataUrl: async (p) => {
					if (!this.isCurrentSession(loadGen, activeZip) || !activeZip) return null;
					const cached = this.assetDataUrlCache.get(p);
					if (cached) return cached;
					const dataUrl = await getAssetDataUrl(activeZip, p, activeBudget);
					if (!this.isCurrentSession(loadGen, activeZip)) return null;
					if (dataUrl) {
						this.assetDataUrlCache.set(p, dataUrl);
					}
					return dataUrl;
				}
			});

			if (!this.isCurrentSession(loadGen, activeZip) || requestId !== this.latestPreviewRequestId) {
				Logger.debug(
					'[EpubEditorState]',
					`Discarding stale preview render ${requestId} (current latest is ${this.latestPreviewRequestId})`
				);
				return;
			}

			this.previewSrcDoc = srcDoc;
		} catch (err) {
			if (!this.isCurrentSession(loadGen, activeZip) || requestId !== this.latestPreviewRequestId) {
				return;
			}
			Logger.error('[EpubEditorState]', 'Error rendering preview', err);
			this.previewSrcDoc = `<div style="font-family: monospace; color: red; padding: 20px;">Lỗi kết xuất Preview: ${String(err)}</div>`;
		}
	}

	validateDirty(): EpubValidationError[] {
		this.flushEditorSync?.();
		this.validationErrors = validateDirtyPages(this.dirtyPaths, this.editBuffer);
		return this.validationErrors;
	}

	async exportEpub(ignoreValidation = false): Promise<Blob | null> {
		if (!this.zip) return null;
		this.flushEditorSync?.();

		if (!ignoreValidation) {
			const errors = this.validateDirty();
			if (errors.length > 0) {
				Logger.warn('[EpubEditorState]', 'Export blocked due to validation errors', errors);
				return null;
			}
		}

		const loadGen = this.loadRequestId;
		const activeZip = this.zip;
		const activeBudget = this.zipBudget ?? undefined;
		const activeFileName = this.fileName;

		this.isExporting = true;
		this.statusMessage = 'Đang đóng gói file EPUB đã chỉnh sửa...';

		try {
			const blob = await exportEpubBlob(activeZip, this.editBuffer, activeBudget);
			if (!this.isCurrentSession(loadGen, activeZip)) return null;

			const downloadName = activeFileName
				? activeFileName.replace(/\.epub$/i, '') + '-edited.epub'
				: 'ebook-edited.epub';
			triggerDownload(blob, downloadName);
			this.statusMessage = `Đã xuất thành công: ${downloadName}`;
			return blob;
		} catch (err: unknown) {
			if (!this.isCurrentSession(loadGen, activeZip)) return null;
			const msg = err instanceof Error ? err.message : String(err);
			Logger.error('[EpubEditorState]', 'Error exporting EPUB', err);
			this.statusMessage = `Lỗi xuất EPUB: ${msg}`;
			this.isError = true;
			return null;
		} finally {
			if (this.isCurrentSession(loadGen, activeZip)) {
				this.isExporting = false;
			}
		}
	}

	async analyzeForClean(): Promise<EpubAnalysisResult | null> {
		if (!this.zip) return null;
		this.flushEditorSync?.();
		this.abortPendingCleanup(true);
		const loadGen = this.loadRequestId;
		const activeZip = this.zip;
		const activeBudget = this.zipBudget ?? undefined;
		const ac = new AbortController();
		this.cleanerAbortController = ac;

		try {
			this.cleanReport = null;
			this.statusMessage = 'Đang quét tài nguyên trùng lặp & không sử dụng...';
			const analysis = await analyzeEpub(
				activeZip,
				this.editBuffer,
				(current, total, filename) => {
					if (!this.isCurrentSession(loadGen, activeZip)) return;
					const shortName = filename.split('/').pop() || filename;
					this.statusMessage = `Đang quét tài nguyên (${current}/${total}): ${shortName}`;
				},
				ac.signal,
				activeBudget
			);
			if (!this.isCurrentSession(loadGen, activeZip)) return null;

			this.cleanAnalysis = analysis;
			this.statusMessage = `Phân tích hoàn tất: có thể tiết kiệm ${formatByteSize(analysis.estimatedSavingsBytes)}`;
			return analysis;
		} catch (err: unknown) {
			if (!this.isCurrentSession(loadGen, activeZip)) return null;
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
		this.abortPendingCleanup(true);
		const loadGen = this.loadRequestId;
		const activeZip = this.zip;
		const activeBudget = this.zipBudget ?? undefined;
		const ac = new AbortController();
		this.cleanerAbortController = ac;

		try {
			this.statusMessage = 'Đang thực hiện dọn dẹp & tối ưu hóa EPUB...';
			const report = await cleanEpub(
				activeZip,
				options,
				this.editBuffer,
				(current, total, filename) => {
					if (!this.isCurrentSession(loadGen, activeZip)) return;
					const shortName = filename.split('/').pop() || filename;
					this.statusMessage = `Đang khử trùng lặp (${current}/${total}): ${shortName}`;
				},
				ac.signal,
				activeBudget
			);
			if (!this.isCurrentSession(loadGen, activeZip)) return null;

			this.cleanReport = report;
			this.cleanAnalysis = null;
			this.assetDataUrlCache.clear();

			// Refresh entries after deletion
			const refreshedFiles = await parseZipEntries(activeZip, this.editBuffer, activeBudget);
			if (!this.isCurrentSession(loadGen, activeZip)) return null;
			this.files = refreshedFiles;

			// If current editorTarget was deleted, reselect first available page
			if (this.editorTarget && !this.files.some((f) => f.path === this.editorTarget)) {
				const firstPage = this.files.find((f) => f.category === 'page') || this.files[0];
				if (firstPage) {
					this.editorTarget = firstPage.path;
					this.previewTarget = firstPage.path;
					await this.ensureFileLoaded(firstPage.path);
					if (!this.isCurrentSession(loadGen, activeZip)) return null;
					await this.renderPreview();
					if (!this.isCurrentSession(loadGen, activeZip)) return null;
				}
			}

			this.statusMessage = `Đã dọn dẹp ${report.savedBytes > 0 ? formatByteSize(report.savedBytes) : 'tài nguyên'}`;
			return report;
		} catch (err: unknown) {
			if (!this.isCurrentSession(loadGen, activeZip)) return null;
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
		const loadGen = this.loadRequestId;
		const activeZip = this.zip;
		const activeBudget = this.zipBudget ?? undefined;
		try {
			const opfPath = await findOpfPath(activeZip, { budget: activeBudget });
			if (!opfPath || !this.isCurrentSession(loadGen, activeZip)) return null;
			await this.ensureFileLoaded(opfPath);
			if (!this.isCurrentSession(loadGen, activeZip)) return null;
			const opfXml = this.editBuffer.get(opfPath) || '';
			const meta = extractBookMetadata(opfXml);
			this.bookMetadata = meta;
			return meta;
		} catch (err) {
			if (!this.isCurrentSession(loadGen, activeZip)) return null;
			Logger.error('[EpubEditorState]', 'Failed to load book metadata', err);
			return null;
		}
	}

	async saveBookMetadata(newMeta: BookMetadataDetails): Promise<boolean> {
		if (!this.zip) return false;
		const loadGen = this.loadRequestId;
		const activeZip = this.zip;
		const activeBudget = this.zipBudget ?? undefined;
		try {
			const opfPath = await findOpfPath(activeZip, { budget: activeBudget });
			if (!opfPath || !this.isCurrentSession(loadGen, activeZip)) return false;
			await this.ensureFileLoaded(opfPath);
			if (!this.isCurrentSession(loadGen, activeZip)) return false;
			const opfXml = this.editBuffer.get(opfPath) || '';
			const updated = updateBookMetadata(opfXml, newMeta);
			this.editBuffer.set(opfPath, updated);
			this.dirtyPaths.add(opfPath);
			this.bookMetadata = newMeta;
			this.statusMessage = 'Đã cập nhật metadata trong content.opf';
			return true;
		} catch (err) {
			if (!this.isCurrentSession(loadGen, activeZip)) return false;
			Logger.error('[EpubEditorState]', 'Failed to save book metadata', err);
			return false;
		}
	}

	async rebuildToc(): Promise<boolean> {
		if (!this.zip) return false;
		this.flushEditorSync?.();
		const loadGen = this.loadRequestId;
		const activeZip = this.zip;
		const activeBudget = this.zipBudget ?? undefined;
		try {
			const res = await rebuildEpubToc(activeZip, this.editBuffer, activeBudget);
			if (!res || !this.isCurrentSession(loadGen, activeZip)) return false;

			// Write nav.xhtml & toc.ncx to editBuffer (canonical in-memory store)
			this.editBuffer.set(res.navPath, res.navXhtml);
			this.dirtyPaths.add(res.navPath);

			this.editBuffer.set(res.ncxPath, res.tocNcx);
			this.dirtyPaths.add(res.ncxPath);

			// Mark modified pages (where heading IDs were generated) as dirty
			for (const p of res.modifiedPages ?? []) {
				this.dirtyPaths.add(p);
			}

			const refreshedFiles = await parseZipEntries(activeZip, this.editBuffer, activeBudget);
			if (!this.isCurrentSession(loadGen, activeZip)) return false;

			this.files = refreshedFiles;
			this.statusMessage = 'Đã tạo lại mục lục nav.xhtml và toc.ncx';
			return true;
		} catch (err) {
			if (!this.isCurrentSession(loadGen, activeZip)) return false;
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
		this.loadRequestId++;
		this.selectionRequestId++;
		this.abortPendingCleanup(true);
		if (this.previewDebounceTimer) {
			clearTimeout(this.previewDebounceTimer);
			this.previewDebounceTimer = null;
		}
		this.cleanupObjectUrls();
		this.zip = null;
		this.zipBudget = null;
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
		this.latestPreviewRequestId = 0;
		this.assetDataUrlCache.clear();
		this.validationErrors = [];
		this.cleanAnalysis = null;
		this.cleanReport = null;
		this.bookMetadata = null;
	}
}
