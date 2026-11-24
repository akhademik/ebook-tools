<!-- src/lib/epub-editor/components/EpubEditorSidebar.svelte -->
<script lang="ts">
	import type { EpubEditorFileItem } from '$lib/types';
	import type { EpubEditorState } from '../epub-editor-state.svelte';

	interface Props {
		editorState: EpubEditorState;
		onFileSelected?: (item: EpubEditorFileItem) => void;
	}

	let { editorState, onFileSelected }: Props = $props();

	let filterTab = $state<'all' | 'page' | 'style' | 'image' | 'other'>('all');

	const filteredFiles = $derived(
		filterTab === 'all'
			? editorState.files
			: editorState.files.filter((f) => f.category === filterTab)
	);

	const pagesCount = $derived(editorState.files.filter((f) => f.category === 'page').length);
	const stylesCount = $derived(editorState.files.filter((f) => f.category === 'style').length);
	const imagesCount = $derived(editorState.files.filter((f) => f.category === 'image').length);
	const othersCount = $derived(editorState.files.filter((f) => f.category === 'other').length);

	function handleItemClick(item: EpubEditorFileItem) {
		if (item.category === 'page' || item.category === 'style') {
			editorState.selectFile(item, 'single');
			onFileSelected?.(item);
		}
	}

	function handleItemDblClick(item: EpubEditorFileItem) {
		if (item.category === 'page') {
			editorState.selectFile(item, 'double');
			onFileSelected?.(item);
		} else if (item.category === 'style') {
			editorState.selectFile(item, 'single');
			onFileSelected?.(item);
		}
	}
</script>

<div
	class="flex flex-col h-full bg-sidebar-bg border-r border-border-color text-text-color select-none"
