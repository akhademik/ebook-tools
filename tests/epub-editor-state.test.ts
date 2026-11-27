import { describe, it, expect, vi, afterEach } from 'vitest';
import JSZip from 'jszip';
import { EpubEditorState } from '$lib/epub-editor/epub-editor-state.svelte';
import * as utils from '$lib/utils';
import * as cleanerModule from '$lib/epub-editor/epub-cleaner';

function createDeferred<T>() {
	let resolve!: (value: T) => void;
	let reject!: (reason?: unknown) => void;
	const promise = new Promise<T>((res, rej) => {
		resolve = res;
		reject = rej;
	});
	return { promise, resolve, reject };
}

async function createEpubFile(
	name: string,
	chapterPath: string,
	chapterTitle: string,
	chapterBody: string
): Promise<File> {
	const zip = new JSZip();
	zip.file('mimetype', 'application/epub+zip', { compression: 'STORE' });
	zip.file(
		'META-INF/container.xml',
		'<?xml version="1.0"?><container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles></container>'
	);
	zip.file(
		'OEBPS/content.opf',
		`<?xml version="1.0" encoding="utf-8"?><package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="uid"><metadata xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:title>${chapterTitle}</dc:title><dc:identifier id="uid">urn:uuid:${name}</dc:identifier></metadata><manifest><item id="ch1" href="${chapterPath.replace(/^OEBPS\//, '')}" media-type="application/xhtml+xml"/></manifest><spine><itemref idref="ch1"/></spine></package>`
	);
	zip.file(
		chapterPath,
		`<?xml version="1.0" encoding="utf-8"?><html xmlns="http://www.w3.org/1999/xhtml"><head><title>${chapterTitle}</title></head><body><h1>${chapterTitle}</h1><p>${chapterBody}</p></body></html>`
	);

	const bytes = await zip.generateAsync({ type: 'uint8array', compression: 'DEFLATE' });
	return new File([bytes as unknown as BlobPart], name, { type: 'application/epub+zip' });
}

