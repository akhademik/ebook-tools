<!-- src/lib/epub-editor/components/EpubEditorPreviewPane.svelte -->
<script lang="ts">
  import type { EpubEditorState } from "../epub-editor-state.svelte";

  interface Props {
    editorState: EpubEditorState;
  }

  let { editorState }: Props = $props();

  let viewSize = $state<"100%" | "600px" | "768px" | "390px">("100%");
  let iframeEl = $state<HTMLIFrameElement | null>(null);
  let isInternalSync = false;

  function handleIframeLoad() {
    if (!iframeEl) return;
    const win = iframeEl.contentWindow;
    const doc = iframeEl.contentDocument;
    if (!win || !doc) return;

    try {
      // Inject high-visibility golden selection styling into preview document
      const style = doc.createElement("style");
      style.textContent = `
        ::selection {
          background-color: #fde047 !important;
          color: #713f12 !important;
        }
      `;
      doc.head?.appendChild(style);

      // Listen to scroll inside the preview iframe
      win.addEventListener(
        "scroll",
        () => {
          if (isInternalSync || !editorState.syncViewEnabled) return;
          if (editorState.editorTarget !== editorState.previewTarget) return;

          const scrollElement = doc.scrollingElement || doc.documentElement || doc.body;
          const maxScroll = scrollElement.scrollHeight - win.innerHeight;
          if (maxScroll > 0) {
            const ratio = Math.min(
              Math.max((win.scrollY || scrollElement.scrollTop) / maxScroll, 0),
              1,
            );
            editorState.scrollEditorTo?.(ratio);
          }
        },
        { passive: true },
      );

      // Listen to text selection inside preview iframe
      doc.addEventListener("mouseup", () => {
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

  // Register hooks for syncing scroll and selection from Code Editor
  $effect(() => {
    editorState.scrollPreviewTo = (ratio: number) => {
      if (!iframeEl || isInternalSync || !editorState.syncViewEnabled) return;
      const doc = iframeEl.contentDocument;
      const win = iframeEl.contentWindow;
      if (!doc || !win) return;

      isInternalSync = true;
      const scrollElement = doc.scrollingElement || doc.documentElement || doc.body;
      const maxScroll = scrollElement.scrollHeight - win.innerHeight;
      if (maxScroll > 0) {
        win.scrollTo({ top: ratio * maxScroll, behavior: "auto" });
      }
      setTimeout(() => {
        isInternalSync = false;
      }, 60);
    };

    editorState.selectTextInPreview = (text: string) => {
      if (!iframeEl || isInternalSync || !editorState.syncViewEnabled) return;
      const win = iframeEl.contentWindow as (Window & { find?: (...args: unknown[]) => boolean }) | null;
      const doc = iframeEl.contentDocument;
      if (!win || !doc) return;

      const trimmed = text.trim();
      if (!trimmed || trimmed.length < 2) return;

      isInternalSync = true;
      try {
        const sel = win.getSelection();
        if (sel) {
          sel.removeAllRanges();
          if (typeof win.find === "function") {
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
  <div class="h-10 px-3 md:px-4 border-b border-border-color flex items-center justify-between bg-panel-2 shrink-0 select-none gap-2">
    <div class="flex items-center gap-2 min-w-0 font-mono text-xs">
      <span class="text-emerald-500 font-semibold shrink-0">👁️ Preview:</span>
      {#if editorState.previewTarget}
        <span class="font-bold truncate text-text-color" title={editorState.previewTarget}>
          {editorState.previewTarget}
        </span>
      {:else}
        <span class="text-text-mute italic">Chưa chọn trang để xem trước</span>
      {/if}
    </div>

    <!-- Size selector & Refresh -->
    <div class="flex items-center gap-1.5 font-mono text-xs shrink-0">
      <div class="hidden sm:flex items-center bg-panel rounded-lg p-0.5 border border-border-color text-[11px]">
        <button
          type="button"
          class="px-2 py-0.5 rounded transition-colors cursor-pointer {viewSize === '100%'
            ? 'bg-accent-soft text-accent-color font-semibold'
            : 'text-text-mute hover:text-text-color'}"
          onclick={() => (viewSize = "100%")}
          title="100% Real View (Toàn khung nhìn)"
        >
          100% Real
        </button>
        <button
          type="button"
          class="px-2 py-0.5 rounded transition-colors cursor-pointer {viewSize === '600px'
            ? 'bg-accent-soft text-accent-color font-semibold'
            : 'text-text-mute hover:text-text-color'}"
          onclick={() => (viewSize = "600px")}
          title="Mô phỏng máy đọc sách (600px)"
        >
          📖 600px
        </button>
        <button
          type="button"
          class="px-2 py-0.5 rounded transition-colors cursor-pointer {viewSize === '768px'
            ? 'bg-accent-soft text-accent-color font-semibold'
            : 'text-text-mute hover:text-text-color'}"
          onclick={() => (viewSize = "768px")}
          title="Mô phỏng máy tính bảng (768px)"
        >
          📱 768px
        </button>
        <button
          type="button"
          class="px-2 py-0.5 rounded transition-colors cursor-pointer {viewSize === '390px'
            ? 'bg-accent-soft text-accent-color font-semibold'
            : 'text-text-mute hover:text-text-color'}"
          onclick={() => (viewSize = "390px")}
          title="Mô phỏng điện thoại (390px)"
        >
          📱 390px
        </button>
      </div>

      <button
        type="button"
        class="text-xs px-2 py-0.5 rounded border border-border-color bg-panel hover:text-text-color transition-colors cursor-pointer text-text-mute hover:border-accent-color"
        onclick={() => editorState.renderPreview()}
        title="Làm mới xem trước"
      >
        🔄
      </button>
    </div>
  </div>

  <!-- Preview Frame Container -->
  <div class="flex-1 bg-panel flex items-center justify-center overflow-auto {viewSize === '100%' ? 'p-0' : 'p-4'}">
    {#if !editorState.previewTarget}
      <div class="text-center text-text-mute font-mono text-xs p-6">
        <span class="text-3xl block mb-2">📖</span>
        Double-click vào một trang (.xhtml) ở danh sách bên trái để xem trước.
      </div>
    {:else}
      <div
        class="h-full bg-white transition-all duration-150 flex flex-col {viewSize === '100%'
          ? 'w-full shadow-none border-0'
          : 'rounded-xl shadow-lg border border-border-color overflow-hidden'}"
        style={viewSize !== '100%' ? `width: ${viewSize}; max-width: 100%;` : 'width: 100%;'}
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
