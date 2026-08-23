import JSZip from 'jszip';
import { Logger } from '$lib/utils';
import { JACKET_TEMPLATES } from './templates/jacket-templates';
import { findFont, getFontFileName, getFontCSSDeclaration } from './templates/fonts';

import baseCss from './templates/css-template/base.css?raw';
import headingsCss from './templates/css-template/headings.css?raw';
import quotesCss from './templates/css-template/quotes.css?raw';
import breaksCss from './templates/css-template/breaks.css?raw';
import notesCss from './templates/css-template/notes.css?raw';

import { buildContainerXml } from './xml-builders/container-builder';
import { buildContentOpf } from './xml-builders/opf-builder';
import { injectHeadingIds, getTocEntries, buildNavXhtml, buildTocNcx } from './xml-builders/nav-builder';
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
  buildNavXhtml,
  buildTocNcx,
  mergeBrokenParagraphs,
  buildChapterXhtml
};

export const EPUB_CSS =
  baseCss +
  '\n' +
  headingsCss +
  '\n' +
  quotesCss +
  '\n' +
  breaksCss +
  '\n' +
  notesCss;

function getDynamicCss(chapters: EpubChapterItem[]): string {
  let css = baseCss;
  let hasHeadings = false;
  let hasQuotes = false;
  let hasBreaks = false;
  let hasNotes = false;

  for (const ch of chapters) {
    const html = ch.html || '';
    if (
      html.includes('break-main-chap') ||
      html.includes('main-chap') ||
      html.includes('side-chap') ||
      html.includes('chno') ||
      html.includes('chapter') ||
      html.includes('dropcap')
    ) {
      hasHeadings = true;
    }
    if (
      html.includes('<blockquote') ||
      html.includes('blockquote') ||
      html.includes('class="letter"') ||
      html.includes('class="poem"')
    ) {
      hasQuotes = true;
    }
    if (
      html.includes('scene-break') ||
      html.includes('sbreak') ||
      html.includes('sbreak-big')
    ) {
      hasBreaks = true;
    }
    if (
      html.includes('noteref') ||
      html.includes('note') ||
      html.includes('footnote')
    ) {
      hasNotes = true;
    }
  }

  if (hasHeadings) css += '\n' + headingsCss;
  if (hasQuotes) css += '\n' + quotesCss;
  if (hasBreaks) css += '\n' + breaksCss;
  if (hasNotes) css += '\n' + notesCss;

  return css;
}

