import JSZip from 'jszip';
import { escapeXml } from '../helpers/helpers.js';

export const EPUB_CSS = `@page {
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

  aside.footnote {
    display: block;
    color: green; 
    padding-bottom: 0.5em;
  }

  div#book-columns aside.footnote { 	
      display: none; 	
  }

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

const HEURISTIC_THRESHOLD = 5;

function convertInline(text) {
	const codeSpans = [];
	let t = String(text).replace(/`([^`]+)`/g, (m, code) => {
		codeSpans.push(code);
		return '___CODESPAN___' + (codeSpans.length - 1) + '___CODESPAN___';
	});
	t = escapeXml(t);
	t = t.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (m, alt, src) => '<img alt="' + alt + '" src="' + src + '"/>');
	t = t.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (m, txt, href) => '<a href="' + href + '">' + txt + '</a>');
	
	const INLINE_SPAN = '[\\s\\S]{1,150}?';
	t = t.replace(new RegExp('\\*\\*\\*(' + INLINE_SPAN + ')\\*\\*\\*', 'g'), (m, s) => '<strong><em>' + s + '</em></strong>');
	t = t.replace(new RegExp('___(' + INLINE_SPAN + ')___', 'g'), (m, s) => '<strong><em>' + s + '</em></strong>');
	t = t.replace(new RegExp('\\*\\*_(' + INLINE_SPAN + ')_\\*\\*', 'g'), (m, s) => '<strong><em>' + s + '</em></strong>');
	t = t.replace(new RegExp('__\\*(' + INLINE_SPAN + ')\\*__', 'g'), (m, s) => '<strong><em>' + s + '</em></strong>');
	t = t.replace(new RegExp('\\*\\*(' + INLINE_SPAN + ')\\*\\*', 'g'), (m, s) => '<strong>' + s + '</strong>');
	t = t.replace(new RegExp('(?<![\\w_])__(' + INLINE_SPAN + ')__(?![\\w_])', 'g'), (m, s) => '<strong>' + s + '</strong>');
	t = t.replace(new RegExp('(?<!\\*)\\*(?!\\*)(' + INLINE_SPAN + ')(?<!\\*)\\*(?!\\*)', 'g'), (m, s) => '<em>' + s + '</em>');
	t = t.replace(new RegExp('(?<![\\w_])_(?!_)(' + INLINE_SPAN + ')(?<!_)_(?![\\w_])', 'g'), (m, s) => '<em>' + s + '</em>');
	
	t = t.replace(/___CODESPAN___(\d+)___CODESPAN___/g, (m, idx) => '<code>' + escapeXml(codeSpans[Number(idx)]) + '</code>');
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

