// src/lib/epub-editor/validator/content-rules.ts
import { resolveRelativePath } from '$lib/utils';
import { extractCssUrls, extractHtmlReferences } from '../epub-cleaner';
import { validateHtml, isValidFontMagic } from '../epub-editor';
import type { ValidationRule, ValidationContext } from './types';

/**
 * 5. XHTML Pages, DOM Syntax, Duplicate IDs, and Resource Cross-References
 */
export const XhtmlPagesRule: ValidationRule = {
	name: 'XHTML Pages & Cross-References Rule',
	category: 'xhtml',
	async validate(ctx: ValidationContext) {
		const pageFiles = ctx.allZipFiles.filter((p) => {
			const ext = p.substring(p.lastIndexOf('.')).toLowerCase();
			return ['.xhtml', '.html', '.htm'].includes(ext);
		});

		for (const pagePath of pageFiles) {
			const htmlText = await ctx.getText(pagePath);

			// Syntax validation with DOMParser
			const valRes = validateHtml(htmlText);
			if (!valRes.valid) {
				ctx.report({
					severity: 'error',
					category: 'xhtml',
					file: pagePath,
					message: `Lỗi cú pháp XML/XHTML: ${valRes.error || 'Cú pháp không hợp lệ'}`
				});
			}

			// Duplicate ID check
			const idSet = new Set<string>();
			const idRegex = /\bid\s*=\s*["']([^"']+)["']/gi;
			let im: RegExpExecArray | null;
			while ((im = idRegex.exec(htmlText)) !== null) {
				const id = im[1];
				if (idSet.has(id)) {
					ctx.report({
						severity: 'warning',
						category: 'xhtml',
						file: pagePath,
						message: `Phát hiện trùng lặp thuộc tính id="${id}".`,
						suggestion:
							'Mỗi id trong cùng một trang XHTML phải là duy nhất để tránh lỗi neo liên kết.'
					});
				} else {
					idSet.add(id);
				}
			}

			// Empty body check
			const bodyMatch = /<body\b[^>]*>([\s\S]*?)<\/body>/i.exec(htmlText);
			if (bodyMatch) {
				const textOnly = bodyMatch[1].replace(/<[^>]*>/g, '').trim();
				if (!textOnly && !/<(img|svg|image|audio|video)\b/i.test(bodyMatch[1])) {
					ctx.report({
						severity: 'info',
						category: 'xhtml',
						file: pagePath,
						message: 'Trang này có thẻ body rỗng (không chứa nội dung chữ hoặc hình ảnh).'
					});
				}
			}

			// Extract and verify all references (images, styles, links)
			const refs = extractHtmlReferences(htmlText);

			for (const img of refs.images) {
				const resolved = resolveRelativePath(pagePath, img);
				if (!ctx.zip.file(resolved)) {
					ctx.report({
						severity: 'error',
						category: 'images',
						file: pagePath,
						message: `Ảnh "${img}" (trỏ tới "${resolved}") không tồn tại.`
					});
				}
			}

			for (const css of refs.styles) {
				const resolved = resolveRelativePath(pagePath, css);
				if (!ctx.zip.file(resolved)) {
					ctx.report({
						severity: 'error',
						category: 'xhtml',
						file: pagePath,
						message: `Stylesheet "${css}" (trỏ tới "${resolved}") không tồn tại.`
					});
				}
			}
		}
	}
};

/**
 * 6. CSS & Font Integrity Rule
 */
export const CssAndFontsRule: ValidationRule = {
	name: 'CSS & Fonts Rule',
	category: 'fonts',
	async validate(ctx: ValidationContext) {
		const cssFiles = ctx.allZipFiles.filter((p) => p.toLowerCase().endsWith('.css'));
		for (const cssPath of cssFiles) {
			const cssText = await ctx.getText(cssPath);
			const urls = extractCssUrls(cssText);

			for (const u of urls) {
				const resolved = resolveRelativePath(cssPath, u);
				if (!ctx.zip.file(resolved)) {
					ctx.report({
						severity: 'error',
						category: 'fonts',
						file: cssPath,
						message: `CSS tham chiếu url("${u}") (trỏ tới "${resolved}") không tồn tại.`
					});
				}
			}
		}

		// Font Magic Checks
		const fontFiles = ctx.allZipFiles.filter((p) => {
			const ext = p.substring(p.lastIndexOf('.')).toLowerCase();
			return ['.ttf', '.otf', '.woff', '.woff2'].includes(ext);
		});

		for (const fontPath of fontFiles) {
			const fontEntry = ctx.zip.file(fontPath);
			if (fontEntry) {
				const fontBytes = await fontEntry.async('uint8array');
				if (!isValidFontMagic(fontBytes)) {
					ctx.report({
						severity: 'warning',
						category: 'fonts',
						file: fontPath,
						message: `Font "${fontPath}" không khớp magic bytes chuẩn (có thể đang bị mã hóa obfuscation IDPF/Adobe).`,
						suggestion: 'Sử dụng chức năng Font De-obfuscation hoặc kiểm tra file font gốc.'
					});
				}
			}
		}
	}
};
