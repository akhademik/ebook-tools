// tests/epub-editor.test.ts
import { describe, it, expect, vi } from 'vitest';
import JSZip from 'jszip';
import {
	categorizeFile,
	parseZipEntries,
	parseSpineOrder,
	extractPublicationIdentifiers,
	resolveRelativePath,
	extractLinkedCssPaths,
	buildPreviewHtml,
	getAssetDataUrl,
	sha1,
	sha1Async,
	isValidFontMagic,
	deobfuscateIdpfFont,
	validateHtml,
	validateDirtyPages,
	exportEpubBlob
} from '../src/lib/epub-editor/epub-editor';

describe('EPUB Editor unit tests', () => {
	describe('categorizeFile', () => {
		it('should categorize HTML/XHTML/HTM files as page', () => {
			expect(categorizeFile('OEBPS/text/ch1.xhtml')).toBe('page');
			expect(categorizeFile('ch1.html')).toBe('page');
			expect(categorizeFile('index.htm')).toBe('page');
			expect(categorizeFile('OEBPS/Text/Section0001.XHTML')).toBe('page');
		});

		it('should categorize CSS files as style', () => {
			expect(categorizeFile('OEBPS/styles/main.css')).toBe('style');
			expect(categorizeFile('style.CSS')).toBe('style');
		});

		it('should categorize image files as image', () => {
			expect(categorizeFile('OEBPS/images/cover.jpg')).toBe('image');
			expect(categorizeFile('img.jpeg')).toBe('image');
			expect(categorizeFile('logo.png')).toBe('image');
			expect(categorizeFile('vector.svg')).toBe('image');
			expect(categorizeFile('anim.gif')).toBe('image');
			expect(categorizeFile('photo.webp')).toBe('image');
		});

		it('should categorize opf, ncx, fonts, mimetype, and others as other', () => {
			expect(categorizeFile('content.opf')).toBe('other');
			expect(categorizeFile('toc.ncx')).toBe('other');
			expect(categorizeFile('META-INF/container.xml')).toBe('other');
			expect(categorizeFile('mimetype')).toBe('other');
			expect(categorizeFile('fonts/font.ttf')).toBe('other');
			expect(categorizeFile('fonts/font.otf')).toBe('other');
		});
	});

	describe('parseZipEntries', () => {
		it('should order pages by EPUB spine sequence when OPF is present', async () => {
			const zip = new JSZip();
			zip.file('mimetype', 'application/epub+zip');
			zip.file('OEBPS/text/chap400.xhtml', '<html><body>Chapter 400</body></html>');
			zip.file('OEBPS/text/chap20.xhtml', '<html><body>Chapter 20</body></html>');
			zip.file('OEBPS/text/chap01.xhtml', '<html><body>Chapter 1</body></html>');
			zip.file('OEBPS/text/titlepage.xhtml', '<html><body>Titlepage</body></html>');
			zip.file('OEBPS/styles/main.css', 'body { color: black; }');
			zip.file('OEBPS/images/cover.png', 'fake-image-bytes');
			zip.file(
				'content.opf',
				`<package unique-identifier="pub-id">
					<manifest>
						<item id="title" href="OEBPS/text/titlepage.xhtml" media-type="application/xhtml+xml"/>
						<item id="c01" href="OEBPS/text/chap01.xhtml" media-type="application/xhtml+xml"/>
						<item id="c20" href="OEBPS/text/chap20.xhtml" media-type="application/xhtml+xml"/>
						<item id="c400" href="OEBPS/text/chap400.xhtml" media-type="application/xhtml+xml"/>
					</manifest>
					<spine>
						<itemref idref="title"/>
						<itemref idref="c01"/>
						<itemref idref="c20"/>
						<itemref idref="c400"/>
					</spine>
				</package>`
			);

			const entries = await parseZipEntries(zip);

			const pageEntries = entries.filter((e) => e.category === 'page');
			expect(pageEntries[0].path).toBe('OEBPS/text/titlepage.xhtml');
			expect(pageEntries[1].path).toBe('OEBPS/text/chap01.xhtml');
			expect(pageEntries[2].path).toBe('OEBPS/text/chap20.xhtml');
			expect(pageEntries[3].path).toBe('OEBPS/text/chap400.xhtml');
		});

		it('should sort naturally when OPF spine is missing', async () => {
			const zip = new JSZip();
			zip.file('chap400.html', '<p>400</p>');
			zip.file('chap20.html', '<p>20</p>');
			zip.file('chap1.html', '<p>1</p>');
			zip.file('theme.css', 'p { margin: 0; }');

			const entries = await parseZipEntries(zip);
			const pageEntries = entries.filter((e) => e.category === 'page');
			expect(pageEntries[0].name).toBe('chap1.html');
			expect(pageEntries[1].name).toBe('chap20.html');
			expect(pageEntries[2].name).toBe('chap400.html');
		});
	});

	describe('parseSpineOrder (XML / DOMParser structural parsing)', () => {
		it('should parse OPF with namespaces, comments, and reordered attributes', () => {
			const opf = `<?xml version="1.0" encoding="utf-8"?>
			<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="BookId">
				<!-- Manifest items with attributes in varying order and line breaks -->
				<manifest>
					<item
						media-type="application/xhtml+xml"
						href="text/intro.xhtml"
						id="item-intro"
					/>
					<item media-type="application/xhtml+xml" id="item-c1" href="text/c1.xhtml"/>
					<item id="style" href="styles/main.css" media-type="text/css"/>
				</manifest>
				<!-- Spine order -->
				<spine page-progression-direction="ltr">
					<itemref idref="item-intro" linear="yes" />
					<itemref idref="item-c1" />
				</spine>
			</package>`;

			const spine = parseSpineOrder(opf, 'OEBPS/content.opf');
			expect(spine).toEqual(['OEBPS/text/intro.xhtml', 'OEBPS/text/c1.xhtml']);
		});

		it('should handle OPF with fallback regex if XML is malformed', () => {
			const brokenOpf = `
				<package>
					<metadata>
						<title>Unclosed title & unescaped & ampersands
					</metadata>
					<manifest>
						<item id="c1" href="chap1.xhtml" media-type="application/xhtml+xml"/>
						<item id="c2" href="chap2.xhtml" media-type="application/xhtml+xml"/>
					</manifest>
					<spine>
						<itemref idref="c1"/>
						<itemref idref="c2"/>
					</spine>
				</package>
			`;
			const spine = parseSpineOrder(brokenOpf, 'content.opf');
			expect(spine).toEqual(['chap1.xhtml', 'chap2.xhtml']);
		});
	});

	describe('extractPublicationIdentifiers', () => {
		it('should prioritize unique-identifier attribute and extract all identifier nodes', () => {
			const opf = `
				<package unique-identifier="PrimaryID" xmlns:dc="http://purl.org/dc/elements/1.1/">
					<metadata>
						<dc:identifier id="SecondaryID">978-0-123456-47-2</dc:identifier>
						<dc:identifier id="PrimaryID">urn:uuid:11112222-3333-4444-5555-666677778888</dc:identifier>
						<dc:identifier>doi:10.1000/182</dc:identifier>
					</metadata>
				</package>
			`;

			const ids = extractPublicationIdentifiers(opf);
			expect(ids[0]).toBe('urn:uuid:11112222-3333-4444-5555-666677778888');
			expect(ids).toContain('978-0-123456-47-2');
			expect(ids).toContain('doi:10.1000/182');
		});
	});

	describe('resolveRelativePath (table-driven tests)', () => {
		const testCases: Array<{
			name: string;
			base: string;
			rel: string;
			expected: string;
		}> = [
			{
				name: 'parent folder resolution (../)',
				base: 'OEBPS/text/chap1.xhtml',
				rel: '../styles/main.css',
				expected: 'OEBPS/styles/main.css'
			},
			{
				name: 'multiple parent folders (../../)',
				base: 'OEBPS/text/sub/chap1.xhtml',
				rel: '../../styles/main.css',
				expected: 'OEBPS/styles/main.css'
			},
			{
				name: 'explicit current directory (./)',
				base: 'OEBPS/text/chap1.xhtml',
				rel: './chap2.xhtml',
				expected: 'OEBPS/text/chap2.xhtml'
			},
			{
				name: 'sibling / downward subfolder',
				base: 'OEBPS/text/chap1.xhtml',
				rel: 'sub/note.xhtml',
				expected: 'OEBPS/text/sub/note.xhtml'
			},
			{
				name: 'path cancellation (a/../b)',
				base: 'OEBPS/text/chap1.xhtml',
				rel: 'images/../styles/theme.css',
				expected: 'OEBPS/text/styles/theme.css'
			},
			{
				name: 'root level base file',
				base: 'chap1.html',
				rel: 'style.css',
				expected: 'style.css'
			},
			{
				name: 'strip hash fragment (#anchor)',
				base: 'OEBPS/text/chap1.xhtml',
				rel: '../text/chap2.xhtml#section-2',
				expected: 'OEBPS/text/chap2.xhtml'
			},
			{
				name: 'strip query params (?v=2)',
				base: 'OEBPS/text/chap1.xhtml',
				rel: '../styles/main.css?v=2.1&debug=true',
				expected: 'OEBPS/styles/main.css'
			},
			{
				name: 'strip both query and hash (#fig1?v=2)',
				base: 'OEBPS/text/chap1.xhtml',
				rel: '../images/pic.png#fig1?v=2',
				expected: 'OEBPS/images/pic.png'
			},
			{
				name: 'URL-encoded spaces (%20)',
				base: 'OEBPS/text/chap1.xhtml',
				rel: '../images/cover%20image%20art.jpg',
				expected: 'OEBPS/images/cover image art.jpg'
			},
			{
				name: 'raw spaces in path',
				base: 'OEBPS/text/chap1.xhtml',
				rel: '../images/my cover.jpg',
				expected: 'OEBPS/images/my cover.jpg'
			},
			{
				name: 'URL-encoded unicode (%C3%A0)',
				base: 'OEBPS/text/chap1.xhtml',
				rel: '../text/ch%C3%A0o.xhtml',
				expected: 'OEBPS/text/chào.xhtml'
			},
			{
				name: 'leading slash root path (/OEBPS/...)',
				base: 'OEBPS/text/chap1.xhtml',
				rel: '/OEBPS/styles/main.css',
				expected: 'OEBPS/styles/main.css'
			},
			{
				name: 'empty or whitespace relative path returns base path',
				base: 'OEBPS/text/chap1.xhtml',
				rel: '   ',
				expected: 'OEBPS/text/chap1.xhtml'
			},
			{
				name: 'extra slashes normalized',
				base: 'OEBPS/text/chap1.xhtml',
				rel: '..//styles///main.css',
				expected: 'OEBPS/styles/main.css'
			},
			{
				name: 'nested parent traversal (../../Images/a.jpg)',
				base: 'OEBPS/Text/Sub/ch1.xhtml',
				rel: '../../Images/a.jpg',
				expected: 'OEBPS/Images/a.jpg'
			},
			{
				name: 'encoded space in font file (../Fonts/font%20name.ttf)',
				base: 'OEBPS/Styles/main.css',
				rel: '../Fonts/font%20name.ttf',
				expected: 'OEBPS/Fonts/font name.ttf'
			},
			{
				name: 'encoded space in image (Images/My%20Cover.jpg)',
				base: 'OEBPS/content.opf',
				rel: 'Images/My%20Cover.jpg',
				expected: 'OEBPS/Images/My Cover.jpg'
			},
			{
				name: 'explicit current dir sibling (./chapter.xhtml)',
				base: 'OEBPS/Text/intro.xhtml',
				rel: './chapter.xhtml',
				expected: 'OEBPS/Text/chapter.xhtml'
			}
		];

		testCases.forEach(({ name, base, rel, expected }) => {
			it(`should correctly resolve: ${name}`, () => {
				expect(resolveRelativePath(base, rel)).toBe(expected);
			});
		});
	});

	describe('extractLinkedCssPaths', () => {
		it('should extract and resolve all linked CSS paths', () => {
			const html = `
				<!DOCTYPE html>
				<html>
				<head>
					<link rel="stylesheet" href="../styles/base.css" type="text/css"/>
					<link href="../styles/custom.css" rel="stylesheet" />
					<link rel="icon" href="favicon.ico" />
				</head>
				<body><h1>Test</h1></body>
				</html>
			`;
			const base = 'OEBPS/text/chapter1.xhtml';
			const cssList = extractLinkedCssPaths(html, base);

			expect(cssList).toEqual([
				'OEBPS/styles/base.css',
				'OEBPS/styles/custom.css'
			]);
		});

		it('should return empty list when no stylesheets are linked', () => {
			const html = '<html><head><title>No CSS</title></head><body><p>Text</p></body></html>';
			const cssList = extractLinkedCssPaths(html, 'OEBPS/text/chapter1.xhtml');
			expect(cssList).toEqual([]);
		});
	});

	describe('buildPreviewHtml & getAssetDataUrl', () => {
		it('should convert assets to base64 Data URLs correctly', async () => {
			const zip = new JSZip();
			zip.file('cover.jpg', 'fake-jpg-content');
			zip.file('font.ttf', 'fake-font-content');

			const jpgDataUrl = await getAssetDataUrl(zip, 'cover.jpg');
			const ttfDataUrl = await getAssetDataUrl(zip, 'font.ttf');

			expect(jpgDataUrl).toContain('data:image/jpeg;base64,');
			expect(ttfDataUrl).toContain('data:font/ttf;base64,');
		});

		it('should inline linked CSS, resolve fonts/assets in CSS, and replace <link> tags with <style>', async () => {
			const html = `
				<html>
				<head>
					<link rel="stylesheet" href="../styles/main.css" />
				</head>
				<body>
					<p class="intro">Hello World</p>
				</body>
				</html>
			`;

			const cssContent = `
				@font-face {
					font-family: "MyFont";
					src: url("../fonts/00005.ttf");
				}
				p.intro { color: blue; font-size: 18px; }
			`;
			const getFileContent = vi.fn().mockImplementation(async (path: string) => {
				if (path === 'OEBPS/styles/main.css') return cssContent;
				return null;
			});
			const getAssetDataUrlMock = vi.fn().mockImplementation(async (path: string) => {
				if (path === 'OEBPS/fonts/00005.ttf') return 'data:font/ttf;base64,ZmFrZS1mb250';
				return null;
			});

			const result = await buildPreviewHtml({
				html,
				baseHtmlPath: 'OEBPS/text/chap1.xhtml',
				getFileContent,
				getAssetDataUrl: getAssetDataUrlMock
			});

			expect(result).not.toContain('<link rel="stylesheet"');
			expect(result).toContain('<style data-inlined-from="OEBPS/styles/main.css">');
			expect(result).toContain('url("data:font/ttf;base64,ZmFrZS1mb250")');
			expect(result).toContain('p.intro { color: blue; font-size: 18px; }');
			expect(result).toContain('</style>');
		});

		it('should replace image and SVG image sources with data URLs', async () => {
			const html = `
				<html>
				<body>
					<img src="../images/cover.jpg" alt="Cover" />
					<img src="http://example.com/external.png" alt="External" />
					<svg viewBox="0 0 600 800">
						<image width="600" height="800" xlink:href="../cover.jpeg"/>
					</svg>
				</body>
				</html>
			`;

			const getFileContent = vi.fn().mockResolvedValue(null);
			const getAssetDataUrlMock = vi.fn().mockImplementation(async (path: string) => {
				if (path === 'OEBPS/images/cover.jpg') return 'data:image/jpeg;base64,Y292ZXI=';
				if (path === 'OEBPS/cover.jpeg') return 'data:image/jpeg;base64,Y292ZXItanBlZw==';
				return null;
			});

			const result = await buildPreviewHtml({
				html,
				baseHtmlPath: 'OEBPS/text/chap1.xhtml',
				getFileContent,
				getAssetDataUrl: getAssetDataUrlMock
			});

			expect(getAssetDataUrlMock).toHaveBeenCalledWith('OEBPS/images/cover.jpg');
			expect(getAssetDataUrlMock).toHaveBeenCalledWith('OEBPS/cover.jpeg');
			expect(result).toContain('src="data:image/jpeg;base64,Y292ZXI="');
			expect(result).toContain('xlink:href="data:image/jpeg;base64,Y292ZXItanBlZw=="');
			// External image remains untouched
			expect(result).toContain('src="http://example.com/external.png"');
		});
	});

	describe('validateHtml & validateDirtyPages', () => {
		it('should validate valid HTML/XHTML or fallback when DOMParser unavailable', () => {
			const validHtml = '<html><head><title>OK</title></head><body><p>Valid</p></body></html>';
			const res = validateHtml(validHtml);
			expect(res.valid).toBe(true);
		});

		it('should return errors for invalid dirty pages', () => {
			const dirtyPaths = new Set(['OEBPS/text/valid.xhtml', 'OEBPS/styles/main.css']);
			const editBuffer = new Map([
				['OEBPS/text/valid.xhtml', '<html xmlns="http://www.w3.org/1999/xhtml"><body><p>Valid</p></body></html>'],
				['OEBPS/styles/main.css', 'body { color: red; }']
			]);

			const errors = validateDirtyPages(dirtyPaths, editBuffer);
			expect(errors.length).toBe(0);
		});
	});

	describe('Font Deobfuscation (IDPF & Adobe)', () => {
		describe('SHA-1 cryptographic test vectors (RFC 3174 / NIST)', () => {
			function bytesToHex(bytes: Uint8Array): string {
				return Array.from(bytes)
					.map((b) => b.toString(16).padStart(2, '0'))
					.join('');
			}

			it('should match RFC 3174 test vector 1: empty string', () => {
				const hash = sha1('');
				expect(bytesToHex(hash)).toBe('da39a3ee5e6b4b0d3255bfef95601890afd80709');
			});

			it('should match RFC 3174 test vector 2: "abc"', () => {
				const hash = sha1('abc');
				expect(bytesToHex(hash)).toBe('a9993e364706816aba3e25717850c26c9cd0d89d');
			});

			it('should match RFC 3174 test vector 3: "abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq"', () => {
				const input = 'abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq';
				const hash = sha1(input);
				expect(bytesToHex(hash)).toBe('84983e441c3bd26ebaae4aa1f95129e5e54670f1');
			});

			it('should correctly hash UTF-8 Unicode characters (Vietnamese)', async () => {
				const input = 'Tiếng Việt Chế Bản Sách';
				const syncHash = sha1(input);
				const asyncHash = await sha1Async(input);
				expect(bytesToHex(syncHash)).toBe(bytesToHex(asyncHash));
			});
		});

		it('should validate font magic numbers correctly', () => {
			// Valid TrueType
			expect(isValidFontMagic(new Uint8Array([0x00, 0x01, 0x00, 0x00, 0x00]))).toBe(true);
			// Valid OpenType
			expect(isValidFontMagic(new Uint8Array([0x4f, 0x54, 0x54, 0x4f, 0x00]))).toBe(true);
			// Valid WOFF
			expect(isValidFontMagic(new Uint8Array([0x77, 0x4f, 0x46, 0x46, 0x00]))).toBe(true);
			// Valid WOFF2
			expect(isValidFontMagic(new Uint8Array([0x77, 0x4f, 0x46, 0x32, 0x00]))).toBe(true);
			// Scrambled bytes
			expect(isValidFontMagic(new Uint8Array([0xc9, 0x7a, 0xd6, 0x85, 0x00]))).toBe(false);
		});

		it('should deobfuscate IDPF obfuscated font and restore valid magic', async () => {
			const uid = 'urn:uuid:a1b2c3d4-e5f6-7890';
			// Original valid OTTO font header
			const rawFont = new Uint8Array(2000);
			rawFont[0] = 0x4f; // 'O'
			rawFont[1] = 0x54; // 'T'
			rawFont[2] = 0x54; // 'T'
			rawFont[3] = 0x4f; // 'O'

			// Obfuscate with IDPF algorithm
			const obfuscatedFont = deobfuscateIdpfFont(rawFont, uid);
			expect(isValidFontMagic(obfuscatedFont)).toBe(false);

			// Zip containing OPF with uid and obfuscated font
			const zip = new JSZip();
			zip.file('content.opf', `<package unique-identifier="pub-id"><metadata><dc:identifier id="pub-id">${uid}</dc:identifier></metadata></package>`);
			zip.file('fonts/font.otf', obfuscatedFont);

			const dataUrl = await getAssetDataUrl(zip, 'fonts/font.otf');
			expect(dataUrl).toContain('data:font/otf;base64,');

			// Decode base64 to check magic header
			const base64Data = dataUrl!.split(',')[1];
			const decodedBinary = atob(base64Data);
			expect(decodedBinary.charCodeAt(0)).toBe(0x4f);
			expect(decodedBinary.charCodeAt(1)).toBe(0x54);
			expect(decodedBinary.charCodeAt(2)).toBe(0x54);
			expect(decodedBinary.charCodeAt(3)).toBe(0x4f);
		});

		it('should deobfuscate Adobe obfuscated font and restore valid magic', async () => {
			const uid = 'urn:uuid:12345678-1234-5678-1234-567812345678';
			const hex = uid.replace(/urn:uuid:/i, '').replace(/[^0-9a-fA-F]/g, '');
			const adobeKey = new Uint8Array(16);
			for (let i = 0; i < 16; i++) {
				adobeKey[i] = parseInt(hex.substring(i * 2, i * 2 + 2), 16);
			}

			// Original valid WOFF font header
			const rawFont = new Uint8Array(2000);
			rawFont[0] = 0x77; // 'w'
			rawFont[1] = 0x4f; // 'O'
			rawFont[2] = 0x46; // 'F'
			rawFont[3] = 0x46; // 'F'

			// Obfuscate with Adobe algorithm
			const obfuscatedFont = new Uint8Array(rawFont);
			for (let i = 0; i < 1024; i++) {
				obfuscatedFont[i] ^= adobeKey[i % 16];
			}
			expect(isValidFontMagic(obfuscatedFont)).toBe(false);

			// Zip containing OPF with uid and obfuscated font
			const zip = new JSZip();
			zip.file('content.opf', `<package unique-identifier="pub-id"><metadata><dc:identifier id="pub-id">${uid}</dc:identifier></metadata></package>`);
			zip.file('fonts/font.woff', obfuscatedFont);

			const dataUrl = await getAssetDataUrl(zip, 'fonts/font.woff');
			expect(dataUrl).toContain('data:font/woff;base64,');

			const base64Data = dataUrl!.split(',')[1];
			const decodedBinary = atob(base64Data);
			expect(decodedBinary.charCodeAt(0)).toBe(0x77);
			expect(decodedBinary.charCodeAt(1)).toBe(0x4f);
			expect(decodedBinary.charCodeAt(2)).toBe(0x46);
			expect(decodedBinary.charCodeAt(3)).toBe(0x46);
		});
	});

	describe('exportEpubBlob', () => {
		it('should overwrite modified files from editBuffer and produce a valid zip Blob', async () => {
			const zip = new JSZip();
			zip.file('mimetype', 'application/epub+zip');
			zip.file('OEBPS/text/chap1.xhtml', '<html><body>Original Chapter 1</body></html>');
			zip.file('OEBPS/styles/main.css', 'body { color: black; }');

			const editBuffer = new Map([
				['OEBPS/text/chap1.xhtml', '<html><body>Modified Chapter 1 with live edits</body></html>'],
				['OEBPS/styles/main.css', 'body { color: darkblue; font-size: 16px; }']
			]);

			const blob = await exportEpubBlob(zip, editBuffer);
			expect(blob).toBeDefined();
			expect(blob.type).toBe('application/epub+zip');

			// Read back exported zip to verify contents
			const readBack = await JSZip.loadAsync(await blob.arrayBuffer());
			const updatedChap = await readBack.file('OEBPS/text/chap1.xhtml')?.async('text');
			const updatedCss = await readBack.file('OEBPS/styles/main.css')?.async('text');

			expect(updatedChap).toBe('<html><body>Modified Chapter 1 with live edits</body></html>');
			expect(updatedCss).toBe('body { color: darkblue; font-size: 16px; }');
		});
	});
});
