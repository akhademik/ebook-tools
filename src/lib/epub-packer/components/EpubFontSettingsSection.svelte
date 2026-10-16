<script lang="ts">
	import FontSelect from '$lib/components/FontSelect.svelte';
	import { findFont } from '$lib/epub-packer/templates/fonts';
	import type { EpubState } from '../epub-state.svelte';

	interface Props {
		epubState: EpubState;
	}

	let { epubState }: Props = $props();

	const h1FontInfo = $derived(
		epubState.fonts.h1Font !== 'default' ? findFont(epubState.fonts.h1Font) : null
	);
	const h2FontInfo = $derived(
		epubState.fonts.h2Font !== 'default' ? findFont(epubState.fonts.h2Font) : null
	);
	const dropcapFontInfo = $derived(
		epubState.fonts.dropcapFont !== 'default' ? findFont(epubState.fonts.dropcapFont) : null
	);
</script>

<div class="modern-card rounded-2xl p-7 mb-6 animate-fade-in">
	<span class="font-mono text-xs tracking-wider text-text-mute uppercase mb-3 block font-semibold"
		>Cấu hình phông chữ nội dung & Xem trước chương</span
	>

	<div class="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-5">
		<div>
			<FontSelect
				id="h1-font-select"
				label="Font tiêu đề lớn (H1)"
				bind:value={epubState.fonts.h1Font}
			/>
		</div>
		<div>
			<FontSelect
				id="h2-font-select"
				label="Font tiêu đề nhỏ (H2)"
				bind:value={epubState.fonts.h2Font}
			/>
		</div>
		<div>
			<FontSelect
				id="dropcap-font-select"
				label="Font cho Dropcap"
				bind:value={epubState.fonts.dropcapFont}
			/>
		</div>
	</div>

	<span class="font-mono text-xs text-text-mute uppercase mb-2 block font-semibold"
		>Xem trước hiển thị nội dung chương (Preview)</span
	>
	<div
		class="border border-border-color rounded-xl p-6 bg-white shadow-inner max-w-lg mx-auto"
		style="color: #000000; font-family: sans-serif;"
	>
		<h1
			class="text-2xl font-bold mb-2 text-center"
			style="font-family: {h1FontInfo
				? `"${h1FontInfo.id}", "${h1FontInfo.cssFamily}", "${h1FontInfo.name}", sans-serif`
				: 'inherit'};"
		>
			Đây là chapter lớn
		</h1>
		<h2
			class="text-lg font-semibold mb-4 text-center"
			style="font-family: {h2FontInfo
				? `"${h2FontInfo.id}", "${h2FontInfo.cssFamily}", "${h2FontInfo.name}", sans-serif`
				: 'inherit'}; color: #333333;"
		>
			Đây là chapter nhỏ
		</h2>
		<p class="text-sm leading-relaxed text-gray-700 font-sans">
			<span
				class="dropcap"
				style="font-family: {dropcapFontInfo
					? `"${dropcapFontInfo.id}", "${dropcapFontInfo.cssFamily}", "${dropcapFontInfo.name}", sans-serif`
					: 'inherit'};">Đ</span
			>ây là nội dung thử nghiệm (dummy text) để xem trước phông chữ hiển thị trong cuốn sách của
			bạn sau khi xuất bản. Tiêu đề lớn (h1) và tiêu đề nhỏ (h2) sẽ được hiển thị bằng phông chữ đã
			chọn, trong khi đoạn văn (p) vẫn sử dụng phông chữ không chân (sans-serif) mặc định của thiết
			bị đọc sách.
		</p>
	</div>
</div>

<style>
	.dropcap {
		float: left;
		font-size: 3em;
		line-height: 0.9;
		margin-right: 0.08em;
		margin-top: 0.02em;
		font-weight: bold;
	}
</style>
