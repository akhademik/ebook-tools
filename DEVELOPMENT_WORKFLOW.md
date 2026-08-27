# 📋 QUY TRÌNH PHÁT TRIỂN & CHỈNH SỬA CODE (DEVELOPMENT WORKFLOW)

> **Tài liệu quy chuẩn bắt buộc** dành cho tất cả nhà phát triển (Developers) và AI Coding Agents khi tham gia chỉnh sửa, thêm tính năng hoặc tái cấu trúc mã nguồn dự án **Ebook Tools**.

---

## 🔒 1. Quy tắc Quản lý Gói (Package Manager Rule)

- **CHỈ ĐƯỢC DÙNG `pnpm`** (Tuyệt đối không dùng `npm` hoặc `yarn`).
- Luôn tuân thủ lockfile `pnpm-lock.yaml`.

```bash
# Cài đặt package mới
pnpm add <package-name>

# Cài đặt dev dependency
pnpm add -D <package-name>
```

---

## 🔄 2. Chu trình Chỉnh Sửa Code Chuẩn (Edit-Check-Lint-Format-Test-Graphify Flow)

Mỗi khi thực hiện bất kỳ thay đổi nào trong mã nguồn, bạn **PHẢI** thực hiện tuần tự theo quy trình sau:

```mermaid
flowchart TD
    A[1. Viết / Sửa mã nguồn] --> B[2. pnpm check]
    B -->|Lỗi| A
    B -->|Pass| C[3. pnpm lint]
    C -->|Lỗi| A
    C -->|Pass| D[4. pnpm format:check]
    D -->|Lỗi| E_FMT[Chạy pnpm format] --> D
    D -->|Pass| E[5. pnpm knip]
    E -->|Lỗi| A
    E -->|Pass| F[6. pnpm test]
    F -->|Lỗi| A
    F -->|Pass| G[7. pnpm test:e2e]
    G -->|Lỗi| A
    G -->|Pass| H[8. Chạy graphify]
    H --> I[9. Thông báo Hoàn thành cho User]
```

---

### Chi tiết các bước thực hiện:

### 🔹 Bước 1: Viết / Sửa code

- Thực hiện chỉnh sửa mã nguồn hoặc bổ sung tính năng mới.
- Tuân thủ kiến trúc mô-đun hóa và Svelte 5 Rune (`$state`, `$derived`, `$props`).

---

### 🔹 Bước 2: Kiểm tra kiểu dữ liệu (Type Check)

```bash
pnpm check
```

- **Mục tiêu**: Đảm bảo toàn bộ TypeScript và Svelte template đạt **0 errors, 0 warnings**.
- _Nếu có lỗi_: Sửa ngay lập tức trước khi chạy các bước tiếp theo.

---

### 🔹 Bước 3: Kiểm tra cú pháp & Linter (ESLint)

```bash
pnpm lint
```

- **Mục tiêu**: Đảm bảo tuân thủ tiêu chuẩn chất lượng mã nguồn của ESLint.

---

### 🔹 Bước 4: Chuẩn hóa Định dạng Mã nguồn (Prettier)

```bash
# Tự động format toàn bộ codebase theo chuẩn .prettierrc
pnpm format

# Kiểm tra định dạng (bước bắt buộc trong CI)
pnpm format:check
```

- **Mục tiêu**: Đảm bảo 100% tệp tin tuân thủ cấu hình [.prettierrc](file:///.prettierrc) (Tab, Single Quote, No Trailing Comma, PrintWidth 100).

---

### 🔹 Bước 5: Quét mã rác & exports thừa (Dead Code Analysis)

```bash
pnpm knip
```

- **Mục tiêu**: Phát hiện các file thừa, hàm không dùng hoặc dependencies chưa sử dụng.

---

### 🔹 Bước 6: Chạy Bộ Kiểm Thử Tự Động (Unit & Integration Tests)

```bash
pnpm test
```

- **Mục tiêu**: Chạy toàn bộ 228+ unit tests và kịch bản thực tế (pack TXT, pack ZIP markdown, rebuild TOC, optimize, crypto, epub-to-txt).
- **Yêu cầu**: **100% tests phải PASS**. Nếu có test fail, tìm nguyên nhân và sửa code/test ngay.

---

### 🔹 Bước 7: Chạy Kiểm thử Giao diện Trình duyệt Thật (Playwright E2E)

```bash
pnpm test:e2e
```

- **Mục tiêu**: Mở trình duyệt Chromium giả lập thao tác người dùng (kéo thả file, mở modal, click nút bấm, kiểm tra Live Preview).

---

### 🔹 Bước 8: Cập nhật Đồ thị Tri thức Dự án (Update Graphify)

Sau khi toàn bộ kiểm thử và kiểm tra chất lượng đã PASS:

- Chạy lệnh `graphify . --code-only && graphify cluster-only .` để cập nhật `graphify-out/GRAPH_REPORT.md` và `graph.json`, đảm bảo kiến trúc dự án luôn được đồng bộ.

---

### 🔹 Bước 9: Báo cáo kết quả cho Người Dùng (User Notification)

- Trình bày tóm tắt rõ ràng các file đã sửa/tạo mới.
- Báo cáo kết quả vượt qua của toàn bộ Quality Gates (`pnpm check`, `pnpm lint`, `pnpm format:check`, `pnpm test`, `pnpm test:e2e`).

---

## ⚡ Bảng tra cứu Lệnh Nhanh (Cheat Sheet)

| Lệnh                | Ý nghĩa                                       | Khi nào dùng                |
| :------------------ | :-------------------------------------------- | :-------------------------- |
| `pnpm dev`          | Khởi chạy máy chủ phát triển (localhost:5173) | Khi lập trình giao diện     |
| `pnpm check`        | Kiểm tra lỗi TypeScript & Svelte Rune         | Sau khi sửa code            |
| `pnpm lint`         | Kiểm tra lỗi ESLint                           | Trước khi commit            |
| `pnpm format`       | Tự động format toàn bộ codebase bằng Prettier | Trước khi commit            |
| `pnpm format:check` | Kiểm tra tính tuân thủ định dạng Prettier     | Trong CI / Quality Gate     |
| `pnpm knip`         | Quét file/export rác                          | Trước khi commit            |
| `pnpm test`         | Chạy 228+ Unit & Integration Tests            | Thường xuyên trong khi code |
| `pnpm test:watch`   | Chế độ tự động test lại khi lưu file          | Khi viết tính năng mới      |
| `pnpm test:e2e`     | Chạy trình duyệt Playwright E2E               | Trước khi release/deploy    |
| `pnpm build`        | Đóng gói bản Production                       | Trước khi deploy            |
