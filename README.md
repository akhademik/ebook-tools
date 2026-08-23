# ⚒️ Ebook Forge — Bộ Công Cụ Chế Bản Sách Điện Tử

> **Ebook Forge**: Bộ công cụ chuẩn hóa, đóng gói và biên tập sách điện tử hiệu năng cao, hoạt động **100% ngoại tuyến (offline)** trực tiếp trên trình duyệt web của bạn — tệp được xử lý cục bộ và không tải lên bất kỳ máy chủ nào.

---

## 🚀 Các công cụ chính

### 1. ✏️ Chỉnh sửa EPUB Trực quan (EPUB Editor)
Công cụ biên tập và xem trước tệp `.epub` thời gian thực mạnh mẽ ngay trên trình duyệt:
* **Chỉnh sửa mã nguồn chuyên nghiệp**: Tích hợp trình soạn thảo CodeMirror 6 với syntax highlighting cho HTML, XHTML và CSS, tự động căn lề và đóng mở thẻ thông minh.
* **Xem trước thời gian thực (Live Preview)**: Khung xem trước song song hiển thị ngay lập tức các thay đổi về kiểu dáng CSS, bố cục và hình ảnh.
* **Tự động giải mã Font nhúng (Font De-obfuscation)**: Tự động nhận diện và giải mã các font chữ được mã hóa theo chuẩn **IDPF** và **Adobe Mangling** (như TTF, OTF, WOFF, WOFF2), hiển thị đúng typography của sách.
* **Đồng bộ hai chiều (Sync-View)**:
  * **Sync-Scroll**: Cuộn mã nguồn bên editor thì khung preview tự động cuộn theo và ngược lại.
  * **Sync-Highlight**: Bôi đen một đoạn chữ bên editor thì preview sẽ tìm và highlight màu vàng amber nổi bật; bôi đen bên preview thì editor tự động chọn và cuộn tới dòng mã tương ứng.
* **Không gian làm việc linh hoạt**:
  * Thanh phân chia kéo thả (Resizable Split Pane) điều chỉnh độ rộng Editor / Preview tùy ý.
  * Chế độ xem **100% Real View** hoặc mô phỏng máy đọc sách (600px), máy tính bảng (768px), điện thoại (390px).
  * Ẩn / hiện danh sách tệp bên trái để tối ưu diện tích màn hình.
* **Dọn rác & Tối ưu dung lượng (EPUB Optimizer)**: Tự động quét và lập kế hoạch tối ưu (**Optimization Plan**) chi tiết: phát hiện hình ảnh/font/CSS/trang thừa, phát hiện tài nguyên trùng lặp (Duplicate Detection theo SHA-1 checksum), tính toán dung lượng tiết kiệm (Potential Savings) và loại bỏ an toàn với 1-click.
* **Kiểm định & Tương thích máy đọc sách (EPUB Validator)**: Kiến trúc kiểm định DOM/XML nhiều tầng (**ValidationContext** + **ValidationRules**), kiểm định chuẩn xác theo hồ sơ **Generic EPUB**, **EPUB 3.0** và **Kobo e-Reader** (cấu trúc ZIP, META-INF/container.xml, OPF manifest/spine, TOC/NCX, kiểm tra cú pháp XHTML, phát hiện trùng lặp ID, magic bytes font chữ và hiển thị bìa sleep screen).
* **Quản lý Thông tin sách & Tự động Rebuild TOC (Book Operations)**: Chỉnh sửa trực tiếp Metadata sách trong `content.opf`; 1-click tự động tái tạo đồng bộ mục lục thông qua mô hình trung gian **TocTree** thống nhất giữa `nav.xhtml` (EPUB 3) và `toc.ncx` (EPUB 2 / Kobo).
* **Kiểm tra cú pháp & Xuất file an toàn**: Tự động kiểm tra lỗi cú pháp XML/XHTML trước khi xuất, cảnh báo khi đóng mà chưa lưu và đóng gói tải về tệp `.epub` hoàn chỉnh.

---

### 2. 📦 Đóng gói EPUB (EPUB Packer)
Tự động chuyển đổi văn bản thô `.txt` hoặc gói tệp Markdown `.zip` thành sách điện tử định dạng `.epub` tiêu chuẩn:
* **Hỗ trợ cú pháp quy ước nhanh cho file `.txt`**:
  * `@@ Tiêu đề` (`@@t`, `@@p`): Tiêu đề chính / tách chương thành file XHTML riêng, tự động tạo mục lục (TOC).
  * `@ Tiêu đề` (`@t`, `@p`): Tiêu đề phụ / chương nhỏ trong file, hiển thị trong mục lục.
  * `@! Tiêu đề` (`@!t`, `@!p`): Tiêu đề phụ, không đưa vào mục lục.
  * `[new] ... [/new]`: Gom toàn bộ nội dung bên trong thành 1 trang XHTML duy nhất.
  * `[letter] ... [/letter]`, `[poem] ... [/poem]`: Khối thư từ, bài thơ có căn lề riêng biệt.
  * `~ Lời thoại` / `> Tác giả`: Khối trích dẫn blockquote và tên tác giả.
  * Dropcap `[c]`, ảnh minh họa `[hinh-1]`, phân cảnh `###`, in đậm `*đậm*`, in nghiêng `/nghiêng/`, gạch chân `_chân_` và chú thích chân trang `{n}` / `Chú thích:`.
