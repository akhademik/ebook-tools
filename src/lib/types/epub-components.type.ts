// src/lib/types/epub-components.type.ts
import type { EpubState } from '$lib/epub-packer/epub-state.svelte';

export interface EpubSectionBaseProps {
	epubState: EpubState;
}

export interface EpubSourceSectionProps {
	epubState: EpubState;
	onOpenSyntaxModal: () => void;
}

export interface EpubMetadataSectionProps {
	epubState: EpubState;
	onOpenJacketModal: () => void;
}

export interface EpubPackSectionProps {
	epubState: EpubState;
	onDownload: () => void;
}

export interface EpubJacketModalProps {
	show?: boolean;
	epubState: EpubState;
}

export interface EpubSyntaxModalProps {
	show?: boolean;
}
