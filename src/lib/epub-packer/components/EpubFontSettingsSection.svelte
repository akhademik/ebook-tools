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
	const h2SubFontInfo = $derived(
		epubState.fonts.h2SubFont !== 'default' ? findFont(epubState.fonts.h2SubFont) : null
	);
	const dropcapFontInfo = $derived(
		epubState.fonts.dropcapFont !== 'default' ? findFont(epubState.fonts.dropcapFont) : null
	);
	const quoteFontInfo = $derived(
		epubState.fonts.quoteFont !== 'default' ? findFont(epubState.fonts.quoteFont) : null
	);
	const quoteAuthorFontInfo = $derived(
		epubState.fonts.quoteAuthorFont !== 'default' ? findFont(epubState.fonts.quoteAuthorFont) : null
	);
</script>

<div class="animate-fade-in">
	<div class="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
		<!-- Cột 1: Bộ chọn phông chữ (H1, H2, H2 Sub, Dropcap, Quote, Quote Author) -->
		<div class="flex flex-col gap-3.5">
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
					id="h2-sub-font-select"
					label="Font cho H2 Sub"
					bind:value={epubState.fonts.h2SubFont}
				/>
			</div>
			<div>
				<FontSelect
					id="dropcap-font-select"
					label="Font cho Dropcap"
					bind:value={epubState.fonts.dropcapFont}
				/>
			</div>
			<div>
				<FontSelect
					id="quote-font-select"
					label="Font cho Trích dẫn (Quote ~)"
					bind:value={epubState.fonts.quoteFont}
				/>
			</div>
			<div>
				<FontSelect
					id="quote-author-font-select"
					label="Font cho Tác giả trích dẫn (Author >)"
					bind:value={epubState.fonts.quoteAuthorFont}
				/>
			</div>
		</div>

		<!-- Cột 2: Khung Xem trước hiển thị nội dung chương -->
		<div class="flex flex-col h-full">
			<span class="text-xs font-semibold text-text-mute mb-2 block font-sans">
				Xem trước trang sách (Preview)
			</span>
			<div
				class="border border-border-color rounded-2xl p-4 sm:p-6 shadow-inner w-full flex-1"
				style="background-color: #fbf8ef; color: #073642; font-family: 'Bookerly', serif;"
			>
				<h1
					class="text-2xl font-bold mb-2 text-center"
					style="font-family: {h1FontInfo
						? `"${h1FontInfo.id}", "${h1FontInfo.cssFamily}", "${h1FontInfo.name}", sans-serif`
						: `'Bookerly', serif`};"
				>
					Đây là chapter lớn
				</h1>
				<h2
					class="text-lg font-semibold text-center"
					style="font-family: {h2FontInfo
						? `"${h2FontInfo.id}", "${h2FontInfo.cssFamily}", "${h2FontInfo.name}", sans-serif`
						: `'Bookerly', serif`}; color: #333333; margin-bottom: 0.25em;"
				>
					Đây là chapter nhỏ
				</h2>
				<h2
					class="text-lg font-semibold text-center mb-4"
					style="font-family: {h2SubFontInfo
						? `"${h2SubFontInfo.id}", "${h2SubFontInfo.cssFamily}", "${h2SubFontInfo.name}", sans-serif`
						: h2FontInfo
							? `"${h2FontInfo.id}", "${h2FontInfo.cssFamily}", "${h2FontInfo.name}", sans-serif`
							: `'Bookerly', serif`}; color: #333333; margin-top: -0.2em;"
				>
					Đây là chapter nhỏ tiếp nối
				</h2>
				<p class="text-sm leading-relaxed text-gray-700" style="font-family: 'Bookerly', serif;">
					<span
						class="dropcap"
						style="font-family: {dropcapFontInfo
							? `"${dropcapFontInfo.id}", "${dropcapFontInfo.cssFamily}", "${dropcapFontInfo.name}", sans-serif`
							: `'Bookerly', serif`};">Đ</span
					>ây là nội dung thử nghiệm để xem trước phông chữ hiển thị trong cuốn sách của bạn sau khi
					xuất bản. Tiêu đề lớn (h1), tiêu đề nhỏ ngay sau h1 (h2 chính), và tiêu đề nhỏ ở các vị
					trí khác (h2 sub) sẽ được hiển thị bằng phông chữ đã chọn, trong khi đoạn văn (p) sử dụng
					phông chữ Bookerly mặc định của sách.
				</p>
				<blockquote
					class="my-5 border-l-0 text-center"
					style="margin: 1.5em 0; text-align: center;"
				>
					<p
						class="text-sm leading-relaxed"
						style="font-family: {quoteFontInfo
							? `"${quoteFontInfo.id}", "${quoteFontInfo.cssFamily}", "${quoteFontInfo.name}", sans-serif`
							: `'Bookerly', serif`}; text-align: center; margin-bottom: 0.4em;"
					>
						To Be, or Not To Be, That's the question.
					</p>
					<footer
						class="text-xs block opacity-80"
						style="font-family: {quoteAuthorFontInfo
							? `"${quoteAuthorFontInfo.id}", "${quoteAuthorFontInfo.cssFamily}", "${quoteAuthorFontInfo.name}", sans-serif`
							: `'Bookerly', serif`}; text-align: right;"
					>
						W. Shakespeare
					</footer>
				</blockquote>
			</div>
		</div>
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
