<script lang="ts">
	import type { InputProps } from '$lib/types';

	let {
		value = $bindable(),
		placeholder = '',
		label = '',
		type = 'text',
		min = null,
		max = null,
		oninput
	}: InputProps = $props();
</script>

{#if label}
	<span class="font-mono text-xs text-text-mute uppercase mb-1.5 block">{label}</span>
{/if}
<input
	{type}
	{placeholder}
	{min}
	{max}
	{oninput}
	bind:value
	class="w-full bg-panel-2 border border-border-color text-text-color font-mono text-sm py-2.5 px-3.5 rounded-xl outline-none focus:border-accent-color transition-colors"
/>
