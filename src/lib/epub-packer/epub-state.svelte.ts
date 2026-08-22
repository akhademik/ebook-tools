// src/lib/epub-packer/epub-state.svelte.ts
import {
	cleanHeaderFooterOcr,
	parseMarkdownBlocks,
	groupChapters,
	getCleanedLinesReport,
	assignSequentialChapterIds,
	parseTxtToChapters,
	type CleanedLinesReportItem,
	type CustomDefinition
} from './parser/epub-parser.js';
import {
	buildEpubBlob,
	EPUB_CSS,
	type EpubFontsConfig,
	type EpubJacketConfig,
	type CoverBlobItem
} from './epub-packer.js';
import type {
	EpubChapterItem,
	OrnamentsConfig,
	IllustrationImageItem
} from './xml-builders/opf-builder.js';
import { slugify, ensureEpubExt } from '$lib/helpers/helpers.js';
import { Logger } from '$lib/helpers/logger.js';
import JSZip from 'jszip';

import { findFont } from './templates/fonts.js';

export class EpubState {
	epubFileSelected = $state<File | null>(null);
	epubRawFiles = $state<Array<{ path: string; baseName: string; rawText: string }>>([]);
	epubChapters = $state<EpubChapterItem[]>([]);
	epubBlob = $state<Blob | null>(null);
	
	fileType = $state<'zip' | 'txt'>('zip');
	rawTxtText = $state<string>('');
	customDefinitions = $state<CustomDefinition[]>([]);
	ignoreMarkdownFormat = $state<boolean>(false);

	txtH1Delim = $state<string>('##');
	txtH2Delim = $state<string>('#');
	txtEmDelim = $state<string>('*');
	txtStrongDelim = $state<string>('**');
	txtBreakDelim = $state<string>('•••');

	mergePattern = $state<string>('');
	heuristicMode = $state<boolean>(false);
	heuristicStart = $state<string | number | null>(null);
	heuristicEnd = $state<string | number | null>(null);
	cleanKeywords = $state<string>('{no}, {roman_no}');
	heuristicThreshold = $state<number>(5);
	activeTab = $state<string>('toc');
	cleanedLinesReport = $state<CleanedLinesReportItem[]>([]);
	visibleCleanedCount = $state<number>(20);
	cleanLineLimit = $state<number>(2);

	status = $state<string>('');
	isError = $state<boolean>(false);
	parseStatus = $state<string>('');
	parseIsError = $state<boolean>(false);
	processing = $state<boolean>(false);

	title = $state<string>('');
	author = $state<string>('');
	lang = $state<string>('vi');
	publisher = $state<string>('');
	epubOutName = $state<string>('');
	
	jacketTemplateId = $state<number>(1);
	originalTitle = $state<string>('');
	distributor = $state<string>('');
	translator = $state<string>('');

	jacketFont = $state<string>('default'); 
	h1Font = $state<string>('default');     
	h2Font = $state<string>('default');     
	dropcapFont = $state<string>('default');

	// Cover Image States
	coverFile = $state<File | null>(null);
	coverOriginalUrl = $state<string | null>(null);
	coverWidth = $state<number>(0);
	coverHeight = $state<number>(0);
	coverCropTop = $state<number>(0);
	coverCropBottom = $state<number>(0);
	coverCropLeft = $state<number>(0);
	coverCropRight = $state<number>(0);

	// Ornament States
	chapterOrnamentFile = $state<File | null>(null);
	subchapterOrnamentFile = $state<File | null>(null);

	// Illustration Images States
	illustrationFiles = $state<IllustrationImageItem[]>([]);

	getImageMimeType(fileName?: string): string {
		const ext = (fileName || '').split('.').pop()?.toLowerCase();
		switch (ext) {
			case 'png': return 'image/png';
			case 'webp': return 'image/webp';
			case 'gif': return 'image/gif';
			case 'svg': return 'image/svg+xml';
			case 'jpg':
			case 'jpeg':
			default:
				return 'image/jpeg';
		}
	}

