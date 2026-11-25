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
				class="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-border-color flex justify-between items-center bg-panel-2"
			>
				<div class="flex items-center gap-2 sm:gap-2.5 min-w-0">
					<div
						class="w-8 h-8 rounded-lg bg-accent-soft text-accent-color flex items-center justify-center shrink-0"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke-width="1.75"
							stroke="currentColor"
							class="w-4 h-4"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z"
							/>
						</svg>
					</div>
					<div class="min-w-0">
						<h3 class="font-sans text-sm sm:text-base font-bold text-text-color truncate">
							Kiểm định EPUB & Kobo
						</h3>
						<p class="text-xs text-text-mute truncate hidden sm:block">
							Kiểm tra cấu trúc, thẻ XHTML, TOC, Font và độ tương thích máy đọc sách
						</p>
					</div>
				</div>
				<button
					type="button"
					class="w-8 h-8 rounded-lg border border-border-color bg-panel hover:bg-panel-2 text-text-mute hover:text-text-color flex items-center justify-center cursor-pointer transition-colors shrink-0"
					onclick={handleClose}
					aria-label="Đóng modal"
				>
					<svg
						class="w-4 h-4"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
					>
						<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>

			<!-- Profile Selector Tabs -->
			<div
				class="px-4 sm:px-6 pt-3 sm:pt-4 pb-2.5 border-b border-border-color bg-panel/50 flex items-center gap-2 flex-wrap"
			>
				<span class="text-xs text-text-mute font-semibold mr-1 w-full sm:w-auto mb-1 sm:mb-0"
					>Hồ sơ kiểm định:</span
				>
				<button
					type="button"
					class="px-3 py-1.5 rounded-lg text-xs font-sans font-medium cursor-pointer transition-colors {selectedProfile ===
					'kobo'
						? 'bg-accent-soft text-accent-color font-bold border border-accent-color/30'
						: 'bg-panel-2 text-text-mute hover:text-text-color border border-border-color'}"
					onclick={() => handleProfileChange('kobo')}
				>
					Kobo Compatibility
				</button>
				<button
					type="button"
					class="px-3 py-1.5 rounded-lg text-xs font-sans font-medium cursor-pointer transition-colors {selectedProfile ===
					'epub3'
						? 'bg-accent-soft text-accent-color font-bold border border-accent-color/30'
						: 'bg-panel-2 text-text-mute hover:text-text-color border border-border-color'}"
					onclick={() => handleProfileChange('epub3')}
				>
					EPUB 3.0
				</button>
				<button
					type="button"
					class="px-3 py-1.5 rounded-lg text-xs font-sans font-medium cursor-pointer transition-colors inline-flex items-center gap-1.5 {selectedProfile ===
					'generic'
						? 'bg-accent-soft text-accent-color font-bold border border-accent-color/30'
						: 'bg-sidebar-bg text-text-mute hover:text-text-color border border-border-color'}"
					onclick={() => handleProfileChange('generic')}
				>
					<svg
						class="w-3.5 h-3.5 shrink-0"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
					>
						<circle cx="12" cy="12" r="10" />
						<line x1="2" x2="22" y1="12" y2="12" />
						<path
							d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"
						/>
					</svg>
					<span>Generic EPUB</span>
				</button>
			</div>

			<!-- Body Content -->
			<div class="p-4 sm:p-6 overflow-y-auto space-y-5">
				{#if isValidating}
					<div class="py-12 flex flex-col items-center justify-center text-center">
						<div
							class="w-8 h-8 border-2 border-accent-color border-t-transparent rounded-full animate-spin mb-3"
						></div>
						<p class="text-sm text-text-color font-sans font-medium">
							Đang kiểm định toàn diện file EPUB...
						</p>
					</div>
				{:else if validationResult}
					{@const res = validationResult}

					<!-- Summary Badges Card -->
					<div
						class="p-4 rounded-xl border {res.passed
							? 'bg-ok/10 border-ok/30'
							: 'bg-danger/10 border-danger/30'}"
					>
						<div class="flex items-center justify-between mb-3">
							<div class="flex items-center gap-2.5">
								{#if res.passed}
									<span
										class="w-7 h-7 rounded-full bg-ok/20 text-ok flex items-center justify-center shrink-0"
									>
										<svg
											class="w-4 h-4"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											stroke-width="2.5"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												d="m4.5 12.75 6 6 9-13.5"
											/>
										</svg>
									</span>
								{:else}
									<span
										class="w-7 h-7 rounded-full bg-danger/20 text-danger flex items-center justify-center shrink-0"
									>
										<svg
											class="w-4 h-4"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											stroke-width="2"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
											/>
										</svg>
									</span>
								{/if}
								<div>
									<h4 class="text-sm font-bold font-sans {res.passed ? 'text-ok' : 'text-danger'}">
										{res.passed
											? 'File EPUB đạt chuẩn kiểm định!'
											: `Phát hiện ${res.errorCount} lỗi cần khắc phục`}
									</h4>
									<p class="text-xs text-text-mute font-sans">
										{res.warningCount} cảnh báo • {res.infoCount} lưu ý
									</p>
								</div>
							</div>

							<button
								type="button"
								class="px-3 py-1.5 bg-panel border border-border-color text-text-color hover:bg-hover-bg rounded-lg text-xs font-sans font-medium cursor-pointer inline-flex items-center gap-1.5 transition-colors"
								onclick={runValidation}
							>
								<svg
									class="w-3.5 h-3.5 text-accent-color shrink-0"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
									/>
								</svg>
								<span>Quét lại</span>
							</button>
						</div>

						<!-- Categories status badges -->
						<div
							class="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-border-color/40 text-xs font-sans"
						>
							<div
								class="flex items-center gap-1.5 {res.summary.structure === 'pass'
									? 'text-ok'
									: 'text-danger'}"
							>
								{#if res.summary.structure === 'pass'}
									<svg
										class="w-3.5 h-3.5 shrink-0"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="2.5"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											d="m4.5 12.75 6 6 9-13.5"
										/>
									</svg>
								{:else}
									<svg
										class="w-3.5 h-3.5 shrink-0"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="2.5"
									>
										<path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
									</svg>
								{/if}
								<span>Cấu trúc file</span>
							</div>
							<div
								class="flex items-center gap-1.5 {res.summary.manifest === 'pass'
									? 'text-ok'
									: 'text-danger'}"
							>
								{#if res.summary.manifest === 'pass'}
									<svg
										class="w-3.5 h-3.5 shrink-0"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="2.5"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											d="m4.5 12.75 6 6 9-13.5"
										/>
									</svg>
								{:else}
									<svg
										class="w-3.5 h-3.5 shrink-0"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="2.5"
									>
										<path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
									</svg>
								{/if}
								<span>Manifest</span>
							</div>
							<div
								class="flex items-center gap-1.5 {res.summary.spine === 'pass'
									? 'text-ok'
									: 'text-danger'}"
							>
								{#if res.summary.spine === 'pass'}
									<svg
										class="w-3.5 h-3.5 shrink-0"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="2.5"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											d="m4.5 12.75 6 6 9-13.5"
										/>
									</svg>
								{:else}
									<svg
										class="w-3.5 h-3.5 shrink-0"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="2.5"
									>
										<path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
									</svg>
								{/if}
								<span>Spine thứ tự</span>
							</div>
							<div
								class="flex items-center gap-1.5 {res.summary.toc === 'pass'
									? 'text-ok'
									: 'text-danger'}"
							>
								{#if res.summary.toc === 'pass'}
									<svg
										class="w-3.5 h-3.5 shrink-0"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="2.5"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											d="m4.5 12.75 6 6 9-13.5"
										/>
									</svg>
								{:else}
									<svg
										class="w-3.5 h-3.5 shrink-0"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="2.5"
									>
										<path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
									</svg>
								{/if}
								<span>Mục lục TOC</span>
							</div>
							<div
								class="flex items-center gap-1.5 {res.summary.xhtml === 'pass'
									? 'text-ok'
									: 'text-danger'}"
							>
								{#if res.summary.xhtml === 'pass'}
									<svg
										class="w-3.5 h-3.5 shrink-0"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="2.5"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											d="m4.5 12.75 6 6 9-13.5"
										/>
									</svg>
								{:else}
									<svg
										class="w-3.5 h-3.5 shrink-0"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="2.5"
									>
										<path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
									</svg>
								{/if}
								<span>Thẻ XHTML</span>
							</div>
							<div
								class="flex items-center gap-1.5 {res.summary.fonts === 'pass'
									? 'text-ok'
									: 'text-warn'}"
							>
								{#if res.summary.fonts === 'pass'}
									<svg
										class="w-3.5 h-3.5 shrink-0"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="2.5"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											d="m4.5 12.75 6 6 9-13.5"
										/>
									</svg>
								{:else}
									<span class="w-3.5 text-center font-bold">!</span>
								{/if}
								<span>Phông chữ</span>
							</div>
							<div
								class="flex items-center gap-1.5 {res.summary.cover === 'pass'
									? 'text-ok'
									: 'text-warn'}"
							>
								{#if res.summary.cover === 'pass'}
									<svg
										class="w-3.5 h-3.5 shrink-0"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="2.5"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											d="m4.5 12.75 6 6 9-13.5"
										/>
									</svg>
								{:else}
									<span class="w-3.5 text-center font-bold">!</span>
								{/if}
								<span>Ảnh bìa Cover</span>
							</div>
						</div>
					</div>

					<!-- Issues Details List -->
					{#if res.issues.length > 0}
						<div class="space-y-2">
							<span class="text-xs text-text-mute uppercase block font-semibold font-sans">
								Chi tiết vấn đề ({res.issues.length}):
							</span>

							<div class="space-y-2 max-h-72 overflow-y-auto pr-1">
								{#each res.issues as issue, idx (issue.category + '-' + (issue.file || '') + '-' + idx)}
									<div
										class="p-3 rounded-xl border text-xs {issue.severity === 'error'
											? 'bg-danger/10 border-danger/30'
											: issue.severity === 'warning'
												? 'bg-warn/10 border-warn/30'
												: 'bg-accent-soft border-accent-color/30'}"
									>
										<div class="flex items-start gap-2">
											{#if issue.severity === 'error'}
												<span class="w-2 h-2 rounded-full bg-danger mt-1 shrink-0"></span>
											{:else if issue.severity === 'warning'}
												<span class="w-2 h-2 rounded-full bg-warn mt-1 shrink-0"></span>
											{:else}
												<span class="w-2 h-2 rounded-full bg-accent-color mt-1 shrink-0"></span>
											{/if}
											<div class="space-y-1 min-w-0">
												<div
													class="font-semibold font-sans {issue.severity === 'error'
														? 'text-danger'
														: issue.severity === 'warning'
															? 'text-warn'
															: 'text-accent-color'}"
												>
													{issue.message}
												</div>
												{#if issue.file}
													<div class="text-xs text-text-mute">
														file: <span class="text-text-color font-mono">{issue.file}</span>
													</div>
												{/if}
												{#if issue.suggestion}
													<div class="text-xs text-ok flex items-start gap-1 font-sans">
														<svg
															class="w-3.5 h-3.5 text-ok shrink-0 mt-0.5"
															viewBox="0 0 24 24"
															fill="none"
															stroke="currentColor"
															stroke-width="2"
														>
															<path
																stroke-linecap="round"
																stroke-linejoin="round"
																d="M12 18v-5.25m0 0a6.002 6.002 0 0 0-4-5.659V5a2 2 0 1 1 4 0v2.091c1.554.743 2.766 2.08 3.25 3.734m-3.25-.575v.001ZM12 18a2.25 2.25 0 0 0 2.25-2.25H9.75A2.25 2.25 0 0 0 12 18Z"
															/>
														</svg>
														<span>Gợi ý: {issue.suggestion}</span>
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
				class="px-4 sm:px-6 py-3.5 sm:py-4 border-t border-border-color bg-sidebar-bg flex justify-end items-center"
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
