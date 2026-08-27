// src/lib/utils/image-bg-remove.worker.ts
/// <reference lib="webworker" />

export interface WorkerRequest {
	id: string;
	imageBlob: Blob;
	maxWidth?: number;
	maxHeight?: number;
	padding?: number;
	alphaThreshold?: number;
}

export type WorkerResponse =
	| { id: string; type: 'progress'; percent: number; statusText: string }
	| { id: string; type: 'success'; blob: Blob; width: number; height: number }
	| { id: string; type: 'error'; error: string };

function sendProgress(id: string, percent: number, statusText: string): void {
	self.postMessage({
		id,
		type: 'progress',
		percent,
		statusText
	} as WorkerResponse);
}

/**
 * Pre-scale large images inside the worker to save memory and processing time.
 */
async function workerPreScale(blob: Blob, maxDim = 1024): Promise<Blob> {
	if (typeof createImageBitmap === 'undefined' || typeof OffscreenCanvas === 'undefined') {
		return blob;
	}
	try {
		const bitmap = await createImageBitmap(blob);
		const { width: w, height: h } = bitmap;
		if (w <= maxDim && h <= maxDim) {
			bitmap.close?.();
			return blob;
		}

		const scale = Math.min(maxDim / w, maxDim / h);
		const targetW = Math.max(1, Math.round(w * scale));
		const targetH = Math.max(1, Math.round(h * scale));

		const canvas = new OffscreenCanvas(targetW, targetH);
		const ctx = canvas.getContext('2d');
		if (!ctx) {
			bitmap.close?.();
			return blob;
		}

		ctx.imageSmoothingEnabled = true;
		ctx.imageSmoothingQuality = 'medium';
		ctx.drawImage(bitmap, 0, 0, targetW, targetH);
		bitmap.close?.();

		return await canvas.convertToBlob({ type: 'image/png', quality: 0.95 });
	} catch {
		return blob;
	}
}

/**
 * Fallback background removal using 2D OffscreenCanvas.
 */
async function workerFallbackBgRemove(blob: Blob): Promise<Blob> {
	const bitmap = await createImageBitmap(blob);
	const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
	const ctx = canvas.getContext('2d', { willReadFrequently: true });
	if (!ctx) {
		bitmap.close?.();
		return blob;
	}

	ctx.drawImage(bitmap, 0, 0);
	bitmap.close?.();

	const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
	const data = imgData.data;
	const len = data.length;

	// Sample 4 corners
	const corners = [
		0,
		(canvas.width - 1) * 4,
		(canvas.height - 1) * canvas.width * 4,
		(canvas.height * canvas.width - 1) * 4
	];

	let totalR = 0;
	let totalG = 0;
	let totalB = 0;
	let count = 0;

	for (const idx of corners) {
		if (idx >= 0 && idx + 2 < len) {
			totalR += data[idx];
			totalG += data[idx + 1];
			totalB += data[idx + 2];
			count++;
		}
	}

	const bgR = count > 0 ? Math.round(totalR / count) : 255;
	const bgG = count > 0 ? Math.round(totalG / count) : 255;
	const bgB = count > 0 ? Math.round(totalB / count) : 255;
	const threshold = 35;

	for (let i = 0; i < len; i += 4) {
		const r = data[i];
		const g = data[i + 1];
		const b = data[i + 2];
		const a = data[i + 3];

		if (a === 0) continue;

		const dist = Math.sqrt((r - bgR) ** 2 + (g - bgG) ** 2 + (b - bgB) ** 2);
		const isNearWhite = r > 240 && g > 240 && b > 240;

		if (dist < threshold || isNearWhite) {
			data[i + 3] = 0;
		} else if (dist < threshold * 1.5) {
			const factor = (dist - threshold) / (threshold * 0.5);
			data[i + 3] = Math.round(a * Math.max(0, Math.min(1, factor)));
		}
	}

	ctx.putImageData(imgData, 0, 0);
	return await canvas.convertToBlob({ type: 'image/png', quality: 0.92 });
}

/**
 * Auto-crop transparent boundaries on OffscreenCanvas.
 */
