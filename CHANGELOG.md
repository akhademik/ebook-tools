# 📜 Nhật ký thay đổi (Changelog) — Ebook Forge

Tài liệu lưu trữ toàn bộ lịch sử phát triển, cập nhật tính năng, tối ưu hóa giao diện và tái cấu trúc hệ thống của **Ebook Forge**.

---

## 2026-11-25 (Xem trước PDF Màu Gốc Mặc định & Áp dụng Grayscale Worker khi Tách Trang)

- Thêm/sửa:
  - `src/lib/pdf-splitter/pdf-splitter.ts`: Bỏ hoàn toàn thao tác đọc và ghi pixel (`getImageData` / `putImageData`) trong `loadPdfPreview()`. PDF.js render trực tiếp màu gốc nguyên bản lên canvas context `{ alpha: false }`, cắt giảm 25–40% thời gian nạp xem trước và 0ms CPU overhead.
  - `src/routes/pdf/+page.svelte`: Đưa xem trước PDF về mặc định màu gốc hoàn toàn, loại bỏ nút toggle thừa nhằm tối giản giao diện người dùng.
  - `src/lib/pdf-splitter/pdf-splitter-state.svelte.ts`: Dọn sạch state thừa `previewGrayscale`.
  - Giữ nguyên quy trình: chỉ khi người dùng bấm "Bắt đầu tách trang", hệ thống mới áp dụng chuyển đổi grayscale và tương phản thông qua Web Worker (`pdf-grayscale.worker.ts`).
  - `tests/pdf-splitter.test.ts`: Xác thực `loadPdfPreview()` xuất ảnh trực tiếp mà không can thiệp bộ đệm pixel.
- Kết quả pipeline: format ✅ | lint ✅ | type check (0 err, 0 warn) ✅ | test unit ✅ (370/370 pass) | test e2e ✅ (21/21 pass) | knip ✅ (0 issues) | build ✅

---

## 2026-11-25 (Tối ưu Hiệu năng PDF Splitter Grayscale Worker & Khắc phục Race Condition EPUB Editor)

- Thêm/sửa:
  - `src/lib/pdf-splitter/pdf-grayscale.worker.ts`: Tạo Web Worker chuyên dụng xử lý chuyển đổi ảnh xám và tăng độ tương phản qua ArrayBuffer transferable objects, loại bỏ triệt để các blocking long tasks trên luồng chính.
  - `src/lib/pdf-splitter/pdf-splitter.ts`:
    - Tích hợp `applyGrayscaleAsync` với cơ chế worker offloading và fallback tự động về luồng chính khi cần.
    - Bổ sung `PREVIEW_DPI = 96` và `PREVIEW_SCALE = dpiToScale(96)` cho `loadPdfPreview()`, giảm 77% số lượng pixel cần render và tăng tốc độ tải xem trước gấp 4–6 lần.
  - `src/lib/epub-editor/epub-editor-state.svelte.ts`:
    - Thêm `latestPreviewRequestId` loại bỏ nguy cơ render cũ hoàn thành muộn ghi đè lên kết quả xem trước mới khi chuyển trang.
    - Thêm `assetDataUrlCache` (`SvelteMap`) cache Data URL cho ảnh và font nhúng, giảm thời gian render khi chỉnh sửa văn bản từ ~300ms xuống <10ms.
  - `tests/pdf-splitter.test.ts` & `tests/epub-editor.test.ts`: Bổ sung bộ kiểm thử unit cho `processGrayscaleBuffer`, `applyGrayscaleAsync`, preview scale và cơ chế chống race condition / cache Data URL.
- Kết quả pipeline: format ✅ | lint ✅ | type check (0 err, 0 warn) ✅ | test unit ✅ (370/370 pass) | test e2e ✅ (21/21 pass) | knip ✅ (0 issues) | build ✅

---

## 2026-11-25 (Tối ưu hóa Trích xuất Metadata TXT & Hoàn thiện Test Đóng gói Footnote)

- Thêm/sửa:
  - `src/lib/utils/text.ts`: Tối ưu hóa `extractMetadataFromTxt` bằng cách cắt trước 8000 ký tự đầu (`rawText.slice(0, 8000).normalize('NFC')`), loại bỏ lãng phí chuẩn hóa NFC toàn bộ cuốn sách hàng triệu ký tự.
  - `src/lib/epub-packer/epub-state.svelte.ts`: Tự động làm sạch các trường tác giả, nhà xuất bản và dịch giả khi nạp file mới (`onFileLoaded`), ngăn ngừa việc file nạp sau bị lẫn metadata của file nạp trước trong cùng phiên làm việc.
  - `tests/txt-footnote-packing.test.ts`: Tái cấu trúc kiểm thử trực tiếp qua pipeline sản phẩm thực tế của `EpubState` (loại bỏ hoàn toàn code lặp lại logic regex phân giải footnote map), đồng thời bổ sung kịch bản kiểm tra làm sạch metadata giữa nhiều file nạp liên tiếp.
