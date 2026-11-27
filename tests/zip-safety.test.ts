import { describe, it, expect, vi, afterEach } from 'vitest';
import JSZip from 'jszip';
import {
	DEFAULT_EPUB_ZIP_LIMITS,
	ZipSafetyError,
	ZipExtractionBudget,
	createZipExtractionBudget,
	validateZipEntryPath,
	inspectRawZipCentralDirectory,
	validateZipArchiveSafety,
	loadSafeEpubZip,
	readSafeZipEntryBytes,
	readSafeZipEntryText
} from '$lib/utils';
import {
	MAX_EPUB_TOTAL_ENTRIES,
	MAX_EPUB_SINGLE_ENTRY_SIZE,
	MAX_EPUB_TOTAL_UNCOMPRESSED_SIZE
} from '$lib/constants';
import { extractEpubToTxt } from '$lib/epub-to-txt/epub-to-txt';
import { EpubEditorState } from '$lib/epub-editor/epub-editor-state.svelte';
import { parseZipEntries, exportEpubBlob, getAssetDataUrl } from '$lib/epub-editor/epub-editor';
import { validateEpub } from '$lib/epub-editor/epub-validator';
import { analyzeEpub } from '$lib/epub-editor/epub-cleaner';

/**
 * Crafts a minimal valid raw ZIP buffer containing the given entries (STORE mode),
 * allowing exact duplicate filenames or raw abnormal paths that JSZip's `zip.file()`
 * would normalize or overwrite.
 */
function buildRawZipBuffer(entries: Array<{ name: string; content: string }>): Uint8Array {
	const encoder = new TextEncoder();
	const localChunks: Uint8Array[] = [];
	const cdChunks: Uint8Array[] = [];
	let offset = 0;

	for (const entry of entries) {
		const nameBytes = encoder.encode(entry.name);
		const dataBytes = encoder.encode(entry.content);

		// Local File Header (30 bytes + name + data)
		const lfh = new Uint8Array(30 + nameBytes.length + dataBytes.length);
		const lfhView = new DataView(lfh.buffer);
		lfhView.setUint32(0, 0x04034b50, true);
		lfhView.setUint16(4, 20, true);
		lfhView.setUint16(6, 0x0800, true); // UTF-8 flag
		lfhView.setUint16(8, 0, true); // STORE
		lfhView.setUint32(18, dataBytes.length, true);
		lfhView.setUint32(22, dataBytes.length, true);
		lfhView.setUint16(26, nameBytes.length, true);
		lfh.set(nameBytes, 30);
		lfh.set(dataBytes, 30 + nameBytes.length);
		localChunks.push(lfh);

		// Central Directory File Header (46 bytes + name)
		const cdh = new Uint8Array(46 + nameBytes.length);
		const cdhView = new DataView(cdh.buffer);
		cdhView.setUint32(0, 0x02014b50, true);
		cdhView.setUint16(4, 20, true);
		cdhView.setUint16(6, 20, true);
		cdhView.setUint16(8, 0x0800, true); // UTF-8 flag
		cdhView.setUint16(10, 0, true); // STORE
		cdhView.setUint32(20, dataBytes.length, true);
		cdhView.setUint32(24, dataBytes.length, true);
		cdhView.setUint16(28, nameBytes.length, true);
		cdhView.setUint32(42, offset, true);
		cdh.set(nameBytes, 46);
		cdChunks.push(cdh);

		offset += lfh.length;
	}

	const cdSize = cdChunks.reduce((sum, c) => sum + c.length, 0);
	const eocd = new Uint8Array(22);
	const eocdView = new DataView(eocd.buffer);
	eocdView.setUint32(0, 0x06054b50, true);
	eocdView.setUint16(8, entries.length, true);
	eocdView.setUint16(10, entries.length, true);
	eocdView.setUint32(12, cdSize, true);
	eocdView.setUint32(16, offset, true);

	const totalLen = offset + cdSize + eocd.length;
	const out = new Uint8Array(totalLen);
	let pos = 0;
	for (const c of localChunks) {
		out.set(c, pos);
		pos += c.length;
	}
	for (const c of cdChunks) {
		out.set(c, pos);
		pos += c.length;
	}
	out.set(eocd, pos);
	return out;
}

