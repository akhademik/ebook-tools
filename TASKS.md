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

| Lỗi                     | Vấn đề ban đầu                                                                                                         | Cách xử lý                                                                               | Trạng thái                          |
| :---------------------- | :--------------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------- | :---------------------------------- |
| **Khử trùng lặp chuỗi** | Thay theo tên file trần làm hỏng file có tên tương tự (`1.jpg` ăn vào `11.jpg`) và hỏng relative path giữa các folder. | Dùng `getRelativePath()` và regex so khớp chặt chẽ thuộc tính trong ngoặc/delimiters.    | ✅ **Đã sửa** (`cleaner-engine.ts`) |
| **`reorderOpfSpine`**   | Làm mất thuộc tính `linear="no"`, `properties`, v.v.                                                                   | Trích xuất và bảo lưu toàn bộ thẻ `<itemref>` gốc kèm thuộc tính khi tái cấu trúc spine. | ✅ **Đã sửa** (`epub-book-ops.ts`)  |
