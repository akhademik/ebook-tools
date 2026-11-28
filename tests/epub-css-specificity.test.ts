// tests/epub-css-specificity.test.ts
import { describe, it, expect, vi } from 'vitest';

const { cssMocks } = await vi.hoisted(async () => {
	const fs = await import('node:fs');
	const path = await import('node:path');
	const cssDir = path.resolve(__dirname, '../src/lib/epub-packer/templates/css-template');
	const read = (name: string) => fs.readFileSync(path.join(cssDir, name), 'utf-8');
	return {
		cssMocks: {
			base: read('base.css'),
			centerPage: read('center-page.css'),
			headings: read('headings.css'),
			ornaments: read('ornaments.css'),
			headingCombinators: read('heading-combinators.css'),
			quotes: read('quotes.css'),
			breaks: read('breaks.css'),
			notes: read('notes.css'),
			intro: read('intro-css.css')
		}
	};
});

vi.mock('../src/lib/epub-packer/templates/css-template/base.css?raw', () => ({
	default: cssMocks.base
}));
vi.mock('../src/lib/epub-packer/templates/css-template/center-page.css?raw', () => ({
	default: cssMocks.centerPage
}));
vi.mock('../src/lib/epub-packer/templates/css-template/headings.css?raw', () => ({
	default: cssMocks.headings
}));
vi.mock('../src/lib/epub-packer/templates/css-template/ornaments.css?raw', () => ({
	default: cssMocks.ornaments
}));
vi.mock('../src/lib/epub-packer/templates/css-template/heading-combinators.css?raw', () => ({
	default: cssMocks.headingCombinators
}));
vi.mock('../src/lib/epub-packer/templates/css-template/quotes.css?raw', () => ({
	default: cssMocks.quotes
}));
vi.mock('../src/lib/epub-packer/templates/css-template/breaks.css?raw', () => ({
	default: cssMocks.breaks
}));
vi.mock('../src/lib/epub-packer/templates/css-template/notes.css?raw', () => ({
	default: cssMocks.notes
}));
vi.mock('../src/lib/epub-packer/templates/css-template/intro-css.css?raw', () => ({
	default: cssMocks.intro
}));
import {
	EPUB_CSS,
	prepareFinalCss,
	getDynamicCss,
	buildJacketCss
} from '../src/lib/epub-packer/builders/stylesheet-builder';
import { buildContentOpf } from '../src/lib/epub-packer/xml-builders/opf-builder';
import { buildNavXhtml } from '../src/lib/epub-packer/xml-builders/nav-builder';
import { buildChapterXhtml } from '../src/lib/epub-packer/xml-builders/chapter-builder';
import { parseTxtToChapters } from '../src/lib/epub-packer/parser/txt-parser';
import { prepareChapters, resolveActiveFonts } from '../src/lib/epub-packer/builders/asset-builder';
import type { EpubChapterItem, EpubFontsConfig, OrnamentsConfig } from '../src/lib/types';

/**
 * Calculate W3C CSS selector specificity (A, B, C)
 * A: ID selectors (#id)
 * B: Classes (.class), attributes ([attr]), pseudo-classes (:pseudo)
 * C: Type / element selectors (h1, h2, p) and pseudo-elements (::pseudo)
 */
