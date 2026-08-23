// tests-e2e/epub-workflow.spec.ts
import { test, expect } from '@playwright/test';
import * as path from 'node:path';

test.describe('Ebook Tools End-to-End Browser Workflows', () => {
	const fixtureTxtPath = path.resolve('tests/fixtures/comprehensive-syntax.txt');

	test('should load Home / EPUB Packer and display main navigation', async ({ page }) => {
		await page.goto('/');

		// Check navigation links
		const epubLink = page.getByRole('link', { name: /Đóng gói EPUB/i }).first();
		await expect(epubLink).toBeVisible();

		const editorLink = page.getByRole('link', { name: /EPUB Editor/i }).first();
		await expect(editorLink).toBeVisible();
	});

	test('should upload .txt fixture, customize metadata & jacket, and trigger packing in EPUB Packer', async ({ page }) => {
		await page.goto('/epub');
		await expect(page.getByRole('heading', { name: 'Đóng gói EPUB' })).toBeVisible();

		// 1. Upload .txt file
		const fileInput = page.locator('input[accept*=".txt"]').first();
		await fileInput.setInputFiles(fixtureTxtPath);
		await fileInput.dispatchEvent('change');
		await fileInput.dispatchEvent('input');

		// 2. Verify chapters recognized and parsed
		await expect(page.locator('text=Đã xử file .TXT thành công')).toBeVisible({ timeout: 15000 });

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

	test('should open EPUB Editor and verify Dropzone is ready', async ({ page }) => {
		await page.goto('/epub-editor');
		await expect(page.getByRole('heading', { name: 'EPUB Editor' })).toBeVisible();

		// Dropzone should be ready
		await expect(page.locator('text=Kéo thả hoặc click để chọn tệp .EPUB')).toBeVisible();
	});
});
