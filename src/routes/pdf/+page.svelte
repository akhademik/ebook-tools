<script lang="ts">
	import PageHeader from '$lib/components/PageHeader.svelte';
	import DropZone from '$lib/components/DropZone.svelte';
	import Input from '$lib/components/Input.svelte';
	import Button from '$lib/components/Button.svelte';
	import { PdfSplitterState } from '$lib/pdf-splitter/pdf-splitter-state.svelte';
	import { DEFAULT_DPI } from '$lib/pdf-splitter/pdf-splitter';

	const state = new PdfSplitterState();
</script>

<svelte:head>
	<title>Tách trang PDF → JPG</title>
</svelte:head>

<PageHeader
	title="Tách trang PDF → JPG"
	description="Tách ảnh xám tối ưu cho OCR và cắt lề header/footer hàng loạt."
	breadcrumb="Tiền xử lý"
	badge={true}
/>

<div class="modern-card rounded-2xl p-5 sm:p-7 mb-6">
	<h2 class="text-base font-semibold text-text-color mb-3">File PDF nguồn</h2>
	<DropZone
		accept="application/pdf"
		onSelect={(f) => state.handleFile(f)}
		title="Kéo thả hoặc click để chọn file PDF"
		subtitle="Mỗi trang sẽ được xuất thành một file ảnh .JPG riêng biệt"
		selectedFile={state.pdfSelectedFile}
	/>
</div>

