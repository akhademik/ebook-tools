// src/lib/epub-editor/cleaner/reference-extractor.ts

/**
 * Format bytes into human-readable string (KB, MB).
 */
export function formatByteSize(bytes: number): string {
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
	return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Helper to extract all url(...) targets and @import targets from CSS string.
 */
export function extractCssUrls(cssContent: string): string[] {
	const urls: string[] = [];

	// 1. url(...)
	const urlRegex = /url\s*\(\s*(['"]?)([^'")]+)\1\s*\)/gi;
	let match: RegExpExecArray | null;

	while ((match = urlRegex.exec(cssContent)) !== null) {
		const rawUrl = match[2].trim();
		if (rawUrl && !/^(data:|blob:|https?:\/\/)/i.test(rawUrl)) {
			urls.push(rawUrl);
		}
	}

	// 2. @import "file.css" or @import 'file.css'
	const importRegex = /@import\s+['"]([^'"]+)['"]/gi;
	while ((match = importRegex.exec(cssContent)) !== null) {
		const rawUrl = match[1].trim();
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

	// 4. Inline <style> tags
	const styleTagRegex = /<style\b[^>]*>([\s\S]*?)<\/style>/gi;
	while ((m = styleTagRegex.exec(htmlContent)) !== null) {
		const inlineUrls = extractCssUrls(m[1]);
		for (const u of inlineUrls) {
			const ext = u.substring(u.lastIndexOf('.')).toLowerCase();
			if (['.ttf', '.otf', '.woff', '.woff2'].includes(ext)) {
				fonts.push(u);
			} else if (['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp'].includes(ext)) {
				images.push(u);
			} else if (ext === '.css') {
				styles.push(u);
			}
		}
	}

	// 5. Inline style="..." attributes on arbitrary HTML tags (e.g. style="background: url(...)")
	const inlineStyleAttrRegex = /\bstyle\s*=\s*(?:"([^"]*)"|'([^']*)')/gi;
	while ((m = inlineStyleAttrRegex.exec(htmlContent)) !== null) {
		const rawStyleContent = m[1] ?? m[2] ?? '';
		const styleContent = rawStyleContent
			.replace(/&quot;/g, '"')
			.replace(/&apos;/g, "'")
			.replace(/&#34;/g, '"')
			.replace(/&#39;/g, "'")
			.replace(/&#x22;/gi, '"')
			.replace(/&#x27;/gi, "'");
		const inlineUrls = extractCssUrls(styleContent);
		for (const u of inlineUrls) {
			const ext = u.substring(u.lastIndexOf('.')).toLowerCase();
			if (['.ttf', '.otf', '.woff', '.woff2'].includes(ext)) {
				fonts.push(u);
			} else if (['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp'].includes(ext)) {
				images.push(u);
			} else if (ext === '.css') {
				styles.push(u);
			}
		}
	}

	// 6. srcset="..." attributes on <img> or <source>
	const srcsetRegex = /\bsrcset\s*=\s*["']([^"']+)["']/gi;
	while ((m = srcsetRegex.exec(htmlContent)) !== null) {
		const candidateList = m[1].split(',');
		for (const candidate of candidateList) {
			const candidateUrl = candidate.trim().split(/\s+/)[0];
			if (candidateUrl && !/^(data:|blob:|https?:\/\/)/i.test(candidateUrl)) {
				images.push(candidateUrl);
			}
		}
	}

	// 7. <a href="..."> navigation links
	const aRegex = /<a\b[^>]*href\s*=\s*["']([^"']+)["'][^>]*>/gi;
	while ((m = aRegex.exec(htmlContent)) !== null) {
		const href = m[1].trim();
		if (href && !/^(data:|blob:|https?:\/\/|mailto:|tel:|#)/i.test(href)) {
			links.push(href);
		}
	}

	return { images, styles, fonts, links };
}
