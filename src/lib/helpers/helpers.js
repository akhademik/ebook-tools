// helpers.js
import * as logger from './logger.js';

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
  logger.log('helpers', 'slugify called with:', name);
  if (typeof name !== 'string') return 'untitled';
  const result = name.trim().replace(/\.[^.]+$/, '').replace(/\s+/g, '-') || 'untitled';
  logger.log('helpers', 'slugify result:', result);
  return result;
}

/**
 * Ensures the given filename ends with a '.zip' extension.
 * @param {string} name - The target filename string.
 * @returns {string} Normalized filename ending in '.zip'.
 */
export function ensureZipExt(name) {
  logger.log('helpers', 'ensureZipExt called with:', name);
  if (typeof name !== 'string') return 'output.zip';
  name = name.trim();
  if (!name) return 'output.zip';
  const result = /\.zip$/i.test(name) ? name : name + '.zip';
  logger.log('helpers', 'ensureZipExt result:', result);
  return result;
}

/**
 * Ensures the given filename ends with an '.epub' extension.
 * @param {string} name - The target filename string.
 * @returns {string} Normalized filename ending in '.epub'.
 */
export function ensureEpubExt(name) {
  logger.log('helpers', 'ensureEpubExt called with:', name);
  if (typeof name !== 'string') return 'output.epub';
  name = name.trim();
  if (!name) return 'output.epub';
  const result = /\.epub$/i.test(name) ? name : name + '.epub';
  logger.log('helpers', 'ensureEpubExt result:', result);
  return result;
}

/**
 * Triggers a browser file download using a Blob object.
 * @param {Blob} blob - The file content blob to download.
 * @param {string} filename - Desired output filename.
 */
export function triggerDownload(blob, filename) {
  logger.log('helpers', 'triggerDownload called with filename:', filename, 'blob:', blob);
  if (!blob || !(blob instanceof Blob)) {
    logger.error('helpers', 'Invalid blob:', blob);
    return;
  }
  const safeFilename = filename || 'download';
  logger.log('helpers', 'Creating ObjectURL for safeFilename:', safeFilename, 'blob size:', blob.size);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = safeFilename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  logger.log('helpers', 'Download anchor clicked successfully.');
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

