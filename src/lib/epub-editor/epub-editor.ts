// src/lib/epub-editor/epub-editor.ts
import type JSZip from 'jszip';
import type {
	EpubFileCategory,
	EpubEditorFileItem,
	EpubValidationError,
	BuildPreviewHtmlOptions
} from '$lib/types';
import { Logger, resolveRelativePath } from '$lib/utils';

export { resolveRelativePath };

/**
 * Categorize a file by its extension.
 */
export function categorizeFile(path: string): EpubFileCategory {
	const cleanPath = path.split('?')[0].split('#')[0];
	const ext = cleanPath.substring(cleanPath.lastIndexOf('.')).toLowerCase();

	if (['.xhtml', '.html', '.htm'].includes(ext)) {
		return 'page';
	}
	if (ext === '.css') {
		return 'style';
	}
	if (['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp'].includes(ext)) {
		return 'image';
	}
	return 'other';
}

/**
 * Extract reading order from the EPUB spine if present in OPF content.
 * Uses DOMParser for robust XML structural parsing with fallback.
 */
export function parseSpineOrder(opfContent: string, opfPath: string): string[] {
	if (typeof DOMParser !== 'undefined') {
		try {
			const parser = new DOMParser();
			const doc = parser.parseFromString(opfContent, 'application/xml');
			const parserError = doc.querySelector('parsererror');
			if (!parserError) {
				const manifestMap = new Map<string, string>(); // id -> resolvedPath
				const itemEls = Array.from(doc.querySelectorAll('manifest > item, item'));
				for (const item of itemEls) {
					const id = item.getAttribute('id');
					const href = item.getAttribute('href');
					if (id && href) {
						const resolved = resolveRelativePath(opfPath, href);
						manifestMap.set(id, resolved);
					}
				}

				const spinePaths: string[] = [];
				const itemrefEls = Array.from(doc.querySelectorAll('spine > itemref, itemref'));
				for (const itemref of itemrefEls) {
					const idref = itemref.getAttribute('idref');
					if (idref) {
						const path = manifestMap.get(idref);
						if (path && !spinePaths.includes(path)) {
							spinePaths.push(path);
						}
					}
				}

				if (spinePaths.length > 0) {
					return spinePaths;
				}
			}
		} catch {
			// Fallback to regex parser
		}
	}

	// Fallback regex parser for non-DOM environments or broken XML
	const manifestMap = new Map<string, string>(); // id -> resolvedPath
	const itemRegex = /<item\b[^>]*>/gi;
	let match: RegExpExecArray | null;

	while ((match = itemRegex.exec(opfContent)) !== null) {
		const tag = match[0];
		const idMatch = /id\s*=\s*["']([^"']+)["']/i.exec(tag);
		const hrefMatch = /href\s*=\s*["']([^"']+)["']/i.exec(tag);
		if (idMatch && hrefMatch) {
			const resolved = resolveRelativePath(opfPath, hrefMatch[1]);
			manifestMap.set(idMatch[1], resolved);
		}
	}

	const spinePaths: string[] = [];
	const itemrefRegex = /<itemref\b[^>]*idref\s*=\s*["']([^"']+)["'][^>]*>/gi;
	while ((match = itemrefRegex.exec(opfContent)) !== null) {
		const idref = match[1];
		const path = manifestMap.get(idref);
		if (path && !spinePaths.includes(path)) {
			spinePaths.push(path);
		}
	}

	return spinePaths;
}

/**
 * List files from JSZip ordered by EPUB spine (reading sequence) for pages,
 * and natural alphanumeric sort for chapters, styles, images, and other assets.
 */
