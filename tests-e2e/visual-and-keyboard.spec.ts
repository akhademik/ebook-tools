import { test, expect } from '@playwright/test';

const viewports = [
	{ name: 'mobile-390px', width: 390, height: 844 },
	{ name: 'tablet-768px', width: 768, height: 1024 },
	{ name: 'desktop-1440px', width: 1440, height: 900 }
];

for (const vp of viewports) {
	test(`Visual & Layout: Overview page at ${vp.name} (Light and Dark)`, async ({
		page
	}, testInfo) => {
		await page.setViewportSize({ width: vp.width, height: vp.height });
		await page.goto('/');
		await page.waitForLoadState('networkidle');

		// 1. Assertions on structure and content
		const brandHeading = page.locator('text=Ebook Forge').first();
		await expect(brandHeading).toBeVisible();

		// Suggested scanned book workflow card must be present and visible
		const workflowCard = page.getByText(/Gợi ý quy trình xử lý sách quét/i);
		await expect(workflowCard).toBeVisible();
		await expect(page.getByText('Tách PDF → JPG').first()).toBeVisible();
		await expect(page.getByText('Nhận diện chữ (OCR)').first()).toBeVisible();
		await expect(page.getByText('Bước 3').first()).toBeVisible();
		await expect(page.getByText('Bước 4').first()).toBeVisible();

		// Feature navigation links
		await expect(page.getByRole('link', { name: /Đóng gói EPUB/i }).first()).toBeVisible();
		await expect(page.getByRole('link', { name: /EPUB Editor/i }).first()).toBeVisible();

		// Viewport responsiveness assertions
		if (vp.width < 768) {
			// Mobile: drawer open button exists in mobile header
			const openMenuBtn = page.locator('button[aria-label="Mở menu"]');
			await expect(openMenuBtn).toBeVisible();
		} else {
			// Tablet & Desktop (>= 768px): sidebar is visible
			const sidebar = page.locator('aside');
			await expect(sidebar).toBeVisible();
		}

		// Verify NO unintended horizontal scroll across viewports
		const hasHorizontalOverflow = await page.evaluate(
			() => document.documentElement.scrollWidth > window.innerWidth
		);
		expect(hasHorizontalOverflow).toBe(false);

		// Capture Light and Dark screenshots using testInfo.outputPath (portable, CI-friendly)
		await page.evaluate(() => {
			document.documentElement.classList.remove('dark');
			localStorage.setItem('theme', 'light');
		});
		await page.waitForTimeout(100);
		await page.screenshot({
			path: testInfo.outputPath(`overview-${vp.name}-light.png`),
			fullPage: true
		});

		await page.evaluate(() => {
			document.documentElement.classList.add('dark');
			localStorage.setItem('theme', 'dark');
		});
		await page.waitForTimeout(100);
		await page.screenshot({
			path: testInfo.outputPath(`overview-${vp.name}-dark.png`),
			fullPage: true
		});
	});

	test(`Visual & Layout: EPUB Packer at ${vp.name} (Light and Dark)`, async ({
		page
	}, testInfo) => {
		await page.setViewportSize({ width: vp.width, height: vp.height });
		await page.goto('/epub-packer');
		await page.waitForLoadState('networkidle');

		// 1. Heading and primary step
		await expect(page.getByRole('heading', { name: 'Đóng gói EPUB' })).toBeVisible();

		// Step navigation: step 1 (Nguồn) is initially active
		const stepSourceBtn = page.getByRole('button', { name: /1.*Nguồn/i }).first();
		await expect(stepSourceBtn).toBeVisible();

		// File dropzone area is present
		const dropZone = page.locator('input[type="file"]').first();
		await expect(dropZone).toBeAttached();

		// Responsive layout checks
		if (vp.width <= 768) {
			// Mobile/Tablet: step bar fits without causing window horizontal overflow
			const stepNav = page.locator('ol');
			await expect(stepNav).toBeVisible();
		} else {
			// Desktop: full 5-step navigation items visible
			await expect(page.getByRole('button', { name: /Thông tin/i }).first()).toBeVisible();
			await expect(page.getByRole('button', { name: /Bìa và hoa văn/i }).first()).toBeVisible();
			await expect(page.getByRole('button', { name: /Phông chữ/i }).first()).toBeVisible();
			await expect(page.getByRole('button', { name: /Đóng gói/i }).first()).toBeVisible();
		}

		// Verify NO unintended horizontal scroll across viewports
		const hasHorizontalOverflow = await page.evaluate(
			() => document.documentElement.scrollWidth > window.innerWidth
		);
		expect(hasHorizontalOverflow).toBe(false);

		// Capture Light and Dark screenshots
		await page.evaluate(() => {
			document.documentElement.classList.remove('dark');
			localStorage.setItem('theme', 'light');
		});
		await page.waitForTimeout(100);
		await page.screenshot({
			path: testInfo.outputPath(`packer-${vp.name}-light.png`),
			fullPage: true
		});

		await page.evaluate(() => {
			document.documentElement.classList.add('dark');
			localStorage.setItem('theme', 'dark');
		});
		await page.waitForTimeout(100);
		await page.screenshot({
			path: testInfo.outputPath(`packer-${vp.name}-dark.png`),
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

	// Verify modal is open and has dialog semantics
	const modalTitle = page.locator('div[role="dialog"] span:has-text("Bảng quy ước")');
	await expect(modalTitle).toBeVisible();

	// Press Escape to close modal
	await page.keyboard.press('Escape');
	await expect(modalTitle).not.toBeVisible();

	// Verify sidebar collapse button is keyboard accessible and toggles state
	const collapseBtn = page.locator('button[aria-label="Thu gọn menu"]');
	if (await collapseBtn.isVisible()) {
		await collapseBtn.focus();
		await page.keyboard.press('Enter');
		await page.waitForTimeout(200);

		// Now it should be expanded button
		const expandBtn = page.locator('button[aria-label="Mở rộng menu"]');
		await expect(expandBtn).toBeVisible();

		// Press Enter to expand again
		await expandBtn.focus();
		await page.keyboard.press('Enter');
		await page.waitForTimeout(200);
		await expect(collapseBtn).toBeVisible();
	}
});
