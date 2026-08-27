// tests-e2e/epub-download-inspection.spec.ts
import { test, expect } from '@playwright/test';
import * as path from 'node:path';
import * as fs from 'node:fs';
import JSZip from 'jszip';

test.describe('End-to-End Browser File Download & Deep Structure Inspection', () => {
	const fixtureNovelPath = path.resolve('tests/fixtures/txt/vietnamese-novel.txt');
	const fixtureEpubPath = path.resolve('tests/fixtures/sample-e2e-book.epub');

	async function ensureEpubFixture(): Promise<void> {
		if (fs.existsSync(fixtureEpubPath)) return;
		const zip = new JSZip();
		zip.file('mimetype', 'application/epub+zip');
		zip.file(
			'META-INF/container.xml',
			'<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles></container>'
		);
		zip.file(
			'OEBPS/content.opf',
			`<?xml version="1.0" encoding="utf-8"?>
			<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="pub-id">
				<metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
					<dc:identifier id="pub-id">urn:uuid:inspection-test-2026</dc:identifier>
					<dc:title>Cuốn Sách Mẫu E2E</dc:title>
					<dc:creator>Tác Giả Kiểm Thử</dc:creator>
					<dc:language>vi</dc:language>
				</metadata>
				<manifest>
					<item id="c1" href="text/ch1.xhtml" media-type="application/xhtml+xml"/>
					<item id="c2" href="text/ch2.xhtml" media-type="application/xhtml+xml"/>
					<item id="nav" href="nav.xhtml" properties="nav" media-type="application/xhtml+xml"/>
					<item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>
					<item id="css" href="styles/style.css" media-type="text/css"/>
				</manifest>
				<spine toc="ncx">
					<itemref idref="c1"/>
					<itemref idref="c2"/>
				</spine>
			</package>`
		);
		zip.file(
			'OEBPS/nav.xhtml',
			'<html xmlns="http://www.w3.org/1999/xhtml"><nav epub:type="toc"><ol><li><a href="text/ch1.xhtml">Hồi 1</a></li><li><a href="text/ch2.xhtml">Hồi 2</a></li></ol></nav></html>'
		);
		zip.file(
			'OEBPS/toc.ncx',
			'<ncx><navMap><navPoint id="p1"><navLabel><text>Hồi 1</text></navLabel><content src="text/ch1.xhtml"/></navPoint><navPoint id="p2"><navLabel><text>Hồi 2</text></navLabel><content src="text/ch2.xhtml"/></navPoint></navMap></ncx>'
		);
		zip.file(
			'OEBPS/text/ch1.xhtml',
			'<html xmlns="http://www.w3.org/1999/xhtml"><head><link rel="stylesheet" href="../styles/style.css"/></head><body><h1>Hồi 1: Gặp Gỡ</h1><p>Mặt trời lặn sau rặng núi.</p></body></html>'
		);
		zip.file(
			'OEBPS/text/ch2.xhtml',
			'<html xmlns="http://www.w3.org/1999/xhtml"><head><link rel="stylesheet" href="../styles/style.css"/></head><body><h1>Hồi 2: Chia Ly</h1><p>Con tàu rời bến trong mưa.</p></body></html>'
		);
		zip.file('OEBPS/styles/style.css', 'body { margin: 1em; }');

		const buffer = await zip.generateAsync({ type: 'nodebuffer' });
		fs.writeFileSync(fixtureEpubPath, buffer);
	}

	test.beforeAll(async () => {
		await ensureEpubFixture();
	});

	test.afterAll(() => {
		if (fs.existsSync(fixtureEpubPath)) {
			fs.unlinkSync(fixtureEpubPath);
		}
	});

	test('Full Flow 1: Upload TXT → Pack → Download EPUB → Deep Inspection of Internal ZIP Structure', async ({
		page
	}) => {
		await page.goto('/epub-packer');
		await page.waitForLoadState('networkidle');

		// 1. Upload TXT fixture
		const fileInput = page.locator('input[type="file"]').first();
		await fileInput.setInputFiles(fixtureNovelPath);

		// 2. Wait for parsing to finish
		await expect(page.getByText(/Đã xử file .TXT thành công/i).first()).toBeVisible({
			timeout: 25000
		});

		// 3. Trigger EPUB Packing
		const packBtn = page.getByRole('button', { name: /Đóng gói file EPUB/i }).first();
		await expect(packBtn).toBeEnabled();
		await packBtn.click();

		// 4. Wait for download button & trigger download
		const downloadBtn = page.getByRole('button', { name: /Tải file \.EPUB/i }).first();
		await expect(downloadBtn).toBeVisible({ timeout: 25000 });

		const downloadPromise = page.waitForEvent('download');
		await downloadBtn.click();
		const download = await downloadPromise;

		// 5. Read downloaded file directly
		const downloadPath = await download.path();
		expect(downloadPath).toBeTruthy();
		const buffer = fs.readFileSync(downloadPath!);
		expect(buffer.length).toBeGreaterThan(3000);

		// 6. Deep Inspection of ZIP structure
		const zip = await JSZip.loadAsync(buffer);

		// A. Validate Mimetype
		const mimetype = await zip.file('mimetype')?.async('text');
		expect(mimetype?.trim()).toBe('application/epub+zip');

		// B. Validate Container XML
		const containerXml = await zip.file('META-INF/container.xml')?.async('text');
		expect(containerXml).toContain('rootfile full-path="OEBPS/content.opf"');

		// C. Validate OPF & Spine
		const opf = await zip.file('OEBPS/content.opf')?.async('text');
		expect(opf).toContain('<package');
		expect(opf).toContain('media-type="application/xhtml+xml"');

		// D. Validate TOC & Nav
		const nav = await zip.file('OEBPS/nav.xhtml')?.async('text');
		expect(nav).toContain('Chương 1: Bước Chân Đầu Tiên Vào Rừng Thẳm');
		expect(nav).toContain('Chương 2: Đêm Trăng Bên Dòng Suối Lạnh');
		// Must not contain excluded private note
		expect(nav).not.toContain('Ghi Chú Kỹ Thuật Nội Bộ');

		// E. Validate Chapter Content & Vietnamese formatting
		const allXhtmlFiles = Object.keys(zip.files).filter(
			(f) => f.endsWith('.xhtml') && f.startsWith('OEBPS/text/')
		);
		expect(allXhtmlFiles.length).toBeGreaterThanOrEqual(3);

		const xhtmlContents = await Promise.all(
			allXhtmlFiles.map(async (f) => ({ path: f, content: await zip.file(f)!.async('text') }))
		);
		const ch1Entry = xhtmlContents.find((entry) => entry.content.includes('Chương 1'));
		expect(ch1Entry).toBeDefined();
		expect(ch1Entry!.content).toContain('Hoàng Liên Sơn');
		expect(ch1Entry!.content).toContain('<b>la bàn</b>');
	});

	test('Full Flow 2: EPUB → TXT Conversion → Download → Text Content & Chapter Inspection', async ({
		page
	}) => {
		await page.goto('/epub-to-txt');
		await page.waitForLoadState('networkidle');

		// 1. Upload EPUB fixture
		const fileInput = page.locator('input[type="file"]').first();
		await fileInput.setInputFiles(fixtureEpubPath);

		// 2. Click start conversion
		const startBtn = page.getByRole('button', { name: /Bắt đầu chuyển đổi sang TXT/i });
		await expect(startBtn).toBeVisible({ timeout: 25000 });
		await startBtn.click();

		// 3. Wait for download TXT button
		const downloadTxtBtn = page.getByRole('button', { name: /Tải tệp \.TXT/i });
		await expect(downloadTxtBtn).toBeVisible({ timeout: 25000 });

		// 4. Intercept download
		const downloadPromise = page.waitForEvent('download');
		await downloadTxtBtn.click();
		const download = await downloadPromise;

		// 4. Read downloaded TXT and inspect content
		const downloadPath = await download.path();
		expect(downloadPath).toBeTruthy();
		const txtContent = fs.readFileSync(downloadPath!, 'utf-8');

		expect(txtContent).toContain('Hồi 1: Gặp Gỡ');
		expect(txtContent).toContain('Mặt trời lặn sau rặng núi.');
		expect(txtContent).toContain('Hồi 2: Chia Ly');
		expect(txtContent).toContain('Con tàu rời bến trong mưa.');
	});

	test('Full Flow 3: EPUB Editor → Edit Metadata Title → Export EPUB → Verify Downloaded OPF Content', async ({
		page
	}) => {
		await page.goto('/epub-editor');
		await page.waitForLoadState('networkidle');

		// 1. Upload EPUB fixture
		const fileInput = page.locator('input[type="file"]').first();
		await fileInput.setInputFiles(fixtureEpubPath);

		// 2. Open Editor Modal
		const openEditorBtn = page.getByRole('button', { name: /Mở trình chỉnh sửa/i });
		await expect(openEditorBtn).toBeVisible({ timeout: 25000 });
		await openEditorBtn.click();

		// 3. Verify Editor modal is open
		await expect(page.getByText('Cấu trúc tệp')).toBeVisible({ timeout: 10000 });

		// 4. Trigger Export Download from Editor toolbar
		const exportBtn = page.getByTitle('Xuất tệp .EPUB (Download)');
		await expect(exportBtn).toBeVisible();

		const downloadPromise = page.waitForEvent('download');
		await exportBtn.click();
		const download = await downloadPromise;

		// 5. Deep inspection of the exported EPUB
		const downloadPath = await download.path();
		expect(downloadPath).toBeTruthy();
		const buffer = fs.readFileSync(downloadPath!);
		const zip = await JSZip.loadAsync(buffer);

		const opf = await zip.file('OEBPS/content.opf')?.async('text');
		expect(opf).toContain('Cuốn Sách Mẫu E2E');
		expect(zip.file('OEBPS/text/ch1.xhtml')).toBeTruthy();
	});
});
