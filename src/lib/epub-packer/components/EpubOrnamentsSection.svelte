<script lang="ts">
	import DropZone from '$lib/components/DropZone.svelte';
	import type { EpubState } from '../epub-state.svelte';

	interface Props {
		epubState: EpubState;
	}

	let { epubState }: Props = $props();
</script>

<div class="modern-card rounded-2xl p-7 mb-6 animate-fade-in">
	<div class="flex items-center justify-between mb-3">
		<span class="font-mono text-xs tracking-wider text-text-mute uppercase font-semibold">
			Ảnh trang trí (Ornaments)
		</span>
	</div>

	<div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
		<!-- Chapter Ornament (H1) -->
		<div class="flex flex-col gap-2">
			<span class="font-mono text-xs text-text-mute uppercase font-semibold"
				>Trang trí chương lớn</span
			>
			<DropZone
				accept=".png,.jpg,.jpeg,.webp"
				onSelect={(f) => epubState.images.handleChapterOrnamentFile(f)}
				title="Chọn ảnh trang trí chương"
				subtitle="Chèn trước thẻ H1"
				selectedFile={epubState.images.chapterOrnamentFile}
			/>

			{#if epubState.images.chapterOrnamentStatus}
				<div
					class="flex items-center justify-between gap-2 text-xs font-mono {epubState.images
						.chapterOrnamentError
						? 'text-red-400'
						: 'text-accent-color'}"
				>
					<div class="flex items-center gap-2">
						{#if epubState.images.chapterOrnamentIsProcessing}
							<span
								class="inline-block w-3.5 h-3.5 border-2 border-accent-color border-t-transparent rounded-full animate-spin"
							></span>
						{/if}
						<span>{epubState.images.chapterOrnamentStatus}</span>
					</div>
					{#if epubState.images.chapterOrnamentIsProcessing}
						<button
							type="button"
							class="text-xs font-mono text-red-400 hover:text-red-300 underline cursor-pointer bg-transparent border-0"
							onclick={() => epubState.images.cancelChapterOrnamentProcessing()}
						>
							Hủy
						</button>
					{/if}
				</div>
			{/if}

			{#if epubState.images.chapterOrnamentPreviewUrl}
				<div
					class="mt-2 p-3 rounded-xl bg-surface-alt border border-border-color flex items-center justify-between gap-4"
				>
					<div class="flex items-center gap-3">
						<div
							class="w-16 h-12 rounded-lg bg-[repeating-conic-gradient(#333_0%_25%,#222_0%_50%)] bg-size-[12px_12px] flex items-center justify-center overflow-hidden border border-border-color/50"
						>
							<img
								src={epubState.images.chapterOrnamentPreviewUrl}
								alt="Chapter ornament preview"
								class="max-w-full max-h-full object-contain p-0.5"
							/>
						</div>
						<div class="text-xs">
							<div class="font-semibold text-text-bright">Đã hoàn tất tối ưu</div>
							<div class="text-text-mute font-mono">PNG trong suốt</div>
						</div>
					</div>
					<button
						class="bg-transparent text-red-500 hover:text-red-600 font-mono text-xs py-1 px-2.5 rounded cursor-pointer transition-colors"
						onclick={() => epubState.images.removeChapterOrnamentFile()}
						type="button">Xóa ảnh</button
					>
				</div>
			{:else if epubState.images.chapterOrnamentError}
				<div class="flex justify-end mt-1">
					<button
						class="bg-transparent text-red-500 hover:text-red-600 font-mono text-xs py-1 px-2.5 rounded cursor-pointer transition-colors"
						onclick={() => epubState.images.removeChapterOrnamentFile()}
						type="button">Xóa ảnh</button
					>
				</div>
			{/if}
		</div>

		<!-- Subchapter Ornament (H2) -->
		<div class="flex flex-col gap-2">
			<span class="font-mono text-xs text-text-mute uppercase font-semibold"
				>Trang trí chương phụ</span
			>
			<DropZone
				accept=".png,.jpg,.jpeg,.webp"
				onSelect={(f) => epubState.images.handleSubchapterOrnamentFile(f)}
				title="Chọn ảnh trang trí chương"
				subtitle="Chèn trước thẻ H2"
				selectedFile={epubState.images.subchapterOrnamentFile}
			/>

			{#if epubState.images.subchapterOrnamentStatus}
				<div
					class="flex items-center justify-between gap-2 text-xs font-mono {epubState.images
						.subchapterOrnamentError
						? 'text-red-400'
						: 'text-accent-color'}"
				>
					<div class="flex items-center gap-2">
						{#if epubState.images.subchapterOrnamentIsProcessing}
							<span
								class="inline-block w-3.5 h-3.5 border-2 border-accent-color border-t-transparent rounded-full animate-spin"
							></span>
						{/if}
						<span>{epubState.images.subchapterOrnamentStatus}</span>
					</div>
					{#if epubState.images.subchapterOrnamentIsProcessing}
						<button
							type="button"
							class="text-xs font-mono text-red-400 hover:text-red-300 underline cursor-pointer bg-transparent border-0"
							onclick={() => epubState.images.cancelSubchapterOrnamentProcessing()}
						>
							Hủy
						</button>
					{/if}
				</div>
			{/if}

			{#if epubState.images.subchapterOrnamentPreviewUrl}
				<div
					class="mt-2 p-3 rounded-xl bg-surface-alt border border-border-color flex items-center justify-between gap-4"
				>
					<div class="flex items-center gap-3">
						<div
							class="w-16 h-12 rounded-lg bg-[repeating-conic-gradient(#333_0%_25%,#222_0%_50%)] bg-size-[12px_12px] flex items-center justify-center overflow-hidden border border-border-color/50"
						>
							<img
								src={epubState.images.subchapterOrnamentPreviewUrl}
								alt="Subchapter ornament preview"
								class="max-w-full max-h-full object-contain p-0.5"
							/>
						</div>
						<div class="text-xs">
							<div class="font-semibold text-text-bright">Đã hoàn tất tối ưu</div>
							<div class="text-text-mute font-mono">PNG trong suốt</div>
						</div>
					</div>
					<button
						class="bg-transparent text-red-500 hover:text-red-600 font-mono text-xs py-1 px-2.5 rounded cursor-pointer transition-colors"
						onclick={() => epubState.images.removeSubchapterOrnamentFile()}
						type="button">Xóa ảnh</button
					>
				</div>
			{:else if epubState.images.subchapterOrnamentError}
				<div class="flex justify-end mt-1">
					<button
						class="bg-transparent text-red-500 hover:text-red-600 font-mono text-xs py-1 px-2.5 rounded cursor-pointer transition-colors"
						onclick={() => epubState.images.removeSubchapterOrnamentFile()}
						type="button">Xóa ảnh</button
					>
				</div>
			{/if}
		</div>
	</div>
</div>
