// src/lib/epub-editor/epub-validator.ts
import type JSZip from 'jszip';
import { resolveRelativePath, validateHtml, isValidFontMagic } from './epub-editor';
import { extractCssUrls, extractHtmlReferences } from './epub-cleaner';

type ValidationSeverity = 'error' | 'warning' | 'info';
type ValidationCategory =
	| 'structure'
	| 'manifest'
	| 'spine'
	| 'toc'
	| 'xhtml'
	| 'fonts'
	| 'images'
	| 'kobo';

export type ValidationProfile = 'generic' | 'epub3' | 'kobo';

interface ValidationIssue {
	severity: ValidationSeverity;
	category: ValidationCategory;
	file?: string;
	message: string;
	suggestion?: string;
}

export interface ValidationResult {
	profile: ValidationProfile;
	passed: boolean;
	errorCount: number;
	warningCount: number;
	infoCount: number;
	issues: ValidationIssue[];
	summary: {
		structure: 'pass' | 'fail' | 'warn';
		manifest: 'pass' | 'fail' | 'warn';
		spine: 'pass' | 'fail' | 'warn';
		toc: 'pass' | 'fail' | 'warn';
		xhtml: 'pass' | 'fail' | 'warn';
		fonts: 'pass' | 'fail' | 'warn';
		cover: 'pass' | 'fail' | 'warn';
	};
}

/**
 * Perform comprehensive EPUB validation against Generic EPUB, EPUB 3, or Kobo profile.
 */
