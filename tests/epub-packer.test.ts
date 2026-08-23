import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockZipInstance = {
	file: vi.fn(),
	folder: vi.fn().mockImplementation(() => mockZipInstance),
	generateAsync: vi.fn().mockResolvedValue(new Blob(['mocked-epub'])),
	files: {}
};

vi.mock('jszip', () => {
	class MockJSZip {
		constructor() {
			return mockZipInstance;
		}
	}
	return {
		default: MockJSZip
	};
});

vi.mock('../src/lib/epub-packer/templates/css-template/base.css?raw', () => ({ default: '/* base.css */' }));
vi.mock('../src/lib/epub-packer/templates/css-template/headings.css?raw', () => ({ default: '/* headings.css */ .main-chap { font-size: 1.5em; }' }));
vi.mock('../src/lib/epub-packer/templates/css-template/quotes.css?raw', () => ({ default: '/* quotes.css */ .letter { margin: 1em; }' }));
vi.mock('../src/lib/epub-packer/templates/css-template/breaks.css?raw', () => ({ default: '/* breaks.css */ .scene-break { text-align: center; }' }));
vi.mock('../src/lib/epub-packer/templates/css-template/notes.css?raw', () => ({ default: '/* notes.css */ .noteref { vertical-align: super; }' }));
vi.mock('../src/lib/epub-packer/templates/css-template/ornaments.css?raw', () => ({ default: '/* ornaments.css */ .chapter-ornament { text-align: center; } .subchapter-ornament { text-align: center; }' }));
vi.mock('../src/lib/epub-packer/templates/css-template/cover.css?raw', () => ({ default: '/* cover.css */ .cover-wrapper { margin: 0; }' }));

import {
	buildChapterXhtml,
	buildContainerXml,
	buildTocNcx,
	buildContentOpf,
	buildNavXhtml,
	mergeBrokenParagraphs,
	buildEpubBlob,
	injectHeadingIds,
	getTocEntries,
	getDynamicCss
} from '../src/lib/epub-packer/epub-packer';

