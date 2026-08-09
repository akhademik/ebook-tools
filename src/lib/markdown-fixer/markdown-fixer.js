import JSZip from 'jszip';
import * as logger from '../helpers/logger.js';

const MAX_SPAN = 150;
const SPAN = '(?:(?!\\n[ \\t]*\\n)[\\s\\S]){1,' + MAX_SPAN + '}?';

const BOLD_ITALIC_PATTERNS = [
	new RegExp('\\*\\*\\*(' + SPAN + ')\\*\\*\\*', 'g'),
	new RegExp('(?<!_)___(' + SPAN + ')___(?!_)', 'g'),
	new RegExp('\\*\\*_(' + SPAN + ')_\\*\\*', 'g'),
	new RegExp('__\\*(' + SPAN + ')\\*__', 'g'),
	new RegExp('\\*__(' + SPAN + ')__\\*', 'g'),
	new RegExp('_\\*\\*(' + SPAN + ')\\*\\*_', 'g')
];
const ITALIC_PATTERNS = [
	new RegExp('(?<!\\*)\\*(?!\\*)(' + SPAN + ')(?<!\\*)\\*(?!\\*)', 'g'),
	new RegExp('(?<![\\w_])_(?!_)(' + SPAN + ')(?<!_)_(?![\\w_])', 'g')
];

export function convertBrackets(text, config = {}) {
	logger.log('markdown-fixer', 'convertBrackets called, input length:', text.length);
	const { italicOpen = '[', italicClose = ']', biOpen = '[', biClose = ']' } = config;
	let count = 0;
	let converted = text;
	
	for (const pattern of BOLD_ITALIC_PATTERNS) {
		converted = converted.replace(pattern, (match, inner) => {
			count++;
			return biOpen + inner + biClose;
		});
	}
	for (const pattern of ITALIC_PATTERNS) {
		converted = converted.replace(pattern, (match, inner) => {
			count++;
			return italicOpen + inner + italicClose;
		});
	}
	logger.log('markdown-fixer', 'convertBrackets finished, replaced:', count, 'matches');
	return { converted, count };
}

export async function fixMarkdownZip(mdSelectedFile, wrappers) {
	if (!mdSelectedFile) {
		logger.error('markdown-fixer', 'fixMarkdownZip called without file');
		throw new Error('Chưa chọn tệp .ZIP.');
	}
	logger.log('markdown-fixer', 'fixMarkdownZip called, size:', mdSelectedFile.size, 'wrappers:', wrappers);

	const arrayBuffer = await mdSelectedFile.arrayBuffer();
	const inZip = await JSZip.loadAsync(arrayBuffer);
	const outZip = new JSZip();

	let fileCount = 0;
	let replaceCount = 0;
	const rows = [];

	const entries = Object.values(inZip.files);
	for (const entry of entries) {
		if (entry.dir) continue;
		if (/\.md$/i.test(entry.name)) {
			const content = await entry.async('string');
			const { converted, count } = convertBrackets(content, wrappers);
			outZip.file(entry.name, converted);
			fileCount++;
			replaceCount += count;
			rows.push({ path: entry.name, count });
			logger.log('markdown-fixer', 'Processed markdown file:', entry.name, 'replaced:', count);
		} else {
			const blob = await entry.async('blob');
			outZip.file(entry.name, blob);
			logger.log('markdown-fixer', 'Copied non-markdown file:', entry.name);
		}
	}

	const zipBlob = await outZip.generateAsync({ type: 'blob' });
	rows.sort((a, b) => b.count - a.count);

	logger.log('markdown-fixer', 'fixMarkdownZip finished, processed:', fileCount, 'markdown files, total replacements:', replaceCount);
	return {
		zipBlob,
		totalFiles: fileCount,
		totalReplacements: replaceCount,
		processedFilesList: rows
	};
}
