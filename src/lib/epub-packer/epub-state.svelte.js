import { cleanHeaderFooterOcr, parseMarkdownBlocks, groupChapters, getCleanedLinesReport, assignSequentialChapterIds, parseTxtToChapters } from './epub-parser.js';
import { buildEpubBlob, EPUB_CSS } from './epub-packer.js';
import { slugify, ensureEpubExt } from '$lib/helpers/helpers.js';
import JSZip from 'jszip';

export class EpubState {
	epubFileSelected = $state(null);
	epubRawFiles = $state([]);
	epubChapters = $state([]);
		epubBlob = $state(null);
	
	fileType = $state('zip'); // 'zip' | 'txt'
	rawTxtText = $state('');
	customDefinitions = $state([]);

	txtH1Delim = $state('##');
	txtH2Delim = $state('#');
	txtEmDelim = $state('*');
	txtStrongDelim = $state('**');
	txtBreakDelim = $state('•••');

	mergePattern = $state('');
	heuristicMode = $state(false);
	heuristicStart = $state(null);
	heuristicEnd = $state(null);
	cleanKeywords = $state('{no}, {roman_no}');
	heuristicThreshold = $state(5);
	activeTab = $state('toc');
	cleanedLinesReport = $state([]);
	visibleCleanedCount = $state(20);
	cleanLineLimit = $state(2);

	status = $state('');
	isError = $state(false);
	parseStatus = $state('');
	parseIsError = $state(false);
	processing = $state(false);

	title = $state('');
	author = $state('');
	lang = $state('vi');
	publisher = $state('');
	epubOutName = $state('');
	
	jacketTemplateId = $state(1);
	originalTitle = $state('');
	distributor = $state('');

	epubOutNamePreview = $derived(ensureEpubExt(this.epubOutName.trim() || 'ten-sach'));

	addCustomDefinition() {
		this.customDefinitions.push({ pattern: '', tag: '' });
	}

	removeCustomDefinition(idx) {
		this.customDefinitions.splice(idx, 1);
		this.applyTxtGrouping();
	}

	applyGrouping() {
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

		const startPage = parseInt(this.heuristicStart, 10) || 1;
		const endPage = parseInt(this.heuristicEnd, 10) || processedFiles.length;

		const grouped = groupChapters(
			processedFiles,
			this.mergePattern,
			this.heuristicMode,
			startPage,
			endPage,
			this.heuristicThreshold
		);
		this.epubChapters = assignSequentialChapterIds(grouped);
		this.cleanedLinesReport = getCleanedLinesReport(this.epubRawFiles, this.cleanKeywords, this.cleanLineLimit);

		const mergedCount = this.epubRawFiles.length - grouped.length;
		this.parseStatus = mergedCount > 0
			? `Có ${this.epubRawFiles.length} tệp Markdown, gộp thành ${grouped.length} chương.`
			: `Tìm thấy ${grouped.length} chương — kiểm tra thứ tự & tiêu đề bên trên trước khi đóng gói.`;
		this.parseIsError = false;
	}

	applyTxtGrouping() {
		console.log('[EpubState] applyTxtGrouping called. rawTxtText length:', this.rawTxtText?.length);
		if (!this.rawTxtText) return;
		
		const fallbackTitle = this.title.trim() || 'Chương 1';
		const chapters = parseTxtToChapters(this.rawTxtText, { customDefinitions: this.customDefinitions }, fallbackTitle);
		this.epubChapters = assignSequentialChapterIds(chapters);

		// Resolve footnote backlinks
		const footnoteMap = {};
		for (const chap of this.epubChapters) {
			if (chap.fileName !== 'notes') {
				const matches = chap.html.matchAll(/id="fnref(\d+)"/g);
				for (const match of matches) {
					footnoteMap[match[1]] = chap.fileName;
				}
			}
		}

		// Replace placeholders in notes chapter
		const notesChap = this.epubChapters.find(c => c.fileName === 'notes');
		if (notesChap) {
			notesChap.html = notesChap.html.replace(/__FNREF_SRC_(\d+)__/g, (match, n) => {
				return footnoteMap[n] || 'chap_01';
			});
		}

		this.cleanedLinesReport = [];
		this.parseStatus = `Đã xử lý tệp .TXT thành công — Tìm thấy ${this.epubChapters.length} chương. Nhấn "Đóng gói tệp EPUB" để xuất file.`;
		this.parseIsError = false;
		console.log('[EpubState] applyTxtGrouping completed. Chapters count:', this.epubChapters.length);
	}