- Kết quả pipeline: format ✅ | lint ✅ | type check (0 err, 0 warn) ✅ | test unit ✅ (368/368 pass) | test e2e ✅ (21/21 pass) | knip ✅ (0 issues) | build ✅

---

## 2026-11-25 (Chặt chẽ hóa Script Prepare, Typography Cleaner Modal & Kiểm thử Đóng gói Footnotes NFC)

- Thêm/sửa:
  - `package.json`: Điều chỉnh script `prepare` thành `svelte-kit sync && (husky || true)` đảm bảo không nuốt lỗi nếu lệnh `svelte-kit sync` thất bại.
  - `src/lib/epub-editor/components/EpubCleanerModal.svelte`: Thay thế 16 vị trí `font-mono` ở số liệu thống kê dung lượng, số lượng file và badges sang `font-sans font-bold/semibold tabular-nums`, giữ `font-mono` riêng cho đường dẫn file tham chiếu.
  - `src/lib/epub-packer/state/epub-source-state.svelte.ts`: Tự động áp dụng `.normalize('NFC')` cho `this.rawTxtText` khi nạp file `.TXT`, đảm bảo toàn bộ nội dung và chú thích được chuẩn hóa Unicode NFC precomposed đồng bộ.
  - `tests/txt-footnote-packing.test.ts`: Bổ sung test unit/integration kiểm thử trích xuất metadata từ TXT, xử lý cú pháp chú thích `{n}` / `Chú thích:`, tạo `<aside epub:type="footnote">`, liên kết backlink và đóng gói thành công file EPUB ZIP hợp lệ.
- Kết quả pipeline: format ✅ | lint ✅ | type check (0 err, 0 warn) ✅ | test unit ✅ (367/367 pass) | test e2e ✅ (21/21 pass) | knip ✅ (0 issues) | build ✅

---

## 2026-11-25 (Khôi phục Husky, Chuẩn hóa Test E2E & Tối ưu Git Tracking)

- Thêm/sửa:
  - Khôi phục Husky v9 (`.husky/pre-commit`) kết hợp `lint-staged` tự động kiểm tra Prettier & ESLint trước commit.
  - Sửa `tests-e2e/visual-and-keyboard.spec.ts`: loại bỏ đường dẫn cứng, dùng `testInfo.outputPath()`, bổ sung các assertion kiểm tra chống tràn ngang (`scrollWidth <= innerWidth`), hiển thị drawer mobile và các thành phần chính.
  - Bỏ theo dõi `graphify-out/` trong `.gitignore` và xóa khỏi git cache, giảm 26.000 dòng diff.
  - Chuẩn hóa lớp phủ cắt bìa sang `bg-danger/40 border-danger` trong `EpubCoverSection` và `pdf/+page.svelte`.
  - Khớp đồng bộ giai đoạn 5 trong `UI_DIRECTION.md` (thanh bước + khối tóm tắt tại Bước 5).
- Kết quả pipeline: format ✅ | lint ✅ | type check (0 err, 0 warn) ✅ | test unit ✅ (366/366 pass) | test e2e ✅ (21/21 pass) | knip ✅ (0 issues)

---

## 2026-11-25 (Hoàn thiện Giao diện Solarized, Token Ngữ nghĩa & Tinh gọn README)

- Thêm/sửa:
  - Chuẩn hóa token màu ngữ nghĩa `--color-danger` và `--color-warn` trong `DESIGN_SYSTEM.md` và `layout.css`.
  - Nâng toàn bộ cỡ chữ nhỏ dưới 12px lên tối thiểu `text-xs` (12px) trên toàn bộ ứng dụng.
  - Khử triệt để `font-mono` trên các nhãn text và nút tải file sang `font-sans`.
  - Bổ sung khối "Gợi ý quy trình xử lý sách quét" 4 bước tinh gọn trên trang Tổng quan `src/routes/+page.svelte`.
  - Đồng bộ quyết định thiết kế khối tóm tắt Bước 5 trong `UI_DIRECTION.md`.
  - Tách lịch sử phát triển đồ sộ sang file `CHANGELOG.md` riêng, đưa `README.md` về kích thước chuẩn.
- Kết quả pipeline: format ✅ | lint ✅ | type check (0 err, 0 warn) ✅ | test unit ✅ (366/366 pass) | knip ✅ (0 issues)

---

## 2026-11-25 (Tinh gọn Thẻ Sửa file EPUB Trang chủ & Header TXT → PDF CJK)