export async function buildEpubBlob(
  metadata: Partial<EpubMetadata>,
  chapters: EpubChapterItem[],
  css?: string,
  skipParagraphMerge = false,
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
      skipParagraphMerge,
      jacket,
      hasCoverBlob: !!coverBlob,
      fontsConfig: fonts,
      ornamentsConfig: ornaments,
      imagesCount: images?.length || 0
    }
  );
  const meta: EpubMetadata = {
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
  if (!chapters.length) {
    Logger.error(
      '[EpubPacker]',
      'buildEpubBlob error: chapters array is empty!'
    );
    throw new Error('Không có chương nào để đóng gói.');
  }

  // Bookerly dynamic fetch
  const bookerlyFont = findFont('Bookerly');
  if (bookerlyFont && bookerlyFont.url && typeof fetch !== 'undefined') {
    if (!fonts) {
      fonts = { blobs: {} };
    } else if (!fonts.blobs) {
      fonts.blobs = {};
    }

    if (!fonts.blobs['Bookerly']) {
      try {
        const isBrowser = typeof window !== 'undefined';
        const isAbsolute =
          bookerlyFont.url &&
          (bookerlyFont.url.startsWith('http://') ||
            bookerlyFont.url.startsWith('https://'));
        if (isBrowser || isAbsolute) {
          Logger.debug(
            '[EpubPacker]',
            'Fetching Bookerly font dynamically inside buildEpubBlob...'
          );
          const res = await fetch(bookerlyFont.url);
          if (res.ok) {
            fonts.blobs['Bookerly'] = await res.blob();
          } else {
            Logger.error(
              '[EpubPacker]',
              'Failed to fetch Bookerly font inside buildEpubBlob:',
              res.statusText
            );
          }
        }
      } catch (err) {
        Logger.error(
          '[EpubPacker]',
          'Error fetching Bookerly font inside buildEpubBlob:',
          err
        );
      }
    }
  }

  let activeFonts: string[] = [];
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
  activeFonts = [...new Set(activeFonts)];

  let chaptersToPack: EpubChapterItem[] = [...chapters];
  if (chaptersToPack.some((c) => !c.fileName || !c.xmlId)) {
    chaptersToPack = assignSequentialChapterIds(chaptersToPack);
  }
  let finalCss = css && css !== EPUB_CSS ? css : getDynamicCss(chaptersToPack);

  if (ornaments?.chapterOrnament) {
    finalCss += `
.chapter-ornament {
  text-align: center;
  margin-top: 1.5em;
  margin-bottom: -1.5em;
  padding: 0;
}
.chapter-ornament img {
  display: inline-block;
  max-width: 25%;
  max-height: 60px;
  height: auto;
  width: auto;
}
`;
  }

  if (ornaments?.subchapterOrnament) {
    finalCss += `
.subchapter-ornament {
  text-align: center;
  margin-top: 1.5em;
  margin-bottom: 0.3em;
  padding: 0;
}
.subchapter-ornament img {
  display: inline-block;
  width: 5em;
  max-width: 80px;
  height: auto;
}
`;
  }

  // Sinh @font-face và font-family theo cssFamily
  let fontFaces = '';
  let fontSelectors = '';
  if (fonts) {
    if (fonts.h1Font && fonts.h1Font !== 'default') {
      const f1 = findFont(fonts.h1Font);
      if (f1) {
        fontFaces += getFontCSSDeclaration(fonts.h1Font);
        fontSelectors += `\nh1 { font-family: "${f1.cssFamily}", serif !important; }\n`;
      }
    }
    if (fonts.h2Font && fonts.h2Font !== 'default') {
      const f2 = findFont(fonts.h2Font);
      if (f2) {
        if (fonts.h2Font !== fonts.h1Font) {
          fontFaces += getFontCSSDeclaration(fonts.h2Font);
        }
        fontSelectors += `\nh2 { font-family: "${f2.cssFamily}", serif !important; }\n`;
      }
    }
    if (fonts.dropcapFont && fonts.dropcapFont !== 'default') {
      const fd = findFont(fonts.dropcapFont);
      if (fd) {
        if (fonts.dropcapFont !== fonts.h1Font && fonts.dropcapFont !== fonts.h2Font) {
          fontFaces += getFontCSSDeclaration(fonts.dropcapFont);
        }
        fontSelectors += `\n.dropcap { font-family: "${fd.cssFamily}", serif !important; }\n`;
      }
    }
  }
  if (fontFaces) {
    finalCss = fontFaces + '\n' + finalCss;
  }
  if (fontSelectors) {
    finalCss = finalCss + '\n' + fontSelectors;
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

  chaptersToPack = injectHeadingIds(chaptersToPack);

  const zip = new JSZip();
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
    buildContentOpf(meta, chaptersToPack, !!coverBlob, activeFonts, ornaments, images),
  );
  oebps.file('nav.xhtml', buildNavXhtml(meta, chaptersToPack));
  oebps.file('toc.ncx', buildTocNcx(meta, chaptersToPack));

  const stylesFolder = oebps.folder('styles');
  if (stylesFolder) {
    stylesFolder.file('style.css', finalCss);
  }

  if (coverBlob) {
    const imgFolder = oebps.folder('images');
    if (imgFolder) {
      const rawCover = (coverBlob as any).blob || coverBlob;
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
    for (let i = 0; i < chaptersToPack.length; i++) {
      const chapter = chaptersToPack[i];
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
        localCss =
          '@page { margin: 0; padding: 0; }\nhtml, body { margin: 0; padding: 0; width: 100%; height: 100%; }\nbody { background-color: #ffffff; }\n.cover-wrapper { margin: 0; padding: 0; width: 100%; height: 100%; }\nsvg { display: block; width: 100%; height: 100%; }';
      }
      const xhtmlContent = buildChapterXhtml(
        meta,
        chapter,
        isJacket || isCover || skipParagraphMerge,
        localCss,
        ornaments,
      );
      textFolder.file(chapter.fileName + '.xhtml', xhtmlContent);
    }
  }

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
