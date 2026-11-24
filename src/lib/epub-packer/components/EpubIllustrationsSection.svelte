<script lang="ts">
	import DropZone from '$lib/components/DropZone.svelte';
	import type { EpubState } from '../epub-state.svelte';

	interface Props {
		epubState: EpubState;
	}

	let { epubState }: Props = $props();
</script>

<div class="animate-fade-in">
	<div class="flex items-center justify-between mb-3">
		<h2 class="text-base font-semibold text-text-color">Ảnh minh họa nội dung (Illustrations)</h2>
		{#if epubState.images.illustrationFiles.length > 0}
			<button
				type="button"
				class="bg-transparent text-red-500 hover:text-red-600 font-sans text-xs font-medium cursor-pointer transition-colors"
				onclick={() => epubState.images.clearIllustrationFiles()}
			>
				Xóa tất cả ({epubState.images.illustrationFiles.length})
			</button>
		{/if}
	</div>

	<p class="text-xs text-text-mute mb-4">
		Hỗ trợ tải lên 1 hoặc nhiều ảnh (<code>.jpg, .png, .webp, .gif, .svg</code>), file
		<code>.pdf</code>
		hoặc file nén <code>.zip</code> chứa các ảnh / file PDF. Tên file ảnh/PDF cần trùng với tên thẻ
		trong file TXT (Ví dụ: cú pháp
		<code>[hinh-1]</code>
		sẽ tự liên kết với file <code>hinh-1.jpg</code> / <code>hinh-1.png</code> /
		<code>hinh-1.pdf</code>).
	</p>

	<DropZone
		accept=".png,.jpg,.jpeg,.webp,.gif,.svg,.zip,.pdf"
		multiple={true}
		onSelectMultiple={(files) => epubState.images.handleIllustrationFiles(files)}
		onSelect={(file) => epubState.images.handleIllustrationFiles(file)}
		title="Chọn ảnh minh họa, file PDF hoặc file ZIP"
		subtitle="Kéo thả nhiều ảnh, file PDF hoặc file .zip tại đây"
		selectedCount={epubState.images.illustrationFiles.length}
	/>

	{#if epubState.images.illustrationIsProcessing}
		<div class="mt-3 flex items-center gap-2 text-xs text-accent-color font-mono animate-pulse">
			<div
				class="w-3.5 h-3.5 border-2 border-accent-color border-t-transparent rounded-full animate-spin"
			></div>
			<span>{epubState.images.illustrationStatus || 'Đang xử lý ảnh minh họa...'}</span>
		</div>
	{/if}

	{#if epubState.images.illustrationError}
		<div class="mt-3 text-xs text-red-500 flex items-center gap-1.5 font-medium">
			<svg
				class="w-4 h-4 text-red-500 shrink-0"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
				/>
			</svg>
			<span>{epubState.images.illustrationError}</span>
		</div>
	{/if}

	{#if epubState.images.illustrationFiles.length > 0}
		<div
			class="mt-4 flex flex-wrap gap-2 max-h-48 overflow-y-auto p-2 bg-brand-bg rounded-xl border border-border-color"
		>
			{#each epubState.images.illustrationFiles as img, idx (img.fileName + idx)}
				<div
					class="flex items-center gap-2 bg-panel-2 border border-border-color px-2.5 py-1.5 rounded-lg text-xs font-mono"
				>
					<span class="text-accent-color font-semibold">[{img.name}]</span>
					<span class="text-text-mute text-[11px]">({img.fileName})</span>
					<button
						type="button"
						class="text-red-400 hover:text-red-600 ml-1 cursor-pointer font-bold"
						onclick={() => epubState.images.removeIllustrationFile(idx)}
						title="Xóa ảnh này"
					>
						×
					</button>
				</div>
			{/each}
		</div>
	{/if}
</div>
