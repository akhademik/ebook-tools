// src/lib/epub-packer/xml-builders/chapter-builder.ts
import { escapeXml, Logger } from '$lib/utils';
import type { EpubMetadata, EpubChapterItem, OrnamentsConfig } from '$lib/types';

export function mergeBrokenParagraphs(html: string): string {
  Logger.debug(
    '[EpubPacker]',
    `mergeBrokenParagraphs called, html length: ${html.length}`
  );
  let result = html;
  let changed = true;
  while (changed) {
    changed = false;
    result = result.replace(
      /<p>([\s\S]*?)<\/p>\s*\n?<p>([\s\S]*?)<\/p>/g,
      (match, c1, c2) => {
        const plain = c1.replace(/<[^>]+>/g, '').trim();
        const plain2 = c2.replace(/<[^>]+>/g, '').trim();
        if (!plain || !plain2) return match;
        const endsSentence = /[.!?…]/.test(plain.slice(-1));
        const startsLower = /\p{Ll}/u.test(plain2.slice(0, 1));
        if (!endsSentence && startsLower) {
          changed = true;
          return '<p>' + c1.trim() + ' ' + c2.trim() + '</p>';
        }
        return match;
      },
    );
  }
  Logger.debug(
    '[EpubPacker]',
    `mergeBrokenParagraphs finished, result length: ${result.length}`
  );
  return result;
}

export function buildChapterXhtml(
  meta: EpubMetadata,
  chapter: EpubChapterItem,
  preserveParagraphs = false,
  customCss = '',
  ornaments: OrnamentsConfig | null = null,
): string {
  Logger.debug(
    '[EpubPacker]',
    `buildChapterXhtml called for: ${chapter.title}, preserveParagraphs: ${preserveParagraphs}`
  );
  let content = preserveParagraphs
    ? (chapter.html || '')
    : mergeBrokenParagraphs(chapter.html || '');
  content = content.replace(
    /<p>\s*###\s*<\/p>/g,
    '<p class="scene-break-big" role="separator">• • •</p>',
  );
  content = content.replace(
    /<p>\s*##\s*<\/p>/g,
    '<p class="scene-break-small" role="separator">*</p>',
  );

  const isSpecialPage =
    chapter.fileName === 'jacket' || chapter.fileName === 'cover';
  if (!isSpecialPage) {
    if (ornaments?.chapterOrnament?.fileName) {
      const imgPath = `../images/${ornaments.chapterOrnament.fileName}`;
      content = content.replace(/(<h1\b[^>]*>[\s\S]*?<\/h1>)/gi, (match) => {
        const classMatch = match.match(/class=["']([^"']*)["']/i);
        const classes = classMatch ? classMatch[1].split(/\s+/) : [];
        if (classes.includes('break-main-chap')) {
          return match;
        }
        return `<div class="chapter-ornament">\n    <img src="${imgPath}" alt=""/>\n  </div>\n  ` + match;
      });
    }

    if (ornaments?.subchapterOrnament?.fileName) {
      const imgPath = `../images/${ornaments.subchapterOrnament.fileName}`;
      content = content.replace(/(<h2\b[^>]*>[\s\S]*?<\/h2>)/gi, (match) => {
        return `<div class="subchapter-ornament">\n    <img src="${imgPath}" alt=""/>\n  </div>\n  ` + match;
      });
    }

    // Automatically add dropcap to the first paragraph immediately following h1 or h2
    content = content.replace(
      /(<h[12][^>]*>[\s\S]*?<\/h[12]>\s*)(<p[^>]*>\s*)((?:<[a-z0-9]+[^>]*>)*)((?:[“‘"’'«‹—-]|&ldquo;|&lsquo;|&quot;|&apos;)*[^<\s])/gi,
      (match, p1, p2, p3, p4) => {
        let updatedP2: string;
        if (p2.includes('class=')) {
          updatedP2 = p2.replace(/class=["']([^"']*)["']/i, (_cMatch, classNames) => {
            return `class="${classNames} has-dropcap"`;
          });
        } else {
          updatedP2 = p2.replace(/<p/i, '<p class="has-dropcap"');
        }
        return p1 + updatedP2 + p3 + '<span class="dropcap">' + p4 + '</span>';
      },
    );

    // Ensure that any paragraph containing a dropcap has the "has-dropcap" class
    content = content.replace(
      /<p([^>]*)>([^<]*(?:<(?!p\b)[^>]*>)*?<span\s+class=["']dropcap["'])/gi,
      (match, pAttrs, contentBeforeDropcap) => {
        if (pAttrs.includes('has-dropcap')) {
          return match;
        }
        let updatedPAttrs: string;
        if (pAttrs.includes('class=')) {
          updatedPAttrs = pAttrs.replace(/class=["']([^"']*)["']/i, (_cMatch, classNames) => {
            return `class="${classNames} has-dropcap"`;
          });
        } else {
          updatedPAttrs = pAttrs + ' class="has-dropcap"';
        }
        return `<p${updatedPAttrs}>${contentBeforeDropcap}`;
      }
    );
  }

  // Clean up internal marker classes (e.g. no-toc) from heading tags in final XHTML
  content = content.replace(/(<h[12]\b[^>]*>)/gi, (match) => {
    return match.replace(/class=["']([^"']*)["']/gi, (_cMatch, classNames) => {
      const cleaned = classNames.replace(/\bno-toc\b/g, '').trim().replace(/\s+/g, ' ');
      return cleaned ? `class="${cleaned}"` : '';
    }).replace(/\s{2,}/g, ' ').replace(/\s+>/g, '>');
  });

  const styleBlock = customCss ? `  <style>\n${customCss}\n  </style>\n` : '';
  const linkStyle =
    chapter.fileName === 'jacket' || chapter.fileName === 'cover'
      ? ''
      : '  <link rel="stylesheet" type="text/css" href="../styles/style.css"/>\n';
  return (
    '<?xml version="1.0" encoding="UTF-8"?>\n<!DOCTYPE html>\n' +
    '<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="' +
    meta.language +
    '">\n' +
    '<head>\n  <meta charset="utf-8"/>\n  <title>' +
    escapeXml(chapter.title) +
    '</title>\n' +
    linkStyle +
    styleBlock +
    '</head>\n' +
    '<body>\n' +
    content +
    '\n</body>\n</html>'
  );
}
