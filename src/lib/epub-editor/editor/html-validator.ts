// src/lib/epub-editor/editor/html-validator.ts
import { sha1 } from '$lib/utils';
import type { EpubValidationError } from './types';

/**
 * Validate HTML/XHTML content using DOMParser.
 */
export function validateHtml(htmlContent: string): { valid: boolean; error?: string } {
	if (typeof DOMParser === 'undefined') {
		return { valid: true };
	}

	try {
		const parser = new DOMParser();
		const doc = parser.parseFromString(htmlContent, 'application/xhtml+xml');
		const parserError = doc.querySelector('parsererror');

		if (parserError) {
			return {
				valid: false,
				error: parserError.textContent?.trim() || 'Lỗi cú pháp XHTML/XML không hợp lệ'
			};
		}
		return { valid: true };
	} catch (err: unknown) {
		const msg = err instanceof Error ? err.message : String(err);
		return {
			valid: false,
			error: msg
		};
	}
}

/**
 * Validate all modified files in dirtyPaths.
 */
export function validateDirtyPages(
	dirtyPaths: Set<string>,
	editBuffer: Map<string, string>
): EpubValidationError[] {
	const errors: EpubValidationError[] = [];

	for (const path of dirtyPaths) {
		const ext = path.substring(path.lastIndexOf('.')).toLowerCase();
		if (['.xhtml', '.html', '.htm'].includes(ext)) {
			const content = editBuffer.get(path);
			if (content !== undefined) {
				const res = validateHtml(content);
				if (!res.valid) {
					errors.push({
						path,
						error: res.error || 'Lỗi cú pháp XHTML/XML'
					});
				}
			}
		}
	}

	return errors;
}

/**
 * Check if the first 4 bytes match standard font magic bytes.
 */
export function isValidFontMagic(bytes: Uint8Array): boolean {
	if (bytes.length < 4) return false;
	// TrueType: 0x00010000 or 'true' (0x74727565)
	if (bytes[0] === 0x00 && bytes[1] === 0x01 && bytes[2] === 0x00 && bytes[3] === 0x00) return true;
	if (bytes[0] === 0x74 && bytes[1] === 0x72 && bytes[2] === 0x75 && bytes[3] === 0x65) return true;
	// OpenType: 'OTTO' (0x4F54544F)
	if (bytes[0] === 0x4f && bytes[1] === 0x54 && bytes[2] === 0x54 && bytes[3] === 0x4f) return true;
	// WOFF: 'wOFF' (0x774F4646)
	if (bytes[0] === 0x77 && bytes[1] === 0x4f && bytes[2] === 0x46 && bytes[3] === 0x46) return true;
	// WOFF2: 'wOF2' (0x774F4632)
	if (bytes[0] === 0x77 && bytes[1] === 0x4f && bytes[2] === 0x46 && bytes[3] === 0x32) return true;
	return false;
}

/**
 * Deobfuscate font bytes using IDPF algorithm (EPUB 3 / EPUB 2 standard).
 */
export function deobfuscateIdpfFont(fontBytes: Uint8Array, identifier: string): Uint8Array {
	const cleanedUid = identifier.replace(/[\s\r\n\t]/g, '');
	const key = sha1(cleanedUid);
	const decrypted = new Uint8Array(fontBytes);
	const limit = Math.min(1040, decrypted.length);
	for (let i = 0; i < limit; i++) {
		decrypted[i] ^= key[i % 20];
	}
	return decrypted;
}

/**
 * Deobfuscate font bytes using Adobe algorithm.
 */
export function deobfuscateAdobeFont(fontBytes: Uint8Array, identifier: string): Uint8Array {
	const hex = identifier.replace(/urn:uuid:/i, '').replace(/[^0-9a-fA-F]/g, '');
	if (hex.length < 32) return fontBytes;
	const key = new Uint8Array(16);
	for (let i = 0; i < 16; i++) {
		key[i] = parseInt(hex.substring(i * 2, i * 2 + 2), 16);
	}
	const decrypted = new Uint8Array(fontBytes);
	const limit = Math.min(1024, decrypted.length);
	for (let i = 0; i < limit; i++) {
		decrypted[i] ^= key[i % 16];
	}
	return decrypted;
}
