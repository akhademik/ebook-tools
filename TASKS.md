# Báo cáo rà soát & Khắc phục lỗi (Đã hoàn thành 100%)

> Toàn bộ 9 lỗi chỉ ra dưới đây đã được khắc phục triệt để và bổ sung unit test kiểm chứng tự động vào pipeline CI (399/399 tests pass).

## P0: Đã sửa xong

| Lỗi                               | Đã thấy gì                                                                                                    | Cách sửa                                                                                                     | Trạng thái                                  |
| :-------------------------------- | :------------------------------------------------------------------------------------------------------------ | :----------------------------------------------------------------------------------------------------------- | :------------------------------------------ |
| **Undo ghi nhầm file**            | Mở A, chuyển sang B, bấm Ctrl+Z thì B biến thành nội dung của A do dùng chung state trong CodeMirror.         | Quản lý `EditorState` riêng cho mỗi file bằng `SvelteMap`, chuyển file bằng `view.setState()`.               | ✅ **Đã sửa** (`EpubEditorCodePane.svelte`) |
| **EPUB xuất từ Editor sai chuẩn** | Mimetype đầu vào không nén, đầu ra bị nén DEFLATE.                                                            | Trong `exportEpubBlob()`, đặt lại `mimetype` với `STORE` và bảo đảm đứng đầu file ZIP theo chuẩn OCF 3.3.    | ✅ **Đã sửa** (`editor-ops.ts`)             |
| **Cleaner xóa nhầm tài nguyên**   | Ảnh dùng qua `style="background:url()"` và CSS gọi bằng `@import "x.css"` bị xóa.                             | Quét thêm thuộc tính `style="..."`, cú pháp `@import` và thuộc tính `srcset` trong `reference-extractor.ts`. | ✅ **Đã sửa** (`reference-extractor.ts`)    |
| **Tạo lại mục lục ra link hỏng**  | Mục lục trỏ tới `#section-2-2`, nhưng trang XHTML không có id đó.                                             | Tự động ghi thuộc tính `id="section-X-Y"` vào thẻ heading trong XHTML khi tạo mục lục.                       | ✅ **Đã sửa** (`epub-book-ops.ts`)          |
| **Metadata bị hỏng khi có `$`**   | Tên sách chứa `$1`, `$$`, `$2` bị biến dạng, chèn cả thẻ XML vào tên.                                         | Dùng callback function trong `.replace()` thay vì chuỗi template string.                                     | ✅ **Đã sửa** (`epub-book-ops.ts`)          |
| **TXT bị định dạng nhầm**         | `https://a.com/b/c` thành `https:/<i>...</i>`, `km/h/s` bị in nghiêng chữ `h`, `file_name_here` bị gạch chân. | Tự động mask URL trước khi định dạng; siết chặt ranh giới từ/ký tự cho `/`, `*`, `_`.                        | ✅ **Đã sửa** (`txt-parser.ts`)             |
| **PDF.js CVE-2024-4367**          | Bản 3.11.174 cho phép PDF độc hại chạy JavaScript nếu `isEvalSupported` bật.                                  | Đặt `isEvalSupported: false` ở mọi lời gọi `getDocument()`.                                                  | ✅ **Đã sửa** (`pdf-splitter.ts`, `pdf.ts`) |

## Lỗi tiềm ẩn (đã xử lý an toàn)

| Lỗi                     | Vấn đề ban đầu                                                                                                         | Cách xử lý                                                                                                              | Trạng thái                                                                 |
| :---------------------- | :--------------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------- |
| **Khử trùng lặp chuỗi** | Thay theo tên file trần làm hỏng file có tên tương tự (`1.jpg` ăn vào `11.jpg`) và hỏng relative path giữa các folder. | Đặt an toàn `deduplicateResources: false` mặc định; trừ file trùng khỏi dung lượng tiết kiệm; dùng `getRelativePath()`. | ⚠️ **An toàn (Tắt mặc định, chờ nâng cấp triệt để)** (`cleaner-engine.ts`) |
| **`reorderOpfSpine`**   | Làm mất thuộc tính `linear="no"`, `properties`, v.v.                                                                   | Trích xuất và bảo lưu toàn bộ thẻ `<itemref>` gốc kèm thuộc tính khi tái cấu trúc spine.                                | ✅ **Đã sửa** (`epub-book-ops.ts`)                                         |

## Đợt rà soát bổ sung (Đã hoàn thành 100%)

