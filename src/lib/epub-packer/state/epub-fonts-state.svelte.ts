// src/lib/epub-packer/state/epub-fonts-state.svelte.ts

export class EpubFontsState {
	jacketFont = $state<string>('default');
	h1Font = $state<string>('default');
	h2Font = $state<string>('default');
	dropcapFont = $state<string>('default');
}
