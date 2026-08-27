<!-- src/lib/epub-editor/components/EpubEditorModal.svelte -->
<script lang="ts">
	import type { EpubEditorFileItem } from '$lib/types';
	import type { EpubEditorState } from '../epub-editor-state.svelte';
	import EpubEditorSidebar from './EpubEditorSidebar.svelte';
	import EpubEditorCodePane from './EpubEditorCodePane.svelte';
	import EpubEditorPreviewPane from './EpubEditorPreviewPane.svelte';

	interface Props {
		show?: boolean;
		editorState: EpubEditorState;
		onClose?: () => void;
	}

	let { show = $bindable(false), editorState, onClose }: Props = $props();

	let activeView = $state<'split' | 'code' | 'preview'>('split');
	let isSidebarOpen = $state(true);
	let showUnsavedConfirm = $state(false);
	let showLandscapeHint = $state(true);
	let isMobilePortrait = $state(false);

	let splitPercent = $state(50); // percentage for code pane width (15% - 85%)
	let isDragging = $state(false);
	let mainContainerEl = $state<HTMLElement | null>(null);

	$effect(() => {
		if (typeof window !== 'undefined') {
			const checkMobile = () => {
				const isMobile = window.innerWidth < 768;
				const isPortrait = window.innerHeight > window.innerWidth;
				isMobilePortrait = isMobile && isPortrait;
				if (isMobile) {
					if (activeView === 'split') {
						activeView = 'code';
					}
					isSidebarOpen = false;
				} else {
					isSidebarOpen = true;
				}
			};
			checkMobile();
			window.addEventListener('resize', checkMobile);
			return () => window.removeEventListener('resize', checkMobile);
		}
	});

	function startResize(e: MouseEvent) {
		e.preventDefault();
		isDragging = true;

		function onMouseMove(moveEvent: MouseEvent) {
			if (!mainContainerEl) return;
			const rect = mainContainerEl.getBoundingClientRect();
			const newPercent = ((moveEvent.clientX - rect.left) / rect.width) * 100;
			splitPercent = Math.min(Math.max(newPercent, 15), 85);
		}

		function onMouseUp() {
			isDragging = false;
			window.removeEventListener('mousemove', onMouseMove);
			window.removeEventListener('mouseup', onMouseUp);
		}

		window.addEventListener('mousemove', onMouseMove);
		window.addEventListener('mouseup', onMouseUp);
	}

	function requestClose() {
		if (editorState.dirtyPaths.size > 0) {
			showUnsavedConfirm = true;
			return;
		}
		actuallyClose();
	}

	function actuallyClose() {
		showUnsavedConfirm = false;
		show = false;
		editorState.closeModal();
		onClose?.();
	}

	async function handleExport(ignoreValidation = false): Promise<boolean> {
		const result = await editorState.exportEpub(ignoreValidation);
		return !!result;
	}

	async function handleExportAndClose() {
		const success = await handleExport(false);
		if (success) {
			actuallyClose();
		}
	}

	function handleFileSelectedMobile(_item?: EpubEditorFileItem) {
		if (typeof window !== 'undefined' && window.innerWidth < 768) {
			isSidebarOpen = false;
		}
	}
</script>

