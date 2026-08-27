// tests/smoke/smoke-workflows.test.ts
import { describe, it, expect } from 'vitest';
import JSZip from 'jszip';
import { parseTxtToChapters } from '../../src/lib/epub-packer/parser/txt-parser';
import { parseMarkdownBlocks } from '../../src/lib/epub-packer/parser/epub-markdown-utils';
import { buildEpubBlob } from '../../src/lib/epub-packer/epub-packer';
import { validateEpub } from '../../src/lib/epub-editor/epub-validator';
import { analyzeOptimizationPlan, optimizeEpub } from '../../src/lib/epub-editor/epub-cleaner';
import { extractBookMetadata, updateBookMetadata } from '../../src/lib/epub-editor/epub-book-ops';
import { parseZipEntries, buildPreviewHtml } from '../../src/lib/epub-editor/epub-editor';
import { extractEpubToTxt } from '../../src/lib/epub-to-txt/epub-to-txt';

describe('Tier 1: Smoke Test Suite (Fast Sub-Second Health Checks)', () => {
	it('1. TXT → EPUB Smoke Workflow', async () => {
		const txt = `@@t Chương 1: Khởi Đầu\nNội dung chương 1.\n@@t Chương 2: Kết Thúc\nNội dung chương 2.`;
		const chapters = parseTxtToChapters(txt);
		expect(chapters.length).toBe(2);

		const blob = await buildEpubBlob(
			{ title: 'Smoke Book', author: 'Smoke Tester', language: 'vi' },
			chapters,
			undefined,
			false
		);
		expect(blob.size).toBeGreaterThan(1000);

		const zip = await JSZip.loadAsync(await blob.arrayBuffer());
		const mimetype = await zip.file('mimetype')?.async('text');
		expect(mimetype?.trim()).toBe('application/epub+zip');
		expect(zip.file('META-INF/container.xml')).toBeTruthy();
		expect(zip.file('OEBPS/content.opf')).toBeTruthy();
	});

	it('2. Markdown → EPUB Smoke Workflow', async () => {
		const md = `# Chương 1: Tiêu Đề Markdown\n\nNội dung đoạn văn markdown có **đậm** và *nghiêng*.\n\n## Mục Phụ\n\nChi tiết.`;
		const blocks = parseMarkdownBlocks(md);
		expect(blocks.length).toBeGreaterThan(0);

		const chapters = [
			{
				fileName: 'ch1',
				title: 'Chương 1',
				html: '<h1>Chương 1</h1><p>Nội dung</p>'
			}
		];
		const blob = await buildEpubBlob(
			{ title: 'Smoke MD', author: 'Smoke Author' },
			chapters,
			undefined,
			false
		);
		expect(blob.size).toBeGreaterThan(500);
	});

	it('3. EPUB → TXT Smoke Workflow', async () => {
		const zip = new JSZip();
		zip.file('mimetype', 'application/epub+zip');
		zip.file(
			'META-INF/container.xml',
			'<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="content.opf" media-type="application/oebps-package+xml"/></rootfiles></container>'
		);
		zip.file(
			'content.opf',
			`<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="id">
				<metadata xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:title>Sách Đọc</dc:title><dc:creator>Tác Giả</dc:creator></metadata>
				<manifest><item id="c1" href="ch1.xhtml" media-type="application/xhtml+xml"/></manifest>
				<spine><itemref idref="c1"/></spine>
			</package>`
		);
		zip.file(
			'ch1.xhtml',
			'<html><body><h1>Chương Nhất</h1><p>Văn bản thử nghiệm đọc.</p></body></html>'
		);

		const extracted = await extractEpubToTxt(zip);
		expect(extracted.title).toBe('Sách Đọc');
		expect(extracted.author).toBe('Tác Giả');
		expect(extracted.text).toContain('Chương Nhất');
		expect(extracted.text).toContain('Văn bản thử nghiệm đọc.');
	});

	it('4. EPUB Editor & Live Preview Smoke Workflow', async () => {
		const zip = new JSZip();
		zip.file('mimetype', 'application/epub+zip');
		zip.file(
			'META-INF/container.xml',
			'<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles></container>'
		);
		const opf = `<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="id">
			<metadata xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:title>Editor Smoke</dc:title><dc:creator>Original</dc:creator></metadata>
			<manifest>
				<item id="c1" href="text/ch1.xhtml" media-type="application/xhtml+xml"/>
				<item id="nav" href="nav.xhtml" properties="nav" media-type="application/xhtml+xml"/>
				<item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>
			</manifest>
			<spine toc="ncx"><itemref idref="c1"/></spine>
		</package>`;
		zip.file('OEBPS/content.opf', opf);
		zip.file(
			'OEBPS/nav.xhtml',
			'<html xmlns="http://www.w3.org/1999/xhtml"><nav epub:type="toc"></nav></html>'
		);
		zip.file('OEBPS/toc.ncx', '<ncx><navMap></navMap></ncx>');
		zip.file(
			'OEBPS/text/ch1.xhtml',
			'<html xmlns="http://www.w3.org/1999/xhtml"><body><h1>Tiêu Đề Mới</h1><p>Nội dung</p></body></html>'
		);

		const entries = await parseZipEntries(zip);
		expect(entries.length).toBeGreaterThan(0);

		// Metadata edit
		const updatedOpf = updateBookMetadata(opf, { title: 'Updated Smoke Title' });
		const meta = extractBookMetadata(updatedOpf);
		expect(meta.title).toBe('Updated Smoke Title');

		// Preview builder
		const preview = await buildPreviewHtml({
			html: '<h1>Tiêu Đề Mới</h1><p>Nội dung</p>',
			baseHtmlPath: 'OEBPS/text/ch1.xhtml',
			getFileContent: async () => null,
			getAssetDataUrl: async () => null
		});
		expect(preview).toContain('Tiêu Đề Mới');
	});

	it('5. EPUB Cleaner & Optimizer Smoke Workflow', async () => {
		const zip = new JSZip();
		zip.file('mimetype', 'application/epub+zip');
		zip.file(
			'META-INF/container.xml',
			'<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles></container>'
		);
		zip.file(
			'OEBPS/content.opf',
			`<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="id">
				<metadata xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:title>Clean Smoke</dc:title></metadata>
				<manifest>
					<item id="c1" href="text/ch1.xhtml" media-type="application/xhtml+xml"/>
					<item id="unused" href="images/unused.jpg" media-type="image/jpeg"/>
				</manifest>
				<spine><itemref idref="c1"/></spine>
			</package>`
		);
		zip.file(
			'OEBPS/text/ch1.xhtml',
			'<html xmlns="http://www.w3.org/1999/xhtml"><body><p>Text only</p></body></html>'
		);
		zip.file('OEBPS/images/unused.jpg', new Uint8Array(500));

		const plan = await analyzeOptimizationPlan(zip, new Map());
		expect(plan.unusedImages.some((i) => i.path.includes('unused.jpg'))).toBe(true);

		const result = await optimizeEpub(zip, { removeUnusedImages: true }, new Map());
		expect(result.removedImages.some((i) => i.includes('unused.jpg'))).toBe(true);
		expect(zip.file('OEBPS/images/unused.jpg')).toBeNull();
	});

	it('6. EPUB Validator Smoke Workflow', async () => {
		const zip = new JSZip();
		zip.file('mimetype', 'application/epub+zip');
		zip.file(
			'META-INF/container.xml',
			'<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles></container>'
		);
		zip.file(
			'OEBPS/content.opf',
			`<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="id">
				<metadata xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:title>Valid Smoke</dc:title><dc:language>vi</dc:language><dc:identifier id="id">urn:uuid:smoke</dc:identifier></metadata>
				<manifest>
					<item id="c1" href="text/ch1.xhtml" media-type="application/xhtml+xml"/>
					<item id="nav" href="nav.xhtml" properties="nav" media-type="application/xhtml+xml"/>
					<item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>
				</manifest>
				<spine toc="ncx"><itemref idref="c1"/></spine>
			</package>`
		);
		zip.file(
			'OEBPS/nav.xhtml',
			'<html xmlns="http://www.w3.org/1999/xhtml"><nav epub:type="toc"><ol><li><a href="text/ch1.xhtml">C1</a></li></ol></nav></html>'
		);
		zip.file(
			'OEBPS/toc.ncx',
			'<ncx><navMap><navPoint id="p1"><content src="text/ch1.xhtml"/></navPoint></navMap></ncx>'
		);
		zip.file(
			'OEBPS/text/ch1.xhtml',
			'<html xmlns="http://www.w3.org/1999/xhtml"><body><h1>C1</h1><p>Content</p></body></html>'
		);

		const report = await validateEpub(zip, 'generic');
		expect(report.passed).toBe(true);
		expect(report.errorCount).toBe(0);
	});
});
