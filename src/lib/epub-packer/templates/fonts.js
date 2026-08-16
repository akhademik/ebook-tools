// src/lib/epub-packer/fonts.js
// Discover all fonts in src/assets/fonts directory dynamically
// Using Vite's import.meta.glob.

import fontMetaMap from "../../../assets/fonts-metadata.json";

const fontFiles = import.meta.glob(
  "../../../assets/fonts/*.{ttf,otf,woff,woff2}",
  {
    eager: true,
    import: "default",
  },
);

export const AVAILABLE_FONTS = Object.entries(fontFiles).map(([path, url]) => {
  const fileName = path.split("/").pop();
  const baseName = fileName.replace(/\.[^/.]+$/, "");

  // 1. Lấy tên thật từ metadata JSON (ví dụ: "KKTTAbsolute", "1314 Zahra")
  // Nếu không tìm thấy mới dùng fallback
  const cssFamily =
    fontMetaMap[fileName] || baseName.replace(/[_-]/g, " ").trim();

  // 2. Tạo tên hiển thị gọn gàng cho giao diện (UI)
  let cleanName = baseName.replace(/^(UTM_|SVN-|LNTH-|DFVN-|TP-)/i, "");
  cleanName = cleanName.replace(/[_-]/g, " ").trim();

  // 3. Chuẩn hóa media-type (MIME) cho EPUB 3 / EPUB 2
  let mimeType = "application/vnd.ms-opentype";

  return {
    id: baseName, // e.g. "Absolute-VH"
    name: cleanName, // Display name, e.g. "Absolute VH"
    cssFamily, // Tên định danh Font thật: e.g. "KKTTAbsolute"
    fileName, // e.g. "Absolute-VH.ttf"
    url, // Resolved asset URL
    mimeType,
  };
});

/**
 * Tìm font theo id, cssFamily, tên cleanName hoặc tên file
 * @param {string} fontName
 * @returns {object|null}
 */
export function findFont(fontName) {
  if (!fontName || fontName === "default") return null;

  const search = fontName.toLowerCase().trim();

  // 1. Khớp chính xác ID (e.g. 'Absolute-VH')
  let found = AVAILABLE_FONTS.find((f) => f.id.toLowerCase() === search);
  if (found) return found;

  // 2. Khớp cssFamily (e.g. 'kkttabsolute')
  found = AVAILABLE_FONTS.find((f) => f.cssFamily.toLowerCase() === search);
  if (found) return found;

  // 3. Khớp tên clean name (e.g. 'absolute vh')
  found = AVAILABLE_FONTS.find((f) => f.name.toLowerCase() === search);
  if (found) return found;

  // 4. Khớp tên file hoặc chứa chuỗi con
  found = AVAILABLE_FONTS.find(
    (f) =>
      f.id.toLowerCase().includes(search) ||
      f.fileName.toLowerCase().includes(search),
  );

  return found || null;
}

/**
 * Lấy tên file của font
 * @param {string} fontName
 * @returns {string}
 */
export function getFontFileName(fontName) {
  const font = findFont(fontName);
  return font ? font.fileName : "";
}

/**
 * Sinh khối @font-face CSS chuẩn
 * @param {string} fontName
 * @returns {string}
 */
export function getFontCSSDeclaration(fontName) {
  const font = findFont(fontName);
  if (!font) return "";
  return `@font-face {\n  font-family: "${font.cssFamily}";\n  font-weight: normal;\n  font-style: normal;\n  src: url("../fonts/${font.fileName}");\n}\n`;
}
