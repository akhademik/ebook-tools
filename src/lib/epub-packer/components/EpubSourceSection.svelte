<script lang="ts">
	import DropZone from '$lib/components/DropZone.svelte';
	import Input from '$lib/components/Input.svelte';
	import type { EpubState } from '../epub-state.svelte';

	interface Props {
		epubState: EpubState;
		onOpenSyntaxModal: () => void;
	}

	let { epubState, onOpenSyntaxModal }: Props = $props();
</script>

<div class="modern-card rounded-2xl p-7 mb-6">
	<span class="font-mono text-xs tracking-wider text-text-mute uppercase mb-3 block"
		>Chọn file nguồn (.ZIP hoặc .TXT)</span
	>
	<DropZone
		accept=".zip,.txt,application/zip,text/plain"
		onSelect={(f) => epubState.source.handleFile(f)}
		title="Kéo thả hoặc click để chọn file"
		subtitle="Chỉ hỗ trợ file .ZIP chứa các chương (.md) hoặc file .TXT"
		selectedFile={epubState.source.epubFileSelected}
	/>

	<!-- Custom Syntax Config for TXT -->
	<div
		class="mt-5 bg-panel-2 p-4 rounded-xl border border-border-color flex justify-between items-center gap-4"
	>
		<span class="font-mono text-xs font-semibold text-text-color uppercase tracking-wider"
			>Bảng quy ước</span
		>
		<button
			type="button"
			class="bg-brand-bg border border-border-color hover:border-text-color text-text-color font-mono text-xs font-semibold py-1.5 px-3 rounded-lg active:scale-[0.98] transition-all cursor-pointer"
			onclick={() => onOpenSyntaxModal()}
		>
			Xem
		</button>
	</div>

	{#if epubState.source.epubRawFiles.length > 0}
		<div class="mt-5 animate-fade-in">
			<Input
				bind:value={epubState.source.mergePattern}
				oninput={() => epubState.source.applyGrouping()}
				label="Từ khóa nhận diện tiêu đề chương mới"
				placeholder="Ví dụ: chương — để trống nếu mỗi tệp là 1 chương"
			/>
		</div>

		<div class="flex items-center gap-3 mt-5">
			<input
				type="checkbox"
				id="epub-heuristic-mode"
				bind:checked={epubState.source.heuristicMode}
				onchange={() => epubState.source.applyGrouping()}
				class="w-4 h-4 accent-accent-color cursor-pointer"
			/>
			<div>
				<label for="epub-heuristic-mode" class="text-sm text-text-color cursor-pointer font-medium"
					>Nhận diện bằng Heuristic thông minh</label
				>
				<span class="block text-xs text-text-mute mt-0.5"
					>Tính điểm tiêu đề dựa trên chữ viết HOA, độ dài và dấu câu</span
				>
			</div>
		</div>

		<div class="flex items-center gap-3 mt-4">
			<input
				type="checkbox"
				id="epub-ignore-markdown-format"
				bind:checked={epubState.source.ignoreMarkdownFormat}
				onchange={() => epubState.source.applyGrouping()}
				class="w-4 h-4 accent-accent-color cursor-pointer"
			/>
			<div>
				<label
					for="epub-ignore-markdown-format"
					class="text-sm text-text-color cursor-pointer font-medium"
					>Bỏ qua định dạng Markdown</label
				>
				<span class="block text-xs text-text-mute mt-0.5"
					>Giữ nguyên các ký tự định dạng như **, *, _ trong nội dung hiển thị</span
				>
			</div>
		</div>

		{#if epubState.source.heuristicMode}
			<div
				class="flex items-center gap-3 mt-4 flex-wrap animate-fade-in bg-panel-2 p-4 rounded-xl border border-border-color"
			>
				<div class="flex items-center gap-3 w-full flex-wrap">
					<span class="font-mono text-sm text-text-mute">Giới hạn Heuristic từ trang</span>
					<input
						type="number"
						bind:value={epubState.source.heuristicStart}
						oninput={() => epubState.source.applyGrouping()}
						class="bg-brand-bg border border-border-color text-text-color font-mono text-sm py-1.5 px-3 rounded-xl w-20 text-center outline-none focus:border-accent-color"
						min="1"
						placeholder="Đầu"
					/>
					<span class="font-mono text-sm text-text-mute">đến trang</span>
					<input
						type="number"
						bind:value={epubState.source.heuristicEnd}
						oninput={() => epubState.source.applyGrouping()}
						class="bg-brand-bg border border-border-color text-text-color font-mono text-sm py-1.5 px-3 rounded-xl w-20 text-center outline-none focus:border-accent-color"
						min="1"
						placeholder="Cuối"
					/>
				</div>
				<div
					class="flex items-center gap-3 w-full mt-4 flex-wrap border-t border-border-color pt-4"
				>
					<span class="font-mono text-sm text-text-mute">Ngưỡng điểm (Threshold):</span>
					<input
						type="range"
						min="1"
						max="10"
						step="1"
						bind:value={epubState.source.heuristicThreshold}
						oninput={() => epubState.source.applyGrouping()}
						class="h-1.5 bg-brand-bg rounded-lg appearance-none cursor-pointer accent-accent-color w-40"
					/>
					<span class="font-mono text-sm font-semibold text-accent-color w-8 text-center"
						>{epubState.source.heuristicThreshold}</span
					>
					<p class="text-xs text-text-mute w-full mt-1.5 leading-relaxed">
						Giảm ngưỡng để bắt nhiều tiêu đề hơn (cho sách quét OCR xấu). Tăng ngưỡng để tránh nhận
						diện nhầm đoạn văn thường thành chương.
					</p>
				</div>
			</div>
		{/if}

		<div class="mt-5 bg-panel-2 p-4 rounded-xl border border-border-color flex flex-col gap-3">
			<div>
				<span class="font-mono text-xs text-text-mute uppercase mb-1.5 block"
					>Lọc Header/Footer (Tùy chọn)</span
				>
				<input
					type="text"
					bind:value={epubState.source.cleanKeywords}
					oninput={() => epubState.source.applyGrouping()}
					class="w-full bg-brand-bg border border-border-color text-text-color font-mono text-sm py-2.5 px-3.5 rounded-xl outline-none focus:border-accent-color"
					placeholder="Tên sách, Nhà xuất bản"
				/>
			</div>
			<div class="flex items-center gap-3 mt-1.5 flex-wrap border-t border-border-color pt-3">
				<span class="font-mono text-sm text-text-mute">Số dòng quét đầu/cuối trang:</span>
				<input
					type="range"
					min="1"
					max="5"
					step="1"
					bind:value={epubState.source.cleanLineLimit}
					oninput={() => epubState.source.applyGrouping()}
					class="h-1.5 bg-brand-bg rounded-lg appearance-none cursor-pointer accent-accent-color w-32"
				/>
				<span class="font-mono text-sm font-semibold text-accent-color w-6 text-center"
					>{epubState.source.cleanLineLimit}</span
				>
				<p class="text-xs text-text-mute w-full leading-relaxed mt-1">
					Chỉ quét các file có từ 6 dòng trở lên. Tự động bỏ qua lọc nếu dòng đầu hoặc cuối là đoạn
					văn đầy đủ (để tránh mất nội dung truyện).
				</p>
			</div>
		</div>
	{/if}

	{#if epubState.source.epubChapters.length > 0}
		<!-- Tab Navigation -->
		<div class="flex border-b border-border-color mt-6 font-mono text-xs">
			<button
				type="button"
				class="py-2.5 px-4 font-semibold transition-colors border-b-2 cursor-pointer {epubState
					.source.activeTab === 'toc'
					? 'border-accent-color text-accent-color'
					: 'border-transparent text-text-mute hover:text-text-color'}"
				onclick={() => {
					epubState.source.activeTab = 'toc';
				}}>Đầu mục tìm thấy: ({epubState.source.epubChapters.length} chương)</button
			>

			{#if epubState.source.fileType === 'zip'}
				<button
					type="button"
					class="py-2.5 px-4 font-semibold transition-colors border-b-2 cursor-pointer relative {epubState
						.source.activeTab === 'diff'
						? 'border-accent-color text-accent-color'
						: 'border-transparent text-text-mute hover:text-text-color'}"
					onclick={() => {
						epubState.source.activeTab = 'diff';
					}}
				>
					Lọc Header/Footer ({epubState.source.cleanedLinesReport.length})
				</button>
			{/if}
		</div>

		<!-- Tab Contents -->
		{#if epubState.source.activeTab === 'toc'}
			<div
				class="mt-5 border border-border-color rounded-xl max-h-75 overflow-y-auto bg-brand-bg p-4 font-mono text-sm divide-y divide-border-color animate-fade-in"
			>
				{#each epubState.source.epubChapters as chap (chap.fileName)}
					<div class="py-3 first:pt-0 last:pb-0 flex flex-col gap-1.5">
						<div class="flex justify-between items-start gap-4">
							<span class="font-semibold text-text-color">
								{#if chap.isChapter}
									{chap.chapterIndex}: {chap.title}
								{:else}
									{chap.title}
								{/if}
							</span>
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
		{:else if epubState.source.activeTab === 'diff' && epubState.source.fileType === 'zip'}
			<div
				class="mt-5 flex flex-col gap-4 animate-fade-in max-h-100 overflow-y-auto bg-brand-bg p-4 rounded-xl border border-border-color"
			>
				{#if epubState.source.cleanedLinesReport.length === 0}
					<p class="text-sm text-text-mute font-mono text-center py-6">
						Không phát hiện Header/Footer nào khớp bộ lọc.
					</p>
				{:else}
					{#each epubState.source.cleanedLinesReport.slice(0, epubState.source.visibleCleanedCount) as reportItem (reportItem.fileName)}
						<div
							class="p-4 rounded-xl bg-panel-2 border border-border-color flex flex-col gap-2 shrink-0"
						>
							<span
								class="font-mono text-xs font-semibold text-text-color border-b border-border-color pb-1.5"
								>{reportItem.fileName}.md</span
							>
							<div class="flex flex-col gap-1.5">
								{#each reportItem.scanned as scan, scIdx (scIdx)}
									<div class="flex items-start gap-3 text-xs font-mono">
										<span
											class="text-[10px] px-1.5 py-0.5 rounded-sm shrink-0 {scan.location ===
											'Đầu file'
												? 'bg-accent-soft text-accent-color'
												: 'bg-amber-soft text-amber-color'}"
											>{scan.location} (Dòng {scan.lineNum})</span
										>
										<span
											class="flex-1 break-all {scan.isRemoved
												? 'line-through text-red-500 opacity-60'
												: 'text-green-500'}">{scan.text}</span
										>
										<span
											class="shrink-0 text-[10px] font-semibold {scan.isRemoved
												? 'text-red-500'
												: 'text-green-500'}">{scan.isRemoved ? 'Sẽ xóa' : 'Giữ lại'}</span
										>
									</div>
								{/each}
							</div>
						</div>
					{/each}

					{#if epubState.source.visibleCleanedCount < epubState.source.cleanedLinesReport.length}
						<button
							type="button"
							class="w-full py-2.5 bg-panel-2 border border-border-color rounded-xl text-xs font-semibold text-amber-color hover:border-amber-color cursor-pointer transition-colors"
							onclick={() => {
								epubState.source.visibleCleanedCount += 20;
							}}
							>Xem thêm ({epubState.source.cleanedLinesReport.length -
								epubState.source.visibleCleanedCount} trang ẩn)</button
						>
					{/if}
				{/if}
			</div>
		{/if}
	{/if}

	{#if epubState.source.parseStatus}
		<div
			class="font-mono text-sm mt-3 flex items-center justify-between gap-2 {epubState.source
				.parseIsError
				? 'text-red-500'
				: 'text-text-mute'}"
		>
			<span>{epubState.source.parseStatus}</span>
			{#if epubState.source.parseStatus.includes('Đang') || epubState.source.parseStatus.includes('xếp hàng')}
				<button
					type="button"
					class="text-xs font-mono text-red-400 hover:text-red-300 underline cursor-pointer bg-transparent border-0 shrink-0"
					onclick={() => epubState.source.cancelParseTask()}
				>
					Hủy
				</button>
			{/if}
		</div>
	{/if}
</div>
