<script lang="ts">
	import Input from '$lib/components/Input.svelte';
	import EpubJacketCarousel from './EpubJacketCarousel.svelte';
	import type { EpubState } from '../epub-state.svelte';

	interface Props {
		epubState: EpubState;
	}

	let { epubState }: Props = $props();
</script>

<div class="animate-fade-in">
	<div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
		<div>
			<Input bind:value={epubState.metadata.title} label="Tác phẩm" placeholder="Mật Mã Da Vinci" />
		</div>
		<div>
			<Input bind:value={epubState.metadata.author} label="Tác giả" placeholder="Dan Brown" />
		</div>
		<div>
			<Input
				bind:value={epubState.jacket.originalTitle}
				label="Tựa gốc / Tựa nhỏ"
				placeholder="The Da Vinci Code"
			/>
		</div>
		<div>
			<Input bind:value={epubState.jacket.translator} label="Dịch giả" placeholder="Đỗ Thu Hà" />
		</div>
		<div>
			<Input
				bind:value={epubState.metadata.publisher}
				label="Nhà phát hành"
				placeholder="1980 Books"
			/>
		</div>
		<div>
			<Input
				bind:value={epubState.jacket.distributor}
				label="Nhà xuất bản"
				placeholder="NXB Văn hóa Thông tin"
			/>
		</div>
	</div>

	<EpubJacketCarousel {epubState} />
</div>
