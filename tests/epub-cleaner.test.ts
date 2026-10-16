// tests/epub-cleaner.test.ts
import { describe, it, expect, vi } from 'vitest';
import JSZip from 'jszip';
import {
	extractCssUrls,
	extractHtmlReferences,
	analyzeEpub,
	cleanEpub,
	formatByteSize
} from '../src/lib/epub-editor/epub-cleaner';

describe('EPUB Cleaner & Optimizer unit tests', () => {
	describe('formatByteSize', () => {
		it('should format bytes properly into B, KB, MB', () => {
			expect(formatByteSize(500)).toBe('500 B');
			expect(formatByteSize(2048)).toBe('2.0 KB');
			expect(formatByteSize(5 * 1024 * 1024)).toBe('5.00 MB');
		});
	});

	describe('extractCssUrls & extractHtmlReferences', () => {
		it('should extract font and image urls from CSS', () => {
			const css = `
				@font-face {
					font-family: 'CustomFont';
					src: url('../fonts/custom.otf') format('opentype');
				}
				body {
					background-image: url("../images/bg.jpg");
				}
				.icon {
					background: url('data:image/png;base64,123') no-repeat;
				}
			`;
			const urls = extractCssUrls(css);
			expect(urls).toEqual(['../fonts/custom.otf', '../images/bg.jpg']);
		});

		it('should extract images, styles, and links from HTML', () => {
			const html = `
				<!DOCTYPE html>
				<html>
				<head>
					<link rel="stylesheet" href="../styles/main.css" />
					<style>
						@font-face { src: url('../fonts/inline.ttf'); }
					</style>
				</head>
				<body>
					<img src="../images/fig1.png" alt="Figure 1" />
					<svg viewBox="0 0 100 100">
						<image xlink:href="../images/svg-img.jpg" width="100" height="100" />
					</svg>
					<a href="chapter2.xhtml">Next Chapter</a>
				</body>
				</html>
			`;
			const refs = extractHtmlReferences(html);
			expect(refs.styles).toEqual(['../styles/main.css']);
			expect(refs.images).toEqual(['../images/fig1.png', '../images/svg-img.jpg']);
			expect(refs.fonts).toEqual(['../fonts/inline.ttf']);
			expect(refs.links).toEqual(['chapter2.xhtml']);
		});
	});

	describe('analyzeEpub and cleanEpub', () => {
		async function createSampleEpubZip(): Promise<JSZip> {
			const zip = new JSZip();
			zip.file('mimetype', 'application/epub+zip');
			zip.file(
				'META-INF/container.xml',
				'<container><rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles></container>'
			);

			// OPF
			zip.file(
				'OEBPS/content.opf',
				`<package unique-identifier="BookID">
					<manifest>
						<item id="c1" href="text/ch1.xhtml" media-type="application/xhtml+xml"/>
						<item id="css" href="styles/style.css" media-type="text/css"/>
						<item id="used-img" href="images/used.jpg" media-type="image/jpeg"/>
						<item id="unused-img" href="images/unused.png" media-type="image/png"/>
						<item id="used-font" href="fonts/used.ttf" media-type="font/ttf"/>
						<item id="unused-font" href="fonts/unused.otf" media-type="font/otf"/>
						<item id="unused-css" href="styles/orphan.css" media-type="text/css"/>
						<item id="cover" href="images/cover.jpg" properties="cover-image" media-type="image/jpeg"/>
					</manifest>
					<spine>
						<itemref idref="c1"/>
					</spine>
				</package>`
			);

			// Chapter 1 references used.jpg and style.css
			zip.file(
				'OEBPS/text/ch1.xhtml',
				`<html>
				<head><link rel="stylesheet" href="../styles/style.css" /></head>
				<body>
					<p>Hello</p>
					<img src="../images/used.jpg" />
				</body>
				</html>`
			);

			// style.css references used.ttf
			zip.file(
				'OEBPS/styles/style.css',
				`@font-face { font-family: 'UsedFont'; src: url('../fonts/used.ttf'); }`
			);

			// Orphan CSS
			zip.file('OEBPS/styles/orphan.css', 'body { color: purple; }');

			// Binary asset dummy contents
			zip.file('OEBPS/images/cover.jpg', new Uint8Array(5000));
			zip.file('OEBPS/images/used.jpg', new Uint8Array(4000));
			zip.file('OEBPS/images/unused.png', new Uint8Array(6000));
			zip.file('OEBPS/fonts/used.ttf', new Uint8Array(8000));
			zip.file('OEBPS/fonts/unused.otf', new Uint8Array(10000));

			return zip;
		}

		it('should accurately detect unused images, fonts, styles and cover protection', async () => {
			const zip = await createSampleEpubZip();
			const analysis = await analyzeEpub(zip);

			expect(analysis.unusedImages.map((i) => i.path)).toContain('OEBPS/images/unused.png');
			expect(analysis.unusedImages.map((i) => i.path)).not.toContain('OEBPS/images/used.jpg');
			expect(analysis.unusedImages.map((i) => i.path)).not.toContain('OEBPS/images/cover.jpg');

			expect(analysis.unusedFonts.map((f) => f.path)).toContain('OEBPS/fonts/unused.otf');
			expect(analysis.unusedFonts.map((f) => f.path)).not.toContain('OEBPS/fonts/used.ttf');

			expect(analysis.unusedStyles.map((s) => s.path)).toContain('OEBPS/styles/orphan.css');
			expect(analysis.unusedStyles.map((s) => s.path)).not.toContain('OEBPS/styles/style.css');

			expect(analysis.estimatedSavingsBytes).toBe(6000 + 10000 + 'body { color: purple; }'.length);
		});

		it('should delete unused resources and clean OPF manifest', async () => {
			const zip = await createSampleEpubZip();
			const report = await cleanEpub(zip, {
				removeUnusedImages: true,
				removeUnusedFonts: true,
				removeUnusedStyles: true,
				cleanOpfManifest: true
			});

			expect(report.removedImages).toEqual(['OEBPS/images/unused.png']);
			expect(report.removedFonts).toEqual(['OEBPS/fonts/unused.otf']);
			expect(report.removedStyles).toEqual(['OEBPS/styles/orphan.css']);
			expect(report.savedBytes).toBeGreaterThan(15000);

			// Check files removed from zip
			expect(zip.file('OEBPS/images/unused.png')).toBeNull();
			expect(zip.file('OEBPS/fonts/unused.otf')).toBeNull();
			expect(zip.file('OEBPS/styles/orphan.css')).toBeNull();

			// Check protected files kept
			expect(zip.file('OEBPS/images/cover.jpg')).not.toBeNull();
			expect(zip.file('OEBPS/images/used.jpg')).not.toBeNull();
			expect(zip.file('OEBPS/fonts/used.ttf')).not.toBeNull();

			// Check OPF manifest cleaned
			const updatedOpf = await zip.file('OEBPS/content.opf')?.async('text');
			expect(updatedOpf).not.toContain('unused.png');
			expect(updatedOpf).not.toContain('unused.otf');
			expect(updatedOpf).not.toContain('orphan.css');
			expect(updatedOpf).toContain('used.jpg');
			expect(updatedOpf).toContain('used.ttf');
		});

		it('should detect duplicate resources by content hash and optimize them', async () => {
			const zip = await createSampleEpubZip();
			// Add duplicate image
			zip.file('OEBPS/images/dup_used.jpg', new Uint8Array(4000)); // identical byte array

			const progressReports: Array<{ current: number; total: number; filename: string }> = [];
			const plan = await (
				await import('../src/lib/epub-editor/epub-cleaner')
			).analyzeOptimizationPlan(zip, undefined, (current, total, filename) => {
				progressReports.push({ current, total, filename });
			});
			expect(plan.duplicateResources.length).toBeGreaterThan(0);
			expect(plan.savingsBreakdown.duplicateResources).toBe(4000);
			expect(progressReports.length).toBeGreaterThan(0);

			const report = await (
				await import('../src/lib/epub-editor/epub-cleaner')
			).optimizeEpub(zip, {
				deduplicateResources: true,
				cleanOpfManifest: true
			});

			expect(report.deduplicatedResources).toContain('OEBPS/images/dup_used.jpg');
			expect(zip.file('OEBPS/images/dup_used.jpg')).toBeNull();
		});

		it('should test computeDuplicateResources directly for edge cases', async () => {
			const { computeDuplicateResources } =
				await import('../src/lib/epub-editor/cleaner/duplicate-detector.worker');
			const dummyBytes = new Uint8Array([1, 2, 3, 4]);
			const diffBytes = new Uint8Array([5, 6, 7, 8]);
			const items = [
				{ path: 'img1.png', bytes: dummyBytes },
				{ path: 'img2.png', bytes: new Uint8Array([1, 2, 3, 4]) },
				{ path: 'img3.png', bytes: diffBytes }
			];

			const duplicates = await computeDuplicateResources(items);
			expect(duplicates).toHaveLength(1);
			expect(duplicates[0].originalPath).toBe('img1.png');
			expect(duplicates[0].duplicatePath).toBe('img2.png');
			expect(duplicates[0].byteSize).toBe(4);
		});

		it('should abort duplicate scan when AbortSignal is triggered', async () => {
			const zip = new JSZip();
			zip.file('mimetype', 'application/epub+zip');
			zip.file('OEBPS/images/img1.png', new Uint8Array([1, 2, 3]));
			zip.file('OEBPS/images/img2.png', new Uint8Array([1, 2, 3]));

			const ac = new AbortController();
			ac.abort();

			const { analyzeOptimizationPlan } = await import('../src/lib/epub-editor/epub-cleaner');
			await expect(analyzeOptimizationPlan(zip, undefined, undefined, ac.signal)).rejects.toThrow();
		});

		it('should run scanDuplicateResources directly and report progress', async () => {
			const { scanDuplicateResources } =
				await import('../src/lib/epub-editor/cleaner/duplicate-detector');
			const zip = new JSZip();
			zip.file('OEBPS/images/img1.png', new Uint8Array([10, 20, 30]));
			zip.file('OEBPS/images/img2.png', new Uint8Array([10, 20, 30]));
			zip.file('OEBPS/images/img3.png', new Uint8Array([40, 50, 60]));

			const progressCalls: { current: number; total: number; file: string }[] = [];
			const duplicates = await scanDuplicateResources(
				zip,
				undefined,
				(current, total, filename) => {
					progressCalls.push({ current, total, file: filename });
				}
			);

			expect(duplicates).toHaveLength(1);
			expect(duplicates[0].originalPath).toBe('OEBPS/images/img1.png');
			expect(duplicates[0].duplicatePath).toBe('OEBPS/images/img2.png');
			expect(progressCalls.length).toBeGreaterThan(0);
		});

		it('should reject scanDuplicateResources immediately if signal is already aborted', async () => {
			const { scanDuplicateResources } =
				await import('../src/lib/epub-editor/cleaner/duplicate-detector');
			const zip = new JSZip();
			zip.file('OEBPS/images/img1.png', new Uint8Array([1, 2, 3]));
			const ac = new AbortController();
			ac.abort();

			await expect(scanDuplicateResources(zip, undefined, undefined, ac.signal)).rejects.toThrow(
				'Tác vụ quét tài nguyên đã bị hủy'
			);
		});

		it('should not break concurrent duplicate scan jobs when one job is aborted (with Worker mock)', async () => {
			const { scanDuplicateResources, _resetDuplicateWorkerForTest } =
				await import('../src/lib/epub-editor/cleaner/duplicate-detector');
			const { computeDuplicateResources } =
				await import('../src/lib/epub-editor/cleaner/duplicate-detector.worker');

			_resetDuplicateWorkerForTest();

			const origWindow = (globalThis as any).window;
			const origWorker = globalThis.Worker;

			let workerCount = 0;
			let lastWorkerInstance: any = null;
			const trackWorkerInstance = (inst: any) => {
				lastWorkerInstance = inst;
			};

			class AsyncDuplicateWorkerMock {
				onmessage: any = null;
				onerror: any = null;
				onmessageerror: any = null;
				terminate = vi.fn();
				postMessage = vi.fn().mockImplementation((data: any) => {
					setTimeout(async () => {
						if (this.onmessage) {
							const duplicates = await computeDuplicateResources(data.items);
							this.onmessage({
								data: {
									id: data.id,
									type: 'success',
									duplicates
								}
							});
						}
					}, 30);
				});
				constructor() {
					workerCount++;
					trackWorkerInstance(this);
				}
			}

			(globalThis as any).window = {};
			(globalThis as any).Worker = AsyncDuplicateWorkerMock;

			try {
				const zip1 = new JSZip();
				zip1.file('OEBPS/images/img1.png', new Uint8Array([1, 2, 3]));
				zip1.file('OEBPS/images/img2.png', new Uint8Array([1, 2, 3]));

				const zip2 = new JSZip();
				zip2.file('OEBPS/images/imgA.png', new Uint8Array([9, 8, 7]));
				zip2.file('OEBPS/images/imgB.png', new Uint8Array([9, 8, 7]));

				const ac1 = new AbortController();
				const p1 = scanDuplicateResources(zip1, undefined, undefined, ac1.signal);
				const p2 = scanDuplicateResources(zip2);

				// Allow zip parsing to finish and jobs to be posted to the worker
				await new Promise((r) => setTimeout(r, 10));

				// 1. Both jobs are dispatched to the exact same worker instance
				expect(workerCount).toBe(1);
				expect(lastWorkerInstance.postMessage).toHaveBeenCalledTimes(2);

				// Abort task 1 while task 2 is still processing
				ac1.abort();

				// 2. Worker must NOT be terminated while task 2 is still pending
				expect(lastWorkerInstance.terminate).not.toHaveBeenCalled();

				// 3. Task 1 is rejected with AbortError
				await expect(p1).rejects.toThrow('Tác vụ quét tài nguyên đã bị hủy');

				// 4. Task 2 still receives accurate duplicate detection results
				const res2 = await p2;
				expect(res2).toHaveLength(1);
				expect(res2[0].originalPath).toBe('OEBPS/images/imgA.png');
				expect(res2[0].duplicatePath).toBe('OEBPS/images/imgB.png');
			} finally {
				_resetDuplicateWorkerForTest();
				if (origWindow !== undefined) {
					(globalThis as any).window = origWindow;
				} else {
					delete (globalThis as any).window;
				}
				if (origWorker) {
					globalThis.Worker = origWorker;
				} else {
					delete (globalThis as any).Worker;
				}
			}
		});

		it('should fallback to direct computation with fresh buffers when worker encounters error', async () => {
			const { scanDuplicateResources, _resetDuplicateWorkerForTest } =
				await import('../src/lib/epub-editor/cleaner/duplicate-detector');

			_resetDuplicateWorkerForTest();

			const origWindow = (globalThis as any).window;
			const origWorker = globalThis.Worker;

			class FailingDuplicateWorkerMock {
				onmessage: any = null;
				onerror: any = null;
				onmessageerror: any = null;
				terminate = vi.fn();
				postMessage = vi.fn().mockImplementation((data: any) => {
					// In a real browser, transferables detach the main-thread buffers
					for (const item of data.items) {
						// Simulate detached buffer (byteLength = 0)
						Object.defineProperty(item.bytes, 'byteLength', { value: 0 });
					}
					setTimeout(() => {
						if (this.onerror) {
							this.onerror({ type: 'error', message: 'Worker crashed unexpectedly' });
						}
					}, 20);
				});
			}

			(globalThis as any).window = {};
			(globalThis as any).Worker = FailingDuplicateWorkerMock;

			try {
				const zip = new JSZip();
				zip.file('OEBPS/images/pic1.jpg', new Uint8Array([42, 43, 44, 45]));
				zip.file('OEBPS/images/pic2.jpg', new Uint8Array([42, 43, 44, 45]));

				const duplicates = await scanDuplicateResources(zip);
				// Verify fallback reloaded fresh bytes from zip (non-detached, byteSize > 0)
				expect(duplicates).toHaveLength(1);
				expect(duplicates[0].originalPath).toBe('OEBPS/images/pic1.jpg');
				expect(duplicates[0].duplicatePath).toBe('OEBPS/images/pic2.jpg');
				expect(duplicates[0].byteSize).toBe(4);
				expect(duplicates[0].hash).toBeTruthy();
			} finally {
				_resetDuplicateWorkerForTest();
				if (origWindow !== undefined) {
					(globalThis as any).window = origWindow;
				} else {
					delete (globalThis as any).window;
				}
				if (origWorker) {
					globalThis.Worker = origWorker;
				} else {
					delete (globalThis as any).Worker;
				}
			}
		});
	});
});
