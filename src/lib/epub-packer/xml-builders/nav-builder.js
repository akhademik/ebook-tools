// src/lib/epub-packer/xml-builders/nav-builder.js
import { escapeXml } from '$lib/utils/xml.js';

export function injectHeadingIds(chapters) {
  let headingCounter = 0;
  return chapters.map((chapter) => {
    if (chapter.fileName === 'cover' || chapter.fileName === 'jacket' || !chapter.html) {
      return chapter;
    }
    const headingRegex = /<h([12])\b([^>]*)>([\s\S]*?)<\/h\1>/gi;
    const newHtml = chapter.html.replace(headingRegex, (match, levelStr, attrs, innerContent) => {
      const level = parseInt(levelStr, 10);
      const idMatch = attrs.match(/id=["']([^"']*)["']/i);
      let updatedAttrs = attrs;
      if (!idMatch) {
        headingCounter++;
        const id = `heading-${level}-${headingCounter}`;
        updatedAttrs = ` id="${id}"` + attrs;
      }
      return `<h${level}${updatedAttrs}>${innerContent}</h${level}>`;
    });
    return {
      ...chapter,
      html: newHtml
    };
  });
}

export function getTocEntries(chapters) {
  const entries = [];
  for (const c of chapters) {
    if (c.fileName === 'cover') {
      continue;
    }
    
    const html = c.html || '';
    const headingRegex = /<h([12])\b([^>]*)>([\s\S]*?)<\/h\1>/gi;
    const headings = [];
    let match;
    
    headingRegex.lastIndex = 0;
    while ((match = headingRegex.exec(html)) !== null) {
      const level = parseInt(match[1], 10);
      const attrs = match[2];
      const innerContent = match[3];
      
      if (/\bno-toc\b/i.test(attrs)) {
        continue;
      }

      const idMatch = attrs.match(/id=["']([^"']*)["']/i);
      const id = idMatch ? idMatch[1] : '';
      const plainText = innerContent.replace(/<[^>]+>/g, '').trim();
      
      headings.push({
        level,
        id,
        title: plainText || c.title
      });
    }
    
    if (headings.length === 0) {
      entries.push({
        title: c.title,
        url: 'text/' + c.fileName + '.xhtml'
      });
    } else {
      const hasH1 = headings.some(h => h.level === 1);
      if (hasH1) {
        const firstH1Index = headings.findIndex(h => h.level === 1);
        for (let i = 0; i < headings.length; i++) {
          const h = headings[i];
          if (i === firstH1Index) {
            entries.push({
              title: h.title,
              url: 'text/' + c.fileName + '.xhtml'
            });
          } else {
            const anchor = h.id ? `#${h.id}` : '';
            entries.push({
              title: h.title,
              url: 'text/' + c.fileName + '.xhtml' + anchor
            });
          }
        }
      } else {
        entries.push({
          title: c.title,
          url: 'text/' + c.fileName + '.xhtml'
        });
        for (const h of headings) {
          const anchor = h.id ? `#${h.id}` : '';
          entries.push({
            title: h.title,
            url: 'text/' + c.fileName + '.xhtml' + anchor
          });
        }
      }
    }
  }
  return entries;
}

export function buildNavXhtml(meta, chapters) {
  const processedChapters = injectHeadingIds(chapters);
  const entries = getTocEntries(processedChapters);
  const items = entries
    .map(
      (entry) =>
        '<li><a href="' +
        entry.url +
        '">' +
        escapeXml(entry.title) +
        '</a></li>',
    )
    .join('\n      ');
  return (
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<!DOCTYPE html>\n' +
    '<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="' +
    meta.language +
    '">\n' +
    '<head>\n  <meta charset="utf-8"/>\n  <title>Mục lục</title>\n  <link rel="stylesheet" type="text/css" href="styles/style.css"/>\n</head>\n' +
    '<body>\n  <nav epub:type="toc" id="toc">\n    <h1>Mục lục</h1>\n    <ol>\n      ' +
    items +
    '\n    </ol>\n  </nav>\n</body>\n</html>'
  );
}

export function buildTocNcx(meta, chapters) {
  const processedChapters = injectHeadingIds(chapters);
  const entries = getTocEntries(processedChapters);
  const navPoints = entries
    .map(
      (entry, i) =>
        '<navPoint id="navPoint-' +
        (i + 1) +
        '" playOrder="' +
        (i + 1) +
        '">\n' +
        '      <navLabel><text>' +
        escapeXml(entry.title) +
        '</text></navLabel>\n' +
        '      <content src="' +
        entry.url +
        '"/>\n    </navPoint>',
    )
    .join('\n    ');
  return (
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">\n' +
    '  <head>\n' +
    '    <meta name="dtb:uid" content="' +
    escapeXml(meta.identifier) +
    '"/>\n' +
    '    <meta name="dtb:depth" content="1"/>\n' +
    '    <meta name="dtb:totalPageCount" content="0"/>\n' +
    '    <meta name="dtb:maxPageNumber" content="0"/>\n' +
    '  </head>\n' +
    '  <docTitle><text>' +
    escapeXml(meta.title) +
    '</text></docTitle>\n' +
    '  <navMap>\n    ' +
    navPoints +
    '\n  </navMap>\n' +
    '</ncx>'
  );
}
