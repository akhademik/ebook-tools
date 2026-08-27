// src/lib/epub-editor/cleaner/duplicate-detector.ts
import type JSZip from 'jszip';
import { Logger, sha1HexAsync } from '$lib/utils';
import type { DuplicateResourceItem } from './types';

/**
 * Scan all media resources (images, fonts, styles) in the EPUB to find bitwise duplicate files.
 */
export async function scanDuplicateResources(
	zip: JSZip,
	editBuffer?: Map<string, string>
): Promise<DuplicateResourceItem[]> {
	const filePaths = Object.keys(zip.files).filter((p) => !zip.files[p].dir);
	const targetPaths = filePaths.filter((p) => {
		const ext = p.substring(p.lastIndexOf('.')).toLowerCase();
		return [
			'.jpg',
			'.jpeg',
			'.png',
			'.gif',
			'.svg',
			'.webp',
			'.ttf',
			'.otf',
			'.woff',
			'.woff2',
			'.css'
		].includes(ext);
	});

	const hashMap = new Map<string, { path: string; byteSize: number }>();
	const duplicates: DuplicateResourceItem[] = [];

	for (const path of targetPaths) {
		let bytes: Uint8Array;
		if (editBuffer && editBuffer.has(path)) {
			const text = editBuffer.get(path) || '';
			bytes = new TextEncoder().encode(text);
		} else {
			const file = zip.files[path];
			if (!file) continue;
			bytes = await file.async('uint8array');
		}

		// Use SHA-1 via WebCrypto for fast, clash-free bitwise deduplication
		const hash = await sha1HexAsync(bytes);

		if (hashMap.has(hash)) {
			const original = hashMap.get(hash)!;
			duplicates.push({
				originalPath: original.path,
				duplicatePath: path,
				byteSize: bytes.byteLength,
				hash
			});
			Logger.debug(
				'[epub-cleaner]',
				`Duplicate found: "${path}" is identical to "${original.path}" (${bytes.byteLength} B)`
			);
		} else {
			hashMap.set(hash, { path, byteSize: bytes.byteLength });
		}
	}

	return duplicates;
}
