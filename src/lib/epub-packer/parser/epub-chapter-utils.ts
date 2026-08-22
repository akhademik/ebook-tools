// src/lib/epub-packer/parser/epub-chapter-utils.ts
import * as logger from '$lib/helpers/logger.js';
import { normalizeCharPreserveLength } from '$lib/helpers/helpers.js';
import type {
	MarkdownBlock,
	RawFileItem,
	ChapterCutPoint,
	ChapterCandidateItem,
	ChapterMatcher
} from '$lib/types';

export type {
	MarkdownBlock,
	RawFileItem,
	ChapterCutPoint,
	ChapterCandidateItem,
	ChapterMatcher
};

function isDecorationOnly(s: string): boolean {
	return /^[\s*_]*$/.test(s);
}

export function stripDecoration(s: unknown): string {
	return String(s || '').replace(/^[\s*_]+|[\s*_]+$/g, '').trim();
}

export function makeChapterMatcher(patternRaw?: string): ChapterMatcher | null {
	const pattern = (patternRaw || '').trim();
	if (!pattern) return null;
	const asRegex = pattern.match(/^\/(.+)\/([a-z]*)$/i);
	if (asRegex) {
		let re: RegExp;
		try {
			const flags = asRegex[2].includes('g') ? asRegex[2] : asRegex[2] + 'g';
			re = new RegExp(asRegex[1], flags);
		} catch { return null; }
		return {
			locate(text, fromIndex) {
				re.lastIndex = fromIndex || 0;
				const m = re.exec(String(text || ''));
				return m ? { index: m.index } : null;
			}
		};
	}
	const normPattern = normalizeCharPreserveLength(pattern);
	return {
		locate(text, fromIndex) {
			const norm = normalizeCharPreserveLength(text);
			let from = fromIndex || 0;
			while (true) {
				const idx = norm.indexOf(normPattern, from);
				if (idx === -1) return null;
				const prevChar = idx > 0 ? norm[idx - 1] : '';
				if (idx === 0 || !/[a-z0-9]/.test(prevChar)) return { index: idx };
				from = idx + 1;
			}
		}
	};
}

export function extractMarkerTitle(text: string, matchIndex: number, fallback: string): string {
	const rest = text.slice(matchIndex);
	const m = rest.match(/^(\S+(?:\s+[IVXLCDM]+|\s+\d+)?(?:\s*[:\-–—]\s*[^.?!\n]{0,40})?)/);
	const t = (m ? m[1] : rest.slice(0, 30)).trim();
	return t || fallback;
}

export function pushIfLineStart(
	arr: ChapterCutPoint[],
	text: string,
	blockIndex: number,
	matchIndex: number,
	type: string
): boolean {
	const lastNewline = text.lastIndexOf('\n', matchIndex - 1);
	const lineStart = lastNewline === -1 ? 0 : lastNewline + 1;
	const prefix = text.slice(lineStart, matchIndex);
	if (isDecorationOnly(prefix)) {
		arr.push({ blockIndex, offset: lineStart, type });
		return true;
	}
	return false;
}

export function scoreHeadingCandidate(rawText: string, blockType = 'p', isFirstBlock = false): number {
	const plain = rawText.replace(/^[\s*_“"‘«]+|[\s*_”"’»]+$/g, '').trim();
	if (!plain) return -99;
	if (/^[-—–~]\s+\S+/.test(plain)) return -99;

	// Reject if the first letter character in the block is lowercase (Unicode property escape)
	const firstLetterMatch = plain.match(/\p{L}/u);
	if (firstLetterMatch && /^\p{Ll}/u.test(firstLetterMatch[0])) {
		logger.log('epub-chapter-utils', `scoreHeadingCandidate REJECTED (lowercase first letter "${firstLetterMatch[0]}"): "${plain.slice(0, 40)}..."`);
		return -99;
	}

	const isBold = /^\*\*[\s\S]+\*\*$/.test(rawText.trim()) || /^__[\s\S]+__$/.test(rawText.trim());
	const len = plain.length;
	const wordCount = plain.split(/\s+/).filter(Boolean).length;
	const hasEndPunct = /[.!?,;:]$/.test(plain);
	const hasLetters = /\p{L}/u.test(plain);
	const isAllCaps = hasLetters && plain === plain.toUpperCase() && plain !== plain.toLowerCase();

	let score = 0;
	if (isAllCaps) score += 3;
	if (len <= 40) score += 2;
	else if (len > 80) score -= 3;
	if (wordCount <= 6) score += 1;
	if (!hasEndPunct) score += 2;
	if (isBold) score += 2;
	if (/^\p{Lu}/u.test(plain)) score += 1;

	// Pure heuristic bonuses:
	// 1. Bonus for explicit markdown heading blocks
	if (blockType === 'heading') {
		score += 3;
	}
	// 2. Bonus for bold paragraph blocks at the top of the file
	if (blockType === 'p' && isBold && isFirstBlock) {
		score += 2;
	}

	if (hasEndPunct) score -= 5;
	if (/[\x22\x27“”‘’«»]/.test(rawText)) score -= 5;

	return score;
}

