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
	<span class="text-[13px] font-semibold text-text-color mb-1.5 block">{label}</span>
{/if}
<input
	{type}
	{placeholder}
	{min}
	{max}
	{oninput}
	bind:value
	class="w-full h-11 bg-panel-2 border border-field-border text-text-color font-sans text-[15px] px-3.5 rounded-[10px] outline-none focus:border-accent-color placeholder:text-text-mute transition-colors"
/>
