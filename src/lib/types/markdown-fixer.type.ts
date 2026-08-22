// src/lib/types/markdown-fixer.type.ts

export interface ConvertedBracketsResult {
	converted: string;
	count: number;
}

export interface ProcessedMarkdownFileRow {
	path: string;
	count: number;
}

export interface FixMarkdownZipResult {
	zipBlob: Blob;
	totalFiles: number;
	totalReplacements: number;
	processedFilesList: ProcessedMarkdownFileRow[];
}
