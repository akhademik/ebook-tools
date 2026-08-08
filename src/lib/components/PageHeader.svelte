<script>
	let {
		title = '',
		description = ''
	} = $props();
</script>

<div class="mb-10 animate-fade-in">
	<h1 class="font-mono text-3xl font-bold mb-2 tracking-tight text-text-color">{title}</h1>
	{#if description}
		<p class="text-text-mute text-base max-w-xl leading-relaxed">{description}</p>
	{/if}
</div>
