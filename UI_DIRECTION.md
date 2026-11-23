# UI_DIRECTION.md — Hướng dẫn làm mới giao diện Ebook Maker

> Tài liệu giao việc cho AI. Đọc hết file này trước khi sửa bất cứ thứ gì.
> Mockup tham chiếu: "Hướng A" (Tổng quan + Đóng gói EPUB), có mượn ý tưởng thu gọn sidebar.

---

## 0. PHẠM VI — QUAN TRỌNG NHẤT

**Chỉ làm giao diện (markup, class Tailwind, CSS, bố cục, màu, chữ, icon). TUYỆT ĐỐI KHÔNG đụng vào chức năng.**

Không được:

- Sửa logic, state, parser, validator, packer, cleaner, worker, PDF, ML… Mọi file trong `src/lib/**` có đuôi `.ts` đều **không được sửa**.
- Đổi tên, đổi chữ ký, xóa hay thêm prop/hàm của các class state (`EpubState`, `EpubEditorState`, `PdfSplitterState`…).
- Đổi luồng xử lý, thứ tự gọi hàm, điều kiện hiển thị liên quan nghiệp vụ (ví dụ `epubState.source.epubChapters.length > 0`).
- Đổi route, thêm/bớt trang, thêm thư viện mới.
- "Tiện tay" refactor, dọn code, đổi tên biến, nâng cấp dependency.

Được phép:

- Sửa phần `<template>` và `<style>` của file `.svelte`, `layout.css`, `DESIGN_SYSTEM.md`.
- Thêm component thuần trình bày (không có logic nghiệp vụ) nếu thật cần, đặt trong `src/lib/components/`.
- Thêm state **chỉ phục vụ giao diện** (ví dụ: sidebar đang thu gọn, bước đang xem) ngay trong file `.svelte` liên quan.

Nếu một thay đổi giao diện buộc phải đụng tới logic: **dừng lại, ghi chú trong phần báo cáo và hỏi**, không tự làm.

---

## 1. Quy trình bắt buộc

1. Làm **từng giai đoạn** (mục 6), mỗi giai đoạn một commit nhỏ. Không gộp.
2. Trước khi đổi markup một component, chạy `grep` trong `tests/` và `tests-e2e/` xem selector nào đang bám vào nó (id, `aria-*`, text, `data-*`, class). **Giữ nguyên toàn bộ những thứ đó.** Ví dụ đã biết: `#h1-font-select`, `#h2-font-select`, `#h2-sub-font-select`, `#dropcap-font-select`, `#jacket-font-select`, `#epub-heuristic-mode`, `#epub-ignore-markdown-format`, thẻ `<select>` ẩn `sr-only` của `FontSelect`, các nút "Đóng gói file EPUB", "Tải file .EPUB".
3. Sau mỗi giai đoạn chạy đủ bộ kiểm tra trong `AI_WORKFLOW.md`: `pnpm format:check`, `pnpm check`, `pnpm lint`, `pnpm test`, `pnpm knip`, `pnpm build`, `pnpm test:e2e`. Tất cả phải xanh như trước khi bắt đầu. Nếu E2E đỏ vì selector bị đổi, **sửa giao diện cho khớp test, không sửa test** (trừ khi chữ hiển thị đổi có chủ đích, khi đó báo rõ).
4. Tuân thủ `DESIGN_SYSTEM.md`: dùng Tailwind + CSS variables, không inline style tùy tiện, không hex rời ngoài token, hỗ trợ cả Light và `html.dark`, responsive.
5. Cuối mỗi giai đoạn báo cáo: file đã sửa, ảnh chụp/mô tả trước–sau, kết quả các lệnh kiểm tra, điều chưa chắc.

---

## 2. Định hướng thiết kế

Giữ phong cách **Solarized** (kem/cát ở Light, xanh đen ở Dark) nhưng gọn, thoáng và dễ đọc hơn.

