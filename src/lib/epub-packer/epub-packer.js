import JSZip from 'jszip';
import { escapeXml } from '$lib/helpers/helpers.js';

export const EPUB_CSS = `@page {
    margin-top: 0; 
  }

  body {
    font-family: "Bookerly", serif;
    margin-top: 0 !important; 
    padding-top: 0 !important;
  }

  p {
    display: block;
    text-align: justify;
    line-height: 1.4;
    text-indent: 1.25em;
    padding-top: 0.5em;
    margin: 0;
  }

  p.sbreak {
    text-indent: 0;
    text-align: center;
    margin: 1.3em 0;
    letter-spacing: 0.2em;
    opacity: 0.65;
    page-break-inside: avoid;
  }

  a {
    text-decoration: none;
    font-size: 0.6em;
    vertical-align: super;
  }

  aside.footnote {
    display: block;
    color: green; 
    padding-bottom: 0.5em;
  }

  div#book-columns aside.footnote { 	
      display: none; 	
  }

  p:last-of-type {
    margin-bottom: 2.5em; 
  }

  h1 {
    margin-top: 1em !important;
    padding-top: 0 !important; 
    line-height: 1.2; 
    text-align: center;
    margin-bottom: 1em;
    font-size: 1.25em;
    font-weight: bold;
  }

  h2 {
    margin-top: 0 !important;
    padding-top: 0 !important; 
    line-height: 1.1; 
    text-align: center;
    margin-bottom: 0.5em;
    font-size: 1.05em;
  }
  h2 span.ch-num {  
    display: inline-block;
    font-size: 0.35em;
    letter-spacing: 0.1em;
    opacity: 0.6;
    text-transform: uppercase;
    padding-bottom: 0.4em;
    border-bottom: 1px solid currentColor;
  }
  h2 span.sep {
    display: none;
  }
  h2 span.ch-title {
    display: block;
    font-size: 1.05em;
    text-transform: capitalize;
  }`;

export function buildContainerXml() {
	return '<?xml version="1.0" encoding="UTF-8"?>\n' +
		'<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">\n' +
		'  <rootfiles>\n' +
		'    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>\n' +
		'  </rootfiles>\n' +
		'</container>';
}

export function buildContentOpf(meta, chapters) {
	const modified = new Date().toISOString().replace(/\.\d+Z$/, 'Z');
	const manifestItems = [
		'<item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>',
		'<item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>',
		'<item id="css" href="styles/style.css" media-type="text/css"/>'
	];
	for (const c of chapters) {
		manifestItems.push('<item id="' + c.xmlId + '" href="text/' + c.fileName + '.xhtml" media-type="application/xhtml+xml"/>');
	}
	const spineItems = chapters.map(c => '<itemref idref="' + c.xmlId + '"/>');

	return '<?xml version="1.0" encoding="UTF-8"?>\n' +
		'<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="BookId" xml:lang="' + meta.language + '">\n' +
		'  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">\n' +
		'    <dc:identifier id="BookId">' + escapeXml(meta.identifier) + '</dc:identifier>\n' +
		'    <dc:title>' + escapeXml(meta.title) + '</dc:title>\n' +
		'    <dc:language>' + meta.language + '</dc:language>\n' +
		'    <dc:creator id="creator">' + escapeXml(meta.author) + '</dc:creator>\n' +
		(meta.publisher ? '    <dc:publisher>' + escapeXml(meta.publisher) + '</dc:publisher>\n' : '') +
		'    <meta property="dcterms:modified">' + modified + '</meta>\n' +
		'  </metadata>\n' +
		'  <manifest>\n    ' + manifestItems.join('\n    ') + '\n  </manifest>\n' +
		'  <spine toc="ncx">\n    ' + spineItems.join('\n    ') + '\n  </spine>\n' +
		'</package>';
}

export function buildNavXhtml(meta, chapters) {
	const items = chapters.map(c => '<li><a href="text/' + c.fileName + '.xhtml">' + escapeXml(c.title) + '</a></li>').join('\n      ');
	return '<?xml version="1.0" encoding="UTF-8"?>\n<!DOCTYPE html>\n' +
		'<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="' + meta.language + '">\n' +
		'<head>\n  <meta charset="utf-8"/>\n  <title>Mục lục</title>\n  <link rel="stylesheet" type="text/css" href="styles/style.css"/>\n</head>\n' +
		'<body>\n  <nav epub:type="toc" id="toc">\n    <h1>Mục lục</h1>\n    <ol>\n      ' + items + '\n    </ol>\n  </nav>\n</body>\n</html>';
}

