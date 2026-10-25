<script lang="ts">
	import PageHeader from '$lib/components/PageHeader.svelte';
	import DropZone from '$lib/components/DropZone.svelte';
	import Input from '$lib/components/Input.svelte';
	import Button from '$lib/components/Button.svelte';
	import { PdfSplitterState } from '$lib/pdf-splitter/pdf-splitter-state.svelte';

	const state = new PdfSplitterState();
</script>

<svelte:head>
	<title>Tách trang PDF → JPG</title>
</svelte:head>

<PageHeader
	title="Tách trang PDF → JPG"
	description="Tách ảnh xám tối ưu cho OCR và cắt lề header/footer hàng loạt."
/>

<div class="modern-card rounded-2xl p-7 mb-6">
	<span class="font-mono text-xs tracking-wider text-text-mute uppercase mb-3 block"
		>Tệp PDF nguồn</span
	>
	<DropZone
		accept="application/pdf"
		onSelect={(f) => state.handleFile(f)}
		title="Kéo thả hoặc click để chọn tệp PDF"
		subtitle="Mỗi trang sẽ được xuất thành một tệp ảnh .JPG riêng biệt"
		selectedFile={state.pdfSelectedFile}
	/>
</div>

{#if state.pdfSelectedFile}
	{#if state.isLargeFile || state.isMobile}
		<div
			class="mb-6 p-4 rounded-xl border border-amber-color/40 bg-accent-soft text-text-color flex items-start gap-3"
		>
			<span class="text-amber-color text-xl leading-none">⚠️</span>
			<div class="text-sm">
				<strong class="font-semibold block mb-0.5">
					{state.isMobile ? 'Thiết bị di động / RAM giới hạn' : 'Tệp PDF dung lượng lớn'}
					{#if state.deviceMemoryGb}
						· RAM: ~{state.deviceMemoryGb}GB
					{/if}
				</strong>
				<span class="text-text-mute">
					Dung lượng tệp: {(state.pdfSelectedFile.size / (1024 * 1024)).toFixed(1)}MB. Hệ thống tự
					động đặt trần bộ nhớ cố định {Math.round(state.maxPartBytes / (1024 * 1024))}MB/phần ({state.selectedDpi}
					DPI chuẩn OCR) để tránh sự cố tràn bộ nhớ RAM.
				</span>
			</div>
		</div>
	{/if}

	<div class="modern-card rounded-2xl p-7 mb-6">
		<span class="font-mono text-xs tracking-wider text-text-mute uppercase mb-2 block"
			>Cắt xén Header / Footer</span
		>
		<p class="text-sm text-text-mute mb-5">
			Xem trước trang để canh lề cắt bỏ header/footer thừa cho toàn bộ tài liệu.
		</p>

		<div class="flex items-center justify-between gap-4 mb-5 flex-wrap">
			<span class="text-sm font-medium text-text-mute">Trang xem trước</span>
			<div class="flex gap-2">
				<button
					class="bg-panel-2 border border-border-color font-mono text-sm py-2 px-4 rounded-xl cursor-pointer transition-colors {state.selectedPreviewCount ===
					10
						? 'border-accent-color text-accent-color bg-accent-soft'
						: 'text-amber-color hover:border-amber-color'}"
					onclick={() => {
						state.selectedPreviewCount = 10;
					}}
					type="button">10 trang</button
				>
				<button
					class="bg-panel-2 border border-border-color font-mono text-sm py-2 px-4 rounded-xl cursor-pointer transition-colors {state.selectedPreviewCount ===
					20
						? 'border-accent-color text-accent-color bg-accent-soft'
						: 'text-amber-color hover:border-amber-color'}"
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

	<div class="modern-card rounded-2xl p-7 mb-6">
		<div class="mb-5">
			<Input bind:value={state.bookName} label="Tên bộ ảnh xuất (.zip)" placeholder="ten-sach" />
			<p class="text-sm text-text-mute mt-2">
				Tệp tải về: <span class="text-text-color font-mono">{state.zipNamePreview}</span>
			</p>
		</div>

		<div class="mb-5 pt-4 border-t border-border-color">
			<div class="flex items-center justify-between gap-2 mb-2.5 flex-wrap">
				<span class="font-mono text-xs tracking-wider text-text-mute uppercase block">
					Độ phân giải xuất ảnh (DPI cho OCR)
				</span>
				<span class="text-xs font-mono text-accent-color">
					{state.selectedDpi} DPI (~{(state.selectedDpi / 72).toFixed(1)}x)
				</span>
			</div>
			<div class="grid grid-cols-3 gap-2">
				<button
					type="button"
					class="py-2 px-3 rounded-xl border text-xs font-mono cursor-pointer transition-colors text-center {state.selectedDpi ===
					150
						? 'border-accent-color text-accent-color bg-accent-soft font-semibold'
						: 'border-border-color bg-panel-2 text-text-color hover:border-amber-color'}"
					onclick={() => {
						state.selectedDpi = 150;
					}}
				>
					150 DPI
					<span class="block text-[10px] text-text-mute">Nhanh / Nhẹ</span>
				</button>
				<button
					type="button"
					class="py-2 px-3 rounded-xl border text-xs font-mono cursor-pointer transition-colors text-center {state.selectedDpi ===
					200
						? 'border-accent-color text-accent-color bg-accent-soft font-semibold'
						: 'border-border-color bg-panel-2 text-text-color hover:border-amber-color'}"
					onclick={() => {
						state.selectedDpi = 200;
					}}
				>
					200 DPI
					<span class="block text-[10px] text-accent-color">Chuẩn OCR</span>
				</button>
				<button
					type="button"
					class="py-2 px-3 rounded-xl border text-xs font-mono cursor-pointer transition-colors text-center {state.selectedDpi ===
					300
						? 'border-accent-color text-accent-color bg-accent-soft font-semibold'
						: 'border-border-color bg-panel-2 text-text-color hover:border-amber-color'}"
					onclick={() => {
						state.selectedDpi = 300;
					}}
				>
					300 DPI
					<span class="block text-[10px] text-text-mute">Scan mờ / Nét nhỏ</span>
				</button>
			</div>
		</div>

		<div class="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5 pt-4 border-t border-border-color">
			<div>
				<span class="font-mono text-xs tracking-wider text-text-mute uppercase mb-2 block">
					Dải trang xử lý
				</span>
				<div class="flex items-center gap-2 flex-wrap">
					<div class="flex items-center gap-1.5">
						<span class="text-xs text-text-mute font-mono">Từ:</span>
						<input
							type="number"
							bind:value={state.startPage}
							min="1"
							max={state.totalDocPages || 99999}
							class="w-18 bg-panel-2 border border-border-color text-text-color font-mono text-sm py-1.5 px-2.5 rounded-xl text-center outline-none focus:border-accent-color"
						/>
					</div>
					<div class="flex items-center gap-1.5">
						<span class="text-xs text-text-mute font-mono">Đến:</span>
						<input
							type="number"
							bind:value={state.endPage}
							min={state.startPage}
							max={state.totalDocPages || 99999}
							class="w-18 bg-panel-2 border border-border-color text-text-color font-mono text-sm py-1.5 px-2.5 rounded-xl text-center outline-none focus:border-accent-color"
						/>
					</div>
					{#if state.totalDocPages > 0}
						<span class="text-xs text-text-mute font-mono">/ {state.totalDocPages} trang</span>
					{/if}
				</div>
			</div>

			<div>
				<span class="font-mono text-xs tracking-wider text-text-mute uppercase mb-2 block">
					Ghi trực tiếp ra ổ đĩa
				</span>
				{#if state.supportsFSA}
					{#if state.dirName}
						<div class="flex items-center gap-2">
							<span
								class="text-xs font-mono text-accent-color truncate max-w-50"
								title={state.dirName}
							>
								📁 {state.dirName}
							</span>
							<button
								type="button"
								class="text-xs font-mono text-red-500 hover:underline cursor-pointer"
								onclick={() => state.clearOutputDirectory()}
							>
								Hủy
							</button>
						</div>
					{:else}
						<button
							type="button"
							class="bg-panel-2 border border-border-color hover:border-accent-color text-text-color font-mono text-xs py-2 px-3 rounded-xl cursor-pointer transition-colors"
							onclick={() => state.selectOutputDirectory()}
						>
							📁 Chọn thư mục lưu (Giải phóng RAM)
						</button>
					{/if}
				{:else}
					<span class="text-xs text-text-mute font-mono block">
						Trình duyệt không hỗ trợ File System API (tải về qua trình tải)
					</span>
				{/if}
			</div>
		</div>

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
					disabled={(!state.pdfZipBlob && state.pdfZipParts.length === 0) || state.processing}
					variant="secondary"
				>
					{state.dirHandle
						? 'Đã lưu vào đĩa'
						: state.hasMultipleParts
							? 'Tải toàn bộ ZIP'
							: 'Tải tệp .ZIP'}
				</Button>
			</div>
		</div>

		{#if state.status}
			<div class="font-mono text-sm mt-4 {state.isError ? 'text-red-500' : 'text-text-mute'}">
				{state.status}
			</div>
		{/if}

		{#if state.cropSummary}
			<p class="text-sm text-text-mute mt-1">{state.cropSummary}</p>
		{/if}

		{#if state.processing || state.progressPercent > 0}
			<div class="mt-5 animate-fade-in">
				<div class="flex items-center justify-between gap-2 mb-2">
					<p class="font-mono text-xs text-text-mute">{state.progressLabel}</p>
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
				<span>✅</span>
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
				<span class="text-amber-color text-lg leading-none">⚠️</span>
				<div class="text-xs">
					<strong class="font-semibold block mb-0.5 text-amber-color">
						Chú ý: {state.degradedPages.length} trang tự động giảm độ phân giải do giới hạn bộ nhớ
					</strong>
					<span class="text-text-mute">
						Các trang: <span class="font-mono text-text-color font-semibold"
							>{state.degradedPages.join(', ')}</span
						>. Chất lượng JPEG vẫn được giữ 85%. Bạn có thể chọn riêng các trang này ở dải trang để
						tách lại nếu cần OCR nét hơn.
					</span>
				</div>
			</div>
		{/if}

		{#if state.failedPages.length > 0}
			<div
				class="mt-4 p-3.5 rounded-xl bg-red-500/10 border border-red-500/40 text-text-color text-sm flex items-start gap-2.5 animate-fade-in"
			>
				<span class="text-red-500 text-lg leading-none">❌</span>
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
					<span class="font-mono text-xs uppercase tracking-wider text-text-mute">
						Các phần ZIP đã hoàn tất ({state.pdfZipParts.length} phần)
					</span>
					{#if !state.savedDirectoryName}
						<button
							type="button"
							class="bg-panel-2 border border-border-color hover:border-accent-color text-accent-color font-mono text-xs py-1.5 px-3 rounded-lg cursor-pointer transition-colors"
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
								<span class="font-mono text-sm font-semibold text-text-color block truncate">
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
										class="bg-brand-bg border border-border-color hover:border-accent-color text-text-color font-mono text-xs py-1.5 px-3 rounded-lg cursor-pointer transition-colors shrink-0"
										onclick={() => state.downloadPart(idx)}
										disabled={state.processing}
									>
										Tải phần {part.partIndex}
									</button>
									<button
										type="button"
										class="text-text-mute hover:text-red-500 font-mono text-xs py-1 px-1.5 rounded cursor-pointer"
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