| Vấn đề hiện tại                                           | Hướng sửa                                                                                    |
| :-------------------------------------------------------- | :------------------------------------------------------------------------------------------- |
| Space Mono dùng cho tiêu đề, nhãn, nút → nặng, khó đọc    | **Inter cho toàn bộ UI.** Space Mono chỉ dùng cho giá trị kỹ thuật: tên file, phiên bản, số. |
| Nhãn `uppercase text-xs` mono, độ tương phản thấp         | Nhãn nhập liệu: Inter 13px, đậm 600, không uppercase. Chỉ nhãn nhóm menu mới uppercase 12px. |
| Emoji làm icon                                            | Thay bằng SVG stroke inline (viewBox 24, stroke 1.8, bo tròn đầu nét), màu `currentColor`.   |
| Packer là 7 thẻ dài, nút Đóng gói nằm tận cuối            | Chia **bước** + cột **tóm tắt** có nút Đóng gói luôn thấy (mục 4).                           |
| Trang Tổng quan 6 thẻ bằng nhau, nút "Mở công cụ" lặp lại | 2 thẻ lớn + sơ đồ quy trình + danh sách gọn (mục 5.1).                                       |
| Sidebar 270px chiếm chỗ khi đang làm việc                 | **Tự thu gọn thành thanh icon khi vào một công cụ** (mục 3).                                 |
| Chữ phụ Dark mode (`#657b83`) hơi mờ                      | Nâng tương phản theo token mới (mục 2.1).                                                    |

### 2.1 Token màu (cập nhật trong `src/routes/layout.css`, giữ nguyên **tên** biến cũ)

Chỉ đổi **giá trị**. Không đổi tên biến Tailwind trong `@theme`. Nếu cần biến mới, thêm mới và ghi vào `DESIGN_SYSTEM.md`.

| Token (giữ tên)        | Light mới              | Dark mới               | Ghi chú                                       |
| :--------------------- | :--------------------- | :--------------------- | :-------------------------------------------- |
| `--color-brand-bg`     | `#fdf6e3`              | `#002b36`              | không đổi                                     |
| `--color-sidebar-bg`   | `#f3ecd8`              | `#00222b`              | sidebar tối hơn nền một chút ở Dark           |
| `--color-panel`        | `#eee8d5`              | `#073642`              | không đổi                                     |
| `--color-panel-2`      | `#fdf6e3`              | `#002129`              | không đổi (ô nhập, vùng lõm)                  |
| `--color-text-color`   | `#073642`              | `#eee8d5`              | Dark sáng hơn để dễ đọc                       |
| `--color-text-mute`    | `#4a6168`              | `#93a1a1`              | đạt tương phản ≥ 4.5:1 trên nền và trên panel |
| `--color-accent-color` | `#1d6fa8`              | `#35b6ab`              | đủ tương phản cho chữ và nút                  |
| `--color-accent-soft`  | `rgba(29,111,168,.10)` | `rgba(53,182,171,.14)` | nền nút đang chọn, badge                      |
| `--color-border-color` | `#d9d1bb`              | `#1b4653`              | đường kẻ nhẹ giữa các khối                    |

Biến mới cần thêm:

- `--color-field-border`: viền ô nhập/nút phụ. Light `#8a8168`, Dark `#5b7f87` (đủ 3:1 để nhìn thấy ô).
- `--color-on-accent`: màu chữ trên nút accent. Light `#fdf6e3`, Dark `#002b36`. Nút `primary` dùng biến này thay cho `text-white`.
- `--color-ok`: trạng thái thành công. Light `#3f6a10`, Dark `#7bb661`.

### 2.2 Chữ

- Font UI: `Inter`. Body 15–16px, `line-height` 1.55–1.6.
- Tiêu đề trang: 28–30px, 700. Tiêu đề thẻ: 20px, 600. Nhãn: 13px, 600. Chú thích: 13–14px, màu `text-mute`.
- Nút: Inter 15px, 600 (primary) / 500 (phụ). Không dùng mono.

### 2.3 Thành phần dùng chung (sửa trong `src/lib/components/`, **giữ nguyên props**)

