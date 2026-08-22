// src/lib/utils/xml.js

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
