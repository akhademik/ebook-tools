<!-- src/lib/epub-editor/components/EpubMetadataModal.svelte -->
<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import Input from '$lib/components/Input.svelte';
	import type { EpubEditorState } from '../epub-editor-state.svelte';
	import type { BookMetadataDetails } from '../epub-book-ops';

	interface Props {
		show?: boolean;
		editorState: EpubEditorState;
	}

	let { show = $bindable(false), editorState }: Props = $props();

	let formMeta = $state<BookMetadataDetails>({
		title: '',
		author: '',
		language: 'vi',
		identifier: '',
		publisher: '',
		description: '',
		rights: '',
		pubDate: ''
	});

	let isSaving = $state(false);
	let isRebuildingToc = $state(false);
	let saveSuccessMessage = $state('');

	$effect(() => {
		if (show && editorState.zip) {
			loadMeta();
		}
	});

	async function loadMeta() {
		saveSuccessMessage = '';
		const meta = await editorState.loadBookMetadata();
		if (meta) {
			formMeta = { ...meta };
		}
	}

	async function handleSave() {
		isSaving = true;
		saveSuccessMessage = '';
		try {
			const ok = await editorState.saveBookMetadata(formMeta);
			if (ok) {
				saveSuccessMessage = 'Đã lưu metadata vào content.opf thành công!';
				setTimeout(() => {
					if (show) saveSuccessMessage = '';
				}, 3000);
			}
		} finally {
			isSaving = false;
		}
	}

	async function handleRebuildToc() {
		isRebuildingToc = true;
		saveSuccessMessage = '';
		try {
			const ok = await editorState.rebuildToc();
			if (ok) {
				saveSuccessMessage = 'Đã tạo lại mục lục (nav.xhtml & toc.ncx) thành công!';
				setTimeout(() => {
					if (show) saveSuccessMessage = '';
				}, 3000);
			}
		} finally {
			isRebuildingToc = false;
		}
	}

	function handleClose() {
		show = false;
	}
</script>

{#if show}
	<div
		class="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in"
		role="dialog"
		aria-modal="true"
	>
		<div
			class="bg-panel border border-border-color w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-slide-up"
		>
			<!-- Header -->
			<div
				class="px-6 py-4 border-b border-border-color flex justify-between items-center bg-panel-2"
			>
				<div class="flex items-center gap-2.5">
					<div
						class="w-8 h-8 rounded-lg bg-accent-soft text-accent-color flex items-center justify-center"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke-width="1.75"
							stroke="currentColor"
							class="w-4 h-4"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 0 1 1.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.559.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.894.149c-.424.07-.764.383-.929.78-.165.398-.143.854.107 1.204l.527.738c.32.447.27.1.06-.12l-.773.773a1.125 1.125 0 0 1-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.398.165-.71.505-.781.929l-.15.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.27-1.45-.12l-.773-.774a1.125 1.125 0 0 1-.12-1.45l.527-.737c.25-.35.272-.806.108-1.204-.165-.397-.506-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.108-1.204l-.527-.738a1.125 1.125 0 0 1 .12-1.45l.773-.773a1.125 1.125 0 0 1 1.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894Z"
							/>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
							/>
						</svg>
					</div>
					<div>
						<h3 class="font-sans text-base font-bold text-text-color">Thông tin sách & Mục lục</h3>
						<p class="text-xs text-text-mute">Chỉnh sửa Metadata trong content.opf</p>
					</div>
				</div>
				<button
					type="button"
					class="w-8 h-8 rounded-lg border border-border-color bg-panel hover:bg-panel-2 text-text-mute hover:text-text-color flex items-center justify-center font-mono cursor-pointer transition-colors"
					onclick={handleClose}
					aria-label="Đóng modal"
				>
					✕
				</button>
			</div>

			<!-- Body Content -->
			<div class="p-6 overflow-y-auto space-y-5">
				{#if saveSuccessMessage}
					<div
						class="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 text-xs font-mono text-emerald-500 flex items-center gap-2"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke-width="2"
							stroke="currentColor"
							class="w-4 h-4"
						>
							<path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
						</svg>
						<span>{saveSuccessMessage}</span>
					</div>
				{/if}

				<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<div>
						<Input label="Tên sách*" placeholder="VD: Không Gia Đình" bind:value={formMeta.title} />
					</div>
					<div>
						<Input label="Tác giả" placeholder="VD: Hector Malot" bind:value={formMeta.author} />
					</div>
				</div>

				<div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
					<div>
						<Input label="Ngôn ngữ" placeholder="vi" bind:value={formMeta.language} />
					</div>
					<div>
						<Input
							label="Nhà xuất bản"
							placeholder="VD: NXB Văn Học"
							bind:value={formMeta.publisher}
						/>
					</div>
					<div>
						<Input
							label="Định danh sách"
							placeholder="urn:uuid:..."
							bind:value={formMeta.identifier}
						/>
					</div>
				</div>

				<div>
					<!-- svelte-ignore a11y_label_has_associated_control -->
					<label class="block font-mono text-xs text-text-mute mb-1.5 font-semibold">
						Mô tả / Tóm tắt nội dung (Description)
					</label>
					<textarea
						class="w-full bg-sidebar-bg border border-border-color rounded-xl p-3 text-xs font-mono text-text-color focus:border-accent-color focus:outline-none resize-y min-h-17.5"
						placeholder="Tóm tắt ngắn gọn nội dung cuốn sách..."
						bind:value={formMeta.description}></textarea>
				</div>

				<!-- Quick TOC Rebuilder Action Card -->
				<div
					class="bg-sidebar-bg p-4 rounded-xl border border-border-color flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
				>
					<div>
						<div class="font-mono text-xs font-bold text-text-color flex items-center gap-1.5">
							📑 Tự động Tái tạo Mục lục (Auto Rebuild TOC)
						</div>
						<p class="text-[11px] text-text-mute mt-0.5">
							Quét lại toàn bộ các thẻ &lt;h1&gt;, &lt;h2&gt; trong các chương để đồng bộ lại mục
							lục nav.xhtml và toc.ncx.
						</p>
					</div>
					<button
						type="button"
						class="px-3.5 py-2 bg-panel hover:bg-hover-bg border border-border-color text-accent-color font-mono text-xs font-semibold rounded-xl cursor-pointer transition-colors shrink-0 disabled:opacity-50"
						onclick={handleRebuildToc}
						disabled={isRebuildingToc}
					>
						{isRebuildingToc ? 'Đang tạo...' : 'Tái tạo Mục lục (Rebuild TOC)'}
					</button>
				</div>
			</div>

			<!-- Footer Buttons -->
			<div class="px-6 py-4 border-t border-border-color bg-panel-2 flex justify-end items-center">
				<div class="w-full sm:w-auto min-w-[160px]">
					<Button
						variant="primary"
						onclick={handleSave}
						disabled={isSaving || !formMeta.title.trim()}
					>
						{isSaving ? 'Đang lưu...' : 'Lưu Metadata'}
					</Button>
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	.animate-fade-in {
		animation: fadeIn 0.15s ease-out;
	}
	.animate-slide-up {
		animation: slideUp 0.2s cubic-bezier(0.16, 1, 0.3, 1);
	}
	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}
	@keyframes slideUp {
		from {
			opacity: 0;
			transform: translateY(12px) scale(0.98);
		}
		to {
			opacity: 1;
			transform: translateY(0) scale(1);
		}
	}
</style>
