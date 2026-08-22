<script lang="ts">
  import Input from "$lib/components/Input.svelte";
  import { AVAILABLE_FONTS } from "$lib/epub-packer/templates/fonts";
  import { JACKET_TEMPLATES } from "$lib/epub-packer/templates/jacket-templates";
  import type { EpubMetadataSectionProps } from "$lib/types";

  let { epubState, onOpenJacketModal }: EpubMetadataSectionProps = $props();

  const selectedTemplateName = $derived(
    JACKET_TEMPLATES.find((t) => t.id === epubState.jacket.jacketTemplateId)?.name || "",
  );
</script>

<div class="modern-card rounded-2xl p-7 mb-6 animate-fade-in">
  <span
    class="font-mono text-xs tracking-wider text-text-mute uppercase mb-3 block"
    >Metadata & Trang giới thiệu</span
  >
  <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
    <div>
      <Input
        bind:value={epubState.metadata.title}
        label="Tác phẩm"
        placeholder="Mật Mã Da Vinci"
      />
    </div>
    <div>
      <Input
        bind:value={epubState.metadata.author}
        label="Tác giả"
        placeholder="Dan Brown"
      />
    </div>
    <div>
      <Input
        bind:value={epubState.jacket.originalTitle}
        label="Tựa gốc / Tựa nhỏ"
        placeholder="The Da Vinci Code"
      />
    </div>
    <div>
      <Input
        bind:value={epubState.jacket.translator}
        label="Dịch giả"
        placeholder="Đỗ Thu Hà"
      />
    </div>
    <div>
      <Input
        bind:value={epubState.metadata.publisher}
        label="Nhà phát hành"
        placeholder="1980 Books"
      />
    </div>
    <div>
      <Input
        bind:value={epubState.jacket.distributor}
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
        bind:value={epubState.fonts.jacketFont}
        class="w-full bg-brand-bg text-text-color border border-border-color focus:border-accent-color rounded-xl py-2.5 px-3.5 font-sans text-sm focus:outline-none transition-colors h-11.5"
      >
        <option value="default">Mặc định (Không dùng font)</option>
        {#each AVAILABLE_FONTS as font (font.id)}
          <option value={font.id}>{font.name}</option>
        {/each}
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
        class="w-full sm:w-auto bg-accent-color text-white font-mono text-xs font-semibold py-2.5 px-5 rounded-xl hover:bg-accent-hover active:scale-[0.98] transition-all cursor-pointer h-10.5 flex items-center justify-center gap-2"
        onclick={() => onOpenJacketModal()}
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
