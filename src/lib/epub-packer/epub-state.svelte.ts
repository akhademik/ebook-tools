// src/lib/epub-packer/epub-state.svelte.ts
import { buildEpubBlob, EPUB_CSS } from './epub-packer';
import type {
	EpubFontsConfig,
	EpubJacketConfig,
	CoverBlobItem,
	EpubChapterItem,
	OrnamentsConfig,
	IllustrationImageItem,
	CleanedLinesReportItem,
	CustomDefinition
} from '$lib/types';
import { Logger } from '$lib/utils';
import { findFont } from './templates/fonts';
import {
	EpubMetadataState,
	EpubJacketState,
	EpubFontsState,
	EpubImagesState,
	EpubSourceState
} from './state';

export class EpubState {
	metadata: EpubMetadataState;
	jacket: EpubJacketState;
	fonts: EpubFontsState;
	images: EpubImagesState;
	source: EpubSourceState;

	epubBlob = $state<Blob | null>(null);
	status = $state<string>('');
	isError = $state<boolean>(false);
	processing = $state<boolean>(false);

	constructor() {
		this.metadata = new EpubMetadataState();
		this.jacket = new EpubJacketState();
		this.fonts = new EpubFontsState();
		this.images = new EpubImagesState();
		this.source = new EpubSourceState({
			getTitle: () => this.metadata.title,
			onFileLoaded: (baseName: string) => {
				this.metadata.epubOutName = baseName;
				this.metadata.title = baseName.replace(/-/g, ' ');
				this.epubBlob = null;
			},
			getIllustrationFiles: () => this.images.illustrationFiles
		});

		this.images.onIllustrationsChanged = () => {
			if (this.source.fileType === 'txt' && this.source.rawTxtText) {
				this.source.applyTxtGrouping();
			}
		};
	}

	// Metadata delegates
	get title(): string { return this.metadata.title; }
	set title(v: string) { this.metadata.title = v; }

	get author(): string { return this.metadata.author; }
	set author(v: string) { this.metadata.author = v; }

	get lang(): string { return this.metadata.lang; }
	set lang(v: string) { this.metadata.lang = v; }

	get publisher(): string { return this.metadata.publisher; }
	set publisher(v: string) { this.metadata.publisher = v; }

	get epubOutName(): string { return this.metadata.epubOutName; }
	set epubOutName(v: string) { this.metadata.epubOutName = v; }

	get epubOutNamePreview(): string { return this.metadata.epubOutNamePreview; }

	// Jacket delegates
	get jacketTemplateId(): number { return this.jacket.jacketTemplateId; }
	set jacketTemplateId(v: number) { this.jacket.jacketTemplateId = v; }

	get originalTitle(): string { return this.jacket.originalTitle; }
	set originalTitle(v: string) { this.jacket.originalTitle = v; }

	get distributor(): string { return this.jacket.distributor; }
	set distributor(v: string) { this.jacket.distributor = v; }

	get translator(): string { return this.jacket.translator; }
	set translator(v: string) { this.jacket.translator = v; }

	// Fonts delegates
	get jacketFont(): string { return this.fonts.jacketFont; }
	set jacketFont(v: string) { this.fonts.jacketFont = v; }

	get h1Font(): string { return this.fonts.h1Font; }
	set h1Font(v: string) { this.fonts.h1Font = v; }

	get h2Font(): string { return this.fonts.h2Font; }
	set h2Font(v: string) { this.fonts.h2Font = v; }

	get dropcapFont(): string { return this.fonts.dropcapFont; }
	set dropcapFont(v: string) { this.fonts.dropcapFont = v; }

	// Images & Cover delegates
	get coverFile(): File | null { return this.images.coverFile; }
	set coverFile(v: File | null) { this.images.coverFile = v; }

	get coverOriginalUrl(): string | null { return this.images.coverOriginalUrl; }
	set coverOriginalUrl(v: string | null) { this.images.coverOriginalUrl = v; }

	get coverWidth(): number { return this.images.coverWidth; }
	set coverWidth(v: number) { this.images.coverWidth = v; }

	get coverHeight(): number { return this.images.coverHeight; }
	set coverHeight(v: number) { this.images.coverHeight = v; }