async function buildMinimalValidEpubBytes(
	extraFiles?: Record<string, string>
): Promise<Uint8Array> {
	const zip = new JSZip();
	zip.file('mimetype', 'application/epub+zip', { compression: 'STORE' });
	zip.file(
		'META-INF/container.xml',
		`<?xml version="1.0"?><container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles></container>`
	);
	zip.file(
		'OEBPS/content.opf',
		`<?xml version="1.0" encoding="utf-8"?><package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="uid"><metadata xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:title>Test Book</dc:title><dc:identifier id="uid">urn:uuid:1234</dc:identifier></metadata><manifest><item id="ch1" href="chap1.xhtml" media-type="application/xhtml+xml"/></manifest><spine><itemref idref="ch1"/></spine></package>`
	);
	zip.file(
		'OEBPS/chap1.xhtml',
		`<?xml version="1.0" encoding="utf-8"?><html xmlns="http://www.w3.org/1999/xhtml"><head><title>Ch1</title></head><body><h1>Chương 1</h1><p>Nội dung thử nghiệm.</p></body></html>`
	);
	if (extraFiles) {
		for (const [k, v] of Object.entries(extraFiles)) {
			zip.file(k, v);
		}
	}
	return await zip.generateAsync({ type: 'uint8array', compression: 'DEFLATE' });
}