export async function validateEpub(
	zip: JSZip,
	profile: ValidationProfile = 'generic',
	editBuffer?: Map<string, string>
): Promise<ValidationResult> {
	const issues: ValidationIssue[] = [];

	// Helper to get text content
	async function getText(path: string): Promise<string> {
		if (editBuffer && editBuffer.has(path)) {
			return editBuffer.get(path) || '';
		}
		const f = zip.file(path);
		return f ? await f.async('text') : '';
	}

	const allZipFiles = Object.keys(zip.files).filter((p) => !zip.files[p].dir);

	// 1. Structure Check: mimetype & container.xml
	const mimetypeFile = zip.file('mimetype');
	if (!mimetypeFile) {
		issues.push({
			severity: 'error',
			category: 'structure',
			message: 'Thiếu tệp mimetype ở thư mục gốc của EPUB.',
			suggestion: 'Tạo tệp mimetype với nội dung: application/epub+zip'
		});
	} else {
		const mimeText = (await mimetypeFile.async('text')).trim();
		if (mimeText !== 'application/epub+zip') {
			issues.push({
				severity: 'error',
				category: 'structure',
				file: 'mimetype',
				message: `Nội dung mimetype không hợp lệ: "${mimeText}". Phải là "application/epub+zip".`
			});
		}
	}

	const containerFile = zip.file('META-INF/container.xml');
	let opfPath: string | null = null;

	if (!containerFile) {
		issues.push({
			severity: 'error',
			category: 'structure',
			message: 'Thiếu tệp META-INF/container.xml.',
			suggestion: 'Thêm tệp container.xml khai báo đường dẫn tới file OPF.'
		});
	} else {
		const containerText = await containerFile.async('text');
		const rootfileMatch = /<rootfile\b[^>]*full-path\s*=\s*["']([^"']+)["']/i.exec(containerText);
		if (rootfileMatch) {
			opfPath = rootfileMatch[1];
		} else {
			issues.push({
				severity: 'error',
				category: 'structure',
				file: 'META-INF/container.xml',
				message: 'Thẻ <rootfile> trong container.xml không chứa thuộc tính full-path hợp lệ.'
			});
		}
	}

	// Fallback to find any .opf file if container.xml didn't resolve
	if (!opfPath) {
		opfPath = allZipFiles.find((p) => p.toLowerCase().endsWith('.opf')) || null;
	}

	if (!opfPath || !zip.file(opfPath)) {
		issues.push({
			severity: 'error',
			category: 'structure',
			message: 'Không tìm thấy tệp OPF Package Document trong EPUB.'
		});
	}

	const manifestMap = new Map<string, { href: string; resolvedPath: string; mediaType: string; properties?: string }>();
	const spineIdrefs: string[] = [];
	let hasCoverImage = false;
	let hasCoverMeta = false;
	let hasNavDocument = false;
	let hasNcx = false;

	// 2. Parse OPF Package Document
	if (opfPath && zip.file(opfPath)) {
		const opfText = await getText(opfPath);

		// Check EPUB version
		const versionMatch = /<package\b[^>]*version\s*=\s*["']([^"']+)["']/i.exec(opfText);
		const epubVersion = versionMatch ? versionMatch[1] : '2.0';

		if (profile === 'epub3' && !epubVersion.startsWith('3.')) {
			issues.push({
				severity: 'warning',
				category: 'structure',
				file: opfPath,
				message: `EPUB đang ở phiên bản ${epubVersion}, không phải chuẩn EPUB 3.0.`
			});
		}

		// Check unique-identifier
		const uniqueIdAttr = /<package\b[^>]*unique-identifier\s*=\s*["']([^"']+)["']/i.exec(opfText);
		if (!uniqueIdAttr) {
			issues.push({
				severity: 'warning',
				category: 'manifest',
				file: opfPath,
				message: 'Thẻ <package> thiếu thuộc tính unique-identifier.'
			});
		} else {
			const targetId = uniqueIdAttr[1];
			const idRegex = new RegExp(`<dc:identifier\\b[^>]*id\\s*=\\s*["']${targetId}["']`, 'i');
			if (!idRegex.test(opfText)) {
				issues.push({
					severity: 'error',
					category: 'manifest',
					file: opfPath,
					message: `Không tìm thấy thẻ <dc:identifier id="${targetId}"> tương ứng với unique-identifier="${targetId}".`
				});
			}
		}

		// Parse Manifest items
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
				const resolved = resolveRelativePath(opfPath, rawHref);

				manifestMap.set(id, {
					href: rawHref,
					resolvedPath: resolved,
					mediaType,
					properties
				});

				if (properties.includes('cover-image') || id.toLowerCase() === 'cover-image') {
					hasCoverImage = true;
				}
				if (properties.includes('nav')) {
					hasNavDocument = true;
				}
				if (mediaType === 'application/x-dtbncx+xml' || resolved.endsWith('.ncx')) {
					hasNcx = true;
				}

				// Check if file declared in manifest physically exists
				if (!zip.file(resolved)) {
					issues.push({
						severity: 'error',
						category: 'manifest',
						file: opfPath,
						message: `Mục manifest id="${id}" trỏ tới tệp không tồn tại: "${resolved}".`
					});
				}
			}
		}

		// Check meta name="cover"
		if (/<meta\b[^>]*name\s*=\s*["']cover["']/i.test(opfText)) {
			hasCoverMeta = true;
		}

		// Parse Spine
		const itemrefRegex = /<itemref\b[^>]*idref\s*=\s*["']([^"']+)["'][^>]*>/gi;
		while ((m = itemrefRegex.exec(opfText)) !== null) {
			const idref = m[1];
			spineIdrefs.push(idref);

			if (!manifestMap.has(idref)) {
				issues.push({
					severity: 'error',
					category: 'spine',
					file: opfPath,
					message: `Thẻ <itemref idref="${idref}"> trong <spine> không tồn tại trong <manifest>.`
				});
			}
		}

		if (spineIdrefs.length === 0) {
			issues.push({
				severity: 'error',
				category: 'spine',
				file: opfPath,
				message: '<spine> rỗng hoặc không chứa bất kỳ thẻ <itemref> nào.'
			});
		}

		// Check for unmanifested files
		const manifestResolvedPaths = new Set(Array.from(manifestMap.values()).map((i) => i.resolvedPath));
		for (const filePath of allZipFiles) {
			if (
				filePath === 'mimetype' ||
				filePath.startsWith('META-INF/') ||
				filePath === opfPath
			) {
				continue;
			}
			if (!manifestResolvedPaths.has(filePath)) {
				issues.push({
					severity: 'warning',
					category: 'manifest',
					file: filePath,
					message: `Tệp "${filePath}" có trong EPUB nhưng không được khai báo trong <manifest>.`
				});
			}
		}
	}

	// 3. TOC & Navigation Checks
	if (!hasNavDocument && !hasNcx) {
		issues.push({
			severity: 'error',
			category: 'toc',
			message: 'EPUB không có mục lục TOC (thiếu cả Navigation Document nav.xhtml và toc.ncx).'
		});
	}

	if (profile === 'epub3' && !hasNavDocument) {
		issues.push({
			severity: 'error',
			category: 'toc',
			message: 'EPUB 3 bắt buộc phải có Navigation Document (XHTML với properties="nav").'
		});
	}

	if (profile === 'kobo') {
		if (!hasNcx && !hasNavDocument) {
			issues.push({
				severity: 'error',
				category: 'kobo',
				message: 'Máy đọc sách Kobo yêu cầu phải có toc.ncx hoặc nav.xhtml để hiển thị mục lục.'
			});
		}

		// Kobo Cover Best Practice
		if (!hasCoverImage && !hasCoverMeta) {
			issues.push({
				severity: 'warning',
				category: 'kobo',
				message: 'Kobo khuyến nghị khai báo thẻ <meta name="cover" content="..."/> hoặc item properties="cover-image" để hiển thị bìa ở màn hình khóa sleep screen.'
			});
		}
	}

	// 4. XHTML Page Checks & ID Duplicate Checks
	const pageFiles = allZipFiles.filter((p) => {
		const ext = p.substring(p.lastIndexOf('.')).toLowerCase();
		return ['.xhtml', '.html', '.htm'].includes(ext);
	});

	for (const pagePath of pageFiles) {
		const htmlText = await getText(pagePath);

		// Syntax validation with DOMParser
		const valRes = validateHtml(htmlText);
		if (!valRes.valid) {
			issues.push({
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
				issues.push({
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
				issues.push({
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
			if (!zip.file(resolved)) {
				issues.push({
					severity: 'error',
					category: 'images',
					file: pagePath,
					message: `Ảnh "${img}" (trỏ tới "${resolved}") không tồn tại.`
				});
			}
		}

		for (const css of refs.styles) {
			const resolved = resolveRelativePath(pagePath, css);
			if (!zip.file(resolved)) {
				issues.push({
					severity: 'error',
					category: 'xhtml',
					file: pagePath,
					message: `Stylesheet "${css}" (trỏ tới "${resolved}") không tồn tại.`
				});
			}
		}
	}

	// 5. CSS and Fonts validation
	const cssFiles = allZipFiles.filter((p) => p.toLowerCase().endsWith('.css'));
	for (const cssPath of cssFiles) {
		const cssText = await getText(cssPath);
		const urls = extractCssUrls(cssText);

		for (const u of urls) {
			const resolved = resolveRelativePath(cssPath, u);
			if (!zip.file(resolved)) {
				issues.push({
					severity: 'error',
					category: 'fonts',
					file: cssPath,
					message: `CSS tham chiếu url("${u}") (trỏ tới "${resolved}") không tồn tại.`
				});
			}
		}
	}

	// Font Magic Checks
	const fontFiles = allZipFiles.filter((p) => {
		const ext = p.substring(p.lastIndexOf('.')).toLowerCase();
		return ['.ttf', '.otf', '.woff', '.woff2'].includes(ext);
	});

	for (const fontPath of fontFiles) {
		const fontEntry = zip.file(fontPath);
		if (fontEntry) {
			const fontBytes = await fontEntry.async('uint8array');
			if (!isValidFontMagic(fontBytes)) {
				issues.push({
					severity: 'warning',
					category: 'fonts',
					file: fontPath,
					message: `Font "${fontPath}" không khớp magic bytes chuẩn (có thể đang bị mã hóa obfuscation IDPF/Adobe).`,
					suggestion: 'Sử dụng chức năng Font De-obfuscation hoặc kiểm tra file font gốc.'
				});
			}
		}
	}

	// Summary computation
	const errorCount = issues.filter((i) => i.severity === 'error').length;
	const warningCount = issues.filter((i) => i.severity === 'warning').length;
	const infoCount = issues.filter((i) => i.severity === 'info').length;

	function getStatus(cat: ValidationCategory): 'pass' | 'fail' | 'warn' {
		const catIssues = issues.filter((i) => i.category === cat);
		if (catIssues.some((i) => i.severity === 'error')) return 'fail';
		if (catIssues.some((i) => i.severity === 'warning')) return 'warn';
		return 'pass';
	}

	const summary = {
		structure: getStatus('structure'),
		manifest: getStatus('manifest'),
		spine: getStatus('spine'),
		toc: getStatus('toc'),
		xhtml: getStatus('xhtml'),
		fonts: getStatus('fonts'),
		cover: hasCoverImage || hasCoverMeta ? ('pass' as const) : ('warn' as const)
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
