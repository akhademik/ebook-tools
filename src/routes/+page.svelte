<div class="mb-10 animate-fade-in">
	<h1 class="font-mono text-3xl font-bold mb-2 tracking-tight text-text-color">Bàn làm việc</h1>
	<p class="text-text-mute text-base max-w-xl leading-relaxed">Bộ công cụ xử lý sách điện tử trực tiếp trên trình duyệt.</p>
</div>

<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
	<a href="/pdf" class="group modern-card rounded-2xl p-7 flex flex-col transition-all duration-200">
		<div class="flex items-center justify-between mb-5">
			<span class="font-mono text-xs text-text-mute border border-border-color px-2.5 py-1 rounded-lg">01</span>
			<div class="text-2xl">📄</div>
		</div>
		<h3 class="text-lg font-semibold mb-2.5 text-text-color">PDF → JPG</h3>
		<p class="text-text-mute text-sm leading-relaxed mb-6 flex-1">Xuất trang PDF thành ảnh JPG xám độ tương phản cao, hỗ trợ xem trước và cắt lề header/footer.</p>
		<div class="text-center font-mono text-sm tracking-wide py-3 px-5 rounded-xl bg-accent-color text-white font-semibold transition-all duration-150 hover:bg-accent-hover active:scale-[0.98]">Mở công cụ</div>
	</a>

	<a href="/md" class="group modern-card rounded-2xl p-7 flex flex-col transition-all duration-200">
		<div class="flex items-center justify-between mb-5">
			<span class="font-mono text-xs text-text-mute border border-border-color px-2.5 py-1 rounded-lg">02</span>
			<div class="text-2xl">✍️</div>
		</div>
		<h3 class="text-lg font-semibold mb-2.5 text-text-color">Markdown Fixer</h3>
		<p class="text-text-mute text-sm leading-relaxed mb-6 flex-1">Chuẩn hóa chữ in nghiêng và đậm nghiêng từ file ZIP thô bằng định dạng tùy biến.</p>
		<div class="text-center font-mono text-sm tracking-wide py-3 px-5 rounded-xl bg-accent-color text-white font-semibold transition-all duration-150 hover:bg-accent-hover active:scale-[0.98]">Mở công cụ</div>
	</a>

	<a href="/epub" class="group modern-card rounded-2xl p-7 flex flex-col transition-all duration-200">
		<div class="flex items-center justify-between mb-5">
			<span class="font-mono text-xs text-text-mute border border-border-color px-2.5 py-1 rounded-lg">03</span>
			<div class="text-2xl">📦</div>
		</div>
		<h3 class="text-lg font-semibold mb-2.5 text-text-color">Đóng gói EPUB</h3>
		<p class="text-text-mute text-sm leading-relaxed mb-6 flex-1">Chuyển đổi tệp Markdown thành sách điện tử EPUB hoàn chỉnh với mục lục tự động.</p>
		<div class="text-center font-mono text-sm tracking-wide py-3 px-5 rounded-xl bg-accent-color text-white font-semibold transition-all duration-150 hover:bg-accent-hover active:scale-[0.98]">Mở công cụ</div>
	</a>
</div>

<style>
	.animate-fade-in {
		animation: fadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
	}
	@keyframes fadeIn {
		from { opacity: 0; transform: translateY(6px); }
		to { opacity: 1; transform: translateY(0); }
	}
</style>
