# Spec: EPUB Editor (tính năng mới, độc lập)

## 0. Bối cảnh & nguyên tắc bắt buộc

Đây là một **tool hoàn toàn mới**, tách biệt khỏi các tool hiện có trong project (`epub-packer`, `markdown-fixer`, `pdf-splitter`). Mục đích: cho phép mở một file `.epub` bất kỳ (không nhất thiết do app này tạo ra) để xem và tinh chỉnh trực tiếp HTML/CSS bên trong, kiểu editor giống Calibre.

**Nguyên tắc bắt buộc khi code:**

- KHÔNG import bất cứ gì từ `lib/epub-packer/` vào code của tính năng này.
- Chỉ được dùng chung: `lib/utils/*` (Logger, download, xml...) và `lib/components/*` (Button, Input, DropZone...).
- Tự tạo type riêng, không tái sử dụng `EpubChapterItem` hay bất kỳ type nào của `epub-packer`.

## 1. Vị trí file trong project

```
lib/epub-editor/
  epub-editor.ts                  # core: đọc zip, phân loại file, export lại blob
  epub-editor-state.svelte.ts     # state của phiên chỉnh sửa
  components/
    EpubEditorModal.svelte        # modal full-screen, layout chính
    EpubEditorSidebar.svelte      # danh sách file bên trái
    EpubEditorCodePane.svelte     # code editor (CodeMirror 6)
    EpubEditorPreviewPane.svelte  # iframe preview bên phải
lib/types/epub-editor.type.ts     # type riêng cho tính năng này
routes/epub-editor/+page.svelte   # trang upload file .epub, nút mở modal
```

## 2. Luồng đọc file (không dùng TOC/spine)

1. Người dùng upload 1 file `.epub` ở `routes/epub-editor/+page.svelte`.
2. Unzip bằng JSZip. **Giữ nguyên instance zip trong state suốt phiên** — không parse lại từ đầu mỗi lần thao tác.
3. **Không đọc `content.opf`/`toc.ncx`/spine.** Không phải EPUB nào cũng có TOC đáng tin cậy, nên bỏ qua hoàn toàn bước này.
4. Liệt kê file **theo đúng thứ tự entry gốc trong zip** (JSZip giữ nguyên thứ tự này khi đọc — không tự ý sort lại theo alphabet hay bất cứ tiêu chí nào khác).
5. Phân loại từng file theo **đuôi mở rộng**:

| Nhóm       | Đuôi file                                                      | Click 1 lần          | Double-click                                                   |
| ---------- | -------------------------------------------------------------- | -------------------- | -------------------------------------------------------------- |
| **Pages**  | `.xhtml`, `.html`, `.htm`                                      | Mở vào editor (trái) | Mở vào editor (trái) **+** mở vào preview (phải)               |
| **Styles** | `.css`                                                         | Mở vào editor (trái) | Giống hệt click 1 lần (không có gì để "preview" riêng cho CSS) |
| **Images** | `.jpg`, `.jpeg`, `.png`, `.gif`, `.svg`, `.webp`               | Không phản ứng       | Không phản ứng — chỉ hiện tên trong sidebar                    |
| **Khác**   | `.opf`, `.ncx`, `.ttf`, `.otf`, `container.xml`, `mimetype`... | Không phản ứng       | Không phản ứng — hiện tên dạng mờ/disabled                     |

Có thể giữ cấu trúc thư mục con dạng cây (ví dụ `OEBPS/text/`, `OEBPS/styles/`) để dễ nhìn, nhưng thứ tự file trong mỗi thư mục vẫn phải đúng thứ tự gốc trong zip.

## 3. Model state — 2 trạng thái tách biệt

```
editorTarget: string | null   // path của file đang hiện trong khung code (trái)
previewTarget: string | null  // path của file đang render trong preview (phải)
                               // LUÔN LUÔN là 1 file .xhtml/.html, không bao giờ là .css
editBuffer: Map<path, string> // nội dung mới nhất của mỗi file đã từng được sửa,
                               // ưu tiên đọc từ đây thay vì đọc thẳng từ zip gốc
dirtyPaths: Set<path>         // các file đã bị sửa (khác nội dung gốc trong zip)
```

**Quy tắc cập nhật khi người dùng thao tác ở sidebar:**

- Click 1 lần (bất kỳ Page hoặc Style nào) → chỉ set `editorTarget`. `previewTarget` giữ nguyên.
- Double-click 1 Page → set cả `editorTarget` và `previewTarget` sang cùng file đó.
- Double-click 1 Style → xử lý y hệt click 1 lần (chỉ đổi `editorTarget`).
- Click/double-click Image hoặc file "Khác" → không làm gì.

Ví dụ đúng theo yêu cầu: double-click `file1.xhtml` → cả 2 khung cùng hiện `file1.xhtml`. Sau đó click 1 lần `style.css` → khung trái đổi sang `style.css` để sửa, khung phải **vẫn đứng yên ở `file1.xhtml`**.

## 4. Logic render preview (phần quan trọng nhất, dễ làm sai)

Preview không chỉ phụ thuộc vào nội dung của `previewTarget`, mà phải phản ứng real-time với **mọi CSS mà `previewTarget` đang tham chiếu tới**, kể cả khi người dùng đang sửa dở file CSS đó ở khung trái (chưa bấm lưu/export gì cả).

Các bước dựng `srcdoc` cho iframe mỗi lần cần re-render:

