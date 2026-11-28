// src/lib/epub-packer/parser/txt-parser.ts
import { Logger, escapeXml } from '$lib/utils';
import type {
	CustomDefinition,
	ParseTxtOptions,
	RawChapterItem,
	TxtIllustrationTag,
	TxtIllustrationValidationResult
} from '$lib/types';
import { findFootnoteSectionIndex, validateTxtSyntax } from './txt-syntax-validator';

export type { ParseTxtOptions, RawChapterItem };
export { validateTxtSyntax };

const STRICT_ILLUSTRATION_TAG_REGEX = /^\[(hinh-\d+)\]$/;

/**
 * Extracts all strict `[hinh-N]` illustration tags from the TXT body (excluding "Chú thích:" and escaped lines).
 */
export function extractTxtIllustrationTags(rawText: string): TxtIllustrationTag[] {
	const lines = String(rawText || '')
		.replace(/\r\n/g, '\n')
		.split('\n');
	const footnoteIdx = findFootnoteSectionIndex(lines);
	const contentLines = footnoteIdx !== -1 ? lines.slice(0, footnoteIdx) : lines;
	const tags: TxtIllustrationTag[] = [];

	for (let i = 0; i < contentLines.length; i++) {
		const stripped = contentLines[i].trim();
		if (!stripped) continue;
		if (
			stripped.startsWith('\\') &&
			stripped.length > 1 &&
			['@', '~', '>', '#', '*', '/', '_', '['].includes(stripped.charAt(1))
		) {
			continue;
		}
		const match = stripped.match(STRICT_ILLUSTRATION_TAG_REGEX);
		if (match) {
			tags.push({ tag: match[1], lineNum: i + 1 });
		}
	}

	return tags;
}

/**
 * Reconciles TXT `[hinh-N]` tags against uploaded illustration files (two-way strict match).
 */
export function reconcileTxtIllustrations(
	requiredTags: TxtIllustrationTag[],
	uploadedFiles: Array<{ name?: string; fileName: string }>
): TxtIllustrationValidationResult {
	const requiredSet = new Set(requiredTags.map((t) => t.tag));
	const requiredList = Array.from(requiredSet);
	const filesByBase = new Map<string, string[]>();

	for (const file of uploadedFiles) {
		const rawBase = (file.name || file.fileName.replace(/\.[^.]+$/, '')).trim().toLowerCase();
		const list = filesByBase.get(rawBase) ?? [];
		list.push(file.fileName);
		filesByBase.set(rawBase, list);
	}

	const missingTags = requiredList.filter((tag) => !filesByBase.has(tag));
	const duplicateBaseNames: string[] = [];
	const unmatchedFiles: string[] = [];

	for (const [base, fileNames] of filesByBase.entries()) {
		if (fileNames.length > 1) {
			duplicateBaseNames.push(`${base} (${fileNames.join(', ')})`);
		}
		if (!requiredSet.has(base)) {
			unmatchedFiles.push(...fileNames);
		}
	}

	const isValid =
		missingTags.length === 0 && unmatchedFiles.length === 0 && duplicateBaseNames.length === 0;

	const parts: string[] = [];
	if (missingTags.length > 0) {
		parts.push(
			`Thiếu ${missingTags.length} ảnh minh họa so với TXT (yêu cầu ${requiredList.length} ảnh, đã tải ${uploadedFiles.length} file): ${missingTags.map((t) => `[${t}]`).join(', ')}.`
		);
	}
	if (unmatchedFiles.length > 0) {
		parts.push(
			`File ảnh không khớp hoặc dư so với thẻ [hinh-...] trong TXT: ${unmatchedFiles.join(', ')}.`
		);
	}
	if (duplicateBaseNames.length > 0) {
		parts.push(`Phát hiện nhiều file ảnh trùng tên gốc: ${duplicateBaseNames.join('; ')}.`);
	}

	return {
		isValid,
		requiredTags: requiredList,
		missingTags,
		unmatchedFiles,
		duplicateBaseNames,
		errorMessage: isValid ? '' : `Không thể đóng gói EPUB: ${parts.join(' ')}`
	};
}

