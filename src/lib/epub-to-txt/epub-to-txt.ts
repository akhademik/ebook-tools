// src/lib/epub-to-txt/epub-to-txt.ts
import JSZip from 'jszip';
import { findOpfPath, extractBookMetadata } from '$lib/epub-editor/epub-book-ops';
import { resolveRelativePath } from '$lib/epub-editor/epub-editor';
import {
	Logger,
	loadSafeEpubZip,
	validateZipArchiveSafety,
	createZipExtractionBudget,
	readSafeZipEntryText
} from '$lib/utils';
import {
	parseHtmlToDom,
	hasClass,
	hasAnyClass,
	getAttr,
	findElements,
	type DomElementNode,
	type DomNode
} from './html-dom';

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

const NAMED_ENTITIES: Record<string, string> = {
	'&nbsp;': ' ',
	'&ensp;': ' ',
	'&emsp;': ' ',
	'&thinsp;': ' ',
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
	'&sbquo;': '‚',
	'&bdquo;': '„',
	'&lsaquo;': '‹',
	'&rsaquo;': '›',
	'&ndash;': '–',
	'&mdash;': '—',
	'&hellip;': '…',
	'&bull;': '•',
	'&middot;': '·',
	'&sect;': '§',
	'&para;': '¶',
	'&deg;': '°',
	'&plusmn;': '±',
	'&times;': '×',
	'&divide;': '÷',
	'&minus;': '−',
	'&permil;': '‰',
	'&prime;': '′',
	'&Prime;': '″',
	'&frac12;': '½',
	'&frac14;': '¼',
	'&frac34;': '¾',
	'&larr;': '←',
	'&uarr;': '↑',
	'&rarr;': '→',
	'&darr;': '↓',
	'&harr;': '↔',
	'&infin;': '∞',
	'&asymp;': '≈',
	'&ne;': '≠',
	'&le;': '≤',
	'&ge;': '≥',
	'&cent;': '¢',
	'&pound;': '£',
	'&yen;': '¥',
	'&euro;': '€',
	'&copy;': '©',
	'&reg;': '®',
	'&trade;': '™',
	'&iexcl;': '¡',
	'&iquest;': '¿',
	'&sup1;': '¹',
	'&sup2;': '²',
	'&sup3;': '³',
	'&ordf;': 'ª',
	'&ordm;': 'º',
	'&aacute;': 'á',
	'&agrave;': 'à',
	'&atilde;': 'ã',
	'&acirc;': 'â',
	'&auml;': 'ä',
	'&aring;': 'å',
	'&aelig;': 'æ',
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
	'&oslash;': 'ø',
	'&oelig;': 'œ',
	'&uacute;': 'ú',
	'&ugrave;': 'ù',
	'&ucirc;': 'û',
	'&uuml;': 'ü',
	'&yacute;': 'ý',
	'&yuml;': 'ÿ',
	'&ccedil;': 'ç',
	'&ntilde;': 'ñ',
	'&eth;': 'ð',
	'&thorn;': 'þ',
	'&szlig;': 'ß'
};

function safeFromCodePoint(cp: number): string {
	if (!Number.isInteger(cp) || cp < 0 || cp > 0x10ffff || (cp >= 0xd800 && cp <= 0xdfff)) {
		return '';
	}
	try {
		return String.fromCodePoint(cp);
	} catch {
		return '';
	}
}

/**
 * Decode HTML/XML named and numerical entities.
 */
