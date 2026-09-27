// src/lib/epub-to-txt/epub-to-txt.ts
import JSZip from 'jszip';
import { findOpfPath, extractBookMetadata } from '$lib/epub-editor/epub-book-ops';
import { resolveRelativePath } from '$lib/epub-editor/epub-editor';
import { Logger } from '$lib/utils';

export interface EpubToTxtResult {
	text: string;
	title: string;
	author: string;
	chapterCount: number;
	wordCount: number;
	charCount: number;
	fileName: string;
	txtBlob: Blob;
}

/**
 * Decode HTML/XML named and numerical entities.
 */
export function decodeHtmlEntities(text: string): string {
	if (!text) return '';

	// 1. Decode decimal numeric entities &#123;
	let decoded = text.replace(/&#(\d+);/g, (_, dec) => {
		try {
			return String.fromCodePoint(parseInt(dec, 10));
		} catch {
			return '';
		}
	});

	// 2. Decode hex numeric entities &#x1F600;
	decoded = decoded.replace(/&#x([0-9a-f]+);/gi, (_, hex) => {
		try {
			return String.fromCodePoint(parseInt(hex, 16));
		} catch {
			return '';
		}
	});

	const namedEntities: Record<string, string> = {
		'&nbsp;': ' ',
		'&amp;': '&',
		'&lt;': '<',
		'&gt;': '>',
		'&quot;': '"',
		'&apos;': "'",
		'&laquo;': '«',
		'&raquo;': '»',
		'&lsquo;': '‘',
		'&rsquo;': '’',
		'&ldquo;': '“',
		'&rdquo;': '”',
		'&ndash;': '–',
		'&mdash;': '—',
		'&hellip;': '…',
		'&bull;': '•',
		'&cent;': '¢',
		'&pound;': '£',
		'&yen;': '¥',
		'&euro;': '€',
		'&copy;': '©',
		'&reg;': '®',
		'&trade;': '™',
		'&aacute;': 'á',
		'&agrave;': 'à',
		'&atilde;': 'ã',
		'&acirc;': 'â',
		'&auml;': 'ä',
		'&eacute;': 'é',
		'&egrave;': 'è',
		'&ecirc;': 'ê',
		'&euml;': 'ë',
		'&iacute;': 'í',
		'&igrave;': 'ì',
		'&icirc;': 'î',
		'&iuml;': 'ï',
		'&oacute;': 'ó',
		'&ograve;': 'ò',
		'&otilde;': 'õ',
		'&ocirc;': 'ô',
		'&ouml;': 'ö',
		'&uacute;': 'ú',
		'&ugrave;': 'ù',
		'&ucirc;': 'û',
		'&uuml;': 'ü',
		'&yacute;': 'ý',
		'&ccedil;': 'ç',
		'&ntilde;': 'ñ'
	};

	decoded = decoded.replace(/&[a-zA-Z0-9]+;/g, (match) => {
		const lower = match.toLowerCase();
		if (namedEntities[lower]) {
			return match[1] === match[1].toUpperCase() && match[1] !== match[1].toLowerCase()
				? namedEntities[lower].toUpperCase()
				: namedEntities[lower];
		}
		return match;
	});

	return decoded;
}

/**
 * Standardize text formatting:
 * 1. Between 2 words, no more than 1 space (collapse multiple spaces/tabs/NBSPs into a single space).
 * 2. Between lines, no more than 1 empty line (collapse 2+ empty lines into at most 1 empty line).
 * 3. Trim leading/trailing spaces per line and for the entire document.
 */
export function cleanTextFormatting(rawText: string): string {
	if (!rawText) return '';

	// Normalize newline characters to \n
	const normalized = rawText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

	// Split by newline
	const rawLines = normalized.split('\n');
	const processedLines: string[] = [];

	let prevLineEmpty = false;

	for (const line of rawLines) {
		// Replace multiple horizontal spaces (space, tab, nbsp, ideographic space) with single space
		const cleanedLine = line
			.replace(/[\t \u00A0\u1680\u2000-\u200A\u202F\u205F\u3000]+/g, ' ')
			.trim();

		if (cleanedLine === '') {
			// If this line is empty, only push if previous line was NOT empty (maximum 1 empty row)
			if (!prevLineEmpty && processedLines.length > 0) {
				processedLines.push('');
				prevLineEmpty = true;
			}
		} else {
			processedLines.push(cleanedLine);
			prevLineEmpty = false;
		}
	}

	// Remove trailing empty line if any
	while (processedLines.length > 0 && processedLines[processedLines.length - 1] === '') {
		processedLines.pop();
	}

	return processedLines.join('\n');
}

