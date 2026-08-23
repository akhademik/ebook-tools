export type EpubFileCategory = 'page' | 'style' | 'image' | 'other';

export interface EpubEditorFileItem {
	path: string;
	name: string;
	category: EpubFileCategory;
	extension: string;
	orderIndex: number;
}

export interface EpubValidationError {
	path: string;
	error: string;
}

export interface BuildPreviewHtmlOptions {
	html: string;
	baseHtmlPath: string;
	getFileContent: (path: string) => Promise<string | null>;
	getAssetDataUrl: (path: string) => Promise<string | null>;
}
