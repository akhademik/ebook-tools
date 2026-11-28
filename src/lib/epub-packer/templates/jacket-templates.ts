// src/lib/epub-packer/templates/jacket-templates.ts
import { escapeXml } from '$lib/utils/xml';
import type { JacketTemplate } from '$lib/types';
import introCss from './css-template/intro-css.css?raw';

export type { JacketTemplate };

function getJacketCss(templateId: number): string {
	const regex = new RegExp(
		`\\/\\*\\s*intro-${templateId}\\s*\\*\\/([\\s\\S]*?)(?:\\/\\*\\s*intro-\\d+\\s*\\*\\/|$)`
	);
	const match = introCss.match(regex);
	return match ? match[1].trim() : '';
}

const formatTranslator = (t?: string): string => {
	if (!t) return '';
	const trimmed = t.trim();
	if (/dịch$/i.test(trimmed)) return trimmed;
	return trimmed;
};

export const JACKET_SAMPLE_PLACEHOLDERS = {
	title: 'Mật Mã Da Vinci',
	originalTitle: 'The Da Vinci Code',
	author: 'Dan Brown',
	translator: 'Đỗ Thu Hà',
	publisher: '1980 Books',
	distributor: 'NXB Văn hóa Thông tin'
} as const;

const CORNER_SCROLL_SVG =
	'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true"><path d="M76 12 C48 12, 24 2, 14 14 C6 24, 28 32, 38 22 C44 16, 26 8, 12 24 C2 36, 12 58, 12 76"/><path d="M76 16 C42 16, 18 14, 16 42 C15 54, 24 56, 24 48 C24 42, 16 42, 16 54 L16 76" stroke-width="0.9"/><path d="M48 6 C32 6, 10 10, 8 28" stroke-width="0.8"/></svg>';

const VINE_CORNER_SVG =
	'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" fill="currentColor" aria-hidden="true"><g transform="translate(26,26)"><circle cx="0" cy="0" r="3"/><ellipse cx="0" cy="-10" rx="2.5" ry="6"/><ellipse cx="0" cy="10" rx="2.5" ry="6"/><ellipse cx="-10" cy="0" rx="6" ry="2.5"/><ellipse cx="10" cy="0" rx="6" ry="2.5"/><ellipse cx="-7" cy="-7" rx="5" ry="2.2" transform="rotate(45 -7 -7)"/><ellipse cx="7" cy="7" rx="5" ry="2.2" transform="rotate(45 7 7)"/><ellipse cx="7" cy="-7" rx="5" ry="2.2" transform="rotate(-45 7 -7)"/><ellipse cx="-7" cy="7" rx="5" ry="2.2" transform="rotate(-45 -7 7)"/></g><path d="M38 22 Q68 12, 105 16 M22 38 Q12 68, 16 105" fill="none" stroke="currentColor" stroke-width="1.2"/><path d="M55 16 Q62 8, 70 13 Q62 18, 55 16 Z M76 14 Q84 7, 92 12 Q84 17, 76 14 Z M64 17 Q70 25, 78 21 Q71 15, 64 17 Z"/><path d="M16 55 Q8 62, 13 70 Q18 62, 16 55 Z M14 76 Q7 84, 12 92 Q17 84, 14 76 Z M17 64 Q25 70, 21 78 Q15 71, 17 64 Z"/></svg>';

const LEAF_CORNER_SVG =
	'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 80" fill="currentColor" aria-hidden="true"><circle cx="16" cy="22" r="8"/><circle cx="28" cy="14" r="5" opacity="0.5"/><path d="M18 22 C35 8, 65 6, 92 12 C68 14, 42 18, 22 26 Z"/><path d="M24 18 C34 4, 52 2, 68 5 C50 8, 36 12, 24 18 Z" opacity="0.65"/><path d="M14 26 C8 44, 8 62, 14 76 C15 58, 17 42, 19 28 Z"/></svg>';

const ROSE_CORNER_SVG =
	'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true"><circle cx="18" cy="18" r="8" fill="currentColor" fill-opacity="0.12"/><path d="M18 13 C21 13, 23 16, 21 19 C19 22, 14 21, 14 17 C14 13, 19 11, 23 14 C26 17, 25 23, 20 25"/><path d="M26 16 Q42 10, 58 14 M16 26 Q10 42, 14 58"/><path d="M34 13 Q39 6, 46 10 Q40 15, 34 13 Z M46 12 Q52 6, 58 10 Q52 15, 46 12 Z" fill="currentColor"/><path d="M13 34 Q6 39, 10 46 Q15 40, 13 34 Z M12 46 Q6 52, 10 58 Q15 52, 12 46 Z" fill="currentColor"/></svg>';

