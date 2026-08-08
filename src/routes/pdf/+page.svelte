<script>
	import PageHeader from '$lib/components/PageHeader.svelte';
	import DropZone from '$lib/components/DropZone.svelte';
	import Input from '$lib/components/Input.svelte';
	import Button from '$lib/components/Button.svelte';
	import { PdfSplitterState } from '$lib/pdf-splitter/pdf-splitter-state.svelte.js';

	const state = new PdfSplitterState();
</script>

<svelte:head>
	<title>Tách trang PDF → JPG — Ebook Forge</title>
</svelte:head>

<PageHeader title="Tách trang PDF → JPG" description="Tách ảnh xám tối ưu cho OCR và cắt lề header/footer hàng loạt." />

<div class="modern-card rounded-2xl p-7 mb-6">
	<span class="font-mono text-xs tracking-wider text-text-mute uppercase mb-3 block">Tệp PDF nguồn</span>
	<DropZone
		accept="application/pdf"
		onSelect={(f) => state.handleFile(f)}
		title="Kéo thả hoặc click để chọn tệp PDF"
		subtitle="Mỗi trang sẽ được xuất thành một tệp ảnh .JPG riêng biệt"
		selectedFile={state.pdfSelectedFile}
	/>

	<div class="flex items-center gap-3 mt-6">
		<input type="checkbox" id="keep-color" bind:checked={state.keepColor} class="w-4 h-4 accent-accent-color cursor-pointer" />
		<div>
			<label for="keep-color" class="text-sm text-text-color cursor-pointer font-medium">Giữ màu ảnh gốc</label>
			<span class="block text-xs text-text-mute mt-0.5">Mặc định tách thành ảnh xám giúp tăng độ chính xác khi OCR</span>
		</div>
	</div>
</div>

