import JSZip from "jszip";
import { escapeXml } from "$lib/helpers/helpers.js";
import * as logger from "$lib/helpers/logger.js";
import { JACKET_TEMPLATES } from "./jacket-templates.js";
import { findFont, getFontFileName, getFontCSSDeclaration } from "./fonts.js";

import baseCss from "./css-template/base.css?raw";
import headingsCss from "./css-template/headings.css?raw";
import quotesCss from "./css-template/quotes.css?raw";
import breaksCss from "./css-template/breaks.css?raw";
import notesCss from "./css-template/notes.css?raw";

export const EPUB_CSS =
  baseCss +
  "\n" +
  headingsCss +
  "\n" +
  quotesCss +
  "\n" +
  breaksCss +
  "\n" +
  notesCss;

function getDynamicCss(chapters) {
  let css = baseCss;
  let hasHeadings = false;
  let hasQuotes = false;
  let hasBreaks = false;
  let hasNotes = false;

  for (const ch of chapters) {
    const html = ch.html || "";
    if (
      html.includes("break-main-chap") ||
      html.includes("main-chap") ||
      html.includes("side-chap") ||
      html.includes("chno") ||
      html.includes("chapter")
    ) {
      hasHeadings = true;
    }
    if (
      html.includes("<blockquote") ||
      html.includes("blockquote") ||
      html.includes('class="letter"') ||
      html.includes('class="poem"')
    ) {
      hasQuotes = true;
    }
    if (
      html.includes("scene-break") ||
      html.includes("sbreak") ||
      html.includes("sbreak-big")
    ) {
      hasBreaks = true;
    }
    if (
      html.includes("noteref") ||
      html.includes("note") ||
      html.includes("footnote")
    ) {
      hasNotes = true;
    }
  }

  if (hasHeadings) css += "\n" + headingsCss;
  if (hasQuotes) css += "\n" + quotesCss;
  if (hasBreaks) css += "\n" + breaksCss;
  if (hasNotes) css += "\n" + notesCss;

  return css;
}

export function buildContainerXml() {
  return (
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">\n' +
    "  <rootfiles>\n" +
    '    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>\n' +
    "  </rootfiles>\n" +
    "</container>"
  );
}

export function buildContentOpf(
  meta,
  chapters,
  hasCover = false,
  activeFonts = [],
) {
  logger.log(
    "epub-packer",
    "buildContentOpf called with chapters count:",
    chapters.length,
    "hasCover:",
    hasCover,
    "activeFonts:",
    activeFonts,
  );
  const modified = new Date().toISOString().replace(/\.\d+Z$/, "Z");
  const manifestItems = [
    '<item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>',
    '<item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>',
    '<item id="css" href="styles/style.css" media-type="text/css"/>',
  ];
  if (hasCover) {
    manifestItems.push(
      '<item id="cover-image" href="images/cover.jpg" media-type="image/jpeg" properties="cover-image"/>',
    );
  }
  for (const fontName of activeFonts) {
    const font = findFont(fontName);
    if (font) {
      const fontId = (font.id || font.name).toLowerCase().replace(/\s+/g, "-");
      manifestItems.push(
        `<item id="font-${fontId}" href="fonts/${font.fileName}" media-type="${font.mimeType}"/>`,
      );
    }
  }
  for (const c of chapters) {
    manifestItems.push(
      '<item id="' +
        c.xmlId +
        '" href="text/' +
        c.fileName +
        '.xhtml" media-type="application/xhtml+xml"/>',
    );
  }
  const spineItems = chapters.map((c) => '<itemref idref="' + c.xmlId + '"/>');

  return (
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="BookId" xml:lang="' +
    meta.language +
    '">\n' +
    '  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">\n' +
    '    <dc:identifier id="BookId">' +
    escapeXml(meta.identifier) +
    "</dc:identifier>\n" +
    "    <dc:title>" +
    escapeXml(meta.title) +
    "</dc:title>\n" +
    "    <dc:language>" +
    meta.language +
    "</dc:language>\n" +
    '    <dc:creator id="creator">' +
    escapeXml(meta.author) +
    "</dc:creator>\n" +
    (meta.publisher
      ? "    <dc:publisher>" + escapeXml(meta.publisher) + "</dc:publisher>\n"
      : "") +
    (hasCover ? '    <meta name="cover" content="cover-image"/>\n' : "") +
    '    <meta property="dcterms:modified">' +
    modified +
    "</meta>\n" +
    "  </metadata>\n" +
    "  <manifest>\n    " +
    manifestItems.join("\n    ") +
    "\n  </manifest>\n" +
    '  <spine toc="ncx">\n    ' +
    spineItems.join("\n    ") +
    "\n  </spine>\n" +
    "</package>"
  );
}

