// src/lib/epub-editor/cleaner/cleaner-engine.ts
import type JSZip from 'jszip';
import { resolveRelativePath } from '$lib/utils';
import type {
	EpubOptimizationPlan,
	EpubAnalysisResult,
	EpubCleanOptions,
	EpubCleanReport,
	EpubResourceUsage,
	EpubMissingReference
} from './types';
import { extractCssUrls, extractHtmlReferences } from './reference-extractor';
import { scanDuplicateResources } from './duplicate-detector';

/**
 * Deeply analyze an EPUB JSZip structure and create an actionable Optimization Plan.
 */
export async function analyzeOptimizationPlan(
	zip: JSZip,
	editBuffer?: Map<string, string>
): Promise<EpubOptimizationPlan> {
	const allResources: EpubResourceUsage[] = [];
	const missingReferences: EpubMissingReference[] = [];
	const filePaths = Object.keys(zip.files).filter((p) => !zip.files[p].dir);

	let totalBytes = 0;
	const resourceMap = new Map<string, EpubResourceUsage>();

	for (const path of filePaths) {
		const file = zip.files[path];
		let byteSize = 0;
		if (file) {
			const rawData = (file as unknown as { _data?: { uncompressedSize?: number } })._data;
			if (typeof rawData?.uncompressedSize === 'number') {
				byteSize = rawData.uncompressedSize;
			} else {
				const bytes = await file.async('uint8array');
				byteSize = bytes.byteLength;
			}
		}
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
		const coverRegex =
			/<item\b[^>]*(?:properties\s*=\s*["'][^"']*cover-image[^"']*["']|id\s*=\s*["'][^"']*cover[^"']*["'])[^>]*href\s*=\s*["']([^"']+)["'][^>]*>/gi;
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
	const cssUrlMap = new Map<string, string[]>();

	for (const cssItem of cssFiles) {
		const cssText = await getText(cssItem.path);
		const rawUrls = extractCssUrls(cssText);
		const resolvedTargets: string[] = [];

		for (const rawUrl of rawUrls) {
			const resolved = resolveRelativePath(cssItem.path, rawUrl);
			resolvedTargets.push(resolved);

			const target = resourceMap.get(resolved);
			if (target) {
				target.isUsed = true;
				target.referencedBy.push(cssItem.path);
			} else {
				missingReferences.push({ sourceFile: cssItem.path, targetRef: rawUrl });
			}
		}
		cssUrlMap.set(cssItem.path, resolvedTargets);
	}

	// 3. Scan all HTML/XHTML reading pages
	const pageFiles = allResources.filter((r) => r.category === 'page');

	for (const pageItem of pageFiles) {
		pageItem.isUsed = true;
		const htmlText = await getText(pageItem.path);
		const refs = extractHtmlReferences(htmlText);

		// Verify images
		for (const imgUrl of refs.images) {
			const resolved = resolveRelativePath(pageItem.path, imgUrl);
			const target = resourceMap.get(resolved);
			if (target) {
				target.isUsed = true;
				target.referencedBy.push(pageItem.path);
			} else {
				missingReferences.push({ sourceFile: pageItem.path, targetRef: imgUrl });
			}
		}

		// Verify stylesheets
		for (const styleUrl of refs.styles) {
			const resolved = resolveRelativePath(pageItem.path, styleUrl);
			const target = resourceMap.get(resolved);
			if (target) {
				target.isUsed = true;
				target.referencedBy.push(pageItem.path);

				// Cascading fonts/images referenced inside this active stylesheet
				const activeCssTargets = cssUrlMap.get(resolved) || [];
				for (const cssSubTarget of activeCssTargets) {
					const subItem = resourceMap.get(cssSubTarget);
					if (subItem) {
						subItem.isUsed = true;
						if (!subItem.referencedBy.includes(resolved)) {
							subItem.referencedBy.push(resolved);
						}
					}
				}
			} else {
				missingReferences.push({ sourceFile: pageItem.path, targetRef: styleUrl });
			}
		}

		// Inline fonts
		for (const fontUrl of refs.fonts) {
			const resolved = resolveRelativePath(pageItem.path, fontUrl);
			const target = resourceMap.get(resolved);
			if (target) {
				target.isUsed = true;
				target.referencedBy.push(pageItem.path);
			}
		}
	}

	// Check duplicates
	const duplicateResources = await scanDuplicateResources(zip, editBuffer);

	const unusedImages = allResources.filter((r) => r.category === 'image' && !r.isUsed);
	const unusedFonts = allResources.filter((r) => r.category === 'font' && !r.isUsed);
	const unusedStyles = allResources.filter((r) => r.category === 'style' && !r.isUsed);
	const unusedPages = allResources.filter((r) => r.category === 'page' && !r.isUsed);

	const savingsBreakdown = {
		unusedImages: unusedImages.reduce((sum, r) => sum + r.byteSize, 0),
		unusedFonts: unusedFonts.reduce((sum, r) => sum + r.byteSize, 0),
		unusedStyles: unusedStyles.reduce((sum, r) => sum + r.byteSize, 0),
		unusedPages: unusedPages.reduce((sum, r) => sum + r.byteSize, 0),
		duplicateResources: duplicateResources.reduce((sum, d) => sum + d.byteSize, 0)
	};

	const estimatedSavingsBytes =
		savingsBreakdown.unusedImages +
		savingsBreakdown.unusedFonts +
		savingsBreakdown.unusedStyles +
		savingsBreakdown.unusedPages +
		savingsBreakdown.duplicateResources;

	return {
		totalFiles: filePaths.length,
		totalBytes,
		estimatedSavingsBytes,
		savingsBreakdown,
		unusedImages,
		unusedFonts,
		unusedStyles,
		unusedPages,
		duplicateResources,
		missingReferences,
		allResources
	};
}

/**
 * Analyze EPUB resources returning EpubAnalysisResult.
 */
export async function analyzeEpub(
	zip: JSZip,
	editBuffer?: Map<string, string>
): Promise<EpubAnalysisResult> {
	const plan = await analyzeOptimizationPlan(zip, editBuffer);
	return {
		totalFiles: plan.totalFiles,
		totalBytes: plan.totalBytes,
		unusedImages: plan.unusedImages,
		unusedFonts: plan.unusedFonts,
		unusedStyles: plan.unusedStyles,
		unusedPages: plan.unusedPages,
		missingReferences: plan.missingReferences,
		allResources: plan.allResources,
		estimatedSavingsBytes: plan.estimatedSavingsBytes
	};
}

/**
 * Execute deep EPUB optimization: removes dead resources, deduplicates redundant assets,
 * rewrites references across HTML/CSS, and updates OPF package manifest.
 */
export async function cleanEpub(
	zip: JSZip,
	options: EpubCleanOptions = {
		removeUnusedImages: true,
		removeUnusedFonts: true,
		removeUnusedStyles: true,
		cleanOpfManifest: true,
		deduplicateResources: true
	},
	editBuffer?: Map<string, string>
): Promise<EpubCleanReport> {
	const plan = await analyzeOptimizationPlan(zip, editBuffer);

	const removedImages: string[] = [];
	const removedFonts: string[] = [];
	const removedStyles: string[] = [];
	const removedPages: string[] = [];
	const removedManifestEntries: string[] = [];
	const deduplicatedResources: string[] = [];

	const beforeBytes = plan.totalBytes;
	const filesToDelete = new Set<string>();

	if (options.removeUnusedImages) {
		for (const img of plan.unusedImages) {
			filesToDelete.add(img.path);
			removedImages.push(img.path);
		}
	}
	if (options.removeUnusedFonts) {
		for (const font of plan.unusedFonts) {
			filesToDelete.add(font.path);
			removedFonts.push(font.path);
		}
	}
	if (options.removeUnusedStyles) {
		for (const style of plan.unusedStyles) {
			filesToDelete.add(style.path);
			removedStyles.push(style.path);
		}
	}
	if (options.removeUnusedPages) {
		for (const page of plan.unusedPages) {
			filesToDelete.add(page.path);
			removedPages.push(page.path);
		}
	}

	// 1. Handle Duplicate Resources Replacement
	if (options.deduplicateResources && plan.duplicateResources.length > 0) {
		const replacementMap = new Map<string, string>(); // duplicatePath -> originalPath
		for (const dup of plan.duplicateResources) {
			if (!filesToDelete.has(dup.originalPath)) {
				replacementMap.set(dup.duplicatePath, dup.originalPath);
				filesToDelete.add(dup.duplicatePath);
				deduplicatedResources.push(dup.duplicatePath);
			}
		}

		if (replacementMap.size > 0) {
			const textFiles = Object.keys(zip.files).filter((p) => {
				const ext = p.substring(p.lastIndexOf('.')).toLowerCase();
				return ['.xhtml', '.html', '.htm', '.css', '.opf', '.ncx'].includes(ext);
			});

			for (const tf of textFiles) {
				let content = editBuffer?.has(tf) ? editBuffer.get(tf)! : await zip.file(tf)!.async('text');
				let modified = false;

				for (const [dupPath, origPath] of replacementMap.entries()) {
					const dupName = dupPath.split('/').pop()!;
					const origName = origPath.split('/').pop()!;

					if (content.includes(dupName)) {
						content = content.replaceAll(dupName, origName);
						modified = true;
					}
				}

				if (modified) {
					if (editBuffer) {
						editBuffer.set(tf, content);
					} else {
						zip.file(tf, content);
					}
				}
			}
		}
	}

	// 2. Perform deletion in JSZip and editBuffer
	for (const path of filesToDelete) {
		zip.remove(path);
		if (editBuffer && editBuffer.has(path)) {
			editBuffer.delete(path);
		}
	}

	// 3. Clean up OPF package manifest if requested
	if (options.cleanOpfManifest && filesToDelete.size > 0) {
		const filePaths = Object.keys(zip.files).filter((p) => !zip.files[p].dir);
		const opfPath = filePaths.find((p) => p.toLowerCase().endsWith('.opf'));

		if (opfPath) {
			let opfText = editBuffer?.has(opfPath)
				? editBuffer.get(opfPath)!
				: await zip.file(opfPath)!.async('text');

			const deletedResolvedPaths = new Set(filesToDelete);

			opfText = opfText.replace(
				/<item\b[^>]*href\s*=\s*["']([^"']+)["'][^>]*\/?>/gi,
				(match, rawHref) => {
					const resolved = resolveRelativePath(opfPath, rawHref);
					if (deletedResolvedPaths.has(resolved)) {
						removedManifestEntries.push(rawHref);
						return '';
					}
					return match;
				}
			);

			if (editBuffer) {
				editBuffer.set(opfPath, opfText);
			} else {
				zip.file(opfPath, opfText);
			}
		}
	}

	// Calculate final bytes
	let afterBytes = 0;
	for (const p of Object.keys(zip.files).filter((p) => !zip.files[p].dir)) {
		const file = zip.files[p];
		if (file) {
			const bytes = await file.async('uint8array');
			afterBytes += bytes.byteLength;
		}
	}

	const savedBytes = Math.max(0, beforeBytes - afterBytes);

	return {
		beforeBytes,
		afterBytes,
		savedBytes,
		removedImages,
		removedFonts,
		removedStyles,
		removedPages,
		removedManifestEntries,
		deduplicatedResources,
		missingReferences: plan.missingReferences
	};
}

/**
 * Backward-compatible wrapper for cleanEpub.
 */
export async function optimizeEpub(
	zip: JSZip,
	options?: EpubCleanOptions,
	editBuffer?: Map<string, string>
): Promise<EpubCleanReport> {
	return cleanEpub(zip, options, editBuffer);
}
