<!-- src/routes/epub-to-txt/+page.svelte -->
<script lang="ts">
	import PageHeader from '$lib/components/PageHeader.svelte';
	import DropZone from '$lib/components/DropZone.svelte';
	import Button from '$lib/components/Button.svelte';
	import { EpubToTxtState } from '$lib/epub-to-txt/epub-to-txt-state.svelte';

	const state = new EpubToTxtState();
</script>

<svelte:head>
	<title>EPUB → TXT</title>
</svelte:head>

<PageHeader
	title="EPUB → TXT"
	description="Trích xuất toàn bộ nội dung sách EPUB thành văn bản thô (.TXT) sạch sẽ, loại bỏ dòng trống kép và chuẩn hóa khoảng trắng."
/>

<div class="modern-card rounded-2xl p-7 mb-6">
	<span class="font-mono text-xs tracking-wider text-text-mute uppercase mb-3 block">
		Tệp sách điện tử (.epub)
	</span>
	<DropZone
		accept=".epub,application/epub+zip"
		onSelect={(file) => state.handleFile(file)}
		title="Kéo thả hoặc click để chọn tệp .EPUB"
		subtitle="Trích xuất toàn bộ chương sách theo đúng thứ tự đọc và lưu thành file .TXT"
		selectedFile={state.selectedFile}
	/>

	{#if state.selectedFile}
		<div class="flex items-center justify-center gap-4 mt-6 flex-wrap md:flex-nowrap">
			{#if !state.result}
				<div class="w-full md:w-auto md:flex-1 max-w-65 min-w-47.5 shrink-0">
					<Button
						onclick={() => state.processEpub()}
						disabled={state.isProcessing}
						variant="primary"
					>
						{state.isProcessing ? 'Đang chuyển đổi...' : 'Bắt đầu chuyển đổi sang TXT'}
					</Button>
				</div>
			{/if}

			{#if state.result}
				<div class="w-full md:w-auto md:flex-1 max-w-65 min-w-47.5 shrink-0">
					<Button
						onclick={() => state.downloadTxt()}
						variant="primary"
					>
						Tải tệp .TXT
					</Button>
				</div>
			{/if}
		</div>
	{/if}

	{#if state.isProcessing || state.progressPercent > 0}
		<div class="mt-5 animate-fade-in">
			<p class="font-mono text-xs text-text-mute mb-2">{state.progressLabel || 'Đang trích xuất nội dung...'}</p>
			<div class="h-2 bg-panel-2 rounded-full overflow-hidden">
				<div class="h-full bg-accent-color transition-all duration-150" style="width: {state.progressPercent}%"></div>
			</div>
		</div>
	{/if}

	{#if state.status}
		<div class="font-mono text-sm mt-4 {state.isError ? 'text-red-500' : 'text-text-mute'}">{state.status}</div>
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
