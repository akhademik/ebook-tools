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
			`;
			const text = htmlToCleanText(html);
			expect(text).toContain('~ Đây là lời thoại căn giữa.\n> Nguyễn Du');
			expect(text).toContain('~t Lời thoại căn trái.');
			expect(text).toContain('~p Lời thoại căn phải.');
			expect(text).toContain('~ Trích dẫn thông thường.\n> Hồ Chí Minh');
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

		it('should convert poem, letter, and center-page containers', () => {
			const html = `
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
				'[poem]\nSông Mã xa rồi Tây Tiến ơi\nNhớ về rừng núi nhớ chơi vơi\n[/poem]'
			);
			expect(text).toContain('[letter]\nGửi người phương xa,\nTôi vẫn khỏe.\n[/letter]');
			expect(text).toContain('[new:center]\nTrang Căn Giữa Độc Lập\n[/new]');
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
});
