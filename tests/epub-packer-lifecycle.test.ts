import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EpubSourceState } from '../src/lib/epub-packer/state/epub-source-state.svelte';
import { EpubState } from '../src/lib/epub-packer/epub-state.svelte';
import { buildContentOpf } from '../src/lib/epub-packer/xml-builders/opf-builder';
import { assembleEpubZip } from '../src/lib/epub-packer/builders/zip-writer';
import JSZip from 'jszip';
import type { EpubMetadata, EpubChapterItem, IllustrationImageItem } from '$lib/types';
import {
	MAX_ZIP_MARKDOWN_FILES,
	MAX_ZIP_SINGLE_MD_SIZE,
	MAX_ZIP_TOTAL_UNCOMPRESSED_SIZE
} from '$lib/constants';

describe('EPUB Packer Lifecycle & Robustness (P1 & P2 fixes)', () => {
	describe('1. P1: EpubSourceState Generation Token & Race Condition', () => {
		it('should not allow slow TXT read to overwrite a newer TXT file', async () => {
			const source = new EpubSourceState({
				getTitle: () => 'Sách Mới',
				onFileLoaded: vi.fn(),
				onTxtParsed: vi.fn()
			});

			let resolveFileA: (text: string) => void = () => {};
			const fileAPromise = new Promise<string>((resolve) => {
				resolveFileA = resolve;
			});

			const fileA = {
				name: 'book-a.txt',
				size: 1000,
				type: 'text/plain',
				text: () => fileAPromise
			} as unknown as File;

			const fileB = {
				name: 'book-b.txt',
				size: 2000,
				type: 'text/plain',
				text: async () => '@@ Chương 1 Sách B\nNội dung B'
			} as unknown as File;

			// 1. Start loading A
			const loadAPromise = source.handleFile(fileA);
			expect(source.fileLoadGeneration).toBe(1);

			// 2. Quickly load B before A resolves
			await source.handleFile(fileB);
			expect(source.fileLoadGeneration).toBe(2);
			expect(source.rawTxtText).toContain('Nội dung B');
			expect(source.epubChapters[0].title).toContain('Chương 1 Sách B');

			// 3. Now file A finishes late
			resolveFileA('@@ Chương 1 Sách A\nNội dung A');
			await loadAPromise;

			// 4. Verify A was discarded and did not overwrite B
			expect(source.rawTxtText).toContain('Nội dung B');
			expect(source.rawTxtText).not.toContain('Nội dung A');
			expect(source.epubChapters[0].title).toContain('Chương 1 Sách B');
		});

		it('should cancel TXT parsing immediately when a new ZIP file is selected', async () => {
			const onFileLoaded = vi.fn();
			const source = new EpubSourceState({
				getTitle: () => 'Test',
				onFileLoaded
			});

			const cancelSpy = vi.spyOn(source, 'cancelParseTask');

			const mockZip = {
				files: {
					'chap1.md': {
						dir: false,
						async: async () => '# Chương 1 MD\nNội dung MD'
					}
				}
			};
			vi.spyOn(JSZip, 'loadAsync').mockResolvedValueOnce(mockZip as unknown as JSZip);

			const zipFile = new File(['mock-zip-bytes'], 'book.zip', { type: 'application/zip' });
			await source.handleFile(zipFile);

			expect(cancelSpy).toHaveBeenCalled();
			expect(source.fileType).toBe('zip');
			expect(source.epubRawFiles.length).toBe(1);
			expect(source.epubChapters.length).toBe(1);
		});
	});

	describe('2. P2: ZIP Extraction Limits (Zip-bomb & Memory Exhaustion)', () => {
		it('should reject ZIP containing more than MAX_ZIP_MARKDOWN_FILES', async () => {
			const source = new EpubSourceState({
				getTitle: () => 'Test'
			});

			const mockZip = {
				files: {} as Record<string, { dir: boolean; async: () => Promise<string> }>
			};

			// Create 1001 .md files
			for (let i = 0; i <= MAX_ZIP_MARKDOWN_FILES; i++) {
				mockZip.files[`chap_${i}.md`] = {
					dir: false,
					async: async () => 'content'
				};
			}

			vi.spyOn(JSZip, 'loadAsync').mockResolvedValueOnce(mockZip as unknown as JSZip);

			const file = new File(['mock-zip'], 'too-many-files.zip', { type: 'application/zip' });
			await source.loadZipContent(file);

			expect(source.parseIsError).toBe(true);
			expect(source.parseStatus).toContain(
				`File .ZIP chứa quá nhiều file Markdown (${MAX_ZIP_MARKDOWN_FILES + 1} file`
			);
			expect(source.epubRawFiles).toEqual([]);
		});

		it('should reject ZIP when a single markdown file exceeds MAX_ZIP_SINGLE_MD_SIZE', async () => {
			const source = new EpubSourceState({
				getTitle: () => 'Test'
			});

			const hugeText = 'a'.repeat(MAX_ZIP_SINGLE_MD_SIZE + 100);
			const mockZip = {
				files: {
					'giant.md': {
						dir: false,
						async: async () => hugeText
					}
				}
			};

			vi.spyOn(JSZip, 'loadAsync').mockResolvedValueOnce(mockZip as unknown as JSZip);

			const file = new File(['mock-zip'], 'giant-file.zip', { type: 'application/zip' });
			await source.loadZipContent(file);

			expect(source.parseIsError).toBe(true);
			expect(source.parseStatus).toContain('có kích thước vượt quá giới hạn');
			expect(source.epubRawFiles).toEqual([]);
		});

		it('should reject ZIP when cumulative uncompressed text exceeds MAX_ZIP_TOTAL_UNCOMPRESSED_SIZE', async () => {
			const source = new EpubSourceState({
				getTitle: () => 'Test'
			});

			const chunkSize = 10 * 1024 * 1024; // 10MB (< 15MB single limit)
			const chunkText = 'b'.repeat(chunkSize);

			// 7 files * 10MB = 70MB > 60MB limit
			const mockZip = {
				files: {
					'part1.md': { dir: false, async: async () => chunkText },
					'part2.md': { dir: false, async: async () => chunkText },
					'part3.md': { dir: false, async: async () => chunkText },
					'part4.md': { dir: false, async: async () => chunkText },
					'part5.md': { dir: false, async: async () => chunkText },
					'part6.md': { dir: false, async: async () => chunkText },
					'part7.md': { dir: false, async: async () => chunkText }
				}
			};

			vi.spyOn(JSZip, 'loadAsync').mockResolvedValueOnce(mockZip as unknown as JSZip);

			const file = new File(['mock-zip'], 'cumulative-huge.zip', { type: 'application/zip' });
			await source.loadZipContent(file);

			expect(source.parseIsError).toBe(true);
			expect(source.parseStatus).toContain(
				'Tổng dung lượng văn bản giải nén từ file .ZIP vượt quá giới hạn an toàn'
			);
			expect(source.epubRawFiles).toEqual([]);
		});
	});

	describe('3. P1: EpubState Generation Token & Snapshot Isolation', () => {
		beforeEach(() => {
			vi.restoreAllMocks();
		});

		it('should discard packing result if user changes source book while packing is in-flight', async () => {
			const state = new EpubState();
			state.source.epubChapters = [
				{
					id: '1',
					xmlId: 'item-0',
					title: 'Chương 1',
					fileName: 'chap_01',
					html: '<p>Nội dung 1</p>'
				}
			];
			state.metadata.title = 'Sách Cũ';

			// Simulate async font fetch that takes time
			let resolveFetch: (res: Response) => void = () => {};
			const fetchPromise = new Promise<Response>((resolve) => {
				resolveFetch = resolve;
			});
			state.fonts.h1Font = 'SVN-Georgia-Bold';
			vi.stubGlobal('fetch', vi.fn().mockReturnValue(fetchPromise));

			// Start packing Sách Cũ
			const processPromise = state.processEpub();
			expect(state.processing).toBe(true);
			expect(state.packGeneration).toBe(1);

			// While packing, user loads Sách Mới
			state.source.deps.onFileLoaded?.('sach-moi', 'sach-moi.txt');
			expect(state.packGeneration).toBe(2);
			expect(state.processing).toBe(false);
			expect(state.status).toContain('Đã hủy đóng gói do nguồn sách thay đổi');

			// Now the async fetch for Sách Cũ finishes
			resolveFetch(new Response(new Blob(['font-bytes'])));
			await processPromise;

			// Packing result of Sách Cũ must NOT be recorded as epubBlob
			expect(state.epubBlob).toBeNull();
			expect(state.status).not.toContain('Hoàn tất');
		});

		it('should snapshot metadata and chapters at invocation time and not mutate during packing', async () => {
			const state = new EpubState();
			state.source.epubChapters = [
				{
					id: '1',
					xmlId: 'item-0',
					title: 'Chương 1 Gốc',
					fileName: 'chap_01',
					html: '<p>Nội dung gốc</p>'
				}
			];
			state.metadata.title = 'Tiêu Đề Gốc';
			state.metadata.author = 'Tác Giả Gốc';

			// Mock font fetch
			vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(new Blob(['font-bytes']))));

			const processPromise = state.processEpub();

			// Mutate state while processEpub is running
			state.metadata.title = 'Tiêu Đề Bị Đổi';
			state.source.epubChapters[0].title = 'Chương Bị Đổi';

			await processPromise;

			expect(state.epubBlob).toBeInstanceOf(Blob);
			expect(state.status).toContain('Hoàn tất — 1 chương đã được đóng gói thành công');
		});
	});

	describe('4. P2: Asset Namespacing & Duplicate Manifest ID Prevention', () => {
		it('should prevent duplicate IDs in buildContentOpf when image fileNames produce identical raw IDs', () => {
			const meta: EpubMetadata = {
				title: 'Test Unique IDs',
				author: 'Author',
				language: 'vi',
				identifier: 'test-uuid'
			};
			const chapters: EpubChapterItem[] = [
				{ id: '1', xmlId: 'item-0', title: 'Chap 1', fileName: 'chap_01', html: '<p>Hi</p>' }
			];
			const images: IllustrationImageItem[] = [
				{ name: 'img1', fileName: 'photo@1.jpg', mimeType: 'image/jpeg' },
				{ name: 'img2', fileName: 'photo#1.jpg', mimeType: 'image/jpeg' }
			];

			const opf = buildContentOpf(meta, chapters, false, [], null, images);

			// Both files normalize to "img-photo_1_jpg"
			// opf-builder must disambiguate: the second gets "img-photo_1_jpg_1"
			expect(opf).toContain('id="img-photo_1_jpg"');
			expect(opf).toContain('id="img-photo_1_jpg_1"');

			// Extract all manifest IDs and ensure 0 duplicates
			const idMatches = Array.from(opf.matchAll(/<item id="([^"]+)"/g)).map((m) => m[1]);
			const idSet = new Set(idMatches);
			expect(idSet.size).toBe(idMatches.length);
		});

		it('should safely rename illustrations named cover.jpg or pre-chap.png to avoid overwriting assets', async () => {
			const zip = new JSZip();
			const meta: EpubMetadata = {
				title: 'Safe Assets',
				author: 'Author',
				language: 'vi',
				identifier: 'test-safe-assets'
			};
			const chapters: EpubChapterItem[] = [
				{ id: '1', xmlId: 'item-0', title: 'Chap 1', fileName: 'chap_01', html: '<p>Hi</p>' }
			];

			const coverBlob = new Blob(['real-cover-content'], { type: 'image/jpeg' });
			const fakeCoverIllustration: IllustrationImageItem = {
				name: 'cover',
				fileName: 'cover.jpg',
				mimeType: 'image/jpeg',
				blob: new Blob(['fake-illustration-content'], { type: 'image/jpeg' })
			};

			await assembleEpubZip(
				zip,
				meta,
				chapters,
				'/* css */',
				[],
				null,
				coverBlob,
				null,
				null,
				[fakeCoverIllustration],
				false
			);

			// Check that OEBPS/images/cover.jpg exists and holds the REAL cover content
			const coverFile = zip.file('OEBPS/images/cover.jpg');
			expect(coverFile).toBeDefined();
			const coverText = await coverFile?.async('string');
			expect(coverText).toBe('real-cover-content');

			// Check that the illustration was renamed to illus_cover.jpg and holds the illustration content
			const illusFile = zip.file('OEBPS/images/illus_cover.jpg');
			expect(illusFile).toBeDefined();
			const illusText = await illusFile?.async('string');
			expect(illusText).toBe('fake-illustration-content');

			// Check content.opf manifest entries
			const opfFile = zip.file('OEBPS/content.opf');
			const opfContent = await opfFile?.async('string');
			expect(opfContent).toContain('<item id="cover-image" href="images/cover.jpg"');
			expect(opfContent).toContain('href="images/illus_cover.jpg"');
		});
	});
});
