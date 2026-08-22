// helpers.js
// Re-export focused utility modules for backwards compatibility

/**
 * Configure PDF.js worker URL if PDF.js library is loaded globally via CDN.
 */
if (typeof window !== 'undefined' && window.pdfjsLib) {
  window.pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
}

export { triggerDownload } from '$lib/utils/download.js';
export { slugify, ensureZipExt, ensureEpubExt, normalizeCharPreserveLength } from '$lib/utils/text.js';
export { escapeXml } from '$lib/utils/xml.js';
