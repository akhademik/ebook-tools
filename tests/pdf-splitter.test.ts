import { describe, it, expect, vi, beforeEach } from 'vitest';

// Set up mock window and navigator globals before importing pdf-splitter
const mockPage = {
	getViewport: vi.fn().mockReturnValue({ width: 100, height: 200 }),
	render: vi.fn().mockReturnValue({ promise: Promise.resolve() }),
	cleanup: vi.fn()
};

const mockDoc = {
	numPages: 2,
	getPage: vi.fn().mockResolvedValue(mockPage),
	destroy: vi.fn()
};

const mockPdfjsLib = {
	getDocument: vi.fn().mockReturnValue({
		promise: Promise.resolve(mockDoc)
	})
};

// Setup DOM globals
Object.defineProperty(globalThis, 'window', {
	value: {
		pdfjsLib: mockPdfjsLib
	},
	configurable: true,
	writable: true
});

Object.defineProperty(globalThis, 'navigator', {
	value: {
		hardwareConcurrency: 4
	},
	configurable: true,
	writable: true
});

// Track mock canvas creations to inspect call arguments
const createdCanvases: any[] = [];

Object.defineProperty(globalThis, 'document', {
	value: {
		createElement: vi.fn().mockImplementation((type: string) => {
			if (type === 'canvas') {
				const ctx = {
					getImageData: vi
						.fn()
						.mockImplementation((_x: number, _y: number, w: number, h: number) => {
							// Create data array: size is w * h * 4
							const data = new Uint8Array(w * h * 4);
							// Fill it with some non-zero data to test grayscale calculations
							for (let i = 0; i < data.length; i++) {
								data[i] = i % 256;
							}
							return { data };
						}),
					putImageData: vi.fn(),
					drawImage: vi.fn()
				};
				const canvas = {
					width: 0,
					height: 0,
					getContext: vi.fn().mockReturnValue(ctx),
					toDataURL: vi.fn().mockReturnValue('data:image/jpeg;base64,mocked'),
					toBlob: vi.fn().mockImplementation((resolve: (blob: Blob | null) => void) => {
						resolve(new Blob(['mocked-blob-image']));
					})
				};
				createdCanvases.push(canvas);
				return canvas;
			}
			return {};
		})
	},
	configurable: true,
	writable: true
});

let mockTime = 0;
Object.defineProperty(globalThis, 'performance', {
	value: {
		now: vi.fn().mockImplementation(() => {
			mockTime += 100;
			return mockTime;
		})
	},
	configurable: true,
	writable: true
});

// Mock JSZip
vi.mock('jszip', () => {
	const mockInstance = {
		file: vi.fn(),
		generateAsync: vi.fn().mockResolvedValue(new Blob(['mocked-zip-output'])),
		files: {}
	};

	const MockJSZip = vi.fn().mockImplementation(function () {
		return mockInstance;
	});
	(MockJSZip as any).loadAsync = vi.fn().mockResolvedValue(mockInstance);

	return {
		default: MockJSZip
	};
});

// Import modules AFTER setting up globals
import { formatEta, loadPdfPreview, processPdfToJpg } from '../src/lib/pdf-splitter/pdf-splitter';

