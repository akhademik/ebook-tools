<script lang="ts">
	import PageHeader from '$lib/components/PageHeader.svelte';
	import DropZone from '$lib/components/DropZone.svelte';
	import Input from '$lib/components/Input.svelte';
	import Button from '$lib/components/Button.svelte';
	import { MarkdownFixerState } from '$lib/markdown-fixer/markdown-fixer-state.svelte';

	const state = new MarkdownFixerState();

	$effect(() => {
		if (state.mdSelectedFile) {
			state.processMarkdownZip();
		}
	});
</script>

<svelte:head>
	<title>Markdown Fixer</title>
</svelte:head>

<PageHeader title="Markdown Fixer" description="Chuẩn hóa định dạng chữ nghiêng/đậm nghiêng/gạch chân trong tệp Markdown thô." />

<div class="modern-card rounded-2xl p-7 mb-6">
	<span class="font-mono text-xs tracking-wider text-text-mute uppercase mb-3 block">Tệp .ZIP chứa các tệp Markdown (.md)</span>
	<DropZone
		accept=".zip,application/zip"
		onSelect={(f) => state.handleFile(f)}
		title="Kéo thả hoặc click để chọn tệp .ZIP"
		subtitle="Tất cả các tệp .md bên trong sẽ được chuẩn hóa"
		selectedFile={state.mdSelectedFile}
	/>

	<div class="mt-5 flex flex-col gap-2.5 font-mono text-sm border border-border-color bg-panel-2 p-4 rounded-xl">
		<div class="flex gap-3 items-center flex-wrap">
			<span class="text-text-mute w-28">Đậm:</span>
			<code>**chữ đậm**</code> hoặc <code>__chữ đậm__</code>
			<span class="text-accent-color">→</span>
			<span class="text-amber-color"><code>*chữ đậm*</code></span>
		</div>
		<div class="flex gap-3 items-center flex-wrap">
			<span class="text-text-mute w-28">Nghiêng:</span>
			<code>*chữ nghiêng*</code> hoặc <code>_chữ nghiêng_</code>
			<span class="text-accent-color">→</span>
			<span class="text-amber-color"><code>/chữ nghiêng/</code></span>
		</div>
		<div class="flex gap-3 items-center flex-wrap">
			<span class="text-text-mute w-28">Gạch chân:</span>
			<code>&lt;u&gt;gạch chân&lt;/u&gt;</code> hoặc <code>&lt;ins&gt;gạch chân&lt;/ins&gt;</code>
			<span class="text-accent-color">→</span>
			<span class="text-amber-color"><code>_gạch chân_</code></span>
		</div>
		<div class="flex gap-3 items-center flex-wrap">
			<span class="text-text-mute w-28">Đậm nghiêng:</span>
			<code>***đậm nghiêng***</code> hoặc <code>___đậm nghiêng___</code>
			<span class="text-accent-color">→</span>
			<span class="text-amber-color"><code>*/đậm nghiêng/*</code></span>
		</div>
	</div>

	{#if state.mdSelectedFile}
		<div class="mt-5">
			<Input bind:value={state.zipOutName} label="Tên tệp kết quả" placeholder="ten-file-goc-da-fix" />
			<p class="text-sm text-text-mute mt-2">Tệp xuất: <span class="text-text-color font-mono">{state.zipNamePreview}</span></p>
		</div>

		<div class="flex items-center justify-center gap-4 mt-6 flex-wrap md:flex-nowrap">
			<div class="w-full md:w-auto md:flex-1 max-w-[220px] min-w-[170px] shrink-0">
				<Button 
					onclick={() => state.processMarkdownZip()} 
					disabled={state.processing}
					variant="primary"
				>
					{state.processing ? 'Đang cập nhật...' : 'Cập nhật định dạng'}
				</Button>
			</div>
			<div class="w-full md:w-auto md:flex-1 max-w-[220px] min-w-[170px] shrink-0">
				<Button 
					onclick={() => state.downloadZip()} 
					disabled={!state.mdOutZipBlob}
					variant="secondary"
				>
					Tải tệp .ZIP
				</Button>
			</div>
		</div>
	{/if}

	{#if state.status}
		<div class="font-mono text-sm mt-4 {state.isError ? 'text-red-500' : 'text-text-mute'}">{state.status}</div>
	{/if}

	{#if state.processedFilesList.length > 0}
		<div class="mt-5 border-t border-border-color pt-5 animate-fade-in">
			<div class="text-sm text-text-mute mb-3">
				Đã xử lý <b class="text-text-color">{state.totalFiles}</b> tệp .md — tổng <b class="text-text-color">{state.totalReplacements}</b> lượt chuyển đổi
			</div>
			<div class="border border-border-color rounded-xl max-h-[240px] overflow-y-auto bg-brand-bg p-4 font-mono text-sm">
				{#each state.processedFilesList as file (file.path)}
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
