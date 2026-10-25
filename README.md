# ⚒️ Ebook Forge — Bộ Công Cụ Chế Bản Sách Điện Tử

> **Ebook Forge**: Bộ công cụ chuẩn hóa, đóng gói, biên tập và kiểm định sách điện tử hiệu năng cao, hoạt động **100% ngoại tuyến (offline)** trực tiếp trên trình duyệt web của bạn — tệp được xử lý cục bộ và không tải lên bất kỳ máy chủ nào.

---

## 🚀 Các công cụ chính

### 1. ✏️ Chỉnh sửa & Kiểm định EPUB Trực quan (EPUB Editor & Validator Suite)

Bộ công cụ biên tập, tối ưu và xem trước tệp `.epub` toàn diện ngay trên trình duyệt web:

- **Trình soạn thảo mã nguồn chuyên nghiệp**: Tích hợp CodeMirror 6 với syntax highlighting cho HTML, XHTML và CSS, hỗ trợ tự động căn lề, đóng mở thẻ thông minh và phím tắt chuẩn.
- **Xem trước thời gian thực (Live Preview)**: Khung xem trước song song hiển thị tức thì các thay đổi về bố cục, kiểu dáng CSS và hình ảnh.
- **Tự động giải mã Font nhúng (Font De-obfuscation)**: Tự động nhận diện và đảo ngược thuật toán mã hóa font theo chuẩn **IDPF** và **Adobe Mangling** (TTF, OTF, WOFF, WOFF2), hiển thị trung thực typography gốc của sách.
- **Đồng bộ hai chiều thông minh (Sync-View)**:
  - **Sync-Scroll**: Cuộn mã nguồn bên editor thì khung preview tự động cuộn theo vị trí tương ứng và ngược lại.
  - **Sync-Highlight**: Bôi đen một đoạn văn bản bên editor sẽ tự động tìm và làm nổi bật (amber highlight) trong preview; bôi đen bên preview sẽ đưa editor cuộn thẳng tới dòng mã nguồn liên quan.
- **Không gian làm việc linh hoạt**:
  - Thanh phân chia kéo thả (Resizable Split Pane) tùy biến tỷ lệ Editor / Preview.
  - Chế độ xem **100% Real View**
  - Thanh điều hướng cây tệp (File Tree Sidebar) có thể thu gọn tối đa để mở rộng không gian làm việc.
- **Dọn rác & Tối ưu dung lượng (EPUB Optimizer / Cleaner)**:
  - Tự động quét toàn bộ cây tài nguyên sách để lập kế hoạch tối ưu (**Optimization Plan**) chi tiết.
  - Phát hiện hình ảnh, font chữ, tệp CSS và trang XHTML mồ côi (không được tham chiếu trong OPF spine/manifest hoặc HTML).
  - Phát hiện tài nguyên trùng lặp nội dung dựa trên mã băm SHA-1 (Duplicate Detection).
  - Ước tính dung lượng tiết kiệm (Potential Savings) và dọn sạch an toàn chỉ với 1 cú click.
- **Kiểm định & Tương thích máy đọc sách (EPUB Validator)**:
  - Kiến trúc kiểm định DOM/XML nhiều tầng (**ValidationContext** + **ValidationRules**).
  - Kiểm tra chuẩn xác theo các hồ sơ: **Generic EPUB**, **EPUB 3.0** và tiêu chuẩn khắt khe của **Kobo e-Reader**.
  - Quét toàn diện: Cấu trúc ZIP & mimetype, `META-INF/container.xml`, OPF manifest/spine, tính hợp lệ của NCX/NAV TOC, cú pháp XHTML, ID trùng lặp, magic bytes của font chữ và hiển thị ảnh bìa sleep screen.
- **Quản lý Thông tin sách & Tái tạo Mục lục Tự động (Book Operations)**:
  - Chỉnh sửa trực tiếp Metadata sách (Tiêu đề, Tác giả, Ngôn ngữ, Nhà xuất bản, Identifier/ISBN, Ngày phát hành) trong `content.opf`.
  - 1-click tự động tái tạo đồng bộ mục lục thông qua mô hình trung gian **TocTree** thống nhất giữa `nav.xhtml` (EPUB 3) và `toc.ncx` (EPUB 2 / Kobo).
- **Kiểm tra cú pháp & Đóng gói an toàn**: Tự động kiểm tra lỗi cú pháp XML/XHTML trước khi lưu/xuất, cảnh báo khi đóng tab chưa lưu và đóng gói tải về tệp `.epub` hoàn chỉnh chuẩn kỹ thuật.

---

### 2. 📦 Đóng gói EPUB (EPUB Packer)

Tự động chuyển đổi văn bản thô `.txt` hoặc gói tệp Markdown `.zip` thành sách điện tử định dạng `.epub` tiêu chuẩn:

- **Hỗ trợ cú pháp quy ước nhanh cho file `.txt`**:
  - `@@ Tiêu đề` (`@@t`, `@@p`): Tiêu đề chính / tách chương thành file XHTML riêng, tự động đưa vào mục lục (TOC).
  - `@ Tiêu đề` (`@t`, `@p`): Tiêu đề phụ / chương nhỏ trong file, hiển thị trong mục lục.
  - `@! Tiêu đề` (`@!t`, `@!p`): Tiêu đề phụ, không đưa vào mục lục.
  - `[new] ... [/new]`: Gom toàn bộ nội dung bên trong thành 1 trang XHTML độc lập.
  - `[letter] ... [/letter]`, `[letter-box] ... [/letter-box]`, `[poem] ... [/poem]`: Khối định dạng thư từ, hộp viền bọc nội dung (không nối dòng, hỗ trợ lồng thẻ), bài thơ có căn lề và thụt đầu dòng riêng biệt.
  - `~ Lời thoại` / `> Tác giả`: Khối trích dẫn blockquote và tên tác giả.
  - Dropcap chữ cái đầu chương `[c]`, tắt tự động dropcap đầu đoạn sau tiêu đề bằng `!D Nội dung`, ảnh minh họa theo thẻ `[hinh-1]`, ngắt phân cảnh lớn `###` (• • •), ngắt phân cảnh nhỏ `##` (*), ngắt phân cảnh trống `#`, in đậm `*đậm*`, in nghiêng `/nghiêng/`, gạch chân `_chân_`.
  - Chú thích chân trang tự động: `{n}` trong nội dung liên kết tự động tới khối `Chú thích:` / `{n} Nội dung chú thích` ở cuối sách dạng pop-up footnote EPUB 3 (`<aside epub:type="footnote">`).
- **Xử lý bìa & Tùy biến Jacket (Trang lót sách)**:
  - Hỗ trợ tải ảnh bìa trực tiếp hoặc trích xuất từ trang đầu tiên của file PDF bìa.
  - Tích hợp công cụ cắt chỉnh tỉ lệ bìa trực quan.
  - Hỗ trợ nhiều mẫu Jacket (trang lót) trình bày trang trọng thông tin tác phẩm, tác giả, dịch giả và nhà xuất bản.
- **Tự động hóa thông minh (Heuristic Chapter Detection)**:
  - Tự động nhận diện cấu trúc chương dựa trên thuật toán tính điểm heuristic (tiêu đề in hoa, độ dài chuỗi, số La Mã, từ khóa `Chương`/`Chapter`/`Hồi`/`Quyển`).
  - **Khuyến nghị**: Với các file text OCR chưa chuẩn hóa (dòng ngắt tự do, đoạn văn bản in hoa ngẫu nhiên), người dùng nên gán tiền tố tường minh `@@` ở đầu mỗi tên chương để đảm bảo việc phân chương và dựng cây mục lục TOC đạt độ chính xác 100%.

---

### 3. 🎨 Tẩy Nền Hoa Văn Tự Động bằng AI (ML Ornament Background Removal)

Công cụ xử lý hoa văn, họa tiết đầu chương và phân đoạn trang sách hoàn toàn tự động trên trình duyệt:

- **Tích hợp mô hình Machine Learning WebAssembly**: Sử dụng `@imgly/background-removal` chạy trực tiếp trong Web Worker của trình duyệt, phân tách chủ thể hoa văn và xóa nền chính xác mà không gửi dữ liệu ra máy chủ bên ngoài.
- **Tự động xén biên trong suốt (Auto-Crop Canvas)**: Thuật toán quét pixel biên tự động loại bỏ toàn bộ khoảng trống vô nghĩa xung quanh hoa văn sau khi tách nền.
- **Chuẩn hóa đồ họa sách điện tử**: Chuyển đổi sang thang độ xám (Grayscale), tăng độ tương phản chi tiết và nén định dạng ảnh tối ưu, sẵn sàng chèn tự động vào đầu chương và phân đoạn trang EPUB.

---

### 4. 📄 Tách trang PDF → JPG (PDF Processor)

- Trích xuất các trang từ tệp tài liệu PDF thành bộ ảnh JPG độc lập đóng gói dạng `.zip`.
- Chuyển đổi ảnh sang thang độ xám (Grayscale) và tăng độ tương phản, tối ưu hóa cho các phần mềm nhận dạng chữ OCR.
- Xem trước trực quan và thiết lập vùng cắt bỏ **Header / Footer** hàng loạt cho toàn bộ trang sách với xử lý song song đa luồng.

---

### 5. ✍️ Chuẩn hóa Markdown (Markdown Fixer)

- Tự động phát hiện và chuẩn hóa các kiểu định dạng in nghiêng (`*text*`), đậm nghiêng (`***text***`) từ các tệp Markdown OCR thô.
- Thay thế bằng các cặp định dạng ngoặc vuông tùy biến mà vẫn bảo vệ an toàn cho các công thức toán học và footnote dấu sao (`*`).

---

### 6. 💻 Desktop App: TXT → PDF CJK

- Ứng dụng desktop độc lập dành cho Windows chuyên xử lý văn bản chữ Hán / Nôm / CJK sang tệp PDF chất lượng cao.
- Tự động phát hiện và sửa lỗi các ký tự PUA (chữ hiếm bị mã hóa sai) sang ký tự chuẩn.
- Nhúng sẵn font chữ toàn diện (Noto Serif CJK + HanaMin) đảm bảo hiển thị đầy đủ mọi ký tự cổ/hiếm, tương thích tối đa với máy đọc sách và làm tài liệu đầu vào chuẩn cho NotebookLM.

---

## ⚡ Hướng dẫn Cài đặt & Sử dụng

### Yêu cầu hệ thống

- **Node.js**: Phiên bản 18 trở lên.
- **pnpm**: Phiên bản 9 trở lên (bắt buộc sử dụng `pnpm`).

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

---

## 🧪 Quy chuẩn Kiểm thử & Chất lượng Mã nguồn (Quality Gates)

Dự án tuân thủ quy trình kiểm thử và chất lượng nghiêm ngặt theo [AI_WORKFLOW.md](AI_WORKFLOW.md):

```bash
# 1. Kiểm tra kiểu dữ liệu TypeScript & Svelte Rune (0 errors, 0 warnings)
pnpm check

# 2. Kiểm tra định dạng & cú pháp ESLint
pnpm lint

# 3. Quét mã rác, file thừa và dependencies không dùng
pnpm knip

# 4. Chạy toàn bộ Unit & Integration Tests (214+ tests)
pnpm test

# 5. Chạy Kiểm thử Giao diện Trình duyệt Thật (Playwright E2E)
pnpm test:e2e
```

---

## 🛡️ Quyền riêng tư & Bảo mật

- **100% Client-Side**: Toàn bộ quá trình đọc, giải nén, bóc tách AI, chỉnh sửa và đóng gói tệp PDF, EPUB, TXT diễn ra hoàn toàn trong bộ nhớ trình duyệt máy tính của bạn.
- **An toàn dữ liệu**: Tệp được xử lý trực tiếp trên thiết bị của bạn và tuyệt đối không tải lên bất kỳ máy chủ bên ngoài nào.

---

## Trạng thái hệ thống