{#if show}
	<div
		class="fixed inset-0 z-50 flex flex-col bg-brand-bg text-text-color animate-fade-in select-none {isDragging
			? 'cursor-col-resize select-none'
			: ''}"
		role="dialog"
		aria-modal="true"
	>
		<!-- Modal Header -->
		<header
			class="h-14 px-3 sm:px-4 bg-sidebar-bg border-b border-border-color flex items-center justify-between gap-2 sm:gap-4 shrink-0 shadow-sm"
		>
			<!-- Left: Title, File info & Sidebar toggle -->
			<div class="flex items-center gap-2 sm:gap-3 min-w-0">
				<button
					type="button"
					class="h-9 px-2.5 rounded-xl border border-border-color bg-panel hover:text-text-color text-text-mute font-mono text-xs cursor-pointer transition-colors flex items-center gap-1.5 shrink-0"
					onclick={() => (isSidebarOpen = !isSidebarOpen)}
					title={isSidebarOpen ? 'Ẩn danh sách tệp' : 'Hiện danh sách tệp'}
				>
					<span>{isSidebarOpen ? '◀' : '▶'}</span>
					<span class="hidden sm:inline">{isSidebarOpen ? 'Ẩn Files' : 'Hiện Files'}</span>
					<span class="sm:hidden font-semibold">Files</span>
				</button>

				<div
					class="w-8 h-8 rounded-lg bg-accent-soft text-accent-color flex items-center justify-center font-bold text-sm sm:text-base shrink-0"
				>
					✏️
				</div>

				<div class="flex items-center gap-1.5 min-w-0 truncate">
					<h2
						class="font-mono text-xs sm:text-sm font-bold text-text-color truncate max-w-[110px] sm:max-w-[220px]"
					>
						{editorState.fileName || 'EPUB Editor'}
					</h2>
					{#if editorState.dirtyPaths.size > 0}
						<span
							class="px-1.5 sm:px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-500 font-mono text-[10px] sm:text-xs font-semibold shrink-0"
						>
							● {editorState.dirtyPaths.size}
						</span>
					{/if}
				</div>
			</div>

			<!-- Center: Responsive Layout View Switcher & Sync Toggle -->
			<div class="flex items-center gap-1.5 sm:gap-2">
				<div
					class="flex items-center bg-panel rounded-xl p-0.5 sm:p-1 border border-border-color font-mono text-xs"
				>
					<button
						type="button"
						class="px-2.5 sm:px-3 py-1 rounded-lg transition-colors cursor-pointer {activeView ===
						'code'
							? 'bg-accent-soft text-accent-color font-semibold shadow-xs'
							: 'text-text-mute hover:text-text-color'}"
						onclick={() => (activeView = 'code')}
						title="Xem mã nguồn Code"
					>
						💻 <span class="hidden md:inline">Code</span>
					</button>
					<button
						type="button"
						class="px-2.5 sm:px-3 py-1 rounded-lg transition-colors cursor-pointer {activeView ===
						'preview'
							? 'bg-accent-soft text-accent-color font-semibold shadow-xs'
							: 'text-text-mute hover:text-text-color'}"
						onclick={() => (activeView = 'preview')}
						title="Xem trước Live Preview"
					>
						👁️ <span class="hidden md:inline">Xem</span>
					</button>
					<button
						type="button"
						class="hidden md:inline-flex px-3 py-1 rounded-lg transition-colors cursor-pointer {activeView ===
						'split'
							? 'bg-accent-soft text-accent-color font-semibold shadow-xs'
							: 'text-text-mute hover:text-text-color'}"
						onclick={() => (activeView = 'split')}
						title="Chế độ Song song Code & Preview"
					>
						⬛|⬛ Song song
					</button>
				</div>

				{#if activeView === 'split'}
					<button
						type="button"
						class="hidden lg:flex h-8 px-2.5 rounded-xl border border-border-color bg-panel font-mono text-xs cursor-pointer transition-colors items-center gap-1.5 {editorState.syncViewEnabled
							? 'text-accent-color border-accent-color/30 bg-accent-soft/40 font-semibold'
							: 'text-text-mute hover:text-text-color'}"
						onclick={() => (editorState.syncViewEnabled = !editorState.syncViewEnabled)}
						title="Đồng bộ cuộn & highlight chọn văn bản hai chiều giữa Code Editor và Preview"
					>
						🔄 Sync: {editorState.syncViewEnabled ? 'Bật' : 'Tắt'}
					</button>
				{/if}
			</div>

			<!-- Right: Action buttons -->
			<div class="flex items-center gap-1.5 sm:gap-2 shrink-0">
				<button
					type="button"
					class="h-9 sm:h-10 w-9 sm:w-10 rounded-xl bg-accent-color hover:bg-accent-color/90 text-white font-mono text-base font-bold cursor-pointer transition-colors flex items-center justify-center shadow-sm disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
					onclick={() => handleExport(false)}
					disabled={editorState.isExporting}
					title={editorState.isExporting ? 'Đang xuất .EPUB...' : 'Xuất tệp .EPUB (Download)'}
				>
					<span>{editorState.isExporting ? '⏳' : '📥'}</span>
				</button>

				<button
					type="button"
					class="h-9 sm:h-10 px-2.5 sm:px-3 rounded-xl border border-border-color bg-panel hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30 text-text-mute font-mono text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1"
					onclick={requestClose}
					title="Đóng Editor"
				>
					✕ <span class="hidden sm:inline">Đóng</span>
				</button>
			</div>
		</header>

		<!-- Mobile Landscape Suggestion Hint Banner -->
		{#if showLandscapeHint && isMobilePortrait}
			<div
				class="bg-accent-soft/90 border-b border-accent-color/30 px-3.5 py-2 flex items-center justify-between gap-3 text-xs font-mono text-text-color shrink-0 animate-fade-in"
			>
				<div class="flex items-center gap-2 min-w-0">
					<span class="text-base">📱🔄</span>
					<span class="truncate"
						>Mẹo: Xoay ngang màn hình (Landscape) để vừa soạn thảo vừa xem trước!</span
					>
				</div>
				<button
					type="button"
					class="text-text-mute hover:text-text-color p-1 cursor-pointer font-bold shrink-0"
					onclick={() => (showLandscapeHint = false)}
					title="Đóng gợi ý">✕</button
				>
			</div>
		{/if}

		<!-- Validation Errors Warning Banner -->
		{#if editorState.validationErrors.length > 0}
			<div
				class="bg-red-500/10 border-b border-red-500/30 p-2.5 sm:p-3 px-4 sm:px-6 flex items-center justify-between gap-2 sm:gap-4 text-xs font-mono text-red-500 shrink-0"
			>
				<div class="flex items-center gap-2 min-w-0">
					<span class="font-bold shrink-0"
						>⚠️ Lỗi XML/XHTML ({editorState.validationErrors.length}):</span
					>
					<div class="truncate">
						{#each editorState.validationErrors as err (err.path)}
							<span class="underline mr-2">[{err.path}: {err.error}]</span>
						{/each}
					</div>
				</div>

				<div class="flex items-center gap-2 shrink-0">
					<button
						type="button"
						class="px-2 sm:px-2.5 py-1 rounded bg-red-500 text-white font-bold hover:bg-red-600 cursor-pointer text-[11px] sm:text-xs"
						onclick={() => handleExport(true)}
					>
						Bỏ qua
					</button>
					<button
						type="button"
						class="px-2 py-1 rounded border border-red-500/40 hover:bg-red-500/20 cursor-pointer text-[11px] sm:text-xs"
						onclick={() => (editorState.validationErrors = [])}
					>
						Đóng
					</button>
				</div>
			</div>
		{/if}

		<!-- Main Workspace Layout -->
		<div class="flex-1 flex overflow-hidden relative">
			<!-- Mobile Backdrop for Sidebar Drawer -->
			{#if isSidebarOpen}
				<!-- svelte-ignore a11y_click_events_have_key_events -->
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<div
					class="fixed inset-0 top-14 bg-black/60 z-30 md:hidden backdrop-blur-xs transition-opacity"
					onclick={() => (isSidebarOpen = false)}
				></div>
			{/if}

			<!-- Left: Sidebar (Collapsible & Mobile Drawer) -->
			{#if isSidebarOpen}
				<aside
					class="fixed md:static top-14 bottom-0 left-0 z-40 w-72 sm:w-80 md:w-72 shrink-0 h-[calc(100vh-3.5rem)] md:h-full overflow-hidden border-r border-border-color bg-sidebar-bg shadow-2xl md:shadow-none animate-fade-in"
				>
					<EpubEditorSidebar {editorState} onFileSelected={handleFileSelectedMobile} />
				</aside>
			{/if}

			<!-- Center & Right Panes (Resizable Split) -->
			<main
				bind:this={mainContainerEl}
				class="flex-1 flex overflow-hidden relative {isDragging
					? 'select-none pointer-events-none'
					: ''}"
			>
				{#if activeView === 'split'}
					<!-- Left Sub-Pane: Code Editor -->
					<div
						class="h-full overflow-hidden"
						style="width: {splitPercent}%; min-width: 15%; max-width: 85%;"
					>
						<EpubEditorCodePane {editorState} />
					</div>

					<!-- Draggable Splitter Divider -->
					<!-- svelte-ignore a11y_no_static_element_interactions -->
					<div
						class="w-1.5 hover:w-2 bg-border-color/40 hover:bg-accent-color/50 active:bg-accent-color cursor-col-resize shrink-0 transition-all z-20 flex items-center justify-center group select-none pointer-events-auto"
						onmousedown={startResize}
						ondblclick={() => (splitPercent = 50)}
						title="Kéo để chỉnh kích thước · Double click để đặt lại 50/50"
					>
						<div
							class="w-0.5 h-6 rounded bg-border-color group-hover:bg-accent-color transition-colors"
						></div>
					</div>

					<!-- Right Sub-Pane: Live Preview -->
					<div
						class="h-full overflow-hidden"
						style="width: calc({100 - splitPercent}% - 6px); min-width: 15%; max-width: 85%;"
					>
						<EpubEditorPreviewPane {editorState} />
					</div>
				{:else if activeView === 'code'}
					<!-- Single View: Code Only -->
					<div class="w-full h-full overflow-hidden">
						<EpubEditorCodePane {editorState} />
					</div>
				{:else if activeView === 'preview'}
					<!-- Single View: Preview Only -->
					<div class="w-full h-full overflow-hidden">
						<EpubEditorPreviewPane {editorState} />
					</div>
				{/if}

				<!-- Dragging transparent overlay to prevent iframe event stealing -->
				{#if isDragging}
					<div class="absolute inset-0 z-50 cursor-col-resize"></div>
				{/if}
			</main>
		</div>

		<!-- Custom Unsaved Changes Confirmation Modal -->
		{#if showUnsavedConfirm}
			<div
				class="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in select-none"
				role="presentation"
				onclick={(e) => {
					if (e.target === e.currentTarget) showUnsavedConfirm = false;
				}}
			>
				<div
					class="bg-sidebar-bg border border-border-color rounded-2xl shadow-2xl max-w-md w-full p-6 flex flex-col gap-4 text-text-color"
					role="alertdialog"
					aria-modal="true"
					aria-labelledby="confirm-title"
					aria-describedby="confirm-desc"
				>
					<!-- Header -->
					<div class="flex items-start gap-4">
						<div
							class="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-500 flex items-center justify-center text-2xl shrink-0"
						>
							⚠️
						</div>
						<div class="flex-1 min-w-0">
							<h3 id="confirm-title" class="font-mono text-base font-bold text-text-color">
								Chưa lưu thay đổi
							</h3>
							<p id="confirm-desc" class="text-xs text-text-mute mt-1">
								Bạn có <span class="text-amber-500 font-bold font-mono"
									>{editorState.dirtyPaths.size} tệp</span
								> đã chỉnh sửa nhưng chưa được xuất ra file .EPUB.
							</p>
						</div>
					</div>

					<!-- Dirty files list preview -->
					<div
						class="max-h-32 overflow-y-auto bg-panel rounded-xl p-2.5 border border-border-color space-y-1 font-mono text-[11px]"
					>
						{#each Array.from(editorState.dirtyPaths) as dirtyPath (dirtyPath)}
							<div class="flex items-center gap-2 text-text-mute truncate">
								<span class="text-amber-500 text-xs">●</span>
								<span class="truncate">{dirtyPath}</span>
							</div>
						{/each}
					</div>

					<p class="text-xs text-text-mute">
						Nếu đóng ngay bây giờ, các thay đổi trên sẽ bị hủy bỏ và không thể khôi phục.
					</p>

					<!-- Action Buttons -->
					<div class="flex flex-col-reverse sm:flex-row items-center justify-center gap-2 pt-2">
						<button
							type="button"
							class="w-full sm:w-auto px-4 py-2 rounded-xl border border-border-color bg-panel hover:text-text-color text-text-mute font-mono text-xs font-semibold cursor-pointer transition-colors"
							onclick={() => (showUnsavedConfirm = false)}
						>
							Tiếp tục
						</button>
						<button
							type="button"
							class="w-full sm:w-auto px-4 py-2 rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-mono text-xs font-semibold cursor-pointer transition-colors"
							onclick={actuallyClose}
						>
							Bỏ qua
						</button>
						<button
							type="button"
							class="w-full sm:w-auto px-4 py-2 rounded-xl bg-accent-color hover:bg-accent-color/90 text-white font-mono text-xs font-semibold cursor-pointer transition-colors flex items-center justify-center gap-1.5 shadow-sm"
							onclick={handleExportAndClose}
						>
							📥 Export
						</button>
					</div>
				</div>
			</div>
		{/if}
	</div>
{/if}
