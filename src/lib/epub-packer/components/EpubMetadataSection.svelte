<script lang="ts">
	import Input from '$lib/components/Input.svelte';
	import { JACKET_TEMPLATES } from '$lib/epub-packer/templates/jacket-templates';
	import type { EpubState } from '../epub-state.svelte';

	interface Props {
		epubState: EpubState;
		onOpenJacketModal: () => void;
	}

	let { epubState, onOpenJacketModal }: Props = $props();

	const selectedTemplateName = $derived(
		JACKET_TEMPLATES.find((t) => t.id === epubState.jacket.jacketTemplateId)?.name || ''
	);
</script>

<div class="modern-card rounded-2xl p-5 sm:p-7 mb-6 animate-fade-in">
	<h2 class="text-base font-semibold text-text-color mb-4">Thông tin sách & Trang giới thiệu</h2>
	<div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
		<div>
			<Input bind:value={epubState.metadata.title} label="Tác phẩm" placeholder="Mật Mã Da Vinci" />
		</div>
		<div>
			<Input bind:value={epubState.metadata.author} label="Tác giả" placeholder="Dan Brown" />
		</div>
		<div>
			<Input
				bind:value={epubState.jacket.originalTitle}
				label="Tựa gốc / Tựa nhỏ"
				placeholder="The Da Vinci Code"
			/>
		</div>
		<div>
			<Input bind:value={epubState.jacket.translator} label="Dịch giả" placeholder="Đỗ Thu Hà" />
		</div>
		<div>
			<Input
				bind:value={epubState.metadata.publisher}
				label="Nhà phát hành"
				placeholder="1980 Books"
			/>
		</div>
		<div>
			<Input
				bind:value={epubState.jacket.distributor}
				label="Nhà xuất bản"
				placeholder="NXB Văn hóa Thông tin"
			/>
		</div>
	</div>

	<div class="mt-6 pt-5 border-t border-border-color">
		<div class="flex items-center justify-between mb-3 flex-wrap gap-2">
			<div>
				<p class="text-xs text-text-mute font-semibold">Trang giới thiệu sách (Jacket)</p>
				{#if selectedTemplateName}
					<p class="text-xs text-text-mute mt-0.5">
						Mẫu đang chọn: <span class="text-accent-color font-semibold"
							>{selectedTemplateName}</span
						>
						{#if epubState.fonts.jacketFont !== 'default'}
							<span class="text-text-mute font-mono">({epubState.fonts.jacketFont})</span>
						{/if}
					</p>
				{/if}
			</div>
			<div>
				<button
					type="button"
					class="w-full sm:w-auto bg-panel-2 border border-field-border text-text-color hover:border-accent-color font-sans text-xs font-semibold h-9 px-3.5 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
					onclick={() => onOpenJacketModal()}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="2"
						stroke="currentColor"
						class="w-3.5 h-3.5 text-accent-color"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
						/>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
						/>
					</svg>
					Xem trước & Tùy biến
				</button>
			</div>
		</div>

		<!-- Hàng thẻ chọn mẫu jacket: Mẫu 1–4 + "Xem cả 10 mẫu" -->
		<div class="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-3">
			{#each JACKET_TEMPLATES.slice(0, 4) as template (template.id)}
				{@const isSelected = epubState.jacket.jacketTemplateId === template.id}
				<button
					type="button"
					class="p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between h-20 {isSelected
						? 'border-accent-color bg-accent-soft ring-1 ring-accent-color/30'
						: 'border-field-border bg-panel-2 hover:border-accent-color'}"
					onclick={() => (epubState.jacket.jacketTemplateId = template.id)}
				>
					<div class="flex items-center justify-between w-full">
						<span
							class="text-xs font-semibold {isSelected
								? 'text-accent-color'
								: 'text-text-color'} font-sans"
						>
							{template.name}
						</span>
						{#if isSelected}
							<span class="w-2 h-2 rounded-full bg-accent-color" aria-hidden="true"></span>
						{/if}
					</div>
					<span class="text-[11px] text-text-mute font-sans">
						{isSelected ? 'Đang chọn' : 'Chọn mẫu'}
					</span>
				</button>
			{/each}

			<button
				type="button"
				class="p-3 rounded-xl border border-dashed border-field-border bg-panel-2/60 hover:bg-panel-2 hover:border-accent-color text-left transition-all cursor-pointer flex flex-col justify-between h-20 col-span-2 sm:col-span-1 group"
				onclick={() => onOpenJacketModal()}
			>
				<div class="flex items-center justify-between w-full">
					<span
						class="text-xs font-semibold text-text-color group-hover:text-accent-color font-sans"
					>
						Xem cả 10 mẫu
					</span>
					<span
						class="text-text-mute group-hover:text-accent-color group-hover:translate-x-0.5 transition-transform text-xs"
						aria-hidden="true">→</span
					>
				</div>
				<span class="text-[11px] text-text-mute font-sans">Thư viện mẫu</span>
			</button>
		</div>
	</div>
</div>
