<script lang="ts">
	import FontSelect from '$lib/components/FontSelect.svelte';
	import { JACKET_TEMPLATES } from '$lib/epub-packer/templates/jacket-templates';
	import { findFont } from '$lib/epub-packer/templates/fonts';
	import type { EpubState } from '../epub-state.svelte';

	interface Props {
		show?: boolean;
		epubState: EpubState;
	}

	let { show = $bindable(false), epubState }: Props = $props();

	let currentPreviewTemplateIdx = $state(0);
	let wasOpen = false;

	$effect(() => {
		if (show && !wasOpen) {
			const idx = JACKET_TEMPLATES.findIndex((t) => t.id === epubState.jacket.jacketTemplateId);
			currentPreviewTemplateIdx = idx !== -1 ? idx : 0;
		}
		wasOpen = show;
	});

	function nextTemplate() {
		currentPreviewTemplateIdx = (currentPreviewTemplateIdx + 1) % JACKET_TEMPLATES.length;
	}

	function prevTemplate() {
		currentPreviewTemplateIdx =
			(currentPreviewTemplateIdx - 1 + JACKET_TEMPLATES.length) % JACKET_TEMPLATES.length;
	}

	function selectTemplate() {
		epubState.jacket.jacketTemplateId = JACKET_TEMPLATES[currentPreviewTemplateIdx].id;
		show = false;
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
	{#if show}
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		{@html `<style id="jacket-template-css">${JACKET_TEMPLATES[currentPreviewTemplateIdx].css}</style>`}
		{#if jacketFontFamily}
			<!-- eslint-disable-next-line svelte/no-at-html-tags -->
			{@html `<style id="jacket-font-override">.preview-wrap, .preview-wrap p, .preview-wrap div, .preview-wrap span, .preview-wrap h1, .preview-wrap h2, .preview-wrap hr, .preview-wrap * { font-family: ${jacketFontFamily} !important; }</style>`}
		{/if}
	{/if}
</svelte:head>

{#if show}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
		role="dialog"
		aria-modal="true"
	>
		<!-- Modal box -->
		<div
			class="bg-panel border border-border-color w-full max-w-lg rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-slide-up"
		>
			<!-- Header -->
			<div class="p-4 border-b border-border-color flex justify-between items-center bg-panel-2">
				<span class="font-mono text-sm font-bold text-text-color">Xem trước trang giới thiệu</span>
				<button
					type="button"
					class="text-text-mute hover:text-text-color transition-colors font-mono text-xs font-bold cursor-pointer"
					onclick={() => (show = false)}
				>
					Đóng
				</button>
			</div>

			<!-- Toolbar: Template & Font Selector -->
			<div
				class="px-5 py-3 border-b border-border-color bg-panel-2 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0"
			>
				<span class="font-mono text-xs text-text-mute uppercase tracking-wider font-semibold">
					{JACKET_TEMPLATES[currentPreviewTemplateIdx].name} ({currentPreviewTemplateIdx +
						1}/{JACKET_TEMPLATES.length})
				</span>

				<div class="flex items-center gap-2 w-full sm:w-auto">
					<span class="font-mono text-xs text-text-mute uppercase font-semibold whitespace-nowrap">
						Phông chữ:
					</span>
					<div class="w-full sm:w-52">
						<FontSelect
							id="jacket-modal-font-select"
							bind:value={epubState.fonts.jacketFont}
							compact={true}
						/>
					</div>
				</div>
			</div>

			<!-- Body -->
			<div class="p-6 flex flex-col items-center overflow-y-auto flex-1 gap-4 bg-brand-bg">
				<div
					class="preview-wrap"
					style={jacketFontFamily
						? `--jacket-font: ${jacketFontFamily}; font-family: ${jacketFontFamily} !important;`
						: undefined}
				>
					<!-- eslint-disable-next-line svelte/no-at-html-tags -->
					{@html JACKET_TEMPLATES[currentPreviewTemplateIdx].render(
						epubState.metadata.title.trim() || 'Tác phẩm mẫu',
						epubState.jacket.originalTitle.trim(),
						epubState.metadata.author.trim() || 'Tác giả mẫu',
						epubState.jacket.translator.trim() || 'Dịch giả mẫu',
						epubState.metadata.publisher.trim(),
						epubState.jacket.distributor.trim()
					)}
				</div>
			</div>

			<!-- Footer -->
			<div
				class="p-4 border-t border-border-color flex justify-between items-center bg-panel-2 gap-3"
			>
				<div class="flex gap-2">
					<button
						type="button"
						class="bg-brand-bg border border-border-color text-text-color hover:border-text-color font-mono text-xs font-semibold py-2 px-3 rounded-xl active:scale-[0.98] transition-all cursor-pointer"
						onclick={() => prevTemplate()}
					>
						Trước
					</button>
					<button
						type="button"
						class="bg-brand-bg border border-border-color text-text-color hover:border-text-color font-mono text-xs font-semibold py-2 px-3 rounded-xl active:scale-[0.98] transition-all cursor-pointer"
						onclick={() => nextTemplate()}
					>
						Tiếp
					</button>
				</div>

				<button
					type="button"
					class="bg-accent-color text-white font-mono text-xs font-semibold py-2.5 px-5 rounded-xl hover:bg-accent-hover active:scale-[0.98] transition-all cursor-pointer"
					onclick={() => selectTemplate()}
				>
					Chọn mẫu này
				</button>
			</div>
		</div>
	</div>
{/if}

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
