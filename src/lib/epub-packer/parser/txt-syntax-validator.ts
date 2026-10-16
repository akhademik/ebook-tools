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
 * Checks a line for unclosed inline formatting markers like *bold*, /italic/, _underline_.
 * Only checks markers that are attached to text (not surrounded by whitespace like 'ab / cd' or 'day la * binh thuong').
 * An opening marker is attached on the right to non-whitespace, or a closing marker is attached on the left to non-whitespace.
 */
function checkInlineFormatting(line: string, lineNum: number, warnings: TxtSyntaxWarning[]): void {
	const trimmed = line.trim();
	// Ignore scene breaks: *, **, ***, • • •, #, ##, ###
	if (/^(\*{1,5}|#{1,3}|•(\s*•)+|-{3,})$/.test(trimmed)) {
		return;
	}

	// Remove URLs (http://, https://, file://) before checking slashes
	let sanitized = line.replace(/https?:\/\/[^\s]+/gi, '');
	// Remove dates like 15/10/2026 or 1/2/2025
	sanitized = sanitized.replace(/\b\d{1,2}\/\d{1,2}(?:\/\d{2,4})?\b/g, '');
	// Remove fractions like 1/2, 3/4
	sanitized = sanitized.replace(/\b\d+\/\d+\b/g, '');
	// Remove known tag constructs like [/poem], [/letter], [/letter-box], [/new]
	sanitized = sanitized.replace(/\[\/(?:poem|letter|letter-box|new)\]/gi, '');

	// 1. Check bold: First remove all valid completed bold pairs: *(non-space ... non-space)*
	const boldPairRegex = /(?<!\d)\*([^\s*][^*]*[^\s*]|\S)\*(?!\d)/g;
	const textWithoutValidBolds = sanitized.replace(boldPairRegex, '');
	// In the remainder, find asterisks that touch text: either '*text' or 'text*' (not isolated ' * ' or ' *')
	const lingeringBoldMarker = /(?<!\\)(?:(?<=\S)\*(?!\d)|(?<!\d)\*(?=\S))/g;
	const lingeringStars = textWithoutValidBolds.match(lingeringBoldMarker);
	if (lingeringStars && lingeringStars.length > 0) {
		warnings.push({
			lineNum,
			lineContent: line,
			tag: '*',
			message: `Dòng ${lineNum}: Có khả năng thiếu dấu '*'`
		});
	}

	// 2. Check underline: First remove all valid completed underline pairs: _(non-space ... non-space)_
	// Ignore identifiers or illustration names like hinh_1, img_01
	let underlineSanitized = sanitized.replace(/[\p{L}\p{N}]+_[\p{L}\p{N}]+/gu, '');
	const underlinePairRegex = /_([^\s_][^_]*[^\s_]|\S)_/g;
	underlineSanitized = underlineSanitized.replace(underlinePairRegex, '');
	const lingeringUnderlineMarker = /(?<!\\)(?:(?<=\S)_(?![\p{L}\p{N}])|(?<![\p{L}\p{N}])_(?=\S))/gu;
	const lingeringUnderlines = underlineSanitized.match(lingeringUnderlineMarker);
	if (lingeringUnderlines && lingeringUnderlines.length > 0) {
		warnings.push({
			lineNum,
			lineContent: line,
			tag: '_',
			message: `Dòng ${lineNum}: Có khả năng thiếu dấu '_'`
		});
	}

	// 3. Check italic: First remove all valid completed italic pairs: /(non-space ... non-space)/
	const italicPairRegex = /(?<!\d)\/([^\s/][^/]*[^\s/]|\S)\/(?!\d)/g;
	const textWithoutValidItalics = sanitized.replace(italicPairRegex, (_match, content) => {
		const cTrim = content.trim();
		if (/^\d+$/.test(cTrim)) return _match;
		if (cTrim.length <= 2 && /^\d+$/.test(cTrim.replace(/[^0-9]/g, ''))) return _match;
		return '';
	});
	// In the remainder, find slashes that touch text: '/text' or 'text/' (not surrounded by space like ' a / b ')
	const lingeringItalicMarker = /(?<!\\)(?:(?<=\S)\/(?!\d)|(?<!\d)\/(?=\S))/g;
	const lingeringSlashes = textWithoutValidItalics.match(lingeringItalicMarker);
	if (lingeringSlashes && lingeringSlashes.length > 0) {
		warnings.push({
			lineNum,
			lineContent: line,
			tag: '/',
			message: `Dòng ${lineNum}: Có khả năng thiếu dấu '/'`
		});
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
		.replace(/\r\n/g, '\n')
		.split('\n');

	// Ignore everything after "Chú thích:" line because footnote sections follow different syntax
	const footnoteIdx = lines.findIndex((l) => /^\s*chú thích:?\s*$/i.test(l));
	const contentLines = footnoteIdx !== -1 ? lines.slice(0, footnoteIdx) : lines;

	const blockStack: OpenBlockInfo[] = [];

	for (let i = 0; i < contentLines.length; i++) {
		const rawLine = contentLines[i];
		const stripped = rawLine.trim();
		const lineNum = i + 1; // 1-indexed for user readability

		if (!stripped) continue;

		// Check for escaped lines like \[poem]
		if (
			stripped.startsWith('\\') &&
			stripped.length > 1 &&
			['@', '~', '>', '#', '*', '/', '_', '['].includes(stripped.charAt(1))
		) {
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
			} else {
				// poem or letter: can be opened directly or inside letter-box/new, but cannot be opened inside poem or letter
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
					// User rule: only @@! or @! are allowed in letter or poem
					errors.push({
						lineNum,
						lineContent: rawLine,
						tag: headingSyntaxMatch[1],
						message: `Dòng ${lineNum}: Trong khối [${activeLetterOrPoem.tag}] (mở tại dòng ${activeLetterOrPoem.lineNum}), chỉ cho phép dùng '${headingSyntaxMatch[1]}!' để lấy kiểu dáng tiêu đề không tạo mục lục. Tiêu đề '${headingSyntaxMatch[1]}' không hợp lệ bên trong khối này.`
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

	// Check if there are content lines (like @@ or [new]) placed after "Chú thích:"
	if (footnoteIdx !== -1) {
		for (let j = footnoteIdx + 1; j < lines.length; j++) {
			const afterLine = lines[j].trim();
			const afterLineNum = j + 1;
			if (/^@@/i.test(afterLine) || /^\[(new|new:center)\]$/i.test(afterLine)) {
				warnings.push({
					lineNum: afterLineNum,
					lineContent: lines[j],
					tag: 'chú thích:',
					message: `Dòng ${afterLineNum}: Phát hiện cú pháp '${afterLine}' nằm sau dòng 'Chú thích:' (dòng ${footnoteIdx + 1}). Toàn bộ nội dung sau 'Chú thích:' được coi là chú thích cuối sách và không tạo chương mới.`
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
			message: `Dòng ${unclosed.lineNum}: Thẻ [${unclosed.tag}] đã mở nhưng chưa có thẻ đóng [/${unclosed.closeTag}] trước khi kết thúc tệp.`
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
