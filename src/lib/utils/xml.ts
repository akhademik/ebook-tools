// src/lib/utils/xml.ts

/**
 * Escapes XML/HTML special characters in a string for safe EPUB XHTML insertion.
 * @param s - Input string or primitive.
 * @returns Escaped XML string.
 */
export function escapeXml(s: unknown): string {
  if (s === null || s === undefined) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
