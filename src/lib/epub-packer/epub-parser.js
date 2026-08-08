import { escapeXml } from '$lib/helpers/helpers.js';

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
	t = t.replace(new RegExp('(?<![\\w_])_(?!_)(' + INLINE_SPAN + ')$(?<!_)_(?![\\w_])', 'g'), (m, s) => '<em>' + s + '</em>');
	
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

export function renderMarkdownBlocks(blocks) {
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

function isRealParagraph(line) {
	const trim = line.trim();
	if (!trim) return false;
	const endsSentence = /[.!?…”"’]/.test(trim.slice(-1));
	const wordCount = trim.split(/\s+/).filter(Boolean).length;
	return endsSentence && (wordCount > 5 || trim.length > 30);
}

function shouldSkipHeaderFooter(lines, normKeywords = []) {
	if (lines.length < 6) return true;
	if (normKeywords && normKeywords.length > 0) return false;
	const first = lines.find(l => l.trim()) || '';
	let last = '';
	for (let i = lines.length - 1; i >= 0; i--) {
		if (lines[i].trim()) {
			last = lines[i];
			break;
		}
	}
	return isRealParagraph(first) || isRealParagraph(last);
}

function compileCleanKeywords(keywords) {
	let keywordsList = [];
	if (Array.isArray(keywords)) {
		keywordsList = keywords;
	} else if (typeof keywords === 'string') {
		keywordsList = keywords.split(',').map(s => s.trim()).filter(Boolean);
	}

	const cleanArabic = keywordsList.some(k => k.trim().toLowerCase() === '{no}');
	const cleanRoman = keywordsList.some(k => k.trim().toLowerCase() === '{roman_no}');

	const filteredKeywords = keywordsList.filter(k => {
		const trimmed = k.trim().toLowerCase();
		return trimmed !== '{no}' && trimmed !== '{roman_no}';
	});

	const normKeywords = filteredKeywords
		.map(k => String(k).trim())
		.filter(Boolean)
		.map(k => normalizeCharPreserveLength(k).replace(/[^a-z0-9]/g, ''));

	return { cleanArabic, cleanRoman, normKeywords };
}

function isLineHeaderFooter(line, cleanArabic, cleanRoman, normKeywords) {
	const trimmed = line.trim();
	if (!trimmed) return false;

	if (cleanArabic) {
		if (/^[-—–~]*\s*\d+\s*[-—–~]*$/.test(trimmed)) return true;
	}

	if (cleanRoman) {
		if (/^[ivxldcmIVXLDCM]+[-—–~]*$/.test(trimmed)) return true;
	}

	if (normKeywords && normKeywords.length > 0) {
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

export function cleanHeaderFooterOcr(text, keywords, lineLimit = 2) {
	const lines = String(text).replace(/\r\n/g, '\n').split('\n');
	const { cleanArabic, cleanRoman, normKeywords } = compileCleanKeywords(keywords);
	if (shouldSkipHeaderFooter(lines, normKeywords)) return text;

	const linesToRemove = [];
	for (let i = 0; i < Math.min(lineLimit, lines.length); i++) {
		if (isLineHeaderFooter(lines[i], cleanArabic, cleanRoman, normKeywords)) linesToRemove.push(i);
	}
	for (let i = lines.length - 1; i >= Math.max(0, lines.length - lineLimit); i--) {
		if (isLineHeaderFooter(lines[i], cleanArabic, cleanRoman, normKeywords)) linesToRemove.push(i);
	}

	const resultLines = lines.filter((_, idx) => !linesToRemove.includes(idx));
	return resultLines.join('\n');
}

export function getCleanedLinesReport(rawFilesList, keywords, lineLimit = 2) {
	const report = [];
	const { cleanArabic, cleanRoman, normKeywords } = compileCleanKeywords(keywords);

	for (let idx = 0; idx < rawFilesList.length; idx++) {
		const f = rawFilesList[idx];
		const lines = String(f.rawText).replace(/\r\n/g, '\n').split('\n');
		if (shouldSkipHeaderFooter(lines, normKeywords)) continue;

		const scanned = [];
		for (let i = 0; i < Math.min(lineLimit, lines.length); i++) {
			scanned.push({
				lineNum: i + 1,
				text: lines[i],
				location: 'Đầu file',
				isRemoved: isLineHeaderFooter(lines[i], cleanArabic, cleanRoman, normKeywords)
			});
		}
		for (let i = lines.length - 1; i >= Math.max(0, lines.length - lineLimit); i--) {
			if (i < lineLimit) continue; 
			scanned.push({
				lineNum: i + 1,
				text: lines[i],
				location: 'Cuối file',
				isRemoved: isLineHeaderFooter(lines[i], cleanArabic, cleanRoman, normKeywords)
			});
		}

		scanned.sort((a, b) => a.lineNum - b.lineNum);

		if (scanned.length > 0) {
			report.push({
				fileName: f.baseName,
				scanned
			});
		}
	}
	return report;
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

function findAllMarkerPositionsCombined(blocks, chapterMatcher, useHeuristic, limitOneChapter, heuristicThreshold = 5) {
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
					if (!b.text.includes('\n') && scoreHeadingCandidate(b.text) >= heuristicThreshold) {
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

export function groupChapters(rawFilesList, patternRaw, useHeuristic, startPage, endPage, heuristicThreshold = 5) {
	const matcher = useHeuristic ? null : makeChapterMatcher(patternRaw);
	const groups = [];
	let current = null;
	let seenMarker = false;

	for (let idx = 0; idx < rawFilesList.length; idx++) {
		const f = rawFilesList[idx];
		const pageNum = idx + 1;
		const isHeuristicActive = useHeuristic && (pageNum >= startPage && pageNum <= endPage);
		const limitOneChapter = rawFilesList.length > 1;
		const cuts = findAllMarkerPositionsCombined(f.blocks, matcher, isHeuristicActive, limitOneChapter, heuristicThreshold);

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

export function analyzeChapterCandidates(rawFilesList, patternRaw, useHeuristic, startPage, endPage, heuristicThreshold = 5) {
	const matcher = useHeuristic ? null : makeChapterMatcher(patternRaw);
	const candidates = [];

	for (let idx = 0; idx < rawFilesList.length; idx++) {
		const f = rawFilesList[idx];
		const pageNum = idx + 1;
		const isHeuristicActive = useHeuristic && (pageNum >= startPage && pageNum <= endPage);

		for (let i = 0; i < f.blocks.length; i++) {
			const b = f.blocks[i];
			if (b.type !== 'heading' && b.type !== 'p') continue;

			const score = scoreHeadingCandidate(b.text);
			
			let regexMatch = false;
			if (matcher) {
				const loc = matcher.locate(b.text, 0);
				if (loc) {
					const lastNewline = b.text.lastIndexOf('\n', loc.index - 1);
					const lineStart = lastNewline === -1 ? 0 : lastNewline + 1;
					const prefix = b.text.slice(lineStart, loc.index);
					if (isDecorationOnly(prefix)) regexMatch = true;
				}
			}

			const heuristicMatch = isHeuristicActive && !b.text.includes('\n') && score >= heuristicThreshold;
			const isMatch = regexMatch || heuristicMatch;
			
			if (b.type === 'heading' || score > -10 || isMatch) {
				const nextBlocks = [];
				let count = 0;
				for (let j = i + 1; j < f.blocks.length && count < 2; j++) {
					if (f.blocks[j].text && f.blocks[j].text.trim()) {
						nextBlocks.push(f.blocks[j].text.slice(0, 150) + (f.blocks[j].text.length > 150 ? '...' : ''));
						count++;
					}
				}

				candidates.push({
					pageNum,
					fileName: f.baseName,
					blockIndex: i,
					text: b.text,
					type: b.type,
					score: score,
					regexMatch,
					heuristicMatch,
					isMatch,
					snippet: nextBlocks.join('\n\n')
				});
			}
		}
	}
	return candidates;
}

function escapeRegExp(str) {
	return String(str || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function convertTxtInline(text, rules = {}) {
	const h2Delim = (rules.h2Delim || '#').trim();
	const emDelim = (rules.emDelim || '*').trim();
	const strongDelim = (rules.strongDelim || '**').trim();

	let t = escapeXml(String(text || ''));

	if (strongDelim) {
		const reStrong = new RegExp(escapeRegExp(strongDelim) + '(.+?)' + escapeRegExp(strongDelim), 'g');
		t = t.replace(reStrong, (m, content) => '<strong>' + content + '</strong>');
	}

	if (h2Delim) {
		const reH2 = new RegExp(escapeRegExp(h2Delim) + '(.+?)' + escapeRegExp(h2Delim), 'g');
		t = t.replace(reH2, (m, content) => '<h2>' + content + '</h2>');
	}

	if (emDelim) {
		const reEm = new RegExp(escapeRegExp(emDelim) + '(.+?)' + escapeRegExp(emDelim), 'g');
		t = t.replace(reEm, (m, content) => '<em>' + content + '</em>');
	}

	return t;
}

export function normalizeMultiLineChapterTags(text, h1Delim = '##') {
	const delim = (h1Delim || '##').trim();
	if (!delim) return String(text || '');
	const escaped = escapeRegExp(delim);
	const reMulti = new RegExp(escaped + '([\\s\\S]{1,300}?)' + escaped, 'g');
	return String(text || '').replace(reMulti, (m, inner) => {
		const cleanedInner = inner.replace(/\r?\n\s*/g, ' ').trim();
		return delim + cleanedInner + delim;
	});
}

export function parseTxtToChapters(rawText, rules = {}, fallbackTitle = 'Chương 1') {
	const h1Delim = (rules.h1Delim || '##').trim();
	const h2Delim = (rules.h2Delim || '#').trim();
	console.log('[parseTxtToChapters] Starting parse. h1Delim:', h1Delim, 'h2Delim:', h2Delim, 'fallbackTitle:', fallbackTitle);

	const normalizedText = normalizeMultiLineChapterTags(rawText, h1Delim);

	const reH1Exact = h1Delim
		? new RegExp('^\\s*' + escapeRegExp(h1Delim) + '\\s*(.*?)(?:\\s*' + escapeRegExp(h1Delim) + ')?\\s*$', 'i')
		: null;

	const reH2Exact = h2Delim
		? new RegExp('^\\s*' + escapeRegExp(h2Delim) + '\\s*(.*?)(?:\\s*' + escapeRegExp(h2Delim) + ')?\\s*$', 'i')
		: null;

	const rawBlocks = String(normalizedText || '').replace(/\r\n/g, '\n').split(/\n\s*\n+/);
	console.log('[parseTxtToChapters] Total raw blocks:', rawBlocks.length);

	const chapters = [];
	let currentChapter = null;

	for (const block of rawBlocks) {
		const trimmedBlock = block.trim();
		if (!trimmedBlock) continue;

		const lines = trimmedBlock.split('\n');
		let currentParaLines = [];

		const flushPara = () => {
			if (currentParaLines.length > 0 && currentChapter) {
				const breakDelim = (rules.breakDelim || '•••').trim();
				for (const lineText of currentParaLines) {
					const trimmed = lineText.trim();
					if (!trimmed) continue;
					if (breakDelim && trimmed === breakDelim) {
						currentChapter.html += '<p class="sbreak">' + escapeXml(trimmed) + '</p>\n';
					} else {
						const pContent = convertTxtInline(trimmed, rules);
						currentChapter.html += '<p>' + pContent + '</p>\n';
					}
				}
				currentParaLines = [];
			}
		};

		for (const line of lines) {
			const trimmedLine = line.trim();
			if (!trimmedLine) continue;

			const mH1 = reH1Exact ? trimmedLine.match(reH1Exact) : null;
			if (mH1 && mH1[1].trim()) {
				flushPara();
				const h1Title = mH1[1].trim();
				currentChapter = {
					title: h1Title || `Chương ${chapters.length + 1}`,
					html: '<h1>' + escapeXml(h1Title) + '</h1>\n',
					sources: ['Tệp TXT'],
					isChapter: true,
					firstSourcePageNum: chapters.length + 1
				};
				chapters.push(currentChapter);
				continue;
			}

			const mH2 = reH2Exact ? trimmedLine.match(reH2Exact) : null;
			if (mH2 && mH2[1].trim()) {
				flushPara();
				if (!currentChapter) {
					currentChapter = {
						title: fallbackTitle,
						html: '',
						sources: ['Tệp TXT'],
						isChapter: true,
						firstSourcePageNum: 1
					};
					chapters.push(currentChapter);
				}
				const h2Title = mH2[1].trim();
				const h2Content = convertTxtInline(h2Title, { ...rules, h2Delim: '' });
				currentChapter.html += '<h2>' + h2Content + '</h2>\n';
				continue;
			}

			if (!currentChapter) {
				currentChapter = {
					title: fallbackTitle,
					html: '',
					sources: ['Tệp TXT'],
					isChapter: true,
					firstSourcePageNum: 1
				};
				chapters.push(currentChapter);
			}
			currentParaLines.push(trimmedLine);
		}

		flushPara();
	}

	if (chapters.length === 0) {
		console.warn('[parseTxtToChapters] No chapters created, creating fallback chapter.');
		chapters.push({
			title: fallbackTitle,
			html: '<p>' + convertTxtInline(rawText, rules) + '</p>\n',
			sources: ['Tệp TXT'],
			isChapter: true,
			firstSourcePageNum: 1
		});
	}

	console.log('[parseTxtToChapters] Parse complete. Total chapters:', chapters.length, chapters.map(c => c.title));
	return chapters;
}