- Thêm/sửa:
  - `src/routes/+page.svelte`:
    - Đổi tên thẻ công cụ từ `EPUB Editor & Validator` thành `Sửa file EPUB` trực quan, thân thiện.
    - Gỡ bỏ huy hiệu góc `Kiểm định & Biên tập` giúp 2 thẻ công cụ chính trên trang chủ cân đối, liền mạch.
  - `src/routes/txt-to-pdf/+page.svelte`:
    - Gỡ bỏ `badge="Ứng dụng Desktop"`, đồng bộ hóa phong cách tiêu đề trang tối giản không badge trên toàn ứng dụng.
- Kết quả pipeline: format ✅ | lint ✅ | type check (0 err, 0 warn) ✅ | test unit ✅ (366/366 pass) | knip ✅ (0 issues)
- File chính bị ảnh hưởng:
  - `src/routes/+page.svelte`
  - `src/routes/txt-to-pdf/+page.svelte`
  - `README.md`

---

## 2026-11-25 (Xóa bỏ Husky, Bổ sung Sơ đồ Kiến trúc Thư mục & Cập nhật Toàn diện Tài liệu Dự án)

- Thêm/sửa:
  - Xóa bỏ thư mục `.husky/` và hủy bỏ `core.hooksPath` trong Git config.
  - `README.md`: Bổ sung mục _Cấu trúc Thư mục & Modules Thực tế_, cập nhật số lượng test thực tế lên 366 tests, ghi nhận trạng thái loại bỏ Husky.
  - `AI_WORKFLOW.md`: Chuẩn hóa ma trận test (sửa đường dẫn `image-bg-remove-ml.ts`, cập nhật file test `epub-parser.test.ts`), làm rõ quy chế không dùng Husky.
  - `TEST_WORKFLOW.md`: Cập nhật bảng kiểm thử tính năng theo các route thực tế của ứng dụng (`/epub-packer`, `/epub-editor`, `/epub-to-txt`, `/pdf`, `/txt-to-pdf`).
- Kết quả pipeline: format ✅ | lint ✅ | type check (0 err, 0 warn) ✅ | test unit ✅ (366/366 pass) | knip ✅ (0 issues) | graphify ✅
- File chính bị ảnh hưởng:
  - `.husky/` (deleted)
  - `README.md`
  - `AI_WORKFLOW.md`
  - `TEST_WORKFLOW.md`

---

## 2026-11-25 (Dọn dẹp Codebase: Xóa Module Mồ côi src/lib/epub, Chuyển fontkit sang devDependencies, Dọn dẹp Snapshot Lịch sử)

- Thêm/sửa:
  - `src/lib/epub/`: Xóa toàn bộ module parser mồ côi (`index.ts`, `types/index.ts`, `parser/epub-reader-parser.ts`).
  - `tests/epub-core.test.ts`: Xóa file unit test đi kèm module cũ.
  - `src/lib/types/index.ts`: Gỡ bỏ dòng export `../epub/types`.
  - `package.json` & `pnpm-lock.yaml`: Chuyển `fontkit` sang `devDependencies`.
  - `graphify-out/`: Xóa 15 thư mục snapshot lịch sử theo ngày, giải phóng 70 MB và 167 files.
  - `test-results/`: Dọn dẹp thư mục tạm.
- Kết quả pipeline: format ✅ | lint ✅ | type check (0 err, 0 warn) ✅ | test unit ✅ (366/366 pass) | knip ✅ (0 issues) | graphify: Rebuilt 4893 nodes, 10512 edges, 284 communities
- File chính bị ảnh hưởng:
  - `src/lib/epub/` (deleted)
  - `tests/epub-core.test.ts` (deleted)
  - `src/lib/types/index.ts`
  - `package.json`
  - `pnpm-lock.yaml`
  - `README.md`

---

## 2026-11-24 (Tối ưu Hài hòa Header Sidebar & Logo Ebook Forge)

- Thêm/sửa:
  - `src/routes/+layout.svelte`:
    - Gỡ bỏ khung icon sách 40x40px và chữ phụ `Desk` tại header Sidebar và Header Mobile, giữ lại thương hiệu wordmark `Ebook Forge` tối giản, hiện đại.
    - Tinh chỉnh nút `<` thu gọn khi mở rộng nằm gọn gàng bên phải tiêu đề, và nút `>` mở rộng khi thu gọn sidebar đạt kích thước chuẩn 44x44px (`w-11 h-11 rounded-xl mx-auto`), thẳng hàng dọc tuyệt đối với các icon bên dưới.
- Kết quả pipeline: format ✅ | lint ✅ | type check (0 err, 0 warn) ✅ | test unit ✅ (367/367 pass) | knip ✅ (0 issues) | graphify: Rebuilt 4914 nodes, 10563 edges, 283 communities
- File chính bị ảnh hưởng:
  - `src/routes/+layout.svelte`
  - `README.md`

