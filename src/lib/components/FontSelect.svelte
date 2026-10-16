<script lang="ts">
	import { AVAILABLE_FONTS, findFont } from '$lib/epub-packer/templates/fonts';
	import type { FontSelectProps } from '$lib/types';

	let {
		id = '',
		value = $bindable('default'),
		label = '',
		placeholder = 'Mặc định',
		disabled = false,
		compact = false
	}: FontSelectProps = $props();

	let isOpen = $state(false);
	let searchQuery = $state('');

	const activeFont = $derived(value !== 'default' ? findFont(value) : null);

	const filteredFonts = $derived(
		searchQuery.trim() === ''
			? AVAILABLE_FONTS
			: AVAILABLE_FONTS.filter((f) => {
					const query = searchQuery.toLowerCase().trim();
					return (
						f.name.toLowerCase().includes(query) ||
						f.id.toLowerCase().includes(query) ||
						f.cssFamily.toLowerCase().includes(query)
					);
				})
	);

	function selectFont(fontId: string) {
		value = fontId;
		isOpen = false;
		searchQuery = '';
	}

	function handleKeydown(e: KeyboardEvent) {
		if (isOpen && e.key === 'Escape') {
			isOpen = false;
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="relative w-full">
	{#if label}
		<label for={id} class="font-mono text-xs text-text-mute uppercase mb-2 block font-semibold">
			{label}
		</label>
	{/if}

	<!-- Trigger Button -->
	<button
		type="button"
		id={id ? `${id}-btn` : undefined}
		{disabled}
		class="w-full bg-brand-bg text-text-color border border-border-color hover:border-accent-color focus:border-accent-color focus:outline-none rounded-xl font-sans transition-all flex items-center justify-between cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-left {compact
			? 'h-9 py-1.5 px-3 text-xs'
			: 'h-11.5 py-2 px-3.5 text-sm'}"
		onclick={() => (isOpen = !isOpen)}
		aria-expanded={isOpen}
		aria-haspopup="listbox"
	>
		<div class="flex items-center min-w-0 mr-2">
			{#if !activeFont || value === 'default'}
				<span class="font-sans {compact ? 'text-xs' : 'text-sm'} text-text-mute">{placeholder}</span
				>
			{:else}
				<span
					class="{compact ? 'text-xs' : 'text-base'} truncate font-normal"
					style="font-family: '{activeFont.id}', '{activeFont.cssFamily}', '{activeFont.name}', sans-serif;"
				>
					{activeFont.name}
				</span>
				<span class="font-mono text-[11px] text-text-mute ml-2 shrink-0 hidden sm:inline">
					({activeFont.id})
				</span>
			{/if}
		</div>

		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 20 20"
			fill="currentColor"
			class="w-4 h-4 text-text-mute transition-transform duration-200 shrink-0 {isOpen
				? 'rotate-180'
				: ''}"
		>
			<path
				fill-rule="evenodd"
				d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
				clip-rule="evenodd"
			/>
		</svg>
	</button>

	<!-- Backdrop overlay to dismiss -->
	{#if isOpen}
		<div
			class="fixed inset-0 z-40"
			onclick={() => (isOpen = false)}
			tabindex="-1"
			aria-hidden="true"
		></div>

		<!-- Dropdown Panel -->
		<div
			class="absolute top-full mt-1.5 z-50 bg-panel border border-border-color rounded-xl shadow-2xl overflow-hidden flex flex-col animate-slide-up {compact
				? 'right-0 w-64 sm:w-72'
				: 'left-0 right-0'}"
			role="listbox"
		>
			<!-- Search filter -->
			<div class="p-2 border-b border-border-color bg-panel-2">
				<input
					type="text"
					bind:value={searchQuery}
					placeholder="Tìm kiếm phông chữ..."
					class="w-full bg-brand-bg text-text-color border border-border-color focus:border-accent-color rounded-lg px-3 py-1.5 text-xs font-sans outline-none transition-colors"
					onclick={(e) => e.stopPropagation()}
				/>
			</div>

			<!-- List of fonts with real-time typeface preview -->
			<div class="max-h-64 overflow-y-auto divide-y divide-border-color/30">
				<!-- Default option -->
				<button
					type="button"
					class="w-full text-left px-3.5 py-2.5 hover:bg-accent-soft flex items-center justify-between transition-colors cursor-pointer {value ===
					'default'
						? 'bg-accent-soft'
						: ''}"
					onclick={() => selectFont('default')}
				>
					<div>
						<span class="font-sans text-sm font-medium">Mặc định</span>
						<span class="text-xs text-text-mute ml-2 font-mono">(System sans-serif)</span>
					</div>
					{#if value === 'default'}
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 20 20"
							fill="currentColor"
							class="w-4 h-4 text-accent-color shrink-0"
						>
							<path
								fill-rule="evenodd"
								d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
								clip-rule="evenodd"
							/>
						</svg>
					{/if}
				</button>

				{#each filteredFonts as font (font.id)}
					<button
						type="button"
						class="w-full text-left px-3.5 py-2.5 hover:bg-accent-soft flex items-center justify-between gap-3 transition-colors cursor-pointer {value ===
						font.id
							? 'bg-accent-soft'
							: ''}"
						onclick={() => selectFont(font.id)}
					>
						<div class="flex flex-col min-w-0">
							<span
								class="text-lg leading-snug truncate"
								style="font-family: '{font.id}', '{font.cssFamily}', '{font.name}', sans-serif;"
							>
								{font.name}
							</span>
							<div class="flex items-center gap-2 mt-0.5">
								<span
									class="text-xs text-text-mute truncate"
									style="font-family: '{font.id}', '{font.cssFamily}', '{font.name}', sans-serif;"
								>
									Chương 1: Bình minh
								</span>
								<span class="text-[10px] text-text-mute/70 font-mono">
									• {font.id}
								</span>
							</div>
						</div>
						{#if value === font.id}
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 20 20"
								fill="currentColor"
								class="w-4 h-4 text-accent-color shrink-0"
							>
								<path
									fill-rule="evenodd"
									d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
									clip-rule="evenodd"
								/>
							</svg>
						{/if}
					</button>
				{/each}

				{#if filteredFonts.length === 0}
					<div class="p-4 text-center text-xs text-text-mute font-mono">
						Không tìm thấy phông chữ "{searchQuery}"
					</div>
				{/if}
			</div>
		</div>
	{/if}

	<!-- Hidden native select for form accessibility and automation -->
	<select {id} bind:value class="sr-only" tabindex="-1" aria-hidden="true">
		<option value="default">Mặc định</option>
		{#each AVAILABLE_FONTS as font (font.id)}
			<option value={font.id}>{font.name}</option>
		{/each}
	</select>
</div>
