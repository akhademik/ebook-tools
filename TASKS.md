# Báo cáo rà soát & Khắc phục lỗi (Đã hoàn thành 100%)

> Toàn bộ các lỗi rà soát (kể cả ca lùi `/https://a.com/`) đã được khắc phục triệt để và bổ sung unit test kiểm chứng tự động vào pipeline CI (404/404 tests pass).

## Đã sửa xong (Các mục sót trước P1)

### 1. Dấu câu ngay sau URL được định dạng

- **Hiện tượng**: `*https://a.com*.`, `/xem https://a.com/.`, `/xem https://a.com/, rồi đi` không được định dạng do regex URL nuốt dấu câu `.` và `,`.
- **Cách sửa**: Bổ sung bóc tách các dấu câu `.,;:!?` trong vòng lặp `while` sang `trailing` trong `txt-parser.ts`.
- **Trạng thái**: ✅ **Đã sửa** (`txt-parser.ts`, kèm unit test).

### 2. Nhiều URL trên cùng một dòng

- **Hiện tượng**: `https://x.com/p /xem https://a.com/` không in nghiêng vì số lượng dấu `/` trong `prefix` tính cả URL trước đó.
- **Cách sửa**: Làm sạch các URL trước đó khỏi `prefix` trước khi kiểm tra trạng thái mở in nghiêng bằng `(?<![\p{L}\p{N}])\/[^\s/]`.
- **Trạng thái**: ✅ **Đã sửa** (`txt-parser.ts`, kèm unit test).

### 3. Ca lùi `/https://a.com/` đứng ngay sau dấu mở in nghiêng

- **Hiện tượng**: Khi URL đứng ngay sau dấu `/` mở in nghiêng, `cleanPrefix` bị cắt ngay trước `h`, không còn ký tự sau `/` khiến regex mở in nghiêng không khớp.
- **Cách sửa**: Bổ sung ký tự tiếp theo `(fullStr[offset] || 'x')` khi tính `openMatches` trong `txt-parser.ts`.
- **Trạng thái**: ✅ **Đã sửa** (`txt-parser.ts`, kèm unit test).

### 4. Khử trùng lặp (Deduplication)

- **Hiện trạng**: Đã tắt mặc định an toàn (`deduplicateResources: false`) và loại bỏ khỏi dung lượng tiết kiệm dự kiến. Sẽ nâng cấp logic triệt để (canonical path + manifest cleanup) ở giai đoạn chuyên biệt.
- **Trạng thái**: ⚠️ **An toàn (Tắt mặc định)** (`cleaner-engine.ts`).

---

## Bắt đầu P1: Đo trước, tối ưu sau

1. **Lập số liệu gốc**: Dùng 1 sách TXT lớn, 1 EPUB nhiều ảnh, 1 PDF scan thật. Đo trong trình duyệt: thời gian xử lý, độ trễ khi gõ, và RAM.
2. **Editor**: Kiểm tra độ trễ sao chép chuỗi `doc.toString()`, nạp lại preview và duy trì scroll position của preview.
3. **Bản build**: Gộp các bản WASM giống nhau (`ort-wasm-simd-threaded.jsep.wasm`) để tối ưu dung lượng phân phối.
4. **PDF và kiểm cú pháp TXT**: Tối ưu dựa trên dữ liệu profiling.
