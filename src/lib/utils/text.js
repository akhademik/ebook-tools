// src/lib/utils/text.js
import * as logger from '$lib/helpers/logger.js';

/**
 * Converts a string into a clean, URL-safe slug filename.
 * @param {string} name - The raw file or title string.
 * @returns {string} Cleaned slug name or 'untitled' if empty.
 */
export function slugify(name) {
  logger.log('text-utils', 'slugify called with:', name);
  if (typeof name !== 'string') return 'untitled';
  const result = name.trim().replace(/\.[^.]+$/, '').replace(/\s+/g, '-') || 'untitled';
  logger.log('text-utils', 'slugify result:', result);
  return result;
}

/**
 * Ensures the given filename ends with a '.zip' extension.
 * @param {string} name - The target filename string.
 * @returns {string} Normalized filename ending in '.zip'.
 */
export function ensureZipExt(name) {
  logger.log('text-utils', 'ensureZipExt called with:', name);
  if (typeof name !== 'string') return 'output.zip';
  name = name.trim();
  if (!name) return 'output.zip';
  const result = /\.zip$/i.test(name) ? name : name + '.zip';
  logger.log('text-utils', 'ensureZipExt result:', result);
  return result;
}

/**
 * Ensures the given filename ends with an '.epub' extension.
 * @param {string} name - The target filename string.
 * @returns {string} Normalized filename ending in '.epub'.
 */
export function ensureEpubExt(name) {
  logger.log('text-utils', 'ensureEpubExt called with:', name);
  if (typeof name !== 'string') return 'output.epub';
  name = name.trim();
  if (!name) return 'output.epub';
  const result = /\.epub$/i.test(name) ? name : name + '.epub';
  logger.log('text-utils', 'ensureEpubExt result:', result);
  return result;
}

/**
 * Normalizes characters by stripping Vietnamese diacritics but preserving string length.
 * @param {string} text - Input text.
 * @returns {string} Normalized lowercased string.
 */
export function normalizeCharPreserveLength(text) {
  let out = '';
  for (const ch of String(text || '')) {
    if (ch === 'đ' || ch === 'Đ') { out += 'd'; continue; }
    out += ch.normalize('NFD')[0].toLowerCase();
  }
  return out;
}
