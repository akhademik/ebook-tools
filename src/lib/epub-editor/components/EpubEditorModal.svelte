<!-- src/lib/epub-editor/components/EpubEditorModal.svelte -->
<script lang="ts">
  import Button from "$lib/components/Button.svelte";
  import type { EpubEditorState } from "../epub-editor-state.svelte";
  import EpubEditorSidebar from "./EpubEditorSidebar.svelte";
  import EpubEditorCodePane from "./EpubEditorCodePane.svelte";
  import EpubEditorPreviewPane from "./EpubEditorPreviewPane.svelte";
  import EpubCleanerModal from "./EpubCleanerModal.svelte";
  import EpubValidatorModal from "./EpubValidatorModal.svelte";
  import EpubMetadataModal from "./EpubMetadataModal.svelte";

  interface Props {
    show?: boolean;
    editorState: EpubEditorState;
    onClose?: () => void;
  }

  let { show = $bindable(false), editorState, onClose }: Props = $props();

  let activeView = $state<"split" | "code" | "preview">("split");
  let isSidebarOpen = $state(true);
  let showUnsavedConfirm = $state(false);

  let splitPercent = $state(50); // percentage for code pane width (15% - 85%)
  let isDragging = $state(false);
  let mainContainerEl = $state<HTMLElement | null>(null);

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
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    }

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
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
</script>

