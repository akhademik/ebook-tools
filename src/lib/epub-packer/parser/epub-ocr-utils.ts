// src/lib/epub-packer/parser/epub-ocr-utils.ts
import * as logger from '$lib/helpers/logger.js';
import { normalizeCharPreserveLength } from '$lib/helpers/helpers.js';
import type { ScannedReportItem, CleanedLinesReportItem } from '$lib/types';

export type { ScannedReportItem, CleanedLinesReportItem };

export function isRealParagraph(line: string): boolean {
	const trim = line.trim();
	if (!trim) return false;
	const endsSentence = /[.!?…”"’]/.test(trim.slice(-1));
	const wordCount = trim.split(/\s+/).filter(Boolean).length;
	return endsSentence && (wordCount > 5 || trim.length > 30);
}

function shouldSkipHeaderFooter(lines: string[], normKeywords: string[] = []): boolean {
	if (lines.length < 6) return true;
	if (normKeywords && normKeywords.length > 0) return false;
	const first = lines.find(l => l.trim()) || '';
	let last = '';
	for (let i = lines.length - 1; i >= 0; i--) {
		if (lines[i].trim()) {
			last = lines[i];
			break;
		}
	}
	return isRealParagraph(first) || isRealParagraph(last);
}

function compileCleanKeywords(keywords: string[] | string | undefined): {
	cleanArabic: boolean;
	cleanRoman: boolean;
	normKeywords: string[];
} {
	let keywordsList: string[] = [];
	if (Array.isArray(keywords)) {
		keywordsList = keywords;
	} else if (typeof keywords === 'string') {
		keywordsList = keywords.split(',').map(s => s.trim()).filter(Boolean);
	}

	const cleanArabic = keywordsList.some(k => k.trim().toLowerCase() === '{no}');
	const cleanRoman = keywordsList.some(k => k.trim().toLowerCase() === '{roman_no}');

	const filteredKeywords = keywordsList.filter(k => {
		const trimmed = k.trim().toLowerCase();
		return trimmed !== '{no}' && trimmed !== '{roman_no}';
	});

	const normKeywords = filteredKeywords
		.map(k => String(k).trim())
		.filter(Boolean)
		.map(k => normalizeCharPreserveLength(k).replace(/[^a-z0-9]/g, ''));

	return { cleanArabic, cleanRoman, normKeywords };
}

function isLineHeaderFooter(
	line: string,
	cleanArabic: boolean,
	cleanRoman: boolean,
	normKeywords: string[]
): boolean {
	const trimmed = line.trim();
	if (!trimmed) return false;

	// A header or footer line is never a long prose line
	const wordCount = trimmed.split(/\s+/).filter(Boolean).length;
	if (trimmed.length > 80 || wordCount > 15) {
		return false;
	}

	if (cleanArabic) {
		if (/^[-—–~]*\s*\d+\s*[-—–~]*$/.test(trimmed)) return true;
	}

	if (cleanRoman) {
		if (/^[ivxldcmIVXLDCM]+[-—–~]*$/.test(trimmed)) return true;
	}

	if (normKeywords && normKeywords.length > 0) {
		const normLine = normalizeCharPreserveLength(trimmed).replace(/[^a-z0-9]/g, '');
		if (normLine) {
			for (const nk of normKeywords) {
				if (normLine === nk || (nk.length > 3 && (normLine.includes(nk) || nk.includes(normLine)))) {
					return true;
				}
			}
		}
	}
	return false;
}

export function cleanHeaderFooterOcr(
	text: string,
	keywords: string[] | string | undefined,
	lineLimit = 2
): string {
	logger.log('epub-parser', 'cleanHeaderFooterOcr called, lines:', String(text || '').split('\n').length, 'keywords:', keywords);
	const lines = String(text).replace(/\r\n/g, '\n').split('\n');
	const { cleanArabic, cleanRoman, normKeywords } = compileCleanKeywords(keywords);
	if (shouldSkipHeaderFooter(lines, normKeywords)) {
		logger.log('epub-parser', 'cleanHeaderFooterOcr: skipped cleaning (real paragraphs at boundary)');
		return text;
	}

	const linesToRemove: number[] = [];
	for (let i = 0; i < Math.min(lineLimit, lines.length); i++) {
		if (isLineHeaderFooter(lines[i], cleanArabic, cleanRoman, normKeywords)) linesToRemove.push(i);
	}
	for (let i = lines.length - 1; i >= Math.max(0, lines.length - lineLimit); i--) {
		if (isLineHeaderFooter(lines[i], cleanArabic, cleanRoman, normKeywords)) linesToRemove.push(i);
	}

	const resultLines = lines.filter((_, idx) => !linesToRemove.includes(idx));
	logger.log('epub-parser', `cleanHeaderFooterOcr: removed ${linesToRemove.length} header/footer lines`);
	return resultLines.join('\n');
}

export function getCleanedLinesReport(
	rawFilesList: Array<{ baseName: string; rawText?: string }>,
	keywords: string[] | string | undefined,
	lineLimit = 2
): CleanedLinesReportItem[] {
	const report: CleanedLinesReportItem[] = [];
	const { cleanArabic, cleanRoman, normKeywords } = compileCleanKeywords(keywords);

	for (let idx = 0; idx < rawFilesList.length; idx++) {
		const f = rawFilesList[idx];
		const lines = String(f.rawText || '').replace(/\r\n/g, '\n').split('\n');
		if (shouldSkipHeaderFooter(lines, normKeywords)) continue;

		const scanned: ScannedReportItem[] = [];
		for (let i = 0; i < Math.min(lineLimit, lines.length); i++) {
			scanned.push({
				lineNum: i + 1,
				text: lines[i],
				location: 'Đầu file',
				isRemoved: isLineHeaderFooter(lines[i], cleanArabic, cleanRoman, normKeywords)
			});
		}
		for (let i = lines.length - 1; i >= Math.max(0, lines.length - lineLimit); i--) {
			if (i < lineLimit) continue; 
			scanned.push({
				lineNum: i + 1,
				text: lines[i],
				location: 'Cuối file',
				isRemoved: isLineHeaderFooter(lines[i], cleanArabic, cleanRoman, normKeywords)
			});
		}

		scanned.sort((a, b) => a.lineNum - b.lineNum);

		if (scanned.length > 0) {
			report.push({
				fileName: f.baseName,
				scanned
			});
		}
	}
	return report;
}