- Cập nhật lần cuối: 2026-10-25 19:35
- Đã hoàn thành:
  - **Tối ưu hóa Chuẩn OCR & Nâng cấp Chất lượng Tách trang PDF (PDF Splitter for OCR)**:
    - **Mặc định chuẩn 200 DPI**: Đặt mặc định 200 DPI ($scale \approx 2.778$, kích thước trang A4 đạt $\approx 1654 \times 2339$px) đồng nhất trên cả Desktop và Mobile/Touch device, đảm bảo độ phân giải sắc nét tối ưu cho Google Vision OCR và các công cụ OCR nhận diện chuẩn xác dấu tiếng Việt, chữ nhỏ.
    - **Lựa chọn DPI linh hoạt trên UI**: Bổ sung bộ chọn DPI trực quan trên giao diện (150 DPI - Nhanh/Nhẹ, 200 DPI - Mặc định chuẩn OCR, 300 DPI - Sách scan mờ / Nét nhỏ).
    - **Tách biệt điều kiện Mobile với DPI**: Điều kiện `isMobileOrLowMemoryDevice()` chỉ dùng để giảm trần dung lượng phần ZIP (`40MB` thay vì `80MB`) nhằm bảo toàn RAM, tuyệt đối không ép giảm ngầm DPI chất lượng ảnh. Tinh chỉnh nhận diện mobile để không gán nhầm laptop màn hình cảm ứng thành thiết bị di động.
    - **Đệm số 0 tên tệp (`page0001.jpg`)**: Tự động đệm số 0 theo tổng số trang sách (`Math.max(4, String(totalDocPages).length)`), đảm bảo thứ tự từ điển (lexicographical order) luôn tuần tự chuẩn xác cho các script OCR (`page0001.jpg`, `page0002.jpg`, ..., `page0010.jpg`).
    - **Cơ chế Retry giữ chuẩn chất lượng & Minh bạch Trang giảm độ phân giải (`degradedPages`)**:
      - Khi trang gặp lỗi canvas/bộ nhớ, cơ chế thử lại chỉ hạ tỷ lệ scale, bảo toàn chất lượng nén ảnh JPEG tối thiểu 85% (`JPEG_QUALITY = 0.85`).
      - Tự động ghi nhận danh sách các trang phải giảm độ phân giải do giới hạn bộ nhớ/canvas (`degradedPages`) và hiển thị cảnh báo chi tiết trên giao diện hoàn tất kèm hướng dẫn tách lại độc lập dải trang nếu cần.
    - Toàn bộ **342/342 unit tests** và **12/12 Playwright E2E browser tests** pass 100%.
  - **Tối ưu hóa & Hoàn thiện toàn diện PDF Splitter & PDF.js Offline**:
    - **Thiết lập trần bộ nhớ cố định O(1) & Dynamic Byte Chunking**:
      - Phân tách phần ZIP theo dung lượng byte cộng dồn (`DEFAULT_DESKTOP_PART_BYTES = 80MB`, `DEFAULT_MOBILE_PART_BYTES = 40MB`, kèm trần an toàn 300 trang), khống chế hoàn toàn đỉnh RAM của JSZip heap độc lập với độ dài cuốn sách.
      - Tích hợp **File System Access API (`showDirectoryPicker`)** trên Chromium Desktop: cho phép chọn thư mục đích, stream ghi trực tiếp từng phần ZIP vào ổ đĩa và giải phóng Blob tức thì khỏi RAM, giúp bộ nhớ giữa các phần xấp xỉ bằng 0.
      - Bổ sung tùy chọn giải phóng bộ nhớ thủ công từng phần (`releasePartBlob`) cho Safari/iOS.
    - **Lựa chọn Dải trang & Cơ chế Graceful Retry tự hạ chất lượng**:
      - Bổ sung chọn dải trang xử lý ("Từ trang X đến Y"), cho phép người dùng chia nhỏ phiên làm việc hoặc tiếp tục xử lý khi phiên trước bị ngắt quãng.
      - Cơ chế Graceful Retry per-page: Khi một trang gặp lỗi render canvas hoặc `toBlob`, tự động thử lại 1 lần ở `scale 1.0` và giảm quality JPEG xuống 0.75; nếu vẫn lỗi, ghi nhận vào `failedPages` và tiếp tục các trang kế tiếp mà không làm hỏng toàn bộ sách.
      - Tự động hạ scale xuống 1.5x và `MAX_CANVAS_PIXELS = 8Mpx` trên thiết bị di động hoặc máy có RAM <= 4GB (`navigator.deviceMemory`).
    - **Khắc phục lỗi ngốn RAM (Mục 1)**: Loại bỏ việc nhân bản buffer `arrayBuffer.slice(0)`. Sử dụng Zero-Copy Streaming qua `URL.createObjectURL(file)` truyền trực tiếp cho `pdfjsLib.getDocument({ url })`. Loại bỏ `probeDoc` thừa, tái sử dụng 1 bản thể `PdfJsDocument` duy nhất xuyên suốt.
    - **Đồng bộ hóa 2 vị trí nạp PDF cũ**:
      - Cập nhật `renderPdfPageToBlob` trong [`src/lib/utils/pdf.ts`](src/lib/utils/pdf.ts) chấp nhận `File | Blob | ArrayBuffer | Uint8Array`, dùng zero-copy streaming, áp dụng viewport clamping và giải phóng bộ nhớ canvas.
      - Cập nhật trích xuất bìa PDF và ảnh minh họa trong [`src/lib/epub-packer/state/epub-images-state.svelte.ts`](src/lib/epub-packer/state/epub-images-state.svelte.ts), quản lý vòng đời Object URL và dọn dẹp sạch sẽ tránh rò rỉ bộ nhớ.
    - **Xử lý dứt điểm Web Worker**: Gỡ bỏ hoàn toàn module worker lỗi thời bên ngoài (`pdf-splitter.worker.ts`), giải phóng triệt để dead code. Tận dụng trực tiếp worker native nội bộ của PDF.js kết hợp vòng lặp render tuần tự cooperative trên luồng chính với `page.cleanup()` và `setTimeout(0)`, duy trì UI 60fps mượt mà, triệt tiêu đỉnh RAM và nguy cơ rò rỉ worker.
    - **Bảo vệ Canvas & Minh bạch lỗi**:
      - Tích hợp thuật toán tính toán kích thước co giãn thích ứng [`getClampedViewport`](src/lib/pdf-splitter/pdf-splitter.ts), khống chế kích thước tối đa `MAX_CANVAS_DIMENSION = 4096px` và `MAX_CANVAS_PIXELS = 16M pixels` chống tràn bộ nhớ và crash canvas trên Safari iOS / thiết bị di động.
      - Giải phóng ngay lập tức bộ nhớ GPU/backing store sau mỗi trang bằng `canvas.width = 0; canvas.height = 0`.
    - **100% Ngoại tuyến (Offline hoàn toàn)**:
      - Self-host toàn bộ `pdf.min.js` (313 KB) và `pdf.worker.min.js` (1.1 MB) nội bộ vào thư mục [`static/vendor/pdfjs/`](static/vendor/pdfjs/).
      - Cập nhật [`src/app.html`](src/app.html) tải cục bộ `/vendor/pdfjs/pdf.min.js` kèm fallback CDN an toàn.
      - Đồng bộ [`initPdfWorker`](src/lib/utils/pdf.ts) trỏ trực tiếp worker của PDF.js vào `/vendor/pdfjs/pdf.worker.min.js`.
    - Toàn bộ **340/340 unit tests** và **12/12 Playwright E2E browser tests** pass 100%.
  - **Khắc phục lỗi Phông chữ Trang giới thiệu khi chuyển tiếp Mẫu (Fix Jacket Modal Font Persistence Across Templates)**:
    - Sửa triệt để sự cố phông chữ chỉ đổi ở Mẫu 1 và không phản ánh khi chuyển tiếp sang Mẫu 2, Mẫu 3 bằng nút 'Tiếp' / 'Trước'.
    - Chuyển toàn bộ CSS override của jacket font ra thẻ `<style id="jacket-font-override">` trong `<svelte:head>`, đồng thời gán CSS variable `--jacket-font` trực tiếp lên `.preview-wrap` và quy tắc toàn cục `:global(.preview-wrap, .preview-wrap *) { font-family: var(--jacket-font, inherit) !important; }`. Loại bỏ hoàn toàn việc lồng thẻ `<style>` bên trong thẻ `<div>` dễ gây lỗi desync DOM giữa các khối `{@html}`.
    - Chuẩn hóa chuỗi font family: lọc bỏ chuỗi rỗng `""` tránh lỗi cú pháp CSS khiến browser discard toàn bộ thuộc tính `font-family`.
    - Sử dụng biến cờ `wasOpen` để chỉ khởi tạo chỉ mục template khi modal mở lần đầu, ngăn ngừa việc điều hướng hoặc chọn font làm reset chỉ mục về mẫu 1.
    - Toàn bộ **311/311 unit tests** và **12/12 Playwright E2E browser tests** pass 100%.
  - **Trực quan hóa Phông chữ Trực tiếp ngay tại Bộ chọn (Live Font Preview Dropdown for H1, H2, Dropcap & Jacket Modal)**:
    - Xây dựng component giao diện tái sử dụng cao cấp [`FontSelect.svelte`](src/lib/components/FontSelect.svelte) hỗ trợ cả chế độ chuẩn (`h-11.5`) và chế độ thu gọn `compact` (`h-9`) cho toolbar.
    - Áp dụng đồng bộ cho cả khu vực cấu hình phông chữ nội dung ([`EpubFontSettingsSection.svelte`](src/lib/epub-packer/components/EpubFontSettingsSection.svelte)) và thanh công cụ của Modal xem trước Jacket ([`EpubJacketModal.svelte`](src/lib/epub-packer/components/EpubJacketModal.svelte)).
    - Render trực quan mọi tên phông chữ trong danh sách bằng chính kiểu dáng typography thực tế của phông chữ đó (`font-family` động tương ứng với từng font nhúng), kèm đoạn text tiếng Việt xem trước ("Chương 1: Bình minh") để đánh giá độ tương thích dấu thanh tiếng Việt trước khi chọn.
    - Hiển thị tên phông chữ đã chọn trên nút trigger bằng chính font tương ứng khi đóng menu. Tích hợp thanh tìm kiếm font tức thì và hỗ trợ phím Escape / click outside để đóng menu mượt mà.
    - Bảo toàn thẻ `<select>` gốc ẩn (`sr-only`) đồng bộ 2 chiều (`bind:value`), duy trì khả năng truy cập (accessibility) và tương thích hoàn toàn với automation/E2E test suite.
    - Bổ sung kịch bản kiểm thử E2E tự động mở listbox, chọn font và xác minh giá trị cập nhật trên cả trigger lẫn hidden select cho cả H1 và Jacket Modal.
    - Toàn bộ **311/311 unit tests** và **12/12 Playwright E2E browser tests** pass 100%.
  - **Tối ưu hóa UI Trang giới thiệu (Jacket Template Naming & Font Selection)**:
    - Đơn giản hóa toàn bộ tên 10 mẫu trang lót trong `jacket-templates.ts` chỉ còn thuần túy `Mẫu 1`, `Mẫu 2`, ..., `Mẫu 10` (loại bỏ hoàn toàn các hậu tố mô tả như 'Bất đối xứng', 'Cột dọc'...).
    - Di dời input lựa chọn phông chữ trang giới thiệu (`#jacket-font-select`) khỏi trang chính `EpubMetadataSection.svelte`, chỉ đặt lựa chọn phông chữ bên trong Preview Modal (`EpubJacketModal.svelte`) kèm huy hiệu phông chữ hiển thị tinh tế trên giao diện chính khi đã chọn.
    - Cập nhật kịch bản kiểm thử tự động Playwright E2E xác thực quy trình chọn font trong modal, xác nhận loại bỏ input thừa trên trang chính và bảo toàn trạng thái lựa chọn font.
    - Toàn bộ **311/311 unit tests** và **12/12 Playwright E2E browser tests** pass 100%.
  - **Khắc phục triệt để Race Condition khi hủy tác vụ Worker & Bổ sung Full Fallback cho Image Background Removal**:
    - `txt-parser.ts` & `duplicate-detector.ts`: Quản lý các tác vụ worker đang chạy theo `requestId` thông qua Map trung tâm. Khi một tác vụ bị hủy qua `AbortSignal`, chỉ hủy tác vụ đó và chỉ terminate worker khi không còn tác vụ nào khác (`pendingJobs.size === 0`), giải quyết triệt để nguy cơ làm treo Promise của các tác vụ chạy song song.
    - `image-bg-remove-ml.ts`: Tự động phục hồi sang xử lý trên luồng chính (`processOrnamentOnMainThread`) khi `worker.postMessage` ném lỗi thay vì reject Promise.
    - Mở rộng bộ kiểm thử đạt **308/308 unit tests pass 100%**.
  - **Tự động tắt Dropcap & Chuẩn hóa cú pháp `@` / `@@` trong `[letter]` và `[poem]`**:
    - Trong khối `[letter]` và `[poem]`, mặc định tự động tắt Dropcap (không chèn Dropcap tự động ngay sau tiêu đề), chỉ áp dụng khi người dùng chủ động chỉ định bằng cú pháp `[c]`.
    - Bảo vệ các khối `<div class="letter">` và `<div class="poem">` trong `chapter-builder.ts` khỏi thuật toán tự động tiêm dropcap.
    - Trong khối `[letter]` và `[poem]`, chỉ có `@@!` và `@!` được chuyển đổi thành tiêu đề (`h1.no-toc` / `h2.no-toc`). Nếu gặp `@@` hoặc `@` (không có `!`), hệ thống không dừng build (không báo lỗi cú pháp) mà phát cảnh báo (`warning`) và giữ nguyên thành đoạn văn thông thường `<p>@...</p>`, `<p>@@...</p>`.
    - Toàn bộ **305/305 unit tests** và **12/12 Playwright E2E browser tests** pass 100%.
  - **Chuẩn hóa toàn diện vòng đời Web Worker & Chống rò rỉ listener (Worker Lifecycle & Leak Prevention)**:
    - Rà soát và hoàn thiện cơ chế đăng ký và gỡ listener trên 4 modules Web Worker: [`txt-parser.ts`](src/lib/epub-packer/parser/txt-parser.ts), [`duplicate-detector.ts`](src/lib/epub-editor/cleaner/duplicate-detector.ts), [`pdf-splitter.ts`](src/lib/pdf-splitter/pdf-splitter.ts) và [`image-bg-remove-ml.ts`](src/lib/utils/image-bg-remove-ml.ts).
    - Bổ sung listener `error` và `messageerror`, đảm bảo `cleanup()` gỡ sạch 100% listener khỏi worker và `AbortSignal`, ngăn chặn triệt để nguy cơ treo Promise khi worker crash hoặc gặp sự cố tuần tự hóa dữ liệu.
    - Bọc an toàn `postMessage` trong try-catch với cơ chế fallback tự động sang tính toán trực tiếp trên luồng chính.
    - Mở rộng bộ kiểm thử đạt **300/300 unit tests pass 100%**.
  - **Nâng cấp TypeScript lên Strict Mode toàn diện (`strict: true`)**:
    - Xử lý triệt để 47 lỗi strict type & nullability trên toàn bộ codebase: `epub-chapter-utils.ts`, `epub-single-grouper.ts`, `epub-zip-grouper.ts`, `txt-parser.ts`, `chapter-builder.ts`, `pdf-splitter.ts`, và `+layout.svelte`.
    - Chuẩn hóa hàm `ensureChapterOpen` trả về `RawChapterItem` để đảm bảo an toàn kiểu dữ liệu và loại bỏ hoàn toàn các lỗi `possibly 'null'`.
    - Kích hoạt `"strict": true` trong `tsconfig.json`. `pnpm check` (`svelte-check`) đạt 0 errors, 0 warnings.
  - Chuẩn hóa hệ thống tài liệu quy trình & giao diện: Khởi tạo [AI_WORKFLOW.md](AI_WORKFLOW.md) và [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md), tích hợp toàn bộ ma trận kiểm thử và cheat sheet từ `DEVELOPMENT_WORKFLOW.md` vào `AI_WORKFLOW.md`, tinh gọn tài liệu dự án.
  - Cải tiến tính năng biên tập theo yêu cầu đánh giá (Vấn đề 2, 3, 4, 5, 7):
    - **Vấn đề 2 & 5 (Placeholder 'Giới Thiệu' & TOC gộp)**: Khối `[new]` và `[new:center]` mặc định nhận tiêu đề `Giới Thiệu` thay vì trùng tên sách; khi có `@@` hoặc `@` bên trong thì ưu tiên tuyệt đối tiêu đề đó và tự động khử trùng lặp mục lục TOC trong `nav-builder`.
    - **Vấn đề 3 (Bí danh đóng `[/new:center]`)**: Thêm hỗ trợ thẻ đóng `[/new:center]` dành riêng cho khối `[new:center]`; chặn dùng `[/new:center]` cho khối `[new]` thường; cho phép `[/new]` đóng được cả hai.
    - **Vấn đề 4 (Tắt auto-dropcap trên trang căn giữa)**: Tắt tự động dropcap chữ cái đầu đoạn trên các trang `hasCenterPage` (`[new:center]` như trang đề tặng), giữ dropcap thủ công bằng `[c]` theo chủ đích người dùng.
    - **Vấn đề 7 (Hỗ trợ `@@!`)**: Hỗ trợ cú pháp tiêu đề lớn `@@!` áp dụng kiểu dáng `h1.main-chap` (kèm class `no-toc` ẩn khỏi mục lục) trong cùng trang hiện tại mà không tách chương độc lập như thẻ `@@`. Cho phép dùng `@@!` bên trong `[letter-box]` an toàn.
  - Sửa toàn bộ 5 lỗi kiểm định & render trong nhóm 'NHOM 1' từ `review.md`:
    - **Mục 1 (Case-insensitive tags)**: Đồng bộ parser nhận diện không phân biệt hoa/thường cho tất cả các thẻ `[NEW]`, `[/NEW]`, `[NEW:CENTER]`, `[LETTER-BOX]`, `[/LETTER-BOX]`, `[POEM]`, `[LETTER]`, tránh rò rỉ nguyên văn tên thẻ ra sách.
    - **Mục 2 (Chặn `@@` vỡ layout trong `[letter-box]`)**: Validator chặn tiêu đề phân chương `@@` nằm bên trong `[letter-box]` khi không có wrapper `[new]`, bảo vệ cấu trúc XHTML chương.
    - **Mục 3 (Tránh dropcap lồng đôi)**: `chapter-builder` kiểm tra thêm `has-dropcap` và thẻ `dropcap` có sẵn từ cú pháp `[c]`, không tự động bọc thêm `dropcap` thứ hai ngay sau tiêu đề.
    - **Mục 4 (Cảnh báo `Chú thích:` lạc chỗ)**: Validator phát hiện và cảnh báo rõ ràng nếu sau dòng `Chú thích:` còn xuất hiện cú pháp `@@` hoặc `[new]`.
    - **Mục 5 (Gom thông báo lỗi validator)**: `parseTxtToChapters` gom toàn bộ danh sách lỗi kiểm định cú pháp phân cách bằng xuống dòng thay vì chỉ ném lỗi đầu tiên.
  - Dọn dẹp các thư mục rác / build artifact tạm thời an toàn (`coverage/`, `test-results/`, `.wrangler/`) và cấu hình `.gitignore` chặn thư mục `coverage/`.
  - Hỗ trợ cặp thẻ bao khối mới **`[letter-box]` $\leftrightarrow$ `[/letter-box]`**:
    - Tạo wrapper hộp có đường viền bo quanh (`<div class="letter-box">`) với CSS chuyên dụng (`quotes.css`), thụt lề chuẩn và ngắt trang linh hoạt (`box-decoration-break: clone`).
    - Hoạt động như một wrapper đa năng: cho phép lồng các thẻ tiêu đề (`@@t`, `@p`), trích dẫn (`~ quote`, `> author`), khối thư (`[letter] ... [/letter]`), chú thích chân trang (`{n}`) và định dạng inline.
    - Miễn nhiễm với cơ chế ghép nối đoạn tự động (`mergeBrokenParagraphs`), giữ nguyên 100% cấu trúc dòng của người dùng.
    - Cập nhật hệ thống kiểm định **TXT Syntax Pre-flight Validator**: bắt lỗi thẻ `[letter-box]` chưa đóng, cấm mở `[new]` bên trong `[letter-box]`, cho phép `[new]` hoặc `[new:center]` bọc bên ngoài `[letter-box]`.
    - Loại trừ `letter-box` khỏi nhận diện thẻ ảnh minh họa `isIllustrationTag`.
    - Hỗ trợ cơ chế dịch ngược **EPUB to TXT** (`htmlToCleanText` & `replaceNestedDiv`), nhận diện chính xác thẻ `<div>` lồng nhau.
    - Bổ sung hướng dẫn cú pháp vào bảng tra cứu `EpubSyntaxModal.svelte`.
    - Bộ kiểm thử mở rộng đạt 300/300 unit tests pass và 12/12 Playwright E2E tests pass.
  - Khắc phục lỗi CI/CD E2E trong test Playwright (`tests-e2e/epub-download-inspection.spec.ts` & `tests-e2e/epub-workflow.spec.ts`).
  - Khắc phục triệt để lỗi CI/CD Prettier format trên GitHub Actions: chuẩn hóa sinh metadata font (`scripts/generate-fonts-meta.js` dùng tab và newline chuẩn `.prettierrc`).
  - Nâng cấp [AI_WORKFLOW.md](AI_WORKFLOW.md) chốt chặn kiểm tra bắt buộc trước khi commit/push: yêu cầu chạy `pnpm format:check`, `pnpm check`, `pnpm lint`, `pnpm test`, `pnpm knip`, `pnpm build`, và `pnpm test:e2e` đồng bộ hoàn toàn với GitHub Actions `ci.yml`.
  - Khắc phục triệt để lỗi `knip` (`oxc-parser` cấp phát 6 GiB buffer) bằng `KNIP_DISABLE_RAW_TRANSFER=1`, đưa `pnpm knip` về trạng thái pass 100% không còn nợ kỹ thuật.
  - Hoàn tất khắc phục các điểm từ bản đánh giá lại `review.md`:
    - Khắc phục triệt để lỗi buffer detachment khi Worker fallback trong EPUB Cleaner (`duplicate-detector.ts`): chuyển sang cơ chế Lazy Fallback Loader nạp lại byte tươi nguyên từ ZIP thay vì dùng buffer detached.
    - Chuẩn hóa kiểm thử Web Worker Concurrency và Fallback trong `tests/epub-cleaner.test.ts` với `AsyncDuplicateWorkerMock` và mock `window`.
    - Hoàn thiện cơ chế tự phục hồi xử lý ảnh ML: bao phủ sự cố `worker.onerror`, `worker.onmessageerror` và response lỗi với `cleanupWorkerAndFallbackPending`, tự động hủy các tác vụ đã bị abort.
  - Hoàn tất tính năng xem trước Jacket: Tích hợp dropdown phông chữ trực tiếp vào Modal xem trước trang giới thiệu (`EpubJacketModal.svelte`), phản chiếu tức thì (real-time font reflection) lên khung preview và đồng bộ 2 chiều với cấu hình Jacket Font.
  - Bổ sung bộ chọn phông chữ riêng cho **"Font cho H2 Sub"** (`h2SubFont`), hỗ trợ quy tắc CSS `h2 + h2, .side-chap + .side-chap` để các tiêu đề H2 phụ liền kề (không có thẻ `<p>` xen giữa) tự động áp dụng phông chữ riêng biệt so với H2 chính.
  - Tái thiết kế bố cục phần cấu hình phông chữ (`EpubFontSettingsSection.svelte`) thành 2 cột dọc responsive (`grid-cols-1 lg:grid-cols-2`): Cột 1 gồm 4 bộ chọn phông (H1, H2, H2 Sub, Dropcap) và Cột 2 là khung Preview chương mẫu thời gian thực.
  - Tinh chỉnh logic nhận diện H2 & H2 Sub: Chỉ thẻ H2 đi ngay sau H1 (`h1 + h2`) mới được tính là Main H2 (nhận font H2). Tất cả các trường hợp H2 còn lại (đứng sau `<p>`, đứng sau H2 khác `h2 + h2`, hoặc đứng đầu chương không có H1) đều tự động nhận font H2 Sub.
  - **Tối ưu hóa Phân loại Phông chữ H2 & H2 Sub với Hoa văn Xen giữa (`<ornamenth1> h1 <ornamenth2> h2`)**:
    - Chuẩn hóa hàm `classifyChapterHeadings` trong `chapter-builder.ts`: Thuật toán kiểm tra tính liền kề `isAdjacent` tự động loại bỏ các khối hoa văn (`<div class="chapter-ornament">`, `<div class="subchapter-ornament">`) và thẻ ảnh hoa văn khi xét quan hệ giữa các tiêu đề.
    - Đảm bảo trường hợp `<ornamenth1> h1 <ornamenth2> h2` thì thẻ `h2` luôn được tính là **Main H2** (nhận `h2Font`) thay vì bị nhầm thành `h2SubFont`.
    - Bảo toàn quy tắc `H2 + H2` (kể cả có `<subchapter-ornament>` xen giữa) thì H2 đầu tiên là Main H2, H2 tiếp theo là H2 Sub (`h2-sub`).
    - Bổ sung các unit test bao phủ toàn diện cho trường hợp có hoa văn đầu chương và phân đoạn xen kẽ.
    - Bổ sung unit tests cho trường hợp khối trích dẫn có tối đa 3 footer liền mạch, trích dẫn bị ngắt bởi dòng trống và dịch ngược EPUB to TXT.
    - Mở rộng bộ kiểm thử đạt **321/321 unit tests pass** và **12/12 Playwright E2E browser tests pass 100%**.
