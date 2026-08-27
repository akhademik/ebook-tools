// tests/epub-to-txt.test.ts
import { describe, it, expect } from 'vitest';
import JSZip from 'jszip';
import {
	decodeHtmlEntities,
	cleanTextFormatting,
	htmlToCleanText,
	extractEpubToTxt
} from '../src/lib/epub-to-txt/epub-to-txt';

describe('EPUB to TXT Converter & Text Cleaning Rules', () => {
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
			const input = '&laquo;Ch&#224;o b&#7841;n&raquo; &amp; &quot;T&aacute;c ph&#7849;m&quot; &mdash; 100&#37;';
			const decoded = decodeHtmlEntities(input);
			expect(decoded).toContain('Chào bạn');
			expect(decoded).toContain('& "Tác phẩm" —');
		});
	});

	describe('htmlToCleanText', () => {
		it('should extract text from HTML and apply formatting rules', () => {
			const html = `
				<!DOCTYPE html>
				<html>
				<head>
					<title>Test Page</title>
					<style>body { color: red; }</style>
					<script>console.log("ignore");</script>
				</head>
				<body>
					<h1>Chương   1:   Khởi   đầu</h1>
					<p>Đây  là  đoạn  văn  thứ  nhất  với  nhiều  space.</p>
					<br/>
					<br/>
					<br/>
					<p>Đây  là  đoạn  văn  thứ  hai.</p>
				</body>
				</html>
			`;
			const text = htmlToCleanText(html);
			expect(text).not.toContain('style');
			expect(text).not.toContain('script');
			expect(text).toContain('Chương 1: Khởi đầu');
			expect(text).toContain('Đây là đoạn văn thứ nhất với nhiều space.');
			expect(text).toContain('Đây là đoạn văn thứ hai.');

			// Verify no double empty lines
			expect(text).not.toMatch(/\n\n\n+/);
			// Verify no double horizontal spaces
			expect(text).not.toMatch(/[ ]{2,}/);
		});
	});

	describe('extractEpubToTxt', () => {
		it('should read a mock EPUB zip and return structured TXT result', async () => {
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
					</manifest>
					<spine>
						<itemref idref="c1"/>
						<itemref idref="c2"/>
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
					<h2>Chương    1</h2>
					<p>Nội   dung    chương    một    với    khoảng    trắng.</p>
				</body>
				</html>`
			);

			zip.file(
				'OEBPS/chap2.xhtml',
				`<?xml version="1.0" encoding="utf-8"?>
				<!DOCTYPE html>
				<html xmlns="http://www.w3.org/1999/xhtml">
				<body>
					<h2>Chương    2</h2>
					<p>Nội   dung    chương    hai.</p>
				</body>
				</html>`
			);

			const result = await extractEpubToTxt(zip);

			expect(result.title).toBe('Sách Thử Nghiệm');
			expect(result.author).toBe('Tác Giả Mẫu');
			expect(result.chapterCount).toBe(2);
			expect(result.wordCount).toBeGreaterThan(5);
			expect(result.fileName).toBe('sach-thu-nghiem.txt');

			// Verify rules on final extracted text
			expect(result.text).toContain('Chương 1\n\nNội dung chương một với khoảng trắng.');
			expect(result.text).toContain('Chương 2\n\nNội dung chương hai.');
			expect(result.text).not.toMatch(/[ ]{2,}/);
			expect(result.text).not.toMatch(/\n\n\n+/);
		});
	});
});