- **Button**: cao 44px (`h-11`), `rounded-xl`, primary dùng `bg-accent-color text-on-accent`. Thêm kiểu `secondary` (viền `field-border`, nền trong suốt) nếu hiện chưa có. Trạng thái `disabled`: mờ 70%, `cursor-not-allowed`.
- **Input**: cao 44px, `rounded-[10px]`, viền `field-border`, nền `panel-2`, nhãn phía trên 13px/600, placeholder dùng `text-mute`.
- **DropZone**: giữ viền đứt nét, thêm icon upload, chữ rõ hơn; trạng thái kéo-thả như cũ.
- **FontSelect**: giữ nguyên hành vi (live preview từng phông, tìm kiếm, cuộn tới mục đang chọn, `select` ẩn `sr-only`). Chỉ chỉnh kiểu: cao 52px, dòng nhỏ tên phông + dòng mẫu.
- **PageHeader**: tiêu đề 28–30px Inter 700, thêm dòng nhỏ breadcrumb phía trên (nhóm công cụ) nếu truyền được qua prop sẵn có; **không thêm prop bắt buộc**.
- **Thẻ (`.modern-card`)**: bo `rounded-2xl`, viền `border-color`, bỏ hiệu ứng hover phát sáng quá mạnh (chỉ đổi viền nhẹ).
- Mọi vùng bấm tối thiểu 40–44px. Nút chỉ có icon phải có `aria-label`. Icon trang trí có `aria-hidden="true"`.

---

## 3. Khung ứng dụng và hành vi thu gọn sidebar (`src/routes/+layout.svelte`)

Đây là thay đổi bố cục chính. Chỉ đụng phần giao diện, **không đổi** logic đổi theme hiện có (`toggleTheme`, `localStorage 'theme'`) và logic mobile drawer.

### 3.1 Hai trạng thái

| Trạng thái  | Chiều rộng | Nội dung                                                              |
| :---------- | :--------- | :-------------------------------------------------------------------- |
| **Mở rộng** | 232px      | Logo + tên, nhóm menu có nhãn, icon + chữ, nút giao diện, phiên bản   |
| **Thu gọn** | 72px       | Chỉ logo + icon 44×44, có `aria-label` và `title`, nút giao diện icon |

### 3.2 Quy tắc tự động

- Ở trang chủ `/`: mặc định **mở rộng**.
- Khi vào một công cụ (`/epub-packer`, `/epub-editor`, `/pdf`, `/md`, `/epub-to-txt`, `/txt-to-pdf`): mặc định **thu gọn** để nội dung có thêm chỗ.
- Có nút bật/tắt ở đầu sidebar (icon mũi tên, `aria-expanded`, `aria-label` "Thu gọn menu"/"Mở rộng menu"). Khi người dùng tự bấm, **lưu lựa chọn** vào `localStorage` (khóa mới, ví dụ `sidebar-collapsed`) và tôn trọng lựa chọn đó ở các lần sau, thay cho mặc định tự động.
- Chuyển trạng thái bằng `transition: width 200ms ease`; nội dung chữ ẩn bằng `opacity`/`hidden` sau khi thu, tránh giật chữ.
- Màn hình `< md`: **giữ nguyên** cơ chế drawer hiện tại (nút ☰ trên header mobile, backdrop). Không áp dụng thu gọn ở mobile.
- Phần `<main>` dùng `flex-1 min-w-0` để tự giãn theo sidebar.

### 3.3 Menu

Nhóm và thứ tự (giữ đúng các đường dẫn hiện có):

1. Tổng quan `/`
2. **Tạo và tinh chỉnh**: Đóng gói EPUB `/epub-packer`, EPUB Editor `/epub-editor`
3. **Tiền xử lý**: PDF → JPG `/pdf`, Markdown Fixer `/md`, EPUB → TXT `/epub-to-txt`
4. **Mở rộng**: TXT → PDF CJK `/txt-to-pdf`

Mục đang chọn: nền `accent-soft`, chữ `accent-color`, đậm 600, thêm `aria-current="page"`. Mục thường: chữ `text-mute`, hover đổi nền `panel`.

Icon gợi ý (SVG stroke, kiểu Lucide): layout-grid, package, pencil, image, type, file-text, monitor. Logo: icon sách mở trong ô vuông bo `accent-soft`.

---

## 4. Trang Đóng gói EPUB (`src/routes/epub-packer/+page.svelte`)

**Giữ nguyên toàn bộ 7 component section và state.** Chỉ đổi cách trình bày.

### 4.1 Chia bước

5 bước, dựa trên các section đang có:

