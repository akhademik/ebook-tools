<script lang="ts">
	import { AVAILABLE_FONTS, findFont } from '$lib/epub-packer/templates/fonts';
	import type { FontSelectProps } from '$lib/types';

	let {
		id = '',
		value = $bindable('default'),
		label = '',
		placeholder = 'Bookerly',
		disabled = false,
		compact = false
	}: FontSelectProps = $props();

	let isOpen = $state(false);
	let searchQuery = $state('');
	let listContainerEl = $state<HTMLDivElement | null>(null);

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
			searchQuery = '';
		}
	}

	function initScroll(node: HTMLElement) {
		listContainerEl = node as HTMLDivElement;
		const scrollToActive = () => {
			const activeEl = node.querySelector<HTMLElement>('[aria-selected="true"]');
			if (activeEl) {
				const buttonTop = activeEl.offsetTop;
				const buttonHeight = activeEl.offsetHeight;
				const containerHeight = node.clientHeight;
				if (buttonTop > 0 || containerHeight > 0) {
					node.scrollTop = Math.max(0, buttonTop - containerHeight / 2 + buttonHeight / 2);
				}
			}
		};

		requestAnimationFrame(scrollToActive);
		setTimeout(scrollToActive, 20);
	}

	$effect(() => {
		if (searchQuery.trim() !== '' && listContainerEl) {
			listContainerEl.scrollTop = 0;
		}
	});
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="relative w-full">
	{#if label}
		<label for={id} class="text-[13px] font-semibold text-text-color mb-1.5 block">
			{label}
		</label>
	{/if}

	<!-- Trigger Button -->
	<button
		type="button"
		id={id ? `${id}-btn` : undefined}
		{disabled}
		class="w-full bg-panel-2 text-text-color border border-field-border hover:border-accent-color focus:border-accent-color focus:outline-none rounded-xl font-sans transition-all flex items-center justify-between cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed text-left {compact
			? 'h-9 py-1.5 px-3 text-xs'
			: 'h-11 py-2 px-3.5 text-sm'}"
		onclick={() => (isOpen = !isOpen)}
		aria-expanded={isOpen}
		aria-haspopup="listbox"
	>
		{#if compact}
			<div class="flex items-center min-w-0 mr-2 truncate">
				{#if !activeFont || value === 'default'}
					<span
						class="text-xs text-text-color truncate font-medium"
						style="font-family: 'Bookerly', serif;"
					>
						{placeholder}
					</span>
				{:else}
					<span
						class="text-xs truncate font-medium text-text-color"
						style="font-family: '{activeFont.id}', '{activeFont.cssFamily}', '{activeFont.name}', sans-serif;"
					>
						{activeFont.name}
					</span>
				{/if}
			</div>
		{:else}
			<div class="flex items-center min-w-0 mr-2 text-left truncate">
				{#if !activeFont || value === 'default'}
					<span class="text-sm font-medium text-text-color truncate">
						{placeholder || 'Bookerly'}
					</span>
				{:else}
					<span
						class="text-sm font-medium text-text-color truncate"
						style="font-family: '{activeFont.id}', '{activeFont.cssFamily}', '{activeFont.name}', sans-serif;"
					>
						{activeFont.name}
					</span>
				{/if}
			</div>
		{/if}

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
			onclick={() => {
				isOpen = false;
				searchQuery = '';
			}}
			tabindex="-1"
			aria-hidden="true"
		></div>

		<!-- Dropdown Panel -->
		<div
			class="absolute top-full mt-1.5 z-50 bg-panel border border-border-color rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-slide-up {compact
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
					class="w-full bg-brand-bg text-text-color border border-field-border focus:border-accent-color rounded-lg px-3 py-1.5 text-xs font-sans outline-none transition-colors"
					onclick={(e) => e.stopPropagation()}
				/>
			</div>

			<!-- List of fonts with real-time typeface preview -->
			<div class="relative max-h-64 overflow-y-auto divide-y divide-border-color/30" use:initScroll>
				<!-- Default option -->
				<button
					type="button"
					role="option"
					data-font-id="default"
					aria-selected={value === 'default'}
					class="w-full text-left px-3.5 py-2.5 hover:bg-accent-soft flex items-center justify-between transition-colors cursor-pointer {value ===
					'default'
						? 'bg-accent-soft'
						: ''}"
					onclick={() => selectFont('default')}
				>
					<div class="flex items-center gap-2 min-w-0">
						<span class="text-sm font-medium text-text-color shrink-0"> Bookerly </span>
						<span class="text-text-mute shrink-0 text-xs select-none"> - </span>
						<span class="text-sm text-text-mute truncate" style="font-family: 'Bookerly', serif;">
							Text mẫu
						</span>
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
					{@const isSelected = value === font.id}
					<button
						type="button"
						role="option"
						data-font-id={font.id}
						aria-selected={isSelected}
						class="w-full text-left px-3.5 py-2.5 hover:bg-accent-soft flex items-center justify-between gap-3 transition-colors cursor-pointer {isSelected
							? 'bg-accent-soft'
							: ''}"
						onclick={() => selectFont(font.id)}
					>
						<div class="flex items-center gap-2 min-w-0">
							<span class="text-sm font-medium text-text-color shrink-0">
								{font.name}
							</span>
							<span class="text-text-mute shrink-0 text-xs select-none"> - </span>
							<span
								class="text-sm text-text-mute truncate"
								style="font-family: '{font.id}', '{font.cssFamily}', '{font.name}', sans-serif;"
							>
								Text mẫu
							</span>
						</div>
						{#if isSelected}
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
					<div class="p-4 text-center text-xs text-text-mute font-sans">
						Không tìm thấy phông chữ "{searchQuery}"
					</div>
				{/if}
			</div>
		</div>
	{/if}

	<!-- Hidden native select for form accessibility and automation -->
	<select {id} bind:value class="sr-only" tabindex="-1" aria-hidden="true">
		<option value="default">Bookerly</option>
		{#each AVAILABLE_FONTS as font (font.id)}
			<option value={font.id}>{font.name}</option>
		{/each}
	</select>
</div>
