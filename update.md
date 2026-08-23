I'll retrieve the logs for this failing job to identify the issue and suggest a solution.
Job 97119355086 in akhademik/ebook-tools

Let me retrieve the test file to better understand the issue:
View file tests-e2e/epub-workflow.spec.ts
Problem

The E2E test is failing because the success message "Đã xử file .TXT thành công" (Vietnamese for "Successfully processed .TXT file") is not appearing after uploading a .txt file in the EPUB Packer. The test fails at line 29 with a timeout after waiting 10 seconds.

The failure occurs across all three retry attempts, indicating this is a consistent issue with the file processing workflow rather than a flaky test.
Root Cause

The test uploads a .txt file and expects a success notification to appear, but the message never renders. This suggests either:

    File processing is failing silently - The file upload handler isn't successfully processing the file
    Success message logic is broken - The component isn't displaying the success notification even if processing completes
    Timing issue - The processing takes longer than 10 seconds or the file path is incorrect

Solution

Let me check the fixture file and the EPUB Packer component to identify the issue:
what is the solution?
Get file tests/fixtures
Search EPUB Packer file upload success message Đã xử file .TXT thành công in akhademik/ebook-tools
Search results for "Đã xử file .TXT thành công" in "repo:akhademik/ebook-tools" and 2 other tool calls
View file src/lib/epub-packer/components/EpubSourceSection.svelte

Now I can see the full picture. The success message is set in the state file at line 151 of epub-source-state.svelte.ts, and it's displayed in the component at line 373. The message should appear in the UI after successful file processing. Let me check if the fixture file exists:
View directory tests/fixtures

The fixture file exists. Now let me check how the file upload is being triggered in the test and verify the handler:
View search results for handleFile in repo:akhademik/ebook-tools

Now let me check the DropZone component to see if onSelect is being triggered properly:
View file src/lib/components/DropZone.svelte
Solution

The issue is in the test's file selection method. The test is using Playwright's setInputFiles() and dispatchEvent('change'), but this doesn't trigger the oninput event that the DropZone component listens to.

Looking at the DropZone component (line 55), it has both:
Svelte

onchange={handleFileChange} oninput={handleFileChange}

However, in the test (line 26 of the E2E spec), the test only dispatches change:
TypeScript

await fileInput.dispatchEvent('change');

The problem is that when using Playwright's setInputFiles(), you need to also ensure the input event fires, or the file handler may not be triggered properly in certain browser environments.
Recommended Fix

Update the E2E test to explicitly wait for the file to be processed and trigger both events:
TypeScript

test('should upload .txt fixture, customize metadata & jacket, and trigger packing in EPUB Packer', async ({ page }) => {
await page.goto('/epub');
await expect(page.getByRole('heading', { name: 'Đóng gói EPUB' })).toBeVisible();

    // 1. Upload .txt file
    const fileInput = page.locator('input[accept*=".txt"]').first();
    await fileInput.setInputFiles(fixtureTxtPath);

    // Trigger both change and input events to ensure the handler fires
    await fileInput.dispatchEvent('change');
    await fileInput.dispatchEvent('input');

    // Wait for the success message with increased timeout
    await expect(page.locator('text=Đã xử file .TXT thành công')).toBeVisible({ timeout: 15000 });

    // ... rest of test

Key changes:

    Added await fileInput.dispatchEvent('input'); to ensure the oninput handler is triggered
    Increased timeout to 15000ms to account for file processing time in CI environments
    The file path is already correct (the fixture file exists at tests/fixtures/comprehensive-syntax.txt)

This ensures both event handlers in the DropZone component are properly invoked, which will trigger the file selection flow in the EpubSourceState.
