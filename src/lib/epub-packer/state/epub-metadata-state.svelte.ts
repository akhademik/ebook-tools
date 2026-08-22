// src/lib/epub-packer/state/epub-metadata-state.svelte.ts
import { ensureEpubExt } from '$lib/utils';

export class EpubMetadataState {
	title = $state<string>('');
	author = $state<string>('');
	lang = $state<string>('vi');
	publisher = $state<string>('');
	epubOutName = $state<string>('');

	epubOutNamePreview = $derived(ensureEpubExt(this.epubOutName.trim() || 'ten-sach'));
}
