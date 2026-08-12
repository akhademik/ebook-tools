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
	translator = $state(''); // Translator field

	// Cover Image States
	coverFile = $state(null);
	coverOriginalUrl = $state(null);
	coverWidth = $state(0);
	coverHeight = $state(0);
	coverCropTop = $state(0);
	coverCropBottom = $state(0);
	coverCropLeft = $state(0);
	coverCropRight = $state(0);

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

	// Cover Image Crop logic
	adjustCoverCrop(side, value) {
		if (side === 'top') this.coverCropTop = Math.max(0, this.coverCropTop + value);
		if (side === 'bottom') this.coverCropBottom = Math.max(0, this.coverCropBottom + value);
		if (side === 'left') this.coverCropLeft = Math.max(0, this.coverCropLeft + value);
		if (side === 'right') this.coverCropRight = Math.max(0, this.coverCropRight + value);
	}

	resetCoverCrop() {
		this.coverCropTop = 0;
		this.coverCropBottom = 0;
		this.coverCropLeft = 0;
		this.coverCropRight = 0;
	}

	async handleCoverFile(file) {
		if (!file) return;
		this.coverFile = file;
		this.resetCoverCrop();
		
		const isPdf = /\.pdf$/i.test(file.name);
		if (isPdf) {
			if (!window.pdfjsLib) {
				console.error('[EpubState] pdfjsLib is missing');
				this.status = 'Không thể tải ảnh bìa từ PDF do thiếu thư viện PDF.js';
				this.isError = true;
				return;
			}
			try {
				this.status = 'Đang trích xuất trang bìa từ tệp PDF...';
				const arrayBuffer = await file.arrayBuffer();
				const doc = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
				const page = await doc.getPage(1);
				// Cover page render (scale 2.0 is good for high quality)
				const viewport = page.getViewport({ scale: 2.0 });
				const canvas = document.createElement('canvas');
				canvas.width = viewport.width;
				canvas.height = viewport.height;
				const ctx = canvas.getContext('2d');
				await page.render({ canvasContext: ctx, viewport }).promise;
				this.coverOriginalUrl = canvas.toDataURL('image/jpeg', 0.9);
				this.coverWidth = canvas.width;
				this.coverHeight = canvas.height;
				page.cleanup();
				doc.destroy();
				this.status = '';
				this.isError = false;
			} catch (err) {
				console.error('[EpubState] Error extracting PDF page 1:', err);
				this.status = 'Lỗi trích xuất PDF: ' + err.message;
				this.isError = true;
			}
		} else {
			// Read standard image file
			const reader = new FileReader();
			reader.onload = (e) => {
				const img = new Image();
				img.onload = () => {
					this.coverOriginalUrl = e.target.result;
					this.coverWidth = img.naturalWidth;
					this.coverHeight = img.naturalHeight;
				};
				img.src = e.target.result;
			};
			reader.readAsDataURL(file);
		}
	}

	removeCoverFile() {
		this.coverFile = null;
		this.coverOriginalUrl = null;
		this.coverWidth = 0;
		this.coverHeight = 0;
		this.resetCoverCrop();
	}

	async getOptimizedCoverBlob() {
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
				ctx.drawImage(
					img,
					safeLeft, safeTop, croppedW, croppedH,
					0, 0, canvas.width, canvas.height
				);
				canvas.toBlob((blob) => {
					resolve(blob);
				}, 'image/jpeg', 0.82); // Good compression quality
			};
			img.onerror = (err) => reject(new Error('Lỗi tải ảnh bìa: ' + err.message));
			img.src = this.coverOriginalUrl;
		});
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
			// Extract and optimize cover if uploaded
			let coverBlob = null;
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
			const jacket = {
				enabled: true,
				templateId: this.jacketTemplateId,
				title: this.title.trim() || 'Không tên',
				author: this.author.trim() || 'Khuyết danh',
				originalTitle: this.originalTitle.trim(),
				publisher: this.publisher.trim(),
				distributor: this.distributor.trim(),
				translator: this.translator.trim() // Pass translator to jacket
			};
			console.log('[EpubState] Calling buildEpubBlob with metadata:', metadata, 'isTxtMode:', isTxtMode, 'jacket:', jacket, 'hasCover:', !!coverBlob);
			this.status = 'Đang đóng gói cấu trúc EPUB...';
			const blob = await buildEpubBlob(metadata, this.epubChapters, EPUB_CSS, isTxtMode, jacket, coverBlob);
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
