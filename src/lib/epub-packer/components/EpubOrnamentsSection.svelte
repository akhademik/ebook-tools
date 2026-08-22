<script lang="ts">
  import DropZone from "$lib/components/DropZone.svelte";
  import type { EpubSectionBaseProps } from "./epub-components.type";

  let { epubState }: EpubSectionBaseProps = $props();
</script>

<div class="modern-card rounded-2xl p-7 mb-6 animate-fade-in">
  <span
    class="font-mono text-xs tracking-wider text-text-mute uppercase mb-3 block font-semibold"
    >Ảnh trang trí (Ornaments)</span
  >

  <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
    <div class="flex flex-col gap-2">
      <span class="font-mono text-xs text-text-mute uppercase font-semibold">Trang trí chương lớn</span>
      <DropZone
        accept=".png,.jpg,.jpeg,.webp"
        onSelect={(f) => epubState.handleChapterOrnamentFile(f)}
        title="Chọn ảnh trang trí chương"
        subtitle="Chèn trước thẻ H1"
        selectedFile={epubState.chapterOrnamentFile}
      />
      {#if epubState.chapterOrnamentFile}
        <div class="flex justify-end">
          <button
            class="bg-transparent text-red-500 hover:text-red-600 font-mono text-xs py-1.5 px-3 rounded cursor-pointer"
            onclick={() => epubState.removeChapterOrnamentFile()}
            type="button">Xóa ảnh</button
          >
        </div>
      {/if}
    </div>

    <div class="flex flex-col gap-2">
      <span class="font-mono text-xs text-text-mute uppercase font-semibold">Trang trí chương phụ</span>
      <DropZone
        accept=".png,.jpg,.jpeg,.webp"
        onSelect={(f) => epubState.handleSubchapterOrnamentFile(f)}
        title="Chọn ảnh trang trí chương"
        subtitle="Chèn trước thẻ H2"
        selectedFile={epubState.subchapterOrnamentFile}
      />
      {#if epubState.subchapterOrnamentFile}
        <div class="flex justify-end">
          <button
            class="bg-transparent text-red-500 hover:text-red-600 font-mono text-xs py-1.5 px-3 rounded cursor-pointer"
            onclick={() => epubState.removeSubchapterOrnamentFile()}
            type="button">Xóa ảnh</button
          >
        </div>
      {/if}
    </div>
  </div>
</div>
