// src/lib/utils/xml.ts

/**
 * Escapes XML/HTML special characters in a string for safe EPUB XHTML insertion.
 * Strips C0 control characters that are illegal in XML 1.0 (excluding \t, \n, \r).
 * @param s - Input string or primitive.
 * @returns Escaped XML string.
 */
export function escapeXml(s: unknown): string {
  if (s === null || s === undefined) return '';
  return String(s)
    // eslint-disable-next-line no-control-regex
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Escapes XML attribute values (specifically handles quotes, ampersands, and XML entities).
 * @param s - Input value.
 * @returns Escaped attribute string.
 */
export function escapeXmlAttribute(s: unknown): string {
  if (s === null || s === undefined) return '';
  return String(s)
    // eslint-disable-next-line no-control-regex
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
