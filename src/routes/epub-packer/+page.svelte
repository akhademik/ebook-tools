<script lang="ts">
	import PageHeader from '$lib/components/PageHeader.svelte';
	import Button from '$lib/components/Button.svelte';
	import { EpubState } from '$lib/epub-packer/epub-state.svelte';
	import { triggerDownload, Logger } from '$lib/utils';
	import { AVAILABLE_FONTS } from '$lib/epub-packer/templates/fonts';

	import EpubSourceSection from '$lib/epub-packer/components/EpubSourceSection.svelte';
	import EpubMetadataSection from '$lib/epub-packer/components/EpubMetadataSection.svelte';
	import EpubCoverSection from '$lib/epub-packer/components/EpubCoverSection.svelte';
	import EpubOrnamentsSection from '$lib/epub-packer/components/EpubOrnamentsSection.svelte';
	import EpubIllustrationsSection from '$lib/epub-packer/components/EpubIllustrationsSection.svelte';
	import EpubFontSettingsSection from '$lib/epub-packer/components/EpubFontSettingsSection.svelte';
	import EpubPackSection from '$lib/epub-packer/components/EpubPackSection.svelte';
	import EpubJacketModal from '$lib/epub-packer/components/EpubJacketModal.svelte';
	import EpubSyntaxModal from '$lib/epub-packer/components/EpubSyntaxModal.svelte';

	const epubState = new EpubState();

	let currentStep = $state(1);
	let showJacketModal = $state(false);
	let showSyntaxModal = $state(false);

	const hasChapters = $derived(epubState.source.epubChapters.length > 0);

	const steps = $derived([
		{
			id: 1,
			title: 'Nguồn',
			subtitle: hasChapters ? `${epubState.source.epubChapters.length} chương` : 'Chờ tải file',
			badge: hasChapters ? 'Đã tải' : 'Chờ tải',
			isCompleted: hasChapters
		},
		{
			id: 2,
			title: 'Thông tin',
			subtitle: epubState.metadata.title ? epubState.metadata.title : 'Chưa nhập tựa đề',
			badge: epubState.metadata.title ? 'Đã điền' : 'Chờ điền',
			isCompleted: Boolean(epubState.metadata.title)
		},
		{
			id: 3,
			title: 'Bìa và hoa văn',
			subtitle: epubState.images.coverFile ? 'Đã chọn ảnh bìa' : 'Tùy chọn trang trí',
			badge: epubState.images.coverFile ? 'Có bìa' : 'Tùy chọn',
			isCompleted: Boolean(epubState.images.coverFile)
		},
		{
			id: 4,
			title: 'Phông chữ',
			subtitle:
				epubState.fonts.h1Font !== 'default' ? `H1: ${epubState.fonts.h1Font}` : 'Phông mặc định',
			badge: epubState.fonts.h1Font !== 'default' ? epubState.fonts.h1Font : 'Mặc định',
			isCompleted: epubState.fonts.h1Font !== 'default'
		},
		{
			id: 5,
			title: 'Đóng gói',
			subtitle: epubState.epubBlob ? 'Sẵn sàng tải về' : 'Xuất file hoàn chỉnh',
			badge: epubState.epubBlob ? 'Hoàn tất' : 'Chưa xuất',
			isCompleted: Boolean(epubState.epubBlob)
		}
	]);

	function goToStep(stepId: number) {
		if (stepId > 1 && !hasChapters) return;
		currentStep = stepId;
	}

	function downloadEpub() {
		Logger.debug(
			'[EpubPage]',
			'downloadEpub button clicked',
			epubState.metadata.epubOutNamePreview
		);
		if (epubState.epubBlob) {
			triggerDownload(epubState.epubBlob, epubState.metadata.epubOutNamePreview);
		} else {
			Logger.warn('[EpubPage]', 'epubState.epubBlob is empty, cannot download');
		}
	}
</script>

<svelte:head>
	<title>Đóng gói EPUB</title>
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html `
  <style>
    ${AVAILABLE_FONTS.map(
			(font) => `
      @font-face {
        font-family: "${font.id}";
        src: url("${font.url}");
        font-display: swap;
      }
      @font-face {
        font-family: "${font.name}";
        src: url("${font.url}");
        font-display: swap;
      }
      @font-face {
        font-family: "${font.cssFamily}";
        src: url("${font.url}");
        font-display: swap;
      }
    `
		).join('\n')}
  </style>
  `}
</svelte:head>

<PageHeader
	title="Đóng gói EPUB"
	description="Chuyển đổi văn bản TXT hoặc file nén ZIP chứa Markdown thành sách điện tử EPUB chuẩn mực"
	breadcrumb="Tạo và tinh chỉnh"
	badge={true}
/>

<!-- 5-step navigation bar -->
<nav
	aria-label="Các bước đóng gói EPUB"
	class="mb-8 pb-4 border-b border-border-color/60 overflow-x-auto"
