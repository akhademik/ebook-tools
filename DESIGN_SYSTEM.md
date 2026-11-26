# DESIGN_SYSTEM.md — Hệ Thống Thiết Kế & Quy Chuẩn Giao Diện (Ebook Forge)

> Tài liệu quy chuẩn bắt buộc về giao diện, màu sắc, typography, components và layout cho dự án **Ebook Forge**.
> Đọc kỹ file này trước khi tạo mới hoặc sửa đổi bất kỳ thành phần UI nào.

---

## 1. Triết lý Thiết Kế & Chủ đề (Theme Philosophy)

Dự án áp dụng phong cách thiết kế **Solarized Clean & Crisp**:

- **Không dùng màu trắng tinh (`#ffffff`)** trong Light Mode: sử dụng bảng màu ấm Cream / Sand (`#fdf6e3`, `#eee8d5`, `#f3ecd8`).
- **Không dùng màu đen tinh (`#000000`)** trong Dark Mode: sử dụng tông xanh đen Navy Teal / Deep Cyan (`#002b36`, `#073642`, `#00222b`).
- Sử dụng hiệu ứng chuyển đổi mềm mại (`transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease`), bo góc hiện đại (`rounded-xl`, `rounded-2xl`), viền tinh tế và tương phản đạt chuẩn WCAG AA (≥ 4.5:1 cho văn bản, ≥ 3:1 cho viền ô nhập).

---

## 2. Bảng Màu & CSS Tokens (`src/routes/layout.css`)

### 2.1 CSS Theme Variables

| Token                  | Light Theme (Solarized Light)  | Dark Theme (Solarized Dark)    | Ý nghĩa / Ứng dụng                                    |
| :--------------------- | :----------------------------- | :----------------------------- | :---------------------------------------------------- |
| `--color-brand-bg`     | `#fdf6e3` (warm cream)         | `#002b36` (deep navy)          | Nền chính của toàn ứng dụng                           |
| `--color-sidebar-bg`   | `#f3ecd8` (soft porcelain)     | `#00222b` (dark navy teal)     | Nền Sidebar điều hướng                                |
| `--color-panel`        | `#eee8d5` (panel sand)         | `#073642` (panel navy teal)    | Nền thẻ (card), panel chức năng                       |
| `--color-panel-2`      | `#fdf6e3` (cream inset)        | `#002129` (darker inset)       | Nền ô nhập liệu (input, dropzone)                     |
| `--color-text-color`   | `#073642` (deep teal text)     | `#eee8d5` (bright cream text)  | Màu chữ chính (body text, heading, tương phản cao)    |
| `--color-text-mute`    | `#4a6168` (slate mute)         | `#93a1a1` (light teal mute)    | Màu chữ phụ, chú thích, placeholder (≥ 4.5:1)         |
| `--color-accent-color` | `#1d6fa8` (accessible blue)    | `#35b6ab` (accessible cyan)    | Màu hành động chính (primary action, link, focus)     |
| `--color-accent-soft`  | `rgba(29, 111, 168, 0.1)`      | `rgba(53, 182, 171, 0.14)`     | Màu nền phụ, badge, item đang chọn                    |
| `--color-accent-hover` | `#165886`                      | `#2da399`                      | Trạng thái hover của nút bấm / icon                   |
| `--color-amber-color`  | `#b58900` (Solarized Yellow)   | `#b58900` (Solarized Amber)    | Điểm nhấn cảnh báo, highlight                         |
| `--color-border-color` | `#d9d1bb` (soft border)        | `#1b4653` (deep border)        | Đường viền nhẹ giữa các khối, thẻ card                |
| `--color-border-soft`  | `#b58900`                      | `#073642`                      | Đường viền input khi active/focus                     |
| `--color-field-border` | `#8a8168` (input border ≥ 3:1) | `#5b7f87` (input border ≥ 3:1) | Viền ô nhập, viền nút phụ (nhìn rõ ranh giới ô)       |
| `--color-on-accent`    | `#fdf6e3`                      | `#002b36`                      | Màu chữ trên nền nút accent (thay thế cho text-white) |
| `--color-ok`           | `#3f6a10`                      | `#7bb661`                      | Trạng thái thành công, hợp lệ                         |
| `--color-danger`       | `#b91c1c`                      | `#f87171`                      | Trạng thái lỗi, nguy hiểm, xóa (≥ 4.5:1)              |
| `--color-warn`         | `#b45309`                      | `#fbbf24`                      | Trạng thái cảnh báo, lưu ý (≥ 4.5:1)                  |

### 2.2 Tailwind CSS Utility Mapping

Trong Tailwind v4, các biến trên được tích hợp qua `@theme`:

- Background: `bg-brand-bg`, `bg-sidebar-bg`, `bg-panel`, `bg-panel-2`, `bg-accent-color`, `bg-accent-soft`, `bg-danger`, `bg-warn`, `bg-ok`
- Text: `text-text-color`, `text-text-mute`, `text-accent-color`, `text-amber-color`, `text-on-accent`, `text-ok`, `text-danger`, `text-warn`
- Border: `border-border-color`, `border-border-soft`, `border-field-border`, `border-accent-color`, `border-danger`, `border-warn`, `border-ok`
- Hover: `hover:bg-accent-hover`, `hover:border-accent-color`

---

## 3. Typography

