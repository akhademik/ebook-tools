// tests/real-world-workflows.test.ts
import { describe, it, expect } from 'vitest';
import JSZip from 'jszip';
import { parseTxtToChapters } from '../src/lib/epub-packer/parser/txt-parser';
import { parseMarkdownBlocks } from '../src/lib/epub-packer/parser/epub-markdown-utils';
import { groupChaptersZip } from '../src/lib/epub-packer/parser/epub-zip-grouper';
import { assignSequentialChapterIds } from '../src/lib/epub-packer/parser/epub-chapter-utils';
import { cleanHeaderFooterOcr } from '../src/lib/epub-packer/parser/epub-ocr-utils';
import { buildEpubBlob } from '../src/lib/epub-packer/epub-packer';
import { validateEpub } from '../src/lib/epub-editor/epub-validator';
import { analyzeOptimizationPlan, optimizeEpub } from '../src/lib/epub-editor/epub-cleaner';
import { extractBookMetadata, updateBookMetadata, rebuildEpubToc } from '../src/lib/epub-editor/epub-book-ops';
import { parseZipEntries, buildPreviewHtml } from '../src/lib/epub-editor/epub-editor';
import { convertBrackets } from '../src/lib/markdown-fixer/markdown-fixer';
import type {
	EpubMetadata,
	EpubJacketConfig,
	EpubFontsConfig,
	OrnamentsConfig,
	IllustrationImageItem,
	CoverBlobItem,
	RawFileItem
} from '../src/lib/types';

