<script lang="ts">
	import PageHeader from '$lib/components/PageHeader.svelte';
</script>

<PageHeader
	title="TXT → PDF CJK"
	description="Giới thiệu và tải xuống công cụ chuyển đổi tài liệu chữ Hán chuyên dụng cho Desktop."
/>

<div class="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in" style="animation-delay: 0.1s;">
	<!-- Left 2 columns: Description & Features -->
	<div class="lg:col-span-2 flex flex-col gap-6">
		<!-- Introduction Card -->
		<div class="modern-card rounded-2xl p-7 flex flex-col gap-4">
			<div class="flex items-center gap-3">
				<div
					class="w-10 h-10 rounded-xl bg-accent-soft text-accent-color flex items-center justify-center shrink-0"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="1.75"
						stroke="currentColor"
						class="w-5 h-5"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0V12a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 12V5.25"
						/>
					</svg>
				</div>
				<h2 class="text-xl font-bold text-text-color">Giới thiệu Công cụ</h2>
			</div>
			<p class="text-text-color text-base leading-relaxed">
				<strong>TXT → PDF CJK</strong> là một công cụ chạy trên hệ điều hành Windows, hoạt động độc
				lập (không cần cài đặt) giúp chuyển đổi file
				<code>.txt</code> chữ Hán sang PDF. Điểm đặc biệt của công cụ này là khả năng giữ đúng font chữ
				và ký tự, kể cả những chữ cực kỳ hiếm hoặc các ký tự PUA (Private Use Areas) mà font thông thường
				không hiển thị được.
			</p>
			<p class="text-text-mute text-sm leading-relaxed">
				Công cụ được thiết kế tối ưu cho việc chuẩn bị học liệu, tài liệu đọc hoặc dữ liệu đầu vào
				cho các mô hình AI tiên tiến như NotebookLM.
			</p>
		</div>

		<!-- Features Grid -->
		<div class="modern-card rounded-2xl p-7 flex flex-col gap-5">
			<div class="flex items-center gap-3 mb-2">
				<div
					class="w-10 h-10 rounded-xl bg-amber-soft text-amber-color flex items-center justify-center shrink-0"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="1.75"
						stroke="currentColor"
						class="w-5 h-5"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z"
						/>
					</svg>
				</div>
				<h2 class="text-xl font-bold text-text-color">Tính năng Nổi bật</h2>
			</div>

			<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div class="flex gap-3">
					<div
						class="w-8 h-8 rounded-lg bg-accent-soft text-accent-color flex items-center justify-center shrink-0 mt-0.5"
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
								d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
							/>
						</svg>
					</div>
					<div>
						<h4 class="font-semibold text-text-color mb-1">Tự nhận diện Encoding</h4>
						<p class="text-text-mute text-sm leading-relaxed">
							Tự động phát hiện bảng mã (GB18030, GBK, UTF-8...) của file văn bản gốc và chuẩn hóa
							về dạng thống nhất.
						</p>
					</div>
				</div>

				<div class="flex gap-3">
					<div
						class="w-8 h-8 rounded-lg bg-accent-soft text-accent-color flex items-center justify-center shrink-0 mt-0.5"
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
								d="M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.64.64 0 0 1-.657.643 48.39 48.39 0 0 1-4.163-.3c.186 1.522 1.455 2.7 3.018 2.7h.004c.484 0 .937-.156 1.309-.422a2.25 2.25 0 0 1 2.986 0c.372.266.825.422 1.309.422h.004c1.563 0 2.832-1.178 3.018-2.7a48.39 48.39 0 0 1-4.163.3.64.64 0 0 1-.657-.643v0Z"
							/>
						</svg>
					</div>
					<div>
						<h4 class="font-semibold text-text-color mb-1">Xử lý ký tự PUA hiếm</h4>
						<p class="text-text-mute text-sm leading-relaxed">
							Tự động ánh xạ các chữ PUA bị lỗi sang chữ Hán chuẩn, hoặc xuất báo cáo chi tiết kèm
							ngữ cảnh để đối chiếu.
						</p>
					</div>
				</div>

				<div class="flex gap-3">
					<div
						class="w-8 h-8 rounded-lg bg-accent-soft text-accent-color flex items-center justify-center shrink-0 mt-0.5"
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
								d="M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 0 1 6-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 0 1-3.827-5.802"
							/>
						</svg>
					</div>
					<div>
						<h4 class="font-semibold text-text-color mb-1">Font CJK Nhúng Sẵn</h4>
						<p class="text-text-mute text-sm leading-relaxed">
							Nhúng trực tiếp Noto Serif CJK và HanaMin dự phòng, bảo đảm PDF hiển thị hoàn hảo mọi
							chữ cổ, chữ hiếm.
						</p>
					</div>
				</div>

				<div class="flex gap-3">
					<div
						class="w-8 h-8 rounded-lg bg-accent-soft text-accent-color flex items-center justify-center shrink-0 mt-0.5"
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
								d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 0 1 1.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.559.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.894.149c-.424.07-.764.383-.929.78-.165.398-.143.854.107 1.204l.527.738c.32.447.27.1.06-.12l-.773.773a1.125 1.125 0 0 1-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.398.165-.71.505-.781.929l-.15.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.27-1.45-.12l-.773-.774a1.125 1.125 0 0 1-.12-1.45l.527-.737c.25-.35.272-.806.108-1.204-.165-.397-.506-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.108-1.204l-.527-.738a1.125 1.125 0 0 1 .12-1.45l.773-.773a1.125 1.125 0 0 1 1.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894Z"
							/>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
							/>
						</svg>
					</div>
					<div>
						<h4 class="font-semibold text-text-color mb-1">Xuất PDF Đa Chế Độ</h4>
						<p class="text-text-mute text-sm leading-relaxed">
							Hỗ trợ gộp thành 1 file duy nhất, chia nhỏ theo giới hạn NotebookLM hoặc chia theo
							dung lượng tùy chỉnh.
						</p>
					</div>
				</div>

				<div class="flex gap-3">
					<div
						class="w-8 h-8 rounded-lg bg-accent-soft text-accent-color flex items-center justify-center shrink-0 mt-0.5"
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
								d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z"
							/>
						</svg>
					</div>
					<div>
						<h4 class="font-semibold text-text-color mb-1">Phân tích trước khi tạo</h4>
						<p class="text-text-mute text-sm leading-relaxed">
							Cho phép quét kiểm tra ký tự thiếu mapping trước khi thực hiện convert để tiết kiệm
							thời gian.
						</p>
					</div>
				</div>

				<div class="flex gap-3">
					<div
						class="w-8 h-8 rounded-lg bg-red-500/15 text-red-500 flex items-center justify-center shrink-0 mt-0.5"
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
								d="M5.25 7.5A2.25 2.25 0 0 1 7.5 5.25h9a2.25 2.25 0 0 1 2.25 2.25v9a2.25 2.25 0 0 1-2.25 2.25h-9a2.25 2.25 0 0 1-2.25-2.25v-9Z"
							/>
						</svg>
					</div>
					<div>
						<h4 class="font-semibold text-text-color mb-1">Kiểm soát Tiến trình</h4>
						<p class="text-text-mute text-sm leading-relaxed">
							Hỗ trợ nút dừng giữa chừng để hủy bỏ tiến trình một cách an toàn mà không làm đơ ứng
							dụng.
						</p>
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- Right column: Download and specifications -->
	<div class="flex flex-col gap-6">
		<!-- Download Card -->
		<div
			class="modern-card rounded-2xl p-7 flex flex-col gap-6 text-center border border-accent-color/30 bg-accent-soft/5"
		>
			<div
				class="mx-auto w-16 h-16 rounded-2xl bg-accent-soft border border-accent-color/30 flex items-center justify-center text-accent-color shadow-xs"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="1.75"
					stroke="currentColor"
					class="w-8 h-8"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
					/>
				</svg>
			</div>
			<div>
				<h3 class="text-xl font-bold text-text-color mb-1">Tải xuống Phần mềm</h3>
				<p class="text-text-mute text-sm">Bản chính thức dành cho Windows</p>
			</div>

			<a
				href="https://github.com/akhademik/ebook-tools/releases/latest/download/txt-to-pdf.zip"
				download="txt-to-pdf.zip"
				class="flex items-center justify-center gap-3 font-mono text-base tracking-wide py-4 px-6 rounded-xl bg-accent-color text-white font-semibold transition-all duration-150 hover:bg-accent-hover hover:shadow-md active:scale-[0.98]"
			>
				<!-- Download icon -->
				<svg
					class="w-5 h-5"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2.5"
						d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
					></path>
				</svg>
				Tải txt-to-pdf.zip
			</a>

			<div class="border-t border-border-color pt-4 flex flex-col gap-2.5 text-left text-sm">
				<div class="flex justify-between">
					<span class="text-text-mute">Phiên bản:</span>
					<span class="font-semibold text-text-color">v1.0.0</span>
				</div>
				<div class="flex justify-between">
					<span class="text-text-mute">Kích thước file:</span>
					<span class="font-semibold text-text-color">~80.0 MB</span>
				</div>
				<div class="flex justify-between">
					<span class="text-text-mute">Hệ điều hành:</span>
					<span class="font-semibold text-text-color">Windows (x64)</span>
				</div>
				<div class="flex justify-between">
					<span class="text-text-mute">Kiểu chạy:</span>
					<span class="font-semibold text-text-color">Độc lập (Portable)</span>
				</div>
			</div>
		</div>

		<!-- Instructions Card -->
		<div class="modern-card rounded-2xl p-7 flex flex-col gap-4">
			<h4 class="font-bold text-text-color flex items-center gap-2">
				<span>💡</span> Hướng dẫn nhanh
			</h4>
			<ol class="list-decimal pl-5 text-sm text-text-mute flex flex-col gap-2">
				<li>Tải file <strong>txt-to-pdf.zip</strong> về máy tính.</li>
				<li>Giải nén thư mục bằng công cụ có sẵn hoặc WinRAR/7-Zip.</li>
				<li>
					Chạy trực tiếp file <code>txt-to-pdf.exe</code> bên trong thư mục vừa giải nén.
				</li>
				<li>
					Kéo thả file <code>.txt</code> chữ Hán vào giao diện và nhấn
					<strong>Convert</strong>.
				</li>
			</ol>
		</div>
	</div>
</div>

<style>
	.animate-fade-in {
		animation: fadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) both;
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
