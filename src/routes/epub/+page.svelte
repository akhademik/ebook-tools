<script>
	import PageHeader from '$lib/components/PageHeader.svelte';
	import DropZone from '$lib/components/DropZone.svelte';
	import Input from '$lib/components/Input.svelte';
	import Button from '$lib/components/Button.svelte';
	import { EpubState } from '$lib/epub-packer/epub-state.svelte.js';
	import { triggerDownload } from '$lib/helpers/helpers.js';

	const state = new EpubState();

	$effect(() => {
		if (state.epubRawFiles.length > 0) {
			// Trigger reactive updates when grouping parameters adjust
			state.mergePattern;
			state.heuristicMode;
			state.heuristicStart;
			state.heuristicEnd;
			state.heuristicThreshold;
			state.cleanKeywords;
			state.cleanLineLimit;
			state.title;
			state.author;

			state.applyGrouping();
		}
	});

	function downloadEpub() {
		if (state.epubBlob) {
			triggerDownload(state.epubBlob, state.epubOutNamePreview);
		}
	}
</script>

<svelte:head>
	<title>Đóng gói EPUB — Ebook Forge</title>
</svelte:head>

<PageHeader title="Đóng gói EPUB" description="Gộp các chương Markdown thành một tệp sách điện tử .EPUB hoàn chỉnh." />

