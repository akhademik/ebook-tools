// src/lib/epub-packer/xml-builders/chapter-builder.ts
import { escapeXml, Logger } from '$lib/utils';
import type { EpubMetadata, EpubChapterItem, OrnamentsConfig } from '$lib/types';

export function mergeBrokenParagraphs(html: string): string {
	Logger.debug('[EpubPacker]', `mergeBrokenParagraphs called, html length: ${html.length}`);
	if (!html) return html;

	// Protect special block containers: poem, letter, letter-box, center-page, blockquote, aside (footnotes)
	const PROTECTED_BLOCKS_REGEX =
		/<(div|section)\b[^>]*\bclass=["'][^"']*\b(?:poem|letter|letter-box|center-page)\b[^"']*["'][^>]*>[\s\S]*?<\/\1>|<(blockquote|aside)\b[^>]*>[\s\S]*?<\/\2>/gi;

	const protectedBlocks: string[] = [];
	const processedHtml = html.replace(PROTECTED_BLOCKS_REGEX, (match) => {
		const idx = protectedBlocks.length;
		protectedBlocks.push(match);
		return `___PROTECTED_BLOCK_${idx}___`;
	});

	// Sentence ending indicators: . ? ! … : ; ) ] } ” " ' » ›
	const SENTENCE_END_REGEX = /[.!?:;…()\]}"'”’»›]$/u;
	// Unicode lowercase letter
	const LOWERCASE_START_REGEX = /^\p{Ll}/u;

	// Tokenize HTML by matching <p ...>...</p> blocks and intervening non-<p> text
	const P_REGEX = /<p(\s+[^>]*)?>([\s\S]*?)<\/p>/gi;
	type Token =
		{ type: 'p'; attrs: string; content: string; raw: string } | { type: 'other'; raw: string };

	const tokens: Token[] = [];
	let lastIdx = 0;
	let match: RegExpExecArray | null;

	while ((match = P_REGEX.exec(processedHtml)) !== null) {
		if (match.index > lastIdx) {
			tokens.push({ type: 'other', raw: processedHtml.slice(lastIdx, match.index) });
		}
		tokens.push({
			type: 'p',
			attrs: match[1] || '',
			content: match[2],
			raw: match[0]
		});
		lastIdx = match.index + match[0].length;
	}
	if (lastIdx < processedHtml.length) {
		tokens.push({ type: 'other', raw: processedHtml.slice(lastIdx) });
	}

	// Iterate tokens and merge adjacent <p> elements if only whitespace separates them
	let i = 0;
	while (i < tokens.length) {
		const curr = tokens[i];
		if (curr.type !== 'p') {
			i++;
			continue;
		}

		// Look for next token
		let j = i + 1;
		let onlyWhitespaceBetween = true;
		while (j < tokens.length && tokens[j].type === 'other') {
			if (tokens[j].raw.trim() !== '') {
				onlyWhitespaceBetween = false;
				break;
			}
			j++;
		}

		if (onlyWhitespaceBetween && j < tokens.length && tokens[j].type === 'p') {
			const nextP = tokens[j] as { type: 'p'; attrs: string; content: string; raw: string };
			// Check if both are plain paragraphs (no special class/attrs like scene-break)
			if (!curr.attrs.trim() && !nextP.attrs.trim()) {
				const plain1 = curr.content.replace(/<[^>]+>/g, '').trim();
				const plain2 = nextP.content.replace(/<[^>]+>/g, '').trim();

				if (plain1 && plain2) {
					const endsSentence = SENTENCE_END_REGEX.test(plain1);
					const startsLower = LOWERCASE_START_REGEX.test(plain2);

					if (!endsSentence && startsLower) {
						// Merge nextP into curr
						curr.content = curr.content.trim() + ' ' + nextP.content.trim();
						curr.raw = '<p>' + curr.content + '</p>';
						// Remove intervening whitespace tokens and nextP
						tokens.splice(i + 1, j - i);
						// Do not increment i, re-check curr with its new next neighbour
						continue;
					}
				}
			}
		}
		i++;
	}

	let result = tokens
		.map((t) => (t.type === 'p' ? `<p${t.attrs}>${t.content}</p>` : t.raw))
		.join('');

	// Restore protected blocks
	for (let idx = 0; idx < protectedBlocks.length; idx++) {
		result = result.replace(`___PROTECTED_BLOCK_${idx}___`, () => protectedBlocks[idx]);
	}

	Logger.debug('[EpubPacker]', `mergeBrokenParagraphs finished, result length: ${result.length}`);
	return result;
}

