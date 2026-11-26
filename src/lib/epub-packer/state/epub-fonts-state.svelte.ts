// src/lib/epub-packer/state/epub-fonts-state.svelte.ts

export class EpubFontsState {
	jacketFont = $state<string>('default');
	jacketTitleFont = $state<string>('default');
	jacketAuthorFont = $state<string>('default');
	jacketMetaFont = $state<string>('default');
	h1Font = $state<string>('default');
	h2Font = $state<string>('default');
	h2SubFont = $state<string>('default');
	dropcapFont = $state<string>('default');
	quoteFont = $state<string>('default');
	quoteAuthorFont = $state<string>('default');
}
