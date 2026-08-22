// src/lib/epub-packer/templates/fonts.ts
import fontMetaMapRaw from '../../../assets/fonts-metadata.json';
import type { FontInfo } from '$lib/types';

export type { FontInfo };

const fontMetaMap = fontMetaMapRaw as Record<string, string>;

const fontFiles = import.meta.glob(
  '../../../assets/fonts/*.{ttf,otf,woff,woff2}',
  {
    eager: true,
    import: 'default',
  },
) as Record<string, string>;

export const AVAILABLE_FONTS: FontInfo[] = Object.entries(fontFiles).map(([path, url]) => {
  const fileName = path.split('/').pop() || '';
  const baseName = fileName.replace(/\.[^/.]+$/, '');

  const cssFamily =
    fontMetaMap[fileName] || baseName.replace(/[_-]/g, ' ').trim();

  let cleanName = baseName.replace(/^(UTM_|SVN-|LNTH-|DFVN-|TP-)/i, '');
  cleanName = cleanName.replace(/[_-]/g, ' ').trim();

  const mimeType = 'application/vnd.ms-opentype';

  return {
    id: baseName,
    name: cleanName,
    cssFamily,
    fileName,
    url,
    mimeType,
  };
});

/**
 * Tìm font theo id, cssFamily, tên cleanName hoặc tên file
 */
export function findFont(fontName: string | null | undefined): FontInfo | null {
  if (!fontName || fontName === 'default') return null;

  const search = fontName.toLowerCase().trim();

  let found = AVAILABLE_FONTS.find((f) => f.id.toLowerCase() === search);
  if (found) return found;

  found = AVAILABLE_FONTS.find((f) => f.cssFamily.toLowerCase() === search);
  if (found) return found;

  found = AVAILABLE_FONTS.find((f) => f.name.toLowerCase() === search);
  if (found) return found;

  found = AVAILABLE_FONTS.find(
    (f) =>
      f.id.toLowerCase().includes(search) ||
      f.fileName.toLowerCase().includes(search),
  );

  return found || null;
}

export function getFontFileName(fontName: string): string {
  const font = findFont(fontName);
  return font ? font.fileName : '';
}

export function getFontCSSDeclaration(fontName: string): string {
  const font = findFont(fontName);
  if (!font) return '';
  return `@font-face {\n  font-family: "${font.cssFamily}";\n  font-weight: normal;\n  font-style: normal;\n  src: url("../fonts/${font.fileName}");\n}\n`;
}
