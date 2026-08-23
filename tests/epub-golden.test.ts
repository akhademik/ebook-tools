// tests/epub-golden.test.ts
import { describe, it, expect, vi } from 'vitest';
import JSZip from 'jszip';

vi.mock('../src/lib/epub-packer/templates/css-template/base.css?raw', () => ({ default: '/* base.css */' }));
vi.mock('../src/lib/epub-packer/templates/css-template/headings.css?raw', () => ({ default: '/* headings.css */ .main-chap { font-size: 1.5em; }' }));
vi.mock('../src/lib/epub-packer/templates/css-template/quotes.css?raw', () => ({ default: '/* quotes.css */ .letter { margin: 1em; }' }));
vi.mock('../src/lib/epub-packer/templates/css-template/breaks.css?raw', () => ({ default: '/* breaks.css */ .scene-break { text-align: center; }' }));
vi.mock('../src/lib/epub-packer/templates/css-template/notes.css?raw', () => ({ default: '/* notes.css */ .noteref { vertical-align: super; }' }));

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
			false,     // mergeBrokenParagraphs
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
		expect(containerXml).toContain('<rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>');

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
		const { parseMarkdownBlocks } = await import('../src/lib/epub-packer/parser/epub-markdown-utils');
		const { groupChaptersZip } = await import('../src/lib/epub-packer/parser/epub-zip-grouper');
		const { assignSequentialChapterIds } = await import('../src/lib/epub-packer/parser/epub-chapter-utils');

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
		const mdFiles = Object.keys(loadedZip.files).filter(name => name.endsWith('.md') && !loadedZip.files[name].dir);
		mdFiles.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

		for (const name of mdFiles) {
			const text = await loadedZip.files[name].async('string');
			const baseName = name.replace(/\.md$/i, '').split('/').pop() || name;
			rawFiles.push({ path: name, baseName, rawText: text });
		}

		// 3. Parse blocks
		const processedFiles = rawFiles.map(f => ({
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

		const { parseMarkdownBlocks } = await import('../src/lib/epub-packer/parser/epub-markdown-utils');
		const { groupChaptersZip } = await import('../src/lib/epub-packer/parser/epub-zip-grouper');
		const { assignSequentialChapterIds } = await import('../src/lib/epub-packer/parser/epub-chapter-utils');
		const { cleanHeaderFooterOcr } = await import('../src/lib/epub-packer/parser/epub-ocr-utils');

		const zipBuffer = fs.readFileSync(zipPath);
		const loadedZip = await JSZip.loadAsync(zipBuffer);
		const rawFiles: Array<{ path: string; baseName: string; rawText: string }> = [];
		const mdFiles = Object.keys(loadedZip.files).filter(name => name.endsWith('.md') && !loadedZip.files[name].dir);
		mdFiles.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

		for (const name of mdFiles) {
			const text = await loadedZip.files[name].async('string');
			const baseName = name.replace(/\.md$/i, '').split('/').pop() || name;
			rawFiles.push({ path: name, baseName, rawText: text });
		}

		const processedFiles = rawFiles.map(f => {
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

		const quoteChapter = chapters.find(c => c.html && c.html.includes('Một nhà cách mạng'));
		expect(quoteChapter).toBeDefined();
		expect(quoteChapter?.html).toContain('chịu đựng được nó.” Ông lắc đầu.');
		expect(quoteChapter?.html).not.toMatch(/chịu đựng được<\/p>\s*<p>nó\./);
	});
});
