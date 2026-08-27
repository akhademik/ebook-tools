// src/lib/epub-editor/editor/editor-ops.ts
import type JSZip from 'jszip';
import { resolveRelativePath } from '$lib/utils';
import type { EpubFileCategory, EpubEditorFileItem } from './types';

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
 */
export function parseSpineOrder(opfContent: string, opfPath: string): string[] {
	if (typeof DOMParser !== 'undefined') {
		try {
			const parser = new DOMParser();
			const doc = parser.parseFromString(opfContent, 'application/xml');
			const parserError = doc.querySelector('parsererror');
			if (!parserError) {
				const manifestMap = new Map<string, string>();
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
			// Fallback to regex
		}
	}

	const idToHref = new Map<string, string>();
	const itemRegex =
		/<item\b[^>]*\bid\s*=\s*["']([^"']+)["'][^>]*\bhref\s*=\s*["']([^"']+)["'][^>]*>/gi;
	let m: RegExpExecArray | null;
	while ((m = itemRegex.exec(opfContent)) !== null) {
		idToHref.set(m[1], m[2]);
	}

	const itemRegexRev =
		/<item\b[^>]*\bhref\s*=\s*["']([^"']+)["'][^>]*\bid\s*=\s*["']([^"']+)["'][^>]*>/gi;
	while ((m = itemRegexRev.exec(opfContent)) !== null) {
		idToHref.set(m[2], m[1]);
	}

	const spinePaths: string[] = [];
	const itemrefRegex = /<itemref\b[^>]*\bidref\s*=\s*["']([^"']+)["'][^>]*>/gi;
	while ((m = itemrefRegex.exec(opfContent)) !== null) {
		const idref = m[1];
		const href = idToHref.get(idref);
		if (href) {
			const resolved = resolveRelativePath(opfPath, href);
			if (!spinePaths.includes(resolved)) {
				spinePaths.push(resolved);
			}
		}
	}

	return spinePaths;
}

/**
 * List files from JSZip ordered by EPUB spine (reading sequence) for pages.
 */
export async function parseZipEntries(
	zip: JSZip,
	editBuffer?: Map<string, string>
): Promise<EpubEditorFileItem[]> {
	let spineOrder: string[] = [];
	const opfPath = Object.keys(zip.files).find((p) => p.toLowerCase().endsWith('.opf'));
	if (opfPath) {
		const opfText =
			(editBuffer && editBuffer.get(opfPath)) || (await zip.file(opfPath)?.async('text'));
		if (opfText) {
			spineOrder = parseSpineOrder(opfText, opfPath);
		}
	}

	const allPaths = new Set(Object.keys(zip.files).filter((p) => !zip.files[p].dir));
	if (editBuffer) {
		for (const k of editBuffer.keys()) {
			allPaths.add(k);
		}
	}

	const items: EpubEditorFileItem[] = [];

	for (const path of allPaths) {
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

		const hrefMatch = /href\s*=\s*["']([^"']+)["']/i.exec(tag);
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
 * Export the EPUB archive as a Blob with updated files from editBuffer.
 */
export async function exportEpubBlob(zip: JSZip, editBuffer: Map<string, string>): Promise<Blob> {
	for (const [path, content] of editBuffer.entries()) {
		zip.file(path, content);
	}

	return await zip.generateAsync({
		type: 'blob',
		mimeType: 'application/epub+zip',
		compression: 'DEFLATE',
		compressionOptions: { level: 6 }
	});
}