	get coverCropTop(): number { return this.images.coverCropTop; }
	set coverCropTop(v: number) { this.images.coverCropTop = v; }

	get coverCropBottom(): number { return this.images.coverCropBottom; }
	set coverCropBottom(v: number) { this.images.coverCropBottom = v; }

	get coverCropLeft(): number { return this.images.coverCropLeft; }
	set coverCropLeft(v: number) { this.images.coverCropLeft = v; }

	get coverCropRight(): number { return this.images.coverCropRight; }
	set coverCropRight(v: number) { this.images.coverCropRight = v; }

	get chapterOrnamentFile(): File | null { return this.images.chapterOrnamentFile; }
	set chapterOrnamentFile(v: File | null) { this.images.chapterOrnamentFile = v; }

	get subchapterOrnamentFile(): File | null { return this.images.subchapterOrnamentFile; }
	set subchapterOrnamentFile(v: File | null) { this.images.subchapterOrnamentFile = v; }

	get illustrationFiles(): IllustrationImageItem[] { return this.images.illustrationFiles; }
	set illustrationFiles(v: IllustrationImageItem[]) { this.images.illustrationFiles = v; }

	getImageMimeType(fileName?: string): string {
		return this.images.getImageMimeType(fileName);
	}

	handleIllustrationFiles(filesInput: FileList | File[] | File | null): Promise<void> {
		return this.images.handleIllustrationFiles(filesInput);
	}

	removeIllustrationFile(idx: number): void {
		this.images.removeIllustrationFile(idx);
	}

	clearIllustrationFiles(): void {
		this.images.clearIllustrationFiles();
	}

	handleChapterOrnamentFile(file: File | null): void {
		this.images.handleChapterOrnamentFile(file);
	}

	removeChapterOrnamentFile(): void {
		this.images.removeChapterOrnamentFile();
	}

	handleSubchapterOrnamentFile(file: File | null): void {
		this.images.handleSubchapterOrnamentFile(file);
	}

	removeSubchapterOrnamentFile(): void {
		this.images.removeSubchapterOrnamentFile();
	}

	adjustCoverCrop(side: 'top' | 'bottom' | 'left' | 'right', value: number): void {
		this.images.adjustCoverCrop(side, value);
	}

	resetCoverCrop(): void {
		this.images.resetCoverCrop();
	}

	async handleCoverFile(file: File | null): Promise<void> {
		await this.images.handleCoverFile(file);
		if (this.images.coverStatus) {
			this.status = this.images.coverStatus;
			this.isError = this.images.coverIsError;
		}
	}

	removeCoverFile(): void {
		this.images.removeCoverFile();
	}

	getOptimizedCoverBlob(): Promise<CoverBlobItem | null> {
		return this.images.getOptimizedCoverBlob();
	}

	// Source delegates
	get epubFileSelected(): File | null { return this.source.epubFileSelected; }
	set epubFileSelected(v: File | null) { this.source.epubFileSelected = v; }

	get epubRawFiles(): Array<{ path: string; baseName: string; rawText: string }> { return this.source.epubRawFiles; }
	set epubRawFiles(v: Array<{ path: string; baseName: string; rawText: string }>) { this.source.epubRawFiles = v; }

	get epubChapters(): EpubChapterItem[] { return this.source.epubChapters; }
	set epubChapters(v: EpubChapterItem[]) { this.source.epubChapters = v; }

	get fileType(): 'zip' | 'txt' { return this.source.fileType; }
	set fileType(v: 'zip' | 'txt') { this.source.fileType = v; }

	get rawTxtText(): string { return this.source.rawTxtText; }
	set rawTxtText(v: string) { this.source.rawTxtText = v; }

	get customDefinitions(): CustomDefinition[] { return this.source.customDefinitions; }
	set customDefinitions(v: CustomDefinition[]) { this.source.customDefinitions = v; }

	get ignoreMarkdownFormat(): boolean { return this.source.ignoreMarkdownFormat; }
	set ignoreMarkdownFormat(v: boolean) { this.source.ignoreMarkdownFormat = v; }

	get txtH1Delim(): string { return this.source.txtH1Delim; }
	set txtH1Delim(v: string) { this.source.txtH1Delim = v; }

