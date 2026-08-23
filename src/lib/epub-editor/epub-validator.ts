// src/lib/epub-editor/epub-validator.ts
import type JSZip from 'jszip';
import { resolveRelativePath, validateHtml, isValidFontMagic } from './epub-editor';
import { extractCssUrls, extractHtmlReferences } from './epub-cleaner';

export type ValidationSeverity = 'error' | 'warning' | 'info';
export type ValidationCategory =
	| 'structure'
	| 'manifest'
	| 'spine'
	| 'toc'
	| 'xhtml'
	| 'fonts'
	| 'images'
	| 'kobo';

export type ValidationProfile = 'generic' | 'epub3' | 'kobo';

export interface ValidationIssue {
	severity: ValidationSeverity;
	category: ValidationCategory;
	file?: string;
	message: string;
	suggestion?: string;
}

export interface ValidationSummary {
	structure: 'pass' | 'fail' | 'warn';
	manifest: 'pass' | 'fail' | 'warn';
	spine: 'pass' | 'fail' | 'warn';
	toc: 'pass' | 'fail' | 'warn';
	xhtml: 'pass' | 'fail' | 'warn';
	fonts: 'pass' | 'fail' | 'warn';
	cover: 'pass' | 'fail' | 'warn';
}

export interface ValidationResult {
	profile: ValidationProfile;
	passed: boolean;
	errorCount: number;
	warningCount: number;
	infoCount: number;
	issues: ValidationIssue[];
	summary: ValidationSummary;
}

export interface ManifestItemInfo {
	id: string;
	href: string;
	resolvedPath: string;
	mediaType: string;
	properties?: string;
}

export interface ValidationContext {
	zip: JSZip;
	profile: ValidationProfile;
	editBuffer?: Map<string, string>;
	allZipFiles: string[];
	getText: (path: string) => Promise<string>;

	// Structure & OPF state
	opfPath: string | null;
	opfText?: string;
	opfDoc?: Document | null;
	epubVersion: string;
	uniqueIdentifierId?: string;

	// Domain indexes
	manifestMap: Map<string, ManifestItemInfo>;
	spineIdrefs: string[];
	hasCoverImage: boolean;
	hasCoverMeta: boolean;
	hasNavDocument: boolean;
	hasNcx: boolean;

	report: (issue: ValidationIssue) => void;
	issues: ValidationIssue[];
}

export interface ValidationRule {
	name: string;
	category: ValidationCategory;
	validate: (ctx: ValidationContext) => Promise<void> | void;
}

/**
 * 1. Structure Check: mimetype and META-INF/container.xml
 */
const StructureRule: ValidationRule = {
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
				const rootfileMatch = /<rootfile\b[^>]*full-path\s*=\s*["']([^"']+)["']/i.exec(containerText);
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
const OpfPackageRule: ValidationRule = {
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
		const manifestResolvedPaths = new Set(Array.from(ctx.manifestMap.values()).map((i) => i.resolvedPath));
		for (const filePath of ctx.allZipFiles) {
			if (
				filePath === 'mimetype' ||
				filePath.startsWith('META-INF/') ||
				filePath === ctx.opfPath
			) {
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
const SpineRule: ValidationRule = {
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
const NavigationRule: ValidationRule = {
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

/**
 * 5. XHTML Pages, DOM Syntax, Duplicate IDs, and Resource Cross-References
 */
const XhtmlPagesRule: ValidationRule = {
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
						suggestion: 'Mỗi id trong cùng một trang XHTML phải là duy nhất để tránh lỗi neo liên kết.'
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
const CssAndFontsRule: ValidationRule = {
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

export const DEFAULT_VALIDATION_RULES: ValidationRule[] = [
	StructureRule,
	OpfPackageRule,
	SpineRule,
	NavigationRule,
	XhtmlPagesRule,
	CssAndFontsRule
];

/**
 * Perform comprehensive EPUB validation against Generic EPUB, EPUB 3, or Kobo profile.
 */
export async function validateEpub(
	zip: JSZip,
	profile: ValidationProfile = 'generic',
	editBuffer?: Map<string, string>,
	customRules?: ValidationRule[]
): Promise<ValidationResult> {
	const issues: ValidationIssue[] = [];
	const allZipFiles = Object.keys(zip.files).filter((p) => !zip.files[p].dir);

	async function getText(path: string): Promise<string> {
		if (editBuffer && editBuffer.has(path)) {
			return editBuffer.get(path) || '';
		}
		const f = zip.file(path);
		return f ? await f.async('text') : '';
	}

	const ctx: ValidationContext = {
		zip,
		profile,
		editBuffer,
		allZipFiles,
		getText,
		opfPath: null,
		epubVersion: '2.0',
		manifestMap: new Map(),
		spineIdrefs: [],
		hasCoverImage: false,
		hasCoverMeta: false,
		hasNavDocument: false,
		hasNcx: false,
		report(issue: ValidationIssue) {
			issues.push(issue);
		},
		issues
	};

	const rulesToRun = customRules || DEFAULT_VALIDATION_RULES;
	for (const rule of rulesToRun) {
		await rule.validate(ctx);
	}

	const errorCount = issues.filter((i) => i.severity === 'error').length;
	const warningCount = issues.filter((i) => i.severity === 'warning').length;
	const infoCount = issues.filter((i) => i.severity === 'info').length;

	function getStatus(cat: ValidationCategory): 'pass' | 'fail' | 'warn' {
		const catIssues = issues.filter((i) => i.category === cat);
		if (catIssues.some((i) => i.severity === 'error')) return 'fail';
		if (catIssues.some((i) => i.severity === 'warning')) return 'warn';
		return 'pass';
	}

	const summary: ValidationSummary = {
		structure: getStatus('structure'),
		manifest: getStatus('manifest'),
		spine: getStatus('spine'),
		toc: getStatus('toc'),
		xhtml: getStatus('xhtml'),
		fonts: getStatus('fonts'),
		cover: ctx.hasCoverImage || ctx.hasCoverMeta ? 'pass' : 'warn'
	};

	return {
		profile,
		passed: errorCount === 0,
		errorCount,
		warningCount,
		infoCount,
		issues,
		summary
	};
}

