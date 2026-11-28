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
	import EpubSyntaxModal from '$lib/epub-packer/components/EpubSyntaxModal.svelte';

	const epubState = new EpubState();

	let currentStep = $state(1);
	let showSyntaxModal = $state(false);

	$effect(() => {
		if (!epubState.processing && epubState.hasStaleOutput) {
			epubState.invalidateOutput(
				'Dữ liệu sách (thông tin, bìa, phông chữ hoặc ảnh) đã thay đổi. Vui lòng bấm "Đóng gói file EPUB" để tạo bản mới.'
			);
		}
	});

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
				epubState.fonts.h1Font !== 'default'
					? `H1: ${epubState.fonts.h1Font}`
					: 'Mặc định (Bookerly)',
			badge: epubState.fonts.h1Font !== 'default' ? epubState.fonts.h1Font : 'Mặc định (Bookerly)',
			isCompleted: epubState.fonts.h1Font !== 'default'
		},
		{
			id: 5,
			title: 'Đóng gói',
			subtitle: epubState.isDownloadReady ? 'Sẵn sàng tải về' : 'Xuất file hoàn chỉnh',
			badge: epubState.isDownloadReady ? 'Hoàn tất' : 'Chưa xuất',
			isCompleted: epubState.isDownloadReady
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
		if (epubState.isDownloadReady && epubState.epubBlob) {
			triggerDownload(epubState.epubBlob, epubState.metadata.epubOutNamePreview);
		} else {
			Logger.warn('[EpubPage]', 'epubState output is empty or stale, cannot download');
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
	description="Chuyển đổi văn bản TXT hoặc file ZIP chứa Markdown thành EPUB"
	breadcrumb="Tạo và tinh chỉnh"
/>

<!-- 5-step navigation bar -->
<nav
	aria-label="Các bước đóng gói EPUB"
	class="mb-8 pb-3 pt-1 px-1 border-b border-border-color/60 overflow-x-auto"
>
	<ol
		class="flex sm:grid sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 relative min-w-max sm:min-w-0 p-1"
	>
		{#each steps as step (step.id)}
			{@const isActive = currentStep === step.id}
			{@const isDisabled = step.id > 1 && !hasChapters}
			{@const isDone = step.isCompleted || currentStep > step.id}
			<li class="shrink-0 sm:shrink min-w-35 sm:min-w-0">
				<button
					type="button"
					disabled={isDisabled}
					onclick={() => goToStep(step.id)}
					aria-current={isActive ? 'step' : undefined}
					class="w-full text-left group flex items-start gap-3 p-2.5 rounded-xl border transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 {isActive
						? 'bg-accent-soft/70 border-accent-color/60 shadow-xs ring-1 ring-accent-color/30'
						: isDisabled
							? 'bg-panel-2/30 border-border-color/40 opacity-50'
							: isDone
								? 'bg-panel-2/50 border-border-color hover:border-accent-color/50 hover:bg-panel-2/80'
								: 'bg-panel-2/30 border-border-color/60 hover:border-border-color hover:bg-panel-2/60'}"
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

<!-- Main area: 5-step content full-width -->
<div class="w-full min-w-0">
	<!-- Step 1: Nguồn -->
	<div class={currentStep === 1 ? 'block' : 'hidden'}>
		<div class="modern-card rounded-2xl p-5 sm:p-7 shadow-sm border border-border-color">
			<div class="mb-6 pb-4 border-b border-border-color">
				<h2 class="text-lg sm:text-xl font-bold text-text-color font-sans">Nguồn tài liệu</h2>
			</div>

			<EpubSourceSection {epubState} onOpenSyntaxModal={() => (showSyntaxModal = true)} />

			{#if hasChapters}
				<div class="mt-8 pt-5 border-t border-border-color flex justify-end">
					<div class="w-full sm:w-auto min-w-50">
						<Button variant="primary" onclick={() => (currentStep = 2)}>
							Tiếp: Thông tin sách →
						</Button>
					</div>
				</div>
			{/if}
		</div>
	</div>

	<!-- Step 2: Thông tin -->
	<div class={currentStep === 2 ? 'block' : 'hidden'}>
		<div class="modern-card rounded-2xl p-5 sm:p-7 shadow-sm border border-border-color">
			<div class="mb-6 pb-4 border-b border-border-color">
				<h2 class="text-lg sm:text-xl font-bold text-text-color font-sans">Thông tin sách</h2>
				<p class="text-sm text-text-mute mt-1">
					Dùng để ghi metadata, tạo trang lót sách và thông tin xuất bản
				</p>
			</div>

			<EpubMetadataSection {epubState} />

			<div
				class="mt-8 pt-5 border-t border-border-color flex justify-between items-center gap-3 flex-wrap sm:flex-nowrap"
			>
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
	</div>

	<!-- Step 3: Bìa và hoa văn -->
	<div class={currentStep === 3 ? 'block' : 'hidden'}>
		<div class="modern-card rounded-2xl p-5 sm:p-7 shadow-sm border border-border-color">
			<div class="mb-6 pb-4 border-b border-border-color">
				<h2 class="text-lg sm:text-xl font-bold text-text-color font-sans">Bìa và hoa văn</h2>
				<p class="text-sm text-text-mute mt-1">
					Thêm ảnh bìa sách, họa tiết trang trí đầu chương và ảnh minh họa cho nội dung
				</p>
			</div>

			<div class="space-y-5">
				<EpubCoverSection {epubState} />

				<div class="pt-5 border-t border-border-color/70">
					<EpubOrnamentsSection {epubState} />
				</div>

				<div class="pt-5 border-t border-border-color/70">
					<EpubIllustrationsSection {epubState} />
				</div>
			</div>

			<div
				class="mt-6 pt-4 border-t border-border-color flex justify-between items-center gap-3 flex-wrap sm:flex-nowrap"
			>
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
	</div>

	<!-- Step 4: Phông chữ -->
	<div class={currentStep === 4 ? 'block' : 'hidden'}>
		<div class="modern-card rounded-2xl p-5 sm:p-7 shadow-sm border border-border-color">
			<div class="mb-6 pb-4 border-b border-border-color">
				<h2 class="text-lg sm:text-xl font-bold text-text-color font-sans">Thiết lập phông chữ</h2>
				<p class="text-sm text-text-mute mt-1">
					Tùy biến phông chữ cho tiêu đề, phân đoạn và chữ hoa đầu chương
				</p>
			</div>

			<EpubFontSettingsSection {epubState} />

			<div
				class="mt-8 pt-5 border-t border-border-color flex justify-between items-center gap-3 flex-wrap sm:flex-nowrap"
			>
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
	</div>

	<!-- Step 5: Đóng gói -->
	<div class={currentStep === 5 ? 'block' : 'hidden'}>
		<div class="modern-card rounded-2xl p-5 sm:p-7 shadow-sm border border-border-color">
			<div class="mb-6 pb-4 border-b border-border-color">
				<h2 class="text-lg sm:text-xl font-bold text-text-color font-sans">Đóng gói sách</h2>
				<p class="text-sm text-text-mute mt-1">
					Kiểm tra lại toàn bộ thông tin sách trước khi tạo file EPUB tiêu chuẩn
				</p>
			</div>

			<div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
				<!-- Cột trái: Tóm tắt sách và các nút điều chỉnh -->
				<div class="lg:col-span-7 space-y-4">
					<div class="p-4 sm:p-5 rounded-xl bg-panel-2 border border-border-color">
						<div class="flex items-center justify-between pb-3 mb-4 border-b border-border-color">
							<h3
								class="text-sm sm:text-base font-bold text-text-color font-sans flex items-center gap-2"
							>
								<svg
									class="w-4 h-4 text-accent-color shrink-0"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
									stroke-width="2"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
									/>
								</svg>
								Tóm tắt thông tin sách
							</h3>
							{#if hasChapters}
								<span
									class="text-xs px-2.5 py-0.5 rounded-full bg-accent-soft text-accent-color font-semibold"
								>
									{epubState.source.epubChapters.length} chương
								</span>
							{:else}
								<span class="text-xs px-2.5 py-0.5 rounded-full bg-panel text-text-mute">
									Chưa có chương
								</span>
							{/if}
						</div>

						<!-- Cover and Key-Value List -->
						<div class="flex flex-col sm:flex-row gap-5 items-start">
							<!-- Cover Thumbnail / Placeholder -->
							<div class="shrink-0 mx-auto sm:mx-0">
								{#if epubState.images.coverOriginalUrl}
									<div
										class="relative w-28 h-40 rounded-xl overflow-hidden border border-border-color shadow-sm bg-panel"
									>
										<img
											src={epubState.images.coverOriginalUrl}
											alt="Bìa sách"
											class="w-full h-full object-cover"
										/>
									</div>
								{:else}
									<div
										class="w-28 h-40 rounded-xl border-2 border-dashed border-border-color bg-panel flex flex-col items-center justify-center p-2 text-center"
									>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											fill="none"
											viewBox="0 0 24 24"
											stroke-width="1.5"
											stroke="currentColor"
											class="w-6 h-6 text-text-mute mb-1"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
											/>
										</svg>
										<span class="text-xs text-text-mute">Chưa có bìa</span>
										<button
											type="button"
											onclick={() => (currentStep = 3)}
											class="mt-1 text-xs text-accent-color hover:underline cursor-pointer font-medium"
										>
											+ Thêm bìa
										</button>
									</div>
								{/if}
							</div>

							<!-- Detailed rows with edit buttons -->
							<div class="flex-1 w-full space-y-2.5 text-xs sm:text-sm">
								<!-- Row 1: Source -->
								<div class="flex items-center justify-between pb-2 border-b border-border-color/60">
									<div class="min-w-0 pr-2">
										<span class="text-text-mute block text-xs">Nguồn tài liệu</span>
										<span class="text-text-color font-medium truncate block">
											{hasChapters
												? `${epubState.source.epubChapters.filter((c) => c.isChapter !== false).length} chương`
												: 'Chưa tải file'}
										</span>
									</div>
									<button
										type="button"
										onclick={() => (currentStep = 1)}
										class="text-xs text-accent-color hover:underline font-medium inline-flex items-center gap-1 cursor-pointer shrink-0"
									>
										Sửa nguồn <span aria-hidden="true">→</span>
									</button>
								</div>

								<!-- Row 2: Metadata -->
								<div class="flex items-start justify-between pb-2 border-b border-border-color/60">
									<div class="min-w-0 pr-2">
										<span class="text-text-mute block text-xs">Tên sách & Tác giả</span>
										<span class="text-text-color font-medium truncate block">
											{epubState.metadata.title || 'Chưa đặt tiêu đề'}
										</span>
										<span class="text-text-mute text-xs truncate block">
											{epubState.metadata.author || 'Chưa đặt tác giả'}
										</span>
									</div>
									<button
										type="button"
										onclick={() => (currentStep = 2)}
										class="text-xs text-accent-color hover:underline font-medium inline-flex items-center gap-1 cursor-pointer shrink-0 pt-0.5"
									>
										Sửa thông tin <span aria-hidden="true">→</span>
									</button>
								</div>

								<!-- Row 3: Cover & Ornaments -->
								<div class="flex items-center justify-between pb-2 border-b border-border-color/60">
									<div class="min-w-0 pr-2">
										<span class="text-text-mute block text-xs">Bìa và hoa văn</span>
										<span class="text-text-color font-medium truncate block">
											{epubState.images.coverOriginalUrl ? 'Có bìa sách' : 'Chưa bìa'} •
											{epubState.images.chapterOrnamentFile ||
											epubState.images.subchapterOrnamentFile
												? 'Có hoa văn'
												: 'Không hoa văn'}
											{#if epubState.images.illustrationFiles.length > 0}
												• {epubState.images.illustrationFiles.length} minh họa
											{/if}
										</span>
									</div>
									<button
										type="button"
										onclick={() => (currentStep = 3)}
										class="text-xs text-accent-color hover:underline font-medium inline-flex items-center gap-1 cursor-pointer shrink-0"
									>
										Sửa bìa <span aria-hidden="true">→</span>
									</button>
								</div>

								<!-- Row 4: Fonts -->
								<div class="flex items-center justify-between">
									<div class="min-w-0 pr-2">
										<span class="text-text-mute block text-xs">Phông chữ tiêu đề</span>
										<span
											class="text-text-color font-medium truncate block"
											style={epubState.fonts.h1Font === 'default'
												? "font-family: 'Bookerly', serif;"
												: undefined}
										>
											{epubState.fonts.h1Font !== 'default'
												? epubState.fonts.h1Font
												: 'Mặc định (Bookerly)'}
										</span>
									</div>
									<button
										type="button"
										onclick={() => (currentStep = 4)}
										class="text-xs text-accent-color hover:underline font-medium inline-flex items-center gap-1 cursor-pointer shrink-0"
									>
										Sửa phông <span aria-hidden="true">→</span>
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>

				<!-- Cột phải: Đóng gói và xuất bản file EPUB -->
				<div class="lg:col-span-5 space-y-4">
					<div class="p-4 sm:p-5 rounded-xl bg-panel-2 border border-border-color space-y-4">
						{#if hasChapters}
							<div
								class="flex items-center gap-2 px-3 py-2 rounded-xl bg-ok/10 border border-ok/25 text-ok text-xs font-semibold"
							>
								<svg
									class="w-4 h-4 shrink-0"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2.5"
								>
									<path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
								</svg>
								<span>Đã đủ để đóng gói file EPUB</span>
							</div>
						{:else}
							<div
								class="flex items-center gap-2 px-3 py-2 rounded-xl bg-warn/10 border border-warn/25 text-warn text-xs font-semibold"
							>
								<span>Chưa có nội dung sách. Vui lòng nạp file ở Bước 1.</span>
							</div>
						{/if}

						<EpubPackSection {epubState} onDownload={downloadEpub} />
					</div>
				</div>
			</div>

			<div class="mt-8 pt-5 border-t border-border-color flex justify-start">
				<div class="w-full sm:w-auto min-w-40">
					<Button variant="secondary" onclick={() => (currentStep = 4)}>
						← Quay lại: Phông chữ
					</Button>
				</div>
			</div>
		</div>
	</div>
</div>

<!-- Modals -->
<EpubSyntaxModal bind:show={showSyntaxModal} />
