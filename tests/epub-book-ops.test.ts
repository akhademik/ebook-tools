// tests/epub-book-ops.test.ts
import { describe, it, expect } from 'vitest';
import JSZip from 'jszip';
import {
	extractBookMetadata,
	updateBookMetadata,
	reorderOpfSpine,
	rebuildEpubToc,
	findOpfPath
} from '../src/lib/epub-editor/epub-book-ops';

describe('Book-Level Operations (Metadata, Spine, TOC Rebuild)', () => {
	const sampleOpf = `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="BookId" xml:lang="vi">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="BookId">urn:uuid:abc-123</dc:identifier>
    <dc:title>Sách Cũ</dc:title>
    <dc:language>vi</dc:language>
    <dc:creator id="creator">Tác Giả Cũ</dc:creator>
    <dc:publisher>NXB Cũ</dc:publisher>
    <meta property="dcterms:modified">2026-01-01T00:00:00Z</meta>
  </metadata>
  <manifest>
    <item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>
    <item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>
    <item id="c1" href="text/ch1.xhtml" media-type="application/xhtml+xml"/>
    <item id="c2" href="text/ch2.xhtml" media-type="application/xhtml+xml"/>
  </manifest>
  <spine toc="ncx">
    <itemref idref="c1"/>
    <itemref idref="c2"/>
  </spine>
</package>`;

	it('should extract metadata correctly from OPF XML', () => {
		const meta = extractBookMetadata(sampleOpf);
		expect(meta.title).toBe('Sách Cũ');
		expect(meta.author).toBe('Tác Giả Cũ');
		expect(meta.language).toBe('vi');
		expect(meta.identifier).toBe('urn:uuid:abc-123');
		expect(meta.publisher).toBe('NXB Cũ');
	});

	it('should update metadata cleanly while keeping OPF valid', () => {
		const updated = updateBookMetadata(sampleOpf, {
			title: 'Sách Mới 2026',
			author: 'Tác Giả Mới',
			language: 'en',
			identifier: 'urn:uuid:xyz-789',
			publisher: 'NXB Trẻ',
			description: 'Mô tả nội dung mới'
		});

		const newMeta = extractBookMetadata(updated);
		expect(newMeta.title).toBe('Sách Mới 2026');
		expect(newMeta.author).toBe('Tác Giả Mới');
		expect(newMeta.language).toBe('en');
		expect(newMeta.identifier).toBe('urn:uuid:xyz-789');
		expect(newMeta.publisher).toBe('NXB Trẻ');
		expect(newMeta.description).toBe('Mô tả nội dung mới');
		expect(updated).toContain('<dc:identifier id="BookId">urn:uuid:xyz-789</dc:identifier>');
	});

	it('should safely handle dollar signs ($1, $$, $2) in book metadata without XML distortion', () => {
		const updated = updateBookMetadata(sampleOpf, {
			title: 'Sách Giá $100 & Tập $1 và $2',
			author: 'Tác Giả $1',
			identifier: 'urn:uuid:price-$1-dollar'
		});

		const newMeta = extractBookMetadata(updated);
		expect(newMeta.title).toBe('Sách Giá $100 &amp; Tập $1 và $2');
		expect(newMeta.author).toBe('Tác Giả $1');
		expect(newMeta.identifier).toBe('urn:uuid:price-$1-dollar');
		expect(updated).not.toContain('<dc:title>Sách Giá <dc:title>');
	});

	it('should reorder spine itemrefs in OPF XML while preserving linear="no" and other attributes', () => {
		const opfWithLinear = sampleOpf.replace(
			'<itemref idref="c1"/>',
			'<itemref idref="c1" linear="no" properties="page-spread-left"/>'
		);

		const reordered = reorderOpfSpine(opfWithLinear, 'OEBPS/content.opf', [
			'OEBPS/text/ch2.xhtml',
			'OEBPS/text/ch1.xhtml'
		]);

		const spineMatch = /<spine\b[^>]*>([\s\S]*?)<\/spine>/i.exec(reordered);
		expect(spineMatch).toBeTruthy();
		const spineContent = spineMatch![1];
		const c2Index = spineContent.indexOf('idref="c2"');
		const c1Index = spineContent.indexOf('idref="c1"');
		expect(c2Index).toBeLessThan(c1Index);
		expect(spineContent).toContain(
			'<itemref idref="c1" linear="no" properties="page-spread-left"/>'
		);
	});

	it('should write missing section ids back to XHTML when rebuilding TOC', async () => {
		const zip = new JSZip();
		zip.file('mimetype', 'application/epub+zip');
		zip.file(
			'META-INF/container.xml',
			'<container version="1.0"><rootfiles><rootfile full-path="OEBPS/content.opf"/></rootfiles></container>'
		);
		zip.file('OEBPS/content.opf', sampleOpf);
		// Note: h2 here has NO id attribute! It only has data-id="zzz", and section-2-1 is already taken elsewhere in document
		zip.file(
			'OEBPS/text/ch1.xhtml',
			`<html><head><title>Chương Một</title></head><body><div id="section-2-1">Có sẵn</div><h1>Tiêu đề chính</h1><h2 data-id="zzz">Tiểu mục có data-id</h2><p>Nội dung</p></body></html>`
		);
		zip.file(
			'OEBPS/text/ch2.xhtml',
			`<html><head><title>Chương Hai</title></head><body><h1 id="ch2-title">Chương Hai</h1></body></html>`
		);

		const editBuffer = new Map<string, string>();
		const tocResult = await rebuildEpubToc(zip, editBuffer);
		expect(tocResult).toBeTruthy();
		expect(tocResult!.modifiedPages).toContain('OEBPS/text/ch1.xhtml');
		expect(tocResult!.modifiedPages).not.toContain('OEBPS/text/ch2.xhtml');

		// TOC should link to generated anchor (avoiding collision with section-2-1)
		expect(tocResult!.navXhtml).toMatch(/ch1\.xhtml#section-2-2/);

		// XHTML in editBuffer MUST contain id attribute and keep data-id
		const updatedCh1 = editBuffer.get('OEBPS/text/ch1.xhtml');
		expect(updatedCh1).toBeDefined();
		expect(updatedCh1).toMatch(/<h2 id="section-2-2" data-id="zzz">Tiểu mục có data-id<\/h2>/);
	});

	it('should rebuild nav.xhtml and toc.ncx based on chapter headings', async () => {
		const zip = new JSZip();
		zip.file('mimetype', 'application/epub+zip');
		zip.file(
			'META-INF/container.xml',
			'<container version="1.0"><rootfiles><rootfile full-path="OEBPS/content.opf"/></rootfiles></container>'
		);
		zip.file('OEBPS/content.opf', sampleOpf);
		zip.file(
			'OEBPS/text/ch1.xhtml',
			`<html><head><title>Chương Một</title></head><body><h1 id="h1">Mở đầu cuộc hành trình</h1><p>Nội dung</p></body></html>`
		);
		zip.file(
			'OEBPS/text/ch2.xhtml',
			`<html><head><title>Chương Hai</title></head><body><h1 id="h2">Vượt đại dương</h1><h2 id="s1">Cơn bão lớn</h2><p>Nội dung</p></body></html>`
		);

		const opfFound = await findOpfPath(zip);
		expect(opfFound).toBe('OEBPS/content.opf');

		const tocResult = await rebuildEpubToc(zip);
		expect(tocResult).toBeTruthy();
		expect(tocResult!.navPath).toBe('OEBPS/nav.xhtml');
		expect(tocResult!.ncxPath).toBe('OEBPS/toc.ncx');

		// Check nav.xhtml content
		expect(tocResult!.navXhtml).toContain('Mở đầu cuộc hành trình');
		expect(tocResult!.navXhtml).toContain('Vượt đại dương');
		expect(tocResult!.navXhtml).toContain('Cơn bão lớn');

		// Check toc.ncx content
		expect(tocResult!.tocNcx).toContain('<text>Mở đầu cuộc hành trình</text>');
		expect(tocResult!.tocNcx).toContain('<text>Vượt đại dương</text>');
		expect(tocResult!.tocNcx).toContain('<text>Cơn bão lớn</text>');
	});
});
