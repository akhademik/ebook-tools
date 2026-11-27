<script lang="ts">
	import FontSelect from '$lib/components/FontSelect.svelte';
	import {
		JACKET_TEMPLATES,
		JACKET_SAMPLE_PLACEHOLDERS
	} from '$lib/epub-packer/templates/jacket-templates';
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

	const hasUserInput = $derived(
		Boolean(
			epubState.metadata.title.trim() ||
			epubState.metadata.author.trim() ||
			epubState.jacket.originalTitle.trim() ||
			epubState.jacket.translator.trim() ||
			epubState.metadata.publisher.trim() ||
			epubState.jacket.distributor.trim()
		)
	);

	const previewTitle = $derived(
		hasUserInput ? epubState.metadata.title.trim() : JACKET_SAMPLE_PLACEHOLDERS.title
	);

	const previewOriginalTitle = $derived(
		hasUserInput ? epubState.jacket.originalTitle.trim() : JACKET_SAMPLE_PLACEHOLDERS.originalTitle
	);

	const previewAuthor = $derived(
		hasUserInput ? epubState.metadata.author.trim() : JACKET_SAMPLE_PLACEHOLDERS.author
	);

	const previewTranslator = $derived(
		hasUserInput ? epubState.jacket.translator.trim() : JACKET_SAMPLE_PLACEHOLDERS.translator
	);

	const previewPublisher = $derived(
		hasUserInput ? epubState.metadata.publisher.trim() : JACKET_SAMPLE_PLACEHOLDERS.publisher
	);

	const previewDistributor = $derived(
		hasUserInput ? epubState.jacket.distributor.trim() : JACKET_SAMPLE_PLACEHOLDERS.distributor
	);

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

	let previewSize = $state<'standard' | 'large' | 'xl'>('large');

	const maxPreviewWidth = $derived.by(() => {
		switch (previewSize) {
			case 'standard':
				return 380;
			case 'xl':
				return 520;
			case 'large':
			default:
				return 460;
		}
	});

	function getFontFamily(fontId: string): string | null {
		if (!fontId || fontId === 'default') return null;
		const font = findFont(fontId);
		if (!font) return `"${fontId}", serif`;
		const familyCandidates = [font.id, font.cssFamily, font.name]
			.map((s) => s.trim())
			.filter((s) => s.length > 0);
		const uniqueFamilies = [...new Set(familyCandidates)];
		return uniqueFamilies.map((f) => `"${f}"`).join(', ') + ', serif';
	}

	const titleFontFamily = $derived(getFontFamily(epubState.fonts.jacketTitleFont));
	const authorFontFamily = $derived(getFontFamily(epubState.fonts.jacketAuthorFont));
	const metaFontFamily = $derived(getFontFamily(epubState.fonts.jacketMetaFont));

	const baseFontFamily = $derived.by(() => {
		if (!epubState.fonts.jacketFont || epubState.fonts.jacketFont === 'default') {
			return '"Bookerly", serif';
		}
		return getFontFamily(epubState.fonts.jacketFont) || '"Bookerly", serif';
	});
</script>

<svelte:head>
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html `<style id="jacket-template-css">${currentTemplate.css}</style>`}
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html `<style id="jacket-font-override">
		.preview-wrap, .preview-wrap * { font-family: ${baseFontFamily} !important; }
		${titleFontFamily ? `.preview-wrap .title, .preview-wrap .original { font-family: ${titleFontFamily} !important; }` : ''}
		${authorFontFamily ? `.preview-wrap .author, .preview-wrap .byline, .preview-wrap .kicker, .preview-wrap .stamp, .preview-wrap .translator { font-family: ${authorFontFamily} !important; }` : ''}
		${metaFontFamily ? `.preview-wrap .meta, .preview-wrap .tag { font-family: ${metaFontFamily} !important; }` : ''}
	</style>`}
</svelte:head>