/**
 * Converts inline HTML elements to txt-parser convention syntax:
 * - <b> / <strong> -> *bold*
 * - <i> / <em> -> /italic/
 * - <u> / <ins> -> _underline_
 * - Footnote reference links -> {n}
 */
export function convertInlineHtmlToTxt(html: string): string {
	if (!html) return '';

	let t = html;

	// 1. Convert footnote reference links: <a class="noteref"... href="...#fn1"><sup>1</sup></a> -> {1}
	t = t.replace(
		/<a\b[^>]*\b(?:href=["'][^"']*#fn(\d+)["']|id=["']fnref(\d+)["'])[^>]*>(?:<sup\b[^>]*>)?\s*\d+\s*(?:<\/sup>)?<\/a>/gi,
		(_m, g1, g2) => `{${g1 || g2}}`
	);
	t = t.replace(
		/<a\b[^>]*\b(?:class=["'][^"']*\bnoteref\b[^"']*|epub:type=["']noteref["'])[^>]*>(?:<sup\b[^>]*>)?\s*(\d+)\s*(?:<\/sup>)?<\/a>/gi,
		(_m, g1) => `{${g1}}`
	);
	t = t.replace(
		/<sup\b[^>]*\bclass=["'][^"']*\bnoteref\b[^"']*["'][^>]*>\s*(\d+)\s*<\/sup>/gi,
		'{$1}'
	);

	// Convert span styled as bold/italic/underline from generic EPUBs
	t = t.replace(
		/<span\b[^>]*\b(?:style=["'][^"']*font-weight:\s*bold[^"']*["']|class=["'][^"']*\b(?:bold|fw-bold)\b[^"']*["'])[^>]*>([\s\S]*?)<\/span>/gi,
		'<b>$1</b>'
	);
	t = t.replace(
		/<span\b[^>]*\b(?:style=["'][^"']*font-style:\s*italic[^"']*["']|class=["'][^"']*\b(?:italic|fst-italic)\b[^"']*["'])[^>]*>([\s\S]*?)<\/span>/gi,
		'<i>$1</i>'
	);
	t = t.replace(
		/<span\b[^>]*\b(?:style=["'][^"']*text-decoration:\s*underline[^"']*["']|class=["'][^"']*\bunderline\b[^"']*["'])[^>]*>([\s\S]*?)<\/span>/gi,
		'<u>$1</u>'
	);

	// 2. Bold, Italic, Underline tags: <b>, <strong> -> *content*, <i>, <em> -> /content/, <u>, <ins> -> _content_
	// Iteratively replace innermost tags to handle nested combinations
	let prev = '';
	while (prev !== t) {
		prev = t;
		t = t.replace(/<(?:b|strong)\b[^>]*>([\s\S]*?)<\/(?:b|strong)>/gi, (_match, content) => {
			const trimmed = content.trim();
			if (!trimmed) return '';
			return `*${content}*`;
		});
		t = t.replace(/<(?:i|em)\b[^>]*>([\s\S]*?)<\/(?:i|em)>/gi, (_match, content) => {
			const trimmed = content.trim();
			if (!trimmed) return '';
			return `/${content}/`;
		});
		t = t.replace(/<(?:u|ins)\b[^>]*>([\s\S]*?)<\/(?:u|ins)>/gi, (_match, content) => {
			const trimmed = content.trim();
			if (!trimmed) return '';
			return `_${content}_`;
		});
	}

	// 3. Remove remaining inline tag wrappers (span, a, small, etc.) without losing inner text
	t = t.replace(/<\/?(?:span|a|font|small|big|abbr|cite|mark|sub)[^>]*>/gi, '');

	// Decode html entities
	t = decodeHtmlEntities(t);

	return t;
}

/**
 * Extracts pure text / inline markdown from a heading or paragraph line, stripping residual tags.
 */
function processLineContent(rawHtml: string): string {
	const converted = convertInlineHtmlToTxt(rawHtml);
	// Strip any lingering HTML tags
	const stripped = converted.replace(/<[^>]+>/g, ' ');
	return decodeHtmlEntities(stripped).trim();
}

/**
 * Checks if attributes indicate left alignment.
 */
function isLeftAligned(attrs: string): boolean {
	return (
		/\bleft\b/i.test(attrs) ||
		/text-align\s*:\s*left/i.test(attrs) ||
		/align=["']left["']/i.test(attrs)
	);
}

/**
 * Checks if attributes indicate right alignment.
 */
function isRightAligned(attrs: string): boolean {
	return (
		/\bright\b/i.test(attrs) ||
		/text-align\s*:\s*right/i.test(attrs) ||
		/align=["']right["']/i.test(attrs)
	);
}

/**
 * Checks if attributes indicate exclusion from TOC (no-toc).
 */
function isNoToc(attrs: string): boolean {
	return /\bno-toc\b/i.test(attrs) || /\bnotoc\b/i.test(attrs) || /\bhidden-toc\b/i.test(attrs);
}

/**
 * Break patterns in general EPUBs.
 */
const BIG_BREAK_PATTERN =
	/^(?:•\s*•\s*•|\*\s*\*\s*\*|\*{3,}|-{3,}|—{2,}|–{2,}|◆\s*◆\s*◆|✦\s*✦\s*✦|★\s*★\s*★|✻\s*✻\s*✻|~\s*\*\s*~|\+\s*\+\s*\+)$/u;
const SMALL_BREAK_PATTERN = /^(?:\*|•|✦|◆|★|✻|§|~|o)$/u;

/**
 * Extracts illustration identifier from an <img> tag or <figure> container.
 * E.g. <figure class="illust-box"><img src="../images/hinh-1.png" alt="hinh-1"/></figure> -> [hinh-1]
 */
function extractIllustrationTag(html: string): string | null {
	const imgMatch = /<img\b([^>]*)\/?>/i.exec(html);
	if (!imgMatch) return null;

	const attrs = imgMatch[1];
	const srcMatch = /\bsrc=["']([^"']+)["']/i.exec(attrs);
	const altMatch = /\balt=["']([^"']*)["']/i.exec(attrs);

	// Try extracting from src file basename first
	if (srcMatch) {
		const fullSrc = srcMatch[1];
		const fileName = fullSrc.split('/').pop() || '';
		const baseName = fileName.replace(/\.(jpg|jpeg|png|webp|gif|svg)$/i, '');
		if (baseName && !['cover'].includes(baseName.toLowerCase())) {
			return `[${baseName}]`;
		}
	}

	// Fallback to alt if valid identifier
	if (altMatch && altMatch[1]) {
		const alt = altMatch[1].trim();
		const cleanAlt = alt.replace(/^\[+|\]+$/g, '').trim();
		if (cleanAlt) {
			return `[${cleanAlt}]`;
		}
	}

	return null;
}

/**
 * Reverse Engine: Converts an XHTML/HTML chapter document back into raw TXT format
 * with full detection of conventions (headings @@/@/@!, blockquotes ~, figures [img],
 * poem, letter, center-page, dropcaps [c], !D, scene breaks, and inline formatting).
 */
export function htmlToCleanText(htmlContent: string): string {
	if (!htmlContent) return '';

	let content = htmlContent;

	// 1. Strip non-content structural elements
	content = content.replace(/<head\b[^>]*>[\s\S]*?<\/head>/gi, '');
	content = content.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '');
	content = content.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
	content = content.replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript>/gi, '');
	content = content.replace(/<svg\b[^>]*>[\s\S]*?<\/svg>/gi, '');

	// Strip ornament decorator containers
	content = content.replace(
		/<div\b[^>]*\bclass=["'][^"']*\b(?:chapter-ornament|subchapter-ornament)\b[^"']*["'][^>]*>[\s\S]*?<\/div>/gi,
		''
	);

	// Skip cover pages completely
	if (/<div\b[^>]*\bclass=["'][^"']*\bcover-wrapper\b[^"']*["']/i.test(content)) {
		return '';
	}

	// 2. Handle [new:center] block: <section class="center-page">
	content = content.replace(
		/<section\b[^>]*\bclass=["'][^"']*\bcenter-page\b[^"']*["'][^>]*>([\s\S]*?)<\/section>/gi,
		(_m, inner) => {
			const cleanedInner = htmlToCleanText(inner);
			return `\n\n[new:center]\n${cleanedInner}\n[/new]\n\n`;
		}
	);

	// 3. Handle [poem] block: <div class="poem">
	content = content.replace(
		/<div\b[^>]*\bclass=["'][^"']*\bpoem\b[^"']*["'][^>]*>([\s\S]*?)<\/div>/gi,
		(_m, inner) => {
			// Extract each <p> line
			const pMatches = inner.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi);
			const lines: string[] = [];
			for (const p of pMatches) {
				const lineText = processLineContent(p[1]);
				if (lineText) lines.push(lineText);
			}
			if (lines.length === 0) {
				const fallback = processLineContent(inner);
				if (fallback) lines.push(fallback);
			}
			return `\n\n[poem]\n${lines.join('\n')}\n[/poem]\n\n`;
		}
	);

	// 4. Handle [letter] block: <div class="letter">
	content = content.replace(
		/<div\b[^>]*\bclass=["'][^"']*\bletter\b[^"']*["'][^>]*>([\s\S]*?)<\/div>/gi,
		(_m, inner) => {
			const pMatches = inner.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi);
			const lines: string[] = [];
			for (const p of pMatches) {
				const lineText = processLineContent(p[1]);
				if (lineText) lines.push(lineText);
			}
			if (lines.length === 0) {
				const fallback = processLineContent(inner);
				if (fallback) lines.push(fallback);
			}
			return `\n\n[letter]\n${lines.join('\n')}\n[/letter]\n\n`;
		}
	);

	// 5. Handle figures and illustrations: <figure class="illust-box">, <figure>, <p class="image">, or <img>
	content = content.replace(
		/<figure\b[^>]*\bclass=["'][^"']*\billust-box\b[^"']*["'][^>]*>([\s\S]*?)<\/figure>/gi,
		(match) => {
			const tag = extractIllustrationTag(match);
			return tag ? `\n\n${tag}\n\n` : '';
		}
	);
	content = content.replace(/<figure\b[^>]*>([\s\S]*?)<\/figure>/gi, (match) => {
		const tag = extractIllustrationTag(match);
		return tag ? `\n\n${tag}\n\n` : '';
	});
	content = content.replace(
		/<p\b[^>]*\bclass=["'][^"']*\b(?:image|illust|figure)\b[^"']*["'][^>]*>([\s\S]*?)<\/p>/gi,
		(match) => {
			const tag = extractIllustrationTag(match);
			return tag ? `\n\n${tag}\n\n` : '';
		}
	);
	content = content.replace(
		/<img\b[^>]*\bclass=["'][^"']*\billust-img\b[^"']*["'][^>]*\/?>/gi,
		(match) => {
			const tag = extractIllustrationTag(match);
			return tag ? `\n\n${tag}\n\n` : '';
		}
	);

	// 6. Handle Blockquotes and Citations: <blockquote> or <div class="quote|blockquote|epigraph">
	content = content.replace(
		/<(?:blockquote|div)\b([^>]*\b(?:blockquote|quote|epigraph)\b[^>]*)>([\s\S]*?)<\/(?:blockquote|div)>/gi,
		(_m, attrs, inner) => {
			const isLeft = isLeftAligned(attrs);
			const isRight = isRightAligned(attrs);
			const prefix = isLeft ? '~t' : isRight ? '~p' : '~';

			let author = '';
			const footerMatch = /<footer\b[^>]*>([\s\S]*?)<\/footer>/i.exec(inner);
			if (footerMatch) {
				author = processLineContent(footerMatch[1]);
			} else {
				const citeMatch = /<cite\b[^>]*>([\s\S]*?)<\/cite>/i.exec(inner);
				if (citeMatch) {
					author = processLineContent(citeMatch[1]);
				} else {
					const authorMatch =
						/<p\b[^>]*\bclass=["'][^"']*\b(?:author|source|cite)\b[^"']*["'][^>]*>([\s\S]*?)<\/p>/i.exec(
							inner
						);
					if (authorMatch) {
						author = processLineContent(authorMatch[1]);
					}
				}
			}

			const bodyWithoutFooter = inner
				.replace(/<footer\b[^>]*>[\s\S]*?<\/footer>/gi, '')
				.replace(/<cite\b[^>]*>[\s\S]*?<\/cite>/gi, '')
				.replace(
					/<p\b[^>]*\bclass=["'][^"']*\b(?:author|source|cite)\b[^"']*["'][^>]*>[\s\S]*?<\/p>/gi,
					''
				);

			const pMatches = [...bodyWithoutFooter.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)];
			const quoteLines: string[] = [];
			if (pMatches.length > 0) {
				for (const p of pMatches) {
					const text = processLineContent(p[1]);
					if (text) quoteLines.push(`${prefix} ${text}`);
				}
			} else {
				const text = processLineContent(bodyWithoutFooter);
				if (text) quoteLines.push(`${prefix} ${text}`);
			}

			if (author) {
				quoteLines.push(`> ${author}`);
			}

			return `\n\n${quoteLines.join('\n')}\n\n`;
		}
	);

	// Plain <blockquote> without class
	content = content.replace(
		/<blockquote\b([^>]*)>([\s\S]*?)<\/blockquote>/gi,
		(_m, attrs, inner) => {
			const isLeft = isLeftAligned(attrs);
			const isRight = isRightAligned(attrs);
			const prefix = isLeft ? '~t' : isRight ? '~p' : '~';

			let author = '';
			const footerMatch = /<footer\b[^>]*>([\s\S]*?)<\/footer>/i.exec(inner);
			if (footerMatch) {
				author = processLineContent(footerMatch[1]);
			} else {
				const citeMatch = /<cite\b[^>]*>([\s\S]*?)<\/cite>/i.exec(inner);
				if (citeMatch) {
					author = processLineContent(citeMatch[1]);
				}
			}

			const bodyWithoutFooter = inner
				.replace(/<footer\b[^>]*>[\s\S]*?<\/footer>/gi, '')
				.replace(/<cite\b[^>]*>[\s\S]*?<\/cite>/gi, '');

			const pMatches = [...bodyWithoutFooter.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)];
			const quoteLines: string[] = [];
			if (pMatches.length > 0) {
				for (const p of pMatches) {
					const text = processLineContent(p[1]);
					if (text) quoteLines.push(`${prefix} ${text}`);
				}
			} else {
				const text = processLineContent(bodyWithoutFooter);
				if (text) quoteLines.push(`${prefix} ${text}`);
			}

			if (author) {
				quoteLines.push(`> ${author}`);
			}

			return `\n\n${quoteLines.join('\n')}\n\n`;
		}
	);

	// 7. Handle Headings: <h1> and <h2> in general EPUB
	content = content.replace(/<h1\b([^>]*)>([\s\S]*?)<\/h1>/gi, (_m, attrs, inner) => {
		const isLeft = isLeftAligned(attrs);
		const isRight = isRightAligned(attrs);
		const prefix = isLeft ? '@@t' : isRight ? '@@p' : '@@';
		const title = processLineContent(inner);
		return `\n\n${prefix} ${title}\n\n`;
	});

	content = content.replace(/<h2\b([^>]*)>([\s\S]*?)<\/h2>/gi, (_m, attrs, inner) => {
		const notoc = isNoToc(attrs);
		const isLeft = isLeftAligned(attrs);
		const isRight = isRightAligned(attrs);

		const prefix = notoc
			? isLeft
				? '@!t'
				: isRight
					? '@!p'
					: '@!'
			: isLeft
				? '@t'
				: isRight
					? '@p'
					: '@';

		const title = processLineContent(inner);
		return `\n\n${prefix} ${title}\n\n`;
	});

	// Generic h3..h6 in general EPUB
	content = content.replace(/<h[3-6]\b[^>]*>([\s\S]*?)<\/h[3-6]>/gi, (_m, inner) => {
		const title = processLineContent(inner);
		return `\n\n@ ${title}\n\n`;
	});

	// 8. Handle Scene breaks (both explicitly classed and general EPUB patterns)
	// Specific class patterns
	content = content.replace(
		/<p\b[^>]*\bclass=["'][^"']*\bscene-break-big\b[^"']*["'][^>]*>[\s\S]*?<\/p>/gi,
		'\n\n###\n\n'
	);
	content = content.replace(
		/<p\b[^>]*\bclass=["'][^"']*\bscene-break-small\b[^"']*["'][^>]*>([\s\S]*?)<\/p>/gi,
		(_m, inner) => {
			const trimmed = inner.replace(/<[^>]+>/g, '').trim();
			return trimmed === '*' ? '\n\n##\n\n' : '\n\n#\n\n';
		}
	);
	content = content.replace(
		/<hr\b[^>]*\bclass=["'][^"']*\b(?:scene-break-small|small)\b[^"']*["'][^>]*\/?>/gi,
		'\n\n##\n\n'
	);
	content = content.replace(/<hr\b[^>]*\/?>/gi, '\n\n###\n\n');

	// General break elements by class: separator, divider, asterism, scene-break, break
	content = content.replace(
		/<(?:p|div)\b[^>]*\bclass=["'][^"']*\b(?:separator|divider|asterism|scene-break|scene_break|break|ornament|stars)\b[^"']*["'][^>]*>([\s\S]*?)<\/(?:p|div)>/gi,
		(_m, inner) => {
			const clean = inner.replace(/<[^>]+>/g, '').trim();
			if (BIG_BREAK_PATTERN.test(clean)) return '\n\n###\n\n';
			if (SMALL_BREAK_PATTERN.test(clean)) return '\n\n##\n\n';
			return '\n\n#\n\n';
		}
	);

	// 9. Handle Paragraphs with Dropcap / No-Dropcap or plain separator text
	content = content.replace(/<p\b([^>]*)>([\s\S]*?)<\/p>/gi, (_m, attrs, inner) => {
		const isNoDropcap = /\bno-dropcap\b/i.test(attrs);
		if (isNoDropcap) {
			const text = processLineContent(inner);
			return `\n\n!D ${text}\n\n`;
		}

		// Check if the paragraph text itself is a scene break in general EPUB
		const rawStripped = inner.replace(/<[^>]+>/g, '').trim();
		if (BIG_BREAK_PATTERN.test(rawStripped)) {
			return '\n\n###\n\n';
		}
		if (SMALL_BREAK_PATTERN.test(rawStripped)) {
			return '\n\n##\n\n';
		}

		// Keep dropcap letter seamlessly integrated in text flow
		const text = processLineContent(inner);
		return `\n\n${text}\n\n`;
	});

	// Replace break tags with newline
	content = content.replace(/<br\s*\/?>/gi, '\n');

	// Replace other block elements
	content = content.replace(/<\/(?:div|section|article|li|tr|header|footer)>/gi, '\n\n');
	content = content.replace(/<(?:div|section|article|li|tr|header|footer)\b[^>]*>/gi, '\n');

	// Inline tags cleanup
	content = convertInlineHtmlToTxt(content);

	// Strip any remaining unknown tags
	content = content.replace(/<[^>]+>/g, ' ');

	return cleanTextFormatting(content);
}

/**
 * Extracts and formats footnotes from <aside> tags in EPUB files.
 */
function extractFootnotesFromHtml(html: string): Map<number, string> {
	const footnotes = new Map<number, string>();
	const asideMatches = html.matchAll(
		/<aside\b[^>]*\bid=["'](?:fn|footnote-?)(\d+)["'][^>]*>([\s\S]*?)<\/aside>/gi
	);

	for (const match of asideMatches) {
		const num = parseInt(match[1], 10);
		let inner = match[2];
		// Remove <a class="notenum"...>1.</a>
		inner = inner.replace(
			/<a\b[^>]*\bclass=["'][^"']*\bnotenum\b[^"']*["'][^>]*>[\s\S]*?<\/a>/gi,
			''
		);
		const text = processLineContent(inner);
		if (text) {
			footnotes.set(num, text);
		}
	}

	return footnotes;
}

/**
 * Extracts and converts an EPUB file into structured, cleanly formatted plain text (.txt)
 * reversing EPUB XHTML formatting back into exact TXT conventions.
 */
export async function extractEpubToTxt(
	epubFileOrZip: File | Blob | JSZip,
	options?: {
		onProgress?: (status: string, percent: number) => void;
	}
): Promise<EpubToTxtResult> {
	options?.onProgress?.('Đang đọc cấu trúc EPUB...', 10);

	let zip: JSZip;
	let originalName = 'sach';

	if (epubFileOrZip instanceof JSZip) {
		zip = epubFileOrZip;
	} else {
		if ('name' in epubFileOrZip && typeof epubFileOrZip.name === 'string') {
			originalName = epubFileOrZip.name.replace(/\.epub$/i, '');
		}
		const arrayBuffer = await (epubFileOrZip as Blob).arrayBuffer();
		zip = await JSZip.loadAsync(arrayBuffer);
	}

	options?.onProgress?.('Đang phân tích OPF và mục lục...', 25);

	const opfPath = await findOpfPath(zip);
	if (!opfPath) {
		throw new Error('Không tìm thấy tệp content.opf trong EPUB.');
	}

	const opfFile = zip.file(opfPath);
	if (!opfFile) {
		throw new Error(`Không thể mở tệp OPF tại đường dẫn: ${opfPath}`);
	}

	const opfXml = await opfFile.async('text');
	const metadata = extractBookMetadata(opfXml);

	const bookTitle = metadata.title || originalName;
	const bookAuthor = metadata.author || '';

	// Parse manifest and spine to extract document items in correct reading order
	const manifest = new Map<string, { href: string; mediaType: string; properties?: string }>();
	const manifestMatches = opfXml.matchAll(/<item\b[^>]*>/gi);
	for (const match of manifestMatches) {
		const tag = match[0];
		const idMatch = /\bid=["']([^"']+)["']/i.exec(tag);
		const hrefMatch = /\bhref=["']([^"']+)["']/i.exec(tag);
		const mediaTypeMatch = /\bmedia-type=["']([^"']+)["']/i.exec(tag);
		const propertiesMatch = /\bproperties=["']([^"']+)["']/i.exec(tag);
		if (idMatch && hrefMatch) {
			manifest.set(idMatch[1], {
				href: decodeURIComponent(hrefMatch[1]),
				mediaType: mediaTypeMatch ? mediaTypeMatch[1] : '',
				properties: propertiesMatch ? propertiesMatch[1] : ''
			});
		}
	}

	const spineItemrefs: string[] = [];
	const itemrefMatches = opfXml.matchAll(/<itemref\b[^>]*idref=["']([^"']+)["'][^>]*>/gi);
	for (const match of itemrefMatches) {
		spineItemrefs.push(match[1]);
	}

	const opfDir = opfPath.includes('/') ? opfPath.substring(0, opfPath.lastIndexOf('/')) : '';

	// Ordered document paths in reading order
	const chapterPaths: string[] = [];
	for (const idref of spineItemrefs) {
		const item = manifest.get(idref);
		if (item && item.href) {
			// Skip generated nav.xhtml TOC file from spine reading list
			if (item.properties?.includes('nav') || item.href.endsWith('nav.xhtml')) {
				continue;
			}
			const fullPath = resolveRelativePath(opfDir, item.href);
			if (zip.file(fullPath) && !chapterPaths.includes(fullPath)) {
				chapterPaths.push(fullPath);
			}
		}
	}

	// Fallback if spine empty: find all xhtml / html files
	if (chapterPaths.length === 0) {
		for (const p of Object.keys(zip.files)) {
			if (/\.(xhtml|html|htm)$/i.test(p) && !zip.files[p].dir && !p.endsWith('nav.xhtml')) {
				chapterPaths.push(p);
			}
		}
		chapterPaths.sort((a, b) =>
			a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
		);
	}

	options?.onProgress?.(`Đang trích xuất nội dung từ ${chapterPaths.length} chương...`, 40);

	const extractedChapters: string[] = [];
	const allFootnotes = new Map<number, string>();
	const total = chapterPaths.length;

	for (let i = 0; i < total; i++) {
		const path = chapterPaths[i];
		const file = zip.file(path);
		if (file) {
			const htmlText = await file.async('text');

			// Skip cover image page
			if (/<div\b[^>]*\bclass=["'][^"']*\bcover-wrapper\b[^"']*["']/i.test(htmlText)) {
				continue;
			}

			// Skip nav table of contents page
			if (/<nav\b[^>]*\bepub:type=["']toc["']/i.test(htmlText)) {
				continue;
			}

			// Collect footnotes from <aside> tags
			const fileFootnotes = extractFootnotesFromHtml(htmlText);
			for (const [k, v] of fileFootnotes.entries()) {
				allFootnotes.set(k, v);
			}

			// Is this the dedicated notes.xhtml file?
			const isNotesFile =
				path.endsWith('notes.xhtml') ||
				(/<title>[^<]*chú thích[^<]*<\/title>/i.test(htmlText) && fileFootnotes.size > 0);

			if (isNotesFile) {
				// Don't render notes body directly into chapter list, will append at end
				continue;
			}

			// Strip <aside> blocks from body so they don't duplicate
			const bodyWithoutAside = htmlText.replace(/<aside\b[^>]*>[\s\S]*?<\/aside>/gi, '');

			const cleanText = htmlToCleanText(bodyWithoutAside);
			if (cleanText.trim().length > 0) {
				const trimmed = cleanText.trim();
				// If a chapter does not contain <h1> and is not center-page, and total chapters > 1,
				// wrap with [new] ... [/new] to preserve independent chapter separation
				const hasH1 = /<h1\b/i.test(bodyWithoutAside);
				const hasCenterPage = /<section\b[^>]*\bclass=["'][^"']*\bcenter-page\b/i.test(
					bodyWithoutAside
				);
				const isJacket = /<div\b[^>]*\bclass=["'][^"']*\bjacket-container\b/i.test(
					bodyWithoutAside
				);

				if (!hasH1 && !hasCenterPage && !isJacket && total > 1 && !trimmed.startsWith('[new]')) {
					extractedChapters.push(`[new]\n${trimmed}\n[/new]`);
				} else {
					extractedChapters.push(trimmed);
				}
			}
		}
		const percent = Math.min(90, Math.round(40 + ((i + 1) / total) * 50));
		options?.onProgress?.(`Đang xử lý chương ${i + 1}/${total}...`, percent);
	}

	// If footnotes exist, append the Chú thích: section at the end
	if (allFootnotes.size > 0) {
		const sortedKeys = [...allFootnotes.keys()].sort((a, b) => a - b);
		const noteLines: string[] = ['Chú thích:'];
		for (const k of sortedKeys) {
			noteLines.push(`{${k}} ${allFootnotes.get(k)}`);
		}
		extractedChapters.push(noteLines.join('\n'));
	}

	// Join all chapters with exactly 1 blank line (double newline)
	const combinedText = extractedChapters.join('\n\n');
	const finalText = cleanTextFormatting(combinedText);

	const charCount = finalText.length;
	const wordCount = finalText ? finalText.split(/\s+/).filter(Boolean).length : 0;

	const baseFileName =
		(metadata.title || originalName)
			.toLowerCase()
			.normalize('NFD')
			.replace(/[\u0300-\u036f]/g, '')
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-+|-+$/g, '') || 'ebook';

	const outFileName = `${baseFileName}.txt`;
	const txtBlob = new Blob([finalText], { type: 'text/plain;charset=utf-8' });

	options?.onProgress?.('Hoàn tất trích xuất!', 100);

	Logger.info(
		'[EpubToTxt]',
		`Extracted ${extractedChapters.length} chapters, ${wordCount} words, ${charCount} chars`
	);

	return {
		text: finalText,
		title: bookTitle,
		author: bookAuthor,
		chapterCount: extractedChapters.length,
		wordCount,
		charCount,
		fileName: outFileName,
		txtBlob
	};
}
