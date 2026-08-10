import { findMarkersForZip, groupChaptersZip } from './epub-zip-grouper.js';
import { findMarkersForSingle, groupChaptersSingle, parseTxtToChapters } from './epub-single-grouper.js';

export {
	parseMarkdownBlocks,
	renderMarkdownBlocks,
	convertTxtInline,
	normalizeMultiLineChapterTags
} from './epub-markdown-utils.js';

export {
	isRealParagraph,
	cleanHeaderFooterOcr,
	getCleanedLinesReport
} from './epub-ocr-utils.js';

export {
	stripDecoration,
	makeChapterMatcher,
	extractMarkerTitle,
	pushIfLineStart,
	scoreHeadingCandidate,
	extractChunkBlocks,
	assignSequentialChapterIds,
	analyzeChapterCandidates
} from './epub-chapter-utils.js';

export function findAllMarkerPositionsCombined(blocks, chapterMatcher, useHeuristic, limitOneChapter, heuristicThreshold = 5) {
	if (limitOneChapter) {
		return findMarkersForZip(blocks, chapterMatcher, useHeuristic, heuristicThreshold);
	} else {
		return findMarkersForSingle(blocks, chapterMatcher, useHeuristic, heuristicThreshold);
	}
}

export function groupChapters(rawFilesList, patternRaw, useHeuristic, startPage, endPage, heuristicThreshold = 5) {
	if (rawFilesList.length > 1) {
		return groupChaptersZip(rawFilesList, patternRaw, useHeuristic, startPage, endPage, heuristicThreshold);
	} else {
		return groupChaptersSingle(rawFilesList, patternRaw, useHeuristic, startPage, endPage, heuristicThreshold);
	}
}

export { parseTxtToChapters };
