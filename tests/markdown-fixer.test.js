import { describe, it, expect, vi, beforeEach } from 'vitest';
import JSZip from 'jszip';
import { convertBrackets, fixMarkdownZip } from '../src/lib/markdown-fixer/markdown-fixer.js';

// Mock JSZip
vi.mock('jszip', () => {
	const mockInstance = {
		file: vi.fn(),
		generateAsync: vi.fn().mockResolvedValue(new Blob(['mocked-zip-output'])),
		files: {}
	};
	
	const MockJSZip = vi.fn().mockImplementation(function() {
		return mockInstance;
	});
	MockJSZip.loadAsync = vi.fn().mockResolvedValue(mockInstance);
	
	return {
		default: MockJSZip
	};
});

describe('markdown-fixer tests', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('convertBrackets', () => {
		it('should convert bold italic and italic patterns using default brackets', () => {
			const input = 'Here is ***bold italic 1*** and ___bold italic 2___, also **_bold italic 3_** and __*bold italic 4*__. Additionally *italic 1* and _italic 2_.';
			const { converted, count } = convertBrackets(input);

			expect(converted).toBe('Here is [bold italic 1] and [bold italic 2], also [bold italic 3] and [bold italic 4]. Additionally [italic 1] and [italic 2].');
			expect(count).toBe(6);
		});

		it('should convert bold italic patterns using other variations: *__ and _**', () => {
			const input = 'This is *__bold italic 5__* and _**bold italic 6**_.';
			const { converted, count } = convertBrackets(input);

			expect(converted).toBe('This is [bold italic 5] and [bold italic 6].');
			expect(count).toBe(2);
		});

		it('should use custom wrapper config if provided', () => {
			const input = '***bold italic*** and *italic*';
			const config = {
				italicOpen: '<em>',
				italicClose: '</em>',
				biOpen: '<strong><em>',
				biClose: '</em></strong>'
			};
			const { converted, count } = convertBrackets(input, config);

			expect(converted).toBe('<strong><em>bold italic</em></strong> and <em>italic</em>');
			expect(count).toBe(2);
		});

		it('should fallback to defaults if config is partially provided', () => {
			const input = '***bold italic*** and *italic*';
			const config = {
				italicOpen: '<it>',
				// italicClose missing
				// biOpen missing
				biClose: '</bi>'
			};
			const { converted, count } = convertBrackets(input, config);

			expect(converted).toBe('[bold italic</bi> and <it>italic]');
			expect(count).toBe(2);
		});

		it('should not convert bold-only patterns (double stars/underscores without third symbol)', () => {
			const input = 'This is **bold** and __bold__';
			const { converted, count } = convertBrackets(input);

			expect(converted).toBe('This is **bold** and __bold__');
			expect(count).toBe(0);
		});

		it('should not convert patterns that exceed MAX_SPAN (150 chars)', () => {
			const longText = 'a'.repeat(151);
			const input = `***${longText}***`;
			const { converted, count } = convertBrackets(input);

			expect(converted).toBe(input);
			expect(count).toBe(0);
		});

		it('should convert patterns that are exactly at MAX_SPAN (150 chars)', () => {
			const longText = 'a'.repeat(150);
			const input = `***${longText}***`;
			const { converted, count } = convertBrackets(input);

			expect(converted).toBe(`[${longText}]`);
			expect(count).toBe(1);
		});

		it('should not convert patterns that contain a blank line', () => {
			const input = '***line 1\n\nline 2***';
			const { converted, count } = convertBrackets(input);

			expect(converted).toBe(input);
			expect(count).toBe(0);
		});

		it('should convert patterns that contain a newline but not a blank line', () => {
			const input = '***line 1\nline 2***';
			const { converted, count } = convertBrackets(input);

			expect(converted).toBe('[line 1\nline 2]');
			expect(count).toBe(1);
		});
	});

	describe('fixMarkdownZip', () => {
		it('should throw an error if no file is provided', async () => {
			await expect(fixMarkdownZip(null)).rejects.toThrow('Chưa chọn tệp .ZIP.');
		});

		it('should process zip file, convert markdown entries, and retain other files', async () => {
			// Mock files inside inZip
			const mockFiles = {
				'dir/': { dir: true, name: 'dir/' },
				'readme.md': {
					dir: false,
					name: 'readme.md',
					async: vi.fn().mockResolvedValue('***bold italic*** and *italic*')
				},
				'image.png': {
					dir: false,
					name: 'image.png',
					async: vi.fn().mockResolvedValue(new Blob(['fake-image-bytes']))
				}
			};

			const mockZipInstance = new JSZip();
			mockZipInstance.files = mockFiles;
			JSZip.loadAsync.mockResolvedValue(mockZipInstance);

			const fakeFile = {
				arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(8))
			};

			const result = await fixMarkdownZip(fakeFile, {
				italicOpen: '<em>',
				italicClose: '</em>',
				biOpen: '<strong>',
				biClose: '</strong>'
			});

			expect(fakeFile.arrayBuffer).toHaveBeenCalled();
			expect(JSZip.loadAsync).toHaveBeenCalledWith(expect.any(ArrayBuffer));

			// Verify markdown was converted and stored in outZip
			expect(mockZipInstance.file).toHaveBeenCalledWith('readme.md', '<strong>bold italic</strong> and <em>italic</em>');
			
			// Verify image.png was read as blob and stored unchanged
			expect(mockFiles['image.png'].async).toHaveBeenCalledWith('blob');
			expect(mockZipInstance.file).toHaveBeenCalledWith('image.png', expect.any(Blob));

			// Verify zipBlob output
			expect(result.zipBlob).toBeDefined();
			expect(result.totalFiles).toBe(1);
			expect(result.totalReplacements).toBe(2);
			expect(result.processedFilesList).toEqual([{ path: 'readme.md', count: 2 }]);
		});

		it('should sort the processedFilesList by replacements count in descending order', async () => {
			const mockFiles = {
				'file1.md': {
					dir: false,
					name: 'file1.md',
					async: vi.fn().mockResolvedValue('*italic*') // 1 replacement
				},
				'file2.md': {
					dir: false,
					name: 'file2.md',
					async: vi.fn().mockResolvedValue('***bold italic*** and *italic*') // 2 replacements
				}
			};

			const mockZipInstance = new JSZip();
			mockZipInstance.files = mockFiles;
			JSZip.loadAsync.mockResolvedValue(mockZipInstance);

			const fakeFile = {
				arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(8))
			};

			const result = await fixMarkdownZip(fakeFile);

			expect(result.totalFiles).toBe(2);
			expect(result.totalReplacements).toBe(3);
			expect(result.processedFilesList).toEqual([
				{ path: 'file2.md', count: 2 },
				{ path: 'file1.md', count: 1 }
			]);
		});
	});
});
