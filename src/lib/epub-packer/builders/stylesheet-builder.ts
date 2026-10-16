// src/lib/epub-packer/builders/stylesheet-builder.ts
import { findFont, getFontCSSDeclaration } from '../templates/fonts';
import baseCss from '../templates/css-template/base.css?raw';
import centerPageCss from '../templates/css-template/center-page.css?raw';
import headingsCss from '../templates/css-template/headings.css?raw';
import quotesCss from '../templates/css-template/quotes.css?raw';
import breaksCss from '../templates/css-template/breaks.css?raw';
import notesCss from '../templates/css-template/notes.css?raw';
import ornamentsCss from '../templates/css-template/ornaments.css?raw';

import type { EpubChapterItem, OrnamentsConfig, EpubFontsConfig } from '$lib/types';

export const EPUB_CSS =
	baseCss +
	'\n' +
	centerPageCss +
	'\n' +
	ornamentsCss +
	'\n' +
	headingsCss +
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
	if (ornaments?.chapterOrnament || ornaments?.subchapterOrnament) {
		css += '\n' + ornamentsCss;
	}
	if (hasHeadings) css += '\n' + headingsCss;
	if (hasQuotes) css += '\n' + quotesCss;
	if (hasBreaks) css += '\n' + breaksCss;
	if (hasNotes) css += '\n' + notesCss;

	return css;
}

/**
 * Prepare final CSS with font declarations and ornament styles
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
		if (finalCss.includes('.dropcap')) {
			finalCss = finalCss.replace('.dropcap', `${ornamentsCss}\n\n.dropcap`);
		} else {
			finalCss += '\n' + ornamentsCss;
		}
	}

	// Generate @font-face and element-level font rules
	let fontFaces = '';
	let elementFontRules = '';
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
			elementFontRules += `\nh1 { font-family: "${f1.cssFamily}", serif !important; }`;
		}

		if (f2 && f2Sub) {
			// Both H2 (main) and H2 Sub fonts are defined:
			// 1. By default, h2 receives the main H2 font
			// 2. Elements with .h2-sub (standalone h2, h2 after <p>, or consecutive h2) receive h2SubFont
			// 3. h1 + h2 reinforces main H2 font
			elementFontRules += `\nh2, .side-chap { font-family: "${f2.cssFamily}", serif !important; }`;
			elementFontRules += `\nh2.h2-sub, .side-chap.h2-sub, h2 + h2, .side-chap + .side-chap { font-family: "${f2Sub.cssFamily}", serif !important; }`;
			elementFontRules += `\nh1 + h2, h1.main-chap + h2.side-chap, h1 + .subchapter-ornament + h2, h1.main-chap + .subchapter-ornament + h2.side-chap { font-family: "${f2.cssFamily}", serif !important; }`;
		} else if (f2 && !f2Sub) {
			// Only main H2 font is defined -> all h2 elements use f2
			elementFontRules += `\nh2 { font-family: "${f2.cssFamily}", serif !important; }`;
		} else if (!f2 && f2Sub) {
			// Only H2 Sub font is defined -> h2-sub elements and h2+h2 use f2Sub
			elementFontRules += `\nh2.h2-sub, .side-chap.h2-sub, h2 + h2, .side-chap + .side-chap { font-family: "${f2Sub.cssFamily}", serif !important; }`;
		}

		if (fd) {
			if (finalCss.includes('.dropcap {')) {
				finalCss = finalCss.replace(
					'.dropcap {',
					`.dropcap {\n  font-family: "${fd.cssFamily}", serif !important;`
				);
			} else {
				elementFontRules += `\n.dropcap { font-family: "${fd.cssFamily}", serif !important; }`;
			}
		}
	}

	// Inject element font rules at element selector position (before classes and combinators)
	if (elementFontRules) {
		if (finalCss.includes('p.has-dropcap')) {
			finalCss = finalCss.replace('p.has-dropcap', `${elementFontRules.trim()}\n\np.has-dropcap`);
		} else if (finalCss.includes('.chapter-ornament')) {
			finalCss = finalCss.replace(
				'.chapter-ornament',
				`${elementFontRules.trim()}\n\n.chapter-ornament`
			);
		} else if (finalCss.includes('.dropcap')) {
			finalCss = finalCss.replace('.dropcap', `${elementFontRules.trim()}\n\n.dropcap`);
		} else {
			finalCss = `${elementFontRules.trim()}\n` + finalCss;
		}
	}

	if (fontFaces) {
		finalCss = fontFaces.trim() + '\n\n' + finalCss;
	}

	return finalCss;
}
