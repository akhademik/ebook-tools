<!-- src/lib/epub-editor/components/EpubEditorPreviewPane.svelte -->
<script lang="ts">
	import type { EpubEditorState } from '../epub-editor-state.svelte';

	interface Props {
		editorState: EpubEditorState;
	}

	let { editorState }: Props = $props();

	let iframeEl = $state<HTMLIFrameElement | null>(null);
	let isInternalSync = false;
	let lastScrollRatio = 0;
	let lastPreviewTarget: string | null = null;

	function handleIframeLoad() {
		if (!iframeEl) return;
		const win = iframeEl.contentWindow;
		const doc = iframeEl.contentDocument;
		if (!win || !doc) return;

		try {
			// Restore scroll position when iframe document is reloaded
			if (lastScrollRatio > 0) {
				const restoreScroll = () => {
					if (!iframeEl) return;
					const w = iframeEl.contentWindow;
					const d = iframeEl.contentDocument;
					if (!w || !d) return;
					const scrollElement = d.scrollingElement || d.documentElement || d.body;
					const maxScroll = scrollElement.scrollHeight - w.innerHeight;
					if (maxScroll > 0) {
						w.scrollTo({ top: lastScrollRatio * maxScroll, behavior: 'instant' });
					}
				};
				restoreScroll();
				requestAnimationFrame(restoreScroll);
				setTimeout(restoreScroll, 60);
			}

			// Inject high-visibility golden selection styling and comfortable side padding into preview document
			const style = doc.createElement('style');
			style.textContent = `
        ::selection {
          background-color: #fde047 !important;
          color: #713f12 !important;
        }
        body {
          padding-left: clamp(12px, 3vw, 24px);
          padding-right: clamp(12px, 3vw, 24px);
          box-sizing: border-box;
        }
      `;
			doc.head?.appendChild(style);

			// Listen to scroll inside the preview iframe
			win.addEventListener(
				'scroll',
				() => {
					const scrollElement = doc.scrollingElement || doc.documentElement || doc.body;
					const maxScroll = scrollElement.scrollHeight - win.innerHeight;
					if (maxScroll > 0) {
						const ratio = Math.min(
							Math.max((win.scrollY || scrollElement.scrollTop) / maxScroll, 0),
							1
						);
						lastScrollRatio = ratio;
						if (isInternalSync || !editorState.syncViewEnabled) return;
						if (editorState.editorTarget !== editorState.previewTarget) return;
						editorState.scrollEditorTo?.(ratio);
					}
				},
				{ passive: true }
			);

			// Listen to text selection inside preview iframe
			doc.addEventListener('mouseup', () => {
				if (isInternalSync || !editorState.syncViewEnabled) return;
				if (editorState.editorTarget !== editorState.previewTarget) return;

				const sel = win.getSelection();
				if (sel && !sel.isCollapsed) {
					const selectedText = sel.toString().trim();
					if (selectedText.length >= 2 && selectedText.length <= 300) {
						editorState.selectTextInEditor?.(selectedText);
					}
				}
			});
		} catch {
			// Handle cross-origin restrictions gracefully if any
		}
	}

	// Reset scroll ratio when switching preview target
	$effect(() => {
		const currentTarget = editorState.previewTarget;
		if (currentTarget !== lastPreviewTarget) {
			lastPreviewTarget = currentTarget;
			lastScrollRatio = 0;
		}
	});

	// Register hooks for syncing scroll and selection from Code Editor
	$effect(() => {
		editorState.scrollPreviewTo = (ratio: number) => {
			lastScrollRatio = ratio;
			if (!iframeEl || isInternalSync || !editorState.syncViewEnabled) return;
			const doc = iframeEl.contentDocument;
			const win = iframeEl.contentWindow;
			if (!doc || !win) return;

			isInternalSync = true;
			const scrollElement = doc.scrollingElement || doc.documentElement || doc.body;
			const maxScroll = scrollElement.scrollHeight - win.innerHeight;
			if (maxScroll > 0) {
				win.scrollTo({ top: ratio * maxScroll, behavior: 'auto' });
			}
			setTimeout(() => {
				isInternalSync = false;
			}, 60);
		};

		editorState.selectTextInPreview = (text: string) => {
			if (!iframeEl || isInternalSync || !editorState.syncViewEnabled) return;
			const win = iframeEl.contentWindow as
				(Window & { find?: (...args: unknown[]) => boolean }) | null;
			const doc = iframeEl.contentDocument;
			if (!win || !doc) return;

			const trimmed = text.trim();
			if (!trimmed || trimmed.length < 2) return;

			isInternalSync = true;
			try {
				const sel = win.getSelection();
				if (sel) {
					sel.removeAllRanges();
					if (typeof win.find === 'function') {
						win.find(trimmed, false, false, true, false, false, false);
					}
				}
			} catch {
				// fallback
			}
			setTimeout(() => {
				isInternalSync = false;
			}, 60);
		};
	});
</script>

<div class="flex flex-col h-full bg-brand-bg text-text-color overflow-hidden">
	<!-- Preview Top Bar -->
	<div
		class="h-10 px-3 md:px-4 border-b border-border-color flex items-center justify-between bg-panel-2 shrink-0 select-none gap-2"
	>
		<div class="flex items-center gap-2 min-w-0 text-xs">
			<span class="text-ok font-semibold shrink-0 flex items-center gap-1 font-sans">
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
						d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
					/>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
					/>
				</svg>
				<span>Preview:</span>
			</span>
			{#if editorState.previewTarget}
				<span
					class="font-bold truncate text-text-color font-mono"
					title={editorState.previewTarget}
				>
					{editorState.previewTarget}
				</span>
			{:else}
				<span class="text-text-mute italic font-sans">Chưa chọn trang để xem trước</span>
			{/if}
		</div>
	</div>

	<!-- Preview Frame Container -->
	<div
		class="flex-1 bg-panel flex items-center justify-center overflow-auto px-3 py-3 sm:px-6 sm:py-4"
	>
		{#if !editorState.previewTarget}
			<div class="text-center text-text-mute font-sans text-xs p-6">
				<div
					class="w-12 h-12 rounded-xl bg-panel-2 border border-border-color flex items-center justify-center text-text-mute mx-auto mb-3"
				>
					<svg
						class="w-6 h-6"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="1.8"
					>
						<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
						<path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
					</svg>
				</div>
				Double-click vào một trang (.xhtml) ở danh sách bên trái để xem trước.
			</div>
		{:else}
			<div
				class="h-full w-full bg-white transition-all duration-150 flex flex-col rounded-xl shadow-xs border border-border-color/60 overflow-hidden"
			>
				<!-- Iframe with allow-same-origin for @font-face rendering (NO allow-scripts for security) -->
				<iframe
					bind:this={iframeEl}
					onload={handleIframeLoad}
					sandbox="allow-same-origin"
					srcdoc={editorState.previewSrcDoc}
					title="Trang xem trước EPUB"
					class="w-full h-full border-0 bg-white"
				></iframe>
			</div>
		{/if}
	</div>
</div>
