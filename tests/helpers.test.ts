import { describe, it, expect, vi, beforeEach } from 'vitest';

// Define window and pdfjsLib before dynamically importing helpers to cover the top-level block
const mockPdfjsLib = {
	GlobalWorkerOptions: {
		workerSrc: ''
	}
};

Object.defineProperty(globalThis, 'window', {
	value: {
		pdfjsLib: mockPdfjsLib
	},
	configurable: true,
	writable: true
});

const mockAnchor = {
	click: vi.fn(),
	remove: vi.fn(),
	href: '',
	download: ''
};

const mockDocument = {
	createElement: vi.fn().mockImplementation((type: string) => {
		if (type === 'a') return mockAnchor;
		return {};
	}),
	body: {
		appendChild: vi.fn()
	}
};

URL.createObjectURL = vi.fn().mockReturnValue('blob:http://localhost/mock-uuid');
URL.revokeObjectURL = vi.fn();

Object.defineProperty(globalThis, 'document', {
	value: mockDocument,
	configurable: true,
	writable: true
});

// Dynamic import to capture the top-level window.pdfjsLib check
const helpersModule = await import('../src/lib/helpers/helpers');
const { slugify, ensureZipExt, ensureEpubExt, triggerDownload, escapeXml, normalizeCharPreserveLength } = helpersModule;

describe('helpers tests', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.useFakeTimers();
	});

	describe('top-level block', () => {
		it('should set GlobalWorkerOptions.workerSrc when window.pdfjsLib exists', () => {
			expect(mockPdfjsLib.GlobalWorkerOptions.workerSrc).toBe(
				'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
			);
		});
	});

	describe('slugify', () => {
		it('should convert strings into URL-safe filenames', () => {
			expect(slugify('My Book Title.txt')).toBe('My-Book-Title');
			expect(slugify('  Spaced  Title  .epub ')).toBe('Spaced-Title-');
			expect(slugify('filename-only')).toBe('filename-only');
		});

		it('should return untitled for invalid inputs', () => {
			expect(slugify(null)).toBe('untitled');
			expect(slugify(undefined)).toBe('untitled');
			expect(slugify(123)).toBe('untitled');
			expect(slugify('')).toBe('untitled');
			expect(slugify('   ')).toBe('untitled');
		});
	});

	describe('ensureZipExt', () => {
		it('should ensure zip extension is present', () => {
			expect(ensureZipExt('book')).toBe('book.zip');
			expect(ensureZipExt('book.zip')).toBe('book.zip');
			expect(ensureZipExt('book.ZIP')).toBe('book.ZIP');
		});

		it('should handle invalid or empty filenames', () => {
			expect(ensureZipExt(null)).toBe('output.zip');
			expect(ensureZipExt(undefined)).toBe('output.zip');
			expect(ensureZipExt(123)).toBe('output.zip');
			expect(ensureZipExt('')).toBe('output.zip');
			expect(ensureZipExt('   ')).toBe('output.zip');
		});
	});

	describe('ensureEpubExt', () => {
		it('should ensure epub extension is present', () => {
			expect(ensureEpubExt('book')).toBe('book.epub');
			expect(ensureEpubExt('book.epub')).toBe('book.epub');
			expect(ensureEpubExt('book.EPUB')).toBe('book.EPUB');
		});

		it('should handle invalid or empty filenames', () => {
			expect(ensureEpubExt(null)).toBe('output.epub');
			expect(ensureEpubExt(undefined)).toBe('output.epub');
			expect(ensureEpubExt(123)).toBe('output.epub');
			expect(ensureEpubExt('')).toBe('output.epub');
			expect(ensureEpubExt('   ')).toBe('output.epub');
		});
	});

	describe('triggerDownload', () => {
		it('should early-exit and log error for invalid blobs', () => {
			const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
			
			triggerDownload(null, 'test.zip');
			triggerDownload('not a blob', 'test.zip');

			expect(consoleErrorSpy).toHaveBeenCalledTimes(2);
			expect(URL.createObjectURL).not.toHaveBeenCalled();
			
			consoleErrorSpy.mockRestore();
		});

		it('should trigger browser download for valid blobs', () => {
			const blob = new Blob(['content'], { type: 'application/zip' });
			triggerDownload(blob, 'my-file.zip');

			expect(URL.createObjectURL).toHaveBeenCalledWith(blob);
			expect(mockDocument.createElement).toHaveBeenCalledWith('a');
			expect(mockAnchor.href).toBe('blob:http://localhost/mock-uuid');
			expect(mockAnchor.download).toBe('my-file.zip');
			expect(mockDocument.body.appendChild).toHaveBeenCalledWith(mockAnchor);
			expect(mockAnchor.click).toHaveBeenCalled();
			expect(mockAnchor.remove).toHaveBeenCalled();

			// Test setTimeout for URL.revokeObjectURL
			expect(URL.revokeObjectURL).not.toHaveBeenCalled();
			vi.advanceTimersByTime(4000);
			expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:http://localhost/mock-uuid');
		});

		it('should fallback to download filename if not specified', () => {
			const blob = new Blob(['content'], { type: 'application/zip' });
			triggerDownload(blob, null);

			expect(mockAnchor.download).toBe('download');
		});
	});

	describe('escapeXml', () => {
		it('should escape xml/html characters', () => {
			expect(escapeXml('& < > " \'')).toBe('&amp; &lt; &gt; &quot; &apos;');
		});

		it('should convert primitives to string and escape', () => {
			expect(escapeXml(123)).toBe('123');
			expect(escapeXml(0)).toBe('0');
		});

		it('should handle null/undefined', () => {
			expect(escapeXml(null)).toBe('');
			expect(escapeXml(undefined)).toBe('');
		});

		it('should strip XML 1.0 illegal C0 control characters', () => {
			expect(escapeXml('Hello\x00\x08World\x0B\x0C!\x1F')).toBe('HelloWorld!');
			// Preserves tab \t (0x09), newline \n (0x0A), carriage return \r (0x0D)
			expect(escapeXml('Line 1\t\nLine 2\r')).toBe('Line 1\t\nLine 2\r');
		});
	});

	describe('normalizeCharPreserveLength', () => {
		it('should normalize Vietnamese characters to standard lowercase representation without diacritics', () => {
			expect(normalizeCharPreserveLength('Đường')).toBe('duong');
			expect(normalizeCharPreserveLength('Tiếng Việt')).toBe('tieng viet');
		});

		it('should handle null, undefined or empty values gracefully', () => {
			expect(normalizeCharPreserveLength(null)).toBe('');
			expect(normalizeCharPreserveLength(undefined)).toBe('');
			expect(normalizeCharPreserveLength('')).toBe('');
		});

		it('should safely handle non-BMP astral characters without creating lone surrogates', () => {
			const astral = '𠀀'; // U+20000 (CJK Extension B)
			const res = normalizeCharPreserveLength(astral);
			expect(res).toBe('𠀀');
			expect(res.isWellFormed()).toBe(true);
		});
	});
});
