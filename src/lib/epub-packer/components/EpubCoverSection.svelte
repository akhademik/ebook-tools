<script lang="ts">
	import DropZone from '$lib/components/DropZone.svelte';
	import Input from '$lib/components/Input.svelte';
	import type { EpubState } from '../epub-state.svelte';

	interface Props {
		epubState: EpubState;
	}

	let { epubState }: Props = $props();
</script>

<div class="modern-card rounded-2xl p-7 mb-6 animate-fade-in">
	<span class="font-mono text-xs tracking-wider text-text-mute uppercase mb-3 block"
		>Ảnh bìa sách (Book Cover)</span
	>

	<DropZone
		accept=".pdf,.png,.jpg,.jpeg,.webp"
		onSelect={(f) => epubState.images.handleCoverFile(f)}
		title="Kéo thả hoặc click để chọn ảnh bìa (PDF, PNG, JPG...)"
		subtitle="Ảnh bìa sẽ được tự động co dãn, tối ưu dung lượng và chèn trước trang giới thiệu"
		selectedFile={epubState.images.coverFile}
	/>

	{#if epubState.images.coverOriginalUrl}
		<div class="mt-5 pt-5 border-t border-border-color animate-fade-in">
			<div
				class="relative max-w-70 mx-auto bg-panel-2 border border-border-color rounded-xl overflow-hidden shadow-md"
			>
				<img src={epubState.images.coverOriginalUrl} class="w-full block" alt="Xem trước ảnh bìa" />
				<div
					class="absolute top-0 left-0 right-0 bg-red-500/40 border-b border-dashed border-red-500 pointer-events-none"
					style="height: {epubState.images.coverHeight > 0
						? Math.min(100, (epubState.images.coverCropTop / epubState.images.coverHeight) * 100)
						: 0}%"
				></div>
				<div
					class="absolute bottom-0 left-0 right-0 bg-red-500/40 border-t border-dashed border-red-500 pointer-events-none"
					style="height: {epubState.images.coverHeight > 0
						? Math.min(100, (epubState.images.coverCropBottom / epubState.images.coverHeight) * 100)
						: 0}%"
				></div>
				<div
					class="absolute top-0 bottom-0 left-0 bg-red-500/40 border-r border-dashed border-red-500 pointer-events-none"
					style="width: {epubState.images.coverWidth > 0
						? Math.min(100, (epubState.images.coverCropLeft / epubState.images.coverWidth) * 100)
						: 0}%; top: {epubState.images.coverHeight > 0
						? (epubState.images.coverCropTop / epubState.images.coverHeight) * 100
						: 0}%; bottom: {epubState.images.coverHeight > 0
						? (epubState.images.coverCropBottom / epubState.images.coverHeight) * 100
						: 0}%"
				></div>
				<div
					class="absolute top-0 bottom-0 right-0 bg-red-500/40 border-l border-dashed border-red-500 pointer-events-none"
					style="width: {epubState.images.coverWidth > 0
						? Math.min(100, (epubState.images.coverCropRight / epubState.images.coverWidth) * 100)
						: 0}%; top: {epubState.images.coverHeight > 0
						? (epubState.images.coverCropTop / epubState.images.coverHeight) * 100
						: 0}%; bottom: {epubState.images.coverHeight > 0
						? (epubState.images.coverCropBottom / epubState.images.coverHeight) * 100
						: 0}%"
				></div>
			</div>

			<div class="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-5">
				<div>
					<span class="font-mono text-xs text-text-mute uppercase mb-2 block"
						>Cắt lề trên / dưới (px)</span
					>
					<div class="flex items-center gap-2">
						<button
							class="bg-panel-2 text-text-color border border-border-color hover:border-accent-color font-mono text-sm py-2 px-3.5 rounded-xl cursor-pointer"
							onclick={() => epubState.images.adjustCoverCrop('top', -20)}
							type="button">T −20</button
						>
						<button
							class="bg-panel-2 text-text-color border border-border-color hover:border-accent-color font-mono text-sm py-2 px-3.5 rounded-xl cursor-pointer"
							onclick={() => epubState.images.adjustCoverCrop('top', 20)}
							type="button">T +20</button
						>
						<div class="flex-1"></div>
						<button
							class="bg-panel-2 text-text-color border border-border-color hover:border-accent-color font-mono text-sm py-2 px-3.5 rounded-xl cursor-pointer"
							onclick={() => epubState.images.adjustCoverCrop('bottom', -20)}
							type="button">B −20</button
						>
						<button
							class="bg-panel-2 text-text-color border border-border-color hover:border-accent-color font-mono text-sm py-2 px-3.5 rounded-xl cursor-pointer"
							onclick={() => epubState.images.adjustCoverCrop('bottom', 20)}
							type="button">B +20</button
						>
					</div>
					<div class="flex gap-4 mt-3">
						<div class="flex-1">
							<Input
								type="number"
								bind:value={epubState.images.coverCropTop}
								label="Lề trên (px)"
								min="0"
							/>
						</div>
						<div class="flex-1">
							<Input
								type="number"
								bind:value={epubState.images.coverCropBottom}
								label="Lề dưới (px)"
								min="0"
							/>
						</div>
					</div>
				</div>

				<div>
					<span class="font-mono text-xs text-text-mute uppercase mb-2 block"
						>Cắt lề trái / phải (px)</span
					>
					<div class="flex items-center gap-2">
						<button
							class="bg-panel-2 text-text-color border border-border-color hover:border-accent-color font-mono text-sm py-2 px-3.5 rounded-xl cursor-pointer"
							onclick={() => epubState.images.adjustCoverCrop('left', -20)}
							type="button">L −20</button
						>
						<button
							class="bg-panel-2 text-text-color border border-border-color hover:border-accent-color font-mono text-sm py-2 px-3.5 rounded-xl cursor-pointer"
							onclick={() => epubState.images.adjustCoverCrop('left', 20)}
							type="button">L +20</button
						>
						<div class="flex-1"></div>
						<button
							class="bg-panel-2 text-text-color border border-border-color hover:border-accent-color font-mono text-sm py-2 px-3.5 rounded-xl cursor-pointer"
							onclick={() => epubState.images.adjustCoverCrop('right', -20)}
							type="button">R −20</button
						>
						<button
							class="bg-panel-2 text-text-color border border-border-color hover:border-accent-color font-mono text-sm py-2 px-3.5 rounded-xl cursor-pointer"
							onclick={() => epubState.images.adjustCoverCrop('right', 20)}
							type="button">R +20</button
						>
					</div>
					<div class="flex gap-4 mt-3">
						<div class="flex-1">
							<Input
								type="number"
								bind:value={epubState.images.coverCropLeft}
								label="Lề trái (px)"
								min="0"
							/>
						</div>
						<div class="flex-1">
							<Input
								type="number"
								bind:value={epubState.images.coverCropRight}
								label="Lề phải (px)"
								min="0"
							/>
						</div>
					</div>
				</div>
			</div>

			<div class="mt-5 flex justify-between items-center">
				<button
					class="bg-transparent text-text-mute hover:text-text-color font-mono text-xs py-1.5 px-3 rounded cursor-pointer"
					onclick={() => epubState.images.resetCoverCrop()}
					type="button">Khôi phục lề</button
				>
				<button
					class="bg-transparent text-red-500 hover:text-red-600 font-mono text-xs py-1.5 px-3 rounded cursor-pointer"
					onclick={() => epubState.images.removeCoverFile()}
					type="button">Xóa ảnh bìa</button
				>
			</div>
		</div>
	{/if}

	{#if epubState.images.coverStatus}
		<div
			class="font-mono text-sm mt-3 {epubState.images.coverIsError
				? 'text-red-500'
				: 'text-text-mute'}"
		>
			{epubState.images.coverStatus}
		</div>
	{/if}
</div>
