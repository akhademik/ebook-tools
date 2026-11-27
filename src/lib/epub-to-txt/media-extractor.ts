// src/lib/epub-to-txt/media-extractor.ts
import JSZip from 'jszip';
import { findOpfPath, extractBookMetadata } from '$lib/epub-editor/epub-book-ops';
import {
	isValidFontMagic,
	deobfuscateIdpfFont,
	deobfuscateAdobeFont
} from '$lib/epub-editor/editor/html-validator';
import {
	Logger,
	loadSafeEpubZip,
	validateZipArchiveSafety,
	createZipExtractionBudget,
	readSafeZipEntryBytes,
	readSafeZipEntryText
} from '$lib/utils';
import { parseHtmlToDom, findElements, getAttr, type DomNode } from './html-dom';

export interface EpubMediaExtractResult {
	zipBlob: Blob;
	fileName: string;
	fontCount: number;
	imageCount: number;
	otherMediaCount: number;
	totalCount: number;
	deobfuscatedFontCount: number;
	extractedFiles: string[];
}

type MediaKind = 'font' | 'image' | 'other';

const FONT_EXTENSIONS = new Set(['.ttf', '.otf', '.woff', '.woff2', '.eot']);
const DEOBFUSCATABLE_FONT_EXTENSIONS = new Set(['.ttf', '.otf', '.woff', '.woff2']);
const IMAGE_EXTENSIONS = new Set([
	'.jpg',
	'.jpeg',
	'.png',
	'.gif',
	'.webp',
	'.svg',
	'.avif',
	'.bmp',
	'.ico',
	'.tif',
	'.tiff'
]);
const AUDIO_VIDEO_EXTENSIONS = new Set([
	'.mp3',
	'.m4a',
	'.aac',
	'.ogg',
	'.oga',
	'.opus',
	'.wav',
	'.flac',
	'.mp4',
	'.m4v',
	'.webm',
	'.ogv'
]);
const PRECOMPRESSED_EXTENSIONS = new Set([
	'.jpg',
	'.jpeg',
	'.png',
	'.gif',
	'.webp',
	'.avif',
	'.woff',
	'.woff2',
	'.mp3',
	'.m4a',
	'.aac',
	'.ogg',
	'.oga',
	'.opus',
	'.mp4',
	'.m4v',
	'.webm',
	'.ogv'
]);

function getLowerExtension(filePath: string): string {
	const base = filePath.split('/').pop() || filePath;
	const dotIdx = base.lastIndexOf('.');
	if (dotIdx <= 0) return '';
	return base.slice(dotIdx).toLowerCase();
}

function classifyMediaEntry(entryPath: string): { kind: MediaKind; ext: string } | null {
	const normalized = entryPath.replace(/\\/g, '/').replace(/^\/+/, '');
	if (!normalized || normalized.toUpperCase().startsWith('META-INF/')) {
		return null;
	}
	const ext = getLowerExtension(normalized);
	if (!ext) return null;
	if (FONT_EXTENSIONS.has(ext)) return { kind: 'font', ext };
	if (IMAGE_EXTENSIONS.has(ext)) return { kind: 'image', ext };
	if (AUDIO_VIDEO_EXTENSIONS.has(ext)) return { kind: 'other', ext };
	return null;
}

function getDomNodePlainText(node: DomNode): string {
	if (node.type === 'text') return node.text;
	let out = '';
	for (const child of node.children) {
		out += getDomNodePlainText(child);
	}
	return out;
}

function extractPublicationIdentifiersFromOpf(opfXml: string): string[] {
	const opfDom = parseHtmlToDom(opfXml);
	const pkgEl = findElements(opfDom, (el) => el.tag === 'package')[0];
	const uniqueIdAttr = pkgEl ? getAttr(pkgEl, 'unique-identifier')?.trim() : '';

	const ids: string[] = [];
	const identifierEls = findElements(opfDom, (el) => el.tag === 'identifier');

	if (uniqueIdAttr) {
		for (const el of identifierEls) {
			if (getAttr(el, 'id')?.trim() === uniqueIdAttr) {
				const val = getDomNodePlainText(el).trim();
				if (val && !ids.includes(val)) ids.push(val);
			}
		}
	}

	for (const el of identifierEls) {
		const val = getDomNodePlainText(el).trim();
		if (val && !ids.includes(val)) ids.push(val);
	}

	return ids;
}

function tryDeobfuscateFontBytes(
	fontBytes: Uint8Array,
	identifiers: string[],
	entryPath: string
): { bytes: Uint8Array; deobfuscated: boolean } {
	if (isValidFontMagic(fontBytes)) {
		return { bytes: fontBytes, deobfuscated: false };
	}

	for (const uid of identifiers) {
		const idpfCandidate = deobfuscateIdpfFont(fontBytes, uid);
		if (isValidFontMagic(idpfCandidate)) {
			Logger.info('[EpubMediaExtractor]', `De-obfuscated IDPF font: ${entryPath}`);
			return { bytes: idpfCandidate, deobfuscated: true };
		}

		const adobeCandidate = deobfuscateAdobeFont(fontBytes, uid);
		if (isValidFontMagic(adobeCandidate)) {
			Logger.info('[EpubMediaExtractor]', `De-obfuscated Adobe font: ${entryPath}`);
			return { bytes: adobeCandidate, deobfuscated: true };
		}
	}

	return { bytes: fontBytes, deobfuscated: false };
}

