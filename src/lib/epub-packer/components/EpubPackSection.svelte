<script>
  import Input from "$lib/components/Input.svelte";
  import Button from "$lib/components/Button.svelte";

  let { epubState, onDownload } = $props();
</script>

<div class="modern-card rounded-2xl p-7 mb-6 animate-fade-in">
  <div class="mb-5">
    <Input
      bind:value={epubState.epubOutName}
      label="Tên file EPUB"
      placeholder="ten-sach"
    />
    <p class="text-sm text-text-mute mt-2">
      File tải về: <span class="text-text-color font-mono"
        >{epubState.epubOutNamePreview}</span
      >
    </p>
  </div>

  <div class="flex items-center justify-center gap-4 mt-6 flex-wrap md:flex-nowrap">
    <div
      class="w-full md:w-auto md:flex-1 max-w-55 min-w-42.5 shrink-0"
    >
      <Button
        onclick={() => epubState.processEpub()}
        disabled={epubState.epubChapters.length === 0 || epubState.processing}
        variant="primary"
      >
        {epubState.processing ? "Đang đóng gói..." : "Đóng gói file EPUB"}
      </Button>
    </div>
    <div
      class="w-full md:w-auto md:flex-1 max-w-55 min-w-42.5 shrink-0"
    >
      <Button
        onclick={() => onDownload()}
        disabled={!epubState.epubBlob}
        variant="secondary"
      >
        Tải file .EPUB
      </Button>
    </div>
  </div>

  {#if epubState.status}
    <div
      class="font-mono text-sm mt-4 {epubState.isError
        ? 'text-red-500'
        : 'text-text-mute'}"
    >
      {epubState.status}
    </div>
  {/if}
</div>
