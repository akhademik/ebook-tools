// src/lib/epub-to-txt/html-dom.ts

interface DomTextNode {
	type: 'text';
	text: string;
}

export interface DomElementNode {
	type: 'element';
	/** Lowercase local tag name (e.g., `opf:item` -> `item`) */
	tag: string;
	/** Lowercase raw tag name including namespace prefix if any */
	rawTag: string;
	/** Attribute map keyed by lowercase attribute name (both full name and local name) */
	attrs: Record<string, string>;
	rawAttrs: string;
	children: DomNode[];
}

export type DomNode = DomTextNode | DomElementNode;

const VOID_TAGS = new Set([
	'area',
	'base',
	'br',
	'col',
	'embed',
	'hr',
	'img',
	'input',
	'link',
	'meta',
	'param',
	'source',
	'track',
	'wbr'
]);

const RAW_TEXT_TAGS = new Set(['script', 'style', 'noscript']);

function normalizeTagName(name: string): { tag: string; rawTag: string } {
	const rawTag = name.toLowerCase();
	const colonIdx = rawTag.indexOf(':');
	const tag = colonIdx !== -1 ? rawTag.slice(colonIdx + 1) : rawTag;
	return { tag, rawTag };
}

function parseAttributes(rawAttrs: string): Record<string, string> {
	const attrs: Record<string, string> = {};
	let i = 0;
	const len = rawAttrs.length;

	while (i < len) {
		while (i < len && /\s/.test(rawAttrs[i])) i++;
		if (i >= len) break;

		const nameStart = i;
		while (i < len && !/[\s=/>]/.test(rawAttrs[i])) i++;
		const rawName = rawAttrs.slice(nameStart, i).toLowerCase();
		if (!rawName) {
			i++;
			continue;
		}

		while (i < len && /\s/.test(rawAttrs[i])) i++;

		let value = '';
		if (i < len && rawAttrs[i] === '=') {
			i++;
			while (i < len && /\s/.test(rawAttrs[i])) i++;
			if (i < len && (rawAttrs[i] === '"' || rawAttrs[i] === "'")) {
				const quote = rawAttrs[i];
				i++;
				const valStart = i;
				while (i < len && rawAttrs[i] !== quote) i++;
				value = rawAttrs.slice(valStart, i);
				if (i < len && rawAttrs[i] === quote) i++;
			} else {
				const valStart = i;
				while (i < len && !/[\s>]/.test(rawAttrs[i])) i++;
				value = rawAttrs.slice(valStart, i);
			}
		}

		attrs[rawName] = value;
		const colonIdx = rawName.indexOf(':');
		if (colonIdx !== -1) {
			const localName = rawName.slice(colonIdx + 1);
			if (!(localName in attrs)) {
				attrs[localName] = value;
			}
		}
	}

	return attrs;
}

/**
 * Finds the end index (`>`) of an opening/self-closing tag starting after `<tagName`,
 * respecting single-quoted and double-quoted attribute values that may contain `>`.
 */
function findTagCloseIndex(html: string, start: number): number {
	let quote: '"' | "'" | null = null;
	for (let i = start; i < html.length; i++) {
		const ch = html[i];
		if (quote !== null) {
			if (ch === quote) quote = null;
		} else {
			if (ch === '"' || ch === "'") {
				quote = ch;
			} else if (ch === '>') {
				return i;
			}
		}
	}
	return -1;
}

/**
 * Lightweight, zero-dependency HTML/XHTML/XML DOM tree parser.
 * Works identically in Node (Vitest) and browser environments without `jsdom` or `DOMParser`.
 */