- Cập nhật lần cuối: 2026-10-25 18:05
- Đang dở: Không
- Biết trước còn thiếu / nợ kỹ thuật: Không

---

## Changelog

### 2026-10-25 (PDF Splitter OCR Optimization: 200 DPI Default, Zero-padded Filenames & Degraded Quality Tracking)

- Thêm/sửa: Chuẩn hóa tính năng tách trang PDF phục vụ nhận diện quang học OCR:
  - **Mặc định chuẩn 200 DPI**: Thiết lập mặc định 200 DPI ($scale \approx 2.778$, A4 $\approx 1654 \times 2339$px) đồng nhất trên mọi thiết bị (desktop lẫn mobile), đảm bảo độ nét và kích thước ký tự đủ lớn cho Vision OCR phân tích chính xác dấu tiếng Việt.
  - **Tùy chọn DPI trên UI**: Bổ sung bộ chọn DPI 3 mức (150 DPI - Nhanh/Nhẹ, 200 DPI - Chuẩn OCR, 300 DPI - Scan mờ / Nét nhỏ) trong thẻ cấu hình.
  - **Đệm số 0 tên file (`page0001.jpg`)**: Đệm số 0 tự động theo số trang sách (`Math.max(4, String(totalDocPages).length)`), đảm bảo các script xử lý OCR tự động duyệt file theo thứ tự từ điển không bị đảo trang (tránh `page1, page10, page2`).
  - **Tách biệt điều kiện Mobile với DPI**: Điều kiện thiết bị di động/RAM thấp chỉ áp dụng để chia nhỏ phần ZIP (40MB/phần) nhằm kiểm soát RAM, không hạ ngầm DPI. Khắc phục việc laptop màn hình cảm ứng bị nhận diện nhầm thành điện thoại.
  - **Bảo toàn chất lượng khi thử lại & Minh bạch danh sách trang giảm độ phân giải**:
    - Khi trang gặp lỗi canvas và phải retry ở scale thấp hơn, giữ nguyên chất lượng nén JPEG tối thiểu 85% (`JPEG_QUALITY = 0.85`).
    - Ghi nhận danh sách `degradedPages` và hiển thị cảnh báo trực quan trên giao diện khi hoàn tất kèm danh sách số trang cụ thể.
