// src/lib/epub-packer/parser/txt-syntax-validator.ts
import type { TxtSyntaxError, TxtSyntaxValidationResult } from '$lib/types';

interface OpenBlockInfo {
	tag: string;
	closeTag: string;
	lineNum: number;
	lineContent: string;
}

/**
 * Validates TXT content for syntax errors, focusing on unclosed, mismatched, or orphaned tags.
 * Throws early or returns errors list if unclosed tags like [poem], [letter], [new] are found.
 */
export function validateTxtSyntax(rawText: string): TxtSyntaxValidationResult {
	const errors: TxtSyntaxError[] = [];
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

		// Check for opening tags: [poem], [letter], [new], [new:center]
		const openBlockMatch = stripped.match(/^\[(poem|letter)\]$/i);
		const openNewMatch = stripped.match(/^\[(new|new:center)\]$/i);

		// Check for closing tags: [/poem], [/letter], [/new]
		const closeBlockMatch = stripped.match(/^\[\/(poem|letter)\]$/i);
		const closeNewMatch = stripped.match(/^\[\/new\]$/i);

		if (openBlockMatch) {
			const tag = openBlockMatch[1].toLowerCase();
			// If already inside an open block of the same or another type, report unclosed previous block
			const currentTop = blockStack[blockStack.length - 1];
			if (currentTop && (currentTop.tag === 'poem' || currentTop.tag === 'letter')) {
				errors.push({
					lineNum,
					lineContent: rawLine,
					tag: `[${tag}]`,
					message: `Dòng ${lineNum}: Mở thẻ [${tag}] khi thẻ [${currentTop.tag}] ở dòng ${currentTop.lineNum} chưa được đóng bằng [/${currentTop.closeTag}].`
				});
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
			// If already inside an open block of poem/letter, that is a syntax violation
			if (currentTop && (currentTop.tag === 'poem' || currentTop.tag === 'letter')) {
				errors.push({
					lineNum,
					lineContent: rawLine,
					tag: `[${tag}]`,
					message: `Dòng ${lineNum}: Mở trang mới [${tag}] bên trong thẻ [${currentTop.tag}] (mở tại dòng ${currentTop.lineNum}) chưa đóng.`
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
			const topIndex = blockStack.findLastIndex((b) => b.closeTag === 'new');

			if (topIndex === -1) {
				errors.push({
					lineNum,
					lineContent: rawLine,
					tag: '[/new]',
					message: `Dòng ${lineNum}: Thấy thẻ đóng [/new] nhưng không có thẻ mở [new] hoặc [new:center] tương ứng trước đó.`
				});
			} else {
				if (topIndex < blockStack.length - 1) {
					const unclosed = blockStack[blockStack.length - 1];
					errors.push({
						lineNum,
						lineContent: rawLine,
						tag: '[/new]',
						message: `Dòng ${lineNum}: Đóng thẻ [/new] khi thẻ [${unclosed.tag}] mở tại dòng ${unclosed.lineNum} chưa được đóng.`
					});
				}
				blockStack.splice(topIndex, 1);
			}
			continue;
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

	// Sort errors by line number ascending
	errors.sort((a, b) => a.lineNum - b.lineNum);

	return {
		isValid: errors.length === 0,
		errors
	};
}