	get txtH2Delim(): string { return this.source.txtH2Delim; }
	set txtH2Delim(v: string) { this.source.txtH2Delim = v; }

	get txtEmDelim(): string { return this.source.txtEmDelim; }
	set txtEmDelim(v: string) { this.source.txtEmDelim = v; }

	get txtStrongDelim(): string { return this.source.txtStrongDelim; }
	set txtStrongDelim(v: string) { this.source.txtStrongDelim = v; }

	get txtBreakDelim(): string { return this.source.txtBreakDelim; }
	set txtBreakDelim(v: string) { this.source.txtBreakDelim = v; }

	get mergePattern(): string { return this.source.mergePattern; }
	set mergePattern(v: string) { this.source.mergePattern = v; }

	get heuristicMode(): boolean { return this.source.heuristicMode; }
	set heuristicMode(v: boolean) { this.source.heuristicMode = v; }

	get heuristicStart(): string | number | null { return this.source.heuristicStart; }
	set heuristicStart(v: string | number | null) { this.source.heuristicStart = v; }

	get heuristicEnd(): string | number | null { return this.source.heuristicEnd; }
	set heuristicEnd(v: string | number | null) { this.source.heuristicEnd = v; }

	get cleanKeywords(): string { return this.source.cleanKeywords; }
	set cleanKeywords(v: string) { this.source.cleanKeywords = v; }

	get heuristicThreshold(): number { return this.source.heuristicThreshold; }
	set heuristicThreshold(v: number) { this.source.heuristicThreshold = v; }

	get activeTab(): string { return this.source.activeTab; }
	set activeTab(v: string) { this.source.activeTab = v; }

	get cleanedLinesReport(): CleanedLinesReportItem[] { return this.source.cleanedLinesReport; }
	set cleanedLinesReport(v: CleanedLinesReportItem[]) { this.source.cleanedLinesReport = v; }

	get visibleCleanedCount(): number { return this.source.visibleCleanedCount; }
	set visibleCleanedCount(v: number) { this.source.visibleCleanedCount = v; }

	get cleanLineLimit(): number { return this.source.cleanLineLimit; }
	set cleanLineLimit(v: number) { this.source.cleanLineLimit = v; }

	get parseStatus(): string { return this.source.parseStatus; }
	set parseStatus(v: string) { this.source.parseStatus = v; }

	get parseIsError(): boolean { return this.source.parseIsError; }
	set parseIsError(v: boolean) { this.source.parseIsError = v; }

	addCustomDefinition(): void {
		this.source.addCustomDefinition();
	}

	removeCustomDefinition(idx: number): void {
		this.source.removeCustomDefinition(idx);
	}

	applyGrouping(): void {
		this.source.applyGrouping();
	}

	applyTxtGrouping(): void {
		this.source.applyTxtGrouping();
	}

	async handleFile(file: File | null): Promise<void> {
		this.epubBlob = null;
		await this.source.handleFile(file);
	}

	loadZipContent(file: File): Promise<void> {
		return this.source.loadZipContent(file);
	}

