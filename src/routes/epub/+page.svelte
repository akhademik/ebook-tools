<script>
	import JSZip from 'jszip';
	import { slugify, ensureEpubExt, triggerDownload } from '$lib/helpers/helpers.js';
	import {
		cleanHeaderFooterOcr,
		parseMarkdownBlocks,
		groupChapters,
		assignSequentialChapterIds,
		buildEpubBlob,
		EPUB_CSS,
		getCleanedLinesReport
	} from './epub-utils.js';

	// State variables (Svelte 5 runes)
	let epubFileSelected = $state(null);
	let epubRawFiles = $state([]);
	let epubChapters = $state([]);
	let epubBlob = $state(null);

	let mergePattern = $state('');
	let heuristicMode = $state(false);
	let heuristicStart = $state(null);
	let heuristicEnd = $state(null);
	let cleanKeywords = $state('{no}, {roman_no}');

	let title = $state('');
	let author = $state('');
	let lang = $state('vi');
	let publisher = $state('');
	let epubOutName = $state('');

	let status = $state('');
	let isError = $state(false);
	let parseStatus = $state('');
	let parseIsError = $state(false);
	let processing = $state(false);
	let isDragOver = $state(false);

	let heuristicThreshold = $state(5);
	let activeTab = $state('toc'); // 'toc' | 'diff'
	let cleanedLinesReport = $state([]);
	let visibleCleanedCount = $state(20);
	let cleanLineLimit = $state(2);

	// Derived state
	let epubOutNamePreview = $derived(ensureEpubExt(epubOutName.trim() || 'ten-sach'));

	function applyEpubGrouping() {
		if (epubRawFiles.length === 0) return;
		
		const keywords = (cleanKeywords || '')
			.split(',')
			.map(s => s.trim())
			.filter(Boolean);
		
		const titleVal = title.trim();
		const authorVal = author.trim();
		if (titleVal) keywords.push(titleVal);
		if (authorVal) keywords.push(authorVal);

		const processedFiles = epubRawFiles.map(f => {
			const cleanedMd = cleanHeaderFooterOcr(f.rawText, keywords, cleanLineLimit);
			return {
				path: f.path,
				baseName: f.baseName,
				blocks: parseMarkdownBlocks(cleanedMd)
			};
		});

		const startPage = parseInt(heuristicStart, 10) || 1;
		const endPage = parseInt(heuristicEnd, 10) || processedFiles.length;

		const grouped = groupChapters(
			processedFiles,
			mergePattern,
			heuristicMode,
			startPage,
			endPage,
			heuristicThreshold
		);
		const newChapters = assignSequentialChapterIds(grouped);
		epubChapters = newChapters;

		cleanedLinesReport = getCleanedLinesReport(epubRawFiles, cleanKeywords, cleanLineLimit);

		const mergedCount = epubRawFiles.length - grouped.length;
		parseStatus = mergedCount > 0
			? `Có ${epubRawFiles.length} tệp Markdown, gộp thành ${grouped.length} chương.`
			: `Tìm thấy ${grouped.length} chương — kiểm tra thứ tự & tiêu đề bên trên trước khi đóng gói.`;
		parseIsError = false;
	}

	function handleFile(file) {
		if (!file) return;
		if (!/\.zip$/i.test(file.name)) {
			parseStatus = 'Vui lòng chọn một tệp .ZIP hợp lệ.';
			parseIsError = true;
			return;
		}
		parseStatus = 'Đang đọc các chương Markdown...';
		parseIsError = false;
		epubFileSelected = file;
		epubOutName = slugify(file.name);
		title = title || slugify(file.name).replace(/-/g, ' ');
		epubBlob = null;
		epubChapters = [];
		epubRawFiles = [];
		visibleCleanedCount = 20;

		loadZipContent(file);
	}

	async function loadZipContent(file) {
		try {
			const arrayBuffer = await file.arrayBuffer();
			const zip = await JSZip.loadAsync(arrayBuffer);
			const entries = Object.values(zip.files)
				.filter(e => !e.dir && /\.md$/i.test(e.name))
				.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));

			const rawFiles = [];
			for (const entry of entries) {
				const mdText = await entry.async('string');
				const baseName = entry.name.split('/').pop().replace(/\.md$/i, '');
				rawFiles.push({
					baseName: baseName.replace(/[-_]+/g, ' ').trim() || baseName,
					rawText: mdText,
					path: entry.name
				});
			}

			epubRawFiles = rawFiles;
			if (rawFiles.length === 0) {
				epubChapters = [];
				parseStatus = 'Không tìm thấy tệp Markdown nào trong tệp .ZIP này.';
				parseIsError = true;
			}
		} catch (err) {
			console.error(err);
			parseStatus = 'Lỗi khi đọc tệp .ZIP: ' + err.message;
			parseIsError = true;
		}
	}

	// Drag & drop handlers
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

	async function processEpub() {
		if (epubChapters.length === 0) return;
		processing = true;
		epubBlob = null;
		status = 'Đang đóng gói EPUB…';
		isError = false;

		try {
			const metadata = {
				title: title.trim(),
				author: author.trim(),
				language: lang.trim() || 'vi',
				publisher: publisher.trim()
			};
			epubBlob = await buildEpubBlob(metadata, epubChapters, EPUB_CSS);
			status = `Hoàn tất — ${epubChapters.length} chương đã sẵn sàng.`;
		} catch (err) {
			console.error(err);
			status = 'Có lỗi khi đóng gói: ' + err.message;
			isError = true;
		} finally {
			processing = false;
		}
	}

	function downloadEpub() {
		if (!epubBlob) return;
		triggerDownload(epubBlob, epubOutNamePreview);
	}

	// Reactive loop for auto-grouping when configs change
	$effect(() => {
		if (epubRawFiles.length > 0) {
			applyEpubGrouping();
		}
	});
