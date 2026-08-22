// src/lib/epub-packer/parser/epub-parser.ts
import { findMarkersForZip, groupChaptersZip } from './epub-zip-grouper';
import { findMarkersForSingle, groupChaptersSingle } from './epub-single-grouper';
import { parseTxtToChapters } from './txt-parser';
import type {
	MarkdownBlock,
	ChapterMatcher,
	RawFileItem,
	ChapterCutPoint,
	RenderMarkdownBlocksOptions
} from '$lib/types';

export type {
	CustomDefinition,
	RenderMarkdownBlocksOptions,
	RenderMarkdownBlocksResult,
	CleanedLinesReportItem,
	ScannedReportItem,
	MarkdownBlock,
	ChapterCutPoint,
	ChapterCandidateItem,
	ChapterMatcher,
	RawFileItem,
	ParseTxtOptions
} from '$lib/types';

export {
	parseMarkdownBlocks,
	renderMarkdownBlocks,
	convertTxtInline,
	normalizeMultiLineChapterTags
} from './epub-markdown-utils';

export {
	isRealParagraph,
	cleanHeaderFooterOcr,
	getCleanedLinesReport
} from './epub-ocr-utils';

export {
	stripDecoration,
	makeChapterMatcher,
	extractMarkerTitle,
	pushIfLineStart,
	scoreHeadingCandidate,
	extractChunkBlocks,
	assignSequentialChapterIds,
	analyzeChapterCandidates
} from './epub-chapter-utils';

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