- Kết quả pipeline: format:check ✅ | lint ✅ | type check (0 err, 0 warn) ✅ | test unit ✅ (342/342 pass) | knip ✅ (0 issues) | build production ✅ | test e2e ✅ (12/12 pass) | graphify ✅ (4860 nodes, 10494 edges, 271 communities)
- File chính bị ảnh hưởng:
  - `src/lib/types/pdf-splitter.type.ts`
  - `src/lib/pdf-splitter/pdf-splitter.ts`
  - `src/lib/pdf-splitter/pdf-splitter-state.svelte.ts`
  - `src/routes/pdf/+page.svelte`
  - `tests/pdf-splitter.test.ts`
  - `README.md`

### 2026-10-25 (PDF Memory Ceiling Hardening: Dynamic Byte Chunking, File System Access API & Page Range)

- Thêm/sửa: Triển khai toàn diện trần bộ nhớ cố định O(1), cơ chế stream trực tiếp ra đĩa và xử lý linh hoạt theo dải trang:
  - **Dynamic Byte Chunking (80MB desktop / 40MB mobile)**:
    - `src/lib/pdf-splitter/pdf-splitter.ts`: Chuyển điều kiện chia phần ZIP từ số trang cố định sang kiểm soát dung lượng cộng dồn `currentPartBytes >= maxPartBytes` (80MB desktop / 40MB mobile) kết hợp trần an toàn 300 trang. Đảm bảo đỉnh heap JSZip được giới hạn cố định $\le 160$MB trên desktop và $\le 80$MB trên mobile, triệt tiêu nguy cơ sập tab trên thiết bị yếu dù sách scan nặng hàng trăm trang.
  - **File System Access API (Stream ghi trực tiếp ra ổ đĩa & giải phóng RAM)**:
    - Tích hợp `window.showDirectoryPicker()` trên Chromium Desktop (`src/lib/pdf-splitter/pdf-splitter-state.svelte.ts` & `src/routes/pdf/+page.svelte`): người dùng chọn thư mục lưu trữ một lần trước khi bắt đầu. Mỗi phần ZIP được stream ghi thẳng vào file trên ổ đĩa và hủy ngay tham chiếu `Blob` khỏi RAM, đưa bộ nhớ đệm tích lũy giữa các phần về mức xấp xỉ 0.
    - Với Safari/iOS: Giữ `Blob` trong RAM và bổ sung nút giải phóng bộ nhớ thủ công từng phần (`releasePartBlob`) sau khi người dùng tải xong.
  - **Lựa chọn Dải trang & Graceful Retry per-page**:
    - Giao diện `src/routes/pdf/+page.svelte`: Bổ sung ô nhập dải trang xử lý ("Từ trang X đến trang Y") cho phép người dùng chia nhỏ hoặc tiếp tục xử lý cuốn sách từ vị trí bị gián đoạn mà không phải chạy lại từ đầu.
    - Cơ chế Graceful Retry: Nếu một trang vẽ canvas hoặc `toBlob` bị lỗi ở scale chuẩn, hệ thống tự động thử lại 1 lần ở `scale 1.0` (quality 0.75). Nếu vẫn lỗi, trang đó được đưa vào danh sách `failedPages` và tiến trình tiếp tục các trang tiếp theo thay vì làm hỏng toàn bộ sách.
    - Tự động hạ scale xuống 1.5x và `MAX_CANVAS_PIXELS = 8Mpx` trên thiết bị di động hoặc máy có RAM $\le$ 4GB (`navigator.deviceMemory`).
  - **Kiểm thử**: Mở rộng thêm 2 unit test suites mới cho dynamic byte chunking, dải trang, graceful retry và stream ghi ra đĩa với mock `FileSystemDirectoryHandle`.
- Kết quả pipeline: format:check ✅ | lint ✅ | type check (0 err, 0 warn) ✅ | test unit ✅ (340/340 pass) | knip ✅ (0 issues) | build production ✅ | test e2e ✅ (12/12 pass) | graphify ✅ (4861 nodes, 10489 edges, 267 communities)
- File chính bị ảnh hưởng:
  - `src/lib/types/pdf-splitter.type.ts`
  - `src/lib/utils/pdf.ts`
  - `src/lib/pdf-splitter/pdf-splitter.ts`
  - `src/lib/pdf-splitter/pdf-splitter-state.svelte.ts`
  - `src/routes/pdf/+page.svelte`
  - `tests/pdf-splitter.test.ts`
  - `README.md`

### 2026-10-25 (PDF Smart Split ZIP, Mobile Guard & Full Zero-Copy Synchronization)

- Thêm/sửa: Khắc phục triệt để vấn đề JSZip ngốn RAM khi nén hàng trăm trang PDF scan, bổ sung cảnh báo thiết bị di động và đồng bộ hóa Zero-Copy trên toàn bộ codebase:
  - **Đồng bộ hóa các vị trí nạp PDF cũ (`epub-images-state.svelte.ts` & `src/lib/utils/pdf.ts`)**:
    - `src/lib/utils/pdf.ts`: Cập nhật `renderPdfPageToBlob` chấp nhận `File | Blob | ArrayBuffer | Uint8Array`. Với `Blob`/`File`, truyền trực tiếp qua `URL.createObjectURL(pdfInput)` (zero-copy streaming) thay vì sao chép toàn bộ file vào mảng RAM; tự động thu hồi bằng `URL.revokeObjectURL(url)` trong `finally`.
    - Tích hợp `getClampedViewport(page, scale)` khống chế tối đa `4096px` / `16MP`, và giải phóng bộ nhớ texture/GPU ngay lập tức bằng `canvas.width = 0; canvas.height = 0`.
    - `src/lib/epub-packer/state/epub-images-state.svelte.ts`:
      - Trích xuất ảnh bìa PDF (`handleCoverFile`): Thay thế mã render thủ công bằng `renderPdfPageToBlob(file, 1, 2.0, 0.9)`, sử dụng Object URL thay vì chuỗi base64 khổng lồ, tự động thu hồi URL trong `removeCoverFile` và `resetCoverCrop`.
      - Trích xuất ảnh minh họa PDF (`handleIllustrationFiles`): Loại bỏ `file.arrayBuffer()`, truyền trực tiếp `file` hoặc `zip.files[name].async('blob')` cho `renderPdfPageToBlob`.
  - **Smart Split ZIP (Khắc phục JSZip gom hết ảnh trong RAM)**:
    - `src/lib/types/pdf-splitter.type.ts`: Bổ sung interface `PdfZipPart` và mở rộng `ProcessPdfResult` gồm `zipBlob: Blob` (tương thích ngược) và `zipParts: PdfZipPart[]`.
    - `src/lib/pdf-splitter/pdf-splitter.ts`: Thiết lập giới hạn `MAX_PAGES_PER_ZIP_PART = 200`. Khi tệp có nhiều trang (>200 trang), tiến trình tự động đóng gói từng phần ZIP độc lập và tái tạo `currentZip = new JSZip()`, giải phóng toàn bộ ảnh JPEG của phần trước khỏi heap JavaScript, khống chế đỉnh RAM dưới 100MB cho tài liệu scan hàng trăm trang.
  - **Cảnh báo thiết bị di động & Giao diện tải đa phần (UI/UX)**:
    - `src/lib/pdf-splitter/pdf-splitter-state.svelte.ts`: Bổ sung `pdfZipParts`, `pagesPerPart`, `isLargeFile`, `isMobile`, `hasMultipleParts`, cùng phương thức `downloadPart(index)` và `downloadAllParts()`.
    - `src/routes/pdf/+page.svelte`: Bổ sung banner cảnh báo tệp PDF lớn / thiết bị di động theo phong cách Solarized Glassmorphism, và hiển thị giao diện tải từng phần ZIP hoặc tải toàn bộ liên tiếp khi sách được chia thành nhiều phần.
  - **Kiểm thử**: Bổ sung unit tests cho multi-part ZIP splitting, `renderPdfPageToBlob` (zero-copy streaming & error handling), `PdfSplitterState` (download helpers & large-file detection) và trích xuất bìa PDF.
- Kết quả pipeline: format:check ✅ | lint ✅ | type check (0 err, 0 warn) ✅ | test unit ✅ (338/338 pass) | knip ✅ (0 issues) | build production ✅ | test e2e ✅ (12/12 pass) | graphify ✅ (4845 nodes, 10458 edges, 276 communities)
- File chính bị ảnh hưởng:
  - `src/lib/types/pdf-splitter.type.ts`
  - `src/lib/utils/pdf.ts`
  - `src/lib/pdf-splitter/pdf-splitter.ts`
  - `src/lib/pdf-splitter/pdf-splitter-state.svelte.ts`
  - `src/lib/epub-packer/state/epub-images-state.svelte.ts`
  - `src/routes/pdf/+page.svelte`
  - `tests/pdf-splitter.test.ts`
  - `tests/image-bg-remove.test.ts`
  - `README.md`

