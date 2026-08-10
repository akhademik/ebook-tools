import * as logger from '../helpers/logger.js';
import {
	makeChapterMatcher,
	pushIfLineStart,
	scoreHeadingCandidate,
	stripDecoration,
	extractMarkerTitle,
	extractChunkBlocks,
	renderMarkdownBlocks
} from './epub-parser.js';

// ZIP mode marker finder (at most one chapter candidate near the top of each file)
export function findMarkersForZip(blocks, chapterMatcher, useHeuristic, heuristicThreshold = 5) {
	if (useHeuristic) {
		// 1. Find the first non-empty text block
		let firstTextBlock = null;
		let firstTextBlockIdx = -1;
		for (let idx = 0; idx < blocks.length; idx++) {
			if (blocks[idx].text && blocks[idx].text.trim()) {
				firstTextBlock = blocks[idx];
				firstTextBlockIdx = idx;
				break;
			}
		}
		// 2. If the first text block is NOT a valid chapter candidate, ignore this file entirely
		if (firstTextBlock) {
			const score = scoreHeadingCandidate(firstTextBlock.text, firstTextBlock.type, true);
			const hasNL = firstTextBlock.text.includes('\n');
			const isFirstBlockChapter = !hasNL && score >= heuristicThreshold;
			console.log(`[findMarkersForZip] firstTextBlock: "${firstTextBlock.text.slice(0, 60)}...", score: ${score}, hasNL: ${hasNL}, isFirstBlockChapter: ${isFirstBlockChapter}`);
			if (!isFirstBlockChapter) {
				return [];
			}
		} else {
			return [];
		}
		// 3. Otherwise, search only within the first 3 blocks of the file
		for (let idx = 0; idx < Math.min(3, blocks.length); idx++) {
			const b = blocks[idx];
			if (b.type !== 'heading' && b.type !== 'p') continue;
			if (!b.text || !b.text.trim()) continue;

			const score = scoreHeadingCandidate(b.text, b.type, idx === firstTextBlockIdx);
			console.log(`[findMarkersForZip] block ${idx}: "${b.text.slice(0, 60)}...", score: ${score}, threshold: ${heuristicThreshold}`);
			if (!b.text.includes('\n') && score >= heuristicThreshold) {
				console.log(`[findMarkersForZip] MATCHED block ${idx} as chapter!`);
				return [{ blockIndex: idx, offset: 0, type: 'chapter' }];
			}
		}
		return [];
	}

	// Keyword mode (limitOneChapter is true)
	if (!chapterMatcher) return [];
	const raw = [];
	let foundChapter = false;

	for (let i = 0; i < blocks.length; i++) {
		const b = blocks[i];
		if (b.type !== 'heading' && b.type !== 'p') continue;
		if (!b.text || !b.text.trim()) continue;

		if (!foundChapter) {
			let from = 0;
			while (true) {
				const loc = chapterMatcher.locate(b.text, from);
				if (!loc) break;
				const matched = pushIfLineStart(raw, b.text, i, loc.index, 'chapter');
				if (matched) {
					foundChapter = true;
					break;
				}
				from = loc.index + 1;
			}
		}
	}
	return raw;
}

export function groupChaptersZip(rawFilesList, patternRaw, useHeuristic, startPage, endPage, heuristicThreshold = 5) {
	logger.log('epub-parser', 'groupChaptersZip called, files count:', rawFilesList.length, 'pattern:', patternRaw, 'useHeuristic:', useHeuristic);
	const matcher = useHeuristic ? null : makeChapterMatcher(patternRaw);
	const groups = [];
	let current = null;
	let seenMarker = false;

	for (let idx = 0; idx < rawFilesList.length; idx++) {
		const f = rawFilesList[idx];
		const pageNum = idx + 1;
		const isHeuristicActive = useHeuristic && (pageNum >= startPage && pageNum <= endPage);
		const cuts = findMarkersForZip(f.blocks, matcher, isHeuristicActive, heuristicThreshold);

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
		} else {
			const cut = cuts[0];
			const leadingBlocks = extractChunkBlocks(f.blocks, null, cut);
			if (leadingBlocks.length > 0) {
				const { html: leadHtml, title: leadTitle } = renderMarkdownBlocks(leadingBlocks);
				if ((matcher || isHeuristicActive) && seenMarker && current) {
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

			const chunkBlocks = extractChunkBlocks(f.blocks, cut, null);
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
				sources: [f.path + (cuts.length > 1 || leadingBlocks.length > 0 ? ' (mốc 1/' + cuts.length + ')' : '')],
				isChapter: true,
				firstSourcePageNum: pageNum
			};
			groups.push(current);
			seenMarker = true;
		}
	}
	logger.log('epub-parser', 'groupChaptersZip finished, total groups created:', groups.length);
	return groups;
}