	async handleIllustrationFiles(filesInput: FileList | File[] | File | null): Promise<void> {
		if (!filesInput) return;
		const filesList: File[] = filesInput instanceof FileList || Array.isArray(filesInput) 
			? Array.from(filesInput) 
			: [filesInput];

		for (const file of filesList) {
			if (/\.zip$/i.test(file.name)) {
				try {
					const zip = await JSZip.loadAsync(file);
					for (const name of Object.keys(zip.files)) {
						if (!zip.files[name].dir && /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(name)) {
							const blob = await zip.files[name].async('blob');
							const fileName = name.split('/').pop() || name;
							const baseName = fileName.replace(/\.[^.]+$/, '');
							const mimeType = this.getImageMimeType(fileName);
							
							const existingIdx = this.illustrationFiles.findIndex(f => f.fileName.toLowerCase() === fileName.toLowerCase() || (f.name && f.name.toLowerCase() === baseName.toLowerCase()));
							const item: IllustrationImageItem = { name: baseName, fileName, mimeType, blob, size: blob.size };
							if (existingIdx !== -1) {
								this.illustrationFiles[existingIdx] = item;
							} else {
								this.illustrationFiles.push(item);
							}
						}
					}
				} catch (err) {
					Logger.error('[EpubState]', 'Error extracting images zip', err);
				}
			} else if (/\.(jpg|jpeg|png|webp|gif|svg)$/i.test(file.name)) {
				const fileName = file.name;
				const baseName = fileName.replace(/\.[^.]+$/, '');
				const mimeType = file.type || this.getImageMimeType(fileName);

				const existingIdx = this.illustrationFiles.findIndex(f => f.fileName.toLowerCase() === fileName.toLowerCase() || (f.name && f.name.toLowerCase() === baseName.toLowerCase()));
				const item: IllustrationImageItem = { name: baseName, fileName, mimeType, blob: file, size: file.size };
				if (existingIdx !== -1) {
					this.illustrationFiles[existingIdx] = item;
				} else {
					this.illustrationFiles.push(item);
				}
			}
		}

		if (this.fileType === 'txt' && this.rawTxtText) {
			this.applyTxtGrouping();
		}
	}

	removeIllustrationFile(idx: number): void {
		this.illustrationFiles.splice(idx, 1);
		if (this.fileType === 'txt' && this.rawTxtText) {
			this.applyTxtGrouping();
		}
	}

	clearIllustrationFiles(): void {
		this.illustrationFiles = [];
		if (this.fileType === 'txt' && this.rawTxtText) {
			this.applyTxtGrouping();
		}
	}

	handleChapterOrnamentFile(file: File | null): void {
		if (!file) return;
		this.chapterOrnamentFile = file;
	}

	removeChapterOrnamentFile(): void {
		this.chapterOrnamentFile = null;
	}

	handleSubchapterOrnamentFile(file: File | null): void {
		if (!file) return;
		this.subchapterOrnamentFile = file;
	}

	removeSubchapterOrnamentFile(): void {
		this.subchapterOrnamentFile = null;
	}

	epubOutNamePreview = $derived(ensureEpubExt(this.epubOutName.trim() || 'ten-sach'));

	addCustomDefinition(): void {
		this.customDefinitions.push({ pattern: '', tag: '' });
	}

	removeCustomDefinition(idx: number): void {
		this.customDefinitions.splice(idx, 1);
		this.applyTxtGrouping();
	}

	applyGrouping(): void {
		if (this.fileType === 'txt') {
			this.applyTxtGrouping();
			return;
		}

		if (this.epubRawFiles.length === 0) return;
		
		const keywords = (this.cleanKeywords || '')
			.split(',')
			.map(s => s.trim())
			.filter(Boolean);
		
		const processedFiles = this.epubRawFiles.map(f => {
			const cleanedMd = cleanHeaderFooterOcr(f.rawText, keywords, this.cleanLineLimit);
			return {
				path: f.path,
				baseName: f.baseName,
				blocks: parseMarkdownBlocks(cleanedMd)
			};
		});

		const startPage = parseInt(String(this.heuristicStart || '1'), 10) || 1;
		const endPage = parseInt(String(this.heuristicEnd || ''), 10) || processedFiles.length;

		const grouped = groupChapters(
			processedFiles,
			this.mergePattern,
			this.heuristicMode,
			startPage,
			endPage,
			this.heuristicThreshold,
			{ ignoreMarkdownFormat: this.ignoreMarkdownFormat }
		);
		this.epubChapters = assignSequentialChapterIds(grouped);
		this.cleanedLinesReport = getCleanedLinesReport(this.epubRawFiles, this.cleanKeywords, this.cleanLineLimit);

		const mergedCount = this.epubRawFiles.length - grouped.length;
		this.parseStatus = mergedCount > 0
			? `Có ${this.epubRawFiles.length} tệp Markdown, gộp thành ${grouped.length} chương.`
			: `Tìm thấy ${grouped.length} chương — kiểm tra thứ tự & tiêu đề bên trên trước khi đóng gói.`;
		this.parseIsError = false;
	}

