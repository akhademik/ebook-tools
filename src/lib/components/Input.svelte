<script lang="ts">
	import type { InputProps } from '$lib/types';

	let {
		value = $bindable(),
		placeholder = '',
		label = '',
		type = 'text',
		min = null,
		max = null,
		compact = false,
		oninput
	}: InputProps = $props();
</script>

{#if label}
	<span
		class="{compact
			? 'text-xs mb-1'
			: 'text-[13px] mb-1.5'} font-semibold text-text-color block font-sans">{label}</span
	>
{/if}
<input
	{type}
	{placeholder}
	{min}
	{max}
	{oninput}
	bind:value
	class="w-full {compact
		? 'h-8 sm:h-9 text-xs px-2.5 rounded-lg'
		: 'h-11 text-[15px] px-3.5 rounded-[10px]'} bg-panel-2 border border-field-border text-text-color font-sans outline-none focus:border-accent-color placeholder:text-text-mute transition-colors"
/>
