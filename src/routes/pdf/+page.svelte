<script>
	import { slugify, ensureZipExt, triggerDownload } from '$lib/helpers/helpers.js';
	import { loadPdfPreview, processPdfToJpg } from './pdf-utils.js';

	// State variables (Svelte 5 runes)
	let pdfSelectedFile = $state(null);
	let pdfZipBlob = $state(null);
	let bookName = $state('');
	let keepColor = $state(false);

	let selectedPreviewCount = $state(10);
	let previewPages = $state([]);
	let currentPreviewIndex = $state(0);
	let cropTopPx = $state(0);
	let cropBottomPx = $state(0);

	let status = $state('');
	let isError = $state(false);
	let isDragOver = $state(false);
	
	let loadingPreview = $state(false);
	let processing = $state(false);
	
	let progressPercent = $state(0);
	let progressLabel = $state('');

	// Derived state
	let zipNamePreview = $derived(ensureZipExt(bookName.trim() || 'ten-sach'));
	let cropSummary = $derived(
		cropTopPx > 0 || cropBottomPx > 0
			? `Sẽ cắt ${cropTopPx}px trên · ${cropBottomPx}px dưới ở mỗi trang khi xuất.`
			: ''
	);

	function handleFile(file) {
		if (!file) return;
		if (file.type !== 'application/pdf' && !/\.pdf$/i.test(file.name)) {
			status = 'Vui lòng chọn một tệp PDF hợp lệ.';
			isError = true;
			return;
		}
		status = '';
		isError = false;
		pdfSelectedFile = file;
		bookName = slugify(file.name);
		pdfZipBlob = null;
		
		previewPages = [];
		currentPreviewIndex = 0;
		cropTopPx = 0;
		cropBottomPx = 0;
	}

	function handleDragOver(e) {
		e.preventDefault();
		isDragOver = true;
	}

	function handleDragLeave() {
		isDragOver = false;
	}

	function handleDrop(e) {
		e.preventDefault();
		isDragOver = false;
		const file = e.dataTransfer?.files[0];
		if (file) handleFile(file);
	}

	function handleFileChange(e) {
		const file = e.target.files?.[0];
		if (file) handleFile(file);
	}

	async function loadPreview() {
		if (!pdfSelectedFile) return;
		loadingPreview = true;
		status = '';
		isError = false;

		try {
			previewPages = await loadPdfPreview(pdfSelectedFile, selectedPreviewCount, keepColor);
			currentPreviewIndex = 0;
		} catch (err) {
			console.error(err);
			status = 'Không tải được xem trước: ' + err.message;
			isError = true;
		} finally {
			loadingPreview = false;
		}
	}

	function prevPreviewPage() {
		if (previewPages.length === 0) return;
		currentPreviewIndex = (currentPreviewIndex - 1 + previewPages.length) % previewPages.length;
	}

	function nextPreviewPage() {
		if (previewPages.length === 0) return;
		currentPreviewIndex = (currentPreviewIndex + 1) % previewPages.length;
	}

	function adjustCrop(side, delta) {
		if (side === 'top') {
			cropTopPx = Math.max(0, cropTopPx + delta);
		} else {
			cropBottomPx = Math.max(0, cropBottomPx + delta);
		}
	}

	function resetCrop() {
		cropTopPx = 0;
		cropBottomPx = 0;
	}

	async function processPdf() {
		if (!pdfSelectedFile) return;
		processing = true;
		pdfZipBlob = null;
		status = '';
		isError = false;
		progressPercent = 0;
		progressLabel = 'Đang mở tệp PDF...';

		try {
			const res = await processPdfToJpg(
				pdfSelectedFile,
				keepColor,
				cropTopPx,
				cropBottomPx,
				(progressData) => {
					progressPercent = progressData.progressPercent;
					progressLabel = progressData.progressLabel;
				}
			);
			pdfZipBlob = res.zipBlob;
		} catch (err) {
			console.error(err);
			status = 'Có lỗi khi xử lý tệp: ' + err.message;
			isError = true;
		} finally {
			processing = false;
		}
	}

	function downloadZip() {
		if (!pdfZipBlob) return;
		triggerDownload(pdfZipBlob, zipNamePreview);
	}
</script>

<svelte:head>
	<title>Tách trang PDF → JPG — Ebook Forge</title>
</svelte:head>

<div class="mb-10 animate-fade-in">
	<h1 class="font-mono text-3xl font-bold mb-2 tracking-tight text-text-color">Tách trang PDF → JPG</h1>
	<p class="text-text-mute text-base max-w-xl leading-relaxed">Tách ảnh xám tối ưu cho OCR và cắt lề header/footer hàng loạt.</p>
</div>