	applyTxtGrouping(): void {
		Logger.debug('[EpubState]', 'applyTxtGrouping called, rawTxtText length:', this.rawTxtText?.length);
		if (!this.rawTxtText) return;
		
		const fallbackTitle = this.title.trim() || 'Chương 1';
		const imagesMap: Record<string, { fileName?: string }> = {};
		for (const img of this.illustrationFiles) {
			if (img.name) imagesMap[img.name.toLowerCase()] = img;
			if (img.fileName) imagesMap[img.fileName.toLowerCase()] = img;
		}

		const chapters = parseTxtToChapters(this.rawTxtText, {
			customDefinitions: this.customDefinitions,
			images: imagesMap
		}, fallbackTitle);
		this.epubChapters = assignSequentialChapterIds(chapters);

		// Resolve footnote backlinks
		const footnoteMap: Record<string, string> = {};
		for (const chap of this.epubChapters) {
			if (chap.fileName !== 'notes' && chap.html) {
				const matches = chap.html.matchAll(/id="fnref(\d+)"/g);
				for (const match of matches) {
					footnoteMap[match[1]] = chap.fileName;
				}
			}
		}

		// Replace placeholders in notes chapter
		const notesChap = this.epubChapters.find(c => c.fileName === 'notes');
		if (notesChap && notesChap.html) {
			notesChap.html = notesChap.html.replace(/__FNREF_SRC_(\d+)__/g, (_match, n) => {
				return footnoteMap[n] || 'chap_01';
			});
		}

		this.cleanedLinesReport = [];
		this.parseStatus = `Đã xử file .TXT thành công — Tìm thấy ${this.epubChapters.length} chương. Nhấn "Đóng gói EPUB" để xuất file.`;
		this.parseIsError = false;
		Logger.info('[EpubState]', 'applyTxtGrouping completed, chapters count:', this.epubChapters.length);
	}

	async handleFile(file: File | null): Promise<void> {
		Logger.debug('[EpubState]', `handleFile selected file: ${file?.name}, size: ${file?.size}, type: ${file?.type}`);
		if (!file) return;
		
		const isZip = /\.zip$/i.test(file.name);
		const isTxt = /\.txt$/i.test(file.name);

		if (!isZip && !isTxt) {
			Logger.warn('[EpubState]', 'Invalid file type selected', file.name);
			this.parseStatus = 'Vui lòng chọn một tệp .ZIP hoặc .TXT hợp lệ.';
			this.parseIsError = true;
			return;
		}

		this.parseIsError = false;
		this.epubFileSelected = file;
		this.epubBlob = null;
		this.epubChapters = [];
		this.epubRawFiles = [];
		this.rawTxtText = '';
		this.customDefinitions = [];
		this.ignoreMarkdownFormat = false;
		this.visibleCleanedCount = 20;

		if (isTxt) {
			this.fileType = 'txt';
			this.parseStatus = 'Đang đọc tệp văn bản .TXT...';
			const base = slugify(file.name.replace(/\.txt$/i, ''));
			this.epubOutName = base;
			this.title = base.replace(/-/g, ' ');
			try {
				Logger.debug('[EpubState]', 'Reading file.text()...');
				const text = await file.text();
				Logger.debug('[EpubState]', 'File text read successfully, character count:', text.length);
				this.rawTxtText = text.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
				this.applyTxtGrouping();
			} catch (err: unknown) {
				const errorMsg = err instanceof Error ? err.message : String(err);
				Logger.error('[EpubState]', 'Error reading TXT file', err);
				this.parseStatus = 'Lỗi khi đọc tệp .TXT: ' + errorMsg;
				this.parseIsError = true;
			}
		} else {
			this.fileType = 'zip';
			this.parseStatus = 'Đang đọc các chương Markdown trong tệp .ZIP...';
			const base = slugify(file.name.replace(/\.zip$/i, ''));
			this.epubOutName = base;
			this.title = base.replace(/-/g, ' ');
			await this.loadZipContent(file);
		}
	}

