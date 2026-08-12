import { escapeXml } from '$lib/helpers/helpers.js';
import * as logger from '$lib/helpers/logger.js';

function convertInline(text, ignoreFormat = false) {
	if (ignoreFormat) {
		return escapeXml(String(text || ''));
	}
	const codeSpans = [];
	let t = String(text).replace(/`([^`]+)`/g, (m, code) => {
		codeSpans.push(code);
		return '___CODESPAN___' + (codeSpans.length - 1) + '___CODESPAN___';
	});
	t = escapeXml(t);
	t = t.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (m, alt, src) => '<img alt="' + alt + '" src="' + src + '"/>');
	t = t.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (m, txt, href) => '<a href="' + href + '">' + txt + '</a>');
	
	t = t.replace(/&lt;u&gt;([\s\S]{1,150}?)&lt;\/u&gt;/gi, (m, s) => '<u>' + s + '</u>');
	t = t.replace(/&lt;ins&gt;([\s\S]{1,150}?)&lt;\/ins&gt;/gi, (m, s) => '<u>' + s + '</u>');
	
	const INLINE_SPAN = '[\\s\\S]{1,150}?';
	t = t.replace(new RegExp('\\*\\*\\*(' + INLINE_SPAN + ')\\*\\*\\*', 'g'), (m, s) => '<b><i>' + s + '</i></b>');
	t = t.replace(new RegExp('\\*\\*\\*(' + INLINE_SPAN + ')\\*\\*', 'g'), (m, s) => '<b><i>' + s + '</i></b>');
	t = t.replace(new RegExp('___(' + INLINE_SPAN + ')___', 'g'), (m, s) => '<b><i>' + s + '</i></b>');
	t = t.replace(new RegExp('\\*\\*_(' + INLINE_SPAN + ')_\\*\\*', 'g'), (m, s) => '<b><i>' + s + '</i></b>');
	t = t.replace(new RegExp('__\\*(' + INLINE_SPAN + ')\\*__', 'g'), (m, s) => '<b><i>' + s + '</i></b>');
	t = t.replace(new RegExp('\\*\\*(' + INLINE_SPAN + ')\\*\\*', 'g'), (m, s) => '<b>' + s + '</b>');
	t = t.replace(new RegExp('(?<![\\w_])__(' + INLINE_SPAN + ')__(?![\\w_])', 'g'), (m, s) => '<b>' + s + '</b>');
	t = t.replace(new RegExp('(?<!\\*)\\*(?!\\*)(' + INLINE_SPAN + ')(?<!\\*)\\*(?!\\*)', 'g'), (m, s) => '<i>' + s + '</i>');
	t = t.replace(new RegExp('(?<![\\w_])_(?!_)(' + INLINE_SPAN + ')(?<!_)_(?![\\w_])', 'g'), (m, s) => '<i>' + s + '</i>');
	
	t = t.replace(/___CODESPAN___(\d+)___CODESPAN___/g, (m, idx) => '<code>' + escapeXml(codeSpans[Number(idx)]) + '</code>');
	return t;
}

function endsWithSentencePunctuation(str) {
	const t = String(str || '').trim();
	return /[.!?…](["'”’»)\]]*)$/.test(t);
}

function startsWithLowercaseLetter(str) {
	const t = String(str || '').trim();
	if (!t) return false;
	const firstChar = t.charAt(0);
	return firstChar === firstChar.toLowerCase() && firstChar !== firstChar.toUpperCase();
}

export function parseMarkdownBlocks(md) {
	logger.log('epub-parser', 'parseMarkdownBlocks called, input length:', (md || '').length);
	const lines = String(md).replace(/\r\n/g, '\n').split('\n');
	const blocks = [];
	let i = 0;
	const isHeading = l => /^#{1,6}\s+/.test(l);
	const isFence = l => /^```/.test(l.trim());
	const isHr = l => /^(-{3,}|\*{3,}|_{3,})\s*$/.test(l.trim());
	const isUl = l => /^\s*[-*+]\s+/.test(l);
	const isOl = l => /^\s*\d+\.\s+/.test(l);
	const isQuote = l => /^>/.test(l);

	while (i < lines.length) {
		const line = lines[i];
		if (line.trim() === '') { i++; continue; }

		if (isFence(line)) {
			i++;
			const codeLines = [];
			while (i < lines.length && !isFence(lines[i])) { codeLines.push(lines[i]); i++; }
			i++;
			blocks.push({ type: 'code', content: codeLines.join('\n') });
			continue;
		}

		const hm = line.match(/^(#{1,6})\s+(.*)$/);
		if (hm) {
			blocks.push({ type: 'heading', level: hm[1].length, text: hm[2].trim() });
			i++;
			continue;
		}

		if (isHr(line)) { blocks.push({ type: 'hr' }); i++; continue; }

		if (isQuote(line)) {
			const qLines = [];
			while (i < lines.length && isQuote(lines[i])) { qLines.push(lines[i].replace(/^>\s?/, '')); i++; }
			blocks.push({ type: 'blockquote', text: qLines.join(' ') });
			continue;
		}

		if (isUl(line)) {
			const items = [];
			while (i < lines.length && isUl(lines[i])) { items.push(lines[i].replace(/^\s*[-*+]\s+/, '')); i++; }
			blocks.push({ type: 'ul', items });
			continue;
		}

		if (isOl(line)) {
			const items = [];
			while (i < lines.length && isOl(lines[i])) { items.push(lines[i].replace(/^\s*\d+\.\s+/, '')); i++; }
			blocks.push({ type: 'ol', items });
			continue;
		}

		const paraLines = [line];
		i++;
		while (i < lines.length) {
			const nextLine = lines[i];
			if (nextLine.trim() === '') break;
			if (isHeading(nextLine) || isFence(nextLine) || isQuote(nextLine) || isUl(nextLine) || isOl(nextLine) || isHr(nextLine)) {
				break;
			}
			const currentLine = paraLines[paraLines.length - 1];
			if (!endsWithSentencePunctuation(currentLine) && startsWithLowercaseLetter(nextLine)) {
				paraLines.push(nextLine);
				i++;
			} else {
				break;
			}
		}
		blocks.push({ type: 'p', text: paraLines.join('\n').trim() });
	}
	logger.log('epub-parser', 'parseMarkdownBlocks finished, total blocks:', blocks.length);
	return blocks;
}

export function renderMarkdownBlocks(blocks, options = {}) {
	const ignoreFormat = options.ignoreMarkdownFormat || false;
	let html = '';
	let t = null;
	for (const b of blocks) {
		if (b.type === 'heading') {
			if (t === null && (b.level === 1 || b.level === 2)) t = b.text;
			if (b.level === 2) {
				html += '<h2><span class="ch-title">' + convertInline(b.text, ignoreFormat) + '</span></h2>\n';
			} else {
				html += '<h' + b.level + '>' + convertInline(b.text, ignoreFormat) + '</h' + b.level + '>\n';
			}
		} else if (b.type === 'p') {
			if (b.text.trim() === '###') {
				html += '<p class="scene-break-big" role="separator">• • •</p>\n';
			} else if (b.text.trim() === '##') {
				html += '<p class="scene-break-small" role="separator">*</p>\n';
			} else {
				html += '<p>' + convertInline(b.text.replace(/\n+/g, ' '), ignoreFormat) + '</p>\n';
			}
		} else if (b.type === 'blockquote') {
			html += '<blockquote><p>' + convertInline(b.text, ignoreFormat) + '</p></blockquote>\n';
		} else if (b.type === 'ul') {
			html += '<ul>\n' + b.items.map(it => '<li>' + convertInline(it, ignoreFormat) + '</li>').join('\n') + '\n</ul>\n';
		} else if (b.type === 'ol') {
			html += '<ol>\n' + b.items.map(it => '<li>' + convertInline(it, ignoreFormat) + '</li>').join('\n') + '\n</ol>\n';
		} else if (b.type === 'hr') {
			html += '<hr/>\n';
		} else if (b.type === 'code') {
			html += '<pre><code>' + escapeXml(b.content) + '</code></pre>\n';
		}
	}
	return { html, title: t };
}

function escapeRegExp(str) {
	return String(str || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function getClosingTag(openTag) {
	const match = openTag.match(/<([a-zA-Z0-9]+)/);
	return match ? `</${match[1]}>` : '';
}

export function convertTxtInline(text, customDefinitions = []) {
	let t = escapeXml(String(text || ''));

	// 1. Process custom definitions first
	if (Array.isArray(customDefinitions)) {
		for (const def of customDefinitions) {
			if (def.pattern && def.tag) {
				const escapedP = escapeRegExp(def.pattern);
				const reCustom = new RegExp(escapedP + '(.+?)' + escapedP, 'g');
				t = t.replace(reCustom, (m, content) => {
					const closingTag = getClosingTag(def.tag);
					return def.tag + content + closingTag;
				});
			}
		}
	}

	// 2. Default rule: [đậm] -> <b>đậm</b>
	t = t.replace(/\[([^\]]+)\]/g, (m, content) => '<b>' + content + '</b>');

	// 3. Default rule: *nghiêng* -> <i>nghiêng</i>
	t = t.replace(/\*([^*]+)\*/g, (m, content) => '<i>' + content + '</i>');

	// 4. Default rule: {n} -> <a class="noteref" epub:type="noteref" id="fnref{n}" href="notes.xhtml#fn{n}"><sup>{n}</sup></a>
	t = t.replace(/\{(\d+)\}/g, (m, n) => {
		return `<a class="noteref" epub:type="noteref" id="fnref${n}" href="notes.xhtml#fn${n}"><sup>${n}</sup></a>`;
	});

	return t;
}

export function normalizeMultiLineChapterTags(text) {
	let t = String(text || '');
	// Normalize ##...#
	t = t.replace(/##([\s\S]{1,300}?)#+/g, (m, inner) => {
		const cleanedInner = inner.replace(/\r?\n\s*/g, ' ').trim();
		return '##' + cleanedInner + '#';
	});
	// Normalize #...#
	t = t.replace(/#([\s\S]{1,300}?)#+/g, (m, inner) => {
		if (inner.startsWith('#')) return m;
		const cleanedInner = inner.replace(/\r?\n\s*/g, ' ').trim();
		return '#' + cleanedInner + '#';
	});
	return t;
}
