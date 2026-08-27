// src/lib/epub-packer/parser/txt-parser.worker.ts
/// <reference lib="webworker" />
import type { ParseTxtOptions, RawChapterItem } from '$lib/types';
import { parseTxtToChapters } from './txt-parser';

export interface ParseTxtWorkerRequest {
	id: string;
	txtText: string;
	options?: ParseTxtOptions;
	fallbackTitle?: string;
}

export type ParseTxtWorkerResponse =
	| { id: string; type: 'progress'; percent: number; statusText: string }
	| { id: string; type: 'success'; chapters: RawChapterItem[]; warnings?: string[] }
	| { id: string; type: 'error'; error: string };

if (typeof self !== 'undefined') {
	self.onmessage = async (e: MessageEvent<ParseTxtWorkerRequest>) => {
		const { id, txtText, options = {}, fallbackTitle } = e.data;
		try {
			const warnings: string[] = options.warnings || [];
			const optionsWithWarnings = { ...options, warnings };
			const chapters = parseTxtToChapters(txtText, optionsWithWarnings, fallbackTitle);
			const response: ParseTxtWorkerResponse = {
				id,
				type: 'success',
				chapters,
				warnings
			};
			self.postMessage(response);
		} catch (err: unknown) {
			const errorMsg = err instanceof Error ? err.message : String(err);
			const response: ParseTxtWorkerResponse = {
				id,
				type: 'error',
				error: errorMsg
			};
			self.postMessage(response);
		}
	};
}
