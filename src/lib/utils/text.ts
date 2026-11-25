import { Logger } from './logger';

/**
 * Converts a string into a clean, URL-safe slug filename.
 * @param name - The raw file or title string.
 * @returns Cleaned slug name or 'untitled' if empty.
 */
export function slugify(name: unknown): string {
	Logger.debug('[text-utils]', 'slugify called with:', name);
	if (typeof name !== 'string') return 'untitled';
	const result =
		name
			.trim()
			.replace(/\.[^.]+$/, '')
			.replace(/\s+/g, '-') || 'untitled';
	Logger.debug('[text-utils]', 'slugify result:', result);
	return result;
}

/**
 * Ensures the given filename ends with a '.zip' extension.
 * @param name - The target filename string.
 * @returns Normalized filename ending in '.zip'.
 */
export function ensureZipExt(name: unknown): string {
	Logger.debug('[text-utils]', 'ensureZipExt called with:', name);
	if (typeof name !== 'string') return 'output.zip';
	const trimmed = name.trim();
	if (!trimmed) return 'output.zip';
	const result = /\.zip$/i.test(trimmed) ? trimmed : trimmed + '.zip';
	Logger.debug('[text-utils]', 'ensureZipExt result:', result);
	return result;
}

/**
 * Ensures the given filename ends with an '.epub' extension.
 * @param name - The target filename string.
 * @returns Normalized filename ending in '.epub'.
 */
export function ensureEpubExt(name: unknown): string {
	Logger.debug('[text-utils]', 'ensureEpubExt called with:', name);
	if (typeof name !== 'string') return 'output.epub';
	const trimmed = name.trim();
	if (!trimmed) return 'output.epub';
	const result = /\.epub$/i.test(trimmed) ? trimmed : trimmed + '.epub';
	Logger.debug('[text-utils]', 'ensureEpubExt result:', result);
	return result;
}

/**
 * Normalizes characters by stripping Vietnamese diacritics but preserving string length.
 * Safely handles non-BMP / surrogate pairs (e.g. CJK Extension B+, Nom).
 * @param text - Input text.
 * @returns Normalized lowercased string.
 */
export function normalizeCharPreserveLength(text: unknown): string {
	let out = '';
	for (const ch of String(text || '')) {
		if (ch === 'đ' || ch === 'Đ') {
			out += 'd';
			continue;
		}
		out += Array.from(ch.normalize('NFD'))[0].toLowerCase();
	}
	return out;
}

/**
 * Checks if a string contains Vietnamese diacritics (tone marks, special letters like đ, ê, ô, ư, ơ, etc.).
 * Automatically handles Unicode NFC/NFD representations.
 * @param text - Input string to check.
 * @returns True if text contains Vietnamese diacritics.
 */
export function hasVietnameseDiacritics(text: unknown): boolean {
	if (typeof text !== 'string') return false;
	const norm = text.normalize('NFC');
	return /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ]/.test(
		norm
	);
}

/**
 * Normalizes and extracts a clean human-readable book title from a filename.
 * Handles URL decoding, Unicode NFC normalization (fixing macOS NFD decomposed accents),
 * removes file extensions, strips bracketed tags (e.g. [Full], [Ebook], (Bản chuẩn)),
 * and cleans up separators (hyphens, underscores).
 * @param name - The raw filename or path string.
 * @returns Cleaned title string.
 */
export function cleanTitleFromFileName(name: unknown): string {
	if (typeof name !== 'string') return '';
	let title = name.trim();
	if (!title) return '';

	// Decode URL-encoded names if present (e.g. "Dac%20Nhan%20Tam.txt")
	if (/%[0-9A-Fa-f]{2}/.test(title)) {
		try {
			title = decodeURIComponent(title);
		} catch {
			// ignore malformed URI
		}
	}

	// Always normalize to Unicode NFC (fixes decomposed NFD accents from macOS/iOS)
	title = title.normalize('NFC');

	// Strip file extension (e.g. .txt, .zip, .epub, .md)
	title = title.replace(/\.[a-zA-Z0-9]+$/i, '');

	// Strip leading/trailing bracketed annotations like [Full], [Ebook], (Bản dịch), etc.
	let prev = '';
	while (prev !== title) {
		prev = title;
		title = title
			.replace(/^(\[[^\]]*\]|\([^)]*?\))\s*/, '')
			.replace(/\s*(\[[^\]]*\]|\([^)]*?\))$/, '')
			.trim();
	}

	// Replace underscores and hyphens with spaces
	title = title.replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim();

	// If title is entirely lowercase, capitalize the first letter of each word
	if (title && title === title.toLowerCase()) {
		title = title
			.split(' ')
			.map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1) : ''))
			.join(' ');
	}

	return title;
}