describe('epub-packer tests', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('buildChapterXhtml', () => {
		it('should wrap title and body in standard EPUB XHTML structure', () => {
			const html = buildChapterXhtml({ language: 'vi' }, { title: 'Chương 1', html: '<p>Nội dung</p>' });
			expect(html).toContain('<title>Chương 1</title>');
			expect(html).toContain('<p>Nội dung</p>');
			expect(html).toContain('http://www.w3.org/1999/xhtml');
		});

		it('should clean up internal marker classes like no-toc from headings in final XHTML', () => {
			const html = buildChapterXhtml(
				{ language: 'vi' },
				{
					title: 'Chương 1',
					fileName: 'chap_01',
					html: '<h2 class="side-chap center no-toc">Mục không TOC</h2>\n<p>Nội dung</p>'
				}
			);
			expect(html).toContain('<h2 class="side-chap center">Mục không TOC</h2>');
			expect(html).not.toContain('no-toc');
		});

		it('should bypass paragraph merging if preserveParagraphs is true', () => {
			const html = buildChapterXhtml(
				{ language: 'vi' },
				{ title: 'Chương 1', html: '<p>Đây là dòng dở</p>\n<p>tiếp tục dòng này.</p>' },
				true
			);
			expect(html).toContain('<p>Đây là dòng dở</p>\n<p>tiếp tục dòng này.</p>');
		});

		it('should add dropcap to the first paragraph immediately following h1 or h2', () => {
			const html = buildChapterXhtml(
				{ language: 'vi' },
				{
					title: 'Chương 1',
					fileName: 'chap_01',
					html: '<h1 class="main-chap center">18 PHÚT</h1>\n<p>Mỗi giây là một năm</p>'
				}
			);
			expect(html).toContain('<h1 class="main-chap center">18 PHÚT</h1>\n<p class="has-dropcap"><span class="dropcap">M</span>ỗi giây là một năm</p>');
		});

		it('should include starting quotes/entities/inline tags correctly in the dropcap', () => {
			const htmlQuotes = buildChapterXhtml(
				{ language: 'vi' },
				{
					title: 'Chương 1',
					fileName: 'chap_01',
					html: '<h1 class="main-chap center">18 PHÚT</h1>\n<p>“Mỗi giây là một năm”</p>'
				}
			);
			expect(htmlQuotes).toContain('<h1 class="main-chap center">18 PHÚT</h1>\n<p class="has-dropcap"><span class="dropcap">“M</span>ỗi giây là một năm”</p>');

			const htmlItalic = buildChapterXhtml(
				{ language: 'vi' },
				{
					title: 'Chương 1',
					fileName: 'chap_01',
					html: '<h1>18 PHÚT</h1>\n<p><i>M</i>ỗi giây là một năm</p>'
				}
			);
			expect(htmlItalic).toContain('<h1>18 PHÚT</h1>\n<p class="has-dropcap"><i><span class="dropcap">M</span></i>ỗi giây là một năm</p>');

			const htmlEntity = buildChapterXhtml(
				{ language: 'vi' },
				{
					title: 'Chương 1',
					fileName: 'chap_01',
					html: '<h2>18 PHÚT</h2>\n<p>&ldquo;Mỗi giây là một năm&rdquo;</p>'
				}
			);
			expect(htmlEntity).toContain('<h2>18 PHÚT</h2>\n<p class="has-dropcap"><span class="dropcap">&ldquo;M</span>ỗi giây là một năm&rdquo;</p>');
		});

		it('should add has-dropcap class to paragraphs containing a dropcap span', () => {
			const htmlExplicit = buildChapterXhtml(
				{ language: 'vi' },
				{
					title: 'Chương 1',
					fileName: 'chap_01',
					html: '<p><span class="dropcap">N</span>ội dung</p>'
				}
			);
			expect(htmlExplicit).toContain('<p class="has-dropcap"><span class="dropcap">N</span>ội dung</p>');
		});

		it('should not add dropcap to special pages like jacket or cover', () => {
			const html = buildChapterXhtml(
				{ language: 'vi' },
				{
					title: 'Giới thiệu',
					fileName: 'jacket',
					html: '<h1>18 PHÚT</h1>\n<p>Mỗi giây là một năm</p>'
				}
			);
			expect(html).not.toContain('class="dropcap"');
		});

		it('should inject chapter and subchapter ornaments and ignore break-main-chap', () => {
			const ornaments = {
				chapterOrnament: { fileName: 'pre-chap.png', mimeType: 'image/png' },
				subchapterOrnament: { fileName: 'pre-small-chap.png', mimeType: 'image/png' }
			};

			const html = buildChapterXhtml(
				{ language: 'vi' },
				{
					title: 'Chương 1',
					fileName: 'chap_01',
					html: '<h1 class="main-chap center">CUỐN I</h1>\n<h2 class="side-chap center">1</h2>\n<h1 class="break-main-chap">PHẦN I</h1>'
				},
				false,
				'',
				ornaments
			);

			expect(html).toContain('<div class="chapter-ornament">\n    <img src="../images/pre-chap.png" alt=""/>\n  </div>\n  <h1 class="main-chap center">CUỐN I</h1>');
			expect(html).toContain('<div class="subchapter-ornament">\n    <img src="../images/pre-small-chap.png" alt=""/>\n  </div>\n  <h2 class="side-chap center">1</h2>');
			expect(html).toContain('<h1 class="break-main-chap">PHẦN I</h1>');
			expect(html).not.toContain('<div class="chapter-ornament">\n    <img src="../images/pre-chap.png" alt=""/>\n  </div>\n  <h1 class="break-main-chap">PHẦN I</h1>');
		});
	});

	describe('buildContainerXml', () => {
		it('should generate standard container.xml file', () => {
			const xml = buildContainerXml();
			expect(xml).toContain('OEBPS/content.opf');
			expect(xml).toContain('urn:oasis:names:tc:opendocument:xmlns:container');
		});
	});

	describe('buildTocNcx', () => {
		it('should generate valid NCX Table of Contents', () => {
			const chapters = [
				{ xmlId: 'chap1', title: 'Chương 1', fileName: 'chap_01' }
			];
			const xml = buildTocNcx({ identifier: 'uuid-1234', title: 'My Book' }, chapters);
			expect(xml).toContain('<docTitle><text>My Book</text></docTitle>');
			expect(xml).toContain('<navLabel><text>Chương 1</text></navLabel>');
			expect(xml).toContain('<content src="text/chap_01.xhtml"/>');
		});
	});

	describe('buildContentOpf', () => {
		it('should generate valid OPF Package Document metadata', () => {
			const chapters = [
				{ xmlId: 'chap1', title: 'Chương 1', fileName: 'chap_01' }
			];
			const xml = buildContentOpf({ title: 'My Book', author: 'My Author', identifier: 'uuid-1234', language: 'vi', publisher: 'My Publisher' }, chapters);
			expect(xml).toContain('<dc:title>My Book</dc:title>');
			expect(xml).toContain('<dc:creator id="creator">My Author</dc:creator>');
			expect(xml).toContain('<dc:publisher>My Publisher</dc:publisher>');
			expect(xml).toContain('<item id="chap1" href="text/chap_01.xhtml"');
			expect(xml).toContain('<itemref idref="chap1"');
		});

		it('should include fonts in manifest if activeFonts is specified', () => {
			const chapters = [
				{ xmlId: 'chap1', title: 'Chương 1', fileName: 'chap_01' }
			];
			const xml = buildContentOpf({ title: 'My Book', author: 'My Author', identifier: 'uuid-1234', language: 'vi' }, chapters, false, ['Akashi', 'Polliwog']);
			expect(xml).toContain('<item id="font-utm_akashi" href="fonts/UTM_Akashi.ttf" media-type="application/vnd.ms-opentype"/>');
			expect(xml).toContain('<item id="font-polliwog" href="fonts/Polliwog.otf" media-type="application/vnd.ms-opentype"/>');
		});

		it('should escape XML attributes properly in manifest items and package tag', () => {
			const chapters = [
				{ xmlId: 'chap&"1"', title: 'Chương 1', fileName: 'chap_&_01' }
			];
			const images = [
				{ fileName: 'cover & art "1".jpg', mimeType: 'image/jpeg' }
			];
			const xml = buildContentOpf(
				{ title: 'Test Book', author: 'Author', identifier: '123', language: 'vi"&' },
				chapters,
				false,
				[],
				null,
				images
			);
			expect(xml).toContain('xml:lang="vi&quot;&amp;"');
			expect(xml).toContain('<item id="chap&amp;&quot;1&quot;" href="text/chap_&amp;_01.xhtml"');
			expect(xml).toContain('<itemref idref="chap&amp;&quot;1&quot;"/>');
			expect(xml).toContain('href="images/cover &amp; art &quot;1&quot;.jpg"');
		});
	});

	describe('buildNavXhtml', () => {
		it('should generate valid EPUB 3 Navigation document', () => {
			const chapters = [
				{ xmlId: 'chap1', title: 'Chương 1', fileName: 'chap_01' }
			];
			const html = buildNavXhtml({ language: 'vi' }, chapters);
			expect(html).toContain('<h1>Mục lục</h1>');
			expect(html).toContain('<a href="text/chap_01.xhtml">Chương 1</a>');
		});
	});

	describe('mergeBrokenParagraphs', () => {
		it('should merge broken paragraphs ending with hyphens or trailing lowercases', () => {
			let merged = mergeBrokenParagraphs('<p>Đây là một từ-</p>\n<p>sau đó là phần tiếp theo.</p>');
			expect(merged).toContain('<p>Đây là một từ- sau đó là phần tiếp theo.</p>');

			merged = mergeBrokenParagraphs('<p>Đây là câu đang viết dở</p>\n<p>tiếp tục câu này.</p>');
			expect(merged).toContain('<p>Đây là câu đang viết dở tiếp tục câu này.</p>');
		});

		it('should not merge paragraphs ending with sentence punctuation or starting with uppercase', () => {
			// Ends with sentence punctuation
			let merged = mergeBrokenParagraphs('<p>Đây là câu hoàn chỉnh.</p>\n<p>sau đó là phần tiếp theo.</p>');
			expect(merged).toBe('<p>Đây là câu hoàn chỉnh.</p>\n<p>sau đó là phần tiếp theo.</p>');

			// Starts with uppercase
			merged = mergeBrokenParagraphs('<p>Đây là câu chưa dở</p>\n<p>Sau đó viết tiếp.</p>');
			expect(merged).toBe('<p>Đây là câu chưa dở</p>\n<p>Sau đó viết tiếp.</p>');

			// Empty paragraphs
			merged = mergeBrokenParagraphs('<p></p>\n<p>nội dung</p>');
			expect(merged).toBe('<p></p>\n<p>nội dung</p>');
		});

		it('should safely merge paragraphs split across merged pages without trailing punctuation', () => {
			const input = `<p>Ông nhìn quanh bãi biển và bắt gặp Lesley đang đứng cạnh một người phụ nữ Mã Lai ở đường mép thủy triều. Người phụ nữ Mã Lai</p>\n\n<p>đang đào cát bằng một cây que, cạnh bà là một chiếc xô.</p>`;
			const merged = mergeBrokenParagraphs(input);
			expect(merged).toBe('<p>Ông nhìn quanh bãi biển và bắt gặp Lesley đang đứng cạnh một người phụ nữ Mã Lai ở đường mép thủy triều. Người phụ nữ Mã Lai đang đào cát bằng một cây que, cạnh bà là một chiếc xô.</p>');

			const userExcerpt = `<p>“Một nhà cách mạng”, Robert nói. “Hy vọng ông ta không gây rắc rối nào nơi đây.” Ông gõ ống tẩu vào thành đê rồi bỏ vào túi. “Tốt hơn cả là chúng ta nên vào lại, em yêu ạ”, ông nói. “Charles chắc chắn sẽ có bài diễn văn lê thê, anh cần một ly rượu lớn để chịu đựng được</p>\n\n  <p>nó.” Ông lắc đầu. “Ba mươi năm hôn nhân. Em nghĩ người nào trong số họ xứng đáng nhận huy chương hơn?”</p>`;
			const userMerged = mergeBrokenParagraphs(userExcerpt);
			expect(userMerged).toBe('<p>“Một nhà cách mạng”, Robert nói. “Hy vọng ông ta không gây rắc rối nào nơi đây.” Ông gõ ống tẩu vào thành đê rồi bỏ vào túi. “Tốt hơn cả là chúng ta nên vào lại, em yêu ạ”, ông nói. “Charles chắc chắn sẽ có bài diễn văn lê thê, anh cần một ly rượu lớn để chịu đựng được nó.” Ông lắc đầu. “Ba mươi năm hôn nhân. Em nghĩ người nào trong số họ xứng đáng nhận huy chương hơn?”</p>');
		});

		it('should not merge paragraphs if paragraph 1 ends with quotes or closing brackets', () => {
			expect(mergeBrokenParagraphs('<p>Ông nói: "Tôi đi đây."</p>\n<p>và ông bước đi.</p>')).toBe('<p>Ông nói: "Tôi đi đây."</p>\n<p>và ông bước đi.</p>');
			expect(mergeBrokenParagraphs('<p>Một ngày đẹp trời (như mọi ngày)</p>\n<p>chúng tôi cùng nhau đi dạo.</p>')).toBe('<p>Một ngày đẹp trời (như mọi ngày)</p>\n<p>chúng tôi cùng nhau đi dạo.</p>');
			expect(mergeBrokenParagraphs('<p>Kết quả như sau:</p>\n<p>chúng tôi thắng cuộc.</p>')).toBe('<p>Kết quả như sau:</p>\n<p>chúng tôi thắng cuộc.</p>');
		});
	});

	describe('buildEpubBlob', () => {
		it('should throw an error if no chapters are provided', async () => {
			const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
			const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

			await expect(buildEpubBlob({}, [], '')).rejects.toThrow('Không có chương nào để đóng gói.');

			expect(consoleErrorSpy).toHaveBeenCalled();
			
			consoleErrorSpy.mockRestore();
			consoleLogSpy.mockRestore();
		});

		it('should build EPUB blob successfully with metadata defaults and zip generation', async () => {
			const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
			const chapters = [
				{ xmlId: 'chap1', title: 'Chương 1', fileName: 'chap_01', html: '<p>Nội dung</p>' }
			];

			const blob = await buildEpubBlob({}, chapters, 'body { color: black; }');

			expect(blob).toBeDefined();
			expect(mockZipInstance.file).toHaveBeenCalledWith('mimetype', 'application/epub+zip', { compression: 'STORE' });
			expect(mockZipInstance.folder).toHaveBeenCalledWith('META-INF');
			expect(mockZipInstance.folder).toHaveBeenCalledWith('OEBPS');

			consoleLogSpy.mockRestore();
		});

		it('should handle custom metadata and custom crypto randomUUID if available', async () => {
			const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
			const chapters = [
				{ xmlId: 'chap1', title: 'Chương 1', fileName: 'chap_01', html: '<p>Nội dung</p>' }
			];

			const originalCrypto = globalThis.crypto;
			Object.defineProperty(globalThis, 'crypto', {
				value: {
					randomUUID: () => 'custom-uuid-1234'
				},
				configurable: true,
				writable: true
			});

			const metadata = {
				title: 'My Custom Book',
				author: 'My Custom Author',
				language: 'en',
				publisher: 'My Custom Publisher'
			};

			const blob = await buildEpubBlob(metadata, chapters, 'body {}', true);
			expect(blob).toBeDefined();

			// Restore crypto
			Object.defineProperty(globalThis, 'crypto', {
				value: originalCrypto,
				configurable: true,
				writable: true
			});

			consoleLogSpy.mockRestore();
		});

		it('should fallback to Date/Math identifier if crypto or randomUUID is missing', async () => {
			const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
			const chapters = [
				{ xmlId: 'chap1', title: 'Chương 1', fileName: 'chap_01', html: '<p>Nội dung</p>' }
			];

			const originalCrypto = globalThis.crypto;
			Object.defineProperty(globalThis, 'crypto', {
				value: undefined,
				configurable: true,
				writable: true
			});

			const blob = await buildEpubBlob({}, chapters, 'body {}');
			expect(blob).toBeDefined();

			// Restore crypto
			Object.defineProperty(globalThis, 'crypto', {
				value: originalCrypto,
				configurable: true,
				writable: true
			});

			consoleLogSpy.mockRestore();
		});

		it('should prepend jacket page and append stylesheet when jacket is enabled', async () => {
			const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
			const chapters = [
				{ xmlId: 'chap1', title: 'Chương 1', fileName: 'chap_01', html: '<p>Nội dung</p>' }
			];
			const jacket = {
				enabled: true,
				templateId: 1,
				title: 'Tác phẩm mẫu',
				author: 'Tác giả mẫu',
				originalTitle: 'Original Title',
				publisher: 'Phát hành',
				distributor: 'NXB Ebook'
			};

			const blob = await buildEpubBlob({ title: 'Book Title', author: 'Author Name' }, chapters, 'body {}', false, jacket);
			expect(blob).toBeDefined();

			// Verify JSZip calls
			expect(mockZipInstance.folder).toHaveBeenCalledWith('OEBPS');
			// Since we mocked folder/file, check that they were called
			expect(mockZipInstance.file).toHaveBeenCalledWith('mimetype', 'application/epub+zip', expect.any(Object));
			consoleLogSpy.mockRestore();
		});

		it('should package cover image and generate SVG cover XHTML when coverBlob is provided', async () => {
			const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
			const chapters = [
				{ xmlId: 'chap1', title: 'Chương 1', fileName: 'chap_01', html: '<p>Nội dung</p>' }
			];
			const coverBlob = new Blob(['mock-cover-binary']);
			coverBlob.width = 1000;
			coverBlob.height = 1400;

			const blob = await buildEpubBlob(
				{ title: 'Book Title', author: 'Author Name' },
				chapters,
				'body {}',
				false,
				null,
				coverBlob
			);
			expect(blob).toBeDefined();

			// Check that cover is added to manifest in content.opf
			expect(mockZipInstance.file).toHaveBeenCalledWith('content.opf', expect.stringContaining('id="cover-image"'));
			expect(mockZipInstance.file).toHaveBeenCalledWith('content.opf', expect.stringContaining('properties="cover-image"'));
			
			// Check that cover image itself is written to zip
			expect(mockZipInstance.file).toHaveBeenCalledWith('cover.jpg', expect.anything());
			
			// Check that cover.xhtml contains the SVG wrapper and dimensions
			expect(mockZipInstance.file).toHaveBeenCalledWith('cover.xhtml', expect.stringContaining('<svg'));
			expect(mockZipInstance.file).toHaveBeenCalledWith('cover.xhtml', expect.stringContaining('viewBox="0 0 1000 1400"'));
			expect(mockZipInstance.file).toHaveBeenCalledWith('cover.xhtml', expect.stringContaining('xlink:href="../images/cover.jpg"'));
			
			consoleLogSpy.mockRestore();
		});

		it('should package fonts inside ZIP and declare them in content.opf and styles', async () => {
			const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
			const chapters = [
				{ xmlId: 'chap1', title: 'Chương 1', fileName: 'chap_01', html: '<p>Nội dung</p>' }
			];
			const fonts = {
				jacketFont: 'Akashi',
				h1Font: 'Polliwog',
				h2Font: 'Charlotte',
				blobs: {
					'Akashi': new Blob(['akashi-binary']),
					'Polliwog': new Blob(['polliwog-binary'])
				}
			};

			const blob = await buildEpubBlob({ title: 'Book Title' }, chapters, 'body {}', false, null, null, fonts);
			expect(blob).toBeDefined();

			// Verify fonts folder calls
			expect(mockZipInstance.folder).toHaveBeenCalledWith('fonts');
			consoleLogSpy.mockRestore();
		});

		it('should embed Bookerly font in the EPUB when available in fonts configuration', async () => {
			const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
			const chapters = [
				{ xmlId: 'chap1', title: 'Chương 1', fileName: 'chap_01', html: '<p>Nội dung</p>' }
			];

			const blob = await buildEpubBlob(
				{ title: 'Book Title' },
				chapters,
				'body {}',
				false,
				null,
				null,
				{ blobs: { Bookerly: new Blob(['bookerly-data']) } }
			);
			expect(blob).toBeDefined();

			// Verify Bookerly is declared in the content.opf manifest
			expect(mockZipInstance.file).toHaveBeenCalledWith('content.opf', expect.stringContaining('href="fonts/Bookerly.ttf"'));
			consoleLogSpy.mockRestore();
		});

		it('should conditionally include CSS snippets based on chapter features and content', async () => {
			const chapters = [
				{
					xmlId: 'chap1',
					title: 'Chương 1',
					fileName: 'chap_01',
					html: '<h1 class="main-chap">Tiêu đề</h1>\n<blockquote class="letter"><p>Thư</p></blockquote>\n<p class="scene-break">*</p>',
					features: { hasHeadings: true, hasQuotes: true, hasBreaks: true, hasNotes: false }
				}
			];

			const dynamicCss = getDynamicCss(chapters);
			expect(dynamicCss).toContain('.main-chap');
			expect(dynamicCss).toContain('.letter');
			expect(dynamicCss).toContain('.scene-break');
			expect(dynamicCss).not.toContain('aside[epub\\:type="footnote"]');

			const blob = await buildEpubBlob({ title: 'Book Title' }, chapters);
			expect(blob).toBeDefined();
			expect(mockZipInstance.file).toHaveBeenCalledWith('style.css', expect.any(String));
		});
	});

	describe('injectHeadingIds and getTocEntries', () => {
		it('should inject unique IDs for h1 and h2 elements without existing IDs', () => {
			const chapters = [
				{
					fileName: 'chap_01',
					html: '<h1>Tiêu đề 1</h1>\n<h2 class="sub">Tiêu đề 2</h2>\n<h1 id="existing">Existing 1</h1>'
				}
			];
			const processed = injectHeadingIds(chapters);
			expect(processed[0].html).toContain('id="heading-1-1"');
			expect(processed[0].html).toContain('id="heading-2-2"');
			expect(processed[0].html).toContain('id="existing"');
			expect(processed[0].html).not.toContain('id="heading-1-3"');
		});

		it('should return a flat list of TOC entries for all h1 and h2 headings', () => {
			const chapters = [
				{
					fileName: 'chap_01',
					title: 'Chương 1',
					html: '<h1 id="h1-1">Tiêu đề H1</h1>\n<p>Nội dung</p>\n<h2 id="h2-1">Mục H2.1</h2>\n<h2 id="h2-2">Mục H2.2</h2>'
				},
				{
					fileName: 'chap_02',
					title: 'Chương 2',
					html: '<h2 id="h2-3">Mục H2.3</h2>'
				}
			];
			const entries = getTocEntries(chapters);
			expect(entries).toEqual([
				{ title: 'Tiêu đề H1', url: 'text/chap_01.xhtml' },
				{ title: 'Mục H2.1', url: 'text/chap_01.xhtml#h2-1' },
				{ title: 'Mục H2.2', url: 'text/chap_01.xhtml#h2-2' },
				{ title: 'Chương 2', url: 'text/chap_02.xhtml' },
				{ title: 'Mục H2.3', url: 'text/chap_02.xhtml#h2-3' }
			]);
		});

		it('should flatly display h1 and h2 headings in buildNavXhtml and buildTocNcx', () => {
			const chapters = [
				{
					fileName: 'chap_01',
					title: 'Chương 1',
					html: '<h1>Tiêu đề H1</h1>\n<h2>Mục H2.1</h2>'
				}
			];
			const nav = buildNavXhtml({ language: 'vi' }, chapters);
			expect(nav).toContain('<a href="text/chap_01.xhtml">Tiêu đề H1</a>');
			expect(nav).toContain('<a href="text/chap_01.xhtml#heading-2-2">Mục H2.1</a>');

			const ncx = buildTocNcx({ identifier: 'uuid-1234', title: 'My Book' }, chapters);
			expect(ncx).toContain('<content src="text/chap_01.xhtml"/>');
			expect(ncx).toContain('<content src="text/chap_01.xhtml#heading-2-2"/>');
		});

		it('should exclude headings with no-toc class from TOC entries', () => {
			const chapters = [
				{
					fileName: 'chap_01',
					title: 'Chương 1',
					html: '<h1 id="h1-1">Tiêu đề H1</h1>\n<h2 id="h2-1" class="side-chap center">Mục H2.1 Có TOC</h2>\n<h2 id="h2-2" class="side-chap center no-toc">Mục H2.2 Không TOC</h2>'
				}
			];
			const entries = getTocEntries(chapters);
			expect(entries).toEqual([
				{ title: 'Tiêu đề H1', url: 'text/chap_01.xhtml' },
				{ title: 'Mục H2.1 Có TOC', url: 'text/chap_01.xhtml#h2-1' }
			]);
		});

		it('should add illustrations to manifest in content.opf and package images to zip', async () => {
			const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
			const chapters = [
				{ xmlId: 'chap1', title: 'Chương 1', fileName: 'chap_01', html: '<p>Nội dung</p>' }
			];
			const mockBlob = new Blob(['mock-image-data']);
			const illustrations = [
				{ id: 'img-hinh-1', name: 'hinh-1', fileName: 'hinh-1.jpg', mimeType: 'image/jpeg', blob: mockBlob },
				{ id: 'img-hinh-2', name: 'hinh-2', fileName: 'hinh-2.png', mimeType: 'image/png', blob: mockBlob }
			];

			const blob = await buildEpubBlob(
				{ title: 'Book' },
				chapters,
				'body {}',
				false,
				null,
				null,
				null,
				null,
				illustrations
			);

			expect(blob).toBeDefined();
			expect(mockZipInstance.file).toHaveBeenCalledWith('content.opf', expect.stringContaining('id="img-hinh-1"'));
			expect(mockZipInstance.file).toHaveBeenCalledWith('content.opf', expect.stringContaining('href="images/hinh-1.jpg"'));
			expect(mockZipInstance.file).toHaveBeenCalledWith('content.opf', expect.stringContaining('id="img-hinh-2"'));
			expect(mockZipInstance.file).toHaveBeenCalledWith('content.opf', expect.stringContaining('href="images/hinh-2.png"'));
			expect(mockZipInstance.file).toHaveBeenCalledWith('hinh-1.jpg', expect.anything());
			expect(mockZipInstance.file).toHaveBeenCalledWith('hinh-2.png', expect.anything());
			consoleLogSpy.mockRestore();
		});

		it('should inject ornaments.css when ornaments are configured', async () => {
			const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
			const chapters = [
				{ xmlId: 'chap1', title: 'Chương 1', fileName: 'chap_01', html: '<p>Nội dung</p>' }
			];
			const ornaments = {
				chapterOrnament: { file: new File([''], 'orn1.png'), previewUrl: 'blob:orn1' },
				subchapterOrnament: null
			};

			const blob = await buildEpubBlob(
				{ title: 'Book Title' },
				chapters,
				undefined,
				false,
				null,
				null,
				null,
				ornaments
			);

			expect(blob).toBeDefined();
			expect(mockZipInstance.file).toHaveBeenCalledWith('style.css', expect.stringContaining('.chapter-ornament'));
			consoleLogSpy.mockRestore();
		});
	});
});
