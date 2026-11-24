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
await import('../src/lib/utils/pdf');
const utilsModule = await import('../src/lib/utils');
const {
	slugify,
	ensureZipExt,
	ensureEpubExt,
	triggerDownload,
	escapeXml,
	normalizeCharPreserveLength,
	hasVietnameseDiacritics,
	cleanTitleFromFileName,
	extractMetadataFromTxt
} = utilsModule;

describe('utils tests', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.useFakeTimers();
	});

	describe('top-level block', () => {
		it('should set GlobalWorkerOptions.workerSrc when window.pdfjsLib exists', () => {
			expect(mockPdfjsLib.GlobalWorkerOptions.workerSrc).toBe('/vendor/pdfjs/pdf.worker.min.js');
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
		it('should early-exit and log error for invalid or empty blobs', () => {
			const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

			triggerDownload(null, 'test.zip');
			triggerDownload('not a blob', 'test.zip');
			triggerDownload(new Blob([]), 'empty.zip');

			expect(consoleErrorSpy).toHaveBeenCalledTimes(3);
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

	describe('hasVietnameseDiacritics', () => {
		it('should return true for NFC Vietnamese strings with accents or special characters', () => {
			expect(hasVietnameseDiacritics('Đỗ Thu Hà')).toBe(true);
			expect(hasVietnameseDiacritics('Tiếng Việt')).toBe(true);
			expect(hasVietnameseDiacritics('đường')).toBe(true);
			expect(hasVietnameseDiacritics('Ơi')).toBe(true);
		});

		it('should return true for NFD decomposed Vietnamese strings', () => {
			// NFD decomposed 'Đỗ Thu Hà'
			const nfd = 'Đo\u0302\u0303 Thu Ha\u0300';
			expect(hasVietnameseDiacritics(nfd)).toBe(true);
		});

		it('should return false for ASCII text without diacritics', () => {
			expect(hasVietnameseDiacritics('Dac Nhan Tam')).toBe(false);
			expect(hasVietnameseDiacritics('Hello World')).toBe(false);
			expect(hasVietnameseDiacritics('Book 1 - Chapter 2')).toBe(false);
		});

		it('should return false for empty or non-string inputs', () => {
			expect(hasVietnameseDiacritics('')).toBe(false);
			expect(hasVietnameseDiacritics(null)).toBe(false);
			expect(hasVietnameseDiacritics(undefined)).toBe(false);
			expect(hasVietnameseDiacritics(123)).toBe(false);
		});
	});

	describe('cleanTitleFromFileName', () => {
		it('should normalize NFD decomposed filenames to NFC', () => {
			const nfdFileName = 'Đo\u0302\u0303 Thu Ha\u0300.txt';
			const cleaned = cleanTitleFromFileName(nfdFileName);
			expect(cleaned).toBe('Đỗ Thu Hà');
			// Verify it is precomposed NFC
			expect(cleaned).toBe('Đỗ Thu Hà'.normalize('NFC'));
			expect(cleaned.length).toBe('Đỗ Thu Hà'.length);
		});

		it('should decode URL-encoded filenames', () => {
			expect(cleanTitleFromFileName('Dac%20Nhan%20Tam.txt')).toBe('Dac Nhan Tam');
		});

		it('should replace underscores and hyphens with spaces and capitalize words if all lowercase', () => {
			expect(cleanTitleFromFileName('dac_nhan_tam.txt')).toBe('Dac Nhan Tam');
			expect(cleanTitleFromFileName('khong-gia-dinh.txt')).toBe('Khong Gia Dinh');
		});

		it('should strip leading and trailing bracketed/parenthesized tags', () => {
			expect(
				cleanTitleFromFileName('[Full] [Ebook] Toi Thay Hoa Vang Tren Co Xanh [PRC].txt')
			).toBe('Toi Thay Hoa Vang Tren Co Xanh');
			expect(cleanTitleFromFileName('(Bản đẹp) Mat Biec (PDF).txt')).toBe('Mat Biec');
		});

		it('should strip various file extensions (.txt, .zip, .epub, .md)', () => {
			expect(cleanTitleFromFileName('My Book.zip')).toBe('My Book');
			expect(cleanTitleFromFileName('My Book.epub')).toBe('My Book');
			expect(cleanTitleFromFileName('My Book.md')).toBe('My Book');
		});

		it('should handle empty or invalid inputs gracefully', () => {
			expect(cleanTitleFromFileName('')).toBe('');
			expect(cleanTitleFromFileName(null)).toBe('');
			expect(cleanTitleFromFileName(undefined)).toBe('');
			expect(cleanTitleFromFileName(123)).toBe('');
		});
	});

	describe('extractMetadataFromTxt', () => {
		it('should extract title, author, translator, publisher with explicit prefixes', () => {
			const txt = `
Tên sách: Không Gia Đình
Tác giả: Hector Malot
Dịch giả: Huỳnh Lý
Nhà xuất bản: NXB Văn Học

Nội dung bắt đầu từ đây...
`;
			const res = extractMetadataFromTxt(txt);
			expect(res.title).toBe('Không Gia Đình');
			expect(res.author).toBe('Hector Malot');
			expect(res.translator).toBe('Huỳnh Lý');
			expect(res.publisher).toBe('NXB Văn Học');
		});

		it('should extract title from Markdown H1 when present', () => {
			const txt = `
# Đắc Nhân Tâm
Tác giả: Dale Carnegie
Người dịch: Nguyễn Hiến Lê
NXB: Nhà xuất bản Trẻ
`;
			const res = extractMetadataFromTxt(txt);
			expect(res.title).toBe('Đắc Nhân Tâm');
			expect(res.author).toBe('Dale Carnegie');
			expect(res.translator).toBe('Nguyễn Hiến Lê');
			expect(res.publisher).toBe('Nhà xuất bản Trẻ');
		});

		it('should extract title from first standalone line if followed by metadata block', () => {
			const txt = `
BẮT TRẺ ĐỒNG XANH
Tác giả: J. D. Salinger
Bản dịch: Phùng Khánh
`;
			const res = extractMetadataFromTxt(txt);
			expect(res.title).toBe('BẮT TRẺ ĐỒNG XANH');
			expect(res.author).toBe('J. D. Salinger');
			expect(res.translator).toBe('Phùng Khánh');
		});

		it('should ignore chapter markers or section titles as book titles', () => {
			const txt = `
Chương 1: Khởi đầu
Nội dung chương 1...
`;
			const res = extractMetadataFromTxt(txt);
			expect(res.title).toBeUndefined();
		});

		it('should handle empty or non-string input safely', () => {
			expect(extractMetadataFromTxt('')).toEqual({});
			// @ts-expect-error test non-string input
			expect(extractMetadataFromTxt(null)).toEqual({});
		});
	});
});