export function buildNavXhtml(meta, chapters) {
  const items = chapters
    .filter((c) => c.fileName !== "cover")
    .map(
      (c) =>
        '<li><a href="text/' +
        c.fileName +
        '.xhtml">' +
        escapeXml(c.title) +
        "</a></li>",
    )
    .join("\n      ");
  return (
    '<?xml version="1.0" encoding="UTF-8"?>\n<!DOCTYPE html>\n' +
    '<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="' +
    meta.language +
    '">\n' +
    '<head>\n  <meta charset="utf-8"/>\n  <title>Mục lục</title>\n  <link rel="stylesheet" type="text/css" href="styles/style.css"/>\n</head>\n' +
    '<body>\n  <nav epub:type="toc" id="toc">\n    <h1>Mục lục</h1>\n    <ol>\n      ' +
    items +
    "\n    </ol>\n  </nav>\n</body>\n</html>"
  );
}

export function buildTocNcx(meta, chapters) {
  const navPoints = chapters
    .filter((c) => c.fileName !== "cover")
    .map(
      (c, i) =>
        '<navPoint id="navPoint-' +
        (i + 1) +
        '" playOrder="' +
        (i + 1) +
        '">\n' +
        "      <navLabel><text>" +
        escapeXml(c.title) +
        "</text></navLabel>\n" +
        '      <content src="text/' +
        c.fileName +
        '.xhtml"/>\n    </navPoint>',
    )
    .join("\n    ");
  return (
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">\n' +
    "  <head>\n" +
    '    <meta name="dtb:uid" content="' +
    escapeXml(meta.identifier) +
    '"/>\n' +
    '    <meta name="dtb:depth" content="1"/>\n' +
    '    <meta name="dtb:totalPageCount" content="0"/>\n' +
    '    <meta name="dtb:maxPageNumber" content="0"/>\n' +
    "  </head>\n" +
    "  <docTitle><text>" +
    escapeXml(meta.title) +
    "</text></docTitle>\n" +
    "  <navMap>\n    " +
    navPoints +
    "\n  </navMap>\n" +
    "</ncx>"
  );
}

export function mergeBrokenParagraphs(html) {
  logger.log(
    "epub-packer",
    "mergeBrokenParagraphs called, html length:",
    html.length,
  );
  let result = html;
  let changed = true;
  while (changed) {
    changed = false;
    result = result.replace(
      /<p>([\s\S]*?)<\/p>\s*\n?<p>([\s\S]*?)<\/p>/g,
      (match, c1, c2) => {
        const plain = c1.replace(/<[^>]+>/g, "").trim();
        const plain2 = c2.replace(/<[^>]+>/g, "").trim();
        if (!plain || !plain2) return match;
        const endsSentence = /[.!?…]/.test(plain.slice(-1));
        const startsLower = /\p{Ll}/u.test(plain2.slice(0, 1));
        if (!endsSentence && startsLower) {
          changed = true;
          return "<p>" + c1.trim() + " " + c2.trim() + "</p>";
        }
        return match;
      },
    );
  }
  logger.log(
    "epub-packer",
    "mergeBrokenParagraphs finished, result length:",
    result.length,
  );
  return result;
}

