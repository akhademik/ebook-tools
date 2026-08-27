// src/lib/epub-packer/xml-builders/nav-builder.ts
import { escapeXml } from '$lib/utils/xml';
import type { EpubMetadata, EpubChapterItem, TocEntry, TocNode, TocTree } from '$lib/types';

export type { TocEntry };

export function injectHeadingIds(chapters: EpubChapterItem[]): EpubChapterItem[] {
	let headingCounter = 0;
	return chapters.map((chapter) => {
		if (chapter.fileName === 'cover' || chapter.fileName === 'jacket' || !chapter.html) {
			return chapter;
		}
		const headingRegex = /<h([12])\b([^>]*)>([\s\S]*?)<\/h\1>/gi;
		const newHtml = chapter.html.replace(headingRegex, (_match, levelStr, attrs, innerContent) => {
			const level = parseInt(levelStr, 10);
			const idMatch = attrs.match(/id=["']([^"']*)["']/i);
			let updatedAttrs = attrs;
			if (!idMatch) {
				headingCounter++;
				const id = `heading-${level}-${headingCounter}`;
				updatedAttrs = ` id="${id}"` + attrs;
			}
			return `<h${level}${updatedAttrs}>${innerContent}</h${level}>`;
		});
		return {
			...chapter,
			html: newHtml
		};
	});
}

/**
 * Builds a unified intermediate TocTree from chapters.
 */
export function buildTocTree(chapters: EpubChapterItem[]): TocTree {
	const processedChapters = injectHeadingIds(chapters);
	const nodes: TocNode[] = [];
	let nodeCounter = 1;

	for (const c of processedChapters) {
		if (c.fileName === 'cover') {
			continue;
		}

		const html = c.html || '';
		const headingRegex = /<h([12])\b([^>]*)>([\s\S]*?)<\/h\1>/gi;
		const headings: Array<{ level: number; id: string; title: string }> = [];
		let match: RegExpExecArray | null;

		headingRegex.lastIndex = 0;
		while ((match = headingRegex.exec(html)) !== null) {
			const level = parseInt(match[1], 10);
			const attrs = match[2];
			const innerContent = match[3];

			if (/\bno-toc\b/i.test(attrs)) {
				continue;
			}

			const idMatch = attrs.match(/id=["']([^"']*)["']/i);
			const id = idMatch ? idMatch[1] : '';
			const plainText = innerContent.replace(/<[^>]+>/g, '').trim();

			headings.push({
				level,
				id,
				title: plainText || c.title
			});
		}

		const basePath = 'text/' + c.fileName + '.xhtml';

		if (headings.length === 0) {
			nodes.push({
				id: `navPoint-${nodeCounter++}`,
				title: c.title,
				href: basePath,
				level: 1,
				children: []
			});
		} else {
			const hasH1 = headings.some((h) => h.level === 1);
			if (hasH1) {
				const firstH1Index = headings.findIndex((h) => h.level === 1);
				for (let i = 0; i < headings.length; i++) {
					const h = headings[i];
					const anchor = i === firstH1Index ? '' : h.id ? `#${h.id}` : '';
					nodes.push({
						id: `navPoint-${nodeCounter++}`,
						title: h.title,
						href: basePath + anchor,
						level: h.level,
						children: []
					});
				}
			} else {
				nodes.push({
					id: `navPoint-${nodeCounter++}`,
					title: c.title,
					href: basePath,
					level: 1,
					children: []
				});
				for (const h of headings) {
					const anchor = h.id ? `#${h.id}` : '';
					nodes.push({
						id: `navPoint-${nodeCounter++}`,
						title: h.title,
						href: basePath + anchor,
						level: h.level,
						children: []
					});
				}
			}
		}
	}

	return { nodes };
}

/**
 * Returns a flat list of TOC entries for backwards compatibility.
 */
