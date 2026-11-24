<script lang="ts">
	import DropZone from '$lib/components/DropZone.svelte';
	import type { EpubState } from '../epub-state.svelte';

	interface Props {
		epubState: EpubState;
	}

	let { epubState }: Props = $props();
</script>

<div class="animate-fade-in">
	<div class="flex items-center justify-between mb-2.5">
		<h3 class="text-sm sm:text-base font-semibold text-text-color font-sans">
			Ảnh trang trí (Ornaments)
		</h3>
		<span class="text-xs text-text-mute hidden sm:inline font-sans">
			Tự động tẩy nền sang PNG trong suốt
		</span>
	</div>

	<div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
		<!-- Chapter Ornament (H1) -->
		<div class="flex flex-col gap-1.5">
			<span class="text-xs text-text-mute font-medium font-sans">Trang trí chương lớn</span>
			<DropZone
				compact={true}
				accept=".png,.jpg,.jpeg,.webp"
				onSelect={(f) => epubState.images.handleChapterOrnamentFile(f)}
				title="Chọn ảnh trang trí chương"
				subtitle="Chèn trước thẻ H1"
				selectedFile={epubState.images.chapterOrnamentFile}
			/>

			{#if epubState.images.chapterOrnamentStatus}
				<div
					class="flex items-center justify-between gap-2 text-xs {epubState.images
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
							class="text-xs text-red-400 hover:text-red-300 underline cursor-pointer bg-transparent border-0 font-sans"
							onclick={() => epubState.images.cancelChapterOrnamentProcessing()}
						>
							Hủy
						</button>
					{/if}
				</div>
			{/if}

			{#if epubState.images.chapterOrnamentPreviewUrl}
				<div
					class="mt-1.5 p-2 rounded-xl bg-panel-2/60 border border-border-color flex items-center justify-between gap-3"
				>
					<div class="flex items-center gap-2.5">
						<div
							class="w-12 h-9 rounded-lg bg-[repeating-conic-gradient(#333_0%_25%,#222_0%_50%)] bg-size-[12px_12px] flex items-center justify-center overflow-hidden border border-border-color/50 shrink-0"
						>
							<img
								src={epubState.images.chapterOrnamentPreviewUrl}
								alt="Chapter ornament preview"
								class="max-w-full max-h-full object-contain p-0.5"
							/>
						</div>
						<div class="text-xs">
							<div class="font-medium text-text-color">Đã tối ưu xong</div>
							<div class="text-text-mute text-[11px] font-mono">PNG trong suốt</div>
						</div>
					</div>
					<button
						class="bg-transparent text-red-500 hover:text-red-600 text-xs py-1 px-2 rounded cursor-pointer transition-colors font-sans"
						onclick={() => epubState.images.removeChapterOrnamentFile()}
						type="button">Xóa ảnh</button
					>
				</div>
			{:else if epubState.images.chapterOrnamentError}
				<div class="flex justify-end mt-1">
					<button
						class="bg-transparent text-red-500 hover:text-red-600 text-xs py-1 px-2 rounded cursor-pointer transition-colors font-sans"
						onclick={() => epubState.images.removeChapterOrnamentFile()}
						type="button">Xóa ảnh</button
					>
				</div>
			{/if}
		</div>

		<!-- Subchapter Ornament (H2) -->
		<div class="flex flex-col gap-1.5">
			<span class="text-xs text-text-mute font-medium font-sans">Trang trí chương phụ</span>
			<DropZone
				compact={true}
				accept=".png,.jpg,.jpeg,.webp"
				onSelect={(f) => epubState.images.handleSubchapterOrnamentFile(f)}
				title="Chọn ảnh trang trí chương"
				subtitle="Chèn trước thẻ H2"
				selectedFile={epubState.images.subchapterOrnamentFile}
			/>

			{#if epubState.images.subchapterOrnamentStatus}
				<div
					class="flex items-center justify-between gap-2 text-xs {epubState.images
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
							class="text-xs text-red-400 hover:text-red-300 underline cursor-pointer bg-transparent border-0 font-sans"
							onclick={() => epubState.images.cancelSubchapterOrnamentProcessing()}
						>
							Hủy
						</button>
					{/if}
				</div>
			{/if}

			{#if epubState.images.subchapterOrnamentPreviewUrl}
				<div
					class="mt-1.5 p-2 rounded-xl bg-panel-2/60 border border-border-color flex items-center justify-between gap-3"
				>
					<div class="flex items-center gap-2.5">
						<div
							class="w-12 h-9 rounded-lg bg-[repeating-conic-gradient(#333_0%_25%,#222_0%_50%)] bg-size-[12px_12px] flex items-center justify-center overflow-hidden border border-border-color/50 shrink-0"
						>
							<img
								src={epubState.images.subchapterOrnamentPreviewUrl}
								alt="Subchapter ornament preview"
								class="max-w-full max-h-full object-contain p-0.5"
							/>
						</div>
						<div class="text-xs">
							<div class="font-medium text-text-color">Đã tối ưu xong</div>
							<div class="text-text-mute text-[11px] font-mono">PNG trong suốt</div>
						</div>
					</div>
					<button
						class="bg-transparent text-red-500 hover:text-red-600 text-xs py-1 px-2 rounded cursor-pointer transition-colors font-sans"
						onclick={() => epubState.images.removeSubchapterOrnamentFile()}
						type="button">Xóa ảnh</button
					>
				</div>
			{:else if epubState.images.subchapterOrnamentError}
				<div class="flex justify-end mt-1">
					<button
						class="bg-transparent text-red-500 hover:text-red-600 text-xs py-1 px-2 rounded cursor-pointer transition-colors font-sans"
						onclick={() => epubState.images.removeSubchapterOrnamentFile()}
						type="button">Xóa ảnh</button
					>
				</div>
			{/if}
		</div>
	</div>
</div>