| Bước | Tên            | Section hiện có                                                        |
| :--- | :------------- | :--------------------------------------------------------------------- |
| 1    | Nguồn          | `EpubSourceSection`                                                    |
| 2    | Thông tin      | `EpubMetadataSection` (kèm jacket)                                     |
| 3    | Bìa và hoa văn | `EpubCoverSection`, `EpubOrnamentsSection`, `EpubIllustrationsSection` |
| 4    | Phông chữ      | `EpubFontSettingsSection`                                              |
| 5    | Đóng gói       | `EpubPackSection`                                                      |

Quy tắc kỹ thuật bắt buộc:

- Thanh bước nằm trên cùng (danh sách `<ol>`, bước hiện tại có `aria-current="step"`), mỗi bước bấm được để nhảy tới.
- **Không được `{#if}`-unmount các section khi chuyển bước.** Ẩn bằng `class="hidden"` (hoặc `inert`) để mọi state cục bộ, listener, preview URL trong component vẫn còn nguyên. Chỉ hiển thị một bước tại một thời điểm.
- Giữ điều kiện hiện tại: chưa có chương (`epubChapters.length === 0`) thì chỉ thấy bước 1 như hiện nay; các bước sau chỉ mở khi điều kiện cũ thỏa.
- Nút "Quay lại" / "Tiếp: …" ở cuối mỗi bước chỉ đổi bước đang xem (state giao diện), không gọi hàm nghiệp vụ.
- Số "xong/tùy chọn" trên thanh bước chỉ lấy từ dữ liệu **đọc được** của state (ví dụ có `coverFile` hay chưa). Không thêm validation mới.

### 4.2 Cột tóm tắt (bên phải, rộng ~340–380px, xuống dưới ở màn hẹp)

Hiển thị: ô ảnh bìa (placeholder đứt nét "Chưa có bìa" nếu chưa có), tên sách, tác giả, số chương, các dòng Nguồn / Mục lục / Phông chữ / Tên file, và hai nút:

- **Đóng gói file EPUB** (primary, đầy chiều ngang) gọi đúng `epubState.processEpub()` như cũ.
- **Tải file .EPUB** (secondary, `disabled` khi chưa có `epubBlob`) gọi đúng `downloadEpub` như cũ.

Cột này chỉ **đọc** state để hiển thị; không ghi vào state. `EpubPackSection` (ô nhập tên file + trạng thái/lỗi) vẫn phải tồn tại và hoạt động ở bước 5. Nếu nút Đóng gói xuất hiện ở hai nơi thì cả hai gọi cùng một hàm.

### 4.3 Các section

- Form (Thông tin): dạng lưới 2 cột, tự xuống 1 cột ở màn hẹp; chọn mẫu jacket dạng thẻ nhỏ xem trước, nút "Xem trước" mở `EpubJacketModal` như cũ.
- Cover: giữ nguyên cách vẽ vùng cắt đỏ và các nút điều chỉnh lề (T/B/L/R ±20), chỉ chỉnh kiểu nút (cao 40px, mono cho số px).
- Source: nhóm các tùy chọn nâng cao (Heuristic, ngưỡng, lọc header/footer) vào khối gọn, vẫn dùng đúng các `bind:` và `oninput` cũ.
- Khung xem trước phông chữ vẫn là nền giấy (màu kem `#fbf8ef`, chữ tối), nay đặt cạnh các ô chọn phông ở bước 4.

---

## 5. Các trang còn lại

### 5.1 Tổng quan (`src/routes/+page.svelte`)

- Tiêu đề "Bàn làm việc" + dòng mô tả + huy hiệu "Tệp không rời khỏi máy bạn".
- **Bắt đầu với**: 2 thẻ lớn (Đóng gói EPUB, EPUB Editor và Validator), mỗi thẻ có icon, mô tả 1–2 dòng, vài chip tính năng, và dòng "Mở công cụ →" (bản thân thẻ là liên kết, bỏ nút lặp).
- **Quy trình gợi ý cho sách quét**: 5 ô nối bằng mũi tên: PDF → JPG, OCR (viền đứt, "thực hiện bên ngoài ứng dụng"), Markdown Fixer, Đóng gói EPUB, EPUB Editor. Ghi rõ đây chỉ là gợi ý.
- **Công cụ lẻ**: danh sách thẻ ngang gọn (icon, tên, 1 dòng mô tả, mũi tên): EPUB → TXT, PDF → JPG, Markdown Fixer, TXT → PDF CJK (nhãn "Desktop").
- Giữ nguyên các `href`.