>
	<ol
		class="flex sm:grid sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 relative min-w-max sm:min-w-0"
	>
		{#each steps as step, idx (step.id)}
			{@const isActive = currentStep === step.id}
			{@const isDisabled = step.id > 1 && !hasChapters}
			{@const isDone = step.isCompleted || currentStep > step.id}
			<li class="relative shrink-0 sm:shrink min-w-[140px] sm:min-w-0">
				<!-- Connecting line between steps on desktop -->
				{#if idx < steps.length - 1}
					<div
						class="hidden lg:block absolute top-4 left-[calc(50%+16px)] right-[calc(-50%+16px)] h-0.5 z-0 {isDone
							? 'bg-accent-color'
							: 'bg-border-color'}"
						aria-hidden="true"
					></div>
				{/if}
				<button
					type="button"
					disabled={isDisabled}
					onclick={() => goToStep(step.id)}
					aria-current={isActive ? 'step' : undefined}
					class="w-full text-left group flex items-start gap-3 relative z-10 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 transition-opacity"
				>
					<!-- Circle: Number or Checkmark -->
					<span
						class="w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs font-semibold transition-all {isActive
							? 'bg-accent-color text-on-accent ring-4 ring-accent-soft'
							: isDone
								? 'bg-ok/15 text-ok border border-ok/30'
								: 'bg-panel-2 text-text-mute border border-field-border'}"
					>
						{#if isDone && !isActive}
							<svg
								class="w-4 h-4"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2.5"
							>
								<path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
							</svg>
						{:else}
							{step.id}
						{/if}
					</span>

					<!-- Title & Subtitle (1 line each) -->
					<div class="min-w-0 flex-1">
						<div
							class="text-sm font-semibold truncate transition-colors {isActive
								? 'text-accent-color font-bold'
								: isDisabled
									? 'text-text-mute'
									: 'text-text-color group-hover:text-accent-color'}"
						>
							{step.title}
						</div>
						<div class="text-xs text-text-mute truncate mt-0.5">
							{step.subtitle}
						</div>
					</div>
				</button>
			</li>
		{/each}
	</ol>
</nav>