export async function parseZipEntries(zip: JSZip): Promise<EpubEditorFileItem[]> {
	let spineOrder: string[] = [];
	const opfPath = Object.keys(zip.files).find((p) => p.toLowerCase().endsWith('.opf'));
	if (opfPath) {
		const opfText = await zip.file(opfPath)?.async('text');
		if (opfText) {
			spineOrder = parseSpineOrder(opfText, opfPath);
		}
	}

	const items: EpubEditorFileItem[] = [];

	for (const path of Object.keys(zip.files)) {
		const entry = zip.files[path];
		if (entry.dir) continue;

		const name = path.split('/').pop() || path;
		const cleanPath = path.split('?')[0].split('#')[0];
		const extension = cleanPath.substring(cleanPath.lastIndexOf('.')).toLowerCase();

		items.push({
			path,
			name,
			category: categorizeFile(path),
			extension,
			orderIndex: 0
		});
	}

	const spineIndexMap = new Map<string, number>();
	spineOrder.forEach((p, idx) => spineIndexMap.set(p, idx));

	const categoryOrder: Record<EpubFileCategory, number> = {
		page: 1,
		style: 2,
		image: 3,
		other: 4
	};

	items.sort((a, b) => {
		// If both are page files
		if (a.category === 'page' && b.category === 'page') {
			const aSpine = spineIndexMap.has(a.path) ? spineIndexMap.get(a.path)! : Infinity;
			const bSpine = spineIndexMap.has(b.path) ? spineIndexMap.get(b.path)! : Infinity;
			if (aSpine !== bSpine) {
				return aSpine - bSpine;
			}
			return a.path.localeCompare(b.path, undefined, { numeric: true, sensitivity: 'base' });
		}

		if (categoryOrder[a.category] !== categoryOrder[b.category]) {
			return categoryOrder[a.category] - categoryOrder[b.category];
		}

		// Natural alphanumeric sort (e.g. chap1, chap2, chap10, chap20, chap400)
		return a.path.localeCompare(b.path, undefined, { numeric: true, sensitivity: 'base' });
	});

	items.forEach((item, idx) => {
		item.orderIndex = idx;
	});

	return items;
}

/**
 * Extract all linked stylesheet paths referenced by <link rel="stylesheet" href="..."> in HTML.
 */
export function extractLinkedCssPaths(html: string, baseHtmlPath: string): string[] {
	const cssPaths: string[] = [];
	const linkTagRegex = /<link\b[^>]*>/gi;
	let match: RegExpExecArray | null;

	while ((match = linkTagRegex.exec(html)) !== null) {
		const tag = match[0];
		const relMatch = /rel\s*=\s*["']([^"']*)["']/i.exec(tag);
		if (!relMatch || !relMatch[1].toLowerCase().includes('stylesheet')) {
			continue;
		}

		const hrefMatch = /href\s*=\s*["']([^"']*)["']/i.exec(tag);
		if (hrefMatch && hrefMatch[1]) {
			const resolved = resolveRelativePath(baseHtmlPath, hrefMatch[1]);
			if (!cssPaths.includes(resolved)) {
				cssPaths.push(resolved);
			}
		}
	}

	return cssPaths;
}

/**
 * Compute SHA-1 hash asynchronously using standard Web Crypto API (crypto.subtle)
 * with graceful fallback to pure JS implementation.
 */
export async function sha1Async(input: string): Promise<Uint8Array> {
	if (typeof globalThis !== 'undefined' && globalThis.crypto?.subtle) {
		const data = new TextEncoder().encode(input);
		const hashBuffer = await globalThis.crypto.subtle.digest('SHA-1', data);
		return new Uint8Array(hashBuffer);
	}
	return sha1(input);
}

/**
 * Compute SHA-1 hash of string input into a 20-byte Uint8Array (pure JS implementation).
 */
