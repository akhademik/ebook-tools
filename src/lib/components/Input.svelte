<script lang="ts">
	interface InputProps {
		value?: string | number | null;
		placeholder?: string;
		label?: string;
		type?: string;
		min?: number | string | null;
		max?: number | string | null;
		oninput?: (event: Event) => void;
	}

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
	bind:value={value}
	class="w-full bg-panel-2 border border-border-color text-text-color font-mono text-sm py-2.5 px-3.5 rounded-xl outline-none focus:border-accent-color transition-colors"
/>
