// tests/epub-golden.test.ts
import { describe, it, expect, vi } from 'vitest';
import JSZip from 'jszip';

vi.mock('../src/lib/epub-packer/templates/css-template/base.css?raw', () => ({
	default: '/* base.css */'
}));
vi.mock('../src/lib/epub-packer/templates/css-template/center-page.css?raw', () => ({
	default:
		'/* center-page.css */ .center-page { display: table; } .center-page-content { display: table-cell; }'
}));
vi.mock('../src/lib/epub-packer/templates/css-template/headings.css?raw', () => ({
	default: '/* headings.css */ .main-chap { font-size: 1.5em; }'
}));
vi.mock('../src/lib/epub-packer/templates/css-template/quotes.css?raw', () => ({
	default: '/* quotes.css */ .letter { margin: 1em; }'
}));
vi.mock('../src/lib/epub-packer/templates/css-template/breaks.css?raw', () => ({
	default: '/* breaks.css */ .scene-break { text-align: center; }'
}));
vi.mock('../src/lib/epub-packer/templates/css-template/notes.css?raw', () => ({
	default: '/* notes.css */ .noteref { vertical-align: super; }'
}));

import { parseTxtToChapters } from '../src/lib/epub-packer/parser/txt-parser';
import { buildEpubBlob } from '../src/lib/epub-packer/epub-packer';

