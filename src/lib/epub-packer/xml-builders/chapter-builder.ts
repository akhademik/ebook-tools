// src/lib/epub-packer/xml-builders/chapter-builder.ts
import { escapeXml, Logger } from '$lib/utils';
import type { EpubMetadata, EpubChapterItem, OrnamentsConfig } from '$lib/types';

export function mergeBrokenParagraphs(html: string): string {
	Logger.debug('[EpubPacker]', `mergeBrokenParagraphs called, html length: ${html.length}`);
	if (!html) return html;

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

	while ((match = P_REGEX.exec(html)) !== null) {
		if (match.index > lastIdx) {
			tokens.push({ type: 'other', raw: html.slice(lastIdx, match.index) });
		}
		tokens.push({
			type: 'p',
			attrs: match[1] || '',
			content: match[2],
			raw: match[0]
		});
		lastIdx = match.index + match[0].length;
	}
	if (lastIdx < html.length) {
		tokens.push({ type: 'other', raw: html.slice(lastIdx) });
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

	const result = tokens
		.map((t) => (t.type === 'p' ? `<p${t.attrs}>${t.content}</p>` : t.raw))
		.join('');
	Logger.debug('[EpubPacker]', `mergeBrokenParagraphs finished, result length: ${result.length}`);
	return result;
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
	let content = preserveParagraphs ? chapter.html || '' : mergeBrokenParagraphs(chapter.html || '');
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
		if (ornaments?.chapterOrnament?.fileName) {
			const imgPath = `../images/${ornaments.chapterOrnament.fileName}`;
			content = content.replace(/(<h1\b[^>]*>[\s\S]*?<\/h1>)/gi, (match) => {
				const classMatch = match.match(/class=["']([^"']*)["']/i);
				const classes = classMatch ? classMatch[1].split(/\s+/) : [];
				if (classes.includes('break-main-chap')) {
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

		// Automatically add dropcap to the first paragraph immediately following h1 or h2 (unless it has no-dropcap class)
		content = content.replace(
			/(<h[12][^>]*>[\s\S]*?<\/h[12]>\s*)(<p[^>]*>\s*)((?:<[a-z0-9]+[^>]*>)*)((?:[“‘"’'«‹—-]|&ldquo;|&lsquo;|&quot;|&apos;)*[^<\s])/gi,
			(match, p1, p2, p3, p4) => {
				if (/\bno-dropcap\b/i.test(p2)) {
					return match;
				}
				let updatedP2: string;
				if (p2.includes('class=')) {
					updatedP2 = p2.replace(/class=["']([^"']*)["']/i, (_cMatch, classNames) => {
						return `class="${classNames} has-dropcap"`;
					});
				} else {
					updatedP2 = p2.replace(/<p/i, '<p class="has-dropcap"');
				}
				return p1 + updatedP2 + p3 + '<span class="dropcap">' + p4 + '</span>';
			}
		);

		// Ensure that any paragraph containing a dropcap has the "has-dropcap" class
		content = content.replace(
			/<p([^>]*)>([^<]*(?:<(?!p\b)[^>]*>)*?<span\s+class=["']dropcap["'])/gi,
			(match, pAttrs, contentBeforeDropcap) => {
				if (pAttrs.includes('has-dropcap')) {
					return match;
				}
				let updatedPAttrs: string;
				if (pAttrs.includes('class=')) {
					updatedPAttrs = pAttrs.replace(/class=["']([^"']*)["']/i, (_cMatch, classNames) => {
						return `class="${classNames} has-dropcap"`;
					});
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
			.replace(/class=["']([^"']*)["']/gi, (_cMatch, classNames) => {
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
			.replace(/class=["']([^"']*)["']/gi, (_cMatch, classNames) => {
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
