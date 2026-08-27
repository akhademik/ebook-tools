// src/lib/epub-editor/editor/preview-builder.ts
import type JSZip from 'jszip';
import { Logger, resolveRelativePath } from '$lib/utils';
import type { BuildPreviewHtmlOptions } from './types';
import { isValidFontMagic, deobfuscateIdpfFont, deobfuscateAdobeFont } from './html-validator';

function escapeRegExp(str: string): string {
	return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function escapeAttribute(str: string): string {
	return str
		.replace(/&/g, '&amp;')
		.replace(/"/g, '&quot;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;');
}

function uint8ArrayToBase64(bytes: Uint8Array): string {
	let binary = '';
	const len = bytes.byteLength;
	const chunkSize = 8192;
	for (let i = 0; i < len; i += chunkSize) {
		const chunk = bytes.subarray(i, Math.min(i + chunkSize, len));
		binary += String.fromCharCode.apply(null, chunk as unknown as number[]);
	}
	return btoa(binary);
}

/**
 * Extract publication identifiers from OPF XML content.
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
			// Fallback to regex
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

		if (!isValidFontMagic(fontBytes)) {
			const opfEntry = Object.keys(zip.files).find((p) => p.toLowerCase().endsWith('.opf'));
			if (opfEntry) {
				const opfContent = await zip.file(opfEntry)?.async('text');
				if (opfContent) {
					const identifiers = extractPublicationIdentifiers(opfContent);
					for (const uid of identifiers) {
						const idpfCandidate = deobfuscateIdpfFont(fontBytes, uid);
						if (isValidFontMagic(idpfCandidate)) {
							fontBytes = idpfCandidate;
							Logger.info(
								'[EpubEditor]',
								`Successfully deobfuscated font with IDPF algorithm: ${path}`
							);
							break;
						}

						const adobeCandidate = deobfuscateAdobeFont(fontBytes, uid);
						if (isValidFontMagic(adobeCandidate)) {
							fontBytes = adobeCandidate;
							Logger.info(
								'[EpubEditor]',
								`Successfully deobfuscated font with Adobe algorithm: ${path}`
							);
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

/**
 * Construct srcdoc HTML string for the preview iframe.
 */
export async function buildPreviewHtml(options: BuildPreviewHtmlOptions): Promise<string> {
	const { html, baseHtmlPath, getFileContent, getAssetDataUrl } = options;

	let processedHtml = html;

	// Sanitize legacy file:/// URLs
	processedHtml = processedHtml.replace(
		/\b(href|src|xlink:href)\s*=\s*["']file:\/\/[^"']*["']/gi,
		'$1="#"'
	);
	processedHtml = processedHtml.replace(/url\s*\(\s*['"]?file:\/\/[^'")]*['"]?\s*\)/gi, 'none');

	// Ensure viewport meta tag is present
	if (!/<meta\b[^>]*name=["']viewport["']/i.test(processedHtml)) {
		if (/<head\b[^>]*>/i.test(processedHtml)) {
			processedHtml = processedHtml.replace(
				/<head\b[^>]*>/i,
				`$&\n<meta name="viewport" content="width=device-width, initial-scale=1.0" />`
			);
		} else {
			processedHtml =
				`<meta name="viewport" content="width=device-width, initial-scale=1.0" />\n` +
				processedHtml;
		}
	}

	// 1. Resolve relative URLs inside existing inline <style>
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
			const hrefMatch = /href\s*=\s*["']([^"']+)["']/i.exec(fullTag);
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

	// 4. Replace SVG <image xlink:href="..."> references
	const svgImageRegex = /<image\b([^>]*)>/gi;
	const svgMatches: Array<{
		fullTag: string;
		attrName: string;
		originalHref: string;
		resolvedPath: string;
	}> = [];

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
				const pattern = new RegExp(
					`${escapeRegExp(item.attrName)}\\s*=\\s*["']${escapeRegExp(item.originalHref)}["']`,
					'i'
				);
				const updatedTag = item.fullTag.replace(pattern, `${item.attrName}="${dataUrl}"`);
				processedHtml = processedHtml.replace(item.fullTag, updatedTag);
			}
		} catch (err) {
			Logger.warn('[EpubEditor]', `Failed to load preview SVG image: ${item.resolvedPath}`, err);
		}
	}

	return processedHtml;
}