export interface ExtractedMetadata {
	title?: string;
	author?: string;
	translator?: string;
	publisher?: string;
}

/**
 * Intelligently scans the header / frontmatter lines of a TXT file to extract metadata
 * such as Book Title, Author, Translator, and Publisher.
 * @param rawText - Raw text content from the file.
 * @returns Extracted metadata object.
 */
export function extractMetadataFromTxt(rawText: string): ExtractedMetadata {
	if (typeof rawText !== 'string' || !rawText.trim()) {
		return {};
	}

	const result: ExtractedMetadata = {};
	// Only inspect the top lines (header block up to 50 lines / 8000 chars)
	// Slice first before NFC normalizing to avoid unnecessary O(n) normalization across entire book
	const text = rawText.slice(0, 8000).normalize('NFC');
	const lines = text
		.split('\n')
		.slice(0, 50)
		.map((l) => l.trim());

	const titlePrefixes = /^(?:tên\s+sách|tựa\s+sách|nhan\s+đề|tiêu\s+đề|title)\s*[:：-]\s*(.+)$/i;
	const authorPrefixes = /^(?:tác\s+giả|nguyên\s+tác|tác\s+phẩm\s+của|author)\s*[:：-]\s*(.+)$/i;
	const translatorPrefixes =
		/^(?:dịch\s+giả|người\s+dịch|chuyển\s+ngữ|bản\s+dịch|translator)\s*[:：-]\s*(.+)$/i;
	const publisherPrefixes = /^(?:nhà\s+xuất\s+bản|nxb|publisher)\s*[:：-]\s*(.+)$/i;

	const cleanValue = (val: string) => {
		return val
			.replace(/^[#*_\-\s"']+|[#*_\-\s"']+$/g, '')
			.replace(/\s+/g, ' ')
			.trim();
	};

	let h1Title: string | undefined;
	let standaloneTitle: string | undefined;

	for (const line of lines) {
		if (!line) continue;

		let m = line.match(titlePrefixes);
		if (m && !result.title) {
			const cleaned = cleanValue(m[1]);
			if (cleaned && cleaned.length < 120) result.title = cleaned;
			continue;
		}

		m = line.match(authorPrefixes);
		if (m && !result.author) {
			const cleaned = cleanValue(m[1]);
			if (cleaned && cleaned.length < 100) result.author = cleaned;
			continue;
		}

		m = line.match(translatorPrefixes);
		if (m && !result.translator) {
			const cleaned = cleanValue(m[1]);
			if (cleaned && cleaned.length < 100) result.translator = cleaned;
			continue;
		}

		m = line.match(publisherPrefixes);
		if (m && !result.publisher) {
			const cleaned = cleanValue(m[1]);
			if (cleaned && cleaned.length < 100) result.publisher = cleaned;
			continue;
		}

		// Markdown H1 `# Tiêu đề sách`
		if (/^#\s+[^#]/.test(line) && !h1Title) {
			const titleText = cleanValue(line.replace(/^#\s+/, ''));
			if (
				titleText &&
				titleText.length < 120 &&
				!/^(?:chương|hồi|phần|mục\s+lục|lời\s+mở\s+đầu|lời\s+nói\s+đầu|giới\s+thiệu|tiết|quyển)\b/i.test(
					titleText
				) &&
				!titleText.startsWith('[new]') &&
				!titleText.startsWith('@@')
			) {
				h1Title = titleText;
			}
			continue;
		}

		// First non-empty standalone line without colon (potential title in front of metadata block)
		if (!standaloneTitle && !line.includes(':') && line.length < 100) {
			const cleanLine = cleanValue(line);
			if (
				cleanLine &&
				!/^(?:chương|hồi|phần|mục\s+lục|lời\s+mở\s+đầu|lời\s+nói\s+đầu|giới\s+thiệu|tiết|quyển)\b/i.test(
					cleanLine
				) &&
				!cleanLine.startsWith('---') &&
				!cleanLine.startsWith('===') &&
				!cleanLine.startsWith('[new]') &&
				!cleanLine.startsWith('@@')
			) {
				standaloneTitle = cleanLine;
			}
		}
	}

	if (!result.title) {
		if (h1Title) {
			result.title = h1Title;
		} else if (standaloneTitle && (result.author || result.translator || result.publisher)) {
			// Only accept standalone title if accompanied by book metadata in the header block
			result.title = standaloneTitle;
		}
	}

	return result;
}
