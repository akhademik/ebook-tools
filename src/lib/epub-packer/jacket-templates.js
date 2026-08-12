import { escapeXml } from '../helpers/helpers.js';
import introCss from './css-template/intro-css.css?raw';

function getJacketCss(templateId) {
	const regex = new RegExp(`\\/\\*\\s*intro-${templateId}\\s*\\*\\/([\\s\\S]*?)(?:\\/\\*\\s*intro-\\d+\\s*\\*\\/|$)`);
	const match = introCss.match(regex);
	return match ? match[1].trim() : '';
}

const formatTranslator = (t) => {
	if (!t) return '';
	const trimmed = t.trim();
	if (/dịch$/i.test(trimmed)) return trimmed;
	return trimmed + ' dịch';
};

export const JACKET_TEMPLATES = [
	{
		id: 1,
		name: "Mẫu 1 - Bất đối xứng",
		get css() { return getJacketCss(1); },
		render: (title, original, author, translator, publisher, distributor) => {
			let html = '<div class="jacket-1">\n';
			if (title) html += `  <p class="title">${escapeXml(title)}</p>\n`;
			if (original) html += `  <p class="original">Nguyên tác: ${escapeXml(original)}</p>\n`;
			if ((title || original) && (author || translator || publisher || distributor)) {
				html += '  <hr class="rule" />\n';
			}
			if (author) html += `  <p class="author">${escapeXml(author)}</p>\n`;
			if (translator) html += `  <p class="translator">${escapeXml(formatTranslator(translator))}</p>\n`;
			if (publisher) html += `  <p class="meta">${escapeXml(publisher)}</p>\n`;
			if (distributor) html += `  <p class="meta">${escapeXml(distributor)}</p>\n`;
			html += '</div>';
			return html;
		}
	},
	{
		id: 2,
		name: "Mẫu 2 - Cột dọc",
		get css() { return getJacketCss(2); },
		render: (title, original, author, translator, publisher, distributor) => {
			let html = '<div class="jacket-2">\n';
			html += '  <div class="side"></div>\n';
			html += '  <div class="divider"></div>\n';
			html += '  <div class="content">\n';
			if (title) html += `    <p class="title">${escapeXml(title)}</p>\n`;
			if (original) html += `    <p class="original">Nguyên tác: ${escapeXml(original)}</p>\n`;
			if (author) html += `    <p class="author">${escapeXml(author)}</p>\n`;
			if (translator) html += `    <p class="translator">${escapeXml(formatTranslator(translator))}</p>\n`;
			if (publisher) html += `    <p class="meta">${escapeXml(publisher)}</p>\n`;
			if (distributor) html += `    <p class="meta">${escapeXml(distributor)}</p>\n`;
			html += '  </div>\n';
			html += '</div>';
			return html;
		}
	},
	{
		id: 3,
		name: "Mẫu 3 - Đường chéo",
		get css() { return getJacketCss(3); },
		render: (title, original, author, translator, publisher, distributor) => {
			let html = '<div class="jacket-3">\n';
			if (title || original) html += '  <hr class="diagonal" />\n';
			if (title) html += `  <p class="title">${escapeXml(title)}</p>\n`;
			if (original) html += `  <p class="original">Nguyên tác: ${escapeXml(original)}</p>\n`;
			if (author) html += `  <p class="author">${escapeXml(author)}</p>\n`;
			if (translator) html += `  <p class="translator">${escapeXml(formatTranslator(translator))}</p>\n`;
			if (publisher || distributor) html += '  <hr class="diagonal2" />\n';
			if (publisher) html += `  <p class="meta">${escapeXml(publisher)}</p>\n`;
			if (distributor) html += `  <p class="meta">${escapeXml(distributor)}</p>\n`;
			html += '</div>';
			return html;
		}
	},
	{
		id: 4,
		name: "Mẫu 4 - Khung lệch",
		get css() { return getJacketCss(4); },
		render: (title, original, author, translator, publisher, distributor) => {
			let html = '<div class="frame-outer-4">\n';
			html += '  <div class="jacket-4">\n';
			if (title) html += `    <p class="title">${escapeXml(title)}</p>\n`;
			if (original) html += `    <p class="original">Nguyên tác: ${escapeXml(original)}</p>\n`;
			if (author) html += `    <p class="author">${escapeXml(author)}</p>\n`;
			if (translator) html += `    <p class="translator">${escapeXml(formatTranslator(translator))}</p>\n`;
			if (publisher) html += `    <p class="meta">${escapeXml(publisher)}</p>\n`;
			if (distributor) html += `    <p class="meta">${escapeXml(distributor)}</p>\n`;
			html += '  </div>\n';
			html += '</div>';
			return html;
		}
	},
	{
		id: 5,
		name: "Mẫu 5 - Ngoặc góc",
		get css() { return getJacketCss(5); },
		render: (title, original, author, translator, publisher, distributor) => {
			let html = '<div class="jacket-5">\n';
			html += '  <div class="corner corner-tl"></div>\n';
			html += '  <div class="corner corner-tr"></div>\n';
			html += '  <div class="corner corner-bl"></div>\n';
			html += '  <div class="corner corner-br"></div>\n';
			if (title) html += `  <p class="title">${escapeXml(title)}</p>\n`;
			if (original) html += `  <p class="original">Nguyên tác: ${escapeXml(original)}</p>\n`;
			if (author) html += `  <p class="author">${escapeXml(author)}</p>\n`;
			if (translator) html += `  <p class="translator">${escapeXml(formatTranslator(translator))}</p>\n`;
			if (publisher) html += `  <p class="meta">${escapeXml(publisher)}</p>\n`;
			if (distributor) html += `  <p class="meta">${escapeXml(distributor)}</p>\n`;
			html += '</div>';
			return html;
		}
	},
	{
		id: 6,
		name: "Mẫu 6 - Hai cực",
		get css() { return getJacketCss(6); },
		render: (title, original, author, translator, publisher, distributor) => {
			let html = '<div class="jacket-6">\n';
			html += '  <div class="top">\n';
			if (title) html += `    <p class="title">${escapeXml(title)}</p>\n`;
			if (original) html += `    <p class="original">Nguyên tác: ${escapeXml(original)}</p>\n`;
			html += '  </div>\n';
			html += '  <div class="bottom">\n';
			if (author) html += `    <p class="author">${escapeXml(author)}</p>\n`;
			if (translator) html += `    <p class="translator">${escapeXml(formatTranslator(translator))}</p>\n`;
			if (publisher) html += `    <p class="meta">${escapeXml(publisher)}</p>\n`;
			if (distributor) html += `    <p class="meta">${escapeXml(distributor)}</p>\n`;
			html += '  </div>\n';
			html += '</div>';
			return html;
		}
	},
	{
		id: 7,
		name: "Mẫu 7 - Báo chí",
		get css() { return getJacketCss(7); },
		render: (title, original, author, translator, publisher, distributor) => {
			let html = '<div class="jacket-7">\n';
			html += '  <hr class="rule-thick" />\n';
			html += '  <hr class="rule-thin" />\n';
			if (title) html += `  <p class="title">${escapeXml(title)}</p>\n`;
			if (original) html += `  <p class="original">Nguyên tác: ${escapeXml(original)}</p>\n`;
			if (author) html += `  <p class="byline">${escapeXml(author)}</p>\n`;
			if (translator) html += `  <p class="translator">${escapeXml(formatTranslator(translator))}</p>\n`;
			const metaParts = [publisher, distributor].filter(Boolean);
			if (metaParts.length > 0) {
				html += `  <p class="meta">${metaParts.map(escapeXml).join(' &nbsp;•&nbsp; ')}</p>\n`;
			}
			html += '</div>';
			return html;
		}
	},
	{
		id: 8,
		name: "Mẫu 8 - Nhãn dán",
		get css() { return getJacketCss(8); },
		render: (title, original, author, translator, publisher, distributor) => {
			let html = '<div class="jacket-8">\n';
			if (title) html += `  <p class="title">${escapeXml(title)}</p>\n`;
			if (original) html += `  <p class="original">Nguyên tác: ${escapeXml(original)}</p>\n`;
			if (author) html += `  <p class="author">${escapeXml(author)}</p>\n`;
			if (translator) html += `  <p class="translator">${escapeXml(formatTranslator(translator))}</p>\n`;
			const tags = [publisher, distributor].filter(Boolean);
			if (tags.length > 0) {
				html += '  <div class="tags">\n';
				for (const t of tags) {
					html += `    <span class="tag">${escapeXml(t)}</span>\n`;
				}
				html += '  </div>\n';
			}
			html += '</div>';
			return html;
		}
	},
	{
		id: 9,
		name: "Mẫu 9 - Viền chấm",
		get css() { return getJacketCss(9); },
		render: (title, original, author, translator, publisher, distributor) => {
			let html = '<div class="jacket-9">\n';
			if (title) html += `  <p class="title">${escapeXml(title)}</p>\n`;
			if (original) html += `  <p class="original">Nguyên tác: ${escapeXml(original)}</p>\n`;
			if (author) html += `  <p class="author">${escapeXml(author)}</p>\n`;
			if (translator) html += `  <p class="translator">${escapeXml(formatTranslator(translator))}</p>\n`;
			if (publisher) html += `  <p class="meta">${escapeXml(publisher)}</p>\n`;
			if (distributor) html += `  <p class="meta">${escapeXml(distributor)}</p>\n`;
			html += '</div>';
			return html;
		}
	},
	{
		id: 10,
		name: "Mẫu 10 - Đối xứng tỏa tâm",
		get css() { return getJacketCss(10); },
		render: (title, original, author, translator, publisher, distributor) => {
			let html = '<div class="jacket-10b">\n';
			if (title) html += `  <p class="title">${escapeXml(title)}</p>\n`;
			if (original) html += `  <p class="original">Nguyên tác: ${escapeXml(original)}</p>\n`;
			if ((title || original) && (author || translator || publisher || distributor)) {
				html += '  <div class="diamond"></div>\n';
			}
			if (author) html += `  <p class="author">${escapeXml(author)}</p>\n`;
			if (translator) html += `  <p class="translator">${escapeXml(formatTranslator(translator))}</p>\n`;
			if (publisher) html += `  <p class="meta">${escapeXml(publisher)}</p>\n`;
			if (distributor) html += `  <p class="meta">${escapeXml(distributor)}</p>\n`;
			html += '</div>';
			return html;
		}
	}
];
