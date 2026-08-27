// src/lib/epub-editor/validator/types.ts
import type JSZip from 'jszip';

export type ValidationSeverity = 'error' | 'warning' | 'info';
export type ValidationCategory =
	'structure' | 'manifest' | 'spine' | 'toc' | 'xhtml' | 'fonts' | 'images' | 'kobo';

export type ValidationProfile = 'generic' | 'epub3' | 'kobo';

export interface ValidationIssue {
	severity: ValidationSeverity;
	category: ValidationCategory;
	file?: string;
	message: string;
	suggestion?: string;
}

export interface ValidationSummary {
	structure: 'pass' | 'fail' | 'warn';
	manifest: 'pass' | 'fail' | 'warn';
	spine: 'pass' | 'fail' | 'warn';
	toc: 'pass' | 'fail' | 'warn';
	xhtml: 'pass' | 'fail' | 'warn';
	fonts: 'pass' | 'fail' | 'warn';
	cover: 'pass' | 'fail' | 'warn';
}

export interface ValidationResult {
	profile: ValidationProfile;
	passed: boolean;
	errorCount: number;
	warningCount: number;
	infoCount: number;
	issues: ValidationIssue[];
	summary: ValidationSummary;
}

export interface ManifestItemInfo {
	id: string;
	href: string;
	resolvedPath: string;
	mediaType: string;
	properties?: string;
}

export interface ValidationContext {
	zip: JSZip;
	profile: ValidationProfile;
	editBuffer?: Map<string, string>;
	allZipFiles: string[];
	getText: (path: string) => Promise<string>;

	// Structure & OPF state
	opfPath: string | null;
	opfText?: string;
	opfDoc?: Document | null;
	epubVersion: string;
	uniqueIdentifierId?: string;

	// Domain indexes
	manifestMap: Map<string, ManifestItemInfo>;
	spineIdrefs: string[];
	hasCoverImage: boolean;
	hasCoverMeta: boolean;
	hasNavDocument: boolean;
	hasNcx: boolean;

	report: (issue: ValidationIssue) => void;
	issues: ValidationIssue[];
}

export interface ValidationRule {
	name: string;
	category: ValidationCategory;
	validate: (ctx: ValidationContext) => Promise<void> | void;
}
