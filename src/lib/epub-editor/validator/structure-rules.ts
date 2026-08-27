// src/lib/epub-editor/validator/structure-rules.ts
import { resolveRelativePath } from '$lib/utils';
import type { ValidationRule, ValidationContext } from './types';

/**
 * 1. Structure Check: mimetype and META-INF/container.xml
 */
export const StructureRule: ValidationRule = {
	name: 'Structure & Container Rule',
	category: 'structure',
	async validate(ctx: ValidationContext) {
		const mimetypeFile = ctx.zip.file('mimetype');
		if (!mimetypeFile) {
			ctx.report({
				severity: 'error',
				category: 'structure',
				message: 'Thiếu tệp mimetype ở thư mục gốc của EPUB.',
				suggestion: 'Tạo tệp mimetype với nội dung: application/epub+zip'
			});
		} else {
			const mimeText = (await mimetypeFile.async('text')).trim();
			if (mimeText !== 'application/epub+zip') {
				ctx.report({
					severity: 'error',
					category: 'structure',
					file: 'mimetype',
					message: `Nội dung mimetype không hợp lệ: "${mimeText}". Phải là "application/epub+zip".`
				});
			}
		}

		const containerFile = ctx.zip.file('META-INF/container.xml');
		if (!containerFile) {
			ctx.report({
				severity: 'error',
				category: 'structure',
				message: 'Thiếu tệp META-INF/container.xml.',
				suggestion: 'Thêm tệp container.xml khai báo đường dẫn tới file OPF.'
			});
		} else {
			const containerText = await containerFile.async('text');
			let resolvedOpf: string | null = null;

			if (typeof DOMParser !== 'undefined') {
				try {
					const parser = new DOMParser();
					const doc = parser.parseFromString(containerText, 'application/xml');
					const rootfileEl = doc.querySelector('rootfile');
					if (rootfileEl) {
						resolvedOpf = rootfileEl.getAttribute('full-path');
					}
				} catch {
					// Fallback to regex
				}
			}

			if (!resolvedOpf) {
				const rootfileMatch = /<rootfile\b[^>]*full-path\s*=\s*["']([^"']+)["']/i.exec(
					containerText
				);
				if (rootfileMatch) {
					resolvedOpf = rootfileMatch[1];
				}
			}

			if (resolvedOpf) {
				ctx.opfPath = resolvedOpf;
			} else {
				ctx.report({
					severity: 'error',
					category: 'structure',
					file: 'META-INF/container.xml',
					message: 'Thẻ <rootfile> trong container.xml không chứa thuộc tính full-path hợp lệ.'
				});
			}
		}

		// Fallback to find any .opf file if container.xml didn't resolve
		if (!ctx.opfPath) {
			ctx.opfPath = ctx.allZipFiles.find((p) => p.toLowerCase().endsWith('.opf')) || null;
		}

		if (!ctx.opfPath || !ctx.zip.file(ctx.opfPath)) {
			ctx.report({
				severity: 'error',
				category: 'structure',
				message: 'Không tìm thấy tệp OPF Package Document trong EPUB.'
			});
		}
	}
};

/**
 * 2. OPF Package Document, Manifest & Unique-Identifier Validation
 */
