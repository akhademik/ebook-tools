<div class="mb-8 animate-fade-in">
	<div class="flex flex-wrap items-center gap-3 mb-2">
		<h1 class="font-sans text-2xl sm:text-3xl font-bold tracking-tight text-text-color">
			Bàn làm việc
		</h1>
	</div>
	<p class="text-text-mute font-sans text-sm sm:text-base max-w-2xl leading-relaxed">
		Bộ công cụ làm ebook trong trình duyệt.
	</p>
</div>

<div class="space-y-10 animate-fade-in">
	<!-- 1. Bắt đầu với (2 thẻ lớn) -->
	<section>
		<div class="flex items-center gap-2.5 mb-4">
			<h2 class="text-xs font-semibold uppercase tracking-wider text-text-mute font-sans">
				Bắt đầu với
			</h2>
			<div class="h-px flex-1 bg-border-color/60"></div>
		</div>

		<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
			<!-- Đóng gói EPUB -->
			<a
				href="/epub-packer"
				class="group modern-card rounded-2xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-200"
			>
				<div>
					<div class="flex items-center justify-between mb-5">
						<div
							class="w-12 h-12 rounded-xl bg-accent-soft text-accent-color flex items-center justify-center shrink-0 shadow-xs"
						>
							<svg
								class="w-6 h-6"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="1.8"
								stroke-linecap="round"
								stroke-linejoin="round"
							>
								<path d="m7.5 4.27 9 5.15" />
								<path
									d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"
								/>
								<path d="m3.3 7 8.7 5 8.7-5" />
								<path d="M12 22V12" />
							</svg>
						</div>
						<span
							class="text-xs text-accent-color bg-accent-soft border border-accent-color/20 px-2.5 py-1 rounded-lg font-semibold font-sans"
						>
							Chế bản chính
						</span>
					</div>

					<h3
						class="text-xl font-bold mb-2 text-text-color group-hover:text-accent-color transition-colors font-sans"
					>
						Đóng gói EPUB
					</h3>
					<p class="text-text-mute text-sm leading-relaxed mb-5 font-sans">
						Chuyển đổi file Markdown hoặc Text thành sách điện tử EPUB 3.0 tiêu chuẩn với bìa, trang
						lót jacket, font nhúng và mục lục tự động.
					</p>
				</div>

				<div
					class="pt-3 border-t border-border-color/50 flex items-center justify-between text-accent-color font-semibold text-sm font-sans"
				>
					<span>Mở công cụ</span>
					<span class="group-hover:translate-x-1 transition-transform" aria-hidden="true">→</span>
				</div>
			</a>

			<!-- EPUB Editor & Validator -->
			<a
				href="/epub-editor"
				class="group modern-card rounded-2xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-200"
			>
				<div>
					<div class="flex items-center justify-between mb-5">
						<div
							class="w-12 h-12 rounded-xl bg-accent-soft text-accent-color flex items-center justify-center shrink-0 shadow-xs"
						>
							<svg
								class="w-6 h-6"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="1.8"
								stroke-linecap="round"
								stroke-linejoin="round"
							>
								<path
									d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"
								/>
								<path d="m15 5 4 4" />
							</svg>
						</div>
						<span
							class="text-xs text-accent-color bg-accent-soft border border-accent-color/20 px-2.5 py-1 rounded-lg font-semibold font-sans"
						>
							Kiểm định & Biên tập
						</span>
					</div>

					<h3
						class="text-xl font-bold mb-2 text-text-color group-hover:text-accent-color transition-colors font-sans"
					>
						EPUB Editor & Validator
					</h3>
					<p class="text-text-mute text-sm leading-relaxed mb-5 font-sans">
						Mở và tinh chỉnh trực tiếp mã XHTML/CSS với Live Preview hai chiều, kiểm định tương
						thích máy đọc Kobo và dọn dẹp tài nguyên mồ côi.
					</p>
				</div>

				<div
					class="pt-3 border-t border-border-color/50 flex items-center justify-between text-accent-color font-semibold text-sm font-sans"
				>
					<span>Mở công cụ</span>
					<span class="group-hover:translate-x-1 transition-transform" aria-hidden="true">→</span>
				</div>
			</a>
		</div>
	</section>

	<!-- 3. Công cụ lẻ (danh sách thẻ ngang gọn) -->
	<section>
		<div class="flex items-center gap-2.5 mb-4">
			<h2 class="text-xs font-semibold uppercase tracking-wider text-text-mute font-sans">
				Công cụ lẻ & Mở rộng
			</h2>
			<div class="h-px flex-1 bg-border-color/60"></div>
		</div>

		<div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
			<!-- EPUB -> TXT -->
			<a
				href="/epub-to-txt"
				class="modern-card p-4 rounded-xl flex items-center justify-between hover:border-accent-color transition-all group"
			>
				<div class="flex items-center gap-3.5 min-w-0">
					<div
						class="w-10 h-10 rounded-lg bg-panel-2 border border-border-color flex items-center justify-center text-accent-color shrink-0"
					>
						<svg
							class="w-5 h-5"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="1.8"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
							<path d="M6 6h10" />
							<path d="M6 10h10" />
							<path d="M6 14h6" />
						</svg>
					</div>
					<div class="min-w-0">
						<h4
							class="text-sm font-semibold text-text-color group-hover:text-accent-color transition-colors font-sans truncate"
						>
							EPUB → TXT
						</h4>
						<p class="text-xs text-text-mute font-sans truncate">
							Trích xuất sách EPUB thành văn bản thuần sạch sẽ
						</p>
					</div>
				</div>
				<span
					class="text-text-mute group-hover:text-accent-color group-hover:translate-x-1 transition-all pl-2 shrink-0"
					aria-hidden="true"
				>
					→
				</span>
			</a>

			<!-- PDF -> JPG -->
			<a
				href="/pdf"
				class="modern-card p-4 rounded-xl flex items-center justify-between hover:border-accent-color transition-all group"
			>
				<div class="flex items-center gap-3.5 min-w-0">
					<div
						class="w-10 h-10 rounded-lg bg-panel-2 border border-border-color flex items-center justify-center text-accent-color shrink-0"
					>
						<svg
							class="w-5 h-5"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="1.8"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
							<circle cx="9" cy="9" r="2" />
							<path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
						</svg>
					</div>
					<div class="min-w-0">
						<h4
							class="text-sm font-semibold text-text-color group-hover:text-accent-color transition-colors font-sans truncate"
						>
							PDF → JPG
						</h4>
						<p class="text-xs text-text-mute font-sans truncate">
							Xuất trang PDF thành ảnh xám tương phản cao cho OCR
						</p>
					</div>
				</div>
				<span
					class="text-text-mute group-hover:text-accent-color group-hover:translate-x-1 transition-all pl-2 shrink-0"
					aria-hidden="true"
				>
					→
				</span>
			</a>

			<!-- TXT -> PDF CJK -->
			<a
				href="/txt-to-pdf"
				class="modern-card p-4 rounded-xl flex items-center justify-between hover:border-accent-color transition-all group"
			>
				<div class="flex items-center gap-3.5 min-w-0">
					<div
						class="w-10 h-10 rounded-lg bg-panel-2 border border-border-color flex items-center justify-center text-accent-color shrink-0"
					>
						<svg
							class="w-5 h-5"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="1.8"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<rect width="20" height="14" x="2" y="3" rx="2" />
							<line x1="8" x2="16" y1="21" y2="21" />
							<line x1="12" x2="12" y1="17" y2="21" />
						</svg>
					</div>
					<div class="min-w-0">
						<div class="flex items-center gap-2">
							<h4
								class="text-sm font-semibold text-text-color group-hover:text-accent-color transition-colors font-sans truncate"
							>
								TXT → PDF CJK
							</h4>
							<span
								class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-panel border border-border-color text-text-mute"
							>
								Desktop
							</span>
						</div>
						<p class="text-xs text-text-mute font-sans truncate">
							Xử lý văn bản chữ Hán/Nôm sang PDF tối ưu
						</p>
					</div>
				</div>
				<span
					class="text-text-mute group-hover:text-accent-color group-hover:translate-x-1 transition-all pl-2 shrink-0"
					aria-hidden="true"
				>
					→
				</span>
			</a>
		</div>
	</section>
</div>

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