### 2026-10-25 (PDF Splitter Full Hardening: Zero-Copy, Canvas Guard, 100% Offline)

- Thêm/sửa: Khắc phục toàn diện 4 vấn đề kỹ thuật cốt lõi trong bộ tách trang PDF và thư viện PDF.js:
  - **Mục 1 & 2 (Khắc phục ngốn RAM & Xử lý dứt điểm Web Worker)**:
    - `src/lib/pdf-splitter/pdf-splitter.ts`: Loại bỏ hoàn toàn việc nhân bản buffer `arrayBuffer.slice(0)` trên mỗi luồng. Helper `openPdfDocument` sử dụng `URL.createObjectURL(file)` truyền trực tiếp cho `pdfjsLib.getDocument({ url })` đọc dữ liệu dạng streaming theo range requests từ đĩa/blob thay vì giữ toàn bộ buffer 1GB trong heap JavaScript.
    - Xóa bỏ việc tạo `probeDoc` thừa, khởi tạo và tái sử dụng 1 bản thể `PdfJsDocument` duy nhất xuyên suốt.
    - Chuyển sang vòng lặp render tuần tự từng trang trên main thread với `page.cleanup()` và `await new Promise(r => setTimeout(r, 0))` sau mỗi trang, đảm bảo đỉnh RAM tối thiểu và UI luôn đạt 60fps mượt mà.
    - Gỡ bỏ hoàn toàn file `src/lib/pdf-splitter/pdf-splitter.worker.ts` lỗi thời, loại trừ lỗi WHATWG spec `importScripts` trong module worker và triệt tiêu nguy cơ rò rỉ worker.
  - **Mục 3 (Bảo vệ Canvas & Minh bạch lỗi)**:
    - `src/lib/pdf-splitter/pdf-splitter.ts`: Tích hợp hàm tính toán tỉ lệ thích ứng `getClampedViewport`, tự động giới hạn `MAX_CANVAS_DIMENSION = 4096px` và `MAX_CANVAS_PIXELS = 16M pixels`, ngăn chặn việc tràn bộ nhớ hoặc crash canvas trên Safari iOS / thiết bị di động khi gặp trang scan khổ lớn.
    - Giải phóng lập tức bộ nhớ texture/GPU bằng `canvas.width = 0; canvas.height = 0` sau khi hoàn tất render / crop / toBlob mỗi trang.
    - Minh bạch lỗi: Ném ngoại lệ chi tiết khi `canvas.toBlob` trả về `null` hoặc không khởi tạo được context 2D, chấm dứt hoàn toàn tình trạng âm thầm bỏ qua trang lỗi khiến tệp ZIP thiếu trang.
  - **Mục 4 (100% Ngoại tuyến / Offline hoàn toàn)**:
    - Vendor trực tiếp thư viện `pdf.min.js` (313 KB) và `pdf.worker.min.js` (1.1 MB) vào `static/vendor/pdfjs/`.
    - `src/app.html`: Chuyển sang tải script cục bộ `/vendor/pdfjs/pdf.min.js` kèm cơ chế fallback sang CDN khi cần.
    - `src/lib/utils/pdf.ts`: Cập nhật `initPdfWorker` trỏ trực tiếp `GlobalWorkerOptions.workerSrc` vào `/vendor/pdfjs/pdf.worker.min.js`.
    - Bổ sung cấu hình `.prettierignore` và `eslint.config.js` loại trừ thư mục vendor bên thứ ba.
  - **Kiểm thử & Khắc phục**:
    - `tests/pdf-splitter.test.ts`: Bổ sung 5 unit tests mới kiểm tra tái sử dụng document duy nhất, thu hồi `URL.revokeObjectURL`, kiểm tra thuật toán giới hạn canvas `getClampedViewport`, kiểm tra giải phóng kích thước canvas về 0 và kiểm tra ném lỗi khi `toBlob` thất bại.
    - `tests/helpers.test.ts`: Đồng bộ kỳ vọng `workerSrc` cục bộ.
- Kết quả pipeline: format:check ✅ | lint ✅ | type check (0 err, 0 warn) ✅ | test unit ✅ (328/328 pass) | knip ✅ (0 issues) | build production ✅ | test e2e ✅ (12/12 pass) | graphify ✅ (4833 nodes, 10424 edges, 275 communities)
- File chính bị ảnh hưởng:
  - `src/lib/pdf-splitter/pdf-splitter.ts`
  - `src/lib/utils/pdf.ts`
  - `src/app.html`
  - `src/lib/types/pdf-splitter.type.ts`
  - `static/vendor/pdfjs/pdf.min.js` (thêm mới)
  - `static/vendor/pdfjs/pdf.worker.min.js` (thêm mới)
  - `src/lib/pdf-splitter/pdf-splitter.worker.ts` (đã xóa)
  - `tests/pdf-splitter.test.ts`
  - `tests/helpers.test.ts`
  - `.prettierignore`
  - `eslint.config.js`
  - `README.md`

### 2026-10-21 (Seamless Multi-Footers Support in Blockquote)

- Thêm/sửa: Hỗ trợ nhiều dòng footer `>` liền mạch (tối đa 3 dòng footer) trong khối trích dẫn `~`:
  - `src/lib/epub-packer/parser/txt-parser.ts`: Cập nhật logic nhận diện khối `~` (cả ở chế độ thông thường lẫn bên trong `[letter-box]`/`[new]`), cho phép quét tối đa 3 dòng footer `>` liên tiếp nếu viết liền mạch (không có dòng trống). Nếu gặp dòng trống ngắt quãng hoặc vượt quá 3 dòng, các dòng `>` phía sau tự động dừng gom nhóm và được render thành thẻ văn bản `<p>&gt; ...</p>` thông thường.
  - `src/lib/epub-to-txt/epub-to-txt.ts`: Đồng bộ cơ chế đảo ngược EPUB to TXT (`htmlToCleanText`), bắt tất cả các thẻ `<footer>`/`<cite>` bên trong `<blockquote>` xuất ra thành các dòng `> Footer` tương ứng.
  - `src/lib/epub-packer/components/EpubSyntaxModal.svelte`: Cập nhật hướng dẫn cú pháp modal ghi rõ hỗ trợ tối đa 3 footer liền mạch.
  - `tests/epub-parser.test.ts` & `tests/epub-to-txt.test.ts`: Bổ sung 2 unit test mới kiểm tra khối trích dẫn 3 footer liền mạch, trích dẫn bị ngắt bởi dòng trống, trích dẫn vượt quá 3 footer, và đảo ngược EPUB to TXT.
- Kết quả pipeline: format ✅ | lint ✅ | type check (0 err, 0 warn) ✅ | test unit ✅ (321/321 pass) | knip ✅ (0 issues) | graphify ✅ (918 nodes, 2088 edges)
- File chính bị ảnh hưởng:
  - `src/lib/epub-packer/parser/txt-parser.ts`
  - `src/lib/epub-to-txt/epub-to-txt.ts`
  - `src/lib/epub-packer/components/EpubSyntaxModal.svelte`
  - `tests/epub-parser.test.ts`
  - `tests/epub-to-txt.test.ts`
  - `README.md`

### 2026-10-16 (H2 Font Classification with Intervening Ornaments)

- Thêm/sửa: Hỗ trợ trường hợp hoa văn xen kẽ `<ornamenth1> h1 <ornamenth2> h2` trong logic phân loại phông chữ H2:
  - `src/lib/epub-packer/xml-builders/chapter-builder.ts`: Bổ sung `ORNAMENT_CONTAINER_REGEX` và `ORNAMENT_IMG_REGEX` vào hàm `classifyChapterHeadings`, đảm bảo việc kiểm tra tính liền kề giữa `h1` và `h2` bỏ qua các khối hoa văn chương/tiểu chương, giữ nguyên `h2` là Main H2 (`h2Font`).
  - `tests/epub-packer.test.ts`: Thêm test suites kiểm tra `<ornamenth1> h1 <ornamenth2> h2` và chuỗi `h2` có hoa văn xen kẽ.
- Kết quả pipeline: format ✅ | lint ✅ | type check (0 err, 0 warn) ✅ | test unit ✅ (319/319 pass) | test e2e ✅ (12/12 pass) | knip ✅ (0 issues) | graphify ✅ (923 nodes, 2094 edges)
- File chính bị ảnh hưởng:
  - `src/lib/epub-packer/xml-builders/chapter-builder.ts`
  - `tests/epub-packer.test.ts`
  - `README.md`

### 2026-10-16 (Refine H2 & H2 Sub Font Assignment Logic: Direct Sibling Only)

- Thêm/sửa: Điều chỉnh logic nhận diện Main H2 và H2 Sub theo quy tắc liền kề trực tiếp:
  - `src/lib/epub-packer/builders/stylesheet-builder.ts`:
    - Chỉ thẻ H2 đi **ngay sau H1** (`h1 + h2`, `h1.main-chap + h2.side-chap`, kèm hỗ trợ hoa văn phụ `h1 + .subchapter-ornament + h2`) mới được tính là Main H2 (áp dụng `h2Font`).
    - Tất cả các trường hợp H2 khác (ngay trước nó là đoạn văn `<p>`, đứng sau H2 khác `h2 + h2`, hoặc chương không có H1) đều mặc định là H2 Sub (áp dụng `h2SubFont`).
    - Giữ trọn vẹn cơ chế fallback an toàn về `h2Font` khi `h2SubFont` để `'default'`.
  - `src/lib/epub-packer/components/EpubFontSettingsSection.svelte`: Cập nhật nhãn và mô tả trong khung Preview: `H2 ngay sau H1` vs `H2 Sub (sau đoạn văn, tiếp nối H2 hoặc không có H1)`.
  - `tests/epub-packer.test.ts`: Cập nhật unit test xác thực các quy tắc CSS `h1 + h2` và `h2` trong `style.css`.
- Kết quả pipeline: format:check ✅ | lint ✅ | type check (0 err, 0 warn) ✅ | test unit ✅ (312/312 pass) | knip ✅ (0 issues) | build production ✅ | test e2e ✅ (12/12 pass) | graphify ✅ (922 nodes, 2090 edges)
- File chính bị ảnh hưởng:
  - `src/lib/epub-packer/builders/stylesheet-builder.ts`
  - `src/lib/epub-packer/components/EpubFontSettingsSection.svelte`
  - `tests/epub-packer.test.ts`
  - `README.md`

### 2026-10-16 (H2 Sub Font Selector & 2-Column Font Settings Layout)

- Thêm/sửa: Bổ sung bộ chọn phông chữ cho tiêu đề phụ H2 Sub và tái cấu trúc giao diện cài đặt phông:
  - `src/lib/types/epub.type.ts`: Bổ sung thuộc tính `h2SubFont?: string;` vào `EpubFontsConfig`.
  - `src/lib/epub-packer/state/epub-fonts-state.svelte.ts` & `src/lib/epub-packer/epub-state.svelte.ts`: Bổ sung `h2SubFont` vào state quản lý phông, danh sách phông cần tải và đóng gói vào tệp EPUB (`neededFonts`).
  - `src/lib/epub-packer/builders/asset-builder.ts`: Phân giải active fonts bao gồm `h2SubFont`.
  - `src/lib/epub-packer/builders/stylesheet-builder.ts`: Đăng ký `@font-face` khử trùng lặp cho `h2SubFont` và thêm quy tắc CSS `h2 + h2, .side-chap + .side-chap { font-family: "${f2Sub.cssFamily}", serif !important; }` (khi có `<p>` xen giữa, H2 tiếp theo tự động quay về font H2 chính).
  - `src/lib/epub-packer/components/EpubFontSettingsSection.svelte`: Chuyển đổi giao diện thành lưới 2 cột: Cột 1 chứa 4 bộ chọn `FontSelect` dọc (Font cho Tiêu đề lớn H1, Font cho Tiêu đề nhỏ H2, Font cho H2 Sub, Font cho Chữ hoa đầu đoạn Dropcap); Cột 2 chứa khung Preview trực tiếp chương sách với H1, H2, H2 Sub và Dropcap.
  - `tests/epub-packer.test.ts`: Bổ sung unit test xác thực quy tắc CSS `h2 + h2` được tiêm chính xác vào `style.css` của EPUB.
  - `tests-e2e/epub-workflow.spec.ts`: Mở rộng test E2E kiểm tra chọn phông chữ H2 Sub và phản chiếu trong DOM.