</script>

<svelte:head>
	<title>Đóng gói EPUB — Ebook Forge</title>
</svelte:head>

<div class="mb-10 animate-fade-in">
	<h1 class="font-mono text-3xl font-bold mb-2 tracking-tight text-text-color">Đóng gói EPUB</h1>
	<p class="text-text-mute text-base max-w-xl leading-relaxed">Gộp các chương Markdown thành một tệp sách điện tử .EPUB hoàn chỉnh.</p>
</div>

<div class="modern-card rounded-2xl p-7 mb-6">
	<span class="font-mono text-xs tracking-wider text-text-mute uppercase mb-3 block">Tệp .ZIP chứa các chương (.md)</span>
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="border border-dashed border-border-color rounded-xl p-10 text-center cursor-pointer transition-colors relative {isDragOver ? 'border-accent-color bg-accent-soft/30' : 'hover:border-accent-color hover:bg-accent-soft/10'}"
		ondragover={handleDragOver}
		ondragleave={handleDragLeave}
		ondrop={handleDrop}
	>
		<input type="file" accept=".zip,application/zip" class="absolute inset-0 opacity-0 cursor-pointer w-full h-full" onchange={handleFileChange} />
		<p class="text-base font-semibold mb-1">Kéo thả hoặc click để chọn tệp .ZIP</p>
		<p class="text-sm text-text-mute">Tự động sắp xếp và tạo XHTML chương tuần tự 01, 02...</p>
		{#if epubFileSelected}
			<p class="font-mono text-sm text-amber-color mt-3 break-all">{epubFileSelected.name}</p>
		{/if}
	</div>

	{#if epubRawFiles.length > 0}
		<div class="mt-5 animate-fade-in">
			<span class="font-mono text-xs text-text-mute uppercase mb-1.5 block">Từ khóa nhận diện tiêu đề chương mới</span>
			<input type="text" bind:value={mergePattern} class="w-full bg-panel-2 border border-border-color text-text-color font-mono text-sm py-2.5 px-3.5 rounded-xl outline-none focus:border-accent-color" placeholder="Ví dụ: chương — để trống nếu mỗi tệp là 1 chương" />
		</div>

		<div class="flex items-center gap-3 mt-5">
			<input type="checkbox" id="epub-heuristic-mode" bind:checked={heuristicMode} class="w-4 h-4 accent-accent-color cursor-pointer" />
			<div>
				<label for="epub-heuristic-mode" class="text-sm text-text-color cursor-pointer font-medium">Nhận diện bằng Heuristic thông minh</label>
				<span class="block text-xs text-text-mute mt-0.5">Tính điểm tiêu đề dựa trên chữ viết HOA, độ dài và dấu câu</span>
			</div>
		</div>

		{#if heuristicMode}
			<div class="flex items-center gap-3 mt-4 flex-wrap animate-fade-in bg-panel-2 p-4 rounded-xl border border-border-color">
				<div class="flex items-center gap-3 w-full flex-wrap">
					<span class="font-mono text-sm text-text-mute">Giới hạn Heuristic từ trang</span>
					<input type="number" bind:value={heuristicStart} class="bg-brand-bg border border-border-color text-text-color font-mono text-sm py-1.5 px-3 rounded-xl w-20 text-center outline-none focus:border-accent-color" min="1" placeholder="Đầu" />
					<span class="font-mono text-sm text-text-mute">đến trang</span>
					<input type="number" bind:value={heuristicEnd} class="bg-brand-bg border border-border-color text-text-color font-mono text-sm py-1.5 px-3 rounded-xl w-20 text-center outline-none focus:border-accent-color" min="1" placeholder="Cuối" />
				</div>
				<div class="flex items-center gap-3 w-full mt-4 flex-wrap border-t border-border-color pt-4">
					<span class="font-mono text-sm text-text-mute">Ngưỡng điểm (Threshold):</span>
					<input type="range" min="1" max="10" step="1" bind:value={heuristicThreshold} class="h-1.5 bg-brand-bg rounded-lg appearance-none cursor-pointer accent-accent-color w-40" />
					<span class="font-mono text-sm font-semibold text-accent-color w-8 text-center">{heuristicThreshold}</span>
					<p class="text-xs text-text-mute w-full mt-1.5 leading-relaxed">
						Giảm ngưỡng để bắt nhiều tiêu đề hơn (cho sách quét OCR xấu). Tăng ngưỡng để tránh nhận diện nhầm đoạn văn thường thành chương.
					</p>
				</div>
			</div>
		{/if}

		<div class="mt-5 bg-panel-2 p-4 rounded-xl border border-border-color flex flex-col gap-3">
			<div>
				<span class="font-mono text-xs text-text-mute uppercase mb-1.5 block">Lọc Header/Footer (Tùy chọn)</span>
				<input type="text" bind:value={cleanKeywords} class="w-full bg-brand-bg border border-border-color text-text-color font-mono text-sm py-2.5 px-3.5 rounded-xl outline-none focus:border-accent-color" placeholder="Tên sách, Nhà xuất bản" />
			</div>
			<div class="flex items-center gap-3 mt-1.5 flex-wrap border-t border-border-color pt-3">
				<span class="font-mono text-sm text-text-mute">Số dòng quét đầu/cuối trang:</span>
				<input type="range" min="1" max="5" step="1" bind:value={cleanLineLimit} class="h-1.5 bg-brand-bg rounded-lg appearance-none cursor-pointer accent-accent-color w-32" />
				<span class="font-mono text-sm font-semibold text-accent-color w-6 text-center">{cleanLineLimit}</span>
				<p class="text-xs text-text-mute w-full leading-relaxed mt-1">
					Chỉ quét các file có từ 6 dòng trở lên. Tự động bỏ qua lọc nếu dòng đầu hoặc cuối là đoạn văn đầy đủ (để tránh mất nội dung truyện).
				</p>
			</div>
		</div>
	{/if}

	{#if epubChapters.length > 0}
		<!-- Tab Navigation -->
		<div class="flex border-b border-border-color mt-6 font-mono text-xs">
			<button 
				type="button" 
				class="py-2.5 px-4 font-semibold transition-colors border-b-2 cursor-pointer {activeTab === 'toc' ? 'border-accent-color text-accent-color' : 'border-transparent text-text-mute hover:text-text-color'}"
				onclick={() => { activeTab = 'toc'; }}
			>Mục lục kết quả</button>
			
			<button 
				type="button" 
				class="py-2.5 px-4 font-semibold transition-colors border-b-2 cursor-pointer relative {activeTab === 'diff' ? 'border-accent-color text-accent-color' : 'border-transparent text-text-mute hover:text-text-color'}"
				onclick={() => { activeTab = 'diff'; }}
			>
				Lọc Header/Footer ({cleanedLinesReport.length})
			</button>
		</div>

		<!-- Tab Contents -->
		{#if activeTab === 'toc'}
			<div class="mt-4 border border-border-color rounded-xl max-h-[300px] overflow-y-auto bg-brand-bg p-4 font-mono text-sm animate-fade-in">
				{#each epubChapters as chapter (chapter.xmlId)}
					<div class="flex justify-between gap-4 p-3.5 font-mono text-[12px] border-b border-border-color last:border-b-0">
						<span class="text-text-color overflow-hidden text-ellipsis whitespace-nowrap" title="{chapter.fileName}.xhtml — {chapter.sources.length > 1 ? `gộp ${chapter.sources.length} nguồn: ${chapter.sources.join(', ')}` : chapter.sources[0]}">
							{chapter.fileName}.xhtml — {chapter.sources.length > 1 ? `gộp ${chapter.sources.length} nguồn` : chapter.sources[0]}
						</span>
						<span class="text-amber-color shrink-0">{chapter.title}</span>
					</div>
				{/each}
			</div>
		{:else if activeTab === 'diff'}
			<div class="mt-4 border border-border-color rounded-xl max-h-[350px] overflow-y-auto bg-brand-bg p-4 font-mono text-sm animate-fade-in flex flex-col gap-4">
				{#if cleanedLinesReport.length === 0}
					<div class="p-8 text-center text-text-mute font-sans">Không có tệp tin Markdown nào đủ điều kiện quét lọc (> 5 dòng và không có đoạn văn thực sự).</div>
				{:else}
					{#each cleanedLinesReport.slice(0, visibleCleanedCount) as fileReport, fIdx (fileReport.fileName + '_' + fIdx)}
						<div class="border border-border-color rounded-lg overflow-hidden bg-panel-2/30 shrink-0">
							<div class="bg-panel-2 py-2 px-3 text-[11px] font-semibold text-accent-color border-b border-border-color flex justify-between">
								<span>{fileReport.fileName}.md</span>
								<span class="text-text-mute font-normal font-sans">Đang quét {fileReport.scanned.length} dòng (đầu/cuối)</span>
							</div>
							<div class="p-2 flex flex-col gap-1.5 font-mono text-[11px]">
								{#each fileReport.scanned as line, lIdx (line.lineNum + '_' + lIdx)}
									{#if line.isRemoved}
										<div class="flex flex-col gap-0.5 p-2 bg-red-500/5 border border-red-500/10 rounded text-red-400">
											<span class="text-[9px] opacity-60 font-semibold">[Dòng {line.lineNum} · {line.location} · Sẽ xóa]</span>
											<span class="line-through leading-relaxed break-all">- {line.text || '(Dòng trống)'}</span>
										</div>
									{:else}
										<div class="flex flex-col gap-0.5 p-2 bg-green-500/5 border border-green-500/10 rounded text-green-400">
											<span class="text-[9px] opacity-60 font-semibold">[Dòng {line.lineNum} · {line.location} · Giữ lại]</span>
											<span class="leading-relaxed break-all">+ {line.text || '(Dòng trống)'}</span>
										</div>
									{/if}
								{/each}
							</div>
						</div>
					{/each}
					{#if cleanedLinesReport.length > visibleCleanedCount}
						<button 
							type="button" 
							class="w-full text-center py-2.5 bg-panel-2 border border-border-color hover:border-accent-color rounded-lg text-text-color transition-colors mt-2 text-xs font-semibold cursor-pointer shrink-0"
							onclick={() => { visibleCleanedCount += 20; }}
						>
							Xem thêm {cleanedLinesReport.length - visibleCleanedCount} tệp nữa...
						</button>
					{/if}
				{/if}
			</div>

		{/if}
	{/if}

	{#if parseStatus}
		<div class="font-mono text-sm mt-3 {parseIsError ? 'text-red-500' : 'text-text-mute'}">{parseStatus}</div>
	{/if}
</div>

{#if epubRawFiles.length > 0}
	<div class="modern-card rounded-2xl p-7 mb-6 animate-fade-in">
		<span class="font-mono text-xs tracking-wider text-text-mute uppercase mb-3 block">Siêu dữ liệu sách (Metadata)</span>
		<div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
			<div>
				<span class="font-mono text-xs text-text-mute uppercase mb-1.5 block">Tiêu đề sách</span>
				<input type="text" bind:value={title} class="w-full bg-panel-2 border border-border-color text-text-color font-mono text-sm py-2.5 px-3.5 rounded-xl outline-none focus:border-accent-color" placeholder="Nhập tên sách" />
			</div>
			<div>
				<span class="font-mono text-xs text-text-mute uppercase mb-1.5 block">Tác giả</span>
				<input type="text" bind:value={author} class="w-full bg-panel-2 border border-border-color text-text-color font-mono text-sm py-2.5 px-3.5 rounded-xl outline-none focus:border-accent-color" placeholder="Tên tác giả" />
			</div>
			<div>
				<span class="font-mono text-xs text-text-mute uppercase mb-1.5 block">Ngôn ngữ</span>
				<input type="text" bind:value={lang} class="w-full bg-panel-2 border border-border-color text-text-color font-mono text-sm py-2.5 px-3.5 rounded-xl outline-none focus:border-accent-color" />
			</div>
			<div>
				<span class="font-mono text-xs text-text-mute uppercase mb-1.5 block">Nhà xuất bản</span>
				<input type="text" bind:value={publisher} class="w-full bg-panel-2 border border-border-color text-text-color font-mono text-sm py-2.5 px-3.5 rounded-xl outline-none focus:border-accent-color" placeholder="NXB Ebook" />
			</div>
		</div>
	</div>

	<div class="modern-card rounded-2xl p-7 mb-6 animate-fade-in">
		<div class="mb-5">
			<span class="font-mono text-xs text-text-mute uppercase mb-1.5 block">Tên tệp EPUB đầu ra (.epub)</span>
			<input type="text" bind:value={epubOutName} class="w-full bg-panel-2 border border-border-color text-text-color font-mono text-sm py-3 px-4 rounded-xl outline-none focus:border-accent-color" placeholder="ten-sach" />
			<p class="text-sm text-text-mute mt-2">Tệp tải về: <span class="text-text-color font-mono">{epubOutNamePreview}</span></p>
		</div>

		<div class="flex items-center gap-4 mt-6">
			<button 
				class="btn font-mono text-sm tracking-wide py-3 px-6 rounded-xl bg-accent-color text-white font-semibold cursor-pointer transition-all duration-150 hover:bg-accent-hover disabled:opacity-30 disabled:cursor-not-allowed" 
				onclick={processEpub} 
				disabled={epubChapters.length === 0 || processing}
			>
				{processing ? 'Đang đóng gói...' : 'Đóng gói tệp EPUB'}
			</button>
			<button 
				class="bg-panel-2 text-amber-color border border-border-color hover:border-amber-color font-mono text-sm py-3 px-6 rounded-xl cursor-pointer transition-colors disabled:opacity-30 disabled:cursor-not-allowed" 
				onclick={downloadEpub} 
				disabled={!epubBlob}
			>Tải tệp .EPUB</button>
		</div>

		{#if status}
			<div class="font-mono text-sm mt-4 {isError ? 'text-red-500' : 'text-text-mute'}">{status}</div>
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