export function parseHtmlToDom(html: string): DomElementNode {
	const root: DomElementNode = {
		type: 'element',
		tag: 'root',
		rawTag: 'root',
		attrs: {},
		rawAttrs: '',
		children: []
	};

	if (!html) return root;

	const stack: DomElementNode[] = [root];
	const len = html.length;
	let pos = 0;

	const appendText = (text: string) => {
		if (!text) return;
		const parent = stack[stack.length - 1];
		const lastChild = parent.children[parent.children.length - 1];
		if (lastChild && lastChild.type === 'text') {
			lastChild.text += text;
		} else {
			parent.children.push({ type: 'text', text });
		}
	};

	while (pos < len) {
		const lt = html.indexOf('<', pos);
		if (lt === -1) {
			appendText(html.slice(pos));
			break;
		}

		if (lt > pos) {
			appendText(html.slice(pos, lt));
		}

		// Comments: <!-- ... -->
		if (html.startsWith('<!--', lt)) {
			const endComment = html.indexOf('-->', lt + 4);
			pos = endComment === -1 ? len : endComment + 3;
			continue;
		}

		// CDATA: <![CDATA[ ... ]]>
		if (html.startsWith('<![CDATA[', lt)) {
			const endCdata = html.indexOf(']]>', lt + 9);
			if (endCdata === -1) {
				appendText(html.slice(lt + 9));
				pos = len;
			} else {
				appendText(html.slice(lt + 9, endCdata));
				pos = endCdata + 3;
			}
			continue;
		}

		// Processing instructions <?...?> or declarations <!DOCTYPE ...>
		if (html.startsWith('<?', lt) || html.startsWith('<!', lt)) {
			const gt = findTagCloseIndex(html, lt + 2);
			pos = gt === -1 ? len : gt + 1;
			continue;
		}

		// Closing tag </...>
		if (html.startsWith('</', lt)) {
			const gt = html.indexOf('>', lt + 2);
			if (gt === -1) {
				appendText(html.slice(lt));
				break;
			}
			const rawClose = html.slice(lt + 2, gt).trim();
			const { tag, rawTag } = normalizeTagName(rawClose);

			// Unwind stack to nearest matching ancestor (exact rawTag first, then local tag)
			let matchIdx = -1;
			for (let i = stack.length - 1; i >= 1; i--) {
				if (stack[i].rawTag === rawTag || stack[i].tag === tag) {
					matchIdx = i;
					break;
				}
			}
			if (matchIdx !== -1) {
				stack.length = matchIdx;
			}

			pos = gt + 1;
			continue;
		}

		// Opening / self-closing tag <tagName ...>
		const nameStart = lt + 1;
		if (nameStart >= len || !/[a-zA-Z]/.test(html[nameStart])) {
			// Literal '<' not starting a valid tag
			appendText('<');
			pos = lt + 1;
			continue;
		}

		let nameEnd = nameStart;
		while (nameEnd < len && /[a-zA-Z0-9_:-]/.test(html[nameEnd])) nameEnd++;
		const rawTagName = html.slice(nameStart, nameEnd);
		const gt = findTagCloseIndex(html, nameEnd);
		if (gt === -1) {
			appendText(html.slice(lt));
			break;
		}

		let rawAttrSlice = html.slice(nameEnd, gt);
		const selfClosing = /\/\s*$/.test(rawAttrSlice);
		if (selfClosing) {
			rawAttrSlice = rawAttrSlice.replace(/\/\s*$/, '');
		}
		const trimmedRawAttrs = rawAttrSlice.trim();
		const { tag, rawTag } = normalizeTagName(rawTagName);

		const element: DomElementNode = {
			type: 'element',
			tag,
			rawTag,
			attrs: parseAttributes(trimmedRawAttrs),
			rawAttrs: trimmedRawAttrs,
			children: []
		};

		stack[stack.length - 1].children.push(element);
		pos = gt + 1;

		if (!selfClosing && RAW_TEXT_TAGS.has(tag)) {
			const closeRegex = new RegExp(`<\\/${rawTagName}\\s*>`, 'i');
			const closeMatch = closeRegex.exec(html.slice(pos));
			if (closeMatch) {
				const rawInner = html.slice(pos, pos + closeMatch.index);
				if (rawInner) {
					element.children.push({ type: 'text', text: rawInner });
				}
				pos = pos + closeMatch.index + closeMatch[0].length;
			} else {
				pos = len;
			}
			continue;
		}

		if (!selfClosing && !VOID_TAGS.has(tag)) {
			stack.push(element);
		}
	}

	return root;
}

export function hasClass(el: DomElementNode, className: string): boolean {
	const cls = el.attrs['class'];
	if (!cls) return false;
	const target = className.toLowerCase();
	return cls.toLowerCase().split(/\s+/).includes(target);
}

export function hasAnyClass(el: DomElementNode, classNames: string[]): boolean {
	const cls = el.attrs['class'];
	if (!cls) return false;
	const tokens = new Set(cls.toLowerCase().split(/\s+/));
	return classNames.some((c) => tokens.has(c.toLowerCase()));
}

export function getAttr(el: DomElementNode, name: string): string | undefined {
	return el.attrs[name.toLowerCase()];
}

export function findElements(
	node: DomNode,
	predicate: (el: DomElementNode) => boolean,
	results: DomElementNode[] = []
): DomElementNode[] {
	if (node.type !== 'element') return results;
	if (node.tag !== 'root' && predicate(node)) {
		results.push(node);
	}
	for (const child of node.children) {
		findElements(child, predicate, results);
	}
	return results;
}