### 5.2 EPUB Editor (`src/routes/epub-editor/+page.svelte` và `src/lib/epub-editor/components/*`)

- Trang ngoài: áp dụng thẻ, nút, DropZone mới. Hàng nút (Thông tin / Kiểm định / Dọn rác / Mở trình chỉnh sửa) dùng kiểu nút phụ chuẩn, bỏ emoji, thay icon SVG.
- Modal toàn màn hình: **chỉ đổi màu, bo góc, icon, chữ** theo token mới. Không đổi bố cục chia đôi, thanh kéo, sidebar tệp, đồng bộ cuộn, cơ chế xác nhận chưa lưu.

### 5.3 PDF → JPG, Markdown Fixer, EPUB → TXT, TXT → PDF CJK

Chỉ áp dụng token, tiêu đề trang, thẻ, nút, DropZone, Input mới. Không đổi bố cục xử lý, tiến độ, tải về.

---

## 6. Thứ tự thực hiện (mỗi dòng một commit)

1. **Token và chữ**: cập nhật `layout.css` (mục 2.1), nạp Inter, cập nhật `DESIGN_SYSTEM.md`. Kiểm tra mọi trang vẫn đọc được ở cả hai theme.
2. **Thành phần dùng chung**: `Button`, `Input`, `DropZone`, `PageHeader`, `FontSelect` (chỉ kiểu).
3. **Khung ứng dụng và sidebar thu gọn** (mục 3).
4. **Trang Tổng quan** (5.1).
5. **Trang Đóng gói EPUB**: thanh bước + cột tóm tắt (mục 4).
6. **Các trang còn lại** (mục 5.2, 5.3).
7. Rà soát cuối: responsive (390 / 768 / 1440px), Light + Dark, điều hướng bàn phím (Tab, Enter, Esc), kiểm tra toàn bộ lệnh ở mục 1.

---

## 7. Tiêu chí nghiệm thu

- [ ] Không file `.ts` nào trong `src/` bị sửa (chạy `git diff --stat` để xác nhận). Ngoại lệ phải được nêu rõ và được đồng ý.
- [ ] Mọi chức năng cũ hoạt động như trước: đóng gói, tải EPUB, jacket, đổi phông, cắt bìa, editor, validator, cleaner, tách PDF, Markdown Fixer, EPUB → TXT.
- [ ] `pnpm format:check`, `check`, `lint`, `test`, `knip`, `build`, `test:e2e` đều xanh.
- [ ] Sidebar tự thu gọn khi vào công cụ, có nút mở lại, nhớ lựa chọn của người dùng; mobile vẫn là drawer.
- [ ] Nút Đóng gói luôn nhìn thấy ở trang Đóng gói EPUB mà không cần cuộn xuống cuối.
- [ ] Không còn emoji làm icon trong giao diện; không còn mono cho tiêu đề/nhãn/nút.
- [ ] Chữ thường và chữ phụ đạt tương phản ≥ 4.5:1 ở cả Light và Dark; vùng bấm ≥ 40px.
- [ ] Hiển thị tốt ở 390px, 768px, 1440px; không cuộn ngang ngoài ý muốn.

---

## 8. Đoạn nhắc nên dán kèm khi giao việc cho AI

> Hãy đọc `UI_DIRECTION.md`, `DESIGN_SYSTEM.md` và `AI_WORKFLOW.md`. Đây là nhiệm vụ **chỉ về giao diện**: không sửa logic, state, parser, worker hay bất kỳ file `.ts` nào trong `src/`; không đổi id/aria/text mà test đang dùng. Làm theo từng giai đoạn ở mục 6, mỗi giai đoạn một commit, chạy đủ bộ kiểm tra rồi mới sang giai đoạn kế. Nếu thấy cần đụng vào chức năng để hoàn thành giao diện, hãy dừng lại và hỏi tôi trước.