{#if state.pdfSelectedFile}
	{#if state.isLargeFile || state.isMobile}
		<div
			class="mb-6 p-4 rounded-xl border border-amber-color/40 bg-accent-soft text-text-color flex items-start gap-3"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				stroke-width="1.75"
				stroke="currentColor"
				class="w-5 h-5 text-amber-color shrink-0 mt-0.5"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
				/>
			</svg>
			<div class="text-sm">
				<strong class="font-semibold block mb-0.5">
					{state.isMobile ? 'Thiết bị di động / RAM giới hạn' : 'File PDF dung lượng lớn'}
					{#if state.deviceMemoryGb}
						· RAM: ~{state.deviceMemoryGb}GB
					{/if}
				</strong>
				<span class="text-text-mute">
					Dung lượng file: {(state.pdfSelectedFile.size / (1024 * 1024)).toFixed(1)}MB. Hệ thống tự
					động đặt trần bộ nhớ cố định {Math.round(state.maxPartBytes / (1024 * 1024))}MB/phần ({DEFAULT_DPI}
					DPI chuẩn OCR) để tránh sự cố tràn bộ nhớ RAM.
				</span>
			</div>
		</div>
	{/if}

	<div class="modern-card rounded-2xl p-5 sm:p-7 mb-6">
		<h2 class="text-base font-semibold text-text-color mb-3">Cắt xén Header / Footer</h2>

		<div class="flex items-center justify-between gap-4 mb-5 flex-wrap">
			<span class="text-sm font-medium text-text-mute">Trang xem trước</span>
			<div class="flex gap-2">
				<button
					class="bg-panel-2 border border-border-color font-mono text-sm py-2 px-4 rounded-xl cursor-pointer transition-colors {state.selectedPreviewCount ===
					10
						? 'text-amber-color hover:border-amber-color'
						: 'border-accent-color text-accent-color bg-accent-soft'}"
					onclick={() => {
						state.selectedPreviewCount = 10;
					}}
					type="button">10 trang</button
				>
				<button
					class="bg-panel-2 border border-border-color font-mono text-sm py-2 px-4 rounded-xl cursor-pointer transition-colors {state.selectedPreviewCount ===
					20
						? 'text-amber-color hover:border-amber-color'
						: 'border-accent-color text-accent-color bg-accent-soft'}"
					onclick={() => {
						state.selectedPreviewCount = 20;
					}}
					type="button">20 trang</button
				>
			</div>
		</div>

		<div class="flex justify-center mb-5">
			<button
				class="bg-panel-2 text-text-color border border-border-color hover:border-accent-color font-mono text-sm py-2.5 px-6 rounded-xl cursor-pointer transition-colors w-full md:w-auto"
				onclick={() => state.loadPreview()}
				disabled={state.loadingPreview}
				type="button"
			>
				{state.loadingPreview
					? 'Đang tải xem trước...'
					: state.previewPages.length > 0
						? 'Tải lại xem trước'
						: 'Tải ảnh xem trước'}
			</button>
		</div>

		{#if state.previewPages.length > 0}
			<div class="mt-5 pt-5 border-t border-border-color animate-fade-in">
				<div class="flex items-center justify-center gap-4 mb-5">
					<button
						class="bg-panel-2 text-text-color border border-border-color hover:border-amber-color font-mono text-sm py-2 px-4 rounded-xl cursor-pointer"
						onclick={() => state.prevPreviewPage()}
						type="button">‹ Trước</button
					>
					<span class="font-mono text-sm text-text-mute"
						>Trang {state.previewPages[state.currentPreviewIndex]?.pageNum} ({state.currentPreviewIndex +
							1} / {state.previewPages.length})</span
					>
					<button
						class="bg-panel-2 text-text-color border border-border-color hover:border-amber-color font-mono text-sm py-2 px-4 rounded-xl cursor-pointer"
						onclick={() => state.nextPreviewPage()}
						type="button">Sau ›</button
					>
				</div>

				<div
					class="relative max-w-85 mx-auto bg-panel-2 border border-border-color rounded-xl overflow-hidden"
				>
					{#if state.previewPages[state.currentPreviewIndex]}
						<img
							src={state.previewPages[state.currentPreviewIndex].dataUrl}
							class="w-full block"
							alt="Xem trước trang"
						/>
						<div
							class="absolute top-0 left-0 right-0 bg-red-500/40 border-b border-dashed border-red-500 pointer-events-none"
							style="height: {Math.min(
								100,
								(state.cropTopPx / state.previewPages[state.currentPreviewIndex].height) * 100
							)}%"
						></div>
						<div
							class="absolute bottom-0 left-0 right-0 bg-red-500/40 border-t border-dashed border-red-500 pointer-events-none"
							style="height: {Math.min(
								100,
								(state.cropBottomPx / state.previewPages[state.currentPreviewIndex].height) * 100
							)}%"
						></div>
					{/if}
				</div>

				<div class="flex items-center justify-center gap-8 mt-5 flex-wrap">
					<div>
						<span class="font-mono text-xs text-text-mute uppercase mb-2 block">Header (px)</span>
						<div class="flex items-center gap-2">
							<button
								class="bg-panel-2 text-text-color border border-border-color hover:border-accent-color font-mono text-sm py-2 px-3.5 rounded-xl cursor-pointer"
								onclick={() => state.adjustCrop('top', -10)}
								type="button">−10</button
							>
							<input
								type="number"
								bind:value={state.cropTopPx}
								class="w-20 bg-brand-bg border border-border-color text-text-color font-mono text-sm py-2 px-3 rounded-xl text-center outline-none focus:border-accent-color"
								min="0"
							/>
							<button
								class="bg-panel-2 text-text-color border border-border-color hover:border-accent-color font-mono text-sm py-2 px-3.5 rounded-xl cursor-pointer"
								onclick={() => state.adjustCrop('top', 10)}
								type="button">+10</button
							>
						</div>
					</div>
					<div>
						<span class="font-mono text-xs text-text-mute uppercase mb-2 block">Footer (px)</span>
						<div class="flex items-center gap-2">
							<button
								class="bg-panel-2 text-text-color border border-border-color hover:border-accent-color font-mono text-sm py-2 px-3.5 rounded-xl cursor-pointer"
								onclick={() => state.adjustCrop('bottom', -10)}
								type="button">−10</button
							>
							<input
								type="number"
								bind:value={state.cropBottomPx}
								class="w-20 bg-brand-bg border border-border-color text-text-color font-mono text-sm py-2 px-3 rounded-xl text-center outline-none focus:border-accent-color"
								min="0"
							/>
							<button
								class="bg-panel-2 text-text-color border border-border-color hover:border-accent-color font-mono text-sm py-2 px-3.5 rounded-xl cursor-pointer"
								onclick={() => state.adjustCrop('bottom', 10)}
								type="button">+10</button
							>
						</div>
					</div>
				</div>
				<div class="mt-5 flex justify-end">
					<button
						class="bg-transparent text-text-mute hover:text-text-color font-mono text-xs py-1.5 px-3 rounded cursor-pointer"
						onclick={() => state.resetCrop()}
						type="button">Mặc định (Không cắt)</button
					>
				</div>
			</div>
		{/if}
	</div>

	<div class="modern-card rounded-2xl p-5 sm:p-7 mb-6">
		<div class="mb-5">
			<Input bind:value={state.bookName} label="Tên bộ ảnh xuất (.zip)" placeholder="ten-sach" />
			<p class="text-sm text-text-mute mt-2">
				File tải về: <span class="text-text-color font-mono">{state.zipNamePreview}</span>
			</p>
		</div>

		{#if state.supportsFSA}
			<div class="mb-5 pt-4 border-t border-border-color">
				<span class="text-xs font-semibold text-text-mute mb-2 block">
					Ghi trực tiếp ra ổ đĩa
				</span>
				{#if state.dirName}
					<div class="flex items-center gap-2">
						<span
							class="text-xs text-accent-color truncate max-w-75 flex items-center gap-1.5"
							title={state.dirName}
						>
							<svg
								class="w-4 h-4 shrink-0 text-accent-color"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="1.8"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z"
								/>
							</svg>
							<span class="font-mono">{state.dirName}</span>
						</span>
						<button
							type="button"
							class="text-xs text-red-500 hover:underline cursor-pointer font-medium"
							onclick={() => state.clearOutputDirectory()}
						>
							Hủy
						</button>
					</div>
				{:else}
					<button
						type="button"
						class="bg-panel-2 border border-field-border hover:border-accent-color text-text-color text-xs font-medium py-2 px-3.5 rounded-xl cursor-pointer transition-colors inline-flex items-center gap-2"
						onclick={() => state.selectOutputDirectory()}
					>
						<svg
							class="w-4 h-4 text-accent-color shrink-0"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="1.8"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z"
							/>
						</svg>
						<span>Chọn thư mục lưu (Giải phóng RAM)</span>
					</button>
				{/if}
			</div>
		{/if}

		<div class="flex items-center justify-center gap-4 mt-6 flex-wrap md:flex-nowrap">
			{#if state.processing}
				<div class="w-full md:w-auto md:flex-1 max-w-55 min-w-42.5 shrink-0">
					<Button onclick={() => state.cancelProcessTask()} variant="danger">Hủy xử lý</Button>
				</div>
			{:else}
				<div class="w-full md:w-auto md:flex-1 max-w-55 min-w-42.5 shrink-0">
					<Button onclick={() => state.processPdf()} variant="primary">Bắt đầu tách trang</Button>
				</div>
			{/if}
			<div class="w-full md:w-auto md:flex-1 max-w-55 min-w-42.5 shrink-0">
				<Button
					onclick={() => state.downloadZip()}
					disabled={!state.canDownloadZip || state.processing}
					variant="secondary"
				>
					{state.savedDirectoryName
						? 'Đã lưu vào đĩa'
						: state.hasMultipleParts
							? 'Tải toàn bộ ZIP'
							: 'Tải file .ZIP'}
				</Button>
			</div>
		</div>

		{#if state.status}
			<div class="text-sm mt-4 font-sans {state.isError ? 'text-red-500' : 'text-text-mute'}">
				{state.status}
			</div>
		{/if}

		{#if state.cropSummary}
			<p class="text-sm text-text-mute mt-1">{state.cropSummary}</p>
		{/if}

		{#if state.processing || state.progressPercent > 0}
			<div class="mt-5 animate-fade-in">
				<div class="flex items-center justify-between gap-2 mb-2">
					<p class="text-xs text-text-mute">{state.progressLabel}</p>
				</div>
				<div class="h-2 bg-panel-2 rounded-full overflow-hidden">
					<div
						class="h-full bg-accent-color transition-all duration-150"
						style="width: {state.progressPercent}%"
					></div>
				</div>
			</div>
		{/if}

		{#if state.savedDirectoryName}
			<div
				class="mt-4 p-3.5 rounded-xl bg-accent-soft border border-accent-color/40 text-text-color text-sm flex items-center gap-2.5 animate-fade-in"
			>
				<svg
					class="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
				>
					<path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
				</svg>
				<span>
					Đã lưu thành công các phần ZIP vào thư mục <strong>{state.savedDirectoryName}</strong> trên
					máy tính. Bộ nhớ RAM được giải phóng hoàn toàn!
				</span>
			</div>
		{/if}

		{#if state.degradedPages.length > 0}
			<div
				class="mt-4 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/40 text-text-color text-sm flex items-start gap-2.5 animate-fade-in"
			>
				<svg
					class="w-5 h-5 text-amber-500 shrink-0 mt-0.5"
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
				<div class="text-xs">
					<strong class="font-semibold block mb-0.5 text-amber-color">
						Chú ý: {state.degradedPages.length} trang tự động giảm độ phân giải do giới hạn bộ nhớ
					</strong>
					<span class="text-text-mute">
						Các trang: <span class="font-mono text-text-color font-semibold"
							>{state.degradedPages.join(', ')}</span
						>. Chất lượng JPEG vẫn được giữ 85%.
					</span>
				</div>
			</div>
		{/if}

		{#if state.failedPages.length > 0}
			<div
				class="mt-4 p-3.5 rounded-xl bg-red-500/10 border border-red-500/40 text-text-color text-sm flex items-start gap-2.5 animate-fade-in"
			>
				<svg
					class="w-5 h-5 text-red-500 shrink-0 mt-0.5"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
					/>
				</svg>
				<div class="text-xs">
					<strong class="font-semibold block mb-0.5 text-red-500">
						Lỗi: {state.failedPages.length} trang không thể xuất hình ảnh
					</strong>
					<span class="text-text-mute">
						Các trang bị lỗi: <span class="font-mono text-red-400 font-semibold"
							>{state.failedPages.join(', ')}</span
						> (trình duyệt không đủ bộ nhớ canvas).
					</span>
				</div>
			</div>
		{/if}

		{#if state.hasMultipleParts}
			<div class="mt-6 pt-5 border-t border-border-color animate-fade-in">
				<div class="flex items-center justify-between mb-3 flex-wrap gap-2">
					<div>
						<span class="text-xs font-semibold text-text-mute block">
							Các phần ZIP đã hoàn tất ({state.pdfZipParts.length} phần)
						</span>
						{#if !state.savedDirectoryName}
							<span class="text-xs text-text-mute mt-0.5 flex items-center gap-1.5">
								<svg
									class="w-3.5 h-3.5 text-accent-color shrink-0"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										d="M12 18v-5.25m0 0a6.002 6.002 0 0 0-4-5.659V5a2 2 0 1 1 4 0v2.091c1.554.743 2.766 2.08 3.25 3.734m-3.25-.575v.001ZM12 18a2.25 2.25 0 0 0 2.25-2.25H9.75A2.25 2.25 0 0 0 12 18Z"
									/>
								</svg>
								<span
									>Mẹo: Bấm "Tải phần N" bên dưới nếu trình duyệt chặn tải nhiều file liên tiếp.</span
								>
							</span>
						{/if}
					</div>
					{#if !state.savedDirectoryName}
						<button
							type="button"
							class="bg-panel-2 border border-border-color hover:border-accent-color text-accent-color text-xs font-medium py-1.5 px-3 rounded-lg cursor-pointer transition-colors"
							onclick={() => state.downloadAllParts()}
							disabled={state.processing}
						>
							Tải lần lượt tất cả
						</button>
					{/if}
				</div>
				<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
					{#each state.pdfZipParts as part, idx (part.partIndex)}
						<div
							class="p-3 rounded-xl bg-panel-2 border border-border-color flex items-center justify-between gap-3"
						>
							<div class="min-w-0">
								<span class="font-sans text-sm font-semibold text-text-color block truncate">
									Phần {part.partIndex}: Trang {part.startPage}–{part.endPage}
								</span>
								<span class="font-mono text-xs text-text-mute">
									{(part.sizeBytes / (1024 * 1024)).toFixed(1)} MB
									{#if part.savedToDisk}
										· <span class="text-green-500 font-medium">Đã lưu ra đĩa</span>
									{:else if !part.blob}
										· <span class="text-text-mute">Đã giải phóng RAM</span>
									{/if}
								</span>
							</div>
							{#if part.blob}
								<div class="flex items-center gap-1.5 shrink-0">
									<button
										type="button"
										class="bg-brand-bg border border-border-color hover:border-accent-color text-text-color text-xs font-medium py-1.5 px-3 rounded-lg cursor-pointer transition-colors shrink-0"
										onclick={() => state.downloadPart(idx)}
										disabled={state.processing}
									>
										Tải phần {part.partIndex}
									</button>
									<button
										type="button"
										class="text-text-mute hover:text-red-500 text-xs py-1 px-1.5 rounded cursor-pointer"
										onclick={() => state.releasePartBlob(idx)}
										title="Giải phóng bộ nhớ phần này khỏi RAM"
									>
										✕
									</button>
								</div>
							{/if}
						</div>
					{/each}
				</div>
			</div>
		{/if}
	</div>
{/if}

<style>
	.animate-fade-in {
		animation: fadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
	}
	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(6px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
