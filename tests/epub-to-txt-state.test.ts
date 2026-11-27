import { describe, it, expect, vi, afterEach } from 'vitest';
import JSZip from 'jszip';
import { EpubToTxtState } from '$lib/epub-to-txt/epub-to-txt-state.svelte';
import * as epubToTxtModule from '$lib/epub-to-txt/epub-to-txt';
import type { EpubToTxtResult } from '$lib/epub-to-txt/epub-to-txt';

function createDeferred<T>() {
	let resolve!: (value: T) => void;
	let reject!: (reason?: unknown) => void;
	const promise = new Promise<T>((res, rej) => {
		resolve = res;
		reject = rej;
	});
	return { promise, resolve, reject };
}

function makeMockResult(name: string, text: string): EpubToTxtResult {
	return {
		text,
		title: name,
		author: 'Tester',
		chapterCount: 1,
		wordCount: text.split(/\s+/).length,
		charCount: text.length,
		fileName: `${name}.txt`,
		txtBlob: new Blob([text], { type: 'text/plain;charset=utf-8' })
	};
}

async function createRealEpubFile(name: string, title: string, body: string): Promise<File> {
	const zip = new JSZip();
	zip.file('mimetype', 'application/epub+zip', { compression: 'STORE' });
	zip.file(
		'META-INF/container.xml',
		'<?xml version="1.0"?><container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles></container>'
	);
	zip.file(
		'OEBPS/content.opf',
		`<?xml version="1.0" encoding="utf-8"?><package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="uid"><metadata xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:title>${title}</dc:title><dc:identifier id="uid">urn:uuid:${name}</dc:identifier></metadata><manifest><item id="ch1" href="chap1.xhtml" media-type="application/xhtml+xml"/></manifest><spine><itemref idref="ch1"/></spine></package>`
	);
	zip.file(
		'OEBPS/chap1.xhtml',
		`<?xml version="1.0" encoding="utf-8"?><html xmlns="http://www.w3.org/1999/xhtml"><head><title>${title}</title></head><body><h1>${title}</h1><p>${body}</p></body></html>`
	);
	const bytes = await zip.generateAsync({ type: 'uint8array', compression: 'DEFLATE' });
	return new File([bytes as unknown as BlobPart], name, { type: 'application/epub+zip' });
}