export function buildChapterXhtml(
  meta,
  chapter,
  skipParagraphMerge = false,
  customCss = "",
) {
  logger.log(
    "epub-packer",
    "buildChapterXhtml called for:",
    chapter.title,
    "skipParagraphMerge:",
    skipParagraphMerge,
  );
  let content = skipParagraphMerge
    ? chapter.html
    : mergeBrokenParagraphs(chapter.html);
  content = content.replace(
    /<p>\s*###\s*<\/p>/g,
    '<p class="scene-break-big" role="separator">• • •</p>',
  );
  content = content.replace(
    /<p>\s*##\s*<\/p>/g,
    '<p class="scene-break-small" role="separator">*</p>',
  );

  const isSpecialPage =
    chapter.fileName === "jacket" || chapter.fileName === "cover";
  if (!isSpecialPage) {
    content = content.replace(
      /(<h[12][^>]*>[\s\S]*?<\/h[12]>\s*<p[^>]*>\s*)((?:<[a-z0-9]+[^>]*>)*)((?:[“‘"’'«‹—-]|&ldquo;|&lsquo;|&quot;|&apos;)*[^<\s])/gi,
      (match, p1, p2, p3) =>
        p1 + p2 + '<span class="dropcap">' + p3 + "</span>",
    );
  }

  const styleBlock = customCss ? `  <style>\n${customCss}\n  </style>\n` : "";
  const linkStyle =
    chapter.fileName === "jacket" || chapter.fileName === "cover"
      ? ""
      : '  <link rel="stylesheet" type="text/css" href="../styles/style.css"/>\n';
  return (
    '<?xml version="1.0" encoding="UTF-8"?>\n<!DOCTYPE html>\n' +
    '<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="' +
    meta.language +
    '">\n' +
    '<head>\n  <meta charset="utf-8"/>\n  <title>' +
    escapeXml(chapter.title) +
    "</title>\n" +
    linkStyle +
    styleBlock +
    "</head>\n" +
    "<body>\n" +
    content +
    "\n</body>\n</html>"
  );
}

export async function buildEpubBlob(
  metadata,
  chapters,
  css,
  skipParagraphMerge = false,
  jacket = null,
  coverBlob = null,
  fonts = null,
) {
  logger.log(
    "epub-packer",
    "buildEpubBlob called, chapters count:",
    chapters.length,
    "skipParagraphMerge:",
    skipParagraphMerge,
    "jacket:",
    jacket,
    "hasCoverBlob:",
    !!coverBlob,
    "fontsConfig:",
    fonts,
  );
  const meta = {
    title: metadata.title || "Không tên",
    author: metadata.author || "Không rõ tác giả",
    language: metadata.language || "vi",
    identifier:
      metadata.identifier ||
      "urn:uuid:" +
        (typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : "id-" + Date.now() + "-" + Math.random().toString(16).slice(2)),
    publisher: metadata.publisher || "",
  };
  if (!chapters.length) {
    logger.error(
      "epub-packer",
      "buildEpubBlob error: chapters array is empty!",
    );
    throw new Error("Không có chương nào để đóng gói.");
  }

  // Bookerly dynamic fetch
  const bookerlyFont = findFont("Bookerly");
  if (bookerlyFont && bookerlyFont.url && typeof fetch !== "undefined") {
    if (!fonts) {
      fonts = { blobs: {} };
    } else if (!fonts.blobs) {
      fonts.blobs = {};
    }

    if (!fonts.blobs["Bookerly"]) {
      try {
        const isBrowser = typeof window !== "undefined";
        const isAbsolute =
          bookerlyFont.url &&
          (bookerlyFont.url.startsWith("http://") ||
            bookerlyFont.url.startsWith("https://"));
        if (isBrowser || isAbsolute) {
          logger.log(
            "epub-packer",
            "Fetching Bookerly font dynamically inside buildEpubBlob...",
          );
          const res = await fetch(bookerlyFont.url);
          if (res.ok) {
            fonts.blobs["Bookerly"] = await res.blob();
          } else {
            logger.error(
              "epub-packer",
              "Failed to fetch Bookerly font inside buildEpubBlob:",
              res.statusText,
            );
          }
        }
      } catch (err) {
        logger.error(
          "epub-packer",
          "Error fetching Bookerly font inside buildEpubBlob:",
          err,
        );
      }
    }
  }

  let activeFonts = [];
  if (fonts) {
    if (fonts.jacketFont && fonts.jacketFont !== "default")
      activeFonts.push(fonts.jacketFont);
    if (fonts.h1Font && fonts.h1Font !== "default")
      activeFonts.push(fonts.h1Font);
    if (fonts.h2Font && fonts.h2Font !== "default")
      activeFonts.push(fonts.h2Font);
  }
  if (findFont("Bookerly")) {
    activeFonts.push("Bookerly");
  }
  activeFonts = [...new Set(activeFonts)];

  let chaptersToPack = [...chapters];
  let finalCss = css && css !== EPUB_CSS ? css : getDynamicCss(chaptersToPack);

  // Sinh @font-face và font-family CHUẨN XÁC theo cssFamily
  let fontFaces = "";
  let fontSelectors = "";
  if (fonts) {
    if (fonts.h1Font && fonts.h1Font !== "default") {
      const f1 = findFont(fonts.h1Font);
      if (f1) {
        fontFaces += getFontCSSDeclaration(fonts.h1Font);
        fontSelectors += `\nh1 { font-family: "${f1.cssFamily}", serif !important; }\n`;
      }
    }
    if (fonts.h2Font && fonts.h2Font !== "default") {
      const f2 = findFont(fonts.h2Font);
      if (f2) {
        if (fonts.h2Font !== fonts.h1Font) {
          fontFaces += getFontCSSDeclaration(fonts.h2Font);
        }
        fontSelectors += `\nh2 { font-family: "${f2.cssFamily}", serif !important; }\n`;
      }
    }
  }
  if (fontFaces) {
    finalCss = fontFaces + "\n" + finalCss;
  }
  if (fontSelectors) {
    finalCss = finalCss + "\n" + fontSelectors;
  }

  if (jacket && jacket.enabled) {
    const template = JACKET_TEMPLATES.find((t) => t.id === jacket.templateId);
    if (template) {
      const jacketHtml = template.render(
        jacket.title,
        jacket.originalTitle,
        jacket.author,
        jacket.translator,
        jacket.publisher,
        jacket.distributor,
      );
      const jacketChapter = {
        title: "Giới thiệu",
        fileName: "jacket",
        xmlId: "jacket",
        isChapter: true,
        html: jacketHtml,
      };
      chaptersToPack.unshift(jacketChapter);
    }
  }

  if (coverBlob) {
    const coverChapter = {
      title: "Trang bìa",
      fileName: "cover",
      xmlId: "cover",
      isChapter: false,
      html: '<div class="cover-wrapper">\n  <img class="cover-img" src="../images/cover.jpg" alt="Bìa sách" />\n</div>',
    };
    chaptersToPack.unshift(coverChapter);
  }

  const zip = new JSZip();
  // File mimetype bắt buộc không nén (compression: STORE)
  zip.file("mimetype", "application/epub+zip", { compression: "STORE" });

  const metaInf = zip.folder("META-INF");
  metaInf.file("container.xml", buildContainerXml());

  const oebps = zip.folder("OEBPS");
  oebps.file(
    "content.opf",
    buildContentOpf(meta, chaptersToPack, !!coverBlob, activeFonts),
  );
  oebps.file("nav.xhtml", buildNavXhtml(meta, chaptersToPack));
  oebps.file("toc.ncx", buildTocNcx(meta, chaptersToPack));

  oebps.folder("styles").file("style.css", finalCss);

  if (coverBlob) {
    oebps.folder("images").file("cover.jpg", coverBlob);
  }

  if (fonts && fonts.blobs) {
    for (const [fontName, blob] of Object.entries(fonts.blobs)) {
      const fileName = getFontFileName(fontName);
      if (fileName && blob) {
        oebps.folder("fonts").file(fileName, blob);
      }
    }
  }

  const textFolder = oebps.folder("text");
  for (let i = 0; i < chaptersToPack.length; i++) {
    const chapter = chaptersToPack[i];
    const isJacket = chapter.fileName === "jacket";
    const isCover = chapter.fileName === "cover";
    let localCss = "";
    if (isJacket && jacket && jacket.enabled) {
      const template = JACKET_TEMPLATES.find((t) => t.id === jacket.templateId);
      if (template) {
        localCss = template.css;
      }
      if (fonts && fonts.jacketFont && fonts.jacketFont !== "default") {
        const jFont = findFont(fonts.jacketFont);
        if (jFont) {
          const declaration = getFontCSSDeclaration(fonts.jacketFont);
          // Sử dụng chính xác jFont.cssFamily ("KKTTAbsolute", "1314 Zahra"...)
          localCss = `${declaration}\nbody, p, span, div, hr, h1, h2 { font-family: "${jFont.cssFamily}", serif !important; }\n${localCss}`;
        }
      }
    } else if (isCover) {
      localCss =
        "body { margin: 0; padding: 0; text-align: center; background-color: #ffffff; }\n.cover-wrapper { text-align: center; padding: 0; margin: 0; }\n.cover-img { max-width: 100%; height: auto; }";
    }
    const xhtmlContent = buildChapterXhtml(
      meta,
      chapter,
      isJacket || isCover || skipParagraphMerge,
      localCss,
    );
    textFolder.file(chapter.fileName + ".xhtml", xhtmlContent);
  }

  logger.log(
    "epub-packer",
    "All chapters added to zip, generating blob with JSZip...",
  );
  const blob = await zip.generateAsync({
    type: "blob",
    mimeType: "application/epub+zip",
    compression: "DEFLATE",
    compressionOptions: { level: 9 },
  });
  logger.log(
    "epub-packer",
    "Blob generated successfully, size:",
    blob.size,
    "type:",
    blob.type,
  );
  return blob;
}
