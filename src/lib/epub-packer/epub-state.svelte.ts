// src/lib/epub-packer/epub-state.svelte.ts
import { buildEpubBlob, EPUB_CSS } from './epub-packer';
import type {
	EpubFontsConfig,
	EpubJacketConfig,
	CoverBlobItem,
	OrnamentsConfig
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
