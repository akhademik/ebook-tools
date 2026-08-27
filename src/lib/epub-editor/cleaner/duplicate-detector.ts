// src/lib/epub-editor/cleaner/duplicate-detector.ts
import type JSZip from 'jszip';
import { Logger } from '$lib/utils';
import type { DuplicateResourceItem } from './types';
import {
	computeDuplicateResources,
	type DuplicateDetectorWorkerRequest,
	type DuplicateDetectorWorkerResponse,
	type ScanItemInput
} from './duplicate-detector.worker';

let workerInstance: Worker | null = null;

function getDuplicateWorker(): Worker | null {
	if (typeof window === 'undefined' || typeof Worker === 'undefined') {
		return null;
	}
	if (!workerInstance) {
		try {
			workerInstance = new Worker(new URL('./duplicate-detector.worker.ts', import.meta.url), {
				type: 'module'
			});
		} catch (err) {
			Logger.warn(
				'[duplicate-detector]',
				'Failed to instantiate DuplicateDetector worker, falling back to direct run:',
				err
			);
			return null;
		}
	}
	return workerInstance;
}

/**
 * Scan all media resources (images, fonts, styles) in the EPUB to find bitwise duplicate files.
 * Uses Web Worker when running in browser to keep main thread fluid, with graceful fallback.
 */
export async function scanDuplicateResources(
	zip: JSZip,
	editBuffer?: Map<string, string>,
	onProgress?: (current: number, total: number, filename: string) => void,
	signal?: AbortSignal
): Promise<DuplicateResourceItem[]> {
	if (signal?.aborted) {
		throw new DOMException('Tác vụ quét tài nguyên đã bị hủy', 'AbortError');
	}

	const filePaths = Object.keys(zip.files).filter((p) => !zip.files[p].dir);
	const targetPaths = filePaths.filter((p) => {
		const ext = p.substring(p.lastIndexOf('.')).toLowerCase();
		return [
			'.jpg',
			'.jpeg',
			'.png',
			'.gif',
			'.svg',
			'.webp',
			'.ttf',
			'.otf',
			'.woff',
			'.woff2',
			'.css'
		].includes(ext);
	});

	if (targetPaths.length === 0) {
		return [];
	}

	const scanItems: ScanItemInput[] = [];
	for (const path of targetPaths) {
		if (signal?.aborted) {
			throw new DOMException('Tác vụ quét tài nguyên đã bị hủy', 'AbortError');
		}
		let bytes: Uint8Array;
		if (editBuffer && editBuffer.has(path)) {
			const text = editBuffer.get(path) || '';
			bytes = new TextEncoder().encode(text);
		} else {
			const file = zip.files[path];
			if (!file) continue;
			bytes = await file.async('uint8array');
		}
		scanItems.push({ path, bytes });
	}

	const worker = getDuplicateWorker();
	if (worker) {
		return new Promise((resolve, reject) => {
			const requestId = `scan-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

			const cleanup = () => {
				worker.removeEventListener('message', handleMessage);
				if (signal) {
					signal.removeEventListener('abort', handleAbort);
				}
			};

			const handleAbort = () => {
				cleanup();
				try {
					worker.terminate();
				} catch {
					// ignore
				}
				workerInstance = null;
				reject(new DOMException('Tác vụ quét tài nguyên đã bị hủy', 'AbortError'));
			};

			const handleMessage = (e: MessageEvent<DuplicateDetectorWorkerResponse>) => {
				if (e.data.id !== requestId) return;

				if (signal?.aborted) {
					cleanup();
					reject(new DOMException('Tác vụ quét tài nguyên đã bị hủy', 'AbortError'));
					return;
				}

				if (e.data.type === 'progress') {
					if (onProgress) {
						onProgress(e.data.current, e.data.total, e.data.filename);
					}
				} else if (e.data.type === 'success') {
					cleanup();
					resolve(e.data.duplicates);
				} else if (e.data.type === 'error') {
					cleanup();
					Logger.warn(
						'[duplicate-detector]',
						'Worker encountered error, falling back to direct computation:',
						e.data.error
					);
					resolve(computeDuplicateResources(scanItems, onProgress));
				}
			};

			if (signal) {
				if (signal.aborted) {
					reject(new DOMException('Tác vụ quét tài nguyên đã bị hủy', 'AbortError'));
					return;
				}
				signal.addEventListener('abort', handleAbort, { once: true });
			}

			worker.addEventListener('message', handleMessage);

			const request: DuplicateDetectorWorkerRequest = {
				id: requestId,
				items: scanItems
			};

			// Transfer array buffers if possible to eliminate clone overhead
			const transferables: Transferable[] = scanItems
				.map((item) => item.bytes.buffer)
				.filter((buf): buf is ArrayBuffer => buf instanceof ArrayBuffer && buf.byteLength > 0);

			try {
				worker.postMessage(request, transferables);
			} catch {
				// Fallback without transfer if browser doesn't permit detached buffer
				worker.postMessage(request);
			}
		});
	}

	return computeDuplicateResources(scanItems, onProgress);
}
