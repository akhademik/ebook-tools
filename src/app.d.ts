// src/app.d.ts
import type { PdfJsLib } from '$lib/types/pdf-splitter.type';

declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}

	interface Window {
		DEBUG_LOG?: boolean | string;
		pdfjsLib?: PdfJsLib;
	}
}

export {};
