// src/lib/epub-packer/epub-state.svelte.ts
import { buildEpubBlob, EPUB_CSS } from './epub-packer';
import type {
	EpubFontsConfig,
	EpubJacketConfig,
	CoverBlobItem,
	OrnamentsConfig,
	EpubChapterItem,
	IllustrationImageItem
} from '$lib/types';
import {
	Logger,
	cleanTitleFromFileName,
	extractMetadataFromTxt,
	hasVietnameseDiacritics
} from '$lib/utils';
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
	packGeneration = 0;
	packAbortController: AbortController | null = null;
	activePackagingPromise: Promise<void> | null = null;
	isLockingPack = false;

	constructor() {
		this.metadata = new EpubMetadataState();
		this.jacket = new EpubJacketState();
		this.fonts = new EpubFontsState();
		this.images = new EpubImagesState();
		this.source = new EpubSourceState({
			getTitle: () => this.metadata.title,
			onFileLoaded: (baseName: string, originalFileName?: string) => {
				this.packGeneration++;
				if (this.packAbortController) {
					this.packAbortController.abort();
					this.packAbortController = null;
				}
				if (this.processing) {
					this.processing = false;
					this.status = 'Đã hủy đóng gói do nguồn sách thay đổi.';
					this.isError = false;
				}
				this.metadata.epubOutName = baseName;
				this.metadata.title = cleanTitleFromFileName(originalFileName || baseName);
				this.metadata.author = '';
				this.metadata.publisher = '';
				this.jacket.translator = '';
				this.epubBlob = null;
			},
			onTxtParsed: (rawText: string) => {
				const detected = extractMetadataFromTxt(rawText);
				if (
					detected.title &&
					(!hasVietnameseDiacritics(this.metadata.title) || this.metadata.title === 'Không tên')
				) {
					this.metadata.title = detected.title;
				}
				if (detected.author) {
					this.metadata.author = detected.author;
				}
				if (detected.translator) {
					this.jacket.translator = detected.translator;
				}
				if (detected.publisher) {
					this.metadata.publisher = detected.publisher;
				}
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
		Logger.debug(
			'[EpubState]',
			`processEpub invoked, chapters count: ${this.source.epubChapters.length}, fileType: ${this.source.fileType}`
		);

		// Ngăn chặn re-entrancy / race condition khi người dùng spam click hoặc có nhiều lệnh gọi cùng lúc
		if (this.processing || this.isLockingPack) {
			Logger.warn(
				'[EpubState]',
				'processEpub ignored: packaging is already in progress or acquiring lock'
			);
			return;
		}

		this.isLockingPack = true;
		let packTask: Promise<void> | undefined;

		try {
			// Nếu có tác vụ đóng gói cũ vẫn đang chạy ngầm, chờ nó dừng/giải phóng tài nguyên trước khi bắt đầu đợt mới
			if (this.activePackagingPromise) {
				this.status = 'Đang chờ tác vụ đóng gói trước giải phóng tài nguyên...';
				try {
					await this.activePackagingPromise;
				} catch {
					// Ignored
				}
			}

			if (this.source.epubChapters.length === 0) {
				Logger.warn('[EpubState]', 'processEpub aborted: epubChapters is empty');
				this.status = 'Không có chương nào để đóng gói. Vui lòng chọn file hợp lệ.';
				this.isError = true;
				return;
			}

			const currentGen = ++this.packGeneration;
			const ac = new AbortController();
			this.packAbortController = ac;
			this.processing = true;
			this.status = 'Đang đóng gói EPUB…';
			this.isError = false;

			// 1. Snapshot toàn bộ dữ liệu nguồn và cấu hình ngay tại thời điểm bấm đóng gói (kể cả ảnh bìa & crop)
			const coverSnapshot = {
				coverOriginalUrl: this.images.coverOriginalUrl,
				coverCropTop: this.images.coverCropTop,
				coverCropBottom: this.images.coverCropBottom,
				coverCropLeft: this.images.coverCropLeft,
				coverCropRight: this.images.coverCropRight
			};

			const chaptersSnapshot: EpubChapterItem[] = this.source.epubChapters.map((c) => ({ ...c }));
			const metadataSnapshot = {
				title: this.metadata.title.trim() || 'Không tên',
				author: this.metadata.author.trim() || 'Khuyết danh',
				language: this.metadata.lang.trim() || 'vi',
				publisher: this.metadata.publisher.trim()
			};
			const isTxtMode = this.source.fileType === 'txt';
			const jacketSnapshot: EpubJacketConfig = {
				enabled: true,
				templateId: this.jacket.jacketTemplateId,
				title: metadataSnapshot.title,
				author: metadataSnapshot.author,
				originalTitle: this.jacket.originalTitle.trim(),
				publisher: metadataSnapshot.publisher,
				distributor: this.jacket.distributor.trim(),
				translator: this.jacket.translator.trim()
			};
			const fontsSnapshot = {
				jacketFont: this.fonts.jacketFont,
				h1Font: this.fonts.h1Font,
				h2Font: this.fonts.h2Font,
				h2SubFont: this.fonts.h2SubFont,
				dropcapFont: this.fonts.dropcapFont,
				quoteFont: this.fonts.quoteFont,
				quoteAuthorFont: this.fonts.quoteAuthorFont
			};
			const illustrationsSnapshot: IllustrationImageItem[] = this.images.illustrationFiles.map(
				(img) => ({
					...img
				})
			);

			const ornamentsConfigSnapshot: OrnamentsConfig = {};
			if (this.images.chapterOrnamentBlob || this.images.chapterOrnamentFile) {
				const blob = this.images.chapterOrnamentBlob || this.images.chapterOrnamentFile!;
				ornamentsConfigSnapshot.chapterOrnament = {
					blob,
					fileName: 'pre-chap.png',
					mimeType: 'image/png'
				};
			}
			if (this.images.subchapterOrnamentBlob || this.images.subchapterOrnamentFile) {
				const blob = this.images.subchapterOrnamentBlob || this.images.subchapterOrnamentFile!;
				ornamentsConfigSnapshot.subchapterOrnament = {
					blob,
					fileName: 'pre-small-chap.png',
					mimeType: 'image/png'
				};
			}

			packTask = (async () => {
				try {
					// Extract and optimize cover using snapshot
					let coverBlob: CoverBlobItem | null = null;
					if (coverSnapshot.coverOriginalUrl) {
						this.status = 'Đang tối ưu hóa ảnh bìa...';
						coverBlob = await this.images.getOptimizedCoverBlob(coverSnapshot);
						if (this.packGeneration !== currentGen || ac.signal.aborted) {
							Logger.debug(
								'[EpubState]',
								'processEpub aborted: superseded after cover optimization'
							);
							return;
						}
					}

					const fontBlobs: Record<string, Blob> = {};
					const neededFonts: string[] = [];
					if (
						fontsSnapshot.jacketFont !== 'default' &&
						!neededFonts.includes(fontsSnapshot.jacketFont)
					) {
						neededFonts.push(fontsSnapshot.jacketFont);
					}
					if (fontsSnapshot.h1Font !== 'default' && !neededFonts.includes(fontsSnapshot.h1Font)) {
						neededFonts.push(fontsSnapshot.h1Font);
					}
					if (fontsSnapshot.h2Font !== 'default' && !neededFonts.includes(fontsSnapshot.h2Font)) {
						neededFonts.push(fontsSnapshot.h2Font);
					}
					if (
						fontsSnapshot.h2SubFont !== 'default' &&
						!neededFonts.includes(fontsSnapshot.h2SubFont)
					) {
						neededFonts.push(fontsSnapshot.h2SubFont);
					}
					if (
						fontsSnapshot.dropcapFont !== 'default' &&
						!neededFonts.includes(fontsSnapshot.dropcapFont)
					) {
						neededFonts.push(fontsSnapshot.dropcapFont);
					}
					if (
						fontsSnapshot.quoteFont !== 'default' &&
						!neededFonts.includes(fontsSnapshot.quoteFont)
					) {
						neededFonts.push(fontsSnapshot.quoteFont);
					}
					if (
						fontsSnapshot.quoteAuthorFont !== 'default' &&
						!neededFonts.includes(fontsSnapshot.quoteAuthorFont)
					) {
						neededFonts.push(fontsSnapshot.quoteAuthorFont);
					}
					// Always embed Bookerly font if available
					if (findFont('Bookerly') && !neededFonts.includes('Bookerly')) {
						neededFonts.push('Bookerly');
					}

					for (const fontName of neededFonts) {
						if (this.packGeneration !== currentGen || ac.signal.aborted) {
							Logger.debug('[EpubState]', 'processEpub aborted: superseded during font fetching');
							return;
						}
						const font = findFont(fontName);
						if (font && font.url) {
							this.status = `Đang tải phông chữ ${font.name}...`;
							const res = await fetch(font.url, { signal: ac.signal });
							if (this.packGeneration !== currentGen || ac.signal.aborted) return;
							if (!res.ok) {
								throw new Error(`Không thể tải file phông chữ cho ${font.name}`);
							}
							const fontBlob = await res.blob();
							if (this.packGeneration !== currentGen || ac.signal.aborted) return;
							fontBlobs[fontName] = fontBlob;
						}
					}

					if (this.packGeneration !== currentGen || ac.signal.aborted) return;

					const fontsConfig: EpubFontsConfig = {
						...fontsSnapshot,
						blobs: fontBlobs
					};

					Logger.debug('[EpubState]', 'Calling buildEpubBlob with immutable snapshot');
					this.status = 'Đang đóng gói cấu trúc EPUB...';
					const blob = await buildEpubBlob(
						metadataSnapshot,
						chaptersSnapshot,
						EPUB_CSS,
						isTxtMode,
						jacketSnapshot,
						coverBlob,
						fontsConfig,
						ornamentsConfigSnapshot,
						illustrationsSnapshot,
						ac.signal
					);

					if (this.packGeneration !== currentGen || ac.signal.aborted) {
						Logger.debug('[EpubState]', 'processEpub aborted: superseded after buildEpubBlob');
						return;
					}

					Logger.info('[EpubState]', 'buildEpubBlob returned blob successfully');
					this.epubBlob = blob;
					this.status = `Hoàn tất — ${chaptersSnapshot.length} chương đã được đóng gói thành công! Vui lòng nhấn nút 'Tải file .EPUB' để tải về.`;
				} catch (err: unknown) {
					if (ac.signal.aborted || this.packGeneration !== currentGen) return;
					const errorMsg = err instanceof Error ? err.message : String(err);
					Logger.error('[EpubState]', 'ERROR in processEpub', err);
					this.status = 'Có lỗi khi đóng gói: ' + errorMsg;
					this.isError = true;
				} finally {
					if (this.packGeneration === currentGen) {
						this.processing = false;
					}
					if (this.packAbortController === ac) {
						this.packAbortController = null;
					}
					Logger.debug('[EpubState]', 'processEpub finished, status:', this.status);
				}
			})();

			this.activePackagingPromise = packTask;
		} finally {
			this.isLockingPack = false;
		}

		if (packTask) {
			await packTask;
			if (this.activePackagingPromise === packTask) {
				this.activePackagingPromise = null;
			}
		}
	}
}
