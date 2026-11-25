<script lang="ts">
	import Input from '$lib/components/Input.svelte';
	import EpubJacketCarousel from './EpubJacketCarousel.svelte';
	import type { EpubState } from '../epub-state.svelte';
	import { JACKET_SAMPLE_PLACEHOLDERS } from '$lib/epub-packer/templates/jacket-templates';

	interface Props {
		epubState: EpubState;
	}

	let { epubState }: Props = $props();
</script>

<div class="animate-fade-in">
	<div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
		<div>
			<Input
				bind:value={epubState.metadata.title}
				label="Tác phẩm"
				placeholder={JACKET_SAMPLE_PLACEHOLDERS.title}
			/>
		</div>
		<div>
			<Input
				bind:value={epubState.metadata.author}
				label="Tác giả"
				placeholder={JACKET_SAMPLE_PLACEHOLDERS.author}
			/>
		</div>
		<div>
			<Input
				bind:value={epubState.jacket.originalTitle}
				label="Tựa gốc / Tựa nhỏ"
				placeholder={JACKET_SAMPLE_PLACEHOLDERS.originalTitle}
			/>
		</div>
		<div>
			<Input
				bind:value={epubState.jacket.translator}
				label="Dịch giả"
				placeholder={JACKET_SAMPLE_PLACEHOLDERS.translator}
			/>
		</div>
		<div>
			<Input
				bind:value={epubState.metadata.publisher}
				label="Nhà phát hành"
				placeholder={JACKET_SAMPLE_PLACEHOLDERS.publisher}
			/>
		</div>
		<div>
			<Input
				bind:value={epubState.jacket.distributor}
				label="Nhà xuất bản"
				placeholder={JACKET_SAMPLE_PLACEHOLDERS.distributor}
			/>
		</div>
	</div>

	<EpubJacketCarousel {epubState} />
</div>
