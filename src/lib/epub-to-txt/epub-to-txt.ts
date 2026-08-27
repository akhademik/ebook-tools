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
 * Converts XHTML/HTML content into clean plain text while maintaining structural paragraph breaks.
 */
export function htmlToCleanText(htmlContent: string): string {
	if (!htmlContent) return '';

	let content = htmlContent;

	// Strip head, script, style, svg, noscript
	content = content.replace(/<head\b[^>]*>[\s\S]*?<\/head>/gi, '');
	content = content.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '');
	content = content.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
	content = content.replace(/<svg\b[^>]*>[\s\S]*?<\/svg>/gi, '');
	content = content.replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript>/gi, '');

	// Replace break tags with newline
	content = content.replace(/<br\s*\/?>/gi, '\n');
	content = content.replace(/<hr\s*\/?>/gi, '\n\n---\n\n');

	// Replace block elements with double newlines
	content = content.replace(/<\/(p|div|section|article|blockquote|h[1-6]|li|tr|header|footer)>/gi, '\n\n');
	content = content.replace(/<(p|div|section|article|blockquote|h[1-6]|li|tr|header|footer)\b[^>]*>/gi, '\n');

	// Strip remaining HTML/XML tags
	content = content.replace(/<[^>]+>/g, ' ');

	// Decode entities
	content = decodeHtmlEntities(content);

	// Apply final strict space and empty-line cleaning
	return cleanTextFormatting(content);
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
	const manifest = new Map<string, { href: string; mediaType: string }>();
	const manifestMatches = opfXml.matchAll(/<item\b[^>]*>/gi);
	for (const match of manifestMatches) {
		const tag = match[0];
		const idMatch = /\bid=["']([^"']+)["']/i.exec(tag);
		const hrefMatch = /\bhref=["']([^"']+)["']/i.exec(tag);
		const mediaTypeMatch = /\bmedia-type=["']([^"']+)["']/i.exec(tag);
		if (idMatch && hrefMatch) {
			manifest.set(idMatch[1], {
				href: decodeURIComponent(hrefMatch[1]),
				mediaType: mediaTypeMatch ? mediaTypeMatch[1] : ''
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
			const fullPath = resolveRelativePath(opfDir, item.href);
			if (zip.file(fullPath) && !chapterPaths.includes(fullPath)) {
				chapterPaths.push(fullPath);
			}
		}
	}

	// Fallback if spine empty: find all xhtml / html files
	if (chapterPaths.length === 0) {
		for (const p of Object.keys(zip.files)) {
			if (/\.(xhtml|html|htm)$/i.test(p) && !zip.files[p].dir) {
				chapterPaths.push(p);
			}
		}
		chapterPaths.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
	}

	options?.onProgress?.(`Đang trích xuất nội dung từ ${chapterPaths.length} chương...`, 40);

	const extractedChapters: string[] = [];
	const total = chapterPaths.length;

	for (let i = 0; i < total; i++) {
		const path = chapterPaths[i];
		const file = zip.file(path);
		if (file) {
			const htmlText = await file.async('text');
			const cleanText = htmlToCleanText(htmlText);
			if (cleanText.trim().length > 0) {
				extractedChapters.push(cleanText.trim());
			}
		}
		const percent = Math.min(90, Math.round(40 + ((i + 1) / total) * 50));
		options?.onProgress?.(`Đang xử lý chương ${i + 1}/${total}...`, percent);
	}

	// Join all chapters with exactly 1 blank line (double newline)
	const combinedText = extractedChapters.join('\n\n');
	const finalText = cleanTextFormatting(combinedText);

	const charCount = finalText.length;
	const wordCount = finalText ? finalText.split(/\s+/).filter(Boolean).length : 0;

	const baseFileName = (metadata.title || originalName)
		.toLowerCase()
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '') || 'ebook';

	const outFileName = `${baseFileName}.txt`;
	const txtBlob = new Blob([finalText], { type: 'text/plain;charset=utf-8' });

	options?.onProgress?.('Hoàn tất trích xuất!', 100);

	Logger.info('[EpubToTxt]', `Extracted ${chapterPaths.length} chapters, ${wordCount} words, ${charCount} chars`);

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
