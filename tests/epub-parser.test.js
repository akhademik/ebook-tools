import { describe, it, expect, vi } from 'vitest';
import fs from 'fs';
import path from 'path';
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
				{ type: 'p', text: 'Paragraph with **bold** and *italic* and ***bold italic*** and _other italic_ and <u>underline</u> and <ins>ins</ins>' },
				{ type: 'blockquote', text: 'Quote text with [link](http://url)' },
				{ type: 'ul', items: ['Item 1 with ![img](img.png)', 'Item 2'] },
				{ type: 'ol', items: ['Num 1', 'Num 2'] },
				{ type: 'hr' },
				{ type: 'code', content: 'const x = 1;' }
			];

			const result = renderMarkdownBlocks(blocks);

			expect(result.title).toBe('Title');
			expect(result.html).toContain('<h1>Title</h1>');
			expect(result.html).toContain('<h2><span class="ch-title">Subtitle with <b><i>CODESPAN</i></b>0<b><i>CODESPAN</i></b></span></h2>');
			expect(result.html).toContain('<h3>Heading 3</h3>');
			expect(result.html).toContain('<p>Paragraph with <b>bold</b> and <i>italic</i> and <b><i>bold italic</i></b> and <i>other italic</i> and <u>underline</u> and <u>ins</u></p>');
			expect(result.html).toContain('<blockquote><p>Quote text with <a href="http://url">link</a></p></blockquote>');
			expect(result.html).toContain('<ul>\n<li>Item 1 with <img alt="img" src="img.png"/></li>\n<li>Item 2</li>\n</ul>');
			expect(result.html).toContain('<ol>\n<li>Num 1</li>\n<li>Num 2</li>\n</ol>');
			expect(result.html).toContain('<hr/>');
			expect(result.html).toContain('<pre><code>const x = 1;</code></pre>');
		});

		it('should bypass formatting if ignoreMarkdownFormat option is true', () => {
			const blocks = [
				{ type: 'p', text: 'Paragraph with **bold** and *italic* and _underscore_ and <u>underline</u> and `code` and [link](url)' }
			];

			const result = renderMarkdownBlocks(blocks, { ignoreMarkdownFormat: true });

			expect(result.html).toBe('<p>Paragraph with **bold** and *italic* and _underscore_ and &lt;u&gt;underline&lt;/u&gt; and `code` and [link](url)</p>\n');
		});

		it('should support ***bold italic** (three stars opening, two stars closing) format', () => {
			const blocks = [
				{ type: 'p', text: 'Paragraph with ***bold italic** format' }
			];

			const result = renderMarkdownBlocks(blocks);

			expect(result.html).toBe('<p>Paragraph with <b><i>bold italic</i></b> format</p>\n');
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

		it('should match keyword chapter markers even if not the first non-empty block of the file', () => {
			const files = [
				{
					baseName: 'File 1',
					path: 'file1.md',
					blocks: [
						{ type: 'p', text: 'Tác giả: Nguyễn Văn A' },
						{ type: 'p', text: 'Thể loại: Truyện dài' },
						{ type: 'heading', level: 1, text: 'Chương 1: Khởi hành' },
						{ type: 'p', text: 'Nội dung truyện ở đây.' }
					]
				}
			];
			const grouped = groupChapters(files, 'Chương', false, 1, 1);
			expect(grouped).toHaveLength(2);
			expect(grouped[0].title).toBe('File 1');
			expect(grouped[0].isChapter).toBe(false);
			expect(grouped[1].title).toBe('Chương 1: Khởi hành');
			expect(grouped[1].isChapter).toBe(true);
		});

		it('should skip paragraph blocks in heuristic mode if they are in the middle of the file', () => {
			const files = [
				{
					baseName: 'File 1',
					path: 'file1.md',
					blocks: [
						{ type: 'heading', level: 1, text: 'Chương 1' },
						{ type: 'p', text: 'Dòng 1.' },
						{ type: 'p', text: 'Dòng 2.' },
						{ type: 'p', text: 'Dòng 3.' },
						{ type: 'p', text: 'Dòng 4.' },
						{ type: 'p', text: 'Dòng 5.' },
						{ type: 'p', text: 'Dòng 6.' },
						// This bold paragraph has high score but is at blockIndex 7 (nonEmptyCount = 8)
						{ type: 'p', text: '**Người La Mã đã hủy hoại tiền tệ của họ như thế nào**' },
						{ type: 'p', text: 'Dòng 8.' }
					]
				}
			];
			const grouped = groupChapters(files, '', true, 1, 1, 5);
			// It should split at block 0 (Chương 1) but NOT at block 7
			expect(grouped).toHaveLength(1);
			expect(grouped[0].title).toBe('Chương 1');
		});

		it('should ignore the file entirely in heuristic mode if the first block is a long paragraph', () => {
			const files = [
				{
					baseName: 'File 1',
					path: 'file1.md',
					blocks: [
						{ type: 'p', text: 'Đây là một đoạn văn rất dài và đầy đủ ý nghĩa, đóng vai trò là một phần nội dung tiếp diễn của chương trước đó chứ không phải là một tiêu đề chương mới.' },
						{ type: 'heading', level: 1, text: 'Chương 1' }
					]
				},
				{
					baseName: 'File 2',
					path: 'file2.md',
					blocks: [
						{ type: 'p', text: 'Nội dung tiếp theo.' }
					]
				}
			];
			const grouped = groupChapters(files, '', true, 1, 2, 5);
			// Since File 1 starts with a long paragraph, it ignores File 1's chapter marker.
			// And File 2 has no markers.
			// So it should return 2 items with isChapter = false.
			expect(grouped).toHaveLength(2);
			expect(grouped[0].isChapter).toBe(false);
			expect(grouped[0].title).toBe('Chương 1');
			expect(grouped[1].isChapter).toBe(false);
			expect(grouped[1].title).toBe('File 2');
		});

		it('should ignore the file entirely in heuristic mode if the first block is regular prose even if split into small paragraphs', () => {
			const files = [
				{
					baseName: 'File 1',
					path: 'file1.md',
					blocks: [
						{ type: 'p', text: 'kiến mọi thứ đổ vỡ. Như chúng ta sẽ thấy, trong lịch sử nghề đi' },
						{ type: 'p', text: 'tìm vàng, kiểu cốt truyện này tuyệt nhiên không phải là hiểm gặp.' },
						{ type: 'p', text: '**Một quả táo vàng châm ngòi cho cuộc đại chiến đầu tiên**\n**của lịch sử**' },
						{ type: 'p', text: '“Chỉ cần phân tích là sẽ thấy rất đơn giản... nguyên nhân của\nmọi cuộc chiến đều là vàng.”' }
					]
				},
				{
					baseName: 'File 2',
					path: 'file2.md',
					blocks: [
						{ type: 'p', text: 'Nội dung tiếp theo.' }
					]
				}
			];
			const grouped = groupChapters(files, '', true, 1, 2, 5);
			// Since File 1 starts with a regular paragraph, it ignores the entire file including the bold header.
			expect(grouped).toHaveLength(2);
			expect(grouped[0].isChapter).toBe(false);
			expect(grouped[0].title).toBe('File 1');
			expect(grouped[1].isChapter).toBe(false);
			expect(grouped[1].title).toBe('File 2');
		});

		it('should ignore the file entirely in heuristic mode if the first block starts with lowercase prose (user case)', () => {
			const files = [
				{
					baseName: 'File 1',
					path: 'file1.md',
					blocks: [
						{ type: 'p', text: 'quân đội, nhưng ông củng cố đế chế bằng tiền tệ: kiểm soát nguồn cung vàng và bạc rồi dùng nó để áp đặt đồng tiền của mình, thứ tiền mang tính quốc tế nhất mà thế giới từng thấy. Vàng có thể tạo điều kiện cho chiến tranh, và nó cũng tạo điều kiện cho sự cai trị. Kể từ ngày đó, chưa từng có một đồng tiền dự trữ toàn cầu nào mà không bắt đầu từ nền tảng vàng, và đôi khi là cả bạc. Đây là một bài học mà chúng ta sẽ thấy hết lần này đến lần khác: ai nắm vàng sẽ đặt ra luật chơi.' },
						{ type: 'p', text: '**Người La Mã đã hủy hoại tiền tệ của họ như thế nào**' },
						{ type: 'p', text: '"*Aurum potestas est* (Vàng là quyền lực)."' }
					]
				},
				{
					baseName: 'File 2',
					path: 'file2.md',
					blocks: [
						{ type: 'p', text: 'Nội dung tiếp theo.' }
					]
				}
			];
			const grouped = groupChapters(files, '', true, 1, 2, 5);
			expect(grouped).toHaveLength(2);
			expect(grouped[0].isChapter).toBe(false);
			expect(grouped[0].title).toBe('File 1');
			expect(grouped[1].isChapter).toBe(false);
			expect(grouped[1].title).toBe('File 2');
		});

		it('should match lowercase accentless keyword "chuong" against "Chương"', () => {
			const files = [
				{
					baseName: 'File 1',
					path: 'file1.md',
					blocks: [
						{ type: 'heading', level: 1, text: 'Chương 1' }
					]
				}
			];
			const grouped = groupChapters(files, 'chuong', false, 1, 1);
			expect(grouped).toHaveLength(1);
			expect(grouped[0].isChapter).toBe(true);
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
				xmlId: 'p01',
				chapterIndex: null
			});
			expect(assigned[1]).toEqual({
				isChapter: true,
				firstSourcePageNum: 5,
				fileName: 'chap_01',
				xmlId: 'chap01',
				chapterIndex: 1
			});
			expect(assigned[2]).toEqual({
				isChapter: false,
				firstSourcePageNum: 12,
				fileName: 'p12',
				xmlId: 'p12',
				chapterIndex: null
			});
			expect(assigned[3]).toEqual({
				isChapter: true,
				firstSourcePageNum: 20,
				fileName: 'chap_02',
				xmlId: 'chap02',
				chapterIndex: 2
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
			expect(html).toBe('Nội dung với <i>nghiêng</i>, <b>đậm</b> và <span class="xya">định nghĩa</span>');
		});

		it('should parse single .txt file into chapters based on new @@ and @@@ delimiters', () => {
			const txt = `@@@ Giới thiệu
Lời mở đầu bài viết.

@@ Chương 1: Bắt đầu
@ 1.1 Khởi động
Đoạn văn chương 1.
Có từ *quan trọng*.`;

			const chapters = parseTxtToChapters(txt, {}, 'Default Title');

			expect(chapters).toHaveLength(3);

			expect(chapters[0].title).toBe('Giới thiệu');
			expect(chapters[0].html).toContain('<h1 class="break-main-chap center">Giới thiệu</h1>');
			expect(chapters[0].html).not.toContain('<p>Lời mở đầu bài viết.</p>');

			expect(chapters[1].title).toBe('Default Title');
			expect(chapters[1].html).toContain('<p>Lời mở đầu bài viết.</p>');

			expect(chapters[2].title).toBe('Chương 1: Bắt đầu');
			expect(chapters[2].html).toContain('<h1 class="main-chap center">Chương 1: Bắt đầu</h1>');
			expect(chapters[2].html).toContain('<h2 class="side-chap center">1.1 Khởi động</h2>');
			expect(chapters[2].html).toContain('<b>quan trọng</b>');
		});

		it('should handle alignments for headings and blockquotes correctly', () => {
			const txt = `@@t Chương căn trái
@t Subtitle căn trái

@@p Chương căn phải
@p Subtitle căn phải`;

			const chapters = parseTxtToChapters(txt, {}, 'Mặc định');

			expect(chapters).toHaveLength(2);
			expect(chapters[0].html).toContain('<h1 class="main-chap left">Chương căn trái</h1>');
			expect(chapters[0].html).toContain('<h2 class="side-chap left">Subtitle căn trái</h2>');

			expect(chapters[1].html).toContain('<h1 class="main-chap right">Chương căn phải</h1>');
			expect(chapters[1].html).toContain('<h2 class="side-chap right">Subtitle căn phải</h2>');
		});

		it('should render page break scene-break-big class when encountering ### delimiter', () => {
			const txt = `@@ Chương 1
Nội dung phần 1.

###

Nội dung phần 2.`;

			const chapters = parseTxtToChapters(txt, {}, 'Chương 1');

			expect(chapters).toHaveLength(1);
			expect(chapters[0].html).toContain('<p class="scene-break-big" role="separator">• • •</p>');
		});

		it('should render page break scene-break-small class when encountering ## delimiter', () => {
			const txt = `@@ Chương 1
Nội dung phần 1.

##

Nội dung phần 2.`;

			const chapters = parseTxtToChapters(txt, {}, 'Chương 1');

			expect(chapters).toHaveLength(1);
			expect(chapters[0].html).toContain('<p class="scene-break-small" role="separator">*</p>');
		});

		it('should create a fallback chapter if text starts immediately without delimiter', () => {
			const txt = `Lời mở đầu không có tiêu đề.
Tiếp tục lời mở đầu.`;
			const chapters = parseTxtToChapters(txt, {}, 'Mở đầu mặc định');
			expect(chapters).toHaveLength(1);
			expect(chapters[0].title).toBe('Mở đầu mặc định');
			expect(chapters[0].html).toContain('<p>Lời mở đầu không có tiêu đề.</p>\n<p>Tiếp tục lời mở đầu.</p>');
		});

		it('should create an empty fallback chapter if input text is empty', () => {
			const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
			const chapters = parseTxtToChapters('', {}, 'Mặc định trống');
			
			expect(chapters).toHaveLength(1);
			expect(chapters[0].title).toBe('Mặc định trống');
			expect(chapters[0].html).toBe('');
			expect(consoleWarnSpy).toHaveBeenCalled();
			
			consoleWarnSpy.mockRestore();
		});

		it('should process quotes and author footers correctly', () => {
			const txt = `@@ Chương 1
~ Câu trích dẫn căn giữa
> Tác giả A

~t Trích dẫn căn trái
> Tác giả B

~p Trích dẫn căn phải`;

			const chapters = parseTxtToChapters(txt, {}, 'Mặc định');

			expect(chapters).toHaveLength(1);
			expect(chapters[0].html).toContain('<blockquote class="center"><p>Câu trích dẫn căn giữa</p><footer>Tác giả A</footer></blockquote>');
			expect(chapters[0].html).toContain('<blockquote class="left"><p>Trích dẫn căn trái</p><footer>Tác giả B</footer></blockquote>');
			expect(chapters[0].html).toContain('<blockquote class="right"><p>Trích dẫn căn phải</p></blockquote>');
		});

		it('should parse nested formatting without tag collision (slash matching issue)', () => {
			const txt = `@@ Chương 1
Một câu có *nhiều* từ *in đậm* liên tiếp và cả /nghiêng/ xen kẽ, thử xem regex có bắt đúng từng cặp không: *đậm 1* bình thường /nghiêng 1/ bình thường *đậm 2*.`;

			const chapters = parseTxtToChapters(txt, {}, 'Mặc định');

			expect(chapters).toHaveLength(1);
			expect(chapters[0].html).toContain('<p>Một câu có <b>nhiều</b> từ <b>in đậm</b> liên tiếp và cả <i>nghiêng</i> xen kẽ, thử xem regex có bắt đúng từng cặp không: <b>đậm 1</b> bình thường <i>nghiêng 1</i> bình thường <b>đậm 2</b>.</p>');
		});

		it('should handle escapes with backslash correctly', () => {
			const txt = `@@ Chương 1
\\@ Dòng này escape @
\\~ Dòng này escape ~
\\> Dòng này escape >`;

			const chapters = parseTxtToChapters(txt, {}, 'Mặc định');

			expect(chapters).toHaveLength(1);
			expect(chapters[0].html).toContain('<p>@ Dòng này escape @</p>');
			expect(chapters[0].html).toContain('<p>~ Dòng này escape ~</p>');
			expect(chapters[0].html).toContain('<p>&gt; Dòng này escape &gt;</p>');
		});

		it('should process footnotes correctly and separate them into a notes chapter', () => {
			const txt = `@@ Chương 1
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
			expect(notes.html).toContain('<h1 class="main-chap center">Chú thích:</h1>');
			expect(notes.html).toContain('<aside epub:type="footnote" id="fn1" class="note">');
			expect(notes.html).toContain('<a class="notenum" href="__FNREF_SRC_1__.xhtml#fnref1">1.</a> Chú thích thứ nhất.');
			expect(notes.html).toContain('<aside epub:type="footnote" id="fn2" class="note">');
			expect(notes.html).toContain('<a class="notenum" href="__FNREF_SRC_2__.xhtml#fnref2">2.</a> Chú thích thứ hai.');
		});

		it('should process footnotes correctly with case-insensitive chú thích separator without colon', () => {
			const txt = `@@ Chương 1
Đây là chương {1}.

chú thích
{1} Chú thích thứ nhất.`;

			const chapters = parseTxtToChapters(txt, {}, 'Mặc định');

			expect(chapters).toHaveLength(2);
			expect(chapters[0].title).toBe('Chương 1');
			expect(chapters[0].html).toContain('<a class="noteref" epub:type="noteref" id="fnref1" href="notes.xhtml#fn1"><sup>1</sup></a>');

			const notes = chapters[1];
			expect(notes.title).toBe('Chú thích');
			expect(notes.fileName).toBe('notes');
			expect(notes.isNotes).toBe(true);
			expect(notes.html).toContain('<h1 class="main-chap center">Chú thích:</h1>');
			expect(notes.html).toContain('<aside epub:type="footnote" id="fn1" class="note">');
		});

		it('should parse [letter] and [poem] blocks correctly', () => {
			const txt = `[letter]
Hà Nội, ngày 12 tháng 8 năm 2026

Con gái yêu của mẹ,

Đừng *buồn*, vì mẹ đã sống một cuộc đời trọn vẹn.

Yêu con nhiều,
Mẹ
[/letter]

[poem]
Quê hương là chùm khế ngọt
Cho con trèo hái mỗi ngày
*Quê hương* là đường đi học
Con về /rợp bướm/ vàng bay
[/poem]`;

			const chapters = parseTxtToChapters(txt, {}, 'Mặc định');
			expect(chapters).toHaveLength(1);
			expect(chapters[0].html).toContain('<div class="letter">\n  <p>Hà Nội, ngày 12 tháng 8 năm 2026</p>\n  <p>Con gái yêu của mẹ,</p>\n  <p>Đừng <b>buồn</b>, vì mẹ đã sống một cuộc đời trọn vẹn.</p>\n  <p>Yêu con nhiều,</p>\n  <p>Mẹ</p>\n</div>');
			expect(chapters[0].html).toContain('<div class="poem">\n  <p>Quê hương là chùm khế ngọt</p>\n  <p>Cho con trèo hái mỗi ngày</p>\n  <p><b>Quê hương</b> là đường đi học</p>\n  <p>Con về <i>rợp bướm</i> vàng bay</p>\n</div>');
		});

		it('should warn and close unclosed blocks at EOF', () => {
			const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
			const txt = `[letter]
Thư chưa đóng.`;
			const chapters = parseTxtToChapters(txt, {}, 'Mặc định');
			expect(chapters).toHaveLength(1);
			expect(chapters[0].html).toContain('<div class="letter">\n  <p>Thư chưa đóng.</p>\n</div>');
			expect(consoleWarnSpy).toHaveBeenCalled();
		});

		it('should parse _task/test.txt correctly', () => {
			const testFileContent = fs.readFileSync(path.join(__dirname, '../_task/test.txt'), 'utf8');
			const chapters = parseTxtToChapters(testFileContent, {}, 'Mặc định');

			expect(chapters.length).toBeGreaterThan(3);

			// Verify Bức Thư Cuối chapter contains letter block
			const chapLetter = chapters.find(c => c.title === 'Chương 4: Bức Thư Cuối');
			expect(chapLetter).toBeDefined();
			expect(chapLetter.html).toContain('<div class="letter">');
			expect(chapLetter.html).toContain('  <p>Hà Nội, ngày 12 tháng 8 năm 2026</p>');
			expect(chapLetter.html).toContain('  <p>Con gái yêu của mẹ,</p>');
			expect(chapLetter.html).toContain('<b>buồn</b>');
			expect(chapLetter.html).toContain('<i>sống tử tế</i>');
			expect(chapLetter.html).toContain('</div>');

			// Verify it contains poem block
			expect(chapLetter.html).toContain('<div class="poem">');
			expect(chapLetter.html).toContain('  <p>Quê hương là chùm khế ngọt</p>');
			expect(chapLetter.html).toContain('<b>Quê hương</b>');
			expect(chapLetter.html).toContain('<i>rợp bướm</i>');
			expect(chapLetter.html).toContain('</div>');

			// Verify [1] annotation is kept as text
			expect(chapLetter.html).toContain('chú thích [1] ở cuối chương');
			expect(chapLetter.html).toContain('Ghi chú: [1] đây là một dòng có ngoặc vuông');
		});

		it('should correctly ignore page55.md continuation and merge into page54.md', () => {
			const p54 = `Alexander Đại đế là đúc tiền ở khắp mọi nơi ông đi qua, những đồng xu tetradrachm này có thể được xem là đồng tiền toàn cầu đầu tiên trên thế giới. Chẳng hạn, hầu như chắc chắn là Judas đã được trả bằng tiền xu tetradrachm để phản bội Chúa Jesus: ba mươi đồng xu – khoảng mười sáu ounce – tức là tương đương khoảng 120 ngày công.

Tetradrachm được đúc với số lượng nhiều hơn bất kỳ đồng tiền cổ nào khác, thậm chí còn được đúc trong suốt hơn 300 năm. Đến nay vẫn còn hàng nghìn đồng xu dạng này, nhiều đồng ở tình trạng rất tốt. Bạn thử xem trên eBay sẽ thấy đôi khi chúng không được giao dịch với mức chênh lệch lớn so với lượng kim loại chứa trong đó như bạn tưởng. Mặt trước của xu là đầu Hercules, vị thần sức mạnh và người được coi là thủy tổ của Macedonia, khoác tấm da sư tử. Mặt sau là Zeus, vị thần quyền lực, ngồi trên ngai, một tay cầm vương trượng, tay kia giữ một con đại bàng. Cũng như trên đồng stater, phía sau Zeus ta lại thấy chữ *Alexandrou*. Hình Hercules – thường là một gương mặt trẻ trung, không có râu – có nét tương đồng đáng kể với Alexander Đại đế thời trẻ. Với cách làm của mình, Alexander Đại đế đã mở đường cho tập quan đóng dấu chân dung các nhà cai trị lên tiền xu thay vì các vị thần.

Alexander qua đời năm 323 TCN, và một trong những người kế tục ông là vua Ptolemy I còn đi xa hơn một bước khi khắc lên tiền xu chân dung của chính Alexander. Có một ví dụ cho thấy Alexander mang diện mạo giống Hercules, đội trên đầu một mảnh da đầu của voi với ngà và vòi, tượng trưng cho cuộc chinh phục Ấn Độ, nơi Alexander lần đầu đem tiền xu tới. Chỉ trong vài thập kỷ, có lẽ với Demetrius I là người đầu tiên, các vị vua đã công khai đặt hình đầu mình lên tiền xu. Chân dung trở thành một công cụ tuyên truyền quan trọng.

Đế chế của Alexander, xét theo diện tích lãnh thổ, là một trong những đế chế lớn nhất lịch sử. Chỉ các đế chế Mông Cổ, Anh và Liên Xô là lớn hơn nó mà thôi. Ông có thể đã chinh phục bằng`;

			const p55 = `quân đội, nhưng ông củng cố đế chế bằng tiền tệ: kiểm soát nguồn cung vàng và bạc rồi dùng nó để áp đặt đồng tiền của mình, thứ tiền mang tính quốc tế nhất mà thế giới từng thấy. Vàng có thể tạo điều kiện cho chiến tranh, và nó cũng tạo điều kiện cho sự cai trị. Kể từ ngày đó, chưa từng có một đồng tiền dự trữ toàn cầu nào mà không bắt đầu từ nền tảng vàng, và đôi khi là cả bạc. Đây là một bài học mà chúng ta sẽ thấy hết lần này đến lần khác: ai nắm vàng sẽ đặt ra luật chơi.

**Người La Mã đã hủy hoại tiền tệ của họ như thế nào**

"*Aurum potestas est* (Vàng là quyền lực)."

– Tục ngữ La Mã

Đồng bạc *denarius* của La Mã lúc ban đầu có hàm lượng 95-98% bạc. Nhưng đến năm 275 thì hàm lượng bạc trong đồng xu này chỉ còn chưa tới 1%. Lượng vàng trong một đồng tiền vàng cũng bị giảm gần một nửa.

Làm thế nào đồng tiền của đế chế quyền lực nhất thế giới có thể đi từ gần như bạc nguyên chất đến gần như không còn bạc?

Người La Mã có lẽ nổi tiếng vì việc làm giảm hàm lượng kim loại quý trong tiền tệ của họ hơn là vì chính đồng tiền đó, nhưng để cả một quá trình kéo dài đến vậy (diễn ra trong hàng trăm năm), và theo một số người là có hiệu quả, thì ngay từ đầu họ phải có một đồng tiền được thiết lập vững vàng, được thừa nhận rộng rãi và đáng tin cậy.

Ở thời cực thịnh, có tới 50 triệu người sống trong Đế quốc La Mã. Hòa bình được duy trì nhờ đạo quân La Mã hùng mạnh với hơn mười vạn binh sĩ, tất cả đều được trả bằng tiền thực, bằng vàng và bạc.

Khi ấy, lượng vàng lưu hành đạt đến một quy mô chưa từng có, và phải tới các cơn sốt vàng của thế kỷ XIX người ta mới lại chứng kiến mức tương đương. Một phép tính cho thấy vào thời`;

			const files = [
				{
					baseName: 'CHƯƠNG 4',
					path: 'page50.md',
					rawText: 'CHƯƠNG 4'
				},
				{
					baseName: 'page54',
					path: 'page54.md',
					rawText: p54
				},
				{
					baseName: 'Chương 13: Người La Mã đã hủy hoại tiền tệ của họ như thế nào',
					path: 'page55.md',
					rawText: p55
				}
			];

			const keywords = ['{no}', '{roman_no}', 'Tên sách'];
			const processedFiles = files.map(f => {
				const cleaned = cleanHeaderFooterOcr(f.rawText, keywords, 2);
				return {
					path: f.path,
					baseName: f.baseName,
					blocks: parseMarkdownBlocks(cleaned)
				};
			});

			const grouped = groupChapters(processedFiles, '', true, 1, 3, 5);
			console.log("GROUPED COUNT:", grouped.length);
			for (const g of grouped) {
				console.log("GROUP TITLE:", g.title, "isChapter:", g.isChapter, "sources:", g.sources);
			}
		});
	});
});


