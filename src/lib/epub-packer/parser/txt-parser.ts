// src/lib/epub-packer/parser/txt-parser.ts
import { Logger, escapeXml } from '$lib/utils';
import type { CustomDefinition, ParseTxtOptions, RawChapterItem } from '$lib/types';

export type { ParseTxtOptions, RawChapterItem };

function escapeRegExp(str: string): string {
	return String(str || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function getClosingTag(openTag: string): string {
	const match = openTag.match(/<([a-zA-Z0-9]+)/);
	return match ? `</${match[1]}>` : '';
}

function stripHtmlTags(html: string): string {
	return html.replace(/<[^>]+>/g, '').trim();
}

function applyInlineFormatting(text: string, customDefinitions: CustomDefinition[] = []): string {
	let t = escapeXml(String(text || ''));

	const customTags: string[] = [];

	if (Array.isArray(customDefinitions)) {
		for (const def of customDefinitions) {
			if (def.pattern && def.tag) {
				const escapedP = escapeRegExp(def.pattern);
				const reCustom = new RegExp(escapedP + '(.+?)' + escapedP, 'g');
				t = t.replace(reCustom, (_m, content) => {
					const closingTag = getClosingTag(def.tag);
					const openIdx = customTags.length;
					customTags.push(def.tag);
					const closeIdx = customTags.length;
					customTags.push(closingTag);
					return `XCUSTOMXTAGX${openIdx}X${content}XCUSTOMXTAGX${closeIdx}X`;
				});
			}
		}
	}

	const boldRegex = /(?<!\d)\*([^\s*][^*]*[^\s*]|\S)\*(?!\d)/g;
	t = t.replace(boldRegex, 'XBOLDXOPENX$1XBOLDXCLOSEX');

	const italicRegex = /(?<!\d)\/([^\s/][^/]*[^\s/]|\S)\/(?!\d)/g;
	t = t.replace(italicRegex, (match, content) => {
		const trimmed = content.trim();
		if (/^\d+$/.test(trimmed)) {
			return match;
		}
		if (trimmed.length <= 2 && /^\d+$/.test(trimmed.replace(/[^0-9]/g, ''))) {
			return match;
		}
		return `XITALICXOPENX${content}XITALICXCLOSEX`;
	});

	const underlineRegex = /_([^\s_][^_]*[^\s_]|\S)_/g;
	t = t.replace(underlineRegex, 'XUNDERLINEXOPENX$1XUNDERLINEXCLOSEX');

	// Restore all placeholders
	t = t
		.replace(/XBOLDXOPENX/g, '<b>')
		.replace(/XBOLDXCLOSEX/g, '</b>')
		.replace(/XITALICXOPENX/g, '<i>')
		.replace(/XITALICXCLOSEX/g, '</i>')
		.replace(/XUNDERLINEXOPENX/g, '<u>')
		.replace(/XUNDERLINEXCLOSEX/g, '</u>');

	t = t.replace(/XCUSTOMXTAGX(\d+)X/g, (_m, idx) => {
		return customTags[Number(idx)];
	});

	t = t.replace(/\{(\d+)\}/g, (_m, n) => {
		return `<a class="noteref" epub:type="noteref" id="fnref${n}" href="notes.xhtml#fn${n}"><sup>${n}</sup></a>`;
	});

	return t;
}

function isIllustrationTag(
	tagKey: string,
	imagesMap: Record<string, { fileName?: string }> = {}
): string | null {
	const lowerKey = (tagKey || '').toLowerCase();
	if (
		['letter', '/letter', 'poem', '/poem', 'new', '/new', 'new:center'].includes(lowerKey) ||
		lowerKey.startsWith('new:')
	) {
		return null;
	}
	if (imagesMap[lowerKey]) {
		return imagesMap[lowerKey].fileName || tagKey;
	}
	const baseKey = lowerKey.replace(/\.[^.]+$/, '');
	if (imagesMap[baseKey]) {
		return imagesMap[baseKey].fileName || tagKey;
	}
	const hasImgExt = /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(lowerKey);
	const isIllustPrefix = /^(hinh|hình|img|image|anh|ảnh|pic|illust|illustration)[_\-\d]/i.test(
		lowerKey
	);
	if (hasImgExt || isIllustPrefix) {
		if (hasImgExt) return tagKey;
		return `${tagKey}.jpg`;
	}
	return null;
}

let txtWorkerInstance: Worker | null = null;

function getTxtParserWorker(): Worker | null {
	if (typeof window === 'undefined' || typeof Worker === 'undefined') {
		return null;
	}
	if (!txtWorkerInstance) {
		try {
			txtWorkerInstance = new Worker(new URL('./txt-parser.worker.ts', import.meta.url), {
				type: 'module'
			});
		} catch (err) {
			Logger.warn(
				'[txt-parser]',
				'Failed to instantiate TxtParser worker, using direct execution:',
				err
			);
			return null;
		}
	}
	return txtWorkerInstance;
}

/**
 * Asynchronously parse TXT into chapters using a background Web Worker when available.
 */
export async function parseTxtToChaptersAsync(
	rawText: string,
	options: ParseTxtOptions = {},
	fallbackTitle = 'Chương 1'
): Promise<RawChapterItem[]> {
	if (options.signal?.aborted) {
		throw new DOMException('Tác vụ đọc TXT đã bị hủy', 'AbortError');
	}

	// For small inputs (<50KB), execute synchronously to avoid worker spawn latency
	if (rawText.length < 50_000) {
		return parseTxtToChapters(rawText, options, fallbackTitle);
	}

	const worker = getTxtParserWorker();
	if (worker) {
		return new Promise((resolve, reject) => {
			const requestId = `parse-txt-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

			const cleanup = () => {
				worker.removeEventListener('message', handleMessage);
				if (options.signal) {
					options.signal.removeEventListener('abort', handleAbort);
				}
			};

			const handleAbort = () => {
				cleanup();
				try {
					worker.terminate();
				} catch {
					// ignore
				}
				txtWorkerInstance = null;
				reject(new DOMException('Tác vụ đọc TXT đã bị hủy', 'AbortError'));
			};

			const handleMessage = (
				e: MessageEvent<{
					id: string;
					type: string;
					chapters?: RawChapterItem[];
					warnings?: string[];
					error?: string;
				}>
			) => {
				if (e.data.id !== requestId) return;
				if (options.signal?.aborted) {
					cleanup();
					reject(new DOMException('Tác vụ đọc TXT đã bị hủy', 'AbortError'));
					return;
				}

				if (e.data.type === 'success' && e.data.chapters) {
					cleanup();
					if (options.warnings && e.data.warnings) {
						options.warnings.push(...e.data.warnings);
					}
					resolve(e.data.chapters);
				} else if (e.data.type === 'error') {
					cleanup();
					Logger.warn(
						'[txt-parser]',
						'Worker parsing error, falling back to direct:',
						e.data.error
					);
					resolve(parseTxtToChapters(rawText, options, fallbackTitle));
				}
			};

			const handleWorkerError = (err: ErrorEvent | MessageEvent) => {
				cleanup();
				Logger.warn('[txt-parser]', 'Worker event error, falling back to direct parse:', err);
				try {
					worker.terminate();
				} catch {
					// ignore
				}
				txtWorkerInstance = null;
				resolve(parseTxtToChapters(rawText, options, fallbackTitle));
			};

			if (options.signal) {
				if (options.signal.aborted) {
					reject(new DOMException('Tác vụ đọc TXT đã bị hủy', 'AbortError'));
					return;
				}
				options.signal.addEventListener('abort', handleAbort, { once: true });
			}

			worker.addEventListener('message', handleMessage);
			worker.addEventListener('error', handleWorkerError, { once: true });
			worker.addEventListener('messageerror', handleWorkerError, { once: true });

			// Sanitize options to avoid DataCloneError: DOMException / AbortSignal or Proxies cannot be cloned
			const rawDefs = options.customDefinitions
				? JSON.parse(JSON.stringify(options.customDefinitions))
				: [];
			const rawImages: Record<string, { fileName?: string }> = {};
			if (options.images) {
				for (const [k, v] of Object.entries(options.images)) {
					rawImages[k] = { fileName: v.fileName };
				}
			}

			const serializableOptions: ParseTxtOptions = {
				customDefinitions: rawDefs,
				images: rawImages,
				warnings: []
			};

			try {
				worker.postMessage({
					id: requestId,
					txtText: rawText,
					options: serializableOptions,
					fallbackTitle
				});
			} catch (postErr) {
				cleanup();
				Logger.warn(
					'[txt-parser]',
					'Failed to postMessage to worker, executing direct synchronous parse:',
					postErr
				);
				resolve(parseTxtToChapters(rawText, options, fallbackTitle));
			}
		});
	}

	return parseTxtToChapters(rawText, options, fallbackTitle);
}

export function parseTxtToChapters(
	rawText: string,
	options: ParseTxtOptions = {},
	fallbackTitle = 'Chương 1'
): RawChapterItem[] {
	const customDefinitions = options.customDefinitions || [];
	const imagesMap = options.images || {};
	Logger.debug('[epub-parser]', 'parseTxtToChapters starting parse with new conventions.');

	const lines = String(rawText || '')
		.replace(/\r\n/g, '\n')
		.split('\n');
	const footnoteIdx = lines.findIndex((l) => /^\s*chú thích:?\s*$/i.test(l));

	let mainLines = lines;
	let hasFootnotes = false;
	let notesHtml = '';

	if (footnoteIdx !== -1) {
		mainLines = lines.slice(0, footnoteIdx);
		hasFootnotes = true;

		notesHtml += `<h1 class="main-chap center">Chú thích:</h1>\n`;
		const footnoteContentLines = lines.slice(footnoteIdx + 1);
		for (const line of footnoteContentLines) {
			const trimmed = line.trim();
			if (!trimmed) continue;

			const fnMatch = trimmed.match(/^\{(\d+)\}\s*(.*)$/);
			if (fnMatch) {
				const n = fnMatch[1];
				const content = fnMatch[2].trim();
				const convertedContent = applyInlineFormatting(content, customDefinitions);
				notesHtml +=
					`<aside epub:type="footnote" id="fn${n}" class="note">\n` +
					`  <p><a class="notenum" href="__FNREF_SRC_${n}__.xhtml#fnref${n}">${n}.</a> ${convertedContent}</p>\n` +
					`</aside>\n`;
			} else {
				const converted = applyInlineFormatting(trimmed, customDefinitions);
				notesHtml += `<p>${converted}</p>\n`;
			}
		}
	}

	const rawLines = mainLines;
	const preprocessedLines: string[] = [];
	let lastWasEmpty = false;
	for (let i = 0; i < rawLines.length; i++) {
		const line = rawLines[i];
		const isEmpty = line.trim() === '';
		if (isEmpty) {
			if (!lastWasEmpty) {
				preprocessedLines.push('');
				lastWasEmpty = true;
			}
		} else {
			preprocessedLines.push(line);
			lastWasEmpty = false;
		}
	}

	const chapters: RawChapterItem[] = [];
	let currentChapter: RawChapterItem | null = null;

	const ensureChapterOpen = (): void => {
		if (!currentChapter) {
			currentChapter = {
				title: `${fallbackTitle}`,
				html: '',
				sources: ['Tệp TXT'],
				isChapter: true,
				firstSourcePageNum: chapters.length + 1,
				hasCustomTitle: false
			};
			chapters.push(currentChapter);
		}
	};

	let currentBlock: string | null = null;
	let isInsideNewBlock = false;
	let isInsideNewCenterBlock = false;
	let lineIdx = 0;
	while (lineIdx < preprocessedLines.length) {
		const origLine = preprocessedLines[lineIdx];
		const stripped = origLine.trim();

		if (currentBlock) {
			const closeBlockMatch = stripped.match(/^\[\/(letter|poem)\]$/);
			if (closeBlockMatch && closeBlockMatch[1] === currentBlock) {
				if (currentChapter) {
					currentChapter.html += `</div>\n`;
				}
				currentBlock = null;
				lineIdx++;
				continue;
			}

			if (stripped === '') {
				lineIdx++;
				continue;
			}

			const illustMatch = stripped.match(/^\[([\p{L}\p{N}_\-.]+)\]$/u);
			if (illustMatch) {
				const finalFileName = isIllustrationTag(illustMatch[1], imagesMap);
				if (finalFileName) {
					ensureChapterOpen();
					currentChapter.html += `  <figure class="illust-box">\n    <img class="illust-img" src="../images/${finalFileName}" alt="${escapeXml(illustMatch[1])}" />\n  </figure>\n`;
					lineIdx++;
					continue;
				}
			}

			const quoteMatch = stripped.match(/^~(t|p)?\s+(.+)$/);
			if (quoteMatch) {
				ensureChapterOpen();
				const alignChar = quoteMatch[1];
				const quoteRaw = quoteMatch[2].trim();
				const align = alignChar === 't' ? 'left' : alignChar === 'p' ? 'right' : 'center';
				const quoteFormatted = applyInlineFormatting(quoteRaw, customDefinitions);

				let nextLineIdx = lineIdx + 1;
				let nextStripped = '';
				while (nextLineIdx < preprocessedLines.length) {
					if (preprocessedLines[nextLineIdx].trim() !== '') {
						nextStripped = preprocessedLines[nextLineIdx].trim();
						break;
					}
					nextLineIdx++;
				}

				const authorMatch = nextStripped.match(/^>\s*(.+)$/);
				if (authorMatch) {
					const authorRaw = authorMatch[1].trim();
					const authorFormatted = applyInlineFormatting(authorRaw, customDefinitions);
					currentChapter.html += `  <blockquote class="${align}"><p>${quoteFormatted}</p><footer>${authorFormatted}</footer></blockquote>\n`;
					lineIdx = nextLineIdx + 1;
				} else {
					currentChapter.html += `  <blockquote class="${align}"><p>${quoteFormatted}</p></blockquote>\n`;
					lineIdx++;
				}
				continue;
			}

			const standaloneAuthorMatch = stripped.match(/^>\s*(.+)$/);
			if (standaloneAuthorMatch) {
				ensureChapterOpen();
				const authorFormatted = applyInlineFormatting(
					standaloneAuthorMatch[1].trim(),
					customDefinitions
				);
				currentChapter.html += `  <blockquote class="center"><footer>${authorFormatted}</footer></blockquote>\n`;
				lineIdx++;
				continue;
			}

			ensureChapterOpen();
			const formatted = applyInlineFormatting(origLine.trim(), customDefinitions);
			currentChapter.html += `  <p>${formatted}</p>\n`;
			lineIdx++;
			continue;
		}

		if (stripped === '') {
			lineIdx++;
			continue;
		}

		if (stripped === '[new]') {
			isInsideNewBlock = true;
			isInsideNewCenterBlock = false;
			currentChapter = {
				title: `${fallbackTitle}`,
				html: '',
				sources: ['Tệp TXT'],
				isChapter: true,
				firstSourcePageNum: chapters.length + 1,
				hasCustomTitle: false
			};
			chapters.push(currentChapter);
			lineIdx++;
			continue;
		}

		if (stripped === '[new:center]') {
			isInsideNewBlock = true;
			isInsideNewCenterBlock = true;
			currentChapter = {
				title: `${fallbackTitle}`,
				html: '<section class="center-page">\n  <div class="center-page-content">\n',
				sources: ['Tệp TXT'],
				isChapter: true,
				firstSourcePageNum: chapters.length + 1,
				hasCustomTitle: false,
				features: { hasCenterPage: true }
			};
			chapters.push(currentChapter);
			lineIdx++;
			continue;
		}

		if (stripped === '[/new]') {
			if (isInsideNewCenterBlock) {
				if (currentChapter) {
					currentChapter.html += '  </div>\n</section>\n';
				}
				isInsideNewCenterBlock = false;
			}
			isInsideNewBlock = false;
			currentChapter = null;
			lineIdx++;
			continue;
		}

		const openBlockMatch = stripped.match(/^\[(letter|poem)\]$/);
		if (openBlockMatch) {
			currentBlock = openBlockMatch[1];
			ensureChapterOpen();
			currentChapter.html += `<div class="${currentBlock}">\n`;
			lineIdx++;
			continue;
		}

		let isEscaped = false;
		let lineToProcess = origLine;
		if (
			stripped.startsWith('\\') &&
			stripped.length > 1 &&
			['@', '~', '>', '#', '*', '/', '_', '['].includes(stripped.charAt(1))
		) {
			isEscaped = true;
			const backslashIdx = origLine.indexOf('\\');
			lineToProcess = origLine.slice(0, backslashIdx) + origLine.slice(backslashIdx + 1);
		}

		if (isEscaped) {
			ensureChapterOpen();
			const formatted = applyInlineFormatting(lineToProcess.trim(), customDefinitions);
			currentChapter.html += `<p>${formatted}</p>\n`;
			lineIdx++;
			continue;
		}

		const headingMatch = stripped.match(/^(@{1,2})(!)?(t|p)?\s+(.+)$/);
		if (headingMatch) {
			const atCount = headingMatch[1].length;
			const isNoToc = headingMatch[2] === '!';
			const alignChar = headingMatch[3];
			const titleRaw = headingMatch[4].trim();

			const align = alignChar === 't' ? 'left' : alignChar === 'p' ? 'right' : 'center';
			const titleFormatted = applyInlineFormatting(titleRaw, customDefinitions);
			const titlePlain = stripHtmlTags(titleFormatted);

			if (atCount === 2) {
				if (isInsideNewBlock) {
					ensureChapterOpen();
					currentChapter.html += `<h1 class="main-chap ${align}">${titleFormatted}</h1>\n`;
					if (!currentChapter.hasCustomTitle) {
						currentChapter.title = titlePlain || `Chương ${chapters.length}`;
						currentChapter.hasCustomTitle = true;
					}
				} else {
					currentChapter = {
						title: titlePlain || `Chương ${chapters.length + 1}`,
						html: `<h1 class="main-chap ${align}">${titleFormatted}</h1>\n`,
						sources: ['Tệp TXT'],
						isChapter: true,
						firstSourcePageNum: chapters.length + 1,
						hasCustomTitle: true
					};
					chapters.push(currentChapter);
				}
			} else {
				ensureChapterOpen();
				const tocClass = isNoToc ? ' no-toc' : '';
				currentChapter.html += `<h2 class="side-chap ${align}${tocClass}">${titleFormatted}</h2>\n`;
				if (!currentChapter.hasCustomTitle && isInsideNewBlock) {
					currentChapter.title = titlePlain || `Chương ${chapters.length}`;
					currentChapter.hasCustomTitle = true;
				}
			}
			lineIdx++;
			continue;
		}

		const quoteMatch = stripped.match(/^~(t|p)?\s+(.+)$/);
		if (quoteMatch) {
			ensureChapterOpen();
			const alignChar = quoteMatch[1];
			const quoteRaw = quoteMatch[2].trim();
			const align = alignChar === 't' ? 'left' : alignChar === 'p' ? 'right' : 'center';
			const quoteFormatted = applyInlineFormatting(quoteRaw, customDefinitions);

			let nextLineIdx = lineIdx + 1;
			let nextStripped = '';
			while (nextLineIdx < preprocessedLines.length) {
				if (preprocessedLines[nextLineIdx].trim() !== '') {
					nextStripped = preprocessedLines[nextLineIdx].trim();
					break;
				}
				nextLineIdx++;
			}

			const authorMatch = nextStripped.match(/^>\s*(.+)$/);
			if (authorMatch) {
				const authorRaw = authorMatch[1].trim();
				const authorFormatted = applyInlineFormatting(authorRaw, customDefinitions);
				currentChapter.html += `<blockquote class="${align}"><p>${quoteFormatted}</p><footer>${authorFormatted}</footer></blockquote>\n`;
				lineIdx = nextLineIdx + 1;
			} else {
				currentChapter.html += `<blockquote class="${align}"><p>${quoteFormatted}</p></blockquote>\n`;
				lineIdx++;
			}
			continue;
		}

		if (stripped === '###') {
			ensureChapterOpen();
			currentChapter.html += `<p class="scene-break-big" role="separator">• • •</p>\n`;
			lineIdx++;
			continue;
		}

		if (stripped === '##') {
			ensureChapterOpen();
			currentChapter.html += `<p class="scene-break-small" role="separator">*</p>\n`;
			lineIdx++;
			continue;
		}

		if (stripped === '#') {
			ensureChapterOpen();
			currentChapter.html += `<p class="scene-break-small" role="separator"></p>\n`;
			lineIdx++;
			continue;
		}

		const illustMatch = stripped.match(/^\[([\p{L}\p{N}_\-.]+)\]$/u);
		if (illustMatch) {
			const finalFileName = isIllustrationTag(illustMatch[1], imagesMap);
			if (finalFileName) {
				ensureChapterOpen();
				currentChapter.html += `<figure class="illust-box">\n  <img class="illust-img" src="../images/${finalFileName}" alt="${escapeXml(illustMatch[1])}" />\n</figure>\n`;
				lineIdx++;
				continue;
			}
		}

		ensureChapterOpen();
		if (stripped.startsWith('!D ')) {
			const textWithoutPrefix = origLine.replace(/^(\s*)!D\s+/, '$1');
			const formatted = applyInlineFormatting(textWithoutPrefix.trim(), customDefinitions);
			currentChapter.html += `<p class="no-dropcap">${formatted}</p>\n`;
		} else {
			const dropcapMatch = stripped.match(/^\[([^\]\n])\]\s+(.+)$/);
			if (dropcapMatch) {
				const group1 = dropcapMatch[1];
				const group2 = dropcapMatch[2];
				const formattedGroup1 = escapeXml(group1);
				const formattedGroup2 = applyInlineFormatting(group2, customDefinitions);
				currentChapter.html += `<p class="has-dropcap"><span class="dropcap">${formattedGroup1}</span>${formattedGroup2}</p>\n`;
			} else {
				const formatted = applyInlineFormatting(origLine.trim(), customDefinitions);
				currentChapter.html += `<p>${formatted}</p>\n`;
			}
		}
		lineIdx++;
	}

	if (currentBlock) {
		Logger.warn('[epub-parser]', 'thiếu mã đóng block');
		if (currentChapter) {
			currentChapter.html += `</div>\n`;
		}
	}

	if (isInsideNewCenterBlock || isInsideNewBlock) {
		const tagName = isInsideNewCenterBlock ? '[new:center]' : '[new]';
		const warnMsg = `Cảnh báo: Thẻ ${tagName} chưa có mã đóng [/new] tương ứng.`;
		Logger.warn('[epub-parser]', warnMsg);
		if (options.warnings) {
			options.warnings.push(warnMsg);
		}
	}

	if (chapters.length === 0) {
		Logger.warn(
			'[epub-parser]',
			'parseTxtToChapters: No chapters created, creating fallback chapter.'
		);
		chapters.push({
			title: fallbackTitle,
			html: '',
			sources: ['Tệp TXT'],
			isChapter: true,
			firstSourcePageNum: 1
		});
	}

	if (hasFootnotes) {
		const notesChapter = {
			title: 'Chú thích',
			html: notesHtml,
			sources: ['Tệp TXT'],
			isChapter: true,
			fileName: 'notes',
			isNotes: true,
			firstSourcePageNum: chapters.length + 1
		};
		chapters.push(notesChapter);
	}

	Logger.debug('[epub-parser]', `parseTxtToChapters completed, total chapters: ${chapters.length}`);
	return chapters;
}
