import { describe, it, expect } from 'vitest';
import {
	parseTxtToChapters,
	assignSequentialChapterIds
} from '$lib/epub-packer/parser/epub-source-parser';
import { buildEpubBlob } from '$lib/epub-packer/builders/zip-writer';
import { extractMetadataFromTxt } from '$lib/utils/text';
import JSZip from 'jszip';
import type { EpubChapterItem } from '$lib/types';

describe('TXT Footnote Parsing and EPUB Packing with Unicode NFC', () => {
	it('should parse TXT footnotes, normalize NFC, resolve backlinks, and pack valid EPUB', async () => {
		// NFD decomposed text: "Tiếng Việt" using combining accents
		const nfdText = 'Tiê' + '\u0301' + 'ng Viê' + '\u0323' + 't';
		expect(nfdText.normalize('NFC')).toBe('Tiếng Việt');

		const rawTxt = `Tên sách: Tuyệt Tác ${nfdText}
Tác giả: Nguyễn Du
Dịch giả: Nhóm Biên Dịch

@@ Chương 1: Khởi đầu
Đoạn văn này minh họa việc sử dụng chú thích{1} trong văn bản tiếng Việt.
Đây là câu tiếp theo có chú thích thứ hai{2}.

@@ Chương 2: Tiếp diễn
Nội dung chương 2 tiếp nối mạch truyện.

Chú thích:
{1} Chú thích đầu tiên: Giải thích chi tiết về từ ngữ cổ trong văn học ${nfdText}.
{2} Chú thích thứ hai: Tham khảo tài liệu lịch sử năm 1945.
`;

		// 1. Verify metadata extraction with NFC
		const meta = extractMetadataFromTxt(rawTxt);
		expect(meta.title).toBe('Tuyệt Tác Tiếng Việt');
		expect(meta.author).toBe('Nguyễn Du');
		expect(meta.translator).toBe('Nhóm Biên Dịch');

		// 2. Parse TXT to chapters (with Unicode NFC normalization as done when processing text)
		const normalizedTxt = rawTxt.normalize('NFC');
		const rawChapters = parseTxtToChapters(normalizedTxt, {}, 'Tuyệt Tác Tiếng Việt');
		// 4 chapters: preamble header block, chap 1, chap 2, notes
		expect(rawChapters).toHaveLength(4);

		const sequentialChapters = assignSequentialChapterIds(rawChapters);

		// Resolve footnote backlinks as done in EpubSourceState
		const footnoteMap: Record<string, string> = {};
		for (const chap of sequentialChapters) {
			if (chap.fileName !== 'notes' && chap.html) {
				const matches = chap.html.matchAll(/id="fnref(\d+)"/g);
				for (const match of matches) {
					footnoteMap[match[1]] = chap.fileName;
				}
			}
		}

		// Footnotes {1} and {2} appear in Chapter 1 ("chap_02")
		expect(footnoteMap['1']).toBe('chap_02');
		expect(footnoteMap['2']).toBe('chap_02');

		const notesChap = sequentialChapters.find((c) => c.fileName === 'notes');
		expect(notesChap).toBeDefined();
		if (notesChap && notesChap.html) {
			notesChap.html = notesChap.html.replace(/__FNREF_SRC_(\d+)__/g, (_match, n) => {
				return footnoteMap[n] || 'chap_01';
			});
		}

		// 3. Verify footnote markup in chapters
		const chap1 = sequentialChapters.find((c) => c.title.includes('Chương 1'));
		expect(chap1).toBeDefined();
		expect(chap1!.fileName).toBe('chap_02');
		expect(chap1!.html).toContain(
			'<a class="noteref" epub:type="noteref" id="fnref1" href="notes.xhtml#fn1"><sup>1</sup></a>'
		);
		expect(chap1!.html).toContain(
			'<a class="noteref" epub:type="noteref" id="fnref2" href="notes.xhtml#fn2"><sup>2</sup></a>'
		);

		// Verify notes markup
		expect(notesChap!.html).toContain('<aside epub:type="footnote" id="fn1" class="note">');
		expect(notesChap!.html).toContain('<a class="notenum" href="chap_02.xhtml#fnref1">1.</a>');
		expect(notesChap!.html).toContain('Giải thích chi tiết về từ ngữ cổ');
		expect(notesChap!.html).toContain('<aside epub:type="footnote" id="fn2" class="note">');
		expect(notesChap!.html).toContain('<a class="notenum" href="chap_02.xhtml#fnref2">2.</a>');

		// 4. Pack full EPUB into Blob
		const epubChapters: EpubChapterItem[] = sequentialChapters.map((c, i) => ({
			id: c.id || `chap-${i + 1}`,
			title: c.title,
			html: c.html,
			fileName: c.fileName || `chap_${String(i + 1).padStart(2, '0')}`,
			isChapter: c.isChapter ?? true,
			isNotes: c.isNotes ?? false,
			sources: c.sources || []
		}));

		const blob = await buildEpubBlob(
			{
				title: meta.title || 'Tuyệt Tác Tiếng Việt',
				author: meta.author || 'Nguyễn Du',
				language: 'vi',
				identifier: 'test-footnote-nfc-uuid'
			},
			epubChapters,
			'/* test css */',
			false, // preserveParagraphs
			null, // jacket
			null, // coverBlob
			null, // fonts
			null, // ornaments
			[] // images
		);

		expect(blob).toBeDefined();
		expect(blob.size).toBeGreaterThan(1000);
		expect(blob.type).toBe('application/epub+zip');

		// 5. Unpack and verify contents of EPUB ZIP
		const arrayBuffer = await blob.arrayBuffer();
		const zip = await JSZip.loadAsync(arrayBuffer);

		// mimetype must be present and uncompressed
		const mimetypeFile = zip.file('mimetype');
		expect(mimetypeFile).toBeDefined();
		const mimetypeText = await mimetypeFile!.async('text');
		expect(mimetypeText.trim()).toBe('application/epub+zip');

		// META-INF/container.xml
		const containerXml = await zip.file('META-INF/container.xml')?.async('text');
		expect(containerXml).toContain('full-path="OEBPS/content.opf"');

		// OEBPS/content.opf
		const opf = await zip.file('OEBPS/content.opf')?.async('text');
		expect(opf).toBeDefined();
		expect(opf).toContain('<dc:title>Tuyệt Tác Tiếng Việt</dc:title>');
		expect(opf).toContain('<dc:creator id="creator">Nguyễn Du</dc:creator>');
		expect(opf).toContain('href="text/chap_01.xhtml"');
		expect(opf).toContain('href="text/chap_02.xhtml"');
		expect(opf).toContain('href="text/chap_03.xhtml"');
		expect(opf).toContain('href="text/notes.xhtml"');

		// OEBPS/text/chap_02.xhtml
		const chap2Xhtml = await zip.file('OEBPS/text/chap_02.xhtml')?.async('text');
		expect(chap2Xhtml).toBeDefined();
		expect(chap2Xhtml).toContain('href="notes.xhtml#fn1"');
		expect(chap2Xhtml).toContain('id="fnref1"');

		// OEBPS/text/notes.xhtml
		const notesXhtml = await zip.file('OEBPS/text/notes.xhtml')?.async('text');
		expect(notesXhtml).toBeDefined();
		expect(notesXhtml).toContain('epub:type="footnote"');
		expect(notesXhtml).toContain('id="fn1"');
		expect(notesXhtml).toContain('href="chap_02.xhtml#fnref1"');
		expect(notesXhtml).toContain('Giải thích chi tiết về từ ngữ cổ trong văn học Tiếng Việt.');
	});
});
