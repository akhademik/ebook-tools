// helpers.js

/**
 * Configure PDF.js worker URL if PDF.js library is loaded globally via CDN.
 */
if (typeof window !== 'undefined' && window.pdfjsLib) {
  window.pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
}

/**
 * Converts a string into a clean, URL-safe slug filename.
 * @param {string} name - The raw file or title string.
 * @returns {string} Cleaned slug name or 'untitled' if empty.
 */
export function slugify(name) {
  if (typeof name !== 'string') return 'untitled';
  return name.trim().replace(/\.[^.]+$/, '').replace(/\s+/g, '-') || 'untitled';
}

/**
 * Ensures the given filename ends with a '.zip' extension.
 * @param {string} name - The target filename string.
 * @returns {string} Normalized filename ending in '.zip'.
 */
export function ensureZipExt(name) {
  if (typeof name !== 'string') return 'output.zip';
  name = name.trim();
  if (!name) return 'output.zip';
  return /\.zip$/i.test(name) ? name : name + '.zip';
}

/**
 * Ensures the given filename ends with an '.epub' extension.
 * @param {string} name - The target filename string.
 * @returns {string} Normalized filename ending in '.epub'.
 */
export function ensureEpubExt(name) {
  if (typeof name !== 'string') return 'output.epub';
  name = name.trim();
  if (!name) return 'output.epub';
  return /\.epub$/i.test(name) ? name : name + '.epub';
}

/**
 * Triggers a browser file download using a Blob object.
 * @param {Blob} blob - The file content blob to download.
 * @param {string} filename - Desired output filename.
 */
export function triggerDownload(blob, filename) {
  if (!blob || !(blob instanceof Blob)) {
    console.error('triggerDownload invalid blob:', blob);
    return;
  }
  const safeFilename = filename || 'download';
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = safeFilename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

/**
 * Escapes XML/HTML special characters in a string for safe EPUB XHTML insertion.
 * @param {string|number} s - Input string or primitive.
 * @returns {string} Escaped XML string.
 */
export function escapeXml(s) {
  if (s === null || s === undefined) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

