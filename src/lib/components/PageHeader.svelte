<script lang="ts">
	import type { PageHeaderProps } from '$lib/types';

	let { title = '', description = '' }: PageHeaderProps = $props();
</script>

<div class="mb-8 animate-fade-in">
	<h1
		class="font-sans text-2xl sm:text-3xl font-bold mb-2 tracking-tight text-text-color leading-tight"
	>
		{title}
	</h1>
	{#if description}
		<p class="text-text-mute font-sans text-sm sm:text-base max-w-2xl leading-relaxed">
			{description}
		</p>
	{/if}
</div>
