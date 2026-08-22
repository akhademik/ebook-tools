<!-- src/lib/epub-editor/components/EpubEditorSidebar.svelte -->
<script lang="ts">
  import type { EpubEditorSidebarProps, EpubEditorFileItem } from "$lib/types";

  let { editorState }: EpubEditorSidebarProps = $props();

  let filterTab = $state<"all" | "page" | "style" | "image" | "other">("all");

  const filteredFiles = $derived(
    filterTab === "all"
      ? editorState.files
      : editorState.files.filter((f) => f.category === filterTab),
  );

  const pagesCount = $derived(
    editorState.files.filter((f) => f.category === "page").length,
  );
  const stylesCount = $derived(
    editorState.files.filter((f) => f.category === "style").length,
  );
  const imagesCount = $derived(
    editorState.files.filter((f) => f.category === "image").length,
  );
  const othersCount = $derived(
    editorState.files.filter((f) => f.category === "other").length,
  );

  function getCategoryIcon(cat: string): string {
    switch (cat) {
      case "page":
        return "📄";
      case "style":
        return "🎨";
      case "image":
        return "🖼️";
      default:
        return "⚙️";
    }
  }

  function handleItemClick(item: EpubEditorFileItem) {
    if (item.category === "page" || item.category === "style") {
      editorState.selectFile(item, "single");
    }
  }

  function handleItemDblClick(item: EpubEditorFileItem) {
    if (item.category === "page") {
      editorState.selectFile(item, "double");
    } else if (item.category === "style") {
      editorState.selectFile(item, "single");
    }
  }
</script>

<div class="flex flex-col h-full bg-sidebar-bg border-r border-border-color text-text-color select-none">
  <!-- Sidebar Header -->
  <div class="p-3.5 border-b border-border-color">
    <div class="flex items-center justify-between mb-2">
      <span class="font-mono text-xs font-bold uppercase tracking-wider text-text-mute">
        Cấu trúc tệp ({editorState.files.length})
      </span>
      {#if editorState.dirtyPaths.size > 0}
        <span class="font-mono text-[11px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-500 font-semibold">
          ● {editorState.dirtyPaths.size} đã sửa
        </span>
      {/if}
    </div>

    <!-- Category Filters -->
    <div class="grid grid-cols-5 gap-1 font-mono text-[11px]">
      <button
        type="button"
        class="py-1 px-1 rounded-md text-center transition-colors cursor-pointer {filterTab === 'all'
          ? 'bg-accent-soft text-accent-color font-semibold'
          : 'text-text-mute hover:text-text-color hover:bg-panel'}"
        onclick={() => (filterTab = "all")}
        title="Tất cả file"
      >
        Tất cả
      </button>
      <button
        type="button"
        class="py-1 px-1 rounded-md text-center transition-colors cursor-pointer {filterTab === 'page'
          ? 'bg-accent-soft text-accent-color font-semibold'
          : 'text-text-mute hover:text-text-color hover:bg-panel'}"
        onclick={() => (filterTab = "page")}
        title="Trang nội dung"
      >
        Trang ({pagesCount})
      </button>
      <button
        type="button"
        class="py-1 px-1 rounded-md text-center transition-colors cursor-pointer {filterTab === 'style'
          ? 'bg-accent-soft text-accent-color font-semibold'
          : 'text-text-mute hover:text-text-color hover:bg-panel'}"
        onclick={() => (filterTab = "style")}
        title="CSS Stylesheet"
      >
        CSS ({stylesCount})
      </button>
      <button
        type="button"
        class="py-1 px-1 rounded-md text-center transition-colors cursor-pointer {filterTab === 'image'
          ? 'bg-accent-soft text-accent-color font-semibold'
          : 'text-text-mute hover:text-text-color hover:bg-panel'}"
        onclick={() => (filterTab = "image")}
        title="Hình ảnh"
      >
        Ảnh ({imagesCount})
      </button>
      <button
        type="button"
        class="py-1 px-1 rounded-md text-center transition-colors cursor-pointer {filterTab === 'other'
          ? 'bg-accent-soft text-accent-color font-semibold'
          : 'text-text-mute hover:text-text-color hover:bg-panel'}"
        onclick={() => (filterTab = "other")}
        title="Khác"
      >
        Khác ({othersCount})
      </button>
    </div>
  </div>

  <!-- Instruction tip -->
  <div class="px-3.5 py-2 bg-panel-2/50 border-b border-border-color text-[11px] text-text-mute font-mono flex items-center justify-between">
    <span>💡 Click: Sửa code | Double-click: Xem trước</span>
  </div>

  <!-- File List -->
  <div class="flex-1 overflow-y-auto p-2 space-y-0.5">
    {#if filteredFiles.length === 0}
      <div class="p-6 text-center text-xs font-mono text-text-mute">
        Không có tệp nào trong mục này.
      </div>
    {:else}
      {#each filteredFiles as file (file.path)}
        {@const isEditorActive = editorState.editorTarget === file.path}
        {@const isPreviewActive = editorState.previewTarget === file.path}
        {@const isDirty = editorState.dirtyPaths.has(file.path)}
        {@const isInteractive = file.category === "page" || file.category === "style"}

        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div
          class="group flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-mono transition-all {isInteractive
            ? 'cursor-pointer'
            : 'opacity-50 cursor-default'} {isEditorActive
            ? 'bg-accent-color/15 text-accent-color border border-accent-color/30 font-semibold'
            : isInteractive
              ? 'hover:bg-panel border border-transparent text-text-color'
              : 'border border-transparent text-text-mute'}"
          onclick={() => handleItemClick(file)}
          ondblclick={() => handleItemDblClick(file)}
          title="{file.path} ({file.category})"
        >
          <div class="flex items-center gap-2 min-w-0 flex-1 mr-2">
            <span class="text-sm shrink-0">{getCategoryIcon(file.category)}</span>
            <span class="truncate">{file.name}</span>
            {#if file.path.includes("/")}
              <span class="text-[10px] text-text-mute truncate opacity-60">
                {file.path.substring(0, file.path.lastIndexOf("/"))}
              </span>
            {/if}
          </div>

          <div class="flex items-center gap-1.5 shrink-0">
            {#if isDirty}
              <span class="text-amber-500 font-bold" title="Đã chỉnh sửa">●</span>
            {/if}

            {#if isPreviewActive}
              <span
                class="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-400 font-bold flex items-center gap-1"
                title="Đang render trong Preview"
              >
                👁️ Preview
              </span>
            {/if}

            {#if isEditorActive}
              <span
                class="px-1.5 py-0.5 rounded text-[10px] bg-accent-soft text-accent-color font-bold"
                title="Đang mở trong Code Editor"
              >
                Edit
              </span>
            {/if}
          </div>
        </div>
      {/each}
    {/if}
  </div>
</div>
