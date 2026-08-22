// src/lib/utils/text.ts
import * as logger from '$lib/helpers/logger.js';

/**
 * Converts a string into a clean, URL-safe slug filename.
 * @param name - The raw file or title string.
 * @returns Cleaned slug name or 'untitled' if empty.
 */
export function slugify(name: unknown): string {
  logger.log('text-utils', 'slugify called with:', name);
  if (typeof name !== 'string') return 'untitled';
  const result = name.trim().replace(/\.[^.]+$/, '').replace(/\s+/g, '-') || 'untitled';
  logger.log('text-utils', 'slugify result:', result);
  return result;
}

/**
 * Ensures the given filename ends with a '.zip' extension.
 * @param name - The target filename string.
 * @returns Normalized filename ending in '.zip'.
 */
export function ensureZipExt(name: unknown): string {
  logger.log('text-utils', 'ensureZipExt called with:', name);
  if (typeof name !== 'string') return 'output.zip';
  const trimmed = name.trim();
  if (!trimmed) return 'output.zip';
  const result = /\.zip$/i.test(trimmed) ? trimmed : trimmed + '.zip';
  logger.log('text-utils', 'ensureZipExt result:', result);
  return result;
}

/**
 * Ensures the given filename ends with an '.epub' extension.
 * @param name - The target filename string.
 * @returns Normalized filename ending in '.epub'.
 */
export function ensureEpubExt(name: unknown): string {
  logger.log('text-utils', 'ensureEpubExt called with:', name);
  if (typeof name !== 'string') return 'output.epub';
  const trimmed = name.trim();
  if (!trimmed) return 'output.epub';
  const result = /\.epub$/i.test(trimmed) ? trimmed : trimmed + '.epub';
  logger.log('text-utils', 'ensureEpubExt result:', result);
  return result;
}

/**
 * Normalizes characters by stripping Vietnamese diacritics but preserving string length.
 * @param text - Input text.
 * @returns Normalized lowercased string.
 */
export function normalizeCharPreserveLength(text: unknown): string {
  let out = '';
  for (const ch of String(text || '')) {
    if (ch === 'đ' || ch === 'Đ') { out += 'd'; continue; }
    out += ch.normalize('NFD')[0].toLowerCase();
  }
  return out;
}