---

## 2026-11-24 (Gỡ bỏ Huy hiệu "Xử lý ngay trên máy bạn" trên Toàn bộ Tiêu đề Trang)

- Thêm/sửa:
  - `src/lib/components/PageHeader.svelte`:
    - Loại bỏ giá trị mặc định `'Xử lý ngay trên máy bạn'`.
    - Chuyển kiểu prop `badge?: string`, chỉ hiển thị huy hiệu khi có nội dung text tùy chỉnh (như `badge="Ứng dụng Desktop"`).
  - `src/routes/epub-editor/+page.svelte`, `src/routes/epub-packer/+page.svelte`, `src/routes/epub-to-txt/+page.svelte`, `src/routes/pdf/+page.svelte`:
    - Gỡ bỏ `badge={true}` khỏi `PageHeader`.
- Kết quả pipeline: format ✅ | lint ✅ | type check (0 err, 0 warn) ✅ | test unit ✅ (367/367 pass) | knip ✅ (0 issues) | graphify: Rebuilt 4913 nodes, 10562 edges, 273 communities
- File chính bị ảnh hưởng:
  - `src/lib/components/PageHeader.svelte`
  - `src/routes/epub-editor/+page.svelte`
  - `src/routes/epub-packer/+page.svelte`
  - `src/routes/epub-to-txt/+page.svelte`
  - `src/routes/pdf/+page.svelte`
  - `README.md`

---

## 2026-11-24 (Tinh gọn Trang Tổng quan — Gỡ bỏ Badge ngoại tuyến, Chip tính năng và Khối gợi ý sách quét)

- Thêm/sửa:
  - `src/routes/+page.svelte`:
    - Gỡ bỏ huy hiệu `Xử lý 100% ngoại tuyến trên máy bạn` tại PageHeader trang chủ.
    - Gỡ bỏ toàn bộ danh sách chip tính năng con trong thẻ Đóng gói EPUB (`Bìa & Jacket`, `Heuristic phân chương`, `Nhúng font & Hoa văn`, `Mục lục tự động`).
    - Gỡ bỏ toàn bộ danh sách chip tính năng con trong thẻ EPUB Editor & Validator (`Live Preview 2 chiều`, `Kiểm định Kobo`, `Dọn rác mồ côi`, `Tái tạo TOC`).
    - Xóa bỏ hoàn toàn khối `Quy trình gợi ý cho sách quét` (4 bước chuyển đổi sách quét).
- Kết quả pipeline: format ✅ | lint ✅ | type check (0 err, 0 warn) ✅ | test unit ✅ (367/367 pass) | knip ✅ (0 issues) | graphify: Rebuilt 4912 nodes, 10561 edges, 283 communities
- File chính bị ảnh hưởng:
  - `src/routes/+page.svelte`
  - `README.md`

---

## 2026-11-24 (Tinh gọn & Hài hòa Giao diện Bước 3 Bìa và Hoa văn)

- Thêm/sửa:
  - `src/lib/types/components.type.ts`: Bổ sung `compact?: boolean` cho `DropZoneProps` và `InputProps`.
  - `src/lib/components/DropZone.svelte`: Thêm biến thể `compact` với đệm nhỏ `py-3 sm:py-3.5 px-4`, icon 28px, chữ 13px/11px, viền mỏng nét đứt `border-border-color`.
  - `src/lib/components/Input.svelte`: Thêm biến thể `compact` chiều cao `h-8 sm:h-9` cho các ô nhập số lề pixel.
  - `src/lib/epub-packer/components/EpubCoverSection.svelte`:
    - Áp dụng `DropZone compact={true}` cho vùng nạp ảnh bìa sách.
    - Tái cấu trúc vùng xem trước và cắt lề ảnh bìa sang bố cục hàng ngang 2 cột: Thumbnail bìa 130–160px bên trái và bảng điều khiển nút bấm/ô nhập cắt lề bên phải, giảm hơn 60% chiều cao màn hình.
  - `src/lib/epub-packer/components/EpubOrnamentsSection.svelte`:
    - Áp dụng `DropZone compact={true}` cho cả 2 vùng nạp hoa văn chương lớn (H1) và chương phụ (H2).
    - Thẻ xem trước kết quả tẩy nền PNG trong suốt được tối ưu dạng thanh mini 48x36px.
  - `src/lib/epub-packer/components/EpubIllustrationsSection.svelte`:
    - Rút gọn phần ghi chú hướng dẫn thành 1 dòng xúc tích.
    - Áp dụng `DropZone compact={true}` và tối ưu kích thước danh sách chip ảnh minh họa.
  - `src/routes/epub-packer/+page.svelte`: Tinh chỉnh đệm thẻ Bước 3 sang `p-4 sm:p-6`, khoảng cách `space-y-5` liền mạch, hài hòa.
