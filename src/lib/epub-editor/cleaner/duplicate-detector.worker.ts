// src/lib/epub-editor/cleaner/duplicate-detector.worker.ts
/// <reference lib="webworker" />
import { sha1HexAsync } from '$lib/utils/crypto';
import type { DuplicateResourceItem } from './types';

export interface ScanItemInput {
	path: string;
	bytes: Uint8Array;
}

export interface DuplicateDetectorWorkerRequest {
	id: string;
	items: ScanItemInput[];
}

export type DuplicateDetectorWorkerResponse =
	| { id: string; type: 'progress'; current: number; total: number; filename: string }
	| { id: string; type: 'success'; duplicates: DuplicateResourceItem[] }
	| { id: string; type: 'error'; error: string };

/**
 * Pure function to scan item list and detect duplicates.
 * Exported for direct unit testing in Vitest without requiring Worker instances.
 */
export async function computeDuplicateResources(
	items: ScanItemInput[],
	onProgress?: (current: number, total: number, filename: string) => void
): Promise<DuplicateResourceItem[]> {
	const hashMap = new Map<string, { path: string; byteSize: number }>();
	const duplicates: DuplicateResourceItem[] = [];
	const total = items.length;

	for (let i = 0; i < total; i++) {
		const item = items[i];
		if (onProgress) {
			onProgress(i + 1, total, item.path);
		}

		const hash = await sha1HexAsync(item.bytes);

		if (hashMap.has(hash)) {
			const original = hashMap.get(hash)!;
			duplicates.push({
				originalPath: original.path,
				duplicatePath: item.path,
				byteSize: item.bytes.byteLength,
				hash
			});
		} else {
			hashMap.set(hash, { path: item.path, byteSize: item.bytes.byteLength });
		}
	}

	return duplicates;
}

if (typeof self !== 'undefined') {
	self.onmessage = async (e: MessageEvent<DuplicateDetectorWorkerRequest>) => {
		const { id, items } = e.data;
		try {
			const duplicates = await computeDuplicateResources(items, (current, total, filename) => {
				const response: DuplicateDetectorWorkerResponse = {
					id,
					type: 'progress',
					current,
					total,
					filename
				};
				self.postMessage(response);
			});

			const response: DuplicateDetectorWorkerResponse = {
				id,
				type: 'success',
				duplicates
			};
			self.postMessage(response);
		} catch (err: unknown) {
			const errorMsg = err instanceof Error ? err.message : String(err);
			const response: DuplicateDetectorWorkerResponse = {
				id,
				type: 'error',
				error: errorMsg
			};
			self.postMessage(response);
		}
	};
}
