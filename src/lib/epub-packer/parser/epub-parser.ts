// src/lib/epub-packer/parser/epub-parser.ts
import { findMarkersForZip, groupChaptersZip } from './epub-zip-grouper.js';
import { findMarkersForSingle, groupChaptersSingle } from './epub-single-grouper.js';
import { parseTxtToChapters } from './txt-parser.js';
import type { MarkdownBlock, ChapterMatcher, RawFileItem, ChapterCutPoint } from './epub-chapter-utils.js';
import type { RenderMarkdownBlocksOptions } from './epub-markdown-utils.js';

export type { CustomDefinition, RenderMarkdownBlocksOptions, RenderMarkdownBlocksResult } from './epub-markdown-utils.js';
export type { CleanedLinesReportItem, ScannedReportItem } from './epub-ocr-utils.js';
export type { MarkdownBlock, ChapterCutPoint, ChapterCandidateItem, ChapterMatcher, RawFileItem } from './epub-chapter-utils.js';
export type { ParseTxtOptions } from './txt-parser.js';

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

export function findAllMarkerPositionsCombined(
	blocks: MarkdownBlock[],
	chapterMatcher: ChapterMatcher | null,
	useHeuristic: boolean,
	limitOneChapter: boolean,
	heuristicThreshold = 5
): ChapterCutPoint[] {
	if (limitOneChapter) {
		return findMarkersForZip(blocks, chapterMatcher, useHeuristic, heuristicThreshold);
	} else {
		return findMarkersForSingle(blocks, chapterMatcher, useHeuristic, heuristicThreshold);
	}
}

export function groupChapters(
	rawFilesList: RawFileItem[],
	patternRaw: string,
	useHeuristic: boolean,
	startPage: number,
	endPage: number,
	heuristicThreshold = 5,
	options: RenderMarkdownBlocksOptions = {}
): any[] {
	if (rawFilesList.length > 1) {
		return groupChaptersZip(rawFilesList, patternRaw, useHeuristic, startPage, endPage, heuristicThreshold, options);
	} else {
		return groupChaptersSingle(rawFilesList, patternRaw, useHeuristic, startPage, endPage, heuristicThreshold, options);
	}
}

export { parseTxtToChapters };