describe('pdf-splitter tests', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		createdCanvases.length = 0;
		mockTime = 0;
		// Reset PDF.js mock properties
		mockDoc.numPages = 2;
		(globalThis as any).window.pdfjsLib = mockPdfjsLib;
		(globalThis as any).navigator.hardwareConcurrency = 4;
	});

	describe('formatEta', () => {
		it('should format valid seconds correctly', () => {
			expect(formatEta(0)).toBe('00:00');
			expect(formatEta(5)).toBe('00:05');
			expect(formatEta(60)).toBe('01:00');
			expect(formatEta(125.4)).toBe('02:05'); // Rounds 5.4 to 5
			expect(formatEta(125.6)).toBe('02:06'); // Rounds 5.6 to 6
			expect(formatEta(3599)).toBe('59:59');
		});

		it('should handle invalid values', () => {
			expect(formatEta(-1)).toBe('--:--');
			expect(formatEta(NaN)).toBe('--:--');
			expect(formatEta(Infinity)).toBe('--:--');
			expect(formatEta(-Infinity)).toBe('--:--');
		});
	});

	describe('loadPdfPreview', () => {
		const fakeFile = {
			arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(8))
		} as unknown as File;

		it('should throw an error if no file is provided', async () => {
			await expect(loadPdfPreview(null, 3, false)).rejects.toThrow(
				'Chưa chọn tệp PDF hoặc thư viện PDF.js chưa tải.'
			);
		});

		it('should throw an error if pdfjsLib is missing', async () => {
			const originalPdfjs = (globalThis as any).window.pdfjsLib;
			(globalThis as any).window.pdfjsLib = undefined;
			await expect(loadPdfPreview(fakeFile, 3, false)).rejects.toThrow(
				'Chưa chọn tệp PDF hoặc thư viện PDF.js chưa tải.'
			);
			(globalThis as any).window.pdfjsLib = originalPdfjs;
		});

		it('should load preview pages with grayscale applied', async () => {
			const pages = await loadPdfPreview(fakeFile, 3, false);

			expect(fakeFile.arrayBuffer).toHaveBeenCalled();
			expect(mockPdfjsLib.getDocument).toHaveBeenCalled();
			expect(mockDoc.getPage).toHaveBeenCalledTimes(2); // Since doc.numPages is 2
			expect(pages.length).toBe(2);
			expect(pages[0]).toEqual({
				pageNum: 1,
				dataUrl: 'data:image/jpeg;base64,mocked',
				width: 100,
				height: 200
			});

			// Verify grayscale was applied since keepColor = false
			const canvas = createdCanvases[0];
			const ctx = canvas.getContext('2d');
			expect(ctx.getImageData).toHaveBeenCalled();
			expect(ctx.putImageData).toHaveBeenCalled();
			expect(mockPage.cleanup).toHaveBeenCalled();
			expect(mockDoc.destroy).toHaveBeenCalled();
		});

		it('should load preview pages keeping colors intact', async () => {
			const pages = await loadPdfPreview(fakeFile, 1, true);

			expect(pages.length).toBe(1);
			// Verify grayscale was NOT applied
			const canvas = createdCanvases[0];
			const ctx = canvas.getContext('2d');
			expect(ctx.getImageData).not.toHaveBeenCalled();
			expect(ctx.putImageData).not.toHaveBeenCalled();
		});
	});

	describe('processPdfToJpg', () => {
		const fakeFile = {
			size: 1024,
			arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(8))
		} as unknown as File;

		it('should throw an error if no file is provided', async () => {
			await expect(processPdfToJpg(null, false, 0, 0)).rejects.toThrow(
				'Chưa chọn tệp PDF hoặc thư viện PDF.js chưa tải.'
			);
		});

		it('should throw an error if pdfjsLib is missing', async () => {
			const originalPdfjs = (globalThis as any).window.pdfjsLib;
			(globalThis as any).window.pdfjsLib = undefined;
			await expect(processPdfToJpg(fakeFile, false, 0, 0)).rejects.toThrow(
				'Chưa chọn tệp PDF hoặc thư viện PDF.js chưa tải.'
			);
			(globalThis as any).window.pdfjsLib = originalPdfjs;
		});

		it('should split PDF pages and return zipBlob with progress notifications', async () => {
			const progressMock = vi.fn();

			// Mocking 3 pages to test concurrency loop
			mockDoc.numPages = 3;

			const result = await processPdfToJpg(fakeFile, false, 0, 0, progressMock);

			expect(result.numPages).toBe(3);
			expect(result.zipBlob).toBeDefined();

			// Progress notifications checks
			expect(progressMock).toHaveBeenCalled();
			const lastCall = progressMock.mock.calls[progressMock.mock.calls.length - 1][0];
			expect(lastCall.progressPercent).toBe(100);
			expect(lastCall.completed).toBe(3);

			// Checks if pages were loaded
			expect(mockDoc.getPage).toHaveBeenCalledTimes(3);

			// Check if grayscale was applied
			const canvas = createdCanvases[0];
			const ctx = canvas.getContext('2d');
			expect(ctx.getImageData).toHaveBeenCalled();
		});

		it('should keep color and not apply grayscale', async () => {
			mockDoc.numPages = 1;
			const result = await processPdfToJpg(fakeFile, true, 0, 0);
			expect(result.numPages).toBe(1);

			const canvas = createdCanvases[0];
			const ctx = canvas.getContext('2d');
			expect(ctx.getImageData).not.toHaveBeenCalled();
		});

		it('should crop pages if crop settings are provided', async () => {
			mockDoc.numPages = 1;

			// Test cropCanvas function path
			const result = await processPdfToJpg(fakeFile, true, 10, 15);
			expect(result.numPages).toBe(1);

			// Should have created 2 canvases: one for rendering, one for cropping
			expect(createdCanvases.length).toBe(2);
			const renderCanvas = createdCanvases[0];
			renderCanvas.height = 200; // Simulated height from viewport
			renderCanvas.width = 100;

			const croppedCanvas = createdCanvases[1];
			expect(croppedCanvas.height).toBe(175);

			const croppedCtx = croppedCanvas.getContext('2d');
			expect(croppedCtx.drawImage).toHaveBeenCalledWith(
				renderCanvas,
				0,
				10,
				100,
				175,
				0,
				0,
				100,
				175
			);
		});

		it('should pick concurrency based on file size and hardwareConcurrency', async () => {
			// Test pickConcurrency: Large file > 300MB
			const largeFile = {
				size: 350 * 1024 * 1024,
				arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(8))
			} as unknown as File;
			mockDoc.numPages = 10;
			(globalThis as any).navigator.hardwareConcurrency = 8;

			await processPdfToJpg(largeFile, true, 0, 0);

			const mediumFile = {
				size: 200 * 1024 * 1024,
				arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(8))
			} as unknown as File;
			await processPdfToJpg(mediumFile, true, 0, 0);
		});

		it('should fallback to 4 if hardwareConcurrency is undefined', async () => {
			const originalVal = (globalThis as any).navigator.hardwareConcurrency;
			(globalThis as any).navigator.hardwareConcurrency = undefined;

			// mockDoc.numPages is 2 by default in beforeEach
			const result = await processPdfToJpg(fakeFile, true, 0, 0);
			expect(result.numPages).toBe(2);

			(globalThis as any).navigator.hardwareConcurrency = originalVal;
		});

		it('should test applyGrayscale and cropCanvas pure helper functions', async () => {
			const { applyGrayscale, cropCanvas } = await import('../src/lib/pdf-splitter/pdf-splitter');
			const mockCtx = {
				getImageData: vi.fn().mockReturnValue({
					data: new Uint8Array([100, 150, 200, 255])
				}),
				putImageData: vi.fn(),
				drawImage: vi.fn()
			};

			applyGrayscale(mockCtx as any, 1, 1, 1.08);
			expect(mockCtx.getImageData).toHaveBeenCalledWith(0, 0, 1, 1);
			expect(mockCtx.putImageData).toHaveBeenCalled();

			const fakeCanvas = {
				width: 200,
				height: 300,
				getContext: vi.fn().mockReturnValue(mockCtx)
			} as any;

			const cropped = cropCanvas(fakeCanvas, 20, 30);
			expect(cropped).toBeDefined();
		});

		it('should abort processPdfToJpg when signal is aborted', async () => {
			const ac = new AbortController();
			ac.abort();

			await expect(processPdfToJpg(fakeFile, true, 0, 0, undefined, ac.signal)).rejects.toThrow();
		});
	});
});
