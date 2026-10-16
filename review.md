# Kết quả rà soát và xử lý (Review & Resolutions - 2026-10-16)

### 1. Hiển thị lỗi gộp trên giao diện ✅ [ĐÃ HOÀN THÀNH]

- **Hiện trạng trước**: `parseTxtToChapters` nối các lỗi bằng `\n`, nhưng `<div>` hiển thị trong `EpubSourceSection.svelte` thiếu `whitespace-pre-line` làm dính chữ.
- **Xử lý**: Đã bổ sung class `whitespace-pre-line` vào `<div>` hiển thị lỗi `epubState.source.parseStatus` trong `EpubSourceSection.svelte`.

### 2. Quy tắc tiêu đề trong khối `[letter]` và `[poem]` ✅ [ĐÃ HOÀN THÀNH]

- **Yêu cầu & Xử lý**: Trong khối `[letter]` và `[poem]`, chỉ cho phép dùng `@@!` hoặc `@!` để lấy kiểu dáng tiêu đề (`h1.no-toc` / `h2.no-toc`), tuyệt đối không được dùng `@@` hoặc `@` phân chương/tạo mục lục.
- Cập nhật `txt-syntax-validator.ts`: Nếu đang ở trong `[letter]` hoặc `[poem]`, cho phép `@@!` và `@!`; bắt lỗi cú pháp rõ ràng nếu xuất hiện `@@` hoặc `@`.
- Cập nhật `txt-parser.ts`: Parse `@@!` và `@!` trong `currentBlock` thành `<h1 class="main-chap ... no-toc">` và `<h2 class="side-chap ... no-toc">`.

### 3. `@@!` nhận hoa văn chương ✅ [ĐÃ HOÀN THÀNH]

- **Hiện trạng trước**: `chapter-builder.ts` chỉ kiểm tra `break-main-chap` cho `h1` mà không kiểm tra `no-toc`, dẫn đến `@@!` vẫn nhận hoa văn `chapter-ornament`.
- **Xử lý**: Đã thêm điều kiện `classes.includes('no-toc')` cho thẻ `<h1>` trong `chapter-builder.ts`, đồng bộ với `<h2>`.

### 4. `@@!` đổi nghĩa so với phiên bản cũ ✅ [XÁC NHẬN CHỦ Ý]

- `@@!` được định nghĩa chính thức là tiêu đề lớn `h1` trên trang hiện tại, không ngắt chương và không tạo TOC (`no-toc`). Đã ghi chú đầy đủ trong tài liệu [README.md](README.md) và [AI_WORKFLOW.md](AI_WORKFLOW.md).

### 5. Cải tiến trang thiếu tiêu đề & cảnh báo `[new]` ✅ [ĐÃ HOÀN THÀNH]

- **Xử lý**:
  - Dùng cờ `hasCustomTitle: false` trên model thay vì so chuỗi literal `'Giới Thiệu'` trong `nav-builder.ts`.
  - Bổ sung cảnh báo trong `warnings` khi khối `[new]` hoặc `[new:center]` kết thúc mà không chứa bất kỳ tiêu đề nào.

### 6. Làm phẳng mục lục trang có hai `@` ✅ [XÁC NHẬN HỢP LÝ]

- Hai thẻ `@` trong cùng một trang `[new]` được đưa về ngang cấp trong TOC, tránh phân cấp cha-con bất tự nhiên.

### 7. Tối ưu bộ nhớ `pdf-splitter` (Zero-Copy Transfer) ✅ [ĐÃ HOÀN THÀNH]

- **Hiện trạng trước**: `pdfBytes: arrayBuffer.slice(0)` và `[arrayBuffer.slice(0)]` tạo ra 2 bản sao độc lập, làm worker ngốn gấp đôi RAM.
- **Xử lý**: Tạo một biến `const workerBuf = arrayBuffer.slice(0);`, truyền `pdfBytes: workerBuf` và chuyển giao chính xác `[workerBuf]` theo cơ chế Zero-Copy Transfer.

### 8. Vòng đời Web Worker & TypeScript Strict Mode ✅ [XÁC NHẬN TỐT]

- Xác nhận các worker dọn sạch listener, fallback try-catch đầy đủ, và `"strict": true` an toàn trên toàn bộ 303 bài kiểm thử (100% pass) và 12/12 Playwright E2E browser tests.
