<script lang="ts">
	import Input from '$lib/components/Input.svelte';
	import Button from '$lib/components/Button.svelte';
	import type { EpubState } from '../epub-state.svelte';

	interface Props {
		epubState: EpubState;
		onDownload: () => void;
	}

	let { epubState, onDownload }: Props = $props();
</script>

<div class="animate-fade-in">
	<div class="mb-5">
		<Input
			bind:value={epubState.metadata.epubOutName}
			label="Tên file EPUB"
			placeholder="ten-sach"
		/>
		<p class="text-sm text-text-mute mt-2">
			File tải về: <span class="text-text-color font-mono"
				>{epubState.metadata.epubOutNamePreview}</span
			>
		</p>
	</div>

	<div class="space-y-3 mt-6">
		<Button
			onclick={() => epubState.processEpub()}
			disabled={epubState.source.epubChapters.length === 0 || epubState.processing}
			variant="primary"
			size="lg"
		>
			{epubState.processing ? 'Đang đóng gói...' : 'Đóng gói file EPUB'}
		</Button>
		<Button onclick={() => onDownload()} disabled={!epubState.epubBlob} variant="secondary">
			Tải file .EPUB
		</Button>
	</div>

	{#if epubState.status}
		<div class="text-sm mt-4 {epubState.isError ? 'text-danger' : 'text-text-mute'}">
			{epubState.status}
		</div>
	{/if}
</div>
