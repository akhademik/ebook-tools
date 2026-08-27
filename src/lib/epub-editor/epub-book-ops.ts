// src/lib/epub-editor/epub-book-ops.ts
import type JSZip from 'jszip';
import type { EpubMetadata, TocNode, TocTree } from '$lib/types';
import { resolveRelativePath } from './epub-editor';
import { escapeXml } from '$lib/utils';
import { buildNavXhtml, buildTocNcx } from '../epub-packer/xml-builders/nav-builder';

export interface BookMetadataDetails extends EpubMetadata {
	description?: string;
	rights?: string;
	pubDate?: string;
}

interface TocChapterInfo {
	path: string;
	title: string;
	headings: Array<{
		id: string;
		title: string;
		level: number;
	}>;
}

/**
 * Locate OPF path from META-INF/container.xml or fallback to *.opf
 */
export async function findOpfPath(zip: JSZip): Promise<string | null> {
	const container = zip.file('META-INF/container.xml');
	if (container) {
		const text = await container.async('text');
		const m = /<rootfile\b[^>]*full-path\s*=\s*["']([^"']+)["']/i.exec(text);
		if (m && zip.file(m[1])) return m[1];
	}
	for (const p of Object.keys(zip.files)) {
		if (p.toLowerCase().endsWith('.opf') && !zip.files[p].dir) {
			return p;
		}
	}
	return null;
}

/**
 * Extract book metadata from OPF content using DOMParser with regex fallback.
 */
export function extractBookMetadata(opfXml: string): BookMetadataDetails {
	if (typeof DOMParser !== 'undefined') {
		try {
			const parser = new DOMParser();
			const doc = parser.parseFromString(opfXml, 'application/xml');
			const parserError = doc.querySelector('parsererror');

			if (!parserError) {
				const metadataEl = doc.querySelector('metadata');
				const allElements = metadataEl ? Array.from(metadataEl.getElementsByTagName('*')) : [];

				const getElText = (tagPattern: string): string => {
					const found = allElements.find((el) => {
						const local = el.localName || el.tagName.split(':').pop() || '';
						return local.toLowerCase() === tagPattern.toLowerCase();
					});
					return found?.textContent?.trim() || '';
				};

				const title = getElText('title') || 'Không tên';
				const author = getElText('creator') || '';
				const language = getElText('language') || 'vi';
				const publisher = getElText('publisher') || '';
				const description = getElText('description') || '';
				const rights = getElText('rights') || '';
				const pubDate = getElText('date') || '';

				const pkgEl = doc.querySelector('package');
				const uniqueIdAttr = pkgEl?.getAttribute('unique-identifier');
				let identifier = '';

				if (uniqueIdAttr) {
					const uniqueEl = allElements.find(
						(el) =>
							(el.localName === 'identifier' || el.tagName.endsWith(':identifier')) &&
							el.getAttribute('id') === uniqueIdAttr
					);
					if (uniqueEl?.textContent?.trim()) {
						identifier = uniqueEl.textContent.trim();
					}
				}

				if (!identifier) {
					identifier = getElText('identifier');
				}

				return {
					title,
					author,
					language,
					identifier,
					publisher,
					description,
					rights,
					pubDate
				};
			}
		} catch {
			// Fallback to regex
		}
	}

	const getTagValue = (tagName: string): string => {
		const regex = new RegExp(
			`<(?:dc:)?${tagName}\\b[^>]*>([\\s\\S]*?)<\\/(?:dc:)?${tagName}>`,
			'i'
		);
		const match = regex.exec(opfXml);
		if (!match) return '';
		return match[1].replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1').trim();
	};

	const title = getTagValue('title') || 'Không tên';
	const author = getTagValue('creator') || '';
	const language = getTagValue('language') || 'vi';
	const publisher = getTagValue('publisher') || '';
	const description = getTagValue('description') || '';
	const rights = getTagValue('rights') || '';
	const pubDate = getTagValue('date') || '';

	// Extract unique-identifier
	let identifier = '';
	const pkgMatch = /<package\b[^>]*unique-identifier\s*=\s*["']([^"']+)["']/i.exec(opfXml);
	if (pkgMatch) {
		const targetId = pkgMatch[1];
		const idRegex = new RegExp(
			`<(?:dc:)?identifier\\b[^>]*id\\s*=\\s*["']${targetId}["'][^>]*>([\\s\\S]*?)<\\/(?:dc:)?identifier>`,
			'i'
		);
		const idMatch = idRegex.exec(opfXml);
		if (idMatch) {
			identifier = idMatch[1].trim();
		}
	}
	if (!identifier) {
		identifier = getTagValue('identifier');
	}

	return {
		title,
		author,
		language,
		identifier,
		publisher,
		description,
		rights,
		pubDate
	};
}