function workerAutoCrop(
	canvas: OffscreenCanvas,
	padding = 4,
	alphaThreshold = 10
): OffscreenCanvas {
	const ctx = canvas.getContext('2d', { willReadFrequently: true });
	if (!ctx || canvas.width === 0 || canvas.height === 0) return canvas;

	const { width, height } = canvas;
	const imgData = ctx.getImageData(0, 0, width, height);
	const data = imgData.data;

	let minX = width;
	let minY = height;
	let maxX = -1;
	let maxY = -1;

	for (let y = 0; y < height; y++) {
		const rowOffset = y * width * 4;
		for (let x = 0; x < width; x++) {
			const alpha = data[rowOffset + x * 4 + 3];
			if (alpha > alphaThreshold) {
				if (x < minX) minX = x;
				if (x > maxX) maxX = x;
				if (y < minY) minY = y;
				if (y > maxY) maxY = y;
			}
		}
	}

	if (maxX < minX || maxY < minY) {
		return canvas;
	}

	const cropX = Math.max(0, minX - padding);
	const cropY = Math.max(0, minY - padding);
	const cropMaxX = Math.min(width - 1, maxX + padding);
	const cropMaxY = Math.min(height - 1, maxY + padding);

	const cropWidth = cropMaxX - cropX + 1;
	const cropHeight = cropMaxY - cropY + 1;

	const cropped = new OffscreenCanvas(cropWidth, cropHeight);
	const croppedCtx = cropped.getContext('2d');
	if (!croppedCtx) return canvas;

	croppedCtx.drawImage(canvas, cropX, cropY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);

	return cropped;
}

/**
 * Resize and compress OffscreenCanvas for EPUB.
 */
function workerResize(canvas: OffscreenCanvas, maxWidth = 800, maxHeight = 400): OffscreenCanvas {
	const { width, height } = canvas;
	if (width <= maxWidth && height <= maxHeight) {
		return canvas;
	}

	const scale = Math.min(maxWidth / width, maxHeight / height, 1.0);
	const targetWidth = Math.max(1, Math.round(width * scale));
	const targetHeight = Math.max(1, Math.round(height * scale));

	const resized = new OffscreenCanvas(targetWidth, targetHeight);
	const ctx = resized.getContext('2d');
	if (!ctx) return canvas;

	ctx.imageSmoothingEnabled = true;
	ctx.imageSmoothingQuality = 'high';
	ctx.drawImage(canvas, 0, 0, targetWidth, targetHeight);

	return resized;
}

self.onmessage = async (e: MessageEvent<WorkerRequest>) => {
	const {
		id,
		imageBlob,
		maxWidth = 800,
		maxHeight = 400,
		padding = 4,
		alphaThreshold = 10
	} = e.data;

	try {
		sendProgress(id, 5, 'Đang làm ảo thuật...');

		// 1. Pre-scale if large
		const scaledBlob = await workerPreScale(imageBlob, 1024);

		// 2. Background removal via ML with fallback
		let transparentBlob: Blob;
		try {
			const { removeBackground } = await import('@imgly/background-removal');
			transparentBlob = await removeBackground(scaledBlob, {
				model: 'isnet_quint8',
				output: {
					format: 'image/png',
					quality: 0.95
				},
				progress: (key: string, current: number, total: number) => {
					const ratio = total > 0 ? Math.min(1, Math.max(0, current / total)) : 0;
					const percent = Math.round(ratio * 100);

					if (key.includes('fetch') || key.includes('download')) {
						sendProgress(id, percent, `Đang chuẩn bị phép thuật... (${percent}%)`);
					} else if (key.includes('compute') || key.includes('inference')) {
						sendProgress(id, percent, `Đang làm ảo thuật... (${percent}%)`);
					} else {
						sendProgress(id, percent, `Đang xử lý hình ảnh... (${percent}%)`);
					}
				}
			});
		} catch (mlErr) {
			console.warn('[Worker ML failed, using fallback]', mlErr);
			sendProgress(id, 50, 'Đang tách nền tự động (fallback)...');
			transparentBlob = await workerFallbackBgRemove(scaledBlob);
		}

		sendProgress(id, 80, 'Đang cắt viền thừa (Auto-crop)...');

		// 3. Auto-crop
		const bitmap = await createImageBitmap(transparentBlob);
		let canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
		const ctx = canvas.getContext('2d');
		if (ctx) {
			ctx.drawImage(bitmap, 0, 0);
		}
		bitmap.close?.();

		canvas = workerAutoCrop(canvas, padding, alphaThreshold);

		sendProgress(id, 90, 'Đang tối ưu dung lượng cho EPUB...');

		// 4. Resize / Compress
		canvas = workerResize(canvas, maxWidth, maxHeight);

		// 5. Convert to Blob
		const finalBlob = await canvas.convertToBlob({
			type: 'image/png',
			quality: 0.92
		});

		sendProgress(id, 100, 'Đã hoàn tất tối ưu');

		const response: WorkerResponse = {
			id,
			type: 'success',
			blob: finalBlob,
			width: canvas.width,
			height: canvas.height
		};
		self.postMessage(response);
	} catch (err: unknown) {
		const errorMsg = err instanceof Error ? err.message : String(err);
		const response: WorkerResponse = {
			id,
			type: 'error',
			error: errorMsg
		};
		self.postMessage(response);
	}
};
