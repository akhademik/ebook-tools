// src/lib/epub/parser/epub-parser.ts
import JSZip from 'jszip';
import type {
	EpubBook,
	EpubContainer,
	EpubPackage,
	EpubBookMetadata,
	EpubManifest,
	EpubManifestItem,
	EpubSpine,
	EpubSpineItem,
	EpubNavigation,
	EpubNavPoint,
	EpubResources,
	EpubResourceCategory,
	EpubResource
} from '../types';
import { resolveRelativePath } from '../../epub-editor/epub-editor';

/**
 * Locate container OPF full-path from META-INF/container.xml or fallback to first *.opf
 */
async function findOpfPath(zip: JSZip): Promise<string | null> {
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
 * Parse OPF manifest and spine elements.
 */
function parseOpfManifestAndSpine(
	opfXml: string,
	opfPath: string
): {
	manifest: EpubManifest;
	spine: EpubSpine;
	packageInfo: { version: string; uniqueIdentifierId?: string };
} {
	const manifestItems = new Map<string, EpubManifestItem>();
	const manifestByPath = new Map<string, EpubManifestItem>();

	// Package attributes
	const pkgMatch = /<package\b([^>]*)>/i.exec(opfXml);
	const pkgAttrs = pkgMatch ? pkgMatch[1] : '';
	const verMatch = /version\s*=\s*["']([^"']+)["']/i.exec(pkgAttrs);
	const uidMatch = /unique-identifier\s*=\s*["']([^"']+)["']/i.exec(pkgAttrs);

	const version = verMatch ? verMatch[1] : '2.0';
	const uniqueIdentifierId = uidMatch ? uidMatch[1] : undefined;

	// Extract <item> tags
	const itemRegex = /<item\b([^>]*)\/?>/gi;
	let match: RegExpExecArray | null;

	while ((match = itemRegex.exec(opfXml)) !== null) {
		const attrs = match[1];
		const idMatch = /id\s*=\s*["']([^"']+)["']/i.exec(attrs);
		const hrefMatch = /href\s*=\s*["']([^"']+)["']/i.exec(attrs);
		const mtMatch = /media-type\s*=\s*["']([^"']+)["']/i.exec(attrs);
		const propMatch = /properties\s*=\s*["']([^"']+)["']/i.exec(attrs);
		const fallbackMatch = /fallback\s*=\s*["']([^"']+)["']/i.exec(attrs);
		const overlayMatch = /media-overlay\s*=\s*["']([^"']+)["']/i.exec(attrs);

		if (idMatch && hrefMatch) {
			const id = idMatch[1];
			const href = hrefMatch[1];
			const resolvedPath = resolveRelativePath(opfPath, href);
			const item: EpubManifestItem = {
				id,
				href,
				mediaType: mtMatch ? mtMatch[1] : 'application/octet-stream',
				resolvedPath,
				properties: propMatch ? propMatch[1] : undefined,
				fallback: fallbackMatch ? fallbackMatch[1] : undefined,
				mediaOverlay: overlayMatch ? overlayMatch[1] : undefined
			};
			manifestItems.set(id, item);
			manifestByPath.set(resolvedPath, item);
		}
	}

	// Extract <spine> tags
	const spineItems: EpubSpineItem[] = [];
	const spineMatch = /<spine\b([^>]*)>([\s\S]*?)<\/spine>/i.exec(opfXml);
	let tocId: string | undefined;
	let pageProgressionDirection: 'ltr' | 'rtl' | 'default' = 'default';

	if (spineMatch) {
		const spineAttrs = spineMatch[1];
		const tocAttr = /toc\s*=\s*["']([^"']+)["']/i.exec(spineAttrs);
		if (tocAttr) tocId = tocAttr[1];

		const ppdAttr = /page-progression-direction\s*=\s*["']([^"']+)["']/i.exec(spineAttrs);
		if (ppdAttr && ['ltr', 'rtl', 'default'].includes(ppdAttr[1])) {
			pageProgressionDirection = ppdAttr[1] as 'ltr' | 'rtl' | 'default';
		}

		const spineContent = spineMatch[2];
		const itemrefRegex = /<itemref\b([^>]*)\/?>/gi;
		let refMatch: RegExpExecArray | null;

		while ((refMatch = itemrefRegex.exec(spineContent)) !== null) {
			const attrs = refMatch[1];
			const idrefMatch = /idref\s*=\s*["']([^"']+)["']/i.exec(attrs);
			const linearMatch = /linear\s*=\s*["']([^"']+)["']/i.exec(attrs);
			const propMatch = /properties\s*=\s*["']([^"']+)["']/i.exec(attrs);

			if (idrefMatch) {
				const idref = idrefMatch[1];
				const manifestItem = manifestItems.get(idref);
				const resolvedPath = manifestItem ? manifestItem.resolvedPath : idref;
				spineItems.push({
					idref,
					resolvedPath,
					linear: linearMatch ? linearMatch[1].toLowerCase() !== 'no' : true,
					properties: propMatch ? propMatch[1] : undefined
				});
			}
		}
	}

	return {
		manifest: {
			items: manifestItems,
			byPath: manifestByPath
		},
		spine: {
			toc: tocId,
			pageProgressionDirection,
			items: spineItems
		},
		packageInfo: {
			version,
			uniqueIdentifierId
		}
	};
}

/**
 * Categorize a file by its extension.
 */
function categorizeResource(path: string): EpubResourceCategory {
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
	if (['.ttf', '.otf', '.woff', '.woff2'].includes(ext)) {
		return 'font';
	}
	return 'other';
}

/**
 * Extract book metadata from OPF content.
 */
function extractEpubMetadata(opfXml: string, manifest?: EpubManifest): EpubBookMetadata {
	const getTagValue = (tagName: string): string => {
		const regex = new RegExp(`<(?:dc:)?${tagName}\\b[^>]*>([\\s\\S]*?)<\\/(?:dc:)?${tagName}>`, 'i');
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

	// Extract unique-identifier value
	let identifier = '';
	const pkgMatch = /<package\b[^>]*unique-identifier\s*=\s*["']([^"']+)["']/i.exec(opfXml);
	if (pkgMatch) {
		const idAttr = pkgMatch[1];
		const idRegex = new RegExp(`<(?:dc:)?identifier\\b[^>]*id\\s*=\\s*["']${idAttr}["'][^>]*>([\\s\\S]*?)<\\/(?:dc:)?identifier>`, 'i');
		const m = idRegex.exec(opfXml);
		if (m) {
			identifier = m[1].replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1').trim();
		}
	}
	if (!identifier) {
		identifier = getTagValue('identifier');
	}

	// Cover detection
	let coverImageId: string | undefined;
	let coverImagePath: string | undefined;

	const metaCoverMatch = /<meta\b[^>]*name\s*=\s*["']cover["'][^>]*content\s*=\s*["']([^"']+)["']/i.exec(opfXml);
	if (metaCoverMatch) {
		coverImageId = metaCoverMatch[1];
	}

	if (!coverImageId && manifest) {
		for (const [id, item] of manifest.items.entries()) {
			if (item.properties && item.properties.includes('cover-image')) {
				coverImageId = id;
				break;
			}
		}
	}

	if (coverImageId && manifest) {
		const item = manifest.items.get(coverImageId);
		if (item) {
			coverImagePath = item.resolvedPath;
		}
	}

	return {
		title,
		author,
		language,
		identifier,
		publisher,
		description,
		rights,
		pubDate,
		coverImageId,
		coverImagePath
	};
}

/**
 * Main parser entry point: load an EPUB zip into a single, unified EpubBook domain model.
 */
export async function parseEpub(zipInput: JSZip | Blob | File | ArrayBuffer): Promise<EpubBook> {
	let zip: JSZip;
	if (zipInput instanceof JSZip) {
		zip = zipInput;
	} else if (zipInput instanceof Blob || zipInput instanceof File) {
		const buf = await zipInput.arrayBuffer();
		zip = await JSZip.loadAsync(buf);
	} else {
		zip = await JSZip.loadAsync(zipInput);
	}

	// 1. Container & OPF location
	const opfPath = await findOpfPath(zip);
	if (!opfPath) {
		throw new Error('Không tìm thấy tệp OPF trong EPUB (thiếu META-INF/container.xml hoặc *.opf).');
	}

	const container: EpubContainer = {
		rootfileFullPath: opfPath
	};

	// 2. Read and parse OPF content
	const opfFile = zip.file(opfPath);
	if (!opfFile) {
		throw new Error(`Tệp OPF được khai báo "${opfPath}" không tồn tại trong file zip.`);
	}
	const opfText = await opfFile.async('text');

	const { manifest, spine, packageInfo } = parseOpfManifestAndSpine(opfText, opfPath);
	const metadata = extractEpubMetadata(opfText, manifest);

	// 3. Scan resources
	const resourceAll = new Map<string, EpubResource>();
	const pages: string[] = [];
	const styles: string[] = [];
	const images: string[] = [];
	const fonts: string[] = [];
	const others: string[] = [];

	for (const path of Object.keys(zip.files)) {
		const entry = zip.files[path];
		if (entry.dir) continue;

		const name = path.split('/').pop() || path;
		const category = categorizeResource(path);
		const manifestItem = manifest.byPath.get(path);
		const byteSize = (await entry.async('uint8array')).byteLength;

		const res: EpubResource = {
			path,
			name,
			category,
			byteSize,
			mediaType: manifestItem?.mediaType
		};

		resourceAll.set(path, res);

		switch (category) {
			case 'page':
				pages.push(path);
				break;
			case 'style':
				styles.push(path);
				break;
			case 'image':
				images.push(path);
				break;
			case 'font':
				fonts.push(path);
				break;
			case 'other':
				others.push(path);
				break;
		}
	}

	const resources: EpubResources = {
		all: resourceAll,
		pages,
		styles,
		images,
		fonts,
		others
	};

	// 4. Navigation (TOC / NCX)
	let navType: 'nav' | 'ncx' | 'both' | 'none' = 'none';
	let tocPath: string | undefined;
	const toc: EpubNavPoint[] = [];

	let hasNav = false;
	let hasNcx = false;

	for (const item of manifest.items.values()) {
		if (item.properties && item.properties.includes('nav')) {
			hasNav = true;
			tocPath = item.resolvedPath;
		}
		if (item.mediaType === 'application/x-dtbncx+xml' || item.href.endsWith('.ncx')) {
			hasNcx = true;
			if (!tocPath) tocPath = item.resolvedPath;
		}
	}

	if (hasNav && hasNcx) navType = 'both';
	else if (hasNav) navType = 'nav';
	else if (hasNcx) navType = 'ncx';

	const navigation: EpubNavigation = {
		tocPath,
		navType,
		toc
	};

	const packageModel: EpubPackage = {
		opfPath,
		version: packageInfo.version,
		uniqueIdentifierId: packageInfo.uniqueIdentifierId,
		uniqueIdentifierValue: metadata.identifier
	};

	return {
		zip,
		container,
		package: packageModel,
		metadata,
		manifest,
		spine,
		navigation,
		resources
	};
}
