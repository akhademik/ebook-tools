// tests/stress/profile-p1.test.ts
import { describe, it, expect } from 'vitest';
import { EditorState } from '@codemirror/state';
import { parseTxtToChapters } from '../../src/lib/epub-packer/parser/txt-parser';
import { buildEpubBlob } from '../../src/lib/epub-packer/epub-packer';
import { buildPreviewHtml } from '../../src/lib/epub-editor/editor/preview-builder';

describe('P1 Benchmark: Baseline Profiling', () => {
	it('1. Profile large TXT parsing & packaging (500k+ words)', async () => {
		const chapterCount = 200;
		const paragraphsPerChapter = 15;
		const lines: string[] = [];

		lines.push('[new]');
		lines.push('Lời tựa đại tác phẩm thử nghiệm hiệu năng quy mô lớn.');
		lines.push('[/new]');

		const sampleParagraphPrefix =
			'Đây là một đoạn văn bản tiếng Việt mẫu chứa đầy đủ các ký tự có dấu như ắ, ằ, ẳ, ẵ, ặ, ế, ề, ể, ễ, ệ, ô, ơ, ư. Đoạn văn này có cả định dạng *in đậm*, /in nghiêng/, và liên kết https://example.com/sach-dien-tu/chuong-1. Ngoài ra còn có chú thích ';
		const sampleParagraphSuffix = ' và lời thoại ~ Nhân vật chính cất tiếng nói rõ ràng.';

		const footnoteDefs: string[] = [];
		let footnoteCounter = 0;
		for (let i = 1; i <= chapterCount; i++) {
			lines.push(`@@t Chương ${i}: Khởi Đầu Của Cuộc Hành Trình Gian Nan Phần ${i}`);
			for (let p = 1; p <= paragraphsPerChapter; p++) {
				footnoteCounter++;
				lines.push(`${sampleParagraphPrefix}{${footnoteCounter}}${sampleParagraphSuffix}`);
				footnoteDefs.push(`{${footnoteCounter}} Giải thích cho chú thích số ${footnoteCounter}.`);
			}
		}

		lines.push('Chú thích:');
		lines.push(...footnoteDefs);

		const massiveTxt = lines.join('\n\n');
		const wordCount = massiveTxt.split(/\s+/).length;
		const byteSize = new TextEncoder().encode(massiveTxt).length;

		console.log(`\n--- TXT Parser Benchmark ---`);
		console.log(
			`Input size: ${(byteSize / (1024 * 1024)).toFixed(2)} MB (${wordCount.toLocaleString()} words, ${chapterCount} chapters)`
		);

		const memBefore = process.memoryUsage().heapUsed;
		const startParse = performance.now();
		const chapters = parseTxtToChapters(massiveTxt);
		const parseDuration = performance.now() - startParse;
		const memAfter = process.memoryUsage().heapUsed;

		console.log(`Parse duration: ${parseDuration.toFixed(2)} ms`);
		console.log(`Heap delta: ${((memAfter - memBefore) / (1024 * 1024)).toFixed(2)} MB`);

		expect(chapters.length).toBeGreaterThanOrEqual(chapterCount);
		expect(parseDuration).toBeLessThan(15000);

		// EPUB Packing Benchmark
		const startPack = performance.now();
		const epubBlob = await buildEpubBlob(
			{
				title: 'Đại Tác Phẩm Thử Nghiệm Hiệu Năng',
				author: 'Benchmark Suite',
				language: 'vi'
			},
			chapters,
			undefined,
			false
		);
		const packDuration = performance.now() - startPack;
		console.log(`Pack duration: ${packDuration.toFixed(2)} ms`);
		console.log(`EPUB Blob size: ${(epubBlob.size / 1024).toFixed(2)} KB`);

		expect(packDuration).toBeLessThan(20000);
	}, 60000);

	it('2. Profile Editor doc.toString() overhead on large document during typing', () => {
		// Simulate a 500KB XHTML chapter (about 10,000 lines or 100k words)
		const singleParagraph =
			'<p>Đoạn văn bản kiểm thử hiệu năng soạn thảo trên CodeMirror 6 với độ dài văn bản lớn.</p>\n';
		const initialDoc =
			'<?xml version="1.0" encoding="utf-8"?>\n<html xmlns="http://www.w3.org/1999/xhtml">\n<body>\n' +
			singleParagraph.repeat(5000) +
			'</body>\n</html>';

		const docByteLength = new TextEncoder().encode(initialDoc).length;
		console.log(`\n--- CodeMirror doc.toString() vs O(1) Benchmark ---`);
		console.log(`Document size: ${(docByteLength / 1024).toFixed(2)} KB`);

		let state = EditorState.create({ doc: initialDoc });

		// Simulate 200 consecutive keystrokes (typing 200 characters)
		// Scenario A: Calling doc.toString() on every change
		const startWithToString = performance.now();
		let totalCharsToString = 0;
		for (let i = 0; i < 200; i++) {
			const tr = state.update({
				changes: { from: 100 + i, insert: 'a' }
			});
			state = tr.state;
			// Current implementation in EpubEditorCodePane.svelte:
			const str = state.doc.toString();
			totalCharsToString += str.length;
		}
		const durationWithToString = performance.now() - startWithToString;

		// Scenario B: O(1) properties (doc.length, doc.lines) without toString()
		let stateB = EditorState.create({ doc: initialDoc });
		const startOptimized = performance.now();
		let totalCharsOptimized = 0;
		for (let i = 0; i < 200; i++) {
			const tr = stateB.update({
				changes: { from: 100 + i, insert: 'a' }
			});
			stateB = tr.state;
			// Optimized approach: O(1) properties without serializing document to string
			totalCharsOptimized += stateB.doc.length;
		}
		const durationOptimized = performance.now() - startOptimized;

		console.log(`200 Keystrokes with doc.toString(): ${durationWithToString.toFixed(2)} ms`);
		console.log(`200 Keystrokes with O(1) doc.length: ${durationOptimized.toFixed(2)} ms`);
		console.log(`Speedup factor: ${(durationWithToString / durationOptimized).toFixed(1)}x faster`);

		expect(totalCharsToString).toBe(totalCharsOptimized);
	});

	it('3. Profile Preview HTML rendering overhead', async () => {
		const html = `<?xml version="1.0" encoding="utf-8"?>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
	<link rel="stylesheet" href="../styles/style.css" />
	<style>
		@import url("../styles/fonts.css");
	</style>
</head>
<body>
	<h1>Chương 1</h1>
	<p>Nội dung đoạn văn với ảnh <img src="../images/fig1.jpg" alt="Fig 1" /></p>
</body>
</html>`;

		const start = performance.now();
		const result = await buildPreviewHtml({
			html,
			baseHtmlPath: 'OEBPS/text/chap01.xhtml',
			getFileContent: async () => 'body { color: red; }',
			getAssetDataUrl: async () => 'data:image/jpeg;base64,fakeimage'
		});
		const duration = performance.now() - start;

		console.log(`\n--- Preview Builder Benchmark ---`);
		console.log(`Single preview render duration: ${duration.toFixed(2)} ms`);
		expect(result).toContain('data:image/jpeg;base64,fakeimage');
		expect(duration).toBeLessThan(50);
	});
});