const BLOSSOM_CORNER_SVG =
	'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.15" aria-hidden="true"><circle cx="18" cy="18" r="4" fill="currentColor"/><path d="M18 10 C22 10, 26 14, 24 18 C28 18, 28 24, 22 24 C22 28, 14 28, 14 24 C8 24, 8 18, 12 18 C10 14, 14 10, 18 10 Z" fill="currentColor" fill-opacity="0.14"/><path d="M27 16 Q44 11, 60 15 M16 27 Q11 44, 15 60"/><path d="M35 13 C40 7, 47 8, 50 13 C44 15, 39 15, 35 13 Z M13 35 C7 40, 8 47, 13 50 C15 44, 15 39, 13 35 Z" fill="currentColor"/><circle cx="55" cy="15" r="1.5" fill="currentColor"/><circle cx="15" cy="55" r="1.5" fill="currentColor"/></svg>';

const PETAL_SCROLL_CORNER_SVG =
	'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.15" aria-hidden="true"><path d="M10 10 C18 10, 24 16, 22 22 C16 24, 10 18, 10 10 Z" fill="currentColor" fill-opacity="0.18"/><path d="M22 12 C28 12, 30 18, 24 22 M12 22 C12 28, 18 30, 22 24"/><path d="M30 14 H52 C55 14, 55 19, 51 19 C49 19, 49 16, 51 16"/><path d="M14 30 V52 C14 55, 19 55, 19 51 C19 49, 16 49, 16 51"/></svg>';

type SvgCornerTransform = 'tl' | 'tr' | 'bl' | 'br' | 'rotate180';

/**
 * Wraps the inner SVG elements in a native `<g transform="...">` group based on its viewBox,
 * so corner flips/rotations work reliably in EPUB readers that ignore CSS `transform`.
 */
