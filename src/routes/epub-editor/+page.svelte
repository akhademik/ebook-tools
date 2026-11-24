<!-- src/routes/epub-editor/+page.svelte -->
<script lang="ts">
	import PageHeader from '$lib/components/PageHeader.svelte';
	import DropZone from '$lib/components/DropZone.svelte';
	import Button from '$lib/components/Button.svelte';
	import { EpubEditorState } from '$lib/epub-editor/epub-editor-state.svelte';
	import EpubEditorModal from '$lib/epub-editor/components/EpubEditorModal.svelte';
	import EpubCleanerModal from '$lib/epub-editor/components/EpubCleanerModal.svelte';
	import EpubValidatorModal from '$lib/epub-editor/components/EpubValidatorModal.svelte';
	import EpubMetadataModal from '$lib/epub-editor/components/EpubMetadataModal.svelte';

	const editorState = new EpubEditorState();

	let selectedFile = $state<File | null>(null);

	async function handleFileSelected(file: File) {
		selectedFile = file;
		await editorState.loadEpubFile(file);
	}
</script>

<svelte:head>
	<title>EPUB Editor</title>
</svelte:head>

<PageHeader
	title="EPUB Editor"
	description="Xem và tinh chỉnh trực tiếp HTML / CSS bên trong file EPUB bất kỳ với Live Preview."
	breadcrumb="Tạo và tinh chỉnh"
	badge={true}
/>

<div class="modern-card rounded-2xl p-5 sm:p-7 mb-6 animate-fade-in">
	<h2 class="text-base font-semibold text-text-color mb-3">File sách điện tử (.epub)</h2>

	<DropZone
		accept=".epub,application/epub+zip"
		onSelect={handleFileSelected}
		title="Kéo thả hoặc click để chọn file .EPUB"
		subtitle="Hỗ trợ mọi file EPUB hợp lệ để xem và sửa HTML/CSS"
		{selectedFile}
	/>

	{#if editorState.statusMessage}
		<div class="font-mono text-sm mt-4 {editorState.isError ? 'text-red-500' : 'text-text-mute'}">
			{editorState.statusMessage}
		</div>
	{/if}

	{#if editorState.files.length > 0}
		<div
			class="mt-6 pt-5 border-t border-border-color flex items-center justify-center gap-3 flex-wrap"
		>
			<button
				type="button"
				class="h-11 px-4 rounded-xl border border-field-border bg-panel hover:bg-panel-2 hover:border-accent-color text-text-color font-sans text-sm font-semibold cursor-pointer transition-all flex items-center justify-center gap-2 whitespace-nowrap shrink-0 shadow-sm"
				onclick={() => {
					editorState.isMetadataModalOpen = true;
				}}
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="1.75"
					stroke="currentColor"
					class="w-4 h-4 text-text-mute"
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
				Thông tin
			</button>

			<button
				type="button"
				class="h-11 px-4 rounded-xl border border-field-border bg-panel hover:bg-panel-2 hover:border-accent-color text-text-color font-sans text-sm font-semibold cursor-pointer transition-all flex items-center justify-center gap-2 whitespace-nowrap shrink-0 shadow-sm"
				onclick={() => {
					editorState.isValidatorModalOpen = true;
				}}
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="1.75"
					stroke="currentColor"
					class="w-4 h-4 text-accent-color"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z"
					/>
				</svg>
				Kiểm định
			</button>

			<button
				type="button"
				class="h-11 px-4 rounded-xl border border-field-border bg-panel hover:bg-panel-2 hover:border-ok/50 text-text-color font-sans text-sm font-semibold cursor-pointer transition-all flex items-center justify-center gap-2 whitespace-nowrap shrink-0 shadow-sm"
				onclick={() => {
					editorState.cleanAnalysis = null;
					editorState.cleanReport = null;
					editorState.isCleanerModalOpen = true;
				}}
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="1.75"
					stroke="currentColor"
					class="w-4 h-4 text-ok"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
					/>
				</svg>
				Dọn rác EPUB
			</button>

			<div class="w-full sm:w-auto min-w-50 shrink-0">
				<Button onclick={() => (editorState.isModalOpen = true)} variant="primary">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="2"
						stroke="currentColor"
						class="w-4 h-4"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125"
						/>
					</svg>
					Mở trình chỉnh sửa
				</Button>
			</div>
		</div>
	{/if}
</div>

<!-- Modal Fullscreen Editor -->
<EpubEditorModal bind:show={editorState.isModalOpen} {editorState} />

<!-- Modal Cleaner -->
<EpubCleanerModal bind:show={editorState.isCleanerModalOpen} {editorState} />

<!-- Modal Validator -->
<EpubValidatorModal bind:show={editorState.isValidatorModalOpen} {editorState} />

<!-- Modal Metadata -->
<EpubMetadataModal bind:show={editorState.isMetadataModalOpen} {editorState} />

<style>
	.animate-fade-in {
		animation: fadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
	}
	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(6px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