function escapeRegExp(str: string): string {
	return String(str || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function getClosingTag(openTag: string): string {
	const match = openTag.match(/<([a-zA-Z0-9]+)/);
	return match ? `</${match[1]}>` : '';
}

function stripFootnoteRefs(text: string): string {
	return text
		.replace(
			/<a\b[^>]*\b(?:class=["'][^"']*\bnoteref\b[^"']*|epub:type=["']noteref["'])[^>]*>[\s\S]*?<\/a>/gi,
			''
		)
		.replace(/<sup\b[^>]*\bclass=["'][^"']*\bnoteref\b[^"']*["'][^>]*>[\s\S]*?<\/sup>/gi, '')
		.replace(/\{(\d+)\}/g, '');
}

function stripHtmlTags(html: string): string {
	return stripFootnoteRefs(html)
		.replace(/<[^>]+>/g, '')
		.trim();
}

function findClosingDelimiter(str: string, openIdx: number, marker: '*' | '/' | '_'): number {
	for (let j = openIdx + 1; j < str.length; j++) {
		if (str[j] === marker) {
			if (j === openIdx + 1 || /\s/.test(str[j - 1])) {
				return -1;
			}
			const after = j + 1 < str.length ? str[j + 1] : '';
			if (after && /[\p{L}\p{N}]/u.test(after)) {
				return -1;
			}
			return j;
		}
	}
	return -1;
}

function isValidOpenerAt(str: string, idx: number, marker: '*' | '/' | '_'): boolean {
	const prev = idx > 0 ? str[idx - 1] : '';
	if (prev && /[\p{L}\p{N}]/u.test(prev)) return false;
	const next = idx + 1 < str.length ? str[idx + 1] : '';
	if (!next || /\s/.test(next) || next === marker) return false;
	return true;
}

function isNumericSlashContent(content: string): boolean {
	const trimmed = content.trim();
	if (/^\d+$/.test(trimmed)) return true;
	if (trimmed.length <= 2 && /^\d+$/.test(trimmed.replace(/[^0-9]/g, ''))) return true;
	return false;
}

/**
 * Formats *, /, _ inline delimiters via recursive paired-span matching
 * so crossed delimiters (e.g. `_a /b_ c/`) never produce overlapping XML tags.
 */
function formatInlineDelimiters(str: string): string {
	let out = '';
	let i = 0;
	while (i < str.length) {
		const ch = str[i];
		if ((ch === '*' || ch === '/' || ch === '_') && isValidOpenerAt(str, i, ch)) {
			const closeIdx = findClosingDelimiter(str, i, ch);
			if (closeIdx !== -1) {
				const inner = str.slice(i + 1, closeIdx);
				if (ch === '/' && isNumericSlashContent(inner)) {
					out += ch;
					i++;
					continue;
				}
				const tag = ch === '*' ? 'b' : ch === '/' ? 'i' : 'u';
				out += `<${tag}>${formatInlineDelimiters(inner)}</${tag}>`;
				i = closeIdx + 1;
				continue;
			}
		}
		out += ch;
		i++;
	}
	return out;
}

interface FootnoteEntrySpec {
	num: string;
	firstContent: string;
	extraLines: string[];
}

interface FootnoteRenderContext {
	hasFootnotes: boolean;
	entriesByNum: Map<string, FootnoteEntrySpec>;
	matchedNums: Set<string>;
}

function applyInlineFormatting(
	text: string,
	customDefinitions: CustomDefinition[] = [],
	footnoteContext?: FootnoteRenderContext
): string {
	let t = escapeXml(String(text || ''));

	// 1. Mask URLs (http://, https://) so slashes and underscores inside URLs are not misidentified
	const urls: string[] = [];
	t = t.replace(/https?:\/\/[^\s<>"')]+/gi, (urlMatch, offset, fullStr) => {
		let url = urlMatch;
		let trailing = '';
		const prefix = fullStr.slice(0, offset);

		// Remove preceding URLs so their slashes don't distort italic delimiter tracking
		const cleanPrefix = prefix.replace(/https?:\/\/[^\s<>"')]+/gi, '');
		const openMatches = (
			(cleanPrefix + (fullStr[offset] || 'x')).match(/(?<![\p{L}\p{N}])\/[^\s/]/gu) || []
		).length;
		const closeMatches = (cleanPrefix.match(/(?<=[^\s/])\/(?![\p{L}\p{N}])/gu) || []).length;
		const isItalicOpen = openMatches > closeMatches;

		while (url.length > 0) {
			const last = url[url.length - 1];
			if (last === '*' || last === '_' || /[.,;:!?]/.test(last)) {
				trailing = last + trailing;
				url = url.slice(0, -1);
			} else if (last === '/' && isItalicOpen) {
				trailing = last + trailing;
				url = url.slice(0, -1);
			} else {
				break;
			}
		}

		const uIdx = urls.length;
		urls.push(url);
		return `XURLPLACEHOLDER${uIdx}X${trailing}`;
	});

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

	// 2. Bold (*), Italic (/), Underline (_): single-pass non-overlapping span formatting
	t = formatInlineDelimiters(t);

	t = t.replace(/XCUSTOMXTAGX(\d+)X/g, (_m, idx) => {
		return customTags[Number(idx)];
	});

	// Restore masked URLs
	t = t.replace(/XURLPLACEHOLDER(\d+)X/g, (_m, idx) => {
		return urls[Number(idx)];
	});

	t = t.replace(/\{(\d+)\}/g, (_m, n) => {
		if (!footnoteContext?.hasFootnotes) {
			return `{${n}}`;
		}
		const targetEntry = footnoteContext.entriesByNum.get(n);
		if (!targetEntry) {
			return `{${n}}`;
		}
		footnoteContext.matchedNums.add(n);
		return `<a class="noteref" epub:type="noteref" role="doc-noteref" id="fnref${n}" href="notes.xhtml#fn${n}"><sup>${n}</sup></a>`;
	});

	return t;
}

function resolveIllustrationFileName(
	tagKey: string,
	imagesMap: Record<string, { fileName?: string }> = {},
	allowFallback = true
): { fileName: string | null; isMissingIllustration: boolean } {
	if (!/^hinh-\d+$/.test(tagKey)) {
		return { fileName: null, isMissingIllustration: false };
	}
	if (imagesMap[tagKey]?.fileName) {
		return { fileName: imagesMap[tagKey].fileName!, isMissingIllustration: false };
	}
	for (const [mapKey, entry] of Object.entries(imagesMap)) {
		const mapBase = mapKey.toLowerCase().replace(/\.[^.]+$/, '');
		const entryBase = (entry?.fileName || '').toLowerCase().replace(/\.[^.]+$/, '');
		if (mapBase === tagKey || entryBase === tagKey) {
			return {
				fileName: entry?.fileName || mapKey || `${tagKey}.jpg`,
				isMissingIllustration: false
			};
		}
	}
	if (!allowFallback) {
		return { fileName: null, isMissingIllustration: true };
	}
	return { fileName: `${tagKey}.jpg`, isMissingIllustration: false };
}

function tryRenderIllustrationLine(
	stripped: string,
	imagesMap: Record<string, { fileName?: string }>,
	hasExplicitImagesMap: boolean,
	lineNum: number,
	warnings: string[] | undefined,
	indent: string
): { handled: boolean; html: string } {
	const illustMatch = stripped.match(STRICT_ILLUSTRATION_TAG_REGEX);
	if (!illustMatch) return { handled: false, html: '' };
	const tagKey = illustMatch[1];
	const { fileName, isMissingIllustration } = resolveIllustrationFileName(
		tagKey,
		imagesMap,
		!hasExplicitImagesMap
	);
	if (isMissingIllustration) {
		const warnMsg = `Dòng ${lineNum}: Thẻ ảnh '[${tagKey}]' chưa có file ảnh minh họa khớp (sẽ kiểm tra trước khi đóng gói ở Bước 5).`;
		Logger.warn('[epub-parser]', warnMsg);
		warnings?.push(warnMsg);
		return { handled: true, html: '' };
	}
	if (!fileName) return { handled: false, html: '' };
	return {
		handled: true,
		html: `${indent}<figure class="illust-box">\n${indent}  <img class="illust-img" src="../images/${fileName}" alt="${escapeXml(tagKey)}" />\n${indent}</figure>\n`
	};
}

interface TxtParserPendingJob {
	resolve: (chapters: RawChapterItem[]) => void;
	reject: (error: unknown) => void;
	options: ParseTxtOptions;
	rawText: string;
	fallbackTitle: string;
	cleanupSignal?: () => void;
}

let txtWorkerInstance: Worker | null = null;
const pendingTxtJobs = new Map<string, TxtParserPendingJob>();

function cleanupTxtWorkerAndFallback(err: unknown): void {
	Logger.warn(
		'[txt-parser]',
		'Worker event error, falling back to direct parse for all pending jobs:',
		err
	);
	const jobs = Array.from(pendingTxtJobs.values());
	pendingTxtJobs.clear();
	if (txtWorkerInstance) {
		try {
			txtWorkerInstance.terminate();
		} catch {
			// ignore
		}
		txtWorkerInstance = null;
	}
	for (const job of jobs) {
		job.cleanupSignal?.();
		try {
			job.resolve(parseTxtToChapters(job.rawText, job.options, job.fallbackTitle));
		} catch (directErr) {
			job.reject(directErr);
		}
	}
}

function getTxtParserWorker(): Worker | null {
	if (typeof window === 'undefined' || typeof Worker === 'undefined') {
		return null;
	}
	if (!txtWorkerInstance) {
		try {
			const worker = new Worker(new URL('./txt-parser.worker.ts', import.meta.url), {
				type: 'module'
			});

			worker.onmessage = (
				e: MessageEvent<{
					id: string;
					type: string;
					chapters?: RawChapterItem[];
					warnings?: string[];
					error?: string;
				}>
			) => {
				const job = pendingTxtJobs.get(e.data.id);
				if (!job) return;
				pendingTxtJobs.delete(e.data.id);
				job.cleanupSignal?.();

				if (e.data.type === 'success' && e.data.chapters) {
					if (job.options.warnings && e.data.warnings) {
						job.options.warnings.push(...e.data.warnings);
					}
					job.resolve(e.data.chapters);
				} else if (e.data.type === 'error') {
					Logger.warn('[txt-parser]', 'Worker parsing error:', e.data.error);
					try {
						job.resolve(parseTxtToChapters(job.rawText, job.options, job.fallbackTitle));
					} catch (directErr) {
						job.reject(directErr);
					}
				}
			};

			worker.onerror = (err: ErrorEvent) => {
				cleanupTxtWorkerAndFallback(err);
			};

			worker.onmessageerror = (err: MessageEvent) => {
				cleanupTxtWorkerAndFallback(err);
			};

			txtWorkerInstance = worker;
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

			const handleAbort = () => {
				pendingTxtJobs.delete(requestId);
				if (options.signal) {
					options.signal.removeEventListener('abort', handleAbort);
				}
				// Only terminate the shared worker if there are NO OTHER active jobs running
				if (pendingTxtJobs.size === 0 && txtWorkerInstance) {
					try {
						txtWorkerInstance.terminate();
					} catch {
						// ignore
					}
					txtWorkerInstance = null;
				}
				reject(new DOMException('Tác vụ đọc TXT đã bị hủy', 'AbortError'));
			};

			const cleanupSignal = () => {
				if (options.signal) {
					options.signal.removeEventListener('abort', handleAbort);
				}
			};

			if (options.signal) {
				if (options.signal.aborted) {
					reject(new DOMException('Tác vụ đọc TXT đã bị hủy', 'AbortError'));
					return;
				}
				options.signal.addEventListener('abort', handleAbort, { once: true });
			}

			pendingTxtJobs.set(requestId, {
				resolve,
				reject,
				options,
				rawText,
				fallbackTitle,
				cleanupSignal
			});

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
				images: options.images !== undefined ? rawImages : undefined,
				warnings: [],
				validateSyntax: options.validateSyntax,
				mergeBrokenParagraphs: options.mergeBrokenParagraphs
			};

			try {
				worker.postMessage({
					id: requestId,
					txtText: rawText,
					options: serializableOptions,
					fallbackTitle
				});
			} catch (postErr) {
				pendingTxtJobs.delete(requestId);
				cleanupSignal();
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
	if (options.validateSyntax !== false) {
		const validation = validateTxtSyntax(rawText);
		if (!validation.isValid) {
			const errorMessages = validation.errors.map((e) => e.message).join('\n');
			throw new Error(errorMessages);
		}
		if (options.warnings && validation.warnings && validation.warnings.length > 0) {
			for (const w of validation.warnings) {
				options.warnings.push(w.message);
			}
		}
	}

	const customDefinitions = options.customDefinitions || [];

	const preserveParagraphs = !options.mergeBrokenParagraphs;
	const hasExplicitImagesMap = options.images !== undefined;
	const imagesMap = options.images || {};
	Logger.debug('[epub-parser]', 'parseTxtToChapters starting parse with new conventions.');

	const lines = String(rawText || '')
		.replace(/\r\n/g, '\n')
		.split('\n');
	const footnoteIdx = findFootnoteSectionIndex(lines);

	let mainLines = lines;
	let hasFootnotes = false;
	const footnoteEntries: FootnoteEntrySpec[] = [];
	const footnoteEntriesByNum = new Map<string, FootnoteEntrySpec>();

	if (footnoteIdx !== -1) {
		mainLines = lines.slice(0, footnoteIdx);
		hasFootnotes = true;

		const footnoteContentLines = lines.slice(footnoteIdx + 1);
		let currentEntry: FootnoteEntrySpec | null = null;

		for (const line of footnoteContentLines) {
			const trimmed = line.trim();
			if (!trimmed) continue;

			const fnMatch = trimmed.match(/^\{(\d+)\}\s*(.*)$/);
			if (fnMatch) {
				const num = fnMatch[1];
				currentEntry = {
					num,
					firstContent: fnMatch[2].trim(),
					extraLines: []
				};
				footnoteEntriesByNum.set(num, currentEntry);
				footnoteEntries.push(currentEntry);
			} else if (currentEntry) {
				currentEntry.extraLines.push(trimmed);
			}
		}
	}

	const footnoteContext: FootnoteRenderContext = {
		hasFootnotes,
		entriesByNum: footnoteEntriesByNum,
		matchedNums: new Set<string>()
	};

	const rawLines = mainLines;
	const preprocessedLines: Array<{ text: string; lineNum: number }> = [];
	let lastWasEmpty = false;
	for (let i = 0; i < rawLines.length; i++) {
		const line = rawLines[i];
		const isEmpty = line.trim() === '';
		if (isEmpty) {
			if (!lastWasEmpty) {
				preprocessedLines.push({ text: '', lineNum: i + 1 });
				lastWasEmpty = true;
			}
		} else {
			preprocessedLines.push({ text: line, lineNum: i + 1 });
			lastWasEmpty = false;
		}
	}

	const chapters: RawChapterItem[] = [];
	let currentChapter: RawChapterItem | null = null;

	const ensureChapterOpen = (): RawChapterItem => {
		if (!currentChapter) {
			currentChapter = {
				title: `${fallbackTitle}`,
				html: '',
				sources: ['File TXT'],
				isChapter: true,
				firstSourcePageNum: chapters.length + 1,
				hasCustomTitle: false,
				features: { preserveParagraphs }
			};
			chapters.push(currentChapter);
		}
		return currentChapter;
	};

	const blockStack: string[] = [];
	let isInsideLetterBox = false;
	let isInsideNewBlock = false;
	let isInsideNewCenterBlock = false;
	let lineIdx = 0;
	while (lineIdx < preprocessedLines.length) {
		const { text: origLine, lineNum } = preprocessedLines[lineIdx];
		const stripped = origLine.trim();

		// Handle letter-box closing tag
		if (/^\[\/letter-box\]$/i.test(stripped)) {
			while (blockStack.length > 0) {
				if (currentChapter) {
					currentChapter.html += `</div>\n`;
				}
				blockStack.pop();
			}
			if (isInsideLetterBox) {
				if (currentChapter) {
					currentChapter.html += `</div>\n`;
				}
				isInsideLetterBox = false;
			}
			lineIdx++;
			continue;
		}

		if (blockStack.length > 0) {
			const currentBlock = blockStack[blockStack.length - 1];
			const closeBlockMatch = stripped.match(/^\[\/(letter|poem)\]$/i);
			if (closeBlockMatch && closeBlockMatch[1].toLowerCase() === currentBlock.toLowerCase()) {
				if (currentChapter) {
					currentChapter.html += `</div>\n`;
				}
				blockStack.pop();
				lineIdx++;
				continue;
			}

			// Allow nesting [poem] inside [letter]
			if (currentBlock === 'letter' && /^\[poem\]$/i.test(stripped)) {
				blockStack.push('poem');
				const activeChapter = ensureChapterOpen();
				activeChapter.html += `<div class="poem">\n`;
				lineIdx++;
				continue;
			}

			if (stripped === '') {
				lineIdx++;
				continue;
			}

			// In letter or poem, allow @@! or @! heading styles with no-toc
			const blockHeadingMatch = stripped.match(/^(@{1,2})!(t|p)?\s+(.+)$/);
			if (blockHeadingMatch) {
				const atCount = blockHeadingMatch[1].length;
				const alignChar = blockHeadingMatch[2];
				const titleRaw = blockHeadingMatch[3].trim();
				const align = alignChar === 't' ? 'left' : alignChar === 'p' ? 'right' : 'center';
				const titleFormatted = applyInlineFormatting(titleRaw, customDefinitions, footnoteContext);
				const activeChapter = ensureChapterOpen();
				if (atCount === 2) {
					activeChapter.html += `  <h1 class="main-chap ${align} no-toc">${titleFormatted}</h1>\n`;
				} else {
					activeChapter.html += `  <h2 class="side-chap ${align} no-toc">${titleFormatted}</h2>\n`;
				}
				lineIdx++;
				continue;
			}

			const illustResult = tryRenderIllustrationLine(
				stripped,
				imagesMap,
				hasExplicitImagesMap,
				lineNum,
				options.warnings,
				'  '
			);
			if (illustResult.handled) {
				if (illustResult.html) {
					const activeChapter = ensureChapterOpen();
					activeChapter.html += illustResult.html;
				}
				lineIdx++;
				continue;
			}

			const quoteMatch = stripped.match(/^~(t|p)?\s+(.+)$/);
			if (quoteMatch) {
				const activeChapter = ensureChapterOpen();
				const alignChar = quoteMatch[1];
				const quoteRaw = quoteMatch[2].trim();
				const align = alignChar === 't' ? 'left' : alignChar === 'p' ? 'right' : 'center';
				const quoteFormatted = applyInlineFormatting(quoteRaw, customDefinitions, footnoteContext);

				const authorFooters: string[] = [];
				let nextLineIdx = lineIdx + 1;

				while (nextLineIdx < preprocessedLines.length) {
					const candidateRaw = preprocessedLines[nextLineIdx].text;
					if (candidateRaw.trim() === '') {
						// Khoảng trắng liền kề sau ~ hoặc giữa các > sẽ break liền mạch
						break;
					}
					const authorMatch = candidateRaw.trim().match(/^>(t|p|c)?\s+(.+)$/);
					if (authorMatch) {
						const alignChar = authorMatch[1];
						const authorRaw = authorMatch[2].trim();
						const alignClass =
							alignChar === 't'
								? ' class="left"'
								: alignChar === 'p'
									? ' class="right"'
									: alignChar === 'c'
										? ' class="center"'
										: '';
						const authorFormatted = applyInlineFormatting(
							authorRaw,
							customDefinitions,
							footnoteContext
						);
						authorFooters.push(`<footer${alignClass}>${authorFormatted}</footer>`);
						nextLineIdx++;
					} else {
						break;
					}
				}

				if (authorFooters.length > 0) {
					activeChapter.html += `  <blockquote class="${align}"><p>${quoteFormatted}</p>${authorFooters.join('')}</blockquote>\n`;
					lineIdx = nextLineIdx;
				} else {
					activeChapter.html += `  <blockquote class="${align}"><p>${quoteFormatted}</p></blockquote>\n`;
					lineIdx++;
				}
				continue;
			}

			const standaloneAuthorMatch = stripped.match(/^>(t|p|c)?\s+(.+)$/);
			if (standaloneAuthorMatch) {
				const activeChapter = ensureChapterOpen();
				const alignChar = standaloneAuthorMatch[1];
				const authorRaw = standaloneAuthorMatch[2].trim();
				const alignClass =
					alignChar === 't'
						? ' class="left"'
						: alignChar === 'p'
							? ' class="right"'
							: alignChar === 'c'
								? ' class="center"'
								: '';
				const authorFormatted = applyInlineFormatting(
					authorRaw,
					customDefinitions,
					footnoteContext
				);
				activeChapter.html += `  <blockquote class="center"><footer${alignClass}>${authorFormatted}</footer></blockquote>\n`;
				lineIdx++;
				continue;
			}

			const activeChapter = ensureChapterOpen();
			if (stripped.startsWith('!D ')) {
				const textWithoutPrefix = origLine.replace(/^(\s*)!D\s+/, '$1');
				const formatted = applyInlineFormatting(
					textWithoutPrefix.trim(),
					customDefinitions,
					footnoteContext
				);
				activeChapter.html += `  <p class="no-dropcap">${formatted}</p>\n`;
			} else {
				const dropcapMatch = stripped.match(/^\[([^\]\n])\]\s+(.+)$/);
				if (dropcapMatch) {
					const group1 = dropcapMatch[1];
					const group2 = dropcapMatch[2];
					const formattedGroup1 = escapeXml(group1);
					const formattedGroup2 = applyInlineFormatting(group2, customDefinitions, footnoteContext);
					activeChapter.html += `  <p class="has-dropcap"><span class="dropcap">${formattedGroup1}</span>${formattedGroup2}</p>\n`;
				} else {
					const formatted = applyInlineFormatting(
						origLine.trim(),
						customDefinitions,
						footnoteContext
					);
					activeChapter.html += `  <p>${formatted}</p>\n`;
				}
			}
			lineIdx++;
			continue;
		}

		if (stripped === '') {
			lineIdx++;
			continue;
		}

		if (/^\[new\]$/i.test(stripped)) {
			isInsideNewBlock = true;
			isInsideNewCenterBlock = false;
			currentChapter = {
				title: 'Giới Thiệu',
				html: '',
				sources: ['File TXT'],
				isChapter: true,
				firstSourcePageNum: chapters.length + 1,
				hasCustomTitle: false,
				features: { preserveParagraphs: true }
			};
			chapters.push(currentChapter);
			lineIdx++;
			continue;
		}

		if (/^\[new:center\]$/i.test(stripped)) {
			isInsideNewBlock = true;
			isInsideNewCenterBlock = true;
			currentChapter = {
				title: '',
				html: '<section class="center-page">\n  <div class="center-page-content">\n',
				sources: ['File TXT'],
				isChapter: true,
				firstSourcePageNum: chapters.length + 1,
				hasCustomTitle: false,
				features: { hasCenterPage: true, preserveParagraphs: true }
			};
			chapters.push(currentChapter);
			lineIdx++;
			continue;
		}

		if (/^\[\/(new|new:center)\]$/i.test(stripped)) {
			if (currentChapter && !currentChapter.hasCustomTitle && !isInsideNewCenterBlock) {
				const pageNum = currentChapter.firstSourcePageNum || chapters.length;
				const warnMsg = `Trang ${pageNum}: Khối [new] không chứa tiêu đề (@@ hoặc @). Trang nhận tiêu đề mặc định là '${currentChapter.title}'.`;
				Logger.warn('[epub-parser]', warnMsg);
				if (options.warnings) {
					options.warnings.push(warnMsg);
				}
			}
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

		if (/^\[letter-box\]$/i.test(stripped)) {
			isInsideLetterBox = true;
			const activeChapter = ensureChapterOpen();
			activeChapter.html += `<div class="letter-box">\n`;
			lineIdx++;
			continue;
		}

		const openBlockMatch = stripped.match(/^\[(letter|poem)\]$/i);
		if (openBlockMatch) {
			const blockName = openBlockMatch[1].toLowerCase();
			blockStack.push(blockName);
			const activeChapter = ensureChapterOpen();
			activeChapter.html += `<div class="${blockName}">\n`;
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
			const activeChapter = ensureChapterOpen();
			const formatted = applyInlineFormatting(
				lineToProcess.trim(),
				customDefinitions,
				footnoteContext
			);
			activeChapter.html += `<p>${formatted}</p>\n`;
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
			const titleFormatted = applyInlineFormatting(titleRaw, customDefinitions, footnoteContext);
			const titlePlain = stripHtmlTags(titleFormatted);

			const tocClass = isNoToc ? ' no-toc' : '';

			if (atCount === 2) {
				if (isNoToc) {
					// @@! applies h1 main-chap style but does NOT cut a new chapter page and is excluded from TOC
					const activeChapter = ensureChapterOpen();
					activeChapter.html += `<h1 class="main-chap ${align}${tocClass}">${titleFormatted}</h1>\n`;
				} else if (isInsideNewBlock) {
					const activeChapter = ensureChapterOpen();
					activeChapter.html += `<h1 class="main-chap ${align}">${titleFormatted}</h1>\n`;
					if (!activeChapter.hasCustomTitle) {
						activeChapter.title = titlePlain || `Chương ${chapters.length}`;
						activeChapter.hasCustomTitle = true;
					}
				} else {
					currentChapter = {
						title: titlePlain || `Chương ${chapters.length + 1}`,
						html: `<h1 class="main-chap ${align}">${titleFormatted}</h1>\n`,
						sources: ['File TXT'],
						isChapter: true,
						firstSourcePageNum: chapters.length + 1,
						hasCustomTitle: true,
						features: { preserveParagraphs }
					};
					chapters.push(currentChapter);
				}
			} else {
				const activeChapter = ensureChapterOpen();
				activeChapter.html += `<h2 class="side-chap ${align}${tocClass}">${titleFormatted}</h2>\n`;
				if (!isNoToc && !activeChapter.hasCustomTitle && isInsideNewBlock) {
					activeChapter.title = titlePlain || `Chương ${chapters.length}`;
					activeChapter.hasCustomTitle = true;
				}
			}
			lineIdx++;
			continue;
		}

		const quoteMatch = stripped.match(/^~(t|p)?\s+(.+)$/);
		if (quoteMatch) {
			const activeChapter = ensureChapterOpen();
			const alignChar = quoteMatch[1];
			const quoteRaw = quoteMatch[2].trim();
			const align = alignChar === 't' ? 'left' : alignChar === 'p' ? 'right' : 'center';
			const quoteFormatted = applyInlineFormatting(quoteRaw, customDefinitions, footnoteContext);

			const authorFooters: string[] = [];
			let nextLineIdx = lineIdx + 1;

			while (nextLineIdx < preprocessedLines.length) {
				const candidateRaw = preprocessedLines[nextLineIdx].text;
				if (candidateRaw.trim() === '') {
					// Khoảng trắng liền kề sau ~ hoặc giữa các > sẽ break liền mạch
					break;
				}
				const authorMatch = candidateRaw.trim().match(/^>(t|p|c)?\s+(.+)$/);
				if (authorMatch) {
					const alignChar = authorMatch[1];
					const authorRaw = authorMatch[2].trim();
					const alignClass =
						alignChar === 't'
							? ' class="left"'
							: alignChar === 'p'
								? ' class="right"'
								: alignChar === 'c'
									? ' class="center"'
									: '';
					const authorFormatted = applyInlineFormatting(
						authorRaw,
						customDefinitions,
						footnoteContext
					);
					authorFooters.push(`<footer${alignClass}>${authorFormatted}</footer>`);
					nextLineIdx++;
				} else {
					break;
				}
			}

			if (authorFooters.length > 0) {
				activeChapter.html += `<blockquote class="${align}"><p>${quoteFormatted}</p>${authorFooters.join('')}</blockquote>\n`;
				lineIdx = nextLineIdx;
			} else {
				activeChapter.html += `<blockquote class="${align}"><p>${quoteFormatted}</p></blockquote>\n`;
				lineIdx++;
			}
			continue;
		}

		if (stripped === '###') {
			const activeChapter = ensureChapterOpen();
			activeChapter.html += `<p class="scene-break-big" role="separator">• • •</p>\n`;
			lineIdx++;
			continue;
		}

		if (stripped === '##') {
			const activeChapter = ensureChapterOpen();
			activeChapter.html += `<p class="scene-break-small" role="separator">*</p>\n`;
			lineIdx++;
			continue;
		}

		if (stripped === '#') {
			const activeChapter = ensureChapterOpen();
			activeChapter.html += `<p class="scene-break-small" role="separator"></p>\n`;
			lineIdx++;
			continue;
		}

		const illustResult = tryRenderIllustrationLine(
			stripped,
			imagesMap,
			hasExplicitImagesMap,
			lineNum,
			options.warnings,
			''
		);
		if (illustResult.handled) {
			if (illustResult.html) {
				const activeChapter = ensureChapterOpen();
				activeChapter.html += illustResult.html;
			}
			lineIdx++;
			continue;
		}

		const activeChapter = ensureChapterOpen();
		if (stripped.startsWith('!D ')) {
			const textWithoutPrefix = origLine.replace(/^(\s*)!D\s+/, '$1');
			const formatted = applyInlineFormatting(
				textWithoutPrefix.trim(),
				customDefinitions,
				footnoteContext
			);
			activeChapter.html += `<p class="no-dropcap">${formatted}</p>\n`;
		} else {
			const dropcapMatch = stripped.match(/^\[([^\]\n])\]\s+(.+)$/);
			if (dropcapMatch) {
				const group1 = dropcapMatch[1];
				const group2 = dropcapMatch[2];
				const formattedGroup1 = escapeXml(group1);
				const formattedGroup2 = applyInlineFormatting(group2, customDefinitions, footnoteContext);
				activeChapter.html += `<p class="has-dropcap"><span class="dropcap">${formattedGroup1}</span>${formattedGroup2}</p>\n`;
			} else {
				const formatted = applyInlineFormatting(
					origLine.trim(),
					customDefinitions,
					footnoteContext
				);
				activeChapter.html += `<p>${formatted}</p>\n`;
			}
		}
		lineIdx++;
	}

	while (blockStack.length > 0) {
		Logger.warn('[epub-parser]', 'thiếu mã đóng block');
		if (currentChapter) {
			currentChapter.html += `</div>\n`;
		}
		blockStack.pop();
	}

	if (isInsideLetterBox) {
		Logger.warn('[epub-parser]', 'thiếu mã đóng letter-box');
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
			sources: ['File TXT'],
			isChapter: true,
			firstSourcePageNum: 1,
			features: { preserveParagraphs }
		});
	}

	if (hasFootnotes) {
		let notesHtml = `<h1 class="main-chap center">Chú thích:</h1>\n`;
		for (const entry of footnoteEntries) {
			const convertedContent = applyInlineFormatting(entry.firstContent, customDefinitions);
			const isMatched = footnoteContext.matchedNums.has(entry.num);
			const numberHtml = isMatched
				? `<a class="notenum" role="doc-backlink" href="__FNREF_SRC_${entry.num}__.xhtml#fnref${entry.num}">${entry.num}.</a>`
				: `<span class="notenum">${entry.num}.</span>`;
			notesHtml +=
				`<aside epub:type="footnote" role="doc-footnote" id="fn${entry.num}" class="note">\n` +
				`  <p>${numberHtml} ${convertedContent}</p>\n`;
			for (const extra of entry.extraLines) {
				notesHtml += `  <p>${applyInlineFormatting(extra, customDefinitions)}</p>\n`;
			}
			notesHtml += `</aside>\n`;
		}

		const notesChapter = {
			title: 'Chú thích',
			html: notesHtml,
			sources: ['File TXT'],
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
