<script>
	import JSZip from 'jszip';
	import { slugify, ensureEpubExt, triggerDownload, escapeXml } from '$lib/helpers.js';

	// Constants & configuration from epub-packer.js
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

	// State variables (Svelte 5 runes)
	let epubFileSelected = $state(null);
	let epubRawFiles = $state([]);
	let epubChapters = $state([]);
	let epubBlob = $state(null);

	let mergePattern = $state('');
	let heuristicMode = $state(false);
	let heuristicStart = $state(null);
	let heuristicEnd = $state(null);
	let cleanKeywords = $state('{no}, {roman_no}');

	let title = $state('');
	let author = $state('');
	let lang = $state('vi');
	let publisher = $state('');
	let epubOutName = $state('');

	let status = $state('');
	let isError = $state(false);
	let parseStatus = $state('');
	let parseIsError = $state(false);
	let processing = $state(false);
	let isDragOver = $state(false);

	// Derived state
	let epubOutNamePreview = $derived(ensureEpubExt(epubOutName.trim() || 'ten-sach'));

	// Core parsing and processing logic helpers
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

	function parseMarkdownBlocks(md) {
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

	async function buildEpubBlob(metadata, chapters, css) {
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

	function cleanHeaderFooterOcr(text, keywords) {
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

	function groupChapters(rawFilesList, patternRaw, useHeuristic, startPage, endPage) {
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

	function assignSequentialChapterIds(chapters) {
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

	function applyEpubGrouping() {
		if (epubRawFiles.length === 0) return;
		
		const keywords = (cleanKeywords || '')
			.split(',')
			.map(s => s.trim())
			.filter(Boolean);
		
		const titleVal = title.trim();
		const authorVal = author.trim();
		if (titleVal) keywords.push(titleVal);
		if (authorVal) keywords.push(authorVal);

		const processedFiles = epubRawFiles.map(f => {
			const cleanedMd = cleanHeaderFooterOcr(f.rawText, keywords);
			return {
				path: f.path,
				baseName: f.baseName,
				blocks: parseMarkdownBlocks(cleanedMd)
			};
		});

		const startPage = parseInt(heuristicStart, 10) || 1;
		const endPage = parseInt(heuristicEnd, 10) || processedFiles.length;

		const grouped = groupChapters(
			processedFiles,
			mergePattern,
			heuristicMode,
			startPage,
			endPage
		);
		epubChapters = assignSequentialChapterIds(grouped);

		const mergedCount = epubRawFiles.length - grouped.length;
		parseStatus = mergedCount > 0
			? `Có ${epubRawFiles.length} tệp Markdown, gộp thành ${grouped.length} chương.`
			: `Tìm thấy ${grouped.length} chương — kiểm tra thứ tự & tiêu đề bên trên trước khi đóng gói.`;
		parseIsError = false;
	}

	function handleFile(file) {
		if (!file) return;
		if (!/\.zip$/i.test(file.name)) {
			parseStatus = 'Vui lòng chọn một tệp .ZIP hợp lệ.';
			parseIsError = true;
			return;
		}
		parseStatus = 'Đang đọc các chương Markdown...';
		parseIsError = false;
		epubFileSelected = file;
		epubOutName = slugify(file.name);
		title = title || slugify(file.name).replace(/-/g, ' ');
		epubBlob = null;
		epubChapters = [];
		epubRawFiles = [];

		loadZipContent(file);
	}

	async function loadZipContent(file) {
		try {
			const arrayBuffer = await file.arrayBuffer();
			const zip = await JSZip.loadAsync(arrayBuffer);
			const entries = Object.values(zip.files)
				.filter(e => !e.dir && /\.md$/i.test(e.name))
				.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));

			const rawFiles = [];
			for (const entry of entries) {
				const mdText = await entry.async('string');
				const baseName = entry.name.split('/').pop().replace(/\.md$/i, '');
				rawFiles.push({
					baseName: baseName.replace(/[-_]+/g, ' ').trim() || baseName,
					rawText: mdText,
					path: entry.name
				});
			}

			epubRawFiles = rawFiles;
			if (rawFiles.length === 0) {
				epubChapters = [];
				parseStatus = 'Không tìm thấy tệp Markdown nào trong tệp .ZIP này.';
				parseIsError = true;
			}
		} catch (err) {
			console.error(err);
			parseStatus = 'Lỗi khi đọc tệp .ZIP: ' + err.message;
			parseIsError = true;
		}
	}

	function handleDragOver(e) {
		e.preventDefault();
		isDragOver = true;
	}

	function handleDragLeave() {
		isDragOver = false;
	}

	function handleDrop(e) {
		e.preventDefault();
		isDragOver = false;
		const file = e.dataTransfer?.files[0];
		if (file) handleFile(file);
	}

	function handleFileChange(e) {
		const file = e.target.files?.[0];
		if (file) handleFile(file);
	}

	async function processEpub() {
		if (epubChapters.length === 0) return;
		processing = true;
		epubBlob = null;
		status = 'Đang đóng gói EPUB…';
		isError = false;

		try {
			const metadata = {
				title: title.trim(),
				author: author.trim(),
				language: lang.trim() || 'vi',
				publisher: publisher.trim()
			};
			epubBlob = await buildEpubBlob(metadata, epubChapters, EPUB_CSS);
			status = `Hoàn tất — ${epubChapters.length} chương đã sẵn sàng.`;
		} catch (err) {
			console.error(err);
			status = 'Có lỗi khi đóng gói: ' + err.message;
			isError = true;
		} finally {
			processing = false;
		}
	}

	function downloadEpub() {
		if (!epubBlob) return;
		triggerDownload(epubBlob, epubOutNamePreview);
	}

	// Reactive loop for auto-grouping when configs change
	$effect(() => {
		if (epubRawFiles.length > 0) {
			applyEpubGrouping();
		}
	});
</script>

<svelte:head>
	<title>Đóng gói EPUB — Ebook Forge</title>
</svelte:head>

<div class="mb-10 animate-fade-in">
	<h1 class="font-mono text-3xl font-bold mb-2 tracking-tight text-text-color">Đóng gói EPUB</h1>
	<p class="text-text-mute text-base max-w-xl leading-relaxed">Gộp các chương Markdown thành một tệp sách điện tử .EPUB hoàn chỉnh.</p>
</div>

<div class="modern-card rounded-2xl p-7 mb-6">
	<span class="font-mono text-xs tracking-wider text-text-mute uppercase mb-3 block">Tệp .ZIP chứa các chương (.md)</span>
	<div
		class="border border-dashed border-border-color rounded-xl p-10 text-center cursor-pointer transition-colors relative {isDragOver ? 'border-accent-color bg-accent-soft/30' : 'hover:border-accent-color hover:bg-accent-soft/10'}"
		ondragover={handleDragOver}
		ondragleave={handleDragLeave}
		ondrop={handleDrop}
	>
		<input type="file" accept=".zip,application/zip" class="absolute inset-0 opacity-0 cursor-pointer w-full h-full" onchange={handleFileChange} />
		<p class="text-base font-semibold mb-1">Kéo thả hoặc click để chọn tệp .ZIP</p>
		<p class="text-sm text-text-mute">Tự động sắp xếp và tạo XHTML chương tuần tự 01, 02...</p>
		{#if epubFileSelected}
			<p class="font-mono text-sm text-amber-color mt-3 break-all">{epubFileSelected.name}</p>
		{/if}
	</div>

	{#if epubRawFiles.length > 0}
		<div class="mt-5 animate-fade-in">
			<span class="font-mono text-xs text-text-mute uppercase mb-1.5 block">Từ khóa nhận diện tiêu đề chương mới</span>
			<input type="text" bind:value={mergePattern} class="w-full bg-panel-2 border border-border-color text-text-color font-mono text-sm py-2.5 px-3.5 rounded-xl outline-none focus:border-accent-color" placeholder="Ví dụ: chương — để trống nếu mỗi tệp là 1 chương" />
		</div>

		<div class="flex items-center gap-3 mt-5">
			<input type="checkbox" id="epub-heuristic-mode" bind:checked={heuristicMode} class="w-4 h-4 accent-accent-color cursor-pointer" />
			<div>
				<label for="epub-heuristic-mode" class="text-sm text-text-color cursor-pointer font-medium">Nhận diện bằng Heuristic thông minh</label>
				<span class="block text-xs text-text-mute mt-0.5">Tính điểm tiêu đề dựa trên chữ viết HOA, độ dài và dấu câu</span>
			</div>
		</div>

		{#if heuristicMode}
			<div class="flex items-center gap-3 mt-4 flex-wrap animate-fade-in">
				<span class="font-mono text-sm text-text-mute">Giới hạn Heuristic từ trang</span>
				<input type="number" bind:value={heuristicStart} class="bg-brand-bg border border-border-color text-text-color font-mono text-sm py-1.5 px-3 rounded-xl w-20 text-center outline-none focus:border-accent-color" min="1" placeholder="Đầu" />
				<span class="font-mono text-sm text-text-mute">đến trang</span>
				<input type="number" bind:value={heuristicEnd} class="bg-brand-bg border border-border-color text-text-color font-mono text-sm py-1.5 px-3 rounded-xl w-20 text-center outline-none focus:border-accent-color" min="1" placeholder="Cuối" />
			</div>
		{/if}

		<div class="mt-5">
			<span class="font-mono text-xs text-text-mute uppercase mb-1.5 block">Lọc Header/Footer (Tùy chọn)</span>
			<input type="text" bind:value={cleanKeywords} class="w-full bg-panel-2 border border-border-color text-text-color font-mono text-sm py-2.5 px-3.5 rounded-xl outline-none focus:border-accent-color" placeholder="Tên sách, Nhà xuất bản" />
		</div>
	{/if}

	{#if epubChapters.length > 0}
		<div class="mt-5 border border-border-color rounded-xl max-h-[240px] overflow-y-auto bg-brand-bg p-4 font-mono text-sm animate-fade-in">
			{#each epubChapters as chapter (chapter.xmlId)}
				<div class="flex justify-between gap-4 p-3.5 font-mono text-[12px] border-b border-border-color last:border-b-0">
					<span class="text-text-color overflow-hidden text-ellipsis whitespace-nowrap" title="{chapter.fileName}.xhtml — {chapter.sources.length > 1 ? `gộp ${chapter.sources.length} nguồn: ${chapter.sources.join(', ')}` : chapter.sources[0]}">
						{chapter.fileName}.xhtml — {chapter.sources.length > 1 ? `gộp ${chapter.sources.length} nguồn` : chapter.sources[0]}
					</span>
					<span class="text-amber-color shrink-0">{chapter.title}</span>
				</div>
			{/each}
		</div>
	{/if}

	{#if parseStatus}
		<div class="font-mono text-sm mt-3 {parseIsError ? 'text-red-500' : 'text-text-mute'}">{parseStatus}</div>
	{/if}
</div>

{#if epubRawFiles.length > 0}
	<div class="modern-card rounded-2xl p-7 mb-6 animate-fade-in">
		<span class="font-mono text-xs tracking-wider text-text-mute uppercase mb-3 block">Siêu dữ liệu sách (Metadata)</span>
		<div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
			<div>
				<span class="font-mono text-xs text-text-mute uppercase mb-1.5 block">Tiêu đề sách</span>
				<input type="text" bind:value={title} class="w-full bg-panel-2 border border-border-color text-text-color font-mono text-sm py-2.5 px-3.5 rounded-xl outline-none focus:border-accent-color" placeholder="Nhập tên sách" />
			</div>
			<div>
				<span class="font-mono text-xs text-text-mute uppercase mb-1.5 block">Tác giả</span>
				<input type="text" bind:value={author} class="w-full bg-panel-2 border border-border-color text-text-color font-mono text-sm py-2.5 px-3.5 rounded-xl outline-none focus:border-accent-color" placeholder="Tên tác giả" />
			</div>
			<div>
				<span class="font-mono text-xs text-text-mute uppercase mb-1.5 block">Ngôn ngữ</span>
				<input type="text" bind:value={lang} class="w-full bg-panel-2 border border-border-color text-text-color font-mono text-sm py-2.5 px-3.5 rounded-xl outline-none focus:border-accent-color" />
			</div>
			<div>
				<span class="font-mono text-xs text-text-mute uppercase mb-1.5 block">Nhà xuất bản</span>
				<input type="text" bind:value={publisher} class="w-full bg-panel-2 border border-border-color text-text-color font-mono text-sm py-2.5 px-3.5 rounded-xl outline-none focus:border-accent-color" placeholder="NXB Ebook" />
			</div>
		</div>
	</div>

	<div class="modern-card rounded-2xl p-7 mb-6 animate-fade-in">
		<div class="mb-5">
			<span class="font-mono text-xs text-text-mute uppercase mb-1.5 block">Tên tệp EPUB đầu ra (.epub)</span>
			<input type="text" bind:value={epubOutName} class="w-full bg-panel-2 border border-border-color text-text-color font-mono text-sm py-3 px-4 rounded-xl outline-none focus:border-accent-color" placeholder="ten-sach" />
			<p class="text-sm text-text-mute mt-2">Tệp tải về: <span class="text-text-color font-mono">{epubOutNamePreview}</span></p>
		</div>

		<div class="flex items-center gap-4 mt-6">
			<button 
				class="btn font-mono text-sm tracking-wide py-3 px-6 rounded-xl bg-accent-color text-white font-semibold cursor-pointer transition-all duration-150 hover:bg-accent-hover disabled:opacity-30 disabled:cursor-not-allowed" 
				onclick={processEpub} 
				disabled={epubChapters.length === 0 || processing}
			>
				{processing ? 'Đang đóng gói...' : 'Đóng gói tệp EPUB'}
			</button>
			<button 
				class="bg-panel-2 text-amber-color border border-border-color hover:border-amber-color font-mono text-sm py-3 px-6 rounded-xl cursor-pointer transition-colors disabled:opacity-30 disabled:cursor-not-allowed" 
				onclick={downloadEpub} 
				disabled={!epubBlob}
			>Tải tệp .EPUB</button>
		</div>

		{#if status}
			<div class="font-mono text-sm mt-4 {isError ? 'text-red-500' : 'text-text-mute'}">{status}</div>
		{/if}
	</div>
{/if}

<style>
	.animate-fade-in {
		animation: fadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
	}
	@keyframes fadeIn {
		from { opacity: 0; transform: translateY(6px); }
		to { opacity: 1; transform: translateY(0); }
	}
</style>