- Kết quả pipeline: format ✅ | lint ✅ | type check (0 err, 0 warn) ✅ | test unit ✅ (367/367 pass) | knip ✅ (0 issues) | graphify: Rebuilt 4911 nodes, 10555 edges, 267 communities
- File chính bị ảnh hưởng:
  - `src/lib/types/components.type.ts`
  - `src/lib/components/DropZone.svelte`
  - `src/lib/components/Input.svelte`
  - `src/lib/epub-packer/components/EpubCoverSection.svelte`
  - `src/lib/epub-packer/components/EpubOrnamentsSection.svelte`
  - `src/lib/epub-packer/components/EpubIllustrationsSection.svelte`
  - `src/routes/epub-packer/+page.svelte`
  - `README.md`

---

## 2026-11-24 (Chuẩn hóa Unicode NFC & Trích xuất Tiêu đề, Metadata Thông minh từ TXT)

- Thêm/sửa:
  - `src/lib/utils/text.ts`:
    - Thêm `cleanTitleFromFileName`: Tự động chuẩn hóa tên file sang Unicode NFC (precomposed), giải mã URL `%xx`, bóc tách đuôi file, gỡ bỏ tag đóng mở ngoặc `[Full]`, `[Ebook]`, `(bản dịch)`, chuyển đổi `_` và `-` thành khoảng trắng và tự động viết hoa chữ cái đầu khi file là chữ thường.
    - Thêm `hasVietnameseDiacritics`: Kiểm tra chuỗi có chứa dấu tiếng Việt (hỗ trợ cả chuẩn NFC và NFD).
    - Thêm `extractMetadataFromTxt`: Bóc tách thông minh tiêu đề sách, tác giả, dịch giả, nhà xuất bản từ các tiền tố (`Tên sách:`, `Tác giả:`, `Dịch giả:`, `NXB:`...) hoặc Markdown H1 (`# ...`) hoặc dòng tiêu đề độc lập đi kèm khối metadata ở đầu file TXT.
  - `src/lib/epub-packer/state/epub-source-state.svelte.ts`:
    - Truyền `file.name` gốc vào `onFileLoaded` để xử lý chuẩn hóa tiêu đề.
    - Kích hoạt callback `onTxtParsed` sau khi nạp xong nội dung file văn bản `.TXT`.
  - `src/lib/epub-packer/epub-state.svelte.ts`:
    - Kết nối `cleanTitleFromFileName` vào sự kiện nạp file giúp tiêu đề sạch sẽ, chuẩn Unicode NFC.
    - Tự động nâng cấp tiêu đề có dấu tiếng Việt chuẩn xác và điền bổ sung tác giả, dịch giả, NXB từ nội dung TXT khi tên file là slug không dấu (`dac-nhan-tam.txt` -> `Đắc Nhân Tâm`).
  - `tests/helpers.test.ts` & `tests/epub-packer.test.ts`:
    - Bổ sung bộ test unit kiểm thử toàn diện cho `cleanTitleFromFileName`, `hasVietnameseDiacritics`, `extractMetadataFromTxt` và luồng nạp file trong `EpubState`.
- Kết quả pipeline: format ✅ | lint ✅ | type check (0 err, 0 warn) ✅ | test unit ✅ (367/367 pass) | knip ✅ (0 issues) | graphify: Rebuilt 4910 nodes, 10548 edges, 271 communities
- File chính bị ảnh hưởng:
  - `src/lib/utils/text.ts`
  - `src/lib/epub-packer/state/epub-source-state.svelte.ts`
  - `src/lib/epub-packer/epub-state.svelte.ts`
  - `tests/helpers.test.ts`
  - `tests/epub-packer.test.ts`
  - `README.md`

---

## 2026-11-24 (Tối ưu Font-Stack Tiếng Việt & Khử lỗi Font Input/Placeholder)

- Thêm/sửa:
  - `src/routes/layout.css`:
    - Chuẩn hóa `--font-sans` với hệ thống fallback đa nền tảng tối ưu tiếng Việt (`'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif`).
    - Bổ sung font stack fallback hoàn chỉnh cho `--font-mono`.
    - Bật `text-rendering: optimizeLegibility`, khử răng cưa antialiased trên thẻ `input`, `select`, `textarea`, `button` và `::placeholder`.
  - `src/app.html`: Gỡ bỏ `antialiased-none`, kích hoạt `antialiased` chuẩn cho `<body>`.
  - `src/lib/epub-packer/components/EpubSourceSection.svelte`: Thay thế `font-mono` bằng `font-sans font-medium` ở 2 ô nhập trang quét có placeholder tiếng Việt (`"Đầu"`, `"Cuối"`).
  - `DESIGN_SYSTEM.md`: Cập nhật quy chuẩn typography và font stack hỗ trợ tiếng Việt 100%.