describe('EPUB Golden Snapshot / Roundtrip Tests', () => {
	it('should package a full markdown / text book and generate a compliant, valid EPUB archive structure', async () => {
		const rawBookText = `@@ Chương 1: Khởi đầu mới

Đây là đoạn mở đầu của câu chuyện. Một ngày đẹp trời tại Hà Nội.

[B] Đây là đoạn văn có dropcap chữ B thật to và đẹp mắt.

###

Đoạn văn sau dấu phân cách cảnh lớn (scene break big).

##

Đoạn văn sau dấu phân cách cảnh nhỏ (scene break small).

[letter]
Gửi người bạn phương xa,
Tôi viết thư này để chúc bạn bình an.
[/letter]

{1} Chú thích đầu tiên trong truyện.

@@ Chương 2: Hành trình tiếp diễn

Nội dung của chương hai tiếp tục mở ra nhiều điều thú vị.

Chú thích:
{1} Đây là nội dung chú thích được giải thích rõ ràng.
`;

		// 1. Parse text into structured chapters
		const chapters = parseTxtToChapters(rawBookText, {}, 'Chương Mặc Định');
		expect(chapters.length).toBeGreaterThanOrEqual(2);

		// 2. Build complete EPUB blob
		const metadata = {
			title: 'Tác Phẩm Mẫu',
			author: 'Nguyễn Văn A',
			language: 'vi',
			publisher: 'Nhà Xuất Bản Văn Học',
			identifier: 'urn:uuid:golden-test-uuid-12345'
		};

		const coverBlob = new Blob(['fake-cover-image'], { type: 'image/jpeg' });
		(coverBlob as any).width = 800;
		(coverBlob as any).height = 1200;

		const jacket = {
			enabled: true,
			templateId: 1,
			title: 'Tác Phẩm Mẫu',
			author: 'Nguyễn Văn A',
			originalTitle: 'The Sample Book',
			publisher: 'NXB Văn Học',
			distributor: 'Ebook Tools'
		};

		const blob = await buildEpubBlob(
			metadata,
			chapters,
			undefined, // use dynamic CSS
			false, // mergeBrokenParagraphs
			jacket,
			coverBlob
		);

		expect(blob).toBeDefined();
		expect(blob.type).toBe('application/epub+zip');

		// 3. Golden Assertion: Unzip the generated EPUB blob and verify all standard OEBPS files
		const arrayBuffer = await blob.arrayBuffer();
		const zip = await JSZip.loadAsync(arrayBuffer);

		// Assert root mimetype (must be uncompressed 'application/epub+zip')
		const mimetype = await zip.file('mimetype')?.async('text');
		expect(mimetype).toBe('application/epub+zip');

		// Assert META-INF/container.xml points to OEBPS/content.opf
		const containerXml = await zip.file('META-INF/container.xml')?.async('text');
		expect(containerXml).toBeDefined();
		expect(containerXml).toContain(
			'<rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>'
		);

		// Assert OEBPS/content.opf
		const contentOpf = await zip.file('OEBPS/content.opf')?.async('text');
		expect(contentOpf).toBeDefined();
		expect(contentOpf).toContain('<dc:title>Tác Phẩm Mẫu</dc:title>');
		expect(contentOpf).toContain('<dc:creator id="creator">Nguyễn Văn A</dc:creator>');
		expect(contentOpf).toContain('<dc:language>vi</dc:language>');
		expect(contentOpf).toContain('<dc:publisher>Nhà Xuất Bản Văn Học</dc:publisher>');
		expect(contentOpf).toContain('properties="cover-image"');
		expect(contentOpf).toContain('<item id="nav" href="nav.xhtml"');
		expect(contentOpf).toContain('<item id="ncx" href="toc.ncx"');
		expect(contentOpf).toContain('<item id="css" href="styles/style.css"');

		// Assert OEBPS/nav.xhtml (EPUB 3 Navigation)
		const navXhtml = await zip.file('OEBPS/nav.xhtml')?.async('text');
		expect(navXhtml).toBeDefined();
		expect(navXhtml).toContain('<nav epub:type="toc" id="toc">');
		expect(navXhtml).toContain('Chương 1: Khởi đầu mới');
		expect(navXhtml).toContain('Chương 2: Hành trình tiếp diễn');

		// Assert OEBPS/toc.ncx (EPUB 2 NCX compatibility)
		const tocNcx = await zip.file('OEBPS/toc.ncx')?.async('text');
		expect(tocNcx).toBeDefined();
		expect(tocNcx).toContain('<docTitle><text>Tác Phẩm Mẫu</text></docTitle>');
		expect(tocNcx).toContain('<navPoint');

		// Assert OEBPS/styles/style.css generated dynamically
		const styleCss = await zip.file('OEBPS/styles/style.css')?.async('text');
		expect(styleCss).toBeDefined();
		expect(styleCss).toContain('.main-chap');
		expect(styleCss).toContain('.letter');
		expect(styleCss).toContain('.scene-break');

		// Assert Cover & Jacket text pages exist
		const coverXhtml = await zip.file('OEBPS/text/cover.xhtml')?.async('text');
		expect(coverXhtml).toBeDefined();
		expect(coverXhtml).toContain('<svg');
		expect(coverXhtml).toContain('href="../images/cover.jpg"');

		const jacketXhtml = await zip.file('OEBPS/text/jacket.xhtml')?.async('text');
		expect(jacketXhtml).toBeDefined();
		expect(jacketXhtml).toContain('Tác Phẩm Mẫu');

		// Assert chapter xhtml files exist
		const chap1Xhtml = await zip.file('OEBPS/text/chap_01.xhtml')?.async('text');
		expect(chap1Xhtml).toBeDefined();
		expect(chap1Xhtml).toContain('<h1');
		expect(chap1Xhtml).toContain('Chương 1: Khởi đầu mới');
		expect(chap1Xhtml).toContain('class="dropcap"');
		expect(chap1Xhtml).toContain('class="scene-break-big"');
		expect(chap1Xhtml).toContain('class="letter"');

		// Assert cover image binary in images folder
		const coverImg = await zip.file('OEBPS/images/cover.jpg')?.async('uint8array');
		expect(coverImg).toBeDefined();
		expect(coverImg?.length).toBeGreaterThan(0);
	});

	it('should properly stitch broken paragraphs across merged markdown files in a zip upload', async () => {
		const { parseMarkdownBlocks } =
			await import('../src/lib/epub-packer/parser/epub-markdown-utils');
		const { groupChaptersZip } = await import('../src/lib/epub-packer/parser/epub-zip-grouper');
		const { assignSequentialChapterIds } =
			await import('../src/lib/epub-packer/parser/epub-chapter-utils');

		// 1. Create a dummy zip simulating the user scenario
		const zip = new JSZip();
		const page1 = `# Chương 1\n\n“Một nhà cách mạng”, Robert nói. “Hy vọng ông ta không gây rắc rối nào nơi đây.” Ông gõ ống tẩu vào thành đê rồi bỏ vào túi. “Tốt hơn cả là chúng ta nên vào lại, em yêu ạ”, ông nói. “Charles chắc chắn sẽ có bài diễn văn lê thê, anh cần một ly rượu lớn để chịu đựng được`;
		const page2 = `nó.” Ông lắc đầu. “Ba mươi năm hôn nhân. Em nghĩ người nào trong số họ xứng đáng nhận huy chương hơn?”\n\nMột đoạn văn tiếp theo bình thường.`;

		zip.file('001_page1.md', page1);
		zip.file('002_page2.md', page2);

		const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });

		// 2. Read back zip entries like EpubSourceState
		const loadedZip = await JSZip.loadAsync(zipBuffer);
		const rawFiles: Array<{ path: string; baseName: string; rawText: string }> = [];
		const mdFiles = Object.keys(loadedZip.files).filter(
			(name) => name.endsWith('.md') && !loadedZip.files[name].dir
		);
		mdFiles.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

		for (const name of mdFiles) {
			const text = await loadedZip.files[name].async('string');
			const baseName = name.replace(/\.md$/i, '').split('/').pop() || name;
			rawFiles.push({ path: name, baseName, rawText: text });
		}

		// 3. Parse blocks
		const processedFiles = rawFiles.map((f) => ({
			path: f.path,
			baseName: f.baseName,
			blocks: parseMarkdownBlocks(f.rawText)
		}));

		// 4. Group chapters using heuristic
		const grouped = groupChaptersZip(processedFiles, '', true, 1, 2, 5);
		expect(grouped.length).toBe(1);

		// 5. Assign sequential chapter IDs
		const chapters = assignSequentialChapterIds(grouped);
		expect(chapters.length).toBe(1);

		// Verify that broken paragraph was joined into one
		expect(chapters[0].html).toContain('chịu đựng được nó.” Ông lắc đầu.');
		expect(chapters[0].html).not.toMatch(/chịu đựng được<\/p>\s*<p>nó\./);

		// 6. Build EPUB Blob and inspect output zip
		const epubBlob = await buildEpubBlob(
			{ title: 'Tác phẩm Test', author: 'Author' },
			chapters,
			'',
			false // preserveParagraphs = false for zip mode
		);

		const epubArrayBuffer = await epubBlob.arrayBuffer();
		const resultZip = await JSZip.loadAsync(epubArrayBuffer);
		const chapterXhtml = await resultZip.file('OEBPS/text/chap_01.xhtml')?.async('text');

		expect(chapterXhtml).toBeDefined();
		expect(chapterXhtml).toContain('chịu đựng được nó.” Ông lắc đầu.');
		expect(chapterXhtml).not.toMatch(/chịu đựng được<\/p>\s*<p>nó\./);
	});

	it('should properly process the actual nha-muon-canh-cua-da-fix.zip and merge broken paragraphs across chapters', async () => {
		const fs = await import('fs');
		const path = await import('path');
		const zipPath = path.resolve('nha-muon-canh-cua-da-fix.zip');
		if (!fs.existsSync(zipPath)) return;

		const { parseMarkdownBlocks } =
			await import('../src/lib/epub-packer/parser/epub-markdown-utils');
		const { groupChaptersZip } = await import('../src/lib/epub-packer/parser/epub-zip-grouper');
		const { assignSequentialChapterIds } =
			await import('../src/lib/epub-packer/parser/epub-chapter-utils');
		const { cleanHeaderFooterOcr } = await import('../src/lib/epub-packer/parser/epub-ocr-utils');

		const zipBuffer = fs.readFileSync(zipPath);
		const loadedZip = await JSZip.loadAsync(zipBuffer);
		const rawFiles: Array<{ path: string; baseName: string; rawText: string }> = [];
		const mdFiles = Object.keys(loadedZip.files).filter(
			(name) => name.endsWith('.md') && !loadedZip.files[name].dir
		);
		mdFiles.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

		for (const name of mdFiles) {
			const text = await loadedZip.files[name].async('string');
			const baseName = name.replace(/\.md$/i, '').split('/').pop() || name;
			rawFiles.push({ path: name, baseName, rawText: text });
		}

		const processedFiles = rawFiles.map((f) => {
			const cleaned = cleanHeaderFooterOcr(f.rawText, [], 2);
			return {
				path: f.path,
				baseName: f.baseName,
				blocks: parseMarkdownBlocks(cleaned)
			};
		});

		// Heuristic grouping on entire book
		const grouped = groupChaptersZip(processedFiles, '', true, 1, processedFiles.length, 5);
		const chapters = assignSequentialChapterIds(grouped);

		const quoteChapter = chapters.find((c) => c.html && c.html.includes('Một nhà cách mạng'));
		expect(quoteChapter).toBeDefined();
		expect(quoteChapter?.html).toContain('chịu đựng được nó.” Ông lắc đầu.');
		expect(quoteChapter?.html).not.toMatch(/chịu đựng được<\/p>\s*<p>nó\./);
	});

	it('should process comprehensive-syntax.txt fixture into EPUB, package correctly, and verify all expected outputs', async () => {
		const fs = await import('fs');
		const path = await import('path');
		const { validateEpub } = await import('../src/lib/epub-editor/epub-validator');

		const fixturePath = path.resolve('tests/fixtures/comprehensive-syntax.txt');
		expect(fs.existsSync(fixturePath)).toBe(true);

		const rawFixtureText = fs.readFileSync(fixturePath, 'utf-8');
		const dummyImageBlob = new Blob([new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10])], {
			type: 'image/jpeg'
		});
		const illustrations = [
			{ id: 'img-hinh-1', fileName: 'hinh-1.jpg', mimeType: 'image/jpeg', blob: dummyImageBlob }
		];
		const imagesMap = { 'hinh-1.jpg': { fileName: 'hinh-1.jpg' } };

		// 1. Parse .txt fixture to chapters
		const parsedChapters = parseTxtToChapters(rawFixtureText, { images: imagesMap }, 'Mặc Định');
		expect(parsedChapters.length).toBeGreaterThanOrEqual(5);

		// Verify chapter 1: [new] page
		expect(parsedChapters[0].title).toBe('LỜI TỰA ĐẦU SÁCH');
		expect(parsedChapters[0].html).toContain('<h1 class="main-chap center">LỜI TỰA ĐẦU SÁCH</h1>');
		expect(parsedChapters[0].html).toContain('<p>Cuốn sách này được biên soạn');

		// Verify chapter 2: [new:center] page
		expect(parsedChapters[1].title).toBe('TẬP THỨ NHẤT');
		expect(parsedChapters[1].features?.hasCenterPage).toBe(true);
		expect(parsedChapters[1].html).toContain('<section class="center-page">');
		expect(parsedChapters[1].html).toContain('<div class="center-page-content">');
		expect(parsedChapters[1].html).toContain('<h2 class="side-chap center">TẬP THỨ NHẤT</h2>');
		expect(parsedChapters[1].html).toContain('Dành tặng những người bạn đồng hành');
		expect(parsedChapters[1].html).toContain('</div>\n</section>');

		// Verify chapter 3: Chapter 1 with full formatting
		const chap1 = parsedChapters.find((c) => c.title.includes('Khởi Đầu Cuộc Hành Trình'));
		expect(chap1).toBeDefined();
		expect(chap1!.html).toContain(
			'<h1 class="main-chap center">Chương 1: Khởi Đầu Cuộc Hành Trình</h1>'
		);
		expect(chap1!.html).toContain('<p class="has-dropcap"><span class="dropcap">M</span>ặt trời');
		expect(chap1!.html).toContain('<i>Nguyễn Du</i>');
		expect(chap1!.html).toContain('<b>in đậm</b>');
		expect(chap1!.html).toContain('<i>in nghiêng</i>');
		expect(chap1!.html).toContain('<u>gạch chân</u>');
		expect(chap1!.html).toContain(
			'<a class="noteref" epub:type="noteref" id="fnref1" href="notes.xhtml#fn1"><sup>1</sup></a>'
		);
		expect(chap1!.html).toContain(
			'<a class="noteref" epub:type="noteref" id="fnref2" href="notes.xhtml#fn2"><sup>2</sup></a>'
		);
		expect(chap1!.html).toContain('<div class="letter">');
		expect(chap1!.html).toContain('<p class="scene-break-big" role="separator">• • •</p>');
		expect(chap1!.html).toContain(
			'<h2 class="side-chap center no-toc">Ghi Chú Riêng (Không Đưa Vào Mục Lục)</h2>'
		);
		expect(chap1!.html).toContain(
			'<blockquote class="right"><p>&quot;Cuộc hành trình vạn dặm luôn bắt đầu bằng một bước chân.&quot;</p><footer>Lão Tử</footer></blockquote>'
		);
		expect(chap1!.html).toContain('<div class="poem">');
		expect(chap1!.html).toContain('<p class="scene-break-small" role="separator">*</p>');
		expect(chap1!.html).toContain(
			'<figure class="illust-box">\n  <img class="illust-img" src="../images/hinh-1.jpg" alt="hinh-1.jpg" />\n</figure>'
		);

		// Verify chapter 4: Chapter 2 with left align and escapes
		const chap2 = parsedChapters.find((c) => c.title.includes('Ngôi Nhà Cổ'));
		expect(chap2).toBeDefined();
		expect(chap2!.html).toContain(
			'<h1 class="main-chap left">Chương 2: Ngôi Nhà Cổ Bên Sông (Căn Trái)</h1>'
		);
		expect(chap2!.html).toContain('<h2 class="side-chap left">Mục Căn Trái Trong Chương 2</h2>');
		expect(chap2!.html).toContain('@ Không phải tiêu đề');
		expect(chap2!.html).toContain('~ Không phải trích dẫn');
		expect(chap2!.html).toContain('&gt; Không phải tác giả');

		// Verify chapter 5: Chapter 3 with right align and no-toc h2
		const chap3 = parsedChapters.find((c) => c.title.includes('Kết Thúc Và Mở Đầu Mới'));
		expect(chap3).toBeDefined();
		expect(chap3!.html).toContain(
			'<h1 class="main-chap right">Chương 3: Kết Thúc Và Mở Đầu Mới (Căn Phải)</h1>'
		);
		expect(chap3!.html).toContain(
			'<h2 class="side-chap right no-toc">Ghi chú kết thúc căn phải không TOC</h2>'
		);

		// Verify Notes chapter
		const notesChap = parsedChapters.find((c) => c.isNotes || c.fileName === 'notes');
		expect(notesChap).toBeDefined();
		expect(notesChap!.html).toContain('<aside epub:type="footnote" id="fn1" class="note">');
		expect(notesChap!.html).toContain('Tham khảo Tuyển tập Văn học Cổ điển Việt Nam.');
		expect(notesChap!.html).toContain('<aside epub:type="footnote" id="fn2" class="note">');
		expect(notesChap!.html).toContain('Ghi chép từ nhật ký hành trình năm 1945.');

		// 2. Build EPUB Blob
		const metadata = {
			title: 'Tuyển Tập Quy Ước Cú Pháp',
			author: 'Ban Biên Tập Ebook Tools',
			language: 'vi',
			identifier: 'urn:uuid:fixture-comprehensive-syntax-2026',
			publisher: 'Ebook Forge'
		};

		const epubBlob = await buildEpubBlob(
			metadata,
			parsedChapters,
			undefined,
			false,
			null,
			null,
			null,
			null,
			illustrations
		);

		expect(epubBlob).toBeDefined();
		expect(epubBlob.type).toBe('application/epub+zip');
		expect(epubBlob.size).toBeGreaterThan(1000);

		// 3. Inspect generated EPUB ZIP internal files
		const zip = await JSZip.loadAsync(await epubBlob.arrayBuffer());

		// A. Check container.xml
		const containerXml = await zip.file('META-INF/container.xml')?.async('text');
		expect(containerXml).toContain('full-path="OEBPS/content.opf"');

		// B. Check content.opf
		const contentOpf = await zip.file('OEBPS/content.opf')?.async('text');
		expect(contentOpf).toContain('<dc:title>Tuyển Tập Quy Ước Cú Pháp</dc:title>');
		expect(contentOpf).toContain('Ban Biên Tập Ebook Tools');
		expect(contentOpf).toContain('href="styles/style.css"');
		expect(contentOpf).toContain('href="images/hinh-1.jpg"');
		expect(contentOpf).toContain('href="nav.xhtml"');
		expect(contentOpf).toContain('href="toc.ncx"');

		// C. Check nav.xhtml & toc.ncx TOC items
		const navXhtml = await zip.file('OEBPS/nav.xhtml')?.async('text');
		expect(navXhtml).toContain('LỜI TỰA ĐẦU SÁCH');
		expect(navXhtml).toContain('TẬP THỨ NHẤT');
		expect(navXhtml).toContain('Chương 1: Khởi Đầu Cuộc Hành Trình');
		expect(navXhtml).toContain('Phần 1: Buổi Sáng Ở Làng Quê');
		expect(navXhtml).not.toContain('Ghi Chú Riêng (Không Đưa Vào Mục Lục)'); // no-toc
		expect(navXhtml).toContain('Chương 2: Ngôi Nhà Cổ Bên Sông (Căn Trái)');
		expect(navXhtml).toContain('Mục Căn Trái Trong Chương 2');
		expect(navXhtml).toContain('Chương 3: Kết Thúc Và Mở Đầu Mới (Căn Phải)');
		expect(navXhtml).not.toContain('Ghi chú kết thúc căn phải không TOC'); // no-toc
		expect(navXhtml).toContain('Chú thích');

		// D. Check style.css dynamic injection
		const styleCss = await zip.file('OEBPS/styles/style.css')?.async('text');
		expect(styleCss).toContain('.center-page');
		expect(styleCss).toContain('.center-page-content');
		expect(styleCss).toContain('.main-chap');
		expect(styleCss).toContain('.letter');
		expect(styleCss).toContain('.scene-break');
		expect(styleCss).toContain('.noteref');

		// E. Check center-page xhtml
		const files = Object.keys(zip.files);
		const xhtmlFiles = files.filter((f) => f.startsWith('OEBPS/text/') && f.endsWith('.xhtml'));
		expect(xhtmlFiles.length).toBe(parsedChapters.length);

		let foundCenterPageInZip = false;
		for (const xf of xhtmlFiles) {
			const content = await zip.file(xf)?.async('text');
			if (content && content.includes('center-page')) {
				foundCenterPageInZip = true;
				expect(content).toContain('<section class="center-page">');
				expect(content).toContain('<div class="center-page-content">');
				expect(content).toContain('TẬP THỨ NHẤT');
			}
		}
		expect(foundCenterPageInZip).toBe(true);

		// 4. Run full validator on generated EPUB zip
		const validationResult = await validateEpub(zip, 'kobo');
		expect(validationResult.passed).toBe(true);
		expect(validationResult.errorCount).toBe(0);
	});
});
