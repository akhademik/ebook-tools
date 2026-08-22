// src/lib/helpers/helpers.ts
// Re-export focused utility modules for backwards compatibility

declare global {
  interface Window {
    pdfjsLib?: {
      GlobalWorkerOptions: {
        workerSrc: string;
      };
    };
  }
}

/**
 * Configure PDF.js worker URL if PDF.js library is loaded globally via CDN.
 */
if (typeof window !== 'undefined' && window.pdfjsLib) {
  window.pdfjsLib.GlobalWorkerOptions.workerSrc =
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
}

export { triggerDownload } from '$lib/utils/download';
export { slugify, ensureZipExt, ensureEpubExt, normalizeCharPreserveLength } from '$lib/utils/text';
export { escapeXml } from '$lib/utils/xml';
