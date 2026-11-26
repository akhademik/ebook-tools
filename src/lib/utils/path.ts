// src/lib/utils/path.ts

/**
 * Resolve a relative path against a base file path inside the EPUB.
 * Example: base = 'OEBPS/Text/ch1.xhtml', rel = '../Styles/main.css' -> 'OEBPS/Styles/main.css'
 */
export function resolveRelativePath(baseFilePath: string, relativePath: string): string {
	// Strip any query or hash from the relative path
	let cleanRel = relativePath.split('?')[0].split('#')[0].trim();
	if (!cleanRel) return baseFilePath;

	try {
		cleanRel = decodeURIComponent(cleanRel);
	} catch {
		// Ignore decode error for malformed URI sequences
	}

	// If absolute-like (starts with /), treat from root
	if (cleanRel.startsWith('/')) {
		return cleanRel.replace(/^\/+/, '');
	}

	const baseParts = baseFilePath.split('/');
	// Remove the file name to get base directory
	baseParts.pop();

	const relParts = cleanRel.split('/');

	for (const part of relParts) {
		if (part === '.' || part === '') {
			continue;
		} else if (part === '..') {
			if (baseParts.length > 0) {
				baseParts.pop();
			}
		} else {
			baseParts.push(part);
		}
	}

	return baseParts.join('/');
}

/**
 * Compute the relative path from one file path to another inside the EPUB.
 * Example: from = 'OEBPS/Text/ch1.xhtml', to = 'OEBPS/Images/cover.jpg' -> '../Images/cover.jpg'
 */
export function getRelativePath(fromFilePath: string, toFilePath: string): string {
	const fromParts = fromFilePath.split('/');
	fromParts.pop(); // Remove file name to get source directory

	const toParts = toFilePath.split('/');
	const targetFileName = toParts.pop() || '';

	let common = 0;
	while (
		common < fromParts.length &&
		common < toParts.length &&
		fromParts[common] === toParts[common]
	) {
		common++;
	}

	const upCount = fromParts.length - common;
	const up = '../'.repeat(upCount);
	const down = toParts.slice(common).join('/');

	if (down) {
		return `${up}${down}/${targetFileName}`;
	}
	return `${up}${targetFileName}`;
}
