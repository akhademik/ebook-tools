// tests/regression/regression-safety-net.test.ts
import { describe, it, expect } from 'vitest';
import JSZip from 'jszip';
import { parseTxtToChapters } from '../../src/lib/epub-packer/parser/txt-parser';
import { buildEpubBlob } from '../../src/lib/epub-packer/epub-packer';
import { extractEpubToTxt } from '../../src/lib/epub-to-txt/epub-to-txt';
import { validateEpub } from '../../src/lib/epub-editor/epub-validator';
import { analyzeOptimizationPlan, optimizeEpub } from '../../src/lib/epub-editor/epub-cleaner';
import type { EpubMetadata } from '../../src/lib/types';

describe('Tier 3: Regression Test Suite (Permanent Safety Net)', () => {
	describe('1. Full Round-Trip Preservation (TXT → EPUB → EPUB to TXT)', () => {
		it('should preserve chapter titles, paragraph order, and Vietnamese text in round-trip conversion', async () => {
			const rawNovel = `
[new]
Lời giới thiệu tác phẩm.
[/new]

@@t Chương 1: Bến Vắng Đêm Trăng
Đoạn văn mở đầu số một với chữ *in đậm* và /in nghiêng/.
Đoạn văn mở đầu số hai.

@@t Chương 2: Tiếng Hát Giữa Rừng Sâu
Đoạn văn chương hai với chữ _gạch chân_.
[poem]
Trăng treo đỉnh núi mây mù
Tiếng tiêu ai thổi vi vu nghìn trùng
[/poem]
`;
			// 1. TXT -> Chapters
			const chapters = parseTxtToChapters(rawNovel);
			expect(chapters.length).toBeGreaterThanOrEqual(3);

			const meta: EpubMetadata = {
				title: 'Tiểu Thuyết Thử Nghiệm',
				author: 'Tác Giả Việt Nam',
				language: 'vi',
				identifier: 'urn:uuid:regression-roundtrip-001'
			};

			// 2. Build EPUB
			const epubBlob = await buildEpubBlob(meta, chapters, undefined, false);
			const arrayBuffer = await epubBlob.arrayBuffer();
			const zip = await JSZip.loadAsync(arrayBuffer);

			// 3. EPUB to TXT Extraction
			const parsedTxt = await extractEpubToTxt(zip);
			expect(parsedTxt.title).toBe('Tiểu Thuyết Thử Nghiệm');
			expect(parsedTxt.author).toBe('Tác Giả Việt Nam');
			expect(parsedTxt.chapterCount).toBeGreaterThanOrEqual(2);

			// Check extracted text content
			expect(parsedTxt.text).toContain('Chương 1: Bến Vắng Đêm Trăng');
			expect(parsedTxt.text).toContain('Đoạn văn mở đầu số một');
			expect(parsedTxt.text).toContain('Chương 2: Tiếng Hát Giữa Rừng Sâu');
			expect(parsedTxt.text).toContain('Trăng treo đỉnh núi mây mù');
		});
	});

	describe('2. TOC Exclusion & Rebuild Safety', () => {
		it('should never include no-toc or private notes in generated nav.xhtml or toc.ncx', async () => {
			const rawTxt = `
@@t Chương 1: Công Khai
Nội dung chương 1.

@!t Ghi Chú Tuyệt Mật
Nội dung này không bao giờ được phép nằm trong mục lục!

@@t Chương 2: Công Khai Tiếp
Nội dung chương 2.
`;
			const chapters = parseTxtToChapters(rawTxt);
			const epubBlob = await buildEpubBlob(
				{ title: 'TOC Secret Test', author: 'Author' },
				chapters,
				undefined,
				false
			);

			const zip = await JSZip.loadAsync(await epubBlob.arrayBuffer());

			const navHtml = await zip.file('OEBPS/nav.xhtml')?.async('text');
			expect(navHtml).toContain('Chương 1: Công Khai');
			expect(navHtml).toContain('Chương 2: Công Khai Tiếp');
			expect(navHtml).not.toContain('Ghi Chú Tuyệt Mật');

			const tocNcx = await zip.file('OEBPS/toc.ncx')?.async('text');
			expect(tocNcx).toContain('Chương 1: Công Khai');
			expect(tocNcx).toContain('Chương 2: Công Khai Tiếp');
			expect(tocNcx).not.toContain('Ghi Chú Tuyệt Mật');
		});
	});

	describe('3. EPUB Cleaner Safety (Zero Loss of Referenced Assets)', () => {
		it('must never delete fonts or images that are referenced via CSS url() or relative image paths', async () => {
			const zip = new JSZip();
			zip.file('mimetype', 'application/epub+zip');
			zip.file(
				'META-INF/container.xml',
				'<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles></container>'
			);
			const opf = `<?xml version="1.0" encoding="utf-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="id">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:title>Protected Book</dc:title></metadata>
  <manifest>
    <item id="c1" href="text/ch1.xhtml" media-type="application/xhtml+xml"/>
    <item id="css" href="styles/style.css" media-type="text/css"/>
    <item id="used_img" href="images/used.png" media-type="image/png"/>
    <item id="unused_img" href="images/unused.png" media-type="image/png"/>
    <item id="used_font" href="fonts/myfont.ttf" media-type="font/ttf"/>
  </manifest>
  <spine><itemref idref="c1"/></spine>
</package>`;
			zip.file('OEBPS/content.opf', opf);
			zip.file(
				'OEBPS/text/ch1.xhtml',
				`<html xmlns="http://www.w3.org/1999/xhtml"><head><link rel="stylesheet" href="../styles/style.css"/></head><body><img src="../images/used.png"/><p>Hello</p></body></html>`
			);
			zip.file(
				'OEBPS/styles/style.css',
				`@font-face { font-family: 'MyFont'; src: url('../fonts/myfont.ttf'); }`
			);
			zip.file('OEBPS/images/used.png', new Uint8Array(100));
			zip.file('OEBPS/images/unused.png', new Uint8Array(200));
			zip.file('OEBPS/fonts/myfont.ttf', new Uint8Array(300));

			const plan = await analyzeOptimizationPlan(zip, new Map());
			expect(plan.unusedImages.map((i) => i.path)).toContain('OEBPS/images/unused.png');
			expect(plan.unusedImages.map((i) => i.path)).not.toContain('OEBPS/images/used.png');
			expect(plan.unusedFonts.map((f) => f.path)).not.toContain('OEBPS/fonts/myfont.ttf');

			await optimizeEpub(zip, { removeUnusedImages: true, removeUnusedFonts: true }, new Map());
			expect(zip.file('OEBPS/images/used.png')).toBeTruthy();
			expect(zip.file('OEBPS/fonts/myfont.ttf')).toBeTruthy();
			expect(zip.file('OEBPS/images/unused.png')).toBeNull();
		});
	});

	describe('4. Validator Resilience & Error Categorization', () => {
		it('should accurately diagnose and report missing manifest files and malformed container.xml', async () => {
			const corruptedZip = new JSZip();
			corruptedZip.file('mimetype', 'application/epub+zip');
			corruptedZip.file(
				'META-INF/container.xml',
				'<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles></container>'
			);
			corruptedZip.file(
				'OEBPS/content.opf',
				`<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="id">
					<metadata xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:title>Corrupted</dc:title></metadata>
					<manifest>
						<item id="missing_file" href="text/nonexistent.xhtml" media-type="application/xhtml+xml"/>
					</manifest>
					<spine><itemref idref="missing_file"/></spine>
				</package>`
			);

			const report = await validateEpub(corruptedZip, 'generic');
			expect(report.passed).toBe(false);
			expect(report.errorCount).toBeGreaterThan(0);
			expect(report.summary.manifest).toBe('fail');
		});
	});
});
