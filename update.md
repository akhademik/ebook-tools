# Spec: Chuyển đổi file .TXT sang EPUB

## 1. Chế độ nhập liệu: TXT đơn file

Khi người dùng chọn chế độ **import file .TXT đơn**, hệ thống **tự động bỏ qua** các bước xử lý sau:

Bỏ đi cái thông báo ở div có nội dung: "Chế độ tệp .TXT đơn — Đã tự động bỏ qua các quy trình lọc OCR, Header/Footer và Heuristic ghép dòng."

## 2. Cú pháp mặc định (mã hóa cứng, không cho tùy chỉnh trong UI)

Bỏ hết các cấu hình cú pháp cũ. Thay bằng bộ quy tắc mặc định cố định sau. Cần hiển thị bảng quy tắc này trên UI (chỉ để xem, không chỉnh sửa) để người dùng biết trước cái gì sẽ được thay bằng cái gì.

| Cú pháp trong TXT | Kết quả HTML |
|---|---|
| `*nghiêng*` | `<em>nghieng</em>` |
| `##chap lớn#` | `<h1 class="chapter">chap lớn</h1>` |
| `#chap nhỏ#` | `<h2 class="chno">chap nhỏ</h2>` |
| `$đậm kéo về lề bên phải$` | `<p class="boldright">đậm kéo về lề bên phải</p>` |
| `[đậm]` | `<strong>đậm</strong>` |
| `•••` (ngắt cảnh) | `<p class="sbreak sbreak-big" role="separator">• • •</p>` |

> Lưu ý: bảng ví dụ trên minh họa cú pháp mở/đóng theo kiểu bọc quanh nội dung (wrap), ví dụ `*text*` → `<em>text</em>`, `##text#` → `<h1 class="chapter">text</h1>`, v.v.

## 3. Xử lý chú thích (Footnotes)

### 3.1. Nhận diện

- Trong file TXT có **một dòng duy nhất** chứa chữ `Chú thích:`. Tìm dòng này để làm mốc phân tách nội dung chính và phần chú thích.
- Tách toàn bộ nội dung **từ dòng `Chú thích:` trở về sau** ra thành một file riêng: `notes.xhtml`.
- Dòng `Chú thích:` được chuyển thành: `<h1 class="chapter">Chú thích:</h1>`

### 3.2. Hai dạng đánh dấu `{n}` trong file TXT

Mỗi số chú thích `{n}` (ví dụ `{1}`, `{2}`, ...) xuất hiện **2 lần** trong file:

- **Lần xuất hiện thứ 1**: nằm trong nội dung chính của sách, luôn đứng **trước** dòng `Chú thích:`.
- **Lần xuất hiện thứ 2**: nằm trong phần danh sách chú thích, luôn đứng **sau** dòng `Chú thích:`.

### 3.3. Quy tắc chuyển đổi

**Lần xuất hiện thứ 1** (trong nội dung chính) → chuyển thành liên kết tham chiếu chú thích, đặt ngay tại vị trí đó:

```html
<a class="noteref" epub:type="noteref" id="fnref{n}" href="notes.xhtml#fn{n}"><sup>{n}</sup></a>
```

Ví dụ với `{1}`:
```html
<a class="noteref" epub:type="noteref" id="fnref1" href="notes.xhtml#fn1"><sup>1</sup></a>
```

**Lần xuất hiện thứ 2** (trong phần `Chú thích:`) → chuyển thành khối `<aside>` bên trong `notes.xhtml`:

```html
<aside epub:type="footnote" id="fn{n}" class="note">
    <p><a class="notenum" href="{file_nguon}.xhtml#fnref{n}">{n}.</a> {nội dung chú thích}</p>
</aside>
```

Trong đó `{file_nguon}.xhtml` là **tên file xhtml chứa vị trí xuất hiện lần 1** của `{n}` (tức file chương chứa cái tham chiếu gốc). Do đó code cần lưu lại bảng ánh xạ: `số chú thích → tên file chương chứa lần xuất hiện thứ 1` để dùng khi build link ngược trong `notes.xhtml`.

Ví dụ với `{1}` xuất hiện lần 1 ở file `p1c1.xhtml`:
```html
<aside epub:type="footnote" id="fn1" class="note">
    <p><a class="notenum" href="p1c1.xhtml#fnref1">1.</a> ...nội dung chú thích 1...</p>
</aside>
```

Ví dụ với `{2}` xuất hiện lần 1 ở file `p1c1.xhtml`:
```html
<aside epub:type="footnote" id="fn2" class="note">
    <p><a class="notenum" href="p1c1.xhtml#fnref2">2.</a> ...nội dung chú thích 2...</p>
</aside>
```

## 4. UI: Nút "Thêm định nghĩa" (custom pattern) — chỉ hiển thị trong trang cấu hình chế độ import TXT

- Thêm nút **"Thêm định nghĩa"**.
- Khi click, hiện ra **1 cặp input** gồm:
  - **Input 1**: pattern (ký hiệu bao quanh), ví dụ `$$$`
  - **Input 2**: thẻ HTML thay thế, ví dụ `<span class="xya">`
- Ý nghĩa: code sẽ tìm cụm dạng `PATTERN + nội dung + PATTERN` (ví dụ `$$$nội dung$$$`) và chuyển thành `<span class="xya">nội dung</span>` (tự động đóng thẻ tương ứng).
- Mỗi lần click "Thêm định nghĩa" sẽ tạo thêm một cặp input mới (không thay thế cặp cũ).
- Mỗi cặp input có kèm nút **"Xóa"** để xóa riêng cặp đó.

## 5. CSS đi kèm

```css
/* --- chú thích --- */
.noteref {
  text-decoration: none;
  font-size: 0.8em;
  vertical-align: super;
  line-height: 0;
}
.notes .note {
  margin: 0 0 0.9em;
}
.notes .note p {
  text-indent: 0;
  font-size: 0.92em;
  text-align: left;
}
.notenum {
  text-decoration: none;
  font-weight: bold;
}
em {
  font-style: italic;
}
h1, h2 {
  font-weight: normal;
  text-align: center;
  page-break-after: avoid;
}
.chapter {
  font-size: 1.6em;
}
.chno {
  font-size: 1.35em;
}
p.boldright {
  text-indent: 0;
  text-align: right;
  font-weight: bold;
  margin: 0.8em 0 1.8em;
}
p.sbreak {
  text-indent: 0;
  text-align: center;
  margin: 1.6em 0;
  letter-spacing: 0.2em;
  opacity: 0.65;
  page-break-inside: avoid;
}
p.sbreak-big {
  margin: 2.8em 0;
  opacity: 0.8;
}
```