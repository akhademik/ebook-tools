// tests/epub-to-txt.test.ts
import { describe, it, expect } from 'vitest';
import JSZip from 'jszip';
import {
	decodeHtmlEntities,
	cleanTextFormatting,
	convertInlineHtmlToTxt,
	htmlToCleanText,
	extractEpubToTxt
} from '../src/lib/epub-to-txt/epub-to-txt';

describe('EPUB to TXT Converter & Reverse Engine Rules', () => {
	describe('cleanTextFormatting', () => {
		it('should collapse multiple horizontal spaces between words to exactly 1 space', () => {
			const raw = 'Đây   là    một     đoạn    văn\tcó\t\tnhiều   khoảng   trắng.';
			const cleaned = cleanTextFormatting(raw);
			expect(cleaned).toBe('Đây là một đoạn văn có nhiều khoảng trắng.');
		});

		it('should handle non-breaking spaces (NBSP) and special spaces', () => {
			const raw = 'Từ1\u00A0\u00A0Từ2\u3000\u3000Từ3   Từ4';
			const cleaned = cleanTextFormatting(raw);
			expect(cleaned).toBe('Từ1 Từ2 Từ3 Từ4');
		});

		it('should ensure no more than 1 empty line between rows (never 2+ consecutive empty rows)', () => {
			const raw = 'Dòng 1\n\n\n\nDòng 2\n\n\n\n\n\nDòng 3\n\nDòng 4';
			const cleaned = cleanTextFormatting(raw);
			expect(cleaned).toBe('Dòng 1\n\nDòng 2\n\nDòng 3\n\nDòng 4');
		});

		it('should trim leading and trailing blank lines and per-line spaces', () => {
			const raw = '\n\n   \n   Dòng đầu tiên   \n\n   Dòng thứ hai   \n\n   \n\n';
			const cleaned = cleanTextFormatting(raw);
			expect(cleaned).toBe('Dòng đầu tiên\n\nDòng thứ hai');
		});
	});

	describe('decodeHtmlEntities', () => {
		it('should decode named and numeric entities', () => {
			const input =
				'&laquo;Ch&#224;o b&#7841;n&raquo; &amp; &quot;T&aacute;c ph&#7849;m&quot; &mdash; 100&#37;';
			const decoded = decodeHtmlEntities(input);
			expect(decoded).toContain('Chào bạn');
			expect(decoded).toContain('& "Tác phẩm" —');
		});
	});

	describe('convertInlineHtmlToTxt', () => {
		it('should convert bold, italic, underline, and footnote links correctly', () => {
			const input =
				'Chữ <b>in đậm</b> và <strong>rất đậm</strong> cùng <i>in nghiêng</i>, <em>nhấn mạnh</em> và <u>gạch chân</u><a class="noteref" href="notes.xhtml#fn1"><sup>1</sup></a>.';
			const output = convertInlineHtmlToTxt(input);
			expect(output).toBe(
				'Chữ *in đậm* và *rất đậm* cùng /in nghiêng/, /nhấn mạnh/ và _gạch chân_{1}.'
			);
		});

		it('should convert styled span elements in general EPUBs to inline markdown', () => {
			const input =
				'<span style="font-weight: bold">Đậm CSS</span>, <span style="font-style: italic">Nghiêng CSS</span>, <span class="underline">Gạch chân CSS</span>';
			const output = convertInlineHtmlToTxt(input);
			expect(output).toBe('*Đậm CSS*, /Nghiêng CSS/, _Gạch chân CSS_');
		});
	});

	describe('htmlToCleanText Reverse Engine', () => {
		it('should detect h1 with classes and convert to @@ / @@t / @@p', () => {
			const html = `
				<h1 id="heading-1-1" class="main-chap center"><u>LỜI NGƯỜI DỊCH</u></h1>
				<p>Đoạn văn sau tiêu đề.</p>
				<h1 class="main-chap left">Chương Trái</h1>
				<h1 class="main-chap right">Chương Phải</h1>
				<h1 class="title">Chương Chung Không Class Hệ Thống</h1>
			`;
			const text = htmlToCleanText(html);
			expect(text).toContain('@@ _LỜI NGƯỜI DỊCH_');
			expect(text).toContain('@@t Chương Trái');
			expect(text).toContain('@@p Chương Phải');
			expect(text).toContain('@@ Chương Chung Không Class Hệ Thống');
		});

		it('should detect h1 with no-toc and convert to @@! / @@!t / @@!p', () => {
			const html = `
				<h1 class="main-chap center no-toc">Tiêu Đề Lớn Không Mục Lục</h1>
				<h1 class="main-chap left no-toc">Tiêu Đề Trái Ẩn TOC</h1>
				<h1 class="main-chap right no-toc">Tiêu Đề Phải Ẩn TOC</h1>
			`;
			const text = htmlToCleanText(html);
			expect(text).toContain('@@! Tiêu Đề Lớn Không Mục Lục');
			expect(text).toContain('@@!t Tiêu Đề Trái Ẩn TOC');
			expect(text).toContain('@@!p Tiêu Đề Phải Ẩn TOC');
		});

		it('should detect h2 with classes and convert to @ / @t / @p and @! / @!t / @!p for no-toc', () => {
			const html = `
				<h2 id="heading-2-2" class="side-chap center">THÁNH NHÂN ĐÃI KẺ KHÙ KHỜ...</h2>
				<h2 class="side-chap left">Mục Lục Trái</h2>
				<h2 class="side-chap right">Mục Lục Phải</h2>
				<h2 class="side-chap center no-toc">Ghi Chú Ẩn</h2>
				<h2 class="side-chap left no-toc">Ẩn Trái</h2>
				<h2 class="side-chap right no-toc">Ẩn Phải</h2>
				<h2>Tiêu Đề Phụ General</h2>
			`;
			const text = htmlToCleanText(html);
			expect(text).toContain('@ THÁNH NHÂN ĐÃI KẺ KHÙ KHỜ...');
			expect(text).toContain('@t Mục Lục Trái');
			expect(text).toContain('@p Mục Lục Phải');
			expect(text).toContain('@! Ghi Chú Ẩn');
			expect(text).toContain('@!t Ẩn Trái');
			expect(text).toContain('@!p Ẩn Phải');
			expect(text).toContain('@ Tiêu Đề Phụ General');
		});

		it('should detect blockquotes and footers/citations with ~ and >', () => {
			const html = `
				<blockquote class="center">
					<p>Đây là lời thoại căn giữa.</p>
					<footer>Nguyễn Du</footer>
				</blockquote>
				<blockquote class="left">
					<p>Lời thoại căn trái.</p>
				</blockquote>
				<blockquote class="right">
					<p>Lời thoại căn phải.</p>
				</blockquote>
				<blockquote>
					<p>Trích dẫn thông thường.</p>
					<cite>Hồ Chí Minh</cite>
				</blockquote>
				<blockquote class="center">
					<p>Trích dẫn có nhiều footer.</p>
					<footer>Tác giả 1</footer>
					<footer>Tác giả 2</footer>
					<footer>Tác giả 3</footer>
				</blockquote>
			`;
			const text = htmlToCleanText(html);
			expect(text).toContain('~ Đây là lời thoại căn giữa.\n> Nguyễn Du');
			expect(text).toContain('~t Lời thoại căn trái.');
			expect(text).toContain('~p Lời thoại căn phải.');
			expect(text).toContain('~ Trích dẫn thông thường.\n> Hồ Chí Minh');
			expect(text).toContain('~ Trích dẫn có nhiều footer.\n> Tác giả 1\n> Tác giả 2\n> Tác giả 3');
		});

		it('should detect footers with alignment classes (>t, >p, >c)', () => {
			const html = `
				<blockquote class="left">
					<p>Lời thoại căn trái.</p>
					<footer class="right">Tác giả Căn Phải</footer>
					<footer class="left">Tác giả Căn Trái</footer>
					<footer class="center">Tác giả Căn Giữa</footer>
				</blockquote>
			`;
			const text = htmlToCleanText(html);
			expect(text).toContain(
				'~t Lời thoại căn trái.\n>p Tác giả Căn Phải\n>t Tác giả Căn Trái\n>c Tác giả Căn Giữa'
			);
		});

		it('should convert figure illustrations and general img tags to [tag-name]', () => {
			const html = `
				<figure class="illust-box">
					<img class="illust-img" src="../images/hinh-1.png" alt="hinh-1"/>
				</figure>
				<figure class="illust-box">
					<img class="illust-img" src="../images/anh-minh-hoa.jpg" alt="anh-minh-hoa"/>
				</figure>
				<p class="image">
					<img src="OEBPS/images/general-pic.png" alt="general-pic"/>
				</p>
			`;
			const text = htmlToCleanText(html);
			expect(text).toContain('[hinh-1]');
			expect(text).toContain('[anh-minh-hoa]');
			expect(text).toContain('[general-pic]');
		});

		it('should detect dropcaps and !D no-dropcap paragraphs', () => {
			const html = `
				<p class="has-dropcap"><span class="dropcap">K</span>hi xưa ta còn bé...</p>
				<p class="no-dropcap">Đoạn văn này không muốn dropcap.</p>
			`;
			const text = htmlToCleanText(html);
			expect(text).toContain('Khi xưa ta còn bé...');
			expect(text).toContain('!D Đoạn văn này không muốn dropcap.');
		});

		it('should convert scene breaks to ###, ##, # including general EPUB break patterns', () => {
			const html = `
				<p class="scene-break-big" role="separator">• • •</p>
				<p>Đoạn 1.</p>
				<p>***</p>
				<p>Đoạn 2.</p>
				<p>---</p>
				<p>Đoạn 3.</p>
				<hr/>
				<p>Đoạn 4.</p>
				<p class="scene-break-small" role="separator">*</p>
				<p>Đoạn 5.</p>
				<p>*</p>
				<p>Đoạn 6.</p>
				<p class="scene-break-small" role="separator"></p>
				<p class="separator"></p>
			`;
			const text = htmlToCleanText(html);
			expect(text).toContain(
				'###\n\nĐoạn 1.\n\n###\n\nĐoạn 2.\n\n###\n\nĐoạn 3.\n\n###\n\nĐoạn 4.\n\n##\n\nĐoạn 5.\n\n##\n\nĐoạn 6.\n\n#\n\n#'
			);
		});

		it('should convert poem, letter, letter-box, and center-page containers', () => {
			const html = `
				<div class="letter-box">
					<p>Nội dung trong hộp viền</p>
					<div class="letter">
						<p>Thư lồng trong hộp</p>
					</div>
				</div>
				<div class="poem">
					<p>Sông Mã xa rồi Tây Tiến ơi</p>
					<p>Nhớ về rừng núi nhớ chơi vơi</p>
				</div>
				<div class="letter">
					<p>Gửi người phương xa,</p>
					<p>Tôi vẫn khỏe.</p>
				</div>
				<section class="center-page">
					<div class="center-page-content">
						<p>Trang Căn Giữa Độc Lập</p>
					</div>
				</section>
			`;
			const text = htmlToCleanText(html);
			expect(text).toContain(
				'[letter-box]\nNội dung trong hộp viền\n\n[letter]\nThư lồng trong hộp\n[/letter]\n[/letter-box]'
			);
			expect(text).toContain(
				'[poem]\nSông Mã xa rồi Tây Tiến ơi\nNhớ về rừng núi nhớ chơi vơi\n[/poem]'
			);
			expect(text).toContain('[letter]\nGửi người phương xa,\nTôi vẫn khỏe.\n[/letter]');
			expect(text).toContain('[new:center]\nTrang Căn Giữa Độc Lập\n[/new]');
		});

		it('should convert [poem] nested inside [letter] and [letter-box] accurately', () => {
			const html = `
				<div class="letter">
					<p>Thư gửi em,</p>
					<div class="poem">
						<p>Ánh trăng đầu ngõ</p>
						<p>Gió thổi qua thềm</p>
					</div>
					<p>Thương nhớ nhiều,</p>
				</div>
				<div class="letter-box">
					<p>Hộp lời tựa</p>
					<div class="poem">
						<p>Bài thơ trong hộp</p>
					</div>
					<p>Hộp kết</p>
				</div>
			`;
			const text = htmlToCleanText(html);
			expect(text).toContain(
				'[letter]\nThư gửi em,\n\n[poem]\nÁnh trăng đầu ngõ\nGió thổi qua thềm\n[/poem]\n\nThương nhớ nhiều,\n[/letter]'
			);
			expect(text).toContain(
				'[letter-box]\nHộp lời tựa\n\n[poem]\nBài thơ trong hộp\n[/poem]\n\nHộp kết\n[/letter-box]'
			);
		});

		it('should convert 3-level nesting [letter-box] -> [letter] -> [poem] accurately', () => {
			const html = `
				<div class="letter-box">
					<p>Đầu hộp</p>
					<div class="letter">
						<p>Thư trong hộp</p>
						<div class="poem">
							<p>Thơ trong thư</p>
						</div>
					</div>
				</div>
			`;
			const text = htmlToCleanText(html);
			expect(text).toContain(
				'[letter-box]\nĐầu hộp\n\n[letter]\nThư trong hộp\n\n[poem]\nThơ trong thư\n[/poem]\n[/letter]\n[/letter-box]'
			);
		});
	});

	describe('extractEpubToTxt', () => {
		it('should read mock EPUB zip with footnotes and reverse all syntax accurately', async () => {
			const zip = new JSZip();

			// Add container.xml
			zip.file(
				'META-INF/container.xml',
				`<?xml version="1.0"?>
				<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
					<rootfiles>
						<rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
					</rootfiles>
				</container>`
			);

			// Add content.opf
			zip.file(
				'OEBPS/content.opf',
				`<?xml version="1.0" encoding="utf-8"?>
				<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="BookId" version="3.0">
					<metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
						<dc:title>Sách Thử Nghiệm</dc:title>
						<dc:creator>Tác Giả Mẫu</dc:creator>
					</metadata>
					<manifest>
						<item id="c1" href="chap1.xhtml" media-type="application/xhtml+xml"/>
						<item id="c2" href="chap2.xhtml" media-type="application/xhtml+xml"/>
						<item id="notes" href="notes.xhtml" media-type="application/xhtml+xml"/>
					</manifest>
					<spine>
						<itemref idref="c1"/>
						<itemref idref="c2"/>
						<itemref idref="notes"/>
					</spine>
				</package>`
			);

			// Add chapters
			zip.file(
				'OEBPS/chap1.xhtml',
				`<?xml version="1.0" encoding="utf-8"?>
				<!DOCTYPE html>
				<html xmlns="http://www.w3.org/1999/xhtml">
				<body>
					<h1 class="main-chap center">Chương 1: Khởi Đầu</h1>
					<p>Đoạn văn mở đầu với từ <a class="noteref" href="notes.xhtml#fn1"><sup>1</sup></a> và chữ <b>in đậm</b>.</p>
					<figure class="illust-box">
						<img class="illust-img" src="../images/hinh-1.png" alt="hinh-1"/>
					</figure>
				</body>
				</html>`
			);

			zip.file(
				'OEBPS/chap2.xhtml',
				`<?xml version="1.0" encoding="utf-8"?>
				<!DOCTYPE html>
				<html xmlns="http://www.w3.org/1999/xhtml">
				<body>
					<h1 class="main-chap center">Chương 2: Kết Thúc</h1>
					<blockquote class="center">
						<p>Vạn sự tùy duyên.</p>
						<footer>Cổ Nhân</footer>
					</blockquote>
				</body>
				</html>`
			);

			zip.file(
				'OEBPS/notes.xhtml',
				`<?xml version="1.0" encoding="utf-8"?>
				<!DOCTYPE html>
				<html xmlns="http://www.w3.org/1999/xhtml">
				<head><title>Chú thích</title></head>
				<body>
					<h1 class="main-chap center">Chú thích:</h1>
					<aside epub:type="footnote" id="fn1" class="note">
						<p><a class="notenum" href="chap1.xhtml#fnref1">1.</a> Từ ngữ cổ trong văn học.</p>
					</aside>
				</body>
				</html>`
			);

			const result = await extractEpubToTxt(zip);

			expect(result.title).toBe('Sách Thử Nghiệm');
			expect(result.author).toBe('Tác Giả Mẫu');
			expect(result.chapterCount).toBe(3);
			expect(result.fileName).toBe('sach-thu-nghiem.txt');

			// Verify reverse engine syntax in final extracted text
			expect(result.text).toContain('@@ Chương 1: Khởi Đầu');
			expect(result.text).toContain('Đoạn văn mở đầu với từ {1} và chữ *in đậm*.');
			expect(result.text).toContain('[hinh-1]');
			expect(result.text).toContain('@@ Chương 2: Kết Thúc');
			expect(result.text).toContain('~ Vạn sự tùy duyên.\n> Cổ Nhân');
			expect(result.text).toContain('Chú thích:\n{1} Từ ngữ cổ trong văn học.');
		});
	});

	describe('extractEpubToTxt — Complete Extraction & Content Fidelity', () => {
		function createSampleEpubZip(
			chapters: Array<{ id: string; href: string; content: string }>,
			options: { opfPath?: string; title?: string; author?: string; spineIds?: string[] } = {}
		): JSZip {
			const zip = new JSZip();
			const opfPath = options.opfPath ?? 'OEBPS/content.opf';
			const opfDir = opfPath.includes('/') ? opfPath.slice(0, opfPath.lastIndexOf('/') + 1) : '';
			const title = options.title ?? 'Sách Kiểm Tra';
			const author = options.author ?? 'Tác Giả';
			const spineIds = options.spineIds ?? chapters.map((c) => c.id);

			zip.file('mimetype', 'application/epub+zip');
			zip.file(
				'META-INF/container.xml',
				`<?xml version="1.0" encoding="utf-8"?>
				<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
					<rootfiles>
						<rootfile full-path="${opfPath}" media-type="application/oebps-package+xml"/>
					</rootfiles>
				</container>`
			);

			const manifestItems = chapters
				.map((c) => `<item id="${c.id}" href="${c.href}" media-type="application/xhtml+xml"/>`)
				.join('\n\t\t\t\t');
			const spineItems = spineIds.map((id) => `<itemref idref="${id}"/>`).join('\n\t\t\t\t');

			zip.file(
				opfPath,
				`<?xml version="1.0" encoding="utf-8"?>
				<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="BookId" version="3.0">
					<metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
						<dc:title>${title}</dc:title>
						<dc:creator>${author}</dc:creator>
					</metadata>
					<manifest>
						${manifestItems}
					</manifest>
					<spine>
						${spineItems}
					</spine>
				</package>`
			);

			for (const ch of chapters) {
				const resolvedHref = ch.href.startsWith('../')
					? ch.href.replace('../', '')
					: `${opfDir}${ch.href}`;
				zip.file(
					resolvedHref,
					`<?xml version="1.0" encoding="utf-8"?>
					<!DOCTYPE html>
					<html xmlns="http://www.w3.org/1999/xhtml">
					<head><title>${title}</title></head>
					<body>
						${ch.content}
					</body>
					</html>`
				);
			}

			return zip;
		}

		it('1. puts each consecutive plain <p> on its own newline (never space-joined)', async () => {
			const zip = createSampleEpubZip([
				{
					id: 'c1',
					href: 'Text/c1.xhtml',
					content: '<h1>Chương 1</h1><p>noi dung1</p><p>noi dung 2</p><p>noi dung 3</p>'
				}
			]);

			const result = await extractEpubToTxt(zip);
			expect(result.text).toBe('@@ Chương 1\n\nnoi dung1\nnoi dung 2\nnoi dung 3');
		});

		it('2. preserves spaces across inline elements (including whitespace inside inline tags)', async () => {
			const zip = createSampleEpubZip([
				{
					id: 'c1',
					href: 'c1.xhtml',
					content:
						'<p>Từ<b> </b>thứ<i> </i>nhất <span class="w">hai</span> <em class="x">ba</em> <strong>bốn</strong>.</p>'
				}
			]);

			const result = await extractEpubToTxt(zip);
			expect(result.text).toContain('Từ thứ nhất hai /ba/ *bốn*.');
		});

		it('3. preserves Vietnamese Unicode diacritics and special punctuation verbatim', async () => {
			const sample =
				'Trăm năm trong cõi người ta — chữ tài, chữ mệnh khéo là ghét nhau… «Thử dấu» & dấu "ngoặc"!';
			const zip = createSampleEpubZip([
				{
					id: 'c1',
					href: 'c1.xhtml',
					content: `<p>${sample.replace('&', '&amp;')}</p>`
				}
			]);

			const result = await extractEpubToTxt(zip);
			expect(result.text).toBe(sample);
		});

		it('4. decodes named, decimal, and hex HTML entities accurately', async () => {
			const zip = createSampleEpubZip([
				{
					id: 'c1',
					href: 'c1.xhtml',
					content:
						'<p>&ldquo;A &amp; B&rdquo; &mdash; &#169; &#x2026; &lt;tag&gt; &nbsp;&nbsp;X</p>'
				}
			]);

			const result = await extractEpubToTxt(zip);
			expect(result.text).toBe('“A & B” — © … <tag> X');
		});

		it('5. extracts deeply nested elements without losing content or leaking raw tags', async () => {
			const zip = createSampleEpubZip([
				{
					id: 'c1',
					href: 'c1.xhtml',
					content: `
						<section class="chapter">
							<div class="outer">
								<div class="inner">
									<div class="leaf">
										<p>Nội dung <span class="a"><span class="b">lồng sâu</span></span> đầy đủ.</p>
									</div>
								</div>
							</div>
						</section>
					`
				}
			]);

			const result = await extractEpubToTxt(zip);
			expect(result.text).toBe('Nội dung lồng sâu đầy đủ.');
		});

		it('6. preserves all headings in exact document order', async () => {
			const zip = createSampleEpubZip([
				{
					id: 'c1',
					href: 'c1.xhtml',
					content: `
						<p>Lời mở đầu.</p>
						<h1>Phần Một</h1>
						<h2 class="section-heading">Mục 1.1</h2>
						<p>Đoạn A.</p>
						<h3>Tiểu mục 1.1.1</h3>
						<p>Đoạn B.</p>
						<h4>Ghi chú nhỏ</h4>
					`
				}
			]);

			const result = await extractEpubToTxt(zip);
			const lines = result.text.split('\n').filter((l) => l.trim().length > 0);
			expect(lines).toEqual([
				'Lời mở đầu.',
				'@@ Phần Một',
				'@ Mục 1.1',
				'Đoạn A.',
				'@ Tiểu mục 1.1.1',
				'Đoạn B.',
				'@ Ghi chú nhỏ'
			]);
		});

		it('7. preserves <br> line breaks inside paragraphs, headings, and prose blocks', async () => {
			const zip = createSampleEpubZip([
				{
					id: 'c1',
					href: 'c1.xhtml',
					content: '<p>Dòng một<br/>Dòng hai<br />Dòng ba</p>'
				}
			]);

			const result = await extractEpubToTxt(zip);
			expect(result.text).toBe('Dòng một\nDòng hai\nDòng ba');
		});

		it('8. preserves line breaks in multi-stanza poem blocks and letter blocks', async () => {
			const zip = createSampleEpubZip([
				{
					id: 'c1',
					href: 'c1.xhtml',
					content: `
						<div class="poem">
							<div class="stanza">
								<p>Khổ thơ một dòng 1<br/>Khổ thơ một dòng 2</p>
							</div>
							<div class="stanza">
								<p>Khổ thơ hai dòng 1</p>
								<p>Khổ thơ hai dòng 2</p>
							</div>
						</div>
						<div class="letter">
							<div class="letter-inner">
								<p>Thân gửi bạn,</p>
								<p>Đây là nội dung thư.</p>
							</div>
						</div>
					`
				}
			]);

			const result = await extractEpubToTxt(zip);
			expect(result.text).toContain(
				'[poem]\nKhổ thơ một dòng 1\nKhổ thơ một dòng 2\n\nKhổ thơ hai dòng 1\nKhổ thơ hai dòng 2\n[/poem]'
			);
			expect(result.text).toContain('[letter]\nThân gửi bạn,\nĐây là nội dung thư.\n[/letter]');
		});

		it('9. preserves all paragraphs and attribution inside blockquote without truncation', async () => {
			const zip = createSampleEpubZip([
				{
					id: 'c1',
					href: 'c1.xhtml',
					content: `
						<blockquote>
							<div class="quote-body">
								<p>Trích dẫn đoạn một.</p>
								<p>Trích dẫn đoạn hai<br/>xuống dòng.</p>
							</div>
							<footer>— Tác Giả Trích Dẫn</footer>
						</blockquote>
					`
				}
			]);

			const result = await extractEpubToTxt(zip);
			expect(result.text).toBe(
				'~ Trích dẫn đoạn một.\n~ Trích dẫn đoạn hai\n~ xuống dòng.\n> — Tác Giả Trích Dẫn'
			);
		});

		it('10. extracts footnote references and endnotes consistently while keeping non-footnote <aside> content', async () => {
			const zip = createSampleEpubZip([
				{
					id: 'c1',
					href: 'c1.xhtml',
					content: `
						<p>Khái niệm <a epub:type="noteref" href="notes.xhtml#fn1">[1]</a> và ghi chú <a class="noteref" href="#fn2"><sup>2</sup></a>.</p>
						<aside class="callout-box">
							<p>Hộp thông tin bổ sung không phải chú thích cuối trang.</p>
						</aside>
					`
				},
				{
					id: 'notes',
					href: 'notes.xhtml',
					content: `
						<h1 class="main-chap center">Chú thích:</h1>
						<aside epub:type="footnote" id="fn1" class="note">
							<p><a class="notenum" href="c1.xhtml">1.</a> Giải thích số một.</p>
						</aside>
						<aside epub:type="footnote" id="fn2" class="note">
							<p><a class="notenum" href="c1.xhtml">2.</a> Giải thích số hai.</p>
						</aside>
					`
				}
			]);

			const result = await extractEpubToTxt(zip);
			expect(result.text).toContain('Khái niệm {1} và ghi chú {2}.');
			expect(result.text).toContain('Hộp thông tin bổ sung không phải chú thích cuối trang.');
			expect(result.text).toContain('Chú thích:\n{1} Giải thích số một.\n{2} Giải thích số hai.');
		});

		it('11. extracts multiple XHTML files strictly in OPF <spine> order even when out of alphabetical order', async () => {
			const zip = createSampleEpubZip(
				[
					{
						id: 'zeta',
						href: 'Text/z_first.xhtml',
						content: '<h1>Đoạn Đầu Spine</h1><p>Thứ nhất</p>'
					},
					{
						id: 'alpha',
						href: 'Text/a_second.xhtml',
						content: '<h1>Đoạn Giữa Spine</h1><p>Thứ hai</p>'
					},
					{
						id: 'mid',
						href: 'Text/m_third.xhtml',
						content: '<h1>Đoạn Cuối Spine</h1><p>Thứ ba</p>'
					}
				],
				{
					opfPath: 'OEBPS/content.opf',
					spineIds: ['zeta', 'alpha', 'mid']
				}
			);

			const result = await extractEpubToTxt(zip);
			const idx1 = result.text.indexOf('Thứ nhất');
			const idx2 = result.text.indexOf('Thứ hai');
			const idx3 = result.text.indexOf('Thứ ba');
			expect(idx1).toBeGreaterThan(-1);
			expect(idx2).toBeGreaterThan(idx1);
			expect(idx3).toBeGreaterThan(idx2);
			expect(result.chapterCount).toBe(3);
		});

		it('12. does NOT invent synthetic [new] or fake heading markers absent from EPUB', async () => {
			const zip = createSampleEpubZip([
				{
					id: 'c1',
					href: 'c1.xhtml',
					content: '<p>Chỉ có nội dung bình thường không có tiêu đề.</p>'
				},
				{
					id: 'c2',
					href: 'c2.xhtml',
					content: '<h2>Tiêu đề phụ</h2><p>Văn bản tiếp theo.</p>'
				}
			]);

			const result = await extractEpubToTxt(zip);
			expect(result.text).not.toContain('[new]');
			expect(result.text).not.toContain('[/new]');
			expect(result.text).toContain('Chỉ có nội dung bình thường không có tiêu đề.');
			expect(result.text).toContain('@ Tiêu đề phụ\n\nVăn bản tiếp theo.');
		});

		it('13. does NOT drop content inside unrecognized blocks (article, ul/li, table, dl, figcaption)', async () => {
			const zip = createSampleEpubZip([
				{
					id: 'c1',
					href: 'c1.xhtml',
					content: `
						<article>
							<header><p>Đầu bài viết</p></header>
							<ul>
								<li>Mục danh sách một</li>
								<li>Mục danh sách hai</li>
							</ul>
							<table>
								<tr><th>Cột A</th><th>Cột B</th></tr>
								<tr><td>Giá trị 1</td><td>Giá trị 2</td></tr>
							</table>
							<dl>
								<dt>Thuật ngữ</dt>
								<dd>Định nghĩa đầy đủ</dd>
							</dl>
							<figure>
								<img src="../images/map.png" alt="bản đồ"/>
								<figcaption>Chú thích ảnh bản đồ</figcaption>
							</figure>
						</article>
					`
				}
			]);

			const result = await extractEpubToTxt(zip);
			expect(result.text).toContain('Đầu bài viết');
			expect(result.text).toContain('Mục danh sách một');
			expect(result.text).toContain('Mục danh sách hai');
			expect(result.text).toContain('Cột A');
			expect(result.text).toContain('Giá trị 1');
			expect(result.text).toContain('Thuật ngữ');
			expect(result.text).toContain('Định nghĩa đầy đủ');
			expect(result.text).toContain('[map]');
			expect(result.text).toContain('Chú thích ảnh bản đồ');
		});

		it('14. handles invalid EPUB archives or missing META-INF/OPF safely with descriptive errors', async () => {
			const missingContainerZip = new JSZip();
			missingContainerZip.file('mimetype', 'application/epub+zip');
			await expect(extractEpubToTxt(missingContainerZip)).rejects.toThrow(
				'Không tìm thấy file content.opf trong EPUB.'
			);

			const brokenOpfRefZip = new JSZip();
			brokenOpfRefZip.file(
				'META-INF/container.xml',
				`<?xml version="1.0"?><container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="OEBPS/missing.opf"/></rootfiles></container>`
			);
			await expect(extractEpubToTxt(brokenOpfRefZip)).rejects.toThrow(
				'Không tìm thấy file content.opf trong EPUB.'
			);

			const corruptedBlob = new Blob(['not a valid epub archive'], {
				type: 'application/epub+zip'
			});
			await expect(extractEpubToTxt(corruptedBlob)).rejects.toThrow();

			const emptySpineZip = new JSZip();
			emptySpineZip.file(
				'META-INF/container.xml',
				`<?xml version="1.0"?><container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="content.opf"/></rootfiles></container>`
			);
			emptySpineZip.file(
				'content.opf',
				`<?xml version="1.0"?><package><metadata></metadata><manifest></manifest><spine></spine></package>`
			);
			const emptyResult = await extractEpubToTxt(emptySpineZip);
			expect(emptyResult.text).toBe('');
			expect(emptyResult.chapterCount).toBe(0);
		});

		it('15. normalizes same-chapter external EPUB footnotes (backref + span[n] + per-chapter fn-X-Y reset) into global Chú thích: {1}, {2}...', async () => {
			const zip = createSampleEpubZip([
				{
					id: 'c1',
					href: 'Text/chap01.xhtml',
					content: `
						<h1>Chương 1</h1>
						<p>trước áo quan<a id="fnref-1-1" href="#fn-1-1" class="noteref" epub:type="noteref" role="doc-noteref">[1]</a> cho mình,</p>
						<p>lại nhắc áo quan<a href="#fn-1-1" class="noteref" epub:type="noteref">[1]</a> lần nữa.</p>
						<aside epub:type="footnote" id="fn-1-1" role="doc-footnote" class="footnote-item">
							<p><a href="#fnref-1-1" class="footnote-backref" aria-label="Quay lại chú thích 1">↩</a> <span>[1]</span> <strong>Áo quan</strong>: Cách gọi tôn kính và kiêng kỵ trong nghi lễ tang ma truyền thống Á Đông để chỉ cỗ quan tài gỗ dùng để an táng thi thể người quá cố.</p>
						</aside>
					`
				},
				{
					id: 'c2',
					href: 'Text/chap02.xhtml',
					content: `
						<h1>Chương 2</h1>
						<p>Điểm mốc thứ nhất<a id="fnref-2-1" href="#fn-2-1" class="noteref" epub:type="noteref" role="doc-noteref">[1]</a> và năm 1945<a id="fnref-2-2" href="#fn-2-2" class="noteref" epub:type="noteref" role="doc-noteref">[2]</a>.</p>
						<aside class="sidebar">Ghi chú khung phụ bên lề vẫn giữ nguyên.</aside>
						<section epub:type="footnotes">
							<aside epub:type="footnote" id="fn-2-1" role="doc-footnote" class="footnote-item">
								<p><a href="#fnref-2-1" class="footnote-backref">↩</a> <span>[1]</span> Giải thích mục một của chương hai.</p>
							</aside>
							<aside epub:type="footnote" id="fn-2-2" role="doc-footnote" class="footnote-item">
								<p>[2] 1945 là mốc thời gian cụ thể <a href="#fnref-2-2" role="doc-backlink">↑</a></p>
							</aside>
						</section>
					`
				}
			]);

			const result = await extractEpubToTxt(zip);

			// Body text must have {1}, {1} (reused), {2}, {3} and NO raw footnote aside text or backref arrows
			expect(result.text).toContain('trước áo quan{1} cho mình,');
			expect(result.text).toContain('lại nhắc áo quan{1} lần nữa.');
			expect(result.text).toContain('Điểm mốc thứ nhất{2} và năm 1945{3}.');
			expect(result.text).toContain('Ghi chú khung phụ bên lề vẫn giữ nguyên.');
			expect(result.text).not.toContain('↩');
			expect(result.text).not.toContain('↑');

			// All footnotes must be cleanly standardized and globally numbered in Chú thích: at end
			expect(result.text).toContain(
				[
					'Chú thích:',
					'{1} *Áo quan*: Cách gọi tôn kính và kiêng kỵ trong nghi lễ tang ma truyền thống Á Đông để chỉ cỗ quan tài gỗ dùng để an táng thi thể người quá cố.',
					'{2} Giải thích mục một của chương hai.',
					'{3} 1945 là mốc thời gian cụ thể'
				].join('\n')
			);
		});
	});
});
