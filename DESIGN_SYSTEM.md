# DESIGN_SYSTEM.md — Hệ Thống Thiết Kế & Quy Chuẩn Giao Diện (Ebook Forge)

> Tài liệu quy chuẩn bắt buộc về giao diện, màu sắc, typography, components và layout cho dự án **Ebook Forge**.
> Đọc kỹ file này trước khi tạo mới hoặc sửa đổi bất kỳ thành phần UI nào.

---

## 1. Triết lý Thiết Kế & Chủ đề (Theme Philosophy)

Dự án áp dụng phong cách thiết kế **Solarized Glassmorphism**:

- **Không dùng màu trắng tinh (`#ffffff`)** trong Light Mode: sử dụng bảng màu ấm Cream / Sand (`#fdf6e3`, `#eee8d5`).
- **Không dùng màu đen tinh (`#000000`)** trong Dark Mode: sử dụng tông xanh đen Navy Teal / Deep Cyan (`#002b36`, `#073642`).
- Sử dụng hiệu ứng chuyển đổi mềm mại (`transition: background-color 0.25s ease, color 0.25s ease`), bo góc hiện đại (`rounded-xl`), viền tinh tế và bóng đổ chiều sâu.

---

## 2. Bảng Màu & CSS Tokens (`src/routes/layout.css`)

### 2.1 CSS Theme Variables

| Token                  | Light Theme (Solarized Light)    | Dark Theme (Solarized Dark)  | Ý nghĩa / Ứng dụng                                |
| :--------------------- | :------------------------------- | :--------------------------- | :------------------------------------------------ |
| `--color-brand-bg`     | `#fdf6e3` (base3 warm cream)     | `#002b36` (base03 deep navy) | Nền chính của toàn ứng dụng                       |
| `--color-sidebar-bg`   | `#eee8d5` (base2 soft porcelain) | `#073642` (base02 navy teal) | Nền Sidebar điều hướng                            |
| `--color-panel`        | `#eee8d5` (base2 panel)          | `#073642` (base02 panel)     | Nền thẻ (card), panel chức năng                   |
| `--color-panel-2`      | `#fdf6e3` (base3 inset)          | `#002129` (darker inset)     | Nền ô nhập liệu (input, dropzone)                 |
| `--color-accent-color` | `#268bd2` (Solarized Blue)       | `#2aa198` (Solarized Cyan)   | Màu hành động chính (primary action, link, focus) |
| `--color-accent-soft`  | `rgba(38, 139, 210, 0.1)`        | `rgba(42, 161, 152, 0.15)`   | Màu nền phụ, badge, hover nhẹ                     |
| `--color-accent-hover` | `#1d75b8`                        | `#35b6ab`                    | Trạng thái hover của nút bấm / icon               |
| `--color-amber-color`  | `#b58900` (Solarized Yellow)     | `#b58900` (Solarized Amber)  | Điểm nhấn nổi bật, highlight, warning             |
| `--color-text-color`   | `#073642` (base02 deep navy)     | `#93a1a1` (base1 light teal) | Màu chữ chính (body text, heading)                |
| `--color-text-mute`    | `#586e75` (base01 slate)         | `#657b83` (base0 muted)      | Màu chữ phụ, chú thích, placeholder               |
| `--color-border-color` | `#d3cbb7` (soft border)          | `#586e75` (base01 border)    | Đường viền thẻ card, panel, divider               |
| `--color-border-soft`  | `#b58900`                        | `#073642`                    | Đường viền input khi active/focus                 |

### 2.2 Tailwind CSS Utility Mapping

Trong Tailwind v4, các biến trên được tích hợp qua `@theme`:

- Background: `bg-brand-bg`, `bg-sidebar-bg`, `bg-panel`, `bg-panel-2`
- Text: `text-text-color`, `text-text-mute`, `text-accent-color`, `text-amber-color`
- Border: `border-border-color`, `border-border-soft`, `border-accent-color`
- Hover: `hover:bg-accent-hover`, `hover:border-accent-color`

---

## 3. Typography

- **Font Sans chính**: `'Inter', sans-serif` (`font-sans`) — dùng cho văn bản thông thường, nhãn, heading, mô tả.
- **Font Mono**: `'Space Mono', monospace` (`font-mono`) — dùng cho mã nguồn, thẻ tag, nút bấm kỹ thuật, thông số kỹ thuật, ký hiệu phím tắt.
- **Quy tắc cỡ chữ**:
  - Tiêu đề trang (Page Header): `text-2xl` hoặc `text-3xl font-bold`
  - Tiêu đề nhóm / Card: `text-lg font-semibold`
  - Nội dung thường: `text-base` (body mặc định `16px`, `line-height: 1.6`)
  - Chú thích / Nhãn phụ: `text-sm` hoặc `text-xs text-text-mute`

---

## 4. Quy chuẩn Thành phần Giao diện (Components)

### 4.1 Nút bấm (`Button.svelte`)

- **Vị trí**: `src/lib/components/Button.svelte`
- **Các biến thể (`variant`)**:
  - `primary`: `bg-accent-color text-white hover:bg-accent-hover shadow-lg shadow-accent-color/20`
  - `amber`: `bg-amber-color hover:bg-amber-600 text-brand-bg shadow-lg shadow-amber-color/10`
  - `danger`: `bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20`
- **Kiểu dáng**: Bo góc `rounded-xl`, font `font-mono text-base font-semibold`, hiệu ứng nhấn `active:scale-[0.98]`.

### 4.2 Khu vực Kéo thả Tệp (`DropZone.svelte`)

- **Vị trí**: `src/lib/components/DropZone.svelte`
- **Kiểu dáng**: Đường viền đứt nét `border border-dashed border-border-color rounded-xl p-6 sm:p-10 text-center`.
- **Trạng thái kéo tệp (Drag-Over)**: Đổi viền sang `border-accent-color bg-accent-soft/30`.

### 4.3 Thẻ Card Hiện Đại (`.modern-card`)

- Định nghĩa trong `layout.css`:
  - `background-color: var(--color-panel)`
  - `border: 1px solid var(--color-border-color)`
  - `box-shadow: var(--card-shadow)`
  - `rounded-xl`
  - Khi hover: viền đổi sang `--color-accent-color` kèm bóng đổ tỏa màu accent.

### 4.4 Hộp Thoại Modal & Popup

- Nền backdrop: mờ với `bg-black/50 backdrop-blur-xs` hoặc `backdrop-blur-sm`.
- Container modal: dùng `.modern-card` hoặc `bg-panel border border-border-color rounded-2xl shadow-2xl`.
- Header có tiêu đề rõ ràng kèm nút đóng (icon `X`) ở góc phải trên.

---

## 5. Quy tắc Bắt buộc Khi Viết UI

1. **Không dùng inline styles tùy tiện**: Không viết `style="color: #..."`. Dùng class Tailwind hoặc CSS variables.
2. **Không phá vỡ bảng màu Solarized**: Tuyệt đối không tự ý thêm các mã màu hex ngoài danh mục mà không có sự thống nhất.
3. **Responsive**: Đảm bảo giao diện hiển thị tốt trên cả màn hình di động (`sm:`, `md:`, `lg:`).
4. **Hỗ trợ đầy đủ Dark Mode**: Mọi thành phần đều phải kiểm tra hiển thị rõ ràng trên cả Light mode và `html.dark`.
