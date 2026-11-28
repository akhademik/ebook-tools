// src/lib/utils/xml.ts

const ILLEGAL_XML_CHARS_RE =
	// eslint-disable-next-line no-control-regex
	/[\x00-\x08\x0B\x0C\x0E-\x1F\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/g;

/**
 * Strips characters that are illegal in XML 1.0 (C0 control chars, U+FFFE/U+FFFF, lone surrogates).
 */
export function sanitizeXmlText(s: unknown): string {
	if (s === null || s === undefined) return '';
	return String(s).replace(ILLEGAL_XML_CHARS_RE, '');
}

/**
 * Escapes XML/HTML special characters in a string for safe EPUB XHTML insertion.
 * @param s - Input string or primitive.
 * @returns Escaped XML string.
 */
export function escapeXml(s: unknown): string {
	return sanitizeXmlText(s)
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;');
}

/**
 * Escapes XML attribute values (specifically handles quotes, ampersands, and XML entities).
 * @param s - Input value.
 * @returns Escaped attribute string.
 */
export function escapeXmlAttribute(s: unknown): string {
	return escapeXml(s);
}

/**
 * Validates that a generated XHTML string is well-formed XML, free of illegal XML 1.0 characters,
 * unescaped ampersands, and duplicate element IDs.
 */
export function validateXhtmlWellFormed(xhtml: string): { valid: boolean; error?: string } {
	if (ILLEGAL_XML_CHARS_RE.test(xhtml)) {
		ILLEGAL_XML_CHARS_RE.lastIndex = 0;
		return { valid: false, error: 'Chứa ký tự không hợp lệ trong chuẩn XML 1.0.' };
	}
	ILLEGAL_XML_CHARS_RE.lastIndex = 0;

	// Check unescaped ampersands outside valid XML entities
	const unescapedAmp = /&(?!amp;|lt;|gt;|quot;|apos;|#\d+;|#x[0-9a-fA-F]+;)/;
	if (unescapedAmp.test(xhtml)) {
		return { valid: false, error: 'Phát hiện ký tự "&" chưa được escape đúng chuẩn XML.' };
	}

	// Check duplicate id attributes on the same XHTML page
	const idSet = new Set<string>();
	const idRegex = /\bid\s*=\s*["']([^"']+)["']/gi;
	let idMatch: RegExpExecArray | null;
	while ((idMatch = idRegex.exec(xhtml)) !== null) {
		const id = idMatch[1];
		if (idSet.has(id)) {
			return {
				valid: false,
				error: `Phát hiện trùng lặp thuộc tính id="${id}" trong cùng trang XHTML.`
			};
		}
		idSet.add(id);
	}

	if (typeof DOMParser !== 'undefined') {
		try {
			const parser = new DOMParser();
			const doc = parser.parseFromString(xhtml, 'application/xhtml+xml');
			const parserError = doc.querySelector('parsererror');
			if (parserError) {
				return {
					valid: false,
					error: parserError.textContent?.trim() || 'Cú pháp XML/XHTML không hợp lệ.'
				};
			}
		} catch (err: unknown) {
			return {
				valid: false,
				error: err instanceof Error ? err.message : String(err)
			};
		}
	}

	return { valid: true };
}
