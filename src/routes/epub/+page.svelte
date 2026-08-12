<script>
  import PageHeader from "$lib/components/PageHeader.svelte";
  import DropZone from "$lib/components/DropZone.svelte";
  import Input from "$lib/components/Input.svelte";
  import Button from "$lib/components/Button.svelte";
  import { EpubState } from "$lib/epub-packer/epub-state.svelte.js";
  import { triggerDownload } from "$lib/helpers/helpers.js";
  import { JACKET_TEMPLATES } from "$lib/epub-packer/jacket-templates.js";
  import akashiUrl from "../../assets/fonts/UTM_Akashi.ttf";
  import polliwogUrl from "../../assets/fonts/Polliwog-Regular.otf";
  import charlotteUrl from "../../assets/fonts/UTM_Charlotte.ttf";

  const epubState = new EpubState();

  let showJacketModal = $state(false);
  let showSyntaxModal = $state(false);
  let currentPreviewTemplateIdx = $state(0);

  function downloadEpub() {
    console.log(
      "[+page.svelte] downloadEpub button clicked. epubBlob:",
      epubState.epubBlob,
      "name:",
      epubState.epubOutNamePreview,
    );
    if (epubState.epubBlob) {
      triggerDownload(epubState.epubBlob, epubState.epubOutNamePreview);
    } else {
      console.warn(
        "[+page.svelte] epubState.epubBlob is empty, cannot download.",
      );
    }
  }

  function openJacketPreviewModal() {
    const idx = JACKET_TEMPLATES.findIndex(
      (t) => t.id === epubState.jacketTemplateId,
    );
    currentPreviewTemplateIdx = idx !== -1 ? idx : 0;
    showJacketModal = true;
  }

  function nextTemplate() {
    currentPreviewTemplateIdx =
      (currentPreviewTemplateIdx + 1) % JACKET_TEMPLATES.length;
  }

  function prevTemplate() {
    currentPreviewTemplateIdx =
      (currentPreviewTemplateIdx - 1 + JACKET_TEMPLATES.length) %
      JACKET_TEMPLATES.length;
  }

  function selectTemplate() {
    epubState.jacketTemplateId = JACKET_TEMPLATES[currentPreviewTemplateIdx].id;
    showJacketModal = false;
  }

  const selectedTemplateName = $derived(
    JACKET_TEMPLATES.find((t) => t.id === epubState.jacketTemplateId)?.name ||
      "",
  );
</script>

<svelte:head>
  <title>Đóng gói EPUB — Ebook Forge</title>
  <!-- eslint-disable-next-line svelte/no-at-html-tags -->
  {@html `
  <style>
    @font-face {
      font-family: "Akashi";
      src: url("${akashiUrl}");
    }
    @font-face {
      font-family: "Polliwog";
      src: url("${polliwogUrl}");
    }
    @font-face {
      font-family: "Charlotte";
      src: url("${charlotteUrl}");
    }
  </style>
  `}
  <style>
    .preview-wrap {
      background: #ffffff;
      margin: 1.5em auto;
      width: 380px;
      height: 540px;
      border: 1px solid #cccccc;
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
      border-radius: 4px;
      color: #000000;
      box-sizing: border-box;
      overflow: hidden;
      position: relative;
      text-align: left;
    }

    .preview-wrap p {
      margin: 0 !important;
      padding: 0 !important;
      font-size: 1em;
      line-height: normal;
      text-indent: 0 !important;
      text-align: inherit !important;
    }

    .preview-wrap hr {
      margin: 0;
      padding: 0;
      opacity: 1;
      background-color: transparent;
    }
  </style>
</svelte:head>

<PageHeader
  title="Đóng gói EPUB"
  description="Up .ZIP chứa files MD hoặc up .TXT"
/>

