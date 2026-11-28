<script lang="ts">
	import DropZone from '$lib/components/DropZone.svelte';
	import type { EpubState } from '../epub-state.svelte';

	interface Props {
		epubState: EpubState;
	}

	let { epubState }: Props = $props();
</script>

<div class="animate-fade-in">
	<div class="flex items-center justify-between mb-1.5">
		<h3 class="text-sm sm:text-base font-semibold text-text-color font-sans">
			Ảnh minh họa nội dung (Illustrations)
		</h3>
		{#if epubState.images.illustrationFiles.length > 0}
			<button
				type="button"
				class="bg-transparent text-danger hover:opacity-80 font-sans text-xs font-medium cursor-pointer transition-colors"
				onclick={() => epubState.images.clearIllustrationFiles()}
			>
				Xóa tất cả ({epubState.images.illustrationFiles.length})
			</button>
		{/if}
	</div>

	<p class="text-xs text-text-mute mb-2.5 font-sans">
		Tự động liên kết thẻ <code>[hinh-1]</code>, <code>[hinh-2]</code>... trong văn bản với file cùng
		tên (ảnh, PDF hoặc ZIP).
	</p>

	{#if epubState.source.fileType === 'txt' && epubState.illustrationValidation.requiredTags.length > 0 && epubState.images.illustrationFiles.length === 0}
		<div
			class="mb-2.5 p-2.5 rounded-xl bg-warn/10 border border-warn/30 text-warn text-xs font-sans"
		>
			Văn bản TXT có {epubState.illustrationValidation.requiredTags.length} thẻ ảnh ({epubState.illustrationValidation.requiredTags
				.slice(0, 5)
				.map((t) => `[${t}]`)
				.join(', ')}{epubState.illustrationValidation.requiredTags.length > 5 ? ', ...' : ''}). Vui
			lòng tải đủ ảnh khớp tên trước khi đóng gói ở Bước 5.
		</div>
	{/if}

	<DropZone
		compact={true}
		accept=".png,.jpg,.jpeg,.webp,.gif,.svg,.zip,.pdf"
		multiple={true}
		onSelectMultiple={(files) => epubState.images.handleIllustrationFiles(files)}
		onSelect={(file) => epubState.images.handleIllustrationFiles(file)}
		title="Chọn ảnh minh họa, file PDF hoặc file ZIP"
		subtitle="Kéo thả nhiều ảnh hoặc file nén vào đây"
		selectedCount={epubState.images.illustrationFiles.length}
	/>

	{#if epubState.images.illustrationIsProcessing}
		<div class="mt-2.5 flex items-center gap-2 text-xs text-accent-color font-mono animate-pulse">
			<div
				class="w-3.5 h-3.5 border-2 border-accent-color border-t-transparent rounded-full animate-spin"
			></div>
			<span>{epubState.images.illustrationStatus || 'Đang xử lý ảnh minh họa...'}</span>
		</div>
	{/if}

	{#if epubState.images.illustrationError}
		<div class="mt-2.5 text-xs text-danger flex items-center gap-1.5 font-medium">
			<svg
				class="w-4 h-4 text-danger shrink-0"
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
			class="mt-3 flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-2 bg-panel-2/50 rounded-xl border border-border-color/70"
		>
			{#each epubState.images.illustrationFiles as img, idx (img.fileName + idx)}
				<div
					class="flex items-center gap-1.5 bg-panel border border-border-color px-2 py-1 rounded-md text-xs font-mono"
				>
					<span class="text-accent-color font-semibold">[{img.name}]</span>
					<span class="text-text-mute">({img.fileName})</span>
					<button
						type="button"
						class="text-danger hover:opacity-80 ml-1 cursor-pointer font-bold leading-none"
						onclick={() => epubState.images.removeIllustrationFile(idx)}
						title="Xóa ảnh này"
					>
						×
					</button>
				</div>
			{/each}
		</div>
	{/if}

	{#if epubState.source.fileType === 'txt' && epubState.images.illustrationFiles.length > 0}
		{#if !epubState.illustrationValidation.isValid}
			<div
				class="mt-2.5 p-2.5 rounded-xl bg-danger/10 border border-danger/30 text-danger text-xs font-sans font-medium"
			>
				{epubState.illustrationValidation.errorMessage}
			</div>
		{:else if epubState.illustrationValidation.requiredTags.length > 0}
			<div class="mt-2 text-xs text-ok font-sans font-medium">
				Đã khớp đủ {epubState.illustrationValidation.requiredTags.length} ảnh minh họa với văn bản TXT.
			</div>
		{/if}
	{/if}
</div>
