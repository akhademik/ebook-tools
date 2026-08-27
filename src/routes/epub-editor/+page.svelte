<!-- src/routes/epub-editor/+page.svelte -->
<script lang="ts">
  import PageHeader from "$lib/components/PageHeader.svelte";
  import DropZone from "$lib/components/DropZone.svelte";
  import Button from "$lib/components/Button.svelte";
  import { EpubEditorState } from "$lib/epub-editor/epub-editor-state.svelte";
  import EpubEditorModal from "$lib/epub-editor/components/EpubEditorModal.svelte";
  import EpubCleanerModal from "$lib/epub-editor/components/EpubCleanerModal.svelte";
  import EpubValidatorModal from "$lib/epub-editor/components/EpubValidatorModal.svelte";
  import EpubMetadataModal from "$lib/epub-editor/components/EpubMetadataModal.svelte";

  const editorState = new EpubEditorState();

  let selectedFile = $state<File | null>(null);

  async function handleFileSelected(file: File) {
    selectedFile = file;
    await editorState.loadEpubFile(file);
  }
</script>

<svelte:head>
  <title>EPUB Editor</title>
</svelte:head>

<PageHeader
  title="EPUB Editor"
  description="Xem và tinh chỉnh trực tiếp HTML / CSS bên trong tệp EPUB bất kỳ với Live Preview."
/>

<div class="modern-card rounded-2xl p-7 mb-6 animate-fade-in">
  <span class="font-mono text-xs tracking-wider text-text-mute uppercase mb-3 block">
    Tệp sách điện tử (.epub)
  </span>

  <DropZone
    accept=".epub,application/epub+zip"
    onSelect={handleFileSelected}
    title="Kéo thả hoặc click để chọn tệp .EPUB"
    subtitle="Hỗ trợ mọi file EPUB hợp lệ để xem và sửa HTML/CSS"
    {selectedFile}
  />

  {#if editorState.statusMessage}
    <div
      class="font-mono text-sm mt-4 {editorState.isError
        ? 'text-red-500'
        : 'text-text-mute'}"
    >
      {editorState.statusMessage}
    </div>
  {/if}

  {#if editorState.files.length > 0}
    <div class="mt-6 pt-5 border-t border-border-color flex items-center justify-center gap-3 flex-wrap">
      <button
        type="button"
        class="h-10 px-4 rounded-xl border border-border-color bg-panel hover:bg-hover-bg text-text-color font-mono text-xs font-semibold cursor-pointer transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0"
        onclick={() => {
          editorState.isMetadataModalOpen = true;
        }}
      >
        ⚙️ Thông tin
      </button>

      <button
        type="button"
        class="h-10 px-4 rounded-xl border border-border-color bg-panel hover:bg-blue-500/10 hover:text-blue-400 hover:border-blue-500/30 text-text-color font-mono text-xs font-semibold cursor-pointer transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0"
        onclick={() => {
          editorState.isValidatorModalOpen = true;
        }}
      >
        🛡️ Kiểm định
      </button>

      <button
        type="button"
        class="h-10 px-4 rounded-xl border border-border-color bg-panel hover:bg-emerald-500/10 hover:text-emerald-400 hover:border-emerald-500/30 text-text-color font-mono text-xs font-semibold cursor-pointer transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0"
        onclick={() => {
          editorState.cleanAnalysis = null;
          editorState.cleanReport = null;
          editorState.isCleanerModalOpen = true;
        }}
      >
        🧹 Dọn rác EPUB
      </button>

      <div class="w-full sm:w-auto min-w-44 shrink-0">
        <Button
          onclick={() => (editorState.isModalOpen = true)}
          variant="primary"
        >
          ✏️ Mở trình chỉnh sửa
        </Button>
      </div>
    </div>
  {/if}
</div>

<!-- Modal Fullscreen Editor -->
<EpubEditorModal
  bind:show={editorState.isModalOpen}
  {editorState}
/>

<!-- Modal Cleaner -->
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

<style>
  .animate-fade-in {
    animation: fadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  }
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(6px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