<div class="modern-card rounded-2xl p-7 mb-6">
  <span
    class="font-mono text-xs tracking-wider text-text-mute uppercase mb-3 block"
    >Chọn file nguồn (.ZIP hoặc .TXT)</span
  >
  <DropZone
    accept=".zip,.txt,application/zip,text/plain"
    onSelect={(f) => epubState.handleFile(f)}
    title="Kéo thả hoặc click để chọn file"
    subtitle="Chỉ hỗ trợ file .ZIP chứa các chương (.md) hoặc file .TXT"
    selectedFile={epubState.epubFileSelected}
  />

  <!-- Custom Syntax Config for TXT -->
  <div
    class="mt-5 bg-panel-2 p-4 rounded-xl border border-border-color flex justify-between items-center gap-4"
  >
    <span
      class="font-mono text-xs font-semibold text-text-color uppercase tracking-wider"
      >Bảng quy ước</span
    >
    <button
      type="button"
      class="bg-brand-bg border border-border-color hover:border-text-color text-text-color font-mono text-xs font-semibold py-1.5 px-3 rounded-lg active:scale-[0.98] transition-all cursor-pointer"
      onclick={() => (showSyntaxModal = true)}
    >
      Xem bảng quy ước
    </button>
  </div>

  {#if epubState.fileType === "txt" && epubState.rawTxtText}
    <div
      class="mt-5 bg-panel-2 p-5 rounded-xl border border-border-color flex flex-col gap-4 animate-fade-in"
    >
      <div class="flex justify-between items-center">
        <span
          class="font-mono text-xs font-semibold text-text-color uppercase tracking-wider"
          >Quy ước riêng</span
        >
        <button
          type="button"
          class="bg-accent-color text-white font-mono text-xs font-semibold py-1.5 px-3 rounded-lg hover:bg-accent-hover active:scale-[0.98] transition-all cursor-pointer"
          onclick={() => epubState.addCustomDefinition()}
        >
          + Thêm quy ước
        </button>
      </div>

      {#if epubState.customDefinitions.length === 0}
        <p class="text-xs text-text-mute font-mono italic">
          Chưa có quy ước riêng nào.
        </p>
      {:else}
        <div class="flex flex-col gap-3">
          {#each epubState.customDefinitions as def, idx (idx)}
            <div
              class="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-3 items-end bg-brand-bg p-3.5 rounded-lg border border-border-color animate-fade-in"
            >
              <div>
                <Input
                  bind:value={def.pattern}
                  oninput={() => epubState.applyTxtGrouping()}
                  label="Ký hiệu (Pattern)"
                  placeholder="Ví dụ: $$$"
                />
              </div>
              <div>
                <Input
                  bind:value={def.tag}
                  oninput={() => epubState.applyTxtGrouping()}
                  label="Thẻ HTML thay thế"
                  placeholder="Ví dụ: &lt;span class=&quot;xya&quot;&gt;"
                />
              </div>
              <div>
                <button
                  type="button"
                  class="w-full sm:w-auto px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-mono text-xs font-semibold rounded-xl border border-red-500/20 active:scale-[0.98] transition-all cursor-pointer h-[42px] flex items-center justify-center font-mono"
                  onclick={() => epubState.removeCustomDefinition(idx)}
                >
                  Xóa
                </button>
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  {:else if epubState.epubRawFiles.length > 0}
    <div class="mt-5 animate-fade-in">
      <Input
        bind:value={epubState.mergePattern}
        oninput={() => epubState.applyGrouping()}
        label="Từ khóa nhận diện tiêu đề chương mới"
        placeholder="Ví dụ: chương — để trống nếu mỗi tệp là 1 chương"
      />
    </div>

    <div class="flex items-center gap-3 mt-5">
      <input
        type="checkbox"
        id="epub-heuristic-mode"
        bind:checked={epubState.heuristicMode}
        onchange={() => epubState.applyGrouping()}
        class="w-4 h-4 accent-accent-color cursor-pointer"
      />
      <div>
        <label
          for="epub-heuristic-mode"
          class="text-sm text-text-color cursor-pointer font-medium"
          >Nhận diện bằng Heuristic thông minh</label
        >
        <span class="block text-xs text-text-mute mt-0.5"
          >Tính điểm tiêu đề dựa trên chữ viết HOA, độ dài và dấu câu</span
        >
      </div>
    </div>

    <div class="flex items-center gap-3 mt-4">
      <input
        type="checkbox"
        id="epub-ignore-markdown-format"
        bind:checked={epubState.ignoreMarkdownFormat}
        onchange={() => epubState.applyGrouping()}
        class="w-4 h-4 accent-accent-color cursor-pointer"
      />
      <div>
        <label
          for="epub-ignore-markdown-format"
          class="text-sm text-text-color cursor-pointer font-medium"
          >Bỏ qua định dạng Markdown</label
        >
        <span class="block text-xs text-text-mute mt-0.5"
          >Giữ nguyên các ký tự định dạng như **, *, _ trong nội dung hiển thị</span
        >
      </div>
    </div>

    {#if epubState.heuristicMode}
      <div
        class="flex items-center gap-3 mt-4 flex-wrap animate-fade-in bg-panel-2 p-4 rounded-xl border border-border-color"
      >
        <div class="flex items-center gap-3 w-full flex-wrap">
          <span class="font-mono text-sm text-text-mute"
            >Giới hạn Heuristic từ trang</span
          >
          <input
            type="number"
            bind:value={epubState.heuristicStart}
            oninput={() => epubState.applyGrouping()}
            class="bg-brand-bg border border-border-color text-text-color font-mono text-sm py-1.5 px-3 rounded-xl w-20 text-center outline-none focus:border-accent-color"
            min="1"
            placeholder="Đầu"
          />
          <span class="font-mono text-sm text-text-mute">đến trang</span>
          <input
            type="number"
            bind:value={epubState.heuristicEnd}
            oninput={() => epubState.applyGrouping()}
            class="bg-brand-bg border border-border-color text-text-color font-mono text-sm py-1.5 px-3 rounded-xl w-20 text-center outline-none focus:border-accent-color"
            min="1"
            placeholder="Cuối"
          />
        </div>
        <div
          class="flex items-center gap-3 w-full mt-4 flex-wrap border-t border-border-color pt-4"
        >
          <span class="font-mono text-sm text-text-mute"
            >Ngưỡng điểm (Threshold):</span
          >
          <input
            type="range"
            min="1"
            max="10"
            step="1"
            bind:value={epubState.heuristicThreshold}
            oninput={() => epubState.applyGrouping()}
            class="h-1.5 bg-brand-bg rounded-lg appearance-none cursor-pointer accent-accent-color w-40"
          />
          <span
            class="font-mono text-sm font-semibold text-accent-color w-8 text-center"
            >{epubState.heuristicThreshold}</span
          >
          <p class="text-xs text-text-mute w-full mt-1.5 leading-relaxed">
            Giảm ngưỡng để bắt nhiều tiêu đề hơn (cho sách quét OCR xấu). Tăng
            ngưỡng để tránh nhận diện nhầm đoạn văn thường thành chương.
          </p>
        </div>
      </div>
    {/if}

    <div
      class="mt-5 bg-panel-2 p-4 rounded-xl border border-border-color flex flex-col gap-3"
    >
      <div>
        <span class="font-mono text-xs text-text-mute uppercase mb-1.5 block"
          >Lọc Header/Footer (Tùy chọn)</span
        >
        <input
          type="text"
          bind:value={epubState.cleanKeywords}
          oninput={() => epubState.applyGrouping()}
          class="w-full bg-brand-bg border border-border-color text-text-color font-mono text-sm py-2.5 px-3.5 rounded-xl outline-none focus:border-accent-color"
          placeholder="Tên sách, Nhà xuất bản"
        />
      </div>
      <div
        class="flex items-center gap-3 mt-1.5 flex-wrap border-t border-border-color pt-3"
      >
        <span class="font-mono text-sm text-text-mute"
          >Số dòng quét đầu/cuối trang:</span
        >
        <input
          type="range"
          min="1"
          max="5"
          step="1"
          bind:value={epubState.cleanLineLimit}
          oninput={() => epubState.applyGrouping()}
          class="h-1.5 bg-brand-bg rounded-lg appearance-none cursor-pointer accent-accent-color w-32"
        />
        <span
          class="font-mono text-sm font-semibold text-accent-color w-6 text-center"
          >{epubState.cleanLineLimit}</span
        >
        <p class="text-xs text-text-mute w-full leading-relaxed mt-1">
          Chỉ quét các file có từ 6 dòng trở lên. Tự động bỏ qua lọc nếu dòng
          đầu hoặc cuối là đoạn văn đầy đủ (để tránh mất nội dung truyện).
        </p>
      </div>
    </div>
  {/if}

  {#if epubState.epubChapters.length > 0}
    <!-- Tab Navigation -->
    <div class="flex border-b border-border-color mt-6 font-mono text-xs">
      <button
        type="button"
        class="py-2.5 px-4 font-semibold transition-colors border-b-2 cursor-pointer {epubState.activeTab ===
        'toc'
          ? 'border-accent-color text-accent-color'
          : 'border-transparent text-text-mute hover:text-text-color'}"
        onclick={() => {
          epubState.activeTab = "toc";
        }}>Đầu mục tìm thấy: ({epubState.epubChapters.length} chương)</button
      >

      {#if epubState.fileType === "zip"}
        <button
          type="button"
          class="py-2.5 px-4 font-semibold transition-colors border-b-2 cursor-pointer relative {epubState.activeTab ===
          'diff'
            ? 'border-accent-color text-accent-color'
            : 'border-transparent text-text-mute hover:text-text-color'}"
          onclick={() => {
            epubState.activeTab = "diff";
          }}
        >
          Lọc Header/Footer ({epubState.cleanedLinesReport.length})
        </button>
      {/if}
    </div>

    <!-- Tab Contents -->
    {#if epubState.activeTab === "toc"}
      <div
        class="mt-5 border border-border-color rounded-xl max-h-[300px] overflow-y-auto bg-brand-bg p-4 font-mono text-sm divide-y divide-border-color animate-fade-in"
      >
        {#each epubState.epubChapters as chap (chap.fileName)}
          <div class="py-3 first:pt-0 last:pb-0 flex flex-col gap-1.5">
            <div class="flex justify-between items-start gap-4">
              <span class="font-semibold text-text-color">
                {#if chap.isChapter}
                  {chap.chapterIndex}: {chap.title}
                {:else}
                  {chap.title}
                {/if}
              </span>
              <span class="text-text-mute text-xs shrink-0"
                >{chap.fileName}.xhtml</span
              >
            </div>
            <div
              class="text-[11px] text-text-mute flex flex-wrap gap-x-2 gap-y-0.5"
            >
              <span class="text-accent-color font-semibold">Nguồn:</span>
              {#each chap.sources as src, sIdx (sIdx)}
                <span>{src}</span>
              {/each}
            </div>
          </div>
        {/each}
      </div>
    {:else if epubState.activeTab === "diff" && epubState.fileType === "zip"}
      <div
        class="mt-5 flex flex-col gap-4 animate-fade-in max-h-[400px] overflow-y-auto bg-brand-bg p-4 rounded-xl border border-border-color"
      >
        {#if epubState.cleanedLinesReport.length === 0}
          <p class="text-sm text-text-mute font-mono text-center py-6">
            Không phát hiện Header/Footer nào khớp bộ lọc.
          </p>
        {:else}
          {#each epubState.cleanedLinesReport.slice(0, epubState.visibleCleanedCount) as reportItem (reportItem.fileName)}
            <div
              class="p-4 rounded-xl bg-panel-2 border border-border-color flex flex-col gap-2 shrink-0"
            >
              <span
                class="font-mono text-xs font-semibold text-text-color border-b border-border-color pb-1.5"
                >{reportItem.fileName}.md</span
              >
              <div class="flex flex-col gap-1.5">
                {#each reportItem.scanned as scan, scIdx (scIdx)}
                  <div class="flex items-start gap-3 text-xs font-mono">
                    <span
                      class="text-[10px] px-1.5 py-0.5 rounded-sm shrink-0 {scan.location ===
                      'Đầu file'
                        ? 'bg-accent-soft text-accent-color'
                        : 'bg-amber-soft text-amber-color'}"
                      >{scan.location} (Dòng {scan.lineNum})</span
                    >
                    <span
                      class="flex-1 break-all {scan.isRemoved
                        ? 'line-through text-red-500 opacity-60'
                        : 'text-green-500'}">{scan.text}</span
                    >
                    <span
                      class="shrink-0 text-[10px] font-semibold {scan.isRemoved
                        ? 'text-red-500'
                        : 'text-green-500'}"
                      >{scan.isRemoved ? "Sẽ xóa" : "Giữ lại"}</span
                    >
                  </div>
                {/each}
              </div>
            </div>
          {/each}

          {#if epubState.visibleCleanedCount < epubState.cleanedLinesReport.length}
            <button
              type="button"
              class="w-full py-2.5 bg-panel-2 border border-border-color rounded-xl text-xs font-semibold text-amber-color hover:border-amber-color cursor-pointer transition-colors"
              onclick={() => {
                epubState.visibleCleanedCount += 20;
              }}
              >Xem thêm ({epubState.cleanedLinesReport.length -
                epubState.visibleCleanedCount} trang ẩn)</button
            >
          {/if}
        {/if}
      </div>
    {/if}
  {/if}

  {#if epubState.parseStatus}
    <div
      class="font-mono text-sm mt-3 {epubState.parseIsError
        ? 'text-red-500'
        : 'text-text-mute'}"
    >
      {epubState.parseStatus}
    </div>
  {/if}
</div>

{#if epubState.epubChapters.length > 0}
  <div class="modern-card rounded-2xl p-7 mb-6 animate-fade-in">
    <span
      class="font-mono text-xs tracking-wider text-text-mute uppercase mb-3 block"
      >Metadata & Trang giới thiệu</span
    >
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
      <div>
        <Input
          bind:value={epubState.title}
          label="Tác phẩm"
          placeholder="Mật Mã Da Vinci"
        />
      </div>
      <div>
        <Input
          bind:value={epubState.author}
          label="Tác giả"
          placeholder="Dan Brown"
        />
      </div>
      <div>
        <Input
          bind:value={epubState.originalTitle}
          label="Tựa gốc (Nguyên tác)"
          placeholder="The Da Vinci Code"
        />
      </div>
      <div>
        <Input
          bind:value={epubState.translator}
          label="Dịch giả"
          placeholder="Đỗ Thu Hà"
        />
      </div>
      <div>
        <Input
          bind:value={epubState.publisher}
          label="Nhà phát hành"
          placeholder="1980 Books"
        />
      </div>
      <div>
        <Input
          bind:value={epubState.distributor}
          label="Nhà xuất bản"
          placeholder="NXB Văn hóa Thông tin"
        />
      </div>
      <div>
        <label
          for="jacket-font-select"
          class="font-mono text-xs text-text-mute uppercase mb-2.5 block font-semibold"
          >Phông chữ trang giới thiệu (Jacket Font)</label
        >
        <select
          id="jacket-font-select"
          bind:value={epubState.jacketFont}
          class="w-full bg-brand-bg text-text-color border border-border-color focus:border-accent-color rounded-xl py-2.5 px-3.5 font-sans text-sm focus:outline-none transition-colors h-[46px]"
        >
          <option value="default">Mặc định (Không dùng font)</option>
          <option value="Akashi">Akashi</option>
          <option value="Polliwog">Polliwog</option>
          <option value="Charlotte">Charlotte</option>
        </select>
      </div>
    </div>

    <div
      class="mt-6 pt-5 border-t border-border-color flex flex-col sm:flex-row sm:items-center justify-between gap-4"
    >
      <div>
        <p
          class="font-mono text-xs text-text-mute uppercase tracking-wider font-semibold"
        >
          Trang giới thiệu sách (Mặc định được tạo)
        </p>
        {#if selectedTemplateName}
          <p class="text-xs text-text-mute font-mono mt-1">
            Mẫu đang chọn: <span class="text-accent-color font-semibold"
              >{selectedTemplateName}</span
            >
          </p>
        {/if}
      </div>
      <div>
        <button
          type="button"
          class="w-full sm:w-auto bg-accent-color text-white font-mono text-xs font-semibold py-2.5 px-5 rounded-xl hover:bg-accent-hover active:scale-[0.98] transition-all cursor-pointer h-[42px] flex items-center justify-center gap-2"
          onclick={() => openJacketPreviewModal()}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="2"
            stroke="currentColor"
            class="w-4 h-4"
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
          Xem trước
        </button>
      </div>
    </div>
  </div>

  <!-- Cover Section -->
  <div class="modern-card rounded-2xl p-7 mb-6 animate-fade-in">
    <span
      class="font-mono text-xs tracking-wider text-text-mute uppercase mb-3 block"
      >Ảnh bìa sách (Book Cover)</span
    >

    <DropZone
      accept=".pdf,.png,.jpg,.jpeg,.webp"
      onSelect={(f) => epubState.handleCoverFile(f)}
      title="Kéo thả hoặc click để chọn ảnh bìa (PDF, PNG, JPG...)"
      subtitle="Ảnh bìa sẽ được tự động co dãn, tối ưu dung lượng và chèn trước trang giới thiệu"
      selectedFile={epubState.coverFile}
    />

    {#if epubState.coverOriginalUrl}
      <div class="mt-5 pt-5 border-t border-border-color animate-fade-in">
        <div
          class="relative max-w-[280px] mx-auto bg-panel-2 border border-border-color rounded-xl overflow-hidden shadow-md"
        >
          <img
            src={epubState.coverOriginalUrl}
            class="w-full block"
            alt="Xem trước ảnh bìa"
          />
          <div
            class="absolute top-0 left-0 right-0 bg-red-500/40 border-b border-dashed border-red-500 pointer-events-none"
            style="height: {epubState.coverHeight > 0
              ? Math.min(
                  100,
                  (epubState.coverCropTop / epubState.coverHeight) * 100,
                )
              : 0}%"
          ></div>
          <div
            class="absolute bottom-0 left-0 right-0 bg-red-500/40 border-t border-dashed border-red-500 pointer-events-none"
            style="height: {epubState.coverHeight > 0
              ? Math.min(
                  100,
                  (epubState.coverCropBottom / epubState.coverHeight) * 100,
                )
              : 0}%"
          ></div>
          <div
            class="absolute top-0 bottom-0 left-0 bg-red-500/40 border-r border-dashed border-red-500 pointer-events-none"
            style="width: {epubState.coverWidth > 0
              ? Math.min(
                  100,
                  (epubState.coverCropLeft / epubState.coverWidth) * 100,
                )
              : 0}%; top: {epubState.coverHeight > 0
              ? (epubState.coverCropTop / epubState.coverHeight) * 100
              : 0}%; bottom: {epubState.coverHeight > 0
              ? (epubState.coverCropBottom / epubState.coverHeight) * 100
              : 0}%"
          ></div>
          <div
            class="absolute top-0 bottom-0 right-0 bg-red-500/40 border-l border-dashed border-red-500 pointer-events-none"
            style="width: {epubState.coverWidth > 0
              ? Math.min(
                  100,
                  (epubState.coverCropRight / epubState.coverWidth) * 100,
                )
              : 0}%; top: {epubState.coverHeight > 0
              ? (epubState.coverCropTop / epubState.coverHeight) * 100
              : 0}%; bottom: {epubState.coverHeight > 0
              ? (epubState.coverCropBottom / epubState.coverHeight) * 100
              : 0}%"
          ></div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-5">
          <div>
            <span class="font-mono text-xs text-text-mute uppercase mb-2 block"
              >Cắt lề trên / dưới (px)</span
            >
            <div class="flex items-center gap-2">
              <button
                class="bg-panel-2 text-text-color border border-border-color hover:border-accent-color font-mono text-sm py-2 px-3.5 rounded-xl cursor-pointer"
                onclick={() => epubState.adjustCoverCrop("top", -20)}
                type="button">T −20</button
              >
              <button
                class="bg-panel-2 text-text-color border border-border-color hover:border-accent-color font-mono text-sm py-2 px-3.5 rounded-xl cursor-pointer"
                onclick={() => epubState.adjustCoverCrop("top", 20)}
                type="button">T +20</button
              >
              <div class="flex-1"></div>
              <button
                class="bg-panel-2 text-text-color border border-border-color hover:border-accent-color font-mono text-sm py-2 px-3.5 rounded-xl cursor-pointer"
                onclick={() => epubState.adjustCoverCrop("bottom", -20)}
                type="button">B −20</button
              >
              <button
                class="bg-panel-2 text-text-color border border-border-color hover:border-accent-color font-mono text-sm py-2 px-3.5 rounded-xl cursor-pointer"
                onclick={() => epubState.adjustCoverCrop("bottom", 20)}
                type="button">B +20</button
              >
            </div>
            <div class="flex gap-4 mt-3">
              <div class="flex-1">
                <Input
                  type="number"
                  bind:value={epubState.coverCropTop}
                  label="Lề trên (px)"
                  min="0"
                />
              </div>
              <div class="flex-1">
                <Input
                  type="number"
                  bind:value={epubState.coverCropBottom}
                  label="Lề dưới (px)"
                  min="0"
                />
              </div>
            </div>
          </div>

          <div>
            <span class="font-mono text-xs text-text-mute uppercase mb-2 block"
              >Cắt lề trái / phải (px)</span
            >
            <div class="flex items-center gap-2">
              <button
                class="bg-panel-2 text-text-color border border-border-color hover:border-accent-color font-mono text-sm py-2 px-3.5 rounded-xl cursor-pointer"
                onclick={() => epubState.adjustCoverCrop("left", -20)}
                type="button">L −20</button
              >
              <button
                class="bg-panel-2 text-text-color border border-border-color hover:border-accent-color font-mono text-sm py-2 px-3.5 rounded-xl cursor-pointer"
                onclick={() => epubState.adjustCoverCrop("left", 20)}
                type="button">L +20</button
              >
              <div class="flex-1"></div>
              <button
                class="bg-panel-2 text-text-color border border-border-color hover:border-accent-color font-mono text-sm py-2 px-3.5 rounded-xl cursor-pointer"
                onclick={() => epubState.adjustCoverCrop("right", -20)}
                type="button">R −20</button
              >
              <button
                class="bg-panel-2 text-text-color border border-border-color hover:border-accent-color font-mono text-sm py-2 px-3.5 rounded-xl cursor-pointer"
                onclick={() => epubState.adjustCoverCrop("right", 20)}
                type="button">R +20</button
              >
            </div>
            <div class="flex gap-4 mt-3">
              <div class="flex-1">
                <Input
                  type="number"
                  bind:value={epubState.coverCropLeft}
                  label="Lề trái (px)"
                  min="0"
                />
              </div>
              <div class="flex-1">
                <Input
                  type="number"
                  bind:value={epubState.coverCropRight}
                  label="Lề phải (px)"
                  min="0"
                />
              </div>
            </div>
          </div>
        </div>

        <div class="mt-5 flex justify-between items-center">
          <button
            class="bg-transparent text-text-mute hover:text-text-color font-mono text-xs py-1.5 px-3 rounded cursor-pointer"
            onclick={() => epubState.resetCoverCrop()}
            type="button">Khôi phục lề</button
          >
          <button
            class="bg-transparent text-red-500 hover:text-red-600 font-mono text-xs py-1.5 px-3 rounded cursor-pointer"
            onclick={() => epubState.removeCoverFile()}
            type="button">Xóa ảnh bìa</button
          >
        </div>
      </div>
    {/if}
  </div>

  <!-- Font Settings & Chapter Preview Section -->
  <div class="modern-card rounded-2xl p-7 mb-6 animate-fade-in">
    <span
      class="font-mono text-xs tracking-wider text-text-mute uppercase mb-3 block font-semibold"
      >Cấu hình phông chữ nội dung & Xem trước chương</span
    >

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
      <div>
        <label
          for="h1-font-select"
          class="font-mono text-xs text-text-mute uppercase mb-2 block font-semibold"
          >Phông chữ cho tiêu đề lớn (H1)</label
        >
        <select
          id="h1-font-select"
          bind:value={epubState.h1Font}
          class="w-full bg-brand-bg text-text-color border border-border-color focus:border-accent-color rounded-xl py-2.5 px-3.5 font-sans text-sm focus:outline-none transition-colors h-[46px]"
        >
          <option value="default">Mặc định (Không dùng font)</option>
          <option value="Akashi">Akashi</option>
          <option value="Polliwog">Polliwog</option>
          <option value="Charlotte">Charlotte</option>
        </select>
      </div>
      <div>
        <label
          for="h2-font-select"
          class="font-mono text-xs text-text-mute uppercase mb-2 block font-semibold"
          >Phông chữ cho tiêu đề nhỏ (H2)</label
        >
        <select
          id="h2-font-select"
          bind:value={epubState.h2Font}
          class="w-full bg-brand-bg text-text-color border border-border-color focus:border-accent-color rounded-xl py-2.5 px-3.5 font-sans text-sm focus:outline-none transition-colors h-[46px]"
        >
          <option value="default">Mặc định (Không dùng font)</option>
          <option value="Akashi">Akashi</option>
          <option value="Polliwog">Polliwog</option>
          <option value="Charlotte">Charlotte</option>
        </select>
      </div>
    </div>

    <span
      class="font-mono text-xs text-text-mute uppercase mb-2 block font-semibold"
      >Xem trước hiển thị nội dung chương (Preview)</span
    >
    <div
      class="border border-border-color rounded-xl p-6 bg-white shadow-inner max-w-lg mx-auto"
      style="color: #000000; font-family: sans-serif;"
    >
      <h1
        class="text-2xl font-bold mb-2 text-center"
        style="font-family: {epubState.h1Font === 'default'
          ? 'inherit'
          : epubState.h1Font};"
      >
        Đây là chapter lớn
      </h1>
      <h2
        class="text-lg font-semibold mb-4 text-center"
        style="font-family: {epubState.h2Font === 'default'
          ? 'inherit'
          : epubState.h2Font}; color: #333333;"
      >
        Đây là chapter nhỏ
      </h2>
      <p class="text-sm leading-relaxed text-gray-700 font-sans">
        Đây là nội dung thử nghiệm (dummy text) để xem trước phông chữ hiển thị
        trong cuốn sách của bạn sau khi xuất bản. Tiêu đề lớn (h1) và tiêu đề
        nhỏ (h2) sẽ được hiển thị bằng phông chữ đã chọn, trong khi đoạn văn (p)
        vẫn sử dụng phông chữ không chân (sans-serif) mặc định của thiết bị đọc
        sách.
      </p>
    </div>
  </div>

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

    <div class="flex items-center gap-4 mt-6 flex-wrap md:flex-nowrap">
      <div
        class="w-full md:w-auto md:flex-1 max-w-[220px] min-w-[170px] shrink-0"
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
        class="w-full md:w-auto md:flex-1 max-w-[220px] min-w-[170px] shrink-0"
      >
        <Button
          onclick={downloadEpub}
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
{/if}

{#if showJacketModal}
  <!-- eslint-disable-next-line svelte/no-at-html-tags -->
  {@html `<style>${JACKET_TEMPLATES[currentPreviewTemplateIdx].css}</style>`}

  <div
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
    role="dialog"
    aria-modal="true"
  >
    <!-- Modal box -->
    <div
      class="bg-panel-1 border border-border-color w-full max-w-lg rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-slide-up"
    >
      <!-- Header -->
      <div
        class="p-4 border-b border-border-color flex justify-between items-center bg-panel-2"
      >
        <span class="font-mono text-sm font-bold text-text-color"
          >Xem trước</span
        >
        <button
          type="button"
          class="text-text-mute hover:text-text-color transition-colors font-mono text-xs font-bold"
          onclick={() => (showJacketModal = false)}
        >
          Đóng
        </button>
      </div>

      <!-- Body -->
      <div
        class="p-6 flex flex-col items-center overflow-y-auto flex-1 gap-4 bg-brand-bg"
      >
        <span
          class="font-mono text-xs text-text-mute uppercase tracking-wider font-semibold"
        >
          Mẫu {currentPreviewTemplateIdx + 1}/{JACKET_TEMPLATES.length}: {JACKET_TEMPLATES[
            currentPreviewTemplateIdx
          ].name}
        </span>

        <div class="preview-wrap">
          {#if epubState.jacketFont !== "default"}
            <!-- eslint-disable-next-line svelte/no-at-html-tags -->
            {@html `<style>.preview-wrap, .preview-wrap p, .preview-wrap div, .preview-wrap span, .preview-wrap h1, .preview-wrap h2 { font-family: "${epubState.jacketFont}" !important; }</style>`}
          {/if}
          <!-- eslint-disable-next-line svelte/no-at-html-tags -->
          {@html JACKET_TEMPLATES[currentPreviewTemplateIdx].render(
            epubState.title.trim() || "Tác phẩm mẫu",
            epubState.originalTitle.trim(),
            epubState.author.trim() || "Tác giả mẫu",
            epubState.translator.trim() || "Dịch giả mẫu",
            epubState.publisher.trim(),
            epubState.distributor.trim(),
          )}
        </div>
      </div>

      <!-- Footer -->
      <div
        class="p-4 border-t border-border-color flex justify-between items-center bg-panel-2 gap-3"
      >
        <div class="flex gap-2">
          <button
            type="button"
            class="bg-brand-bg border border-border-color text-text-color hover:border-text-color font-mono text-xs font-semibold py-2 px-3 rounded-xl active:scale-[0.98] transition-all cursor-pointer"
            onclick={() => prevTemplate()}
          >
            Trước
          </button>
          <button
            type="button"
            class="bg-brand-bg border border-border-color text-text-color hover:border-text-color font-mono text-xs font-semibold py-2 px-3 rounded-xl active:scale-[0.98] transition-all cursor-pointer"
            onclick={() => nextTemplate()}
          >
            Tiếp
          </button>
        </div>

        <button
          type="button"
          class="bg-accent-color text-white font-mono text-xs font-semibold py-2.5 px-5 rounded-xl hover:bg-accent-hover active:scale-[0.98] transition-all cursor-pointer"
          onclick={() => selectTemplate()}
        >
          Chọn mẫu này
        </button>
      </div>
    </div>
  </div>
{/if}

{#if showSyntaxModal}
  <div
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
    role="dialog"
    aria-modal="true"
  >
    <!-- Modal box -->
    <div
      class="bg-panel-1 border border-border-color w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-slide-up"
    >
      <!-- Header -->
      <div
        class="p-4 border-b border-border-color flex justify-between items-center bg-panel-2"
      >
        <span class="font-mono text-sm font-bold text-text-color"
          >Bảng quy ước</span
        >
        <button
          type="button"
          class="text-text-mute hover:text-text-color transition-colors font-mono text-xs font-bold"
          onclick={() => (showSyntaxModal = false)}
        >
          Đóng
        </button>
      </div>

      <!-- Body -->
      <div class="p-6 overflow-y-auto flex-1 bg-brand-bg flex flex-col gap-4">
        <div class="overflow-x-auto">
          <table
            class="w-full text-left font-mono text-xs border-collapse text-text-color"
          >
            <thead>
              <tr class="border-b border-border-color text-text-mute">
                <th class="py-2.5 px-3 whitespace-nowrap">Cú pháp trong TXT</th>
                <th class="py-2.5 px-3">Ý nghĩa & Cấu trúc HTML sinh ra</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border-color">
              <tr>
                <td class="py-3 px-3 whitespace-nowrap"
                  ><code
                    class="bg-brand-bg px-1.5 py-0.5 rounded border border-border-color text-accent-color"
                    >@@@ Tiêu đề</code
                  ></td
                >
                <td class="py-3 px-3">
                  <code
                    >&lt;h1 class="break-main-chap center"&gt;Tiêu đề&lt;/h1&gt;</code
                  ><br />
                  <span class="text-[11px] text-text-mute"
                    >Tách file "solo" — file mới chỉ chứa tiêu đề này, không kéo
                    theo nội dung phía sau.</span
                  >
                </td>
              </tr>
              <tr>
                <td class="py-3 px-3 whitespace-nowrap"
                  ><code
                    class="bg-brand-bg px-1.5 py-0.5 rounded border border-border-color text-accent-color"
                    >@@ Tiêu đề</code
                  ></td
                >
                <td class="py-3 px-3">
                  <code
                    >&lt;h1 class="main-chap center"&gt;Tiêu đề&lt;/h1&gt;</code
                  ><br />
                  <span class="text-[11px] text-text-mute"
                    >Tách file gom nội dung — gom toàn bộ nội dung phía sau cho
                    đến tiêu đề tiếp theo.</span
                  >
                </td>
              </tr>
              <tr>
                <td class="py-3 px-3 whitespace-nowrap"
                  ><code
                    class="bg-brand-bg px-1.5 py-0.5 rounded border border-border-color text-accent-color"
                    >@ Tiêu đề</code
                  ></td
                >
                <td class="py-3 px-3">
                  <code
                    >&lt;h2 class="side-chap center"&gt;Tiêu đề&lt;/h2&gt;</code
                  ><br />
                  <span class="text-[11px] text-text-mute"
                    >Tiêu đề phụ / Chương nhỏ — không tách file.</span
                  >
                </td>
              </tr>
              <tr>
                <td class="py-3 px-3 whitespace-nowrap"
                  ><code
                    class="bg-brand-bg px-1.5 py-0.5 rounded border border-border-color text-accent-color"
                    >@@t / @t</code
                  ></td
                >
                <td class="py-3 px-3">
                  <span class="text-text-mute">Hậu tố căn trái:</span>
                  <code>t</code>
                  &rarr; class <code>left</code> (e.g.
                  <code>&lt;h1 class="main-chap left"&gt;</code>)
                </td>
              </tr>
              <tr>
                <td class="py-3 px-3 whitespace-nowrap"
                  ><code
                    class="bg-brand-bg px-1.5 py-0.5 rounded border border-border-color text-accent-color"
                    >@@p / @p</code
                  ></td
                >
                <td class="py-3 px-3">
                  <span class="text-text-mute">Hậu tố căn phải:</span>
                  <code>p</code>
                  &rarr; class <code>right</code> (e.g.
                  <code>&lt;h1 class="main-chap right"&gt;</code>)
                </td>
              </tr>
              <tr>
                <td class="py-3 px-3 whitespace-nowrap"
                  ><code
                    class="bg-brand-bg px-1.5 py-0.5 rounded border border-border-color text-accent-color"
                    >Không có hậu tố</code
                  ></td
                >
                <td class="py-3 px-3">
                  <span class="text-text-mute">Căn giữa mặc định:</span> class
                  <code>center</code>
                  (e.g. <code>&lt;h1 class="main-chap center"&gt;</code>)
                </td>
              </tr>
              <tr>
                <td class="py-3 px-3 whitespace-nowrap"
                  ><code
                    class="bg-brand-bg px-1.5 py-0.5 rounded border border-border-color text-accent-color"
                    >~ Lời thoại</code
                  ></td
                >
                <td class="py-3 px-3">
                  <code
                    >&lt;blockquote class="center"&gt;&lt;p&gt;Lời
                    thoại&lt;/p&gt;&lt;/blockquote&gt;</code
                  ><br />
                  <span class="text-[11px] text-text-mute"
                    >Quote / Lời thoại (hỗ trợ <code>~t</code> căn trái,
                    <code>~p</code> căn phải).</span
                  >
                </td>
              </tr>
              <tr>
                <td class="py-3 px-3 whitespace-nowrap"
                  ><code
                    class="bg-brand-bg px-1.5 py-0.5 rounded border border-border-color text-accent-color"
                    >&gt; Tác giả</code
                  ></td
                >
                <td class="py-3 px-3">
                  <code>&lt;footer&gt;Tác giả&lt;/footer&gt;</code> (bên trong
                  blockquote)<br />
                  <span class="text-[11px] text-text-mute"
                    >Chỉ có tác dụng khi đứng ngay sau dòng <code>~</code> trích
                    dẫn.</span
                  >
                </td>
              </tr>
              <tr>
                <td class="py-3 px-3 whitespace-nowrap"
                  ><code
                    class="bg-brand-bg px-1.5 py-0.5 rounded border border-border-color text-accent-color"
                    >###</code
                  ></td
                >
                <td class="py-3 px-3">
                  <code
                    >&lt;p class="scene-break-big" role="separator"&gt;• •
                    •&lt;/p&gt;</code
                  ><br />
                  <span class="text-[11px] text-text-mute"
                    >Dấu ngắt cảnh lớn (phải đứng riêng một dòng).</span
                  >
                </td>
              </tr>
              <tr>
                <td class="py-3 px-3 whitespace-nowrap"
                  ><code
                    class="bg-brand-bg px-1.5 py-0.5 rounded border border-border-color text-accent-color"
                    >##</code
                  ></td
                >
                <td class="py-3 px-3">
                  <code
                    >&lt;p class="scene-break-small"
                    role="separator"&gt;*&lt;/p&gt;</code
                  ><br />
                  <span class="text-[11px] text-text-mute"
                    >Dấu ngắt cảnh nhỏ (phải đứng riêng một dòng).</span
                  >
                </td>
              </tr>
              <tr>
                <td class="py-3 px-3 whitespace-nowrap"
                  ><code
                    class="bg-brand-bg px-1.5 py-0.5 rounded border border-border-color text-accent-color"
                    >*in đậm*</code
                  ></td
                >
                <td class="py-3 px-3"><code>&lt;b&gt;in đậm&lt;/b&gt;</code></td
                >
              </tr>
              <tr>
                <td class="py-3 px-3 whitespace-nowrap"
                  ><code
                    class="bg-brand-bg px-1.5 py-0.5 rounded border border-border-color text-accent-color"
                    >/in nghiêng/</code
                  ></td
                >
                <td class="py-3 px-3"
                  ><code>&lt;i&gt;in nghiêng&lt;/i&gt;</code></td
                >
              </tr>
              <tr>
                <td class="py-3 px-3 whitespace-nowrap"
                  ><code
                    class="bg-brand-bg px-1.5 py-0.5 rounded border border-border-color text-accent-color"
                    >_gạch chân_</code
                  ></td
                >
                <td class="py-3 px-3"
                  ><code>&lt;u&gt;gạch chân&lt;/u&gt;</code></td
                >
              </tr>
              <tr>
                <td class="py-3 px-3 whitespace-nowrap">
                  <code
                    class="bg-brand-bg px-1.5 py-0.5 rounded border border-border-color text-accent-color"
                    >&#123;n&#125;</code
                  >
                </td>
                <td class="py-3 px-3">
                  <span class="text-text-mute"
                    >Liên kết chú thích qua lại (Footnotes):</span
                  ><br />
                  - Phải có một dòng riêng biệt ghi: <code>Chú thích</code> hoặc
                  <code>Chú thích:</code>
                  (chấp nhận mọi kiểu chữ hoa/thường, có hoặc không có dấu hai chấm).<br
                  />
                  - Chú thích đi theo cặp <code>&#123;n&#125;</code> (trong nội
                  dung truyện) và <code>&#123;n&#125;</code> ở sau dòng
                  <code>Chú thích</code>
                  để tự động tạo liên kết và thẻ <code>&lt;aside&gt;</code> qua lại
                  chính xác.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Footer -->
      <div class="p-4 border-t border-border-color flex justify-end bg-panel-2">
        <button
          type="button"
          class="bg-accent-color text-white font-mono text-xs font-semibold py-2.5 px-5 rounded-xl hover:bg-accent-hover active:scale-[0.98] transition-all cursor-pointer"
          onclick={() => (showSyntaxModal = false)}
        >
          Đồng ý
        </button>
      </div>
    </div>
  </div>
{/if}

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
  .animate-slide-up {
    animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  }
  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(12px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