function transformCornerSvg(svg: string, mode: SvgCornerTransform): string {
	if (mode === 'tl') return svg;
	const match = svg.match(
		/^(<svg\b[^>]*\bviewBox=["']0\s+0\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)["'][^>]*>)([\s\S]*)(<\/svg>)$/i
	);
	if (!match) return svg;
	const [, openTag, wStr, hStr, inner, closeTag] = match;
	const w = Number(wStr);
	const h = Number(hStr);
	let transformAttr = '';
	if (mode === 'tr') {
		transformAttr = `translate(${w}, 0) scale(-1, 1)`;
	} else if (mode === 'bl') {
		transformAttr = `translate(0, ${h}) scale(1, -1)`;
	} else if (mode === 'br') {
		transformAttr = `translate(${w}, ${h}) scale(-1, -1)`;
	} else if (mode === 'rotate180') {
		transformAttr = `rotate(180 ${w / 2} ${h / 2})`;
	}
	return `${openTag}<g transform="${transformAttr}">${inner}</g>${closeTag}`;
}

function createCornerHtml(cornerClass: string, posPrefix: string, svg: string): string[] {
	return (['tl', 'tr', 'bl', 'br'] as const).map(
		(pos) => `<div class="${cornerClass} ${posPrefix}-${pos}">${transformCornerSvg(svg, pos)}</div>`
	);
}

interface JacketTemplateSpec {
	id: number;
	outerClass?: string;
	innerClass?: string;
	headerPrefixHtml?: string[];
	splitTopBottom?: boolean;
	authorFirst?: boolean;
	authorWrapperClass?: string;
	authorTag?: 'p' | 'span';
	authorTranslatorBandClass?: string;
	bodyBandClass?: string;
	titleBandClass?: string;
	bottomBandClass?: string;
	originalFormat?: 'plain' | 'brackets';
	beforeTitleIfHasTitle?: string;
	betweenGroupsHtml?: string;
	beforeMetaIfHasMeta?: string;
	authorClass?: 'author' | 'kicker' | 'stamp';
	metaMode?: 'lines' | 'meta-bar';
}

function renderMetaLines(
	publisher: string,
	distributor: string,
	mode: JacketTemplateSpec['metaMode'],
	indent: string
): string[] {
	const metaParts = [publisher, distributor].filter(Boolean);
	if (metaParts.length === 0) return [];

	if (mode === 'meta-bar') {
		return [
			`${indent}<div class="meta-bar">`,
			...metaParts.map((m) => `${indent}  <p class="meta">${escapeXml(m)}</p>`),
			`${indent}</div>`
		];
	}

	return metaParts.map((m) => `${indent}<p class="meta">${escapeXml(m)}</p>`);
}

function renderJacketFromSpec(
	spec: JacketTemplateSpec,
	title: string,
	original: string,
	author: string,
	translator: string,
	publisher: string,
	distributor: string
): string {
	const lines: string[] = [];
	const hasTitleGroup = Boolean(title || original);
	const hasBottomGroup = Boolean(author || translator || publisher || distributor);
	const hasMeta = Boolean(publisher || distributor);
	const formattedOriginal = original
		? spec.originalFormat === 'brackets'
			? `[ ${escapeXml(original)} ]`
			: escapeXml(original)
		: '';

	if (spec.outerClass) {
		lines.push(`<div class="${spec.outerClass}">`);
	}

	const baseIndent = spec.outerClass ? '  ' : '';
	lines.push(`${baseIndent}<div class="jacket-${spec.id}">`);

	if (spec.innerClass) {
		lines.push(`${baseIndent}  <div class="${spec.innerClass}">`);
	}

	const contentIndent = `${baseIndent}${spec.innerClass ? '    ' : '  '}`;

	if (spec.headerPrefixHtml) {
		for (const raw of spec.headerPrefixHtml) {
			lines.push(`${contentIndent}${raw}`);
		}
	}

	const authorCls = spec.authorClass ?? 'author';
	const authorTag = spec.authorTag ?? 'p';
	const authorLine = author
		? `<${authorTag} class="${authorCls}">${escapeXml(author)}</${authorTag}>`
		: '';
	const translatorLine = translator
		? `<p class="translator">${escapeXml(formatTranslator(translator))}</p>`
		: '';

	if (spec.authorTranslatorBandClass) {
		if (authorLine || translatorLine) {
			lines.push(`${contentIndent}<div class="${spec.authorTranslatorBandClass}">`);
			if (authorLine) lines.push(`${contentIndent}  ${authorLine}`);
			if (translatorLine) lines.push(`${contentIndent}  ${translatorLine}`);
			lines.push(`${contentIndent}</div>`);
		}
		if (spec.bodyBandClass) {
			lines.push(`${contentIndent}<div class="${spec.bodyBandClass}">`);
		}
		const bodyIndent = spec.bodyBandClass ? `${contentIndent}  ` : contentIndent;
		if (title) lines.push(`${bodyIndent}<p class="title">${escapeXml(title)}</p>`);
		if (formattedOriginal) lines.push(`${bodyIndent}<p class="original">${formattedOriginal}</p>`);
		lines.push(...renderMetaLines(publisher, distributor, spec.metaMode, bodyIndent));
		if (spec.bodyBandClass) {
			lines.push(`${contentIndent}</div>`);
		}
	} else {
		const blockIndent = spec.splitTopBottom ? `${contentIndent}  ` : contentIndent;
		const titleIndent = spec.titleBandClass ? `${blockIndent}  ` : blockIndent;

		const titleLines: string[] = [];
		if (spec.beforeTitleIfHasTitle && hasTitleGroup) {
			titleLines.push(`${blockIndent}${spec.beforeTitleIfHasTitle}`);
		}
		if (spec.titleBandClass && hasTitleGroup) {
			titleLines.push(`${blockIndent}<div class="${spec.titleBandClass}">`);
		}
		if (title) {
			titleLines.push(`${titleIndent}<p class="title">${escapeXml(title)}</p>`);
		}
		if (formattedOriginal) {
			titleLines.push(`${titleIndent}<p class="original">${formattedOriginal}</p>`);
		}
		if (spec.titleBandClass && hasTitleGroup) {
			titleLines.push(`${blockIndent}</div>`);
		}

		const bottomInnerIndent = spec.bottomBandClass ? `${blockIndent}  ` : blockIndent;
		const bottomInnerLines: string[] = [];
		if (spec.betweenGroupsHtml && hasTitleGroup && hasBottomGroup) {
			bottomInnerLines.push(`${bottomInnerIndent}${spec.betweenGroupsHtml}`);
		}
		if (!spec.authorFirst && authorLine) {
			bottomInnerLines.push(`${bottomInnerIndent}${authorLine}`);
		}
		if (translatorLine) {
			bottomInnerLines.push(`${bottomInnerIndent}${translatorLine}`);
		}
		if (spec.beforeMetaIfHasMeta && hasMeta) {
			bottomInnerLines.push(`${bottomInnerIndent}${spec.beforeMetaIfHasMeta}`);
		}
		bottomInnerLines.push(
			...renderMetaLines(publisher, distributor, spec.metaMode, bottomInnerIndent)
		);

		const bottomLines =
			spec.bottomBandClass && bottomInnerLines.length > 0
				? [
						`${blockIndent}<div class="${spec.bottomBandClass}">`,
						...bottomInnerLines,
						`${blockIndent}</div>`
					]
				: bottomInnerLines;

		if (spec.authorFirst && authorLine) {
			if (spec.authorWrapperClass) {
				lines.push(`${contentIndent}<div class="${spec.authorWrapperClass}">`);
				lines.push(`${contentIndent}  ${authorLine}`);
				lines.push(`${contentIndent}</div>`);
			} else {
				lines.push(`${contentIndent}${authorLine}`);
			}
		}

		if (spec.splitTopBottom) {
			lines.push(`${contentIndent}<div class="top">`, ...titleLines, `${contentIndent}</div>`);
			lines.push(`${contentIndent}<div class="bottom">`, ...bottomLines, `${contentIndent}</div>`);
		} else {
			lines.push(...titleLines, ...bottomLines);
		}
	}

	if (spec.innerClass) {
		lines.push(`${baseIndent}  </div>`);
	}

	lines.push(`${baseIndent}</div>`);
	if (spec.outerClass) {
		lines.push('</div>');
	}

	return lines.join('\n');
}

function createJacketTemplate(spec: JacketTemplateSpec): JacketTemplate {
	return {
		id: spec.id,
		name: `Mẫu ${spec.id}`,
		get css() {
			return getJacketCss(spec.id);
		},
		render: (title, original, author, translator, publisher, distributor) =>
			renderJacketFromSpec(spec, title, original, author, translator, publisher, distributor)
	};
}

const JACKET_TEMPLATE_SPECS: JacketTemplateSpec[] = [
	{ id: 1, betweenGroupsHtml: '<hr class="rule" />' },
	{
		id: 2,
		beforeTitleIfHasTitle: '<hr class="diagonal" />',
		beforeMetaIfHasMeta: '<hr class="diagonal2" />'
	},
	{ id: 3, outerClass: 'frame-outer-3' },
	{
		id: 4,
		headerPrefixHtml: [
			'<div class="corner corner-tl"></div>',
			'<div class="corner corner-tr"></div>',
			'<div class="corner corner-bl"></div>',
			'<div class="corner corner-br"></div>'
		]
	},
	{ id: 5, splitTopBottom: true },
	{
		id: 6,
		innerClass: 'inner-box',
		betweenGroupsHtml: '<div class="ornament">&#8226;&#8226;&#8226;</div>'
	},
	{
		id: 7,
		authorTranslatorBandClass: 'dark-band',
		bodyBandClass: 'light-band',
		metaMode: 'meta-bar'
	},
	{
		id: 8,
		authorFirst: true,
		authorClass: 'kicker'
	},
	{
		id: 9,
		authorFirst: true,
		titleBandClass: 'tilted-box'
	},
	{
		id: 10,
		authorFirst: true,
		authorWrapperClass: 'stamp-row',
		authorTag: 'span',
		authorClass: 'stamp',
		originalFormat: 'brackets',
		bottomBandClass: 'dossier-grid'
	},
	{
		id: 11,
		authorFirst: true,
		authorWrapperClass: 'director-tag',
		authorTag: 'span',
		bottomBandClass: 'credit-block'
	},
	{
		id: 12,
		headerPrefixHtml: [
			'<div class="top-bar"></div>',
			'<div class="bot-bar"></div>',
			...createCornerHtml('svg-corner', 'c', CORNER_SCROLL_SVG)
		]
	},
	{
		id: 13,
		headerPrefixHtml: [
			`<div class="vine-tl">${VINE_CORNER_SVG}</div>`,
			`<div class="vine-br">${transformCornerSvg(VINE_CORNER_SVG, 'rotate180')}</div>`,
			'<div class="line-tr"></div>',
			'<div class="line-bl"></div>'
		]
	},
	{
		id: 14,
		headerPrefixHtml: [
			`<div class="leaf-tl">${LEAF_CORNER_SVG}</div>`,
			`<div class="leaf-br">${transformCornerSvg(LEAF_CORNER_SVG, 'rotate180')}</div>`,
			'<div class="parallel-tr"></div>',
			'<div class="parallel-bl"></div>'
		]
	},
	{
		id: 15,
		headerPrefixHtml: createCornerHtml('rose-c', 'r', ROSE_CORNER_SVG)
	},
	{
		id: 16,
		headerPrefixHtml: createCornerHtml('c-orn', 'c', BLOSSOM_CORNER_SVG)
	},
	{
		id: 17,
		headerPrefixHtml: createCornerHtml('c-orn', 'c', PETAL_SCROLL_CORNER_SVG)
	}
];

export const JACKET_TEMPLATES: JacketTemplate[] = JACKET_TEMPLATE_SPECS.map(createJacketTemplate);
