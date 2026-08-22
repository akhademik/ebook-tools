<script lang="ts">
  import DropZone from "$lib/components/DropZone.svelte";
  import type { EpubState } from "../epub-state.svelte.js";

  let { epubState }: { epubState: EpubState } = $props();
</script>

<div class="modern-card rounded-2xl p-7 mb-6 animate-fade-in">
  <div class="flex items-center justify-between mb-3">
    <span
      class="font-mono text-xs tracking-wider text-text-mute uppercase font-semibold"
      >Ảnh minh họa nội dung (Illustrations)</span
    >
    {#if epubState.illustrationFiles.length > 0}
      <button
        type="button"
        class="bg-transparent text-red-500 hover:text-red-600 font-mono text-xs cursor-pointer"
        onclick={() => epubState.clearIllustrationFiles()}
      >
        Xóa tất cả ({epubState.illustrationFiles.length})
      </button>
    {/if}
  </div>

  <p class="text-xs text-text-mute mb-4">
    Hỗ trợ tải lên 1 hoặc nhiều ảnh (<code>.jpg, .png, .webp, .gif, .svg</code>) hoặc 1 tệp nén <code>.zip</code> chứa các ảnh. Tên file ảnh cần trùng với tên thẻ trong file TXT (Ví dụ: cú pháp <code>[hinh-1]</code> sẽ tự liên kết với file <code>hinh-1.jpg</code> / <code>hinh-1.png</code>).
  </p>

  <DropZone
    accept=".png,.jpg,.jpeg,.webp,.gif,.svg,.zip"
    multiple={true}
    onSelectMultiple={(files) => epubState.handleIllustrationFiles(files)}
    onSelect={(file) => epubState.handleIllustrationFiles(file)}
    title="Chọn ảnh minh họa hoặc file ZIP ảnh"
    subtitle="Kéo thả nhiều ảnh hoặc tệp .zip tại đây"
    selectedCount={epubState.illustrationFiles.length}
  />

  {#if epubState.illustrationFiles.length > 0}
    <div class="mt-4 flex flex-wrap gap-2 max-h-48 overflow-y-auto p-2 bg-brand-bg rounded-xl border border-border-color">
      {#each epubState.illustrationFiles as img, idx (img.fileName + idx)}
        <div class="flex items-center gap-2 bg-panel-2 border border-border-color px-2.5 py-1.5 rounded-lg text-xs font-mono">
          <span class="text-accent-color font-semibold">[{img.name}]</span>
          <span class="text-text-mute text-[11px]">({img.fileName})</span>
          <button
            type="button"
            class="text-red-400 hover:text-red-600 ml-1 cursor-pointer font-bold"
            onclick={() => epubState.removeIllustrationFile(idx)}
            title="Xóa ảnh này"
          >
            ×
          </button>
        </div>
      {/each}
    </div>
  {/if}
</div>