describe('EpubToTxtState race condition protections', () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('should ignore stale task A progress/result/error when file B is selected while A is running', async () => {
		const fileA = new File(['a'], 'book-a.epub', { type: 'application/epub+zip' });
		const fileB = new File(['b'], 'book-b.epub', { type: 'application/epub+zip' });

		const deferredA = createDeferred<EpubToTxtResult>();
		let onProgressA: ((status: string, percent: number) => void) | undefined;

		vi.spyOn(epubToTxtModule, 'extractEpubToTxt').mockImplementationOnce(async (_file, opts) => {
			onProgressA = opts?.onProgress;
			return deferredA.promise;
		});

		const state = new EpubToTxtState();
		state.handleFile(fileA);
		const taskA = state.processEpub();

		expect(state.isProcessing).toBe(true);
		onProgressA?.('Đang đọc A...', 40);
		expect(state.progressLabel).toBe('Đang đọc A...');
		expect(state.progressPercent).toBe(40);

		// User selects file B while A is still running
		state.handleFile(fileB);
		expect(state.selectedFile).toBe(fileB);
		expect(state.isProcessing).toBe(false);
		expect(state.progressPercent).toBe(0);
		expect(state.progressLabel).toBe('');
		expect(state.result).toBeNull();
		expect(state.status).toBe('');

		// Late progress and completion from A must not overwrite B's state
		onProgressA?.('A hoàn tất 90%', 90);
		expect(state.progressLabel).toBe('');
		expect(state.progressPercent).toBe(0);

		deferredA.resolve(makeMockResult('book-a', 'Content A'));
		await taskA;

		expect(state.selectedFile).toBe(fileB);
		expect(state.result).toBeNull();
		expect(state.status).toBe('');
		expect(state.isError).toBe(false);
		expect(state.isProcessing).toBe(false);
	});

	it('should ignore stale progress, result, error, and finally when reset() is called mid-conversion', async () => {
		const fileA = new File(['a'], 'book-a.epub', { type: 'application/epub+zip' });
		const deferredA = createDeferred<EpubToTxtResult>();
		let onProgressA: ((status: string, percent: number) => void) | undefined;

		vi.spyOn(epubToTxtModule, 'extractEpubToTxt').mockImplementationOnce(async (_file, opts) => {
			onProgressA = opts?.onProgress;
			return deferredA.promise;
		});

		const state = new EpubToTxtState();
		state.handleFile(fileA);
		const taskA = state.processEpub();

		state.reset();
		expect(state.selectedFile).toBeNull();
		expect(state.isProcessing).toBe(false);
		expect(state.progressPercent).toBe(0);
		expect(state.progressLabel).toBe('');
		expect(state.status).toBe('');
		expect(state.result).toBeNull();

		onProgressA?.('Stale progress', 80);
		expect(state.progressPercent).toBe(0);
		expect(state.progressLabel).toBe('');

		deferredA.reject(new Error('Late error from A'));
		await taskA;

		expect(state.selectedFile).toBeNull();
		expect(state.isError).toBe(false);
		expect(state.status).toBe('');
		expect(state.result).toBeNull();
		expect(state.isProcessing).toBe(false);
	});

	it('should preserve task B state and isProcessing when older task A finishes or fails after task B', async () => {
		const fileA = new File(['a'], 'book-a.epub', { type: 'application/epub+zip' });
		const fileB = new File(['b'], 'book-b.epub', { type: 'application/epub+zip' });

		const deferredA = createDeferred<EpubToTxtResult>();
		const deferredB = createDeferred<EpubToTxtResult>();
		let onProgressA: ((status: string, percent: number) => void) | undefined;
		let onProgressB: ((status: string, percent: number) => void) | undefined;

		vi.spyOn(epubToTxtModule, 'extractEpubToTxt').mockImplementation(async (file, opts) => {
			if (file === fileA) {
				onProgressA = opts?.onProgress;
				return deferredA.promise;
			}
			onProgressB = opts?.onProgress;
			return deferredB.promise;
		});

		const state = new EpubToTxtState();
		state.handleFile(fileA);
		const taskA = state.processEpub();

		// Switch to B and start B before A finishes
		state.handleFile(fileB);
		const taskB = state.processEpub();

		expect(state.isProcessing).toBe(true);
		onProgressB?.('Đang trích xuất B...', 65);
		expect(state.progressLabel).toBe('Đang trích xuất B...');
		expect(state.progressPercent).toBe(65);

		// A fails while B is still running — must NOT flip isProcessing to false or set isError
		deferredA.reject(new Error('Failure in A'));
		await taskA;

		expect(state.isProcessing).toBe(true);
		expect(state.isError).toBe(false);
		expect(state.progressLabel).toBe('Đang trích xuất B...');
		expect(state.progressPercent).toBe(65);

		// B completes cleanly
		const resultB = makeMockResult('book-b', 'Content B');
		deferredB.resolve(resultB);
		await taskB;

		expect(state.isProcessing).toBe(false);
		expect(state.isError).toBe(false);
		expect(state.result).toEqual(resultB);
		expect(state.status).toContain('Chuyển đổi thành công!');

		// Also verify late resolution when A finishes after B already succeeded
		const state2 = new EpubToTxtState();
		const deferredA2 = createDeferred<EpubToTxtResult>();
		const deferredB2 = createDeferred<EpubToTxtResult>();
		vi.spyOn(epubToTxtModule, 'extractEpubToTxt').mockImplementation(async (file) =>
			file === fileA ? deferredA2.promise : deferredB2.promise
		);

		state2.handleFile(fileA);
		const pA2 = state2.processEpub();
		state2.handleFile(fileB);
		const pB2 = state2.processEpub();

		const resB2 = makeMockResult('book-b', 'Final B');
		deferredB2.resolve(resB2);
		await pB2;

		onProgressA?.('Late A', 99);
		deferredA2.resolve(makeMockResult('book-a', 'Stale A'));
		await pA2;

		expect(state2.result).toEqual(resB2);
		expect(state2.isProcessing).toBe(false);
		expect(state2.isError).toBe(false);
	});

	it('should still convert a normal EPUB file cleanly', async () => {
		const epubFile = await createRealEpubFile('normal.epub', 'Chương 1', 'Nội dung bình thường.');
		const state = new EpubToTxtState();

		state.handleFile(epubFile);
		await state.processEpub();

		expect(state.isProcessing).toBe(false);
		expect(state.isError).toBe(false);
		expect(state.result).not.toBeNull();
		expect(state.result?.text).toContain('Nội dung bình thường.');
		expect(state.status).toContain('Chuyển đổi thành công!');
	});
});
