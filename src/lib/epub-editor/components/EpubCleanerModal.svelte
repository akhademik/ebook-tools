<!-- src/lib/epub-editor/components/EpubCleanerModal.svelte -->
<script lang="ts">
  import Button from "$lib/components/Button.svelte";
  import type { EpubEditorState } from "../epub-editor-state.svelte";
  import { formatByteSize, type EpubCleanOptions } from "../epub-cleaner";

  interface Props {
    show?: boolean;
    editorState: EpubEditorState;
  }

  let { show = $bindable(false), editorState }: Props = $props();

  let removeImages = $state(true);
  let removeFonts = $state(true);
  let removeStyles = $state(true);
  let isAnalyzing = $state(false);
  let isOptimizing = $state(false);

  $effect(() => {
    if (show && editorState.zip && !editorState.cleanAnalysis && !editorState.cleanReport) {
      runAnalysis();
    }
  });

  async function runAnalysis() {
    isAnalyzing = true;
    try {
      await editorState.analyzeForClean();
    } finally {
      isAnalyzing = false;
    }
  }

  async function handleOptimize() {
    isOptimizing = true;
    try {
      const options: EpubCleanOptions = {
        removeUnusedImages: removeImages,
        removeUnusedFonts: removeFonts,
        removeUnusedStyles: removeStyles,
        cleanOpfManifest: true,
      };
      await editorState.runCleanup(options);
    } finally {
      isOptimizing = false;
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
      class="bg-panel border border-border-color w-full max-w-xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-slide-up"
    >
      <!-- Header -->
      <div class="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-border-color flex justify-between items-center bg-sidebar-bg">
        <div class="flex items-center gap-2 sm:gap-2.5 min-w-0">
          <span class="text-xl shrink-0">🧹</span>
          <div class="min-w-0">
            <h3 class="font-mono text-sm sm:text-base font-bold text-text-color truncate">
              Dọn rác & Tối ưu EPUB
            </h3>
            <p class="text-xs text-text-mute font-mono truncate hidden sm:block">
              Quét và loại bỏ font, hình ảnh, CSS thừa không được sử dụng
            </p>
          </div>
        </div>
        <button
          type="button"
          class="w-8 h-8 rounded-lg border border-border-color bg-panel hover:bg-hover-bg text-text-mute hover:text-text-color flex items-center justify-center font-mono cursor-pointer transition-colors shrink-0"
          onclick={handleClose}
          aria-label="Đóng modal"
        >
          ✕
        </button>
      </div>

      <!-- Body Content -->
      <div class="p-6 overflow-y-auto space-y-5">
        {#if isAnalyzing}
          <div class="py-12 flex flex-col items-center justify-center text-center">
            <div class="w-8 h-8 border-2 border-accent-color border-t-transparent rounded-full animate-spin mb-3"></div>
            <p class="font-mono text-sm text-text-color">Đang phân tích cấu trúc EPUB & quét tài nguyên thừa...</p>
          </div>
        {:else if editorState.cleanReport}
          <!-- Success Cleaning Report -->
          <div class="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-5 text-center">
            <div class="text-3xl mb-2">🎉</div>
            <h4 class="font-mono text-base font-bold text-emerald-400">
              Dọn dẹp thành công!
            </h4>
            <p class="text-xs text-text-mute font-mono mt-1">
              Đã tối ưu hóa và cập nhật lại tệp EPUB
            </p>

            <div class="grid grid-cols-3 gap-3 my-4">
              <div class="bg-panel/80 rounded-lg p-3 border border-border-color">
                <span class="text-xs text-text-mute block font-mono">Trước</span>
                <span class="font-mono text-sm font-bold text-text-color">
                  {formatByteSize(editorState.cleanReport.beforeBytes)}
                </span>
              </div>
              <div class="bg-panel/80 rounded-lg p-3 border border-border-color">
                <span class="text-xs text-text-mute block font-mono">Sau</span>
                <span class="font-mono text-sm font-bold text-emerald-400">
                  {formatByteSize(editorState.cleanReport.afterBytes)}
                </span>
              </div>
              <div class="bg-emerald-500/20 rounded-lg p-3 border border-emerald-500/40">
                <span class="text-xs text-emerald-300 block font-mono">Tiết kiệm</span>
                <span class="font-mono text-sm font-bold text-emerald-400">
                  -{formatByteSize(editorState.cleanReport.savedBytes)}
                </span>
              </div>
            </div>

            <div class="text-left text-xs font-mono space-y-1 text-text-mute bg-panel/60 p-3 rounded-lg border border-border-color">
              <div>• Ảnh đã xóa: <span class="text-text-color font-semibold">{editorState.cleanReport.removedImages.length}</span></div>
              <div>• Font đã xóa: <span class="text-text-color font-semibold">{editorState.cleanReport.removedFonts.length}</span></div>
              <div>• CSS đã xóa: <span class="text-text-color font-semibold">{editorState.cleanReport.removedStyles.length}</span></div>
              <div>• Mục Manifest đã cập nhật: <span class="text-text-color font-semibold">{editorState.cleanReport.removedManifestEntries.length}</span></div>
            </div>
          </div>
        {:else if editorState.cleanAnalysis}
          {@const a = editorState.cleanAnalysis}
          <!-- Analysis Stats -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div class="bg-sidebar-bg rounded-xl p-3 border border-border-color text-center">
              <span class="text-xs text-text-mute block font-mono">Tổng dung lượng</span>
              <span class="font-mono text-sm font-bold text-text-color">{formatByteSize(a.totalBytes)}</span>
            </div>
            <div class="bg-sidebar-bg rounded-xl p-3 border border-border-color text-center">
              <span class="text-xs text-text-mute block font-mono">Ảnh không dùng</span>
              <span class="font-mono text-sm font-bold {a.unusedImages.length > 0 ? 'text-amber-400' : 'text-text-color'}">
                {a.unusedImages.length}
              </span>
            </div>
            <div class="bg-sidebar-bg rounded-xl p-3 border border-border-color text-center">
              <span class="text-xs text-text-mute block font-mono">Font không dùng</span>
              <span class="font-mono text-sm font-bold {a.unusedFonts.length > 0 ? 'text-amber-400' : 'text-text-color'}">
                {a.unusedFonts.length}
              </span>
            </div>
            <div class="bg-sidebar-bg rounded-xl p-3 border border-border-color text-center">
              <span class="text-xs text-text-mute block font-mono">Có thể giảm</span>
              <span class="font-mono text-sm font-bold text-emerald-400">
                ~{formatByteSize(a.estimatedSavingsBytes)}
              </span>
            </div>
          </div>

          <!-- Options -->
          <div class="space-y-3 bg-sidebar-bg p-4 rounded-xl border border-border-color">
            <span class="font-mono text-xs text-text-mute uppercase block font-semibold">Tùy chọn dọn dẹp</span>

            <label class="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                bind:checked={removeImages}
                class="mt-1 w-4 h-4 rounded-md border-border-color text-accent-color focus:ring-0 cursor-pointer"
              />
              <div>
                <div class="font-mono text-xs font-semibold text-text-color flex items-center gap-1.5">
                  🖼️ Xóa hình ảnh không dùng
                  {#if a.unusedImages.length > 0}
                    <span class="px-1.5 py-0.2 bg-amber-500/20 text-amber-400 text-[10px] rounded">
                      {a.unusedImages.length} tệp (~{formatByteSize(a.unusedImages.reduce((s, i) => s + i.byteSize, 0))})
                    </span>
                  {/if}
                </div>
                <p class="text-[11px] text-text-mute mt-0.5">
                  Xóa các tệp ảnh không được trang nào tham chiếu (ngoại trừ ảnh bìa cover).
                </p>
              </div>
            </label>

            <label class="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                bind:checked={removeFonts}
                class="mt-1 w-4 h-4 rounded-md border-border-color text-accent-color focus:ring-0 cursor-pointer"
              />
              <div>
                <div class="font-mono text-xs font-semibold text-text-color flex items-center gap-1.5">
                  🔤 Xóa fonts nhúng không dùng
                  {#if a.unusedFonts.length > 0}
                    <span class="px-1.5 py-0.2 bg-amber-500/20 text-amber-400 text-[10px] rounded">
                      {a.unusedFonts.length} tệp (~{formatByteSize(a.unusedFonts.reduce((s, f) => s + f.byteSize, 0))})
                    </span>
                  {/if}
                </div>
                <p class="text-[11px] text-text-mute mt-0.5">
                  Xóa các font chữ nhúng không được khai báo trong CSS của các chương.
                </p>
              </div>
            </label>

            <label class="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                bind:checked={removeStyles}
                class="mt-1 w-4 h-4 rounded-md border-border-color text-accent-color focus:ring-0 cursor-pointer"
              />
              <div>
                <div class="font-mono text-xs font-semibold text-text-color flex items-center gap-1.5">
                  🎨 Xóa file CSS mồ côi
                  {#if a.unusedStyles.length > 0}
                    <span class="px-1.5 py-0.2 bg-amber-500/20 text-amber-400 text-[10px] rounded">
                      {a.unusedStyles.length} tệp
                    </span>
                  {/if}
                </div>
                <p class="text-[11px] text-text-mute mt-0.5">
                  Xóa các file .css không được bất kỳ trang HTML/XHTML nào link tới.
                </p>
              </div>
            </label>
          </div>

          {#if a.missingReferences.length > 0}
            <div class="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 text-xs font-mono">
              <div class="text-amber-400 font-semibold mb-1">⚠️ Phát hiện {a.missingReferences.length} liên kết hỏng trong sách:</div>
              <div class="max-h-24 overflow-y-auto space-y-1 text-text-mute">
                {#each a.missingReferences.slice(0, 5) as ref (ref.sourceFile + '-' + ref.targetRef)}
                  <div>• {ref.sourceFile} ➔ <span class="text-amber-300">{ref.targetRef}</span> (không tìm thấy)</div>
                {/each}
              </div>
            </div>
          {/if}
        {/if}
      </div>

      <!-- Footer Buttons -->
      <div class="px-6 py-4 border-t border-border-color bg-sidebar-bg flex justify-end items-center">
        {#if editorState.cleanReport}
          <Button variant="primary" onclick={handleClose}>
            Hoàn tất
          </Button>
        {:else}
          <Button
            variant="primary"
            onclick={handleOptimize}
            disabled={isAnalyzing || isOptimizing || (editorState.cleanAnalysis?.estimatedSavingsBytes === 0 && editorState.cleanAnalysis?.unusedImages.length === 0 && editorState.cleanAnalysis?.unusedFonts.length === 0 && editorState.cleanAnalysis?.unusedStyles.length === 0)}
          >
            {isOptimizing ? "Đang tối ưu hóa..." : "🧹 Dọn dẹp & Tối ưu ngay"}
          </Button>
        {/if}
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
