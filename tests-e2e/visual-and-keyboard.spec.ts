import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const SCREENSHOT_DIR =
	'/home/hajtran/.gemini/antigravity-cli/brain/c41c0d88-4a43-407d-867a-eafa99f7180e/screenshots';

test.beforeAll(() => {
	if (!fs.existsSync(SCREENSHOT_DIR)) {
		fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
	}
});

const viewports = [
	{ name: 'mobile-390px', width: 390, height: 844 },
	{ name: 'tablet-768px', width: 768, height: 1024 },
	{ name: 'desktop-1440px', width: 1440, height: 900 }
];

for (const vp of viewports) {
	test(`Visual check: Overview page at ${vp.name} (Light and Dark)`, async ({ page }) => {
		await page.setViewportSize({ width: vp.width, height: vp.height });
		await page.goto('/');
		await page.waitForLoadState('networkidle');

		// 1. Light mode screenshot
		await page.evaluate(() => {
			document.documentElement.classList.remove('dark');
			localStorage.setItem('theme', 'light');
		});
		await page.waitForTimeout(200);
		await page.screenshot({
			path: path.join(SCREENSHOT_DIR, `overview-${vp.name}-light.png`),
			fullPage: true
		});

		// 2. Dark mode screenshot
		await page.evaluate(() => {
			document.documentElement.classList.add('dark');
			localStorage.setItem('theme', 'dark');
		});
		await page.waitForTimeout(200);
		await page.screenshot({
			path: path.join(SCREENSHOT_DIR, `overview-${vp.name}-dark.png`),
			fullPage: true
		});
	});

	test(`Visual check: EPUB Packer at ${vp.name} (Light and Dark)`, async ({ page }) => {
		await page.setViewportSize({ width: vp.width, height: vp.height });
		await page.goto('/epub-packer');
		await page.waitForLoadState('networkidle');

		// 1. Light mode screenshot
		await page.evaluate(() => {
			document.documentElement.classList.remove('dark');
			localStorage.setItem('theme', 'light');
		});
		await page.waitForTimeout(200);
		await page.screenshot({
			path: path.join(SCREENSHOT_DIR, `packer-${vp.name}-light.png`),
			fullPage: true
		});

		// 2. Dark mode screenshot
		await page.evaluate(() => {
			document.documentElement.classList.add('dark');
			localStorage.setItem('theme', 'dark');
		});
		await page.waitForTimeout(200);
		await page.screenshot({
			path: path.join(SCREENSHOT_DIR, `packer-${vp.name}-dark.png`),
			fullPage: true
		});
	});
}

test('Keyboard Navigation: Tab, Enter, and Esc on EPUB Packer and Modal', async ({ page }) => {
	await page.setViewportSize({ width: 1440, height: 900 });
	await page.goto('/epub-packer');
	await page.waitForLoadState('networkidle');

	// Open syntax guide modal with keyboard
	const syntaxBtn = page.locator('button:has-text("Xem")').first();
	await expect(syntaxBtn).toBeVisible();

	// Focus and press Enter
	await syntaxBtn.focus();
	await page.keyboard.press('Enter');

	// Verify modal is open
	const modalTitle = page.locator('div[role="dialog"] span:has-text("Bảng quy ước")');
	await expect(modalTitle).toBeVisible();

	// Press Escape to close modal
	await page.keyboard.press('Escape');
	await expect(modalTitle).not.toBeVisible();

	// Verify sidebar collapse button is accessible via keyboard
	const collapseBtn = page.locator('button[aria-label="Thu gọn menu"]');
	if (await collapseBtn.isVisible()) {
		await collapseBtn.focus();
		await page.keyboard.press('Enter');
		await page.waitForTimeout(300);

		// Now it should be expanded button
		const expandBtn = page.locator('button[aria-label="Mở rộng menu"]');
		await expect(expandBtn).toBeVisible();

		// Press Enter to expand again
		await expandBtn.focus();
		await page.keyboard.press('Enter');
		await page.waitForTimeout(300);
		await expect(collapseBtn).toBeVisible();
	}
});