export function extractChunkBlocks(
	blocks: MarkdownBlock[],
	start: ChapterCutPoint | null,
	end: ChapterCutPoint | null
): MarkdownBlock[] {
	const startBI = start ? start.blockIndex : 0;
	const startOff = start ? start.offset : 0;
	const lastBI = end ? end.blockIndex : blocks.length - 1;
	const result: MarkdownBlock[] = [];
	for (let i = startBI; i <= lastBI; i++) {
		const b = blocks[i];
		if (!b) continue;
		if (b.type === 'heading' || b.type === 'p') {
			const sliceStart = (i === startBI) ? startOff : 0;
			const sliceEnd = (end && i === end.blockIndex) ? end.offset : b.text.length;
			const sub = b.text.slice(sliceStart, sliceEnd).trim();
			if (sub) result.push({ type: b.type, level: b.level, text: sub });
		} else {
			result.push(b);
		}
	}
	return result;
}

export function assignSequentialChapterIds(chapters: any[]): any[] {
	logger.log('epub-parser', 'assignSequentialChapterIds called for chapters count:', chapters.length);
	let chapCount = 0;
	const width = Math.max(2, String(chapters.length).length);
	const result = chapters.map((c) => {
		if (c.fileName === 'notes' || c.isNotes) {
			return { ...c, fileName: 'notes', xmlId: 'notes' };
		}
		if (c.isChapter) {
			chapCount++;
		}
		const fileName = c.isChapter
			? 'chap_' + String(chapCount).padStart(width, '0')
			: 'p' + String(c.firstSourcePageNum).padStart(width, '0');
		const xmlId = c.isChapter
			? 'chap' + String(chapCount).padStart(width, '0')
			: 'p' + String(c.firstSourcePageNum).padStart(width, '0');
		return { ...c, fileName, xmlId, chapterIndex: c.isChapter ? chapCount : null };
	});
	logger.log('epub-parser', 'assignSequentialChapterIds finished: total chapters =', chapCount);
	return result;
}

export function analyzeChapterCandidates(
	rawFilesList: RawFileItem[],
	patternRaw: string,
	useHeuristic: boolean,
	startPage: number,
	endPage: number,
	heuristicThreshold = 5
): ChapterCandidateItem[] {
	logger.log('epub-parser', 'analyzeChapterCandidates called, files count:', rawFilesList.length, 'pattern:', patternRaw, 'useHeuristic:', useHeuristic, 'threshold:', heuristicThreshold);
	const matcher = useHeuristic ? null : makeChapterMatcher(patternRaw);
	const candidates: ChapterCandidateItem[] = [];

	for (let idx = 0; idx < rawFilesList.length; idx++) {
		const f = rawFilesList[idx];
		const pageNum = idx + 1;
		const isHeuristicActive = useHeuristic && (pageNum >= startPage && pageNum <= endPage);

		for (let i = 0; i < f.blocks.length; i++) {
			const b = f.blocks[i];
			if (b.type !== 'heading' && b.type !== 'p') continue;

			const score = scoreHeadingCandidate(b.text);
			
			let regexMatch = false;
			if (matcher) {
				const loc = matcher.locate(b.text, 0);
				if (loc) {
					const lastNewline = b.text.lastIndexOf('\n', loc.index - 1);
					const lineStart = lastNewline === -1 ? 0 : lastNewline + 1;
					const prefix = b.text.slice(lineStart, loc.index);
					if (isDecorationOnly(prefix)) regexMatch = true;
				}
			}

			const heuristicMatch = isHeuristicActive && !b.text.includes('\n') && score >= heuristicThreshold;
			const isMatch = regexMatch || heuristicMatch;
			
			if (b.type === 'heading' || score > -10 || isMatch) {
				const nextBlocks: string[] = [];
				let count = 0;
				for (let j = i + 1; j < f.blocks.length && count < 2; j++) {
					if (f.blocks[j].text && f.blocks[j].text.trim()) {
						nextBlocks.push(f.blocks[j].text.slice(0, 150) + (f.blocks[j].text.length > 150 ? '...' : ''));
						count++;
					}
				}

				candidates.push({
					pageNum,
					fileName: f.baseName,
					blockIndex: i,
					text: b.text,
					type: b.type,
					score: score,
					regexMatch,
					heuristicMatch,
					isMatch,
					snippet: nextBlocks.join('\n\n')
				});
			}
		}
	}
	logger.log('epub-parser', 'analyzeChapterCandidates finished, total candidates:', candidates.length);
	return candidates;
}