- Kết quả pipeline: format:check ✅ | lint ✅ | type check (0 err, 0 warn) ✅ | test unit ✅ (312/312 pass) | knip ✅ (0 issues) | build production ✅ | test e2e ✅ (12/12 pass) | graphify ✅ (920 nodes, 2087 edges)
- File chính bị ảnh hưởng:
  - `src/lib/types/epub.type.ts`
  - `src/lib/epub-packer/state/epub-fonts-state.svelte.ts`
  - `src/lib/epub-packer/epub-state.svelte.ts`
  - `src/lib/epub-packer/builders/asset-builder.ts`
  - `src/lib/epub-packer/builders/stylesheet-builder.ts`
  - `src/lib/epub-packer/components/EpubFontSettingsSection.svelte`
  - `tests/epub-packer.test.ts`
  - `tests-e2e/epub-workflow.spec.ts`
  - `README.md`

### 2026-10-16 (Fix Jacket Modal Font Persistence Across Templates)

- Thêm/sửa: Khắc phục sự cố phông chữ không phản ánh khi chuyển tiếp giữa các mẫu trang giới thiệu trong `EpubJacketModal.svelte`:
  - Khắc phục cơ chế tiêm style: Loại bỏ hoàn toàn thẻ `<style>` lồng trong container `.preview-wrap`, chuyển toàn bộ định nghĩa style ghi đè phông chữ vào `<svelte:head>` và đồng thời gán CSS custom property `--jacket-font` trực tiếp lên phần tử `.preview-wrap` kèm quy tắc `:global(.preview-wrap, .preview-wrap *) { font-family: var(--jacket-font, inherit) !important; }`.
  - Chuẩn hóa hàm sinh `jacketFontFamily`: Lọc sạch chuỗi rỗng `""`, loại bỏ lỗi cú pháp font-family khiến browser CSS parser bỏ qua toàn bộ thuộc tính.
  - Ổn định chỉ mục mẫu preview: Sử dụng biến trạng thái `wasOpen` để chỉ đồng bộ chỉ mục mẫu từ `epubState.jacket.jacketTemplateId` khi modal mở lần đầu, ngăn ngừa việc điều hướng 'Tiếp' / 'Trước' hoặc chọn phông chữ bị reset ngược về mẫu 1.
  - Cập nhật kịch bản kiểm thử Playwright E2E: Xác minh toàn diện việc chọn phông, chuyển tiếp qua lại giữa các Mẫu 1, 2, 3 và kiểm tra giá trị `fontFamily` thực tế tại từng bước.
- Kết quả pipeline: format:check ✅ | lint ✅ | type check (0 err, 0 warn) ✅ | test unit ✅ (311/311 pass) | knip ✅ (0 issues) | build production ✅ | test e2e ✅ (12/12 pass) | graphify ✅ (919 nodes, 2086 edges)
- File chính bị ảnh hưởng:
  - `src/lib/epub-packer/components/EpubJacketModal.svelte`
  - `tests-e2e/epub-workflow.spec.ts`
  - `README.md`

### 2026-10-16 (Live Font Preview Dropdown for H1, H2, Dropcap & Jacket Modal)

- Thêm/sửa: Trực quan hóa lựa chọn phông chữ H1, H2, Dropcap và Jacket Modal với typography thực tế ngay tại danh sách chọn:
  - `FontSelect.svelte`: Tạo mới component chọn font tùy biến theo chuẩn Solarized Glassmorphism, hỗ trợ prop `compact` cho toolbar. Mỗi mục trong danh sách được định kiểu trực tiếp bằng `font-family` của chính nó, hiển thị tên phông chữ và văn bản mẫu tiếng Việt có dấu ("Chương 1: Bình minh") cùng mã định danh font.
  - Tích hợp ô lọc tìm kiếm phông chữ (`searchQuery`) gõ nhanh theo tên hoặc ID. Nút trigger khi đóng hiển thị tên phông chữ được vẽ bằng chính font đang chọn.
  - Tích hợp thẻ `<select class="sr-only">` ẩn đồng bộ 2 chiều, đảm bảo tương thích 100% với form accessibility và các công cụ tự động hóa.
  - `EpubFontSettingsSection.svelte`: Nâng cấp bộ chọn font Tiêu đề lớn (H1), Tiêu đề nhỏ (H2) và Dropcap sang dùng `FontSelect`.
  - `EpubJacketModal.svelte`: Nâng cấp dropdown phông chữ trên thanh công cụ của Modal xem trước trang giới thiệu sang dùng `FontSelect` với chế độ `compact={true}`.
  - `src/routes/epub-packer/+page.svelte`: Đăng ký bổ sung `font.cssFamily` và `font-display: swap` vào định nghĩa `@font-face` để tăng tốc độ nạp font trong trình duyệt.
  - `tests-e2e/epub-workflow.spec.ts`: Bổ sung kiểm thử tương tác mở dropdown xem trước font H1 và Jacket Modal, chọn phông chữ và kiểm chứng phản chiếu giá trị.
- Kết quả pipeline: format:check ✅ | lint ✅ | type check (0 err, 0 warn) ✅ | test unit ✅ (311/311 pass) | knip ✅ (0 issues) | build production ✅ | test e2e ✅ (12/12 pass) | graphify ✅ (918 nodes, 2085 edges)
- File chính bị ảnh hưởng:
  - `src/lib/components/FontSelect.svelte`
  - `src/lib/types/components.type.ts`
  - `src/lib/epub-packer/components/EpubFontSettingsSection.svelte`
  - `src/lib/epub-packer/components/EpubJacketModal.svelte`
  - `src/routes/epub-packer/+page.svelte`
  - `tests-e2e/epub-workflow.spec.ts`
  - `README.md`

### 2026-10-16 (Jacket Template Name Simplification & Dedicated Modal Font Selection)

- Thêm/sửa: Chuẩn hóa tên mẫu trang giới thiệu và tinh gọn khu vực metadata:
  - `jacket-templates.ts`: Đổi tên toàn bộ 10 mẫu trang giới thiệu sách thành thuần túy `Mẫu 1`, `Mẫu 2`, `Mẫu 3`, ..., `Mẫu 10`, loại bỏ toàn bộ các tên phụ không cần thiết.
  - `EpubMetadataSection.svelte`: Loại bỏ trường input chọn phông chữ trang giới thiệu (`#jacket-font-select`), chuyển hoàn toàn tính năng chọn font vào bên trong Modal xem trước (`EpubJacketModal.svelte`). Hiển thị huy hiệu phông chữ gọn gàng bên cạnh tên mẫu đang chọn.
  - `EpubJacketModal.svelte`: Tinh chỉnh nhãn hiển thị mẫu trên thanh công cụ thành `{template.name} ({idx + 1}/{total})` (ví dụ `Mẫu 1 (1/10)`), tránh lặp lại từ 'Mẫu'.
  - `tests-e2e/epub-workflow.spec.ts`: Cập nhật kịch bản Playwright E2E kiểm chứng input font đã được gỡ bỏ khỏi trang chính, kiểm tra font chọn trong preview modal được phản chiếu và lưu trữ chính xác.
- Kết quả pipeline: format:check ✅ | lint ✅ | type check (0 err, 0 warn) ✅ | test unit ✅ (311/311 pass) | knip ✅ (0 issues) | build production ✅ | test e2e ✅ (12/12 pass) | graphify ✅ (914 nodes, 2078 edges)
- File chính bị ảnh hưởng:
  - `src/lib/epub-packer/templates/jacket-templates.ts`
  - `src/lib/epub-packer/components/EpubMetadataSection.svelte`
  - `src/lib/epub-packer/components/EpubJacketModal.svelte`
  - `tests-e2e/epub-workflow.spec.ts`
  - `README.md`

### 2026-10-16 (Jacket Preview Modal Real-Time Font Selection)

- Thêm/sửa: Bổ sung dropdown phông chữ trực tiếp trong Modal xem trước trang giới thiệu sách (Jacket Preview Modal):
  - `EpubJacketModal.svelte`: Bổ sung toolbar hiển thị tên mẫu trang giới thiệu và dropdown chọn phông chữ (`AVAILABLE_FONTS`), liên kết trực tiếp hai chiều với `epubState.fonts.jacketFont`.
  - Phản chiếu trực tiếp (Real-time reflection): cập nhật selector CSS động `.preview-wrap, .preview-wrap *` áp dụng ngay lập tức font chữ đã chọn lên toàn bộ tiêu đề, tác giả, dịch giả và thông tin xuất bản trong khung xem trước mà không cần đóng modal.
  - Đồng bộ tự động với `EpubMetadataSection.svelte` trên giao diện chính khi người dùng đổi font trong modal hoặc xác nhận chọn mẫu.
  - `tests-e2e/epub-workflow.spec.ts`: Cập nhật kịch bản Playwright E2E kiểm chứng mở modal xem trước, thay đổi phông chữ sang `Bookerly`, xác nhận preview phản chiếu và đồng bộ thành công sang section chính.
- Kết quả pipeline: format:check ✅ | lint ✅ | type check (0 err, 0 warn) ✅ | test unit ✅ (311/311 pass) | knip ✅ (0 issues) | build production ✅ | test e2e ✅ (12/12 pass) | graphify ✅ (913 nodes, 2078 edges)
- File chính bị ảnh hưởng:
  - `src/lib/epub-packer/components/EpubJacketModal.svelte`
  - `tests-e2e/epub-workflow.spec.ts`
  - `README.md`

### 2026-10-16 (Worker Detached Buffer Fallback, Concurrency Testing & ML Self-Healing)

- Thêm/sửa: Khắc phục triệt để các vấn đề rà soát từ `review.md`:
  - `duplicate-detector.ts`: Áp dụng cơ chế Lazy Fallback Loader (`fallbackLoader: () => Promise<ScanItemInput[]>`) khi Worker gặp lỗi, bảo toàn nguyên vẹn dữ liệu ảnh/font/CSS mà không bị lỗi detached buffer từ zero-copy transfer, đồng thời không gây tốn RAM ở luồng chính.
  - `tests/epub-cleaner.test.ts`: Tích hợp `AsyncDuplicateWorkerMock` và giả lập `window` trong môi trường kiểm thử Vitest, kiểm chứng toàn diện 4 điều kiện: chạy chung 1 Worker instance, abort 1 job không ngắt worker của job còn lại, job còn lại nhận kết quả chính xác, và worker ném `onerror` tự động fallback thành công với buffer nguyên vẹn.
  - `image-bg-remove-ml.ts`: Thay thế `cleanupWorkerAndRejectPending` bằng `cleanupWorkerAndFallbackPending(error)`, bao phủ triệt để các sự cố `onerror`, `onmessageerror` và lỗi xử lý worker để tự động phục hồi qua `processOrnamentOnMainThread()`, đảm bảo kiểm tra `signal?.aborted` tránh thực thi tác vụ bị hủy.
  - `tests/image-bg-remove.test.ts`: Bổ sung 2 unit tests kiểm tra `worker.onerror` tự động phục hồi trên luồng chính và xác nhận bỏ qua các job đã bị abort.
- Kết quả pipeline: format:check ✅ | lint ✅ | type check (0 err, 0 warn) ✅ | test unit ✅ (311/311 pass) | knip ✅ (0 issues) | build production ✅ | test e2e ✅ (12/12 pass) | graphify ✅ (907 nodes, 2063 edges)
- File chính bị ảnh hưởng:
  - `src/lib/epub-editor/cleaner/duplicate-detector.ts`
  - `src/lib/utils/image-bg-remove-ml.ts`
  - `tests/epub-cleaner.test.ts`
  - `tests/image-bg-remove.test.ts`
  - `review.md`
  - `README.md`