>
	<!-- Sidebar Header -->
	<div class="p-3.5 border-b border-border-color">
		<div class="flex items-center justify-between mb-2">
			<span class="font-sans text-xs font-semibold uppercase tracking-wider text-text-mute">
				Cấu trúc file ({editorState.files.length})
			</span>
			{#if editorState.dirtyPaths.size > 0}
				<span
					class="font-mono text-[11px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-500 font-semibold"
				>
					● {editorState.dirtyPaths.size} đã sửa
				</span>
			{/if}
		</div>

		<!-- Category Filters -->
		<div class="grid grid-cols-5 gap-1 font-mono text-[11px]">
			<button
				type="button"
				class="py-1 px-1 rounded-md text-center transition-colors cursor-pointer {filterTab ===
				'all'
					? 'bg-accent-soft text-accent-color font-semibold'
					: 'text-text-mute hover:text-text-color hover:bg-panel'}"
				onclick={() => (filterTab = 'all')}
				title="Tất cả file"
			>
				Tất cả
			</button>
			<button
				type="button"
				class="py-1 px-1 rounded-md text-center transition-colors cursor-pointer {filterTab ===
				'page'
					? 'bg-accent-soft text-accent-color font-semibold'
					: 'text-text-mute hover:text-text-color hover:bg-panel'}"
				onclick={() => (filterTab = 'page')}
				title="Trang nội dung"
			>
				Trang ({pagesCount})
			</button>
			<button
				type="button"
				class="py-1 px-1 rounded-md text-center transition-colors cursor-pointer {filterTab ===
				'style'
					? 'bg-accent-soft text-accent-color font-semibold'
					: 'text-text-mute hover:text-text-color hover:bg-panel'}"
				onclick={() => (filterTab = 'style')}
				title="CSS Stylesheet"
			>
				CSS ({stylesCount})
			</button>
			<button
				type="button"
				class="py-1 px-1 rounded-md text-center transition-colors cursor-pointer {filterTab ===
				'image'
					? 'bg-accent-soft text-accent-color font-semibold'
					: 'text-text-mute hover:text-text-color hover:bg-panel'}"
				onclick={() => (filterTab = 'image')}
				title="Hình ảnh"
			>
				Ảnh ({imagesCount})
			</button>
			<button
				type="button"
				class="py-1 px-1 rounded-md text-center transition-colors cursor-pointer {filterTab ===
				'other'
					? 'bg-accent-soft text-accent-color font-semibold'
					: 'text-text-mute hover:text-text-color hover:bg-panel'}"
				onclick={() => (filterTab = 'other')}
				title="Khác"
			>
				Khác ({othersCount})
			</button>
		</div>
	</div>

	<!-- Instruction tip -->
	<div
		class="px-3.5 py-2 bg-panel-2/50 border-b border-border-color text-[11px] text-text-mute font-sans flex items-center gap-1.5"
	>
		<svg
			class="w-3.5 h-3.5 text-accent-color shrink-0"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				d="M12 18v-5.25m0 0a6.002 6.002 0 0 0-4-5.659V5a2 2 0 1 1 4 0v2.091c1.554.743 2.766 2.08 3.25 3.734m-3.25-.575v.001ZM12 18a2.25 2.25 0 0 0 2.25-2.25H9.75A2.25 2.25 0 0 0 12 18Z"
			/>
		</svg>
		<span>Click: Sửa code | Double-click: Xem trước</span>
	</div>

	<!-- File List -->
	<div class="flex-1 overflow-y-auto p-2 space-y-0.5">
		{#if filteredFiles.length === 0}
			<div class="p-6 text-center text-xs font-sans text-text-mute">
				Không có file nào trong mục này.
			</div>
		{:else}
			{#each filteredFiles as file (file.path)}
				{@const isEditorActive = editorState.editorTarget === file.path}
				{@const isPreviewActive = editorState.previewTarget === file.path}
				{@const isDirty = editorState.dirtyPaths.has(file.path)}
				{@const isInteractive = file.category === 'page' || file.category === 'style'}

				<!-- svelte-ignore a11y_click_events_have_key_events -->
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<div
					class="group flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-mono transition-all {isInteractive
						? 'cursor-pointer'
						: 'opacity-50 cursor-default'} {isEditorActive
						? 'bg-accent-color/15 text-accent-color border border-accent-color/30 font-semibold'
						: isInteractive
							? 'hover:bg-panel border border-transparent text-text-color'
							: 'border border-transparent text-text-mute'}"
					onclick={() => handleItemClick(file)}
					ondblclick={() => handleItemDblClick(file)}
					title="{file.path} ({file.category})"
				>
					<div class="flex items-center gap-2 min-w-0 flex-1 mr-2">
						<span class="shrink-0 text-text-mute">
							{#if file.category === 'page'}
								<svg
									class="w-3.5 h-3.5"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
									/>
								</svg>
							{:else if file.category === 'style'}
								<svg
									class="w-3.5 h-3.5"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										d="M9.53 16.122a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 1-2.4 2.245 4.5 4.5 0 0 0 8.4-2.245c0-.399-.078-.78-.22-1.128Zm0 0a15.998 15.998 0 0 0 3.388-1.62m-5.043-.025a15.994 15.994 0 0 1 1.622-3.395m3.42 3.42a15.995 15.995 0 0 0 4.764-4.648l3.876-5.814a1.151 1.151 0 0 0-1.597-1.597L14.146 6.32a15.996 15.996 0 0 0-4.649 4.763m3.42 3.42a6.776 6.776 0 0 0-3.42-3.42"
									/>
								</svg>
							{:else if file.category === 'image'}
								<svg
									class="w-3.5 h-3.5"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
								>
									<rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
									<circle cx="9" cy="9" r="2" />
									<path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
								</svg>
							{:else}
								<svg
									class="w-3.5 h-3.5"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 0 1 0 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 0 1 0-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281Z"
									/>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
									/>
								</svg>
							{/if}
						</span>
						<span class="truncate">{file.name}</span>
						{#if file.path.includes('/')}
							<span class="text-[10px] text-text-mute truncate opacity-60">
								{file.path.substring(0, file.path.lastIndexOf('/'))}
							</span>
						{/if}
					</div>

					<div class="flex items-center gap-1.5 shrink-0">
						{#if isDirty}
							<span class="text-amber-500 font-bold" title="Đã chỉnh sửa">●</span>
						{/if}

						{#if isPreviewActive}
							<span
								class="px-1.5 py-0.5 rounded text-[10px] bg-ok/20 text-ok font-bold flex items-center gap-1"
								title="Đang render trong Preview"
							>
								<svg
									class="w-3 h-3"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
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
								Preview
							</span>
						{/if}

						{#if isEditorActive}
							<span
								class="px-1.5 py-0.5 rounded text-[10px] bg-accent-soft text-accent-color font-bold"
								title="Đang mở trong Code Editor"
							>
								Edit
							</span>
						{/if}
					</div>
				</div>
			{/each}
		{/if}
	</div>
</div>
