<script lang="ts">
	import type { DropZoneProps } from '$lib/types';

	let {
		accept = '',
		multiple = false,
		disabled = false,
		compact = false,
		onSelect,
		onSelectMultiple,
		title = 'Kéo thả hoặc click để chọn file',
		subtitle = '',
		selectedFile = null,
		selectedCount = 0
	}: DropZoneProps = $props();

	let isDragOver = $state(false);

	function handleDragOver(e: DragEvent): void {
		if (disabled) return;
		e.preventDefault();
		isDragOver = true;
	}

	function handleDragLeave(): void {
		isDragOver = false;
	}

	function handleDrop(e: DragEvent): void {
		if (disabled) return;
		e.preventDefault();
		isDragOver = false;
		if (multiple && onSelectMultiple && e.dataTransfer?.files?.length) {
			onSelectMultiple(e.dataTransfer.files);
		} else {
			const file = e.dataTransfer?.files[0];
			if (file && onSelect) onSelect(file);
		}
	}

	function handleFileChange(e: Event): void {
		if (disabled) return;
		const target = e.target as HTMLInputElement;
		const fileList = target.files;
		if (!fileList || fileList.length === 0) return;

		if (multiple && onSelectMultiple) {
			onSelectMultiple(Array.from(fileList));
		} else {
			const file = fileList[0];
			if (file && onSelect) onSelect(file);
		}
	}
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="{compact
		? 'border border-dashed border-border-color rounded-xl py-3 px-3.5 sm:py-3.5 sm:px-4'
		: 'border-2 border-dashed border-border-color rounded-2xl p-6 sm:p-10'} text-center transition-all relative {disabled
		? 'opacity-60 cursor-not-allowed bg-panel-2/50'
		: 'cursor-pointer'} {isDragOver && !disabled
		? 'border-accent-color bg-accent-soft'
		: !disabled
			? 'hover:border-accent-color hover:bg-accent-soft/20'
			: ''}"
	ondragover={handleDragOver}
	ondragleave={handleDragLeave}
	ondrop={handleDrop}
>
	<input
		type="file"
		{accept}
		{multiple}
		{disabled}
		class="absolute inset-0 opacity-0 w-full h-full {disabled
			? 'cursor-not-allowed pointer-events-none'
			: 'cursor-pointer'}"
		onchange={handleFileChange}
		oninput={handleFileChange}
	/>
	<div class="flex flex-col items-center justify-center pointer-events-none">
		<div
			class="{compact
				? 'w-7 h-7 rounded-lg mb-1'
				: 'w-12 h-12 rounded-xl mb-3'} bg-accent-soft text-accent-color flex items-center justify-center"
			aria-hidden="true"
		>
			<svg
				class={compact ? 'w-3.5 h-3.5' : 'w-6 h-6'}
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="1.8"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
				<polyline points="17 8 12 3 7 8" />
				<line x1="12" y1="3" x2="12" y2="15" />
			</svg>
		</div>
		<p
			class="{compact
				? 'text-xs sm:text-sm font-medium'
				: 'text-base font-semibold'} text-text-color mb-0.5 font-sans"
		>
			{title}
		</p>
		{#if subtitle}
			<p
				class="{compact
					? 'text-[11px] sm:text-xs max-w-xs'
					: 'text-sm max-w-sm'} text-text-mute font-sans"
			>
				{subtitle}
			</p>
		{/if}
		{#if selectedFile}
			<div
				class="{compact
					? 'mt-1.5 px-2 py-0.5 rounded-md text-[11px]'
					: 'mt-3 px-3 py-1 rounded-lg text-xs'} inline-flex items-center gap-1.5 bg-panel border border-border-color"
			>
				<span class="font-mono text-accent-color break-all">{selectedFile.name}</span>
			</div>
		{:else if selectedCount > 0}
			<div
				class="{compact
					? 'mt-1.5 px-2 py-0.5 rounded-md text-[11px]'
					: 'mt-3 px-3 py-1 rounded-lg text-xs'} inline-flex items-center gap-1.5 bg-panel border border-border-color"
			>
				<span class="font-mono text-accent-color">Đã chọn {selectedCount} file ảnh</span>
			</div>
		{/if}
	</div>
</div>
