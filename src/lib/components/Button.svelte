<script lang="ts">
	import type { ButtonProps } from '$lib/types';

	let {
		onclick,
		disabled = false,
		variant = 'primary',
		type = 'button',
		children
	}: ButtonProps = $props();
</script>

<button
	{type}
	{disabled}
	{onclick}
	class="w-full py-3 rounded-xl font-mono text-base font-semibold transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer flex justify-center items-center gap-2
		{variant === 'primary'
		? 'bg-accent-color text-white hover:bg-accent-hover shadow-lg shadow-accent-color/20'
		: variant === 'danger'
			? 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20'
			: 'bg-amber-color hover:bg-amber-600 text-brand-bg shadow-lg shadow-amber-color/10'}"
>
	{#if children}
		{@render children()}
	{/if}
</button>
