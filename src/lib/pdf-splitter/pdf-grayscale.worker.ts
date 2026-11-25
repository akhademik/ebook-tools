// src/lib/pdf-splitter/pdf-grayscale.worker.ts
/// <reference lib="webworker" />

export interface GrayscaleWorkerRequest {
	id: string;
	buffer: ArrayBuffer;
	contrast: number;
}

export type GrayscaleWorkerResponse =
	| { id: string; type: 'success'; buffer: ArrayBuffer }
	| { id: string; type: 'error'; error: string };

/**
 * Pure function to apply grayscale and contrast directly on an ArrayBuffer.
 * Exported for testing or direct fallback.
 */
export function processGrayscaleBuffer(buffer: ArrayBuffer, contrast: number): ArrayBuffer {
	const d = new Uint8ClampedArray(buffer);
	const len = d.length;
	for (let i = 0; i < len; i += 4) {
		const gray = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
		let v = (gray - 128) * contrast + 128;
		v = v < 0 ? 0 : v > 255 ? 255 : v;
		d[i] = d[i + 1] = d[i + 2] = v;
	}
	return buffer;
}

if (typeof self !== 'undefined' && typeof self.postMessage === 'function') {
	self.onmessage = (e: MessageEvent<GrayscaleWorkerRequest>) => {
		const { id, buffer, contrast } = e.data;
		try {
			const processed = processGrayscaleBuffer(buffer, contrast);
			const response: GrayscaleWorkerResponse = { id, type: 'success', buffer: processed };
			self.postMessage(response, [processed]);
		} catch (err: unknown) {
			const errorMsg = err instanceof Error ? err.message : String(err);
			const response: GrayscaleWorkerResponse = { id, type: 'error', error: errorMsg };
			self.postMessage(response);
		}
	};
}
