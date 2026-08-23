// src/lib/epub-editor/epub-cleaner.ts
import type JSZip from 'jszip';
import { resolveRelativePath } from './epub-editor';
import { Logger } from '$lib/utils';

interface EpubResourceUsage {
	path: string;
	name: string;
	category: 'image' | 'font' | 'style' | 'page' | 'other';
	byteSize: number;
	isUsed: boolean;
	referencedBy: string[];
}

interface EpubMissingReference {
	sourceFile: string;
	targetRef: string;
}

export interface EpubAnalysisResult {
	totalFiles: number;
	totalBytes: number;
	unusedImages: EpubResourceUsage[];
	unusedFonts: EpubResourceUsage[];
	unusedStyles: EpubResourceUsage[];
	unusedPages: EpubResourceUsage[];
	missingReferences: EpubMissingReference[];
	allResources: EpubResourceUsage[];
	estimatedSavingsBytes: number;
}

export interface EpubCleanOptions {
	removeUnusedImages?: boolean;
	removeUnusedFonts?: boolean;
	removeUnusedStyles?: boolean;
	removeUnusedPages?: boolean;
	cleanOpfManifest?: boolean;
}

export interface EpubCleanReport {
	beforeBytes: number;
	afterBytes: number;
	savedBytes: number;
	removedImages: string[];
	removedFonts: string[];
	removedStyles: string[];
	removedPages: string[];
	removedManifestEntries: string[];
	missingReferences: EpubMissingReference[];
}

/**
 * Format bytes into human-readable string (KB, MB).
 */
