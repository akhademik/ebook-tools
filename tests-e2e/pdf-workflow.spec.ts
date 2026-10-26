// tests-e2e/pdf-workflow.spec.ts
import { test, expect } from '@playwright/test';
import * as path from 'node:path';
import * as fs from 'node:fs';

test.describe('PDF Splitter End-to-End Browser Workflows', () => {
	const fixturePdfPath = path.resolve('tests/fixtures/sample-test.pdf');

	function ensurePdfFixture(): void {
		const pdfContent = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R 4 0 R] /Count 2 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 200 200] /Contents 5 0 R /Resources << /Font << /F1 7 0 R >> >> >>
endobj
4 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 200 200] /Contents 6 0 R /Resources << /Font << /F1 7 0 R >> >> >>
endobj
5 0 obj
<< /Length 44 >>
stream
BT
/F1 12 Tf
10 100 Td
(Page 1 Content) Tj
ET
endstream
endobj
6 0 obj
<< /Length 44 >>
stream
BT
/F1 12 Tf
10 100 Td
(Page 2 Content) Tj
ET
endstream
endobj
7 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 8
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000121 00000 n 
0000000247 00000 n 
0000000373 00000 n 
0000000468 00000 n 
0000000563 00000 n 
trailer
<< /Size 8 /Root 1 0 R >>
startxref
634
%%EOF
`;
		fs.writeFileSync(fixturePdfPath, pdfContent);
	}

	test.beforeAll(() => {
		ensurePdfFixture();
	});

	test.afterAll(() => {
		if (fs.existsSync(fixturePdfPath)) {
			fs.unlinkSync(fixturePdfPath);
		}
	});

	test('Workflow 1: Upload PDF → Preview Pages & Adjust Crop', async ({ page }) => {
		await page.goto('/pdf');
		await page.waitForLoadState('networkidle');

		// Check initial UI state
		await expect(page.getByRole('heading', { name: /Tách trang PDF/i })).toBeVisible();

		// Upload test PDF
		const fileInput = page.locator('input[type="file"]');
		await fileInput.setInputFiles(fixturePdfPath);

		// Verify file loaded and controls appear
		await expect(page.getByText('Cắt xén Header / Footer')).toBeVisible();

		// Click to load preview
		const loadPreviewBtn = page.getByRole('button', { name: /Tải ảnh xem trước/i });
		await expect(loadPreviewBtn).toBeVisible();
		await loadPreviewBtn.click();

		// Wait for preview image to appear
		const previewImg = page.locator('img[alt="Xem trước trang"]');
		await expect(previewImg).toBeVisible({ timeout: 10000 });

		// Adjust crop +10px on Header
		const plus10HeaderBtn = page.getByRole('button', { name: '+10' }).first();
		await plus10HeaderBtn.click();
		await expect(page.getByText('Sẽ cắt 10px trên')).toBeVisible();
	});

	test('Workflow 2: Upload PDF → Split Pages → Download ZIP (Verify non-empty file)', async ({
		page
	}) => {
		await page.goto('/pdf');
		await page.waitForLoadState('networkidle');

		// Upload test PDF
		const fileInput = page.locator('input[type="file"]');
		await fileInput.setInputFiles(fixturePdfPath);

		// Download button should be initially disabled
		const downloadBtn = page.getByRole('button', { name: /Tải tệp \.ZIP/i });
		await expect(downloadBtn).toBeDisabled();

		// Click Start Splitting
		const startBtn = page.getByRole('button', { name: /Bắt đầu tách trang/i });
		await expect(startBtn).toBeVisible();
		await startBtn.click();

		// Wait for process completion
		await expect(page.getByText(/Hoàn tất/i)).toBeVisible({ timeout: 15000 });

		// Download button should now be enabled
		await expect(downloadBtn).toBeEnabled();

		// Trigger download and verify non-empty file
		const [download] = await Promise.all([page.waitForEvent('download'), downloadBtn.click()]);

		expect(download.suggestedFilename()).toMatch(/\.zip$/i);
		const downloadPath = await download.path();
		expect(downloadPath).toBeTruthy();
		if (downloadPath) {
			const stats = fs.statSync(downloadPath);
			expect(stats.size).toBeGreaterThan(100); // Verify it is a real non-empty ZIP!
		}
	});

	test('Workflow 3: Direct-to-Disk Flow → Button must be disabled ("Đã lưu vào đĩa") and not download empty ZIP', async ({
		page
	}) => {
		await page.goto('/pdf');
		await page.waitForLoadState('networkidle');

		// Mock File System Access API
		await page.evaluate(() => {
			const mockWritable = {
				write: async (_data: unknown) => {},
				close: async () => {}
			};
			const mockFileHandle = {
				createWritable: async () => mockWritable
			};
			const mockDirHandle = {
				name: 'TestExportFolder',
				kind: 'directory',
				getFileHandle: async (_name: string, _opts: unknown) => mockFileHandle
			};
			(window as unknown as { showDirectoryPicker: () => Promise<unknown> }).showDirectoryPicker =
				async () => mockDirHandle;
		});

		// Upload test PDF
		const fileInput = page.locator('input[type="file"]');
		await fileInput.setInputFiles(fixturePdfPath);

		// Pick destination directory
		const pickDirBtn = page.getByRole('button', { name: /Chọn thư mục lưu/i });
		await expect(pickDirBtn).toBeVisible();
		await pickDirBtn.click();

		// Verify directory selected badge
		await expect(page.getByText('📁 TestExportFolder')).toBeVisible();

		// Start splitting to disk
		const startBtn = page.getByRole('button', { name: /Bắt đầu tách trang/i });
		await startBtn.click();

		// Wait for completion
		await expect(page.getByText(/Hoàn tất/i)).toBeVisible({ timeout: 15000 });

		// Verify success notification
		await expect(
			page.getByText(/Đã lưu thành công các phần ZIP vào thư mục TestExportFolder/i)
		).toBeVisible();

		// CRITICAL FIX VERIFICATION:
		// The button must display "Đã lưu vào đĩa" and MUST BE DISABLED!
		const savedBtn = page.getByRole('button', { name: /Đã lưu vào đĩa/i });
		await expect(savedBtn).toBeVisible();
		await expect(savedBtn).toBeDisabled();
	});
});
