<script lang="ts">
	import FontSelect from '$lib/components/FontSelect.svelte';
	import { JACKET_TEMPLATES } from '$lib/epub-packer/templates/jacket-templates';
	import { findFont } from '$lib/epub-packer/templates/fonts';
	import type { EpubState } from '../epub-state.svelte';

	interface Props {
		epubState: EpubState;
	}

	let { epubState }: Props = $props();

	let currentIdx = $state(
		Math.max(
			0,
			JACKET_TEMPLATES.findIndex((t) => t.id === epubState.jacket.jacketTemplateId)
		)
	);

	const currentTemplate = $derived(JACKET_TEMPLATES[currentIdx]);

	function prev() {
		currentIdx = (currentIdx - 1 + JACKET_TEMPLATES.length) % JACKET_TEMPLATES.length;
		epubState.jacket.jacketTemplateId = JACKET_TEMPLATES[currentIdx].id;
	}

	function next() {
		currentIdx = (currentIdx + 1) % JACKET_TEMPLATES.length;
		epubState.jacket.jacketTemplateId = JACKET_TEMPLATES[currentIdx].id;
	}

	function select(index: number) {
		currentIdx = index;
		epubState.jacket.jacketTemplateId = JACKET_TEMPLATES[currentIdx].id;
	}

	const activeFont = $derived(
		epubState.fonts.jacketFont !== 'default' ? findFont(epubState.fonts.jacketFont) : null
	);

	const jacketFontFamily = $derived.by(() => {
		if (epubState.fonts.jacketFont === 'default') return '';
		const font = activeFont || findFont(epubState.fonts.jacketFont);
		if (!font) {
			return `"${epubState.fonts.jacketFont}", sans-serif`;
		}
		const familyCandidates = [font.id, font.cssFamily, font.name]
			.map((s) => s.trim())
			.filter((s) => s.length > 0);
		const uniqueFamilies = [...new Set(familyCandidates)];
		return uniqueFamilies.map((f) => `"${f}"`).join(', ') + ', sans-serif';
	});
</script>

