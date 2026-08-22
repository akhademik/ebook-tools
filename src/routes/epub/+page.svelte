<script lang="ts">
  import PageHeader from "$lib/components/PageHeader.svelte";
  import { EpubState } from "$lib/epub-packer/epub-state.svelte";
  import { triggerDownload, Logger } from "$lib/utils";
  import { AVAILABLE_FONTS } from "$lib/epub-packer/templates/fonts";

  import EpubSourceSection from "$lib/epub-packer/components/EpubSourceSection.svelte";
  import EpubMetadataSection from "$lib/epub-packer/components/EpubMetadataSection.svelte";
  import EpubCoverSection from "$lib/epub-packer/components/EpubCoverSection.svelte";
  import EpubOrnamentsSection from "$lib/epub-packer/components/EpubOrnamentsSection.svelte";
  import EpubIllustrationsSection from "$lib/epub-packer/components/EpubIllustrationsSection.svelte";
  import EpubFontSettingsSection from "$lib/epub-packer/components/EpubFontSettingsSection.svelte";
  import EpubPackSection from "$lib/epub-packer/components/EpubPackSection.svelte";
  import EpubJacketModal from "$lib/epub-packer/components/EpubJacketModal.svelte";
  import EpubSyntaxModal from "$lib/epub-packer/components/EpubSyntaxModal.svelte";

  const epubState = new EpubState();

  let showJacketModal = $state(false);
  let showSyntaxModal = $state(false);

  function downloadEpub() {
    Logger.debug(
      "[EpubPage]",
      "downloadEpub button clicked",
      epubState.epubOutNamePreview,
    );
    if (epubState.epubBlob) {
      triggerDownload(epubState.epubBlob, epubState.epubOutNamePreview);
    } else {
      Logger.warn(
        "[EpubPage]",
        "epubState.epubBlob is empty, cannot download",
      );
    }
  }
</script>

<svelte:head>
  <title>Đóng gói EPUB</title>
  <!-- eslint-disable-next-line svelte/no-at-html-tags -->
  {@html `
  <style>
    ${AVAILABLE_FONTS.map(font => `
      @font-face {
        font-family: "${font.id}";
        src: url("${font.url}");
      }
      @font-face {
        font-family: "${font.name}";
        src: url("${font.url}");
      }
    `).join('\n')}
  </style>
  `}
</svelte:head>

<PageHeader
  title="Đóng gói EPUB"
  description="Up .ZIP chứa files MD hoặc up .TXT"
/>

<!-- 1. Chọn file nguồn & Bảng quy ước & Quản lý chương -->
<EpubSourceSection
  {epubState}
  onOpenSyntaxModal={() => (showSyntaxModal = true)}
/>

{#if epubState.epubChapters.length > 0}
  <!-- 2. Metadata & Trang giới thiệu -->
  <EpubMetadataSection
    {epubState}
    onOpenJacketModal={() => (showJacketModal = true)}
  />

  <!-- 3. Ảnh bìa sách -->
  <EpubCoverSection {epubState} />

  <!-- 4. Ảnh trang trí (Ornaments) -->
  <EpubOrnamentsSection {epubState} />

  <!-- 5. Ảnh minh họa (Illustrations) -->
  <EpubIllustrationsSection {epubState} />

  <!-- 6. Phông chữ nội dung & Preview -->
  <EpubFontSettingsSection {epubState} />

  <!-- 7. Tên file & Đóng gói / Tải về -->
  <EpubPackSection
    {epubState}
    onDownload={downloadEpub}
  />
{/if}

<!-- Modals -->
<EpubJacketModal
  bind:show={showJacketModal}
  {epubState}
/>

<EpubSyntaxModal bind:show={showSyntaxModal} />
