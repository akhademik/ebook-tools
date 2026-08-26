// src/lib/epub-packer/epub-packer.ts
/**
 * EPUB Packer facade module.
 * Re-exports modular builders for stylesheets, assets, XML manifests, and ZIP packaging.
 */

export * from './builders';

export { buildContainerXml } from './xml-builders/container-builder';
export { buildContentOpf } from './xml-builders/opf-builder';
export {
  injectHeadingIds,
  getTocEntries,
  buildTocTree,
  buildNavXhtml,
  buildTocNcx
} from './xml-builders/nav-builder';
export {
  mergeBrokenParagraphs,
  buildChapterXhtml
} from './xml-builders/chapter-builder';

export type {
  EpubFontsConfig,
  EpubJacketConfig,
  CoverBlobItem
} from '$lib/types';