1. Lấy nội dung HTML của `previewTarget` — ưu tiên đọc từ `editBuffer` nếu path đó đã từng bị sửa, nếu chưa thì đọc từ zip gốc.
2. Quét các thẻ `<link rel="stylesheet" href="...">` trong HTML đó. Với mỗi CSS được link tới:
   - Resolve đường dẫn tương đối ra path tuyệt đối trong zip (dựa trên vị trí của file `previewTarget`).
   - Lấy nội dung CSS đó — cũng ưu tiên đọc từ `editBuffer` trước, nếu chưa có thì đọc từ zip gốc.
   - Nối tất cả CSS lại, bọc trong 1 thẻ `<style>`, chèn vào `<head>` của HTML (thay cho các thẻ `<link>` gốc, vì `srcdoc` không tự resolve được file khác trong zip).
3. Quét các thẻ `<img src="...">` trong HTML đó (xem mục 5 bên dưới để xử lý ảnh).
4. Gán chuỗi HTML đã ghép xong vào `srcdoc` của iframe.

**Trigger re-render preview khi:**

- `previewTarget` đổi (do double-click Page mới), HOẶC
- Nội dung trong `editBuffer` của `previewTarget` thay đổi, HOẶC
- Nội dung trong `editBuffer` của bất kỳ CSS nào mà `previewTarget` đang link tới thay đổi — **ngay cả khi CSS đó hiện không phải là `editorTarget`** (ví dụ: đang gõ CSS, xong chuyển `editorTarget` sang file khác, nhưng lần gõ CSS gần nhất vẫn phải phản ánh vào preview).

Debounce khoảng 300–500ms sau lần gõ cuối trước khi re-render, tránh giật khi gõ nhanh.

## 5. Xử lý ảnh trong preview

- Ảnh **không** hiển thị/mở được trong sidebar hay editor — chỉ hiện tên file.
- Ảnh **có** hiển thị đúng trong preview: với mỗi thẻ `<img src="...">` tìm thấy khi dựng `srcdoc` (mục 4, bước 3):
  - Resolve đường dẫn tương đối ra path tuyệt đối trong zip.
  - Lấy file nhị phân từ zip (`zip.file(path).async('blob')`), convert bằng `URL.createObjectURL(blob)`.
  - Thay giá trị `src` gốc bằng object URL này.
- **Bắt buộc dọn dẹp:** revoke toàn bộ object URL cũ (`URL.revokeObjectURL`) mỗi khi `previewTarget` đổi sang file khác hoặc khi đóng modal — tránh leak bộ nhớ khi người dùng lướt qua nhiều chương có nhiều ảnh.

## 6. Lưu / Export

- Khi người dùng gõ trong `EpubEditorCodePane` → chỉ cập nhật `editBuffer[currentPath]` và đánh dấu `dirtyPaths`. **Không đụng vào zip gốc.**
- Sidebar hiện dấu hiệu riêng (chấm màu / icon) cho các file trong `dirtyPaths`.
- Có nút "Export lại .epub" nằm ngoài modal (hoặc trong toolbar modal):
  - Ghi đè nội dung các file trong `dirtyPaths` vào zip instance (dùng `zip.file(path, newContent)`), dựa trên `editBuffer`.
  - Gọi `zip.generateAsync({ compression: 'DEFLATE', compressionOptions: { level: 9 } })` (tương tự cách `epub-packer` đang làm, tự viết riêng — không import từ đó).
  - Tải file mới bằng `triggerDownload()` có sẵn trong `lib/utils`.
- Trước khi export, validate các file `.xhtml/.html` trong `dirtyPaths`: parse thử bằng `DOMParser`, nếu có `parsererror` thì cảnh báo rõ ràng (tên file + lỗi) và chặn export cho tới khi sửa xong hoặc người dùng xác nhận bỏ qua.

## 7. Bảo mật (bắt buộc)

- File `.epub` do người dùng upload có thể chứa mã độc nếu không rõ nguồn gốc.
- `<iframe>` dùng cho preview **bắt buộc** phải có `sandbox=""` (tuyệt đối không thêm `allow-scripts`) — đảm bảo mọi `<script>` có sẵn trong nội dung XHTML gốc không thể thực thi được khi preview.

## 8. Phase đề xuất (giảm rủi ro khi triển khai)

- **Phase 1**: làm đúng toàn bộ spec trên nhưng giới hạn preview chỉ hoạt động khi `previewTarget` có tối đa 1-2 file CSS liên kết (trường hợp phổ biến nhất) — đủ dùng cho mục tiêu chính là "tinh chỉnh CSS sống ngay trên file".
- **Phase 2** (nếu cần sau): tối ưu thêm cho các EPUB có cấu trúc CSS phức tạp hơn (nhiều file CSS lồng nhau, `@import` trong CSS...), thêm autosave `editBuffer` vào IndexedDB để không mất khi lỡ refresh trang.

## 9. Test cần có (đi kèm khi code xong)

- Unit test (vitest) cho `epub-editor.ts`: phân loại file đúng theo đuôi, giữ đúng thứ tự gốc trong zip, resolve đường dẫn tương đối đúng (CSS link, ảnh), export ra zip hợp lệ.
- Test riêng cho case EPUB không có `content.opf`/`toc.ncx` hợp lệ hoặc thiếu — vì tool này chủ động không phụ thuộc vào các file đó, cần đảm bảo không bị lỗi khi chúng thiếu hoặc sai định dạng.