<div class="modern-card rounded-2xl p-7 mb-6">
	<span class="font-mono text-xs tracking-wider text-text-mute uppercase mb-3 block">Tệp PDF nguồn</span>
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="border border-dashed border-border-color rounded-xl p-10 text-center cursor-pointer transition-colors relative {isDragOver ? 'border-accent-color bg-accent-soft/30' : 'hover:border-accent-color hover:bg-accent-soft/10'}"
		ondragover={handleDragOver}
		ondragleave={handleDragLeave}
		ondrop={handleDrop}
	>
		<input type="file" accept="application/pdf" class="absolute inset-0 opacity-0 cursor-pointer w-full h-full" onchange={handleFileChange} />
		<p class="text-base font-semibold mb-1">Kéo thả hoặc click để chọn tệp PDF</p>
		<p class="text-sm text-text-mute">Mỗi trang sẽ được xuất thành một tệp ảnh .JPG riêng biệt</p>
		{#if pdfSelectedFile}
			<p class="font-mono text-sm text-amber-color mt-3 break-all">{pdfSelectedFile.name}</p>
		{/if}
	</div>

	<div class="flex items-center gap-3 mt-6">
		<input type="checkbox" id="keep-color" bind:checked={keepColor} class="w-4 h-4 accent-accent-color cursor-pointer" />
		<div>
			<label for="keep-color" class="text-sm text-text-color cursor-pointer font-medium">Giữ màu ảnh gốc</label>
			<span class="block text-xs text-text-mute mt-0.5">Mặc định tách thành ảnh xám giúp tăng độ chính xác khi OCR</span>
		</div>
	</div>
</div>

{#if pdfSelectedFile}
	<div class="modern-card rounded-2xl p-7 mb-6">
		<span class="font-mono text-xs tracking-wider text-text-mute uppercase mb-2 block">Cắt xén Header / Footer</span>
		<p class="text-sm text-text-mute mb-5">Xem trước trang để canh lề cắt bỏ header/footer thừa cho toàn bộ tài liệu.</p>

		<div class="flex items-center justify-between gap-4 mb-5 flex-wrap">
			<span class="text-sm font-medium text-text-mute">Trang xem trước</span>
			<div class="flex gap-2">
				<button 
					class="bg-panel-2 border border-border-color font-mono text-sm py-2 px-4 rounded-xl cursor-pointer transition-colors {selectedPreviewCount === 10 ? 'border-accent-color text-accent-color bg-accent-soft' : 'text-amber-color hover:border-amber-color'}" 
					onclick={() => { selectedPreviewCount = 10; }}
					type="button"
				>10 trang</button>
				<button 
					class="bg-panel-2 border border-border-color font-mono text-sm py-2 px-4 rounded-xl cursor-pointer transition-colors {selectedPreviewCount === 20 ? 'border-accent-color text-accent-color bg-accent-soft' : 'text-amber-color hover:border-amber-color'}" 
					onclick={() => { selectedPreviewCount = 20; }}
					type="button"
				>20 trang</button>
			</div>
		</div>

		<button 
			class="bg-panel-2 text-text-color border border-border-color hover:border-accent-color font-mono text-sm py-2.5 px-5 rounded-xl cursor-pointer transition-colors w-full md:w-auto mb-5" 
			onclick={loadPreview}
			disabled={loadingPreview}
			type="button"
		>
			{loadingPreview ? 'Đang tải xem trước...' : (previewPages.length > 0 ? 'Tải lại xem trước' : 'Tải ảnh xem trước')}
		</button>

		{#if previewPages.length > 0}
			<div class="mt-5 pt-5 border-t border-border-color animate-fade-in">
				<div class="flex items-center justify-center gap-4 mb-5">
					<button class="bg-panel-2 text-text-color border border-border-color hover:border-amber-color font-mono text-sm py-2 px-4 rounded-xl cursor-pointer" onclick={prevPreviewPage} type="button">‹ Trước</button>
					<span class="font-mono text-sm text-text-mute">Trang {previewPages[currentPreviewIndex]?.pageNum} ({currentPreviewIndex + 1} / {previewPages.length})</span>
					<button class="bg-panel-2 text-text-color border border-border-color hover:border-amber-color font-mono text-sm py-2 px-4 rounded-xl cursor-pointer" onclick={nextPreviewPage} type="button">Sau ›</button>
				</div>

				<div class="relative max-w-[340px] mx-auto bg-panel-2 border border-border-color rounded-xl overflow-hidden">
					{#if previewPages[currentPreviewIndex]}
						<img src={previewPages[currentPreviewIndex].dataUrl} class="w-full block" alt="Xem trước trang" />
						<div 
							class="absolute top-0 left-0 right-0 bg-red-500/40 border-b border-dashed border-red-500 pointer-events-none" 
							style="height: {Math.min(100, (cropTopPx / previewPages[currentPreviewIndex].height) * 100)}%"
						></div>
						<div 
							class="absolute bottom-0 left-0 right-0 bg-red-500/40 border-t border-dashed border-red-500 pointer-events-none" 
							style="height: {Math.min(100, (cropBottomPx / previewPages[currentPreviewIndex].height) * 100)}%"
						></div>
					{/if}
				</div>

				<div class="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-5">
					<div>
						<span class="font-mono text-xs text-text-mute uppercase mb-2 block">Header (px)</span>
						<div class="flex items-center gap-2">
							<button class="bg-panel-2 text-text-color border border-border-color hover:border-accent-color font-mono text-sm py-2 px-3.5 rounded-xl cursor-pointer" onclick={() => adjustCrop('top', -10)} type="button">−10</button>
							<input type="number" bind:value={cropTopPx} class="w-20 bg-brand-bg border border-border-color text-text-color font-mono text-sm py-2 px-3 rounded-xl text-center outline-none focus:border-accent-color" min="0" />
							<button class="bg-panel-2 text-text-color border border-border-color hover:border-accent-color font-mono text-sm py-2 px-3.5 rounded-xl cursor-pointer" onclick={() => adjustCrop('top', 10)} type="button">+10</button>
						</div>
					</div>
					<div>
						<span class="font-mono text-xs text-text-mute uppercase mb-2 block">Footer (px)</span>
						<div class="flex items-center gap-2">
							<button class="bg-panel-2 text-text-color border border-border-color hover:border-accent-color font-mono text-sm py-2 px-3.5 rounded-xl cursor-pointer" onclick={() => adjustCrop('bottom', -10)} type="button">−10</button>
							<input type="number" bind:value={cropBottomPx} class="w-20 bg-brand-bg border border-border-color text-text-color font-mono text-sm py-2 px-3 rounded-xl text-center outline-none focus:border-accent-color" min="0" />
							<button class="bg-panel-2 text-text-color border border-border-color hover:border-accent-color font-mono text-sm py-2 px-3.5 rounded-xl cursor-pointer" onclick={() => adjustCrop('bottom', 10)} type="button">+10</button>
						</div>
					</div>
				</div>
				<div class="mt-5 flex justify-end">
					<button class="bg-transparent text-text-mute hover:text-text-color font-mono text-xs py-1.5 px-3 rounded cursor-pointer" onclick={resetCrop} type="button">Mặc định (Không cắt)</button>
				</div>
			</div>
		{/if}
	</div>

	<div class="modern-card rounded-2xl p-7 mb-6">
		<div class="mb-5">
			<span class="font-mono text-xs tracking-wider text-text-mute uppercase mb-2 block">Tên bộ ảnh xuất (.zip)</span>
			<input type="text" bind:value={bookName} class="w-full bg-panel-2 border border-border-color text-text-color font-mono text-sm py-3 px-4 rounded-xl outline-none focus:border-accent-color" placeholder="ten-sach" />
			<p class="text-sm text-text-mute mt-2">Tệp tải về: <span class="text-text-color font-mono">{zipNamePreview}</span></p>
		</div>

		<div class="flex items-center gap-4 mt-6">
			<button 
				class="btn font-mono text-sm tracking-wide py-3 px-6 rounded-xl bg-accent-color text-white font-semibold cursor-pointer transition-all duration-150 hover:bg-accent-hover disabled:opacity-30 disabled:cursor-not-allowed" 
				onclick={processPdf} 
				disabled={processing}
			>
				{processing ? 'Đang xử lý...' : 'Bắt đầu tách trang'}
			</button>
			<button 
				class="bg-panel-2 text-amber-color border border-border-color hover:border-amber-color font-mono text-sm py-3 px-6 rounded-xl cursor-pointer transition-colors disabled:opacity-30 disabled:cursor-not-allowed" 
				onclick={downloadZip} 
				disabled={!pdfZipBlob}
			>Tải tệp .ZIP</button>
		</div>

		{#if status}
			<div class="font-mono text-sm mt-4 {isError ? 'text-red-500' : 'text-text-mute'}">{status}</div>
		{/if}
		
		{#if cropSummary}
			<p class="text-sm text-text-mute mt-1">{cropSummary}</p>
		{/if}

		{#if processing || progressPercent > 0}
			<div class="mt-5 animate-fade-in">
				<p class="font-mono text-xs text-text-mute mb-2">{progressLabel}</p>
				<div class="h-2 bg-panel-2 rounded-full overflow-hidden">
					<div class="h-full bg-accent-color transition-all duration-150" style="width: {progressPercent}%"></div>
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
