<script>
  import { AVAILABLE_FONTS } from "$lib/epub-packer/templates/fonts.js";

  let { epubState } = $props();
</script>

<div class="modern-card rounded-2xl p-7 mb-6 animate-fade-in">
  <span
    class="font-mono text-xs tracking-wider text-text-mute uppercase mb-3 block font-semibold"
    >Cấu hình phông chữ nội dung & Xem trước chương</span
  >

  <div class="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-5">
    <div>
      <label
        for="h1-font-select"
        class="font-mono text-xs text-text-mute uppercase mb-2 block font-semibold"
        >Font tiêu đề lớn (H1)</label
      >
      <select
        id="h1-font-select"
        bind:value={epubState.h1Font}
        class="w-full bg-brand-bg text-text-color border border-border-color focus:border-accent-color rounded-xl py-2.5 px-3.5 font-sans text-sm focus:outline-none transition-colors h-11.5"
      >
        <option value="default">Mặc định (Không dùng font)</option>
        {#each AVAILABLE_FONTS as font (font.id)}
          <option value={font.id}>{font.name}</option>
        {/each}
      </select>
    </div>
    <div>
      <label
        for="h2-font-select"
        class="font-mono text-xs text-text-mute uppercase mb-2 block font-semibold"
        >Font tiêu đề nhỏ (H2)</label
      >
      <select
        id="h2-font-select"
        bind:value={epubState.h2Font}
        class="w-full bg-brand-bg text-text-color border border-border-color focus:border-accent-color rounded-xl py-2.5 px-3.5 font-sans text-sm focus:outline-none transition-colors h-11.5"
      >
        <option value="default">Mặc định (Không dùng font)</option>
        {#each AVAILABLE_FONTS as font (font.id)}
          <option value={font.id}>{font.name}</option>
        {/each}
      </select>
    </div>
    <div>
      <label
        for="dropcap-font-select"
        class="font-mono text-xs text-text-mute uppercase mb-2 block font-semibold"
        >Font cho Dropcap</label
      >
      <select
        id="dropcap-font-select"
        bind:value={epubState.dropcapFont}
        class="w-full bg-brand-bg text-text-color border border-border-color focus:border-accent-color rounded-xl py-2.5 px-3.5 font-sans text-sm focus:outline-none transition-colors h-11.5"
      >
        <option value="default">Mặc định (Không dùng font)</option>
        {#each AVAILABLE_FONTS as font (font.id)}
          <option value={font.id}>{font.name}</option>
        {/each}
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
      <span class="dropcap" style="font-family: {epubState.dropcapFont === 'default' ? 'inherit' : epubState.dropcapFont};">Đ</span>ây là nội dung thử nghiệm (dummy text) để xem trước phông chữ hiển thị trong cuốn sách của bạn sau khi xuất bản. Tiêu đề lớn (h1) và tiêu đề nhỏ (h2) sẽ được hiển thị bằng phông chữ đã chọn, trong khi đoạn văn (p) vẫn sử dụng phông chữ không chân (sans-serif) mặc định của thiết bị đọc sách.
    </p>
  </div>
</div>

<style>
  .dropcap {
    float: left;
    font-size: 3em;
    line-height: 0.9;
    margin-right: 0.08em;
    margin-top: 0.02em;
    font-weight: bold;
  }
</style>