export function getTocEntries(chapters: EpubChapterItem[]): TocEntry[] {
	const tree = buildTocTree(chapters);
	const entries: TocEntry[] = [];

	function flatten(nodeList: TocNode[]) {
		for (const node of nodeList) {
			entries.push({
				title: node.title,
				url: node.href
			});
			if (node.children && node.children.length > 0) {
				flatten(node.children);
			}
		}
	}

	flatten(tree.nodes);
	return entries;
}

function renderNavList(nodes: TocNode[]): string {
	return nodes
		.map((node) => {
			let item = `<li><a href="${escapeXml(node.href)}">${escapeXml(node.title)}</a>`;
			if (node.children && node.children.length > 0) {
				item += `\n        <ol>\n          ${renderNavList(node.children)}\n        </ol>\n      </li>`;
			} else {
				item += `</li>`;
			}
			return item;
		})
		.join('\n      ');
}

function renderNcxNavPoints(
	nodes: TocNode[],
	startPlayOrder = 1
): { xml: string; nextPlayOrder: number } {
	let playOrder = startPlayOrder;
	const parts: string[] = [];

	for (const node of nodes) {
		const currentOrder = playOrder++;
		let point =
			`<navPoint id="${escapeXml(node.id || `navPoint-${currentOrder}`)}" playOrder="${currentOrder}">\n` +
			`      <navLabel><text>${escapeXml(node.title)}</text></navLabel>\n` +
			`      <content src="${escapeXml(node.href)}"/>`;

		if (node.children && node.children.length > 0) {
			const childResult = renderNcxNavPoints(node.children, playOrder);
			playOrder = childResult.nextPlayOrder;
			point += `\n${childResult.xml}\n    </navPoint>`;
		} else {
			point += `\n    </navPoint>`;
		}
		parts.push(point);
	}

	return {
		xml: parts.join('\n    '),
		nextPlayOrder: playOrder
	};
}

/**
 * Render EPUB 3 Navigation Document (nav.xhtml) from TocTree or Chapter list.
 */
export function buildNavXhtml(meta: EpubMetadata, input: EpubChapterItem[] | TocTree): string {
	const tree: TocTree = Array.isArray(input) ? buildTocTree(input) : input;
	const listHtml = renderNavList(tree.nodes);

	return (
		'<?xml version="1.0" encoding="UTF-8"?>\n' +
		'<!DOCTYPE html>\n' +
		'<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="' +
		meta.language +
		'">\n' +
		'<head>\n  <meta charset="utf-8"/>\n  <title>Mục lục</title>\n  <link rel="stylesheet" type="text/css" href="styles/style.css"/>\n</head>\n' +
		'<body>\n  <nav epub:type="toc" id="toc">\n    <h1>Mục lục</h1>\n    <ol>\n      ' +
		listHtml +
		'\n    </ol>\n  </nav>\n</body>\n</html>'
	);
}

/**
 * Render EPUB 2 NCX Document (toc.ncx) from TocTree or Chapter list.
 */
export function buildTocNcx(meta: EpubMetadata, input: EpubChapterItem[] | TocTree): string {
	const tree: TocTree = Array.isArray(input) ? buildTocTree(input) : input;
	const { xml: navPointsXml } = renderNcxNavPoints(tree.nodes, 1);

	return (
		'<?xml version="1.0" encoding="UTF-8"?>\n' +
		'<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">\n' +
		'  <head>\n' +
		'    <meta name="dtb:uid" content="' +
		escapeXml(meta.identifier || 'urn:uuid:ebook') +
		'"/>\n' +
		'    <meta name="dtb:depth" content="2"/>\n' +
		'    <meta name="dtb:totalPageCount" content="0"/>\n' +
		'    <meta name="dtb:maxPageNumber" content="0"/>\n' +
		'  </head>\n' +
		'  <docTitle><text>' +
		escapeXml(meta.title || 'Không tên') +
		'</text></docTitle>\n' +
		'  <navMap>\n    ' +
		navPointsXml +
		'\n  </navMap>\n' +
		'</ncx>'
	);
}
