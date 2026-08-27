// src/lib/epub-packer/state/epub-source-state.svelte.ts
import JSZip from 'jszip';
import type {
	EpubChapterItem,
	CleanedLinesReportItem,
	CustomDefinition,
	IllustrationImageItem
} from '$lib/types';
import {
	cleanHeaderFooterOcr,
	parseMarkdownBlocks,
	groupChapters,
	getCleanedLinesReport,
	assignSequentialChapterIds,
	parseTxtToChapters
} from '../parser/epub-source-parser';
import { slugify, Logger } from '$lib/utils';
import { MAX_TXT_FILE_SIZE, MAX_ZIP_FILE_SIZE } from '$lib/constants';

export interface EpubSourceStateDependencies {
	getTitle: () => string;
	onFileLoaded?: (baseName: string) => void;
	getIllustrationFiles?: () => IllustrationImageItem[];
}

export class EpubSourceState {
	epubFileSelected = $state<File | null>(null);
	epubRawFiles = $state<Array<{ path: string; baseName: string; rawText: string }>>([]);
	epubChapters = $state<EpubChapterItem[]>([]);

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

	parseStatus = $state<string>('');
	parseIsError = $state<boolean>(false);

	deps: EpubSourceStateDependencies;

	constructor(deps: EpubSourceStateDependencies) {
		this.deps = deps;
	}

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
		Logger.debug('[EpubSourceState]', 'applyTxtGrouping called, rawTxtText length:', this.rawTxtText?.length);
		if (!this.rawTxtText) return;

		const fallbackTitle = this.deps.getTitle().trim() || 'Chương 1';
		const illustrations = this.deps.getIllustrationFiles ? this.deps.getIllustrationFiles() : [];
		const imagesMap: Record<string, { fileName?: string }> = {};
		for (const img of illustrations) {
			if (img.name) imagesMap[img.name.toLowerCase()] = img;
			if (img.fileName) imagesMap[img.fileName.toLowerCase()] = img;
		}

		const warnings: string[] = [];
		const chapters = parseTxtToChapters(this.rawTxtText, {
			customDefinitions: this.customDefinitions,
			images: imagesMap,
			warnings
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
		if (warnings.length > 0) {
			this.parseStatus = `${warnings.join(' | ')} (Tìm thấy ${this.epubChapters.length} chương)`;
		} else {
			this.parseStatus = `Đã xử file .TXT thành công — Tìm thấy ${this.epubChapters.length} chương. Nhấn "Đóng gói EPUB" để xuất file.`;
		}
		this.parseIsError = false;
		Logger.info('[EpubSourceState]', 'applyTxtGrouping completed, chapters count:', this.epubChapters.length);
	}

	async handleFile(file: File | null): Promise<void> {
		Logger.debug('[EpubSourceState]', `handleFile selected file: ${file?.name}, size: ${file?.size}, type: ${file?.type}`);
		if (!file) return;

		const isZip = /\.zip$/i.test(file.name);
		const isTxt = /\.txt$/i.test(file.name);

		if (!isZip && !isTxt) {
			Logger.warn('[EpubSourceState]', 'Invalid file type selected', file.name);
			this.parseStatus = 'Vui lòng chọn một tệp .ZIP hoặc .TXT hợp lệ.';
			this.parseIsError = true;
			return;
		}

		if (isTxt && file.size > MAX_TXT_FILE_SIZE) {
			this.parseStatus = 'Dung lượng tệp .TXT vượt quá giới hạn cho phép (tối đa 50MB).';
			this.parseIsError = true;
			return;
		}

		if (isZip && file.size > MAX_ZIP_FILE_SIZE) {
			this.parseStatus = 'Dung lượng tệp .ZIP vượt quá giới hạn cho phép (tối đa 250MB).';
			this.parseIsError = true;
			return;
		}

		this.parseIsError = false;
		this.epubFileSelected = file;
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
			this.deps.onFileLoaded?.(base);
			try {
				Logger.debug('[EpubSourceState]', 'Reading file.text()...');
				const text = await file.text();
				Logger.debug('[EpubSourceState]', 'File text read successfully, character count:', text.length);
				this.rawTxtText = text.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
				this.applyTxtGrouping();
			} catch (err: unknown) {
				const errorMsg = err instanceof Error ? err.message : String(err);
				Logger.error('[EpubSourceState]', 'Error reading TXT file', err);
				this.parseStatus = 'Lỗi khi đọc tệp .TXT: ' + errorMsg;
				this.parseIsError = true;
			}
		} else {
			this.fileType = 'zip';
			this.parseStatus = 'Đang đọc các chương Markdown trong tệp .ZIP...';
			const base = slugify(file.name.replace(/\.zip$/i, ''));
			this.deps.onFileLoaded?.(base);
			await this.loadZipContent(file);
		}
	}

	async loadZipContent(file: File): Promise<void> {
		Logger.debug('[EpubSourceState]', 'loadZipContent starting for:', file.name);
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
				Logger.warn('[EpubSourceState]', 'No .md files found in zip');
				this.parseStatus = 'Không tìm thấy tệp .md nào trong tệp .ZIP.';
				this.parseIsError = true;
				return;
			}

			this.epubRawFiles = files;
			this.applyGrouping();
		} catch (err: unknown) {
			const errorMsg = err instanceof Error ? err.message : String(err);
			Logger.error('[EpubSourceState]', 'Error loading ZIP', err);
			this.parseStatus = 'Lỗi khi đọc tệp .ZIP: ' + errorMsg;
			this.parseIsError = true;
		}
	}
}
