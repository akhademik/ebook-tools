import { describe, it, expect, vi } from 'vitest';
import {
	cleanHeaderFooterOcr,
	parseMarkdownBlocks,
	groupChapters,
	getCleanedLinesReport,
	analyzeChapterCandidates,
	convertTxtInline,
	parseTxtToChapters,
	renderMarkdownBlocks,
	assignSequentialChapterIds
} from '../src/lib/epub-packer/epub-parser.js';

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

		it('should parse fences, quotes, lists, hr, and consecutive paragraphs', () => {
			const md = [
				'```js',
				'const a = 1;',
				'```',
				'',
				'> Quote line 1',
				'> Quote line 2',
				'',
				'- Item 1',
				'- Item 2',
				'',
				'1. Num 1',
				'2. Num 2',
				'',
				'---',
				'',
				'Line one here',
				'and line two starts with lowercase.',
				'',
				'Another line ending in.',
				'Line three starts with capital.'
			].join('\n');

			const blocks = parseMarkdownBlocks(md);
			expect(blocks).toHaveLength(8);
			
			expect(blocks[0]).toEqual({ type: 'code', content: 'const a = 1;' });
			expect(blocks[1]).toEqual({ type: 'blockquote', text: 'Quote line 1 Quote line 2' });
			expect(blocks[2]).toEqual({ type: 'ul', items: ['Item 1', 'Item 2'] });
			expect(blocks[3]).toEqual({ type: 'ol', items: ['Num 1', 'Num 2'] });
			expect(blocks[4]).toEqual({ type: 'hr' });
			
			// Merged paragraph (lowercase nextLine)
			expect(blocks[5]).toEqual({ type: 'p', text: 'Line one here\nand line two starts with lowercase.' });
			
			// Not merged paragraph (starts with capital)
			expect(blocks[6]).toEqual({ type: 'p', text: 'Another line ending in.' });
			expect(blocks[7]).toEqual({ type: 'p', text: 'Line three starts with capital.' });
		});
	});

	describe('renderMarkdownBlocks', () => {
		it('should render various markdown blocks to HTML and extract title', () => {
			const blocks = [
				{ type: 'heading', level: 1, text: 'Title' },
				{ type: 'heading', level: 2, text: 'Subtitle with `code span`' },
				{ type: 'heading', level: 3, text: 'Heading 3' },
				{ type: 'p', text: 'Paragraph with **bold** and *italic* and ***bold italic*** and _other italic_' },
				{ type: 'blockquote', text: 'Quote text with [link](http://url)' },
				{ type: 'ul', items: ['Item 1 with ![img](img.png)', 'Item 2'] },
				{ type: 'ol', items: ['Num 1', 'Num 2'] },
				{ type: 'hr' },
				{ type: 'code', content: 'const x = 1;' }
			];

			const result = renderMarkdownBlocks(blocks);

			expect(result.title).toBe('Title');
			expect(result.html).toContain('<h1>Title</h1>');
			expect(result.html).toContain('<h2><span class="ch-title">Subtitle with <strong><em>CODESPAN</em></strong>0<strong><em>CODESPAN</em></strong></span></h2>');
			expect(result.html).toContain('<h3>Heading 3</h3>');
			expect(result.html).toContain('<p>Paragraph with <strong>bold</strong> and <em>italic</em> and <strong><em>bold italic</em></strong> and _other italic_</p>');
			expect(result.html).toContain('<blockquote><p>Quote text with <a href="http://url">link</a></p></blockquote>');
			expect(result.html).toContain('<ul>\n<li>Item 1 with <img alt="img" src="img.png"/></li>\n<li>Item 2</li>\n</ul>');
			expect(result.html).toContain('<ol>\n<li>Num 1</li>\n<li>Num 2</li>\n</ol>');
			expect(result.html).toContain('<hr/>');
			expect(result.html).toContain('<pre><code>const x = 1;</code></pre>');
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

		it('should append content of subsequent file without markers to the last active chapter', () => {
			const files = [
				{
					baseName: 'File 1',
					path: 'file1.md',
					blocks: [
						{ type: 'heading', level: 1, text: 'Chương 1' },
						{ type: 'hr' },
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
			const grouped = groupChapters(files, '/Chương [0-9]+/i', false, 1, 2);
			
			expect(grouped).toHaveLength(1);
			expect(grouped[0].title).toBe('Chương 1');
			expect(grouped[0].html).toContain('<h1>Chương 1</h1>');
			expect(grouped[0].html).toContain('<hr/>');
			expect(grouped[0].html).toContain('<p>Nội dung 1</p>');
			expect(grouped[0].html).toContain('<p>Nội dung 2</p>');
			expect(grouped[0].sources).toEqual(['file1.md', 'file2.md']);
		});

		it('should append leading blocks of a file to previous chapter if seenMarker is true', () => {
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
						{ type: 'p', text: 'Nội dung trước mốc.\nChương 2: Bắt đầu' }
					]
				}
			];
			const grouped = groupChapters(files, '/Chương [0-9]+/i', false, 1, 2);
			
			expect(grouped).toHaveLength(2);
			expect(grouped[0].title).toBe('Chương 1');
			expect(grouped[0].html).toContain('<p>Nội dung trước mốc.</p>');
			expect(grouped[0].sources).toEqual(['file1.md', 'file2.md (phần trước mốc)']);
			expect(grouped[1].title).toBe('Chương 2: Bắt đầu');
		});

		it('should split chapters using heuristic if useHeuristic is true', () => {
			const files = [
				{
					baseName: 'File 1',
					path: 'file1.md',
					blocks: [
						{ type: 'p', text: 'Nội dung trước.' },
						{ type: 'p', text: '**Chương 1**' },
						{ type: 'p', text: 'Nội dung sau.' }
					]
				}
			];
			// Since we pass a single file, limitOneChapter is false, isFirstNonEmpty is true for all blocks.
			const grouped = groupChapters(files, '', true, 1, 1, 5);
			expect(grouped).toHaveLength(2);
			expect(grouped[0].title).toBe('File 1');
			expect(grouped[0].isChapter).toBe(false);
			expect(grouped[1].title).toBe('Chương 1'); // **Chương 1** stripped to 'Chương 1'
			expect(grouped[1].isChapter).toBe(true);
		});

		it('should match plain string chapter markers (non-regex)', () => {
			const files = [
				{
					baseName: 'File 1',
					path: 'file1.md',
					blocks: [
						{ type: 'heading', level: 1, text: 'Chương 1: Bắt đầu' }
					]
				},
				{
					baseName: 'File 2',
					path: 'file2.md',
					blocks: [
						// "aChương" will be skipped, then "\nChương" will match
						{ type: 'p', text: 'aChương và\nChương 2' }
					]
				}
			];
			const grouped = groupChapters(files, 'Chương', false, 1, 2);
			expect(grouped).toHaveLength(2);
			expect(grouped[0].title).toBe('Chương 1: Bắt đầu');
			expect(grouped[1].title).toBe('Chương 2');
		});

		it('should handle invalid regex pattern and fallback to null matcher', () => {
			const files = [
				{
					baseName: 'File 1',
					path: 'file1.md',
					blocks: [
						{ type: 'heading', level: 1, text: 'Chương 1' }
					]
				}
			];
			// Invalid regex pattern
			const grouped = groupChapters(files, '/[a-z/', false, 1, 1);
			expect(grouped).toHaveLength(1);
			expect(grouped[0].title).toBe('Chương 1');
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

		it('should evaluate score correctly for long headings', () => {
			const files = [
				{
					baseName: 'File 1',
					blocks: [
						// Score will be reduced because length > 80
						{ type: 'heading', level: 1, text: 'Chương ' + 'A'.repeat(80) }
					]
				}
			];
			const candidates = analyzeChapterCandidates(files, '', true, 1, 1, 5);
			expect(candidates).toHaveLength(1);
			expect(candidates[0].score).toBeLessThan(5); // should be low score due to length > 80
		});
	});

	describe('assignSequentialChapterIds', () => {
		it('should assign sequential chapter ids and filenames', () => {
			const chapters = [
				{ isChapter: false, firstSourcePageNum: 1 },
				{ isChapter: true, firstSourcePageNum: 5 },
				{ isChapter: false, firstSourcePageNum: 12 },
				{ isChapter: true, firstSourcePageNum: 20 },
				{ isChapter: true, fileName: 'notes', isNotes: true }
			];
			const assigned = assignSequentialChapterIds(chapters);
			expect(assigned).toHaveLength(5);
			expect(assigned[0]).toEqual({
				isChapter: false,
				firstSourcePageNum: 1,
				fileName: 'p01',
				xmlId: 'p01'
			});
			expect(assigned[1]).toEqual({
				isChapter: true,
				firstSourcePageNum: 5,
				fileName: 'chap_01',
				xmlId: 'chap01'
			});
			expect(assigned[2]).toEqual({
				isChapter: false,
				firstSourcePageNum: 12,
				fileName: 'p12',
				xmlId: 'p12'
			});
			expect(assigned[3]).toEqual({
				isChapter: true,
				firstSourcePageNum: 20,
				fileName: 'chap_02',
				xmlId: 'chap02'
			});
			expect(assigned[4]).toEqual({
				isChapter: true,
				fileName: 'notes',
				isNotes: true,
				xmlId: 'notes'
			});
		});
	});

	describe('convertTxtInline & parseTxtToChapters', () => {
		it('should convert custom syntax tags to HTML tags correctly', () => {
			const text = 'Nội dung với *nghiêng*, [đậm] và $$$định nghĩa$$$';
			const html = convertTxtInline(text, [{ pattern: '$$$', tag: '<span class="xya">' }]);
			expect(html).toBe('Nội dung với <em>nghiêng</em>, <strong>đậm</strong> và <span class="xya">định nghĩa</span>');
		});

		it('should parse single .txt file into chapters based on ##h1# delimiter', () => {
			const txt = `## Giới thiệu #
Lời mở đầu bài viết.

## Chương 1: Bắt đầu #
# 1.1 Khởi động #
Đoạn văn chương 1.
Có từ *quan trọng*.`;

			const chapters = parseTxtToChapters(txt, {}, 'Default Title');

			expect(chapters).toHaveLength(2);

			expect(chapters[0].title).toBe('Giới thiệu');
			expect(chapters[0].html).toContain('<h1 class="chapter">Giới thiệu</h1>');
			expect(chapters[0].html).toContain('<p>Lời mở đầu bài viết.</p>');

			expect(chapters[1].title).toBe('Chương 1: Bắt đầu');
			expect(chapters[1].html).toContain('<h1 class="chapter">Chương 1: Bắt đầu</h1>');
			expect(chapters[1].html).toContain('<h2 class="chno">1.1 Khởi động</h2>');
			expect(chapters[1].html).toContain('<em>quan trọng</em>');
		});

		it('should join broken multi-line ##noi \\n dung# tags into a single chapter', () => {
			const txt = `##Chương 1:
Mở đầu#
Nội dung chương 1.

##Chương 2: Thử
nghiệm#
Nội dung chương 2.`;

			const chapters = parseTxtToChapters(txt, {}, 'Mặc định');

			expect(chapters).toHaveLength(2);
			expect(chapters[0].title).toBe('Chương 1: Mở đầu');
			expect(chapters[0].html).toContain('<h1 class="chapter">Chương 1: Mở đầu</h1>');
			expect(chapters[1].title).toBe('Chương 2: Thử nghiệm');
			expect(chapters[1].html).toContain('<h1 class="chapter">Chương 2: Thử nghiệm</h1>');
		});

		it('should render page break sbreak class when encountering ••• delimiter', () => {
			const txt = `##Chương 1#
Nội dung phần 1.

•••

Nội dung phần 2.`;

			const chapters = parseTxtToChapters(txt, {}, 'Chương 1');

			expect(chapters).toHaveLength(1);
			expect(chapters[0].html).toContain('<p class="sbreak sbreak-big" role="separator">• • •</p>');
		});

		it('should create a fallback chapter if text starts immediately without h1 delimiter', () => {
			const txt = `Lời mở đầu không có tiêu đề H1.
Tiếp tục lời mở đầu.`;
			const chapters = parseTxtToChapters(txt, {}, 'Mở đầu mặc định');
			expect(chapters).toHaveLength(1);
			expect(chapters[0].title).toBe('Mở đầu mặc định');
			expect(chapters[0].html).toContain('<p>Lời mở đầu không có tiêu đề H1.</p>\n<p>Tiếp tục lời mở đầu.</p>');
		});

		it('should create an empty fallback chapter if input text is empty', () => {
			const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
			const chapters = parseTxtToChapters('', {}, 'Mặc định trống');
			
			expect(chapters).toHaveLength(1);
			expect(chapters[0].title).toBe('Mặc định trống');
			expect(chapters[0].html).toBe('<p></p>\n');
			expect(consoleWarnSpy).toHaveBeenCalled();
			
			consoleWarnSpy.mockRestore();
		});

		it('should create a fallback chapter if text starts with an h2 header but no h1 header', () => {
			const txt = `# Tiêu đề phụ #
Nội dung phụ.`;
			const chapters = parseTxtToChapters(txt, {}, 'Mặc định');
			expect(chapters).toHaveLength(1);
			expect(chapters[0].title).toBe('Mặc định');
			expect(chapters[0].html).toContain('<h2 class="chno">Tiêu đề phụ</h2>');
			expect(chapters[0].html).toContain('<p>Nội dung phụ.</p>');
		});

		it('should process footnotes correctly and separate them into a notes chapter', () => {
			const txt = `## Chương 1 #
Đây là chương {1} và chương {2}.

Chú thích:
{1} Chú thích thứ nhất.
{2} Chú thích thứ hai.`;

			const chapters = parseTxtToChapters(txt, {}, 'Mặc định');

			expect(chapters).toHaveLength(2);

			expect(chapters[0].title).toBe('Chương 1');
			expect(chapters[0].html).toContain('<a class="noteref" epub:type="noteref" id="fnref1" href="notes.xhtml#fn1"><sup>1</sup></a>');
			expect(chapters[0].html).toContain('<a class="noteref" epub:type="noteref" id="fnref2" href="notes.xhtml#fn2"><sup>2</sup></a>');

			const notes = chapters[1];
			expect(notes.title).toBe('Chú thích');
			expect(notes.fileName).toBe('notes');
			expect(notes.isNotes).toBe(true);
			expect(notes.html).toContain('<h1 class="chapter">Chú thích:</h1>');
			expect(notes.html).toContain('<aside epub:type="footnote" id="fn1" class="note">');
			expect(notes.html).toContain('<a class="notenum" href="__FNREF_SRC_1__.xhtml#fnref1">1.</a> Chú thích thứ nhất.');
			expect(notes.html).toContain('<aside epub:type="footnote" id="fn2" class="note">');
			expect(notes.html).toContain('<a class="notenum" href="__FNREF_SRC_2__.xhtml#fnref2">2.</a> Chú thích thứ hai.');
		});

		it('should process boldright paragraph formatting correctly', () => {
			const txt = `## Chương 1 #
$Đây là văn bản kéo về lề bên phải$`;

			const chapters = parseTxtToChapters(txt, {}, 'Mặc định');

			expect(chapters).toHaveLength(1);
			expect(chapters[0].html).toContain('<p class="boldright">Đây là văn bản kéo về lề bên phải</p>');
		});
	});
});