function allocateUniqueArchiveName(rawPath: string, usedLowerNames: Set<string>): string {
	const baseName = (rawPath.split('/').pop() || 'asset').trim() || 'asset';
	if (!usedLowerNames.has(baseName.toLowerCase())) {
		usedLowerNames.add(baseName.toLowerCase());
		return baseName;
	}

	const dotIdx = baseName.lastIndexOf('.');
	const stem = dotIdx > 0 ? baseName.slice(0, dotIdx) : baseName;
	const ext = dotIdx > 0 ? baseName.slice(dotIdx) : '';

	let counter = 2;
	while (true) {
		const candidate = `${stem}-${counter}${ext}`;
		if (!usedLowerNames.has(candidate.toLowerCase())) {
			usedLowerNames.add(candidate.toLowerCase());
			return candidate;
		}
		counter++;
	}
}

function buildMediaZipFileName(bookTitle: string, fallbackName: string): string {
	const rawBase = bookTitle || fallbackName || 'ebook';
	const slug =
		rawBase
			.toLowerCase()
			.normalize('NFD')
			.replace(/[\u0300-\u036f]/g, '')
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-+|-+$/g, '') || 'ebook';
	return `${slug}-media.zip`;
}

/**
 * Extracts all embedded media files (fonts, images, audio/video) from an EPUB archive
 * into a flat ZIP archive. Automatically attempts IDPF/Adobe font de-obfuscation so
 * extracted fonts are directly usable by the user.
 */
export async function extractEpubMedia(
	epubFileOrZip: File | Blob | JSZip,
	options?: {
		onProgress?: (status: string, percent: number) => void;
	}
): Promise<EpubMediaExtractResult> {
	options?.onProgress?.('Đang đọc cấu trúc EPUB...', 10);

	let zip: JSZip;
	let originalName = 'sach';

	if (epubFileOrZip instanceof JSZip) {
		validateZipArchiveSafety(epubFileOrZip);
		zip = epubFileOrZip;
	} else {
		if ('name' in epubFileOrZip && typeof epubFileOrZip.name === 'string') {
			originalName = epubFileOrZip.name.replace(/\.epub$/i, '');
		}
		zip = await loadSafeEpubZip(epubFileOrZip as Blob);
	}

	const zipBudget = createZipExtractionBudget();

	options?.onProgress?.('Đang quét danh sách media & font trong EPUB...', 25);

	const opfPath = await findOpfPath(zip, { budget: zipBudget });
	if (!opfPath) {
		throw new Error('Không tìm thấy file content.opf trong EPUB.');
	}

	const opfXml = await readSafeZipEntryText(zip, opfPath, { budget: zipBudget });
	if (opfXml === null) {
		throw new Error(`Không thể mở file OPF tại đường dẫn: ${opfPath}`);
	}

	const metadata = extractBookMetadata(opfXml);
	const publicationIds = extractPublicationIdentifiersFromOpf(opfXml);

	const mediaEntries: Array<{ path: string; kind: MediaKind; ext: string }> = [];
	for (const entryPath of Object.keys(zip.files)) {
		if (zip.files[entryPath].dir) continue;
		const info = classifyMediaEntry(entryPath);
		if (info) {
			mediaEntries.push({ path: entryPath, kind: info.kind, ext: info.ext });
		}
	}

	if (mediaEntries.length === 0) {
		throw new Error('File EPUB này không chứa font hay tệp media nào để trích xuất.');
	}

	mediaEntries.sort((a, b) =>
		a.path.localeCompare(b.path, undefined, { numeric: true, sensitivity: 'base' })
	);

	const outZip = new JSZip();
	const usedLowerNames = new Set<string>();
	const extractedFiles: string[] = [];

	let fontCount = 0;
	let imageCount = 0;
	let otherMediaCount = 0;
	let deobfuscatedFontCount = 0;

	const total = mediaEntries.length;
	for (let i = 0; i < total; i++) {
		const item = mediaEntries[i];
		const rawBytes = await readSafeZipEntryBytes(zip, item.path, { budget: zipBudget });
		if (!rawBytes) continue;

		let finalBytes = rawBytes;
		if (item.kind === 'font' && DEOBFUSCATABLE_FONT_EXTENSIONS.has(item.ext)) {
			const res = tryDeobfuscateFontBytes(rawBytes, publicationIds, item.path);
			finalBytes = res.bytes;
			if (res.deobfuscated) {
				deobfuscatedFontCount++;
			}
		}

		const outName = allocateUniqueArchiveName(item.path, usedLowerNames);
		const isPrecompressed = PRECOMPRESSED_EXTENSIONS.has(item.ext);
		outZip.file(outName, finalBytes, {
			compression: isPrecompressed ? 'STORE' : 'DEFLATE',
			...(isPrecompressed ? {} : { compressionOptions: { level: 6 } })
		});

		extractedFiles.push(outName);
		if (item.kind === 'font') fontCount++;
		else if (item.kind === 'image') imageCount++;
		else otherMediaCount++;

		const percent = Math.min(85, Math.round(25 + ((i + 1) / total) * 60));
		options?.onProgress?.(`Đang trích xuất media (${i + 1}/${total})...`, percent);
	}

	const totalCount = extractedFiles.length;
	if (totalCount === 0) {
		throw new Error('Không thể đọc dữ liệu media hợp lệ nào từ file EPUB.');
	}

	options?.onProgress?.('Đang đóng gói file ZIP media...', 92);
	const zipBlob = await outZip.generateAsync({ type: 'blob' });
	const fileName = buildMediaZipFileName(metadata.title, originalName);

	options?.onProgress?.('Hoàn tất trích xuất media!', 100);
	Logger.info(
		'[EpubMediaExtractor]',
		`Extracted ${totalCount} media files (${fontCount} fonts, ${imageCount} images, ${otherMediaCount} other, ${deobfuscatedFontCount} deobfuscated)`
	);

	return {
		zipBlob,
		fileName,
		fontCount,
		imageCount,
		otherMediaCount,
		totalCount,
		deobfuscatedFontCount,
		extractedFiles
	};
}