	async handleFile(file) {
		console.log('[EpubState] handleFile selected file:', file?.name, 'size:', file?.size, 'type:', file?.type);
		if (!file) return;
		
		const isZip = /\.zip$/i.test(file.name);
		const isTxt = /\.txt$/i.test(file.name);

		if (!isZip && !isTxt) {
			console.warn('[EpubState] Invalid file type selected:', file.name);
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
		this.visibleCleanedCount = 20;

		if (isTxt) {
			this.fileType = 'txt';
			this.parseStatus = 'Đang đọc tệp văn bản .TXT...';
			const base = slugify(file.name.replace(/\.txt$/i, ''));
			this.epubOutName = base;
			this.title = base.replace(/-/g, ' ');
			try {
				console.log('[EpubState] Reading file.text()...');
				const text = await file.text();
				console.log('[EpubState] File text read successfully. Character count:', text.length);
				this.rawTxtText = text.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
				this.applyTxtGrouping();
			} catch (err) {
				console.error('[EpubState] Error reading TXT file:', err);
				this.parseStatus = 'Lỗi khi đọc tệp .TXT: ' + err.message;
				this.parseIsError = true;
			}
		} else {
			this.fileType = 'zip';
			this.parseStatus = 'Đang đọc các chương Markdown trong tệp .ZIP...';
			const base = slugify(file.name.replace(/\.zip$/i, ''));
			this.epubOutName = base;
			this.title = base.replace(/-/g, ' ');
			this.loadZipContent(file);
		}
	}

	async loadZipContent(file) {
		console.log('[EpubState] loadZipContent starting for:', file.name);
		try {
			const zip = await JSZip.loadAsync(file);
			const files = [];
			const mdFiles = Object.keys(zip.files).filter(name => name.endsWith('.md') && !zip.files[name].dir);
			
			mdFiles.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

			for (const name of mdFiles) {
				const text = await zip.files[name].async('string');
				const baseName = name.replace(/\.md$/i, '').split('/').pop();
				files.push({
					path: name,
					baseName,
					rawText: text
				});
			}

			if (files.length === 0) {
				console.warn('[EpubState] No .md files found in zip.');
				this.parseStatus = 'Không tìm thấy tệp .md nào trong tệp .ZIP.';
				this.parseIsError = true;
				return;
			}

			this.epubRawFiles = files;
			this.applyGrouping();
		} catch (err) {
			console.error('[EpubState] Error loading ZIP:', err);
			this.parseStatus = 'Lỗi khi đọc tệp .ZIP: ' + err.message;
			this.parseIsError = true;
		}
	}

	async processEpub() {
		console.log('[EpubState] processEpub invoked. epubChapters.length:', this.epubChapters.length, 'fileType:', this.fileType);
		if (this.epubChapters.length === 0) {
			console.warn('[EpubState] processEpub aborted: epubChapters is empty.');
			this.status = 'Không có chương nào để đóng gói. Vui lòng chọn tệp hợp lệ.';
			this.isError = true;
			return;
		}
		this.processing = true;
		this.status = 'Đang đóng gói EPUB…';
		this.isError = false;

		try {
			const metadata = {
				title: this.title.trim() || 'Không tên',
				author: this.author.trim() || 'Khuyết danh',
				language: this.lang.trim() || 'vi',
				publisher: this.publisher.trim()
			};
			const isTxtMode = this.fileType === 'txt';
			const jacket = {
				enabled: true,
				templateId: this.jacketTemplateId,
				title: this.title.trim() || 'Không tên',
				author: this.author.trim() || 'Khuyết danh',
				originalTitle: this.originalTitle.trim(),
				publisher: this.publisher.trim(),
				distributor: this.distributor.trim()
			};
			console.log('[EpubState] Calling buildEpubBlob with metadata:', metadata, 'isTxtMode:', isTxtMode, 'jacket:', jacket);
			const blob = await buildEpubBlob(metadata, this.epubChapters, EPUB_CSS, isTxtMode, jacket);
			console.log('[EpubState] buildEpubBlob returned blob successfully:', blob);
			this.epubBlob = blob;
			this.status = `Hoàn tất — ${this.epubChapters.length} chương đã được đóng gói thành công! Vui lòng nhấn nút 'Tải tệp .EPUB' để tải về.`;
		} catch (err) {
			console.error('[EpubState] ERROR in processEpub:', err);
			this.status = 'Có lỗi khi đóng gói: ' + err.message;
			this.isError = true;
		} finally {
			this.processing = false;
			console.log('[EpubState] processEpub finished. Status:', this.status, 'processing:', this.processing);
		}
	}



}

