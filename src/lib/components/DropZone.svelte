<script lang="ts">
	interface DropZoneProps {
		accept?: string;
		multiple?: boolean;
		onSelect?: (file: File) => void;
		onSelectMultiple?: (files: FileList | File[]) => void;
		title?: string;
		subtitle?: string;
		selectedFile?: File | null;
		selectedCount?: number;
	}

	let {
		accept = '',
		multiple = false,
		onSelect,
		onSelectMultiple,
		title = 'Kéo thả hoặc click để chọn tệp',
		subtitle = '',
		selectedFile = null,
		selectedCount = 0
	}: DropZoneProps = $props();

	let isDragOver = $state(false);

	function handleDragOver(e: DragEvent): void {
		e.preventDefault();
		isDragOver = true;
	}

	function handleDragLeave(): void {
		isDragOver = false;
	}

	function handleDrop(e: DragEvent): void {
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
		const target = e.target as HTMLInputElement;
		if (multiple && onSelectMultiple && target.files?.length) {
			onSelectMultiple(target.files);
		} else {
			const file = target.files?.[0];
			if (file && onSelect) onSelect(file);
		}
	}
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="border border-dashed border-border-color rounded-xl p-10 text-center cursor-pointer transition-colors relative {isDragOver ? 'border-accent-color bg-accent-soft/30' : 'hover:border-accent-color hover:bg-accent-soft/10'}"
	ondragover={handleDragOver}
	ondragleave={handleDragLeave}
	ondrop={handleDrop}
>
	<input type="file" {accept} {multiple} class="absolute inset-0 opacity-0 cursor-pointer w-full h-full" onchange={handleFileChange} />
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