<div class="mt-8 pt-6 border-t border-border-color">
	<!-- Carousel Header & Toolbar -->
	<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
		<div>
			<h3 class="text-base font-bold text-text-color font-sans">Trang giới thiệu sách</h3>
			<p class="text-xs text-text-mute mt-0.5">
				Chọn mẫu trang lót sách và tùy biến phông chữ hiển thị
			</p>
		</div>

		<!-- Nav buttons, template counter & size controls -->
		<div class="flex items-center gap-2 sm:gap-3 flex-wrap sm:flex-nowrap shrink-0">
			<!-- 3 size presets -->
			<div
				class="flex items-center bg-panel border border-field-border rounded-xl p-0.5"
				role="group"
				aria-label="Kích thước xem trước"
			>
				<button
					type="button"
					onclick={() => (previewSize = 'standard')}
					class="px-2.5 py-1 text-xs rounded-lg font-medium transition-all cursor-pointer {previewSize ===
					'standard'
						? 'bg-panel-2 text-accent-color font-semibold shadow-xs'
						: 'text-text-mute hover:text-text-color'}"
					title="Cỡ vừa (380px)"
				>
					Vừa
				</button>
				<button
					type="button"
					onclick={() => (previewSize = 'large')}
					class="px-2.5 py-1 text-xs rounded-lg font-medium transition-all cursor-pointer {previewSize ===
					'large'
						? 'bg-panel-2 text-accent-color font-semibold shadow-xs'
						: 'text-text-mute hover:text-text-color'}"
					title="Cỡ lớn (460px - Mặc định)"
				>
					Lớn
				</button>
				<button
					type="button"
					onclick={() => (previewSize = 'xl')}
					class="px-2.5 py-1 text-xs rounded-lg font-medium transition-all cursor-pointer {previewSize ===
					'xl'
						? 'bg-panel-2 text-accent-color font-semibold shadow-xs'
						: 'text-text-mute hover:text-text-color'}"
					title="Cỡ cực đại (520px)"
				>
					Cực đại
				</button>
			</div>

			<span class="text-xs text-text-mute font-medium mr-1">
				Mẫu <strong class="text-text-color">{currentIdx + 1}</strong> / {JACKET_TEMPLATES.length}
			</span>
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

	<!-- 3-Font Typography Selector Toolbar (Phương án 1 Mockup) -->
	<div class="bg-panel-2/70 border border-border-color rounded-xl p-3.5 sm:p-4 mb-4">
		<div class="flex items-center justify-between mb-2.5"></div>

		<div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
			<!-- Cặp 1: Tác phẩm + Tựa gốc -->
			<div>
				<label
					for="jacket-font-title"
					class="text-xs font-semibold text-accent-color mb-1.5 block truncate"
				>
					🏷️ Tác phẩm + Tựa gốc
				</label>
				<FontSelect
					id="jacket-font-title"
					bind:value={epubState.fonts.jacketTitleFont}
					compact={true}
				/>
			</div>

			<!-- Cặp 2: Tác giả + Dịch giả -->
			<div>
				<label
					for="jacket-font-author"
					class="text-xs font-semibold text-accent-color mb-1.5 block truncate"
				>
					✍️ Tác giả + Dịch giả
				</label>
				<FontSelect
					id="jacket-font-author"
					bind:value={epubState.fonts.jacketAuthorFont}
					compact={true}
				/>
			</div>

			<!-- Cặp 3: NXB + Nhà phát hành -->
			<div>
				<label
					for="jacket-font-meta"
					class="text-xs font-semibold text-accent-color mb-1.5 block truncate"
				>
					🏛️ NXB + Nhà phát hành
				</label>
				<FontSelect
					id="jacket-font-meta"
					bind:value={epubState.fonts.jacketMetaFont}
					compact={true}
				/>
			</div>
		</div>
	</div>

	<!-- Carousel Live Preview Stage -->
	<div
		class="relative bg-panel-2/60 rounded-2xl border border-border-color p-4 sm:p-8 flex items-center justify-center min-h-145 overflow-hidden"
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
		<div class="preview-container" style="--max-jacket-w: {maxPreviewWidth}px;">
			<div
				class="preview-wrap shadow-xl"
				style={baseFontFamily
					? `--jacket-font: ${baseFontFamily}; font-family: ${baseFontFamily} !important;`
					: undefined}
			>
				<!-- eslint-disable-next-line svelte/no-at-html-tags -->
				{@html currentTemplate.render(
					previewTitle,
					previewOriginalTitle,
					previewAuthor,
					previewTranslator,
					previewPublisher,
					previewDistributor
				)}
			</div>
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
		<span class="font-sans font-medium text-text-mute">
			Đang chọn: ({currentIdx + 1}/{JACKET_TEMPLATES.length})
		</span>
	</div>
</div>

<style>
	.preview-container {
		container-type: inline-size;
		width: 100%;
		max-width: var(--max-jacket-w, 460px);
		display: flex;
		justify-content: center;
		transition: max-width 0.25s cubic-bezier(0.4, 0, 0.2, 1);
		margin: 0 auto;
	}

	.preview-wrap {
		background: #ffffff;
		margin: 0 auto;
		width: 100%;
		aspect-ratio: 19 / 27;
		border: 1px solid #cccccc;
		box-shadow: 0 10px 35px rgba(0, 0, 0, 0.12);
		border-radius: 4px;
		color: #000000;
		box-sizing: border-box;
		overflow: hidden;
		position: relative;
		text-align: left;
		font-size: calc(100cqi * (16 / 380));
	}

	@supports not (font-size: 100cqi) {
		.preview-wrap {
			font-size: clamp(12.5px, 3.8vw, 22px);
		}
	}

	:global(.preview-wrap, .preview-wrap *) {
		font-family: var(--jacket-font, 'Bookerly', serif) !important;
	}

	:global(.preview-wrap p) {
		margin: 0;
		padding: 0;
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
