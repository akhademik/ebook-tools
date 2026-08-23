// src/lib/epub-packer/xml-builders/opf-builder.ts
import { escapeXml, escapeXmlAttribute, Logger } from '$lib/utils';
import { findFont } from '../templates/fonts';
import type {
  EpubMetadata,
  EpubChapterItem,
  OrnamentsConfig,
  IllustrationImageItem
} from '$lib/types';

export type {
  EpubMetadata,
  EpubChapterItem,
  OrnamentsConfig,
  IllustrationImageItem
};

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
): string {
  Logger.debug(
    '[EpubPacker]',
    'buildContentOpf called',
    {
      chaptersCount: chapters.length,
      hasCover,
      activeFonts,
      imagesCount: images?.length || 0,
    }
  );
  const modified = new Date().toISOString().replace(/\.\d+Z$/, 'Z');
  const manifestItems = [
    '<item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>',
    '<item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>',
    '<item id="css" href="styles/style.css" media-type="text/css"/>',
  ];
  if (hasCover) {
    manifestItems.push(
      '<item id="cover-image" href="images/cover.jpg" media-type="image/jpeg" properties="cover-image"/>',
    );
  }
  if (ornaments?.chapterOrnament) {
    manifestItems.push(
      `<item id="pre-chap" href="images/${escapeXmlAttribute(ornaments.chapterOrnament.fileName)}" media-type="${escapeXmlAttribute(ornaments.chapterOrnament.mimeType)}"/>`,
    );
  }
  if (ornaments?.subchapterOrnament) {
    manifestItems.push(
      `<item id="pre-small-chap" href="images/${escapeXmlAttribute(ornaments.subchapterOrnament.fileName)}" media-type="${escapeXmlAttribute(ornaments.subchapterOrnament.mimeType)}"/>`,
    );
  }
  if (images && Array.isArray(images)) {
    for (const img of images) {
      if (img && img.fileName) {
        const rawId = img.id || `img-${img.fileName.replace(/[^a-zA-Z0-9_-]/g, '_')}`;
        const mime = img.mimeType || 'image/jpeg';
        manifestItems.push(
          `<item id="${escapeXmlAttribute(rawId)}" href="images/${escapeXmlAttribute(img.fileName)}" media-type="${escapeXmlAttribute(mime)}"/>`,
        );
      }
    }
  }
  for (const fontName of activeFonts) {
    const font = findFont(fontName);
    if (font) {
      const fontId = (font.id || font.name).toLowerCase().replace(/\s+/g, '-');
      manifestItems.push(
        `<item id="font-${escapeXmlAttribute(fontId)}" href="fonts/${escapeXmlAttribute(font.fileName)}" media-type="${escapeXmlAttribute(font.mimeType)}"/>`,
      );
    }
  }
  for (const c of chapters) {
    manifestItems.push(
      `<item id="${escapeXmlAttribute(c.xmlId)}" href="text/${escapeXmlAttribute(c.fileName)}.xhtml" media-type="application/xhtml+xml"/>`,
    );
  }
  const spineItems = chapters.map((c) => `<itemref idref="${escapeXmlAttribute(c.xmlId)}"/>`);

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
    (meta.publisher
      ? '    <dc:publisher>' + escapeXml(meta.publisher) + '</dc:publisher>\n'
      : '') +
    (hasCover ? '    <meta name="cover" content="cover-image"/>\n' : '') +
    '    <meta property="dcterms:modified">' +
    modified +
    '</meta>\n' +
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
