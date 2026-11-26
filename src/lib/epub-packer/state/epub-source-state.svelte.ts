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
	parseTxtToChaptersAsync
} from '../parser/epub-source-parser';
import { slugify, Logger, getZipEntryUncompressedSize } from '$lib/utils';
import {
	MAX_TXT_FILE_SIZE,
	MAX_ZIP_FILE_SIZE,
	MAX_ZIP_TOTAL_ENTRIES,
	MAX_ZIP_MARKDOWN_FILES,
	MAX_ZIP_SINGLE_MD_SIZE,
	MAX_ZIP_TOTAL_UNCOMPRESSED_SIZE
} from '$lib/constants';

export interface EpubSourceStateDependencies {
	getTitle: () => string;
	onFileLoaded?: (baseName: string, originalFileName?: string) => void;
	onTxtParsed?: (rawText: string) => void;
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
	parseWarnings = $state<string[]>([]);

	deps: EpubSourceStateDependencies;
	fileLoadGeneration = 0;
	private parseAbortController: AbortController | null = null;

	cancelParseTask(): void {
		if (this.parseAbortController) {
			this.parseAbortController.abort();
			this.parseAbortController = null;
			this.parseStatus = 'Đang hủy đọc file...';
		}
	}

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
			.map((s) => s.trim())
			.filter(Boolean);