describe('Shared ZIP Safety Layer', () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('should expose default EPUB limits matching 5000 entries / 50MB / 500MB', () => {
		expect(MAX_EPUB_TOTAL_ENTRIES).toBe(5000);
		expect(MAX_EPUB_SINGLE_ENTRY_SIZE).toBe(50 * 1024 * 1024);
		expect(MAX_EPUB_TOTAL_UNCOMPRESSED_SIZE).toBe(500 * 1024 * 1024);
		expect(DEFAULT_EPUB_ZIP_LIMITS.maxEntries).toBe(5000);
		expect(DEFAULT_EPUB_ZIP_LIMITS.maxSingleEntrySize).toBe(50 * 1024 * 1024);
		expect(DEFAULT_EPUB_ZIP_LIMITS.maxTotalUncompressedSize).toBe(500 * 1024 * 1024);
	});

	describe('Path validation & duplicate entry detection', () => {
		it('should reject abnormal entry paths (traversal, absolute, backslash, empty segments, control chars)', () => {
			const invalidPaths = [
				'',
				'../secret.txt',
				'OEBPS/../../etc/passwd',
				'/etc/passwd',
				'\\Windows\\win.ini',
				'OEBPS\\chap1.xhtml',
				'C:/Users/test.txt',
				'D:relative.txt',
				'OEBPS//chap1.xhtml',
				'./OEBPS/chap1.xhtml',
				'OEBPS/bad\x00file.xhtml'
			];

			for (const p of invalidPaths) {
				expect(() => validateZipEntryPath(p)).toThrow(ZipSafetyError);
			}

			expect(validateZipEntryPath('OEBPS/Text/chap1.xhtml')).toBe('OEBPS/Text/chap1.xhtml');
			expect(validateZipEntryPath('OEBPS/Text/')).toBe('OEBPS/Text');
		});

		it('should reject raw ZIP with exact duplicate entry names BEFORE JSZip.loadAsync overwrites them', async () => {
			const rawDupZip = buildRawZipBuffer([
				{ name: 'OEBPS/chap1.xhtml', content: '<p>Clean</p>' },
				{ name: 'OEBPS/chap1.xhtml', content: '<p>Shadowed</p>' }
			]);
			const loadSpy = vi.spyOn(JSZip, 'loadAsync');

			await expect(loadSafeEpubZip(rawDupZip)).rejects.toMatchObject({
				name: 'ZipSafetyError',
				code: 'DUPLICATE_ENTRY'
			});
			expect(loadSpy).not.toHaveBeenCalled();
		});

		it('should reject raw ZIP containing ../ traversal path BEFORE JSZip.loadAsync', async () => {
			const rawTraversalZip = buildRawZipBuffer([{ name: '../../evil.txt', content: 'payload' }]);
			const loadSpy = vi.spyOn(JSZip, 'loadAsync');

			await expect(loadSafeEpubZip(rawTraversalZip)).rejects.toMatchObject({
				name: 'ZipSafetyError',
				code: 'INVALID_PATH'
			});
			expect(loadSpy).not.toHaveBeenCalled();
		});

		it('should allow valid case-sensitive EPUB paths and reject file/directory name collisions', async () => {
			const caseSensitiveBytes = await buildMinimalValidEpubBytes({
				'OEBPS/Images/Cover.jpg': 'IMG1',
				'OEBPS/images/cover.jpg': 'IMG2'
			});
			const loaded = await loadSafeEpubZip(caseSensitiveBytes);
			expect(loaded.file('OEBPS/Images/Cover.jpg')).not.toBeNull();
			expect(loaded.file('OEBPS/images/cover.jpg')).not.toBeNull();

			// File and directory sharing the exact same normalized path must still be rejected
			const collisionZip = new JSZip();
			collisionZip.file('OEBPS/item', 'data');
			collisionZip.folder('OEBPS/item');
			expect(() => validateZipArchiveSafety(collisionZip)).toThrow(ZipSafetyError);
		});
	});

	describe('ZIP64 rejection & malformed Central Directory handling', () => {
		it('should explicitly reject ZIP64 EOCD sentinels BEFORE calling JSZip.loadAsync', async () => {
			const rawZip = buildRawZipBuffer([{ name: 'OEBPS/a.txt', content: 'hello' }]);
			const view = new DataView(rawZip.buffer, rawZip.byteOffset, rawZip.byteLength);
			// EOCD is the last 22 bytes; set totalEntries (offset +10) to 0xFFFF sentinel
			const eocdOffset = rawZip.byteLength - 22;
			view.setUint16(eocdOffset + 10, 0xffff, true);

			const loadSpy = vi.spyOn(JSZip, 'loadAsync');

			expect(() => inspectRawZipCentralDirectory(rawZip)).toThrow(ZipSafetyError);
			await expect(loadSafeEpubZip(rawZip)).rejects.toMatchObject({
				code: 'UNSUPPORTED_ZIP64'
			});
			expect(loadSpy).not.toHaveBeenCalled();
		});

		it('should explicitly reject ZIP64 entry size sentinels (0xFFFFFFFF) in Central Directory', async () => {
			const rawZip = buildRawZipBuffer([{ name: 'OEBPS/a.txt', content: 'hello' }]);
			const view = new DataView(rawZip.buffer, rawZip.byteOffset, rawZip.byteLength);
			const eocdOffset = rawZip.byteLength - 22;
			const cdOffset = view.getUint32(eocdOffset + 16, true);
			// Set uncompressedSize (cdOffset + 24) to 0xFFFFFFFF sentinel
			view.setUint32(cdOffset + 24, 0xffffffff, true);

			await expect(loadSafeEpubZip(rawZip)).rejects.toMatchObject({
				code: 'UNSUPPORTED_ZIP64'
			});
		});

		it('should explicitly reject ZIP64 EOCD Locator signature (0x07064b50)', async () => {
			const rawZip = buildRawZipBuffer([{ name: 'OEBPS/a.txt', content: 'hello' }]);
			// Insert a 20-byte ZIP64 EOCD Locator immediately before the 22-byte EOCD
			const eocdOffset = rawZip.byteLength - 22;
			const patched = new Uint8Array(rawZip.byteLength + 20);
			patched.set(rawZip.subarray(0, eocdOffset), 0);
			const locatorView = new DataView(patched.buffer, eocdOffset, 20);
			locatorView.setUint32(0, 0x07064b50, true);
			patched.set(rawZip.subarray(eocdOffset), eocdOffset + 20);

			await expect(loadSafeEpubZip(patched)).rejects.toMatchObject({
				code: 'UNSUPPORTED_ZIP64'
			});
		});

		it('should reject truncated/corrupted Central Directory bounds instead of silently skipping', () => {
			const rawZip = buildRawZipBuffer([{ name: 'OEBPS/a.txt', content: 'hello' }]);
			const view = new DataView(rawZip.buffer, rawZip.byteOffset, rawZip.byteLength);
			const eocdOffset = rawZip.byteLength - 22;
			// Corrupt cdSize beyond archive length
			view.setUint32(eocdOffset + 12, 999999, true);

			expect(() => inspectRawZipCentralDirectory(rawZip)).toThrow(ZipSafetyError);
		});

		it('should explicitly reject multi-disk ZIP archives (diskNumber, cdStartDisk, entriesOnDisk mismatch)', async () => {
			for (const [fieldOffset, value] of [
				[4, 1], // diskNumber !== 0
				[6, 1], // cdStartDisk !== 0
				[8, 0] // entriesOnDisk !== totalEntries (1)
			] as const) {
				const rawZip = buildRawZipBuffer([{ name: 'OEBPS/a.txt', content: 'hello' }]);
				const view = new DataView(rawZip.buffer, rawZip.byteOffset, rawZip.byteLength);
				const eocdOffset = rawZip.byteLength - 22;
				view.setUint16(eocdOffset + fieldOffset, value, true);

				await expect(loadSafeEpubZip(rawZip)).rejects.toMatchObject({
					code: 'UNSUPPORTED_MULTIDISK'
				});
			}
		});

		it('should reject when EOCD entry count disagrees with parsed Central Directory entries', async () => {
			const rawZip = buildRawZipBuffer([{ name: 'OEBPS/a.txt', content: 'hello' }]);
			const view = new DataView(rawZip.buffer, rawZip.byteOffset, rawZip.byteLength);
			const eocdOffset = rawZip.byteLength - 22;
			// Declare 2 entries in both entriesOnDisk and totalEntries while CD actually holds 1
			view.setUint16(eocdOffset + 8, 2, true);
			view.setUint16(eocdOffset + 10, 2, true);

			expect(() => inspectRawZipCentralDirectory(rawZip)).toThrow(ZipSafetyError);
			await expect(loadSafeEpubZip(rawZip)).rejects.toMatchObject({
				code: 'INVALID_METADATA'
			});
		});

		it('should reject when EOCD cdSize does not match Central Directory end cursor', async () => {
			const rawZip = buildRawZipBuffer([{ name: 'OEBPS/a.txt', content: 'hello' }]);
			const view = new DataView(rawZip.buffer, rawZip.byteOffset, rawZip.byteLength);
			const eocdOffset = rawZip.byteLength - 22;
			// Declare cdSize = 0 while totalEntries = 1
			view.setUint32(eocdOffset + 12, 0, true);

			await expect(loadSafeEpubZip(rawZip)).rejects.toMatchObject({
				code: 'INVALID_METADATA'
			});
		});
	});

	describe('Pre-decompression quota checks & raw CD pre-flight', () => {
		it('should reject archive exceeding maxEntries before JSZip.loadAsync', async () => {
			const rawZip = buildRawZipBuffer([
				{ name: 'a.txt', content: '1' },
				{ name: 'b.txt', content: '2' },
				{ name: 'c.txt', content: '3' }
			]);
			const loadSpy = vi.spyOn(JSZip, 'loadAsync');

			await expect(loadSafeEpubZip(rawZip, { maxEntries: 2 })).rejects.toMatchObject({
				code: 'TOO_MANY_ENTRIES'
			});
			expect(loadSpy).not.toHaveBeenCalled();
		});

		it('should reject entry exceeding maxSingleEntrySize before calling internalStream or async', async () => {
			const zip = await JSZip.loadAsync(await buildMinimalValidEpubBytes());
			const entry = zip.file('OEBPS/chap1.xhtml')!;
			// Simulate large declared uncompressed size in JSZip metadata
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			(entry as any)._data.uncompressedSize = 60 * 1024 * 1024;

			const streamSpy = vi.spyOn(entry, 'internalStream');
			const asyncSpy = vi.spyOn(entry, 'async');

			expect(() => validateZipArchiveSafety(zip)).toThrow(ZipSafetyError);
			await expect(readSafeZipEntryText(zip, 'OEBPS/chap1.xhtml')).rejects.toMatchObject({
				code: 'ENTRY_TOO_LARGE'
			});
			expect(streamSpy).not.toHaveBeenCalled();
			expect(asyncSpy).not.toHaveBeenCalled();
		});

		it('should reject archive whose total declared uncompressed size exceeds limit before decompression', async () => {
			const rawZip = buildRawZipBuffer([
				{ name: 'a.txt', content: 'a'.repeat(600) },
				{ name: 'b.txt', content: 'b'.repeat(600) }
			]);

			expect(() =>
				inspectRawZipCentralDirectory(rawZip, {
					maxSingleEntrySize: 1000,
					maxTotalUncompressedSize: 1000
				})
			).toThrow(ZipSafetyError);
		});
	});

	describe('Metadata integrity, runtime internalStream guard & no unlimited async fallback', () => {
		it('should reject entries with missing or invalid _data metadata (never default to 0)', async () => {
			const zip = new JSZip();
			zip.file('OEBPS/test.txt', 'hello');
			const entry = zip.file('OEBPS/test.txt')!;
			// Replace Promise _data with invalid non-Promise metadata
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			(entry as any)._data = { uncompressedSize: -1 };

			const streamSpy = vi.spyOn(entry, 'internalStream');

			expect(() => validateZipArchiveSafety(zip)).toThrow(ZipSafetyError);
			await expect(readSafeZipEntryBytes(zip, 'OEBPS/test.txt')).rejects.toMatchObject({
				code: 'INVALID_METADATA'
			});
			expect(streamSpy).not.toHaveBeenCalled();
		});

		it('should still allow genuine 0-byte entries loaded from ZIP', async () => {
			const epubBytes = await buildMinimalValidEpubBytes({ 'OEBPS/empty.txt': '' });
			const zip = await loadSafeEpubZip(epubBytes);
			const text = await readSafeZipEntryText(zip, 'OEBPS/empty.txt');
			expect(text).toBe('');
		});

		it('should reject spoofed _data.uncompressedSize at runtime via internalStream', async () => {
			const bigContent = 'X'.repeat(160 * 1024); // 160KB
			const epubBytes = await buildMinimalValidEpubBytes({ 'OEBPS/big.xhtml': bigContent });
			const zip = await JSZip.loadAsync(epubBytes);
			const entry = zip.file('OEBPS/big.xhtml')!;
			// Spoof declared uncompressedSize to look tiny (10 bytes)
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			(entry as any)._data.uncompressedSize = 10;

			await expect(
				readSafeZipEntryText(zip, 'OEBPS/big.xhtml', {
					limits: { maxSingleEntrySize: 50 * 1024 }
				})
			).rejects.toMatchObject({
				code: 'ENTRY_TOO_LARGE'
			});
		});

		it('should reject when internalStream is missing instead of falling back to unlimited .async()', async () => {
			const asyncSpy = vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3]));
			const fakeZip = {
				files: {
					'a.txt': {
						dir: false,
						_data: { uncompressedSize: 3 },
						async: asyncSpy
					}
				},
				file: (p: string) =>
					p === 'a.txt'
						? {
								dir: false,
								_data: { uncompressedSize: 3 },
								async: asyncSpy
							}
						: null
			} as unknown as JSZip;

			await expect(readSafeZipEntryBytes(fakeZip, 'a.txt')).rejects.toMatchObject({
				code: 'UNSUPPORTED_STREAM'
			});
			expect(asyncSpy).not.toHaveBeenCalled();
		});

		it('should enforce ZipExtractionBudget across multiple reads without double-counting same path', async () => {
			const epubBytes = await buildMinimalValidEpubBytes({
				'OEBPS/a.txt': 'A'.repeat(600),
				'OEBPS/b.txt': 'B'.repeat(600)
			});
			const zip = await loadSafeEpubZip(epubBytes);
			const budget = createZipExtractionBudget(1000);

			const first = await readSafeZipEntryText(zip, 'OEBPS/a.txt', { budget });
			expect(first?.length).toBe(600);
			// Re-reading the same entry path does not double-count
			const repeat = await readSafeZipEntryText(zip, 'OEBPS/a.txt', { budget });
			expect(repeat?.length).toBe(600);
			expect(budget.usedBytes).toBe(600);

			// Reading second 600B entry exceeds 1000B budget
			await expect(readSafeZipEntryText(zip, 'OEBPS/b.txt', { budget })).rejects.toMatchObject({
				code: 'TOTAL_UNCOMPRESSED_TOO_LARGE'
			});
			expect(budget).toBeInstanceOf(ZipExtractionBudget);
		});

		it('should atomically reserve budget so concurrent reads cannot exceed maxTotalBytes', async () => {
			const epubBytes = await buildMinimalValidEpubBytes({
				'OEBPS/a.txt': 'A'.repeat(3000),
				'OEBPS/b.txt': 'B'.repeat(3000)
			});
			const zip = await loadSafeEpubZip(epubBytes);
			const budget = createZipExtractionBudget(4000);

			const entryB = zip.file('OEBPS/b.txt')!;
			const streamBSpy = vi.spyOn(
				entryB as unknown as { internalStream: () => unknown },
				'internalStream'
			);

			const [resA, resB] = await Promise.allSettled([
				readSafeZipEntryText(zip, 'OEBPS/a.txt', { budget }),
				readSafeZipEntryText(zip, 'OEBPS/b.txt', { budget })
			]);

			expect(resA.status).toBe('fulfilled');
			expect(resB.status).toBe('rejected');
			if (resB.status === 'rejected') {
				expect(resB.reason).toMatchObject({ code: 'TOTAL_UNCOMPRESSED_TOO_LARGE' });
			}
			// Entry B was blocked synchronously at reserve() before calling internalStream()
			expect(streamBSpy).not.toHaveBeenCalled();
			expect(budget.usedBytes).toBe(3000);
			expect(budget.reservedBytes).toBe(0);
		});

		it('should release reserved budget when reading fails mid-stream', async () => {
			const epubBytes = await buildMinimalValidEpubBytes({
				'OEBPS/a.txt': 'A'.repeat(3000),
				'OEBPS/b.txt': 'B'.repeat(3000)
			});
			const zip = await loadSafeEpubZip(epubBytes);
			const budget = createZipExtractionBudget(4000);

			const entryA = zip.file('OEBPS/a.txt')!;
			vi.spyOn(
				entryA as unknown as { internalStream: () => unknown },
				'internalStream'
			).mockImplementationOnce(() => ({
				on(event: string, cb: (arg?: unknown) => void) {
					if (event === 'error') {
						setTimeout(() => cb(new Error('Simulated inflate failure')), 0);
					}
					return this;
				},
				resume() {
					return this;
				},
				pause() {
					return this;
				}
			}));

			await expect(readSafeZipEntryText(zip, 'OEBPS/a.txt', { budget })).rejects.toThrow(
				'Simulated inflate failure'
			);
			expect(budget.reservedBytes).toBe(0);
			expect(budget.usedBytes).toBe(0);

			// Subsequent read of entry B (3000B <= 4000B) succeeds because reservation was released
			const bText = await readSafeZipEntryText(zip, 'OEBPS/b.txt', { budget });
			expect(bText?.length).toBe(3000);
			expect(budget.usedBytes).toBe(3000);
		});
	});

	describe('Integration with EPUB → TXT and EPUB Editor', () => {
		it('extractEpubToTxt should reject unsafe archive with duplicate entries or traversal paths', async () => {
			const rawDupZip = buildRawZipBuffer([
				{ name: 'META-INF/container.xml', content: '<container/>' },
				{ name: 'META-INF/container.xml', content: '<container/>' }
			]);
			const blob = new Blob([rawDupZip as unknown as BlobPart], { type: 'application/epub+zip' });

			await expect(extractEpubToTxt(blob)).rejects.toThrow(ZipSafetyError);
		});

		it('EpubEditorState.loadEpubFile should surface ZIP safety error cleanly', async () => {
			const rawTraversalZip = buildRawZipBuffer([{ name: '../evil.xhtml', content: '<p>bad</p>' }]);
			const file = new File([rawTraversalZip as unknown as BlobPart], 'bad.epub', {
				type: 'application/epub+zip'
			});

			const state = new EpubEditorState();
			await state.loadEpubFile(file);

			expect(state.isError).toBe(true);
			expect(state.zip).toBeNull();
			expect(state.statusMessage).toContain('Lỗi nạp file EPUB');
		});

		it('EPUB Editor helpers should honor passed ZipExtractionBudget', async () => {
			const epubBytes = await buildMinimalValidEpubBytes();
			const zip = await loadSafeEpubZip(epubBytes);
			const tinyBudget = createZipExtractionBudget(10);

			await expect(parseZipEntries(zip, undefined, tinyBudget)).rejects.toMatchObject({
				code: 'TOTAL_UNCOMPRESSED_TOO_LARGE'
			});
			await expect(exportEpubBlob(zip, new Map(), tinyBudget)).rejects.toMatchObject({
				code: 'TOTAL_UNCOMPRESSED_TOO_LARGE'
			});
			await expect(getAssetDataUrl(zip, 'OEBPS/chap1.xhtml', tinyBudget)).rejects.toMatchObject({
				code: 'TOTAL_UNCOMPRESSED_TOO_LARGE'
			});
			await expect(
				validateEpub(zip, 'generic', undefined, undefined, tinyBudget)
			).rejects.toMatchObject({
				code: 'TOTAL_UNCOMPRESSED_TOO_LARGE'
			});
			await expect(
				analyzeEpub(zip, undefined, undefined, undefined, tinyBudget)
			).rejects.toMatchObject({
				code: 'TOTAL_UNCOMPRESSED_TOO_LARGE'
			});
		});
	});
});
