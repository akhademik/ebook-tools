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