<!-- Main area: 5-step content (left) + Persistent Summary Column (right) -->
<div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
	<!-- Left main column: Never unmount sections with if, toggle via hidden -->
	<div class="lg:col-span-8 min-w-0">
		<!-- Step 1: Nguồn -->
		<div class={currentStep === 1 ? 'block' : 'hidden'}>
			<EpubSourceSection {epubState} onOpenSyntaxModal={() => (showSyntaxModal = true)} />
			{#if hasChapters}
				<div class="flex justify-end mt-4">
					<div class="w-full sm:w-auto min-w-50">
						<Button variant="primary" onclick={() => (currentStep = 2)}>
							Tiếp: Thông tin sách →
						</Button>
					</div>
				</div>
			{/if}
		</div>

		<!-- Step 2: Thông tin -->
		<div class={currentStep === 2 ? 'block' : 'hidden'}>
			<EpubMetadataSection {epubState} onOpenJacketModal={() => (showJacketModal = true)} />
			<div class="flex justify-between items-center mt-4 gap-3 flex-wrap sm:flex-nowrap">
				<div class="w-full sm:w-auto min-w-40">
					<Button variant="secondary" onclick={() => (currentStep = 1)}>← Quay lại: Nguồn</Button>
				</div>
				<div class="w-full sm:w-auto min-w-50">
					<Button variant="primary" onclick={() => (currentStep = 3)}>
						Tiếp: Bìa và hoa văn →
					</Button>
				</div>
			</div>
		</div>

		<!-- Step 3: Bìa và hoa văn -->
		<div class={currentStep === 3 ? 'block' : 'hidden'}>
			<EpubCoverSection {epubState} />
			<EpubOrnamentsSection {epubState} />
			<EpubIllustrationsSection {epubState} />
			<div class="flex justify-between items-center mt-4 gap-3 flex-wrap sm:flex-nowrap">
				<div class="w-full sm:w-auto min-w-40">
					<Button variant="secondary" onclick={() => (currentStep = 2)}>
						← Quay lại: Thông tin
					</Button>
				</div>
				<div class="w-full sm:w-auto min-w-50">
					<Button variant="primary" onclick={() => (currentStep = 4)}>Tiếp: Phông chữ →</Button>
				</div>
			</div>
		</div>

		<!-- Step 4: Phông chữ -->
		<div class={currentStep === 4 ? 'block' : 'hidden'}>
			<EpubFontSettingsSection {epubState} />
			<div class="flex justify-between items-center mt-4 gap-3 flex-wrap sm:flex-nowrap">
				<div class="w-full sm:w-auto min-w-40">
					<Button variant="secondary" onclick={() => (currentStep = 3)}>
						← Quay lại: Bìa và hoa văn
					</Button>
				</div>
				<div class="w-full sm:w-auto min-w-50">
					<Button variant="primary" onclick={() => (currentStep = 5)}>Tiếp: Đóng gói →</Button>
				</div>
			</div>
		</div>

		<!-- Step 5: Đóng gói -->
		<div class={currentStep === 5 ? 'block' : 'hidden'}>
			<EpubPackSection {epubState} onDownload={downloadEpub} />
			<div class="flex justify-start mt-4">
				<div class="w-full sm:w-auto min-w-40">
					<Button variant="secondary" onclick={() => (currentStep = 4)}>
						← Quay lại: Phông chữ
					</Button>
				</div>
			</div>
		</div>
	</div>

	<!-- Right column: Persistent Summary Column (sticky on desktop) -->
	<aside class="w-full lg:col-span-4 lg:sticky lg:top-6 shrink-0">
		<div class="modern-card rounded-2xl p-5 sm:p-6 shadow-sm border border-border-color">
			<div class="flex items-center justify-between mb-4 pb-3 border-b border-border-color">
				<h3 class="text-base font-bold text-text-color font-sans">Tóm tắt sách</h3>
				{#if hasChapters}
					<span
						class="text-xs px-2.5 py-0.5 rounded-full bg-accent-soft text-accent-color font-semibold"
					>
						{epubState.source.epubChapters.length} chương
					</span>
				{:else}
					<span class="text-xs px-2.5 py-0.5 rounded-full bg-brand-bg text-text-mute">
						Chờ tải file
					</span>
				{/if}
			</div>

			<!-- Cover Thumbnail / Placeholder -->
			<div class="mb-5">
				{#if epubState.images.coverOriginalUrl}
					<div
						class="relative w-36 h-52 mx-auto rounded-xl overflow-hidden border border-border-color shadow-md bg-panel-2"
					>
						<img
							src={epubState.images.coverOriginalUrl}
							alt="Bìa sách"
							class="w-full h-full object-cover"
						/>
					</div>
				{:else}
					<div
						class="w-36 h-48 mx-auto rounded-xl border-2 border-dashed border-border-color bg-panel-2/50 flex flex-col items-center justify-center p-3 text-center"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke-width="1.5"
							stroke="currentColor"
							class="w-8 h-8 text-text-mute mb-2"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
							/>
						</svg>
						<span class="text-xs text-text-mute font-medium">Chưa có bìa</span>
						{#if hasChapters}
							<button
								type="button"
								onclick={() => (currentStep = 3)}
								class="mt-2 text-[11px] text-accent-color hover:underline cursor-pointer font-medium"
							>
								+ Thêm ảnh bìa
							</button>
						{/if}
					</div>
				{/if}
			</div>

			<!-- Metadata overview: Label-value list (13-14px) -->
			<div class="space-y-2.5 mb-6 text-[13px] sm:text-sm">
				<div class="flex items-start justify-between gap-2 pb-2 border-b border-border-color">
					<span class="text-text-mute shrink-0">Tên tác phẩm</span>
					<span class="text-text-color font-semibold text-right line-clamp-2">
						{epubState.metadata.title || 'Chưa đặt tiêu đề'}
					</span>
				</div>

				<div class="flex items-center justify-between gap-2 pb-2 border-b border-border-color">
					<span class="text-text-mute shrink-0">Tác giả</span>
					<span class="text-text-color font-medium text-right truncate">
						{epubState.metadata.author || 'Chưa đặt'}
					</span>
				</div>

				<div class="flex items-center justify-between gap-2 pb-2 border-b border-border-color">
					<span class="text-text-mute shrink-0">Mục lục</span>
					<span class="text-text-color font-medium text-right">
						{hasChapters
							? `${epubState.source.epubChapters.filter((c) => c.isChapter !== false).length} mục`
							: '0 mục'}
					</span>
				</div>

				<div class="flex items-center justify-between gap-2 pb-2 border-b border-border-color">
					<span class="text-text-mute shrink-0">Phông H1</span>
					<span class="text-text-color font-medium text-right truncate">
						{epubState.fonts.h1Font !== 'default' ? epubState.fonts.h1Font : 'Mặc định'}
					</span>
				</div>

				<div class="flex items-center justify-between gap-2">
					<span class="text-text-mute shrink-0">File xuất</span>
					<span
						class="text-text-color font-mono text-xs text-right truncate max-w-[180px]"
						title={epubState.metadata.epubOutNamePreview}
					>
						{epubState.metadata.epubOutNamePreview}
					</span>
				</div>
			</div>

			<!-- Quick Actions: Always visible on desktop -->
			<div class="space-y-3 pt-4 border-t border-border-color">
				<Button
					variant="primary"
					size="lg"
					onclick={() => epubState.processEpub()}
					disabled={!hasChapters || epubState.processing}
				>
					{epubState.processing ? 'Đang đóng gói...' : 'Đóng gói file EPUB'}
				</Button>

				<Button variant="secondary" onclick={downloadEpub} disabled={!epubState.epubBlob}>
					Tải file .EPUB
				</Button>

				{#if epubState.status}
					<div
						class="text-xs font-sans p-2.5 rounded-xl bg-panel-2 border border-border-color mt-2 {epubState.isError
							? 'text-red-500'
							: 'text-text-mute'}"
					>
						{epubState.status}
					</div>
				{/if}
			</div>
		</div>
	</aside>
</div>

<!-- Modals -->
<EpubJacketModal bind:show={showJacketModal} {epubState} />
<EpubSyntaxModal bind:show={showSyntaxModal} />