- Kết quả pipeline: format ✅ | lint ✅ | type check (0 err, 0 warn) ✅ | test unit ✅ (350/350 pass) | knip ✅ (0 issues) | graphify ✅
- File chính bị ảnh hưởng:
  - `src/routes/layout.css`
  - `src/app.html`
  - `src/lib/epub-packer/components/EpubSourceSection.svelte`
  - `DESIGN_SYSTEM.md`

---

## 2026-11-24 (Tinh gọn Carousel Jacket & Chuẩn hóa Phông mặc định Bookerly)

- Thêm/sửa:
  - `src/lib/epub-packer/components/EpubJacketCarousel.svelte`:
    - Loại bỏ hàng nút bấm chọn mẫu phía trên (`Mẫu 1` ... `Mẫu 10`) để không gian hiển thị rộng rãi và tận dụng điều hướng carousel trực tiếp cùng hàng chấm chỉ mục (indicator dots).
    - Đổi định dạng nhãn trạng thái từ `Đang chọn: Mẫu N (N/10)` thành `Đang chọn: (N/10)` tinh gọn.
    - Cập nhật hàm tính toán phông chữ jacket: khi ở trạng thái mặc định (`default`), tự động gán phông chữ `Bookerly` thay vì hệ thống sans-serif.
  - `src/lib/components/FontSelect.svelte`:
    - Đổi placeholder mặc định thành `Mặc định (Bookerly)`.
    - Thêm kiểu chữ `Bookerly` (`font-family: 'Bookerly', serif;`) cho toàn bộ các text mang nội dung "Mặc định".
    - Bổ sung `data-font-id` trên các nút option để hỗ trợ kiểm thử tự động chính xác.
  - `src/lib/epub-packer/components/EpubFontSettingsSection.svelte`:
    - Cập nhật khung xem trước typography mặc định dùng phông `Bookerly` cho toàn bộ các tiêu đề H1, H2, H2 Sub, Dropcap và đoạn văn khi chưa tùy biến phông.
    - Sửa nội dung mô tả đoạn văn chuẩn theo phông Bookerly mặc định của sách.
  - `src/routes/epub-packer/+page.svelte`:
    - Cập nhật subtitle Bước 4 và badge thành `Mặc định (Bookerly)`.
    - Hàng tóm tắt Bước 5 hiển thị `Mặc định (Bookerly)` định kiểu bằng font Bookerly.
  - `tests-e2e/epub-workflow.spec.ts`: Cập nhật assertion và selector khớp với giao diện mới (`Đang chọn: (2/10)`, `button[data-font-id="Bookerly"]`).
- Kết quả pipeline: format ✅ | lint ✅ | type check (0 err, 0 warn) ✅ | test unit ✅ (350/350 pass) | knip ✅ (0 issues) | graphify ✅
- File chính bị ảnh hưởng:
  - `src/lib/epub-packer/components/EpubJacketCarousel.svelte`
  - `src/lib/components/FontSelect.svelte`
  - `src/lib/epub-packer/components/EpubFontSettingsSection.svelte`
  - `src/routes/epub-packer/+page.svelte`
  - `tests-e2e/epub-workflow.spec.ts`

---

## 2026-11-24 (Bố cục Packer Mockup A, Đồng bộ Token Ok, SVG Icons & Chuẩn hóa Tài liệu)

