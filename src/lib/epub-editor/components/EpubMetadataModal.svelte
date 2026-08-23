<!-- src/lib/epub-editor/components/EpubMetadataModal.svelte -->
<script lang="ts">
  import Button from "$lib/components/Button.svelte";
  import Input from "$lib/components/Input.svelte";
  import type { EpubEditorState } from "../epub-editor-state.svelte";
  import type { BookMetadataDetails } from "../epub-book-ops";

  interface Props {
    show?: boolean;
    editorState: EpubEditorState;
  }

  let { show = $bindable(false), editorState }: Props = $props();

  let formMeta = $state<BookMetadataDetails>({
    title: "",
    author: "",
    language: "vi",
    identifier: "",
    publisher: "",
    description: "",
    rights: "",
    pubDate: "",
  });

  let isSaving = $state(false);
  let isRebuildingToc = $state(false);
  let saveSuccessMessage = $state("");

  $effect(() => {
    if (show && editorState.zip) {
      loadMeta();
    }
  });

  async function loadMeta() {
    saveSuccessMessage = "";
    const meta = await editorState.loadBookMetadata();
    if (meta) {
      formMeta = { ...meta };
    }
  }

  async function handleSave() {
    isSaving = true;
    saveSuccessMessage = "";
    try {
      const ok = await editorState.saveBookMetadata(formMeta);
      if (ok) {
        saveSuccessMessage = "Đã lưu metadata vào content.opf thành công!";
        setTimeout(() => {
          if (show) saveSuccessMessage = "";
        }, 3000);
      }
    } finally {
      isSaving = false;
    }
  }

  async function handleRebuildToc() {
    isRebuildingToc = true;
    saveSuccessMessage = "";
    try {
      const ok = await editorState.rebuildToc();
      if (ok) {
        saveSuccessMessage = "Đã tạo lại mục lục (nav.xhtml & toc.ncx) thành công!";
        setTimeout(() => {
          if (show) saveSuccessMessage = "";
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
      <div class="px-6 py-4 border-b border-border-color flex justify-between items-center bg-sidebar-bg">
        <div class="flex items-center gap-2.5">
          <span class="text-xl">⚙️</span>
          <div>
            <h3 class="font-mono text-base font-bold text-text-color">
              Thông tin sách & Mục lục
            </h3>
            <p class="text-xs text-text-mute font-mono">
              Chỉnh sửa Metadata trong content.opf
            </p>
          </div>
        </div>
        <button
          type="button"
          class="w-8 h-8 rounded-lg border border-border-color bg-panel hover:bg-hover-bg text-text-mute hover:text-text-color flex items-center justify-center font-mono cursor-pointer transition-colors"
          onclick={handleClose}
          aria-label="Đóng modal"
        >
          ✕
        </button>
      </div>

      <!-- Body Content -->
      <div class="p-6 overflow-y-auto space-y-5">
        {#if saveSuccessMessage}
          <div class="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 text-xs font-mono text-emerald-400 flex items-center gap-2">
            <span>✅</span>
            <span>{saveSuccessMessage}</span>
          </div>
        {/if}

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Input
              label="Tên sách*"
              placeholder="VD: Không Gia Đình"
              bind:value={formMeta.title}
            />
          </div>
          <div>
            <Input
              label="Tác giả"
              placeholder="VD: Hector Malot"
              bind:value={formMeta.author}
            />
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <Input
              label="Ngôn ngữ"
              placeholder="vi"
              bind:value={formMeta.language}
            />
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
            bind:value={formMeta.description}
          ></textarea>
        </div>

        <!-- Quick TOC Rebuilder Action Card -->
        <div class="bg-sidebar-bg p-4 rounded-xl border border-border-color flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div class="font-mono text-xs font-bold text-text-color flex items-center gap-1.5">
              📑 Tự động Tái tạo Mục lục (Auto Rebuild TOC)
            </div>
            <p class="text-[11px] text-text-mute mt-0.5">
              Quét lại toàn bộ các thẻ &lt;h1&gt;, &lt;h2&gt; trong các chương để đồng bộ lại mục lục nav.xhtml và toc.ncx.
            </p>
          </div>
          <button
            type="button"
            class="px-3.5 py-2 bg-panel hover:bg-hover-bg border border-border-color text-accent-color font-mono text-xs font-semibold rounded-xl cursor-pointer transition-colors shrink-0 disabled:opacity-50"
            onclick={handleRebuildToc}
            disabled={isRebuildingToc}
          >
            {isRebuildingToc ? "Đang tạo..." : "🔄 Rebuild TOC"}
          </button>
        </div>
      </div>

      <!-- Footer Buttons -->
      <div class="px-6 py-4 border-t border-border-color bg-sidebar-bg flex justify-end items-center">
        <Button
          variant="primary"
          onclick={handleSave}
          disabled={isSaving || !formMeta.title.trim()}
        >
          {isSaving ? "Đang lưu..." : "💾 Lưu Metadata"}
        </Button>
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
    from { opacity: 0; }
    to { opacity: 1; }
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