	async loadZipContent(file: File): Promise<void> {
		Logger.debug('[EpubState]', 'loadZipContent starting for:', file.name);
		try {
			const zip = await JSZip.loadAsync(file);
			const files: Array<{ path: string; baseName: string; rawText: string }> = [];
			const mdFiles = Object.keys(zip.files).filter(name => name.endsWith('.md') && !zip.files[name].dir);
			
			mdFiles.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

			for (const name of mdFiles) {
				const text = await zip.files[name].async('string');
				const baseName = name.replace(/\.md$/i, '').split('/').pop() || name;
				files.push({
					path: name,
					baseName,
					rawText: text
				});
			}

			if (files.length === 0) {
				Logger.warn('[EpubState]', 'No .md files found in zip');
				this.parseStatus = 'Không tìm thấy tệp .md nào trong tệp .ZIP.';
				this.parseIsError = true;
				return;
			}

			this.epubRawFiles = files;
			this.applyGrouping();
		} catch (err: unknown) {
			const errorMsg = err instanceof Error ? err.message : String(err);
			Logger.error('[EpubState]', 'Error loading ZIP', err);
			this.parseStatus = 'Lỗi khi đọc tệp .ZIP: ' + errorMsg;
			this.parseIsError = true;
		}
	}

	// Cover Image Crop logic
	adjustCoverCrop(side: 'top' | 'bottom' | 'left' | 'right', value: number): void {
		if (side === 'top') this.coverCropTop = Math.max(0, this.coverCropTop + value);
		if (side === 'bottom') this.coverCropBottom = Math.max(0, this.coverCropBottom + value);
		if (side === 'left') this.coverCropLeft = Math.max(0, this.coverCropLeft + value);
		if (side === 'right') this.coverCropRight = Math.max(0, this.coverCropRight + value);
	}

	resetCoverCrop(): void {
		this.coverCropTop = 0;
		this.coverCropBottom = 0;
		this.coverCropLeft = 0;
		this.coverCropRight = 0;
	}

	async handleCoverFile(file: File | null): Promise<void> {
		if (!file) return;
		this.coverFile = file;
		this.resetCoverCrop();
		
		const isPdf = /\.pdf$/i.test(file.name);
		if (isPdf) {
			const globalPdfjs = typeof window !== 'undefined' ? (window as unknown as { pdfjsLib?: any }).pdfjsLib : null;
			if (!globalPdfjs) {
				Logger.error('[EpubState]', 'pdfjsLib is missing');
				this.status = 'Không thể tải ảnh bìa từ PDF do thiếu thư viện PDF.js';
				this.isError = true;
				return;
			}
			try {
				this.status = 'Đang trích xuất trang bìa từ tệp PDF...';
				const arrayBuffer = await file.arrayBuffer();
				const doc = await globalPdfjs.getDocument({ data: arrayBuffer }).promise;
				const page = await doc.getPage(1);
				// Cover page render (scale 2.0 is good for high quality)
				const viewport = page.getViewport({ scale: 2.0 });
				const canvas = document.createElement('canvas');
				canvas.width = viewport.width;
				canvas.height = viewport.height;
				const ctx = canvas.getContext('2d');
				if (ctx) {
					await page.render({ canvasContext: ctx, viewport }).promise;
					this.coverOriginalUrl = canvas.toDataURL('image/jpeg', 0.9);
					this.coverWidth = canvas.width;
					this.coverHeight = canvas.height;
				}
				page.cleanup();
				doc.destroy();
				this.status = '';
				this.isError = false;
			} catch (err: unknown) {
				const errorMsg = err instanceof Error ? err.message : String(err);
				Logger.error('[EpubState]', 'Error extracting PDF page 1', err);
				this.status = 'Lỗi trích xuất PDF: ' + errorMsg;
				this.isError = true;
			}
		} else {
			// Read standard image file
			const reader = new FileReader();
			reader.onload = (e) => {
				const img = new Image();
				img.onload = () => {
					this.coverOriginalUrl = (e.target?.result as string) || null;
					this.coverWidth = img.naturalWidth;
					this.coverHeight = img.naturalHeight;
				};
				img.src = e.target?.result as string;
			};
			reader.readAsDataURL(file);
		}
	}

	removeCoverFile(): void {
		this.coverFile = null;
		this.coverOriginalUrl = null;
		this.coverWidth = 0;
		this.coverHeight = 0;
		this.resetCoverCrop();
	}