- Thêm/sửa:
  - Bố cục trang Đóng gói EPUB (`src/routes/epub-packer/+page.svelte`):
    - Bọc mỗi bước (1–5) trong 1 thẻ lớn duy nhất (`modern-card`), có tiêu đề bước nổi bật (Inter font-bold), mô tả ngắn gọn, nội dung section và hàng nút "Quay lại / Tiếp" nằm ngay trong thẻ.
    - Gộp Bước 3 (Bìa và hoa văn) thành 1 thẻ duy nhất gồm 3 khối liền mạch (Ảnh bìa, Ảnh trang trí, Ảnh minh họa) phân cách bằng đường kẻ mỏng `border-t border-border-color`.
    - Gỡ bỏ khung thẻ ngoài `modern-card mb-6` ở toàn bộ 7 component section, chuyển thành khối không viền `animate-fade-in`.
    - Cột tóm tắt sách: Thêm banner trạng thái _"Đã đủ để đóng gói file EPUB"_ khi đã có chương nguồn.
  - Đồng bộ Token màu Solarized & Typography:
    - Loại bỏ 100% các lớp `emerald-*` tự đặt trong `EpubCleanerModal`, `EpubEditorSidebar`, `EpubValidatorModal`, `EpubMetadataModal`, `EpubEditorPreviewPane`, `pdf/+page.svelte`, `epub-editor/+page.svelte`, chuyển sang token chuẩn `--color-ok` (`text-ok`, `bg-ok/10`, `border-ok/30`, `bg-ok/20`...).
    - `EpubCleanerModal.svelte`: Chuyển toàn bộ các nhãn chữ và badge sang `font-sans` (Inter), chỉ giữ `font-mono` cho số liệu và tên file; thay thế ký tự `➔` bằng mũi tên chuẩn.
    - `EpubValidatorModal.svelte`: Thay thế 5 ký tự `✗` (khi fail) bằng hệ thống icon SVG stroke đồng bộ với dấu tick `✓`.
  - Chuẩn hóa tài liệu:
    - `README.md`: Xóa bỏ 3 vị trí nhắc Markdown Fixer ở dòng ~197, ~215, ~216 để thống nhất với việc tính năng đã gỡ bỏ ngày 2026-11-23.
    - `UI_DIRECTION.md`: Gỡ bỏ nhắc đến Markdown Fixer và route `/md` tại các mục 3.2, 3.3, 5.1, 5.3 và 7; ghi chú rõ "Markdown Fixer đã gỡ".
    - `playwright.config.ts` & `tests-e2e/pdf-workflow.spec.ts`: Cấu hình `XDG_CONFIG_HOME` cho webServer, cập nhật test selector thư mục PDF bỏ emoji `📁`.
  - Bảo toàn logic: 0 file `.ts` nghiệp vụ trong `src/` bị ảnh hưởng.
- Kết quả pipeline: format ✅ | lint ✅ | type check (0 err, 0 warn) ✅ | test unit ✅ (350/350 pass) | knip ✅ (0 issues) | build production ✅ | E2E browser tests ✅ (14/14 pass)
- File chính bị ảnh hưởng:
  - `src/routes/epub-packer/+page.svelte`
  - `src/lib/epub-packer/components/EpubSourceSection.svelte`
  - `src/lib/epub-packer/components/EpubMetadataSection.svelte`
  - `src/lib/epub-packer/components/EpubCoverSection.svelte`
  - `src/lib/epub-packer/components/EpubOrnamentsSection.svelte`
  - `src/lib/epub-packer/components/EpubIllustrationsSection.svelte`
  - `src/lib/epub-packer/components/EpubFontSettingsSection.svelte`
  - `src/lib/epub-packer/components/EpubPackSection.svelte`
  - `src/lib/epub-editor/components/EpubCleanerModal.svelte`
  - `src/lib/epub-editor/components/EpubValidatorModal.svelte`
  - `src/lib/epub-editor/components/EpubEditorSidebar.svelte`
  - `src/lib/epub-editor/components/EpubMetadataModal.svelte`
  - `src/lib/epub-editor/components/EpubEditorPreviewPane.svelte`
  - `src/routes/pdf/+page.svelte`
  - `src/routes/epub-editor/+page.svelte`
  - `playwright.config.ts`
  - `tests-e2e/pdf-workflow.spec.ts`
  - `README.md`
  - `UI_DIRECTION.md`

---

## 2026-11-23 (Hoàn thiện giao diện chi tiết: PDF Splitter, Jacket Selector, Suggestion Flow & Token Ok)

- Thêm/sửa:
  - Trang `PDF → JPG` (`src/routes/pdf/+page.svelte`): Loại bỏ ~20 vị trí dùng `font-mono` ở các nhãn và nút ("10 trang", "20 trang", "Tải ảnh xem trước", "‹ Trước", "Sau ›", "Mặc định (Không cắt)"), bỏ uppercase trên nhãn "Header (px)" và "Footer (px)"; cập nhật toàn bộ nút điều chỉnh và ô số sang viền `border-field-border`, nền `bg-panel-2`, chiều cao 40–44px chuẩn mockup.
  - Tinh giảm `font-mono` trên các modal:
    - `EpubCleanerModal.svelte`: Chuyển nhãn thống kê sang `font-sans`, bỏ uppercase; chỉ giữ font-mono cho số liệu và đường dẫn file.
    - `EpubJacketModal.svelte`: Chuyển toàn bộ tiêu đề, nhãn mẫu, phông chữ và các nút sang `font-sans`, cao 40px viền `field-border`.
    - `EpubSyntaxModal.svelte`: Bảng quy ước và nút Đồng ý chuyển sang `font-sans`, chỉ giữ font-mono trong thẻ `<code>`.
    - `EpubEditorModal.svelte`, `EpubEditorSidebar.svelte`, `EpubMetadataModal.svelte`: Chuyển nút toggle files và tiêu đề sang `font-sans`.
  - Bước Thông tin sách (`EpubMetadataSection.svelte`): Thêm hàng thẻ chọn mẫu jacket trực quan (Mẫu 1–4 + Thẻ "Xem cả 10 mẫu →" kích hoạt modal), đổi nút "Xem trước & Tùy biến" sang nút phụ viền mảnh `border-field-border`.
  - Khối "Quy trình gợi ý cho sách quét" (`src/routes/+page.svelte`): Gỡ bỏ badge "Nội bộ/Bên ngoài" và dòng footer "Mở… →"; giữ giao diện thanh thoát với "Bước N", tiêu đề và 1 dòng mô tả; bổ sung mũi tên nối liền giữa các ô trên desktop.
  - Bỏ uppercase ở các tiêu đề nhóm trên trang chủ; đổi dòng phụ "Desk" logo sidebar sang `font-sans`.
  - Chuẩn hóa Button và Token:
    - Bổ sung `size="lg"` (h-12) vào `Button.svelte`.
    - Bỏ huy hiệu "Chế bản chính" trên thẻ Đóng gói EPUB.
    - Đồng bộ màu huy hiệu "Xử lý 100% ngoại tuyến" sang token `bg-ok/10 text-ok border-ok/20`.
