// src/lib/epub-packer/xml-builders/opf-builder.ts
import { escapeXml, escapeXmlAttribute, Logger } from '$lib/utils';
import { findFont } from '../templates/fonts';
import type {
	EpubMetadata,
	EpubChapterItem,
	OrnamentsConfig,
	IllustrationImageItem
} from '$lib/types';

export type { EpubMetadata, EpubChapterItem, OrnamentsConfig, IllustrationImageItem };

function getUniqueOpfId(usedIds: Set<string>, baseId: string): string {
	let id = baseId;
	let counter = 1;
	while (usedIds.has(id)) {
		id = `${baseId}_${counter}`;
		counter++;
	}
	usedIds.add(id);
	return id;
}

/**
 * Builds OEBPS/content.opf package file
 */
export function buildContentOpf(
	meta: EpubMetadata,
	chapters: EpubChapterItem[],
	hasCover = false,
	activeFonts: string[] = [],
	ornaments: OrnamentsConfig | null = null,
	images: IllustrationImageItem[] = [],
	hasJacket?: boolean
): string {
	Logger.debug('[EpubPacker]', 'buildContentOpf called', {
		chaptersCount: chapters.length,
		hasCover,
		activeFonts,
		imagesCount: images?.length || 0,
		hasJacket
	});
	const modified = new Date().toISOString().replace(/\.\d+Z$/, 'Z');
	const jacketPresent = hasJacket ?? chapters.some((c) => c.fileName === 'jacket');

	const usedIds = new Set<string>(['nav', 'ncx', 'css']);
	const manifestItems = [
		'<item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>',
		'<item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>',
		'<item id="css" href="styles/style.css" media-type="text/css"/>'
	];
	if (jacketPresent) {
		const jacketId = getUniqueOpfId(usedIds, 'css-jacket');
		manifestItems.push(
			`<item id="${escapeXmlAttribute(jacketId)}" href="styles/jacket.css" media-type="text/css"/>`
		);
	}
	if (hasCover) {
		const coverId = getUniqueOpfId(usedIds, 'cover-image');
		manifestItems.push(
			`<item id="${escapeXmlAttribute(coverId)}" href="images/cover.jpg" media-type="image/jpeg" properties="cover-image"/>`
		);
	}
	if (ornaments?.chapterOrnament) {
		const preChapId = getUniqueOpfId(usedIds, 'pre-chap');
		manifestItems.push(
			`<item id="${escapeXmlAttribute(preChapId)}" href="images/${escapeXmlAttribute(ornaments.chapterOrnament.fileName)}" media-type="${escapeXmlAttribute(ornaments.chapterOrnament.mimeType)}"/>`
		);
	}
	if (ornaments?.subchapterOrnament) {
		const preSmallChapId = getUniqueOpfId(usedIds, 'pre-small-chap');
		manifestItems.push(
			`<item id="${escapeXmlAttribute(preSmallChapId)}" href="images/${escapeXmlAttribute(ornaments.subchapterOrnament.fileName)}" media-type="${escapeXmlAttribute(ornaments.subchapterOrnament.mimeType)}"/>`
		);
	}
	if (images && Array.isArray(images)) {
		for (const img of images) {
			if (img && img.fileName) {
				const rawId = img.id || `img-${img.fileName.replace(/[^a-zA-Z0-9_-]/g, '_')}`;
				const uniqueId = getUniqueOpfId(usedIds, rawId);
				const mime = img.mimeType || 'image/jpeg';
				manifestItems.push(
					`<item id="${escapeXmlAttribute(uniqueId)}" href="images/${escapeXmlAttribute(img.fileName)}" media-type="${escapeXmlAttribute(mime)}"/>`
				);
			}
		}
	}
	for (const fontName of activeFonts) {
		const font = findFont(fontName);
		if (font) {
			const fontId = (font.id || font.name).toLowerCase().replace(/\s+/g, '-');
			const uniqueId = getUniqueOpfId(usedIds, `font-${fontId}`);
			manifestItems.push(
				`<item id="${escapeXmlAttribute(uniqueId)}" href="fonts/${escapeXmlAttribute(font.fileName)}" media-type="${escapeXmlAttribute(font.mimeType)}"/>`
			);
		}
	}
	const spineItems: string[] = [];
	for (let i = 0; i < chapters.length; i++) {
		const c = chapters[i];
		const uniqueId = getUniqueOpfId(usedIds, c.xmlId || `item-${i}`);
		manifestItems.push(
			`<item id="${escapeXmlAttribute(uniqueId)}" href="text/${escapeXmlAttribute(c.fileName)}.xhtml" media-type="application/xhtml+xml"/>`
		);
		spineItems.push(`<itemref idref="${escapeXmlAttribute(uniqueId)}"/>`);
	}
	const contributor = meta.contributor ?? 'akhademik & vc';
	const contributorXml = contributor
		? '    <dc:contributor id="packer">' +
			escapeXml(contributor) +
			'</dc:contributor>\n' +
			'    <meta refines="#packer" property="role" scheme="marc:relators">mrk</meta>\n' +
			'    <meta refines="#packer" property="file-as">' +
			escapeXml(contributor) +
			'</meta>\n' +
			'    <meta name="generator" content="' +
			escapeXmlAttribute(contributor) +
			'"/>\n'
		: '';

	return (
		'<?xml version="1.0" encoding="UTF-8"?>\n' +
		'<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="BookId" xml:lang="' +
		escapeXmlAttribute(meta.language || 'vi') +
		'">\n' +
		'  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">\n' +
		'    <dc:identifier id="BookId">' +
		escapeXml(meta.identifier) +
		'</dc:identifier>\n' +
		'    <dc:title>' +
		escapeXml(meta.title) +
		'</dc:title>\n' +
		'    <dc:language>' +
		meta.language +
		'</dc:language>\n' +
		'    <dc:creator id="creator">' +
		escapeXml(meta.author) +
		'</dc:creator>\n' +
		(meta.publisher ? '    <dc:publisher>' + escapeXml(meta.publisher) + '</dc:publisher>\n' : '') +
		contributorXml +
		(hasCover ? '    <meta name="cover" content="cover-image"/>\n' : '') +
		'    <meta property="dcterms:modified">' +
		modified +
		'</meta>\n' +
		'    <meta property="schema:accessMode">textual</meta>\n' +
		'    <meta property="schema:accessMode">visual</meta>\n' +
		'    <meta property="schema:accessModeSufficient">textual</meta>\n' +
		'    <meta property="schema:accessibilityFeature">structuralNavigation</meta>\n' +
		'    <meta property="schema:accessibilityFeature">readingOrder</meta>\n' +
		'    <meta property="schema:accessibilityFeature">tableOfContents</meta>\n' +
		'    <meta property="schema:accessibilityHazard">none</meta>\n' +
		'    <meta property="schema:accessibilitySummary">Ấn bản điện tử chuẩn EPUB 3 có cấu trúc mục lục và chú thích đầy đủ.</meta>\n' +
		'  </metadata>\n' +
		'  <manifest>\n    ' +
		manifestItems.join('\n    ') +
		'\n  </manifest>\n' +
		'  <spine toc="ncx">\n    ' +
		spineItems.join('\n    ') +
		'\n  </spine>\n' +
		'</package>'
	);
}
