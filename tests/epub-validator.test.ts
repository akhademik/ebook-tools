// tests/epub-validator.test.ts
import { describe, it, expect } from 'vitest';
import JSZip from 'jszip';
import { validateEpub } from '../src/lib/epub-editor/epub-validator';

describe('EPUB Validator & Compatibility Profiles', () => {
	async function createValidEpubZip(): Promise<JSZip> {
		const zip = new JSZip();
		zip.file('mimetype', 'application/epub+zip');
		zip.file(
			'META-INF/container.xml',
			'<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles></container>'
		);

		zip.file(
			'OEBPS/content.opf',
			`<package version="3.0" unique-identifier="pub-id" xmlns="http://www.idpf.org/2007/opf" xmlns:dc="http://purl.org/dc/elements/1.1/">
				<metadata>
					<dc:identifier id="pub-id">urn:uuid:12345</dc:identifier>
					<dc:title>Test Book</dc:title>
					<meta name="cover" content="cover-image"/>
				</metadata>
				<manifest>
					<item id="c1" href="text/ch1.xhtml" media-type="application/xhtml+xml"/>
					<item id="nav" href="nav.xhtml" properties="nav" media-type="application/xhtml+xml"/>
					<item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>
					<item id="css" href="styles/main.css" media-type="text/css"/>
					<item id="cover-image" href="images/cover.jpg" properties="cover-image" media-type="image/jpeg"/>
				</manifest>
				<spine>
					<itemref idref="c1"/>
				</spine>
			</package>`
		);

		zip.file('OEBPS/toc.ncx', '<ncx><navMap><navPoint id="p1"><content src="text/ch1.xhtml"/></navPoint></navMap></ncx>');
		zip.file('OEBPS/nav.xhtml', '<html xmlns="http://www.w3.org/1999/xhtml"><nav epub:type="toc"></nav></html>');
		zip.file(
			'OEBPS/text/ch1.xhtml',
			`<html xmlns="http://www.w3.org/1999/xhtml">
			<head><link rel="stylesheet" href="../styles/main.css"/></head>
			<body><h1 id="sec-1">Title</h1><p>Content</p><img src="../images/cover.jpg" alt="Cover"/></body>
			</html>`
		);
		zip.file('OEBPS/styles/main.css', 'body { margin: 0; }');
		zip.file('OEBPS/images/cover.jpg', new Uint8Array(2000));

		return zip;
	}

	it('should pass validation for a well-formed EPUB 3 / Kobo ebook', async () => {
		const zip = await createValidEpubZip();
		const result = await validateEpub(zip, 'kobo');

		expect(result.passed).toBe(true);
		expect(result.errorCount).toBe(0);
		expect(result.summary.structure).toBe('pass');
		expect(result.summary.manifest).toBe('pass');
		expect(result.summary.spine).toBe('pass');
		expect(result.summary.cover).toBe('pass');
	});

	it('should catch missing mimetype and corrupt container.xml', async () => {
		const zip = new JSZip();
		zip.file('META-INF/container.xml', '<container><rootfiles></rootfiles></container>');

		const result = await validateEpub(zip, 'generic');
		expect(result.passed).toBe(false);
		expect(result.issues.some((i) => i.message.includes('mimetype'))).toBe(true);
		expect(result.issues.some((i) => i.category === 'structure')).toBe(true);
	});

	it('should catch missing manifest items and spine reference errors', async () => {
		const zip = new JSZip();
		zip.file('mimetype', 'application/epub+zip');
		zip.file('META-INF/container.xml', '<container><rootfiles><rootfile full-path="content.opf" media-type="application/oebps-package+xml"/></rootfiles></container>');
		zip.file(
			'content.opf',
			`<package unique-identifier="uid">
				<metadata><dc:identifier id="uid">123</dc:identifier></metadata>
				<manifest>
					<item id="c1" href="missing_file.xhtml" media-type="application/xhtml+xml"/>
				</manifest>
				<spine>
					<itemref idref="non_existent_id"/>
				</spine>
			</package>`
		);

		const result = await validateEpub(zip, 'generic');
		expect(result.passed).toBe(false);
		expect(result.issues.some((i) => i.category === 'manifest' && i.message.includes('missing_file.xhtml'))).toBe(true);
		expect(result.issues.some((i) => i.category === 'spine' && i.message.includes('non_existent_id'))).toBe(true);
	});

	it('should detect broken image references inside XHTML', async () => {
		const zip = await createValidEpubZip();
		// Add a broken image link into ch1.xhtml
		zip.file(
			'OEBPS/text/ch1.xhtml',
			`<html><body><img src="../images/ghost_image.png" /></body></html>`
		);

		const result = await validateEpub(zip, 'generic');
		expect(result.passed).toBe(false);
		expect(result.issues.some((i) => i.category === 'images' && i.message.includes('ghost_image.png'))).toBe(true);
	});

	it('should warn on duplicate element IDs in XHTML', async () => {
		const zip = await createValidEpubZip();
		zip.file(
			'OEBPS/text/ch1.xhtml',
			`<html><body><p id="dup-1">One</p><p id="dup-1">Two</p></body></html>`
		);

		const result = await validateEpub(zip, 'generic');
		expect(result.issues.some((i) => i.message.includes('trùng lặp thuộc tính id="dup-1"'))).toBe(true);
	});
});
