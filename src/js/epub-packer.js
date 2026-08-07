import { slugify, ensureEpubExt, triggerDownload, escapeXml } from './helpers.js';

export function initEpubPacker() {
  // ---- Markdown (subset) -> XHTML ----
  function convertInline(text){
    const codeSpans = [];
    let t = String(text).replace(/`([^`]+)`/g, (m, code) => {
      codeSpans.push(code);
      return '\u0000CODE' + (codeSpans.length - 1) + '\u0000';
    });
    t = escapeXml(t);
    // images: ![alt](src)
    t = t.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (m, alt, src) => '<img alt="' + alt + '" src="' + src + '"/>');
    // links: [text](url)
    t = t.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (m, txt, href) => '<a href="' + href + '">' + txt + '</a>');
    // bold+italic (matching or mixed delimiters) — span capped so a stray
    // marker (e.g. a footnote-style "*") can't pair with an unrelated one far
    // away in the same paragraph and swallow everything between them.
    const INLINE_SPAN = '[\\s\\S]{1,150}?';
    t = t.replace(new RegExp('\\*\\*\\*(' + INLINE_SPAN + ')\\*\\*\\*', 'g'), (m, s) => '<strong><em>' + s + '</em></strong>');
    t = t.replace(new RegExp('___(' + INLINE_SPAN + ')___', 'g'), (m, s) => '<strong><em>' + s + '</em></strong>');
    t = t.replace(new RegExp('\\*\\*_(' + INLINE_SPAN + ')_\\*\\*', 'g'), (m, s) => '<strong><em>' + s + '</em></strong>');
    t = t.replace(new RegExp('__\\*(' + INLINE_SPAN + ')\\*__', 'g'), (m, s) => '<strong><em>' + s + '</em></strong>');
    // plain bold
    t = t.replace(new RegExp('\\*\\*(' + INLINE_SPAN + ')\\*\\*', 'g'), (m, s) => '<strong>' + s + '</strong>');
    t = t.replace(new RegExp('(?<![\\w_])__(' + INLINE_SPAN + ')__(?![\\w_])', 'g'), (m, s) => '<strong>' + s + '</strong>');
    // plain italic
    t = t.replace(new RegExp('(?<!\\*)\\*(?!\\*)(' + INLINE_SPAN + ')(?<!\\*)\\*(?!\\*)', 'g'), (m, s) => '<em>' + s + '</em>');
    t = t.replace(new RegExp('(?<![\\w_])_(?!_)(' + INLINE_SPAN + ')(?<!_)_(?![\\w_])', 'g'), (m, s) => '<em>' + s + '</em>');
    // restore inline code
    t = t.replace(/\u0000CODE(\d+)\u0000/g, (m, idx) => '<code>' + escapeXml(codeSpans[Number(idx)]) + '</code>');
    return t;
  }

  function endsWithSentencePunctuation(str) {
    const t = String(str || '').trim();
    return /[.!?…](["'”’»)\]]*)$/.test(t);
  }

  function startsWithLowercaseLetter(str) {
    const t = String(str || '').trim();
    if (!t) return false;
    const firstChar = t.charAt(0);
    return firstChar === firstChar.toLowerCase() && firstChar !== firstChar.toUpperCase();
  }

  function parseMarkdownBlocks(md){
    const lines = String(md).replace(/\r\n/g, '\n').split('\n');
    const blocks = [];
    let i = 0;
    const isHeading = l => /^#{1,6}\s+/.test(l);
    const isFence = l => /^```/.test(l.trim());
    const isHr = l => /^(-{3,}|\*{3,}|_{3,})\s*$/.test(l.trim());
    const isUl = l => /^\s*[-*+]\s+/.test(l);
    const isOl = l => /^\s*\d+\.\s+/.test(l);
    const isQuote = l => /^>/.test(l);

    while (i < lines.length) {
      const line = lines[i];
      if (line.trim() === '') { i++; continue; }

      if (isFence(line)) {
        i++;
        const codeLines = [];
        while (i < lines.length && !isFence(lines[i])) { codeLines.push(lines[i]); i++; }
        i++;
        blocks.push({ type: 'code', content: codeLines.join('\n') });
        continue;
      }

      const hm = line.match(/^(#{1,6})\s+(.*)$/);
      if (hm) {
        blocks.push({ type: 'heading', level: hm[1].length, text: hm[2].trim() });
        i++;
        continue;
      }

      if (isHr(line)) { blocks.push({ type: 'hr' }); i++; continue; }

      if (isQuote(line)) {
        const qLines = [];
        while (i < lines.length && isQuote(lines[i])) { qLines.push(lines[i].replace(/^>\s?/, '')); i++; }
        blocks.push({ type: 'blockquote', text: qLines.join(' ') });
        continue;
      }

      if (isUl(line)) {
        const items = [];
        while (i < lines.length && isUl(lines[i])) { items.push(lines[i].replace(/^\s*[-*+]\s+/, '')); i++; }
        blocks.push({ type: 'ul', items });
        continue;
      }

      if (isOl(line)) {
        const items = [];
        while (i < lines.length && isOl(lines[i])) { items.push(lines[i].replace(/^\s*\d+\.\s+/, '')); i++; }
        blocks.push({ type: 'ol', items });
        continue;
      }

      const paraLines = [line];
      i++;
      while (i < lines.length) {
        const nextLine = lines[i];
        if (nextLine.trim() === '') break;
        if (isHeading(nextLine) || isFence(nextLine) || isQuote(nextLine) || isUl(nextLine) || isOl(nextLine) || isHr(nextLine)) {
          break;
        }
        const currentLine = paraLines[paraLines.length - 1];
        if (!endsWithSentencePunctuation(currentLine) && startsWithLowercaseLetter(nextLine)) {
          paraLines.push(nextLine);
          i++;
        } else {
          break;
        }
      }
      blocks.push({ type: 'p', text: paraLines.join('\n').trim() });
    }
    return blocks;
  }

  function renderMarkdownBlocks(blocks){
    let html = '';
    let title = null;
    for (const b of blocks) {
      if (b.type === 'heading') {
        if (title === null && (b.level === 1 || b.level === 2)) title = b.text;
        if (b.level === 2) {
          html += '<h2><span class="ch-title">' + convertInline(b.text) + '</span></h2>\n';
        } else {
          html += '<h' + b.level + '>' + convertInline(b.text) + '</h' + b.level + '>\n';
        }
      } else if (b.type === 'p') {
        html += '<p>' + convertInline(b.text.replace(/\n+/g, ' ')) + '</p>\n';
      } else if (b.type === 'blockquote') {
        html += '<blockquote><p>' + convertInline(b.text) + '</p></blockquote>\n';
      } else if (b.type === 'ul') {
        html += '<ul>\n' + b.items.map(it => '<li>' + convertInline(it) + '</li>').join('\n') + '\n</ul>\n';
      } else if (b.type === 'ol') {
        html += '<ol>\n' + b.items.map(it => '<li>' + convertInline(it) + '</li>').join('\n') + '\n</ol>\n';
      } else if (b.type === 'hr') {
        html += '<hr/>\n';
      } else if (b.type === 'code') {
        html += '<pre><code>' + escapeXml(b.content) + '</code></pre>\n';
      }
    }
    return { html, title };
  }

  // ---- EPUB structure builders (ported from the user's buildEpub.ts, no external epub package) ----
  const EPUB_CSS = `@page {
    margin-top: 0; 
  }

  body {
    font-family: "Bookerly", serif;
    margin-top: 0 !important; 
    padding-top: 0 !important;
  }

  p {
    display: block;
    text-align: justify;
    line-height: 1.4;
    text-indent: 1.25em;
    padding-top: 0.5em;
    margin: 0;
  }

  a {
    text-decoration: none;
    font-size: 0.6em;
    vertical-align: super;
  }

  /* Calibre editor: hiển thị bình thường, màu xanh để dễ sửa */
  aside.footnote {
    display: block;
    color: green; 
    padding-bottom: 0.5em;
  }

  /* Kobo only: khi có div#book-columns (chỉ tồn tại trên Kobo), ẩn aside đi */
  div#book-columns aside.footnote { 	
      display: none; 	
  }

  /* dùng để đẩy thẻ aside xuống có khoảng cách */
  p:last-of-type {
    margin-bottom: 2.5em; 
  }

  h2 {
    margin-top: 0 !important;
    padding-top: 0 !important; 
    line-height: 1.1; 
    text-align: center;
    margin-bottom: 0.5em;
    font-size: 1.05em;
  }
  h2 span.ch-num {  
    display: inline-block;
    font-size: 0.35em;
    letter-spacing: 0.1em;
    opacity: 0.6;
    text-transform: uppercase;
    padding-bottom: 0.4em;
    border-bottom: 1px solid currentColor;
  }
  h2 span.sep {
    display: none;
  }
  h2 span.ch-title {
    display: block;
    font-size: 1.05em;
    text-transform: capitalize;
  }`;

  function buildContainerXml(){
    return '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">\n' +
  '  <rootfiles>\n' +
  '    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>\n' +
  '  </rootfiles>\n' +
  '</container>';
  }

  function buildContentOpf(meta, chapters){
    const modified = new Date().toISOString().replace(/\.\d+Z$/, 'Z');
    const manifestItems = [
      '<item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>',
      '<item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>',
      '<item id="css" href="styles/style.css" media-type="text/css"/>'
    ];
    for (const c of chapters) {
      manifestItems.push('<item id="' + c.xmlId + '" href="text/' + c.fileName + '.xhtml" media-type="application/xhtml+xml"/>');
    }
    const spineItems = chapters.map(c => '<itemref idref="' + c.xmlId + '"/>');

    return '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="BookId" xml:lang="' + meta.language + '">\n' +
  '  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">\n' +
  '    <dc:identifier id="BookId">' + escapeXml(meta.identifier) + '</dc:identifier>\n' +
  '    <dc:title>' + escapeXml(meta.title) + '</dc:title>\n' +
  '    <dc:language>' + meta.language + '</dc:language>\n' +
  '    <dc:creator id="creator">' + escapeXml(meta.author) + '</dc:creator>\n' +
  (meta.publisher ? '    <dc:publisher>' + escapeXml(meta.publisher) + '</dc:publisher>\n' : '') +
  '    <meta property="dcterms:modified">' + modified + '</meta>\n' +
  '  </metadata>\n' +
  '  <manifest>\n    ' + manifestItems.join('\n    ') + '\n  </manifest>\n' +
  '  <spine toc="ncx">\n    ' + spineItems.join('\n    ') + '\n  </spine>\n' +
  '</package>';
  }

  function buildNavXhtml(meta, chapters){
    const items = chapters.map(c => '<li><a href="text/' + c.fileName + '.xhtml">' + escapeXml(c.title) + '</a></li>').join('\n      ');
    return '<?xml version="1.0" encoding="UTF-8"?>\n<!DOCTYPE html>\n' +
  '<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="' + meta.language + '">\n' +
  '<head>\n  <meta charset="utf-8"/>\n  <title>Mục lục</title>\n  <link rel="stylesheet" type="text/css" href="styles/style.css"/>\n</head>\n' +
  '<body>\n  <nav epub:type="toc" id="toc">\n    <h1>Mục lục</h1>\n    <ol>\n      ' + items + '\n    </ol>\n  </nav>\n</body>\n</html>';
  }

  function buildTocNcx(meta, chapters){
    const navPoints = chapters.map((c, i) =>
      '<navPoint id="navPoint-' + (i + 1) + '" playOrder="' + (i + 1) + '">\n' +
      '      <navLabel><text>' + escapeXml(c.title) + '</text></navLabel>\n' +
      '      <content src="text/' + c.fileName + '.xhtml"/>\n    </navPoint>'
    ).join('\n    ');
    return '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">\n' +
  '  <head>\n' +
  '    <meta name="dtb:uid" content="' + escapeXml(meta.identifier) + '"/>\n' +
  '    <meta name="dtb:depth" content="1"/>\n' +
  '    <meta name="dtb:totalPageCount" content="0"/>\n' +
  '    <meta name="dtb:maxPageNumber" content="0"/>\n' +
  '  </head>\n' +
  '  <docTitle><text>' + escapeXml(meta.title) + '</text></docTitle>\n' +
  '  <navMap>\n    ' + navPoints + '\n  </navMap>\n' +
  '</ncx>';
  }

  function mergeBrokenParagraphs(html){
    let result = html;
    let changed = true;
    while (changed) {
      changed = false;
      result = result.replace(/<p>([\s\S]*?)<\/p>\s*\n?<p>([\s\S]*?)<\/p>/g, (match, c1, c2) => {
        const plain1 = c1.replace(/<[^>]+>/g, '').trim();
        const plain2 = c2.replace(/<[^>]+>/g, '').trim();
        if (!plain1 || !plain2) return match;
        const endsSentence = /[.!?…]/.test(plain1.slice(-1));
        const startsLower = /\p{Ll}/u.test(plain2.slice(0, 1));
        if (!endsSentence && startsLower) {
          changed = true;
          return '<p>' + c1.trim() + ' ' + c2.trim() + '</p>';
        }
        return match;
      });
    }
    return result;
  }

  function buildChapterXhtml(meta, chapter){
    return '<?xml version="1.0" encoding="UTF-8"?>\n<!DOCTYPE html>\n' +
  '<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="' + meta.language + '">\n' +
  '<head>\n  <meta charset="utf-8"/>\n  <title>' + escapeXml(chapter.title) + '</title>\n' +
  '  <link rel="stylesheet" type="text/css" href="../styles/style.css"/>\n</head>\n' +
  '<body>\n' + mergeBrokenParagraphs(chapter.html) + '\n</body>\n</html>';
  }

  async function buildEpubBlob(metadata, chapters, css){
    const meta = {
      title: metadata.title || 'Không tên',
      author: metadata.author || 'Không rõ tác giả',
      language: metadata.language || 'vi',
      identifier: metadata.identifier || ('urn:uuid:' + (window.crypto && crypto.randomUUID ? crypto.randomUUID() : ('id-' + Date.now() + '-' + Math.random().toString(16).slice(2)))),
      publisher: metadata.publisher || ''
    };
    if (!chapters.length) throw new Error('Không có chương nào để đóng gói.');

    const zip = new window.JSZip();
    zip.file('mimetype', 'application/epub+zip', { compression: 'STORE' });

    const metaInf = zip.folder('META-INF');
    metaInf.file('container.xml', buildContainerXml());

    const oebps = zip.folder('OEBPS');
    oebps.file('content.opf', buildContentOpf(meta, chapters));
    oebps.file('nav.xhtml', buildNavXhtml(meta, chapters));
    oebps.file('toc.ncx', buildTocNcx(meta, chapters));

    oebps.folder('styles').file('style.css', css);

    const textFolder = oebps.folder('text');
    for (const chapter of chapters) {
      textFolder.file(chapter.fileName + '.xhtml', buildChapterXhtml(meta, chapter));
    }

    return zip.generateAsync({
      type: 'blob',
      mimeType: 'application/epub+zip',
      compression: 'DEFLATE',
      compressionOptions: { level: 9 }
    });
  }

  // ---- UI wiring ----
  const epubDrop = document.getElementById('epub-drop');
  const epubInput = document.getElementById('epub-input');
  const epubFileChip = document.getElementById('epub-file-chip');
  const epubChapterListEl = document.getElementById('epub-chapter-list');
  const epubParseStatus = document.getElementById('epub-parse-status');
  const epubMergePatternInput = document.getElementById('epub-merge-pattern');
  const epubTitleInput = document.getElementById('epub-title-input');
  const epubAuthorInput = document.getElementById('epub-author-input');
  const epubLangInput = document.getElementById('epub-lang-input');
  const epubPublisherInput = document.getElementById('epub-publisher-input');
  const epubOutNameInput = document.getElementById('epub-out-name');
  const epubOutNamePreview = document.getElementById('epub-out-name-preview');
  const epubProcessBtn = document.getElementById('epub-process-btn');
  const epubDownloadBtn = document.getElementById('epub-download-btn');
  const epubStatus = document.getElementById('epub-status');

  let epubRawFiles = [];   // one entry per .md file, parsed but not yet grouped
  let epubChapters = [];   // grouped chapters actually used to build the epub
  let epubBlob = null;

  function normalizeCharPreserveLength(text){
    let out = '';
    for (const ch of String(text || '')) {
      if (ch === 'đ' || ch === 'Đ') { out += 'd'; continue; }
      out += ch.normalize('NFD')[0].toLowerCase();
    }
    return out;
  }

  function isDecorationOnly(s){
    return /^[\s*_]*$/.test(s);
  }

  function stripDecoration(s){
    return String(s || '').replace(/^[\s*_]+|[\s*_]+$/g, '').trim();
  }

  function makeChapterMatcher(patternRaw){
    const pattern = (patternRaw || '').trim();
    if (!pattern) return null;
    const asRegex = pattern.match(/^\/(.+)\/([a-z]*)$/i);
    if (asRegex) {
      let re;
      try {
        const flags = asRegex[2].includes('g') ? asRegex[2] : asRegex[2] + 'g';
        re = new RegExp(asRegex[1], flags);
      } catch { return null; }
      return {
        locate(text, fromIndex){
          re.lastIndex = fromIndex || 0;
          const m = re.exec(String(text || ''));
          return m ? { index: m.index } : null;
        }
      };
    }
    const normPattern = normalizeCharPreserveLength(pattern);
    return {
      locate(text, fromIndex){
        const norm = normalizeCharPreserveLength(text);
        let from = fromIndex || 0;
        while (true) {
          const idx = norm.indexOf(normPattern, from);
          if (idx === -1) return null;
          const prevChar = idx > 0 ? norm[idx - 1] : '';
          if (idx === 0 || !/[a-z0-9]/.test(prevChar)) return { index: idx };
          from = idx + 1;
        }
      }
    };
  }

  function extractMarkerTitle(text, matchIndex, fallback){
    const rest = text.slice(matchIndex);
    const m = rest.match(/^(\S+(?:\s+[IVXLCDM]+|\s+\d+)?(?:\s*[:\-–—]\s*[^.?!\n]{0,40})?)/);
    const title = (m ? m[1] : rest.slice(0, 30)).trim();
    return title || fallback;
  }

  function pushIfLineStart(arr, text, blockIndex, matchIndex, type){
    const lastNewline = text.lastIndexOf('\n', matchIndex - 1);
    const lineStart = lastNewline === -1 ? 0 : lastNewline + 1;
    const prefix = text.slice(lineStart, matchIndex);
    if (isDecorationOnly(prefix)) arr.push({ blockIndex, offset: lineStart, type });
  }

  function makeMultiKeywordMatcher(keywords){
    const normKeywords = keywords.map(k => normalizeCharPreserveLength(k.trim())).filter(Boolean);
    return {
      locate(text, fromIndex){
        const norm = normalizeCharPreserveLength(text);
        let best = null;
        for (const nk of normKeywords) {
          let from = fromIndex || 0;
          while (true) {
            const idx = norm.indexOf(nk, from);
            if (idx === -1) break;
            const prevChar = idx > 0 ? norm[idx - 1] : '';
            if (idx === 0 || !/[a-z0-9]/.test(prevChar)) {
              if (best === null || idx < best.index) best = { index: idx, length: nk.length };
              break;
            }
            from = idx + 1;
          }
        }
        return best;
      }
    };
  }

  const DEFAULT_BACK_MATTER_KEYWORDS = ['lời cảm ơn', 'lời cám ơn', 'vĩ thanh', 'lời kết', 'mục lục'];

  const HEURISTIC_THRESHOLD = 5;
  function scoreHeadingCandidate(rawText){
    const plain = stripDecoration(rawText);
    if (!plain) return -99;
    const isBold = /^\*\*[\s\S]+\*\*$/.test(rawText.trim()) || /^__[\s\S]+__$/.test(rawText.trim());
    const len = plain.length;
    const wordCount = plain.split(/\s+/).filter(Boolean).length;
    const hasEndPunct = /[.!?,;:]$/.test(plain);
    const hasLetters = /[a-zA-ZÀ-ỹ]/.test(plain);
    const isAllCaps = hasLetters && plain === plain.toUpperCase() && plain !== plain.toLowerCase();

    let score = 0;
    if (isAllCaps) score += 3;
    if (len <= 40) score += 2;
    else if (len > 80) score -= 3;
    if (wordCount <= 6) score += 1;
    if (!hasEndPunct) score += 2;
    if (isBold) score += 2;
    if (/^[A-ZÀ-Ỹ]/.test(plain)) score += 1;
    return score;
  }

  function findAllMarkerPositionsCombined(blocks, chapterMatcher, useHeuristic, backMatterMatcher){
    const raw = [];
    for (let i = 0; i < blocks.length; i++) {
      const b = blocks[i];
      if (b.type !== 'heading' && b.type !== 'p') continue;

      if (useHeuristic) {
        if (!b.text.includes('\n') && scoreHeadingCandidate(b.text) >= HEURISTIC_THRESHOLD) {
          raw.push({ blockIndex: i, offset: 0, type: 'chapter' });
        }
      } else if (chapterMatcher) {
        let from = 0;
        while (true) {
          const loc = chapterMatcher.locate(b.text, from);
          if (!loc) break;
          pushIfLineStart(raw, b.text, i, loc.index, 'chapter');
          from = loc.index + 1;
        }
      }

      let from = 0;
      while (true) {
        const loc = backMatterMatcher.locate(b.text, from);
        if (!loc) break;
        pushIfLineStart(raw, b.text, i, loc.index, 'backmatter');
        from = loc.index + 1;
      }
    }
    raw.sort((a, b) => a.blockIndex - b.blockIndex || a.offset - b.offset);
    const deduped = [];
    for (const p of raw) {
      const last = deduped[deduped.length - 1];
      if (!last || last.blockIndex !== p.blockIndex || last.offset !== p.offset) deduped.push(p);
    }
    return deduped;
  }

  function extractChunkBlocks(blocks, start, end){
    const startBI = start ? start.blockIndex : 0;
    const startOff = start ? start.offset : 0;
    const lastBI = end ? end.blockIndex : blocks.length - 1;
    const result = [];
    for (let i = startBI; i <= lastBI; i++) {
      const b = blocks[i];
      if (!b) continue;
      if (b.type === 'heading' || b.type === 'p') {
        const sliceStart = (i === startBI) ? startOff : 0;
        const sliceEnd = (end && i === end.blockIndex) ? end.offset : b.text.length;
        const sub = b.text.slice(sliceStart, sliceEnd).trim();
        if (sub) result.push({ type: b.type, level: b.level, text: sub });
      } else {
        result.push(b);
      }
    }
    return result;
  }

  function groupChapters(rawFiles, patternRaw, useHeuristic, backMatterKeywordsRaw){
    const matcher = useHeuristic ? null : makeChapterMatcher(patternRaw);
    const backMatterKeywords = (backMatterKeywordsRaw || '').split(',').map(s => s.trim()).filter(Boolean);
    const backMatterMatcher = makeMultiKeywordMatcher(backMatterKeywords.length ? backMatterKeywords : DEFAULT_BACK_MATTER_KEYWORDS);

    const groups = [];
    let current = null;
    let seenMarker = false;
    let inBackMatter = false;

    for (const f of rawFiles) {
      if (inBackMatter) {
        const { html } = renderMarkdownBlocks(f.blocks);
        current.html += '\n' + html;
        current.sources.push(f.path);
        continue;
      }

      const cuts = findAllMarkerPositionsCombined(f.blocks, matcher, useHeuristic, backMatterMatcher);

      if (cuts.length === 0) {
        const { html, title } = renderMarkdownBlocks(f.blocks);
        const chapTitle = (title && title.trim()) || f.baseName;
        if ((matcher || useHeuristic) && seenMarker && current) {
          current.html += '\n' + html;
          current.sources.push(f.path);
        } else {
          current = { title: chapTitle, html, sources: [f.path] };
          groups.push(current);
        }
        continue;
      }

      const leadingBlocks = extractChunkBlocks(f.blocks, null, cuts[0]);
      if (leadingBlocks.length > 0) {
        const { html: leadHtml, title: leadTitle } = renderMarkdownBlocks(leadingBlocks);
        if (seenMarker && current) {
          current.html += '\n' + leadHtml;
          current.sources.push(f.path + ' (phần trước mốc)');
        } else {
          current = { title: (leadTitle && leadTitle.trim()) || f.baseName, html: leadHtml, sources: [f.path + ' (phần trước mốc)'] };
          groups.push(current);
        }
      }

      for (let k = 0; k < cuts.length; k++) {
        const cut = cuts[k];

        if (cut.type === 'backmatter') {
          const chunkBlocks = extractChunkBlocks(f.blocks, cut, null);
          const { html: chunkHtml } = renderMarkdownBlocks(chunkBlocks);
          let chunkTitle = f.baseName;
          if (chunkBlocks.length > 0) {
            const relLoc = backMatterMatcher.locate(chunkBlocks[0].text, 0);
            if (relLoc) {
              const matched = chunkBlocks[0].text.slice(relLoc.index, relLoc.index + relLoc.length).trim();
              chunkTitle = matched || f.baseName;
            }
          }
          current = { title: chunkTitle, html: chunkHtml, sources: [f.path + ' (phần cuối sách)'] };
          groups.push(current);
          inBackMatter = true;
          seenMarker = true;
          break;
        }

        const end = (k + 1 < cuts.length) ? cuts[k + 1] : null;
        const chunkBlocks = extractChunkBlocks(f.blocks, cut, end);
        const { html: chunkHtml } = renderMarkdownBlocks(chunkBlocks);
        let chunkTitle = f.baseName;
        if (chunkBlocks.length > 0) {
          if (useHeuristic) {
            chunkTitle = stripDecoration(chunkBlocks[0].text) || f.baseName;
          } else if (matcher) {
            const relLoc = matcher.locate(chunkBlocks[0].text, 0);
            if (relLoc) chunkTitle = extractMarkerTitle(chunkBlocks[0].text, relLoc.index, f.baseName);
          }
        }
        current = {
          title: chunkTitle,
          html: chunkHtml,
          sources: [f.path + (cuts.length > 1 || leadingBlocks.length > 0 ? ' (mốc ' + (k + 1) + '/' + cuts.length + ')' : '')]
        };
        groups.push(current);
        seenMarker = true;
      }
    }
    return groups;
  }

  function assignSequentialChapterIds(chapters){
    const width = Math.max(2, String(chapters.length).length);
    return chapters.map((c, idx) => {
      const num = String(idx + 1).padStart(width, '0');
      return Object.assign({}, c, { fileName: 'ch_' + num, xmlId: 'c' + num });
    });
  }

  function renderEpubChapterList(){
    if (epubChapters.length === 0) {
      epubChapterListEl.style.display = 'none';
      epubChapterListEl.innerHTML = '';
      return;
    }
    epubChapterListEl.style.display = 'block';
    epubChapterListEl.innerHTML = epubChapters.map((c) => {
      const mergedNote = c.sources.length > 1
        ? ' — gộp ' + c.sources.length + ' nguồn: ' + c.sources.join(', ')
        : ' — ' + c.sources[0];
      const rowText = c.fileName + '.xhtml' + mergedNote;
      return '<div class="md-row"><span class="path" title="' + rowText.replace(/"/g, '&quot;') + '">' + rowText + '</span><span class="count">' + c.title + '</span></div>';
    }).join('');
  }

  const epubHeuristicCheckbox = document.getElementById('epub-heuristic-mode');
  const epubBackMatterInput = document.getElementById('epub-backmatter-keywords');

  function applyEpubGrouping(){
    const grouped = groupChapters(
      epubRawFiles,
      epubMergePatternInput.value,
      epubHeuristicCheckbox.checked,
      epubBackMatterInput.value
    );
    epubChapters = assignSequentialChapterIds(grouped);
    renderEpubChapterList();
    if (epubRawFiles.length > 0) {
      const mergedCount = epubRawFiles.length - epubChapters.length;
      epubParseStatus.textContent = mergedCount > 0
        ? 'Có ' + epubRawFiles.length + ' file .md, gộp thành ' + epubChapters.length + ' chương.'
        : 'Tìm thấy ' + epubChapters.length + ' chương — kiểm tra thứ tự & tiêu đề bên trên trước khi đóng gói.';
      epubParseStatus.classList.remove('err');
      epubProcessBtn.disabled = epubChapters.length === 0;
    }
  }
  epubMergePatternInput.addEventListener('input', () => {
    if (epubRawFiles.length > 0) applyEpubGrouping();
  });
  epubHeuristicCheckbox.addEventListener('change', () => {
    if (epubRawFiles.length > 0) applyEpubGrouping();
  });
  epubBackMatterInput.addEventListener('input', () => {
    if (epubRawFiles.length > 0) applyEpubGrouping();
  });

  function updateEpubOutNamePreview(){
    const name = epubOutNameInput.value.trim() || 'ten-sach';
    epubOutNamePreview.textContent = ensureEpubExt(name);
  }
  epubOutNameInput.addEventListener('input', updateEpubOutNamePreview);

  ['dragover', 'dragenter'].forEach(evt => epubDrop.addEventListener(evt, e => { e.preventDefault(); epubDrop.classList.add('drag'); }));
  ['dragleave', 'drop'].forEach(evt => epubDrop.addEventListener(evt, () => epubDrop.classList.remove('drag')));
  epubDrop.addEventListener('drop', e => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) { epubInput.files = e.dataTransfer.files; handleEpubZipFile(f); }
  });
  epubInput.addEventListener('change', () => {
    if (epubInput.files[0]) handleEpubZipFile(epubInput.files[0]);
  });

  async function handleEpubZipFile(file){
    if (!/\.zip$/i.test(file.name)) {
      epubStatus.textContent = 'Vui lòng chọn một file .zip hợp lệ.';
      epubStatus.classList.add('err');
      return;
    }
    epubStatus.textContent = '';
    epubStatus.classList.remove('err');
    epubFileChip.textContent = file.name;
    epubOutNameInput.value = slugify(file.name);
    updateEpubOutNamePreview();
    epubTitleInput.value = epubTitleInput.value || slugify(file.name).replace(/-/g, ' ');
    epubProcessBtn.disabled = true;
    epubDownloadBtn.disabled = true;
    epubBlob = null;
    epubChapterListEl.style.display = 'none';
    epubChapterListEl.innerHTML = '';
    epubParseStatus.textContent = 'Đang đọc các chương .md…';
    epubParseStatus.classList.remove('err');

    try {
      const arrayBuffer = await file.arrayBuffer();
      const zip = await window.JSZip.loadAsync(arrayBuffer);
      const entries = Object.values(zip.files)
        .filter(e => !e.dir && /\.md$/i.test(e.name))
        .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));

      const rawFiles = [];
      for (const entry of entries) {
        const mdText = await entry.async('string');
        const baseName = entry.name.split('/').pop().replace(/\.md$/i, '');
        rawFiles.push({
          baseName: baseName.replace(/[-_]+/g, ' ').trim() || baseName,
          blocks: parseMarkdownBlocks(mdText),
          path: entry.name
        });
      }

      epubRawFiles = rawFiles;
      if (rawFiles.length === 0) {
        epubChapters = [];
        epubChapterListEl.style.display = 'none';
        epubChapterListEl.innerHTML = '';
        epubParseStatus.textContent = 'Không tìm thấy file .md nào trong .zip này.';
        epubParseStatus.classList.add('err');
        return;
      }

      applyEpubGrouping();
      epubProcessBtn.disabled = false;
    } catch (err) {
      console.error(err);
      epubParseStatus.textContent = 'Lỗi khi đọc .zip: ' + err.message;
      epubParseStatus.classList.add('err');
    }
  }

  epubProcessBtn.addEventListener('click', async () => {
    if (!epubChapters.length) return;
    epubProcessBtn.disabled = true;
    epubDownloadBtn.disabled = true;
    epubStatus.textContent = 'Đang đóng gói EPUB…';
    epubStatus.classList.remove('err');
    try {
      const metadata = {
        title: epubTitleInput.value.trim(),
        author: epubAuthorInput.value.trim(),
        language: epubLangInput.value.trim() || 'vi',
        publisher: epubPublisherInput.value.trim()
      };
      epubBlob = await buildEpubBlob(metadata, epubChapters, EPUB_CSS);
      epubStatus.textContent = 'Hoàn tất — ' + epubChapters.length + ' chương đã sẵn sàng.';
      epubDownloadBtn.disabled = false;
    } catch (err) {
      console.error(err);
      epubStatus.textContent = 'Có lỗi khi đóng gói: ' + err.message;
      epubStatus.classList.add('err');
    } finally {
      epubProcessBtn.disabled = false;
    }
  });

  epubDownloadBtn.addEventListener('click', () => {
    if (!epubBlob) return;
    const name = ensureEpubExt(epubOutNameInput.value.trim() || 'ten-sach');
    triggerDownload(epubBlob, name);
  });
}
