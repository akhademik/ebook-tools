// src/lib/epub-packer/epub-packer.ts
import JSZip from 'jszip';
import { Logger } from '$lib/utils';
import { JACKET_TEMPLATES } from './templates/jacket-templates';
import { findFont, getFontFileName, getFontCSSDeclaration } from './templates/fonts';

import baseCss from './templates/css-template/base.css?raw';
import centerPageCss from './templates/css-template/center-page.css?raw';
import headingsCss from './templates/css-template/headings.css?raw';
import quotesCss from './templates/css-template/quotes.css?raw';
import breaksCss from './templates/css-template/breaks.css?raw';
import notesCss from './templates/css-template/notes.css?raw';
import ornamentsCss from './templates/css-template/ornaments.css?raw';
import coverCss from './templates/css-template/cover.css?raw';

import { buildContainerXml } from './xml-builders/container-builder';
import { buildContentOpf } from './xml-builders/opf-builder';
import { injectHeadingIds, getTocEntries, buildTocTree, buildNavXhtml, buildTocNcx } from './xml-builders/nav-builder';
import { mergeBrokenParagraphs, buildChapterXhtml } from './xml-builders/chapter-builder';
import { assignSequentialChapterIds } from './parser/epub-chapter-utils';
import type {
  EpubMetadata,
  EpubChapterItem,
  OrnamentsConfig,
  IllustrationImageItem,
  EpubFontsConfig,
  EpubJacketConfig,
  CoverBlobItem
} from '$lib/types';

export type {
  EpubFontsConfig,
  EpubJacketConfig,
  CoverBlobItem
};

export {
  buildContainerXml,
  buildContentOpf,
  injectHeadingIds,
  getTocEntries,
  buildTocTree,
  buildNavXhtml,
  buildTocNcx,
  mergeBrokenParagraphs,
  buildChapterXhtml
};

export const EPUB_CSS =
  baseCss +
  '\n' +
  centerPageCss +
  '\n' +
  ornamentsCss +
  '\n' +
  headingsCss +
  '\n' +
  quotesCss +
  '\n' +
  breaksCss +
  '\n' +
  notesCss;

