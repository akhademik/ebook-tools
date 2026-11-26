// src/lib/epub-packer/builders/zip-writer.ts
import JSZip from 'jszip';
import { Logger } from '$lib/utils';
import { getFontFileName } from '../templates/fonts';
import coverCss from '../templates/css-template/cover.css?raw';

import { buildContainerXml } from '../xml-builders/container-builder';
import { buildContentOpf } from '../xml-builders/opf-builder';
import { buildNavXhtml, buildTocNcx } from '../xml-builders/nav-builder';
import { buildChapterXhtml } from '../xml-builders/chapter-builder';
import { prepareMetadata, resolveActiveFonts, prepareChapters } from './asset-builder';
import { prepareFinalCss, buildJacketCss } from './stylesheet-builder';

import type {
	EpubMetadata,
	EpubChapterItem,
	OrnamentsConfig,
	IllustrationImageItem,
	EpubFontsConfig,
	EpubJacketConfig,
	CoverBlobItem
} from '$lib/types';

/**
 * Resolves binary asset data for JSZip.
 * In browser environments, passing Blob directly lets JSZip read chunks on-demand via FileReader,
 * preventing holding multiple duplicate ArrayBuffers on the V8 heap before packaging.
 * In non-browser / mock test environments where FileReader is not available, falls back to ArrayBuffer.
 */
async function resolveZipBinaryData(
	source: Blob | File | ArrayBuffer | Uint8Array
): Promise<Blob | File | ArrayBuffer | Uint8Array> {
	if (
		typeof window !== 'undefined' &&
		typeof FileReader !== 'undefined' &&
		(source instanceof Blob || (typeof File !== 'undefined' && source instanceof File))
	) {
		return source;
	}
	if (typeof (source as Blob).arrayBuffer === 'function') {
		return await (source as Blob).arrayBuffer();
	}
	return source;
}

function resolveSafeIllustrationFileName(fileName: string, reservedOrTaken: Set<string>): string {
	const lower = fileName.toLowerCase();
	if (!reservedOrTaken.has(lower)) {
		reservedOrTaken.add(lower);
		return fileName;
	}
	const ext = fileName.includes('.') ? '.' + fileName.split('.').pop() : '';
	const base = fileName.replace(/\.[^.]+$/, '');
	let counter = 1;
	let candidate = `illus_${base}${ext}`;
	while (reservedOrTaken.has(candidate.toLowerCase())) {
		candidate = `illus_${base}_${counter}${ext}`;
		counter++;
	}
	reservedOrTaken.add(candidate.toLowerCase());
	return candidate;
}

/**
 * Add all assets and text files to JSZip
 */