{#if state.pdfSelectedFile}
	<div class="modern-card rounded-2xl p-7 mb-6">
		<span class="font-mono text-xs tracking-wider text-text-mute uppercase mb-2 block">Cắt xén Header / Footer</span>
		<p class="text-sm text-text-mute mb-5">Xem trước trang để canh lề cắt bỏ header/footer thừa cho toàn bộ tài liệu.</p>

		<div class="flex items-center justify-between gap-4 mb-5 flex-wrap">
			<span class="text-sm font-medium text-text-mute">Trang xem trước</span>
			<div class="flex gap-2">
				<button 
					class="bg-panel-2 border border-border-color font-mono text-sm py-2 px-4 rounded-xl cursor-pointer transition-colors {state.selectedPreviewCount === 10 ? 'border-accent-color text-accent-color bg-accent-soft' : 'text-amber-color hover:border-amber-color'}" 
					onclick={() => { state.selectedPreviewCount = 10; }}
					type="button"
				>10 trang</button>
				<button 
					class="bg-panel-2 border border-border-color font-mono text-sm py-2 px-4 rounded-xl cursor-pointer transition-colors {state.selectedPreviewCount === 20 ? 'border-accent-color text-accent-color bg-accent-soft' : 'text-amber-color hover:border-amber-color'}" 
					onclick={() => { state.selectedPreviewCount = 20; }}
					type="button"
				>20 trang</button>
			</div>
		</div>

		<button 
			class="bg-panel-2 text-text-color border border-border-color hover:border-accent-color font-mono text-sm py-2.5 px-5 rounded-xl cursor-pointer transition-colors w-full md:w-auto mb-5" 
			onclick={() => state.loadPreview()}
			disabled={state.loadingPreview}
			type="button"
		>
			{state.loadingPreview ? 'Đang tải xem trước...' : (state.previewPages.length > 0 ? 'Tải lại xem trước' : 'Tải ảnh xem trước')}
		</button>

		{#if state.previewPages.length > 0}
			<div class="mt-5 pt-5 border-t border-border-color animate-fade-in">
				<div class="flex items-center justify-center gap-4 mb-5">
					<button class="bg-panel-2 text-text-color border border-border-color hover:border-amber-color font-mono text-sm py-2 px-4 rounded-xl cursor-pointer" onclick={() => state.prevPreviewPage()} type="button">‹ Trước</button>
					<span class="font-mono text-sm text-text-mute">Trang {state.previewPages[state.currentPreviewIndex]?.pageNum} ({state.currentPreviewIndex + 1} / {state.previewPages.length})</span>
					<button class="bg-panel-2 text-text-color border border-border-color hover:border-amber-color font-mono text-sm py-2 px-4 rounded-xl cursor-pointer" onclick={() => state.nextPreviewPage()} type="button">Sau ›</button>
				</div>

				<div class="relative max-w-[340px] mx-auto bg-panel-2 border border-border-color rounded-xl overflow-hidden">
					{#if state.previewPages[state.currentPreviewIndex]}
						<img src={state.previewPages[state.currentPreviewIndex].dataUrl} class="w-full block" alt="Xem trước trang" />
						<div 
							class="absolute top-0 left-0 right-0 bg-red-500/40 border-b border-dashed border-red-500 pointer-events-none" 
							style="height: {Math.min(100, (state.cropTopPx / state.previewPages[state.currentPreviewIndex].height) * 100)}%"
						></div>
						<div 
							class="absolute bottom-0 left-0 right-0 bg-red-500/40 border-t border-dashed border-red-500 pointer-events-none" 
							style="height: {Math.min(100, (state.cropBottomPx / state.previewPages[state.currentPreviewIndex].height) * 100)}%"
						></div>
					{/if}
				</div>

				<div class="flex items-center justify-center gap-8 mt-5 flex-wrap">
					<div>
						<span class="font-mono text-xs text-text-mute uppercase mb-2 block">Header (px)</span>
						<div class="flex items-center gap-2">
							<button class="bg-panel-2 text-text-color border border-border-color hover:border-accent-color font-mono text-sm py-2 px-3.5 rounded-xl cursor-pointer" onclick={() => state.adjustCrop('top', -10)} type="button">−10</button>
							<input type="number" bind:value={state.cropTopPx} class="w-20 bg-brand-bg border border-border-color text-text-color font-mono text-sm py-2 px-3 rounded-xl text-center outline-none focus:border-accent-color" min="0" />
							<button class="bg-panel-2 text-text-color border border-border-color hover:border-accent-color font-mono text-sm py-2 px-3.5 rounded-xl cursor-pointer" onclick={() => state.adjustCrop('top', 10)} type="button">+10</button>
						</div>
					</div>
					<div>
						<span class="font-mono text-xs text-text-mute uppercase mb-2 block">Footer (px)</span>
						<div class="flex items-center gap-2">
							<button class="bg-panel-2 text-text-color border border-border-color hover:border-accent-color font-mono text-sm py-2 px-3.5 rounded-xl cursor-pointer" onclick={() => state.adjustCrop('bottom', -10)} type="button">−10</button>
							<input type="number" bind:value={state.cropBottomPx} class="w-20 bg-brand-bg border border-border-color text-text-color font-mono text-sm py-2 px-3 rounded-xl text-center outline-none focus:border-accent-color" min="0" />
							<button class="bg-panel-2 text-text-color border border-border-color hover:border-accent-color font-mono text-sm py-2 px-3.5 rounded-xl cursor-pointer" onclick={() => state.adjustCrop('bottom', 10)} type="button">+10</button>
						</div>
					</div>
				</div>
				<div class="mt-5 flex justify-end">
					<button class="bg-transparent text-text-mute hover:text-text-color font-mono text-xs py-1.5 px-3 rounded cursor-pointer" onclick={() => state.resetCrop()} type="button">Mặc định (Không cắt)</button>
				</div>
			</div>
		{/if}
	</div>

	<div class="modern-card rounded-2xl p-7 mb-6">
		<div class="mb-5">
			<Input bind:value={state.bookName} label="Tên bộ ảnh xuất (.zip)" placeholder="ten-sach" />
			<p class="text-sm text-text-mute mt-2">Tệp tải về: <span class="text-text-color font-mono">{state.zipNamePreview}</span></p>
		</div>

		<div class="flex items-center gap-4 mt-6 flex-wrap md:flex-nowrap">
			<div class="w-full md:w-auto md:flex-1 max-w-[220px] min-w-[170px] shrink-0">
				<Button 
					onclick={() => state.processPdf()} 
					disabled={state.processing}
					variant="primary"
				>
					{state.processing ? 'Đang xử lý...' : 'Bắt đầu tách trang'}
				</Button>
			</div>
			<div class="w-full md:w-auto md:flex-1 max-w-[220px] min-w-[170px] shrink-0">
				<Button 
					onclick={() => state.downloadZip()} 
					disabled={!state.pdfZipBlob}
					variant="secondary"
				>
					Tải tệp .ZIP
				</Button>
			</div>
		</div>

		{#if state.status}
			<div class="font-mono text-sm mt-4 {state.isError ? 'text-red-500' : 'text-text-mute'}">{state.status}</div>
		{/if}
		
		{#if state.cropSummary}
			<p class="text-sm text-text-mute mt-1">{state.cropSummary}</p>
		{/if}

		{#if state.processing || state.progressPercent > 0}
			<div class="mt-5 animate-fade-in">
				<p class="font-mono text-xs text-text-mute mb-2">{state.progressLabel}</p>
				<div class="h-2 bg-panel-2 rounded-full overflow-hidden">
					<div class="h-full bg-accent-color transition-all duration-150" style="width: {state.progressPercent}%"></div>
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
		from { opacity: 0; transform: translateY(6px); }
		to { opacity: 1; transform: translateY(0); }
	}
</style>
