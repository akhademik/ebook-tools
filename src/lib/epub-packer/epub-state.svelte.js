import { cleanHeaderFooterOcr, parseMarkdownBlocks, groupChapters, getCleanedLinesReport, assignSequentialChapterIds } from './epub-parser.js';
import { buildEpubBlob, EPUB_CSS } from './epub-packer.js';
import { slugify, ensureEpubExt } from '$lib/helpers/helpers.js';
import JSZip from 'jszip';

export class EpubState {
	epubFileSelected = $state(null);
	epubRawFiles = $state([]);
	epubChapters = $state([]);
	epubBlob = $state(null);
	
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

	epubOutNamePreview = $derived(ensureEpubExt(this.epubOutName.trim() || 'ten-sach'));

	applyGrouping() {
		if (this.epubRawFiles.length === 0) return;
		
		const keywords = (this.cleanKeywords || '')
			.split(',')
			.map(s => s.trim())
			.filter(Boolean);
		
		const titleVal = this.title.trim();
		const authorVal = this.author.trim();
		if (titleVal) keywords.push(titleVal);
		if (authorVal) keywords.push(authorVal);

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

	handleFile(file) {
		if (!file) return;
		if (!/\.zip$/i.test(file.name)) {
			this.parseStatus = 'Vui lòng chọn một tệp .ZIP hợp lệ.';
			this.parseIsError = true;
			return;
		}
		this.parseStatus = 'Đang đọc các chương Markdown...';
		this.parseIsError = false;
		this.epubFileSelected = file;
		this.epubOutName = slugify(file.name);
		this.title = slugify(file.name).replace(/-/g, ' ');
		this.epubBlob = null;
		this.epubChapters = [];
		this.epubRawFiles = [];
		this.visibleCleanedCount = 20;

		this.loadZipContent(file);
	}

	async loadZipContent(file) {
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
				this.parseStatus = 'Không tìm thấy tệp .md nào trong tệp .ZIP.';
				this.parseIsError = true;
				return;
			}

			this.epubRawFiles = files;
			this.applyGrouping();
		} catch (err) {
			console.error(err);
			this.parseStatus = 'Lỗi khi đọc tệp .ZIP: ' + err.message;
			this.parseIsError = true;
		}
	}

	async processEpub() {
		if (this.epubChapters.length === 0) return;
		this.processing = true;
		this.epubBlob = null;
		this.status = 'Đang đóng gói EPUB…';
		this.isError = false;

		try {
			const metadata = {
				title: this.title.trim(),
				author: this.author.trim(),
				language: this.lang.trim() || 'vi',
				publisher: this.publisher.trim()
			};
			this.epubBlob = await buildEpubBlob(metadata, this.epubChapters, EPUB_CSS);
			this.status = `Hoàn tất — ${this.epubChapters.length} chương đã sẵn sàng.`;
		} catch (err) {
			console.error(err);
			this.status = 'Có lỗi khi đóng gói: ' + err.message;
			this.isError = true;
		} finally {
			this.processing = false;
		}
	}
}
