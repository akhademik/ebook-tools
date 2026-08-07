# ⚒️ Ebook Forge — Bàn Xử Lý Tài Liệu

> **Xưởng Sách Ebook**: Trung tâm chuẩn hóa và đóng gói sách điện tử hiệu năng cao, hoạt động 100% ngoại tuyến (offline) trên trình duyệt web của bạn.

---

## 📖 Giới thiệu

**Ebook Forge** là ứng dụng web đơn trang (SPA) hỗ trợ các quy trình chuẩn hóa và chế bản sách điện tử. Ứng dụng hoạt động hoàn toàn ở phía client (trình duyệt), đảm bảo tính an toàn dữ liệu tuyệt đối (Sandbox) mà không gửi tài liệu lên bất kỳ máy chủ bên ngoài nào.

---

## 🚀 Tính năng chính

### 1. 📄 Tách trang PDF → JPG (PDF Processor)
* Trích xuất các trang từ tệp PDF thành bộ ảnh JPG độc lập dạng nén `.zip`.
* Hỗ trợ chuyển đổi ảnh xám nâng cao tương phản tối ưu cho các công cụ OCR.
* Xem trước trực quan và thiết lập vùng cắt bỏ **Header / Footer** hàng loạt.

### 2. ✍️ Markdown Fixer
* Tự động phát hiện và chuẩn hóa chữ in nghiêng (`*text*`), đậm nghiêng (`***text***`) từ các gói ZIP file Markdown thô.
* Thay thế bằng cặp định dạng ngoặc vuông tùy biến mà vẫn bảo vệ các footnote (`*`) và ký tự toán học.

### 3. 📦 Đóng gói EPUB (EPUB Packer)
* Tự động đóng gói thư mục tệp Markdown thành định dạng sách điện tử `.epub` tiêu chuẩn.
* Nhận diện chương bằng từ khóa hoặc thuật toán **Heuristic thông minh** (dựa trên tiêu đề in hoa, độ dài, dấu câu).
* Tự động tạo mục lục (TOC), nhận diện vĩ thanh, lọc header/footer thừa và đóng gói XHTML chuẩn.

---

## 🛠️ Công nghệ sử dụng

* **Frontend Framework**: Vanilla JavaScript (ES Modules) + Vite
* **Styling**: Tailwind CSS v4
* **Xử lý Offline**: `pdf.js` (render PDF) & `jszip` (nén/giải nén ZIP)
* **Testing & QA**: Vitest (Unit Testing), ESLint (Linting), Knip (Dead Code Analysis)
* **Đồ thị Tri thức**: Graphify Knowledge Graph

---

## 📂 Cấu trúc dự án

```text
ebook-tools/
├── index.html              # Giao diện chính SPA & router panel
├── package.json            # Scripts & dependencies
├── vite.config.js          # Cấu hình Vite & Tailwind v4 plugin
├── knip.json               # Cấu hình kiểm tra code thừa (Knip)
├── graphify-out/           # Đồ thị tri thức kiến trúc dự án (Graphify)
├── public/                 # Favicon & assets tĩnh
└── src/
    ├── style.css           # Design system & Tailwind CSS imports
    ├── main.js             # Entry point & SPA router
    └── js/
        ├── helpers.js      # Utility functions (download, slugify, XML escape)
        ├── pdf-processor.js # Logic xử lý PDF -> JPG
        ├── md-fixer.js     # Logic xử lý Regex Markdown
        ├── epub-packer.js  # Logic nhận diện & đóng gói EPUB
        └── __tests__/
            └── helpers.test.js # Bộ Unit Test cho helpers
```

---

## 💻 Hướng dẫn Cài đặt & Chạy ứng dụng

### Yêu cầu hệ thống
* **Node.js**: `v18+`
* **npm**: `v9+`

### Cài đặt
```bash
# 1. Clone repository hoặc di chuyển vào thư mục dự án
cd ebook-tools

# 2. Cài đặt các thư viện phụ thuộc
npm install
```

### Chạy chế độ Phát triển (Development)
```bash
npm run dev
```
Ứng dụng sẽ chạy tại: `http://localhost:5173`

### Đóng gói Sản phẩm (Production Build)
```bash
npm run build
```
Kết quả đóng gói sẽ được tạo tại thư mục `dist/`. Bạn có thể xem trước sản phẩm build bằng:
```bash
npm run preview
```

---

## 🧪 Kiểm định Chất lượng & Sửa lỗi (Quality Assurance)

Dự án tích hợp sẵn bộ công cụ QA tự động:

```bash
# 1. Chạy bộ kiểm thử tự động Unit Test (Vitest)
npm test

# 2. Kiểm tra lỗi cú pháp & Code Style (ESLint)
npm run lint

# 3. Tự động sửa các lỗi Linting nhỏ
npm run lint:fix

# 4. Quét tìm mã nguồn / file / package thừa không sử dụng (Knip)
npx knip

# 5. Chạy toàn bộ quy trình kiểm định trong 1 dòng lệnh
npm test && npx knip && npm run lint && npm run build
```

---

## 🕸️ Đồ thị Tri thức Kiến trúc (Graphify)

Dự án này duy trì một đồ thị tri thức kiến trúc mã nguồn trong thư mục `graphify-out/`.

- Xem đồ thị trực quan: Mở file [`graphify-out/graph.html`](file:///home/ha/hajdev/ebook-tools/graphify-out/graph.html) trên trình duyệt.
- Đọc báo cáo kiến trúc: [`graphify-out/GRAPH_REPORT.md`](file:///home/ha/hajdev/ebook-tools/graphify-out/GRAPH_REPORT.md).
- Cập nhật đồ thị sau khi chỉnh sửa mã nguồn:
  ```bash
  graphify update .
  ```

---

## 🛡️ Bảo mật & Quyền riêng tư

* **100% Client-side**: Mọi thao tác xử lý tệp PDF, Markdown, nén ZIP và tạo tệp EPUB đều diễn ra trong bộ nhớ tạm của trình duyệt.
* KHÔNG có dữ liệu nào được tải lên server hoặc bên thứ ba.
