import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
	autoCropTransparentCanvas,
	compressAndResizeCanvas,
	removeOrnamentBackground,
	removeImageBackgroundML,
	removeImageBackgroundFallback,
	processOrnamentImage,
	loadImage,
	canvasToBlob
} from '../src/lib/utils/image-bg-remove-ml';
import { EpubImagesState } from '../src/lib/epub-packer/state/epub-images-state.svelte';

vi.mock('@imgly/background-removal', () => {
	return {
		removeBackground: vi.fn().mockImplementation(async (_source, config) => {
			config?.progress?.('fetch:download', 100, 100);
			config?.progress?.('compute:inference', 100, 100);
			return new Blob(['mock-ml-output'], { type: 'image/png' });
		})
	};
});

describe('image background removal and ornament optimization', () => {
	let originalDocument: typeof globalThis.document;
	let originalImage: typeof globalThis.Image;
	let originalUrl: typeof globalThis.URL;

	beforeEach(() => {
		originalDocument = globalThis.document;
		originalImage = globalThis.Image;
		originalUrl = globalThis.URL;

		// Mock Image
		globalThis.Image = class {
			onload: (() => void) | null = null;
			onerror: ((err: any) => void) | null = null;
			naturalWidth = 20;
			naturalHeight = 20;
			set src(_val: string) {
				setTimeout(() => this.onload?.(), 0);
			}
		} as any;

		// Mock URL
		globalThis.URL.createObjectURL = vi.fn().mockReturnValue('blob:http://localhost/dummy-url');
		globalThis.URL.revokeObjectURL = vi.fn();

		// Mock document
		(globalThis as any).document = {
			createElement: (tag: string) => {
				if (tag === 'canvas') {
					return {
						width: 20,
						height: 20,
						getContext: () => ({
							drawImage: vi.fn(),
							getImageData: () => ({
								data: new Uint8ClampedArray(20 * 20 * 4).fill(255),
								width: 20,
								height: 20
							}),
							putImageData: vi.fn(),
							imageSmoothingEnabled: true,
							imageSmoothingQuality: 'high'
						}),
						toBlob: (cb: (blob: Blob | null) => void) => {
							cb(new Blob(['mock-png'], { type: 'image/png' }));
						}
					};
				}
				return {};
			}
		};
	});

	afterEach(() => {
		globalThis.document = originalDocument;
		globalThis.Image = originalImage;
		globalThis.URL = originalUrl;
		vi.clearAllMocks();
	});

	describe('loadImage & canvasToBlob', () => {
		it('should load image from source', async () => {
			const blob = new Blob(['data'], { type: 'image/png' });
			const img = await loadImage(blob);
			expect(img).toBeDefined();
			expect(img.naturalWidth).toBe(20);
		});

		it('should convert canvas to blob', async () => {
			const canvas = document.createElement('canvas') as HTMLCanvasElement;
			const blob = await canvasToBlob(canvas);
			expect(blob).toBeDefined();
			expect(blob.type).toBe('image/png');
		});
	});

	describe('autoCropTransparentCanvas', () => {
		it('should return the canvas if context is not available or canvas is 0x0', () => {
			const canvas = { width: 0, height: 0, getContext: () => null } as any;
			expect(autoCropTransparentCanvas(canvas)).toBe(canvas);
		});

		it('should crop out transparent margins and calculate bounding box correctly', () => {
			const width = 100;
			const height = 100;
			const data = new Uint8ClampedArray(width * height * 4); // All zeros (transparent)

			// Put non-transparent pixels in rect (x: 20..40, y: 30..50)
			for (let y = 30; y <= 50; y++) {
				for (let x = 20; x <= 40; x++) {
					const idx = (y * width + x) * 4;
					data[idx] = 255;
					data[idx + 1] = 0;
					data[idx + 2] = 0;
					data[idx + 3] = 255; // Solid opaque
				}
			}

			const mockCtx = {
				getImageData: vi.fn().mockReturnValue({ data, width, height }),
				drawImage: vi.fn()
			};

			const mockCanvas = {
				width,
				height,
				getContext: vi.fn().mockReturnValue(mockCtx)
			} as any;

			const cropped = autoCropTransparentCanvas(mockCanvas, 2, 10);
			expect(cropped).toBeDefined();
			expect(cropped.width).toBe(25);
			expect(cropped.height).toBe(25);
		});

		it('should handle completely transparent images by returning original canvas', () => {
			const width = 50;
			const height = 50;
			const data = new Uint8ClampedArray(width * height * 4); // All transparent

			const mockCtx = {
				getImageData: vi.fn().mockReturnValue({ data, width, height })
			};

			const mockCanvas = {
				width,
				height,
				getContext: vi.fn().mockReturnValue(mockCtx)
			} as any;

			const result = autoCropTransparentCanvas(mockCanvas);
			expect(result).toBe(mockCanvas);
		});
	});

	describe('compressAndResizeCanvas', () => {
		it('should return existing canvas if within max dimensions', () => {
			const canvas = { width: 400, height: 200 } as any;
			const result = compressAndResizeCanvas(canvas, 800, 400);
			expect(result).toBe(canvas);
		});

		it('should scale down proportionally when exceeding max dimensions', () => {
			const mockCtx = {
				drawImage: vi.fn(),
				imageSmoothingEnabled: false,
				imageSmoothingQuality: ''
			};

			(globalThis as any).document.createElement = vi.fn().mockImplementation((tag) => {
				if (tag === 'canvas') {
					return {
						width: 0,
						height: 0,
						getContext: vi.fn().mockReturnValue(mockCtx)
					} as any;
				}
				return {};
			});

			const canvas = { width: 1600, height: 800 } as any;
			const result = compressAndResizeCanvas(canvas, 800, 400);

			expect(result.width).toBe(800);
			expect(result.height).toBe(400);
			expect(mockCtx.drawImage).toHaveBeenCalledWith(canvas, 0, 0, 800, 400);
		});
	});

	describe('removeOrnamentBackground, ML, and fallback', () => {
		it('should remove background via ML model and report progress', async () => {
			const fakeBlob = new Blob(['test image data'], { type: 'image/png' });
			const onProgress = vi.fn();

			const result = await removeImageBackgroundML(fakeBlob, onProgress);
			expect(result).toBeDefined();
			expect(onProgress).toHaveBeenCalledWith(expect.stringContaining('phép thuật'), 100);
		});

		it('should run fallback canvas background removal directly', async () => {
			const fakeBlob = new Blob(['test image data'], { type: 'image/png' });
			const result = await removeImageBackgroundFallback(fakeBlob);
			expect(result).toBeDefined();
		});

		it('should fall back to canvas algorithm if ML fails', async () => {
			const { removeBackground } = await import('@imgly/background-removal');
			vi.mocked(removeBackground).mockRejectedValueOnce(new Error('Network error or WebAssembly unsupported'));

			const fakeBlob = new Blob(['test image data'], { type: 'image/png' });
			const onProgress = vi.fn();

			const result = await removeOrnamentBackground(fakeBlob as any, onProgress);
			expect(result).toBeDefined();
			expect(onProgress).toHaveBeenCalledWith(expect.stringContaining('fallback'), expect.any(Number));
		});

		it('should execute full processOrnamentImage pipeline', async () => {
			const fakeBlob = new Blob(['sample-img'], { type: 'image/png' });
			const onProgress = vi.fn();

			const result = await processOrnamentImage(fakeBlob as any, { onProgress });
			expect(result.blob).toBeDefined();
			expect(result.previewUrl).toBe('blob:http://localhost/dummy-url');
			expect(onProgress).toHaveBeenCalledWith(expect.stringMatching(/hoàn tất/i), 100);
		});
	});

	describe('EpubImagesState ornament handlers', () => {
		it('should handle chapter ornament upload, process it, and update state', async () => {
			const state = new EpubImagesState();
			const file = new File(['dummy content'], 'chap-ornament.jpg', { type: 'image/jpeg' });

			await state.handleChapterOrnamentFile(file);

			expect(state.chapterOrnamentFile).toBe(file);
			expect(state.chapterOrnamentBlob).toBeDefined();
			expect(state.chapterOrnamentPreviewUrl).toBe('blob:http://localhost/dummy-url');
			expect(state.chapterOrnamentStatus).toBe('Đã hoàn tất tối ưu');
			expect(state.chapterOrnamentIsProcessing).toBe(false);

			// Test removal
			state.removeChapterOrnamentFile();
			expect(state.chapterOrnamentFile).toBeNull();
			expect(state.chapterOrnamentBlob).toBeNull();
			expect(state.chapterOrnamentPreviewUrl).toBeNull();
			expect(globalThis.URL.revokeObjectURL).toHaveBeenCalledWith('blob:http://localhost/dummy-url');
		});

		it('should handle simultaneous chapter and subchapter ornament processing without crosstalk', async () => {
			const state = new EpubImagesState();
			const file1 = new File(['chap content'], 'chap-ornament.png', { type: 'image/png' });
			const file2 = new File(['subchap content'], 'subchap-ornament.png', { type: 'image/png' });

			// Launch both simultaneously
			const p1 = state.handleChapterOrnamentFile(file1);
			const p2 = state.handleSubchapterOrnamentFile(file2);

			await Promise.all([p1, p2]);

			expect(state.chapterOrnamentFile).toBe(file1);
			expect(state.chapterOrnamentBlob).toBeDefined();
			expect(state.chapterOrnamentStatus).toBe('Đã hoàn tất tối ưu');

			expect(state.subchapterOrnamentFile).toBe(file2);
			expect(state.subchapterOrnamentBlob).toBeDefined();
			expect(state.subchapterOrnamentStatus).toBe('Đã hoàn tất tối ưu');
		});

		it('should reject and set error when ornament file exceeds size limit', async () => {
			const state = new EpubImagesState();
			const hugeFile = new File([new ArrayBuffer(100)], 'huge-ornament.png', { type: 'image/png' });
			Object.defineProperty(hugeFile, 'size', { value: 35 * 1024 * 1024 });

			await state.handleChapterOrnamentFile(hugeFile);
			expect(state.chapterOrnamentError).toContain('Dung lượng');
			expect(state.chapterOrnamentStatus).toBe('Lỗi tệp quá lớn');
		});
	});
});