export async function assembleEpubZip(
	zip: JSZip,
	meta: EpubMetadata,
	chapters: EpubChapterItem[],
	finalCss: string,
	activeFonts: string[],
	jacket: EpubJacketConfig | null,
	coverBlob: CoverBlobItem | null,
	fonts: EpubFontsConfig | null,
	ornaments: OrnamentsConfig | null,
	images: IllustrationImageItem[],
	preserveParagraphs: boolean
): Promise<void> {
	// File mimetype bắt buộc không nén (compression: STORE)
	zip.file('mimetype', 'application/epub+zip', { compression: 'STORE' });

	const metaInf = zip.folder('META-INF');
	if (metaInf) {
		metaInf.file('container.xml', buildContainerXml());
	}

	const oebps = zip.folder('OEBPS');
	if (!oebps) {
		throw new Error('Không thể tạo thư mục OEBPS trong EPUB ZIP');
	}

	// Đảm bảo không trùng tên file ảnh minh họa với ảnh bìa hoặc hoa văn
	const reservedImageNames = new Set<string>();
	if (coverBlob) {
		reservedImageNames.add('cover.jpg');
	}
	if (ornaments?.chapterOrnament?.fileName) {
		reservedImageNames.add(ornaments.chapterOrnament.fileName.toLowerCase());
	}
	if (ornaments?.subchapterOrnament?.fileName) {
		reservedImageNames.add(ornaments.subchapterOrnament.fileName.toLowerCase());
	}

	const safeImages: IllustrationImageItem[] = [];
	const takenImageNames = new Set<string>(reservedImageNames);
	if (images && Array.isArray(images) && images.length > 0) {
		for (const img of images) {
			if (img && img.fileName && img.blob) {
				const safeName = resolveSafeIllustrationFileName(img.fileName, takenImageNames);
				safeImages.push({
					...img,
					fileName: safeName
				});
			}
		}
	}

	const hasJacket = Boolean(jacket && jacket.enabled);
	oebps.file(
		'content.opf',
		buildContentOpf(meta, chapters, !!coverBlob, activeFonts, ornaments, safeImages, hasJacket)
	);
	oebps.file('nav.xhtml', buildNavXhtml(meta, chapters));
	oebps.file('toc.ncx', buildTocNcx(meta, chapters));

	const stylesFolder = oebps.folder('styles');
	if (stylesFolder) {
		stylesFolder.file('style.css', finalCss);
		if (hasJacket) {
			const jacketCss = buildJacketCss(jacket, fonts);
			if (jacketCss) {
				stylesFolder.file('jacket.css', jacketCss);
			}
		}
	}

	if (coverBlob) {
		const imgFolder = oebps.folder('images');
		if (imgFolder) {
			const rawCover = 'blob' in coverBlob ? (coverBlob as { blob: Blob | File }).blob : coverBlob;
			const data = await resolveZipBinaryData(rawCover);
			imgFolder.file('cover.jpg', data, { compression: 'STORE' });
		}
	}

	if (ornaments?.chapterOrnament?.blob) {
		const imgFolder = oebps.folder('images');
		if (imgFolder) {
			const b = ornaments.chapterOrnament.blob;
			const data = await resolveZipBinaryData(b);
			imgFolder.file(ornaments.chapterOrnament.fileName, data, { compression: 'STORE' });
		}
	}
	if (ornaments?.subchapterOrnament?.blob) {
		const imgFolder = oebps.folder('images');
		if (imgFolder) {
			const b = ornaments.subchapterOrnament.blob;
			const data = await resolveZipBinaryData(b);
			imgFolder.file(ornaments.subchapterOrnament.fileName, data, { compression: 'STORE' });
		}
	}

	if (safeImages.length > 0) {
		const imagesFolder = oebps.folder('images');
		if (imagesFolder) {
			for (const img of safeImages) {
				if (img.blob) {
					const data = await resolveZipBinaryData(img.blob);
					imagesFolder.file(img.fileName, data, { compression: 'STORE' });
				}
			}
		}
	}

	if (fonts && fonts.blobs && activeFonts.length > 0) {
		const fontsFolder = oebps.folder('fonts');
		if (fontsFolder) {
			for (const fontName of activeFonts) {
				const blob = fonts.blobs[fontName];
				const fileName = getFontFileName(fontName);
				if (fileName && blob) {
					const data = await resolveZipBinaryData(blob);
					fontsFolder.file(fileName, data, { compression: 'STORE' });
				}
			}
		}
	}

	const textFolder = oebps.folder('text');
	if (textFolder) {
		for (let i = 0; i < chapters.length; i++) {
			const chapter = chapters[i];
			const isJacket = chapter.fileName === 'jacket';
			const isCover = chapter.fileName === 'cover';
			let localCss = '';
			if (isCover) {
				localCss = coverCss;
			}
			const xhtmlContent = buildChapterXhtml(
				meta,
				chapter,
				isJacket || isCover || preserveParagraphs,
				localCss,
				ornaments
			);
			textFolder.file(chapter.fileName + '.xhtml', xhtmlContent);
		}
	}
}

/**
 * Pure EPUB packer function: builds full EPUB Blob without network fetching side-effects.
 */
export async function buildEpubBlob(
	metadata: Partial<EpubMetadata>,
	chapters: EpubChapterItem[],
	css?: string,
	preserveParagraphs = false,
	jacket: EpubJacketConfig | null = null,
	coverBlob: CoverBlobItem | null = null,
	fonts: EpubFontsConfig | null = null,
	ornaments: OrnamentsConfig | null = null,
	images: IllustrationImageItem[] = []
): Promise<Blob> {
	Logger.debug('[EpubPacker]', 'buildEpubBlob called', {
		chaptersCount: chapters.length,
		preserveParagraphs,
		jacket,
		hasCoverBlob: !!coverBlob,
		fontsConfig: fonts,
		ornamentsConfig: ornaments,
		imagesCount: images?.length || 0
	});

	if (!chapters.length) {
		Logger.error('[EpubPacker]', 'buildEpubBlob error: chapters array is empty!');
		throw new Error('Không có chương nào để đóng gói.');
	}

	const meta = prepareMetadata(metadata);
	const activeFonts = resolveActiveFonts(fonts);
	const chaptersToPack = prepareChapters(chapters, jacket, coverBlob);
	const finalCss = prepareFinalCss(chaptersToPack, css, fonts, ornaments);

	const zip = new JSZip();
	await assembleEpubZip(
		zip,
		meta,
		chaptersToPack,
		finalCss,
		activeFonts,
		jacket,
		coverBlob,
		fonts,
		ornaments,
		images,
		preserveParagraphs
	);

	Logger.debug('[EpubPacker]', 'All chapters added to zip, generating blob with JSZip...');
	const blob = await zip.generateAsync({
		type: 'blob',
		mimeType: 'application/epub+zip',
		compression: 'DEFLATE',
		compressionOptions: { level: 6 }
	});
	Logger.info(
		'[EpubPacker]',
		`Blob generated successfully, size: ${blob.size}, type: ${blob.type}`
	);
	return blob;
}