export function sha1(input: string): Uint8Array {
	const utf8 = new TextEncoder().encode(input);
	let h0 = 0x67452301;
	let h1 = 0xefcdab89;
	let h2 = 0x98badcfe;
	let h3 = 0x10325476;
	let h4 = 0xc3d2e1f0;

	const msgLen = utf8.length;
	const bitLen = msgLen * 8;
	const newLen = (((msgLen + 8) >> 6) + 1) << 6;
	const words = new Uint32Array(newLen >> 2);

	for (let i = 0; i < msgLen; i++) {
		words[i >> 2] |= utf8[i] << (24 - (i % 4) * 8);
	}
	words[msgLen >> 2] |= 0x80 << (24 - (msgLen % 4) * 8);
	words[words.length - 1] = bitLen;
	words[words.length - 2] = Math.floor(bitLen / 0x100000000);

	const w = new Uint32Array(80);
	for (let i = 0; i < words.length; i += 16) {
		for (let j = 0; j < 16; j++) w[j] = words[i + j];
		for (let j = 16; j < 80; j++) {
			const n = w[j - 3] ^ w[j - 8] ^ w[j - 14] ^ w[j - 16];
			w[j] = (n << 1) | (n >>> 31);
		}

		let a = h0,
			b = h1,
			c = h2,
			d = h3,
			e = h4;
		for (let j = 0; j < 80; j++) {
			let f: number, k: number;
			if (j < 20) {
				f = (b & c) | (~b & d);
				k = 0x5a827999;
			} else if (j < 40) {
				f = b ^ c ^ d;
				k = 0x6ed9eba1;
			} else if (j < 60) {
				f = (b & c) | (b & d) | (c & d);
				k = 0x8f1bbcdc;
			} else {
				f = b ^ c ^ d;
				k = 0xca62c1d6;
			}
			const temp = (((a << 5) | (a >>> 27)) + f + e + k + w[j]) | 0;
			e = d;
			d = c;
			c = (b << 30) | (b >>> 2);
			b = a;
			a = temp;
		}

		h0 = (h0 + a) | 0;
		h1 = (h1 + b) | 0;
		h2 = (h2 + c) | 0;
		h3 = (h3 + d) | 0;
		h4 = (h4 + e) | 0;
	}

	const result = new Uint8Array(20);
	const h = [h0, h1, h2, h3, h4];
	for (let i = 0; i < 5; i++) {
		result[i * 4] = (h[i] >>> 24) & 0xff;
		result[i * 4 + 1] = (h[i] >>> 16) & 0xff;
		result[i * 4 + 2] = (h[i] >>> 8) & 0xff;
		result[i * 4 + 3] = h[i] & 0xff;
	}
	return result;
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
function deobfuscateAdobeFont(fontBytes: Uint8Array, identifier: string): Uint8Array {
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

/**
 * Extract publication identifiers from OPF XML content.
 * Uses DOMParser for robust XML structural handling with regex fallback.
 */
export function extractPublicationIdentifiers(opfContent: string): string[] {
	if (typeof DOMParser !== 'undefined') {
		try {
			const parser = new DOMParser();
			const doc = parser.parseFromString(opfContent, 'application/xml');
			const parserError = doc.querySelector('parsererror');
			if (!parserError) {
				const ids: string[] = [];
				const pkgEl = doc.querySelector('package');
				const uniqueIdAttr = pkgEl?.getAttribute('unique-identifier');

				const metadataEl = doc.querySelector('metadata') || doc.documentElement;
				const allChildren = Array.from(metadataEl.getElementsByTagName('*'));
				const identifierEls = allChildren.filter((el) => {
					return el.localName === 'identifier' || el.tagName.toLowerCase().endsWith(':identifier');
				});

				if (uniqueIdAttr) {
					const uniqueEl = identifierEls.find((el) => el.getAttribute('id') === uniqueIdAttr);
					if (uniqueEl?.textContent?.trim()) {
						ids.push(uniqueEl.textContent.trim());
					}
				}

				for (const el of identifierEls) {
					const val = el.textContent?.trim();
					if (val && !ids.includes(val)) {
						ids.push(val);
					}
				}

				if (ids.length > 0) {
					return ids;
				}
			}
		} catch {
			// Fallback to regex parser
		}
	}

	const ids: string[] = [];

	const pkgMatch = /<package\b[^>]*unique-identifier\s*=\s*["']([^"']+)["']/i.exec(opfContent);
	const uniqueIdAttr = pkgMatch ? pkgMatch[1] : null;

	if (uniqueIdAttr) {
		const targetRegex = new RegExp(
			`<dc:identifier\\b[^>]*id\\s*=\\s*["']${escapeRegExp(uniqueIdAttr)}["'][^>]*>([\\s\\S]*?)<\\/dc:identifier>`,
			'i'
		);
		const match = targetRegex.exec(opfContent);
		if (match && match[1].trim()) {
			ids.push(match[1].trim());
		}
	}

	const dcRegex = /<dc:identifier\b[^>]*>([\s\S]*?)<\/dc:identifier>/gi;
	let m: RegExpExecArray | null;
	while ((m = dcRegex.exec(opfContent)) !== null) {
		const val = m[1].trim();
		if (val && !ids.includes(val)) {
			ids.push(val);
		}
	}

	return ids;
}

function uint8ArrayToBase64(bytes: Uint8Array): string {
	let binary = '';
	const len = bytes.byteLength;
	// Process in chunks to avoid stack overflow with huge files
	const chunkSize = 8192;
	for (let i = 0; i < len; i += chunkSize) {
		const chunk = bytes.subarray(i, Math.min(i + chunkSize, len));
		binary += String.fromCharCode.apply(null, chunk as unknown as number[]);
	}
	return btoa(binary);
}

/**
 * Retrieve binary asset as a base64 data URI to ensure seamless rendering in sandboxed iframes.
 * Automatically deobfuscates EPUB encrypted/mangled fonts (IDPF & Adobe standards).
 */
export async function getAssetDataUrl(zip: JSZip, path: string): Promise<string | null> {
	const file = zip.file(path);
	if (!file) return null;

	const cleanPath = path.split('?')[0].split('#')[0];
	const ext = cleanPath.substring(cleanPath.lastIndexOf('.')).toLowerCase();

	let mime = 'application/octet-stream';
	const isFont = ['.ttf', '.otf', '.woff', '.woff2'].includes(ext);

	if (ext === '.jpg' || ext === '.jpeg') mime = 'image/jpeg';
	else if (ext === '.png') mime = 'image/png';
	else if (ext === '.gif') mime = 'image/gif';
	else if (ext === '.svg') mime = 'image/svg+xml';
	else if (ext === '.webp') mime = 'image/webp';
	else if (ext === '.ttf') mime = 'font/ttf';
	else if (ext === '.otf') mime = 'font/otf';
	else if (ext === '.woff') mime = 'font/woff';
	else if (ext === '.woff2') mime = 'font/woff2';

	if (isFont) {
		let fontBytes = await file.async('uint8array');

		// Check if the font has valid magic header. If not, it is likely obfuscated (IDPF or Adobe).
		if (!isValidFontMagic(fontBytes)) {
			// Find OPF file to extract unique identifier
			const opfEntry = Object.keys(zip.files).find((p) => p.toLowerCase().endsWith('.opf'));
			if (opfEntry) {
				const opfContent = await zip.file(opfEntry)?.async('text');
				if (opfContent) {
					const identifiers = extractPublicationIdentifiers(opfContent);
					for (const uid of identifiers) {
						// Try IDPF deobfuscation
						const idpfCandidate = deobfuscateIdpfFont(fontBytes, uid);
						if (isValidFontMagic(idpfCandidate)) {
							fontBytes = idpfCandidate;
							Logger.info('[EpubEditor]', `Successfully deobfuscated font with IDPF algorithm: ${path}`);
							break;
						}

						// Try Adobe deobfuscation
						const adobeCandidate = deobfuscateAdobeFont(fontBytes, uid);
						if (isValidFontMagic(adobeCandidate)) {
							fontBytes = adobeCandidate;
							Logger.info('[EpubEditor]', `Successfully deobfuscated font with Adobe algorithm: ${path}`);
							break;
						}
					}
				}
			}
		}

		const base64 = uint8ArrayToBase64(fontBytes);
		return `data:${mime};base64,${base64}`;
	}

	const base64 = await file.async('base64');
	return `data:${mime};base64,${base64}`;
}

async function resolveCssUrls(
	cssContent: string,
	cssFilePath: string,
	getAssetDataUrl: (path: string) => Promise<string | null>
): Promise<string> {
	const urlRegex = /url\s*\(\s*(['"]?)([^'")]+)\1\s*\)/gi;
	const matches: Array<{ fullMatch: string; rawUrl: string; quote: string }> = [];

	let match: RegExpExecArray | null;
	while ((match = urlRegex.exec(cssContent)) !== null) {
		const fullMatch = match[0];
		const quote = match[1] || '"';
		const rawUrl = match[2].trim();

		if (!/^(data:|blob:|https?:\/\/)/i.test(rawUrl)) {
			matches.push({ fullMatch, rawUrl, quote });
		}
	}

	let result = cssContent;
	for (const item of matches) {
		const resolvedPath = resolveRelativePath(cssFilePath, item.rawUrl);
		try {
			const dataUrl = await getAssetDataUrl(resolvedPath);
			if (dataUrl) {
				result = result.replace(item.fullMatch, `url(${item.quote}${dataUrl}${item.quote})`);
			} else {
				// Prevent host server 404s by replacing with empty data uri
				result = result.replace(
					item.fullMatch,
					`url(${item.quote}data:application/octet-stream;base64,${item.quote})`
				);
			}
		} catch (err) {
			Logger.warn('[EpubEditor]', `Failed to resolve CSS asset: ${resolvedPath}`, err);
		}
	}

	return result;
}

function escapeRegExp(str: string): string {
	return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Construct srcdoc HTML string for the preview iframe by:
 * 1. Inlining linked CSS into <style> tags (replacing <link rel="stylesheet">) with resolved fonts and asset URLs.
 * 2. Resolving existing inline <style> URLs.
 * 3. Converting <img src="..."> and SVG <image xlink:href="..."> references into base64 data URLs.
 */
export async function buildPreviewHtml(options: BuildPreviewHtmlOptions): Promise<string> {
	const { html, baseHtmlPath, getFileContent, getAssetDataUrl } = options;

	let processedHtml = html;

	// Sanitize legacy file:/// URLs left over by EPUB exporters (Calibre, Word, InDesign)
	// that cause browser "Security Error: may not load or link to file:///"
	processedHtml = processedHtml.replace(/\b(href|src|xlink:href)\s*=\s*["']file:\/\/[^"']*["']/gi, '$1="#"');
	processedHtml = processedHtml.replace(/url\s*\(\s*['"]?file:\/\/[^'")]*['"]?\s*\)/gi, 'none');

	// Ensure viewport meta tag is present so layout doesn't truncate
	if (!/<meta\b[^>]*name=["']viewport["']/i.test(processedHtml)) {
		if (/<head\b[^>]*>/i.test(processedHtml)) {
			processedHtml = processedHtml.replace(
				/<head\b[^>]*>/i,
				`$&\n<meta name="viewport" content="width=device-width, initial-scale=1.0" />`
			);
		} else {
			processedHtml = `<meta name="viewport" content="width=device-width, initial-scale=1.0" />\n` + processedHtml;
		}
	}

	// 1. Resolve relative URLs inside any existing inline <style>...</style> tags in the original HTML
	const inlineStyleRegex = /<style\b[^>]*>([\s\S]*?)<\/style>/gi;
	const inlineStyleMatches: Array<{ fullTag: string; rawCss: string }> = [];
	let styleMatch: RegExpExecArray | null;
	while ((styleMatch = inlineStyleRegex.exec(processedHtml)) !== null) {
		inlineStyleMatches.push({
			fullTag: styleMatch[0],
			rawCss: styleMatch[1]
		});
	}

	for (const sm of inlineStyleMatches) {
		const resolvedCss = await resolveCssUrls(sm.rawCss, baseHtmlPath, getAssetDataUrl);
		const replacement = `<style>\n${resolvedCss}\n</style>`;
		processedHtml = processedHtml.replace(sm.fullTag, replacement);
	}

	// 2. Replace <link rel="stylesheet"> tags with inline <style>
	const linkTagRegex = /<link\b[^>]*>/gi;
	const linkMatches: Array<{ fullTag: string; resolvedPath: string }> = [];

	let linkMatch: RegExpExecArray | null;
	while ((linkMatch = linkTagRegex.exec(processedHtml)) !== null) {
		const fullTag = linkMatch[0];
		const relMatch = /rel\s*=\s*["']([^"']*)["']/i.exec(fullTag);
		if (relMatch && relMatch[1].toLowerCase().includes('stylesheet')) {
			const hrefMatch = /href\s*=\s*["']([^"']*)["']/i.exec(fullTag);
			if (hrefMatch && hrefMatch[1]) {
				linkMatches.push({
					fullTag,
					resolvedPath: resolveRelativePath(baseHtmlPath, hrefMatch[1])
				});
			}
		}
	}

	for (const item of linkMatches) {
		const rawCss = (await getFileContent(item.resolvedPath)) || '';
		const resolvedCss = await resolveCssUrls(rawCss, item.resolvedPath, getAssetDataUrl);
		const styleTag = `<style data-inlined-from="${escapeAttribute(item.resolvedPath)}">\n${resolvedCss}\n</style>`;
		processedHtml = processedHtml.replace(item.fullTag, styleTag);
	}

	// 3. Replace <img src="..."> with Data URLs
	const imgTagRegex = /<img\b[^>]*src\s*=\s*["']([^"']+)["'][^>]*>/gi;
	const imgMatches: Array<{ fullTag: string; originalSrc: string; resolvedPath: string }> = [];

	let imgMatch: RegExpExecArray | null;
	while ((imgMatch = imgTagRegex.exec(processedHtml)) !== null) {
		const fullTag = imgMatch[0];
		const originalSrc = imgMatch[1];
		if (!/^(data:|blob:|https?:\/\/)/i.test(originalSrc)) {
			imgMatches.push({
				fullTag,
				originalSrc,
				resolvedPath: resolveRelativePath(baseHtmlPath, originalSrc)
			});
		}
	}

	for (const item of imgMatches) {
		try {
			const dataUrl = await getAssetDataUrl(item.resolvedPath);
			if (dataUrl) {
				const updatedTag = item.fullTag.replace(item.originalSrc, dataUrl);
				processedHtml = processedHtml.replace(item.fullTag, updatedTag);
			}
		} catch (err) {
			Logger.warn('[EpubEditor]', `Failed to load preview image: ${item.resolvedPath}`, err);
		}
	}

	// 4. Replace SVG <image xlink:href="..." /> or <image href="..." /> with Data URLs (common for EPUB covers)
	const svgImageRegex = /<image\b([^>]*)>/gi;
	const svgMatches: Array<{ fullTag: string; attrName: string; originalHref: string; resolvedPath: string }> = [];

	let svgMatch: RegExpExecArray | null;
	while ((svgMatch = svgImageRegex.exec(processedHtml)) !== null) {
		const fullTag = svgMatch[0];
		const hrefMatch = /(xlink:href|href)\s*=\s*["']([^"']+)["']/i.exec(fullTag);
		if (hrefMatch) {
			const attrName = hrefMatch[1];
			const originalHref = hrefMatch[2];
			if (!/^(data:|blob:|https?:\/\/)/i.test(originalHref)) {
				svgMatches.push({
					fullTag,
					attrName,
					originalHref,
					resolvedPath: resolveRelativePath(baseHtmlPath, originalHref)
				});
			}
		}
	}

	for (const item of svgMatches) {
		try {
			const dataUrl = await getAssetDataUrl(item.resolvedPath);
			if (dataUrl) {
				const pattern = new RegExp(`${escapeRegExp(item.attrName)}\\s*=\\s*["']${escapeRegExp(item.originalHref)}["']`, 'i');
				const updatedTag = item.fullTag.replace(pattern, `${item.attrName}="${dataUrl}"`);
				processedHtml = processedHtml.replace(item.fullTag, updatedTag);
			}
		} catch (err) {
			Logger.warn('[EpubEditor]', `Failed to load preview SVG image: ${item.resolvedPath}`, err);
		}
	}

	return processedHtml;
}

function escapeAttribute(str: string): string {
	return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/**
 * Validate HTML/XHTML content using DOMParser.
 */
export function validateHtml(htmlContent: string): { valid: boolean; error?: string } {
	if (typeof DOMParser === 'undefined') {
		return { valid: true };
	}

	try {
		const parser = new DOMParser();
		// Try XML parser first for XHTML
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
 * Export the EPUB archive as a Blob with updated files from editBuffer.
 */
export async function exportEpubBlob(
	zip: JSZip,
	editBuffer: Map<string, string>
): Promise<Blob> {
	for (const [path, content] of editBuffer.entries()) {
		zip.file(path, content);
	}

	return await zip.generateAsync({
		type: 'blob',
		mimeType: 'application/epub+zip',
		compression: 'DEFLATE',
		compressionOptions: { level: 9 }
	});
}