/**
 * Classifies <h2> headings into main H2 vs H2 Sub according to typographical hierarchy:
 * - An <h2> is MAIN if:
 *   1. It immediately follows an <h1> (ignoring whitespace, comments, and ornaments like <div class="chapter-ornament"> / <div class="subchapter-ornament">)
 *   2. OR it is the first <h2> in a sequence of consecutive <h2> headings (e.g. h2 + h2, even with intervening subchapter ornament)
 * - Otherwise, it is H2 SUB:
 *   1. Subsequent <h2> in a consecutive sequence (2nd, 3rd... in h2 + h2)
 *   2. Standalone <h2> (surrounded by <p>, other tags, or at chapter start without following h2)
 *
 * H2 Sub headings receive the CSS class "h2-sub".
 */
export function classifyChapterHeadings(html: string): string {
	if (!html || !html.includes('<h2')) return html;

	const HEADING_REGEX = /<h([12])(\s+[^>]*)?>([\s\S]*?)<\/h\1>/gi;
	interface HeadingItem {
		level: number;
		fullMatch: string;
		attrs: string;
		content: string;
		startIndex: number;
		endIndex: number;
	}

	const headings: HeadingItem[] = [];
	let match: RegExpExecArray | null;
	while ((match = HEADING_REGEX.exec(html)) !== null) {
		headings.push({
			level: parseInt(match[1], 10),
			fullMatch: match[0],
			attrs: match[2] || '',
			content: match[3],
			startIndex: match.index,
			endIndex: match.index + match[0].length
		});
	}

	if (headings.length === 0) return html;

	const ORNAMENT_CONTAINER_REGEX =
		/<(?:div|p)\b[^>]*\bclass=["'][^"']*\b(?:chapter-ornament|subchapter-ornament|ornament)\b[^"']*["'][^>]*>[\s\S]*?<\/(?:div|p)>/gi;
	const ORNAMENT_IMG_REGEX =
		/<img\b[^>]*\bclass=["'][^"']*\b(?:chapter-ornament|subchapter-ornament|ornament)\b[^"']*\/?>/gi;

	const isAdjacent = (fromEnd: number, toStart: number): boolean => {
		const between = html
			.slice(fromEnd, toStart)
			.replace(/<!--[\s\S]*?-->/g, '')
			.replace(ORNAMENT_CONTAINER_REGEX, '')
			.replace(ORNAMENT_IMG_REGEX, '')
			.trim();
		return between === '';
	};

	const replacements = new Map<number, string>();

	for (let i = 0; i < headings.length; i++) {
		const curr = headings[i];
		if (curr.level !== 2) continue;

		const prev = i > 0 ? headings[i - 1] : null;
		const next = i < headings.length - 1 ? headings[i + 1] : null;

		const isPrecededByH1 = !!(
			prev &&
			prev.level === 1 &&
			isAdjacent(prev.endIndex, curr.startIndex)
		);
		const isPrecededByH2 = !!(
			prev &&
			prev.level === 2 &&
			isAdjacent(prev.endIndex, curr.startIndex)
		);
		const isFollowedByH2 = !!(
			next &&
			next.level === 2 &&
			isAdjacent(curr.endIndex, next.startIndex)
		);

		const isMain = isPrecededByH1 || (!isPrecededByH2 && isFollowedByH2);

		if (!isMain) {
			let newAttrs = curr.attrs;
			if (/class=["'][^"']*["']/i.test(newAttrs)) {
				newAttrs = newAttrs.replace(/class=["']([^"']*)["']/i, (_m, classNames) => {
					const trimmed = classNames.trim();
					if (trimmed.split(/\s+/).includes('h2-sub')) return _m;
					return `class="${trimmed} h2-sub"`;
				});
			} else {
				newAttrs = `${newAttrs} class="h2-sub"`.trimStart();
				if (!newAttrs.startsWith(' ')) newAttrs = ' ' + newAttrs;
			}
			const replacement = `<h2${newAttrs}>${curr.content}</h2>`;
			replacements.set(curr.startIndex, replacement);
		}
	}

	if (replacements.size === 0) return html;

	let resultHtml = '';
	let lastIndex = 0;
	for (const heading of headings) {
		const rep = replacements.get(heading.startIndex);
		if (rep !== undefined) {
			resultHtml += html.slice(lastIndex, heading.startIndex) + rep;
			lastIndex = heading.endIndex;
		}
	}
	resultHtml += html.slice(lastIndex);
	return resultHtml;
}

export function buildChapterXhtml(
	meta: EpubMetadata,
	chapter: EpubChapterItem,
	preserveParagraphs = false,
	customCss = '',
	ornaments: OrnamentsConfig | null = null
): string {
	Logger.debug(
		'[EpubPacker]',
		`buildChapterXhtml called for: ${chapter.title}, preserveParagraphs: ${preserveParagraphs}`
	);
	const shouldPreserve = preserveParagraphs || !!chapter.features?.preserveParagraphs;
	let content = shouldPreserve ? chapter.html || '' : mergeBrokenParagraphs(chapter.html || '');
	content = content.replace(
		/<p>\s*###\s*<\/p>/g,
		'<p class="scene-break-big" role="separator">• • •</p>'
	);
	content = content.replace(
		/<p>\s*##\s*<\/p>/g,
		'<p class="scene-break-small" role="separator">*</p>'
	);
	content = content.replace(
		/<p>\s*#\s*<\/p>/g,
		'<p class="scene-break-small" role="separator"></p>'
	);

	const isSpecialPage = chapter.fileName === 'jacket' || chapter.fileName === 'cover';
	if (!isSpecialPage) {
		content = classifyChapterHeadings(content);
		if (ornaments?.chapterOrnament?.fileName) {
			const imgPath = `../images/${ornaments.chapterOrnament.fileName}`;
			content = content.replace(/(<h1\b[^>]*>[\s\S]*?<\/h1>)/gi, (match) => {
				const classMatch = match.match(/class=["']([^"']*)["']/i);
				const classes = classMatch ? classMatch[1].split(/\s+/) : [];
				if (classes.includes('break-main-chap') || classes.includes('no-toc')) {
					return match;
				}
				return (
					`<div class="chapter-ornament">\n    <img src="${imgPath}" alt=""/>\n  </div>\n  ` + match
				);
			});
		}

		if (ornaments?.subchapterOrnament?.fileName) {
			const imgPath = `../images/${ornaments.subchapterOrnament.fileName}`;
			content = content.replace(/(<h2\b[^>]*>[\s\S]*?<\/h2>)/gi, (match) => {
				const classMatch = match.match(/class=["']([^"']*)["']/i);
				const classes = classMatch ? classMatch[1].split(/\s+/) : [];
				if (classes.includes('no-toc')) {
					return match;
				}
				return (
					`<div class="subchapter-ornament">\n    <img src="${imgPath}" alt=""/>\n  </div>\n  ` +
					match
				);
			});
		}

		// Automatically add dropcap to the first paragraph immediately following h1 or h2
		// (unless chapter is center-page, or paragraph has no-dropcap or already has dropcap/has-dropcap)
		const isCenterPage = !!chapter.features?.hasCenterPage;
		if (!isCenterPage) {
			const protectedBlocks: string[] = [];
			content = content.replace(
				/<div\s+class=["'](?:letter|poem)["']>[\s\S]*?<\/div>/gi,
				(match) => {
					protectedBlocks.push(match);
					return `<!--PROTECTED_BLOCK_DROPCAP_${protectedBlocks.length - 1}-->`;
				}
			);

			content = content.replace(
				/(<h[12][^>]*>[\s\S]*?<\/h[12]>\s*)(<p[^>]*>\s*)((?:<[a-z0-9]+[^>]*>)*)((?:[“‘"’'«‹—-]|&ldquo;|&lsquo;|&quot;|&apos;)*[^<\s])/gi,
				(match, p1, p2, p3, p4) => {
					if (
						/\bno-dropcap\b/i.test(p2) ||
						/\bhas-dropcap\b/i.test(p2) ||
						/class=["'][^"']*\bdropcap\b/i.test(p3)
					) {
						return match;
					}
					let updatedP2: string;
					if (p2.includes('class=')) {
						updatedP2 = p2.replace(
							/class=["']([^"']*)["']/i,
							(_cMatch: string, classNames: string) => {
								return `class="${classNames} has-dropcap"`;
							}
						);
					} else {
						updatedP2 = p2.replace(/<p/i, '<p class="has-dropcap"');
					}
					return p1 + updatedP2 + p3 + '<span class="dropcap">' + p4 + '</span>';
				}
			);

			content = content.replace(/<!--PROTECTED_BLOCK_DROPCAP_(\d+)-->/g, (_m, idx) => {
				return protectedBlocks[Number(idx)];
			});
		}

		// Ensure that any paragraph containing a dropcap has the "has-dropcap" class
		content = content.replace(
			/<p([^>]*)>([^<]*(?:<(?!p\b)[^>]*>)*?<span\s+class=["']dropcap["'])/gi,
			(match, pAttrs, contentBeforeDropcap) => {
				if (pAttrs.includes('has-dropcap')) {
					return match;
				}
				let updatedPAttrs: string;
				if (pAttrs.includes('class=')) {
					updatedPAttrs = pAttrs.replace(
						/class=["']([^"']*)["']/i,
						(_cMatch: string, classNames: string) => {
							return `class="${classNames} has-dropcap"`;
						}
					);
				} else {
					updatedPAttrs = pAttrs + ' class="has-dropcap"';
				}
				return `<p${updatedPAttrs}>${contentBeforeDropcap}`;
			}
		);
	}

	// Clean up internal marker classes (e.g. no-toc from headings, no-dropcap from p) from final XHTML
	content = content.replace(/(<h[12]\b[^>]*>)/gi, (match) => {
		return match
			.replace(/class=["']([^"']*)["']/gi, (_cMatch: string, classNames: string) => {
				const cleaned = classNames
					.replace(/\bno-toc\b/g, '')
					.trim()
					.replace(/\s+/g, ' ');
				return cleaned ? `class="${cleaned}"` : '';
			})
			.replace(/\s{2,}/g, ' ')
			.replace(/\s+>/g, '>');
	});

	content = content.replace(/(<p\b[^>]*>)/gi, (match) => {
		return match
			.replace(/class=["']([^"']*)["']/gi, (_cMatch: string, classNames: string) => {
				const cleaned = classNames
					.replace(/\bno-dropcap\b/g, '')
					.trim()
					.replace(/\s+/g, ' ');
				return cleaned ? `class="${cleaned}"` : '';
			})
			.replace(/\s{2,}/g, ' ')
			.replace(/\s+>/g, '>');
	});

	const styleBlock = customCss ? `  <style>\n${customCss}\n  </style>\n` : '';
	const linkStyle =
		chapter.fileName === 'jacket' || chapter.fileName === 'cover'
			? ''
			: '  <link rel="stylesheet" type="text/css" href="../styles/style.css"/>\n';
	return (
		'<?xml version="1.0" encoding="UTF-8"?>\n<!DOCTYPE html>\n' +
		'<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="' +
		meta.language +
		'">\n' +
		'<head>\n  <meta charset="utf-8"/>\n  <title>' +
		escapeXml(chapter.title) +
		'</title>\n' +
		linkStyle +
		styleBlock +
		'</head>\n' +
		'<body>\n' +
		content +
		'\n</body>\n</html>'
	);
}