	async getOptimizedCoverBlob(): Promise<CoverBlobItem | null> {
		if (!this.coverOriginalUrl) return null;
		return new Promise((resolve, reject) => {
			const img = new Image();
			img.onload = () => {
				const w = img.naturalWidth;
				const h = img.naturalHeight;
				const safeTop = Math.max(0, Math.min(this.coverCropTop, h - 1));
				const safeBottom = Math.max(0, Math.min(this.coverCropBottom, h - 1 - safeTop));
				const safeLeft = Math.max(0, Math.min(this.coverCropLeft, w - 1));
				const safeRight = Math.max(0, Math.min(this.coverCropRight, w - 1 - safeLeft));
				
				const croppedW = w - safeLeft - safeRight;
				const croppedH = h - safeTop - safeBottom;
				
				const canvas = document.createElement('canvas');
				const maxDim = 1400; // Optimize dimensions
				let scale = 1.0;
				if (croppedW > maxDim || croppedH > maxDim) {
					scale = maxDim / Math.max(croppedW, croppedH);
				}
				canvas.width = Math.round(croppedW * scale);
				canvas.height = Math.round(croppedH * scale);
				
				const ctx = canvas.getContext('2d');
				if (ctx) {
					ctx.drawImage(
						img,
						safeLeft, safeTop, croppedW, croppedH,
						0, 0, canvas.width, canvas.height
					);
				}
				canvas.toBlob((blob) => {
					if (blob) {
						const coverBlob = blob as CoverBlobItem;
						coverBlob.width = canvas.width;
						coverBlob.height = canvas.height;
						resolve(coverBlob);
					} else {
						resolve(null);
					}
				}, 'image/jpeg', 0.82); // Good compression quality
			};
			img.onerror = (err) => reject(new Error('Lỗi tải ảnh bìa: ' + err));
			img.src = this.coverOriginalUrl!;
		});
	}

	async processEpub(): Promise<void> {
		Logger.debug('[EpubState]', `processEpub invoked, chapters count: ${this.epubChapters.length}, fileType: ${this.fileType}`);
		if (this.epubChapters.length === 0) {
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
			if (this.coverOriginalUrl) {
				this.status = 'Đang tối ưu hóa ảnh bìa...';
				coverBlob = await this.getOptimizedCoverBlob();
			}

			const metadata = {
				title: this.title.trim() || 'Không tên',
				author: this.author.trim() || 'Khuyết danh',
				language: this.lang.trim() || 'vi',
				publisher: this.publisher.trim()
			};
			const isTxtMode = this.fileType === 'txt';
			const jacket: EpubJacketConfig = {
				enabled: true,
				templateId: this.jacketTemplateId,
				title: this.title.trim() || 'Không tên',
				author: this.author.trim() || 'Khuyết danh',
				originalTitle: this.originalTitle.trim(),
				publisher: this.publisher.trim(),
				distributor: this.distributor.trim(),
				translator: this.translator.trim()
			};
			const fontBlobs: Record<string, Blob> = {};
			const neededFonts: string[] = [];
			if (this.jacketFont !== 'default' && !neededFonts.includes(this.jacketFont)) {
				neededFonts.push(this.jacketFont);
			}
			if (this.h1Font !== 'default' && !neededFonts.includes(this.h1Font)) {
				neededFonts.push(this.h1Font);
			}
			if (this.h2Font !== 'default' && !neededFonts.includes(this.h2Font)) {
				neededFonts.push(this.h2Font);
			}
			if (this.dropcapFont !== 'default' && !neededFonts.includes(this.dropcapFont)) {
				neededFonts.push(this.dropcapFont);
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
				jacketFont: this.jacketFont,
				h1Font: this.h1Font,
				h2Font: this.h2Font,
				dropcapFont: this.dropcapFont,
				blobs: fontBlobs
			};

			const ornamentsConfig: OrnamentsConfig = {};
			if (this.chapterOrnamentFile) {
				const ext = this.chapterOrnamentFile.name.split('.').pop()?.toLowerCase() || 'png';
				ornamentsConfig.chapterOrnament = {
					blob: this.chapterOrnamentFile,
					fileName: `pre-chap.${ext}`,
					mimeType: this.chapterOrnamentFile.type || 'image/png'
				};
			}
			if (this.subchapterOrnamentFile) {
				const ext = this.subchapterOrnamentFile.name.split('.').pop()?.toLowerCase() || 'png';
				ornamentsConfig.subchapterOrnament = {
					blob: this.subchapterOrnamentFile,
					fileName: `pre-small-chap.${ext}`,
					mimeType: this.subchapterOrnamentFile.type || 'image/png'
				};
			}

			Logger.debug('[EpubState]', 'Calling buildEpubBlob');
			this.status = 'Đang đóng gói cấu trúc EPUB...';
			const blob = await buildEpubBlob(metadata, this.epubChapters, EPUB_CSS, isTxtMode, jacket, coverBlob, fontsConfig, ornamentsConfig, this.illustrationFiles);
			Logger.info('[EpubState]', 'buildEpubBlob returned blob successfully');
			this.epubBlob = blob;
			this.status = `Hoàn tất — ${this.epubChapters.length} chương đã được đóng gói thành công! Vui lòng nhấn nút 'Tải tệp .EPUB' để tải về.`;
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
