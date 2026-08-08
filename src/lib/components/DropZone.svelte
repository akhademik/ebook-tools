<script>
	let {
		accept = '',
		onSelect,
		title = 'Kéo thả hoặc click để chọn tệp',
		subtitle = '',
		selectedFile = null
	} = $props();

	let isDragOver = $state(false);

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
		if (file && onSelect) onSelect(file);
	}

	function handleFileChange(e) {
		const file = e.target.files?.[0];
		if (file && onSelect) onSelect(file);
	}
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="border border-dashed border-border-color rounded-xl p-10 text-center cursor-pointer transition-colors relative {isDragOver ? 'border-accent-color bg-accent-soft/30' : 'hover:border-accent-color hover:bg-accent-soft/10'}"
	ondragover={handleDragOver}
	ondragleave={handleDragLeave}
	ondrop={handleDrop}
>
	<input type="file" {accept} class="absolute inset-0 opacity-0 cursor-pointer w-full h-full" onchange={handleFileChange} />
	<p class="text-base font-semibold mb-1">{title}</p>
	{#if subtitle}
		<p class="text-sm text-text-mute">{subtitle}</p>
	{/if}
	{#if selectedFile}
		<p class="font-mono text-sm text-amber-color mt-3 break-all">{selectedFile.name}</p>
	{/if}
</div>