- **Font Sans chính**: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif` (`font-sans`) — dùng cho **toàn bộ giao diện người dùng**:
  - Hỗ trợ tiếng Việt 100% trên mọi nền tảng hệ điều hành (kể cả khi offline không tải được Google Fonts CDN).
  - Tiêu đề trang: 28–30px (`text-2xl` hoặc `text-3xl`), font-bold (700)
  - Tiêu đề thẻ (card header): 20px (`text-xl`), font-semibold (600)
  - Nhãn nhập liệu (input label): 13px, font-semibold (600), không viết hoa toàn bộ (no uppercase)
  - Nhãn nhóm menu sidebar: 12px, font-semibold (600), uppercase
  - Nội dung thường (body): 15–16px (`text-[15px]` / `text-base`), line-height 1.55–1.6
  - Chú thích / Nhãn phụ / Placeholder: 13–15px, màu `text-text-mute`
  - Nút bấm: Inter 15px, font-semibold (600) cho primary, medium (500) cho nút phụ (không dùng font-mono)
- **Font Mono**: `'Space Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace` (`font-mono`) — **chỉ dùng cho giá trị kỹ thuật**:
  - Tên file, phần mở rộng file, phiên bản (version badge), chỉ số số học, tọa độ px, mã nguồn.

---

## 4. Quy chuẩn Thành phần Giao diện (Components)

### 4.1 Nút bấm (`Button.svelte`)

- **Vị trí**: `src/lib/components/Button.svelte`
- **Chiều cao & Bo góc**: Chiều cao chuẩn 44px (`h-11`), bo góc `rounded-xl`.
- **Typography**: Inter 15px, 600 (primary) / 500 (phụ).
- **Các biến thể (`variant`)**:
  - `primary`: `bg-accent-color text-on-accent hover:bg-accent-hover shadow-sm active:scale-[0.99]`
  - `secondary`: Nền trong suốt hoặc `panel-2`, viền `border border-field-border text-text-color hover:bg-panel`
  - `amber`: `bg-amber-color hover:bg-amber-600 text-brand-bg shadow-sm`
  - `danger`: `bg-red-500 hover:bg-red-600 text-white shadow-sm`
- **Trạng thái `disabled`**: Độ mờ 70%, `cursor-not-allowed`.

### 4.2 Ô nhập liệu (`Input.svelte`)

- **Vị trí**: `src/lib/components/Input.svelte`
- **Chiều cao & Bo góc**: Chiều cao 44px (`h-11`), `rounded-[10px]`.
- **Màu sắc**: Viền `border-field-border`, nền `bg-panel-2`, text `text-text-color`.
- **Nhãn**: Nằm phía trên ô nhập, Inter 13px, đậm 600 (`font-semibold`).
- **Placeholder**: Màu `text-text-mute`.

### 4.3 Khu vực Kéo thả file (`DropZone.svelte`)

- **Vị trí**: `src/lib/components/DropZone.svelte`
- **Kiểu dáng**: Đường viền đứt nét `border-2 border-dashed border-border-color rounded-2xl p-6 sm:p-10 text-center`.
- **Icon**: SVG stroke upload inline thay vì emoji.
- **Trạng thái kéo file (Drag-Over)**: Đổi viền sang `border-accent-color bg-accent-soft`.

### 4.4 Bộ chọn Phông chữ (`FontSelect.svelte`)

- **Vị trí**: `src/lib/components/FontSelect.svelte`
- **Kiểu dáng**: Chiều cao chuẩn 44px (`h-11`), hiển thị gọn gàng trên 1 dòng duy nhất gồm tên phông + dấu gạch nối + chữ xem trước (`[Tên font] - Text mẫu`) áp dụng trực tiếp typeface thực tế.
- **Hành vi**: Giữ nguyên toàn bộ logic hiện có (live preview, tìm kiếm, cuộn tự động đến mục đang chọn, thẻ select ẩn `sr-only`).

### 4.5 Thẻ Card Hiện Đại (`.modern-card`)

- Định nghĩa trong `layout.css`:
  - `background-color: var(--color-panel)`
  - `border: 1px solid var(--color-border-color)`
  - `border-radius: 1rem` (`rounded-2xl`)
  - `box-shadow: var(--card-shadow)`
  - Khi hover: chỉ đổi viền nhẹ sang `--color-accent-color` (loại bỏ hiệu ứng phát sáng quá mạnh).

### 4.6 Icon

- Tuyệt đối không dùng emoji làm icon trong giao diện chính.
- Sử dụng SVG stroke inline: `viewBox="0 0 24 24"`, `fill="none"`, `stroke="currentColor"`, `stroke-width="1.8"`, `stroke-linecap="round"`, `stroke-linejoin="round"`.
- Vùng bấm tối thiểu 40–44px. Nút chỉ có icon phải có `aria-label`. Icon trang trí có `aria-hidden="true"`.

---

## 5. Quy tắc Bắt buộc Khi Viết UI

1. **Không dùng inline styles tùy tiện**: Không viết `style="color: #..."`. Dùng class Tailwind hoặc CSS variables.
2. **Không phá vỡ bảng màu Solarized**: Tuyệt đối không tự ý thêm các mã màu hex ngoài danh mục mà không có sự thống nhất.
3. **Responsive**: Đảm bảo giao diện hiển thị tốt trên cả màn hình di động (390px), tablet (768px), desktop (1440px). Không cuộn ngang ngoài ý muốn.
4. **Hỗ trợ đầy đủ Dark Mode**: Mọi thành phần đều phải kiểm tra hiển thị rõ ràng trên cả Light mode và `html.dark`.
5. **Không sửa file `.ts` nghiệp vụ**: Mọi thay đổi UI chỉ nằm trong các file `.svelte`, `layout.css`, và tài liệu markdown liên quan.
