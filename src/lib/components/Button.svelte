<script lang="ts">
	import type { ButtonProps } from '$lib/types';

	interface Props extends ButtonProps {
		class?: string;
		size?: 'default' | 'lg';
	}

	let {
		onclick,
		disabled = false,
		variant = 'primary',
		type = 'button',
		size = 'default',
		class: customClass = '',
		children
	}: Props = $props();
</script>

<button
	{type}
	{disabled}
	{onclick}
	class="w-full {size === 'lg'
		? 'h-12 text-base'
		: 'h-11 text-[15px]'} px-4 rounded-xl font-sans font-semibold transition-all active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed disabled:pointer-events-none cursor-pointer flex justify-center items-center gap-2
		{variant === 'primary'
		? 'bg-accent-color text-on-accent hover:bg-accent-hover shadow-sm'
		: variant === 'secondary'
			? 'bg-transparent border border-field-border text-text-color hover:bg-panel shadow-sm font-medium'
			: variant === 'danger'
				? 'bg-red-500 hover:bg-red-600 text-white shadow-sm'
				: 'bg-amber-color hover:bg-amber-600 text-brand-bg shadow-sm'} {customClass}"
>
	{#if children}
		{@render children()}
	{/if}
</button>
