// src/lib/epub-packer/builders/asset-builder.ts
import { JACKET_TEMPLATES } from '../templates/jacket-templates';
import { assignSequentialChapterIds } from '../parser/epub-chapter-utils';
import { injectHeadingIds } from '../xml-builders/nav-builder';
import type {
	EpubMetadata,
	EpubChapterItem,
	EpubFontsConfig,
	EpubJacketConfig,
	CoverBlobItem
} from '$lib/types';

/**
 * 1. Normalize metadata
 */
export function prepareMetadata(metadata: Partial<EpubMetadata>): EpubMetadata {
	return {
		title: metadata.title || 'Không tên',
		author: metadata.author || 'Không rõ tác giả',
		language: metadata.language || 'vi',
		identifier:
			metadata.identifier ||
			'urn:uuid:' +
				(typeof crypto !== 'undefined' && crypto.randomUUID
					? crypto.randomUUID()
					: 'id-' + Date.now() + '-' + Math.random().toString(16).slice(2)),
		publisher: metadata.publisher || ''
	};
}

/**
 * 2. Resolve active fonts
 */
export function resolveActiveFonts(fonts: EpubFontsConfig | null): string[] {
	const activeFonts: string[] = [];
	if (fonts && fonts.blobs) {
		if (fonts.jacketFont && fonts.jacketFont !== 'default' && fonts.blobs[fonts.jacketFont])
			activeFonts.push(fonts.jacketFont);
		if (fonts.h1Font && fonts.h1Font !== 'default' && fonts.blobs[fonts.h1Font])
			activeFonts.push(fonts.h1Font);
		if (fonts.h2Font && fonts.h2Font !== 'default' && fonts.blobs[fonts.h2Font])
			activeFonts.push(fonts.h2Font);
		if (fonts.dropcapFont && fonts.dropcapFont !== 'default' && fonts.blobs[fonts.dropcapFont])
			activeFonts.push(fonts.dropcapFont);
		if (fonts.blobs['Bookerly']) {
			activeFonts.push('Bookerly');
		}
	}
	return [...new Set(activeFonts)];
}

/**
 * 3. Assemble chapter items including jacket, cover, and injected IDs
 */
export function prepareChapters(
	chapters: EpubChapterItem[],
	jacket: EpubJacketConfig | null,
	coverBlob: CoverBlobItem | null
): EpubChapterItem[] {
	let chaptersToPack: EpubChapterItem[] = [...chapters];
	if (chaptersToPack.some((c) => !c.fileName || !c.xmlId)) {
		chaptersToPack = assignSequentialChapterIds(chaptersToPack);
	}

	if (jacket && jacket.enabled) {
		const template = JACKET_TEMPLATES.find((t) => t.id === jacket.templateId);
		if (template) {
			const jacketHtml = template.render(
				jacket.title,
				jacket.originalTitle,
				jacket.author,
				jacket.translator,
				jacket.publisher,
				jacket.distributor
			);
			const jacketChapter: EpubChapterItem = {
				title: 'Giới thiệu',
				fileName: 'jacket',
				xmlId: 'jacket',
				isChapter: true,
				html: jacketHtml
			};
			chaptersToPack.unshift(jacketChapter);
		}
	}

	if (coverBlob) {
		const width = coverBlob.width || 1200;
		const height = coverBlob.height || 1600;
		const coverChapter: EpubChapterItem = {
			title: 'Trang bìa',
			fileName: 'cover',
			xmlId: 'cover',
			isChapter: false,
			html: `<div class="cover-wrapper">\n  <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid none">\n    <image width="${width}" height="${height}" xlink:href="../images/cover.jpg" href="../images/cover.jpg"/>\n  </svg>\n</div>`
		};
		chaptersToPack.unshift(coverChapter);
	}

	return injectHeadingIds(chaptersToPack);
}
