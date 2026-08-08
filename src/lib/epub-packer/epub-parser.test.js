import { describe, it, expect } from 'vitest';
import {
	cleanHeaderFooterOcr,
	parseMarkdownBlocks,
	groupChapters,
	getCleanedLinesReport,
	analyzeChapterCandidates,
	convertTxtInline,
	parseTxtToChapters
} from './epub-parser.js';

describe('epub-parser tests', () => {
	describe('cleanHeaderFooterOcr', () => {
		it('should clean arabic numbers when {no} is passed', () => {
			const text = 'Header\n123\nLine 3\nLine 4\nLine 5\n456';
			const cleaned = cleanHeaderFooterOcr(text, ['{no}'], 2);
			expect(cleaned).toBe('Header\nLine 3\nLine 4\nLine 5');
		});

		it('should clean roman numerals when {roman_no} is passed', () => {
			const text = 'iv\nLine 2\nLine 3\nLine 4\nLine 5\nXII';
			const cleaned = cleanHeaderFooterOcr(text, ['{roman_no}'], 2);
			expect(cleaned).toBe('Line 2\nLine 3\nLine 4\nLine 5');
		});

		it('should clean keyword matches case-insensitively', () => {
			const text = 'My Novel Title\nLine 2\nLine 3\nLine 4\nLine 5\nPublisher Name';
			const cleaned = cleanHeaderFooterOcr(text, ['novel title', 'publisher name'], 2);
			expect(cleaned).toBe('Line 2\nLine 3\nLine 4\nLine 5');
		});

		it('should only clean lines within lineLimit scanned range', () => {
			const text = 'Line 1\nLine 2\nLine 3\n123\nLine 5\nLine 6\nLine 7';
			const cleaned = cleanHeaderFooterOcr(text, ['{no}'], 2);
			expect(cleaned).toBe('Line 1\nLine 2\nLine 3\n123\nLine 5\nLine 6\nLine 7');
		});

		it('should skip cleaning if file has less than 6 lines', () => {
			const text = 'Header\n123\nLine 3\nLine 4\n456';
			const cleaned = cleanHeaderFooterOcr(text, ['{no}'], 2);
			expect(cleaned).toBe(text);
		});

		it('should skip cleaning if first line is a real paragraph', () => {
			const text = 'This is a complete first paragraph of text.\nLine 2\nLine 3\nLine 4\nLine 5\n123';
			const cleaned = cleanHeaderFooterOcr(text, ['{no}'], 2);
			expect(cleaned).toBe(text);
		});

		it('should skip cleaning if last line is a real paragraph', () => {
			const text = '123\nLine 2\nLine 3\nLine 4\nLine 5\nThis is a complete last paragraph of text.';
			const cleaned = cleanHeaderFooterOcr(text, ['{no}'], 2);
			expect(cleaned).toBe(text);
		});
	});

	describe('parseMarkdownBlocks', () => {
		it('should parse headings and paragraphs correctly', () => {
			const md = '# Title\nParagraph text\n## Subtitle';
			const blocks = parseMarkdownBlocks(md);
			expect(blocks).toHaveLength(3);
			expect(blocks[0]).toEqual({ type: 'heading', level: 1, text: 'Title' });
			expect(blocks[1]).toEqual({ type: 'p', text: 'Paragraph text' });
			expect(blocks[2]).toEqual({ type: 'heading', level: 2, text: 'Subtitle' });
		});
	});

	describe('getCleanedLinesReport', () => {
		it('should return a report of all scanned lines with their removed status', () => {
			const files = [
				{
					baseName: 'chap1',
					rawText: 'My Title\nLine 2\nLine 3\nLine 4\nLine 5\n123'
				}
			];
			const report = getCleanedLinesReport(files, 'My Title, {no}', 2);
			expect(report).toHaveLength(1);
			expect(report[0].fileName).toBe('chap1');
			expect(report[0].scanned).toHaveLength(4);
			
			expect(report[0].scanned[0]).toEqual({
				lineNum: 1,
				text: 'My Title',
				location: 'Đầu file',
				isRemoved: true
			});
			expect(report[0].scanned[1]).toEqual({
				lineNum: 2,
				text: 'Line 2',
				location: 'Đầu file',
				isRemoved: false
			});
			expect(report[0].scanned[2]).toEqual({
				lineNum: 5,
				text: 'Line 5',
				location: 'Cuối file',
				isRemoved: false
			});
			expect(report[0].scanned[3]).toEqual({
				lineNum: 6,
				text: '123',
				location: 'Cuối file',
				isRemoved: true
			});
		});
	});

	describe('groupChapters', () => {
		it('should group files correctly when no split marker is matched', () => {
			const files = [
				{
					baseName: 'File 1',
					path: 'file1.md',
					blocks: [
						{ type: 'heading', level: 1, text: 'Chương 1' },
						{ type: 'p', text: 'Nội dung 1' }
					]
				},
				{
					baseName: 'File 2',
					path: 'file2.md',
					blocks: [
						{ type: 'p', text: 'Nội dung 2' }
					]
				}
			];
			const grouped = groupChapters(files, '', false, 1, 2);
			expect(grouped).toHaveLength(2);
			expect(grouped[0].title).toBe('Chương 1');
			expect(grouped[0].isChapter).toBe(false);
			expect(grouped[1].title).toBe('File 2');
			expect(grouped[1].isChapter).toBe(false);
		});

		it('should split chapters when regex matches', () => {
			const files = [
				{
					baseName: 'File 1',
					path: 'file1.md',
					blocks: [
						{ type: 'p', text: 'Giới thiệu' },
						{ type: 'heading', level: 1, text: 'Chương I: Khởi đầu' },
						{ type: 'p', text: 'Nội dung chương I' }
					]
				}
			];
			const grouped = groupChapters(files, '/Chương [IVXLCDM]+/i', false, 1, 1);
			expect(grouped).toHaveLength(2);
			expect(grouped[0].title).toBe('File 1');
			expect(grouped[0].isChapter).toBe(false);
			expect(grouped[1].title).toBe('Chương I: Khởi đầu');
			expect(grouped[1].isChapter).toBe(true);
		});
	});

	describe('analyzeChapterCandidates', () => {
		it('should find and score chapter heading candidates', () => {
			const files = [
				{
					baseName: 'File 1',
					blocks: [
						{ type: 'heading', level: 1, text: 'Chương I: Mở đầu' },
						{ type: 'p', text: 'Đây là nội dung.' }
					]
				}
			];
			const candidates = analyzeChapterCandidates(files, '/Chương [IVXLCDM]+/i', false, 1, 1, 5);
			expect(candidates).toHaveLength(2);
			expect(candidates[0].text).toBe('Chương I: Mở đầu');
			expect(candidates[0].regexMatch).toBe(true);
			expect(candidates[0].isMatch).toBe(true);
			expect(candidates[1].text).toBe('Đây là nội dung.');
			expect(candidates[1].regexMatch).toBe(false);
			expect(candidates[1].isMatch).toBe(false);
		});
	});

	describe('convertTxtInline & parseTxtToChapters', () => {
		it('should convert custom syntax tags to HTML tags correctly', () => {
			const text = 'Nội dung với #tiêu đề phụ#, *nghiêng* và **đậm**';
			const html = convertTxtInline(text, { h2Delim: '#', emDelim: '*', strongDelim: '**' });
			expect(html).toBe('Nội dung với <h2>tiêu đề phụ</h2>, <em>nghiêng</em> và <strong>đậm</strong>');
		});

		it('should parse single .txt file into chapters based on ##h1## delimiter', () => {
			const txt = `## Giới thiệu ##
Lời mở đầu bài viết.

## Chương 1: Bắt đầu ##
# 1.1 Khởi động #
Đoạn văn chương 1.
Có từ *quan trọng*.`;

			const chapters = parseTxtToChapters(txt, {
				h1Delim: '##',
				h2Delim: '#',
				emDelim: '*',
				strongDelim: '**'
			}, 'Default Title');

			expect(chapters).toHaveLength(2);

			expect(chapters[0].title).toBe('Giới thiệu');
			expect(chapters[0].html).toContain('<h1>Giới thiệu</h1>');
			expect(chapters[0].html).toContain('<p>Lời mở đầu bài viết.</p>');

			expect(chapters[1].title).toBe('Chương 1: Bắt đầu');
			expect(chapters[1].html).toContain('<h1>Chương 1: Bắt đầu</h1>');
			expect(chapters[1].html).toContain('<h2>1.1 Khởi động</h2>');
			expect(chapters[1].html).toContain('<em>quan trọng</em>');
		});

		it('should join broken multi-line ##noi \\n dung## tags into a single chapter', () => {
			const txt = `##Chương 1:
Mở đầu##
Nội dung chương 1.

##Chương 2: Thử
nghiệm##
Nội dung chương 2.`;

			const chapters = parseTxtToChapters(txt, { h1Delim: '##' }, 'Mặc định');

			expect(chapters).toHaveLength(2);
			expect(chapters[0].title).toBe('Chương 1: Mở đầu');
			expect(chapters[0].html).toContain('<h1>Chương 1: Mở đầu</h1>');
			expect(chapters[1].title).toBe('Chương 2: Thử nghiệm');
			expect(chapters[1].html).toContain('<h1>Chương 2: Thử nghiệm</h1>');
		});

		it('should render page break sbreak class when encountering ••• delimiter', () => {
			const txt = `##Chương 1##
Nội dung phần 1.

•••

Nội dung phần 2.`;

			const chapters = parseTxtToChapters(txt, { h1Delim: '##', breakDelim: '•••' }, 'Chương 1');

			expect(chapters).toHaveLength(1);
			expect(chapters[0].html).toContain('<p class="sbreak">•••</p>');
		});
	});
});