export function calculateSpecificity(selector: string): [number, number, number] {
	const cleaned = selector.trim();
	let a = 0;
	let b = 0;
	let c = 0;

	// Remove pseudo-element double colons for tokenizing
	const pseudoElements = cleaned.match(/::[a-zA-Z0-9_-]+/g) || [];
	c += pseudoElements.length;
	let s = cleaned.replace(/::[a-zA-Z0-9_-]+/g, '');

	// IDs (#id)
	const ids = s.match(/#[a-zA-Z0-9_-]+/g) || [];
	a += ids.length;
	s = s.replace(/#[a-zA-Z0-9_-]+/g, ' ');

	// Attributes ([attr="val"])
	const attrs = s.match(/\[[^\]]+\]/g) || [];
	b += attrs.length;
	s = s.replace(/\[[^\]]+\]/g, ' ');

	// Classes (.class)
	const classes = s.match(/\.[a-zA-Z0-9_-]+/g) || [];
	b += classes.length;
	s = s.replace(/\.[a-zA-Z0-9_-]+/g, ' ');

	// Pseudo-classes (:pseudo)
	const pseudoClasses = s.match(/:[a-zA-Z0-9_-]+(?:\([^)]*\))?/g) || [];
	b += pseudoClasses.length;
	s = s.replace(/:[a-zA-Z0-9_-]+(?:\([^)]*\))?/g, ' ');

	// Combinators and punctuation
	s = s.replace(/[+>~]/g, ' ');

	// Remaining words are element type selectors
	const words = s.split(/\s+/).filter(Boolean);
	for (const word of words) {
		if (word !== '*' && /^[a-zA-Z0-9_-]+$/.test(word)) {
			c++;
		}
	}

	return [a, b, c];
}

/**
 * Compare two specificities: returns < 0 if sp1 < sp2, > 0 if sp1 > sp2, 0 if equal.
 */
export function compareSpecificity(
	sp1: [number, number, number],
	sp2: [number, number, number]
): number {
	if (sp1[0] !== sp2[0]) return sp1[0] - sp2[0];
	if (sp1[1] !== sp2[1]) return sp1[1] - sp2[1];
	return sp1[2] - sp2[2];
}

/**
 * Extract target subject element (e.g. 'h2' from 'h1.main-chap + h2.side-chap')
 */
export function getTargetSubject(selector: string): string {
	const parts = selector.trim().split(/[+>~,\s]+/);
	const rightmost = parts[parts.length - 1];
	const elementMatch = rightmost.match(/^[a-zA-Z0-9_-]+/);
	if (elementMatch) {
		return elementMatch[0].toLowerCase();
	}
	const classMatch = rightmost.match(/\.([a-zA-Z0-9_-]+)/);
	if (classMatch) {
		return '.' + classMatch[1].toLowerCase();
	}
	return rightmost.toLowerCase();
}

/**
 * Verify Stylelint no-descending-specificity rule across all rules in CSS string.
 */