export const OpfPackageRule: ValidationRule = {
	name: 'OPF Package & Manifest Rule',
	category: 'manifest',
	async validate(ctx: ValidationContext) {
		if (!ctx.opfPath || !ctx.zip.file(ctx.opfPath)) return;

		const opfText = await ctx.getText(ctx.opfPath);
		ctx.opfText = opfText;

		// DOM-based parsing of OPF Package Document
		if (typeof DOMParser !== 'undefined') {
			try {
				const parser = new DOMParser();
				ctx.opfDoc = parser.parseFromString(opfText, 'application/xml');
			} catch {
				ctx.opfDoc = null;
			}
		}

		// Check EPUB version
		let version = '2.0';
		let uidAttr: string | null = null;

		if (ctx.opfDoc && !ctx.opfDoc.querySelector('parsererror')) {
			const pkgEl = ctx.opfDoc.querySelector('package');
			if (pkgEl) {
				version = pkgEl.getAttribute('version') || '2.0';
				uidAttr = pkgEl.getAttribute('unique-identifier');
			}
		} else {
			const versionMatch = /<package\b[^>]*version\s*=\s*["']([^"']+)["']/i.exec(opfText);
			if (versionMatch) version = versionMatch[1];
			const uidMatch = /<package\b[^>]*unique-identifier\s*=\s*["']([^"']+)["']/i.exec(opfText);
			if (uidMatch) uidAttr = uidMatch[1];
		}

		ctx.epubVersion = version;
		ctx.uniqueIdentifierId = uidAttr || undefined;

		if (ctx.profile === 'epub3' && !version.startsWith('3.')) {
			ctx.report({
				severity: 'warning',
				category: 'structure',
				file: ctx.opfPath,
				message: `EPUB đang ở phiên bản ${version}, không phải chuẩn EPUB 3.0.`
			});
		}

		// Check unique-identifier
		if (!uidAttr) {
			ctx.report({
				severity: 'warning',
				category: 'manifest',
				file: ctx.opfPath,
				message: 'Thẻ <package> thiếu thuộc tính unique-identifier.'
			});
		} else {
			let foundIdentifier = false;
			if (ctx.opfDoc && !ctx.opfDoc.querySelector('parsererror')) {
				const metadataEl = ctx.opfDoc.querySelector('metadata');
				const allNodes = metadataEl ? Array.from(metadataEl.getElementsByTagName('*')) : [];
				foundIdentifier = allNodes.some(
					(el) =>
						(el.localName === 'identifier' || el.tagName.endsWith(':identifier')) &&
						el.getAttribute('id') === uidAttr
				);
			}

			if (!foundIdentifier) {
				const idRegex = new RegExp(`<dc:identifier\\b[^>]*id\\s*=\\s*["']${uidAttr}["']`, 'i');
				foundIdentifier = idRegex.test(opfText);
			}

			if (!foundIdentifier) {
				ctx.report({
					severity: 'error',
					category: 'manifest',
					file: ctx.opfPath,
					message: `Không tìm thấy thẻ <dc:identifier id="${uidAttr}"> tương ứng với unique-identifier="${uidAttr}".`
				});
			}
		}

		// Extract Manifest Items
		if (ctx.opfDoc && !ctx.opfDoc.querySelector('parsererror')) {
			const itemEls = Array.from(ctx.opfDoc.querySelectorAll('manifest > item, item'));
			for (const el of itemEls) {
				const id = el.getAttribute('id');
				const rawHref = el.getAttribute('href');
				const mediaType = el.getAttribute('media-type') || '';
				const properties = el.getAttribute('properties') || '';

				if (id && rawHref) {
					const resolved = resolveRelativePath(ctx.opfPath, rawHref);
					ctx.manifestMap.set(id, {
						id,
						href: rawHref,
						resolvedPath: resolved,
						mediaType,
						properties
					});

					if (properties.includes('cover-image') || id.toLowerCase() === 'cover-image') {
						ctx.hasCoverImage = true;
					}
					if (properties.includes('nav')) {
						ctx.hasNavDocument = true;
					}
					if (mediaType === 'application/x-dtbncx+xml' || resolved.endsWith('.ncx')) {
						ctx.hasNcx = true;
					}

					if (!ctx.zip.file(resolved)) {
						ctx.report({
							severity: 'error',
							category: 'manifest',
							file: ctx.opfPath,
							message: `Mục manifest id="${id}" trỏ tới tệp không tồn tại: "${resolved}".`
						});
					}
				}
			}

			const metaCoverEl = ctx.opfDoc.querySelector('meta[name="cover"]');
			if (metaCoverEl) {
				ctx.hasCoverMeta = true;
			}
		} else {
			// Fallback regex item parser
			const itemRegex = /<item\b[^>]*>/gi;
			let m: RegExpExecArray | null;

			while ((m = itemRegex.exec(opfText)) !== null) {
				const tag = m[0];
				const idMatch = /id\s*=\s*["']([^"']+)["']/i.exec(tag);
				const hrefMatch = /href\s*=\s*["']([^"']+)["']/i.exec(tag);
				const mediaMatch = /media-type\s*=\s*["']([^"']+)["']/i.exec(tag);
				const propMatch = /properties\s*=\s*["']([^"']+)["']/i.exec(tag);

				if (idMatch && hrefMatch) {
					const id = idMatch[1];
					const rawHref = hrefMatch[1];
					const mediaType = mediaMatch ? mediaMatch[1] : '';
					const properties = propMatch ? propMatch[1] : '';
					const resolved = resolveRelativePath(ctx.opfPath, rawHref);

					ctx.manifestMap.set(id, {
						id,
						href: rawHref,
						resolvedPath: resolved,
						mediaType,
						properties
					});

					if (properties.includes('cover-image') || id.toLowerCase() === 'cover-image') {
						ctx.hasCoverImage = true;
					}
					if (properties.includes('nav')) {
						ctx.hasNavDocument = true;
					}
					if (mediaType === 'application/x-dtbncx+xml' || resolved.endsWith('.ncx')) {
						ctx.hasNcx = true;
					}

					if (!ctx.zip.file(resolved)) {
						ctx.report({
							severity: 'error',
							category: 'manifest',
							file: ctx.opfPath,
							message: `Mục manifest id="${id}" trỏ tới tệp không tồn tại: "${resolved}".`
						});
					}
				}
			}

			if (/<meta\b[^>]*name\s*=\s*["']cover["']/i.test(opfText)) {
				ctx.hasCoverMeta = true;
			}
		}

		// Check for unmanifested files
		const manifestResolvedPaths = new Set(
			Array.from(ctx.manifestMap.values()).map((i) => i.resolvedPath)
		);
		for (const filePath of ctx.allZipFiles) {
			if (filePath === 'mimetype' || filePath.startsWith('META-INF/') || filePath === ctx.opfPath) {
				continue;
			}
			if (!manifestResolvedPaths.has(filePath)) {
				ctx.report({
					severity: 'warning',
					category: 'manifest',
					file: filePath,
					message: `Tệp "${filePath}" có trong EPUB nhưng không được khai báo trong <manifest>.`
				});
			}
		}
	}
};

/**
 * 3. Spine and Reading Order Validation
 */
export const SpineRule: ValidationRule = {
	name: 'Spine & Reading Order Rule',
	category: 'spine',
	async validate(ctx: ValidationContext) {
		if (!ctx.opfPath || !ctx.zip.file(ctx.opfPath)) return;
		const opfText = ctx.opfText || (await ctx.getText(ctx.opfPath));

		if (ctx.opfDoc && !ctx.opfDoc.querySelector('parsererror')) {
			const itemrefEls = Array.from(ctx.opfDoc.querySelectorAll('spine > itemref, itemref'));
			for (const itemref of itemrefEls) {
				const idref = itemref.getAttribute('idref');
				if (idref) {
					ctx.spineIdrefs.push(idref);
					if (!ctx.manifestMap.has(idref)) {
						ctx.report({
							severity: 'error',
							category: 'spine',
							file: ctx.opfPath,
							message: `Thẻ <itemref idref="${idref}"> trong <spine> không tồn tại trong <manifest>.`
						});
					}
				}
			}
		} else {
			const itemrefRegex = /<itemref\b[^>]*idref\s*=\s*["']([^"']+)["'][^>]*>/gi;
			let m: RegExpExecArray | null;
			while ((m = itemrefRegex.exec(opfText)) !== null) {
				const idref = m[1];
				ctx.spineIdrefs.push(idref);
				if (!ctx.manifestMap.has(idref)) {
					ctx.report({
						severity: 'error',
						category: 'spine',
						file: ctx.opfPath,
						message: `Thẻ <itemref idref="${idref}"> trong <spine> không tồn tại trong <manifest>.`
					});
				}
			}
		}

		if (ctx.spineIdrefs.length === 0) {
			ctx.report({
				severity: 'error',
				category: 'spine',
				file: ctx.opfPath,
				message: '<spine> rỗng hoặc không chứa bất kỳ thẻ <itemref> nào.'
			});
		}
	}
};

/**
 * 4. TOC & Navigation Document Validation
 */
export const NavigationRule: ValidationRule = {
	name: 'TOC & Navigation Rule',
	category: 'toc',
	validate(ctx: ValidationContext) {
		if (!ctx.hasNavDocument && !ctx.hasNcx) {
			ctx.report({
				severity: 'error',
				category: 'toc',
				message: 'EPUB không có mục lục TOC (thiếu cả Navigation Document nav.xhtml và toc.ncx).'
			});
		}

		if (ctx.profile === 'epub3' && !ctx.hasNavDocument) {
			ctx.report({
				severity: 'error',
				category: 'toc',
				message: 'EPUB 3 bắt buộc phải có Navigation Document (XHTML với properties="nav").'
			});
		}

		if (ctx.profile === 'kobo') {
			if (!ctx.hasNcx && !ctx.hasNavDocument) {
				ctx.report({
					severity: 'error',
					category: 'kobo',
					message: 'Máy đọc sách Kobo yêu cầu phải có toc.ncx hoặc nav.xhtml để hiển thị mục lục.'
				});
			}

			if (!ctx.hasCoverImage && !ctx.hasCoverMeta) {
				ctx.report({
					severity: 'warning',
					category: 'kobo',
					message:
						'Kobo khuyến nghị khai báo thẻ <meta name="cover" content="..."/> hoặc item properties="cover-image" để hiển thị bìa ở màn hình khóa sleep screen.'
				});
			}
		}
	}
};