/**
 * Updates metadata tags in OPF XML string cleanly while preserving other elements.
 */
export function updateBookMetadata(opfXml: string, newMeta: BookMetadataDetails): string {
	let updated = opfXml;

	function replaceOrCreateTag(tagName: string, value: string, dcPrefix = 'dc:') {
		const regex = new RegExp(`<(?:dc:)?${tagName}\\b[^>]*>[\\s\\S]*?<\\/(?:dc:)?${tagName}>`, 'i');
		if (regex.test(updated)) {
			if (value.trim()) {
				// Replace content preserving tag attributes
				updated = updated.replace(
					new RegExp(`(<(?:dc:)?${tagName}\\b[^>]*>)[\\s\\S]*?(<\\/(?:dc:)?${tagName}>)`, 'i'),
					`$1${escapeXml(value.trim())}$2`
				);
			}
		} else if (value.trim()) {
			// Insert before </metadata>
			const metaEndRegex = /<\/metadata>/i;
			if (metaEndRegex.test(updated)) {
				const newTag = `    <${dcPrefix}${tagName}>${escapeXml(value.trim())}</${dcPrefix}${tagName}>\n  `;
				updated = updated.replace(metaEndRegex, `${newTag}</metadata>`);
			}
		}
	}

	replaceOrCreateTag('title', newMeta.title || 'Không tên');
	replaceOrCreateTag('creator', newMeta.author || '');
	replaceOrCreateTag('language', newMeta.language || 'vi');
	if (newMeta.publisher !== undefined) replaceOrCreateTag('publisher', newMeta.publisher);
	if (newMeta.description !== undefined) replaceOrCreateTag('description', newMeta.description);
	if (newMeta.rights !== undefined) replaceOrCreateTag('rights', newMeta.rights);
	if (newMeta.pubDate !== undefined) replaceOrCreateTag('date', newMeta.pubDate);

	// Update identifier matching unique-identifier if present
	if (newMeta.identifier) {
		const pkgMatch = /<package\b[^>]*unique-identifier\s*=\s*["']([^"']+)["']/i.exec(updated);
		if (pkgMatch) {
			const targetId = pkgMatch[1];
			const idRegex = new RegExp(
				`(<(?:dc:)?identifier\\b[^>]*id\\s*=\\s*["']${targetId}["'][^>]*>)[\\s\\S]*?(<\\/(?:dc:)?identifier>)`,
				'i'
			);
			if (idRegex.test(updated)) {
				updated = updated.replace(idRegex, `$1${escapeXml(newMeta.identifier)}$2`);
			} else {
				replaceOrCreateTag('identifier', newMeta.identifier);
			}
		} else {
			replaceOrCreateTag('identifier', newMeta.identifier);
		}
	}

	// Update dcterms:modified
	const modifiedTime = new Date().toISOString().replace(/\.\d+Z$/, 'Z');
	const modRegex = /(<meta\b[^>]*property\s*=\s*["']dcterms:modified["'][^>]*>)[^<]*(<\/meta>)/i;
	if (modRegex.test(updated)) {
		updated = updated.replace(modRegex, `$1${modifiedTime}$2`);
	}

	return updated;
}

/**
 * Re-orders spine <itemref> elements in OPF based on a given array of file paths.
 */
export function reorderOpfSpine(opfXml: string, opfPath: string, newSpinePaths: string[]): string {
	// Parse manifest to map resolvedPath -> id
	const itemRegex = /<item\b[^>]*>/gi;
	const pathToId = new Map<string, string>();
	let m: RegExpExecArray | null;

	while ((m = itemRegex.exec(opfXml)) !== null) {
		const tag = m[0];
		const idMatch = /id\s*=\s*["']([^"']+)["']/i.exec(tag);
		const hrefMatch = /href\s*=\s*["']([^"']+)["']/i.exec(tag);
		if (idMatch && hrefMatch) {
			const resolved = resolveRelativePath(opfPath, hrefMatch[1]);
			pathToId.set(resolved, idMatch[1]);
		}
	}

	// Generate new <itemref> list
	const newItemrefs: string[] = [];
	for (const p of newSpinePaths) {
		const id = pathToId.get(p);
		if (id) {
			newItemrefs.push(`    <itemref idref="${id}"/>`);
		}
	}

	const spineBlockRegex = /(<spine\b[^>]*>)([\s\S]*?)(<\/spine>)/i;
	if (spineBlockRegex.test(opfXml) && newItemrefs.length > 0) {
		return opfXml.replace(spineBlockRegex, `$1\n${newItemrefs.join('\n')}\n  $3`);
	}

	return opfXml;
}

/**
 * Scans XHTML pages in spine order and rebuilds `nav.xhtml` and `toc.ncx`
 */
export async function rebuildEpubToc(
	zip: JSZip,
	editBuffer?: Map<string, string>
): Promise<{ navXhtml: string; tocNcx: string; navPath: string; ncxPath: string } | null> {
	const opfPath = await findOpfPath(zip);
	if (!opfPath) return null;

	const getFileText = async (path: string): Promise<string> => {
		if (editBuffer && editBuffer.has(path)) {
			return editBuffer.get(path) || '';
		}
		const f = zip.file(path);
		return f ? await f.async('text') : '';
	};

	const opfText = await getFileText(opfPath);
	const meta = extractBookMetadata(opfText);

	// Parse manifest items & spine order
	const itemRegex = /<item\b[^>]*>/gi;
	const idToInfo = new Map<
		string,
		{ href: string; resolvedPath: string; mediaType: string; properties?: string }
	>();
	let m: RegExpExecArray | null;

	while ((m = itemRegex.exec(opfText)) !== null) {
		const tag = m[0];
		const idMatch = /id\s*=\s*["']([^"']+)["']/i.exec(tag);
		const hrefMatch = /href\s*=\s*["']([^"']+)["']/i.exec(tag);
		const propMatch = /properties\s*=\s*["']([^"']+)["']/i.exec(tag);
		const mediaMatch = /media-type\s*=\s*["']([^"']+)["']/i.exec(tag);

		if (idMatch && hrefMatch) {
			const id = idMatch[1];
			const href = hrefMatch[1];
			const resolved = resolveRelativePath(opfPath, href);
			idToInfo.set(id, {
				href,
				resolvedPath: resolved,
				mediaType: mediaMatch ? mediaMatch[1] : '',
				properties: propMatch ? propMatch[1] : ''
			});
		}
	}

	// Determine nav.xhtml path and toc.ncx path
	let navResolvedPath: string | null = null;
	let ncxResolvedPath: string | null = null;

	for (const info of idToInfo.values()) {
		if (info.properties?.includes('nav') || info.resolvedPath.endsWith('nav.xhtml')) {
			navResolvedPath = info.resolvedPath;
		}
		if (info.mediaType === 'application/x-dtbncx+xml' || info.resolvedPath.endsWith('.ncx')) {
			ncxResolvedPath = info.resolvedPath;
		}
	}

	const opfDir = opfPath.includes('/') ? opfPath.substring(0, opfPath.lastIndexOf('/')) : '';
	if (!navResolvedPath) {
		navResolvedPath = opfDir ? `${opfDir}/nav.xhtml` : 'nav.xhtml';
	}
	if (!ncxResolvedPath) {
		ncxResolvedPath = opfDir ? `${opfDir}/toc.ncx` : 'toc.ncx';
	}

	// Parse spine itemrefs
	const spinePaths: string[] = [];
	const itemrefRegex = /<itemref\b[^>]*idref\s*=\s*["']([^"']+)["'][^>]*>/gi;
	while ((m = itemrefRegex.exec(opfText)) !== null) {
		const idref = m[1];
		const info = idToInfo.get(idref);
		if (info && !info.properties?.includes('nav') && !info.resolvedPath.endsWith('nav.xhtml')) {
			spinePaths.push(info.resolvedPath);
		}
	}

	// Extract chapter titles and headings from each page
	const tocChapters: TocChapterInfo[] = [];

	for (let i = 0; i < spinePaths.length; i++) {
		const pagePath = spinePaths[i];
		const html = await getFileText(pagePath);
		if (!html) continue;

		// Extract page title from <title> or first heading
		let pageTitle = '';
		const titleMatch = /<title\b[^>]*>([\s\S]*?)<\/title>/i.exec(html);
		if (titleMatch) {
			pageTitle = titleMatch[1].replace(/<[^>]+>/g, '').trim();
		}

		// Extract headings
		const headingRegex = /<h([12])\b([^>]*)>([\s\S]*?)<\/h\1>/gi;
		const headings: Array<{ id: string; title: string; level: number }> = [];
		let hm: RegExpExecArray | null;
		let hCounter = 0;

		while ((hm = headingRegex.exec(html)) !== null) {
			const level = parseInt(hm[1], 10);
			const attrs = hm[2];
			const inner = hm[3].replace(/<[^>]+>/g, '').trim();
			if (!inner) continue;

			const idMatch = /\bid\s*=\s*["']([^"']+)["']/i.exec(attrs);
			const hId = idMatch ? idMatch[1] : `section-${level}-${++hCounter}`;

			headings.push({
				id: hId,
				title: inner,
				level
			});
		}

		if (headings.length > 0) {
			pageTitle = headings[0].title;
		} else if (!pageTitle) {
			pageTitle = `Trang ${i + 1}`;
		}

		tocChapters.push({
			path: pagePath,
			title: pageTitle,
			headings
		});
	}

	// Build TocTree
	const tocNodes: TocNode[] = [];
	let nodeCounter = 1;

	for (let i = 0; i < tocChapters.length; i++) {
		const ch = tocChapters[i];
		// Calculate relative path from nav.xhtml to chapter
		const navDir = navResolvedPath.includes('/')
			? navResolvedPath.substring(0, navResolvedPath.lastIndexOf('/'))
			: '';
		let relHref = ch.path;
		if (navDir && ch.path.startsWith(navDir + '/')) {
			relHref = ch.path.slice(navDir.length + 1);
		} else if (navDir) {
			const navParts = navDir.split('/');
			const pageParts = ch.path.split('/');
			let common = 0;
			while (
				common < navParts.length &&
				common < pageParts.length &&
				navParts[common] === pageParts[common]
			) {
				common++;
			}
			const up = '../'.repeat(navParts.length - common);
			relHref = up + pageParts.slice(common).join('/');
		}

		if (ch.headings.length <= 1) {
			tocNodes.push({
				id: `num_${nodeCounter++}`,
				title: ch.title,
				href: relHref,
				level: 1,
				children: []
			});
		} else {
			const subHeadings = ch.headings.slice(1);
			const childNodes: TocNode[] = subHeadings.map((h) => ({
				id: `num_${nodeCounter++}`,
				title: h.title,
				href: `${relHref}#${h.id}`,
				level: h.level,
				children: []
			}));

			tocNodes.push({
				id: `num_${nodeCounter++}`,
				title: ch.title,
				href: relHref,
				level: 1,
				children: childNodes
			});
		}
	}

	const tocTree: TocTree = { nodes: tocNodes };
	const navXhtml = buildNavXhtml(meta, tocTree);
	const tocNcx = buildTocNcx(meta, tocTree);

	return {
		navXhtml,
		tocNcx,
		navPath: navResolvedPath,
		ncxPath: ncxResolvedPath
	};
}
