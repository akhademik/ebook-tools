// src/lib/epub-packer/parser/txt-syntax-validator.ts
import type { TxtSyntaxError, TxtSyntaxWarning, TxtSyntaxValidationResult } from '$lib/types';

interface OpenBlockInfo {
	tag: string;
	closeTag: string;
	lineNum: number;
	lineContent: string;
}

/**
 * Checks a line for unclosed footnote syntax like `{123` or `{abc` without matching `}`.
 */
function checkFootnoteSyntax(line: string, lineNum: number, errors: TxtSyntaxError[]): void {
	// Match { followed by text up to end of line or next space/char without closing }
	const unclosedMatches = line.matchAll(/\{([^{}\n]*)(?:$|(?=\{))/g);
	for (const m of unclosedMatches) {
		const inner = m[1];
		// If line contains closing brace for this opening brace, it's matched
		// We verify if this specific `{` has a matching `}` afterwards in the string
		const matchIndex = m.index ?? 0;
		const restOfLine = line.slice(matchIndex);
		if (!restOfLine.includes('}')) {
			errors.push({
				lineNum,
				lineContent: line,
				tag: '{...}',
				message: `Dòng ${lineNum}: Dấu chú thích '{${inner.trim()}' mở nhưng thiếu dấu ngoặc nhọn đóng '}'.`
			});
		}
	}
}

/**
 * Helper to replace matched substrings with spaces of identical length,
 * preserving character positions so extracted context offsets align with `line`.
 */
function maskWithSpaces(str: string, regex: RegExp): string {
	return str.replace(regex, (match) => ' '.repeat(match.length));
}

/**
 * Extracts a concise context snippet around a marker at index `pos` in `text`.
 * Extracts ~5 characters before and ~5 characters after the marker.
 * Example: '...21/1 Lê...'
 */
function extractContextSnippet(text: string, pos: number, radius = 5): string {
	const start = Math.max(0, pos - radius);
	const end = Math.min(text.length, pos + 1 + radius);
	const prefix = start > 0 ? '...' : '';
	const suffix = end < text.length ? '...' : '';
	const rawSnippet = text.slice(start, end).replace(/[\r\n\t]+/g, ' ');
	return `${prefix}${rawSnippet}${suffix}`;
}

/**
 * Finds all start indices of matches for a global RegExp in `str`.
 */
function findMatchIndices(str: string, regex: RegExp): number[] {
	const indices: number[] = [];
	const matches = str.matchAll(regex);
	for (const m of matches) {
		if (m.index !== undefined) {
			indices.push(m.index);
		}
	}
	return indices;
}

interface FootnoteSectionInspection {
	footnoteIdx: number;
	errors: TxtSyntaxError[];
}

const FOOTNOTE_HEADER_RE = /^\s*chú thích:\s*$/i;

/**
 * Inspects the single end-of-book "Chú thích:" section.
 * Enforces:
 * - At most one "Chú thích:" header in the entire file.
 * - The first non-empty line after "Chú thích:" must immediately start with `{n}`.
 * - No chapter/page markers (`@@`, `[new]`, `[new:center]`) may appear after "Chú thích:".
 */
function inspectFootnoteSection(lines: string[]): FootnoteSectionInspection {
	const headerIndices: number[] = [];
	for (let i = 0; i < lines.length; i++) {
		if (FOOTNOTE_HEADER_RE.test(lines[i])) {
			headerIndices.push(i);
		}
	}

	if (headerIndices.length === 0) {
		return { footnoteIdx: -1, errors: [] };
	}

	const errors: TxtSyntaxError[] = [];
	if (headerIndices.length > 1) {
		for (let k = 0; k < headerIndices.length; k++) {
			const idx = headerIndices[k];
			errors.push({
				lineNum: idx + 1,
				lineContent: lines[idx],
				tag: 'chú thích:',
				message: `Dòng ${idx + 1}: Phát hiện nhiều hơn một mục 'Chú thích:' (tổng cộng ${headerIndices.length} mục). Mỗi file TXT chỉ được phép có duy nhất 1 mục 'Chú thích:' ở cuối sách.`
			});
		}
		return { footnoteIdx: -1, errors };
	}

	const footnoteIdx = headerIndices[0];
	let firstNonEmptyIdx = -1;
	for (let j = footnoteIdx + 1; j < lines.length; j++) {
		if (lines[j].trim() !== '') {
			firstNonEmptyIdx = j;
			break;
		}
	}

	if (firstNonEmptyIdx === -1) {
		errors.push({
			lineNum: footnoteIdx + 1,
			lineContent: lines[footnoteIdx],
			tag: 'chú thích:',
			message: `Dòng ${footnoteIdx + 1}: Sau 'Chú thích:' không có nội dung chú thích '{n}' nào.`
		});
		return { footnoteIdx: -1, errors };
	}

	const firstTrimmed = lines[firstNonEmptyIdx].trim();
	if (!/^\{\d+\}/.test(firstTrimmed)) {
		errors.push({
			lineNum: firstNonEmptyIdx + 1,
			lineContent: lines[firstNonEmptyIdx],
			tag: 'chú thích:',
			message: `Dòng ${firstNonEmptyIdx + 1}: Ngay sau 'Chú thích:' bắt buộc phải bắt đầu bằng '{n}', phát hiện nội dung không hợp lệ '${firstTrimmed}'.`
		});
		return { footnoteIdx: -1, errors };
	}

	for (let j = footnoteIdx + 1; j < lines.length; j++) {
		const afterLine = lines[j].trim();
		if (/^@@/i.test(afterLine) || /^\[(new|new:center)\]$/i.test(afterLine)) {
			errors.push({
				lineNum: j + 1,
				lineContent: lines[j],
				tag: 'chú thích:',
				message: `Dòng ${j + 1}: Phát hiện cú pháp '${afterLine}' nằm sau dòng 'Chú thích:' (dòng ${footnoteIdx + 1}). Mục 'Chú thích:' bắt buộc phải nằm ở cuối sách.`
			});
		}
	}

	return { footnoteIdx, errors };
}

/**
 * Finds the start line index of the single valid end-of-book "Chú thích:" section.
 */
export function findFootnoteSectionIndex(lines: string[]): number {
	const inspection = inspectFootnoteSection(lines);
	return inspection.errors.length === 0 ? inspection.footnoteIdx : -1;
}

/**
 * Checks a line for unclosed inline formatting markers like *bold*, /italic/, _underline_,
 * and warns when two inline spans cross each other (e.g. `_a /b_ c/`).
 * Only checks markers that are attached to text (not surrounded by whitespace like 'ab / cd' or 'day la * binh thuong').
 * An opening marker is attached on the right to non-whitespace, or a closing marker is attached on the left to non-whitespace.
 */
function checkInlineFormatting(line: string, lineNum: number, warnings: TxtSyntaxWarning[]): void {
	const trimmed = line.trim();
	// Ignore scene breaks: *, **, ***, • • •, #, ##, ###
	if (/^(\*{1,5}|#{1,3}|•(\s*•)+|-{3,})$/.test(trimmed)) {
		return;
	}

	// Mask URLs (http://, https://, file://)
	let sanitized = maskWithSpaces(line, /https?:\/\/[^\s]+/gi);
	// Mask fractions, dates & address numbers like 1/2, 15/10/2026, 21/1, 21/1A, 21/1/3
	sanitized = maskWithSpaces(sanitized, /\b\d+[\p{L}]?(?:\/\d+[\p{L}]?)+\b/gu);
	// Mask known tag constructs like [/poem], [/letter], [/letter-box], [/new], [/new:center]
	sanitized = maskWithSpaces(sanitized, /\[\/(?:poem|letter|letter-box|new|new:center)\]/gi);

	const spans: Array<{ start: number; end: number; tag: string }> = [];

	// 1. Check bold: First mask all valid completed bold pairs: *(non-space ... non-space)*
	const boldPairRegex = /(?<!\d)\*([^\s*][^*]*[^\s*]|\S)\*(?!\d)/g;
	for (const m of sanitized.matchAll(boldPairRegex)) {
		if (m.index !== undefined) {
			spans.push({ start: m.index, end: m.index + m[0].length - 1, tag: '*' });
		}
	}
	const textWithoutValidBolds = maskWithSpaces(sanitized, boldPairRegex);
	// In the remainder, find asterisks that touch text: either '*text' or 'text*' (not isolated ' * ' or ' *')
	const lingeringBoldMarker = /(?<!\\)(?:(?<=\S)\*(?![\p{L}\p{N}])|(?<![\p{L}\p{N}])\*(?=\S))/gu;
	const boldIndices = findMatchIndices(textWithoutValidBolds, lingeringBoldMarker);
	if (boldIndices.length > 0) {
		const snippets = boldIndices.slice(0, 3).map((idx) => extractContextSnippet(line, idx, 5));
		const contextStr = snippets.map((s) => `"${s}"`).join(', ');
		warnings.push({
			lineNum,
			lineContent: line,
			tag: '*',
			context: snippets[0],
			message: `Dòng ${lineNum}: Có khả năng thiếu dấu '*' (ngữ cảnh: ${contextStr})`
		});
	}

	// 2. Check underline: First mask identifiers or illustration names like hinh_1, img_01, ten_bien_nay
	let underlineSanitized = maskWithSpaces(sanitized, /[\p{L}\p{N}]+(?:_[\p{L}\p{N}]+)+/gu);
	const underlinePairRegex = /_([^\s_][^_]*[^\s_]|\S)_/g;
	for (const m of underlineSanitized.matchAll(underlinePairRegex)) {
		if (m.index !== undefined) {
			spans.push({ start: m.index, end: m.index + m[0].length - 1, tag: '_' });
		}
	}
	underlineSanitized = maskWithSpaces(underlineSanitized, underlinePairRegex);
	const lingeringUnderlineMarker = /(?<!\\)(?:(?<=\S)_(?![\p{L}\p{N}])|(?<![\p{L}\p{N}])_(?=\S))/gu;
	const underlineIndices = findMatchIndices(underlineSanitized, lingeringUnderlineMarker);
	if (underlineIndices.length > 0) {
		const snippets = underlineIndices.slice(0, 3).map((idx) => extractContextSnippet(line, idx, 5));
		const contextStr = snippets.map((s) => `"${s}"`).join(', ');
		warnings.push({
			lineNum,
			lineContent: line,
			tag: '_',
			context: snippets[0],
			message: `Dòng ${lineNum}: Có khả năng thiếu dấu '_' (ngữ cảnh: ${contextStr})`
		});
	}

	// 3. Check italic: First mask all valid completed italic pairs: /(non-space ... non-space)/
	const italicPairRegex = /(?<!\d)\/([^\s/][^/]*[^\s/]|\S)\/(?!\d)/g;
	const textWithoutValidItalics = sanitized.replace(italicPairRegex, (match, content, offset) => {
		const cTrim = content.trim();
		if (/^\d+$/.test(cTrim)) return match;
		if (cTrim.length <= 2 && /^\d+$/.test(cTrim.replace(/[^0-9]/g, ''))) return match;
		if (typeof offset === 'number') {
			spans.push({ start: offset, end: offset + match.length - 1, tag: '/' });
		}
		return ' '.repeat(match.length);
	});
	// In the remainder, find slashes that touch text: '/text' or 'text/' (not inside words like 'km/h' or spaced ' a / b ')
	const lingeringItalicMarker = /(?<!\\)(?:(?<=\S)\/(?![\p{L}\p{N}])|(?<![\p{L}\p{N}])\/(?=\S))/gu;
	const italicIndices = findMatchIndices(textWithoutValidItalics, lingeringItalicMarker);
	if (italicIndices.length > 0) {
		const snippets = italicIndices.slice(0, 3).map((idx) => extractContextSnippet(line, idx, 5));
		const contextStr = snippets.map((s) => `"${s}"`).join(', ');
		warnings.push({
			lineNum,
			lineContent: line,
			tag: '/',
			context: snippets[0],
			message: `Dòng ${lineNum}: Có khả năng thiếu dấu '/' (ngữ cảnh: ${contextStr})`
		});
	}

	// 4. Check for crossed/overlapping inline formatting spans (e.g. `_đậm /và_ nghiêng/`)
	if (spans.length > 1) {
		spans.sort((a, b) => a.start - b.start);
		let reportedCross = false;
		for (let i = 0; i < spans.length && !reportedCross; i++) {
			for (let j = i + 1; j < spans.length; j++) {
				const a = spans[i];
				const b = spans[j];
				if (b.start >= a.end) break;
				if (a.start < b.start && b.start < a.end && a.end < b.end) {
					const snippet = extractContextSnippet(line, b.start, 8);
					warnings.push({
						lineNum,
						lineContent: line,
						tag: `${a.tag}${b.tag}`,
						context: snippet,
						message: `Dòng ${lineNum}: Phát hiện dấu định dạng '${a.tag}' và '${b.tag}' đan chéo nhau (ngữ cảnh: "${snippet}"). Nên tách hoặc lồng đúng thứ tự để tránh sai cấu trúc XHTML.`
					});
					reportedCross = true;
					break;
				}
			}
		}
	}
}

/**
 * Validates TXT content for syntax errors and warnings.
 * - Errors (Fail-Fast): unclosed block tags ([poem], [letter], [new]), unclosed footnotes ({n})
 * - Warnings: unclosed/odd inline formatting markers (*, /, _)
 */
export function validateTxtSyntax(rawText: string): TxtSyntaxValidationResult {
	const errors: TxtSyntaxError[] = [];
	const warnings: TxtSyntaxWarning[] = [];
	const lines = String(rawText || '')
		.replace(/\r\n|\r/g, '\n')
		.split('\n');

	// Inspect the single end-of-book "Chú thích:" section strictly
	const footnoteInspection = inspectFootnoteSection(lines);
	const footnoteIdx = footnoteInspection.footnoteIdx;
	if (footnoteInspection.errors.length > 0) {
		errors.push(...footnoteInspection.errors);
	}
	const contentLines = footnoteIdx !== -1 ? lines.slice(0, footnoteIdx) : lines;

	const blockStack: OpenBlockInfo[] = [];

	for (let i = 0; i < contentLines.length; i++) {
		const rawLine = contentLines[i];
		const stripped = rawLine.trim();
		const lineNum = i + 1; // 1-indexed for user readability

		if (!stripped) continue;

		// Check for escaped lines like \[poem] or \@: skip block/heading rules, but still validate inline {n} syntax
		if (
			stripped.startsWith('\\') &&
			stripped.length > 1 &&
			['@', '~', '>', '#', '*', '/', '_', '['].includes(stripped.charAt(1))
		) {
			checkFootnoteSyntax(rawLine, lineNum, errors);
			continue;
		}

		// Check for opening tags: [poem], [letter], [letter-box], [new], [new:center]
		const openBlockMatch = stripped.match(/^\[(poem|letter|letter-box)\]$/i);
		const openNewMatch = stripped.match(/^\[(new|new:center)\]$/i);

		// Check for closing tags: [/poem], [/letter], [/letter-box], [/new], [/new:center]
		const closeBlockMatch = stripped.match(/^\[\/(poem|letter|letter-box)\]$/i);
		const closeNewMatch = stripped.match(/^\[\/(new|new:center)\]$/i);

		if (openBlockMatch) {
			const tag = openBlockMatch[1].toLowerCase();
			const currentTop = blockStack[blockStack.length - 1];

			if (tag === 'letter-box') {
				// letter-box cannot be opened inside another poem or letter or letter-box
				if (currentTop && (currentTop.tag === 'poem' || currentTop.tag === 'letter')) {
					errors.push({
						lineNum,
						lineContent: rawLine,
						tag: `[${tag}]`,
						message: `Dòng ${lineNum}: Mở thẻ [${tag}] khi thẻ [${currentTop.tag}] ở dòng ${currentTop.lineNum} chưa được đóng bằng [/${currentTop.closeTag}].`
					});
				} else if (currentTop && currentTop.tag === 'letter-box') {
					errors.push({
						lineNum,
						lineContent: rawLine,
						tag: `[${tag}]`,
						message: `Dòng ${lineNum}: Mở thẻ [${tag}] khi khối [letter-box] ở dòng ${currentTop.lineNum} chưa được đóng bằng [/letter-box].`
					});
				}
			} else if (tag === 'poem') {
				// poem: can be opened directly, inside letter-box/new, or inside letter, but cannot be opened inside another poem
				if (currentTop && currentTop.tag === 'poem') {
					errors.push({
						lineNum,
						lineContent: rawLine,
						tag: `[${tag}]`,
						message: `Dòng ${lineNum}: Mở thẻ [${tag}] khi thẻ [${currentTop.tag}] ở dòng ${currentTop.lineNum} chưa được đóng bằng [/${currentTop.closeTag}].`
					});
				}
			} else {
				// letter: can be opened directly or inside letter-box/new, but cannot be opened inside poem or letter
				if (currentTop && (currentTop.tag === 'poem' || currentTop.tag === 'letter')) {
					errors.push({
						lineNum,
						lineContent: rawLine,
						tag: `[${tag}]`,
						message: `Dòng ${lineNum}: Mở thẻ [${tag}] khi thẻ [${currentTop.tag}] ở dòng ${currentTop.lineNum} chưa được đóng bằng [/${currentTop.closeTag}].`
					});
				}
			}

			blockStack.push({
				tag,
				closeTag: tag,
				lineNum,
				lineContent: rawLine
			});
			continue;
		}

		if (openNewMatch) {
			const tag = openNewMatch[1].toLowerCase();
			const currentTop = blockStack[blockStack.length - 1];
			// If already inside an open block of poem/letter/letter-box, that is a syntax violation
			if (currentTop && (currentTop.tag === 'poem' || currentTop.tag === 'letter')) {
				errors.push({
					lineNum,
					lineContent: rawLine,
					tag: `[${tag}]`,
					message: `Dòng ${lineNum}: Mở trang mới [${tag}] bên trong thẻ [${currentTop.tag}] (mở tại dòng ${currentTop.lineNum}) chưa đóng.`
				});
			} else if (currentTop && currentTop.tag === 'letter-box') {
				errors.push({
					lineNum,
					lineContent: rawLine,
					tag: `[${tag}]`,
					message: `Dòng ${lineNum}: Mở trang mới [${tag}] bên trong khối [letter-box] (mở tại dòng ${currentTop.lineNum}) chưa đóng. Vui lòng đặt [${tag}] làm wrapper bên ngoài [letter-box].`
				});
			} else if (currentTop && (currentTop.tag === 'new' || currentTop.tag === 'new:center')) {
				errors.push({
					lineNum,
					lineContent: rawLine,
					tag: `[${tag}]`,
					message: `Dòng ${lineNum}: Mở thẻ [${tag}] khi khối [${currentTop.tag}] ở dòng ${currentTop.lineNum} chưa được đóng bằng [/new].`
				});
			}

			blockStack.push({
				tag,
				closeTag: 'new',
				lineNum,
				lineContent: rawLine
			});
			continue;
		}

		if (closeBlockMatch) {
			const closeTag = closeBlockMatch[1].toLowerCase();
			const topIndex = blockStack.findLastIndex((b) => b.closeTag === closeTag);

			if (topIndex === -1) {
				errors.push({
					lineNum,
					lineContent: rawLine,
					tag: `[/${closeTag}]`,
					message: `Dòng ${lineNum}: Thấy thẻ đóng [/${closeTag}] nhưng không có thẻ mở [${closeTag}] tương ứng trước đó.`
				});
			} else {
				// Check if there are unclosed items above it in stack
				if (topIndex < blockStack.length - 1) {
					const unclosed = blockStack[blockStack.length - 1];
					errors.push({
						lineNum,
						lineContent: rawLine,
						tag: `[/${closeTag}]`,
						message: `Dòng ${lineNum}: Đóng thẻ [/${closeTag}] nhưng thẻ [${unclosed.tag}] mở tại dòng ${unclosed.lineNum} chưa được đóng.`
					});
				}
				blockStack.splice(topIndex, 1);
			}
			continue;
		}

		if (closeNewMatch) {
			const closeTag = closeNewMatch[1].toLowerCase();
			const topIndex = blockStack.findLastIndex((b) => b.closeTag === 'new');

			if (topIndex === -1) {
				errors.push({
					lineNum,
					lineContent: rawLine,
					tag: `[/${closeTag}]`,
					message: `Dòng ${lineNum}: Thấy thẻ đóng [/${closeTag}] nhưng không có thẻ mở [new] hoặc [new:center] tương ứng trước đó.`
				});
			} else {
				const targetBlock = blockStack[topIndex];
				if (closeTag === 'new:center' && targetBlock.tag !== 'new:center') {
					errors.push({
						lineNum,
						lineContent: rawLine,
						tag: '[/new:center]',
						message: `Dòng ${lineNum}: Thẻ đóng [/new:center] chỉ được dùng để đóng khối [new:center], không thể dùng để đóng [${targetBlock.tag}] (mở tại dòng ${targetBlock.lineNum}). Vui lòng dùng [/new].`
					});
					blockStack.splice(topIndex, 1);
				} else {
					if (topIndex < blockStack.length - 1) {
						const unclosed = blockStack[blockStack.length - 1];
						errors.push({
							lineNum,
							lineContent: rawLine,
							tag: `[/${closeTag}]`,
							message: `Dòng ${lineNum}: Đóng thẻ [/${closeTag}] khi thẻ [${unclosed.tag}] mở tại dòng ${unclosed.lineNum} chưa được đóng.`
						});
					}
					blockStack.splice(topIndex, 1);
				}
			}
			continue;
		}

		// Check for unclosed footnote syntax: {n
		checkFootnoteSyntax(rawLine, lineNum, errors);

		// Check for unclosed inline formatting markers: *, /, _
		checkInlineFormatting(rawLine, lineNum, warnings);

		// Check for heading syntax
		const headingSyntaxMatch = stripped.match(/^(@{1,2})(!)?(t|p)?\s+(.+)$/);
		if (headingSyntaxMatch) {
			const atCount = headingSyntaxMatch[1].length;
			const isNoToc = headingSyntaxMatch[2] === '!';
			const isInsideLetterOrPoem = blockStack.some((b) => b.tag === 'letter' || b.tag === 'poem');

			if (isInsideLetterOrPoem) {
				const activeLetterOrPoem = blockStack.findLast(
					(b) => b.tag === 'letter' || b.tag === 'poem'
				)!;
				if (!isNoToc) {
					// User rule: inside [letter] and [poem], only @@! and @! are converted to headings.
					// Regular @ or @@ do not STOP the build; emit a warning and render as plain <p>.
					warnings.push({
						lineNum,
						lineContent: rawLine,
						tag: headingSyntaxMatch[1],
						message: `Dòng ${lineNum}: Phát hiện cú pháp '${headingSyntaxMatch[1]}' trong khối [${activeLetterOrPoem.tag}] (mở tại dòng ${activeLetterOrPoem.lineNum}). Trong [${activeLetterOrPoem.tag}], chỉ có '${headingSyntaxMatch[1]}!' mới được chuyển thành tiêu đề không mục lục; '${headingSyntaxMatch[1]}' sẽ được giữ nguyên dạng văn bản thường <p>.`
					});
				}
			} else if (atCount === 2 && !isNoToc) {
				// Not inside letter or poem: check @@ (not @@!) inside [letter-box] without outer [new] wrapper
				const activeLetterBox = blockStack.find((b) => b.tag === 'letter-box');
				if (activeLetterBox) {
					const hasNewWrapper = blockStack.some((b) => b.tag === 'new' || b.tag === 'new:center');
					if (!hasNewWrapper) {
						errors.push({
							lineNum,
							lineContent: rawLine,
							tag: '@@',
							message: `Dòng ${lineNum}: Tiêu đề phân chương '@@' nằm bên trong khối [letter-box] (mở tại dòng ${activeLetterBox.lineNum}) sẽ làm vỡ cấu trúc XHTML. Vui lòng đóng [/letter-box] trước khi mở chương mới, hoặc bọc ngoài bằng [new].`
						});
					}
				}
			}
		}
	}

	// Strict footnote validation: each {n} must appear exactly 2 times (1 in body + 1 after "Chú thích:")
	if (footnoteInspection.errors.length === 0) {
		const bodyCallsByNum = new Map<string, number[]>();
		for (let i = 0; i < contentLines.length; i++) {
			const rawLine = contentLines[i];
			if (!rawLine.trim()) continue;
			for (const m of rawLine.matchAll(/\{(\d+)\}/g)) {
				const existing = bodyCallsByNum.get(m[1]) ?? [];
				existing.push(i + 1);
				bodyCallsByNum.set(m[1], existing);
			}
		}

		const defsByNum = new Map<string, number[]>();
		if (footnoteIdx !== -1) {
			for (let j = footnoteIdx + 1; j < lines.length; j++) {
				const afterLine = lines[j].trim();
				const fnDefMatch = afterLine.match(/^\{(\d+)\}/);
				if (fnDefMatch) {
					const num = fnDefMatch[1];
					const existing = defsByNum.get(num) ?? [];
					existing.push(j + 1);
					defsByNum.set(num, existing);
				}
			}
		}

		const allFootnoteNums = new Set<string>([...bodyCallsByNum.keys(), ...defsByNum.keys()]);
		for (const num of allFootnoteNums) {
			const bodyLines = bodyCallsByNum.get(num) ?? [];
			const defLines = defsByNum.get(num) ?? [];
			const totalCount = bodyLines.length + defLines.length;

			if (bodyLines.length === 1 && defLines.length === 1) {
				continue;
			}

			if (footnoteIdx === -1) {
				errors.push({
					lineNum: bodyLines[0],
					lineContent: contentLines[bodyLines[0] - 1],
					tag: `{${num}}`,
					message: `Dòng ${bodyLines[0]}: Tìm thấy '{${num}}' (${bodyLines.length} lần trong nội dung) nhưng văn bản không có mục 'Chú thích:' hợp lệ ở cuối sách. Mỗi mã '{n}' bắt buộc xuất hiện đúng 2 lần (1 lần trong nội dung và 1 lần sau 'Chú thích:').`
				});
			} else if (bodyLines.length === 1 && defLines.length === 0) {
				errors.push({
					lineNum: bodyLines[0],
					lineContent: contentLines[bodyLines[0] - 1],
					tag: `{${num}}`,
					message: `Dòng ${bodyLines[0]}: Mã '{${num}}' chỉ xuất hiện 1 lần trong nội dung nhưng thiếu định nghĩa '{${num}}' sau 'Chú thích:' (bắt buộc đúng 2 lần: 1 lần trong nội dung và 1 lần sau 'Chú thích:').`
				});
			} else if (bodyLines.length === 0 && defLines.length === 1) {
				errors.push({
					lineNum: defLines[0],
					lineContent: lines[defLines[0] - 1],
					tag: `{${num}}`,
					message: `Dòng ${defLines[0]}: Mục chú thích '{${num}}' sau 'Chú thích:' chỉ xuất hiện 1 lần và không có vị trí gọi '{${num}}' trong nội dung (bắt buộc đúng 2 lần).`
				});
			} else {
				const reportLine = bodyLines.length > 1 ? bodyLines[0] : defLines[0];
				const reportContent =
					bodyLines.length > 1 ? contentLines[reportLine - 1] : lines[reportLine - 1];
				errors.push({
					lineNum: reportLine,
					lineContent: reportContent,
					tag: `{${num}}`,
					message: `Dòng ${reportLine}: Mã chú thích '{${num}}' xuất hiện tổng cộng ${totalCount} lần (${bodyLines.length} lần trong nội dung, ${defLines.length} lần sau 'Chú thích:'). Mỗi mã '{n}' chỉ được xuất hiện đúng 2 lần (1 lần trong nội dung và 1 lần sau 'Chú thích:').`
				});
			}
		}
	}

	// At end of file, check for any unclosed tags remaining in the stack
	while (blockStack.length > 0) {
		const unclosed = blockStack.pop()!;
		errors.push({
			lineNum: unclosed.lineNum,
			lineContent: unclosed.lineContent,
			tag: `[${unclosed.tag}]`,
			message: `Dòng ${unclosed.lineNum}: Thẻ [${unclosed.tag}] đã mở nhưng chưa có thẻ đóng [/${unclosed.closeTag}] trước khi kết thúc file.`
		});
	}

	// Sort errors and warnings by line number ascending
	errors.sort((a, b) => a.lineNum - b.lineNum);
	warnings.sort((a, b) => a.lineNum - b.lineNum);

	return {
		isValid: errors.length === 0,
		errors,
		warnings
	};
}