export function parseMarkdownBlocks(md) {
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

function renderMarkdownBlocks(blocks) {
	let html = '';
	let t = null;
	for (const b of blocks) {
		if (b.type === 'heading') {
			if (t === null && (b.level === 1 || b.level === 2)) t = b.text;
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
	return { html, title: t };
}

function buildContainerXml() {
	return '<?xml version="1.0" encoding="UTF-8"?>\n' +
		'<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">\n' +
		'  <rootfiles>\n' +
		'    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>\n' +
		'  </rootfiles>\n' +
		'</container>';
}

function buildContentOpf(meta, chapters) {
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

function buildNavXhtml(meta, chapters) {
	const items = chapters.map(c => '<li><a href="text/' + c.fileName + '.xhtml">' + escapeXml(c.title) + '</a></li>').join('\n      ');
	return '<?xml version="1.0" encoding="UTF-8"?>\n<!DOCTYPE html>\n' +
		'<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="' + meta.language + '">\n' +
		'<head>\n  <meta charset="utf-8"/>\n  <title>Mục lục</title>\n  <link rel="stylesheet" type="text/css" href="styles/style.css"/>\n</head>\n' +
		'<body>\n  <nav epub:type="toc" id="toc">\n    <h1>Mục lục</h1>\n    <ol>\n      ' + items + '\n    </ol>\n  </nav>\n</body>\n</html>';
}

function buildTocNcx(meta, chapters) {
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

function mergeBrokenParagraphs(html) {
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

function buildChapterXhtml(meta, chapter) {
	return '<?xml version="1.0" encoding="UTF-8"?>\n<!DOCTYPE html>\n' +
		'<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="' + meta.language + '">\n' +
		'<head>\n  <meta charset="utf-8"/>\n  <title>' + escapeXml(chapter.title) + '</title>\n' +
		'  <link rel="stylesheet" type="text/css" href="../styles/style.css"/>\n</head>\n' +
		'<body>\n' + mergeBrokenParagraphs(chapter.html) + '\n</body>\n</html>';
}

export async function buildEpubBlob(metadata, chapters, css) {
	const meta = {
		title: metadata.title || 'Không tên',
		author: metadata.author || 'Không rõ tác giả',
		language: metadata.language || 'vi',
		identifier: metadata.identifier || ('urn:uuid:' + (window.crypto && crypto.randomUUID ? crypto.randomUUID() : ('id-' + Date.now() + '-' + Math.random().toString(16).slice(2)))),
		publisher: metadata.publisher || ''
	};
	if (!chapters.length) throw new Error('Không có chương nào để đóng gói.');

	const zip = new JSZip();
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

function normalizeCharPreserveLength(text) {
	let out = '';
	for (const ch of String(text || '')) {
		if (ch === 'đ' || ch === 'Đ') { out += 'd'; continue; }
		out += ch.normalize('NFD')[0].toLowerCase();
	}
	return out;
}

function isDecorationOnly(s) {
	return /^[\s*_]*$/.test(s);
}

export function cleanHeaderFooterOcr(text, keywords) {
	const lines = String(text).replace(/\r\n/g, '\n').split('\n');
	if (lines.length === 0) return text;

	const cleanArabic = keywords.some(k => k.trim().toLowerCase() === '{no}');
	const cleanRoman = keywords.some(k => k.trim().toLowerCase() === '{roman_no}');

	const filteredKeywords = keywords.filter(k => {
		const trimmed = k.trim().toLowerCase();
		return trimmed !== '{no}' && trimmed !== '{roman_no}';
	});

	const normKeywords = filteredKeywords
		.map(k => String(k).trim())
		.filter(Boolean)
		.map(k => normalizeCharPreserveLength(k).replace(/[^a-z0-9]/g, ''));

	function isHeaderFooter(line) {
		const trimmed = line.trim();
		if (!trimmed) return false;

		if (cleanArabic) {
			if (/^[-—–~]*\s*\d+\s*[-—–~]*$/.test(trimmed)) return true;
		}

		if (cleanRoman) {
			if (/^[ivxldcmIVXLDCM]+[-—–~]*$/.test(trimmed)) return true;
		}

		if (normKeywords.length > 0) {
			const normLine = normalizeCharPreserveLength(trimmed).replace(/[^a-z0-9]/g, '');
			if (normLine) {
				for (const nk of normKeywords) {
					if (normLine === nk || (nk.length > 3 && (normLine.includes(nk) || nk.includes(normLine)))) {
						return true;
					}
				}
			}
		}
		return false;
	}

	const linesToRemove = [];
	for (let i = 0; i < Math.min(3, lines.length); i++) {
		if (isHeaderFooter(lines[i])) linesToRemove.push(i);
	}
	for (let i = lines.length - 1; i >= Math.max(0, lines.length - 3); i--) {
		if (isHeaderFooter(lines[i])) linesToRemove.push(i);
	}

	const resultLines = lines.filter((_, idx) => !linesToRemove.includes(idx));
	return resultLines.join('\n');
}

function stripDecoration(s) {
	return String(s || '').replace(/^[\s*_]+|[\s*_]+$/g, '').trim();
}

function makeChapterMatcher(patternRaw) {
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
			locate(text, fromIndex) {
				re.lastIndex = fromIndex || 0;
				const m = re.exec(String(text || ''));
				return m ? { index: m.index } : null;
			}
		};
	}
	const normPattern = normalizeCharPreserveLength(pattern);
	return {
		locate(text, fromIndex) {
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

function extractMarkerTitle(text, matchIndex, fallback) {
	const rest = text.slice(matchIndex);
	const m = rest.match(/^(\S+(?:\s+[IVXLCDM]+|\s+\d+)?(?:\s*[:\-–—]\s*[^.?!\n]{0,40})?)/);
	const t = (m ? m[1] : rest.slice(0, 30)).trim();
	return t || fallback;
}

function pushIfLineStart(arr, text, blockIndex, matchIndex, type) {
	const lastNewline = text.lastIndexOf('\n', matchIndex - 1);
	const lineStart = lastNewline === -1 ? 0 : lastNewline + 1;
	const prefix = text.slice(lineStart, matchIndex);
	if (isDecorationOnly(prefix)) arr.push({ blockIndex, offset: lineStart, type });
}

function scoreHeadingCandidate(rawText) {
	const plain = rawText.replace(/^[\s*_“"‘«]+|[\s*_”"’»]+$/g, '').trim();
	if (!plain) return -99;
	if (/^[-—–~]\s+\S+/.test(plain)) return -99;

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

	if (hasEndPunct) score -= 5;
	if (/[\x22\x27“”‘’«»]/.test(rawText)) score -= 5;

	return score;
}

function findAllMarkerPositionsCombined(blocks, chapterMatcher, useHeuristic, limitOneChapter) {
	const raw = [];
	let foundChapter = false;
	for (let i = 0; i < blocks.length; i++) {
		const b = blocks[i];
		if (b.type !== 'heading' && b.type !== 'p') continue;

		if (!limitOneChapter || !foundChapter) {
			let isFirstNonEmpty = true;
			if (limitOneChapter) {
				for (let prev = 0; prev < i; prev++) {
					const pb = blocks[prev];
					if (pb && pb.text && pb.text.trim()) {
						isFirstNonEmpty = false;
						break;
					}
				}
			}

			if (isFirstNonEmpty) {
				if (useHeuristic) {
					if (!b.text.includes('\n') && scoreHeadingCandidate(b.text) >= HEURISTIC_THRESHOLD) {
						raw.push({ blockIndex: i, offset: 0, type: 'chapter' });
						foundChapter = true;
					}
				} else if (chapterMatcher) {
					let from = 0;
					while (true) {
						const loc = chapterMatcher.locate(b.text, from);
						if (!loc) break;
						pushIfLineStart(raw, b.text, i, loc.index, 'chapter');
						foundChapter = true;
						if (limitOneChapter) break;
						from = loc.index + 1;
					}
				}
			}
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

function extractChunkBlocks(blocks, start, end) {
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

export function groupChapters(rawFilesList, patternRaw, useHeuristic, startPage, endPage) {
	const matcher = useHeuristic ? null : makeChapterMatcher(patternRaw);
	const groups = [];
	let current = null;
	let seenMarker = false;

	for (let idx = 0; idx < rawFilesList.length; idx++) {
		const f = rawFilesList[idx];
		const pageNum = idx + 1;
		const isHeuristicActive = useHeuristic && (pageNum >= startPage && pageNum <= endPage);
		const limitOneChapter = rawFilesList.length > 1;
		const cuts = findAllMarkerPositionsCombined(f.blocks, matcher, isHeuristicActive, limitOneChapter);

		if (cuts.length === 0) {
			const { html, title: t } = renderMarkdownBlocks(f.blocks);
			const chapTitle = (t && t.trim()) || f.baseName;
			if ((matcher || isHeuristicActive) && seenMarker && current) {
				current.html += '\n' + html;
				current.sources.push(f.path);
			} else {
				current = {
					title: chapTitle,
					html,
					sources: [f.path],
					isChapter: false,
					firstSourcePageNum: pageNum
				};
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
				current = {
					title: (leadTitle && leadTitle.trim()) || f.baseName,
					html: leadHtml,
					sources: [f.path + ' (phần trước mốc)'],
					isChapter: false,
					firstSourcePageNum: pageNum
				};
				groups.push(current);
			}
		}

		for (let k = 0; k < cuts.length; k++) {
			const cut = cuts[k];
			const end = (k + 1 < cuts.length) ? cuts[k + 1] : null;
			const chunkBlocks = extractChunkBlocks(f.blocks, cut, end);
			const { html: chunkHtml } = renderMarkdownBlocks(chunkBlocks);
			let chunkTitle = f.baseName;
			if (chunkBlocks.length > 0) {
				if (isHeuristicActive) {
					chunkTitle = stripDecoration(chunkBlocks[0].text) || f.baseName;
				} else if (matcher) {
					const relLoc = matcher.locate(chunkBlocks[0].text, 0);
					if (relLoc) chunkTitle = extractMarkerTitle(chunkBlocks[0].text, relLoc.index, f.baseName);
				}
			}
			current = {
				title: chunkTitle,
				html: chunkHtml,
				sources: [f.path + (cuts.length > 1 || leadingBlocks.length > 0 ? ' (mốc ' + (k + 1) + '/' + cuts.length + ')' : '')],
				isChapter: true,
				firstSourcePageNum: pageNum
			};
			groups.push(current);
			seenMarker = true;
		}
	}
	return groups;
}

export function assignSequentialChapterIds(chapters) {
	let chapCount = 0;
	const width = Math.max(2, String(chapters.length).length);
	return chapters.map((c) => {
		if (c.isChapter) {
			chapCount++;
		}
		const fileName = c.isChapter
			? 'chap_' + String(chapCount).padStart(width, '0')
			: 'p' + String(c.firstSourcePageNum).padStart(width, '0');
		const xmlId = c.isChapter
			? 'chap' + String(chapCount).padStart(width, '0')
			: 'p' + String(c.firstSourcePageNum).padStart(width, '0');
		return { ...c, fileName, xmlId };
	});
}
