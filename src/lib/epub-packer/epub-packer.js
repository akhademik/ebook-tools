import JSZip from "jszip";
import * as logger from "$lib/helpers/logger.js";
import { JACKET_TEMPLATES } from "./templates/jacket-templates.js";
import { findFont, getFontFileName, getFontCSSDeclaration } from "./templates/fonts.js";

import baseCss from "./templates/css-template/base.css?raw";
import headingsCss from "./templates/css-template/headings.css?raw";
import quotesCss from "./templates/css-template/quotes.css?raw";
import breaksCss from "./templates/css-template/breaks.css?raw";
import notesCss from "./templates/css-template/notes.css?raw";

import { buildContainerXml } from "./xml-builders/container-builder.js";
import { buildContentOpf } from "./xml-builders/opf-builder.js";
import { injectHeadingIds, getTocEntries, buildNavXhtml, buildTocNcx } from "./xml-builders/nav-builder.js";
import { mergeBrokenParagraphs, buildChapterXhtml } from "./xml-builders/chapter-builder.js";

export {
  buildContainerXml,
  buildContentOpf,
  injectHeadingIds,
  getTocEntries,
  buildNavXhtml,
  buildTocNcx,
  mergeBrokenParagraphs,
  buildChapterXhtml
};

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
      html.includes("chapter") ||
      html.includes("dropcap")
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

export async function buildEpubBlob(
  metadata,
  chapters,
  css,
  skipParagraphMerge = false,
  jacket = null,
  coverBlob = null,
  fonts = null,
  ornaments = null,
  images = [],
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
    "ornamentsConfig:",
    ornaments,
    "imagesCount:",
    images?.length || 0,
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
    if (fonts.dropcapFont && fonts.dropcapFont !== "default")
      activeFonts.push(fonts.dropcapFont);
  }
  if (findFont("Bookerly")) {
    activeFonts.push("Bookerly");
  }
  activeFonts = [...new Set(activeFonts)];

  let chaptersToPack = [...chapters];
  let finalCss = css && css !== EPUB_CSS ? css : getDynamicCss(chaptersToPack);

  if (ornaments?.chapterOrnament) {
    finalCss += `
.chapter-ornament {
  text-align: center;
  margin-top: 1.5em;
  margin-bottom: -1.5em;
  padding: 0;
}
.chapter-ornament img {
  display: inline-block;
  max-width: 25%;
  max-height: 60px;
  height: auto;
  width: auto;
}
`;
  }

  if (ornaments?.subchapterOrnament) {
    finalCss += `
.subchapter-ornament {
  text-align: center;
  margin-top: 1.5em;
  margin-bottom: 0.3em;
  padding: 0;
}
.subchapter-ornament img {
  display: inline-block;
  width: 5em;
  max-width: 80px;
  height: auto;
}
`;
  }

  // Sinh @font-face và font-family theo cssFamily
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
    if (fonts.dropcapFont && fonts.dropcapFont !== "default") {
      const fd = findFont(fonts.dropcapFont);
      if (fd) {
        if (fonts.dropcapFont !== fonts.h1Font && fonts.dropcapFont !== fonts.h2Font) {
          fontFaces += getFontCSSDeclaration(fonts.dropcapFont);
        }
        fontSelectors += `\n.dropcap { font-family: "${fd.cssFamily}", serif !important; }\n`;
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
    const width = coverBlob.width || 1200;
    const height = coverBlob.height || 1600;
    const coverChapter = {
      title: "Trang bìa",
      fileName: "cover",
      xmlId: "cover",
      isChapter: false,
      html: `<div class="cover-wrapper">\n  <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid meet">\n    <image width="${width}" height="${height}" xlink:href="../images/cover.jpg" href="../images/cover.jpg"/>\n  </svg>\n</div>`,
    };
    chaptersToPack.unshift(coverChapter);
  }

  chaptersToPack = injectHeadingIds(chaptersToPack);

  const zip = new JSZip();
  // File mimetype bắt buộc không nén (compression: STORE)
  zip.file("mimetype", "application/epub+zip", { compression: "STORE" });

  const metaInf = zip.folder("META-INF");
  metaInf.file("container.xml", buildContainerXml());

  const oebps = zip.folder("OEBPS");
  oebps.file(
    "content.opf",
    buildContentOpf(meta, chaptersToPack, !!coverBlob, activeFonts, ornaments, images),
  );
  oebps.file("nav.xhtml", buildNavXhtml(meta, chaptersToPack));
  oebps.file("toc.ncx", buildTocNcx(meta, chaptersToPack));

  oebps.folder("styles").file("style.css", finalCss);

  if (coverBlob) {
    oebps.folder("images").file("cover.jpg", coverBlob);
  }

  if (ornaments?.chapterOrnament?.blob) {
    oebps.folder("images").file(ornaments.chapterOrnament.fileName, ornaments.chapterOrnament.blob);
  }
  if (ornaments?.subchapterOrnament?.blob) {
    oebps.folder("images").file(ornaments.subchapterOrnament.fileName, ornaments.subchapterOrnament.blob);
  }

  if (images && Array.isArray(images) && images.length > 0) {
    const imagesFolder = oebps.folder("images");
    for (const img of images) {
      if (img && img.fileName && img.blob) {
        imagesFolder.file(img.fileName, img.blob);
      }
    }
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
          localCss = `${declaration}\nbody, p, span, div, hr, h1, h2 { font-family: "${jFont.cssFamily}", serif !important; }\n${localCss}`;
        }
      }
    } else if (isCover) {
      localCss =
        "@page { margin: 0; padding: 0; }\nhtml, body { margin: 0; padding: 0; width: 100%; height: 100%; }\nbody { background-color: #ffffff; }\n.cover-wrapper { margin: 0; padding: 0; width: 100%; height: 100%; }\nsvg { display: block; width: 100%; height: 100%; }";
    }
    const xhtmlContent = buildChapterXhtml(
      meta,
      chapter,
      isJacket || isCover || skipParagraphMerge,
      localCss,
      ornaments,
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