export function formatByteSize(bytes: number): string {
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
	return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Helper to extract all url(...) targets from CSS string.
 */
export function extractCssUrls(cssContent: string): string[] {
	const urls: string[] = [];
	const urlRegex = /url\s*\(\s*(['"]?)([^'")]+)\1\s*\)/gi;
	let match: RegExpExecArray | null;

	while ((match = urlRegex.exec(cssContent)) !== null) {
		const rawUrl = match[2].trim();
		if (rawUrl && !/^(data:|blob:|https?:\/\/)/i.test(rawUrl)) {
			urls.push(rawUrl);
		}
	}
	return urls;
}

/**
 * Helper to extract all resource references from HTML string (img, link, svg image, inline styles).
 */
export function extractHtmlReferences(htmlContent: string): {
	images: string[];
	styles: string[];
	fonts: string[];
	links: string[];
} {
	const images: string[] = [];
	const styles: string[] = [];
	const fonts: string[] = [];
	const links: string[] = [];

	// 1. <img src="...">
	const imgRegex = /<img\b[^>]*src\s*=\s*["']([^"']+)["'][^>]*>/gi;
	let m: RegExpExecArray | null;
	while ((m = imgRegex.exec(htmlContent)) !== null) {
		const src = m[1].trim();
		if (src && !/^(data:|blob:|https?:\/\/)/i.test(src)) {
			images.push(src);
		}
	}

	// 2. <image xlink:href="..." or href="..."> inside SVG
	const svgImgRegex = /<image\b[^>]*(?:xlink:href|href)\s*=\s*["']([^"']+)["'][^>]*>/gi;
	while ((m = svgImgRegex.exec(htmlContent)) !== null) {
		const href = m[1].trim();
		if (href && !/^(data:|blob:|https?:\/\/)/i.test(href)) {
			images.push(href);
		}
	}

	// 3. <link rel="stylesheet" href="...">
	const linkRegex = /<link\b[^>]*>/gi;
	while ((m = linkRegex.exec(htmlContent)) !== null) {
		const tag = m[0];
		const relMatch = /rel\s*=\s*["']([^"']*)["']/i.exec(tag);
		if (relMatch && relMatch[1].toLowerCase().includes('stylesheet')) {
			const hrefMatch = /href\s*=\s*["']([^"']+)["']/i.exec(tag);
			if (hrefMatch && hrefMatch[1]) {
				const href = hrefMatch[1].trim();
				if (href && !/^(data:|blob:|https?:\/\/)/i.test(href)) {
					styles.push(href);
				}
			}
		}
	}

	// 4. Inline <style> tags and inline style="..." attributes
	const styleTagRegex = /<style\b[^>]*>([\s\S]*?)<\/style>/gi;
	while ((m = styleTagRegex.exec(htmlContent)) !== null) {
		const inlineUrls = extractCssUrls(m[1]);
		for (const u of inlineUrls) {
			const ext = u.substring(u.lastIndexOf('.')).toLowerCase();
			if (['.ttf', '.otf', '.woff', '.woff2'].includes(ext)) {
				fonts.push(u);
			} else if (['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp'].includes(ext)) {
				images.push(u);
			}
		}
	}

	// 5. <a href="..."> navigation links
	const aRegex = /<a\b[^>]*href\s*=\s*["']([^"']+)["'][^>]*>/gi;
	while ((m = aRegex.exec(htmlContent)) !== null) {
		const href = m[1].trim();
		if (href && !/^(data:|blob:|https?:\/\/|mailto:|tel:|#)/i.test(href)) {
			links.push(href);
		}
	}

	return { images, styles, fonts, links };
}

/**
 * Deeply analyze an EPUB JSZip structure and detect all unused resources and dead links.
 */
export async function analyzeEpub(
	zip: JSZip,
	editBuffer?: Map<string, string>
): Promise<EpubAnalysisResult> {
	const allResources: EpubResourceUsage[] = [];
	const missingReferences: EpubMissingReference[] = [];
	const filePaths = Object.keys(zip.files).filter((p) => !zip.files[p].dir);

	let totalBytes = 0;
	const resourceMap = new Map<string, EpubResourceUsage>();

	for (const path of filePaths) {
		const file = zip.files[path];
		const byteSize = file ? (await file.async('uint8array')).byteLength : 0;
		totalBytes += byteSize;

		let specificCategory: 'image' | 'font' | 'style' | 'page' | 'other' = 'other';

		const cleanExt = path.substring(path.lastIndexOf('.')).toLowerCase();
		if (['.xhtml', '.html', '.htm'].includes(cleanExt)) {
			specificCategory = 'page';
		} else if (cleanExt === '.css') {
			specificCategory = 'style';
		} else if (['.ttf', '.otf', '.woff', '.woff2'].includes(cleanExt)) {
			specificCategory = 'font';
		} else if (['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp'].includes(cleanExt)) {
			specificCategory = 'image';
		}

		const item: EpubResourceUsage = {
			path,
			name: path.split('/').pop() || path,
			category: specificCategory,
			byteSize,
			isUsed: false,
			referencedBy: []
		};

		resourceMap.set(path, item);
		allResources.push(item);
	}

	// Helper to get text content from editBuffer if dirty, or zip file
	async function getText(path: string): Promise<string> {
		if (editBuffer && editBuffer.has(path)) {
			return editBuffer.get(path) || '';
		}
		const f = zip.file(path);
		return f ? await f.async('text') : '';
	}

	// 1. Check OPF file to register Cover image, Spine order, and Guide references
	const opfPath = filePaths.find((p) => p.toLowerCase().endsWith('.opf'));
	if (opfPath) {
		const opfText = await getText(opfPath);
		const opfItem = resourceMap.get(opfPath);
		if (opfItem) opfItem.isUsed = true;

		// Mark cover image as used if declared in OPF properties or manifest
		const coverRegex = /<item\b[^>]*(?:properties\s*=\s*["'][^"']*cover-image[^"']*["']|id\s*=\s*["'][^"']*cover[^"']*["'])[^>]*href\s*=\s*["']([^"']+)["'][^>]*>/gi;
		let cm: RegExpExecArray | null;
		while ((cm = coverRegex.exec(opfText)) !== null) {
			const coverRel = cm[1];
			const resolved = resolveRelativePath(opfPath, coverRel);
			const target = resourceMap.get(resolved);
			if (target) {
				target.isUsed = true;
				target.referencedBy.push(opfPath);
			}
		}
	}

	// Always mark container.xml, mimetype, NCX/Nav as used
	for (const path of filePaths) {
		const lower = path.toLowerCase();
		if (
			lower === 'mimetype' ||
			lower.endsWith('container.xml') ||
			lower.endsWith('.ncx') ||
			lower.endsWith('nav.xhtml')
		) {
			const item = resourceMap.get(path);
			if (item) item.isUsed = true;
		}
	}

	// 2. Scan all CSS files for fonts and images
	const cssFiles = allResources.filter((r) => r.category === 'style');
	const cssUrlMap = new Map<string, string[]>(); // cssPath -> resolved target paths

	for (const cssItem of cssFiles) {
		const cssText = await getText(cssItem.path);
		const rawUrls = extractCssUrls(cssText);
		const resolvedTargets: string[] = [];

		for (const rawUrl of rawUrls) {
			const resolved = resolveRelativePath(cssItem.path, rawUrl);
			resolvedTargets.push(resolved);

			const target = resourceMap.get(resolved);
			if (target) {
				target.referencedBy.push(cssItem.path);
			} else {
				missingReferences.push({
					sourceFile: cssItem.path,
					targetRef: rawUrl
				});
			}
		}
		cssUrlMap.set(cssItem.path, resolvedTargets);
	}

	// 3. Scan all HTML/XHTML pages
	const pageFiles = allResources.filter((r) => r.category === 'page');
	for (const pageItem of pageFiles) {
		// All XHTML pages are considered used by default (part of book reading structure)
		pageItem.isUsed = true;

		const htmlText = await getText(pageItem.path);
		const refs = extractHtmlReferences(htmlText);

		// Link styles
		for (const s of refs.styles) {
			const resolved = resolveRelativePath(pageItem.path, s);
			const target = resourceMap.get(resolved);
			if (target) {
				target.isUsed = true;
				target.referencedBy.push(pageItem.path);

				// Cascading: Mark resources referenced by this used CSS file as used too!
				const subTargets = cssUrlMap.get(resolved) || [];
				for (const stPath of subTargets) {
					const subTarget = resourceMap.get(stPath);
					if (subTarget) {
						subTarget.isUsed = true;
						if (!subTarget.referencedBy.includes(pageItem.path)) {
							subTarget.referencedBy.push(pageItem.path);
						}
					}
				}
			} else {
				missingReferences.push({
					sourceFile: pageItem.path,
					targetRef: s
				});
			}
		}

		// Images
		for (const img of refs.images) {
			const resolved = resolveRelativePath(pageItem.path, img);
			const target = resourceMap.get(resolved);
			if (target) {
				target.isUsed = true;
				target.referencedBy.push(pageItem.path);
			} else {
				missingReferences.push({
					sourceFile: pageItem.path,
					targetRef: img
				});
			}
		}

		// Fonts from inline styles
		for (const font of refs.fonts) {
			const resolved = resolveRelativePath(pageItem.path, font);
			const target = resourceMap.get(resolved);
			if (target) {
				target.isUsed = true;
				target.referencedBy.push(pageItem.path);
			} else {
				missingReferences.push({
					sourceFile: pageItem.path,
					targetRef: font
				});
			}
		}
	}

	// Separate unused items
	const unusedImages = allResources.filter((r) => r.category === 'image' && !r.isUsed);
	const unusedFonts = allResources.filter((r) => r.category === 'font' && !r.isUsed);
	const unusedStyles = allResources.filter((r) => r.category === 'style' && !r.isUsed);
	const unusedPages = allResources.filter((r) => r.category === 'page' && !r.isUsed);

	const estimatedSavingsBytes =
		unusedImages.reduce((sum, r) => sum + r.byteSize, 0) +
		unusedFonts.reduce((sum, r) => sum + r.byteSize, 0) +
		unusedStyles.reduce((sum, r) => sum + r.byteSize, 0);

	return {
		totalFiles: allResources.length,
		totalBytes,
		unusedImages,
		unusedFonts,
		unusedStyles,
		unusedPages,
		missingReferences,
		allResources,
		estimatedSavingsBytes
	};
}

/**
 * Remove orphaned resources and cleanly update OPF manifest.
 */
export async function cleanEpub(
	zip: JSZip,
	options: EpubCleanOptions = {},
	editBuffer?: Map<string, string>
): Promise<EpubCleanReport> {
	const analysis = await analyzeEpub(zip, editBuffer);
	const beforeBytes = analysis.totalBytes;

	const toRemove = new Set<string>();
	const removedImages: string[] = [];
	const removedFonts: string[] = [];
	const removedStyles: string[] = [];
	const removedPages: string[] = [];

	if (options.removeUnusedImages !== false) {
		for (const img of analysis.unusedImages) {
			toRemove.add(img.path);
			removedImages.push(img.path);
		}
	}

	if (options.removeUnusedFonts !== false) {
		for (const font of analysis.unusedFonts) {
			toRemove.add(font.path);
			removedFonts.push(font.path);
		}
	}

	if (options.removeUnusedStyles !== false) {
		for (const style of analysis.unusedStyles) {
			toRemove.add(style.path);
			removedStyles.push(style.path);
		}
	}

	if (options.removeUnusedPages) {
		for (const page of analysis.unusedPages) {
			toRemove.add(page.path);
			removedPages.push(page.path);
		}
	}

	// 1. Delete files from JSZip and editBuffer
	for (const path of toRemove) {
		zip.remove(path);
		if (editBuffer) {
			editBuffer.delete(path);
		}
	}

	const removedManifestEntries: string[] = [];

	// 2. Clean OPF manifest if enabled
	if (options.cleanOpfManifest !== false) {
		const opfPath = Object.keys(zip.files).find((p) => p.toLowerCase().endsWith('.opf'));
		if (opfPath) {
			let opfContent = editBuffer && editBuffer.has(opfPath)
				? editBuffer.get(opfPath)!
				: (await zip.file(opfPath)?.async('text')) || '';

			if (opfContent) {
				// Remove <item ...> corresponding to deleted files
				const itemRegex = /<item\b[^>]*>/gi;
				let m: RegExpExecArray | null;
				const tagsToRemove: string[] = [];

				while ((m = itemRegex.exec(opfContent)) !== null) {
					const tag = m[0];
					const hrefMatch = /href\s*=\s*["']([^"']+)["']/i.exec(tag);
					if (hrefMatch && hrefMatch[1]) {
						const resolved = resolveRelativePath(opfPath, hrefMatch[1]);
						if (toRemove.has(resolved)) {
							tagsToRemove.push(tag);
							removedManifestEntries.push(resolved);
						}
					}
				}

				for (const tag of tagsToRemove) {
					opfContent = opfContent.replace(tag, '');
				}

				// Update OPF in zip and editBuffer
				zip.file(opfPath, opfContent);
				if (editBuffer) {
					editBuffer.set(opfPath, opfContent);
				}
			}
		}
	}

	// Calculate size after cleaning
	let afterBytes = 0;
	for (const path of Object.keys(zip.files)) {
		if (!zip.files[path].dir) {
			const bytes = await zip.files[path].async('uint8array');
			afterBytes += bytes.byteLength;
		}
	}

	const savedBytes = Math.max(0, beforeBytes - afterBytes);

	Logger.info(
		'[EpubCleaner]',
		`Cleaned ${toRemove.size} files (${formatByteSize(savedBytes)} saved). Remaining: ${formatByteSize(afterBytes)}`
	);

	return {
		beforeBytes,
		afterBytes,
		savedBytes,
		removedImages,
		removedFonts,
		removedStyles,
		removedPages,
		removedManifestEntries,
		missingReferences: analysis.missingReferences
	};
}
