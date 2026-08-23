// tests/dedicated-test-kit.test.ts
import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import JSZip from 'jszip';
import { parseTxtToChapters } from '../src/lib/epub-packer/parser/txt-parser';
import { buildEpubBlob } from '../src/lib/epub-packer/epub-packer';
import { validateEpub } from '../src/lib/epub-editor/epub-validator';
import { analyzeEpub, cleanEpub } from '../src/lib/epub-editor/epub-cleaner';
import { extractBookMetadata, rebuildEpubToc } from '../src/lib/epub-editor/epub-book-ops';
import type { EpubJacketConfig, EpubFontsConfig, OrnamentsConfig, IllustrationImageItem } from '../src/lib/types';

describe('Dedicated Comprehensive Test Kit (End-to-End)', () => {
	const fixturePath = path.join(__dirname, 'fixtures', 'comprehensive-syntax.txt');
	const rawTxtContent = fs.readFileSync(fixturePath, 'utf-8');

	it('Step 1: should correctly parse and translate all custom syntax from dummy .txt', () => {
		const imagesMap = {
			'hinh-1.jpg': { fileName: 'hinh-1.jpg' }
		};

		const chapters = parseTxtToChapters(rawTxtContent, { images: imagesMap });
		expect(chapters.length).toBeGreaterThanOrEqual(2);

		const ch1 = chapters[0];
		expect(ch1.title).toContain('Chương 1');
		expect(ch1.html).toContain('<h1 class="main-chap center">Chương 1: Khởi Đầu Cuộc Hành Trình</h1>');
		expect(ch1.html).toContain('<b>Mặt trời</b>');
		expect(ch1.html).toContain('<i>Nguyễn Du</i>');
		expect(ch1.html).toContain('id="fnref1"');
		expect(ch1.html).toContain('id="fnref2"');

		// H2 check
		expect(ch1.html).toContain('<h2 class="side-chap center">Phần 1: Buổi Sáng Ở Làng Quê</h2>');
		// H2 no-toc check
		expect(ch1.html).toContain('<h2 class="side-chap center no-toc">Ghi Chú Riêng (Không Đưa Vào Mục Lục)</h2>');

		// Letter block check
		expect(ch1.html).toContain('<div class="letter">');
		expect(ch1.html).toContain('Gửi người bạn phương xa');

		// Poem block check
		expect(ch1.html).toContain('<div class="poem">');
		expect(ch1.html).toContain('Gió đưa cành trúc la đà');

		// Blockquote check
		expect(ch1.html).toContain('<blockquote class="center">');
		expect(ch1.html).toContain('Lão Tử');

		// Illustration check
		expect(ch1.html).toContain('<img class="illust-img" src="../images/hinh-1.jpg"');

		// Chapter 2 (left aligned @@t)
		const ch2 = chapters.find((c) => c.title.includes('Chương 2'));
		expect(ch2).toBeDefined();
		expect(ch2!.html).toContain('<h1 class="main-chap left">Chương 2: Ngôi Nhà Cổ Bên Sông</h1>');

		// Footnotes chapter
		const notesChap = chapters.find((c) => c.isNotes || c.fileName === 'notes');
		expect(notesChap).toBeDefined();
		expect(notesChap!.html).toContain('id="fn1"');
		expect(notesChap!.html).toContain('Tham khảo Tuyển tập Văn học Cổ điển Việt Nam');
	});

	it('Step 2: should package .txt with Jacket, Fonts, Cover, Ornaments & Illustrations into valid EPUB', async () => {
		const chapters = parseTxtToChapters(rawTxtContent, {
			images: { 'hinh-1.jpg': { fileName: 'hinh-1.jpg' } }
		});

		// 1. Jacket config
		const jacketConfig: EpubJacketConfig = {
			enabled: true,
			templateId: 1, // Minimal
			title: 'Chuyến Phiêu Lưu Diệu Kỳ',
			originalTitle: 'The Wonder Journey',
			author: 'Đoàn Giỏi',
			translator: 'Nguyễn Văn A',
			publisher: 'Nhà Xuất Bản Trẻ',
			distributor: 'Ebook Tools Team'
		};

		// 2. Mock Cover JPEG
		const coverBytes = new Uint8Array(2048);
		const dummyCoverBlob = new Blob([coverBytes], { type: 'image/jpeg' }) as any;
		dummyCoverBlob.width = 1200;
		dummyCoverBlob.height = 1600;

		// 3. Mock TTF font with magic bytes (0x00, 0x01, 0x00, 0x00)
		const ttfBytes = new Uint8Array(1024);
		ttfBytes[0] = 0x00;
		ttfBytes[1] = 0x01;
		ttfBytes[2] = 0x00;
		ttfBytes[3] = 0x00;

		const fontsConfig: EpubFontsConfig = {
			h1Font: 'Bookerly',
			blobs: {
				Bookerly: new Blob([ttfBytes], { type: 'application/vnd.ms-opentype' })
			}
		};

		// 4. Ornaments
		const ornamentsConfig: OrnamentsConfig = {
			chapterOrnament: {
				fileName: 'ornament-chap.png',
				mimeType: 'image/png',
				blob: new Blob([new Uint8Array(512)], { type: 'image/png' })
			}
		};

		// 5. Illustrations
		const illustrations: IllustrationImageItem[] = [
			{
				id: 'img-hinh-1',
				fileName: 'hinh-1.jpg',
				mimeType: 'image/jpeg',
				blob: new Blob([new Uint8Array(1024)], { type: 'image/jpeg' })
			}
		];

		const metadata = {
			title: 'Chuyến Phiêu Lưu Diệu Kỳ',
			author: 'Đoàn Giỏi',
			language: 'vi',
			identifier: 'urn:uuid:98765432-abcd-ef01-2345-6789abcdef01',
			publisher: 'Nhà Xuất Bản Trẻ'
		};

		// Generate EPUB Blob
		const epubBlob = await buildEpubBlob(
			metadata,
			chapters,
			undefined, // default CSS
			false, // paragraph merge enabled
			jacketConfig,
			dummyCoverBlob,
			fontsConfig,
			ornamentsConfig,
			illustrations
		);

		expect(epubBlob).toBeDefined();
		expect(epubBlob.size).toBeGreaterThan(2000);

		// Load and validate resulting EPUB
		const arrayBuf = await epubBlob.arrayBuffer();
		const zip = await JSZip.loadAsync(arrayBuf);

		// 1. Generic Validation
		const genericRes = await validateEpub(zip, 'generic');
		if (!genericRes.passed || genericRes.summary.manifest !== 'pass') {
			console.log('ISSUES IN STEP 2:', JSON.stringify(genericRes.issues, null, 2));
		}
		expect(genericRes.passed).toBe(true);
		expect(genericRes.errorCount).toBe(0);
		expect(genericRes.summary.structure).toBe('pass');
		expect(genericRes.summary.manifest).toBe('pass');
		expect(genericRes.summary.spine).toBe('pass');
		expect(genericRes.summary.toc).toBe('pass');
		expect(genericRes.summary.xhtml).toBe('pass');

		// 2. EPUB 3 Validation
		const epub3Res = await validateEpub(zip, 'epub3');
		expect(epub3Res.passed).toBe(true);
		expect(epub3Res.errorCount).toBe(0);

		// 3. Kobo Profile Validation
		const koboRes = await validateEpub(zip, 'kobo');
		expect(koboRes.passed).toBe(true);
		expect(koboRes.errorCount).toBe(0);
		expect(koboRes.summary.cover).toBe('pass');
		expect(koboRes.summary.fonts).toBe('pass');
	});

	it('Step 3: should support full Editor roundtrip (Metadata editing, TOC rebuilding & Cleaning)', async () => {
		// Create sample EPUB
		const chapters = parseTxtToChapters(rawTxtContent, {
			images: { 'hinh-1.jpg': { fileName: 'hinh-1.jpg' } }
		});

		const dummyCoverBlob = new Blob([new Uint8Array(1024)], { type: 'image/jpeg' }) as any;
		dummyCoverBlob.width = 1200;
		dummyCoverBlob.height = 1600;

		const illustrations: IllustrationImageItem[] = [
			{
				id: 'img-hinh-1',
				fileName: 'hinh-1.jpg',
				mimeType: 'image/jpeg',
				blob: new Blob([new Uint8Array(1024)], { type: 'image/jpeg' })
			},
			// Add an intentional unused image to test cleaner
			{
				id: 'img-unused-garbage',
				fileName: 'unused-garbage.png',
				mimeType: 'image/png',
				blob: new Blob([new Uint8Array(5000)], { type: 'image/png' })
			}
		];

		const epubBlob = await buildEpubBlob(
			{ title: 'Sách Gốc', author: 'Tác Giả Gốc' },
			chapters,
			undefined,
			false,
			null,
			dummyCoverBlob,
			null,
			null,
			illustrations
		);

		const zip = await JSZip.loadAsync(await epubBlob.arrayBuffer());

		// 1. Test Metadata extraction
		const opfText = await zip.file('OEBPS/content.opf')!.async('text');
		const meta = extractBookMetadata(opfText);
		expect(meta.title).toBe('Sách Gốc');
		expect(meta.author).toBe('Tác Giả Gốc');

		// 2. Test TOC Rebuild
		const tocResult = await rebuildEpubToc(zip);
		expect(tocResult).toBeTruthy();
		expect(tocResult!.navXhtml).toContain('Khởi Đầu Cuộc Hành Trình');
		expect(tocResult!.navXhtml).toContain('Ngôi Nhà Cổ Bên Sông');
		expect(tocResult!.tocNcx).toContain('Khởi Đầu Cuộc Hành Trình');

		// 3. Test Cleaner detecting unused image
		const analysis = await analyzeEpub(zip);
		expect(analysis.unusedImages.some((img) => img.name === 'unused-garbage.png')).toBe(true);

		// 4. Test Cleaning and verify size reduction
		const cleanReport = await cleanEpub(zip, {
			removeUnusedImages: true,
			removeUnusedFonts: true,
			removeUnusedStyles: true,
			cleanOpfManifest: true
		});

		expect(cleanReport.removedImages).toContain('OEBPS/images/unused-garbage.png');
		expect(cleanReport.removedManifestEntries).toContain('OEBPS/images/unused-garbage.png');
		expect(cleanReport.savedBytes).toBeGreaterThanOrEqual(5000);
		expect(zip.file('OEBPS/images/unused-garbage.png')).toBeNull();

		// 5. Re-validate after cleaning
		const finalValidation = await validateEpub(zip, 'kobo');
		expect(finalValidation.passed).toBe(true);
		expect(finalValidation.errorCount).toBe(0);
	});
});
