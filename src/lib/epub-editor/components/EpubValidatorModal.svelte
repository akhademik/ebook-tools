<!-- src/lib/epub-editor/components/EpubValidatorModal.svelte -->
<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import type { EpubEditorState } from '../epub-editor-state.svelte';
	import { validateEpub, type ValidationProfile, type ValidationResult } from '../epub-validator';

	interface Props {
		show?: boolean;
		editorState: EpubEditorState;
	}

	let { show = $bindable(false), editorState }: Props = $props();

	let selectedProfile = $state<ValidationProfile>('kobo');
	let isValidating = $state(false);
	let validationResult = $state<ValidationResult | null>(null);

	$effect(() => {
		if (show && editorState.zip) {
			runValidation();
		}
	});

	async function runValidation() {
		if (!editorState.zip) return;
		isValidating = true;
		try {
			validationResult = await validateEpub(
				editorState.zip,
				selectedProfile,
				editorState.editBuffer
			);
		} finally {
			isValidating = false;
		}
	}

	function handleProfileChange(profile: ValidationProfile) {
		selectedProfile = profile;
		runValidation();
	}

	function handleClose() {
		show = false;
	}
</script>

{#if show}
	<div
		class="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in"
		role="dialog"
		aria-modal="true"
	>
		<div
			class="bg-panel border border-border-color w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-slide-up"
		>
			<!-- Header -->
			<div
				class="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-border-color flex justify-between items-center bg-sidebar-bg"
			>
				<div class="flex items-center gap-2 sm:gap-2.5 min-w-0">
					<span class="text-xl shrink-0">🛡️</span>
					<div class="min-w-0">
						<h3 class="font-mono text-sm sm:text-base font-bold text-text-color truncate">
							Kiểm định EPUB & Kobo
						</h3>
						<p class="text-xs text-text-mute font-mono truncate hidden sm:block">
							Kiểm tra cấu trúc, thẻ XHTML, TOC, Font và độ tương thích máy đọc sách
						</p>
					</div>
				</div>
				<button
					type="button"
					class="w-8 h-8 rounded-lg border border-border-color bg-panel hover:bg-hover-bg text-text-mute hover:text-text-color flex items-center justify-center font-mono cursor-pointer transition-colors shrink-0"
					onclick={handleClose}
					aria-label="Đóng modal"
				>
					✕
				</button>
			</div>

			<!-- Profile Selector Tabs -->
			<div
				class="px-4 sm:px-6 pt-3 sm:pt-4 pb-2.5 border-b border-border-color bg-panel/50 flex items-center gap-2 flex-wrap"
			>
				<span
					class="font-mono text-xs text-text-mute uppercase font-semibold mr-1 w-full sm:w-auto mb-1 sm:mb-0"
					>Hồ sơ kiểm định:</span
				>
				<button
					type="button"
					class="px-3 py-1.5 rounded-lg text-xs font-mono cursor-pointer transition-colors {selectedProfile ===
					'kobo'
						? 'bg-accent-soft text-accent-color font-bold border border-accent-color/30'
						: 'bg-sidebar-bg text-text-mute hover:text-text-color border border-border-color'}"
					onclick={() => handleProfileChange('kobo')}
				>
					📖 Kobo Compatibility
				</button>
				<button
					type="button"
					class="px-3 py-1.5 rounded-lg text-xs font-mono cursor-pointer transition-colors {selectedProfile ===
					'epub3'
						? 'bg-accent-soft text-accent-color font-bold border border-accent-color/30'
						: 'bg-sidebar-bg text-text-mute hover:text-text-color border border-border-color'}"
					onclick={() => handleProfileChange('epub3')}
				>
					⚡ EPUB 3.0
				</button>
				<button
					type="button"
					class="px-3 py-1.5 rounded-lg text-xs font-mono cursor-pointer transition-colors {selectedProfile ===
					'generic'
						? 'bg-accent-soft text-accent-color font-bold border border-accent-color/30'
						: 'bg-sidebar-bg text-text-mute hover:text-text-color border border-border-color'}"
					onclick={() => handleProfileChange('generic')}
				>
					🌐 Generic EPUB
				</button>
			</div>

			<!-- Body Content -->
			<div class="p-6 overflow-y-auto space-y-5">
				{#if isValidating}
					<div class="py-12 flex flex-col items-center justify-center text-center">
						<div
							class="w-8 h-8 border-2 border-accent-color border-t-transparent rounded-full animate-spin mb-3"
						></div>
						<p class="font-mono text-sm text-text-color">Đang kiểm định toàn diện tệp EPUB...</p>
					</div>
				{:else if validationResult}
					{@const res = validationResult}

					<!-- Summary Badges Card -->
					<div
						class="p-4 rounded-xl border {res.passed
							? 'bg-emerald-500/10 border-emerald-500/30'
							: 'bg-red-500/10 border-red-500/30'}"
					>
						<div class="flex items-center justify-between mb-3">
							<div class="flex items-center gap-2">
								<span class="text-xl">{res.passed ? '✅' : '⚠️'}</span>
								<div>
									<h4
										class="font-mono text-sm font-bold {res.passed
											? 'text-emerald-400'
											: 'text-red-400'}"
									>
										{res.passed
											? 'Tệp EPUB đạt chuẩn kiểm định!'
											: `Phát hiện ${res.errorCount} lỗi cần khắc phục`}
									</h4>
									<p class="text-xs text-text-mute font-mono">
										{res.warningCount} cảnh báo • {res.infoCount} lưu ý
									</p>
								</div>
							</div>

							<button
								type="button"
								class="px-3 py-1 bg-panel border border-border-color text-text-color hover:bg-hover-bg rounded-lg font-mono text-xs cursor-pointer"
								onclick={runValidation}
							>
								🔄 Quét lại
							</button>
						</div>

						<!-- Categories status badges -->
						<div
							class="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-border-color/40 text-xs font-mono"
						>
							<div
								class="flex items-center gap-1.5 {res.summary.structure === 'pass'
									? 'text-emerald-400'
									: 'text-red-400'}"
							>
								<span>{res.summary.structure === 'pass' ? '✓' : '✗'}</span> Cấu trúc file
							</div>
							<div
								class="flex items-center gap-1.5 {res.summary.manifest === 'pass'
									? 'text-emerald-400'
									: 'text-red-400'}"
							>
								<span>{res.summary.manifest === 'pass' ? '✓' : '✗'}</span> Manifest
							</div>
							<div
								class="flex items-center gap-1.5 {res.summary.spine === 'pass'
									? 'text-emerald-400'
									: 'text-red-400'}"
							>
								<span>{res.summary.spine === 'pass' ? '✓' : '✗'}</span> Spine thứ tự
							</div>
							<div
								class="flex items-center gap-1.5 {res.summary.toc === 'pass'
									? 'text-emerald-400'
									: 'text-red-400'}"
							>
								<span>{res.summary.toc === 'pass' ? '✓' : '✗'}</span> Mục lục TOC
							</div>
							<div
								class="flex items-center gap-1.5 {res.summary.xhtml === 'pass'
									? 'text-emerald-400'
									: 'text-red-400'}"
							>
								<span>{res.summary.xhtml === 'pass' ? '✓' : '✗'}</span> Thẻ XHTML
							</div>
							<div
								class="flex items-center gap-1.5 {res.summary.fonts === 'pass'
									? 'text-emerald-400'
									: 'text-amber-400'}"
							>
								<span>{res.summary.fonts === 'pass' ? '✓' : '⚠'}</span> Phông chữ
							</div>
							<div
								class="flex items-center gap-1.5 {res.summary.cover === 'pass'
									? 'text-emerald-400'
									: 'text-amber-400'}"
							>
								<span>{res.summary.cover === 'pass' ? '✓' : '⚠'}</span> Ảnh bìa Cover
							</div>
						</div>
					</div>

					<!-- Issues Details List -->
					{#if res.issues.length > 0}
						<div class="space-y-2">
							<span class="font-mono text-xs text-text-mute uppercase block font-semibold">
								Chi tiết vấn đề ({res.issues.length}):
							</span>

							<div class="space-y-2 max-h-72 overflow-y-auto pr-1">
								{#each res.issues as issue, idx (issue.category + '-' + (issue.file || '') + '-' + idx)}
									<div
										class="p-3 rounded-xl border text-xs font-mono {issue.severity === 'error'
											? 'bg-red-500/10 border-red-500/30'
											: issue.severity === 'warning'
												? 'bg-amber-500/10 border-amber-500/30'
												: 'bg-blue-500/10 border-blue-500/30'}"
									>
										<div class="flex items-start gap-2">
											<span class="shrink-0"
												>{issue.severity === 'error'
													? '🔴'
													: issue.severity === 'warning'
														? '🟡'
														: 'ℹ️'}</span
											>
											<div class="space-y-1 min-w-0">
												<div
													class="font-semibold {issue.severity === 'error'
														? 'text-red-400'
														: issue.severity === 'warning'
															? 'text-amber-400'
															: 'text-blue-400'}"
												>
													{issue.message}
												</div>
												{#if issue.file}
													<div class="text-[11px] text-text-mute">
														Tệp: <span class="text-text-color">{issue.file}</span>
													</div>
												{/if}
												{#if issue.suggestion}
													<div class="text-[11px] text-emerald-400/90">
														💡 Gợi ý: {issue.suggestion}
													</div>
												{/if}
											</div>
										</div>
									</div>
								{/each}
							</div>
						</div>
					{/if}
				{/if}
			</div>

			<!-- Footer Buttons -->
			<div
				class="px-6 py-4 border-t border-border-color bg-sidebar-bg flex justify-end items-center"
			>
				<Button variant="primary" onclick={handleClose}>Đóng</Button>
			</div>
		</div>
	</div>
{/if}

<style>
	.animate-fade-in {
		animation: fadeIn 0.15s ease-out;
	}
	.animate-slide-up {
		animation: slideUp 0.2s cubic-bezier(0.16, 1, 0.3, 1);
	}
	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}
	@keyframes slideUp {
		from {
			opacity: 0;
			transform: translateY(12px) scale(0.98);
		}
		to {
			opacity: 1;
			transform: translateY(0) scale(1);
		}
	}
</style>