describe('EpubEditorState race condition protections', () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('should preserve file B state when file A completes after file B', async () => {
		const fileA = await createEpubFile(
			'book-a.epub',
			'OEBPS/chapA.xhtml',
			'Book A Title',
			'Content from Book A'
		);
		const fileB = await createEpubFile(
			'book-b.epub',
			'OEBPS/chapB.xhtml',
			'Book B Title',
			'Content from Book B'
		);

		const origLoadSafe = utils.loadSafeEpubZip;
		const zipA = await origLoadSafe(fileA);
		const zipB = await origLoadSafe(fileB);

		const deferredA = createDeferred<JSZip>();
		const deferredB = createDeferred<JSZip>();

		vi.spyOn(utils, 'loadSafeEpubZip').mockImplementation(async (input) => {
			if (input === fileA) return deferredA.promise;
			return deferredB.promise;
		});

		const state = new EpubEditorState();
		const loadA = state.loadEpubFile(fileA);
		const loadB = state.loadEpubFile(fileB);

		// File B finishes first
		deferredB.resolve(zipB);
		await loadB;

		expect(state.fileName).toBe('book-b.epub');
		expect(state.zip).toBe(zipB);
		expect(state.editorTarget).toBe('OEBPS/chapB.xhtml');
		expect(state.previewSrcDoc).toContain('Content from Book B');
		expect(state.isLoading).toBe(false);

		// File A finishes late
		deferredA.resolve(zipA);
		await loadA;

		// Entire state must still belong to Book B
		expect(state.fileName).toBe('book-b.epub');
		expect(state.zip).toBe(zipB);
		expect(state.editorTarget).toBe('OEBPS/chapB.xhtml');
		expect(state.previewTarget).toBe('OEBPS/chapB.xhtml');
		expect(state.editBuffer.has('OEBPS/chapA.xhtml')).toBe(false);
		expect(state.originalContents.has('OEBPS/chapA.xhtml')).toBe(false);
		expect(state.previewSrcDoc).toContain('Content from Book B');
		expect(state.previewSrcDoc).not.toContain('Content from Book A');
		expect(state.statusMessage).toBe('Đã tải thành công book-b.epub');
		expect(state.isError).toBe(false);
		expect(state.isLoading).toBe(false);
	});

	it('should not clear isLoading of newer load B when older load A rejects or completes', async () => {
		const fileA = await createEpubFile('a.epub', 'OEBPS/a.xhtml', 'A', 'Body A');
		const fileB = await createEpubFile('b.epub', 'OEBPS/b.xhtml', 'B', 'Body B');

		const deferredA = createDeferred<JSZip>();
		const deferredB = createDeferred<JSZip>();
		const zipB = await utils.loadSafeEpubZip(fileB);

		vi.spyOn(utils, 'loadSafeEpubZip').mockImplementation(async (input) => {
			if (input === fileA) return deferredA.promise;
			return deferredB.promise;
		});

		const state = new EpubEditorState();
		const loadA = state.loadEpubFile(fileA);
		const loadB = state.loadEpubFile(fileB);

		expect(state.isLoading).toBe(true);

		// Older load A fails while B is still loading
		deferredA.reject(new Error('Corrupt A'));
		await loadA;

		expect(state.isLoading).toBe(true);
		expect(state.isError).toBe(false);
		expect(state.fileName).toBe('b.epub');

		// Now B finishes
		deferredB.resolve(zipB);
		await loadB;

		expect(state.isLoading).toBe(false);
		expect(state.isError).toBe(false);
		expect(state.editorTarget).toBe('OEBPS/b.xhtml');
		expect(state.statusMessage).toBe('Đã tải thành công b.epub');
	});

	it('should ignore stale load result when reset() is called mid-load', async () => {
		const fileA = await createEpubFile('a.epub', 'OEBPS/a.xhtml', 'A', 'Body A');
		const zipA = await utils.loadSafeEpubZip(fileA);
		const deferredA = createDeferred<JSZip>();

		vi.spyOn(utils, 'loadSafeEpubZip').mockImplementationOnce(async () => deferredA.promise);

		const state = new EpubEditorState();
		const loadA = state.loadEpubFile(fileA);

		// User resets while A is still decompressing
		state.reset();
		expect(state.isLoading).toBe(false);
		expect(state.zip).toBeNull();

		deferredA.resolve(zipA);
		await loadA;

		expect(state.zip).toBeNull();
		expect(state.files).toEqual([]);
		expect(state.editorTarget).toBeNull();
		expect(state.previewTarget).toBeNull();
		expect(state.editBuffer.size).toBe(0);
		expect(state.statusMessage).toBe('');
		expect(state.isLoading).toBe(false);
	});

	it('should prevent slow ensureFileLoaded() and selectFile() from overwriting newer book or selection', async () => {
		const state = new EpubEditorState();
		const zipA = new JSZip();
		zipA.file('OEBPS/shared.xhtml', '<p>Old Book Content</p>');
		zipA.file('OEBPS/ch1.xhtml', '<p>Chap 1</p>');
		zipA.file('OEBPS/ch2.xhtml', '<p>Chap 2</p>');
		state.zip = zipA;

		const deferredOldRead = createDeferred<string | null>();
		const origRead = utils.readSafeZipEntryText;

		vi.spyOn(utils, 'readSafeZipEntryText').mockImplementation(async (zip, path, opts) => {
			if (zip === zipA && path === 'OEBPS/shared.xhtml') {
				return deferredOldRead.promise;
			}
			return origRead(zip, path, opts);
		});

		const pendingOldEnsure = state.ensureFileLoaded('OEBPS/shared.xhtml');

		// Switch to a new book via reset() before old read resolves
		state.reset();
		const zipB = new JSZip();
		zipB.file('OEBPS/shared.xhtml', '<p>New Book Content</p>');
		state.zip = zipB;

		deferredOldRead.resolve('<p>Old Book Content</p>');
		const oldRes = await pendingOldEnsure;

		expect(oldRes).toBe('');
		expect(state.editBuffer.has('OEBPS/shared.xhtml')).toBe(false);
		expect(state.originalContents.has('OEBPS/shared.xhtml')).toBe(false);

		// Also verify rapid selectFile() within the same book
		const zipC = new JSZip();
		zipC.file('OEBPS/ch1.xhtml', '<p>Slow Chap 1</p>');
		zipC.file('OEBPS/ch2.xhtml', '<p>Fast Chap 2</p>');
		state.reset();
		state.zip = zipC;

		const slowChap1 = createDeferred<string | null>();
		vi.spyOn(utils, 'readSafeZipEntryText').mockImplementation(async (zip, path, opts) => {
			if (path === 'OEBPS/ch1.xhtml') return slowChap1.promise;
			return origRead(zip, path, opts);
		});

		const select1 = state.selectFile({
			path: 'OEBPS/ch1.xhtml',
			name: 'ch1.xhtml',
			category: 'page',
			extension: '.xhtml',
			orderIndex: 0
		});
		const select2 = state.selectFile({
			path: 'OEBPS/ch2.xhtml',
			name: 'ch2.xhtml',
			category: 'page',
			extension: '.xhtml',
			orderIndex: 1
		});

		await select2;
		expect(state.editorTarget).toBe('OEBPS/ch2.xhtml');
		expect(state.previewTarget).toBe('OEBPS/ch2.xhtml');

		slowChap1.resolve('<p>Slow Chap 1</p>');
		await select1;

		expect(state.editorTarget).toBe('OEBPS/ch2.xhtml');
		expect(state.previewTarget).toBe('OEBPS/ch2.xhtml');
		expect(state.previewSrcDoc).toContain('Fast Chap 2');
	});

	it('should abort pending cleaner on reset or new file load and ignore stale cleaner results', async () => {
		const state = new EpubEditorState();
		const zipA = new JSZip();
		zipA.file('OEBPS/ch1.xhtml', '<p>Book A</p>');
		state.zip = zipA;

		const deferredAnalyze = createDeferred<cleanerModule.EpubAnalysisResult>();
		let capturedSignal: AbortSignal | undefined;

		vi.spyOn(cleanerModule, 'analyzeEpub').mockImplementationOnce(
			async (_zip, _buf, _onProg, signal) => {
				capturedSignal = signal;
				return deferredAnalyze.promise;
			}
		);

		const analyzePromise = state.analyzeForClean();
		expect(capturedSignal?.aborted).toBe(false);

		// Resetting or loading a new book must abort the previous cleaner
		state.reset();
		expect(capturedSignal?.aborted).toBe(true);

		const zipB = new JSZip();
		zipB.file('OEBPS/ch1.xhtml', '<p>Book B</p>');
		state.zip = zipB;
		state.statusMessage = 'Book B ready';

		// Even if old cleaner resolves instead of rejecting, it must not pollute Book B
		deferredAnalyze.resolve({
			totalFiles: 99,
			totalBytes: 9999,
			unusedImages: [],
			unusedFonts: [],
			unusedStyles: [],
			unusedPages: [],
			missingReferences: [],
			allResources: [],
			estimatedSavingsBytes: 5000
		});

		const result = await analyzePromise;
		expect(result).toBeNull();
		expect(state.cleanAnalysis).toBeNull();
		expect(state.statusMessage).toBe('Book B ready');
	});

	it('should still load normal EPUB files cleanly after race-condition fixes', async () => {
		const file = await createEpubFile(
			'normal.epub',
			'OEBPS/chap1.xhtml',
			'Normal Book',
			'Normal content works'
		);
		const state = new EpubEditorState();
		await state.loadEpubFile(file);

		expect(state.isLoading).toBe(false);
		expect(state.isError).toBe(false);
		expect(state.fileName).toBe('normal.epub');
		expect(state.editorTarget).toBe('OEBPS/chap1.xhtml');
		expect(state.previewSrcDoc).toContain('Normal content works');
		expect(state.statusMessage).toBe('Đã tải thành công normal.epub');
	});
});
