// src/lib/epub-editor/cleaner/types.ts
export interface EpubResourceUsage {
	path: string;
	name: string;
	category: 'image' | 'font' | 'style' | 'page' | 'other';
	byteSize: number;
	isUsed: boolean;
	referencedBy: string[];
}

export interface EpubMissingReference {
	sourceFile: string;
	targetRef: string;
}

export interface DuplicateResourceItem {
	originalPath: string;
	duplicatePath: string;
	byteSize: number;
	hash: string;
}

export interface EpubOptimizationSavingsBreakdown {
	unusedImages: number;
	unusedFonts: number;
	unusedStyles: number;
	unusedPages: number;
	duplicateResources: number;
}

export interface EpubOptimizationPlan {
	totalFiles: number;
	totalBytes: number;
	estimatedSavingsBytes: number;
	savingsBreakdown: EpubOptimizationSavingsBreakdown;
	unusedImages: EpubResourceUsage[];
	unusedFonts: EpubResourceUsage[];
	unusedStyles: EpubResourceUsage[];
	unusedPages: EpubResourceUsage[];
	duplicateResources: DuplicateResourceItem[];
	missingReferences: EpubMissingReference[];
	allResources: EpubResourceUsage[];
}

export interface EpubAnalysisResult {
	totalFiles: number;
	totalBytes: number;
	unusedImages: EpubResourceUsage[];
	unusedFonts: EpubResourceUsage[];
	unusedStyles: EpubResourceUsage[];
	unusedPages: EpubResourceUsage[];
	missingReferences: EpubMissingReference[];
	allResources: EpubResourceUsage[];
	estimatedSavingsBytes: number;
}

export interface EpubCleanOptions {
	removeUnusedImages?: boolean;
	removeUnusedFonts?: boolean;
	removeUnusedStyles?: boolean;
	removeUnusedPages?: boolean;
	cleanOpfManifest?: boolean;
	deduplicateResources?: boolean;
}

export interface EpubCleanReport {
	beforeBytes: number;
	afterBytes: number;
	savedBytes: number;
	removedImages: string[];
	removedFonts: string[];
	removedStyles: string[];
	removedPages: string[];
	removedManifestEntries: string[];
	deduplicatedResources?: string[];
	missingReferences: EpubMissingReference[];
}

export type EpubOptimizeOptions = EpubCleanOptions;
export type EpubOptimizeReport = EpubCleanReport;
