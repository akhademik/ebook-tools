// src/lib/epub-packer/parser/epub-single-grouper.ts
import * as logger from '$lib/helpers/logger.js';

import {
	makeChapterMatcher,
	pushIfLineStart,
	scoreHeadingCandidate,
	stripDecoration,
	extractMarkerTitle,
	extractChunkBlocks,
	type MarkdownBlock,
	type ChapterCutPoint,
	type ChapterMatcher,
	type RawFileItem
} from './epub-chapter-utils.js';
import { isRealParagraph } from './epub-ocr-utils.js';
import { renderMarkdownBlocks, type RenderMarkdownBlocksOptions } from './epub-markdown-utils.js';

// Single File mode marker finder
export function findMarkersForSingle(
	blocks: MarkdownBlock[],
	chapterMatcher: ChapterMatcher | null,
	useHeuristic: boolean,
	heuristicThreshold = 5
): ChapterCutPoint[] {
	if (useHeuristic) {
		// Single file mode: match headings anywhere, but paragraphs ONLY within the first 3 blocks and if no long prose paragraphs precede them
		const heuristicCuts: ChapterCutPoint[] = [];
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
	const raw: ChapterCutPoint[] = [];

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
	const deduped: ChapterCutPoint[] = [];
	for (const p of raw) {
		const last = deduped[deduped.length - 1];
		if (!last || last.blockIndex !== p.blockIndex || last.offset !== p.offset) deduped.push(p);
	}
	return deduped;
}

export function groupChaptersSingle(
	rawFilesList: RawFileItem[],
	patternRaw: string,
	useHeuristic: boolean,
	_startPage?: number,
	_endPage?: number,
	heuristicThreshold = 5,
	options: RenderMarkdownBlocksOptions = {}
): any[] {
	logger.log('epub-parser', 'groupChaptersSingle called, pattern:', patternRaw, 'useHeuristic:', useHeuristic);
	const matcher = useHeuristic ? null : makeChapterMatcher(patternRaw);
	const groups: any[] = [];

	const f = rawFilesList[0];
	if (!f) return [];

	const cuts = findMarkersForSingle(f.blocks, matcher, useHeuristic, heuristicThreshold);

	if (cuts.length === 0) {
		const { html, title: t } = renderMarkdownBlocks(f.blocks, options);
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
				const { html: leadingHtml } = renderMarkdownBlocks(leadingBlocks, options);
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
			const { html: chunkHtml } = renderMarkdownBlocks(chunkBlocks, options);
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
