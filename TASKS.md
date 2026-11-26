Đây là chapter lớn
Đây là chapter nhỏ
Đây là chapter nhỏ tiếp nối

Đây là nội dung thử nghiệm để xem trước phông chữ hiển thị trong cuốn sách của bạn sau khi xuất bản. Tiêu đề lớn (h1), tiêu đề nhỏ ngay sau h1 (h2 chính), và tiêu đề nhỏ ở các vị trí khác (h2 sub) sẽ được hiển thị bằng phông chữ đã chọn, trong khi đoạn văn (p) sử dụng phông chữ Bookerly mặc định của sách.

To Be, or Not To Be, That's the question.
W. Shakespeare

---

> **Trạng thái (2026-11-26)**: ✅ **Đã hoàn thành toàn bộ**:
>
> 1. Cập nhật khung xem trước trang sách trong `EpubFontSettingsSection.svelte` sử dụng nội dung mẫu trên, bao gồm khối trích dẫn: Lời trích dẫn căn giữa (`text-align: center`) và tác giả căn phải (`text-align: right`).
> 2. Bổ sung 2 ô chọn font mới ở cột bên trái: Font trích dẫn (`quoteFont`) và Font tác giả trích dẫn (`quoteAuthorFont`).
> 3. Tích hợp trọn vẹn vào pipeline đóng gói EPUB (`packEpub`, `prepareFinalCss`, `resolveActiveFonts`), tự động sinh CSS và nhúng font file vào file EPUB ZIP.
> 4. Đảm bảo cơ chế khử trùng lặp (Deduplication) 100%: nếu H1, Quote, Author cùng chọn chung font thì `@font-face` chỉ được khai báo đúng 1 lần và file font nhị phân chỉ copy đúng 1 lần vào gói EPUB. Đã có unit test kiểm chứng pass 100%.
