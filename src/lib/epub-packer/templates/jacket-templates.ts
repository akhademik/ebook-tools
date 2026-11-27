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

interface JacketTemplateSpec {
	id: number;
	outerClass?: string;
	innerClass?: string;
	prefixHtml?: string[];
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
	authorClass?: 'author' | 'byline' | 'kicker' | 'stamp';
	metaMode?: 'lines' | 'inline-bullet' | 'tags' | 'meta-bar';
}

function renderMetaLines(
	publisher: string,
	distributor: string,
	mode: JacketTemplateSpec['metaMode'],
	indent: string
): string[] {
	const metaParts = [publisher, distributor].filter(Boolean);
	if (metaParts.length === 0) return [];

	if (mode === 'inline-bullet') {
		return [`${indent}<p class="meta">${metaParts.map(escapeXml).join(' &nbsp;•&nbsp; ')}</p>`];
	}

	if (mode === 'tags') {
		return [
			`${indent}<div class="tags">`,
			...metaParts.map((t) => `${indent}  <span class="tag">${escapeXml(t)}</span>`),
			`${indent}</div>`
		];
	}

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

	if (spec.prefixHtml) {
		for (const raw of spec.prefixHtml) {
			lines.push(`${baseIndent}  ${raw}`);
		}
	}

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
		prefixHtml: ['<div class="side"></div>', '<div class="divider"></div>'],
		innerClass: 'content'
	},
	{
		id: 3,
		beforeTitleIfHasTitle: '<hr class="diagonal" />',
		beforeMetaIfHasMeta: '<hr class="diagonal2" />'
	},
	{ id: 4, outerClass: 'frame-outer-4' },
	{
		id: 5,
		headerPrefixHtml: [
			'<div class="corner corner-tl"></div>',
			'<div class="corner corner-tr"></div>',
			'<div class="corner corner-bl"></div>',
			'<div class="corner corner-br"></div>'
		]
	},
	{ id: 6, splitTopBottom: true },
	{
		id: 7,
		headerPrefixHtml: ['<hr class="rule-thick" />', '<hr class="rule-thin" />'],
		authorClass: 'byline',
		metaMode: 'inline-bullet'
	},
	{ id: 8, metaMode: 'tags' },
	{ id: 9 },
	{ id: 10, betweenGroupsHtml: '<div class="diamond"></div>' },
	{
		id: 11,
		innerClass: 'inner-box',
		betweenGroupsHtml: '<div class="ornament">&#8226;&#8226;&#8226;</div>'
	},
	{
		id: 12,
		authorTranslatorBandClass: 'dark-band',
		bodyBandClass: 'light-band',
		metaMode: 'meta-bar'
	},
	{
		id: 13,
		authorFirst: true,
		authorClass: 'kicker'
	},
	{
		id: 14,
		authorFirst: true,
		titleBandClass: 'tilted-box'
	},
	{
		id: 15,
		authorFirst: true,
		authorWrapperClass: 'stamp-row',
		authorTag: 'span',
		authorClass: 'stamp',
		originalFormat: 'brackets',
		bottomBandClass: 'dossier-grid'
	},
	{
		id: 16,
		authorFirst: true,
		authorWrapperClass: 'director-tag',
		authorTag: 'span',
		bottomBandClass: 'credit-block'
	}
];

export const JACKET_TEMPLATES: JacketTemplate[] = JACKET_TEMPLATE_SPECS.map(createJacketTemplate);
