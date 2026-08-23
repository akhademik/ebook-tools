// tests/epub-core.test.ts
import { describe, it, expect } from 'vitest';
import JSZip from 'jszip';
import { parseEpub } from '../src/lib/epub';

describe('EPUB Core Domain Parser tests', () => {
	it('should parse an EPUB zip into a complete EpubBook domain model', async () => {
		const zip = new JSZip();
		zip.file('mimetype', 'application/epub+zip');
		zip.file(
			'META-INF/container.xml',
			`<?xml version="1.0"?>
			<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
				<rootfiles>
					<rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
				</rootfiles>
			</container>`
		);

		const opfXml = `<?xml version="1.0" encoding="utf-8"?>
		<package version="3.0" unique-identifier="book-id" xmlns="http://www.idpf.org/2007/opf">
			<metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
				<dc:title>Test Sách Hay</dc:title>
				<dc:creator>Tác Giả A</dc:creator>
				<dc:language>vi</dc:language>
				<dc:identifier id="book-id">urn:uuid:12345-67890</dc:identifier>
				<dc:publisher>NXB Trẻ</dc:publisher>
				<dc:description>Mô tả ngắn</dc:description>
				<meta name="cover" content="cover-img"/>
			</metadata>
			<manifest>
				<item id="nav" href="nav.xhtml" properties="nav" media-type="application/xhtml+xml"/>
				<item id="cover-img" href="images/cover.jpg" properties="cover-image" media-type="image/jpeg"/>
				<item id="chap1" href="text/ch1.xhtml" media-type="application/xhtml+xml"/>
				<item id="chap2" href="text/ch2.xhtml" media-type="application/xhtml+xml"/>
				<item id="style" href="styles/main.css" media-type="text/css"/>
				<item id="font1" href="fonts/myfont.ttf" media-type="font/ttf"/>
			</manifest>
			<spine>
				<itemref idref="chap1"/>
				<itemref idref="chap2"/>
			</spine>
		</package>`;

		zip.file('OEBPS/content.opf', opfXml);
		zip.file('OEBPS/nav.xhtml', '<html><body><nav>TOC</nav></body></html>');
		zip.file('OEBPS/text/ch1.xhtml', '<html><body><h1>Chương 1</h1></body></html>');
		zip.file('OEBPS/text/ch2.xhtml', '<html><body><h1>Chương 2</h1></body></html>');
		zip.file('OEBPS/styles/main.css', 'body { margin: 0; }');
		zip.file('OEBPS/images/cover.jpg', 'fake-image-bytes');
		zip.file('OEBPS/fonts/myfont.ttf', 'fake-font-bytes');

		const book = await parseEpub(zip);

		// 1. Container & Package
		expect(book.container.rootfileFullPath).toBe('OEBPS/content.opf');
		expect(book.package.version).toBe('3.0');
		expect(book.package.uniqueIdentifierId).toBe('book-id');
		expect(book.package.uniqueIdentifierValue).toBe('urn:uuid:12345-67890');

		// 2. Metadata
		expect(book.metadata.title).toBe('Test Sách Hay');
		expect(book.metadata.author).toBe('Tác Giả A');
		expect(book.metadata.language).toBe('vi');
		expect(book.metadata.publisher).toBe('NXB Trẻ');
		expect(book.metadata.description).toBe('Mô tả ngắn');
		expect(book.metadata.coverImageId).toBe('cover-img');
		expect(book.metadata.coverImagePath).toBe('OEBPS/images/cover.jpg');

		// 3. Manifest
		expect(book.manifest.items.size).toBe(6);
		expect(book.manifest.items.get('chap1')?.resolvedPath).toBe('OEBPS/text/ch1.xhtml');
		expect(book.manifest.byPath.get('OEBPS/styles/main.css')?.mediaType).toBe('text/css');

		// 4. Spine
		expect(book.spine.items).toHaveLength(2);
		expect(book.spine.items[0].resolvedPath).toBe('OEBPS/text/ch1.xhtml');
		expect(book.spine.items[1].resolvedPath).toBe('OEBPS/text/ch2.xhtml');

		// 5. Navigation
		expect(book.navigation.navType).toBe('nav');
		expect(book.navigation.tocPath).toBe('OEBPS/nav.xhtml');

		// 6. Resources categorization
		expect(book.resources.pages).toContain('OEBPS/text/ch1.xhtml');
		expect(book.resources.pages).toContain('OEBPS/text/ch2.xhtml');
		expect(book.resources.styles).toContain('OEBPS/styles/main.css');
		expect(book.resources.images).toContain('OEBPS/images/cover.jpg');
		expect(book.resources.fonts).toContain('OEBPS/fonts/myfont.ttf');
	});
});
