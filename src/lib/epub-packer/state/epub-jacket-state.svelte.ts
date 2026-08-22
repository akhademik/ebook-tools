// src/lib/epub-packer/state/epub-jacket-state.svelte.ts

export class EpubJacketState {
	jacketTemplateId = $state<number>(1);
	originalTitle = $state<string>('');
	distributor = $state<string>('');
	translator = $state<string>('');
}
