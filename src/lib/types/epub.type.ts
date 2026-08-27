// src/lib/types/epub.type.ts

export interface EpubMetadata {
	title: string;
	author: string;
	language: string;
	identifier?: string;
	publisher?: string;
}

export interface EpubChapterFeatures {
	hasCenterPage?: boolean;
	hasHeadings?: boolean;
	hasQuotes?: boolean;
	hasBreaks?: boolean;
	hasNotes?: boolean;
}

export interface EpubChapterItem {
	title: string;
	fileName: string;
	xmlId: string;
	html?: string;
	isChapter?: boolean;
	isNotes?: boolean;
	chapterIndex?: number | null;
	firstSourcePageNum?: number;
	sources?: string[];
	hasCustomTitle?: boolean;
	features?: EpubChapterFeatures;
}

export interface OrnamentItem {
	blob: Blob | File;
	fileName: string;
	mimeType: string;
}

export interface OrnamentsConfig {
	chapterOrnament?: OrnamentItem;
	subchapterOrnament?: OrnamentItem;
}

export interface IllustrationImageItem {
	id?: string;
	name?: string;
	fileName: string;
	mimeType?: string;
	blob?: Blob | File;
	size?: number;
}

export interface EpubFontsConfig {
	jacketFont?: string;
	h1Font?: string;
	h2Font?: string;
	dropcapFont?: string;
	blobs?: Record<string, Blob>;
}

export interface EpubJacketConfig {
	enabled: boolean;
	templateId: number;
	title: string;
	originalTitle: string;
	author: string;
	translator: string;
	publisher: string;
	distributor: string;
}

export interface CoverBlobItem extends Blob {
	width?: number;
	height?: number;
}

export interface FontInfo {
	id: string;
	name: string;
	cssFamily: string;
	fileName: string;
	url: string;
	mimeType: string;
}

export interface JacketTemplate {
	id: number;
	name: string;
	css: string;
	render: (
		title: string,
		original: string,
		author: string,
		translator: string,
		publisher: string,
		distributor: string
	) => string;
}

export interface TocNode {
	id: string;
	title: string;
	href: string;
	level?: number;
	playOrder?: number;
	children?: TocNode[];
}

export interface TocTree {
	title?: string;
	nodes: TocNode[];
}

export interface TocEntry {
	title: string;
	url: string;
}

export interface RawChapterItem {
	title: string;
	fileName?: string;
	xmlId?: string;
	html?: string;
	isChapter?: boolean;
	isNotes?: boolean;
	chapterIndex?: number | null;
	firstSourcePageNum?: number;
	sources?: string[];
	hasCustomTitle?: boolean;
	features?: EpubChapterFeatures;
}

export interface MarkdownBlock {
	type: 'heading' | 'p' | 'hr' | 'blockquote' | 'code' | 'ul' | 'ol' | string;
	level?: number;
	text?: string;
	html?: string;
	content?: string;
	items?: string[];
}

export interface RawFileItem {
	path: string;
	baseName: string;
	rawText?: string;
	blocks: MarkdownBlock[];
}

export interface ChapterCutPoint {
	blockIndex: number;
	offset: number;
	type: string;
}

export interface ChapterCandidateItem {
	pageNum: number;
	fileName: string;
	blockIndex: number;
	text: string;
	type: string;
	score: number;
	regexMatch: boolean;
	heuristicMatch: boolean;
	isMatch: boolean;
	snippet: string;
}

export interface ChapterMatcher {
	locate: (text: string, fromIndex?: number) => { index: number } | null;
}

export interface CustomDefinition {
	pattern: string;
	tag: string;
}

export interface RenderMarkdownBlocksOptions {
	ignoreMarkdownFormat?: boolean;
}

export interface RenderMarkdownBlocksResult {
	html: string;
	title: string | null;
}

export interface ScannedReportItem {
	lineNum: number;
	text: string;
	location: string;
	isRemoved: boolean;
}

export interface CleanedLinesReportItem {
	fileName: string;
	scanned: ScannedReportItem[];
}

export interface ParseTxtOptions {
	customDefinitions?: CustomDefinition[];
	images?: Record<string, { fileName?: string }>;
	warnings?: string[];
}
