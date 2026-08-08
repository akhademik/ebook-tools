<script>
	import { slugify, ensureZipExt, triggerDownload } from '$lib/helpers.js';
	import { fixMarkdownZip } from '$lib/md-utils.js';

	// State variables (Svelte 5 runes)
	let mdSelectedFile = $state(null);
	let mdOutZipBlob = $state(null);
	let zipOutName = $state('');

	let italicOpen = $state('[');
	let italicClose = $state(']');
	let biOpen = $state('[');
	let biClose = $state(']');

	let status = $state('');
	let isError = $state(false);
	let isDragOver = $state(false);
	let processing = $state(false);

	let totalFiles = $state(0);
	let totalReplacements = $state(0);
	let processedFilesList = $state([]);

	// Derived state
	let zipNamePreview = $derived(ensureZipExt(zipOutName.trim() || 'ten-file-goc-da-fix'));
	let italicSample = $derived(`${italicOpen}nghiêng${italicClose}`);
	let biSample = $derived(`${biOpen}đậm nghiêng${biClose}`);

	function handleFile(file) {
		if (!file) return;
		if (!/\.zip$/i.test(file.name)) {
			status = 'Vui lòng chọn một tệp .ZIP hợp lệ.';
			isError = true;
			return;
		}
		status = '';
		isError = false;
		mdSelectedFile = file;
		zipOutName = slugify(file.name) + '-da-fix';
		mdOutZipBlob = null;
		processedFilesList = [];
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

	async function processMarkdownZip() {
		if (!mdSelectedFile) return;
		processing = true;
		status = 'Đang đọc tệp .ZIP...';
		isError = false;

		try {
			const res = await fixMarkdownZip(mdSelectedFile, {
				italicOpen,
				italicClose,
				biOpen,
				biClose
			});
			mdOutZipBlob = res.zipBlob;
			totalFiles = res.totalFiles;
			totalReplacements = res.totalReplacements;
			processedFilesList = res.processedFilesList;

			status = totalFiles > 0
				? 'Hoàn tất — sẵn sàng tải về.'
				: 'Không tìm thấy tệp Markdown nào trong tệp .ZIP này.';
		} catch (err) {
			console.error(err);
			status = 'Có lỗi khi xử lý tệp: ' + err.message;
			isError = true;
		} finally {
			processing = false;
		}
	}

	function downloadZip() {
		if (!mdOutZipBlob) return;
		triggerDownload(mdOutZipBlob, zipNamePreview);
	}

	// React to changes in wrappers
	$effect(() => {
		if (mdSelectedFile && (italicOpen || italicClose || biOpen || biClose)) {
			processMarkdownZip();
		}
	});
</script>

<svelte:head>
	<title>Markdown Fixer — Ebook Forge</title>
</svelte:head>

<div class="mb-10 animate-fade-in">
	<h1 class="font-mono text-3xl font-bold mb-2 tracking-tight text-text-color">Markdown Fixer</h1>
	<p class="text-text-mute text-base max-w-xl leading-relaxed">Chuẩn hóa định dạng chữ nghiêng/đậm nghiêng trong tệp Markdown thô.</p>
</div>

<div class="modern-card rounded-2xl p-7 mb-6">
	<span class="font-mono text-xs tracking-wider text-text-mute uppercase mb-3 block">Tệp .ZIP chứa các tệp Markdown (.md)</span>
	<div
		class="border border-dashed border-border-color rounded-xl p-10 text-center cursor-pointer transition-colors relative {isDragOver ? 'border-accent-color bg-accent-soft/30' : 'hover:border-accent-color hover:bg-accent-soft/10'}"
		ondragover={handleDragOver}
		ondragleave={handleDragLeave}
		ondrop={handleDrop}
	>
		<input type="file" accept=".zip,application/zip" class="absolute inset-0 opacity-0 cursor-pointer w-full h-full" onchange={handleFileChange} />
		<p class="text-base font-semibold mb-1">Kéo thả hoặc click để chọn tệp .ZIP</p>
		<p class="text-sm text-text-mute">Tất cả các tệp .md bên trong sẽ được chuẩn hóa</p>
		{#if mdSelectedFile}
			<p class="font-mono text-sm text-amber-color mt-3 break-all">{mdSelectedFile.name}</p>
		{/if}
	</div>

	<div class="mt-5 flex gap-3 items-center font-mono text-sm flex-wrap">
		<span class="text-text-mute">Trước:</span> <code>*nghiêng*</code> · <code>***đậm nghiêng***</code>
		<span class="text-accent-color">→</span>
		<span class="text-amber-color">Sau:</span> <code>{italicSample}</code> · <code>{biSample}</code>
	</div>

	<div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5">
		<div>
			<span class="font-mono text-xs text-text-mute uppercase mb-1.5 block">Nghiêng mở</span>
			<input type="text" bind:value={italicOpen} class="w-full bg-panel-2 border border-border-color text-text-color font-mono text-sm py-2.5 px-3.5 rounded-xl outline-none focus:border-accent-color" />
		</div>
		<div>
			<span class="font-mono text-xs text-text-mute uppercase mb-1.5 block">Nghiêng đóng</span>
			<input type="text" bind:value={italicClose} class="w-full bg-panel-2 border border-border-color text-text-color font-mono text-sm py-2.5 px-3.5 rounded-xl outline-none focus:border-accent-color" />
		</div>
		<div>
			<span class="font-mono text-xs text-text-mute uppercase mb-1.5 block">Đậm+nghiêng mở</span>
			<input type="text" bind:value={biOpen} class="w-full bg-panel-2 border border-border-color text-text-color font-mono text-sm py-2.5 px-3.5 rounded-xl outline-none focus:border-accent-color" />
		</div>
		<div>
			<span class="font-mono text-xs text-text-mute uppercase mb-1.5 block">Đậm+nghiêng đóng</span>
			<input type="text" bind:value={biClose} class="w-full bg-panel-2 border border-border-color text-text-color font-mono text-sm py-2.5 px-3.5 rounded-xl outline-none focus:border-accent-color" />
		</div>
	</div>

	{#if mdSelectedFile}
		<div class="mt-5">
			<span class="font-mono text-xs text-text-mute uppercase mb-1.5 block">Tên tệp kết quả</span>
			<input type="text" bind:value={zipOutName} class="w-full bg-panel-2 border border-border-color text-text-color font-mono text-sm py-3 px-4 rounded-xl outline-none focus:border-accent-color" placeholder="ten-file-goc-da-fix" />
			<p class="text-sm text-text-mute mt-2">Tệp xuất: <span class="text-text-color font-mono">{zipNamePreview}</span></p>
		</div>

		<div class="flex items-center gap-4 mt-6">
			<button 
				class="btn font-mono text-sm tracking-wide py-3 px-6 rounded-xl bg-accent-color text-white font-semibold cursor-pointer transition-all duration-150 hover:bg-accent-hover disabled:opacity-30 disabled:cursor-not-allowed" 
				onclick={processMarkdownZip}
				disabled={processing}
			>
				{processing ? 'Đang cập nhật...' : 'Cập nhật định dạng'}
			</button>
			<button 
				class="bg-panel-2 text-amber-color border border-border-color hover:border-amber-color font-mono text-sm py-3 px-6 rounded-xl cursor-pointer transition-colors disabled:opacity-30 disabled:cursor-not-allowed" 
				onclick={downloadZip}
				disabled={!mdOutZipBlob}
			>Tải tệp .ZIP</button>
		</div>
	{/if}

	{#if status}
		<div class="font-mono text-sm mt-4 {isError ? 'text-red-500' : 'text-text-mute'}">{status}</div>
	{/if}

	{#if processedFilesList.length > 0}
		<div class="mt-5 border-t border-border-color pt-5 animate-fade-in">
			<div class="text-sm text-text-mute mb-3">
				Đã xử lý <b class="text-text-color">{totalFiles}</b> tệp .md — tổng <b class="text-text-color">{totalReplacements}</b> lượt chuyển đổi
			</div>
			<div class="border border-border-color rounded-xl max-h-[240px] overflow-y-auto bg-brand-bg p-4 font-mono text-sm">
				{#each processedFilesList as file (file.path)}
					<div class="flex justify-between gap-4 p-3.5 font-mono text-[12px] border-b border-border-color last:border-b-0">
						<span class="text-text-color overflow-hidden text-ellipsis whitespace-nowrap">{file.path}</span>
						<span class="text-amber-color shrink-0">{file.count} lượt</span>
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>

<style>
	.animate-fade-in {
		animation: fadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
	}
	@keyframes fadeIn {
		from { opacity: 0; transform: translateY(6px); }
		to { opacity: 1; transform: translateY(0); }
	}
</style>