export function decodeHtmlEntities(text: string): string {
	if (!text) return '';

	// 1. Decode decimal numeric entities &#123;
	let decoded = text.replace(/&#(\d+);/g, (_, dec) => safeFromCodePoint(parseInt(dec, 10)));

	// 2. Decode hex numeric entities &#x1F600;
	decoded = decoded.replace(/&#x([0-9a-f]+);/gi, (_, hex) => safeFromCodePoint(parseInt(hex, 16)));

	// 3. Decode named entities (preserving initial uppercase letter casing where applicable)
	decoded = decoded.replace(/&[a-zA-Z0-9]+;/g, (match) => {
		const lower = match.toLowerCase();
		const mapped = NAMED_ENTITIES[lower];
		if (!mapped) return match;
		if (match === '&szlig;') return mapped;
		return match[1] === match[1].toUpperCase() && match[1] !== match[1].toLowerCase()
			? mapped.toUpperCase()
			: mapped;
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

interface InlineStyleState {
	bold: boolean;
	italic: boolean;
	underline: boolean;
	preserveNewlines: boolean;
}

interface InlineRenderContext {
	docPath: string;
	footnotes: FootnoteRegistry;
}

interface ExtractedFootnoteAside {
	sourcePath: string;
	key: string;
	asideId: string;
	rawNum: number | null;
	text: string;
}

interface UnmatchedNoteref {
	sourcePath: string;
	key: string;
	fragmentId: string;
	rawNum: number | null;
	assignedNum: number;
}

function resolveNoterefTargetKey(
	sourcePath: string,
	href: string,
	rawNum: number | null
): { key: string; fragmentId: string } {
	const hashIdx = href.indexOf('#');
	if (hashIdx !== -1) {
		const fragmentId = href.slice(hashIdx + 1).trim();
		const docPart = href.slice(0, hashIdx).trim();
		let cleanDocPart = docPart;
		try {
			cleanDocPart = decodeURIComponent(docPart);
		} catch {
			// Keep raw href path segment
		}
		const targetPath = cleanDocPart
			? resolveRelativePath(sourcePath || 'index.xhtml', cleanDocPart)
			: sourcePath;
		if (fragmentId) {
			return { key: `${targetPath}#${fragmentId}`, fragmentId };
		}
	}
	return {
		key: `inline:${sourcePath}#${rawNum ?? ''}`,
		fragmentId: ''
	};
}

class FootnoteRegistry {
	private refKeyToNum = new Map<string, number>();
	private usedNumbers = new Set<number>();
	private maxAssignedNum = 0;
	private refsByKey = new Map<string, UnmatchedNoteref>();
	private extractedAsides: ExtractedFootnoteAside[] = [];

	allocateNumber(preferredNum: number | null): number {
		let assigned: number;
		if (preferredNum !== null && preferredNum > 0 && !this.usedNumbers.has(preferredNum)) {
			assigned = preferredNum;
		} else {
			assigned = this.maxAssignedNum + 1;
			while (this.usedNumbers.has(assigned)) {
				assigned++;
			}
		}
		this.usedNumbers.add(assigned);
		if (assigned > this.maxAssignedNum) {
			this.maxAssignedNum = assigned;
		}
		return assigned;
	}

	resolveNoteref(sourcePath: string, href: string, rawNum: number | null): string | null {
		if (!href && rawNum === null) return null;
		const { key, fragmentId } = resolveNoterefTargetKey(sourcePath, href, rawNum);
		const existing = this.refKeyToNum.get(key);
		if (existing !== undefined) {
			return String(existing);
		}
		const assigned = this.allocateNumber(rawNum);
		this.refKeyToNum.set(key, assigned);
		this.refsByKey.set(key, {
			sourcePath,
			key,
			fragmentId,
			rawNum,
			assignedNum: assigned
		});
		return String(assigned);
	}

	addExtractedAside(aside: ExtractedFootnoteAside): void {
		this.extractedAsides.push(aside);
	}

	finalizeFootnotes(): Map<number, string> {
		const result = new Map<number, string>();
		const remainingAsides: ExtractedFootnoteAside[] = [];
		const unmatchedRefs = new Map(this.refsByKey);

		// Pass 1: Exact resolved docPath#id match
		for (const aside of this.extractedAsides) {
			const assignedNum = aside.key ? this.refKeyToNum.get(aside.key) : undefined;
			if (assignedNum !== undefined) {
				result.set(assignedNum, aside.text);
				unmatchedRefs.delete(aside.key);
			} else {
				remainingAsides.push(aside);
			}
		}

		// Pass 2: Cross-file fragmentId match (when href omitted filename) or same-chapter rawNum fallback
		const stillUnmatchedAsides: ExtractedFootnoteAside[] = [];
		for (const aside of remainingAsides) {
			let matchedKey: string | null = null;
			if (aside.asideId) {
				const matchingRefs = [...unmatchedRefs.values()].filter(
					(r) => r.fragmentId === aside.asideId
				);
				const sameIdAsidesCount = remainingAsides.filter((a) => a.asideId === aside.asideId).length;
				if (matchingRefs.length === 1 && sameIdAsidesCount === 1) {
					matchedKey = matchingRefs[0].key;
				}
			}
			if (!matchedKey && aside.rawNum !== null) {
				const sameDocRef = [...unmatchedRefs.values()].find(
					(r) => r.sourcePath === aside.sourcePath && r.rawNum === aside.rawNum
				);
				if (sameDocRef) {
					matchedKey = sameDocRef.key;
				}
			}

			if (matchedKey) {
				const ref = unmatchedRefs.get(matchedKey);
				if (ref) {
					result.set(ref.assignedNum, aside.text);
					unmatchedRefs.delete(matchedKey);
				}
			} else {
				stillUnmatchedAsides.push(aside);
			}
		}

		// Pass 3: Preserve any unreferenced footnote <aside> elements at the end
		for (const aside of stillUnmatchedAsides) {
			const assignedNum = this.allocateNumber(aside.rawNum);
			result.set(assignedNum, aside.text);
		}

		return result;
	}
}

const DEFAULT_INLINE_STYLE: InlineStyleState = {
	bold: false,
	italic: false,
	underline: false,
	preserveNewlines: false
};

function getPlainDomText(node: DomNode): string {
	if (node.type === 'text') {
		return decodeHtmlEntities(node.text);
	}
	if (node.tag === 'br') return '\n';
	if (node.tag === 'script' || node.tag === 'style' || node.tag === 'noscript') return '';
	let out = '';
	for (const child of node.children) {
		out += getPlainDomText(child);
	}
	return out;
}

function getElementInlineFlags(el: DomElementNode): {
	isBold: boolean;
	isItalic: boolean;
	isUnderline: boolean;
} {
	const style = getAttr(el, 'style') || '';
	const isBold =
		el.tag === 'b' ||
		el.tag === 'strong' ||
		(el.tag === 'span' &&
			(/font-weight\s*:\s*(?:bold|[6-9]00)/i.test(style) || hasAnyClass(el, ['bold', 'fw-bold'])));

	const isItalic =
		el.tag === 'i' ||
		el.tag === 'em' ||
		(el.tag === 'span' &&
			(/font-style\s*:\s*italic/i.test(style) || hasAnyClass(el, ['italic', 'fst-italic'])));

	const isUnderline =
		el.tag === 'u' ||
		el.tag === 'ins' ||
		(el.tag === 'span' &&
			(/text-decoration(?:-line)?\s*:\s*underline/i.test(style) || hasClass(el, 'underline')));

	return { isBold, isItalic, isUnderline };
}

function wrapInlineMarker(rendered: string, marker: '*' | '/' | '_'): string {
	if (!rendered) return '';
	if (!rendered.trim()) {
		// Preserve whitespace instead of deleting spaces inside e.g. `<b> </b>`
		return rendered.includes('\n') ? rendered : ' ';
	}
	const leadMatch = /^(\s*)/.exec(rendered);
	const trailMatch = /(\s*)$/.exec(rendered);
	const lead = leadMatch ? leadMatch[1] : '';
	const trail = trailMatch ? trailMatch[1] : '';
	const core = rendered.slice(lead.length, rendered.length - trail.length);
	return `${lead}${marker}${core}${marker}${trail}`;
}

function extractIllustrationTagFromElement(el: DomElementNode): string | null {
	const imgEl = el.tag === 'img' ? el : findElements(el, (c) => c.tag === 'img')[0];
	if (imgEl) {
		const src = getAttr(imgEl, 'src');
		const alt = getAttr(imgEl, 'alt');

		if (src) {
			const cleanSrc = src.split('?')[0].split('#')[0];
			const fileName = cleanSrc.split('/').pop() || '';
			const baseName = fileName.replace(/\.(jpg|jpeg|png|webp|gif|svg)$/i, '');
			if (baseName && !['cover'].includes(baseName.toLowerCase())) {
				return `[${baseName}]`;
			}
		}

		if (alt) {
			const cleanAlt = decodeHtmlEntities(alt)
				.trim()
				.replace(/^\[+|\]+$/g, '')
				.trim();
			if (cleanAlt) {
				return `[${cleanAlt}]`;
			}
		}
		return null;
	}

	// Support <svg><image xlink:href="..."/></svg>
	const svgImg = el.tag === 'image' ? el : findElements(el, (c) => c.tag === 'image')[0];
	if (svgImg) {
		const href = getAttr(svgImg, 'xlink:href') || getAttr(svgImg, 'href');
		if (href) {
			const cleanSrc = href.split('?')[0].split('#')[0];
			const fileName = cleanSrc.split('/').pop() || '';
			const baseName = fileName.replace(/\.(jpg|jpeg|png|webp|gif|svg)$/i, '');
			if (baseName && !['cover'].includes(baseName.toLowerCase())) {
				return `[${baseName}]`;
			}
		}
	}

	return null;
}

interface ParsedNoteref {
	rawNum: number | null;
	href: string;
}

function parseNoterefElement(el: DomElementNode): ParsedNoteref | null {
	if (el.tag === 'sup' && hasClass(el, 'noteref')) {
		const innerAnchor = findElements(el, (c) => c.tag === 'a' && Boolean(getAttr(c, 'href')))[0];
		if (innerAnchor) {
			return parseNoterefElement(innerAnchor);
		}
		const plain = getPlainDomText(el).trim();
		const m = /^[[(]?(\d+)[\])]?$/.exec(plain);
		return m ? { rawNum: parseInt(m[1], 10), href: '' } : null;
	}

	if (el.tag !== 'a') return null;

	const href = getAttr(el, 'href') || '';
	const id = getAttr(el, 'id') || '';
	const epubType = (getAttr(el, 'epub:type') || '').toLowerCase().split(/\s+/);
	const role = (getAttr(el, 'role') || '').toLowerCase();

	const hrefMatch = /#(?:fn|footnote|endnote|note)(?:[-_]\d+)*[-_]?(\d+)$/i.exec(href);
	const idMatch = /^fnref(?:[-_]\d+)*[-_]?(\d+)$/i.exec(id);
	const isNoterefAttr =
		hasClass(el, 'noteref') ||
		epubType.includes('noteref') ||
		role === 'doc-noteref' ||
		Boolean(hrefMatch) ||
		Boolean(idMatch);

	if (!isNoterefAttr) return null;

	const plain = getPlainDomText(el).trim();
	const numInText = /^[[(]?(\d+)[\])]?$/.exec(plain);
	if (numInText) {
		return { rawNum: parseInt(numInText[1], 10), href };
	}
	if (hrefMatch) {
		return { rawNum: parseInt(hrefMatch[1], 10), href };
	}
	if (idMatch) {
		return { rawNum: parseInt(idMatch[1], 10), href };
	}
	if (href.includes('#')) {
		return { rawNum: null, href };
	}
	return null;
}

function resolveNoterefDisplayNumber(el: DomElementNode, ctx?: InlineRenderContext): string | null {
	const parsed = parseNoterefElement(el);
	if (!parsed) return null;

	if (ctx) {
		return ctx.footnotes.resolveNoteref(ctx.docPath, parsed.href, parsed.rawNum);
	}
	return parsed.rawNum !== null ? String(parsed.rawNum) : null;
}

function renderInlineDomNodes(
	nodes: DomNode[],
	state: InlineStyleState,
	ctx?: InlineRenderContext
): string {
	let out = '';

	for (const node of nodes) {
		if (node.type === 'text') {
			const decoded = decodeHtmlEntities(node.text);
			if (state.preserveNewlines) {
				out += decoded.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
			} else {
				// Collapse HTML source whitespace runs (including source line breaks) to a single space
				// without deleting spacing between inline elements.
				out += decoded.replace(/[\t \r\n\u00A0\u1680\u2000-\u200A\u202F\u205F\u3000]+/g, ' ');
			}
			continue;
		}

		if (node.tag === 'script' || node.tag === 'style' || node.tag === 'noscript') {
			continue;
		}

		if (node.tag === 'br') {
			out += '\n';
			continue;
		}

		if (node.tag === 'img') {
			const tag = extractIllustrationTagFromElement(node);
			if (tag) {
				out += tag;
			}
			continue;
		}

		if (node.tag === 'svg') {
			const imgTag = extractIllustrationTagFromElement(node);
			if (imgTag) {
				out += imgTag;
			} else {
				const svgTextNodes = findElements(node, (c) => c.tag === 'text' || c.tag === 'tspan');
				if (svgTextNodes.length > 0) {
					out += svgTextNodes
						.map((t) => getPlainDomText(t).trim())
						.filter(Boolean)
						.join(' ');
				}
			}
			continue;
		}

		const noterefNum = resolveNoterefDisplayNumber(node, ctx);
		if (noterefNum !== null) {
			out += `{${noterefNum}}`;
			continue;
		}

		const { isBold, isItalic, isUnderline } = getElementInlineFlags(node);
		const nextState: InlineStyleState = {
			bold: state.bold || isBold,
			italic: state.italic || isItalic,
			underline: state.underline || isUnderline,
			preserveNewlines: state.preserveNewlines || node.tag === 'pre'
		};

		let inner = renderInlineDomNodes(node.children, nextState, ctx);

		if (isUnderline && !state.underline) {
			inner = wrapInlineMarker(inner, '_');
		}
		if (isItalic && !state.italic) {
			inner = wrapInlineMarker(inner, '/');
		}
		if (isBold && !state.bold) {
			inner = wrapInlineMarker(inner, '*');
		}

		out += inner;
	}

	return out;
}

/**
 * Converts inline HTML elements to txt-parser convention syntax using DOM traversal:
 * - `<b>` / `<strong>` -> `*bold*`
 * - `<i>` / `<em>` -> `/italic/`
 * - `<u>` / `<ins>` -> `_underline_`
 * - Footnote reference links -> `{n}`
 * - `<br>` -> `\n`
 * Preserves whitespace between inline elements and nested tag contents.
 */
export function convertInlineHtmlToTxt(html: string): string {
	if (!html) return '';
	const root = parseHtmlToDom(html);
	return renderInlineDomNodes(root.children, DEFAULT_INLINE_STYLE);
}

/**
 * Normalizes extracted inline lines, preserving intentional `\n` from `<br>`.
 */
function normalizeInlineLines(text: string, collapseSpaces = true): string {
	if (!text) return '';
	const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
	const cleaned = lines.map((line) =>
		collapseSpaces
			? line.replace(/[\t \u00A0\u1680\u2000-\u200A\u202F\u205F\u3000]+/g, ' ').trim()
			: line.replace(/\s+$/g, '')
	);
	return cleaned.join('\n').trim();
}

function renderInlineFromElement(
	el: DomElementNode,
	preserveNewlines = false,
	ctx?: InlineRenderContext
): string {
	const raw = renderInlineDomNodes(
		el.children,
		{
			...DEFAULT_INLINE_STYLE,
			preserveNewlines
		},
		ctx
	);
	return normalizeInlineLines(raw, !preserveNewlines);
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
 * Checks if attributes indicate center alignment.
 */
function isCenterAligned(attrs: string): boolean {
	return (
		/\bcenter\b/i.test(attrs) ||
		/text-align\s*:\s*center/i.test(attrs) ||
		/align=["']center["']/i.test(attrs)
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

const BREAK_CLASSES = [
	'separator',
	'divider',
	'asterism',
	'scene-break',
	'scene_break',
	'break',
	'ornament',
	'stars'
];

const BLOCK_LEVEL_TAGS = new Set([
	'address',
	'article',
	'aside',
	'blockquote',
	'dd',
	'details',
	'dialog',
	'div',
	'dl',
	'dt',
	'fieldset',
	'figcaption',
	'figure',
	'footer',
	'form',
	'h1',
	'h2',
	'h3',
	'h4',
	'h5',
	'h6',
	'header',
	'hgroup',
	'hr',
	'li',
	'main',
	'nav',
	'ol',
	'p',
	'pre',
	'section',
	'table',
	'tbody',
	'td',
	'tfoot',
	'th',
	'thead',
	'tr',
	'ul'
]);

function convertHeadingElementToTxt(
	attrs: string,
	el: DomElementNode,
	level: 1 | 2,
	ctx?: InlineRenderContext
): string {
	const notoc = isNoToc(attrs);
	const isLeft = isLeftAligned(attrs);
	const isRight = isRightAligned(attrs);

	const prefix =
		level === 1
			? notoc
				? isLeft
					? '@@!t'
					: isRight
						? '@@!p'
						: '@@!'
				: isLeft
					? '@@t'
					: isRight
						? '@@p'
						: '@@'
			: notoc
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

	// Keep multi-line heading (<br>) on the heading line with a single space
	const title = renderInlineFromElement(el, false, ctx).replace(/\n+/g, ' ').trim();
	return title ? `${prefix} ${title}` : '';
}

function isBlockquoteFooterElement(el: DomElementNode): boolean {
	return (
		el.tag === 'footer' ||
		el.tag === 'cite' ||
		(el.tag === 'p' && hasAnyClass(el, ['author', 'source', 'cite']))
	);
}

function getQuoteAuthorPrefix(el: DomElementNode): string {
	const attrs = el.rawAttrs;
	if (isLeftAligned(attrs)) return '>t';
	if (isRightAligned(attrs)) return '>p';
	if (isCenterAligned(attrs)) return '>c';
	return '>';
}

function convertBlockquoteDom(el: DomElementNode, ctx?: InlineRenderContext): string {
	const attrs = el.rawAttrs;
	const prefix = isLeftAligned(attrs) ? '~t' : isRightAligned(attrs) ? '~p' : '~';

	const quoteLines: string[] = [];
	const authors: { prefix: string; text: string }[] = [];

	const collectBlockquoteNodes = (nodes: DomNode[]) => {
		let inlineBuf: DomNode[] = [];
		const flushInline = () => {
			if (inlineBuf.length === 0) return;
			const text = normalizeInlineLines(renderInlineDomNodes(inlineBuf, DEFAULT_INLINE_STYLE, ctx));
			inlineBuf = [];
			if (text) {
				for (const line of text.split('\n')) {
					const t = line.trim();
					if (t) quoteLines.push(`${prefix} ${t}`);
				}
			}
		};

		for (const child of nodes) {
			if (child.type === 'text') {
				inlineBuf.push(child);
				continue;
			}
			if (child.tag === 'script' || child.tag === 'style' || child.tag === 'noscript') {
				continue;
			}

			if (isBlockquoteFooterElement(child)) {
				flushInline();
				const authorText = renderInlineFromElement(child, false, ctx).replace(/\n+/g, ' ').trim();
				if (authorText) {
					authors.push({ prefix: getQuoteAuthorPrefix(child), text: authorText });
				}
				continue;
			}

			if (child.tag === 'p') {
				flushInline();
				const pText = renderInlineFromElement(child, false, ctx);
				if (pText) {
					for (const line of pText.split('\n')) {
						const t = line.trim();
						if (t) quoteLines.push(`${prefix} ${t}`);
					}
				}
				continue;
			}

			if (BLOCK_LEVEL_TAGS.has(child.tag)) {
				flushInline();
				collectBlockquoteNodes(child.children);
			} else {
				inlineBuf.push(child);
			}
		}
		flushInline();
	};

	collectBlockquoteNodes(el.children);

	for (const author of authors) {
		quoteLines.push(`${author.prefix} ${author.text}`);
	}

	return quoteLines.join('\n');
}

function convertPoemDom(el: DomElementNode, ctx?: InlineRenderContext): string {
	const stanzas: string[] = [];

	const collectPoemLines = (nodes: DomNode[], outLines: string[]) => {
		let inlineBuf: DomNode[] = [];
		const flushInline = () => {
			if (inlineBuf.length === 0) return;
			const text = normalizeInlineLines(renderInlineDomNodes(inlineBuf, DEFAULT_INLINE_STYLE, ctx));
			inlineBuf = [];
			if (text) {
				for (const line of text.split('\n')) {
					const t = line.trim();
					if (t) outLines.push(t);
				}
			}
		};

		for (const child of nodes) {
			if (child.type === 'text') {
				inlineBuf.push(child);
				continue;
			}
			if (child.tag === 'script' || child.tag === 'style' || child.tag === 'noscript') {
				continue;
			}
			if (child.tag === 'p') {
				flushInline();
				const text = renderInlineFromElement(child, false, ctx);
				if (text) {
					for (const line of text.split('\n')) {
						const t = line.trim();
						if (t) outLines.push(t);
					}
				}
				continue;
			}
			if (child.tag === 'div' && hasClass(child, 'stanza')) {
				flushInline();
				const stanzaLines: string[] = [];
				collectPoemLines(child.children, stanzaLines);
				if (stanzaLines.length > 0) {
					if (outLines.length > 0) {
						stanzas.push(outLines.splice(0).join('\n'));
					}
					stanzas.push(stanzaLines.join('\n'));
				}
				continue;
			}
			if (BLOCK_LEVEL_TAGS.has(child.tag)) {
				flushInline();
				collectPoemLines(child.children, outLines);
			} else {
				inlineBuf.push(child);
			}
		}
		flushInline();
	};

	const rootLines: string[] = [];
	collectPoemLines(el.children, rootLines);
	if (rootLines.length > 0) {
		stanzas.push(rootLines.join('\n'));
	}

	const body = stanzas.filter(Boolean).join('\n\n');
	return body ? `[poem]\n${body}\n[/poem]` : '';
}

interface OutputSegment {
	kind: 'prose' | 'line' | 'block';
	text: string;
}

function joinSegments(segments: OutputSegment[]): string {
	if (segments.length === 0) return '';
	let out = segments[0].text;

	for (let i = 1; i < segments.length; i++) {
		const prev = segments[i - 1];
		const curr = segments[i];
		if (prev.kind === 'prose' && curr.kind === 'prose') {
			// Adjacent plain <p> paragraphs are separated by a single newline (\n)
			out += '\n' + curr.text;
		} else if (prev.kind === 'line' && curr.kind === 'line') {
			out += '\n' + curr.text;
		} else {
			out += '\n\n' + curr.text;
		}
	}

	return out;
}

function convertLetterDom(el: DomElementNode, ctx?: InlineRenderContext): string {
	const items: OutputSegment[] = [];

	const collectLetterNodes = (nodes: DomNode[]) => {
		let inlineBuf: DomNode[] = [];
		const flushInline = () => {
			if (inlineBuf.length === 0) return;
			const text = normalizeInlineLines(renderInlineDomNodes(inlineBuf, DEFAULT_INLINE_STYLE, ctx));
			inlineBuf = [];
			if (text) {
				items.push({ kind: 'line', text });
			}
		};

		for (const child of nodes) {
			if (child.type === 'text') {
				inlineBuf.push(child);
				continue;
			}
			if (child.tag === 'script' || child.tag === 'style' || child.tag === 'noscript') {
				continue;
			}
			if (child.tag === 'div' && hasClass(child, 'poem')) {
				flushInline();
				const poem = convertPoemDom(child, ctx);
				if (poem) items.push({ kind: 'block', text: poem });
				continue;
			}
			if (
				child.tag === 'blockquote' ||
				(child.tag === 'div' && hasAnyClass(child, ['blockquote', 'quote', 'epigraph']))
			) {
				flushInline();
				const bq = convertBlockquoteDom(child, ctx);
				if (bq) items.push({ kind: 'block', text: bq });
				continue;
			}
			if (child.tag === 'h1' || child.tag === 'h2') {
				flushInline();
				const h = convertHeadingElementToTxt(
					child.rawAttrs,
					child,
					child.tag === 'h1' ? 1 : 2,
					ctx
				);
				if (h) items.push({ kind: 'block', text: h });
				continue;
			}
			if (/^h[3-6]$/.test(child.tag)) {
				flushInline();
				const title = renderInlineFromElement(child, false, ctx).replace(/\n+/g, ' ').trim();
				if (title) items.push({ kind: 'block', text: `@ ${title}` });
				continue;
			}
			if (child.tag === 'figure') {
				flushInline();
				const fig = renderFigureDom(child, ctx);
				if (fig) items.push({ kind: 'block', text: fig });
				continue;
			}
			if (child.tag === 'p') {
				flushInline();
				const text = renderInlineFromElement(child, false, ctx);
				if (text) {
					if (hasClass(child, 'no-dropcap')) {
						items.push({ kind: 'line', text: `!D ${text}` });
					} else {
						items.push({ kind: 'line', text });
					}
				}
				continue;
			}
			if (child.tag === 'li') {
				flushInline();
				const liText = renderNodesToTxt(child.children, ctx);
				if (liText) items.push({ kind: 'line', text: liText });
				continue;
			}
			if (BLOCK_LEVEL_TAGS.has(child.tag)) {
				flushInline();
				collectLetterNodes(child.children);
				continue;
			}
			inlineBuf.push(child);
		}
		flushInline();
	};

	collectLetterNodes(el.children);
	const body = joinSegments(items);
	return body ? `[letter]\n${body}\n[/letter]` : '';
}

function renderFigureDom(el: DomElementNode, ctx?: InlineRenderContext): string {
	const parts: string[] = [];
	const tag = extractIllustrationTagFromElement(el);
	if (tag) parts.push(tag);

	const captions = findElements(el, (c) => c.tag === 'figcaption');
	for (const cap of captions) {
		const capText = renderNodesToTxt(cap.children, ctx);
		if (capText) parts.push(capText);
	}

	return parts.join('\n');
}

function hasAnyBlockChild(el: DomElementNode): boolean {
	for (const child of el.children) {
		if (child.type === 'element') {
			if (BLOCK_LEVEL_TAGS.has(child.tag) || hasAnyBlockChild(child)) {
				return true;
			}
		}
	}
	return false;
}

function renderTableRowDom(tr: DomElementNode, ctx?: InlineRenderContext): string {
	const cells: string[] = [];
	for (const child of tr.children) {
		if (child.type === 'element' && (child.tag === 'td' || child.tag === 'th')) {
			const cellText = renderNodesToTxt(child.children, ctx).replace(/\n+/g, ' ').trim();
			if (cellText) cells.push(cellText);
		}
	}
	return cells.join(' ');
}

function renderNodesToSegments(
	nodes: DomNode[],
	outSegments: OutputSegment[],
	ctx?: InlineRenderContext
): void {
	let inlineBuffer: DomNode[] = [];

	const flushInlineBuffer = () => {
		if (inlineBuffer.length === 0) return;
		const text = normalizeInlineLines(
			renderInlineDomNodes(inlineBuffer, DEFAULT_INLINE_STYLE, ctx)
		);
		inlineBuffer = [];
		if (text) {
			outSegments.push({ kind: 'prose', text });
		}
	};

	for (const node of nodes) {
		if (node.type === 'text') {
			inlineBuffer.push(node);
			continue;
		}

		const tag = node.tag;

		// 1. Skip structural non-content elements and ornaments
		if (tag === 'head' || tag === 'style' || tag === 'script' || tag === 'noscript') {
			continue;
		}
		if (tag === 'div' && hasAnyClass(node, ['chapter-ornament', 'subchapter-ornament'])) {
			continue;
		}

		// 2. [new:center] explicit section
		if (tag === 'section' && hasClass(node, 'center-page')) {
			flushInlineBuffer();
			const inner = renderNodesToTxt(node.children, ctx);
			if (inner) {
				outSegments.push({ kind: 'block', text: `[new:center]\n${inner}\n[/new]` });
			}
			continue;
		}

		// 3. [letter-box] container
		if (tag === 'div' && hasClass(node, 'letter-box')) {
			flushInlineBuffer();
			const inner = renderNodesToTxt(node.children, ctx);
			if (inner) {
				outSegments.push({ kind: 'block', text: `[letter-box]\n${inner}\n[/letter-box]` });
			}
			continue;
		}

		// 4. [poem] container
		if (tag === 'div' && hasClass(node, 'poem')) {
			flushInlineBuffer();
			const poem = convertPoemDom(node, ctx);
			if (poem) outSegments.push({ kind: 'block', text: poem });
			continue;
		}

		// 5. [letter] container
		if (tag === 'div' && hasClass(node, 'letter')) {
			flushInlineBuffer();
			const letter = convertLetterDom(node, ctx);
			if (letter) outSegments.push({ kind: 'block', text: letter });
			continue;
		}

		// 6. Figures & illustrations
		if (tag === 'figure') {
			flushInlineBuffer();
			const fig = renderFigureDom(node, ctx);
			if (fig) outSegments.push({ kind: 'block', text: fig });
			continue;
		}
		if (tag === 'p' && hasAnyClass(node, ['image', 'illust', 'figure'])) {
			flushInlineBuffer();
			const imgTag = extractIllustrationTagFromElement(node);
			const text = renderInlineFromElement(node, false, ctx);
			const combined = [imgTag, text].filter(Boolean).join('\n');
			if (combined) outSegments.push({ kind: 'block', text: combined });
			continue;
		}
		if (tag === 'img' && hasClass(node, 'illust-img')) {
			flushInlineBuffer();
			const imgTag = extractIllustrationTagFromElement(node);
			if (imgTag) outSegments.push({ kind: 'block', text: imgTag });
			continue;
		}

		// 7. Blockquotes & citations
		if (
			tag === 'blockquote' ||
			(tag === 'div' && hasAnyClass(node, ['blockquote', 'quote', 'epigraph']))
		) {
			flushInlineBuffer();
			const bq = convertBlockquoteDom(node, ctx);
			if (bq) outSegments.push({ kind: 'block', text: bq });
			continue;
		}

		// 8. Headings h1..h6
		if (tag === 'h1' || tag === 'h2') {
			flushInlineBuffer();
			const hText = convertHeadingElementToTxt(node.rawAttrs, node, tag === 'h1' ? 1 : 2, ctx);
			if (hText) outSegments.push({ kind: 'block', text: hText });
			continue;
		}
		if (/^h[3-6]$/.test(tag)) {
			flushInlineBuffer();
			const title = renderInlineFromElement(node, false, ctx).replace(/\n+/g, ' ').trim();
			if (title) outSegments.push({ kind: 'block', text: `@ ${title}` });
			continue;
		}

		// 9. Scene breaks (<hr> & break-classed elements)
		if (tag === 'hr') {
			flushInlineBuffer();
			outSegments.push({
				kind: 'block',
				text: hasAnyClass(node, ['scene-break-small', 'small']) ? '##' : '###'
			});
			continue;
		}
		if (tag === 'p' && hasClass(node, 'scene-break-big')) {
			flushInlineBuffer();
			outSegments.push({ kind: 'block', text: '###' });
			continue;
		}
		if (tag === 'p' && hasClass(node, 'scene-break-small')) {
			flushInlineBuffer();
			const plain = getPlainDomText(node).trim();
			outSegments.push({ kind: 'block', text: plain === '*' ? '##' : '#' });
			continue;
		}
		if (
			(tag === 'p' || tag === 'div') &&
			hasAnyClass(node, BREAK_CLASSES) &&
			!hasAnyBlockChild(node)
		) {
			flushInlineBuffer();
			const plain = getPlainDomText(node).trim();
			if (BIG_BREAK_PATTERN.test(plain)) {
				outSegments.push({ kind: 'block', text: '###' });
			} else if (SMALL_BREAK_PATTERN.test(plain)) {
				outSegments.push({ kind: 'block', text: '##' });
			} else if (plain === '') {
				outSegments.push({ kind: 'block', text: '#' });
			} else {
				// Has non-break text content inside a div/p marked with a break class — preserve it!
				outSegments.push({ kind: 'block', text: plain });
			}
			continue;
		}

		// 10. Paragraphs
		if (tag === 'p') {
			flushInlineBuffer();
			if (hasClass(node, 'no-dropcap')) {
				const text = renderInlineFromElement(node, false, ctx);
				if (text) outSegments.push({ kind: 'block', text: `!D ${text}` });
				continue;
			}

			const plain = getPlainDomText(node).trim();
			if (BIG_BREAK_PATTERN.test(plain)) {
				outSegments.push({ kind: 'block', text: '###' });
				continue;
			}
			if (SMALL_BREAK_PATTERN.test(plain)) {
				outSegments.push({ kind: 'block', text: '##' });
				continue;
			}

			const text = renderInlineFromElement(node, false, ctx);
			if (text) {
				outSegments.push({ kind: 'prose', text });
			}
			continue;
		}

		// 11. Preformatted text
		if (tag === 'pre') {
			flushInlineBuffer();
			const preText = renderInlineFromElement(node, true, ctx);
			if (preText) outSegments.push({ kind: 'block', text: preText });
			continue;
		}

		// 12. List items & Table rows
		if (tag === 'li') {
			flushInlineBuffer();
			if (hasAnyBlockChild(node)) {
				renderNodesToSegments(node.children, outSegments, ctx);
			} else {
				const liText = renderInlineFromElement(node, false, ctx);
				if (liText) outSegments.push({ kind: 'line', text: liText });
			}
			continue;
		}
		if (tag === 'tr') {
			flushInlineBuffer();
			const rowText = renderTableRowDom(node, ctx);
			if (rowText) outSegments.push({ kind: 'line', text: rowText });
			continue;
		}

		// 13. Other block containers (div, section, article, ul, ol, table, aside, etc.)
		if (BLOCK_LEVEL_TAGS.has(tag) || tag === 'html' || tag === 'body') {
			flushInlineBuffer();
			renderNodesToSegments(node.children, outSegments, ctx);
			continue;
		}

		// 14. Inline node (if not handled above)
		inlineBuffer.push(node);
	}

	flushInlineBuffer();
}

function renderNodesToTxt(nodes: DomNode[], ctx?: InlineRenderContext): string {
	const segments: OutputSegment[] = [];
	renderNodesToSegments(nodes, segments, ctx);
	return cleanTextFormatting(joinSegments(segments));
}

function hasCoverWrapperDom(root: DomElementNode): boolean {
	return findElements(root, (el) => el.tag === 'div' && hasClass(el, 'cover-wrapper')).length > 0;
}

/**
 * Reverse Engine: Converts an XHTML/HTML chapter document into clean TXT
 * by traversing its DOM structure in exact document order.
 */
export function htmlToCleanText(htmlContent: string): string {
	if (!htmlContent) return '';

	const root = parseHtmlToDom(htmlContent);
	if (hasCoverWrapperDom(root)) {
		return '';
	}

	return renderNodesToTxt(root.children);
}

const BACKLINK_ARROW_RE = /[↩↵↑⇧←]/u;
const BACKLINK_ONLY_RE = /^(?:[\s↩↵↑⇧^←[\]()]|\uFE0E|\uFE0F)+$/u;
const ALL_BACKLINK_ARROWS_RE = /[↩↵↑⇧←](?:\uFE0E|\uFE0F)?/gu;
const LEADING_ARROWS_RE = /^(?:[↩↵↑⇧←](?:\uFE0E|\uFE0F)?)+\s*/u;
const TRAILING_ARROWS_RE = /\s*(?:[↩↵↑⇧←](?:\uFE0E|\uFE0F)?)+$/u;

function parseFootnoteLabelElement(
	el: DomElementNode,
	expectedIdNum: number | null
): number | null {
	if (el.tag !== 'span' && el.tag !== 'sup') return null;
	const txt = getPlainDomText(el).trim();
	const m = /^(?:\[(\d+)\]|\((\d+)\)|(\d+)\.?)$/.exec(txt);
	if (!m) return null;
	const val = parseInt(m[1] ?? m[2] ?? m[3], 10);
	if (m[1] || m[2] || el.tag === 'sup' || val === expectedIdNum) {
		return val;
	}
	return null;
}

function isFootnoteBacklinkElement(el: DomElementNode): boolean {
	if (el.tag !== 'a') return false;

	if (
		hasAnyClass(el, [
			'notenum',
			'footnote-backref',
			'footnote-backlink',
			'backref',
			'backlink',
			'reversefootnote'
		])
	) {
		return true;
	}

	const role = (getAttr(el, 'role') || '').toLowerCase();
	const epubType = (getAttr(el, 'epub:type') || '').toLowerCase().split(/\s+/);
	if (role === 'doc-backlink' || epubType.includes('backlink')) {
		return true;
	}

	const plain = getPlainDomText(el).trim();
	const href = getAttr(el, 'href') || '';
	if (BACKLINK_ARROW_RE.test(plain) && BACKLINK_ONLY_RE.test(plain)) {
		return true;
	}
	if (/#(?:fnref|ref|back)/i.test(href) && BACKLINK_ONLY_RE.test(plain)) {
		return true;
	}

	return false;
}

function isFootnoteAside(el: DomElementNode): { isFootnote: boolean; rawNum: number | null } {
	if (el.tag !== 'aside') return { isFootnote: false, rawNum: null };

	const id = getAttr(el, 'id') || '';
	const epubType = (getAttr(el, 'epub:type') || '').toLowerCase().split(/\s+/);
	const role = (getAttr(el, 'role') || '').toLowerCase();

	const idNumMatch = /^(?:fn|footnote|endnote|note)(?:[-_]\d+)*[-_]?(\d+)$/i.exec(id);
	const hasFootnoteRole =
		epubType.includes('footnote') ||
		epubType.includes('endnote') ||
		epubType.includes('rearnote') ||
		role === 'doc-footnote' ||
		role === 'doc-endnote' ||
		hasAnyClass(el, ['footnote', 'footnote-item', 'footnotebody', 'endnote']) ||
		Boolean(idNumMatch);

	if (!hasFootnoteRole) {
		return { isFootnote: false, rawNum: null };
	}

	// 1. Check <a class="notenum"> if present
	const notenum = findElements(el, (c) => c.tag === 'a' && hasClass(c, 'notenum'))[0];
	if (notenum) {
		const numMatch = /(\d+)/.exec(getPlainDomText(notenum));
		if (numMatch) {
			return { isFootnote: true, rawNum: parseInt(numMatch[1], 10) };
		}
	}

	// 2. Check leading inline label such as <span>[1]</span>, <sup>1</sup>, or text [1] (ignoring backlinks)
	const idRawNum = idNumMatch ? parseInt(idNumMatch[1], 10) : null;
	for (const candidate of findElements(el, (c) => c.tag === 'span' || c.tag === 'sup')) {
		const parsed = parseFootnoteLabelElement(candidate, idRawNum);
		if (parsed !== null) {
			return { isFootnote: true, rawNum: parsed };
		}
	}

	// 3. Fall back to trailing numeric segment in id (e.g. fn-1-1 -> 1, fn12 -> 12)
	if (idRawNum !== null) {
		return { isFootnote: true, rawNum: idRawNum };
	}

	// 4. Last fallback: leading [n] or (n) or n. in plain text after ignoring backlink arrows
	const plainWithoutArrow = getPlainDomText(el).replace(ALL_BACKLINK_ARROWS_RE, '').trim();
	const leadingPlainMatch = /^(?:\[(\d+)\]|\((\d+)\)|(\d+)\.)\s+\S/.exec(plainWithoutArrow);
	if (leadingPlainMatch) {
		const val = parseInt(leadingPlainMatch[1] ?? leadingPlainMatch[2] ?? leadingPlainMatch[3], 10);
		return { isFootnote: true, rawNum: val };
	}

	return { isFootnote: true, rawNum: null };
}

function cloneDomCleanFootnote(node: DomNode, rawNum: number | null): DomNode | null {
	let strippedLeadingMarker = false;

	const cloneNode = (n: DomNode, atStartOfBlock: boolean): DomNode | null => {
		if (n.type === 'text') {
			return { ...n };
		}
		if (isFootnoteBacklinkElement(n)) {
			return null;
		}
		// Strip a single leading label span/sup such as <span>[1]</span> or <sup>1</sup>
		if (atStartOfBlock && !strippedLeadingMarker && parseFootnoteLabelElement(n, rawNum) !== null) {
			strippedLeadingMarker = true;
			return null;
		}

		const children: DomNode[] = [];
		let childAtStart = atStartOfBlock;
		for (const c of n.children) {
			const cloned = cloneNode(c, childAtStart);
			if (cloned) {
				children.push(cloned);
				if (cloned.type === 'element') {
					if (getPlainDomText(cloned).trim().length > 0) {
						childAtStart = false;
					}
				} else if (cloned.text.trim().length > 0) {
					childAtStart = false;
				}
			}
		}
		return { ...n, children };
	};

	return cloneNode(node, true);
}

function stripFootnoteTextAffixes(text: string, rawNum: number | null): string {
	let cleaned = text.replace(LEADING_ARROWS_RE, '').replace(TRAILING_ARROWS_RE, '').trim();

	// Strip leading [n] or (n) label
	const bracketMatch = /^(?:\[(\d+)\]|\((\d+)\))\s*/.exec(cleaned);
	if (bracketMatch) {
		const n = parseInt(bracketMatch[1] ?? bracketMatch[2], 10);
		if (rawNum === null || n === rawNum) {
			cleaned = cleaned.slice(bracketMatch[0].length).trim();
		}
	} else if (rawNum !== null) {
		const dotMatch = /^(\d+)\.\s+/.exec(cleaned);
		if (dotMatch && parseInt(dotMatch[1], 10) === rawNum) {
			cleaned = cleaned.slice(dotMatch[0].length).trim();
		}
	}

	return cleaned.replace(LEADING_ARROWS_RE, '').trim();
}

/**
 * Extracts footnotes from `<aside>` tags in DOM and removes ONLY those extracted
 * footnote `<aside>` elements from the DOM tree (leaving non-footnote `<aside>` intact).
 */
function extractAndStripFootnotesFromDom(
	root: DomElementNode,
	sourcePath: string,
	registry: FootnoteRegistry
): { extractedCount: number } {
	let extractedCount = 0;

	const walk = (parent: DomElementNode) => {
		const remaining: DomNode[] = [];
		for (const child of parent.children) {
			if (child.type === 'element' && child.tag === 'aside') {
				const fnInfo = isFootnoteAside(child);
				if (fnInfo.isFootnote) {
					const asideId = (getAttr(child, 'id') || '').trim();
					const cleanedAside = cloneDomCleanFootnote(child, fnInfo.rawNum) as DomElementNode;
					const rendered = renderNodesToTxt(cleanedAside.children).replace(/\n+/g, ' ').trim();
					const text = stripFootnoteTextAffixes(rendered, fnInfo.rawNum);

					if (text || fnInfo.rawNum !== null || asideId) {
						if (text) {
							registry.addExtractedAside({
								sourcePath,
								key: asideId ? `${sourcePath}#${asideId}` : '',
								asideId,
								rawNum: fnInfo.rawNum,
								text
							});
						}
						extractedCount++;
						continue;
					}
				}
			}
			if (child.type === 'element') {
				walk(child);
			}
			remaining.push(child);
		}
		parent.children = remaining;
	};

	walk(root);
	return { extractedCount };
}

function isTocNavDocument(root: DomElementNode): boolean {
	return (
		findElements(root, (el) => {
			if (el.tag !== 'nav') return false;
			const epubType = (getAttr(el, 'epub:type') || '').toLowerCase().split(/\s+/);
			const role = (getAttr(el, 'role') || '').toLowerCase();
			return epubType.includes('toc') || role === 'doc-toc';
		}).length > 0
	);
}

function getDocumentTitle(root: DomElementNode): string {
	const titleEl = findElements(root, (el) => el.tag === 'title')[0];
	return titleEl ? getPlainDomText(titleEl).trim() : '';
}

function parseOpfManifestAndSpine(opfXml: string): {
	manifest: Map<string, { href: string; mediaType: string; properties: string[] }>;
	spineIdrefs: string[];
} {
	const opfDom = parseHtmlToDom(opfXml);
	const manifest = new Map<string, { href: string; mediaType: string; properties: string[] }>();
	const spineIdrefs: string[] = [];

	const manifestEl = findElements(opfDom, (el) => el.tag === 'manifest')[0];
	const itemEls = findElements(manifestEl || opfDom, (el) => el.tag === 'item');
	for (const item of itemEls) {
		const id = getAttr(item, 'id');
		const rawHref = getAttr(item, 'href');
		if (!id || !rawHref) continue;

		let href = rawHref;
		try {
			href = decodeURIComponent(rawHref);
		} catch {
			// Preserve rawHref if malformed percent-encoding
		}

		const mediaType = (getAttr(item, 'media-type') || '').toLowerCase();
		const properties = (getAttr(item, 'properties') || '')
			.toLowerCase()
			.split(/\s+/)
			.filter(Boolean);

		manifest.set(id, { href, mediaType, properties });
	}

	const spineEl = findElements(opfDom, (el) => el.tag === 'spine')[0];
	const itemrefEls = findElements(spineEl || opfDom, (el) => el.tag === 'itemref');
	for (const ref of itemrefEls) {
		const idref = getAttr(ref, 'idref');
		if (idref) {
			spineIdrefs.push(idref);
		}
	}

	return { manifest, spineIdrefs };
}

function isReadableDocumentItem(href: string, mediaType: string): boolean {
	if (mediaType === 'application/xhtml+xml' || mediaType === 'text/html') {
		return true;
	}
	const cleanHref = href.split('?')[0].split('#')[0].toLowerCase();
	return cleanHref.endsWith('.xhtml') || cleanHref.endsWith('.html') || cleanHref.endsWith('.htm');
}

/**
 * Extracts and converts an EPUB file into structured, cleanly formatted plain text (.txt).
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
		validateZipArchiveSafety(epubFileOrZip);
		zip = epubFileOrZip;
	} else {
		if ('name' in epubFileOrZip && typeof epubFileOrZip.name === 'string') {
			originalName = epubFileOrZip.name.replace(/\.epub$/i, '');
		}
		zip = await loadSafeEpubZip(epubFileOrZip as Blob);
	}

	const zipBudget = createZipExtractionBudget();

	options?.onProgress?.('Đang phân tích OPF và mục lục...', 25);

	const opfPath = await findOpfPath(zip, { budget: zipBudget });
	if (!opfPath) {
		throw new Error('Không tìm thấy file content.opf trong EPUB.');
	}

	const opfXml = await readSafeZipEntryText(zip, opfPath, { budget: zipBudget });
	if (opfXml === null) {
		throw new Error(`Không thể mở file OPF tại đường dẫn: ${opfPath}`);
	}
	const metadata = extractBookMetadata(opfXml);

	const bookTitle = metadata.title || originalName;
	const bookAuthor = metadata.author || '';

	const { manifest, spineIdrefs } = parseOpfManifestAndSpine(opfXml);

	// Ordered document paths in reading order (resolving relative to full opfPath!)
	const chapterPaths: string[] = [];
	for (const idref of spineIdrefs) {
		const item = manifest.get(idref);
		if (!item || !item.href) continue;

		// Skip generated nav.xhtml TOC file from spine reading list
		const cleanHref = item.href.split('?')[0].split('#')[0].toLowerCase();
		if (
			item.properties.includes('nav') ||
			cleanHref === 'nav.xhtml' ||
			cleanHref.endsWith('/nav.xhtml')
		) {
			continue;
		}
		if (!isReadableDocumentItem(item.href, item.mediaType)) {
			continue;
		}

		const fullPath = resolveRelativePath(opfPath, item.href);
		if (zip.file(fullPath) && !chapterPaths.includes(fullPath)) {
			chapterPaths.push(fullPath);
		}
	}

	// Fallback if spine empty or yielded no existing HTML files
	if (chapterPaths.length === 0) {
		for (const p of Object.keys(zip.files)) {
			const lower = p.toLowerCase();
			if (
				/\.(xhtml|html|htm)$/i.test(p) &&
				!zip.files[p].dir &&
				lower !== 'nav.xhtml' &&
				!lower.endsWith('/nav.xhtml')
			) {
				chapterPaths.push(p);
			}
		}
		chapterPaths.sort((a, b) =>
			a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
		);
	}

	options?.onProgress?.(`Đang trích xuất nội dung từ ${chapterPaths.length} chương...`, 40);

	const extractedChapters: string[] = [];
	const footnoteRegistry = new FootnoteRegistry();
	const total = chapterPaths.length;

	for (let i = 0; i < total; i++) {
		const path = chapterPaths[i];
		const htmlText = await readSafeZipEntryText(zip, path, { budget: zipBudget });
		if (htmlText !== null) {
			const docRoot = parseHtmlToDom(htmlText);

			// Skip cover image page
			if (hasCoverWrapperDom(docRoot)) {
				continue;
			}

			// Skip nav table of contents page
			if (isTocNavDocument(docRoot)) {
				continue;
			}

			// Extract numbered footnotes and strip only those extracted <aside> elements
			const { extractedCount } = extractAndStripFootnotesFromDom(docRoot, path, footnoteRegistry);

			// Dedicated notes.xhtml file is rendered at the end via Chú thích:
			const docTitle = getDocumentTitle(docRoot);
			const isNotesFile =
				path.toLowerCase().endsWith('notes.xhtml') ||
				(/chú thích/i.test(docTitle) && extractedCount > 0);

			if (isNotesFile) {
				continue;
			}

			const cleanText = renderNodesToTxt(docRoot.children, {
				docPath: path,
				footnotes: footnoteRegistry
			});
			if (cleanText.trim().length > 0) {
				extractedChapters.push(cleanText.trim());
			}
		}
		const percent = Math.min(90, Math.round(40 + ((i + 1) / total) * 50));
		options?.onProgress?.(`Đang xử lý chương ${i + 1}/${total}...`, percent);
	}

	const allFootnotes = footnoteRegistry.finalizeFootnotes();

	// If footnotes exist, append the Chú thích: section at the end
	if (allFootnotes.size > 0) {
		const sortedKeys = [...allFootnotes.keys()].sort((a, b) => a - b);
		const noteLines: string[] = ['Chú thích:'];
		for (const k of sortedKeys) {
			noteLines.push(`{${k}} ${allFootnotes.get(k)}`);
		}
		extractedChapters.push(noteLines.join('\n'));
	}

	// Join all chapters with 1 blank line (double newline)
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
