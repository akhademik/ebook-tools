// tests/epub-css-specificity.test.ts
import { describe, it, expect } from 'vitest';
import {
	EPUB_CSS,
	prepareFinalCss,
	getDynamicCss
} from '../src/lib/epub-packer/builders/stylesheet-builder';
import { buildContentOpf } from '../src/lib/epub-packer/xml-builders/opf-builder';
import { buildNavXhtml } from '../src/lib/epub-packer/xml-builders/nav-builder';
import { buildChapterXhtml } from '../src/lib/epub-packer/xml-builders/chapter-builder';
import { parseTxtToChapters } from '../src/lib/epub-packer/parser/txt-parser';
import { prepareChapters } from '../src/lib/epub-packer/builders/asset-builder';
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
				html: '<h1 class="main-chap">Tiêu đề</h1><h2 class="side-chap">Phụ đề</h2><p class="has-dropcap"><span class="dropcap">T</span>ext</p>',
				features: { hasHeadings: true, hasCenterPage: true }
			}
		];
		const fonts: EpubFontsConfig = {
			bodyFont: 'Bookerly',
			h1Font: 'Minh-Tu',
			h2Font: 'Minh-Tu',
			h2SubFont: 'Bookerly',
			dropcapFont: 'Minh-Tu',
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
});