describe('Real-World End-to-End Test Kit (Production Simulation)', () => {
	/**
	 * Helper to create a valid font blob with TTF magic bytes
	 */
	function createValidFontBlob(name: string, size = 1024): Blob {
		const bytes = new Uint8Array(size);
		bytes[0] = 0x00;
		bytes[1] = 0x01;
		bytes[2] = 0x00;
		bytes[3] = 0x00;
		// Write name in bytes for uniqueness
		for (let i = 0; i < Math.min(name.length, 20); i++) {
			bytes[10 + i] = name.charCodeAt(i);
		}
		return new Blob([bytes], { type: 'application/vnd.ms-opentype' });
	}

	/**
	 * Helper to create image bytes
	 */
	function createImageBlob(identifier: string, size = 1500): Blob {
		const bytes = new Uint8Array(size);
		bytes[0] = 0xff;
		bytes[1] = 0xd8; // JPEG SOI
		bytes[2] = 0xff;
		for (let i = 0; i < Math.min(identifier.length, 30); i++) {
			bytes[10 + i] = identifier.charCodeAt(i);
		}
		return new Blob([bytes], { type: 'image/jpeg' });
	}

	describe('Workflow 1: Real-World .TXT Document to EPUB Packing', () => {
		const dummyTxtDocument = `
[new]
Trang lời tựa đặc biệt không chia chương.
Đây là lời tựa đầu sách của nhà xuất bản.
[/new]

[new:center]
@ TẬP THỨ NHẤT
Dành tặng những người bạn đồng hành...
[/new]

@@t Chương 1: Khởi Đầu Hành Trình
[c] Mùa thu năm ấy, gió heo may bắt đầu thổi qua từng con phố cổ Hà Nội. Tiết trời se lạnh báo hiệu một mùa đông sắp đến.

@t Phần 1: Buổi Sáng Ở Phố Cổ
Đoạn mở đầu phần một với chữ *in đậm*, chữ /in nghiêng/ và chữ _gạch chân_.

[letter]
Gửi người bạn tri kỷ,
Hẹn gặp lại bạn vào một ngày nắng đẹp tại góc quán quen.
Ký tên: Người lữ khách
[/letter]

@!t Ghi chú riêng tư (không đưa vào mục lục)
Đoạn văn này là phụ lục nội bộ của tác giả.

###

Đoạn văn sau dấu phân cảnh lớn.
~ "Hành trình vạn dặm bắt đầu từ một bước chân."
> Lão Tử

[hinh-1]

{1} Chú thích nguồn tài liệu trích dẫn.

@@p Chương 2: Ngôi Nhà Bên Sông
Nội dung của chương thứ hai được căn giữa tiêu đề.

[poem]
Sông Hồng cuộn đỏ phù sa
Thuyền ai xuôi ngược bến phà chiều hôm
[/poem]

Chú thích:
{1} Trích trong cuốn 'Đạo Đức Kinh', chương 64.
`;

		it('should parse all custom formatting syntax into structured chapters', () => {
			const imagesMap = {
				'hinh-1.jpg': { fileName: 'hinh-1.jpg' }
			};

			const chapters = parseTxtToChapters(dummyTxtDocument, { images: imagesMap });
			expect(chapters.length).toBeGreaterThanOrEqual(3);

			// 1. [new] page
			const newPage = chapters.find((c) => c.html?.includes('Trang lời tựa đặc biệt'));
			expect(newPage).toBeDefined();

			// 2. [new:center] page
			const centerPage = chapters.find((c) => c.html?.includes('center-page'));
			expect(centerPage).toBeDefined();
			expect(centerPage!.title).toBe('TẬP THỨ NHẤT');
			expect(centerPage!.html).toContain('<section class="center-page">');
			expect(centerPage!.html).toContain('<div class="center-page-content">');
			expect(centerPage!.html).toContain('Dành tặng những người bạn đồng hành...');

			// 3. Chapter 1 (@@t -> class="main-chap left")
			const ch1 = chapters.find((c) => c.title.includes('Khởi Đầu'));
			expect(ch1).toBeDefined();
			expect(ch1!.html).toContain('<h1 class="main-chap left">Chương 1: Khởi Đầu Hành Trình</h1>');
			expect(ch1!.html).toContain('<h2 class="side-chap left">Phần 1: Buổi Sáng Ở Phố Cổ</h2>');
			expect(ch1!.html).toContain('<h2 class="side-chap left no-toc">Ghi chú riêng tư (không đưa vào mục lục)</h2>');
			expect(ch1!.html).toContain('<div class="letter">');
			expect(ch1!.html).toContain('<blockquote class="center">');
			expect(ch1!.html).toContain('<b>in đậm</b>');
			expect(ch1!.html).toContain('<i>in nghiêng</i>');
			expect(ch1!.html).toContain('<u>gạch chân</u>');
			expect(ch1!.html).toContain('<img class="illust-img" src="../images/hinh-1.jpg"');
			expect(ch1!.html).toContain('id="fnref1"');

			// 3. Chapter 2 (@@p -> class="main-chap right")
			const ch2 = chapters.find((c) => c.title.includes('Chương 2'));
			expect(ch2).toBeDefined();
			expect(ch2!.html).toContain('<h1 class="main-chap right">Chương 2: Ngôi Nhà Bên Sông</h1>');
			expect(ch2!.html).toContain('<div class="poem">');

			// 4. Notes chapter
			const notesPage = chapters.find((c) => c.isNotes || c.fileName === 'notes');
			expect(notesPage).toBeDefined();
			expect(notesPage!.html).toContain('id="fn1"');
			expect(notesPage!.html).toContain('Đạo Đức Kinh');
		});

		it('should assemble full EPUB archive with jacket, fonts, cover, ornaments and pass all 3 validation profiles', async () => {
			const chapters = parseTxtToChapters(dummyTxtDocument, {
				images: { 'hinh-1.jpg': { fileName: 'hinh-1.jpg' } }
			});

			const metadata: EpubMetadata = {
				title: 'Ký Sự Hà Nội',
				author: 'Nguyễn Tuân',
				language: 'vi',
				identifier: 'urn:uuid:test-real-world-txt-2026',
				publisher: 'NXB Hội Nhà Văn'
			};

			const jacketConfig: EpubJacketConfig = {
				enabled: true,
				templateId: 2,
				title: 'Ký Sự Hà Nội',
				originalTitle: 'Hanoi Chronicles',
				author: 'Nguyễn Tuân',
				translator: '',
				publisher: 'NXB Hội Nhà Văn',
				distributor: 'Ebook Tools Forge'
			};

			const coverBlob: CoverBlobItem = createImageBlob('cover-art-main', 3000) as CoverBlobItem;
			coverBlob.width = 1200;
			coverBlob.height = 1600;

			const fontsConfig: EpubFontsConfig = {
				jacketFont: 'Bookerly',
				h1Font: 'Bookerly',
				blobs: {
					Bookerly: createValidFontBlob('Bookerly', 2048)
				}
			};

			const ornamentsConfig: OrnamentsConfig = {
				chapterOrnament: {
					fileName: 'ornament-chap.png',
					mimeType: 'image/png',
					blob: new Blob([new Uint8Array(500)], { type: 'image/png' })
				}
			};

			const illustrations: IllustrationImageItem[] = [
				{
					id: 'img-hinh-1',
					fileName: 'hinh-1.jpg',
					mimeType: 'image/jpeg',
					blob: createImageBlob('hinh-1-content', 1500)
				}
			];

			// Build EPUB Blob
			const epubBlob = await buildEpubBlob(
				metadata,
				chapters,
				undefined,
				false,
				jacketConfig,
				coverBlob,
				fontsConfig,
				ornamentsConfig,
				illustrations
			);

			expect(epubBlob).toBeDefined();
			expect(epubBlob.type).toBe('application/epub+zip');
			expect(epubBlob.size).toBeGreaterThan(5000);

			// Unzip and validate
			const zip = await JSZip.loadAsync(await epubBlob.arrayBuffer());

			// 1. Generic Profile Validation
			const genericVal = await validateEpub(zip, 'generic');
			expect(genericVal.passed).toBe(true);
			expect(genericVal.errorCount).toBe(0);
			expect(genericVal.summary.structure).toBe('pass');
			expect(genericVal.summary.manifest).toBe('pass');
			expect(genericVal.summary.spine).toBe('pass');
			expect(genericVal.summary.toc).toBe('pass');
			expect(genericVal.summary.xhtml).toBe('pass');
			expect(genericVal.summary.fonts).toBe('pass');
			expect(genericVal.summary.cover).toBe('pass');

			// 2. EPUB 3 Profile Validation
			const epub3Val = await validateEpub(zip, 'epub3');
			expect(epub3Val.passed).toBe(true);
			expect(epub3Val.errorCount).toBe(0);

			// 3. Kobo Reader Profile Validation
			const koboVal = await validateEpub(zip, 'kobo');
			expect(koboVal.passed).toBe(true);
			expect(koboVal.errorCount).toBe(0);

			// Check EPUB internal structure & TOC sync
			const navXhtml = await zip.file('OEBPS/nav.xhtml')?.async('text');
			expect(navXhtml).toContain('Chương 1: Khởi Đầu Hành Trình');
			expect(navXhtml).toContain('Phần 1: Buổi Sáng Ở Phố Cổ');
			expect(navXhtml).not.toContain('Ghi chú riêng tư'); // verify no-toc exclusion

			const tocNcx = await zip.file('OEBPS/toc.ncx')?.async('text');
			expect(tocNcx).toContain('Chương 1: Khởi Đầu Hành Trình');
			expect(tocNcx).toContain('Phần 1: Buổi Sáng Ở Phố Cổ');
			expect(tocNcx).not.toContain('Ghi chú riêng tư');
		});
	});

	describe('Workflow 2: Real-World Scanned Multi-File Markdown ZIP to EPUB Packing', () => {
		it('should clean OCR headers, join broken cross-page paragraphs, group chapters, and generate valid EPUB', async () => {
			// Create a realistic ZIP containing OCR scanned pages
			const inputZip = new JSZip();

			const page1 = `Trang 1 / 150
# CHƯƠNG 1: BÊN DÒNG SÔNG VÀNG

Vào một buổi sáng đầu xuân, sương mù còn giăng kín mặt sông.
Đoàn thám hiểm bắt đầu lên đường tiến vào khu rừng nguyên sinh bạt ngàn.
Họ chuẩn bị hành lý cẩn thận từ đêm hôm trước.
Người dẫn đường giàu kinh nghiệm đi đầu mở lối.
Tất cả các thành viên đều mang theo`;

			const page2 = `Trang 2 / 150
những trang thiết bị tối tân nhất lúc bấy giờ, cùng với niềm tin mãnh liệt rằng sẽ tìm thấy dấu tích của nền văn minh cổ xưa.
Tiếng chim hót líu lo vang vọng khắp các lùm cây.
Ánh nắng ban mai xuyên qua kẽ lá rọi sáng con đường mòn.
Không khí trong lành mát rượi xua tan đi sự mệt nhọc của chặng đường dài.
Mỗi thành viên trong đoàn đều có một nhiệm vụ riêng biệt.`;

			const page3 = `Trang 3 / 150
# CHƯƠNG 2: DẤU VẾT ĐẦU TIÊN

Sau ba ngày băng rừng lội suối, họ đã nhìn thấy một bức tường đá phủ đầy rêu phong.
Bức tường đá sừng sững như thách thức thời gian.
Những hoa văn chạm khắc cổ kính dần hiện ra trước mắt.
Cả đoàn reo hò trong niềm vui sướng khôn tả.`;

			inputZip.file('001_p1.md', page1);
			inputZip.file('002_p2.md', page2);
			inputZip.file('003_p3.md', page3);

			// Step 1: Read ZIP files
			const rawFiles: RawFileItem[] = [];
			const mdFileNames = Object.keys(inputZip.files).filter((n) => n.endsWith('.md'));
			mdFileNames.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

			for (const name of mdFileNames) {
				const rawText = await inputZip.file(name)!.async('text');
				// Step 2: Clean OCR Header/Footer
				const cleanedText = cleanHeaderFooterOcr(rawText, ['Trang'], 2);
				rawFiles.push({
					path: name,
					baseName: name.replace(/\.md$/i, ''),
					rawText: cleanedText,
					blocks: parseMarkdownBlocks(cleanedText)
				});
			}

			expect(rawFiles.length).toBe(3);

			// Step 3: Heuristic Chapter Grouping
			const grouped = groupChaptersZip(rawFiles, '', true, 1, 3, 5);
			expect(grouped.length).toBe(2); // Chapters 1 and 2

			// Step 4: Assign sequential IDs
			const chapters = assignSequentialChapterIds(grouped);
			expect(chapters.length).toBe(2);

			// Step 5: Verify paragraph merging across page 1 and page 2
			expect(chapters[0].html).toContain('Tất cả các thành viên đều mang theo những trang thiết bị');
			expect(chapters[0].html).not.toMatch(/Tất cả các thành viên đều mang theo<\/p>\s*<p>những trang thiết bị/);

			// Step 6: Build EPUB
			const epubBlob = await buildEpubBlob(
				{ title: 'Chuyến Thám Hiểm', author: 'Nhà Khảo Cổ' },
				chapters,
				undefined,
				false
			);

			// Step 7: Validate generated EPUB
			const generatedZip = await JSZip.loadAsync(await epubBlob.arrayBuffer());
			const validation = await validateEpub(generatedZip, 'kobo');

			expect(validation.passed).toBe(true);
			expect(validation.errorCount).toBe(0);
			expect(validation.summary.structure).toBe('pass');
			expect(validation.summary.manifest).toBe('pass');
			expect(validation.summary.spine).toBe('pass');
		});
	});

	describe('Workflow 3: Real-World EPUB Editor, Live Preview, TOC Rebuild & Optimizer Lifecycle', () => {
		async function createBaseBookZip(): Promise<JSZip> {
			const zip = new JSZip();
			zip.file('mimetype', 'application/epub+zip');
			zip.file(
				'META-INF/container.xml',
				'<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles></container>'
			);

			const opf = `<?xml version="1.0" encoding="utf-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="pub-id">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="pub-id">urn:uuid:edit-cycle-123</dc:identifier>
    <dc:title>Sách Chỉnh Sửa</dc:title>
    <dc:creator>Tác Giả Gốc</dc:creator>
    <dc:language>vi</dc:language>
  </metadata>
  <manifest>
    <item id="c1" href="text/ch1.xhtml" media-type="application/xhtml+xml"/>
    <item id="c2" href="text/ch2.xhtml" media-type="application/xhtml+xml"/>
    <item id="nav" href="nav.xhtml" properties="nav" media-type="application/xhtml+xml"/>
    <item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>
    <item id="css" href="styles/style.css" media-type="text/css"/>
    <item id="img1" href="images/pic1.jpg" media-type="image/jpeg"/>
    <item id="img2" href="images/pic2.jpg" media-type="image/jpeg"/>
    <item id="img_unused" href="images/unused_large.jpg" media-type="image/jpeg"/>
    <item id="font_used" href="fonts/font1.ttf" media-type="font/ttf"/>
    <item id="font_unused" href="fonts/font_orphan.otf" media-type="font/otf"/>
  </manifest>
  <spine toc="ncx">
    <itemref idref="c1"/>
    <itemref idref="c2"/>
  </spine>
</package>`;

			zip.file('OEBPS/content.opf', opf);
			zip.file('OEBPS/nav.xhtml', '<html xmlns="http://www.w3.org/1999/xhtml"><nav epub:type="toc"></nav></html>');
			zip.file('OEBPS/toc.ncx', '<ncx><navMap><navPoint id="p1"><content src="text/ch1.xhtml"/></navPoint></navMap></ncx>');
			zip.file(
				'OEBPS/text/ch1.xhtml',
				`<html xmlns="http://www.w3.org/1999/xhtml">
				<head><link rel="stylesheet" href="../styles/style.css"/></head>
				<body><h1 id="h1">Chương Một</h1><p>Nội dung 1</p><img src="../images/pic1.jpg" alt="P1"/></body>
				</html>`
			);
			zip.file(
				'OEBPS/text/ch2.xhtml',
				`<html xmlns="http://www.w3.org/1999/xhtml">
				<head><link rel="stylesheet" href="../styles/style.css"/></head>
				<body><h1 id="h2">Chương Hai</h1><h2 id="sub2">Tiểu mục 2.1</h2><p>Nội dung 2</p><img src="../images/pic2.jpg" alt="P2"/></body>
				</html>`
			);
			zip.file('OEBPS/styles/style.css', `@font-face { font-family: 'F1'; src: url('../fonts/font1.ttf'); }\nbody { margin: 0; }`);

			// Binary assets
			const sharedImageBytes = new Uint8Array(2000); // pic1 and pic2 will have identical bytes to test deduplication
			sharedImageBytes[0] = 0xaa;
			sharedImageBytes[1] = 0xbb;

			zip.file('OEBPS/images/pic1.jpg', sharedImageBytes);
			zip.file('OEBPS/images/pic2.jpg', sharedImageBytes); // duplicate
			zip.file('OEBPS/images/unused_large.jpg', new Uint8Array(8000)); // unused

			const fontBytes = new Uint8Array(4000);
			fontBytes[0] = 0x00;
			fontBytes[1] = 0x01;
			fontBytes[2] = 0x00;
			fontBytes[3] = 0x00;
			zip.file('OEBPS/fonts/font1.ttf', fontBytes);
			zip.file('OEBPS/fonts/font_orphan.otf', new Uint8Array(12000)); // unused

			return zip;
		}

		it('should load entries, build live preview, update metadata, rebuild TOC, and run full optimization', async () => {
			const zip = await createBaseBookZip();
			const editBuffer = new Map<string, string>();

			// 1. Test entry parsing & reading order
			const entries = await parseZipEntries(zip);
			expect(entries.length).toBeGreaterThanOrEqual(10);
			expect(entries[0].path).toBe('OEBPS/text/ch1.xhtml');
			expect(entries[1].path).toBe('OEBPS/text/ch2.xhtml');

			// 2. Test Live Preview HTML generation
			const ch1Content = await zip.file('OEBPS/text/ch1.xhtml')!.async('text');
			const previewHtml = await buildPreviewHtml({
				html: ch1Content,
				baseHtmlPath: 'OEBPS/text/ch1.xhtml',
				getFileContent: async (p) => (await zip.file(p)?.async('text')) || null,
				getAssetDataUrl: async (p) => {
					const f = zip.file(p);
					if (!f) return null;
					return `data:image/jpeg;base64,mockedDataUrl`;
				}
			});

			expect(previewHtml).toContain('<style data-inlined-from="OEBPS/styles/style.css">');
			expect(previewHtml).toContain('src="data:image/jpeg;base64,mockedDataUrl"');

			// 3. Test Metadata update
			const originalOpf = await zip.file('OEBPS/content.opf')!.async('text');
			const initialMeta = extractBookMetadata(originalOpf);
			expect(initialMeta.title).toBe('Sách Chỉnh Sửa');

			const updatedOpf = updateBookMetadata(originalOpf, {
				title: 'Sách Đã Cập Nhật 2026',
				author: 'Tác Giả Mới',
				language: 'en',
				identifier: 'urn:uuid:updated-guid-999',
				publisher: 'NXB Tri Thức'
			});
			editBuffer.set('OEBPS/content.opf', updatedOpf);

			const newMeta = extractBookMetadata(updatedOpf);
			expect(newMeta.title).toBe('Sách Đã Cập Nhật 2026');
			expect(newMeta.author).toBe('Tác Giả Mới');
			expect(newMeta.identifier).toBe('urn:uuid:updated-guid-999');

			// 4. Test TOC Rebuild from new headings
			const tocRebuild = await rebuildEpubToc(zip, editBuffer);
			expect(tocRebuild).toBeTruthy();
			expect(tocRebuild!.navXhtml).toContain('Chương Một');
			expect(tocRebuild!.navXhtml).toContain('Chương Hai');
			expect(tocRebuild!.navXhtml).toContain('Tiểu mục 2.1');
			expect(tocRebuild!.tocNcx).toContain('Chương Một');

			// 5. Test Optimizer: Plan and Execution
			const plan = await analyzeOptimizationPlan(zip, editBuffer);
			expect(plan.unusedImages.map((i) => i.path)).toContain('OEBPS/images/unused_large.jpg');
			expect(plan.unusedFonts.map((f) => f.path)).toContain('OEBPS/fonts/font_orphan.otf');
			expect(plan.duplicateResources.length).toBeGreaterThan(0);
			expect(plan.estimatedSavingsBytes).toBeGreaterThanOrEqual(8000 + 12000 + 2000);

			// Execute optimization
			const report = await optimizeEpub(
				zip,
				{
					removeUnusedImages: true,
					removeUnusedFonts: true,
					removeUnusedStyles: true,
					cleanOpfManifest: true,
					deduplicateResources: true
				},
				editBuffer
			);

			expect(report.removedImages).toContain('OEBPS/images/unused_large.jpg');
			expect(report.removedFonts).toContain('OEBPS/fonts/font_orphan.otf');
			expect(report.deduplicatedResources).toContain('OEBPS/images/pic2.jpg');
			expect(report.savedBytes).toBeGreaterThan(20000);

			// Verify deleted files from zip
			expect(zip.file('OEBPS/images/unused_large.jpg')).toBeNull();
			expect(zip.file('OEBPS/fonts/font_orphan.otf')).toBeNull();
			expect(zip.file('OEBPS/images/pic2.jpg')).toBeNull();

			// 6. Final Validation of the cleaned & edited EPUB
			const finalVal = await validateEpub(zip, 'generic', editBuffer);
			expect(finalVal.passed).toBe(true);
			expect(finalVal.errorCount).toBe(0);
		});
	});

	describe('Workflow 4: Markdown Fixer OCR Archive Normalization', () => {
		it('should convert raw markdown brackets and format markers reliably', () => {
			const input = `
***Tiêu đề in đậm nghiêng***
Một đoạn văn có **in đậm** và *in nghiêng*, cùng với <u>gạch chân</u>.
Chú thích *dấu sao độc lập* trong công thức: a * b = c.
`;
			const result = convertBrackets(input);
			expect(result.converted).toContain('*/Tiêu đề in đậm nghiêng/*');
			expect(result.converted).toContain('*in đậm*');
			expect(result.converted).toContain('/in nghiêng/');
			expect(result.converted).toContain('_gạch chân_');
			expect(result.count).toBeGreaterThanOrEqual(4);
		});
	});
});
