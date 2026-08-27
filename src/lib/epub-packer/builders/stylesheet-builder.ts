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
		if (fonts.h1Font && fonts.h1Font !== 'default') {
			const f1 = findFont(fonts.h1Font);
			if (f1) {
				fontFaces += getFontCSSDeclaration(fonts.h1Font);
				elementFontRules += `\nh1 { font-family: "${f1.cssFamily}", serif !important; }`;
			}
		}
		if (fonts.h2Font && fonts.h2Font !== 'default') {
			const f2 = findFont(fonts.h2Font);
			if (f2) {
				if (fonts.h2Font !== fonts.h1Font) {
					fontFaces += getFontCSSDeclaration(fonts.h2Font);
				}
				elementFontRules += `\nh2 { font-family: "${f2.cssFamily}", serif !important; }`;
			}
		}
		if (fonts.dropcapFont && fonts.dropcapFont !== 'default') {
			const fd = findFont(fonts.dropcapFont);
			if (fd) {
				if (fonts.dropcapFont !== fonts.h1Font && fonts.dropcapFont !== fonts.h2Font) {
					fontFaces += getFontCSSDeclaration(fonts.dropcapFont);
				}
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