* **Xử lý hình ảnh**: Hỗ trợ tải lên ảnh bìa, ảnh đơn lẻ hoặc file `.zip` chứa ảnh để nhúng tự động vào sách.
* **Tự động hóa thông minh (Heuristic Chapter Detection)**:
  * Tự động quét cấu trúc chương dựa trên điểm số heuristic (tiêu đề in hoa, độ dài chuỗi, số La Mã, từ khóa `Chương`/`Chapter`/`Hồi`/`Quyển`).
  * **Lưu ý & Giới hạn khi sử dụng Heuristic**: Với các file text OCR chưa chuẩn hóa (dòng ngắt tự do, đoạn văn bản in hoa ngẫu nhiên), người dùng nên gán tiền tố tường minh `@@` ở đầu mỗi tên chương để đảm bảo việc phân chương và dựng cây mục lục TOC đạt độ chính xác 100%.

---

### 3. 📄 Tách trang PDF → JPG (PDF Processor)
* Trích xuất các trang từ tệp tài liệu PDF thành bộ ảnh JPG độc lập đóng gói dạng `.zip`.
* Chuyển đổi ảnh sang thang độ xám (Grayscale) và tăng độ tương phản, tối ưu hóa cho các phần mềm nhận dạng chữ OCR.
* Xem trước trực quan và thiết lập vùng cắt bỏ **Header / Footer** hàng loạt cho toàn bộ trang sách.

---

### 4. ✍️ Chuẩn hóa Markdown (Markdown Fixer)
* Tự động phát hiện và chuẩn hóa các kiểu định dạng in nghiêng (`*text*`), đậm nghiêng (`***text***`) từ các tệp Markdown OCR thô.
* Thay thế bằng các cặp định dạng ngoặc vuông tùy biến mà vẫn bảo vệ an toàn cho các công thức toán học và footnote dấu sao (`*`).

---

### 5. 💻 Desktop App: TXT → PDF CJK
* Ứng dụng desktop độc lập dành cho Windows chuyên xử lý văn bản chữ Hán / Nôm / CJK sang tệp PDF chất lượng cao.
* Tự động phát hiện và sửa lỗi các ký tự PUA (chữ hiếm bị mã hóa sai) sang ký tự chuẩn.
* Nhúng sẵn font chữ toàn diện (Noto Serif CJK + HanaMin) đảm bảo hiển thị đầy đủ mọi ký tự cổ/hiếm, tương thích tối đa với máy đọc sách và làm tài liệu đầu vào chuẩn cho NotebookLM.

---

## ⚡ Hướng dẫn Cài đặt & Sử dụng

### Yêu cầu hệ thống
* **Node.js**: Phiên bản 18 trở lên.
* **pnpm**: Phiên bản 9 trở lên.

### Khởi chạy ứng dụng
```bash
# 1. Cài đặt các gói phụ thuộc
pnpm install

# 2. Khởi chạy ở chế độ phát triển
pnpm dev
```
Truy cập ứng dụng tại địa chỉ: `http://localhost:5173`

### Đóng gói ứng dụng (Production Build)
```bash
pnpm build
```

### 🧪 Bộ Kiểm Thử Tự Động (Test Suite)
```bash
# Chạy toàn bộ unit tests & kịch bản thực tế (214+ tests)
pnpm test

# Chế độ tự động chạy lại test khi lưu file (watch mode)
pnpm test:watch

# Báo cáo độ phủ kiểm thử (test coverage)
pnpm test:coverage

# Kiểm tra kiểu dữ liệu TypeScript & Svelte
pnpm check
```

---

## 🛡️ Quyền riêng tư & Bảo mật
* **100% Client-Side**: Toàn bộ quá trình đọc, giải nén, chỉnh sửa và đóng gói tệp PDF, EPUB, TXT diễn ra hoàn toàn trong bộ nhớ trình duyệt máy tính của bạn.
* **An toàn dữ liệu**: Tệp được xử lý trực tiếp trên thiết bị của bạn và không được tải lên bất kỳ máy chủ bên ngoài nào.