<svelte:head>
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html `<style id="jacket-template-css">${currentTemplate.css}</style>`}
	{#if jacketFontFamily}
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		{@html `<style id="jacket-font-override">.preview-wrap, .preview-wrap p, .preview-wrap div, .preview-wrap span, .preview-wrap h1, .preview-wrap h2, .preview-wrap hr, .preview-wrap * { font-family: ${jacketFontFamily} !important; }</style>`}
	{/if}
</svelte:head>

<div class="mt-8 pt-6 border-t border-border-color">
	<!-- Carousel Header & Toolbar -->
	<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
		<div>
			<h3 class="text-base font-bold text-text-color font-sans">Trang giới thiệu sách (Jacket)</h3>
			<p class="text-xs text-text-mute mt-0.5">
				Chọn mẫu trang lót sách và tùy biến phông chữ hiển thị
			</p>
		</div>

		<!-- Toolbar controls: Font selector + Nav buttons -->
		<div class="flex items-center gap-3 flex-wrap sm:flex-nowrap">
			<div class="flex items-center gap-2">
				<span class="text-xs text-text-mute font-semibold whitespace-nowrap">Phông chữ:</span>
				<div class="w-44 sm:w-48">
					<FontSelect
						id="jacket-modal-font-select"
						bind:value={epubState.fonts.jacketFont}
						compact={true}
					/>
				</div>
			</div>

			<div class="flex items-center gap-1.5 shrink-0">
				<button
					type="button"
					onclick={prev}
					class="h-9 px-3 bg-panel-2 border border-field-border text-text-color hover:border-accent-color font-sans text-xs font-semibold rounded-xl active:scale-[0.98] transition-all cursor-pointer flex items-center gap-1"
					aria-label="Mẫu trước"
				>
					<svg
						class="w-3.5 h-3.5"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						stroke-width="2"
					>
						<path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
					</svg>
					Trước
				</button>
				<button
					type="button"
					onclick={next}
					class="h-9 px-3 bg-panel-2 border border-field-border text-text-color hover:border-accent-color font-sans text-xs font-semibold rounded-xl active:scale-[0.98] transition-all cursor-pointer flex items-center gap-1"
					aria-label="Mẫu tiếp theo"
				>
					Tiếp
					<svg
						class="w-3.5 h-3.5"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						stroke-width="2"
					>
						<path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
					</svg>
				</button>
			</div>
		</div>
	</div>

	<!-- 10-Template Carousel Selector Strip -->
	<div class="flex items-center gap-2 overflow-x-auto pb-3 mb-4 scrollbar-thin">
		{#each JACKET_TEMPLATES as template, idx (template.id)}
			{@const isActive = currentIdx === idx}
			<button
				type="button"
				onclick={() => select(idx)}
				class="px-3.5 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 {isActive
					? 'bg-accent-color text-on-accent shadow-sm ring-1 ring-accent-soft'
					: 'bg-panel-2 border border-field-border text-text-color hover:border-accent-color'}"
			>
				<span>{template.name}</span>
				{#if isActive}
					<span class="w-1.5 h-1.5 rounded-full bg-on-accent" aria-hidden="true"></span>
				{/if}
			</button>
		{/each}
	</div>

	<!-- Carousel Live Preview Stage -->
	<div
		class="relative bg-panel-2/60 rounded-2xl border border-border-color p-4 sm:p-8 flex items-center justify-center min-h-[580px] overflow-hidden"
	>
		<!-- Side prev button on large screens -->
		<button
			type="button"
			onclick={prev}
			aria-label="Mẫu trước"
			class="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-panel/90 border border-field-border shadow-md items-center justify-center text-text-color hover:text-accent-color hover:border-accent-color transition-all cursor-pointer"
		>
			<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
				<path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
			</svg>
		</button>

		<!-- The live book page -->
		<div
			class="preview-wrap shadow-xl"
			style={jacketFontFamily
				? `--jacket-font: ${jacketFontFamily}; font-family: ${jacketFontFamily} !important;`
				: undefined}
		>
			<!-- eslint-disable-next-line svelte/no-at-html-tags -->
			{@html currentTemplate.render(
				epubState.metadata.title.trim() || 'Tác phẩm mẫu',
				epubState.jacket.originalTitle.trim(),
				epubState.metadata.author.trim() || 'Tác giả mẫu',
				epubState.jacket.translator.trim() || 'Dịch giả mẫu',
				epubState.metadata.publisher.trim(),
				epubState.jacket.distributor.trim()
			)}
		</div>

		<!-- Side next button on large screens -->
		<button
			type="button"
			onclick={next}
			aria-label="Mẫu tiếp theo"
			class="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-panel/90 border border-field-border shadow-md items-center justify-center text-text-color hover:text-accent-color hover:border-accent-color transition-all cursor-pointer"
		>
			<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
				<path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
			</svg>
		</button>
	</div>

	<!-- Carousel Dots Indicator & Counter -->
	<div class="flex items-center justify-between text-xs text-text-mute mt-3 px-1">
		<div class="flex items-center gap-1.5">
			{#each JACKET_TEMPLATES as t, idx (t.id)}
				<button
					type="button"
					onclick={() => select(idx)}
					aria-label={`Chuyển tới mẫu ${idx + 1}`}
					class="h-1.5 rounded-full transition-all cursor-pointer {currentIdx === idx
						? 'w-6 bg-accent-color'
						: 'w-2 bg-border-color hover:bg-text-mute'}"
				></button>
			{/each}
		</div>
		<span class="font-sans font-medium">
			Đang chọn: <strong class="text-accent-color">{currentTemplate.name}</strong> ({currentIdx +
				1}/{JACKET_TEMPLATES.length})
		</span>
	</div>
</div>

<style>
	.preview-wrap {
		background: #ffffff;
		margin: 1.5em auto;
		width: 380px;
		max-width: 100%;
		height: 540px;
		border: 1px solid #cccccc;
		box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
		border-radius: 4px;
		color: #000000;
		box-sizing: border-box;
		overflow: hidden;
		position: relative;
		text-align: left;
	}

	:global(.preview-wrap, .preview-wrap *) {
		font-family: var(--jacket-font, inherit) !important;
	}

	:global(.preview-wrap p) {
		margin: 0 !important;
		padding: 0 !important;
		font-size: 1em;
		line-height: normal;
		text-indent: 0 !important;
		text-align: inherit !important;
	}

	:global(.preview-wrap hr) {
		margin: 0;
		padding: 0;
		opacity: 1;
		background-color: transparent;
	}
</style>