{#if show}
  <div
    class="fixed inset-0 z-50 flex flex-col bg-brand-bg text-text-color animate-fade-in select-none {isDragging ? 'cursor-col-resize select-none' : ''}"
    role="dialog"
    aria-modal="true"
  >
    <!-- Modal Header -->
    <header class="h-14 px-4 bg-sidebar-bg border-b border-border-color flex items-center justify-between gap-4 shrink-0 shadow-sm">
      <!-- Left: Title, File info & Sidebar toggle -->
      <div class="flex items-center gap-3 min-w-0">
        <button
          type="button"
          class="h-8 px-2.5 rounded-lg border border-border-color bg-panel hover:text-text-color text-text-mute font-mono text-xs cursor-pointer transition-colors flex items-center gap-1.5 shrink-0"
          onclick={() => (isSidebarOpen = !isSidebarOpen)}
          title={isSidebarOpen ? "Ẩn danh sách tệp" : "Hiện danh sách tệp"}
        >
          {isSidebarOpen ? "◀ Ẩn Files" : "▶ Hiện Files"}
        </button>

        <div class="w-8 h-8 rounded-lg bg-accent-soft text-accent-color flex items-center justify-center font-bold text-base shrink-0">
          ✏️
        </div>

        <div class="flex items-center gap-2 truncate">
          <h2 class="font-mono text-sm font-bold text-text-color truncate">
            {editorState.fileName || "EPUB Editor"}
          </h2>
          {#if editorState.dirtyPaths.size > 0}
            <span class="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-500 font-mono text-xs font-semibold shrink-0">
              ● {editorState.dirtyPaths.size} tệp đã sửa
            </span>
          {/if}
        </div>
      </div>

      <!-- Center: Layout View Switcher & Sync Toggle -->
      <div class="hidden md:flex items-center gap-2">
        <div class="flex items-center bg-panel rounded-xl p-1 border border-border-color font-mono text-xs">
          <button
            type="button"
            class="px-3 py-1 rounded-lg transition-colors cursor-pointer {activeView === 'split'
              ? 'bg-accent-soft text-accent-color font-semibold shadow-xs'
              : 'text-text-mute hover:text-text-color'}"
            onclick={() => (activeView = "split")}
          >
            ⬛|⬛
          </button>
          <button
            type="button"
            class="px-3 py-1 rounded-lg transition-colors cursor-pointer {activeView === 'code'
              ? 'bg-accent-soft text-accent-color font-semibold shadow-xs'
              : 'text-text-mute hover:text-text-color'}"
            onclick={() => (activeView = "code")}
          >
            💻
          </button>
          <button
            type="button"
            class="px-3 py-1 rounded-lg transition-colors cursor-pointer {activeView === 'preview'
              ? 'bg-accent-soft text-accent-color font-semibold shadow-xs'
              : 'text-text-mute hover:text-text-color'}"
            onclick={() => (activeView = "preview")}
          >
            👁️
          </button>
        </div>

        {#if activeView === 'split'}
          <button
            type="button"
            class="h-8 px-2.5 rounded-xl border border-border-color bg-panel font-mono text-xs cursor-pointer transition-colors flex items-center gap-1.5 {editorState.syncViewEnabled
              ? 'text-accent-color border-accent-color/30 bg-accent-soft/40 font-semibold'
              : 'text-text-mute hover:text-text-color'}"
            onclick={() => (editorState.syncViewEnabled = !editorState.syncViewEnabled)}
            title="Đồng bộ cuộn & highlight chọn văn bản hai chiều giữa Code Editor và Preview"
          >
            🔄 Sync: {editorState.syncViewEnabled ? "Bật" : "Tắt"}
          </button>
        {/if}
      </div>

      <!-- Right: Action buttons -->
      <div class="flex items-center gap-2 shrink-0">
        <button
          type="button"
          class="h-10 px-3 rounded-xl border border-border-color bg-panel hover:bg-hover-bg text-text-mute hover:text-text-color font-mono text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1.5"
          onclick={() => {
            editorState.isMetadataModalOpen = true;
          }}
          title="Chỉnh sửa Metadata (Tên sách, Tác giả) và Rebuild TOC"
        >
          ⚙️ Thông tin
        </button>

        <button
          type="button"
          class="h-10 px-3 rounded-xl border border-border-color bg-panel hover:bg-blue-500/10 hover:text-blue-400 hover:border-blue-500/30 text-text-mute font-mono text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1.5"
          onclick={() => {
            editorState.isValidatorModalOpen = true;
          }}
          title="Kiểm định tính hợp lệ & tương thích máy đọc sách Kobo / EPUB3"
        >
          🛡️ Kiểm định
        </button>

        <button
          type="button"
          class="h-10 px-3 rounded-xl border border-border-color bg-panel hover:bg-emerald-500/10 hover:text-emerald-400 hover:border-emerald-500/30 text-text-mute font-mono text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1.5"
          onclick={() => {
            editorState.cleanAnalysis = null;
            editorState.cleanReport = null;
            editorState.isCleanerModalOpen = true;
          }}
          title="Quét và xóa ảnh, font, CSS thừa không được sử dụng"
        >
          🧹 Dọn rác
        </button>

        <div class="w-32 sm:w-40">
          <Button
            onclick={() => handleExport(false)}
            disabled={editorState.isExporting}
            variant="primary"
          >
            {editorState.isExporting ? "Đang xuất..." : "📥 Xuất .EPUB"}
          </Button>
        </div>

        <button
          type="button"
          class="h-10 px-3 rounded-xl border border-border-color bg-panel hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30 text-text-mute font-mono text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1.5"
          onclick={requestClose}
          title="Đóng Editor"
        >
          ✕ Đóng
        </button>
      </div>
    </header>

    <!-- Validation Errors Warning Banner -->
    {#if editorState.validationErrors.length > 0}
      <div class="bg-red-500/10 border-b border-red-500/30 p-3 px-6 flex items-center justify-between gap-4 text-xs font-mono text-red-500 shrink-0">
        <div class="flex items-center gap-2 min-w-0">
          <span class="font-bold shrink-0">⚠️ Phát hiện lỗi XML/XHTML ({editorState.validationErrors.length}):</span>
          <div class="truncate">
            {#each editorState.validationErrors as err (err.path)}
              <span class="underline mr-2">[{err.path}: {err.error}]</span>
            {/each}
          </div>
        </div>

        <div class="flex items-center gap-2 shrink-0">
          <button
            type="button"
            class="px-2.5 py-1 rounded bg-red-500 text-white font-bold hover:bg-red-600 cursor-pointer text-xs"
            onclick={() => handleExport(true)}
          >
            Vẫn xuất (Bỏ qua)
          </button>
          <button
            type="button"
            class="px-2 py-1 rounded border border-red-500/40 hover:bg-red-500/20 cursor-pointer text-xs"
            onclick={() => (editorState.validationErrors = [])}
          >
            Đóng
          </button>
        </div>
      </div>
    {/if}

    <!-- Main Workspace Layout -->
    <div class="flex-1 flex overflow-hidden">
      <!-- Left: Sidebar (Collapsible) -->
      {#if isSidebarOpen}
        <aside class="w-64 md:w-72 shrink-0 h-full overflow-hidden border-r border-border-color">
          <EpubEditorSidebar {editorState} />
        </aside>
      {/if}

      <!-- Center & Right Panes (Resizable Split) -->
      <main
        bind:this={mainContainerEl}
        class="flex-1 flex overflow-hidden relative {isDragging ? 'select-none pointer-events-none' : ''}"
      >
        {#if activeView === "split"}
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
            <div class="w-0.5 h-6 rounded bg-border-color group-hover:bg-accent-color transition-colors"></div>
          </div>

          <!-- Right Sub-Pane: Live Preview -->
          <div
            class="h-full overflow-hidden"
            style="width: calc({100 - splitPercent}% - 6px); min-width: 15%; max-width: 85%;"
          >
            <EpubEditorPreviewPane {editorState} />
          </div>
        {:else if activeView === "code"}
          <div class="flex-1 h-full min-w-0">
            <EpubEditorCodePane {editorState} />
          </div>
        {:else if activeView === "preview"}
          <div class="flex-1 h-full min-w-0">
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
            <div class="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-500 flex items-center justify-center text-2xl shrink-0">
              ⚠️
            </div>
            <div class="flex-1 min-w-0">
              <h3 id="confirm-title" class="font-mono text-base font-bold text-text-color">
                Chưa lưu thay đổi
              </h3>
              <p id="confirm-desc" class="text-xs text-text-mute mt-1">
                Bạn có <span class="text-amber-500 font-bold font-mono">{editorState.dirtyPaths.size} tệp</span> đã chỉnh sửa nhưng chưa được xuất ra file .EPUB.
              </p>
            </div>
          </div>

          <!-- Dirty files list preview -->
          <div class="max-h-32 overflow-y-auto bg-panel rounded-xl p-2.5 border border-border-color space-y-1 font-mono text-[11px]">
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

  <!-- Modal Cleanup -->
  <EpubCleanerModal
    bind:show={editorState.isCleanerModalOpen}
    {editorState}
  />

  <!-- Modal Validator -->
  <EpubValidatorModal
    bind:show={editorState.isValidatorModalOpen}
    {editorState}
  />

  <!-- Modal Metadata -->
  <EpubMetadataModal
    bind:show={editorState.isMetadataModalOpen}
    {editorState}
  />
{/if}