export function buildTocNcx(meta, chapters) {
	const navPoints = chapters.map((c, i) =>
		'<navPoint id="navPoint-' + (i + 1) + '" playOrder="' + (i + 1) + '">\n' +
		'      <navLabel><text>' + escapeXml(c.title) + '</text></navLabel>\n' +
		'      <content src="text/' + c.fileName + '.xhtml"/>\n    </navPoint>'
	).join('\n    ');
	return '<?xml version="1.0" encoding="UTF-8"?>\n' +
		'<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">\n' +
		'  <head>\n' +
		'    <meta name="dtb:uid" content="' + escapeXml(meta.identifier) + '"/>\n' +
		'    <meta name="dtb:depth" content="1"/>\n' +
		'    <meta name="dtb:totalPageCount" content="0"/>\n' +
		'    <meta name="dtb:maxPageNumber" content="0"/>\n' +
		'  </head>\n' +
		'  <docTitle><text>' + escapeXml(meta.title) + '</text></docTitle>\n' +
		'  <navMap>\n    ' + navPoints + '\n  </navMap>\n' +
		'</ncx>';
}

export function mergeBrokenParagraphs(html) {
	let result = html;
	let changed = true;
	while (changed) {
		changed = false;
		result = result.replace(/<p>([\s\S]*?)<\/p>\s*\n?<p>([\s\S]*?)<\/p>/g, (match, c1, c2) => {
			const plain = c1.replace(/<[^>]+>/g, '').trim();
			const plain2 = c2.replace(/<[^>]+>/g, '').trim();
			if (!plain || !plain2) return match;
			const endsSentence = /[.!?…]/.test(plain.slice(-1));
			const startsLower = /\p{Ll}/u.test(plain2.slice(0, 1));
			if (!endsSentence && startsLower) {
				changed = true;
				return '<p>' + c1.trim() + ' ' + c2.trim() + '</p>';
			}
			return match;
		});
	}
	return result;
}

export function buildChapterXhtml(meta, chapter, skipParagraphMerge = false) {
	const content = skipParagraphMerge ? chapter.html : mergeBrokenParagraphs(chapter.html);
	return '<?xml version="1.0" encoding="UTF-8"?>\n<!DOCTYPE html>\n' +
		'<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="' + meta.language + '">\n' +
		'<head>\n  <meta charset="utf-8"/>\n  <title>' + escapeXml(chapter.title) + '</title>\n' +
		'  <link rel="stylesheet" type="text/css" href="../styles/style.css"/>\n</head>\n' +
		'<body>\n' + content + '\n</body>\n</html>';
}

export async function buildEpubBlob(metadata, chapters, css, skipParagraphMerge = false) {
	console.log('[buildEpubBlob] Called with metadata:', metadata, 'chapters count:', chapters.length, 'skipParagraphMerge:', skipParagraphMerge);
	const meta = {
		title: metadata.title || 'Không tên',
		author: metadata.author || 'Không rõ tác giả',
		language: metadata.language || 'vi',
		identifier: metadata.identifier || ('urn:uuid:' + (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : ('id-' + Date.now() + '-' + Math.random().toString(16).slice(2)))),
		publisher: metadata.publisher || ''
	};
	if (!chapters.length) {
		console.error('[buildEpubBlob] Error: chapters array is empty!');
		throw new Error('Không có chương nào để đóng gói.');
	}

	const zip = new JSZip();
	zip.file('mimetype', 'application/epub+zip', { compression: 'STORE' });

	const metaInf = zip.folder('META-INF');
	metaInf.file('container.xml', buildContainerXml());

	const oebps = zip.folder('OEBPS');
	oebps.file('content.opf', buildContentOpf(meta, chapters));
	oebps.file('nav.xhtml', buildNavXhtml(meta, chapters));
	oebps.file('toc.ncx', buildTocNcx(meta, chapters));

	oebps.folder('styles').file('style.css', css);

	const textFolder = oebps.folder('text');
	for (let i = 0; i < chapters.length; i++) {
		const chapter = chapters[i];
		const xhtmlContent = buildChapterXhtml(meta, chapter, skipParagraphMerge);
		textFolder.file(chapter.fileName + '.xhtml', xhtmlContent);
	}

	console.log('[buildEpubBlob] All chapters added to zip, generating blob with JSZip...');
	const blob = await zip.generateAsync({
		type: 'blob',
		mimeType: 'application/epub+zip',
		compression: 'DEFLATE',
		compressionOptions: { level: 9 }
	});
	console.log('[buildEpubBlob] Blob generated successfully, size:', blob.size, 'type:', blob.type);
	return blob;
}


