// src/lib/epub-packer/builders/zip-writer.ts
import JSZip from 'jszip';
import { Logger } from '$lib/utils';
import { JACKET_TEMPLATES } from '../templates/jacket-templates';
import { findFont, getFontFileName, getFontCSSDeclaration } from '../templates/fonts';
import coverCss from '../templates/css-template/cover.css?raw';

import { buildContainerXml } from '../xml-builders/container-builder';
import { buildContentOpf } from '../xml-builders/opf-builder';
import { buildNavXhtml, buildTocNcx } from '../xml-builders/nav-builder';
import { buildChapterXhtml } from '../xml-builders/chapter-builder';
import { prepareMetadata, resolveActiveFonts, prepareChapters } from './asset-builder';
import { prepareFinalCss } from './stylesheet-builder';

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
      imgFolder.file('cover.jpg', data, { compression: 'STORE' });
    }
  }

  if (ornaments?.chapterOrnament?.blob) {
    const imgFolder = oebps.folder('images');
    if (imgFolder) {
      const b = ornaments.chapterOrnament.blob;
      const data = typeof b.arrayBuffer === 'function' ? await b.arrayBuffer() : b;
      imgFolder.file(ornaments.chapterOrnament.fileName, data, { compression: 'STORE' });
    }
  }
  if (ornaments?.subchapterOrnament?.blob) {
    const imgFolder = oebps.folder('images');
    if (imgFolder) {
      const b = ornaments.subchapterOrnament.blob;
      const data = typeof b.arrayBuffer === 'function' ? await b.arrayBuffer() : b;
      imgFolder.file(ornaments.subchapterOrnament.fileName, data, { compression: 'STORE' });
    }
  }

  if (images && Array.isArray(images) && images.length > 0) {
    const imagesFolder = oebps.folder('images');
    if (imagesFolder) {
      for (const img of images) {
        if (img && img.fileName && img.blob) {
          const data = typeof img.blob.arrayBuffer === 'function' ? await img.blob.arrayBuffer() : img.blob;
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
          const data = typeof blob.arrayBuffer === 'function' ? await blob.arrayBuffer() : blob;
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
    compressionOptions: { level: 6 },
  });
  Logger.info(
    '[EpubPacker]',
    `Blob generated successfully, size: ${blob.size}, type: ${blob.type}`
  );
  return blob;
}