	async processEpub(): Promise<void> {
		Logger.debug('[EpubState]', `processEpub invoked, chapters count: ${this.source.epubChapters.length}, fileType: ${this.source.fileType}`);
		if (this.source.epubChapters.length === 0) {
			Logger.warn('[EpubState]', 'processEpub aborted: epubChapters is empty');
			this.status = 'Không có chương nào để đóng gói. Vui lòng chọn tệp hợp lệ.';
			this.isError = true;
			return;
		}
		this.processing = true;
		this.status = 'Đang đóng gói EPUB…';
		this.isError = false;

		try {
			// Extract and optimize cover if uploaded
			let coverBlob: CoverBlobItem | null = null;
			if (this.images.coverOriginalUrl) {
				this.status = 'Đang tối ưu hóa ảnh bìa...';
				coverBlob = await this.images.getOptimizedCoverBlob();
			}

			const metadata = {
				title: this.metadata.title.trim() || 'Không tên',
				author: this.metadata.author.trim() || 'Khuyết danh',
				language: this.metadata.lang.trim() || 'vi',
				publisher: this.metadata.publisher.trim()
			};
			const isTxtMode = this.source.fileType === 'txt';
			const jacket: EpubJacketConfig = {
				enabled: true,
				templateId: this.jacket.jacketTemplateId,
				title: this.metadata.title.trim() || 'Không tên',
				author: this.metadata.author.trim() || 'Khuyết danh',
				originalTitle: this.jacket.originalTitle.trim(),
				publisher: this.metadata.publisher.trim(),
				distributor: this.jacket.distributor.trim(),
				translator: this.jacket.translator.trim()
			};
			const fontBlobs: Record<string, Blob> = {};
			const neededFonts: string[] = [];
			if (this.fonts.jacketFont !== 'default' && !neededFonts.includes(this.fonts.jacketFont)) {
				neededFonts.push(this.fonts.jacketFont);
			}
			if (this.fonts.h1Font !== 'default' && !neededFonts.includes(this.fonts.h1Font)) {
				neededFonts.push(this.fonts.h1Font);
			}
			if (this.fonts.h2Font !== 'default' && !neededFonts.includes(this.fonts.h2Font)) {
				neededFonts.push(this.fonts.h2Font);
			}
			if (this.fonts.dropcapFont !== 'default' && !neededFonts.includes(this.fonts.dropcapFont)) {
				neededFonts.push(this.fonts.dropcapFont);
			}
			// Always embed Bookerly font if available
			if (findFont('Bookerly') && !neededFonts.includes('Bookerly')) {
				neededFonts.push('Bookerly');
			}

			for (const fontName of neededFonts) {
				const font = findFont(fontName);
				if (font && font.url) {
					this.status = `Đang tải phông chữ ${font.name}...`;
					const res = await fetch(font.url);
					if (!res.ok) {
						throw new Error(`Không thể tải tệp phông chữ cho ${font.name}`);
					}
					const fontBlob = await res.blob();
					fontBlobs[fontName] = fontBlob;
				}
			}

			const fontsConfig: EpubFontsConfig = {
				jacketFont: this.fonts.jacketFont,
				h1Font: this.fonts.h1Font,
				h2Font: this.fonts.h2Font,
				dropcapFont: this.fonts.dropcapFont,
				blobs: fontBlobs
			};

			const ornamentsConfig: OrnamentsConfig = {};
			if (this.images.chapterOrnamentFile) {
				const ext = this.images.chapterOrnamentFile.name.split('.').pop()?.toLowerCase() || 'png';
				ornamentsConfig.chapterOrnament = {
					blob: this.images.chapterOrnamentFile,
					fileName: `pre-chap.${ext}`,
					mimeType: this.images.chapterOrnamentFile.type || 'image/png'
				};
			}
			if (this.images.subchapterOrnamentFile) {
				const ext = this.images.subchapterOrnamentFile.name.split('.').pop()?.toLowerCase() || 'png';
				ornamentsConfig.subchapterOrnament = {
					blob: this.images.subchapterOrnamentFile,
					fileName: `pre-small-chap.${ext}`,
					mimeType: this.images.subchapterOrnamentFile.type || 'image/png'
				};
			}

			Logger.debug('[EpubState]', 'Calling buildEpubBlob');
			this.status = 'Đang đóng gói cấu trúc EPUB...';
			const blob = await buildEpubBlob(
				metadata,
				this.source.epubChapters,
				EPUB_CSS,
				isTxtMode,
				jacket,
				coverBlob,
				fontsConfig,
				ornamentsConfig,
				this.images.illustrationFiles
			);
			Logger.info('[EpubState]', 'buildEpubBlob returned blob successfully');
			this.epubBlob = blob;
			this.status = `Hoàn tất — ${this.source.epubChapters.length} chương đã được đóng gói thành công! Vui lòng nhấn nút 'Tải tệp .EPUB' để tải về.`;
		} catch (err: unknown) {
			const errorMsg = err instanceof Error ? err.message : String(err);
			Logger.error('[EpubState]', 'ERROR in processEpub', err);
			this.status = 'Có lỗi khi đóng gói: ' + errorMsg;
			this.isError = true;
		} finally {
			this.processing = false;
			Logger.debug('[EpubState]', 'processEpub finished, status:', this.status);
		}
	}
}
