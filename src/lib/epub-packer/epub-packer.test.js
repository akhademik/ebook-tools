import { describe, it, expect } from 'vitest';
import {
	buildChapterXhtml,
	buildContainerXml,
	buildTocNcx,
	buildContentOpf,
	buildNavXhtml,
	mergeBrokenParagraphs
} from './epub-packer.js';

describe('epub-packer tests', () => {
	describe('buildChapterXhtml', () => {
		it('should wrap title and body in standard EPUB XHTML structure', () => {
			const html = buildChapterXhtml({ language: 'vi' }, { title: 'Chương 1', html: '<p>Nội dung</p>' });
			expect(html).toContain('<title>Chương 1</title>');
			expect(html).toContain('<p>Nội dung</p>');
			expect(html).toContain('http://www.w3.org/1999/xhtml');
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
	});
});
