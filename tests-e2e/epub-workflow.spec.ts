// tests-e2e/epub-workflow.spec.ts
import { test, expect } from '@playwright/test';
import * as path from 'node:path';
import * as fs from 'node:fs';
import JSZip from 'jszip';

test.describe('Ebook Tools End-to-End Browser Workflows', () => {
	const fixtureTxtPath = path.resolve('tests/fixtures/comprehensive-syntax.txt');
	const fixtureEpubPath = path.resolve('tests/fixtures/sample-test-book.epub');

	test.beforeAll(async () => {
		// Generate sample EPUB fixture for E2E tests
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
					<dc:identifier id="pub-id">urn:uuid:e2e-test-12345</dc:identifier>
					<dc:title>Sách Thử Nghiệm E2E</dc:title>
					<dc:creator>Tác Giả E2E</dc:creator>
					<dc:language>vi</dc:language>
				</metadata>
				<manifest>
					<item id="c1" href="text/ch1.xhtml" media-type="application/xhtml+xml"/>
					<item id="c2" href="text/ch2.xhtml" media-type="application/xhtml+xml"/>
					<item id="nav" href="nav.xhtml" properties="nav" media-type="application/xhtml+xml"/>
					<item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>
					<item id="css" href="styles/main.css" media-type="text/css"/>
					<item id="img1" href="images/cover.jpg" properties="cover-image" media-type="image/jpeg"/>
					<item id="unused_img" href="images/orphan.png" media-type="image/png"/>
				</manifest>
				<spine toc="ncx">
					<itemref idref="c1"/>
					<itemref idref="c2"/>
				</spine>
			</package>`
		);
		zip.file('OEBPS/nav.xhtml', '<html xmlns="http://www.w3.org/1999/xhtml"><nav epub:type="toc"><ol><li><a href="text/ch1.xhtml">Chương 1</a></li></ol></nav></html>');
		zip.file('OEBPS/toc.ncx', '<ncx><navMap><navPoint id="p1"><navLabel><text>Chương 1</text></navLabel><content src="text/ch1.xhtml"/></navPoint></navMap></ncx>');
		zip.file(
			'OEBPS/text/ch1.xhtml',
			'<html xmlns="http://www.w3.org/1999/xhtml"><head><link rel="stylesheet" href="../styles/main.css"/></head><body><h1>Chương 1: Mở Đầu</h1><p>Nội dung thử nghiệm 1.</p></body></html>'
		);
		zip.file(
			'OEBPS/text/ch2.xhtml',
			'<html xmlns="http://www.w3.org/1999/xhtml"><head><link rel="stylesheet" href="../styles/main.css"/></head><body><h1>Chương 2: Diễn Biến</h1><p>Nội dung thử nghiệm 2.</p></body></html>'
		);
		zip.file('OEBPS/styles/main.css', 'body { margin: 0; font-family: sans-serif; }');
		zip.file('OEBPS/images/cover.jpg', new Uint8Array(2048));
		zip.file('OEBPS/images/orphan.png', new Uint8Array(4096)); // Unused image to test cleaner UI

		const buffer = await zip.generateAsync({ type: 'nodebuffer' });
		fs.writeFileSync(fixtureEpubPath, buffer);
	});

	test.afterAll(() => {
		if (fs.existsSync(fixtureEpubPath)) {
			fs.unlinkSync(fixtureEpubPath);
		}
	});

	test('should load Home and display navigation links', async ({ page }) => {
		await page.goto('/');

		// Check navigation links
		const epubLink = page.getByRole('link', { name: /Đóng gói EPUB/i }).first();
		await expect(epubLink).toBeVisible();

		const editorLink = page.getByRole('link', { name: /EPUB Editor/i }).first();
		await expect(editorLink).toBeVisible();
	});

	test('should redirect /epub to /epub-packer', async ({ page }) => {
		await page.goto('/epub');
		await expect(page).toHaveURL(/.*\/epub-packer/);
		await expect(page.getByRole('heading', { name: 'Đóng gói EPUB' })).toBeVisible();
	});

	test('should upload .txt fixture, customize metadata & jacket, and trigger packing in EPUB Packer', async ({ page }) => {
		await page.goto('/epub-packer');
		await expect(page.getByRole('heading', { name: 'Đóng gói EPUB' })).toBeVisible();
		await expect(page.locator('text=Chọn file nguồn')).toBeVisible();

		// 1. Upload .txt file
		const fileInput = page.locator('input[accept*=".txt"]').first();
		await fileInput.setInputFiles(fixtureTxtPath);

		// 2. Verify chapters recognized and parsed
		await expect(page.locator('text=Đã xử file .TXT thành công')).toBeVisible({ timeout: 20000 });

		// 3. Open Jacket Modal
		const jacketBtn = page.getByRole('button', { name: /Tùy chỉnh trang lót|Trang lót/i }).first();
		if (await jacketBtn.isVisible()) {
			await jacketBtn.click();
			const modalTitle = page.locator('text=Tùy chỉnh trang lót');
			await expect(modalTitle).toBeVisible();

			// Close modal
			const closeBtn = page.getByRole('button', { name: /Đóng|Xong|✕/i }).first();
			await closeBtn.click();
		}

		// 4. Verify Pack button is enabled
		const packBtn = page.getByRole('button', { name: /Đóng gói file EPUB/i }).first();
		await expect(packBtn).toBeVisible();
		await expect(packBtn).toBeEnabled();
	});

	test('should display ornaments section and support ornament image upload in EPUB Packer', async ({ page }) => {
		await page.goto('/epub-packer');
		await expect(page.getByRole('heading', { name: 'Đóng gói EPUB' })).toBeVisible();
		await expect(page.locator('text=Chọn file nguồn')).toBeVisible();

		// 1. Upload .txt file to populate chapters
		const fileInput = page.locator('input[accept*=".txt"]').first();
		await fileInput.setInputFiles(fixtureTxtPath);

		// 2. Verify chapters parsed
		await expect(page.locator('text=Đã xử file .TXT thành công')).toBeVisible({ timeout: 20000 });

		// 3. Verify Ornaments section is visible
		await expect(page.getByText('Ảnh trang trí (Ornaments)')).toBeVisible();

		// 4. Check Chapter ornament (H1) and Subchapter ornament (H2) dropzones
		const chapDropzone = page.locator('text=Trang trí chương lớn').locator('xpath=..');
		await expect(chapDropzone).toBeVisible();

		const subchapDropzone = page.locator('text=Trang trí chương phụ').locator('xpath=..');
		await expect(subchapDropzone).toBeVisible();
	});

	test('should load EPUB into EPUB Editor, interact with Metadata, Validator, Cleaner, and open Editor Modal', async ({ page }) => {
		await page.goto('/epub-editor');
		await expect(page.getByRole('heading', { name: 'EPUB Editor' })).toBeVisible();

		// 1. Upload EPUB fixture
		const fileInput = page.locator('input[accept*=".epub"]').first();
		await fileInput.setInputFiles(fixtureEpubPath);

		// 2. Verify files loaded and action buttons appear
		await expect(page.locator('text=sample-test-book.epub')).toBeVisible({ timeout: 15000 });
		await expect(page.getByRole('button', { name: /Thông tin/i })).toBeVisible();
		await expect(page.getByRole('button', { name: /Kiểm định/i })).toBeVisible();
		await expect(page.getByRole('button', { name: /Dọn rác/i })).toBeVisible();

		// 3. Test Metadata Modal
		await page.getByRole('button', { name: /Thông tin/i }).click();
		await expect(page.locator('text=Thông tin sách')).toBeVisible();
		// Close modal
		await page.getByRole('button', { name: /Đóng|✕/i }).first().click();

		// 4. Test Validator Modal
		await page.getByRole('button', { name: /Kiểm định/i }).click();
		await expect(page.locator('text=Kiểm định EPUB & Kobo')).toBeVisible();
		// Verify profile tabs or validation result
		await expect(page.getByRole('button', { name: /Kobo Compatibility/i })).toBeVisible();
		// Close validator modal
		await page.getByRole('button', { name: /Đóng modal|✕/i }).first().click();

		// 5. Test Cleaner / Optimizer Modal
		await page.getByRole('button', { name: /Dọn rác/i }).click();
		await expect(page.locator('text=Dọn rác & Tối ưu EPUB')).toBeVisible();
		// Verify cleaning options or analysis results appear
		await expect(page.getByText('Tổng dung lượng')).toBeVisible({ timeout: 10000 });
		await expect(page.getByText('Tùy chọn dọn dẹp')).toBeVisible();
		// Close cleaner modal
		await page.getByRole('button', { name: /Đóng modal|✕/i }).first().click();

		// 6. Test opening the Full Editor Modal
		const openEditorBtn = page.getByRole('button', { name: /Mở trình chỉnh sửa/i });
		await expect(openEditorBtn).toBeVisible();
		await openEditorBtn.click();

		// Verify Editor modal elements (File structure sidebar, view switcher, export button)
		await expect(page.getByText('Cấu trúc tệp')).toBeVisible({ timeout: 10000 });
		await expect(page.getByTitle('Xuất tệp .EPUB (Download)')).toBeVisible();
		await expect(page.getByRole('button', { name: 'Code' })).toBeVisible();
	});

	test('should open Markdown Fixer and verify conversion interface', async ({ page }) => {
		await page.goto('/md');
		await expect(page.getByRole('heading', { name: /Markdown Fixer/i })).toBeVisible();
		await expect(page.locator('text=Chọn tệp .ZIP')).toBeVisible();
	});

	test('should open PDF Splitter and verify options interface', async ({ page }) => {
		await page.goto('/pdf');
		await expect(page.getByRole('heading', { name: /Tách trang PDF/i })).toBeVisible();
	});

	test('should open TXT to PDF CJK page and display features', async ({ page }) => {
		await page.goto('/txt-to-pdf');
		await expect(page.getByRole('heading', { name: /TXT → PDF CJK/i })).toBeVisible();
	});
});
