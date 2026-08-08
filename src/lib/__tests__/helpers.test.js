import { describe, it, expect } from 'vitest';
import { slugify, ensureZipExt, ensureEpubExt, escapeXml } from '../helpers.js';

describe('helpers.js utility functions', () => {
  describe('slugify', () => {
    it('converts titles to clean slugs', () => {
      expect(slugify('  My Book Title.pdf  ')).toBe('My-Book-Title');
    });

    it('returns "untitled" for invalid input', () => {
      expect(slugify('')).toBe('untitled');
      expect(slugify(null)).toBe('untitled');
    });
  });

  describe('ensureZipExt', () => {
    it('appends .zip extension if missing', () => {
      expect(ensureZipExt('my-file')).toBe('my-file.zip');
      expect(ensureZipExt('my-file.zip')).toBe('my-file.zip');
      expect(ensureZipExt('MY-FILE.ZIP')).toBe('MY-FILE.ZIP');
    });

    it('handles empty input gracefully', () => {
      expect(ensureZipExt('')).toBe('output.zip');
      expect(ensureZipExt(null)).toBe('output.zip');
    });
  });

  describe('ensureEpubExt', () => {
    it('appends .epub extension if missing', () => {
      expect(ensureEpubExt('my-book')).toBe('my-book.epub');
      expect(ensureEpubExt('my-book.epub')).toBe('my-book.epub');
    });

    it('handles empty input gracefully', () => {
      expect(ensureEpubExt('')).toBe('output.epub');
    });
  });

  describe('escapeXml', () => {
    it('escapes special XML characters', () => {
      expect(escapeXml('Tom & Jerry <5> "quote" \'single\'')).toBe('Tom &amp; Jerry &lt;5&gt; &quot;quote&quot; &apos;single&apos;');
    });

    it('handles non-string primitives', () => {
      expect(escapeXml(123)).toBe('123');
      expect(escapeXml(null)).toBe('');
    });
  });
});
