// src/lib/types/epub-editor.type.ts
import type { EpubEditorState } from '$lib/epub-editor/epub-editor-state.svelte';

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

export interface EpubEditorModalProps {
	show?: boolean;
	editorState: EpubEditorState;
	onClose?: () => void;
}

export interface EpubEditorSidebarProps {
	editorState: EpubEditorState;
}

export interface EpubEditorCodePaneProps {
	editorState: EpubEditorState;
}

export interface EpubEditorPreviewPaneProps {
	editorState: EpubEditorState;
}

export interface BuildPreviewHtmlOptions {
	html: string;
	baseHtmlPath: string;
	getFileContent: (path: string) => Promise<string | null>;
	getAssetDataUrl: (path: string) => Promise<string | null>;
}