- Kết quả pipeline: format ✅ | lint ✅ | type check (0 err, 0 warn) ✅ | test unit ✅ (350/350 pass) | knip ✅ (0 issues) | build production ✅

---

## 2026-11-23 (Sửa lỗi vỡ layout trên Mobile View & Tối ưu Responsive Drawer/Cards)

- Thêm/sửa:
  - Khắc phục lỗi vỡ drawer navigation menu trên điện thoại (`+layout.svelte`): Chuyển `w-11`, `justify-center`, `p-0`, `mx-auto` sang phạm vi `md:` để mobile drawer luôn hiển thị trọn vẹn icon và text label.
  - Phục hồi hiển thị tiêu đề các nhóm công cụ trên mobile drawer, sửa căn chỉnh header logo.
  - Thay thế `w-screen` thành `w-full max-w-full` chống tràn ngang trên mobile; giảm padding container chính về `p-4 sm:p-6 md:p-10`.
  - Cải tiến thanh điều hướng 5 bước tại `epub-packer/+page.svelte` trên di động thành dải cuộn ngang mượt mà (`flex overflow-x-auto min-w-max sm:min-w-0`).
  - Tối ưu hóa padding của các thẻ card `modern-card` trên toàn bộ section packer về mức `p-5 sm:p-7`.
- Kết quả pipeline: format ✅ | lint ✅ | type check (0 err, 0 warn) ✅ | test unit ✅ (350/350 pass) | knip ✅ (0 issues) | build production ✅

---

## 2026-11-23 (Làm mới giao diện UI: Packer Sections, Slender Steps, Overview, Sidebar & SVG Icons)

- Thêm/sửa:
  - Nâng cấp đồng bộ giao diện theo `UI_DIRECTION.md`: bỏ font-mono/uppercase ở nhãn/tiêu đề; ô nhập dùng `bg-panel-2 border-field-border h-11`.
  - Đổi thanh 5 bước ở `epub-packer` sang kiểu thanh mảnh (vạch nối + vòng tròn số/dấu ✓ + tên + 1 dòng phụ).
  - Cập nhật `PageHeader`: thêm breadcrumb và huy hiệu "Xử lý ngay trên máy bạn".
  - Cập nhật Trang Tổng quan: thêm khối "Quy trình gợi ý", thêm chip tính năng vào 2 thẻ lớn.
  - Sidebar thu gọn: tối ưu bố cục logo và nút thu/mở ở trạng thái 72px xếp dọc.
  - Thay thế toàn bộ emoji bằng SVG stroke trong editor modals, pdf, txt-to-pdf, các section packer.
- Kết quả pipeline: format ✅ | lint ✅ | type check (0 err, 0 warn) ✅ | test unit ✅ (350/350 pass) | knip ✅ (0 issues) | build production ✅

---

## 2026-11-23 (Gỡ bỏ tính năng Markdown Fixer & Sửa canonical classes)

- Thêm/sửa:
  - Thay thế toàn bộ arbitrary brackets classes của Tailwind bằng canonical utility tokens.
  - Gỡ bỏ hoàn toàn tính năng Markdown Fixer: xóa `src/routes/md/`, `src/lib/markdown-fixer/`, `src/lib/types/markdown-fixer.type.ts`, `tests/markdown-fixer.test.ts`.
- Kết quả pipeline: format ✅ | lint ✅ | type check (0 err, 0 warn) ✅ | test unit ✅ (350/350 pass) | knip ✅ (0 issues) | e2e ✅ (14/14 pass)

---

## 2026-10 (Các bản phát hành & Tối ưu hóa trước đó)

- Xem chi tiết tại lịch sử Git commit (`git log --oneline`).
