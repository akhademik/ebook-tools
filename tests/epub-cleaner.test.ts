// tests/epub-cleaner.test.ts
import { describe, it, expect } from 'vitest';
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
			zip.file('META-INF/container.xml', '<container><rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles></container>');

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

			const plan = await (await import('../src/lib/epub-editor/epub-cleaner')).analyzeOptimizationPlan(zip);
			expect(plan.duplicateResources.length).toBeGreaterThan(0);
			expect(plan.savingsBreakdown.duplicateResources).toBe(4000);

			const report = await (await import('../src/lib/epub-editor/epub-cleaner')).optimizeEpub(zip, {
				deduplicateResources: true,
				cleanOpfManifest: true
			});

			expect(report.deduplicatedResources).toContain('OEBPS/images/dup_used.jpg');
			expect(zip.file('OEBPS/images/dup_used.jpg')).toBeNull();
		});
	});
});