export function getDynamicCss(chapters: EpubChapterItem[], ornaments?: OrnamentsConfig | null): string {
  let css = baseCss;
  let hasCenterPage = false;
  let hasHeadings = false;
  let hasQuotes = false;
  let hasBreaks = false;
  let hasNotes = false;

  for (const ch of chapters) {
    if (ch.features) {
      if (ch.features.hasCenterPage) hasCenterPage = true;
      if (ch.features.hasHeadings) hasHeadings = true;
      if (ch.features.hasQuotes) hasQuotes = true;
      if (ch.features.hasBreaks) hasBreaks = true;
      if (ch.features.hasNotes) hasNotes = true;
    }

    if (ch.isNotes) {
      hasNotes = true;
    }

    const html = ch.html || '';
    if (!hasCenterPage && /class=["'][^"']*(?:center-page)[^"']*["']/i.test(html)) {
      hasCenterPage = true;
    }
    if (!hasHeadings && (
      /<h[1-6]\b/i.test(html) ||
      /class=["'][^"']*(?:main-chap|side-chap|break-main-chap|chno|dropcap)[^"']*["']/i.test(html)
    )) {
      hasHeadings = true;
    }
    if (!hasQuotes && (
      /<blockquote\b/i.test(html) ||
      /class=["'][^"']*(?:letter|poem)[^"']*["']/i.test(html)
    )) {
      hasQuotes = true;
    }
    if (!hasBreaks && /class=["'][^"']*(?:scene-break|sbreak)[^"']*["']/i.test(html)) {
      hasBreaks = true;
    }
    if (!hasNotes && (
      /<aside\b[^>]*epub:type=["']footnote["']/i.test(html) ||
      /class=["'][^"']*(?:noteref|footnote|notenum)[^"']*["']/i.test(html)
    )) {
      hasNotes = true;
    }
  }

  if (hasCenterPage) css += '\n' + centerPageCss;
  if (ornaments?.chapterOrnament || ornaments?.subchapterOrnament) {
    css += '\n' + ornamentsCss;
  }
  if (hasHeadings) css += '\n' + headingsCss;
  if (hasQuotes) css += '\n' + quotesCss;
  if (hasBreaks) css += '\n' + breaksCss;
  if (hasNotes) css += '\n' + notesCss;

  return css;
}

/**
 * 1. Normalize metadata
 */
function prepareMetadata(metadata: Partial<EpubMetadata>): EpubMetadata {
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
    publisher: metadata.publisher || '',
  };
}

/**
 * 2. Resolve active fonts
 */
function resolveActiveFonts(fonts: EpubFontsConfig | null): string[] {
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
 * 3. Prepare final CSS with font declarations and ornament styles
 */
function prepareFinalCss(
  chapters: EpubChapterItem[],
  customCss?: string,
  fonts?: EpubFontsConfig | null,
  ornaments?: OrnamentsConfig | null
): string {
  let finalCss = customCss && customCss !== EPUB_CSS ? customCss : getDynamicCss(chapters, ornaments);

  if ((ornaments?.chapterOrnament || ornaments?.subchapterOrnament) && !finalCss.includes('.chapter-ornament')) {
    if (finalCss.includes('.dropcap')) {
      finalCss = finalCss.replace('.dropcap', `${ornamentsCss}\n\n.dropcap`);
    } else {
      finalCss += '\n' + ornamentsCss;
    }
  }

  // Generate @font-face and element-level font rules
  let fontFaces = '';
  let elementFontRules = '';
  if (fonts) {
    if (fonts.h1Font && fonts.h1Font !== 'default') {
      const f1 = findFont(fonts.h1Font);
      if (f1) {
        fontFaces += getFontCSSDeclaration(fonts.h1Font);
        elementFontRules += `\nh1 { font-family: "${f1.cssFamily}", serif !important; }`;
      }
    }
    if (fonts.h2Font && fonts.h2Font !== 'default') {
      const f2 = findFont(fonts.h2Font);
      if (f2) {
        if (fonts.h2Font !== fonts.h1Font) {
          fontFaces += getFontCSSDeclaration(fonts.h2Font);
        }
        elementFontRules += `\nh2 { font-family: "${f2.cssFamily}", serif !important; }`;
      }
    }
    if (fonts.dropcapFont && fonts.dropcapFont !== 'default') {
      const fd = findFont(fonts.dropcapFont);
      if (fd) {
        if (fonts.dropcapFont !== fonts.h1Font && fonts.dropcapFont !== fonts.h2Font) {
          fontFaces += getFontCSSDeclaration(fonts.dropcapFont);
        }
        if (finalCss.includes('.dropcap {')) {
          finalCss = finalCss.replace('.dropcap {', `.dropcap {\n  font-family: "${fd.cssFamily}", serif !important;`);
        } else {
          elementFontRules += `\n.dropcap { font-family: "${fd.cssFamily}", serif !important; }`;
        }
      }
    }
  }

  // Inject element font rules at element selector position (before classes and combinators)
  if (elementFontRules) {
    if (finalCss.includes('p.has-dropcap')) {
      finalCss = finalCss.replace('p.has-dropcap', `${elementFontRules.trim()}\n\np.has-dropcap`);
    } else if (finalCss.includes('.chapter-ornament')) {
      finalCss = finalCss.replace('.chapter-ornament', `${elementFontRules.trim()}\n\n.chapter-ornament`);
    } else if (finalCss.includes('.dropcap')) {
      finalCss = finalCss.replace('.dropcap', `${elementFontRules.trim()}\n\n.dropcap`);
    } else {
      finalCss = `${elementFontRules.trim()}\n` + finalCss;
    }
  }

  if (fontFaces) {
    finalCss = fontFaces.trim() + '\n\n' + finalCss;
  }

  return finalCss;
}

/**
 * 4. Assemble chapter items including jacket, cover, and injected IDs
 */
function prepareChapters(
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
        jacket.distributor,
      );
      const jacketChapter: EpubChapterItem = {
        title: 'Giới thiệu',
        fileName: 'jacket',
        xmlId: 'jacket',
        isChapter: true,
        html: jacketHtml,
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
      html: `<div class="cover-wrapper">\n  <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid meet">\n    <image width="${width}" height="${height}" xlink:href="../images/cover.jpg" href="../images/cover.jpg"/>\n  </svg>\n</div>`,
    };
    chaptersToPack.unshift(coverChapter);
  }

  return injectHeadingIds(chaptersToPack);
}

/**
 * 5. Add all assets and text files to JSZip
 */
async function assembleEpubZip(
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

  oebps.file(
    'content.opf',
    buildContentOpf(meta, chapters, !!coverBlob, activeFonts, ornaments, images),
  );
  oebps.file('nav.xhtml', buildNavXhtml(meta, chapters));
  oebps.file('toc.ncx', buildTocNcx(meta, chapters));

  const stylesFolder = oebps.folder('styles');
  if (stylesFolder) {
    stylesFolder.file('style.css', finalCss);
  }

  if (coverBlob) {
    const imgFolder = oebps.folder('images');
    if (imgFolder) {
      const rawCover = 'blob' in coverBlob ? (coverBlob as { blob: Blob | File }).blob : coverBlob;
      const data = typeof rawCover.arrayBuffer === 'function' ? await rawCover.arrayBuffer() : rawCover;
      imgFolder.file('cover.jpg', data);
    }
  }

  if (ornaments?.chapterOrnament?.blob) {
    const imgFolder = oebps.folder('images');
    if (imgFolder) {
      const b = ornaments.chapterOrnament.blob;
      const data = typeof b.arrayBuffer === 'function' ? await b.arrayBuffer() : b;
      imgFolder.file(ornaments.chapterOrnament.fileName, data);
    }
  }
  if (ornaments?.subchapterOrnament?.blob) {
    const imgFolder = oebps.folder('images');
    if (imgFolder) {
      const b = ornaments.subchapterOrnament.blob;
      const data = typeof b.arrayBuffer === 'function' ? await b.arrayBuffer() : b;
      imgFolder.file(ornaments.subchapterOrnament.fileName, data);
    }
  }

  if (images && Array.isArray(images) && images.length > 0) {
    const imagesFolder = oebps.folder('images');
    if (imagesFolder) {
      for (const img of images) {
        if (img && img.fileName && img.blob) {
          const data = typeof img.blob.arrayBuffer === 'function' ? await img.blob.arrayBuffer() : img.blob;
          imagesFolder.file(img.fileName, data);
        }
      }
    }
  }

  if (fonts && fonts.blobs) {
    const fontsFolder = oebps.folder('fonts');
    if (fontsFolder) {
      for (const [fontName, blob] of Object.entries(fonts.blobs)) {
        const fileName = getFontFileName(fontName);
        if (fileName && blob) {
          const data = typeof blob.arrayBuffer === 'function' ? await blob.arrayBuffer() : blob;
          fontsFolder.file(fileName, data);
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
      if (isJacket && jacket && jacket.enabled) {
        const template = JACKET_TEMPLATES.find((t) => t.id === jacket.templateId);
        if (template) {
          localCss = template.css;
        }
        if (fonts && fonts.jacketFont && fonts.jacketFont !== 'default') {
          const jFont = findFont(fonts.jacketFont);
          if (jFont) {
            const declaration = getFontCSSDeclaration(fonts.jacketFont);
            localCss = `${declaration}\nbody, p, span, div, hr, h1, h2 { font-family: "${jFont.cssFamily}", serif !important; }\n${localCss}`;
          }
        }
      } else if (isCover) {
        localCss = coverCss;
      }
      const xhtmlContent = buildChapterXhtml(
        meta,
        chapter,
        isJacket || isCover || preserveParagraphs,
        localCss,
        ornaments,
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
  images: IllustrationImageItem[] = [],
): Promise<Blob> {
  Logger.debug(
    '[EpubPacker]',
    'buildEpubBlob called',
    {
      chaptersCount: chapters.length,
      preserveParagraphs,
      jacket,
      hasCoverBlob: !!coverBlob,
      fontsConfig: fonts,
      ornamentsConfig: ornaments,
      imagesCount: images?.length || 0
    }
  );

  if (!chapters.length) {
    Logger.error(
      '[EpubPacker]',
      'buildEpubBlob error: chapters array is empty!'
    );
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

  Logger.debug(
    '[EpubPacker]',
    'All chapters added to zip, generating blob with JSZip...'
  );
  const blob = await zip.generateAsync({
    type: 'blob',
    mimeType: 'application/epub+zip',
    compression: 'DEFLATE',
    compressionOptions: { level: 9 },
  });
  Logger.info(
    '[EpubPacker]',
    `Blob generated successfully, size: ${blob.size}, type: ${blob.type}`
  );
  return blob;
}
