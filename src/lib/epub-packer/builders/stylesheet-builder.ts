// src/lib/epub-packer/builders/stylesheet-builder.ts
import { findFont, getFontCSSDeclaration } from '../templates/fonts';
import baseCss from '../templates/css-template/base.css?raw';
import centerPageCss from '../templates/css-template/center-page.css?raw';
import headingsCss from '../templates/css-template/headings.css?raw';
import ornamentsCss from '../templates/css-template/ornaments.css?raw';
import headingCombinatorsCss from '../templates/css-template/heading-combinators.css?raw';
import quotesCss from '../templates/css-template/quotes.css?raw';
import breaksCss from '../templates/css-template/breaks.css?raw';
import notesCss from '../templates/css-template/notes.css?raw';

import type { EpubChapterItem, OrnamentsConfig, EpubFontsConfig } from '$lib/types';

export const EPUB_CSS =
	baseCss +
	'\n' +
	centerPageCss +
	'\n' +
	headingsCss +
	'\n' +
	ornamentsCss +
	'\n' +
	headingCombinatorsCss +
	'\n' +
	quotesCss +
	'\n' +
	breaksCss +
	'\n' +
	notesCss;

export function getDynamicCss(
	chapters: EpubChapterItem[],
	ornaments?: OrnamentsConfig | null
): string {
	let css = baseCss;
	let hasCenterPage = false;
	let hasHeadings = false;
	let hasQuotes = false;
	let hasBreaks = false;
	let hasNotes = false;

	for (const ch of chapters) {
		if (ch.features) {
			if (ch.features.hasCenterPage) hasCenterPage = true;
			if (ch.features.hasHeadings) hasHeadings = true;
			if (ch.features.hasQuotes) hasQuotes = true;
			if (ch.features.hasBreaks) hasBreaks = true;
			if (ch.features.hasNotes) hasNotes = true;
		}

		if (ch.isNotes) {
			hasNotes = true;
		}

		const html = ch.html || '';
		if (!hasCenterPage && /class=["'][^"']*(?:center-page)[^"']*["']/i.test(html)) {
			hasCenterPage = true;
		}
		if (
			!hasHeadings &&
			(/<h[1-6]\b/i.test(html) ||
				/class=["'][^"']*(?:main-chap|side-chap|break-main-chap|chno|dropcap)[^"']*["']/i.test(
					html
				))
		) {
			hasHeadings = true;
		}
		if (
			!hasQuotes &&
			(/<blockquote\b/i.test(html) || /class=["'][^"']*(?:letter|poem)[^"']*["']/i.test(html))
		) {
			hasQuotes = true;
		}
		if (!hasBreaks && /class=["'][^"']*(?:scene-break|sbreak)[^"']*["']/i.test(html)) {
			hasBreaks = true;
		}
		if (
			!hasNotes &&
			(/<aside\b[^>]*epub:type=["']footnote["']/i.test(html) ||
				/class=["'][^"']*(?:noteref|footnote|notenum)[^"']*["']/i.test(html))
		) {
			hasNotes = true;
		}
	}

	if (hasCenterPage) css += '\n' + centerPageCss;
	if (hasHeadings) css += '\n' + headingsCss;
	if (ornaments?.chapterOrnament || ornaments?.subchapterOrnament) {
		css += '\n' + ornamentsCss;
	}
	if (hasHeadings) css += '\n' + headingCombinatorsCss;
	if (hasQuotes) css += '\n' + quotesCss;
	if (hasBreaks) css += '\n' + breaksCss;
	if (hasNotes) css += '\n' + notesCss;

	return css;
}

/**
 * Prepare final CSS with font declarations and ornament styles (strictly non-descending specificity)
 */
export function prepareFinalCss(
	chapters: EpubChapterItem[],
	customCss?: string,
	fonts?: EpubFontsConfig | null,
	ornaments?: OrnamentsConfig | null
): string {
	let finalCss =
		customCss && customCss !== EPUB_CSS ? customCss : getDynamicCss(chapters, ornaments);

	if (
		(ornaments?.chapterOrnament || ornaments?.subchapterOrnament) &&
		!finalCss.includes('.chapter-ornament')
	) {
		if (finalCss.includes('h1.main-chap + h1.main-chap')) {
			finalCss = finalCss.replace(
				'h1.main-chap + h1.main-chap',
				`${ornamentsCss}\n\nh1.main-chap + h1.main-chap`
			);
		} else {
			finalCss += '\n' + ornamentsCss;
		}
	}

	// Generate @font-face and element-level font rules categorized by specificity layers
	let fontFaces = '';
	let fontBaseRules = ''; // Layer 2: specificity (0, 0, x) / (0, 1, 0)
	let fontSubchapterRules = ''; // Layer 3: specificity (0, 1, 1) / (0, 1, 2)
	let fontCompoundRules = ''; // Layer 4: specificity (0, 2, 0)
	let fontHighSpecificityRules = ''; // Layer 5: specificity (0, 2, 2) / (0, 3, 2)

	if (fonts) {
		const f1 = fonts.h1Font && fonts.h1Font !== 'default' ? findFont(fonts.h1Font) : null;
		const f2 = fonts.h2Font && fonts.h2Font !== 'default' ? findFont(fonts.h2Font) : null;
		const f2Sub =
			fonts.h2SubFont && fonts.h2SubFont !== 'default' ? findFont(fonts.h2SubFont) : null;
		const fd =
			fonts.dropcapFont && fonts.dropcapFont !== 'default' ? findFont(fonts.dropcapFont) : null;

		// Deduplicate @font-face declarations
		const fontFaceIds = new Set<string>();
		for (const f of [f1, f2, f2Sub, fd]) {
			if (f && !fontFaceIds.has(f.id)) {
				fontFaceIds.add(f.id);
				fontFaces += getFontCSSDeclaration(f.id);
			}
		}

		if (f1) {
			fontBaseRules += `\nh1 { font-family: "${f1.cssFamily}", serif !important; }`;
		}

		if (f2 && f2Sub) {
			// Base layer (0, 0, x)
			fontBaseRules += `\nh2, .side-chap { font-family: "${f2.cssFamily}", serif !important; }`;
			fontBaseRules += `\nh1 + h2 { font-family: "${f2.cssFamily}", serif !important; }`;
			fontBaseRules += `\nh2 + h2 { font-family: "${f2Sub.cssFamily}", serif !important; }`;

			// Subchapter layer (0, 1, 1) and (0, 1, 2)
			fontSubchapterRules += `\nh2.h2-sub { font-family: "${f2Sub.cssFamily}", serif !important; }`;
			fontSubchapterRules += `\nh1 + .subchapter-ornament + h2 { font-family: "${f2.cssFamily}", serif !important; }`;

			// Compound class layer (0, 2, 0)
			fontCompoundRules += `\n.side-chap.h2-sub, .side-chap + .side-chap { font-family: "${f2Sub.cssFamily}", serif !important; }`;

			// High specificity layer (0, 2, 2) and (0, 3, 2)
			fontHighSpecificityRules += `\nh1.main-chap + h2.side-chap, h1.main-chap + .subchapter-ornament + h2.side-chap { font-family: "${f2.cssFamily}", serif !important; }`;
		} else if (f2 && !f2Sub) {
			fontBaseRules += `\nh2, .side-chap { font-family: "${f2.cssFamily}", serif !important; }`;
		} else if (!f2 && f2Sub) {
			fontBaseRules += `\nh2 + h2 { font-family: "${f2Sub.cssFamily}", serif !important; }`;
			fontSubchapterRules += `\nh2.h2-sub { font-family: "${f2Sub.cssFamily}", serif !important; }`;
			fontCompoundRules += `\n.side-chap.h2-sub, .side-chap + .side-chap { font-family: "${f2Sub.cssFamily}", serif !important; }`;
		}

		if (fd) {
			if (finalCss.includes('.dropcap {')) {
				finalCss = finalCss.replace(
					'.dropcap {',
					`.dropcap {\n  font-family: "${fd.cssFamily}", serif !important;`
				);
			} else {
				fontBaseRules += `\n.dropcap { font-family: "${fd.cssFamily}", serif !important; }`;
			}
		}
	}

	// Layered injection ensuring strictly ascending specificity order
	// Layer 2: Base rules (before headings.css)
	if (fontBaseRules) {
		const marker = '.dropcap {\n\tfloat: left;';
		if (finalCss.includes(marker)) {
			finalCss = finalCss.replace(marker, `${fontBaseRules.trim()}\n\n${marker}`);
		} else if (finalCss.includes('.break-main-chap {\n\tmargin-top: 2em;')) {
			finalCss = finalCss.replace(
				'.break-main-chap {\n\tmargin-top: 2em;',
				`${fontBaseRules.trim()}\n\n.break-main-chap {\n\tmargin-top: 2em;`
			);
		} else {
			finalCss += `\n${fontBaseRules.trim()}`;
		}
	}

	// Layer 3: Subchapter rules (specificity 0, 1, 1 and 0, 1, 2)
	if (fontSubchapterRules) {
		const marker = '.subchapter-ornament + h2 {\n\tmargin-top: 0.2em !important;\n}';
		if (finalCss.includes(marker)) {
			finalCss = finalCss.replace(marker, `${marker}\n${fontSubchapterRules.trim()}`);
		} else if (finalCss.includes('h1.main-chap + h1.main-chap')) {
			finalCss = finalCss.replace(
				'h1.main-chap + h1.main-chap',
				`${fontSubchapterRules.trim()}\n\nh1.main-chap + h1.main-chap`
			);
		} else {
			finalCss += `\n${fontSubchapterRules.trim()}`;
		}
	}

	// Layer 4: Compound class rules (specificity 0, 2, 0)
	if (fontCompoundRules) {
		if (finalCss.includes('h1.main-chap + h1.main-chap')) {
			finalCss = finalCss.replace(
				'h1.main-chap + h1.main-chap',
				`${fontCompoundRules.trim()}\n\nh1.main-chap + h1.main-chap`
			);
		} else {
			finalCss += `\n${fontCompoundRules.trim()}`;
		}
	}

	// Layer 5: High specificity rules (specificity 0, 2, 2 and 0, 3, 2)
	if (fontHighSpecificityRules) {
		const marker = 'h1.main-chap + h2.side-chap {\n\tmargin-top: 1.2em !important;\n}';
		if (finalCss.includes(marker)) {
			finalCss = finalCss.replace(marker, `${marker}\n${fontHighSpecificityRules.trim()}`);
		} else {
			finalCss += `\n${fontHighSpecificityRules.trim()}`;
		}
	}

	// Layer 1: @font-face rules at the absolute top
	if (fontFaces) {
		finalCss = fontFaces.trim() + '\n\n' + finalCss;
	}

	return finalCss;
}
