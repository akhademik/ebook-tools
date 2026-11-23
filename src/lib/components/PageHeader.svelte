<script lang="ts">
	import type { PageHeaderProps } from '$lib/types';

	interface Props extends PageHeaderProps {
		breadcrumb?: string;
		badge?: boolean | string;
	}

	let { title = '', description = '', breadcrumb = '', badge = false }: Props = $props();
</script>

<div class="mb-8 animate-fade-in">
	{#if breadcrumb}
		<nav
			aria-label="Đường dẫn phân mục"
			class="flex items-center gap-1.5 text-xs text-text-mute mb-2 font-medium"
		>
			<span>{breadcrumb}</span>
			<svg
				class="w-3.5 h-3.5 text-border-color"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
			>
				<path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
			</svg>
			<span class="text-text-color font-semibold">{title}</span>
		</nav>
	{/if}

	<div class="flex items-center gap-3 flex-wrap mb-2">
		<h1
			class="font-sans text-2xl sm:text-3xl font-bold tracking-tight text-text-color leading-tight"
		>
			{title}
		</h1>
		{#if badge}
			<span
				class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-ok/10 text-ok border border-ok/20"
			>
				<svg
					class="w-3.5 h-3.5 shrink-0"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
					/>
				</svg>
				<span>{typeof badge === 'string' ? badge : 'Xử lý ngay trên máy bạn'}</span>
			</span>
		{/if}
	</div>

	{#if description}
		<p class="text-text-mute font-sans text-sm sm:text-base max-w-2xl leading-relaxed">
			{description}
		</p>
	{/if}
</div>
