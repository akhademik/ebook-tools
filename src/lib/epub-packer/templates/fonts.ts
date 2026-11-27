// src/lib/epub-packer/templates/fonts.ts
import fontMetaMapRaw from '../../../assets/fonts-metadata.json';
import type { FontInfo } from '$lib/types';

export type { FontInfo };

const fontMetaMap = fontMetaMapRaw as Record<string, string>;

const fontFiles = import.meta.glob('../../../assets/fonts/*.{ttf,otf,woff,woff2}', {
	eager: true,
	import: 'default'
}) as Record<string, string>;

/**
 * Chuẩn hóa tên hiển thị thân thiện cho dropdown từ tên file và cssFamily
 */
export function formatFontDisplayName(baseName: string, cssFamily: string): string {
	let s = baseName.replace(/\[[^\]]*\]/g, '');
	s = s.replace(/^(UTM|SVN|LNTH|DFVN|TP|1FTV|VL|TLM|MJ|HP[\s_-]+DNS|Fz|Font)[\s_-]+/i, '');
	s = s.replace(/^FZ(?=[A-Z])/i, 'FZ ');
	s = s.replace(/[\s_-]+(Viet[\s_-]*Hoa|VH)$/i, '');
	if (/^TLM-/i.test(baseName)) {
		s = s.replace(/[\s_-]+V$/i, '');
	}
	s = s.replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim();
	s = s.replace(/\s+Regular$/i, '').trim();

	const famClean = cssFamily
		.replace(
			/^(iCielBC|iCiel|LNTH-[a-z]\s+|LNTH|NVN|FS|KKTT|1314|1FTV|DFVN|SVN|TP|UTM|VL|HP\s+DNS|Fz)[\s_-]*/i,
			''
		)
		.replace(/[_-]+/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();

	const sNoSpace = s.toLowerCase().replace(/\s+/g, '');
	const famNoSpace = famClean.toLowerCase().replace(/\s+/g, '');
	if (famClean && sNoSpace === famNoSpace) {
		s = famClean;
	} else if (famClean && sNoSpace.startsWith(famNoSpace) && sNoSpace.length > famNoSpace.length) {
		const words = s.split(' ');
		const last = words[words.length - 1];
		if (
			/^(Italic|Bold|SemiBold|Semi\s*Bold|Medium|Light|Thin|Black|ExtraBold)$/i.test(last) &&
			words.slice(0, -1).join('').toLowerCase() === famNoSpace
		) {
			s = `${famClean} ${last}`;
		}
	}

	return s
		.replace(/([a-z])([A-Z])/g, '$1 $2')
		.replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
		.replace(/([a-zA-Z])(\d)/g, '$1 $2')
		.replace(/(\d)([a-zA-Z])/g, '$1 $2')
		.replace(/\bDe Borstel\b/g, 'DeBorstel')
		.replace(/\bShi Tian Song S\b/g, 'ShiTianSong')
		.replace(/\s+/g, ' ')
		.trim();
}

export const AVAILABLE_FONTS: FontInfo[] = Object.entries(fontFiles)
	.map(([path, url]) => {
		const fileName = path.split('/').pop() || '';
		const baseName = fileName.replace(/\.[^/.]+$/, '');

		const cssFamily = fontMetaMap[fileName] || baseName.replace(/[_-]/g, ' ').trim();
		const cleanName = formatFontDisplayName(baseName, cssFamily);

		const mimeType = 'application/vnd.ms-opentype';

		return {
			id: baseName,
			name: cleanName,
			cssFamily,
			fileName,
			url,
			mimeType
		};
	})
	.sort((a, b) => a.name.localeCompare(b.name, 'vi'));

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
		(f) => f.id.toLowerCase().includes(search) || f.fileName.toLowerCase().includes(search)
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
