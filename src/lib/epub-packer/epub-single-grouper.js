import * as logger from '$lib/helpers/logger.js';
import {
	makeChapterMatcher,
	pushIfLineStart,
	scoreHeadingCandidate,
	isRealParagraph,
	stripDecoration,
	extractMarkerTitle,
	extractChunkBlocks,
	renderMarkdownBlocks,
	normalizeMultiLineChapterTags,
	convertTxtInline
} from './epub-parser.js';

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

export function parseTxtToChapters(rawText, options = {}, fallbackTitle = 'Chương 1') {
	const customDefinitions = options.customDefinitions || [];
	logger.log('epub-parser', 'parseTxtToChapters starting parse. customDefinitions count:', customDefinitions.length);

	// 1. Footnotes split
	const lines = String(rawText || '').replace(/\r\n/g, '\n').split('\n');
	const footnoteIdx = lines.findIndex(l => l.includes('Chú thích:'));

	let mainLines = lines;
	let hasFootnotes = false;
	let notesHtml = '';

	if (footnoteIdx !== -1) {
		mainLines = lines.slice(0, footnoteIdx);
		hasFootnotes = true;

		notesHtml += '<h1 class="chapter">Chú thích:</h1>\n';
		const footnoteContentLines = lines.slice(footnoteIdx + 1);
		for (const line of footnoteContentLines) {
			const trimmed = line.trim();
			if (!trimmed) continue;
			
			const fnMatch = trimmed.match(/^\{(\d+)\}\s*(.*)$/);
			if (fnMatch) {
				const n = fnMatch[1];
				const content = fnMatch[2].trim();
				const convertedContent = convertTxtInline(content, customDefinitions);
				notesHtml += `<aside epub:type="footnote" id="fn${n}" class="note">\n` +
					`  <p><a class="notenum" href="__FNREF_SRC_${n}__.xhtml#fnref${n}">${n}.</a> ${convertedContent}</p>\n` +
					`</aside>\n`;
			} else {
				const converted = convertTxtInline(trimmed, customDefinitions);
				notesHtml += `<p>${converted}</p>\n`;
			}
		}
	}

	// Join main lines back
	const mainText = mainLines.join('\n');
	const normalizedText = normalizeMultiLineChapterTags(mainText);

	// 2. Parse main text into blocks by double newlines (paragraphs)
	const rawBlocks = normalizedText.split(/\n\s*\n+/);
	const chapters = [];
	let currentChapter = null;

	const reH1Exact = /^\s*##(.*?)#+\s*$/;
	const reH2Exact = /^\s*#(?!#)(.*?)#+\s*$/;

	for (const block of rawBlocks) {
		const trimmedBlock = block.trim();
		if (!trimmedBlock) continue;

		const blockLines = trimmedBlock.split('\n');
		let currentParaLines = [];

		const flushPara = () => {
			if (currentParaLines.length > 0 && currentChapter) {
				for (const lineText of currentParaLines) {
					const trimmed = lineText.trim();
					if (!trimmed) continue;
					
					if (trimmed === '•••') {
						currentChapter.html += '<p class="sbreak sbreak-big" role="separator">• • •</p>\n';
					} else if (trimmed.startsWith('$') && trimmed.endsWith('$') && trimmed.length >= 2) {
						const inner = trimmed.slice(1, -1).trim();
						const pContent = convertTxtInline(inner, customDefinitions);
						currentChapter.html += '<p class="boldright">' + pContent + '</p>\n';
					} else {
						const pContent = convertTxtInline(trimmed, customDefinitions);
						currentChapter.html += '<p>' + pContent + '</p>\n';
					}
				}
				currentParaLines = [];
			}
		};

		for (const line of blockLines) {
			const trimmedLine = line.trim();
			if (!trimmedLine) continue;

			const mH1 = trimmedLine.match(reH1Exact);
			if (mH1) {
				flushPara();
				const h1Title = mH1[1].trim();
				currentChapter = {
					title: h1Title || `Chương ${chapters.length + 1}`,
					html: '<h1 class="chapter">' + convertTxtInline(h1Title, customDefinitions) + '</h1>\n',
					sources: ['Tệp TXT'],
					isChapter: true,
					firstSourcePageNum: chapters.length + 1
				};
				chapters.push(currentChapter);
				continue;
			}

			const mH2 = trimmedLine.match(reH2Exact);
			if (mH2) {
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
				currentChapter.html += '<h2 class="chno">' + convertTxtInline(h2Title, customDefinitions) + '</h2>\n';
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
		logger.warn('epub-parser', 'parseTxtToChapters: No chapters created, creating fallback chapter.');
		chapters.push({
			title: fallbackTitle,
			html: '<p>' + convertTxtInline(mainText, customDefinitions) + '</p>\n',
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

	logger.log('epub-parser', 'parseTxtToChapters parse complete. Total chapters:', chapters.length);
	return chapters;
}
