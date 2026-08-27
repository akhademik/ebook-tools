// src/lib/epub-editor/validator/validator-engine.ts
import type JSZip from 'jszip';
import type {
	ValidationProfile,
	ValidationRule,
	ValidationResult,
	ValidationIssue,
	ValidationContext,
	ValidationCategory,
	ValidationSummary
} from './types';
import { StructureRule, OpfPackageRule, SpineRule, NavigationRule } from './structure-rules';
import { XhtmlPagesRule, CssAndFontsRule } from './content-rules';

export const DEFAULT_VALIDATION_RULES: ValidationRule[] = [
	StructureRule,
	OpfPackageRule,
	SpineRule,
	NavigationRule,
	XhtmlPagesRule,
	CssAndFontsRule
];

/**
 * Perform comprehensive EPUB validation against Generic EPUB, EPUB 3, or Kobo profile.
 */
export async function validateEpub(
	zip: JSZip,
	profile: ValidationProfile = 'generic',
	editBuffer?: Map<string, string>,
	customRules?: ValidationRule[]
): Promise<ValidationResult> {
	const issues: ValidationIssue[] = [];
	const allZipFiles = Object.keys(zip.files).filter((p) => !zip.files[p].dir);

	async function getText(path: string): Promise<string> {
		if (editBuffer && editBuffer.has(path)) {
			return editBuffer.get(path) || '';
		}
		const f = zip.file(path);
		return f ? await f.async('text') : '';
	}

	const ctx: ValidationContext = {
		zip,
		profile,
		editBuffer,
		allZipFiles,
		getText,
		opfPath: null,
		epubVersion: '2.0',
		manifestMap: new Map(),
		spineIdrefs: [],
		hasCoverImage: false,
		hasCoverMeta: false,
		hasNavDocument: false,
		hasNcx: false,
		report(issue: ValidationIssue) {
			issues.push(issue);
		},
		issues
	};

	const rulesToRun = customRules || DEFAULT_VALIDATION_RULES;
	for (const rule of rulesToRun) {
		await rule.validate(ctx);
	}

	const errorCount = issues.filter((i) => i.severity === 'error').length;
	const warningCount = issues.filter((i) => i.severity === 'warning').length;
	const infoCount = issues.filter((i) => i.severity === 'info').length;

	function getStatus(cat: ValidationCategory): 'pass' | 'fail' | 'warn' {
		const catIssues = issues.filter((i) => i.category === cat);
		if (catIssues.some((i) => i.severity === 'error')) return 'fail';
		if (catIssues.some((i) => i.severity === 'warning')) return 'warn';
		return 'pass';
	}

	const summary: ValidationSummary = {
		structure: getStatus('structure'),
		manifest: getStatus('manifest'),
		spine: getStatus('spine'),
		toc: getStatus('toc'),
		xhtml: getStatus('xhtml'),
		fonts: getStatus('fonts'),
		cover: ctx.hasCoverImage || ctx.hasCoverMeta ? 'pass' : 'warn'
	};

	return {
		profile,
		passed: errorCount === 0,
		errorCount,
		warningCount,
		infoCount,
		issues,
		summary
	};
}