<div class="modern-card rounded-2xl p-7 mb-6">
	<span class="font-mono text-xs tracking-wider text-text-mute uppercase mb-3 block">Tệp .ZIP chứa các chương (.md)</span>
	<DropZone
		accept=".zip,application/zip"
		onSelect={(f) => state.handleFile(f)}
		title="Kéo thả hoặc click để chọn tệp .ZIP"
		subtitle="Tự động sắp xếp và tạo XHTML chương tuần tự 01, 02..."
		selectedFile={state.epubFileSelected}
	/>

	{#if state.epubRawFiles.length > 0}
		<div class="mt-5 animate-fade-in">
			<Input bind:value={state.mergePattern} label="Từ khóa nhận diện tiêu đề chương mới" placeholder="Ví dụ: chương — để trống nếu mỗi tệp là 1 chương" />
		</div>

		<div class="flex items-center gap-3 mt-5">
			<input type="checkbox" id="epub-heuristic-mode" bind:checked={state.heuristicMode} class="w-4 h-4 accent-accent-color cursor-pointer" />
			<div>
				<label for="epub-heuristic-mode" class="text-sm text-text-color cursor-pointer font-medium">Nhận diện bằng Heuristic thông minh</label>
				<span class="block text-xs text-text-mute mt-0.5">Tính điểm tiêu đề dựa trên chữ viết HOA, độ dài và dấu câu</span>
			</div>
		</div>

		{#if state.heuristicMode}
			<div class="flex items-center gap-3 mt-4 flex-wrap animate-fade-in bg-panel-2 p-4 rounded-xl border border-border-color">
				<div class="flex items-center gap-3 w-full flex-wrap">
					<span class="font-mono text-sm text-text-mute">Giới hạn Heuristic từ trang</span>
					<input type="number" bind:value={state.heuristicStart} class="bg-brand-bg border border-border-color text-text-color font-mono text-sm py-1.5 px-3 rounded-xl w-20 text-center outline-none focus:border-accent-color" min="1" placeholder="Đầu" />
					<span class="font-mono text-sm text-text-mute">đến trang</span>
					<input type="number" bind:value={state.heuristicEnd} class="bg-brand-bg border border-border-color text-text-color font-mono text-sm py-1.5 px-3 rounded-xl w-20 text-center outline-none focus:border-accent-color" min="1" placeholder="Cuối" />
				</div>
				<div class="flex items-center gap-3 w-full mt-4 flex-wrap border-t border-border-color pt-4">
					<span class="font-mono text-sm text-text-mute">Ngưỡng điểm (Threshold):</span>
					<input type="range" min="1" max="10" step="1" bind:value={state.heuristicThreshold} class="h-1.5 bg-brand-bg rounded-lg appearance-none cursor-pointer accent-accent-color w-40" />
					<span class="font-mono text-sm font-semibold text-accent-color w-8 text-center">{state.heuristicThreshold}</span>
					<p class="text-xs text-text-mute w-full mt-1.5 leading-relaxed">
						Giảm ngưỡng để bắt nhiều tiêu đề hơn (cho sách quét OCR xấu). Tăng ngưỡng để tránh nhận diện nhầm đoạn văn thường thành chương.
					</p>
				</div>
			</div>
		{/if}

		<div class="mt-5 bg-panel-2 p-4 rounded-xl border border-border-color flex flex-col gap-3">
			<div>
				<span class="font-mono text-xs text-text-mute uppercase mb-1.5 block">Lọc Header/Footer (Tùy chọn)</span>
				<input type="text" bind:value={state.cleanKeywords} class="w-full bg-brand-bg border border-border-color text-text-color font-mono text-sm py-2.5 px-3.5 rounded-xl outline-none focus:border-accent-color" placeholder="Tên sách, Nhà xuất bản" />
			</div>
			<div class="flex items-center gap-3 mt-1.5 flex-wrap border-t border-border-color pt-3">
				<span class="font-mono text-sm text-text-mute">Số dòng quét đầu/cuối trang:</span>
				<input type="range" min="1" max="5" step="1" bind:value={state.cleanLineLimit} class="h-1.5 bg-brand-bg rounded-lg appearance-none cursor-pointer accent-accent-color w-32" />
				<span class="font-mono text-sm font-semibold text-accent-color w-6 text-center">{state.cleanLineLimit}</span>
				<p class="text-xs text-text-mute w-full leading-relaxed mt-1">
					Chỉ quét các file có từ 6 dòng trở lên. Tự động bỏ qua lọc nếu dòng đầu hoặc cuối là đoạn văn đầy đủ (để tránh mất nội dung truyện).
				</p>
			</div>
		</div>
	{/if}

	{#if state.epubChapters.length > 0}
		<!-- Tab Navigation -->
		<div class="flex border-b border-border-color mt-6 font-mono text-xs">
			<button 
				type="button" 
				class="py-2.5 px-4 font-semibold transition-colors border-b-2 cursor-pointer {state.activeTab === 'toc' ? 'border-accent-color text-accent-color' : 'border-transparent text-text-mute hover:text-text-color'}"
				onclick={() => { state.activeTab = 'toc'; }}
			>Mục lục kết quả</button>
			
			<button 
				type="button" 
				class="py-2.5 px-4 font-semibold transition-colors border-b-2 cursor-pointer relative {state.activeTab === 'diff' ? 'border-accent-color text-accent-color' : 'border-transparent text-text-mute hover:text-text-color'}"
				onclick={() => { state.activeTab = 'diff'; }}
			>
				Lọc Header/Footer ({state.cleanedLinesReport.length})
			</button>
		</div>

		<!-- Tab Contents -->
		{#if state.activeTab === 'toc'}
			<div class="mt-5 border border-border-color rounded-xl max-h-[300px] overflow-y-auto bg-brand-bg p-4 font-mono text-sm divide-y divide-border-color animate-fade-in">
				{#each state.epubChapters as chap, idx (chap.fileName)}
					<div class="py-3 first:pt-0 last:pb-0 flex flex-col gap-1.5">
						<div class="flex justify-between items-start gap-4">
							<span class="font-semibold text-text-color">Chương {idx + 1}: {chap.title}</span>
							<span class="text-text-mute text-xs shrink-0">{chap.fileName}.xhtml</span>
						</div>
						<div class="text-[11px] text-text-mute flex flex-wrap gap-x-2 gap-y-0.5">
							<span class="text-accent-color font-semibold">Nguồn:</span>
							{#each chap.sources as src, sIdx (sIdx)}
								<span>{src}</span>
							{/each}
						</div>
					</div>
				{/each}
			</div>
		{:else if state.activeTab === 'diff'}
			<div class="mt-5 flex flex-col gap-4 animate-fade-in max-h-[400px] overflow-y-auto bg-brand-bg p-4 rounded-xl border border-border-color">
				{#if state.cleanedLinesReport.length === 0}
					<p class="text-sm text-text-mute font-mono text-center py-6">Không phát hiện Header/Footer nào khớp bộ lọc.</p>
				{:else}
					{#each state.cleanedLinesReport.slice(0, state.visibleCleanedCount) as reportItem (reportItem.fileName)}
						<div class="p-4 rounded-xl bg-panel-2 border border-border-color flex flex-col gap-2 shrink-0">
							<span class="font-mono text-xs font-semibold text-text-color border-b border-border-color pb-1.5">{reportItem.fileName}.md</span>
							<div class="flex flex-col gap-1.5">
								{#each reportItem.scanned as scan, scIdx (scIdx)}
									<div class="flex items-start gap-3 text-xs font-mono">
										<span class="text-[10px] px-1.5 py-0.5 rounded-sm shrink-0 {scan.location === 'Đầu file' ? 'bg-accent-soft text-accent-color' : 'bg-amber-soft text-amber-color'}">{scan.location} (Dòng {scan.lineNum})</span>
										<span class="flex-1 break-all {scan.isRemoved ? 'line-through text-red-500 opacity-60' : 'text-green-500'}">{scan.text}</span>
										<span class="shrink-0 text-[10px] font-semibold {scan.isRemoved ? 'text-red-500' : 'text-green-500'}">{scan.isRemoved ? 'Sẽ xóa' : 'Giữ lại'}</span>
									</div>
								{/each}
							</div>
						</div>
					{/each}

					{#if state.visibleCleanedCount < state.cleanedLinesReport.length}
						<button 
							type="button"
							class="w-full py-2.5 bg-panel-2 border border-border-color rounded-xl text-xs font-semibold text-amber-color hover:border-amber-color cursor-pointer transition-colors"
							onclick={() => { state.visibleCleanedCount += 20; }}
						>Xem thêm ({state.cleanedLinesReport.length - state.visibleCleanedCount} trang ẩn)</button>
					{/if}
				{/if}
			</div>
		{/if}
	{/if}

	{#if state.parseStatus}
		<div class="font-mono text-sm mt-3 {state.parseIsError ? 'text-red-500' : 'text-text-mute'}">{state.parseStatus}</div>
	{/if}
</div>

{#if state.epubRawFiles.length > 0}
	<div class="modern-card rounded-2xl p-7 mb-6 animate-fade-in">
		<span class="font-mono text-xs tracking-wider text-text-mute uppercase mb-3 block">Siêu dữ liệu sách (Metadata)</span>
		<div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
			<div>
				<Input bind:value={state.title} label="Tiêu đề sách" placeholder="Nhập tên sách" />
			</div>
			<div>
				<Input bind:value={state.author} label="Tác giả" placeholder="Tên tác giả" />
			</div>
			<div>
				<Input bind:value={state.lang} label="Ngôn ngữ" />
			</div>
			<div>
				<Input bind:value={state.publisher} label="Nhà xuất bản" placeholder="NXB Ebook" />
			</div>
		</div>
	</div>

	<div class="modern-card rounded-2xl p-7 mb-6 animate-fade-in">
		<div class="mb-5">
			<Input bind:value={state.epubOutName} label="Tên tệp EPUB đầu ra (.epub)" placeholder="ten-sach" />
			<p class="text-sm text-text-mute mt-2">Tệp tải về: <span class="text-text-color font-mono">{state.epubOutNamePreview}</span></p>
		</div>

		<div class="flex items-center gap-4 mt-6 flex-wrap md:flex-nowrap">
			<div class="w-full md:w-auto md:flex-1 max-w-[220px] min-w-[170px] shrink-0">
				<Button 
					onclick={() => state.processEpub()} 
					disabled={state.epubChapters.length === 0 || state.processing}
					variant="primary"
				>
					{state.processing ? 'Đang đóng gói...' : 'Đóng gói tệp EPUB'}
				</Button>
			</div>
			<div class="w-full md:w-auto md:flex-1 max-w-[220px] min-w-[170px] shrink-0">
				<Button 
					onclick={downloadEpub} 
					disabled={!state.epubBlob}
					variant="secondary"
				>
					Tải tệp .EPUB
				</Button>
			</div>
		</div>

		{#if state.status}
			<div class="font-mono text-sm mt-4 {state.isError ? 'text-red-500' : 'text-text-mute'}">{state.status}</div>
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