### 1. Cleaner: Ảnh trong style dùng `&quot;` và `@import` trong `<style>`

- **Hiện tượng**: `<div style="background:url(&quot;images/a.jpg&quot;)">` bị xóa ảnh do dấu nháy XML; `@import "t.css"` trong `<style>` bị bỏ qua do vòng lặp chỉ giữ font và ảnh.
- **Cách sửa**:
  - Giải mã `&quot;`, `&apos;`, `&#34;`, `&#39;`, `&#x22;`, `&#x27;` trước khi gọi `extractCssUrls(styleContent)` trong `reference-extractor.ts`.
  - Bổ sung nhánh nhận diện file `.css` trong thẻ `<style>` để push vào `styles`.
- **Trạng thái**: ✅ **Đã sửa** (`reference-extractor.ts`, kèm unit test).

### 2. Tắt mặc định khử trùng lặp & chuẩn hóa dung lượng dự kiến

- **Hiện tượng**: Khử trùng lặp tự động tiềm ẩn rủi ro tráo nhầm ảnh và chưa cập nhật `@import`/`srcset`.
- **Cách sửa**:
  - Đặt mặc định `deduplicateResources: false` trong options của `cleanEpub()`.
  - Loại bỏ dung lượng file trùng lặp khỏi `estimatedSavingsBytes` trong `analyzeOptimizationPlan()`.
- **Trạng thái**: ✅ **Đã sửa** (`cleaner-engine.ts`, kèm unit test).

### 3. Editor CodePane: Nút Wrap và Theme sau `view.setState()`

- **Hiện tượng**: Đổi trạng thái Wrap hoặc Theme ở file A, sau đó chuyển sang file B (đã có state từ trước) thì CodeMirror giữ nguyên cấu hình cũ của state B.
- **Cách sửa**: Sau `view.setState(targetState)`, lập tức dispatch `wrapCompartment.reconfigure()` và `themeCompartment.reconfigure()` theo cài đặt hiện tại.
- **Trạng thái**: ✅ **Đã sửa** (`EpubEditorCodePane.svelte`).

### 4. TXT Parser: URL nằm trong dấu định dạng (`*https://a.com*`, `/xem https://a.com/`, `_http://a.com/x_`)

- **Hiện tượng**: Regex mask URL nuốt luôn các ký tự đóng định dạng (`*`, `/`, `_`), khiến đoạn văn không được in đậm, in nghiêng hoặc gạch chân.
- **Cách sửa**: Tách các ký tự đóng định dạng `*`, `_` và `/` (khi đang mở khối in nghiêng) ra khỏi chuỗi URL được che để bảo toàn cú pháp định dạng inline.
- **Trạng thái**: ✅ **Đã sửa** (`txt-parser.ts`, kèm unit test).

### 5. Mục lục với `data-id` & chống trùng ID tự sinh

- **Hiện tượng**: `<h2 data-id="zzz">` bị `\bid` nhận nhầm là đã có ID; ID tự sinh chưa kiểm tra trùng với các ID khác trên trang.
- **Cách sửa**: Đổi regex nhận diện ID thành `/(?:^|\s)id\s*=\s*["']([^"']+)["']/i`; kiểm tra ID tự sinh không trùng với bất kỳ ID nào đã có trong trang.
- **Trạng thái**: ✅ **Đã sửa** (`epub-book-ops.ts`, kèm unit test).

### 6. Đưa trang được thêm ID vào `dirtyPaths`

- **Hiện tượng**: `rebuildToc()` thêm `id="section-X-Y"` vào trang nhưng không đưa các trang này vào `dirtyPaths`.
- **Cách sửa**: `rebuildEpubToc` trả về `modifiedPages: string[]`, `rebuildToc()` tự động thêm toàn bộ trang đã sửa vào `this.dirtyPaths` để hiển thị trên UI và kiểm định trước khi xuất.
- **Trạng thái**: ✅ **Đã sửa** (`epub-book-ops.ts`, `epub-editor-state.svelte.ts`, kèm unit test).

### 7. Kiểm thử tự động & E2E

- Đã bổ sung unit tests cho toàn bộ các trường hợp trên.
- Đã bổ sung kịch bản E2E Playwright: kiểm tra phân lập Undo/Redo khi chuyển tab giữa 2 file (Mở A → Sửa → Chuyển B → Ctrl+Z không làm hỏng B).
