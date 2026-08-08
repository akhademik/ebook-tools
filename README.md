# ⚒️ Ebook Forge — Bàn Xử Lý Tài Liệu

> **Xưởng Sách Ebook**: Trung tâm chuẩn hóa và đóng gói sách điện tử hiệu năng cao, hoạt động 100% ngoại tuyến (offline) trên trình duyệt web của bạn, kết hợp với ứng dụng phụ trợ Desktop chuyên dụng.

---

## 📖 Giới thiệu

**Ebook Forge** là ứng dụng web đơn trang (SPA) được phát triển bằng **SvelteKit** hỗ trợ các quy trình chuẩn hóa và chế bản sách điện tử. Ứng dụng web hoạt động hoàn toàn ở phía client (trình duyệt), đảm bảo tính an toàn dữ liệu tuyệt đối (Sandbox) mà không gửi tài liệu lên bất kỳ máy chủ bên ngoài nào.

---

## 🚀 Các tính năng chính

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

### 4. 💻 Desktop App: TXT → PDF CJK
* Trang giới thiệu và tải xuống công cụ desktop chuyên dụng dành cho hệ điều hành Windows (chạy độc lập, không cần cài đặt).
* Chuyển đổi file `.txt` chữ Hán sang PDF sạch, giữ đúng font và ký tự.
* Tự động phát hiện và sửa lỗi các ký tự PUA (chữ hiếm bị mã hóa sai) sang chữ Hán chuẩn, xuất báo cáo PUA kèm ngữ cảnh.
* Nhúng sẵn font Noto Serif CJK + HanaMin dự phòng để bảo đảm hiển thị đầy đủ mọi chữ cổ/chữ hiếm trên các thiết bị đọc và phục vụ tốt đầu vào cho NotebookLM.

---

## 🛠️ Công nghệ sử dụng

* **Frontend Framework**: [SvelteKit](https://kit.svelte.dev/) (Svelte 5) + Vite
* **Styling**: Tailwind CSS v4 (Cấu hình theme trực tiếp qua CSS `@theme`)
* **Xử lý Offline**: `pdf.js` (render PDF) & `jszip` (nén/giải nén ZIP)
* **Testing & QA**: ESLint (Linting)
* **Đồ thị Tri thức**: Graphify Knowledge Graph

---

## 📂 Cấu trúc dự án

Dự án được tổ chức theo cấu trúc tự điều hành (Modular/Self-contained routing) của SvelteKit. Mỗi chức năng/trang sẽ nằm gọn trong một thư mục route riêng biệt, chứa cả giao diện Svelte và mã logic xử lý đặc thù của chức năng đó:

```text
ebook-tools/
├── package.json            # Các tập lệnh build & dependencies
├── vite.config.js          # Cấu hình Vite & Tailwind v4
├── jsconfig.json           # Cấu hình đường dẫn alias $lib
├── graphify-out/           # Đồ thị tri thức kiến trúc dự án (Graphify)
├── static/                 # Tài nguyên tĩnh (favicon, logo, v.v.)
└── src/
    ├── assets/             # Tài nguyên thô không build (txt-to-pdf.zip)
    │   └── txt-to-pdf.zip  # Ứng dụng Desktop TXT -> PDF CJK
    ├── app.html            # File HTML khung của ứng dụng
    ├── lib/                # Thư viện dùng chung của ứng dụng
    │   ├── helpers/
    │   │   └── helpers.js  # Các hàm helper dùng chung (download, slugify, XML escape)
    │   └── index.js        # File entry mặc định của SvelteKit lib
    └── routes/             # Định tuyến của SvelteKit (Mỗi chức năng nằm trong 1 folder)
        ├── +layout.svelte  # Bố cục giao diện chung (Sidebar, đổi giao diện Sáng/Tối)
        ├── layout.css      # Định nghĩa CSS toàn cục & biến theme màu sắc
        ├── +page.svelte    # Trang chủ tổng quan/bàn làm việc giới thiệu các công cụ
        ├── pdf/            # [Feature] PDF -> JPG (Giao diện + code xử lý)
        │   ├── +page.svelte
        │   └── pdf-utils.js
        ├── md/             # [Feature] Markdown Fixer (Giao diện + code xử lý)
        │   ├── +page.svelte
        │   └── md-utils.js
        ├── epub/           # [Feature] Đóng gói EPUB (Giao diện + code xử lý)
        │   ├── +page.svelte
        │   └── epub-utils.js
        └── txt-to-pdf/     # [Feature] Trang tải app Desktop TXT -> PDF CJK
            └── +page.svelte
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
Kết quả đóng gói sẽ được tạo tại thư mục `.svelte-kit/cloudflare`. Bạn có thể xem trước sản phẩm build bằng:
```bash
npm run preview
```

### ☁️ Triển khai lên Cloudflare Pages
Dự án đã sử dụng `@sveltejs/adapter-cloudflare` để tương thích hoàn toàn với nền tảng Cloudflare Pages & Workers:

1. **Triển khai tự động qua Git (Khuyên dùng)**:
   * Kết nối tài khoản GitHub của bạn với Cloudflare Dashboard.
   * Tạo một dự án Pages mới và chọn repository của dự án này.
   * Thiết lập Build Settings:
     * **Framework preset**: `SvelteKit`
     * **Build command**: `npm run build`
     * **Build output directory**: `.svelte-kit/cloudflare`
   * Cloudflare sẽ tự động đồng bộ và deploy sau mỗi lần push commit mới lên nhánh `main`.

2. **Triển khai thủ công bằng Wrangler CLI**:
   * Build dự án: `npm run build`
   * Sử dụng lệnh Wrangler để triển khai thư mục output:
     ```bash
     npx wrangler pages deploy .svelte-kit/cloudflare
     ```

---

## 🧪 Kiểm định Chất lượng & Sửa lỗi (Quality Assurance)

Dự án tích hợp sẵn bộ kiểm tra chất lượng code tự động:

```bash
# 1. Kiểm tra lỗi cú pháp & Code Style (ESLint)
npm run lint

# 2. Chạy toàn bộ quy trình kiểm định và build kiểm tra
npm run lint && npm run build
```

---

## 🕸️ Đồ thị Tri thức Kiến trúc (Graphify)

Dự án này duy trì một đồ thị tri thức kiến trúc mã nguồn trong thư mục `graphify-out/` giúp lập bản đồ các phụ thuộc và cấu trúc thư mục.

- Xem đồ thị trực quan: Mở file [`graphify-out/graph.html`](file:///home/hajtran/dev/ebook-tools/graphify-out/graph.html) trên trình duyệt.
- Đọc báo cáo kiến trúc: [`graphify-out/GRAPH_REPORT.md`](file:///home/hajtran/dev/ebook-tools/graphify-out/GRAPH_REPORT.md).
- Cập nhật đồ thị sau khi chỉnh sửa mã nguồn:
  ```bash
  graphify update .
  ```

---

## 🛡️ Bảo mật & Quyền riêng tư

* **100% Client-side**: Mọi thao tác xử lý tệp PDF, Markdown, nén ZIP và tạo tệp EPUB đều diễn ra trực tiếp trong bộ nhớ tạm của trình duyệt của bạn.
* KHÔNG có bất kỳ dữ liệu nào được tải lên máy chủ bên ngoài hoặc chia sẻ cho bên thứ ba.
