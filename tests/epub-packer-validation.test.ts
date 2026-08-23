// tests/epub-packer-validation.test.ts
import { describe, it, expect } from 'vitest';
import JSZip from 'jszip';
import { buildEpubBlob } from '../src/lib/epub-packer/epub-packer';
import { validateEpub } from '../src/lib/epub-editor/epub-validator';
import type { EpubChapterItem } from '../src/lib/types';

describe('EPUB Packer Output Validation Tests', () => {
	it('should produce an EPUB that 100% passes Generic, EPUB 3, and Kobo validation', async () => {
		const chapters: EpubChapterItem[] = [
			{
				title: 'Chương 1: Khởi đầu mới',
				fileName: 'chapter-1',
				xmlId: 'c1',
				isChapter: true,
				html: `<h1>Chương 1: Khởi đầu mới</h1>\n<p>Đây là nội dung đoạn văn thứ nhất mở đầu cuốn sách.</p>\n<p>Đoạn văn thứ hai mô tả quang cảnh buổi sớm mai.</p>`
			},
			{
				title: 'Chương 2: Cuộc phiêu lưu',
				fileName: 'chapter-2',
				xmlId: 'c2',
				isChapter: true,
				html: `<h1>Chương 2: Cuộc phiêu lưu</h1>\n<p>Họ bắt đầu lên đường xuyên qua khu rừng rậm.</p>`
			}
		];

		const metadata = {
			title: 'Cuốn Sách Mẫu',
			author: 'Tác Giả Mẫu',
			language: 'vi',
			identifier: 'urn:uuid:11112222-3333-4444-5555-666677778888',
			publisher: 'Nhà Xuất Bản Ebook Tools'
		};

		// Fake cover image blob
		const dummyCoverBlob = new Blob([new Uint8Array(2048)], { type: 'image/jpeg' }) as any;
		dummyCoverBlob.width = 1200;
		dummyCoverBlob.height = 1600;

		// Build EPUB
		const epubBlob = await buildEpubBlob(
			metadata,
			chapters,
			undefined, // default css
			false, // skip merge
			null, // jacket
			dummyCoverBlob, // coverBlob
			null, // fonts
			null, // ornaments
			[] // images
		);

		expect(epubBlob).toBeDefined();
		expect(epubBlob.size).toBeGreaterThan(1000);

		// Load generated EPUB into JSZip
		const zipBuffer = await epubBlob.arrayBuffer();
		const generatedZip = await JSZip.loadAsync(zipBuffer);

		// Validate against Generic EPUB profile
		const genericRes = await validateEpub(generatedZip, 'generic');
		if (!genericRes.passed) {
			console.log('VALIDATOR ISSUES:', JSON.stringify(genericRes.issues, null, 2));
		}
		expect(genericRes.passed).toBe(true);
		expect(genericRes.errorCount).toBe(0);
		expect(genericRes.summary.structure).toBe('pass');
		expect(genericRes.summary.manifest).toBe('pass');
		expect(genericRes.summary.spine).toBe('pass');
		expect(genericRes.summary.toc).toBe('pass');
		expect(genericRes.summary.xhtml).toBe('pass');

		// Validate against EPUB 3.0 profile
		const epub3Res = await validateEpub(generatedZip, 'epub3');
		expect(epub3Res.passed).toBe(true);
		expect(epub3Res.errorCount).toBe(0);

		// Validate against Kobo profile
		const koboRes = await validateEpub(generatedZip, 'kobo');
		expect(koboRes.passed).toBe(true);
		expect(koboRes.errorCount).toBe(0);
		expect(koboRes.summary.cover).toBe('pass');
	});

	it('should produce valid EPUB when packaging with jacket intro and custom illustrations', async () => {
		const chapters: EpubChapterItem[] = [
			{
				title: 'Lời Mở Đầu',
				fileName: 'intro',
				xmlId: 'intro',
				isChapter: true,
				html: `<h1>Lời Mở Đầu</h1>\n<p>Cuốn sách này dành cho những người yêu thích công nghệ chế bản sách số.</p>\n<p><img src="../images/illus-1.jpg" alt="Minh họa"/></p>`
			}
		];

		const metadata = {
			title: 'Sách Minh Họa',
			author: 'Nhà Văn',
			language: 'vi'
		};

		const dummyImageBlob = new Blob([new Uint8Array(1024)], { type: 'image/jpeg' });
		const images = [
			{
				id: 'img-1',
				fileName: 'illus-1.jpg',
				mimeType: 'image/jpeg',
				blob: dummyImageBlob
			}
		];

		const jacket = {
			enabled: true,
			templateId: 'minimal',
			title: 'Sách Minh Họa',
			originalTitle: 'Illustrated Book',
			author: 'Nhà Văn',
			translator: 'Dịch Giả',
			publisher: 'NXB Văn Học',
			distributor: ''
		};

		const epubBlob = await buildEpubBlob(
			metadata,
			chapters,
			undefined,
			false,
			jacket,
			null, // no cover
			null, // fonts
			null, // ornaments
			images
		);

		const zipBuffer = await epubBlob.arrayBuffer();
		const generatedZip = await JSZip.loadAsync(zipBuffer);

		const result = await validateEpub(generatedZip, 'generic');
		expect(result.passed).toBe(true);
		expect(result.errorCount).toBe(0);
		expect(result.summary.manifest).toBe('pass');
		expect(result.summary.xhtml).toBe('pass');
	});

	it('should package embedded fonts & ornaments and pass Kobo validation', async () => {
		const chapters: EpubChapterItem[] = [
			{
				title: 'Chương 1',
				fileName: 'ch1',
				xmlId: 'ch1',
				isChapter: true,
				html: `<h1>Chương 1</h1>\n<p>Đoạn văn mở đầu có dropcap và font tùy biến.</p>`
			}
		];

		// Valid TTF magic header bytes: 0x00, 0x01, 0x00, 0x00
		const ttfBytes = new Uint8Array(1024);
		ttfBytes[0] = 0x00;
		ttfBytes[1] = 0x01;
		ttfBytes[2] = 0x00;
		ttfBytes[3] = 0x00;

		const fontsConfig = {
			h1Font: 'Bookerly',
			blobs: {
				Bookerly: new Blob([ttfBytes], { type: 'application/vnd.ms-opentype' })
			}
		};

		const ornamentsConfig = {
			chapterOrnament: {
				fileName: 'ornament.png',
				mimeType: 'image/png',
				blob: new Blob([new Uint8Array(512)], { type: 'image/png' })
			}
		};

		const epubBlob = await buildEpubBlob(
			{ title: 'Sách Nghệ Thuật', author: 'Tác Giả' },
			chapters,
			undefined,
			false,
			null,
			null,
			fontsConfig,
			ornamentsConfig,
			[]
		);

		const zipBuffer = await epubBlob.arrayBuffer();
		const generatedZip = await JSZip.loadAsync(zipBuffer);

		const koboRes = await validateEpub(generatedZip, 'kobo');
		expect(koboRes.passed).toBe(true);
		expect(koboRes.errorCount).toBe(0);
		expect(koboRes.summary.manifest).toBe('pass');
		expect(koboRes.summary.fonts).toBe('pass');
	});
});