export function findDescendingSpecificityErrors(css: string): string[] {
	const errors: string[] = [];
	// Strip comments
	const cleanCss = css.replace(/\/\*[\s\S]*?\*\//g, '');

	// Match CSS rules: selectors { ... }
	const ruleRegex = /([^{}]+)\{([^{}]+)\}/g;
	let match;

	const seenSelectorsBySubject = new Map<
		string,
		Array<{ raw: string; specificity: [number, number, number]; index: number }>
	>();

	let ruleIdx = 0;
	while ((match = ruleRegex.exec(cleanCss)) !== null) {
		const rawSelectorList = match[1].trim();
		if (rawSelectorList.startsWith('@')) {
			// Skip @font-face, @page, @media
			continue;
		}

		const selectors = rawSelectorList
			.split(',')
			.map((s) => s.trim())
			.filter(Boolean);

		for (const sel of selectors) {
			const subject = getTargetSubject(sel);
			const sp = calculateSpecificity(sel);

			if (!seenSelectorsBySubject.has(subject)) {
				seenSelectorsBySubject.set(subject, []);
			}

			const previous = seenSelectorsBySubject.get(subject)!;
			for (const prev of previous) {
				// If current selector has lower specificity than an earlier selector targeting the same element:
				if (compareSpecificity(sp, prev.specificity) < 0) {
					errors.push(
						`Expected selector "${sel}" (${sp.join(',')}) to come before selector "${prev.raw}" (${prev.specificity.join(',')}) for subject "${subject}"`
					);
				}
			}

			previous.push({ raw: sel, specificity: sp, index: ruleIdx++ });
		}
	}

	return errors;
}

describe('EPUB CSS Specificity & Calibre Quality Enforcement', () => {
	it('should verify EPUB_CSS has zero descending specificity violations', () => {
		const errors = findDescendingSpecificityErrors(EPUB_CSS);
		expect(errors).toEqual([]);
	});

	it('should verify getDynamicCss has zero descending specificity violations with headings & ornaments', () => {
		const chapters: EpubChapterItem[] = [
			{
				xmlId: 'ch1',
				fileName: 'chap_01',
				title: 'Chương 1',
				html: '<h1>Tiêu đề</h1><h2>Phụ đề</h2><p>Nội dung</p>',
				features: { hasHeadings: true, hasCenterPage: true, hasQuotes: true, hasBreaks: true }
			}
		];
		const ornaments: OrnamentsConfig = {
			chapterOrnament: { file: new File([''], 'orn1.png'), previewUrl: 'blob:orn1' },
			subchapterOrnament: { file: new File([''], 'orn2.png'), previewUrl: 'blob:orn2' }
		};

		const css = getDynamicCss(chapters, ornaments);
		const errors = findDescendingSpecificityErrors(css);
		expect(errors).toEqual([]);
	});

	it('should verify prepareFinalCss has zero descending specificity errors under Calibre failing scenario (ornaments + all fonts)', () => {
		const chapters: EpubChapterItem[] = [
			{
				xmlId: 'ch1',
				fileName: 'chap_01',
				title: 'Chương 1',
				html: '<h1 class="main-chap">Tiêu đề</h1><h2 class="side-chap">Phụ đề</h2><p class="has-dropcap"><span class="dropcap">T</span>ext</p><blockquote><p>Quote</p></blockquote>',
				features: { hasHeadings: true, hasCenterPage: true, hasQuotes: true }
			}
		];
		const fonts: EpubFontsConfig = {
			bodyFont: 'Bookerly',
			h1Font: 'Absolute-VH',
			h2Font: 'Absolute-VH',
			h2SubFont: 'Bookerly',
			dropcapFont: 'Absolute-VH',
			quoteFont: 'Absolute-VH',
			quoteAuthorFont: 'Absolute-VH',
			jacketFont: 'default'
		};
		const ornaments: OrnamentsConfig = {
			chapterOrnament: { file: new File([''], 'orn1.png'), previewUrl: 'blob:orn1' },
			subchapterOrnament: { file: new File([''], 'orn2.png'), previewUrl: 'blob:orn2' }
		};

		const finalCss = prepareFinalCss(chapters, undefined, fonts, ornaments);

		// Assert: All 6 selectors from Calibre error report are in strictly ascending order
		const errors = findDescendingSpecificityErrors(finalCss);
		expect(errors).toEqual([]);

		// Specific sanity checks on selector presence and sequence
		expect(finalCss).toContain('.subchapter-ornament + h2');
		expect(finalCss).toContain('h1.main-chap + h2.side-chap');
		expect(finalCss).toContain('h1.main-chap + .subchapter-ornament + h2.side-chap');

		const idxSubOrnamentH2 = finalCss.indexOf('.subchapter-ornament + h2');
		const idxH1MainH2Side = finalCss.indexOf('h1.main-chap + h2.side-chap');
		const idxHighSpec = finalCss.indexOf('h1.main-chap + .subchapter-ornament + h2.side-chap');

		expect(idxSubOrnamentH2).toBeLessThan(idxH1MainH2Side);
		expect(idxH1MainH2Side).toBeLessThan(idxHighSpec);
	});

	it('should verify prepareFinalCss with only f2 and without f2Sub preserves zero specificity errors', () => {
		const chapters: EpubChapterItem[] = [
			{
				xmlId: 'ch1',
				fileName: 'chap_01',
				title: 'Chương 1',
				html: '<h1 class="main-chap">Tiêu đề</h1><h2 class="side-chap">Phụ đề</h2>',
				features: { hasHeadings: true }
			}
		];
		const fonts: EpubFontsConfig = {
			bodyFont: 'Bookerly',
			h1Font: 'default',
			h2Font: 'Minh-Tu',
			h2SubFont: 'default',
			dropcapFont: 'default',
			jacketFont: 'default'
		};

		const finalCss = prepareFinalCss(chapters, undefined, fonts, null);
		const errors = findDescendingSpecificityErrors(finalCss);
		expect(errors).toEqual([]);
	});

	it('should guarantee that .note p and scene-break selectors come before higher-specificity p selectors', () => {
		const chapters: EpubChapterItem[] = [
			{
				xmlId: 'ch1',
				fileName: 'chap_01',
				title: 'Chương 1',
				html: '<blockquote><p>Quote</p></blockquote><p class="scene-break-small">*</p><div class="letter"><p>Letter</p></div>',
				features: { hasHeadings: true, hasQuotes: true, hasBreaks: true, hasNotes: true }
			},
			{
				xmlId: 'notes',
				fileName: 'notes',
				title: 'Chú thích',
				html: '<aside class="note"><p>Footnote</p></aside>',
				isNotes: true,
				features: { hasNotes: true }
			}
		];

		const css = getDynamicCss(chapters);
		const errors = findDescendingSpecificityErrors(css);
		expect(errors).toEqual([]);

		// Specific sanity check for the user-reported Calibre error:
		// .note p must come before blockquote.center p, h1.main-chap + p, .letter p:first-child
		const idxNoteP = css.indexOf('.note p');
		const idxBqCenterP = css.indexOf('blockquote.center p');
		const idxH1MainP = css.indexOf('h1.main-chap + p');
		const idxLetterFirstChild = css.indexOf('.letter p:first-child');

		expect(idxNoteP).toBeGreaterThan(-1);
		expect(idxBqCenterP).toBeGreaterThan(-1);
		expect(idxH1MainP).toBeGreaterThan(-1);
		expect(idxLetterFirstChild).toBeGreaterThan(-1);

		expect(idxNoteP).toBeLessThan(idxBqCenterP);
		expect(idxNoteP).toBeLessThan(idxH1MainP);
		expect(idxNoteP).toBeLessThan(idxLetterFirstChild);
	});

	it('should guarantee quote font does not trigger descending specificity', () => {
		const chapters: EpubChapterItem[] = [
			{
				xmlId: 'ch1',
				fileName: 'chap_01',
				title: 'Chương 1',
				html: '<blockquote><p>Quote</p></blockquote><div class="letter"><p>Letter</p></div>',
				features: { hasQuotes: true }
			}
		];
		const fonts: EpubFontsConfig = {
			quoteFont: 'Absolute-VH'
		};
		const css = prepareFinalCss(chapters, undefined, fonts, null);
		const errors = findDescendingSpecificityErrors(css);
		expect(errors).toEqual([]);
	});

	it('should guarantee buildJacketCss generates zero descending specificity errors across all 14 templates with 3 font pairs', () => {
		const fonts: EpubFontsConfig = {
			jacketFont: 'Bookerly',
			jacketTitleFont: 'Absolute-VH',
			jacketAuthorFont: 'BCDowntown',
			jacketMetaFont: 'Bookerly'
		};

		for (let templateId = 1; templateId <= 14; templateId++) {
			const jacket = {
				enabled: true,
				templateId,
				title: 'Mật Mã Da Vinci',
				originalTitle: 'The Da Vinci Code',
				author: 'Dan Brown',
				translator: 'Đỗ Thu Hà',
				publisher: '1980 Books',
				distributor: 'NXB Văn hóa'
			};
			const jacketCss = buildJacketCss(jacket, fonts);
			const errors = findDescendingSpecificityErrors(jacketCss);
			expect(errors).toEqual([]);

			// Assert viewport horizontal & vertical centering in EPUB output
			expect(jacketCss).toContain('display: flex;');
			expect(jacketCss).toContain('justify-content: center;');
			expect(jacketCss).toContain('align-items: center;');
			expect(jacketCss).toContain('margin: auto;');

			// Assert title font injection
			expect(jacketCss).toContain('font-family: "KKTTAbsolute", serif !important;');
			// Assert author font injection
			expect(jacketCss).toContain('font-family: "iCielBC Downtown", serif !important;');
			// Assert meta font injection
			expect(jacketCss).toContain('font-family: "Bookerly", serif !important;');

			// Deduplication check: Bookerly @font-face is declared only once even if used in jacketFont & jacketMetaFont
			const bookerlyFaceMatches =
				jacketCss.match(/@font-face\s*\{[^}]*font-family:\s*"Bookerly"/g) || [];
			expect(bookerlyFaceMatches.length).toBe(1);
		}
	});
});

describe('EPUB 3 Accessibility & WAI-ARIA Calibre Compliance', () => {
	it('should generate content.opf with standard W3C Accessibility 1.1 metadata', () => {
		const meta = {
			identifier: 'urn:uuid:12345',
			title: 'Cuốn Sách Mẫu',
			language: 'vi',
			author: 'Tác Giả'
		};
		const chapters: EpubChapterItem[] = [
			{ xmlId: 'ch1', fileName: 'chap_01', title: 'Chương 1', html: '<p>Nội dung</p>' }
		];

		const opf = buildContentOpf(meta, chapters, true, [], null, []);

		expect(opf).toContain('<meta property="schema:accessMode">textual</meta>');
		expect(opf).toContain('<meta property="schema:accessMode">visual</meta>');
		expect(opf).toContain('<meta property="schema:accessModeSufficient">textual</meta>');
		expect(opf).toContain(
			'<meta property="schema:accessibilityFeature">structuralNavigation</meta>'
		);
		expect(opf).toContain('<meta property="schema:accessibilityFeature">readingOrder</meta>');
		expect(opf).toContain('<meta property="schema:accessibilityFeature">tableOfContents</meta>');
		expect(opf).toContain('<meta property="schema:accessibilityHazard">none</meta>');
		expect(opf).toContain('<meta property="schema:accessibilitySummary">');
		expect(opf).toContain('<dc:contributor id="packer">akhademik &amp; vc</dc:contributor>');
		expect(opf).toContain(
			'<meta refines="#packer" property="role" scheme="marc:relators">mrk</meta>'
		);
		expect(opf).toContain('<meta refines="#packer" property="file-as">akhademik &amp; vc</meta>');
		expect(opf).toContain('<meta name="generator" content="akhademik &amp; vc"/>');
	});

	it('should generate cover SVG with accessible title and ARIA role and label', async () => {
		const chapters: EpubChapterItem[] = [
			{ xmlId: 'ch1', fileName: 'chap_01', title: 'Chương 1', html: '<p>Nội dung</p>' }
		];
		const coverBlob = { width: 1200, height: 1600 } as any;

		const packedChapters = prepareChapters(
			chapters,
			{ enabled: false, templateId: 'jacket-1' } as any,
			coverBlob
		);

		const coverChap = packedChapters.find((c) => c.fileName === 'cover');
		expect(coverChap).toBeDefined();
		expect(coverChap!.html).toContain('<title>Bìa sách</title>');
		expect(coverChap!.html).toContain('role="img" aria-label="Bìa sách"');
	});

	it('should generate nav.xhtml with role="doc-toc" on nav element', () => {
		const chapters: EpubChapterItem[] = [
			{
				xmlId: 'ch1',
				fileName: 'chap_01',
				title: 'Chương 1',
				html: '<h1 class="main-chap">Chương 1</h1>'
			}
		];
		const navHtml = buildNavXhtml({ language: 'vi' }, chapters);
		expect(navHtml).toContain('<nav epub:type="toc" role="doc-toc" id="toc">');
	});

	it('should generate footnotes with role="doc-noteref", role="doc-footnote", and role="doc-backlink"', () => {
		const txt = `@@ Chương 1\nNội dung có chú thích {1}.\n\nChú thích:\n{1} Nội dung chú thích 1.`;
		const chapters = parseTxtToChapters(txt, {}, 'My Book');

		expect(chapters[0].html).toContain(
			'<a class="noteref" epub:type="noteref" role="doc-noteref" id="fnref1" href="notes.xhtml#fn1"><sup>1</sup></a>'
		);

		const notes = chapters[1];
		expect(notes.html).toContain(
			'<aside epub:type="footnote" role="doc-footnote" id="fn1" class="note">'
		);
		expect(notes.html).toContain('role="doc-backlink"');
	});
});

describe('CSS Comment Stripping Verification (Zero Comments in Final EPUB)', () => {
	it('should ensure EPUB_CSS, getDynamicCss, and prepareFinalCss contain zero comments', () => {
		expect(EPUB_CSS).not.toMatch(/\/\*[\s\S]*?\*\//);

		const dynamicCss = getDynamicCss(
			[
				{
					xmlId: 'c1',
					fileName: 'c1',
					title: 'C1',
					features: { hasHeadings: true, hasCenterPage: true, hasQuotes: true, hasBreaks: true }
				}
			],
			null
		);
		expect(dynamicCss).not.toMatch(/\/\*[\s\S]*?\*\//);

		const finalCssWithComments = prepareFinalCss(
			[{ xmlId: 'c1', fileName: 'c1', title: 'C1' }],
			'/* Comment 1 */ body { margin: 0; } /* Comment 2 */'
		);
		expect(finalCssWithComments).not.toMatch(/\/\*[\s\S]*?\*\//);
		expect(finalCssWithComments).toBe('body { margin: 0; }');
	});

	it('should ensure buildChapterXhtml strips comments from inline customCss in <style>', () => {
		const chapter: EpubChapterItem = {
			xmlId: 'ch1',
			fileName: 'chap_01',
			title: 'Chương 1',
			html: '<p>Nội dung</p>'
		};
		const xhtml = buildChapterXhtml(
			{ language: 'vi' } as any,
			chapter,
			false,
			'/* Inline Comment */ .jacket-1 { color: red; } /* Footer comment */'
		);
		expect(xhtml).toContain('<style>\n.jacket-1 { color: red; }\n  </style>');
		expect(xhtml).not.toContain('/* Inline Comment */');
		expect(xhtml).not.toContain('/* Footer comment */');
	});

	it('should ensure buildJacketCss strips all comments and produces clean jacket.css', () => {
		const jacketCss = buildJacketCss({
			enabled: true,
			templateId: 1,
			title: 'Title',
			author: 'Author',
			originalTitle: '',
			publisher: '',
			distributor: ''
		});
		expect(jacketCss).toContain('.jacket-1');
		expect(jacketCss).not.toMatch(/\/\*[\s\S]*?\*\//);
	});

	it('should link to styles/jacket.css for jacket chapter without inline style', () => {
		const chapter: EpubChapterItem = {
			xmlId: 'jacket',
			fileName: 'jacket',
			title: 'Trang Lót',
			html: '<div class="jacket-1"><p class="title">My Book</p></div>'
		};
		const xhtml = buildChapterXhtml({ language: 'vi' } as any, chapter);
		expect(xhtml).toContain('<link rel="stylesheet" type="text/css" href="../styles/jacket.css"/>');
		expect(xhtml).not.toContain(
			'<link rel="stylesheet" type="text/css" href="../styles/style.css"/>'
		);
		expect(xhtml).not.toContain('<style>');
	});

	it('should inject quote and quote author fonts without duplicate @font-face declarations when fonts overlap', () => {
		const chapters: EpubChapterItem[] = [
			{
				xmlId: 'ch1',
				fileName: 'chap_01',
				title: 'Chương 1',
				html: '<h1>Tiêu đề</h1><blockquote><p>Quote text</p><footer>Author</footer></blockquote>',
				features: { hasQuotes: true, hasHeadings: true } as any
			}
		];
		const fonts: EpubFontsConfig = {
			h1Font: 'Bookerly',
			quoteFont: 'Bookerly',
			quoteAuthorFont: 'Bookerly'
		};

		const finalCss = prepareFinalCss(chapters, undefined, fonts);

		// Verify @font-face for Bookerly is injected only once
		const fontFaceMatches = finalCss.match(/@font-face\s*\{[^}]*Bookerly/g) || [];
		expect(fontFaceMatches.length).toBe(1);

		// Verify style rules for h1, blockquote, and blockquote footer
		expect(finalCss).toContain('h1 { font-family: "Bookerly", serif !important; }');
		expect(finalCss).toContain(
			'blockquote, blockquote p { font-family: "Bookerly", serif !important; }'
		);
		// Verify blockquote footer has font rule merged without duplicate selector
		expect(finalCss).toContain('blockquote footer {\n\tfont-family: "Bookerly", serif !important;');
		const footerMatches = finalCss.match(/blockquote footer\s*\{/g) || [];
		expect(footerMatches.length).toBe(1);

		// Also test custom font shared between H1, Quote and Quote Author
		const customFonts: EpubFontsConfig = {
			h1Font: 'Absolute-VH',
			quoteFont: 'Absolute-VH',
			quoteAuthorFont: 'Absolute-VH'
		};
		const customCss = prepareFinalCss(chapters, undefined, customFonts);
		const customMatches = customCss.match(/@font-face\s*\{[^}]*Absolute-VH/g) || [];
		expect(customMatches.length).toBe(1);
		expect(customCss).toContain('h1 { font-family: "KKTTAbsolute", serif !important; }');
		expect(customCss).toContain(
			'blockquote, blockquote p { font-family: "KKTTAbsolute", serif !important; }'
		);
		expect(customCss).toContain(
			'blockquote footer {\n\tfont-family: "KKTTAbsolute", serif !important;'
		);
		const customFooterMatches = customCss.match(/blockquote footer\s*\{/g) || [];
		expect(customFooterMatches.length).toBe(1);

		// Test when chapters do not have quotes: blockquote footer rule is added without duplicate
		const noQuotesCss = prepareFinalCss(
			[{ xmlId: 'ch1', fileName: 'chap_01', title: 'Chương 1', html: '<p>Text</p>' }],
			undefined,
			{ quoteAuthorFont: 'Bookerly' }
		);
		expect(noQuotesCss).toContain(
			'blockquote footer { font-family: "Bookerly", serif !important; }'
		);
		const noQuotesFooterMatches = noQuotesCss.match(/blockquote footer\s*\{/g) || [];
		expect(noQuotesFooterMatches.length).toBe(1);
	});

	it('should resolve active fonts with deduplication when quote and quoteAuthor fonts are specified', () => {
		const fonts: EpubFontsConfig = {
			h1Font: 'Bookerly',
			quoteFont: 'Bookerly',
			quoteAuthorFont: 'Bookerly',
			blobs: {
				Bookerly: new Blob(['mock-bookerly-bytes'])
			}
		};

		const active = resolveActiveFonts(fonts);
		expect(active).toEqual(['Bookerly']);
	});

	it('should resolve active fonts with deduplication when jacket font pairs are specified', () => {
		const fonts: EpubFontsConfig = {
			jacketTitleFont: 'Absolute-VH',
			jacketAuthorFont: 'BCDowntown',
			jacketMetaFont: 'Absolute-VH',
			blobs: {
				'Absolute-VH': new Blob(['mock-absolute-bytes']),
				BCDowntown: new Blob(['mock-bcdowntown-bytes'])
			}
		};

		const active = resolveActiveFonts(fonts);
		expect(active).toEqual(['Absolute-VH', 'BCDowntown']);
	});

	it('should shrink-wrap blockquote.center with display: table and auto margins so footer aligns with quote', () => {
		const chapters: EpubChapterItem[] = [
			{
				xmlId: 'ch1',
				fileName: 'chap_01',
				title: 'Chương 1',
				html: '<blockquote class="center"><p>to be, or not to be, that\'s the question</p><footer class="right">william shakespeare</footer></blockquote>',
				features: { hasQuotes: true } as any
			}
		];
		const css = getDynamicCss(chapters);
		expect(css).toContain('blockquote.center {');
		expect(css).toContain('display: table;');
		expect(css).toContain('margin: 1.2em auto;');
		expect(css).toContain('max-width: 100%;');

		const errors = findDescendingSpecificityErrors(css);
		expect(errors).toEqual([]);
	});
});
