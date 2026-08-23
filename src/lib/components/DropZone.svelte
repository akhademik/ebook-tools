<script lang="ts">
	import type { DropZoneProps } from '$lib/types';

	let {
		accept = '',
		multiple = false,
		disabled = false,
		onSelect,
		onSelectMultiple,
		title = 'Kéo thả hoặc click để chọn tệp',
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
	class="border border-dashed border-border-color rounded-xl p-6 sm:p-10 text-center transition-colors relative {disabled ? 'opacity-50 cursor-not-allowed bg-surface-alt/50' : 'cursor-pointer'} {isDragOver && !disabled ? 'border-accent-color bg-accent-soft/30' : !disabled ? 'hover:border-accent-color hover:bg-accent-soft/10' : ''}"
	ondragover={handleDragOver}
	ondragleave={handleDragLeave}
	ondrop={handleDrop}
>
	<input
		type="file"
		{accept}
		{multiple}
		{disabled}
		class="absolute inset-0 opacity-0 w-full h-full {disabled ? 'cursor-not-allowed pointer-events-none' : 'cursor-pointer'}"
		onchange={handleFileChange}
		oninput={handleFileChange}
	/>
	<p class="text-base font-semibold mb-1">{title}</p>
	{#if subtitle}
		<p class="text-sm text-text-mute">{subtitle}</p>
	{/if}
	{#if selectedFile}
		<p class="font-mono text-sm text-amber-color mt-3 break-all">{selectedFile.name}</p>
	{:else if selectedCount > 0}
		<p class="font-mono text-sm text-amber-color mt-3">Đã chọn {selectedCount} tệp ảnh</p>
	{/if}
</div>
