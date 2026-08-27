<script lang="ts">
	interface Props {
		show?: boolean;
	}

	let { show = $bindable(false) }: Props = $props();
</script>

{#if show}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
		role="dialog"
		aria-modal="true"
	>
		<!-- Modal box -->
		<div
			class="bg-panel-1 border border-border-color w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-slide-up"
		>
			<!-- Header -->
			<div class="p-4 border-b border-border-color flex justify-between items-center bg-panel-2">
				<span class="font-mono text-sm font-bold text-text-color">Bảng quy ước</span>
				<button
					type="button"
					class="text-text-mute hover:text-text-color transition-colors font-mono text-xs font-bold"
					onclick={() => (show = false)}
				>
					Đóng
				</button>
			</div>

			<!-- Body -->
			<div class="p-6 overflow-y-auto flex-1 bg-brand-bg flex flex-col gap-4">
				<div class="overflow-x-auto">
					<table class="w-full text-left font-mono text-xs border-collapse text-text-color">
						<thead>
							<tr class="border-b border-border-color text-text-mute">
								<th class="py-2.5 px-3 whitespace-nowrap">Cú pháp trong TXT</th>
								<th class="py-2.5 px-3">Ý nghĩa & Cấu trúc HTML sinh ra</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-border-color">
							<tr>
								<td class="py-3 px-3 whitespace-nowrap"
									><code
										class="bg-brand-bg px-1.5 py-0.5 rounded border border-border-color text-accent-color"
										>@@ Tiêu đề</code
									></td
								>
								<td class="py-3 px-3">
									<code>&lt;h1 class="main-chap center"&gt;Tiêu đề&lt;/h1&gt;</code><br />
									<span class="text-[11px] text-text-mute"
										>Tách file gom nội dung — gom toàn bộ nội dung phía sau cho đến tiêu đề tiếp
										theo (có trong Mục lục / TOC).</span
									>
								</td>
							</tr>
							<tr>
								<td class="py-3 px-3 whitespace-nowrap"
									><code
										class="bg-brand-bg px-1.5 py-0.5 rounded border border-border-color text-accent-color"
										>@ Tiêu đề</code
									></td
								>
								<td class="py-3 px-3">
									<code>&lt;h2 class="side-chap center"&gt;Tiêu đề&lt;/h2&gt;</code><br />
									<span class="text-[11px] text-text-mute"
										>Tiêu đề phụ / Chương nhỏ — không tách file, có hiển thị trong Mục lục (TOC).</span
									>
								</td>
							</tr>
							<tr>
								<td class="py-3 px-3 whitespace-nowrap"
									><code
										class="bg-brand-bg px-1.5 py-0.5 rounded border border-border-color text-accent-color"
										>@! Tiêu đề</code
									></td
								>
								<td class="py-3 px-3">
									<code>&lt;h2 class="side-chap center no-toc"&gt;Tiêu đề&lt;/h2&gt;</code><br />
									<span class="text-[11px] text-text-mute"
										>Tiêu đề phụ / Chương nhỏ — không tách file, <strong>KHÔNG</strong> đưa vào Mục lục
										(TOC).</span
									>
								</td>
							</tr>
							<tr>
								<td class="py-3 px-3 whitespace-nowrap"
									><code
										class="bg-brand-bg px-1.5 py-0.5 rounded border border-border-color text-accent-color"
										>@@t / @t / @!t</code
									></td
								>
								<td class="py-3 px-3">
									<span class="text-text-mute">Hậu tố căn trái:</span>
									<code>t</code>
									&rarr; class <code>left</code> (e.g.
									<code>&lt;h1 class="main-chap left"&gt;</code>)
								</td>
							</tr>
							<tr>
								<td class="py-3 px-3 whitespace-nowrap"
									><code
										class="bg-brand-bg px-1.5 py-0.5 rounded border border-border-color text-accent-color"
										>@@p / @p / @!p</code
									></td
								>
								<td class="py-3 px-3">
									<span class="text-text-mute">Hậu tố căn phải:</span>
									<code>p</code>
									&rarr; class <code>right</code> (e.g.
									<code>&lt;h1 class="main-chap right"&gt;</code>)
								</td>
							</tr>
							<tr>
								<td class="py-3 px-3 whitespace-nowrap"
									><code
										class="bg-brand-bg px-1.5 py-0.5 rounded border border-border-color text-accent-color"
										>Không có hậu tố</code
									></td
								>
								<td class="py-3 px-3">
									<span class="text-text-mute">Căn giữa mặc định:</span> class
									<code>center</code>
									(e.g. <code>&lt;h1 class="main-chap center"&gt;</code>)
								</td>
							</tr>
							<tr>
								<td class="py-3 px-3 whitespace-nowrap"
									><code
										class="bg-brand-bg px-1.5 py-0.5 rounded border border-border-color text-accent-color"
										>~ Lời thoại</code
									></td
								>
								<td class="py-3 px-3">
									<code
										>&lt;blockquote class="center"&gt;&lt;p&gt;Lời
										thoại&lt;/p&gt;&lt;/blockquote&gt;</code
									><br />
									<span class="text-[11px] text-text-mute"
										>Quote / Lời thoại (hỗ trợ <code>~t</code> căn trái,
										<code>~p</code> căn phải).</span
									>
								</td>
							</tr>
							<tr>
								<td class="py-3 px-3 whitespace-nowrap"
									><code
										class="bg-brand-bg px-1.5 py-0.5 rounded border border-border-color text-accent-color"
										>&gt; Tác giả</code
									></td
								>
								<td class="py-3 px-3">
									<code>&lt;footer&gt;Tác giả&lt;/footer&gt;</code> (bên trong blockquote)<br />
									<span class="text-[11px] text-text-mute"
										>Chỉ có tác dụng khi đứng ngay sau dòng <code>~</code> trích dẫn.</span
									>
								</td>
							</tr>
							<tr>
								<td class="py-3 px-3 whitespace-nowrap"
									><code
										class="bg-brand-bg px-1.5 py-0.5 rounded border border-border-color text-accent-color"
										>###</code
									></td
								>
								<td class="py-3 px-3">
									<code>&lt;p class="scene-break-big" role="separator"&gt;• • •&lt;/p&gt;</code><br
									/>
									<span class="text-[11px] text-text-mute"
										>Dấu ngắt cảnh lớn (phải đứng riêng một dòng).</span
									>
								</td>
							</tr>
							<tr>
								<td class="py-3 px-3 whitespace-nowrap"
									><code
										class="bg-brand-bg px-1.5 py-0.5 rounded border border-border-color text-accent-color"
										>##</code
									></td
								>
								<td class="py-3 px-3">
									<code>&lt;p class="scene-break-small" role="separator"&gt;*&lt;/p&gt;</code><br />
									<span class="text-[11px] text-text-mute"
										>Dấu ngắt cảnh nhỏ (phải đứng riêng một dòng).</span
									>
								</td>
							</tr>
							<tr>
								<td class="py-3 px-3 whitespace-nowrap"
									><code
										class="bg-brand-bg px-1.5 py-0.5 rounded border border-border-color text-accent-color"
										>*in đậm*</code
									></td
								>
								<td class="py-3 px-3"><code>&lt;b&gt;in đậm&lt;/b&gt;</code></td>
							</tr>
							<tr>
								<td class="py-3 px-3 whitespace-nowrap"
									><code
										class="bg-brand-bg px-1.5 py-0.5 rounded border border-border-color text-accent-color"
										>/in nghiêng/</code
									></td
								>
								<td class="py-3 px-3"><code>&lt;i&gt;in nghiêng&lt;/i&gt;</code></td>
							</tr>
							<tr>
								<td class="py-3 px-3 whitespace-nowrap"
									><code
										class="bg-brand-bg px-1.5 py-0.5 rounded border border-border-color text-accent-color"
										>_gạch chân_</code
									></td
								>
								<td class="py-3 px-3"><code>&lt;u&gt;gạch chân&lt;/u&gt;</code></td>
							</tr>
							<tr>
								<td class="py-3 px-3 whitespace-nowrap">
									<code
										class="bg-brand-bg px-1.5 py-0.5 rounded border border-border-color text-accent-color"
										>&#123;n&#125;</code
									>
								</td>
								<td class="py-3 px-3">
									<span class="text-text-mute">Liên kết chú thích qua lại (Footnotes):</span><br />
									- Phải có một dòng riêng biệt ghi: <code>Chú thích</code> hoặc
									<code>Chú thích:</code>
									(chấp nhận mọi kiểu chữ hoa/thường, có hoặc không có dấu hai chấm).<br />
									- Chú thích đi theo cặp <code>&#123;n&#125;</code> (trong nội dung truyện) và
									<code>&#123;n&#125;</code>
									ở sau dòng
									<code>Chú thích</code>
									để tự động tạo liên kết và thẻ <code>&lt;aside&gt;</code> qua lại chính xác.
								</td>
							</tr>
							<tr>
								<td class="py-3 px-3 whitespace-nowrap"
									><code
										class="bg-brand-bg px-1.5 py-0.5 rounded border border-border-color text-accent-color"
										>[new]...[/new]</code
									><br />
									<code
										class="bg-brand-bg px-1.5 py-0.5 rounded border border-border-color text-accent-color mt-1 inline-block"
										>[new:center]...[/new]</code
									></td
								>
								<td class="py-3 px-3">
									<span class="text-text-mute">Gom thành 1 file XHTML / Căn giữa trang:</span><br />
									<span class="text-[11px] text-text-mute"
										><code>[new]</code>: Gom mọi nội dung bên trong vào 1 file XHTML duy nhất.<br />
										<code>[new:center]</code>: Tách thành 1 file XHTML và căn giữa toàn trang (sử
										dụng
										<code
											>&lt;section class="center-page"&gt;&lt;div
											class="center-page-content"&gt;...&lt;/div&gt;&lt;/section&gt;</code
										>).</span
									>
								</td>
							</tr>
							<tr>
								<td class="py-3 px-3 whitespace-nowrap">
									<code
										class="bg-brand-bg px-1.5 py-0.5 rounded border border-border-color text-accent-color"
										>[letter]...[/letter]</code
									>
								</td>
								<td class="py-3 px-3">
									<code>&lt;div class="letter"&gt;&lt;p&gt;...&lt;/p&gt;&lt;/div&gt;</code><br />
									<span class="text-[11px] text-text-mute"
										>Khối thư, mỗi dòng bên trong là 1 đoạn, có thụt lề riêng theo CSS.</span
									>
								</td>
							</tr>
							<tr>
								<td class="py-3 px-3 whitespace-nowrap">
									<code
										class="bg-brand-bg px-1.5 py-0.5 rounded border border-border-color text-accent-color"
										>[poem]...[/poem]</code
									>
								</td>
								<td class="py-3 px-3">
									<code>&lt;div class="poem"&gt;&lt;p&gt;...&lt;/p&gt;&lt;/div&gt;</code><br />
									<span class="text-[11px] text-text-mute"
										>Khối thơ, mỗi dòng bên trong là 1 đoạn, luôn canh giữa.</span
									>
								</td>
							</tr>
							<tr>
								<td class="py-3 px-3 whitespace-nowrap">
									<code
										class="bg-brand-bg px-1.5 py-0.5 rounded border border-border-color text-accent-color"
										>[c] nội dung...</code
									>
								</td>
								<td class="py-3 px-3">
									<code
										>&lt;p&gt;&lt;span class="dropcap"&gt;c&lt;/span&gt;nội dung...&lt;/p&gt;</code
									><br />
									<span class="text-[11px] text-text-mute"
										>Dropcap (chữ phóng to đầu đoạn). Chỉ nhận diện khi đứng đầu dòng, bên trong [ ]
										là đúng 1 ký tự và có ít nhất 1 khoảng trắng theo sau dấu ]. Khoảng trắng này sẽ
										tự động được loại bỏ khi xuất bản.</span
									>
								</td>
							</tr>
							<tr>
								<td class="py-3 px-3 whitespace-nowrap">
									<code
										class="bg-brand-bg px-1.5 py-0.5 rounded border border-border-color text-accent-color"
										>[hinh-1]</code
									>
								</td>
								<td class="py-3 px-3">
									<code
										>&lt;figure class="illust-box"&gt;&lt;img class="illust-img"
										src="../images/hinh-1.jpg" alt="hinh-1"/&gt;&lt;/figure&gt;</code
									><br />
									<span class="text-[11px] text-text-mute"
										>Chèn ảnh minh họa (tên trong ngoặc vuông trùng với tên file ảnh tải lên, hệ
										thống tự động gắn đúng định dạng file <code>.jpg, .png, .webp...</code>).</span
									>
								</td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>

			<!-- Footer -->
			<div class="p-4 border-t border-border-color flex justify-end bg-panel-2">
				<button
					type="button"
					class="bg-accent-color text-white font-mono text-xs font-semibold py-2.5 px-5 rounded-xl hover:bg-accent-hover active:scale-[0.98] transition-all cursor-pointer"
					onclick={() => (show = false)}
				>
					Đồng ý
				</button>
			</div>
		</div>
	</div>
{/if}
