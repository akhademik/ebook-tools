// src/lib/types/components.type.ts
import type { Snippet } from 'svelte';

export interface ButtonProps {
	onclick?: (event: MouseEvent) => void;
	disabled?: boolean;
	variant?: 'primary' | 'secondary';
	type?: 'button' | 'submit' | 'reset';
	children?: Snippet;
}

export interface DropZoneProps {
	accept?: string;
	multiple?: boolean;
	onSelect?: (file: File) => void;
	onSelectMultiple?: (files: FileList | File[]) => void;
	title?: string;
	subtitle?: string;
	selectedFile?: File | null;
	selectedCount?: number;
}

export interface InputProps {
	value?: string | number | null;
	placeholder?: string;
	label?: string;
	type?: string;
	min?: number | string | null;
	max?: number | string | null;
	oninput?: (event: Event) => void;
}

export interface PageHeaderProps {
	title?: string;
	description?: string;
}