		const processedFiles = this.epubRawFiles.map((f) => {
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
		this.cleanedLinesReport = getCleanedLinesReport(
			this.epubRawFiles,
			this.cleanKeywords,
			this.cleanLineLimit
		);

		const mergedCount = this.epubRawFiles.length - grouped.length;
		this.parseStatus =
			mergedCount > 0
				? `Có ${this.epubRawFiles.length} file Markdown, gộp thành ${grouped.length} chương.`
				: `Tìm thấy ${grouped.length} chương — kiểm tra thứ tự & tiêu đề bên trên trước khi đóng gói.`;
		this.parseIsError = false;
	}

	async applyTxtGrouping(): Promise<void> {
		Logger.debug(
			'[EpubSourceState]',
			'applyTxtGrouping called, rawTxtText length:',
			this.rawTxtText?.length
		);
		if (!this.rawTxtText) return;

		this.cancelParseTask();
		const ac = new AbortController();
		this.parseAbortController = ac;

		const fallbackTitle = this.deps.getTitle().trim() || 'Chương 1';
		const illustrations = this.deps.getIllustrationFiles ? this.deps.getIllustrationFiles() : [];
		const imagesMap: Record<string, { fileName?: string }> = {};
		for (const img of illustrations) {
			if (img.name) imagesMap[img.name.toLowerCase()] = img;
			if (img.fileName) imagesMap[img.fileName.toLowerCase()] = img;
		}

		const warnings: string[] = [];
		const parseGen = this.fileLoadGeneration;
		try {
			const chapters = await parseTxtToChaptersAsync(
				this.rawTxtText,
				{
					customDefinitions: this.customDefinitions,
					images: imagesMap,
					warnings,
					signal: ac.signal
				},
				fallbackTitle
			);
			if (this.fileLoadGeneration !== parseGen) {
				Logger.debug('[EpubSourceState]', 'applyTxtGrouping superseded by newer file load');
				return;
			}
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
			const notesChap = this.epubChapters.find((c) => c.fileName === 'notes');
			if (notesChap && notesChap.html) {
				notesChap.html = notesChap.html.replace(/__FNREF_SRC_(\d+)__/g, (_match, n) => {
					return footnoteMap[n] || 'chap_01';
				});
			}

			this.cleanedLinesReport = [];
			this.parseWarnings = warnings;
			this.parseStatus = `Đã xử lý file .TXT thành công (${this.epubChapters.length} chương).`;
			this.parseIsError = false;
			Logger.info(
				'[EpubSourceState]',
				'applyTxtGrouping completed, chapters count:',
				this.epubChapters.length
			);
		} catch (err: unknown) {
			if (this.fileLoadGeneration !== parseGen) return;
			if (err instanceof DOMException && err.name === 'AbortError') {
				this.parseStatus = 'Đã hủy xử lý file TXT.';
				return;
			}
			const errorMsg = err instanceof Error ? err.message : String(err);
			Logger.error('[EpubSourceState]', 'Lỗi khi xử lý file TXT:', err);
			this.epubChapters = [];
			this.parseWarnings = [];
			this.parseStatus = errorMsg;
			this.parseIsError = true;
		} finally {
			if (this.parseAbortController === ac) {
				this.parseAbortController = null;
			}
		}
	}

	async handleFile(file: File | null): Promise<void> {
		Logger.debug(
			'[EpubSourceState]',
			`handleFile selected file: ${file?.name}, size: ${file?.size}, type: ${file?.type}`
		);
		if (!file) return;

		this.cancelParseTask();
		const currentGen = ++this.fileLoadGeneration;

		const isZip = /\.zip$/i.test(file.name);
		const isTxt = /\.txt$/i.test(file.name);

		if (!isZip && !isTxt) {
			Logger.warn('[EpubSourceState]', 'Invalid file type selected', file.name);
			this.parseStatus = 'Vui lòng chọn một file .ZIP hoặc .TXT hợp lệ.';
			this.parseIsError = true;
			this.parseWarnings = [];
			return;
		}

		if (isTxt && file.size > MAX_TXT_FILE_SIZE) {
			this.parseStatus = 'Dung lượng file .TXT vượt quá giới hạn cho phép (tối đa 50MB).';
			this.parseIsError = true;
			this.parseWarnings = [];
			return;
		}

		if (isZip && file.size > MAX_ZIP_FILE_SIZE) {
			this.parseStatus = 'Dung lượng file .ZIP vượt quá giới hạn cho phép (tối đa 250MB).';
			this.parseIsError = true;
			this.parseWarnings = [];
			return;
		}

		this.parseIsError = false;
		this.parseWarnings = [];
		this.epubFileSelected = file;
		this.epubChapters = [];
		this.epubRawFiles = [];
		this.rawTxtText = '';
		this.customDefinitions = [];
		this.ignoreMarkdownFormat = false;
		this.visibleCleanedCount = 20;

		if (isTxt) {
			this.fileType = 'txt';
			this.parseStatus = 'Đang đọc file văn bản .TXT...';
			const base = slugify(file.name.replace(/\.txt$/i, ''));
			this.deps.onFileLoaded?.(base, file.name);
			try {
				Logger.debug('[EpubSourceState]', 'Reading file.text()...');
				const text = await file.text();
				if (this.fileLoadGeneration !== currentGen) {
					Logger.debug('[EpubSourceState]', 'Aborting TXT load: superseded by newer file load');
					return;
				}
				Logger.debug(
					'[EpubSourceState]',
					'File text read successfully, character count:',
					text.length
				);
				this.rawTxtText = text
					.replace(/^\uFEFF/, '')
					.replace(/\r\n/g, '\n')
					.normalize('NFC');
				this.deps.onTxtParsed?.(this.rawTxtText);
				if (this.fileLoadGeneration !== currentGen) return;
				await this.applyTxtGrouping();
			} catch (err: unknown) {
				if (this.fileLoadGeneration !== currentGen) return;
				const errorMsg = err instanceof Error ? err.message : String(err);
				Logger.error('[EpubSourceState]', 'Error reading TXT file', err);
				this.parseStatus = 'Lỗi khi đọc file .TXT: ' + errorMsg;
				this.parseIsError = true;
			}
		} else {
			this.fileType = 'zip';
			this.parseStatus = 'Đang đọc các chương Markdown trong file .ZIP...';
			const base = slugify(file.name.replace(/\.zip$/i, ''));
			this.deps.onFileLoaded?.(base, file.name);
			await this.loadZipContent(file, currentGen);
		}
	}

	async loadZipContent(file: File, currentGen?: number): Promise<void> {
		const gen = currentGen ?? this.fileLoadGeneration;
		Logger.debug('[EpubSourceState]', `loadZipContent starting for: ${file.name}, gen: ${gen}`);
		try {
			const zip = await JSZip.loadAsync(file);
			if (this.fileLoadGeneration !== gen) {
				Logger.debug('[EpubSourceState]', 'Aborting ZIP load: superseded after JSZip.loadAsync');
				return;
			}

			const allZipEntries = Object.keys(zip.files);
			if (allZipEntries.length > MAX_ZIP_TOTAL_ENTRIES) {
				Logger.warn(
					'[EpubSourceState]',
					`Too many total entries in zip: ${allZipEntries.length} (max ${MAX_ZIP_TOTAL_ENTRIES})`
				);
				this.parseStatus = `File .ZIP chứa quá nhiều tệp hoặc thư mục (${allZipEntries.length} mục, tối đa cho phép ${MAX_ZIP_TOTAL_ENTRIES} mục).`;
				this.parseIsError = true;
				return;
			}

			const mdFiles = allZipEntries.filter((name) => name.endsWith('.md') && !zip.files[name].dir);

			if (mdFiles.length === 0) {
				Logger.warn('[EpubSourceState]', 'No .md files found in zip');
				this.parseStatus = 'Không tìm thấy file .md nào trong file .ZIP.';
				this.parseIsError = true;
				return;
			}

			if (mdFiles.length > MAX_ZIP_MARKDOWN_FILES) {
				Logger.warn('[EpubSourceState]', `Too many markdown files in zip: ${mdFiles.length}`);
				this.parseStatus = `File .ZIP chứa quá nhiều file Markdown (${mdFiles.length} file, tối đa cho phép ${MAX_ZIP_MARKDOWN_FILES} file).`;
				this.parseIsError = true;
				return;
			}

			mdFiles.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

			const files: Array<{ path: string; baseName: string; rawText: string }> = [];
			let totalUncompressedBytes = 0;

			for (const name of mdFiles) {
				if (this.fileLoadGeneration !== gen) {
					Logger.debug('[EpubSourceState]', 'Aborting ZIP extraction loop: superseded');
					return;
				}

				const baseName = name.replace(/\.md$/i, '').split('/').pop() || name;

				// Kiểm tra kích thước giải nén TRƯỚC KHI cấp phát bộ nhớ chuỗi nếu có metadata
				const preUncompressedSize = getZipEntryUncompressedSize(zip.files[name]);

				if (preUncompressedSize !== null) {
					if (preUncompressedSize > MAX_ZIP_SINGLE_MD_SIZE) {
						this.parseStatus = `File Markdown "${baseName}" có kích thước vượt quá giới hạn (${Math.round(preUncompressedSize / (1024 * 1024))}MB, tối đa 15MB/file).`;
						this.parseIsError = true;
						return;
					}
					if (totalUncompressedBytes + preUncompressedSize > MAX_ZIP_TOTAL_UNCOMPRESSED_SIZE) {
						this.parseStatus = `Tổng dung lượng văn bản giải nén từ file .ZIP vượt quá giới hạn an toàn (tối đa 60MB).`;
						this.parseIsError = true;
						return;
					}
				}

				const text = await zip.files[name].async('string');
				if (this.fileLoadGeneration !== gen) return;

				// Đếm kích thước byte thực tế thay vì chỉ đếm UTF-16 code units
				const actualByteLength =
					typeof TextEncoder !== 'undefined' ? new TextEncoder().encode(text).length : text.length;

				const entryBytes =
					preUncompressedSize !== null
						? Math.max(actualByteLength, preUncompressedSize)
						: actualByteLength;

				if (entryBytes > MAX_ZIP_SINGLE_MD_SIZE) {
					this.parseStatus = `File Markdown "${baseName}" có kích thước vượt quá giới hạn (${Math.round(entryBytes / (1024 * 1024))}MB, tối đa 15MB/file).`;
					this.parseIsError = true;
					return;
				}

				totalUncompressedBytes += entryBytes;
				if (totalUncompressedBytes > MAX_ZIP_TOTAL_UNCOMPRESSED_SIZE) {
					this.parseStatus = `Tổng dung lượng văn bản giải nén từ file .ZIP vượt quá giới hạn an toàn (tối đa 60MB).`;
					this.parseIsError = true;
					return;
				}

				files.push({
					path: name,
					baseName,
					rawText: text
				});
			}

			if (this.fileLoadGeneration !== gen) return;

			this.epubRawFiles = files;
			this.applyGrouping();
		} catch (err: unknown) {
			if (this.fileLoadGeneration !== gen) return;
			const errorMsg = err instanceof Error ? err.message : String(err);
			Logger.error('[EpubSourceState]', 'Error loading ZIP', err);
			this.parseStatus = 'Lỗi khi đọc file .ZIP: ' + errorMsg;
			this.parseIsError = true;
		}
	}
}
