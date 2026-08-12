import * as logger from '$lib/helpers/logger.js';
import { escapeXml } from '$lib/helpers/helpers.js';
import {
	makeChapterMatcher,
	pushIfLineStart,
	scoreHeadingCandidate,
	stripDecoration,
	extractMarkerTitle,
	extractChunkBlocks
} from './epub-chapter-utils.js';
import { isRealParagraph } from './epub-ocr-utils.js';
import { renderMarkdownBlocks } from './epub-markdown-utils.js';

// Single File mode marker finder
export function findMarkersForSingle(blocks, chapterMatcher, useHeuristic, heuristicThreshold = 5) {
	if (useHeuristic) {
		// Single file mode: match headings anywhere, but paragraphs ONLY within the first 3 blocks and if no long prose paragraphs precede them
		const heuristicCuts = [];
		let firstTextBlockIdx = -1;
		for (let i = 0; i < blocks.length; i++) {
			if (blocks[i].text && blocks[i].text.trim()) {
				firstTextBlockIdx = i;
				break;
			}
		}

		for (let idx = 0; idx < blocks.length; idx++) {
			const b = blocks[idx];
			if (b.type !== 'heading' && b.type !== 'p') continue;
			if (!b.text || !b.text.trim()) continue;

			const isParagraphNearTop = b.type === 'p' && idx < 3 && (() => {
				for (let prev = 0; prev < idx; prev++) {
					const pb = blocks[prev];
					if (pb && pb.text) {
						const txt = pb.text.trim();
						const wordCount = txt.split(/\s+/).filter(Boolean).length;
						if (isRealParagraph(txt) || txt.length > 120 || wordCount > 15) {
							return false;
						}
					}
				}
				return true;
			})();
			const isHeading = b.type === 'heading';

			if (isHeading || isParagraphNearTop) {
				if (!b.text.includes('\n') && scoreHeadingCandidate(b.text, b.type, idx === firstTextBlockIdx) >= heuristicThreshold) {
					heuristicCuts.push({ blockIndex: idx, offset: 0, type: 'chapter' });
				}
			}
		}
		return heuristicCuts;
	}

	// Keyword mode (limitOneChapter is false)
	if (!chapterMatcher) return [];
	const raw = [];

	for (let i = 0; i < blocks.length; i++) {
		const b = blocks[i];
		if (b.type !== 'heading' && b.type !== 'p') continue;
		if (!b.text || !b.text.trim()) continue;

		let from = 0;
		while (true) {
			const loc = chapterMatcher.locate(b.text, from);
			if (!loc) break;
			pushIfLineStart(raw, b.text, i, loc.index, 'chapter');
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

export function groupChaptersSingle(rawFilesList, patternRaw, useHeuristic, startPage, endPage, heuristicThreshold = 5) {
	logger.log('epub-parser', 'groupChaptersSingle called, pattern:', patternRaw, 'useHeuristic:', useHeuristic);
	const matcher = useHeuristic ? null : makeChapterMatcher(patternRaw);
	const groups = [];

	const f = rawFilesList[0];
	if (!f) return [];

	const cuts = findMarkersForSingle(f.blocks, matcher, useHeuristic, heuristicThreshold);

	if (cuts.length === 0) {
		const { html, title: t } = renderMarkdownBlocks(f.blocks);
		const chapTitle = (t && t.trim()) || f.baseName;
		groups.push({
			title: chapTitle,
			html,
			sources: [f.path],
			isChapter: false,
			firstSourcePageNum: 1
		});
	} else {
		// Lead chunk (before the first cut)
		const firstCut = cuts[0];
		if (firstCut.blockIndex > 0 || firstCut.offset > 0) {
			const leadingBlocks = extractChunkBlocks(f.blocks, null, firstCut);
			if (leadingBlocks.length > 0) {
				const { html: leadingHtml } = renderMarkdownBlocks(leadingBlocks);
				groups.push({
					title: f.baseName,
					html: leadingHtml,
					sources: [f.path],
					isChapter: false,
					firstSourcePageNum: 1
				});
			}
		}

		// Subsequent chunks
		for (let k = 0; k < cuts.length; k++) {
			const cut = cuts[k];
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
			groups.push({
				title: chunkTitle,
				html: chunkHtml,
				sources: [f.path + ' (mốc ' + (k + 1) + '/' + cuts.length + ')'],
				isChapter: true,
				firstSourcePageNum: 1
			});
		}
	}
	logger.log('epub-parser', 'groupChaptersSingle finished, total groups created:', groups.length);
	return groups;
}

function escapeRegExp(str) {
	return String(str || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function getClosingTag(openTag) {
	const match = openTag.match(/<([a-zA-Z0-9]+)/);
	return match ? `</${match[1]}>` : '';
}

function stripHtmlTags(html) {
	return html.replace(/<[^>]+>/g, '').trim();
}

function applyInlineFormatting(text, customDefinitions = []) {
	let t = escapeXml(String(text || ''));

	const customTags = [];

	if (Array.isArray(customDefinitions)) {
		for (const def of customDefinitions) {
			if (def.pattern && def.tag) {
				const escapedP = escapeRegExp(def.pattern);
				const reCustom = new RegExp(escapedP + '(.+?)' + escapedP, 'g');
				t = t.replace(reCustom, (m, content) => {
					const closingTag = getClosingTag(def.tag);
					const openIdx = customTags.length;
					customTags.push(def.tag);
					const closeIdx = customTags.length;
					customTags.push(closingTag);
					return `XCUSTOMXTAGX${openIdx}X${content}XCUSTOMXTAGX${closeIdx}X`;
				});
			}
		}
	}

	const boldRegex = /(?<!\d)\*([^\s*][^*]*[^\s*]|\S)\*(?!\d)/g;
	t = t.replace(boldRegex, 'XBOLDXOPENX$1XBOLDXCLOSEX');

	const italicRegex = /(?<!\d)\/([^\s/][^/]*[^\s/]|\S)\/(?!\d)/g;
	t = t.replace(italicRegex, (match, content) => {
		const trimmed = content.trim();
		if (/^\d+$/.test(trimmed)) {
			return match;
		}
		if (trimmed.length <= 2 && /^\d+$/.test(trimmed.replace(/[^0-9]/g, ''))) {
			return match;
		}
		return `XITALICXOPENX${content}XITALICXCLOSEX`;
	});

	const underlineRegex = /_([^\s_][^_]*[^\s_]|\S)_/g;
	t = t.replace(underlineRegex, 'XUNDERLINEXOPENX$1XUNDERLINEXCLOSEX');

	// Restore all placeholders
	t = t.replace(/XBOLDXOPENX/g, '<b>')
	     .replace(/XBOLDXCLOSEX/g, '</b>')
	     .replace(/XITALICXOPENX/g, '<i>')
	     .replace(/XITALICXCLOSEX/g, '</i>')
	     .replace(/XUNDERLINEXOPENX/g, '<u>')
	     .replace(/XUNDERLINEXCLOSEX/g, '</u>');

	t = t.replace(/XCUSTOMXTAGX(\d+)X/g, (m, idx) => {
		return customTags[Number(idx)];
	});

	t = t.replace(/\{(\d+)\}/g, (m, n) => {
		return `<a class="noteref" epub:type="noteref" id="fnref${n}" href="notes.xhtml#fn${n}"><sup>${n}</sup></a>`;
	});

	return t;
}

export function parseTxtToChapters(rawText, options = {}, fallbackTitle = 'Chương 1') {
	const customDefinitions = options.customDefinitions || [];
	logger.log('epub-parser', 'parseTxtToChapters starting parse with new conventions.');

	const lines = String(rawText || '').replace(/\r\n/g, '\n').split('\n');
	const footnoteIdx = lines.findIndex(l => /^\s*chú thích:?\s*$/i.test(l));

	let mainLines = lines;
	let hasFootnotes = false;
	let notesHtml = '';

	if (footnoteIdx !== -1) {
		mainLines = lines.slice(0, footnoteIdx);
		hasFootnotes = true;

		notesHtml += `<h1 class="main-chap center">Chú thích:</h1>\n`;
		const footnoteContentLines = lines.slice(footnoteIdx + 1);
		for (const line of footnoteContentLines) {
			const trimmed = line.trim();
			if (!trimmed) continue;
			
			const fnMatch = trimmed.match(/^\{(\d+)\}\s*(.*)$/);
			if (fnMatch) {
				const n = fnMatch[1];
				const content = fnMatch[2].trim();
				const convertedContent = applyInlineFormatting(content, customDefinitions);
				notesHtml += `<aside epub:type="footnote" id="fn${n}" class="note">\n` +
					`  <p><a class="notenum" href="__FNREF_SRC_${n}__.xhtml#fnref${n}">${n}.</a> ${convertedContent}</p>\n` +
					`</aside>\n`;
			} else {
				const converted = applyInlineFormatting(trimmed, customDefinitions);
				notesHtml += `<p>${converted}</p>\n`;
			}
		}
	}

	const rawLines = mainLines;
	const preprocessedLines = [];
	let lastWasEmpty = false;
	for (let i = 0; i < rawLines.length; i++) {
		const line = rawLines[i];
		const isEmpty = line.trim() === '';
		if (isEmpty) {
			if (!lastWasEmpty) {
				preprocessedLines.push('');
				lastWasEmpty = true;
			}
		} else {
			preprocessedLines.push(line);
			lastWasEmpty = false;
		}
	}

	const chapters = [];
	let currentChapter = null;

	const ensureChapterOpen = () => {
		if (!currentChapter) {
			currentChapter = {
				title: `${fallbackTitle}`,
				html: '',
				sources: ['Tệp TXT'],
				isChapter: true,
				firstSourcePageNum: chapters.length + 1
			};
			chapters.push(currentChapter);
		}
	};

	let lineIdx = 0;
	while (lineIdx < preprocessedLines.length) {
		const origLine = preprocessedLines[lineIdx];
		const stripped = origLine.trim();

		if (stripped === '') {
			lineIdx++;
			continue;
		}

		let isEscaped = false;
		let lineToProcess = origLine;
		if (stripped.startsWith('\\') && stripped.length > 1 && ['@', '~', '>', '#', '*', '/', '_'].includes(stripped.charAt(1))) {
			isEscaped = true;
			const backslashIdx = origLine.indexOf('\\');
			lineToProcess = origLine.slice(0, backslashIdx) + origLine.slice(backslashIdx + 1);
		}

		if (isEscaped) {
			ensureChapterOpen();
			const formatted = applyInlineFormatting(lineToProcess.trim(), customDefinitions);
			currentChapter.html += `<p>${formatted}</p>\n`;
			lineIdx++;
			continue;
		}

		const headingMatch = stripped.match(/^(@{1,3})(t|p)?\s+(.+)$/);
		if (headingMatch) {
			const atCount = headingMatch[1].length;
			const alignChar = headingMatch[2];
			const titleRaw = headingMatch[3].trim();
			
			const align = alignChar === 't' ? 'left' : (alignChar === 'p' ? 'right' : 'center');
			const titleFormatted = applyInlineFormatting(titleRaw, customDefinitions);
			const titlePlain = stripHtmlTags(titleFormatted);

			if (atCount === 3) {
				currentChapter = {
					title: titlePlain || `Phần ${chapters.length + 1}`,
					html: `<h1 class="break-main-chap ${align}">${titleFormatted}</h1>\n`,
					sources: ['Tệp TXT'],
					isChapter: true,
					firstSourcePageNum: chapters.length + 1
				};
				chapters.push(currentChapter);
				currentChapter = null;
			} else if (atCount === 2) {
				currentChapter = {
					title: titlePlain || `Chương ${chapters.length + 1}`,
					html: `<h1 class="main-chap ${align}">${titleFormatted}</h1>\n`,
					sources: ['Tệp TXT'],
					isChapter: true,
					firstSourcePageNum: chapters.length + 1
				};
				chapters.push(currentChapter);
			} else {
				ensureChapterOpen();
				currentChapter.html += `<h2 class="side-chap ${align}">${titleFormatted}</h2>\n`;
			}
			lineIdx++;
			continue;
		}

		const quoteMatch = stripped.match(/^~(t|p)?\s+(.+)$/);
		if (quoteMatch) {
			ensureChapterOpen();
			const alignChar = quoteMatch[1];
			const quoteRaw = quoteMatch[2].trim();
			const align = alignChar === 't' ? 'left' : (alignChar === 'p' ? 'right' : 'center');
			const quoteFormatted = applyInlineFormatting(quoteRaw, customDefinitions);

			let nextLineIdx = lineIdx + 1;
			let nextStripped = '';
			while (nextLineIdx < preprocessedLines.length) {
				if (preprocessedLines[nextLineIdx].trim() !== '') {
					nextStripped = preprocessedLines[nextLineIdx].trim();
					break;
				}
				nextLineIdx++;
			}

			const authorMatch = nextStripped.match(/^>\s*(.+)$/);
			if (authorMatch) {
				const authorRaw = authorMatch[1].trim();
				const authorFormatted = applyInlineFormatting(authorRaw, customDefinitions);
				currentChapter.html += `<blockquote class="${align}"><p>${quoteFormatted}</p><footer>${authorFormatted}</footer></blockquote>\n`;
				lineIdx = nextLineIdx + 1;
			} else {
				currentChapter.html += `<blockquote class="${align}"><p>${quoteFormatted}</p></blockquote>\n`;
				lineIdx++;
			}
			continue;
		}

		if (stripped === '###') {
			ensureChapterOpen();
			currentChapter.html += `<p class="scene-break-big" role="separator">• • •</p>\n`;
			lineIdx++;
			continue;
		}

		if (stripped === '##') {
			ensureChapterOpen();
			currentChapter.html += `<p class="scene-break-small" role="separator">*</p>\n`;
			lineIdx++;
			continue;
		}

		ensureChapterOpen();
		const formatted = applyInlineFormatting(origLine.trim(), customDefinitions);
		currentChapter.html += `<p>${formatted}</p>\n`;
		lineIdx++;
	}

	if (chapters.length === 0) {
		logger.warn('epub-parser', 'parseTxtToChapters: No chapters created, creating fallback chapter.');
		chapters.push({
			title: fallbackTitle,
			html: '',
			sources: ['Tệp TXT'],
			isChapter: true,
			firstSourcePageNum: 1
		});
	}

	if (hasFootnotes) {
		const notesChapter = {
			title: 'Chú thích',
			html: notesHtml,
			sources: ['Tệp TXT'],
			isChapter: true,
			fileName: 'notes',
			isNotes: true,
			firstSourcePageNum: chapters.length + 1
		};
		chapters.push(notesChapter);
	}

	logger.log('epub-parser', 'parseTxtToChapters completed, total chapters:', chapters.length);
	return chapters;
}
