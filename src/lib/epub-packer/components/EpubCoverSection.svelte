<script lang="ts">
	import DropZone from '$lib/components/DropZone.svelte';
	import Input from '$lib/components/Input.svelte';
	import type { EpubState } from '../epub-state.svelte';

	interface Props {
		epubState: EpubState;
	}

	let { epubState }: Props = $props();
</script>

<div class="animate-fade-in">
	<div class="flex items-center justify-between mb-2.5">
		<h3 class="text-sm sm:text-base font-semibold text-text-color font-sans">
			Ảnh bìa sách (Book Cover)
		</h3>
		{#if epubState.images.coverFile}
			<button
				type="button"
				class="text-xs text-red-500 hover:text-red-600 transition-colors cursor-pointer font-sans"
				onclick={() => epubState.images.removeCoverFile()}
			>
				Xóa ảnh bìa
			</button>
		{/if}
	</div>

	<DropZone
		compact={true}
		accept=".pdf,.png,.jpg,.jpeg,.webp"
		onSelect={(f) => epubState.images.handleCoverFile(f)}
		title="Chọn hoặc kéo thả ảnh bìa (PDF, PNG, JPG, WebP)"
		subtitle="Tự động co dãn, tối ưu tỷ lệ và chèn trước trang giới thiệu"
		selectedFile={epubState.images.coverFile}
	/>

	{#if epubState.images.coverOriginalUrl}
		<div class="mt-4 pt-4 border-t border-border-color/80 animate-fade-in">
			<div class="flex flex-col sm:flex-row items-start gap-5">
				<!-- Cover preview thumbnail with interactive crop guides -->
				<div
					class="relative w-32 sm:w-40 shrink-0 mx-auto sm:mx-0 bg-panel-2 border border-border-color rounded-xl overflow-hidden shadow-sm"
				>
					<img
						src={epubState.images.coverOriginalUrl}
						class="w-full block"
						alt="Xem trước ảnh bìa"
					/>
					<div
						class="absolute top-0 left-0 right-0 bg-red-500/40 border-b border-dashed border-red-500 pointer-events-none"
						style="height: {epubState.images.coverHeight > 0
							? Math.min(100, (epubState.images.coverCropTop / epubState.images.coverHeight) * 100)
							: 0}%"
					></div>
					<div
						class="absolute bottom-0 left-0 right-0 bg-red-500/40 border-t border-dashed border-red-500 pointer-events-none"
						style="height: {epubState.images.coverHeight > 0
							? Math.min(
									100,
									(epubState.images.coverCropBottom / epubState.images.coverHeight) * 100
								)
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

				<!-- Crop controls -->
				<div class="flex-1 w-full space-y-3">
					<div class="flex items-center justify-between pb-1.5 border-b border-border-color/60">
						<span class="text-xs font-semibold text-text-color font-sans">Căn chỉnh lề cắt bìa</span
						>
						<button
							class="text-xs text-text-mute hover:text-text-color font-sans cursor-pointer transition-colors"
							onclick={() => epubState.images.resetCoverCrop()}
							type="button"
						>
							Khôi phục lề
						</button>
					</div>

					<div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
						<!-- Top / Bottom Crop -->
						<div class="space-y-1.5">
							<span class="text-xs text-text-mute block font-sans">Lề trên / dưới (px)</span>
							<div class="flex items-center gap-1.5">
								<button
									class="bg-panel-2 text-text-color border border-field-border hover:border-accent-color font-mono text-xs font-medium h-8 px-2 rounded-lg cursor-pointer transition-colors"
									onclick={() => epubState.images.adjustCoverCrop('top', -20)}
									type="button">T −20</button
								>
								<button
									class="bg-panel-2 text-text-color border border-field-border hover:border-accent-color font-mono text-xs font-medium h-8 px-2 rounded-lg cursor-pointer transition-colors"
									onclick={() => epubState.images.adjustCoverCrop('top', 20)}
									type="button">T +20</button
								>
								<div class="flex-1"></div>
								<button
									class="bg-panel-2 text-text-color border border-field-border hover:border-accent-color font-mono text-xs font-medium h-8 px-2 rounded-lg cursor-pointer transition-colors"
									onclick={() => epubState.images.adjustCoverCrop('bottom', -20)}
									type="button">B −20</button
								>
								<button
									class="bg-panel-2 text-text-color border border-field-border hover:border-accent-color font-mono text-xs font-medium h-8 px-2 rounded-lg cursor-pointer transition-colors"
									onclick={() => epubState.images.adjustCoverCrop('bottom', 20)}
									type="button">B +20</button
								>
							</div>
							<div class="flex gap-2.5">
								<div class="flex-1">
									<Input
										type="number"
										compact={true}
										bind:value={epubState.images.coverCropTop}
										label="Lề trên"
										min="0"
									/>
								</div>
								<div class="flex-1">
									<Input
										type="number"
										compact={true}
										bind:value={epubState.images.coverCropBottom}
										label="Lề dưới"
										min="0"
									/>
								</div>
							</div>
						</div>

						<!-- Left / Right Crop -->
						<div class="space-y-1.5">
							<span class="text-xs text-text-mute block font-sans">Lề trái / phải (px)</span>
							<div class="flex items-center gap-1.5">
								<button
									class="bg-panel-2 text-text-color border border-field-border hover:border-accent-color font-mono text-xs font-medium h-8 px-2 rounded-lg cursor-pointer transition-colors"
									onclick={() => epubState.images.adjustCoverCrop('left', -20)}
									type="button">L −20</button
								>
								<button
									class="bg-panel-2 text-text-color border border-field-border hover:border-accent-color font-mono text-xs font-medium h-8 px-2 rounded-lg cursor-pointer transition-colors"
									onclick={() => epubState.images.adjustCoverCrop('left', 20)}
									type="button">L +20</button
								>
								<div class="flex-1"></div>
								<button
									class="bg-panel-2 text-text-color border border-field-border hover:border-accent-color font-mono text-xs font-medium h-8 px-2 rounded-lg cursor-pointer transition-colors"
									onclick={() => epubState.images.adjustCoverCrop('right', -20)}
									type="button">R −20</button
								>
								<button
									class="bg-panel-2 text-text-color border border-field-border hover:border-accent-color font-mono text-xs font-medium h-8 px-2 rounded-lg cursor-pointer transition-colors"
									onclick={() => epubState.images.adjustCoverCrop('right', 20)}
									type="button">R +20</button
								>
							</div>
							<div class="flex gap-2.5">
								<div class="flex-1">
									<Input
										type="number"
										compact={true}
										bind:value={epubState.images.coverCropLeft}
										label="Lề trái"
										min="0"
									/>
								</div>
								<div class="flex-1">
									<Input
										type="number"
										compact={true}
										bind:value={epubState.images.coverCropRight}
										label="Lề phải"
										min="0"
									/>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	{/if}

	{#if epubState.images.coverStatus}
		<div
			class="text-xs mt-2.5 font-sans {epubState.images.coverIsError
				? 'text-red-500'
				: 'text-text-mute'}"
		>
			{epubState.images.coverStatus}
		</div>
	{/if}
</div>