### 2026-10-16 (Worker Cancellation Race Condition & ML Fallback Hardening)

- Thêm/sửa: Khắc phục 2 lỗi tiềm ẩn từ `review.md`:
  - `txt-parser.ts` & `duplicate-detector.ts`: Thiết lập cơ chế đăng ký tác vụ trung tâm (`pendingTxtJobs` và `pendingDuplicateJobs`), tránh gọi `worker.terminate()` trên Worker Singleton dùng chung khi vẫn còn tác vụ khác đang chờ kết quả, bảo vệ an toàn cho các tác vụ chạy song song khi có 1 tác vụ bị abort.
  - `image-bg-remove-ml.ts`: Tách hàm `processOrnamentOnMainThread`, bổ sung cơ chế tự phục hồi chạy trên luồng chính khi `worker.postMessage` ném lỗi.
  - Bổ sung 3 unit tests mới cho `txt-parser`, `duplicate-detector` và `image-bg-remove` (nâng tổng số tests lên 308/308 pass).
- Kết quả pipeline: format:check ✅ | lint ✅ | type check (0 err, 0 warn) ✅ | test unit ✅ (308/308 pass) | knip ✅ (0 issues) | build production ✅ | test e2e ✅ (12/12 pass) | graphify ✅
- File chính bị ảnh hưởng:
  - `src/lib/epub-packer/parser/txt-parser.ts`
  - `src/lib/epub-editor/cleaner/duplicate-detector.ts`
  - `src/lib/utils/image-bg-remove-ml.ts`
  - `tests/epub-parser.test.ts`
  - `tests/epub-cleaner.test.ts`
  - `tests/image-bg-remove.test.ts`
  - `review.md`
  - `README.md`

### 2026-10-16 (Letter/Poem Dropcap Suppression & Heading Syntax Warning)

- Thêm/sửa: Chuẩn hóa tính năng Dropcap và tiêu đề trong khối `[letter]` và `[poem]`:
  - `chapter-builder.ts`: Tự động bảo vệ khối `[letter]` và `[poem]` (`<div class="letter">`, `<div class="poem">`) không bị tự động chèn dropcap sau tiêu đề `<h1>`/`<h2>`, chỉ giữ dropcap thủ công khi người dùng viết `[c]`.
  - `txt-parser.ts`: Render đoạn văn thông thường bên trong `currentBlock` thành thẻ `<p>` tiêu chuẩn; hỗ trợ dropcap cưỡng bức `[c]` và tiêu đề không mục lục `@@!`, `@!`.
  - `txt-syntax-validator.ts`: Chuyển đổi kiểm tra `@@` và `@` bên trong `[letter]` và `[poem]` sang `warning` (thay vì `error`), giữ `isValid: true` và không dừng tiến trình build, hiển thị cảnh báo chi tiết và render thành `<p>@...</p>`, `<p>@@...</p>`.
  - Bổ sung và cập nhật unit tests cho `buildChapterXhtml`, `validateTxtSyntax` và `parseTxtToChapters` (305/305 unit tests pass 100%, 12/12 Playwright E2E browser tests pass 100%).
- Kết quả pipeline: format:check ✅ | lint ✅ | type check (0 err, 0 warn) ✅ | test unit ✅ (305/305 pass) | knip ✅ (0 issues) | build production ✅ | test e2e ✅ (12/12 pass) | graphify ✅ (898 nodes, 2037 edges)
- File chính bị ảnh hưởng:
  - `src/lib/epub-packer/parser/txt-syntax-validator.ts`
  - `src/lib/epub-packer/parser/txt-parser.ts`
  - `src/lib/epub-packer/xml-builders/chapter-builder.ts`
  - `tests/epub-parser.test.ts`
  - `tests/epub-packer.test.ts`
  - `review.md`
  - `README.md`

### 2026-10-16 (Review Refinements: UI Error Wrap, Letter/Poem Headings, Ornament Fix & PDF Zero-Copy)

- Thêm/sửa: Hoàn tất 6 cải tiến chất lượng và hiệu năng từ `review.md`:
  - `EpubSourceSection.svelte`: Bổ sung class `whitespace-pre-line` vào khung báo lỗi, giúp danh sách lỗi cú pháp hiển thị xuống dòng trực quan.
  - `txt-syntax-validator.ts` & `txt-parser.ts`: Giới hạn cú pháp tiêu đề bên trong khối `[letter]` và `[poem]` chỉ cho phép `@@!` và `@!` (áp dụng `h1`/`h2` kèm class `no-toc`), ném lỗi cú pháp rõ ràng nếu người dùng dùng `@@` hoặc `@`.
  - `chapter-builder.ts`: Bổ sung điều kiện kiểm tra `no-toc` cho thẻ `<h1>` trước khi chèn `chapter-ornament`, loại bỏ tình trạng chèn lặp hoa văn khi xuất hiện `@@!`.
  - `pdf-splitter.ts`: Sửa lỗi nhân đôi bộ nhớ worker khi truyền ArrayBuffer, áp dụng cơ chế Zero-Copy Transfer (`workerBuf` dùng chung cho payload và transferList).
  - `txt-parser.ts` & `nav-builder.ts`: Dùng cờ `hasCustomTitle: false` trên chương và phát sinh warning khi khối `[new]` thiếu tiêu đề.
  - Bổ sung 3 unit tests mới cho `txt-parser` và 1 unit test cho `chapter-builder` (nâng tổng số tests lên 303/303 pass).
- Kết quả pipeline: format:check ✅ | lint ✅ | type check (0 err, 0 warn) ✅ | test unit ✅ (303/303 pass) | knip ✅ (0 issues) | build production ✅ | test e2e ✅ (12/12 pass) | graphify ✅ (888 nodes, 2024 edges)
- File chính bị ảnh hưởng:
  - `src/lib/epub-packer/components/EpubSourceSection.svelte`
  - `src/lib/epub-packer/parser/txt-syntax-validator.ts`
  - `src/lib/epub-packer/parser/txt-parser.ts`
  - `src/lib/epub-packer/xml-builders/chapter-builder.ts`
  - `src/lib/epub-packer/xml-builders/nav-builder.ts`
  - `src/lib/pdf-splitter/pdf-splitter.ts`
  - `tests/epub-parser.test.ts`
  - `tests/epub-packer.test.ts`
  - `README.md`

### 2026-10-16 (CI/CD Pipeline Hardening & Knip Resolution)

- Thêm/sửa: Chuẩn hóa toàn bộ quy trình xác thực CI/CD và giải quyết nợ kỹ thuật:
  - Khắc phục lỗi GitHub Actions `Code formatting check (Prettier)`: chỉnh sửa `scripts/generate-fonts-meta.js` xuất định dạng `src/assets/fonts-metadata.json` bằng tab (`\t`) và ký tự ngắt dòng cuối tệp (`\n`) đúng chuẩn `.prettierrc`.
  - Xử lý triệt để lỗi `knip` (do `oxc-parser` cố gắng cấp phát 6 GiB ArrayBuffer trên Linux): cấu hình script `"knip": "KNIP_DISABLE_RAW_TRANSFER=1 knip"` trong `package.json`, knip quét thành công 100% không phát hiện file rác / dead code.
  - Cập nhật [AI_WORKFLOW.md](AI_WORKFLOW.md) mục 2: thiết lập Chu trình kiểm tra cục bộ và Pipeline Chốt Chặn CI/CD bắt buộc 100% pass trước khi commit/push (bao gồm `pnpm format:check`, `pnpm build`, `pnpm test:e2e`).
- Kết quả pipeline: format:check ✅ | lint ✅ | type check (0 err, 0 warn) ✅ | test unit ✅ (300/300 pass) | knip ✅ (0 issues) | build production ✅ | test e2e ✅ (12/12 pass) | graphify ✅ (887 nodes, 2024 edges)
- File chính bị ảnh hưởng:
  - `scripts/generate-fonts-meta.js`
  - `src/assets/fonts-metadata.json`
  - `package.json`
  - `AI_WORKFLOW.md`
  - `README.md`

### 2026-10-16 (Web Worker Lifecycle Hardening & Listener Leak Prevention)

- Thêm/sửa: Chuẩn hóa toàn diện vòng đời Web Worker theo khuyến nghị trong `review.md`:
  - `txt-parser.ts`: Gỡ triệt để các listener `error` và `messageerror` trong `cleanup()`, bọc lời gọi fallback trực tiếp trong try-catch và bắt lỗi `postMessage`.
  - `duplicate-detector.ts`: Bổ sung listener `error` và `messageerror` trên worker, đảm bảo `cleanup()` dọn dẹp sạch listener `message`/`error`/`abort`, chống treo Promise khi worker gặp lỗi, xử lý fallback an toàn khi `postMessage` thất bại.
  - `pdf-splitter.ts`: Bổ sung listener `error` và `messageerror`, đảm bảo `cleanup()` gỡ listener `abort` khỏi `signal`, bọc `postMessage` với try-catch và cleanup an toàn.
  - `image-bg-remove-ml.ts`: Bọc `worker.postMessage` trong try-catch kèm cleanup khi xảy ra lỗi truyền dữ liệu.
  - Viết bổ sung 4 unit tests kiểm tra chạy worker bất đồng bộ, xử lý AbortSignal và thu hồi listener trong `tests/epub-parser.test.ts`, `tests/epub-cleaner.test.ts` và `tests/pdf-splitter.test.ts`.
- Kết quả pipeline: format ✅ | lint ✅ | type check (0 err, 0 warn) ✅ | test unit ✅ (300/300 pass) | knip: nợ kỹ thuật oxc-parser | graphify ✅ (884 nodes, 2020 edges)
- File chính bị ảnh hưởng:
  - `src/lib/epub-packer/parser/txt-parser.ts`
  - `src/lib/epub-editor/cleaner/duplicate-detector.ts`
  - `src/lib/pdf-splitter/pdf-splitter.ts`
  - `src/lib/utils/image-bg-remove-ml.ts`
  - `tests/epub-parser.test.ts`
  - `tests/epub-cleaner.test.ts`
  - `tests/pdf-splitter.test.ts`
  - `review.md`
  - `README.md`

### 2026-10-16 (TypeScript Strict Mode Full Compliance)

- Thêm/sửa: Nâng cấp toàn diện TypeScript lên `strict: true` theo khuyến nghị trong `review.md`:
  - Rà soát và xử lý triệt để 47 lỗi strict mode và nullability trên toàn bộ codebase.
  - Sửa lỗi xử lý `b.text` undefined trong `extractChunkBlocks` và `analyzeChapterCandidates` ([epub-chapter-utils.ts](src/lib/epub-packer/parser/epub-chapter-utils.ts)).
  - Bổ sung type guard cho khối text đầu tiên trong `epub-single-grouper.ts` và `epub-zip-grouper.ts`.
  - Chuẩn hóa hàm `ensureChapterOpen` trả về `RawChapterItem` để đảm bảo an toàn kiểu dữ liệu và chống nullability xuyên suốt parser ([txt-parser.ts](src/lib/epub-packer/parser/txt-parser.ts)).
  - Bổ sung type chú thích explicit cho regex replace callbacks trong `chapter-builder.ts`.
  - Khắc phục type narrowing cho `globalPdfjs` trong closure bất đồng bộ của `pdf-splitter.ts`.
  - Cập nhật render an toàn `children?.()` trong `+layout.svelte`.
  - Kích hoạt `"strict": true` trong `tsconfig.json`.
- Kết quả pipeline: format ✅ | lint ✅ | type check (0 err, 0 warn) ✅ | test unit ✅ (296/296 pass) | knip: nợ kỹ thuật oxc-parser | graphify ✅ (883 nodes, 2013 edges)
- File chính bị ảnh hưởng:
  - `tsconfig.json`
  - `src/lib/epub-packer/parser/epub-chapter-utils.ts`
  - `src/lib/epub-packer/parser/epub-single-grouper.ts`
  - `src/lib/epub-packer/parser/epub-zip-grouper.ts`
  - `src/lib/epub-packer/parser/txt-parser.ts`
  - `src/lib/epub-packer/xml-builders/chapter-builder.ts`
  - `src/lib/pdf-splitter/pdf-splitter.ts`
  - `src/routes/+layout.svelte`
  - `review.md`
  - `README.md`

