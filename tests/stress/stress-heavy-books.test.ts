// tests/stress/stress-heavy-books.test.ts
import { describe, it, expect } from 'vitest';
import JSZip from 'jszip';
import { parseTxtToChapters } from '../../src/lib/epub-packer/parser/txt-parser';
import { buildEpubBlob } from '../../src/lib/epub-packer/epub-packer';

describe('Tier 4: Stress & Heavy Load Test Suite (1,000+ Chapters)', () => {
	it('should parse and pack a 1,000-chapter book within reasonable time and memory limits', async () => {
		const chapterCount = 1000;
		const lines: string[] = [];

		lines.push('[new]');
		lines.push('Lời mở đầu cho bộ đại tác phẩm 1000 chương.');
		lines.push('[/new]');

		for (let i = 1; i <= chapterCount; i++) {
			lines.push(`@@t Chương ${i}: Cuộc Phiêu Lưu Phần ${i}`);
			lines.push(`Đoạn văn thứ nhất của chương ${i} ghi lại những chiến công hiển hách.`);
			lines.push(`Đoạn văn thứ hai mô tả cảnh quan thiên nhiên tráng lệ.`);
		}

		const massiveTxt = lines.join('\n\n');

		// Measure parse time
		const startParse = performance.now();
		const chapters = parseTxtToChapters(massiveTxt);
		const parseDuration = performance.now() - startParse;

		expect(chapters.length).toBeGreaterThanOrEqual(chapterCount);
		expect(parseDuration).toBeLessThan(10000); // Under 10s

		// Measure packing time
		const startPack = performance.now();
		const epubBlob = await buildEpubBlob(
			{
				title: 'Đại Tác Phẩm Nghìn Chương',
				author: 'Đại Văn Hào',
				language: 'vi'
			},
			chapters,
			undefined,
			false
		);
		const packDuration = performance.now() - startPack;

		expect(epubBlob.size).toBeGreaterThan(100000); // > 100KB
		expect(packDuration).toBeLessThan(30000); // Under 30s

		// Spot check zip entries
		const zip = await JSZip.loadAsync(await epubBlob.arrayBuffer());
		expect(zip.file('OEBPS/toc.ncx')).toBeTruthy();
		expect(zip.file('OEBPS/nav.xhtml')).toBeTruthy();
		expect(zip.file('OEBPS/text/chap_0001.xhtml')).toBeTruthy();
		expect(
			zip.file(`OEBPS/text/chap_${chapterCount.toString().padStart(4, '0')}.xhtml`)
		).toBeTruthy();
	}, 60000); // 60s timeout for stress test
});
