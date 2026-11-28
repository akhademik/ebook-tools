import { describe, it, expect, vi } from 'vitest';
import { EpubState } from '$lib/epub-packer/epub-state.svelte';
import { buildEpubBlob } from '$lib/epub-packer/builders/zip-writer';
import JSZip from 'jszip';

describe('TXT Footnote Parsing and EPUB Packing with Unicode NFC', () => {
	it('should parse TXT footnotes, normalize NFC, resolve backlinks via EpubState, and pack valid EPUB', async () => {
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

		// 1. Process via actual EpubState production pipeline (handles file load, NFC normalize, metadata, backlink mapping)
		const state = new EpubState();
		const fakeFile = new File([rawTxt], 'tuyet-tac.txt', { type: 'text/plain' });
		await state.source.handleFile(fakeFile);

		// 2. Verify state metadata was extracted and normalized to NFC
		expect(state.metadata.title).toBe('Tuyệt Tác Tiếng Việt');
		expect(state.metadata.author).toBe('Nguyễn Du');
		expect(state.jacket.translator).toBe('Nhóm Biên Dịch');

		// 3. Verify chapter splitting and automatic backlink resolution in EpubSourceState
		const chapters = state.source.epubChapters;
		// 4 chapters: header block, chap 1, chap 2, notes
		expect(chapters).toHaveLength(4);

		const chap1 = chapters.find((c) => c.title.includes('Chương 1'));
		expect(chap1).toBeDefined();
		expect(chap1!.fileName).toBe('chap_02');
		expect(chap1!.html).toContain(
			'<a class="noteref" epub:type="noteref" role="doc-noteref" id="fnref1" href="notes.xhtml#fn1"><sup>1</sup></a>'
		);
		expect(chap1!.html).toContain(
			'<a class="noteref" epub:type="noteref" role="doc-noteref" id="fnref2" href="notes.xhtml#fn2"><sup>2</sup></a>'
		);

		const notesChap = chapters.find((c) => c.fileName === 'notes');
		expect(notesChap).toBeDefined();
		// Backlinks must point back to chap_02 without manual regex substitution in test
		expect(notesChap!.html).toContain(
			'<aside epub:type="footnote" role="doc-footnote" id="fn1" class="note">'
		);
		expect(notesChap!.html).toContain(
			'<a class="notenum" role="doc-backlink" href="chap_02.xhtml#fnref1">1.</a>'
		);
		expect(notesChap!.html).toContain('Giải thích chi tiết về từ ngữ cổ trong văn học Tiếng Việt.');
		expect(notesChap!.html).toContain(
			'<aside epub:type="footnote" role="doc-footnote" id="fn2" class="note">'
		);
		expect(notesChap!.html).toContain(
			'<a class="notenum" role="doc-backlink" href="chap_02.xhtml#fnref2">2.</a>'
		);

		// 4. Pack full EPUB into Blob
		const blob = await buildEpubBlob(
			{
				title: state.metadata.title,
				author: state.metadata.author,
				language: state.metadata.lang || 'vi',
				identifier: 'test-footnote-nfc-uuid'
			},
			chapters,
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

	it('should cleanly reset previous metadata when loading a second file in the same session', async () => {
		const state = new EpubState();

		const file1 = new File(
			[
				`Tên sách: Sách Thứ Nhất\nTác giả: Dale Carnegie\nDịch giả: Nguyễn Hiến Lê\nNXB: NXB Trẻ\n\nNội dung...`
			],
			'sach-1.txt',
			{ type: 'text/plain' }
		);
		await state.source.handleFile(file1);
		expect(state.metadata.title).toBe('Sách Thứ Nhất');
		expect(state.metadata.author).toBe('Dale Carnegie');
		expect(state.jacket.translator).toBe('Nguyễn Hiến Lê');
		expect(state.metadata.publisher).toBe('NXB Trẻ');

		// Second file has no author/translator/publisher
		const file2 = new File(
			[`Tên sách: Sách Thứ Hai\n\n@@ Chương 1\nNội dung không có tác giả...`],
			'sach-2.txt',
			{ type: 'text/plain' }
		);
		await state.source.handleFile(file2);
		expect(state.metadata.title).toBe('Sách Thứ Hai');
		expect(state.metadata.author).toBe('');
		expect(state.jacket.translator).toBe('');
		expect(state.metadata.publisher).toBe('');
	});

	it('should stop and report error when footnote numbers repeat across chapters (count !== 2)', async () => {
		const rawTxt = `@@ Chương 1
Lời mở đầu chương 1 có chú thích{1}.

@@ Chương 2
Lời mở đầu chương 2 cũng đánh lại{1}.

Chú thích:
{1} Chú thích của chương 1.
{1} Chú thích của chương 2.`;

		const state = new EpubState();
		const fakeFile = new File([rawTxt], 'repeat-notes.txt', { type: 'text/plain' });
		await state.source.handleFile(fakeFile);

		expect(state.source.parseIsError).toBe(true);
		expect(state.source.epubChapters).toHaveLength(0);
		expect(state.source.parseStatus).toContain("'{1}'");
		expect(state.source.parseStatus).toContain('đúng 2 lần');
	});

	it('should allow Step 1 TXT load with [hinh-1]..[hinh-2], block Step 5 on missing/mismatched images, and succeed when matched', async () => {
		const rawTxt = `@@ Chương 1
[hinh-1]
Đoạn văn thứ nhất.

@@ Chương 2
[hinh-2]
Đoạn văn thứ hai.`;

		const state = new EpubState();
		const fakeFile = new File([rawTxt], 'book-images.txt', { type: 'text/plain' });
		await state.source.handleFile(fakeFile);

		// Step 1 must succeed without <p>[hinh-1]</p>
		expect(state.source.parseIsError).toBe(false);
		expect(state.source.epubChapters).toHaveLength(2);
		expect(state.source.epubChapters[0].html).not.toContain('[hinh-1]');

		// Step 5 must stop and error when images are missing
		await state.processEpub();
		expect(state.isError).toBe(true);
		expect(state.epubBlob).toBeNull();
		expect(state.status).toContain('[hinh-1]');
		expect(state.status).toContain('[hinh-2]');

		// Upload 2 files where 1 mismatches (9/10 or wrong name scenario) -> still stop at Step 5
		const img1 = new File([new Uint8Array([0xff, 0xd8, 0xff])], 'hinh-1.jpg', {
			type: 'image/jpeg'
		});
		const wrongImg = new File([new Uint8Array([0xff, 0xd8, 0xff])], 'anh-2.jpg', {
			type: 'image/jpeg'
		});
		await state.images.handleIllustrationFiles([img1, wrongImg]);
		expect(state.illustrationValidation.isValid).toBe(false);
		expect(state.illustrationValidation.missingTags).toEqual(['hinh-2']);
		expect(state.illustrationValidation.unmatchedFiles).toEqual(['anh-2.jpg']);

		await state.processEpub();
		expect(state.isError).toBe(true);
		expect(state.epubBlob).toBeNull();

		// Fix to exact matching images -> Step 5 succeeds
		state.images.clearIllustrationFiles();
		const img2 = new File([new Uint8Array([0xff, 0xd8, 0xff])], 'hinh-2.png', {
			type: 'image/png'
		});
		await state.images.handleIllustrationFiles([img1, img2]);
		expect(state.illustrationValidation.isValid).toBe(true);
		expect(state.source.epubChapters[0].html).toContain('src="../images/hinh-1.jpg"');
		expect(state.source.epubChapters[1].html).toContain('src="../images/hinh-2.png"');

		vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(new Blob(['font-bytes']))));
		try {
			await state.processEpub();
			expect(state.isError).toBe(false);
			expect(state.epubBlob).not.toBeNull();
		} finally {
			vi.unstubAllGlobals();
		}
	});
});