### 2026-10-16 (Workflow & Documentation Consolidation)

- Thêm/sửa: Chuẩn hóa hệ thống tài liệu quy trình và giao diện:
  - Khởi tạo [AI_WORKFLOW.md](AI_WORKFLOW.md) kết hợp đầy đủ quy trình AI Coding Agent, quy tắc Svelte 5 Rune, pipeline 6 bước và tích hợp toàn bộ kiến trúc 4 tầng kiểm thử, Ma trận "Sửa gì - Chạy test gì" cùng Cheat Sheet từ `DEVELOPMENT_WORKFLOW.md`.
  - Khởi tạo [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) chuẩn hóa bảng màu Solarized, typography, tokens và quy chuẩn component UI.
  - Xóa file `DEVELOPMENT_WORKFLOW.md` sau khi gộp nội dung để tinh gọn kho lưu trữ.
  - Cập nhật liên kết tài liệu trong [README.md](README.md).
- Kết quả pipeline: format ✅ | lint ✅ | type check (0 err, 0 warn) ✅ | test unit ✅ (296/296 pass) | knip: nợ kỹ thuật oxc-parser | graphify ✅ (881 nodes, 2011 edges)
- File chính bị ảnh hưởng:
  - `AI_WORKFLOW.md`
  - `DESIGN_SYSTEM.md`
  - `DEVELOPMENT_WORKFLOW.md` (deleted)
  - `README.md`

### 2026-10-16 (CI/CD Verification & Expanded Test Coverage)

- Thêm/sửa: Kiểm tra toàn diện chu trình CI/CD và bổ sung các ca kiểm thử còn thiếu:
  - Đồng bộ cơ chế đảo ngược EPUB to TXT (`htmlToCleanText`) nhận diện thẻ `<h1 ... no-toc>` chuyển đổi thành `@@!`, `@@!t`, `@@!p`.
  - Bổ sung unit tests cho định dạng căn lề tiêu đề `@@!t` và `@@!p` không ngắt trang và không sinh TOC.
  - Bổ sung unit test xác thực định dạng inline trong tiêu đề của khối `[new:center]`.
  - Bổ sung unit test kiểm tra bảo toàn dropcap thủ công `[c]` trong khối `hasCenterPage` (trang đề tặng).
  - Bổ sung unit test kiểm tra bảo vệ khối `[letter-box]` trong thuật toán ghép nối đoạn `mergeBrokenParagraphs`.
  - Bổ sung unit test kiểm tra khử trùng lặp mục lục TOC khi tiêu đề là 'Giới Thiệu' hoặc trùng tiêu đề chương.
- Kết quả pipeline: format ✅ | lint ✅ | type check (0 err, 0 warn) ✅ | test unit ✅ (296/296 pass) | test e2e ✅ (12/12 pass) | build production ✅ | knip: nợ kỹ thuật oxc-parser | graphify ✅ (863 nodes, 1991 edges)
- File chính bị ảnh hưởng:
  - `src/lib/epub-to-txt/epub-to-txt.ts`
  - `tests/epub-to-txt.test.ts`
  - `tests/epub-parser.test.ts`
  - `tests/epub-packer.test.ts`
  - `README.md`

### 2026-10-16 (Refinements: TOC, Center Page, Dropcap & @@!)

- Thêm/sửa: Hoàn tất các cải tiến thiết kế và cú pháp:
  - Vấn đề 2 & 5: Dùng placeholder 'Giới Thiệu' cho `[new]` và `[new:center]` khi không có tiêu đề, tự động khử trùng lặp mục lục TOC khi có `h2`.
  - Vấn đề 3: Cho phép đóng `[/new:center]` cho `[new:center]` và kiểm định tính hợp lệ bất đối xứng (không cho đóng `[new]` thường).
  - Vấn đề 4: Tắt auto-dropcap trên các chương căn giữa `hasCenterPage` (trang đề tặng).
  - Vấn đề 7: Hỗ trợ cú pháp tiêu đề lớn `@@!` áp dụng kiểu dáng `h1.main-chap` (kèm class `no-toc`) cùng trang, không tách chương độc lập như `@@`.
  - Viết bổ sung 8 unit tests kiểm định toàn diện.
- Kết quả pipeline: format ✅ | lint ✅ | type check (0 err, 0 warn) ✅ | test unit ✅ (290/290 pass) | test e2e ✅ (12/12 pass) | knip: nợ kỹ thuật oxc-parser | graphify ✅ (863 nodes, 1991 edges)
- File chính bị ảnh hưởng:
  - `src/lib/epub-packer/parser/txt-parser.ts`
  - `src/lib/epub-packer/parser/txt-syntax-validator.ts`
  - `src/lib/epub-packer/xml-builders/chapter-builder.ts`
  - `src/lib/epub-packer/xml-builders/nav-builder.ts`
  - `tests/epub-parser.test.ts`
  - `tests/epub-packer.test.ts`
  - `README.md`

### 2026-10-16 (NHOM 1 Review Bug Fixes)

- Thêm/sửa: Sửa 5 lỗi tiềm ẩn và lệch pha validator/parser từ `review.md`:
  - 1. Parser nhận diện hoa/thường case-insensitive cho mọi thẻ khối (`[NEW]`, `[LETTER-BOX]`, `[POEM]`, v.v.).
  - 2. Chặn lỗi cú pháp `@@` nằm trong `[letter-box]` khi không có wrapper `[new]`.
  - 3. Khắc phục lỗi lồng đôi thẻ dropcap khi dùng thẻ `[c]` ngay dưới tiêu đề `<h1>`/`<h2>`.
  - 4. Cảnh báo cú pháp phân chương `@@` hoặc `[new]` bị đặt lạc sau khối `Chú thích:`.
  - 5. `parseTxtToChapters` gom đầy đủ danh sách lỗi cú pháp từ `validateTxtSyntax`.
  - Thêm test suites bao phủ toàn diện cho cả 5 trường hợp sửa lỗi.
- Kết quả pipeline: format ✅ | lint ✅ | type check (0 err, 0 warn) ✅ | test unit ✅ (282/282 pass) | test e2e ✅ (12/12 pass) | knip: nợ kỹ thuật oxc-parser | graphify ✅ (861 nodes, 1986 edges)
- File chính bị ảnh hưởng:
  - `src/lib/epub-packer/parser/txt-parser.ts`
  - `src/lib/epub-packer/parser/txt-syntax-validator.ts`
  - `src/lib/epub-packer/xml-builders/chapter-builder.ts`
  - `tests/epub-parser.test.ts`
  - `tests/epub-packer.test.ts`
  - `README.md`

### 2026-10-16 (Clean Up)

- Thêm/sửa: Dọn dẹp các file rác và artifacts tạm an toàn 100% (`coverage/`, `test-results/`, `.wrangler/`), cập nhật `.gitignore` bổ sung `/coverage` để ngăn file test coverage bị lọt vào repo.
- Kết quả pipeline: format ✅ | lint ✅ | type check (0 err, 0 warn) ✅ | test unit ✅ (276/276 pass) | knip: nợ kỹ thuật oxc-parser | graphify ✅ (859 nodes, 1985 edges)
- File chính bị ảnh hưởng:
  - `.gitignore`
  - `README.md`

### 2026-10-15 (letter-box wrapper)

- Thêm/sửa: Bổ sung cặp thẻ hộp viền `[letter-box]` ... `[/letter-box]` (`<div class="letter-box">`) khi đóng gói EPUB từ tệp TXT và chuyển đổi ngược EPUB sang TXT. Định nghĩa CSS viền 3px, padding và margin chuẩn. Bảo vệ khối hộp khỏi thuật toán gộp đoạn vỡ dòng `mergeBrokenParagraphs`. Cập nhật validator kiểm tra lỗi mở thẻ và quy tắc cấp bậc bọc thẻ (yêu cầu `[new]` bọc ngoài `[letter-box]`). Cập nhật hướng dẫn cú pháp trên UI Modal.
- Kết quả pipeline: format ✅ | lint ✅ | type check (0 err, 0 warn) ✅ | test unit ✅ (276/276 pass) | test e2e ✅ (12/12 pass) | graphify ✅ (859 nodes, 1979 edges)
- File chính bị ảnh hưởng:
  - `src/lib/epub-packer/templates/css-template/quotes.css`
  - `src/lib/epub-packer/parser/txt-parser.ts`
  - `src/lib/epub-packer/parser/txt-syntax-validator.ts`
  - `src/lib/epub-packer/xml-builders/chapter-builder.ts`
  - `src/lib/epub-to-txt/epub-to-txt.ts`
  - `src/lib/epub-packer/components/EpubSyntaxModal.svelte`
  - `tests/epub-parser.test.ts`
  - `tests/epub-to-txt.test.ts`
  - `README.md`

### 2026-10-15

- Thêm/sửa: Sửa lỗi kiểm thử E2E Playwright trên CI/CD (`epub-download-inspection.spec.ts` & `epub-workflow.spec.ts`), khớp chính xác thông báo kết quả đọc file `Đã xử lý file .TXT thành công`. Bổ sung tính năng kiểm định cú pháp thẻ mở/đóng cho tệp TXT đóng gói EPUB (`txt-syntax-validator.ts`), báo chính xác số dòng vi phạm và dừng tiến trình khi phát hiện lỗi thẻ chưa đóng. Mở rộng kiểm tra lỗi chú thích `{n}` thiếu ngoặc nhọn đóng và cảnh báo rút gọn rớt cặp định dạng inline (`*`, `/`, `_`), loại bỏ false flag cho các ký tự độc lập. Hỗ trợ khối chú thích footnote nhiều dòng (Multi-line Footnote Block) gom trọn vẹn vào thẻ `<aside>`. Tách riêng khu vực hiển thị cảnh báo trên UI.
- Kết quả pipeline: format ✅ | lint ✅ | type check (0 err, 0 warn) ✅ | test unit ✅ (272/272 pass) | test e2e ✅ (12/12 pass) | graphify ✅ (847 nodes, 1936 edges)
- File chính bị ảnh hưởng:
  - `src/lib/types/epub.type.ts`
  - `src/lib/epub-packer/parser/txt-syntax-validator.ts`
  - `src/lib/epub-packer/parser/txt-parser.ts`
  - `src/lib/epub-packer/parser/epub-source-parser.ts`
  - `src/lib/epub-packer/state/epub-source-state.svelte.ts`
  - `src/lib/epub-packer/components/EpubSourceSection.svelte`
  - `tests/epub-parser.test.ts`
  - `README.md`

### 2026-09-27

- Thêm/sửa: Nâng cấp Reverse Engine **EPUB to TXT** mở rộng hỗ trợ cho các tệp EPUB thông thường (nhận diện mọi `<h1>` &rarr; `@@`, `<h2>` &rarr; `@`, `<b>`/`<strong>` &rarr; `*bold*`, `<i>`/`<em>` &rarr; `/italic/`, tự động phát hiện mọi biến thể ngắt phân cảnh `***`, `* * *`, `• • •`, `---`, `*`, `hr` &rarr; `###`, `##`, `#`).
- Kết quả pipeline: format ✅ | lint ✅ | type check (0 err, 0 warn) ✅ | test ✅ (262/262 pass) | knip ✅ | graphify ✅
- File chính bị ảnh hưởng:
  - `src/lib/epub-to-txt/epub-to-txt.ts`
  - `tests/epub-to-txt.test.ts`
  - `README.md`

### 2026-09-27 (Trước đó)

- Thêm/sửa: Bảo vệ các khối `poem`, `letter`, `center-page`, `[new]`, `blockquote`, `aside` khỏi logic `mergeBrokenParagraphs` khi đóng gói TXT sang EPUB.
- Kết quả pipeline: format ✅ | lint ✅ | type check (0 err, 0 warn) ✅ | test ✅ (254/254 pass) | knip ✅
- File chính bị ảnh hưởng:
  - `src/lib/types/epub.type.ts`
  - `src/lib/epub-packer/parser/txt-parser.ts`
  - `src/lib/epub-packer/parser/epub-chapter-utils.ts`
  - `src/lib/epub-packer/xml-builders/chapter-builder.ts`
  - `tests/epub-packer.test.ts`
