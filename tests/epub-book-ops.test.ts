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

	it('should reorder spine itemrefs in OPF XML', () => {
		const reordered = reorderOpfSpine(sampleOpf, 'OEBPS/content.opf', [
			'OEBPS/text/ch2.xhtml',
			'OEBPS/text/ch1.xhtml'
		]);

		const spineMatch = /<spine\b[^>]*>([\s\S]*?)<\/spine>/i.exec(reordered);
		expect(spineMatch).toBeTruthy();
		const spineContent = spineMatch![1];
		const c2Index = spineContent.indexOf('idref="c2"');
		const c1Index = spineContent.indexOf('idref="c1"');
		expect(c2Index).toBeLessThan(c1Index);
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
