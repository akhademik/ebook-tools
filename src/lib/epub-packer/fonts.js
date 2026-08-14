// Discover all fonts in src/assets/fonts directory dynamically
// Using Vite's import.meta.glob.
const fontFiles = import.meta.glob(
  "../../assets/fonts/*.{ttf,otf,woff,woff2}",
  {
    eager: true,
    import: "default",
  },
);

export const AVAILABLE_FONTS = Object.entries(fontFiles).map(([path, url]) => {
  const fileName = path.split("/").pop();
  const baseName = fileName.replace(/\.[^/.]+$/, "");

  // Create clean name for display
  let cleanName = baseName.replace(/^(UTM_|SVN-|LNTH-|DFVN-|TP-)/i, "");
  cleanName = cleanName.replace(/[_-]/g, " ").trim();

  let mimeType = "application/vnd.ms-opentype";
  if (fileName.endsWith(".woff")) {
    mimeType = "font/woff";
  } else if (fileName.endsWith(".woff2")) {
    mimeType = "font/woff2";
  } else if (fileName.endsWith(".ttf")) {
    mimeType = "application/x-font-truetype";
  }

  return {
    id: baseName, // Unique identifier, e.g. "UTM_Akashi"
    name: cleanName, // Display name, e.g. "Akashi"
    fileName, // e.g. "UTM_Akashi.ttf"
    url, // Resolved asset URL
    mimeType,
  };
});

/**
 * Find a font by id, clean name, or substring
 * @param {string} fontName
 * @returns {object|null}
 */
export function findFont(fontName) {
  if (!fontName || fontName === "default") return null;

  // 1. Exact match by id (e.g. 'UTM_Akashi')
  let found = AVAILABLE_FONTS.find((f) => f.id === fontName);
  if (found) return found;

  // 2. Case-insensitive clean name match (e.g. 'akashi')
  found = AVAILABLE_FONTS.find(
    (f) => f.name.toLowerCase() === fontName.toLowerCase(),
  );
  if (found) return found;

  // 3. Case-insensitive substring match on id or filename (e.g. 'charlotte' matches 'UTM_Charlotte')
  found = AVAILABLE_FONTS.find(
    (f) =>
      f.id.toLowerCase().includes(fontName.toLowerCase()) ||
      f.fileName.toLowerCase().includes(fontName.toLowerCase()),
  );

  return found || null;
}

/**
 * Get the file name for a given font name
 * @param {string} fontName
 * @returns {string}
 */
export function getFontFileName(fontName) {
  const font = findFont(fontName);
  return font ? font.fileName : "";
}

/**
 * Generate CSS @font-face declaration for a given font
 * @param {string} fontName
 * @returns {string}
 */
export function getFontCSSDeclaration(fontName) {
  const font = findFont(fontName);
  if (!font) return "";
  return `@font-face {\n  font-family: "${fontName}";\n  src: url("../fonts/${font.fileName}");\n}\n`;
}
