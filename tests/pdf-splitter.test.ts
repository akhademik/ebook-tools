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
const mockAnchor = {
	click: vi.fn(),
	remove: vi.fn(),
	href: '',
	download: ''
};

Object.defineProperty(globalThis, 'document', {
	value: {
		body: {
			appendChild: vi.fn()
		},
		createElement: vi.fn().mockImplementation((type: string) => {
			if (type === 'a') return mockAnchor;
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
import {
	formatEta,
	loadPdfPreview,
	processPdfToJpg,
	getClampedViewport,
	DEFAULT_DPI,
	dpiToScale,
	MAX_CANVAS_DIMENSION,
	MAX_CANVAS_PIXELS
} from '../src/lib/pdf-splitter/pdf-splitter';
import JSZip from 'jszip';
import { renderPdfPageToBlob } from '../src/lib/utils/pdf';
import { PdfSplitterState } from '../src/lib/pdf-splitter/pdf-splitter-state.svelte';

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
				'Chưa chọn file PDF hoặc thư viện PDF.js chưa tải.'
			);
		});

		it('should throw an error if pdfjsLib is missing', async () => {
			const originalPdfjs = (globalThis as any).window.pdfjsLib;
			(globalThis as any).window.pdfjsLib = undefined;
			await expect(loadPdfPreview(fakeFile, 3, false)).rejects.toThrow(
				'Chưa chọn file PDF hoặc thư viện PDF.js chưa tải.'
			);
			(globalThis as any).window.pdfjsLib = originalPdfjs;
		});

		it('should load preview pages directly without canvas pixel manipulation (native color)', async () => {
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

			// Verify preview renders directly without costly getImageData/putImageData calls
			const canvas = createdCanvases[0];
			const ctx = canvas.getContext('2d');
			expect(ctx.getImageData).not.toHaveBeenCalled();
			expect(ctx.putImageData).not.toHaveBeenCalled();
			expect(mockPage.cleanup).toHaveBeenCalled();
			expect(mockDoc.destroy).toHaveBeenCalled();
		});

		it('should load preview pages with keepColor parameter without error', async () => {
			const pages = await loadPdfPreview(fakeFile, 1, true);

			expect(pages.length).toBe(1);
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
				'Chưa chọn file PDF hoặc thư viện PDF.js chưa tải.'
			);
		});

		it('should throw an error if pdfjsLib is missing', async () => {
			const originalPdfjs = (globalThis as any).window.pdfjsLib;
			(globalThis as any).window.pdfjsLib = undefined;
			await expect(processPdfToJpg(fakeFile, false, 0, 0)).rejects.toThrow(
				'Chưa chọn file PDF hoặc thư viện PDF.js chưa tải.'
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
			// Confirms immediate memory deallocation after page processing
			expect(croppedCanvas.height).toBe(0);
			expect(croppedCanvas.width).toBe(0);
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

		it('should test applyGrayscale, applyGrayscaleAsync, and processGrayscaleBuffer', async () => {
			const {
				applyGrayscale,
				applyGrayscaleAsync,
				cropCanvas,
				PREVIEW_DPI,
				PREVIEW_SCALE,
				calculateGrayscaleTimeout
			} = await import('../src/lib/pdf-splitter/pdf-splitter');
			const { processGrayscaleBuffer } =
				await import('../src/lib/pdf-splitter/pdf-grayscale.worker');

			expect(PREVIEW_DPI).toBe(96);
			expect(PREVIEW_SCALE).toBe(96 / 72);

			// Test adaptive timeout
			expect(calculateGrayscaleTimeout(1000, 1000)).toBeGreaterThanOrEqual(15000);
			expect(calculateGrayscaleTimeout(4000, 6000)).toBeGreaterThan(15000);
			expect(calculateGrayscaleTimeout(10000, 10000)).toBe(60000);

			// Test pure buffer processing
			const rawBuffer = new Uint8Array([100, 150, 200, 255]).buffer;
			const processedBuffer = processGrayscaleBuffer(rawBuffer, 1.08);
			const processedArr = new Uint8ClampedArray(processedBuffer);
			expect(processedArr[3]).toBe(255);
			// R=G=B for grayscale
			expect(processedArr[0]).toBe(processedArr[1]);
			expect(processedArr[1]).toBe(processedArr[2]);

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

			// Test async grayscale with fallback
			await applyGrayscaleAsync(mockCtx as any, 1, 1, 1.08);
			expect(mockCtx.putImageData).toHaveBeenCalledTimes(2);

			const fakeCanvas = {
				width: 200,
				height: 300,
				getContext: vi.fn().mockReturnValue(mockCtx)
			} as any;

			const cropped = cropCanvas(fakeCanvas, 20, 30);
			expect(cropped).toBeDefined();
		});

		it('should handle synchronous postMessage errors, cancel timer, clean pending map, and keep in-flight jobs safe', async () => {
			const { applyGrayscaleAsync, cleanupGrayscaleWorker, getPendingGrayscaleJobsCount } =
				await import('../src/lib/pdf-splitter/pdf-splitter');

			cleanupGrayscaleWorker(true);
			expect(getPendingGrayscaleJobsCount()).toBe(0);

			const postMessageSpy = vi.fn();
			const terminateSpy = vi.fn();
			const mockWorkerInstance = {
				onmessage: null as ((e: any) => void) | null,
				onerror: null as ((e: any) => void) | null,
				onmessageerror: null as ((e: any) => void) | null,
				postMessage: postMessageSpy,
				terminate: terminateSpy
			};

			function MockWorker() {
				return mockWorkerInstance;
			}

			const originalWorker = (globalThis as any).Worker;
			const originalWindowWorker = (globalThis as any).window?.Worker;
			(globalThis as any).Worker = MockWorker;
			if ((globalThis as any).window) {
				(globalThis as any).window.Worker = MockWorker;
			}

			const clearTimeoutSpy = vi.spyOn(globalThis, 'clearTimeout');

			try {
				const mockCtx1 = {
					getImageData: vi.fn().mockReturnValue({
						data: new Uint8Array([50, 100, 150, 255])
					}),
					putImageData: vi.fn()
				};

				const mockCtx2 = {
					getImageData: vi.fn().mockReturnValue({
						data: new Uint8Array([80, 120, 160, 255])
					}),
					putImageData: vi.fn()
				};

				// Job 1: In-flight job that queues normally in worker
				postMessageSpy.mockImplementationOnce(() => {
					// Normal postMessage - does not throw
				});

				const job1Promise = applyGrayscaleAsync(mockCtx1 as any, 1, 1, 1.08);

				// Verify Job 1 was sent to worker and pending job registered in map
				expect(postMessageSpy).toHaveBeenCalledTimes(1);
				expect(getPendingGrayscaleJobsCount()).toBe(1);
				const job1Call = postMessageSpy.mock.calls[0][0];
				const job1Id = job1Call.id;

				// Job 2: Synchronous postMessage error (e.g. detached ArrayBuffer / DataCloneError)
				const syncError = new Error('DataCloneError: ArrayBuffer at transfer list is detached');
				postMessageSpy.mockImplementationOnce(() => {
					throw syncError;
				});

				clearTimeoutSpy.mockClear();

				// Job 2 should catch synchronous error, cancel timer, remove from pending map, and fallback to main thread
				await applyGrayscaleAsync(mockCtx2 as any, 1, 1, 1.08);

				// 1. Timer cancelled for Job 2
				expect(clearTimeoutSpy).toHaveBeenCalled();

				// 2. Fallback to main thread succeeded for Job 2
				expect(mockCtx2.putImageData).toHaveBeenCalledTimes(1);

				// 3. Worker was NOT terminated by Job 2 synchronous failure
				expect(terminateSpy).not.toHaveBeenCalled();

				// 4. Job 1 is STILL alive and unaffected in pendingGrayscaleJobs
				expect(getPendingGrayscaleJobsCount()).toBe(1);

				// Now simulate worker responding successfully for Job 1
				mockWorkerInstance.onmessage({
					data: {
						id: job1Id,
						type: 'success',
						buffer: new Uint8Array([100, 100, 100, 255]).buffer
					}
				});

				await job1Promise;

				// Job 1 completed successfully and painted its output
				expect(mockCtx1.putImageData).toHaveBeenCalledTimes(1);
				expect(getPendingGrayscaleJobsCount()).toBe(0);
			} finally {
				cleanupGrayscaleWorker(true);
				clearTimeoutSpy.mockRestore();
				if (originalWorker !== undefined) {
					(globalThis as any).Worker = originalWorker;
				} else {
					delete (globalThis as any).Worker;
				}
				if (originalWindowWorker !== undefined) {
					(globalThis as any).window.Worker = originalWindowWorker;
				} else if ((globalThis as any).window) {
					delete (globalThis as any).window.Worker;
				}
			}
		});

		it('should benchmark grayscale buffer processing and verify generous adaptive timeout margins across 1MP to 50MP', async () => {
			const { calculateGrayscaleTimeout } = await import('../src/lib/pdf-splitter/pdf-splitter');
			const { processGrayscaleBuffer } =
				await import('../src/lib/pdf-splitter/pdf-grayscale.worker');

			// Test matrix representing realistic PDF page resolutions:
			// 1. Text PDF standard: ~1 MP (800x1250)
			// 2. 200 DPI scan (A4 default): ~4 MP (1654x2338)
			// 3. 300 DPI scan (A4 high-res): ~8.7 MP (2480x3508)
			// 4. 600 DPI scan / full-bleed photo: ~24 MP (4000x6000)
			// 5. Extreme double-page / art-book: ~50 MP (6000x8333)
			const testResolutions = [
				{ name: '1MP Text page', width: 800, height: 1250, pixels: 1_000_000 },
				{ name: '4MP A4 200 DPI scan', width: 1654, height: 2338, pixels: 3_867_052 },
				{ name: '8.7MP A4 300 DPI scan', width: 2480, height: 3508, pixels: 8_699_840 },
				{ name: '24MP 600 DPI / large photo', width: 4000, height: 6000, pixels: 24_000_000 },
				{ name: '50MP extreme double-spread', width: 6000, height: 8333, pixels: 49_998_000 }
			];

			for (const res of testResolutions) {
				const timeoutMs = calculateGrayscaleTimeout(res.width, res.height);

				// Adaptive timeout bounds checks
				expect(timeoutMs).toBeGreaterThanOrEqual(15000);
				expect(timeoutMs).toBeLessThanOrEqual(60000);

				// Allocate test buffer (RGBA = 4 bytes per pixel)
				const sampleBuffer = new Uint8Array(res.pixels * 4);
				// Fill sample gradient
				for (let i = 0; i < Math.min(1000, sampleBuffer.length); i += 4) {
					sampleBuffer[i] = 120;
					sampleBuffer[i + 1] = 140;
					sampleBuffer[i + 2] = 160;
					sampleBuffer[i + 3] = 255;
				}

				const startNs = process.hrtime.bigint();
				const resultBuffer = processGrayscaleBuffer(sampleBuffer.buffer, 1.08);
				const elapsedMs = Number(process.hrtime.bigint() - startNs) / 1_000_000;

				expect(resultBuffer.byteLength).toBe(res.pixels * 4);

				// Verify headroom: adaptive timeout must be at least 3x larger than execution time
				const safetyMarginFactor = Math.round(timeoutMs / Math.max(1, elapsedMs));
				expect(safetyMarginFactor).toBeGreaterThan(3);
			}
		}, 60000);

		it('should load a single document instance and clean it up upon completion', async () => {
			mockPdfjsLib.getDocument.mockClear();
			mockDoc.destroy.mockClear();

			const result = await processPdfToJpg(fakeFile, true, 0, 0);

			expect(result.numPages).toBe(2);
			// Confirms single document instance reused: getDocument called exactly once (no probeDoc, no per-thread docs)
			expect(mockPdfjsLib.getDocument).toHaveBeenCalledTimes(1);
			expect(mockDoc.destroy).toHaveBeenCalledTimes(1);
		});

		it('should use URL.createObjectURL when available and revoke it after processing', async () => {
			const realFile = new File(['mock-pdf-binary-data'], 'sample.pdf', {
				type: 'application/pdf'
			});

			const originalCreateObjectURL = URL.createObjectURL;
			const originalRevokeObjectURL = URL.revokeObjectURL;

			const mockCreateObjectURL = vi.fn().mockReturnValue('blob:http://localhost/mock-uuid');
			const mockRevokeObjectURL = vi.fn();

			URL.createObjectURL = mockCreateObjectURL;
			URL.revokeObjectURL = mockRevokeObjectURL;

			mockPdfjsLib.getDocument.mockClear();

			try {
				await processPdfToJpg(realFile, true, 0, 0);

				expect(mockCreateObjectURL).toHaveBeenCalledWith(realFile);
				expect(mockPdfjsLib.getDocument).toHaveBeenCalledWith({
					url: 'blob:http://localhost/mock-uuid',
					isEvalSupported: false
				});
				expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:http://localhost/mock-uuid');
			} finally {
				URL.createObjectURL = originalCreateObjectURL;
				URL.revokeObjectURL = originalRevokeObjectURL;
			}
		});

		it('should abort processPdfToJpg when signal is aborted', async () => {
			const ac = new AbortController();
			ac.abort();

			await expect(processPdfToJpg(fakeFile, true, 0, 0, undefined, ac.signal)).rejects.toThrow(
				'Tác vụ xử lý PDF đã bị hủy'
			);
		});

		it('should throw explicit error when canvas.toBlob returns null instead of silently skipping', async () => {
			mockDoc.numPages = 1;
			// Temporarily mock canvas.toBlob to resolve null
			const originalCreateElement = document.createElement;
			document.createElement = vi.fn().mockImplementation((type: string) => {
				if (type === 'canvas') {
					return {
						width: 100,
						height: 200,
						getContext: vi.fn().mockReturnValue({
							drawImage: vi.fn(),
							getImageData: vi.fn().mockReturnValue({ data: new Uint8Array(4) }),
							putImageData: vi.fn()
						}),
						toBlob: vi.fn().mockImplementation((cb: (blob: Blob | null) => void) => {
							cb(null); // Simulate OOM / canvas size limit failure
						})
					};
				}
				return originalCreateElement(type);
			});

			try {
				await expect(processPdfToJpg(fakeFile, true, 0, 0)).rejects.toThrow(
					/Không thể xuất hình ảnh cho trang 1/
				);
			} finally {
				document.createElement = originalCreateElement;
			}
		});

		it('should throw explicit error when canvas context cannot be initialized', async () => {
			mockDoc.numPages = 1;
			const originalCreateElement = document.createElement;
			document.createElement = vi.fn().mockImplementation((type: string) => {
				if (type === 'canvas') {
					return {
						width: 100,
						height: 200,
						getContext: vi.fn().mockReturnValue(null) // Context creation failed
					};
				}
				return originalCreateElement(type);
			});

			try {
				await expect(processPdfToJpg(fakeFile, true, 0, 0)).rejects.toThrow(
					/Không thể khởi tạo Canvas 2D context cho trang 1/
				);
			} finally {
				document.createElement = originalCreateElement;
			}
		});
	});

	describe('getClampedViewport', () => {
		it('should keep default scale 2.0 when dimensions are well within safe bounds', () => {
			const page = {
				getViewport: vi.fn().mockImplementation(({ scale }: { scale: number }) => ({
					width: 600 * scale,
					height: 800 * scale
				}))
			} as any;

			const vp = getClampedViewport(page, 2.0);
			expect(page.getViewport).toHaveBeenCalledWith({ scale: 2.0 });
			expect(vp.width).toBe(1200);
			expect(vp.height).toBe(1600);
		});

		it('should scale down when page dimension exceeds MAX_CANVAS_DIMENSION (e.g. 5000px)', () => {
			const page = {
				getViewport: vi.fn().mockImplementation(({ scale }: { scale: number }) => ({
					width: 3000 * scale,
					height: 5000 * scale
				}))
			} as any;

			const vp = getClampedViewport(page, 2.0);
			expect(vp.height).toBeLessThanOrEqual(MAX_CANVAS_DIMENSION);
			expect(vp.width).toBeLessThanOrEqual(MAX_CANVAS_DIMENSION);
		});

		it('should scale down when total pixels exceed MAX_CANVAS_PIXELS', () => {
			const page = {
				getViewport: vi.fn().mockImplementation(({ scale }: { scale: number }) => ({
					width: 3500 * scale,
					height: 3500 * scale
				}))
			} as any;

			const vp = getClampedViewport(page, 2.0);
			const totalPixels = vp.width * vp.height;
			expect(totalPixels).toBeLessThanOrEqual(MAX_CANVAS_PIXELS + 1);
		});
	});

	describe('multi-part ZIP splitting in processPdfToJpg', () => {
		it('should split 5 pages into 3 parts when maxPagesPerPart is 2', async () => {
			const fakeFile = new File(['mock-pdf-content'], 'scan-book.pdf', {
				type: 'application/pdf'
			});
			mockDoc.numPages = 5;

			const result = await processPdfToJpg(fakeFile, true, 0, 0, undefined, undefined, 2);

			expect(result.numPages).toBe(5);
			expect(result.zipParts).toHaveLength(3);

			// Part 1
			expect(result.zipParts[0]).toMatchObject({
				partIndex: 1,
				totalParts: 3,
				startPage: 1,
				endPage: 2,
				filename: 'scan-book-part1-pages1-2.zip'
			});
			expect(result.zipParts[0].blob).toBeDefined();

			// Part 2
			expect(result.zipParts[1]).toMatchObject({
				partIndex: 2,
				totalParts: 3,
				startPage: 3,
				endPage: 4,
				filename: 'scan-book-part2-pages3-4.zip'
			});

			// Part 3
			expect(result.zipParts[2]).toMatchObject({
				partIndex: 3,
				totalParts: 3,
				startPage: 5,
				endPage: 5,
				filename: 'scan-book-part3-pages5-5.zip'
			});

			// Primary zipBlob references part 1 for backward compatibility
			expect(result.zipBlob).toBe(result.zipParts[0].blob);
		});

		it('should produce a single part with standard filename when pages <= maxPagesPerPart', async () => {
			const fakeFile = new File(['mock-pdf-content'], 'small-doc.pdf', {
				type: 'application/pdf'
			});
			mockDoc.numPages = 2;

			const result = await processPdfToJpg(fakeFile, true, 0, 0, undefined, undefined, 200);

			expect(result.numPages).toBe(2);
			expect(result.zipParts).toHaveLength(1);
			expect(result.zipParts[0]).toMatchObject({
				partIndex: 1,
				totalParts: 1,
				startPage: 1,
				endPage: 2,
				filename: 'small-doc-pages.zip'
			});
		});
	});

	describe('renderPdfPageToBlob', () => {
		it('should render a PDF page to Blob from a File or Blob with object URL cleanup', async () => {
			const fakeBlob = new Blob(['pdf-bytes'], { type: 'application/pdf' });
			mockDoc.numPages = 1;

			const originalCreateObjectURL = URL.createObjectURL;
			const originalRevokeObjectURL = URL.revokeObjectURL;
			const mockCreate = vi.fn().mockReturnValue('blob:http://localhost/test-uuid');
			const mockRevoke = vi.fn();
			URL.createObjectURL = mockCreate;
			URL.revokeObjectURL = mockRevoke;

			try {
				const blob = await renderPdfPageToBlob(fakeBlob, 1, 2.0, 0.9);
				expect(blob).toBeInstanceOf(Blob);
				expect(mockCreate).toHaveBeenCalledWith(fakeBlob);
				expect(mockRevoke).toHaveBeenCalledWith('blob:http://localhost/test-uuid');
				expect(mockDoc.destroy).toHaveBeenCalled();
			} finally {
				URL.createObjectURL = originalCreateObjectURL;
				URL.revokeObjectURL = originalRevokeObjectURL;
			}
		});

		it('should render a PDF page from ArrayBuffer input', async () => {
			const ab = new ArrayBuffer(16);
			mockDoc.numPages = 1;

			const blob = await renderPdfPageToBlob(ab, 1, 1.5, 0.85);
			expect(blob).toBeInstanceOf(Blob);
			expect(mockPdfjsLib.getDocument).toHaveBeenCalledWith({ data: ab, isEvalSupported: false });
		});

		it('should throw if pdfjsLib is missing', async () => {
			const originalPdfjs = (globalThis as any).window.pdfjsLib;
			(globalThis as any).window.pdfjsLib = undefined;

			try {
				await expect(renderPdfPageToBlob(new Uint8Array(8), 1)).rejects.toThrow(
					'Thư viện PDF.js chưa sẵn sàng.'
				);
			} finally {
				(globalThis as any).window.pdfjsLib = originalPdfjs;
			}
		});

		it('should throw if toBlob returns null', async () => {
			const originalCreateElement = document.createElement;
			document.createElement = vi.fn().mockImplementation((type: string) => {
				if (type === 'canvas') {
					return {
						width: 0,
						height: 0,
						getContext: vi.fn().mockReturnValue({
							getImageData: vi.fn().mockReturnValue({ data: new Uint8Array(10) }),
							putImageData: vi.fn()
						}),
						toBlob: vi.fn().mockImplementation((resolve: (blob: Blob | null) => void) => {
							resolve(null);
						})
					};
				}
				return originalCreateElement(type);
			});

			try {
				await expect(renderPdfPageToBlob(new Uint8Array(8), 1)).rejects.toThrow(
					'Không thể xuất Blob từ Canvas cho trang PDF.'
				);
			} finally {
				document.createElement = originalCreateElement;
			}
		});
	});

	describe('advanced features in processPdfToJpg and PdfSplitterState', () => {
		it('should support page range (startPage and endPage)', async () => {
			const fakeFile = new File(['mock-pdf-content'], 'scan-book.pdf', {
				type: 'application/pdf'
			});
			mockDoc.numPages = 6;

			const result = await processPdfToJpg(fakeFile, {
				startPage: 2,
				endPage: 4,
				keepColor: true
			});

			expect(result.processedPages).toBe(3);
			expect(result.numPages).toBe(6);
			expect(result.zipParts[0].startPage).toBe(2);
			expect(result.zipParts[0].endPage).toBe(4);
		});

		it('should dynamically split by byte ceiling (maxPartBytes)', async () => {
			const fakeFile = new File(['mock-pdf-content'], 'heavy-scan.pdf', {
				type: 'application/pdf'
			});
			mockDoc.numPages = 4;

			// Set maxPartBytes low so each page triggers a part
			const result = await processPdfToJpg(fakeFile, {
				maxPartBytes: 10,
				keepColor: true
			});

			expect(result.processedPages).toBe(4);
			expect(result.zipParts.length).toBeGreaterThanOrEqual(2);
		});

		it('should retry page at lower scale when canvas rendering fails on first attempt', async () => {
			const fakeFile = new File(['mock-pdf-content'], 'retry-test.pdf', {
				type: 'application/pdf'
			});
			mockDoc.numPages = 1;

			let attempt = 0;
			const originalCreateElement = document.createElement;
			document.createElement = vi.fn().mockImplementation((type: string) => {
				if (type === 'canvas') {
					attempt++;
					return {
						width: 100,
						height: 200,
						getContext: vi.fn().mockReturnValue({
							getImageData: vi.fn().mockReturnValue({ data: new Uint8Array(4) }),
							putImageData: vi.fn()
						}),
						toBlob: vi.fn().mockImplementation((cb: (blob: Blob | null) => void) => {
							if (attempt === 1) {
								cb(null); // Fail first attempt
							} else {
								cb(new Blob(['success-after-retry'])); // Succeed on retry
							}
						})
					};
				}
				return originalCreateElement(type);
			});

			try {
				const result = await processPdfToJpg(fakeFile, {
					keepColor: true
				});
				expect(result.processedPages).toBe(1);
				expect(attempt).toBeGreaterThan(1);
				expect(result.degradedPages).toEqual([1]);
			} finally {
				document.createElement = originalCreateElement;
			}
		});

		it('should stream write to disk and release Blob from RAM when dirHandle is provided', async () => {
			const fakeFile = new File(['mock-pdf-content'], 'disk-stream.pdf', {
				type: 'application/pdf'
			});
			mockDoc.numPages = 2;

			const mockWritable = {
				write: vi.fn().mockResolvedValue(undefined),
				close: vi.fn().mockResolvedValue(undefined)
			};
			const mockFileHandle = {
				createWritable: vi.fn().mockResolvedValue(mockWritable)
			};
			const mockDirHandle = {
				name: 'MyOutputFolder',
				getFileHandle: vi.fn().mockResolvedValue(mockFileHandle)
			} as unknown as FileSystemDirectoryHandle;

			const result = await processPdfToJpg(fakeFile, {
				dirHandle: mockDirHandle,
				keepColor: true
			});

			expect(result.savedDirectoryName).toBe('MyOutputFolder');
			expect(mockDirHandle.getFileHandle).toHaveBeenCalled();
			expect(mockWritable.write).toHaveBeenCalled();
			expect(mockWritable.close).toHaveBeenCalled();
			// RAM freed: Blob should be undefined in zipParts when savedToDisk is true
			expect(result.zipParts[0].savedToDisk).toBe(true);
			expect(result.zipParts[0].blob).toBeUndefined();
			expect(result.zipBlob).toBeUndefined();
		});

		it('should disable download and not trigger download when saved to disk', () => {
			const state = new PdfSplitterState();
			state.savedDirectoryName = 'MyFolder';
			state.pdfZipBlob = null;
			state.pdfZipParts = [
				{
					partIndex: 1,
					totalParts: 1,
					startPage: 1,
					endPage: 2,
					filename: 'test.zip',
					sizeBytes: 100,
					savedToDisk: true
				}
			];

			expect(state.isSavedToDisk).toBe(true);
			expect(state.canDownloadZip).toBe(false);

			mockAnchor.click.mockClear();
			state.downloadZip();
			expect(mockAnchor.click).not.toHaveBeenCalled();
		});

		it('should enable download when valid non-empty zip blob is present', () => {
			const state = new PdfSplitterState();
			state.pdfZipBlob = new Blob(['sample-data']);
			state.pdfZipParts = [
				{
					partIndex: 1,
					totalParts: 1,
					startPage: 1,
					endPage: 2,
					blob: state.pdfZipBlob,
					filename: 'test.zip',
					sizeBytes: 11
				}
			];

			expect(state.isSavedToDisk).toBe(false);
			expect(state.canDownloadZip).toBe(true);
		});

		it('should support releasing part blob in PdfSplitterState', () => {
			const state = new PdfSplitterState();
			state.pdfZipParts = [
				{
					partIndex: 1,
					totalParts: 1,
					startPage: 1,
					endPage: 2,
					blob: new Blob(['test-data']),
					filename: 'test.zip',
					sizeBytes: 9
				}
			];
			expect(state.pdfZipParts[0].blob).toBeDefined();

			state.releasePartBlob(0);
			expect(state.pdfZipParts[0].blob).toBeUndefined();
		});

		it('should pad page filenames with zeros (e.g., page0001.jpg, page0002.jpg) for OCR lexical sorting', async () => {
			const fakeFile = new File(['mock-pdf-content'], 'ocr-scan.pdf', {
				type: 'application/pdf'
			});
			mockDoc.numPages = 12;

			const zipInstance = new JSZip();
			vi.clearAllMocks();

			await processPdfToJpg(fakeFile, {
				startPage: 1,
				endPage: 2,
				keepColor: true
			});

			expect(zipInstance.file).toHaveBeenCalledWith(
				'page0001.jpg',
				expect.any(Blob),
				expect.objectContaining({ compression: 'STORE' })
			);
			expect(zipInstance.file).toHaveBeenCalledWith(
				'page0002.jpg',
				expect.any(Blob),
				expect.objectContaining({ compression: 'STORE' })
			);
		});

		it('should default to 200 DPI and convert targetDpi correctly to viewport scale', async () => {
			expect(DEFAULT_DPI).toBe(200);
			expect(dpiToScale(200)).toBeCloseTo(200 / 72, 4);
			expect(dpiToScale(150)).toBeCloseTo(150 / 72, 4);
			expect(dpiToScale(300)).toBeCloseTo(300 / 72, 4);

			const fakeFile = new File(['mock-pdf-content'], 'dpi-test.pdf', {
				type: 'application/pdf'
			});
			mockDoc.numPages = 1;
			mockPage.getViewport.mockClear();

			// Test custom 150 DPI
			await processPdfToJpg(fakeFile, {
				targetDpi: 150,
				keepColor: true
			});
			expect(mockPage.getViewport).toHaveBeenCalledWith(
				expect.objectContaining({ scale: 150 / 72 })
			);

			// Test state defaults
			const state = new PdfSplitterState();
			expect(DEFAULT_DPI).toBe(200);
			expect(state.degradedPages).toEqual([]);
		});

		it('should auto-download parts and apply sliding window memory retention when autoDownloadParts is true', async () => {
			const fakeFile = new File(['mock-pdf-content'], 'test-auto-dl.pdf', {
				type: 'application/pdf'
			});
			mockDoc.numPages = 3;

			// Split with maxPagesPerPart = 1 to generate 3 parts
			const result = await processPdfToJpg(fakeFile, {
				autoDownloadParts: true,
				maxPagesPerPart: 1,
				keepColor: true
			});

			expect(result.zipParts.length).toBe(3);
			expect(result.zipParts[0].downloadTriggered).toBe(true);
			expect(result.zipParts[1].downloadTriggered).toBe(true);
			expect(result.zipParts[2].downloadTriggered).toBe(true);

			// Under sliding window (MAX_AUTO_RETAINED_PARTS = 2):
			// Part 1 blob is released to cap RAM
			expect(result.zipParts[0].blob).toBeUndefined();
			expect(result.zipParts[0].blobReleased).toBe(true);

			// Parts 2 and 3 blobs are retained in safety window
			expect(result.zipParts[1].blob).toBeDefined();
			expect(result.zipParts[2].blob).toBeDefined();

			expect(mockAnchor.click).toHaveBeenCalled();
		});

		it('should not prematurely clear processing flag when a second processPdf is launched while first is in-flight', async () => {
			const fakeFile = new File(['mock-pdf-content'], 'race-test.pdf', {
				type: 'application/pdf'
			});
			mockDoc.numPages = 2;

			const state = new PdfSplitterState();
			state.handleFile(fakeFile);

			const p1 = state.processPdf();
			expect(state.processing).toBe(true);

			const p2 = state.processPdf();
			expect(state.processing).toBe(true);

			await Promise.all([p1, p2]);
			expect(state.processing).toBe(false);
			expect(state.pdfZipBlob).toBeDefined();
		});

		it('should abort in-flight processPdf and prevent stale results from polluting state when handleFile is called', async () => {
			const fileA = new File(['mock-pdf-a'], 'document-a.pdf', {
				type: 'application/pdf'
			});
			const fileB = new File(['mock-pdf-b'], 'document-b.pdf', {
				type: 'application/pdf'
			});
			mockDoc.numPages = 2;

			const state = new PdfSplitterState();
			state.handleFile(fileA);

			const taskA = state.processPdf();
			expect(state.processing).toBe(true);

			// User switches to file B mid-flight
			state.handleFile(fileB);
			expect(state.processing).toBe(false);
			expect(state.pdfSelectedFile?.name).toBe('document-b.pdf');

			await taskA;

			// Even after taskA completes/aborts, fileB's state must not be overwritten by taskA's results
			expect(state.pdfSelectedFile?.name).toBe('document-b.pdf');
			expect(state.pdfZipBlob).toBeNull();
			expect(state.pdfZipParts).toEqual([]);
		});

		it('should cancel and ignore in-flight loadPreview when handleFile is called with a new file', async () => {
			const fileA = new File(['mock-pdf-a'], 'doc-a.pdf', {
				type: 'application/pdf'
			});
			const fileB = new File(['mock-pdf-b'], 'doc-b.pdf', {
				type: 'application/pdf'
			});
			mockDoc.numPages = 2;

			const state = new PdfSplitterState();
			state.handleFile(fileA);

			const prevA = state.loadPreview();
			expect(state.loadingPreview).toBe(true);

			// User switches to file B mid-flight
			state.handleFile(fileB);
			expect(state.loadingPreview).toBe(false);
			expect(state.previewPages).toEqual([]);

			await prevA;

			// After prevA settles, previewPages must remain empty for file B
			expect(state.previewPages).toEqual([]);
			expect(state.loadingPreview).toBe(false);
		});

		it('should isolate rapid consecutive loadPreview requests to keep only the latest request results', async () => {
			const file = new File(['mock-pdf'], 'doc-preview.pdf', {
				type: 'application/pdf'
			});
			mockDoc.numPages = 2;

			const state = new PdfSplitterState();
			state.handleFile(file);

			const prev1 = state.loadPreview();
			const prev2 = state.loadPreview();

			await Promise.all([prev1, prev2]);

			expect(state.loadingPreview).toBe(false);
			expect(state.previewPages.length).toBe(2);
		});
	});
});
