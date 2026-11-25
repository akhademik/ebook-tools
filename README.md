# ⚒️ Ebook Forge — Bộ Công Cụ Chế Bản Sách Điện Tử

> **Ebook Forge**: Bộ công cụ chuẩn hóa, đóng gói, biên tập và kiểm định sách điện tử hiệu năng cao, hoạt động **100% ngoại tuyến (offline)** trực tiếp trên trình duyệt web của bạn — file được xử lý cục bộ và không tải lên bất kỳ máy chủ nào.

---

## 🚀 Các công cụ chính

### 1. ✏️ Chỉnh sửa & Kiểm định EPUB Trực quan (EPUB Editor & Validator Suite)

Bộ công cụ biên tập, tối ưu và xem trước file `.epub` toàn diện ngay trên trình duyệt web:

- **Trình soạn thảo mã nguồn chuyên nghiệp**: Tích hợp CodeMirror 6 với syntax highlighting cho HTML, XHTML và CSS, hỗ trợ tự động căn lề, đóng mở thẻ thông minh và phím tắt chuẩn.
- **Xem trước thời gian thực (Live Preview)**: Khung xem trước song song hiển thị tức thì các thay đổi về bố cục, kiểu dáng CSS và hình ảnh.
- **Tự động giải mã Font nhúng (Font De-obfuscation)**: Tự động nhận diện và đảo ngược thuật toán mã hóa font theo chuẩn **IDPF** và **Adobe Mangling** (TTF, OTF, WOFF, WOFF2), hiển thị trung thực typography gốc của sách.
- **Đồng bộ hai chiều thông minh (Sync-View)**:
  - **Sync-Scroll**: Cuộn mã nguồn bên editor thì khung preview tự động cuộn theo vị trí tương ứng và ngược lại.
  - **Sync-Highlight**: Bôi đen một đoạn văn bản bên editor sẽ tự động tìm và làm nổi bật (amber highlight) trong preview; bôi đen bên preview sẽ đưa editor cuộn thẳng tới dòng mã nguồn liên quan.
- **Không gian làm việc linh hoạt**:
  - Thanh phân chia kéo thả (Resizable Split Pane) tùy biến tỷ lệ Editor / Preview.
  - Chế độ xem **100% Real View**
  - Thanh điều hướng cây file (File Tree Sidebar) có thể thu gọn tối đa để mở rộng không gian làm việc.
- **Dọn rác & Tối ưu dung lượng (EPUB Optimizer / Cleaner)**:
  - Tự động quét toàn bộ cây tài nguyên sách để lập kế hoạch tối ưu (**Optimization Plan**) chi tiết.
  - Phát hiện hình ảnh, font chữ, file CSS và trang XHTML mồ côi (không được tham chiếu trong OPF spine/manifest hoặc HTML).
  - Phát hiện tài nguyên trùng lặp nội dung dựa trên mã băm SHA-1 (Duplicate Detection).
  - Ước tính dung lượng tiết kiệm (Potential Savings) và dọn sạch an toàn chỉ với 1 cú click.
- **Kiểm định & Tương thích máy đọc sách (EPUB Validator)**:
  - Kiến trúc kiểm định DOM/XML nhiều tầng (**ValidationContext** + **ValidationRules**).
  - Kiểm tra chuẩn xác theo các hồ sơ: **Generic EPUB**, **EPUB 3.0** và tiêu chuẩn khắt khe của **Kobo e-Reader**.
  - Quét toàn diện: Cấu trúc ZIP & mimetype, `META-INF/container.xml`, OPF manifest/spine, tính hợp lệ của NCX/NAV TOC, cú pháp XHTML, ID trùng lặp, magic bytes của font chữ và hiển thị ảnh bìa sleep screen.
- **Quản lý Thông tin sách & Tái tạo Mục lục Tự động (Book Operations)**:
  - Chỉnh sửa trực tiếp Metadata sách (Tiêu đề, Tác giả, Ngôn ngữ, Nhà xuất bản, Identifier/ISBN, Ngày phát hành) trong `content.opf`.
  - 1-click tự động tái tạo đồng bộ mục lục thông qua mô hình trung gian **TocTree** thống nhất giữa `nav.xhtml` (EPUB 3) và `toc.ncx` (EPUB 2 / Kobo).
- **Kiểm tra cú pháp & Đóng gói an toàn**: Tự động kiểm tra lỗi cú pháp XML/XHTML trước khi lưu/xuất, cảnh báo khi đóng tab chưa lưu và đóng gói tải về file `.epub` hoàn chỉnh chuẩn kỹ thuật.

---

### 2. 📦 Đóng gói EPUB (EPUB Packer)

Tự động chuyển đổi văn bản thô `.txt` hoặc gói file Markdown `.zip` thành sách điện tử định dạng `.epub` tiêu chuẩn:

- **Hỗ trợ cú pháp quy ước nhanh cho file `.txt`**:
  - `@@ Tiêu đề` (`@@t`, `@@p`): Tiêu đề chính / tách chương thành file XHTML riêng, tự động đưa vào mục lục (TOC).
  - `@ Tiêu đề` (`@t`, `@p`): Tiêu đề phụ / chương nhỏ trong file, hiển thị trong mục lục.
  - `@! Tiêu đề` (`@!t`, `@!p`): Tiêu đề phụ, không đưa vào mục lục.
  - `[new] ... [/new]`: Gom toàn bộ nội dung bên trong thành 1 trang XHTML độc lập.
  - `[letter] ... [/letter]`, `[letter-box] ... [/letter-box]`, `[poem] ... [/poem]`: Khối định dạng thư từ, hộp viền bọc nội dung (không nối dòng, hỗ trợ lồng thẻ), bài thơ có căn lề và thụt đầu dòng riêng biệt.
  - `~ Lời thoại` / `> Tác giả`: Khối trích dẫn blockquote (hỗ trợ `~t`, `~p`, `~`) và tên tác giả footer (hỗ trợ căn lề độc lập `>t`, `>p`, `>c` hoặc tự động ăn theo căn lề trích dẫn `>`).
  - Dropcap chữ cái đầu chương `[c]`, tắt tự động dropcap đầu đoạn sau tiêu đề bằng `!D Nội dung`, ảnh minh họa theo thẻ `[hinh-1]`, ngắt phân cảnh lớn `###` (• • •), ngắt phân cảnh nhỏ `##` (*), ngắt phân cảnh trống `#`, in đậm `*đậm*`, in nghiêng `/nghiêng/`, gạch chân `_chân_`.
  - Chú thích chân trang tự động: `{n}` trong nội dung liên kết tự động tới khối `Chú thích:` / `{n} Nội dung chú thích` ở cuối sách dạng pop-up footnote EPUB 3 (`<aside epub:type="footnote">`).
- **Xử lý bìa & Tùy biến Jacket (Trang lót sách)**:
  - Hỗ trợ tải ảnh bìa trực tiếp hoặc trích xuất từ trang đầu tiên của file PDF bìa.
  - Tích hợp công cụ cắt chỉnh tỉ lệ bìa trực quan.
  - Hỗ trợ nhiều mẫu Jacket (trang lót) trình bày trang trọng thông tin tác phẩm, tác giả, dịch giả và nhà xuất bản.
- **Tự động hóa thông minh (Heuristic Chapter Detection)**:
  - Tự động nhận diện cấu trúc chương dựa trên thuật toán tính điểm heuristic (tiêu đề in hoa, độ dài chuỗi, số La Mã, từ khóa `Chương`/`Chapter`/`Hồi`/`Quyển`).
  - **Khuyến nghị**: Với các file text OCR chưa chuẩn hóa (dòng ngắt tự do, đoạn văn bản in hoa ngẫu nhiên), người dùng nên gán tiền tố tường minh `@@` ở đầu mỗi tên chương để đảm bảo việc phân chương và dựng cây mục lục TOC đạt độ chính xác 100%.

---

### 3. 🎨 Tẩy Nền Hoa Văn Tự Động bằng AI (ML Ornament Background Removal)

Công cụ xử lý hoa văn, họa tiết đầu chương và phân đoạn trang sách hoàn toàn tự động trên trình duyệt:

- **Tích hợp mô hình Machine Learning WebAssembly**: Sử dụng `@imgly/background-removal` chạy trực tiếp trong Web Worker của trình duyệt, phân tách chủ thể hoa văn và xóa nền chính xác mà không gửi dữ liệu ra máy chủ bên ngoài.
- **Tự động xén biên trong suốt (Auto-Crop Canvas)**: Thuật toán quét pixel biên tự động loại bỏ toàn bộ khoảng trống vô nghĩa xung quanh hoa văn sau khi tách nền.
- **Chuẩn hóa đồ họa sách điện tử**: Chuyển đổi sang thang độ xám (Grayscale), tăng độ tương phản chi tiết và nén định dạng ảnh tối ưu, sẵn sàng chèn tự động vào đầu chương và phân đoạn trang EPUB.

---

### 4. 📄 Tách trang PDF → JPG (PDF Processor)

- Trích xuất các trang từ file tài liệu PDF thành bộ ảnh JPG độc lập đóng gói dạng `.zip`.
- Chuyển đổi ảnh sang thang độ xám (Grayscale) và tăng độ tương phản, tối ưu hóa cho các phần mềm nhận dạng chữ OCR.
- Xem trước trực quan và thiết lập vùng cắt bỏ **Header / Footer** hàng loạt cho toàn bộ trang sách với xử lý song song đa luồng.

---

### 5. 💻 Desktop App: TXT → PDF CJK

- Ứng dụng desktop độc lập dành cho Windows chuyên xử lý văn bản chữ Hán / Nôm / CJK sang file PDF chất lượng cao.
- Tự động phát hiện và sửa lỗi các ký tự PUA (chữ hiếm bị mã hóa sai) sang ký tự chuẩn.
- Nhúng sẵn font chữ toàn diện (Noto Serif CJK + HanaMin) đảm bảo hiển thị đầy đủ mọi ký tự cổ/hiếm, tương thích tối đa với máy đọc sách và làm tài liệu đầu vào chuẩn cho NotebookLM.

---

## ⚡ Hướng dẫn Cài đặt & Sử dụng

### Yêu cầu hệ thống

- **Node.js**: Phiên bản 18 trở lên.
- **pnpm**: Phiên bản 9 trở lên (bắt buộc sử dụng `pnpm`).

### Khởi chạy ứng dụng

```bash
# 1. Cài đặt các gói phụ thuộc
pnpm install

# 2. Khởi chạy ở chế độ phát triển
pnpm dev
```

Truy cập ứng dụng tại địa chỉ: `http://localhost:5173`

### Đóng gói ứng dụng (Production Build)

```bash
pnpm build
```

---

## 📂 Cấu trúc Thư mục & Modules Thực tế (Project Architecture)

Dự án được tổ chức theo cấu trúc module hóa phân định trách nhiệm rõ ràng (Single Responsibility):

```
ebook-tools/
├── src/
│   ├── routes/                      # SvelteKit Pages & Routes
│   │   ├── +page.svelte             # Trang chủ / Tổng quan Dashboard
│   │   ├── +layout.svelte           # Khung layout ứng dụng (Sidebar, Theme, Header)
│   │   ├── epub-packer/             # Công cụ Đóng gói EPUB (TXT, MD Zip -> EPUB)
│   │   ├── epub-editor/             # Bộ Biên tập, Tối ưu hóa & Kiểm định EPUB
│   │   ├── epub-to-txt/             # Công cụ Trích xuất EPUB -> TXT
│   │   ├── pdf/                     # Công cụ Tách trang PDF -> JPG
│   │   ├── txt-to-pdf/              # Giới thiệu & Tải phần mềm Desktop CJK
│   │   └── epub/+page.ts            # Route chuyển hướng HTTP 308 sang /epub-packer
│   ├── lib/
│   │   ├── components/              # 5 UI components dùng chung (Button, DropZone, FontSelect, Input, PageHeader)
│   │   ├── epub-packer/             # Core logic đóng gói EPUB (parsers, builders, templates, state)
│   │   ├── epub-editor/             # Core logic biên tập EPUB (cleaner, editor, validator, components, state)
│   │   ├── epub-to-txt/             # Core logic trích xuất text từ file EPUB
│   │   ├── pdf-splitter/            # Logic tách trang tài liệu PDF
│   │   ├── utils/                   # Tiện ích chung & AI Worker tách nền hoa văn (image-bg-remove-ml)
│   │   ├── types/                   # Định nghĩa TypeScript tập trung (strict mode)
│   │   └── constants.ts             # Các ngưỡng giới hạn kích thước file
│   └── assets/
│       ├── fonts/                   # 40 phông chữ chuẩn hóa nhúng sách điện tử
│       └── fonts-metadata.json      # Metadata font được trích xuất tự động qua script prebuild
├── static/                          # Tài nguyên tĩnh
│   └── vendor/pdfjs/                # Thư viện PDF.js biên dịch sẵn phục vụ xử lý PDF phía client
├── tests/                           # 17 test suites (366 unit/integration tests qua Vitest)
├── tests-e2e/                       # Kịch bản kiểm thử trình duyệt thực tế qua Playwright
├── scripts/                         # Script tự động hóa lúc build (generate-fonts-meta.js)
├── .github/workflows/ci.yml         # GitHub Actions CI pipeline
├── AI_WORKFLOW.md                   # Quy trình làm việc & kiểm định bắt buộc
└── DESIGN_SYSTEM.md                 # Quy chuẩn thiết kế UI & Design Tokens
```

> **Ghi chú về Git Hooks**: Dự án **không sử dụng Husky**. Mọi quy chuẩn chất lượng mã nguồn được kiểm soát thông qua Pipeline kiểm định bắt buộc tại môi trường cục bộ ([AI_WORKFLOW.md](AI_WORKFLOW.md)) và GitHub Actions CI tự động ([ci.yml](.github/workflows/ci.yml)).

---

## 🧪 Quy chuẩn Kiểm thử & Chất lượng Mã nguồn (Quality Gates)

Dự án tuân thủ quy trình kiểm thử và chất lượng nghiêm ngặt theo [AI_WORKFLOW.md](AI_WORKFLOW.md):

```bash
# 1. Kiểm tra kiểu dữ liệu TypeScript & Svelte Rune (0 errors, 0 warnings)
pnpm check

# 2. Kiểm tra định dạng & cú pháp ESLint
pnpm lint

# 3. Quét mã rác, file thừa và dependencies không dùng
pnpm knip

# 4. Chạy toàn bộ Unit & Integration Tests (366 tests)
pnpm test

# 5. Chạy Kiểm thử Giao diện Trình duyệt Thật (Playwright E2E)
pnpm test:e2e
```

---

## 🛡️ Quyền riêng tư & Bảo mật

- **100% Client-Side**: Toàn bộ quá trình đọc, giải nén, bóc tách AI, chỉnh sửa và đóng gói file PDF, EPUB, TXT diễn ra hoàn toàn trong bộ nhớ trình duyệt máy tính của bạn.
- **An toàn dữ liệu**: file được xử lý trực tiếp trên thiết bị của bạn và tuyệt đối không tải lên bất kỳ máy chủ bên ngoài nào.

---

## Trạng thái hệ thống

- Cập nhật lần cuối: 2026-11-25 08:55
- Đã hoàn thành:
  - **Tinh gọn UI Thẻ Trang chủ & Tiêu đề TXT → PDF CJK**:
    - `src/routes/+page.svelte`: Đổi tên thẻ công cụ từ `EPUB Editor & Validator` thành `Sửa file EPUB` trực quan, thân thiện; gỡ bỏ huy hiệu góc `Kiểm định & Biên tập`, tạo sự cân đối, đối xứng hoàn hảo với thẻ Đóng gói EPUB.
    - `src/routes/txt-to-pdf/+page.svelte`: Gỡ bỏ prop `badge="Ứng dụng Desktop"`, đồng bộ hóa phong cách tiêu đề trang tối giản không badge trên toàn bộ ứng dụng.
    - Toàn bộ **366/366 unit tests pass 100%** (17/17 test files), `pnpm check` 0 errors/0 warnings, `pnpm lint` 0 errors, `pnpm knip` 0 issues.
  - **Xóa bỏ Husky, Chuẩn hóa Cấu trúc Thư mục & Cập nhật Toàn diện Tài liệu Dự án**:
    - **Xóa bỏ Husky hoàn toàn**: Xóa thư mục `.husky/`, hủy bỏ cấu hình `core.hooksPath` trong Git config. Quy chuẩn chất lượng mã nguồn được bảo đảm thuần túy thông qua pipeline `pnpm` cục bộ và GitHub Actions CI.
    - **Bổ sung sơ đồ kiến trúc thư mục chuẩn xác**: Thêm mục _Cấu trúc Thư mục & Modules Thực tế_ tại `README.md` mô tả chi tiết toàn bộ các route, modules, assets và test suites đang hoạt động.
    - **Cập nhật đồng bộ các tài liệu**: Đồng bộ số lượng 366 tests và ma trận kiểm thử tại `README.md`, `AI_WORKFLOW.md` và `TEST_WORKFLOW.md`.
  - **Dọn dẹp Toàn diện Codebase, Module Mồ côi & Rác Tích tụ (Clean Up Dead Code & Historical Clutter)**:
    - **Loại bỏ module mồ côi `src/lib/epub/`**: Xóa bỏ `src/lib/epub/parser/epub-reader-parser.ts` (555 LOC), `src/lib/epub/types/index.ts` (101 LOC), `src/lib/epub/index.ts` (3 LOC), và bài test đơn lẻ `tests/epub-core.test.ts` (91 LOC). Gỡ bỏ re-export `export * from '../epub/types';` khỏi `src/lib/types/index.ts`, thanh lọc ~750 dòng code chết mà không ảnh hưởng tới bất kỳ tính năng UI nào.
    - **Dọn dẹp 15 thư mục snapshot lịch sử trong `graphify-out/`**: Giải phóng **70 MB** và **167 file** rác tích tụ.
    - **Tối ưu hóa `package.json`**: Chuyển `fontkit` từ `dependencies` sang `devDependencies` (chỉ dùng cho `pnpm prebuild` metadata font ở build time, không bundle vào client bundle).
    - **Dọn dẹp thư mục tạm `test-results/`**.
    - Toàn bộ **366/366 unit tests pass 100%** (17/17 test files), `pnpm check` 0 errors/0 warnings, `pnpm lint` 0 errors, `pnpm knip` 0 issues.
  - **Tối ưu Hài hòa Header Sidebar & Logo Ebook Forge (Streamlined Sidebar Header & Seamless Collapse Button)**:
    - **Loại bỏ icon hộp màu cồng kềnh (`src/routes/+layout.svelte`)**: Gỡ bỏ khung icon sách 40x40px (`w-10 h-10 bg-accent-soft`) ở cả Header Sidebar Desktop và Header Mobile, chuyển thương hiệu thành dạng wordmark chữ in đậm tinh tế `Ebook Forge`.
    - **Tối ưu nút thu/mở menu `<` và `>`**:
      - Khi mở rộng (`isCollapsed = false`): Nút thu gọn `<` (`w-8 h-8 rounded-lg`) nằm gọn gàng bên phải tiêu đề `Ebook Forge`, căn chỉnh thẳng hàng ngang hoàn hảo.
      - Khi thu gọn (`isCollapsed = true`): Ẩn hoàn toàn chữ `Ebook Forge`, nút chuyển thành nút điều khiển mở rộng `>` kích thước chuẩn 44x44px (`w-11 h-11 rounded-xl mx-auto`), thẳng hàng dọc 100% với toàn bộ các nút icon bên dưới ("Tổng quan", "Đóng gói EPUB", "EPUB Editor", nút đổi theme).
      - Chấm dứt hoàn toàn hiện tượng xếp chồng lệch pha (icon 40px đè lên nút 32px) khi thu gọn sidebar.
    - Toàn bộ **367/367 unit tests pass 100%** (18/18 test files), `pnpm check` 0 errors/0 warnings, `pnpm lint` 0 errors, `pnpm knip` 0 issues.
  - **Gỡ bỏ Huy hiệu "Xử lý ngay trên máy bạn" (Remove Client-Side Badge)**:
    - **`PageHeader.svelte`**: Loại bỏ chuỗi mặc định `'Xử lý ngay trên máy bạn'`, chuẩn hóa prop `badge?: string` chỉ hiển thị khi có nhãn văn bản tùy chỉnh cụ thể (ví dụ: `badge="Ứng dụng Desktop"`).
    - **Gỡ bỏ `badge={true}` trên toàn bộ các trang công cụ**: Dọn dẹp sạch sẽ thuộc tính `badge={true}` tại `src/routes/epub-editor/+page.svelte`, `src/routes/epub-packer/+page.svelte`, `src/routes/epub-to-txt/+page.svelte`, và `src/routes/pdf/+page.svelte`, giúp phần đầu các trang hiển thị thoáng đãng, đồng nhất và tinh giản.
    - Toàn bộ **367/367 unit tests pass 100%** (18/18 test files), `pnpm check` 0 errors/0 warnings, `pnpm lint` 0 errors, `pnpm knip` 0 issues.
  - **Tinh gọn Trang Tổng quan (Home Decluttering & Streamlined Overview)**:
    - **Loại bỏ huy hiệu phụ tại tiêu đề (`src/routes/+page.svelte`)**: Gỡ bỏ nhãn `Xử lý 100% ngoại tuyến trên máy bạn` tại header trang chủ, giảm bớt chi tiết lặp lại để tập trung vào các công cụ cốt lõi.
    - **Loại bỏ các chip tính năng (feature badges) trong 2 thẻ công cụ chính**: Gỡ bỏ các chip `Bìa & Jacket`, `Heuristic phân chương`, `Nhúng font & Hoa văn`, `Mục lục tự động` ở thẻ Đóng gói EPUB và `Live Preview 2 chiều`, `Kiểm định Kobo`, `Dọn rác mồ côi`, `Tái tạo TOC` ở thẻ EPUB Editor & Validator, giúp thẻ sản phẩm thanh thoát, hiện đại và tối giản.
    - **Loại bỏ hoàn toàn khối `Quy trình gợi ý cho sách quét`**: Dọn sạch khối quy trình 4 bước rườm rà, đưa giao diện trang chủ về bố cục trực diện gồm hai khối rõ ràng: `Bắt đầu với` (2 công cụ chính) và `Công cụ lẻ & Mở rộng`.
    - Toàn bộ **367/367 unit tests pass 100%** (18/18 test files), `pnpm check` 0 errors/0 warnings, `pnpm lint` 0 errors, `pnpm knip` 0 issues.
  - **Tinh gọn & Hài hòa Giao diện Bước 3 "Bìa và hoa văn / Tùy chọn trang trí" (Minimal DropZone & Compact Section Layout)**:
    - **Hỗ trợ chế độ `compact` cho `DropZone.svelte` (`src/lib/components/DropZone.svelte`, `components.type.ts`)**:
      - Bổ sung prop `compact?: boolean` cho `DropZoneProps`.
      - Khi bật `compact`, giảm mạnh chiều cao từ ~180px xuống ~70px (`py-3 sm:py-3.5 px-4`, bo viền `rounded-xl` viền mảnh nét đứt `border`, icon 28px `w-7 h-7` kèm icon SVG stroke 14px `w-3.5 h-3.5`, nhãn tiêu đề `text-xs sm:text-sm font-medium`, subtitle `text-[11px] sm:text-xs`).
    - **Hỗ trợ chế độ `compact` cho `Input.svelte` (`src/lib/components/Input.svelte`)**:
      - Bổ sung prop `compact?: boolean` cho `InputProps`, giảm chiều cao ô nhập từ 44px (`h-11`) xuống 32–36px (`h-8 sm:h-9 text-xs px-2.5 rounded-lg`) giúp các ô nhập số lề cắt bìa gọn gàng, thanh thoát.
    - **Thiết kế lại khối Cắt lề ảnh bìa (`EpubCoverSection.svelte`) sang bố cục 2 cột nằm ngang**:
      - Thay thế hoàn toàn bố cục cũ (ảnh preview 280px chiếm 1 hàng to và 2 cột căn lề xếp bên dưới chiếm tới ~700px chiều cao) thành thẻ nằm ngang (`flex flex-col sm:flex-row items-start gap-5`): Thumbnail bìa 130–160px (`w-32 sm:w-40`) nằm bên trái có khung viền và vạch đỏ cắt lề trực quan, bảng điều khiển căn lề nằm bên phải với các nút bấm nhanh 32px (`T ±20`, `B ±20`, `L ±20`, `R ±20`) và 4 ô nhập lề `compact`.
      - Tiết kiệm hơn 60% diện tích màn hình, thao tác căn lề tức thời không phải cuộn trang.
    - **Tinh gọn khối Hoa văn trang trí (`EpubOrnamentsSection.svelte`) & Minh họa (`EpubIllustrationsSection.svelte`)**:
      - Tối ưu 2 DropZone Trang trí chương lớn (H1) và Trang trí chương phụ (H2) với `compact={true}`, khung xem trước hoa văn sau khi tẩy nền hiển thị dạng thẻ ngang nhỏ gọn 48x36px.
      - Tinh giản đoạn văn mô tả ảnh minh họa thành 1 dòng ngắn gọn, thanh thoát; vùng danh sách thẻ ảnh minh họa `max-h-36` bo góc `rounded-xl`.
    - **Cân đối khoảng cách và đệm thẻ chung của Bước 3 (`src/routes/epub-packer/+page.svelte`)**:
      - Chuẩn hóa đệm thẻ Bước 3 từ `p-5 sm:p-7` thành `p-4 sm:p-6`, khoảng cách giữa các phần tử `space-y-5`, đường kẻ ngăn cách `pt-5 border-border-color/70`.
    - Toàn bộ **367/367 unit tests pass 100%** (18/18 test files), `pnpm check` 0 errors/0 warnings, `pnpm lint` 0 errors, `pnpm knip` 0 issues.
  - **Chuẩn hóa Unicode NFC & Trích xuất Tiêu đề, Metadata Thông minh từ File TXT**:
    - **Khử triệt để lỗi dấu tiếng Việt NFD (macOS/iOS Unicode Decomposed) sang NFC Precomposed**:
      - Tên file khi tải từ macOS/iOS/trình duyệt thường ở dạng Unicode NFD (vần và dấu thanh bị tách thành các code point rời rạc như `o` + `^` + `~`). Khi nạp vào ô nhập liệu `<input>`, các font chữ không hỗ trợ GPOS dấu rời sẽ hiển thị lệch dấu hoặc ô vuông tofu.
      - Hàm `cleanTitleFromFileName` (`src/lib/utils/text.ts`) chuẩn hóa 100% sang Unicode NFC (`.normalize('NFC')`), giải mã URL `%xx`, bóc tách đuôi file, gỡ bỏ tag đóng mở ngoặc `[Full]`, `[Ebook]`, `(bản dịch)`, chuyển đổi `_` và `-` thành khoảng trắng và tự động viết hoa chữ cái đầu.
    - **Trích xuất thông minh Tiêu đề & Metadata từ nội dung file TXT (`extractMetadataFromTxt`)**:
      - Tự động nhận diện tiêu đề sách, tác giả, dịch giả, nhà xuất bản từ các tiền tố tiếng Việt/tiếng Anh (`Tên sách:`, `Tác giả:`, `Dịch giả:`, `NXB:`, `Title:`, `Author:`...) hoặc tiêu đề Markdown H1 (`# ...`) ở đầu file TXT.
      - Nhận diện tiêu đề dòng độc lập khi đi kèm khối thông tin tác giả/dịch giả (ví dụ: `BẮT TRẺ ĐỒNG XANH` đứng trước `Tác giả: J. D. Salinger`), đồng thời tránh hoàn toàn việc nhầm lẫn với các tên chương (`Chương 1...`) hoặc nội dung văn bản thông thường.
      - Tự động nâng cấp tiêu đề sách có dấu tiếng Việt chuẩn xác khi người dùng tải file có tên không dấu (ví dụ file `dac-nhan-tam.txt` tự động lấy tiêu đề `Đắc Nhân Tâm` từ nội dung file).
    - Toàn bộ **367/367 unit tests pass 100%** (18/18 test files), `pnpm check` 0 errors/0 warnings, `pnpm lint` 0 errors, `pnpm knip` 0 issues.
  - **Tối ưu hóa Font-Stack Tiếng Việt & Khử lỗi Font Input/Placeholder Toàn diện**:
    - **Nâng cấp Font-Stack đa nền tảng (`src/routes/layout.css`, `DESIGN_SYSTEM.md`)**:
      - Bổ sung chuỗi fallback chuẩn quốc tế cho `font-sans`: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif`, đảm bảo 100% hiển thị tiếng Việt trơn tru, không bị lỗi dấu/nhảy font trên mọi OS (kể cả khi offline không nạp được Google Fonts).
      - Bổ sung fallback hoàn chỉnh cho `font-mono`: `'Space Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace`.
    - **Khử bỏ `font-mono` ở ô input mang placeholder tiếng Việt (`EpubSourceSection.svelte`)**:
      - Chuyển ô nhập trang bắt đầu (`placeholder="Đầu"`) và trang kết thúc (`placeholder="Cuối"`) từ `font-mono` sang `font-sans font-medium` để hiển thị chữ tiếng Việt sắc nét, đều đặn.
    - **Tăng cường Text-Rendering & Khử răng cưa (`layout.css`, `src/app.html`)**:
      - Bổ sung `-webkit-font-smoothing: antialiased`, `-moz-osx-font-smoothing: grayscale` và `text-rendering: optimizeLegibility` cho toàn bộ thẻ `input`, `textarea` và `::placeholder`.
      - Loại bỏ lớp không chuẩn `antialiased-none` tại `src/app.html`, kích hoạt `antialiased` chuẩn nét cho toàn bộ `<body>`.
    - Toàn bộ **350/350 unit tests pass 100%**, `pnpm check` 0 errors/0 warnings, `pnpm lint` 0 errors, `pnpm knip` 0 issues.
  - **Tinh gọn Carousel Jacket & Chuẩn hóa Phông chữ Mặc định Bookerly Toàn diện**:
    - **Tinh giản thanh điều khiển Jacket Carousel (`EpubJacketCarousel.svelte`)**:
      - Gỡ bỏ hàng nút chữ phía trên (`Mẫu 1` đến `Mẫu 10`), giữ không gian hiển thị rộng rãi, thoáng đãng khi đã có thanh trượt và hàng chấm tròn chỉ mục (dots indicator).
      - Rút gọn nội dung hiển thị bên dưới từ `Đang chọn: Mẫu N (N/10)` sang `Đang chọn: (N/10)` thanh thoát và xúc tích.
      - Thiết lập phông chữ mặc định của Jacket trang lót sang `Bookerly` thay vì hệ thống sans-serif.
    - **Chuẩn hóa Phông chữ Mặc định là `Bookerly` trên toàn bộ hệ thống (`FontSelect.svelte`, `EpubFontSettingsSection.svelte`, `+page.svelte`)**:
      - `FontSelect.svelte`: Placeholder mặc định đổi thành `Mặc định (Bookerly)`. Tùy chọn mặc định và hiển thị khi chưa chọn phông đều hiển thị chữ `Mặc định` kèm ghi chú `Bookerly`, được render trực tiếp bằng phông chữ `Bookerly`.
      - Khung xem trước chương (`EpubFontSettingsSection.svelte`): Khi tiêu đề ở trạng thái mặc định, giao diện tự động áp dụng phông `Bookerly` thay vì font sans-serif hệ thống; cập nhật mô tả đoạn văn chuẩn xác theo phông `Bookerly` mặc định của sách.
      - Thanh điều hướng và Cột tóm tắt (`+page.svelte`): Hiển thị `Mặc định (Bookerly)` tại Bước 4 và hàng tóm tắt Bước 5 được định kiểu trực tiếp bằng `Bookerly`.
    - Toàn bộ **350/350 unit tests pass 100%**, `pnpm check` 0 errors/0 warnings, `pnpm lint` 0 errors, `pnpm knip` 0 issues.
  - **Chuyển đổi Trang lót sách (Jacket) thành Carousel trực tiếp ở Bước 2 (`EpubJacketCarousel.svelte`)**:
    - Thay thế hoàn toàn modal popup bằng thanh trượt Carousel trực quan tích hợp ngay dưới các ô nhập thông tin sách tại Bước 2.
    - Cập nhật thời gian thực (live preview) nội dung trang sách mẫu khi người dùng nhập tác phẩm, tác giả, dịch giả, nhà xuất bản.
    - Hỗ trợ thanh chọn nhanh 10 mẫu thiết kế (`Mẫu 1` đến `Mẫu 10`), bộ chọn phông chữ nhúng `FontSelect`, hai nút điều hướng `Trước` / `Tiếp` và hàng chấm chỉ mục (dots indicator).
    - Tinh giản giao diện, loại bỏ modal che khuất màn hình và tối ưu hóa trải nghiệm người dùng.
  - **Tinh gọn danh sách chương ở Bước 1 Nguồn tài liệu (`EpubSourceSection.svelte`)**:
    - Ẩn hoàn toàn dòng phụ trùng lặp `Nguồn: File TXT` đối với các file văn bản TXT, giúp danh sách chương hiển thị gọn gàng, thanh thoát (mỗi dòng hiển thị số thứ tự, tên chương và tên file `.xhtml`).
    - Chỉ hiển thị nhãn `Nguồn:` đối với các file ZIP khi có nhiều file Markdown được gom nhóm vào một chương.
  - **Tối ưu Bố cục Toàn màn hình & Tinh chỉnh Bước 5 Đóng gói EPUB (`src/routes/epub-packer/+page.svelte`)**:
    - **Loại bỏ đường line cắt xuyên bước 1–5**: Gỡ bỏ vạch kẻ nối cắt ngang qua các số bước ở thanh điều hướng, giúp giao diện thanh thoát và không bị rối mắt.
    - **Mở rộng Bước 1–4 chiếm trọn màn hình (`w-full`)**: Loại bỏ hoàn toàn cột tóm tắt sách bên phải ở các bước 1 đến 4, giúp vùng nạp tài liệu, nhập metadata, tải ảnh bìa/hoa văn/minh họa và thiết lập phông chữ có diện tích tối đa.
    - **Hiển thị Tóm tắt sách duy nhất tại Bước 5 (Đóng gói sách)**: Đưa khối tóm tắt tổng thể vào Bước 5 kèm các nút điều chỉnh trực tiếp ("Sửa nguồn →", "Sửa thông tin →", "Sửa bìa →", "Sửa phông →", "+ Thêm bìa") để người dùng soát lỗi trước khi xuất bản.
    - **Khối xuất bản trực quan**: Hiển thị trạng thái kiểm định "Đã đủ để đóng gói file EPUB", ô đặt tên file và 2 nút hành động lớn "Đóng gói file EPUB" và "Tải file .EPUB".
    - **Cập nhật kiểm thử E2E Playwright**: Điều chỉnh `tests-e2e/epub-download-inspection.spec.ts` và `tests-e2e/epub-workflow.spec.ts` chuyển sang Bước 5 trước khi kích hoạt đóng gói.
  - **Hoàn thiện cấu trúc bố cục Mockup A & Chuẩn hóa triệt để Token/Icon (Packer Unified Cards, Token Ok, SVG Icons & Docs Sync)**:
    - **Tái cấu trúc bố cục EPUB Packer (`src/routes/epub-packer/+page.svelte`)**: Bọc mỗi bước (1–5) trong **1 thẻ lớn duy nhất (`modern-card`)** gồm tiêu đề bước (font-bold 18–20px) + dòng mô tả ngắn + đường kẻ phân tách + nội dung section + footer hàng nút điều hướng "Quay lại / Tiếp" nằm ngay TRONG thẻ.
    - **Gộp Bước 3 thành 1 thẻ duy nhất**: Loại bỏ thẻ bọc riêng của `EpubCoverSection`, `EpubOrnamentsSection`, `EpubIllustrationsSection`, gộp thành 3 khối liền mạch ngăn cách bằng đường kẻ mỏng `border-t border-border-color`.
    - **Loại bỏ thẻ bọc riêng của cả 7 component section**: Chuyển các section thành khối nội dung không viền (`animate-fade-in`), tinh giản tiêu đề lặp giữa section và card step header.
    - **Cột tóm tắt sách**: Bổ sung banner thông báo trạng thái _"Đã đủ để đóng gói file EPUB"_ với icon check và token `--color-ok` khi đã tải chương nguồn.
    - **Chuẩn hóa triệt để Token `--color-ok`**: Thay thế 100% các lớp `emerald-*` còn sót sang token `--color-ok` (`text-ok`, `bg-ok/10`, `border-ok/30`, `bg-ok/20`...) trên toàn bộ các modal và components (`EpubCleanerModal`, `EpubEditorSidebar`, `EpubValidatorModal`, `EpubMetadataModal`, `EpubEditorPreviewPane`, `pdf/+page.svelte`, `epub-editor/+page.svelte`).
    - **Loại bỏ ký tự/emoji còn sót**: Thay thế mũi tên thô `➔` trong `EpubCleanerModal` sang SVG/mũi tên chuẩn; thay 5 ký tự `✗` trong `EpubValidatorModal` sang icon SVG stroke; chuyển các nhãn văn bản badge trong `EpubCleanerModal` sang Inter `font-sans`.
    - **Đồng bộ tài liệu**: Xóa bỏ các vị trí còn nhắc Markdown Fixer trong `README.md` và `UI_DIRECTION.md` (ghi chú rõ Markdown Fixer đã gỡ); cấu hình `XDG_CONFIG_HOME` cho Playwright webServer; cập nhật `tests-e2e/pdf-workflow.spec.ts` bỏ selector `📁`.
    - Toàn bộ **350/350 unit tests pass 100%**, **14/14 Playwright E2E browser tests pass 100%**, `pnpm check` 0 errors/0 warnings, `pnpm lint` 0 errors, `pnpm knip` 0 issues, production build hoàn tất.
  - **Làm mới triệt để giao diện theo phản hồi chi tiết (Comprehensive UI Polish & Refinement)**:
    - **Trang PDF → JPG (`src/routes/pdf/+page.svelte`)**: Loại bỏ hoàn toàn font-mono trên các nhãn và nút ("10 trang", "20 trang", "Tải ảnh xem trước", "‹ Trước", "Sau ›", "Mặc định (Không cắt)"), bỏ uppercase trên nhãn "Header (px)" và "Footer (px)"; chuẩn hóa toàn bộ nút và ô nhập liệu sang `border-field-border` cao 40–44px và nền `bg-panel-2` theo đúng mockup thiết kế.
    - **Giảm thiểu font-mono trên các modal editor**:
      - `EpubCleanerModal.svelte`: Chuyển nhãn thống kê ("Tổng dung lượng", "Ảnh không dùng", "Font không dùng", "Có thể giảm", "Tùy chọn dọn dẹp") sang `font-sans`, bỏ uppercase; giữ font-mono chỉ cho số liệu, kích thước byte và đường dẫn file.
      - `EpubJacketModal.svelte`: Chuyển đổi toàn bộ tiêu đề, nhãn mẫu, nhãn phông chữ, các nút chuyển mẫu và nút chọn sang `font-sans`, cao 40px viền `border-field-border`.
      - `EpubSyntaxModal.svelte`: Bảng quy ước và các nút/nhãn chuyển sang `font-sans`, chỉ giữ font-mono trong thẻ `<code>` cú pháp kỹ thuật.
      - `EpubEditorModal.svelte`, `EpubEditorSidebar.svelte`, `EpubMetadataModal.svelte`: Chuẩn hóa nút toggle file và tiêu đề sidebar sang `font-sans`.
    - **Bước Thông tin sách (`EpubMetadataSection.svelte`)**: Bổ sung hàng thẻ chọn mẫu jacket trực quan (Mẫu 1–4 + Thẻ mở rộng "Xem cả 10 mẫu →" kích hoạt modal) với trạng thái active chuẩn; đổi nút "Xem trước & Tùy biến" từ accent đặc sang nút phụ viền mảnh `border-field-border` chuẩn mockup.
    - **Tinh giản thẻ "Quy trình gợi ý cho sách quét" (`src/routes/+page.svelte`)**: Gỡ bỏ badge cồng kềnh "Nội bộ/Bên ngoài" và dòng footer "Mở… →"; giữ giao diện thanh thoát chỉ gồm "Bước N", tiêu đề và 1 dòng mô tả; bổ sung mũi tên nối liền mạch giữa các ô trên desktop; thẻ Bước 2 (OCR ngoài) giữ viền nét đứt tinh tế.
    - **Bỏ chữ hoa (uppercase) trên các tiêu đề nhóm**: Chuyển "BẮT ĐẦU VỚI", "QUY TRÌNH GỢI Ý CHO SÁCH QUÉT", "CÔNG CỤ LẺ & MỞ RỘNG" sang câu thường `font-sans font-semibold`; bỏ font-mono ở dòng phụ "Desk" logo sidebar (`src/routes/+layout.svelte`).
    - **Chuẩn hóa chi tiết nhỏ**:
      - Bổ sung prop `size="lg"` (h-12) vào `Button.svelte`, loại bỏ hoàn toàn cú pháp ghi đè `[&>button]:!h-12` tại cột tóm tắt sách của packer.
      - Bỏ huy hiệu "Chế bản chính" không cần thiết trên thẻ Đóng gói EPUB.
      - Đồng bộ huy hiệu "Xử lý 100% ngoại tuyến" tại `PageHeader.svelte` và `+page.svelte` sang token thiết kế `bg-ok/10 text-ok border-ok/20` chuẩn WCAG.
    - Kết quả pipeline: format ✅ | lint ✅ | type check (0 err, 0 warn) ✅ | test unit ✅ (350/350 pass) | knip ✅ | build Cloudflare ✅
  - **Khắc phục triệt để lỗi vỡ giao diện trên Mobile View (Mobile Responsive Fixes)**:
    - Sửa lỗi nghiêm trọng tại Drawer Menu Sidebar (`src/routes/+layout.svelte`): Khi vào các trang công cụ, trạng thái `isCollapsed` tự động kích hoạt khiến các nút điều hướng và nút đổi theme trên drawer di động bị co thành hình vuông 44px (`w-11`), trong khi chữ nhãn không ẩn trên mobile dẫn đến tràn chữ và vỡ bố cục; đã chuẩn hóa các nút luôn đạt `w-full` trên mobile và chỉ co nhỏ trên màn hình desktop (`md:`). Đồng thời khôi phục tiêu đề các nhóm chuyên mục và căn chỉnh header logo trên drawer di động.
    - Chuẩn hóa container layout từ `w-screen` sang `w-full max-w-full` để ngăn hiện tượng thanh cuộn ngang gây giật màn hình trên thiết bị di động; giảm padding đệm từ `p-6` xuống `p-4 sm:p-6 md:p-10` để mở rộng không gian nội dung trên màn hình hẹp.
    - Thanh điều hướng 5 bước tại `epub-packer/+page.svelte`: chuyển đổi từ lưới 2 cột ngắt quãng sang thanh cuộn ngang mượt mà (`flex overflow-x-auto gap-3 sm:grid sm:grid-cols-3 lg:grid-cols-5`), các bước hiển thị trọn vẹn theo hàng ngang mà không bị cô lập bước 5 ở dòng 3.
    - Chuẩn hóa padding các thẻ card (`modern-card`) trên toàn bộ các section packer, trang pdf, epub-to-txt, txt-to-pdf và các modal sang `p-5 sm:p-7` (và `p-4 sm:p-6` cho modal content), đồng thời tinh chỉnh các nút cắt lề bìa `px-2.5 sm:px-3.5` chống tràn ngang.
    - Toàn bộ **350/350 unit tests pass 100%**, `pnpm check` 0 errors/0 warnings, `pnpm lint` 0 errors, `pnpm knip` 0 issues, production build hoàn tất.
  - **Làm mới toàn diện giao diện (UI Refinement Suite)**:
    - Làm mới các section bên trong EPUB Packer (EpubSourceSection, EpubCoverSection, EpubOrnamentsSection, EpubIllustrationsSection, EpubMetadataSection, EpubPackSection): loại bỏ font-mono và uppercase ở các nhãn/tiêu đề, chuẩn hóa ô nhập `bg-panel-2 border-field-border h-11`, nút cắt lề cao 40px viền `border-field-border`.
    - Thanh tiến trình 5 bước mảnh mai (Slender step bar) tại `epub-packer/+page.svelte`: đường kẻ nối, vòng tròn số/dấu ✓ 32px, tiêu đề bước và dòng phụ mô tả ngắn gọn, loại bỏ viền thẻ thô cứng và badge.
    - PageHeader: bổ sung breadcrumb nhóm công cụ và huy hiệu "Xử lý ngay trên máy bạn" (kèm icon khiên SVG) dạng prop tùy chọn.
    - Trang Tổng quan (+page.svelte): bổ sung khối "Quy trình gợi ý cho sách quét" (PDF → JPG → OCR ngoài → Đóng gói EPUB → EPUB Editor với thẻ OCR viền nét đứt "Thực hiện bên ngoài ứng dụng"), thêm chip tính năng nổi bật vào 2 thẻ công cụ lớn, chuyển "Công cụ lẻ & Mở rộng" thành lưới 2 cột hiển thị trọn vẹn mô tả không cắt cụt.
    - Sidebar thu gọn: khi ở kích thước 72px (`md:w-18`), logo và nút thu/mở xếp dọc (`md:flex-col md:gap-3 md:items-center`), không bị ép chật chội.
    - Cột tóm tắt cố định: trình bày dạng danh sách nhãn–giá trị 13–14px gọn gàng, nút Đóng gói EPUB cao 48px (`h-12`), tiêu đề không dùng font-mono/uppercase.
    - Thay thế toàn bộ emoji (⚠️ 💡 📁 ✅ ❌ 🎉 🧹 🖼 👁 📥…) trong các modal biên tập (EpubValidatorModal, EpubCleanerModal, EpubEditorModal, EpubMetadataModal), các trang công cụ (pdf, txt-to-pdf) và các section bằng hệ thống SVG stroke chuẩn nét; giảm thiểu font-mono không cần thiết.
    - Toàn bộ **350/350 unit tests pass 100%**, `pnpm check` 0 errors/0 warnings, `pnpm lint` 0 errors, `pnpm knip` 0 issues, production build hoàn tất.
  - **Chuẩn hóa nhãn "File", viết hoa đầu câu/nhãn & Dọn dẹp Layout Sidebar**:
    - Rà soát toàn bộ thay đổi sau khi chuẩn hóa thuật ngữ giao diện từ "tệp" sang "file".
    - Viết hoa chữ cái đầu cho các danh từ/nhãn/tiêu đề và thông báo lỗi: `File xuất`, `File PDF dung lượng lớn`, `File tải về:`, `File EPUB đạt chuẩn kiểm định!`, `File EPUB không chứa file nào hợp lệ.`, `File "${filePath}"...`, `File OPF...`.
    - Chuẩn hóa nguồn định dạng `sources: ['File TXT']` trong `txt-parser.ts`.
    - Dọn sạch thẻ `div` rỗng mồ côi trong `src/routes/+layout.svelte` sau khi bỏ version badge ở sidebar.
    - Toàn bộ **350/350 unit tests pass 100%**, `pnpm check` 0 errors/0 warnings, `pnpm lint` 0 errors, `pnpm knip` 0 issues, production build hoàn tất.
  - **Chuẩn hóa toàn bộ các lớp CSS Tailwind theo gợi ý của `suggestCanonicalClasses`**:
    - Thay thế toàn bộ arbitrary values sang utility tokens chuẩn của Tailwind CSS: `h-[100dvh]` -> `h-dvh`, `w-[270px]` -> `w-67.5`, `w-[72px]` -> `w-18`, `w-[232px]` -> `w-58`, `h-[56px]` -> `h-14`, `max-w-[220px]` -> `max-w-55`, `max-w-[110px]` -> `max-w-27.5`, `min-w-[200px]` -> `min-w-50`, `min-w-[160px]` -> `min-w-40`, `min-w-[170px]` -> `min-w-42.5`, `min-h-[76px]` -> `min-h-19`, `break-words` -> `wrap-break-word`, `text-[14px]` -> `text-sm`, `sm:text-[30px]` -> `sm:text-3xl`.
    - Kết quả kiểm tra `@laststance/tailwind-suggest-canonical-classes` đạt 0 cảnh báo.
  - **Gỡ bỏ hoàn toàn tính năng "Markdown Fixer" (`markdown-fixer`)**:
    - Xóa bỏ route `/md`, thư viện `src/lib/markdown-fixer`, kiểu dữ liệu `markdown-fixer.type.ts`, menu điều hướng sidebar và thẻ công cụ tại trang chủ.
    - Tinh giản quy trình gợi ý chuyển đổi sách quét thành mô hình 4 bước chuẩn (PDF → JPG, OCR ngoài, Đóng gói EPUB, EPUB Editor).
    - Cập nhật các bài kiểm thử unit và browser E2E loại bỏ phụ thuộc vào `markdown-fixer`.
    - Toàn bộ **350/350 unit tests pass 100%**, **14/14 Playwright E2E browser tests pass 100%**, `pnpm check` 0 errors/0 warnings, `pnpm lint` 0 errors, `pnpm knip` 0 issues, production build hoàn tất.
  - **Giai đoạn 6 Làm mới Giao diện — Các Trang Còn Lại (EPUB Editor, PDF Splitter, EPUB to TXT, TXT to PDF) (`UI_DIRECTION.md`)**:
    - Nâng cấp đồng bộ diện mạo các công cụ còn lại:
      - `src/routes/epub-editor/+page.svelte` & components (`EpubMetadataModal`, `EpubValidatorModal`, `EpubCleanerModal`): Thay thế hoàn toàn hàng nút emoji bằng các nút phụ chuẩn với icon SVG stroke inline (Lucide style) và nhãn Inter rõ ràng (Thông tin, Kiểm định, Dọn rác EPUB, Mở trình chỉnh sửa); chuẩn hóa header các modal với bo góc `rounded-2xl` và màu Solarized chuẩn.
      - `src/routes/pdf/+page.svelte`: Chuẩn hóa tiêu đề section sang Inter, thay emoji cảnh báo và mũi tên bằng icon SVG stroke, giữ nguyên 100% logic tách trang và xử lý bộ nhớ.
      - `src/routes/epub-to-txt/+page.svelte`: Chuẩn hóa tiêu đề sang Inter, nút chuyển đổi với SVG icon, thanh tiến độ Solarized.
      - `src/routes/txt-to-pdf/+page.svelte`: Thay thế toàn bộ 9 emoji tính năng và tải xuống bằng hệ thống icon SVG stroke chuyên nghiệp.
    - Toàn bộ **361/361 unit tests pass 100%**, **15/15 Playwright E2E browser tests pass 100%**, `pnpm check` 0 errors/0 warnings, `pnpm lint` 0 errors, `pnpm knip` 0 issues, production build hoàn tất.
  - **Giai đoạn 5 Làm mới Giao diện — Trang Đóng gói EPUB: Thanh 5 Bước & Cột Tóm Tắt Cố Định (`src/routes/epub-packer/+page.svelte`) (`UI_DIRECTION.md`)**:
    - Tái cấu trúc trang Đóng gói EPUB thành quy trình 5 bước liền mạch kết hợp cột tóm tắt thông tin sách luôn hiển thị bên phải:
      - Thanh điều hướng 5 bước trên cùng (`<ol>` với `aria-current="step"`, hiển thị số thứ tự, tên bước, huy hiệu trạng thái động: Đã tải / Tùy chọn / Mặc định / Hoàn tất). Cho phép bấm tự do giữa các bước khi đã có chương nguồn.
      - Bảo toàn 100% state và vòng đời của 7 component section thông qua việc ẩn/hiện bằng `class="hidden"`, tuyệt đối không unmount bằng `{#if}`.
      - Bổ sung nút điều hướng "Tiếp: ..." và "Quay lại: ..." ở chân mỗi bước để dẫn dắt trải nghiệm.
      - Cột tóm tắt sách (Persistent Summary Column) cố định bên phải (sticky trên desktop): hiển thị ảnh bìa trực quan (hoặc khung placeholder đứt nét), tên tác phẩm, tác giả, số mục lục, phông chữ H1, tên file xuất.
      - Hai nút thao tác chính luôn sẵn sàng trên cột tóm tắt: "Đóng gói file EPUB" và "Tải file .EPUB" (disabled khi chưa có blob), không cần cuộn tìm ở cuối trang.
      - Khung xem trước typography ở bước 4 sử dụng nền giấy màu kem `#fbf8ef` với chữ `#073642`.
      - Các nút chỉnh lề bìa sách ở bước 3 chuẩn hóa chiều cao 40px, font mono cho số pixel.
    - Toàn bộ **361/361 unit tests pass 100%**, **15/15 Playwright E2E browser tests pass 100%**, `pnpm check` 0 errors/0 warnings, `pnpm lint` 0 errors, `pnpm knip` 0 issues, production build hoàn tất.
  - **Giai đoạn 4 Làm mới Giao diện — Tái Cấu Trúc Trang Tổng Quan (`src/routes/+page.svelte`) (`UI_DIRECTION.md`)**:
    - Thiết kế lại trang Tổng quan theo định hướng giao diện mới:
      - Header: Tiêu đề "Bàn làm việc", mô tả tinh gọn, huy hiệu trạng thái bảo mật "file không rời khỏi máy bạn" với màu `--color-ok`.
      - Khối "Bắt đầu với": 2 thẻ lớn (Đóng gói EPUB & EPUB Editor & Validator) với icon SVG nổi bật, chip tính năng chi tiết, loại bỏ nút lặp (thẻ chính là liên kết với mũi tên điều hướng).
      - Khối "Quy trình gợi ý cho sách quét": Mô hình 4 bước trực quan (PDF → JPG, OCR ngoài viền đứt, Đóng gói EPUB, EPUB Editor) với hướng dẫn rõ ràng.
      - Khối "Công cụ lẻ & Mở rộng": Danh sách thẻ ngang gọn gàng (EPUB → TXT, PDF → JPG, TXT → PDF CJK gắn tag Desktop).
    - Toàn bộ **361/361 unit tests pass 100%**, **15/15 Playwright E2E browser tests pass 100%**, `pnpm check` 0 errors/0 warnings, `pnpm lint` 0 errors, `pnpm knip` 0 issues, production build hoàn tất.
  - **Giai đoạn 3 Làm mới Giao diện — Khung Ứng Dụng & Sidebar Tự Thu Gọn 72px (`UI_DIRECTION.md`)**:
    - Nâng cấp layout ứng dụng trong [`src/routes/+layout.svelte`](src/routes/+layout.svelte):
      - Cơ chế thu gọn 2 trạng thái: mở rộng 232px (`w-[232px]`) ở trang chủ `/`, tự động thu gọn 72px (`w-[72px]`) khi chuyển vào các công cụ để mở rộng không gian làm việc.
      - Nút điều khiển thu gọn/mở rộng ở đầu Sidebar (`aria-expanded`, icon mũi tên, ghi nhớ lựa chọn người dùng vào `localStorage ('sidebar-collapsed')`).
      - Thay thế toàn bộ emoji thành icon SVG stroke inline (Lucide style) màu `currentColor`: layout-grid, package, pencil, image, type, file-text, monitor, book open logo.
      - Phân nhóm điều hướng rõ ràng 4 mục: Tổng quan, Tạo và tinh chỉnh, Tiền xử lý, Mở rộng.
      - Giữ nguyên 100% cơ chế drawer mobile trên màn hình `< md` và logic chuyển đổi Dark/Light theme.
    - Toàn bộ **361/361 unit tests pass 100%**, **15/15 Playwright E2E browser tests pass 100%**, `pnpm check` 0 errors/0 warnings, `pnpm lint` 0 errors, `pnpm knip` 0 issues, production build hoàn tất.
  - **Giai đoạn 2 Làm mới Giao diện — Chuẩn hóa Thành phần Dùng chung (`UI_DIRECTION.md`)**:
    - Nâng cấp 5 components dùng chung trong `src/lib/components/` theo đúng thiết kế mới mà không làm thay đổi props hoặc phá vỡ các selector phục vụ kiểm thử tự động:
      - `Button.svelte`: Chuẩn hóa chiều cao 44px (`h-11`), bo góc `rounded-xl`, typography Inter 15px 600/500, hỗ trợ kiểu `secondary` (viền `field-border`, nền trong suốt), primary dùng `bg-accent-color text-on-accent`, disabled opacity 70%.
      - `Input.svelte`: Chiều cao 44px (`h-11`), bo góc `rounded-[10px]`, viền `field-border`, nhãn phía trên Inter 13px đậm 600 (không uppercase), placeholder `text-mute`.
      - `DropZone.svelte`: Bo góc `rounded-2xl`, bổ sung icon upload inline SVG stroke chuẩn thay thế emoji, chữ mô tả rõ ràng, hiển thị badge file tin đã chọn.
      - `PageHeader.svelte`: Tiêu đề Inter 700 28–30px responsive (`text-2xl sm:text-[30px]`), mô tả phụ `text-text-mute` thoáng rộng.
      - `FontSelect.svelte`: Chiều cao 52px (chế độ chuẩn), hiển thị 2 dòng (tên font và kiểu dáng thực tế kèm mẫu tiếng Việt "Chương 1: Bình minh"), nhãn 13px đậm, dropdown bo `rounded-2xl`, bảo toàn 100% selector và hành vi kiểm thử tự động.
    - Toàn bộ **361/361 unit tests pass 100%**, **15/15 Playwright E2E browser tests pass 100%**, `pnpm check` 0 errors/0 warnings, `pnpm lint` 0 errors, `pnpm knip` 0 issues, production build hoàn tất.
  - **Giai đoạn 1 Làm mới Giao diện — Token màu Solarized & Typography chuẩn WCAG AA (`UI_DIRECTION.md`)**:
    - Cập nhật toàn bộ bảng màu CSS theme variables trong [`src/routes/layout.css`](src/routes/layout.css) đạt tỷ lệ tương phản tối thiểu 4.5:1 cho văn bản và 3:1 cho đường viền ô nhập: `--color-accent-color` (`#1d6fa8` / `#35b6ab`), `--color-text-mute` (`#4a6168` / `#93a1a1`), `--color-text-color` (`#073642` / `#eee8d5`), `--color-border-color` (`#d9d1bb` / `#1b4653`), `--color-sidebar-bg` (`#f3ecd8` / `#00222b`).
    - Bổ sung 3 biến theme mới: `--color-field-border` (viền ô nhập/nút phụ `#8a8168` / `#5b7f87`), `--color-on-accent` (màu chữ trên nút accent `#fdf6e3` / `#002b36`), `--color-ok` (trạng thái thành công `#3f6a10` / `#7bb661`).
    - Tinh chỉnh `.modern-card`: bo góc `rounded-2xl` (`border-radius: 1rem`), loại bỏ hiệu ứng phát sáng quá mạnh, chỉ đổi viền nhẹ khi hover.
    - Đồng bộ hóa tài liệu quy chuẩn [`DESIGN_SYSTEM.md`](DESIGN_SYSTEM.md) theo định hướng UI mới.
    - Toàn bộ **361/361 unit tests pass 100%**, **15/15 Playwright E2E browser tests pass 100%**, `pnpm check` 0 errors/0 warnings, `pnpm lint` 0 errors, `pnpm knip` 0 issues, production build hoàn tất.
  - **Khử bỏ số chú thích `{...}` khỏi tiêu đề Mục lục (TOC Footnote Reference Stripping)**:
    - Loại bỏ thẻ chú thích `<a class="noteref"...>...</a>` và ký hiệu thô `{...}` khi trích xuất tiêu đề cho TOC trong cả `txt-parser.ts` (`stripFootnoteRefs`) và `nav-builder.ts`.
    - Bảo toàn 100% link nhảy chú thích `<sup>{n}</sup>` trong nội dung đọc `<h1>`/`<h2>`, đồng thời giữ cho Mục lục (`nav.xhtml`, `toc.ncx`) hiển thị sạch sẽ (ví dụ `ANH TÔNG` thay vì `ANH TÔNG642`).
  - **Chặn các khối không tiêu đề (`[new]`, `[new:center]` và trang nội dung tự mở) rò rỉ vào TOC & UI Preview**:
    - Khi khối `[new]`, `[new:center]` hoặc trang nội dung tiếp nối không chứa bất kỳ heading nào (`headings.length === 0`) và không có tiêu đề tự đặt (`hasCustomTitle === false`), hệ thống tự động bỏ qua không thêm vào TOC, triệt tiêu hoàn toàn các mục rác như `"Giới Thiệu"` hoặc tên file ngầm định (ví dụ `"MTL Gop"`).
    - Cập nhật đồng bộ tab xem trước **"Đầu mục tìm thấy"** trong giao diện [`EpubSourceSection.svelte`](src/lib/epub-packer/components/EpubSourceSection.svelte): sử dụng danh sách `tocChapters` đã lọc, đồng bộ số lượng chương hiển thị và đánh số thứ tự thực tế tương ứng với TOC thay vì hiển thị toàn bộ các file XHTML vật lý (như `MTL gộp chap_27.xhtml`, `MTL gộp chap_29.xhtml`).
    - Duy trì cơ chế bảo vệ fallback: nếu toàn bộ tài liệu không có bất kỳ mốc phân chương nào, trang đầu tiên vẫn được đưa vào TOC để thỏa mãn quy chuẩn EPUB 2 / EPUB 3.
  - Toàn bộ **361/361 unit tests pass 100%**, `pnpm check` 0 errors, `pnpm lint` 0 errors, `pnpm knip` 0 issues, production build hoàn tất.
  - **Dọn sạch các comment phân mục thừa (`/* ===== ... ===== */`) trong các mẫu CSS EPUB (`quotes.css`, `cover.css`, `ornaments.css`)**:
    - Loại bỏ toàn bộ các comment tiêu đề khối dạng `/* ===== ... ===== */` nhằm tinh gọn dung lượng mã nguồn CSS và giữ cho file CSS thành phẩm gọn gàng, sạch sẽ.
  - **Sắp xếp lại thứ tự Selector trong CSS (`quotes.css`) chuẩn hóa Stylelint (`no-descending-specificity`)**:
    - Di chuyển toàn bộ các bộ chọn lồng ghép có độ ưu tiên cao (`.letter .poem`, `.letter-box .poem`, `.letter .poem:first-child`, `.letter-box .poem:first-child`, `.letter .poem:last-child`, `.letter-box .poem:last-child`, `.letter .poem p`, `.letter-box .poem p`) xuống cuối file sau các bộ chọn đơn (`.poem`, `.poem p`, `.letter-box p`, `blockquote.* p`, `h1/h2 + p`, `:first-child`, `:last-child`).
    - Triệt tiêu 100% cảnh báo/lỗi `no-descending-specificity` khi kiểm định EPUB với Stylelint / EpubCheck.
  - **Cân đối khoảng cách trên/dưới cho đường viền `border-left` của `[letter]` và `[letter-box]` (`quotes.css`)**:
    - Nâng `padding` khối `.letter` lên `0.5em 1.2em` đồng thời triệt tiêu `padding-top: 0` cho phần tử đoạn văn đầu tiên (`.letter p:first-child`, `.letter-box p:first-child`) và `margin-top: 0` cho bài thơ đầu tiên (`.letter .poem:first-child`, `.letter-box .poem:first-child`).
    - Giúp khoảng cách từ đỉnh viền và đáy viền tới nội dung chữ cân đối đối xứng tuyệt đối (cùng là `0.5em`), chấm dứt hiện tượng viền trên bị nhô cao gấp gần 3 lần viền dưới.
  - **Triệt tiêu margin cho thẻ p của bài thơ `[poem]` khi lồng trong `[letter]` và `[letter-box]` (`quotes.css`)**:
    - Bổ sung quy tắc `.letter .poem p, .letter-box .poem p { margin: 0; }` để loại bỏ thuộc tính `margin-bottom: 0.8em` bị kế thừa từ bộ chọn `.letter p` / `.letter-box p`, giúp khoảng cách giữa các dòng thơ luôn sít sao và đồng đều.
  - **Hỗ trợ Lồng Thẻ Bài Thơ `[poem] ... [/poem]` bên trong Khối Thư `[letter]` và Hộp Viền `[letter-box]`**:
    - **Bộ kiểm định cú pháp (`txt-syntax-validator.ts`)**: Cho phép mở `[poem]` bên trong khối `[letter]` (vẫn cấm mở `poem` trong `poem`, cấm `letter` trong `poem`). Bắt lỗi thẻ `[poem]` chưa đóng bên trong `[letter]`, bắt lỗi đóng `[/letter]` khi `[poem]` chưa đóng.
    - **Trình bóc tách văn bản (`txt-parser.ts`)**: Chuyển đổi quản lý khối thẻ từ biến đơn sang ngăn xếp `blockStack: string[]`. Nhận diện và sinh mã HTML lồng nhau chuẩn XML `<div class="letter">\n<div class="poem">...</div>\n</div>` cũng như lồng 3 cấp `[letter-box] -> [letter] -> [poem]`. Hỗ trợ đầy đủ tiêu đề `@!`, `@@!`, trích dẫn `~` và dòng tác giả `>` bên trong bài thơ con lồng thư.
    - **Bảo vệ toàn vẹn HTML chương (`chapter-builder.ts`)**: Cải tiến thuật toán `protectSpecialBlocks` và vùng miễn nhiễm Dropcap sử dụng cơ chế duyệt cân bằng thẻ đóng-mở (balanced container depth matching) thay vì regex non-greedy đơn giản. Ngăn chặn triệt để hiện tượng ngắt khối sớm khiến các đoạn văn `<p>` sau bài thơ bị `mergeBrokenParagraphs` nối nhầm dòng hoặc bị tiêm dropcap sai lệch.
    - **Dịch ngược hai chiều EPUB sang TXT (`epub-to-txt.ts`)**: Nâng cấp bóc tách `<div class="letter">` sử dụng `replaceNestedDiv` kết hợp duyệt tuần tự các khối con (poem, blockquote, heading, figure, paragraph). Bảo toàn nguyên vẹn hai chiều 100% cho cấu trúc thơ lồng thư và thơ lồng hộp viền mà không làm mất định dạng ngắt dòng của thư.
    - **Định dạng hiển thị CSS (`quotes.css`)**: Tinh chỉnh khoảng cách lề `.letter .poem` và `.letter-box .poem` (`margin: 1.2em auto;`), đảm bảo bài thơ hiển thị trang nhã, căn giữa, in nghiêng mà không bị chạm vào viền kẻ xám bên trái của lá thư.
    - **Cập nhật Bảng tra cứu cú pháp (`EpubSyntaxModal.svelte`)**: Bổ sung ghi chú chi tiết về khả năng lồng cú pháp `[poem]` vào bên trong `[letter]` và `[letter-box]`.
    - **Mở rộng bộ kiểm thử tự động**: Bổ sung 10 unit tests mới bao phủ toàn diện mọi trường hợp (hợp lệ, lỗi cú pháp, lồng 3 cấp, bảo toàn round-trip hai chiều, dropcap immunity).
    - Toàn bộ **357/357 unit tests pass 100%**, **15/15 Playwright E2E browser tests pass 100%**, `pnpm check` 0 errors, `pnpm lint` 0 errors, `pnpm knip` 0 issues, production build hoàn tất.
  - **Tự động Cuộn đến Phông chữ Đang Chọn trong Dropdown (`FontSelect.svelte`)**:
    - Khi mở dropdown bộ chọn phông chữ, danh sách tự động tính toán và cuộn đến phông chữ đang được chọn (`aria-selected="true"`), căn giữa phông chữ trong tầm nhìn thay vì bị reset về vị trí đầu danh sách (vị trí 0).
    - Giúp người dùng dễ dàng thử liên tiếp các phông chữ kế cận mà không mất thời gian cuộn lại từ đầu.
    - Tự động cuộn về đầu danh sách khi gõ từ khóa tìm kiếm (`searchQuery`) và dọn sạch query khi đóng dropdown.
    - Bổ sung kịch bản kiểm thử tự động Playwright E2E xác thực phông chữ đang chọn luôn nằm trong khung nhìn (`toBeInViewport()`).
    - Toàn bộ **347/347 unit tests** và **15/15 Playwright E2E browser tests pass 100%**.
  - **Bổ sung 7 Phông chữ Mới & Khử Trùng lặp (New Heading Fonts & Duplicate Font Cleanup)**:
    - **Khử trùng lặp & Chuẩn hóa file phông chữ (`src/assets/fonts/`)**: Quét và đối chiếu toàn bộ binary qua mã băm MD5 và fontkit metadata; loại bỏ an toàn 3 file trùng lặp (`iCiel-Downtown.otf` trùng 100% với `BCDowntown.otf`, `Batangas-Bold.otf` thực chất là `SVN-Georgia-Bold.otf`, `BebasNeue.otf` trùng với `UTM-Bebas.ttf`). Giữ lại và tích hợp 7 phông chữ mới chất lượng cao: `DFVN-Takashimura-Bold.otf`, `DeBorstel-Brush.ttf`, `Font-Lourena-Viet-Hoa.ttf`, `MJ-GeometricSlab703BT-Medium.otf`, `SVN-Georgia-Bold.otf`, `SVN-Georgia-Regular.otf`, `UTM-Bebas.ttf`.
    - **Đồng bộ Metadata (`fonts-metadata.json`)**: Chạy script `generate-fonts-meta.js` trích xuất chính xác font family (`DFVN Takashimura Bold`, `LNTH-DeBorstel Brush Reduced`, `Lourena`, `MJ GeoSlab703 Md BT`, `SVN-Georgia`, `UTM Bebas`), nâng tổng số phông chữ hỗ trợ lên 40 font.
    - **Tự động hóa hiển thị & Đóng gói EPUB (`fonts.ts`, `FontSelect.svelte`, `EpubFontSettingsSection.svelte`)**: Các phông chữ mới tự động được nạp vào `AVAILABLE_FONTS` qua `import.meta.glob`, hiển thị trực quan trong bộ chọn Heading (H1, H2, H2 Sub, Dropcap) và Modal Jacket với live preview tiếng Việt, đồng thời nhúng trọn vẹn vào gói EPUB khi xuất bản.
    - Toàn bộ **347/347 unit tests pass 100%**, type check (0 err, 0 warn), build production thành công.
  - **Tách biệt Căn lề Độc lập cho Footer Trích dẫn (`>t`, `>p`, `>c`) & Bảo toàn Tính Kế thừa**:
    - **CSS căn lề độc lập (`quotes.css`)**: Tách `blockquote.* footer` ra khỏi nhóm căn lề chung; gán `text-align` trực tiếp lên `blockquote.center`, `blockquote.left`, `blockquote.right`; thiết lập `text-align: inherit` cho `blockquote footer` để tự động ăn theo căn lề của `~` khi không có hậu tố; bổ sung các luật độc lập với `!important` cho `footer.left`, `footer.right`, `footer.center`.
    - **Parser hỗ trợ hậu tố (`txt-parser.ts`)**: Cập nhật regex bắt `^>(t|p|c)?\s+(.+)`. Ánh xạ `>t` $\rightarrow$ `class="left"`, `>p` $\rightarrow$ `class="right"`, `>c` $\rightarrow$ `class="center"`, `>` $\rightarrow$ không gán class (kế thừa từ blockquote cha). Áp dụng đồng bộ cho cả khối ngoài lẫn bên trong `[letter]`, `[poem]`, và dòng tác giả đứng độc lập `standaloneAuthorMatch`.
    - **Dịch ngược 2 chiều bảo toàn căn lề (`epub-to-txt.ts`)**: Tự động nhận diện class của `footer` để dịch ngược thành `>t`, `>p`, `>c` hoặc `>` tương ứng.
    - **Cập nhật UI & Bảng quy ước (`EpubSyntaxModal.svelte`)**: Bổ sung hướng dẫn chi tiết về các hậu tố căn lề cho dòng tác giả `>`.
    - Toàn bộ **347/347 unit tests pass 100%**.
  - **Khắc phục lỗi nút tải ZIP rỗng khi lưu ra đĩa & Mở rộng E2E Test Suite cho PDF Splitter**:
    - **Sửa dứt điểm tải ZIP rỗng**: Loại bỏ việc gán `zipBlob = new Blob()` khi đã lưu ra đĩa (`savedToDisk: true`). Trả về `zipBlob: undefined` nếu không có phần nào trong RAM, đồng thời bổ sung chốt chặn `blob.size === 0` trong `triggerDownload` ngăn ngừa triệt để việc tải file rỗng 0 byte.
    - **Đồng bộ hóa trạng thái nút UI & Giải phóng hoàn toàn RAM**: Khi đã ghi thành công vào thư mục trên đĩa (`savedDirectoryName`), nút chuyển thành `"Đã lưu vào đĩa"` và bị vô hiệu hóa hoàn toàn (`disabled`), ngăn chặn tải file rỗng hoặc gây hiểu lầm cho người dùng.
    - **Dọn dẹp mã nguồn thừa & Ẩn khối FSA trên trình duyệt không hỗ trợ**: Đồng bộ sử dụng hằng số `DEFAULT_DPI` (200 DPI), loại bỏ biến `selectedDpi` dư thừa khỏi `PdfSplitterState`. Ẩn hoàn toàn thông báo kỹ thuật "Trình duyệt không hỗ trợ File System API" trên Safari/Firefox/Mobile để giao diện tinh gọn, tự nhiên cho người dùng thông thường. Bổ sung mẹo hướng dẫn tải từng phần an toàn trên các trình duyệt chặn download liên tiếp (Safari, Chrome).
    - **Mở rộng kiểm thử Playwright E2E cho PDF Splitter**: Bổ sung kịch bản kiểm thử E2E tự động hoàn chỉnh (`tests-e2e/pdf-workflow.spec.ts` gồm 3 workflows: Xem trước & Cắt lề, Tách trang & Tải ZIP thật không rỗng, Giả lập File System Access API ghi đĩa & Xác thực nút disabled).
    - Toàn bộ **344/344 unit tests** và **15/15 Playwright E2E browser tests** pass 100%.
  - **Tối ưu hóa Chuẩn OCR & Nâng cấp Chất lượng Tách trang PDF (PDF Splitter for OCR)**:
    - **Mặc định chuẩn 200 DPI**: Đặt mặc định 200 DPI ($scale \approx 2.778$, kích thước trang A4 đạt $\approx 1654 \times 2339$px) đồng nhất trên cả Desktop và Mobile/Touch device, đảm bảo độ phân giải sắc nét tối ưu cho Google Vision OCR và các công cụ OCR nhận diện chuẩn xác dấu tiếng Việt, chữ nhỏ.
    - **Cố định chuẩn 200 DPI**: Khóa cứng mặc định 200 DPI tối ưu cho OCR, loại bỏ hoàn toàn bộ chọn DPI thủ công trên UI để đảm bảo chất lượng xuất ảnh đồng nhất và đơn giản hóa giao diện.
    - **Tách biệt điều kiện Mobile với DPI**: Điều kiện `isMobileOrLowMemoryDevice()` chỉ dùng để giảm trần dung lượng phần ZIP (`40MB` thay vì `80MB`) nhằm bảo toàn RAM, tuyệt đối không ép giảm ngầm DPI chất lượng ảnh. Tinh chỉnh nhận diện mobile để không gán nhầm laptop màn hình cảm ứng thành thiết bị di động.
    - **Đệm số 0 tên file (`page0001.jpg`)**: Tự động đệm số 0 theo tổng số trang sách (`Math.max(4, String(totalDocPages).length)`), đảm bảo thứ tự từ điển (lexicographical order) luôn tuần tự chuẩn xác cho các script OCR (`page0001.jpg`, `page0002.jpg`, ..., `page0010.jpg`).
    - **Cơ chế Retry giữ chuẩn chất lượng & Minh bạch Trang giảm độ phân giải (`degradedPages`)**:
      - Khi trang gặp lỗi canvas/bộ nhớ, cơ chế thử lại chỉ hạ tỷ lệ scale, bảo toàn chất lượng nén ảnh JPEG tối thiểu 85% (`JPEG_QUALITY = 0.85`).
      - Tự động ghi nhận danh sách các trang phải giảm độ phân giải do giới hạn bộ nhớ/canvas (`degradedPages`) và hiển thị cảnh báo chi tiết trên giao diện hoàn tất kèm hướng dẫn tách lại độc lập dải trang nếu cần.
    - Toàn bộ **342/342 unit tests** và **12/12 Playwright E2E browser tests** pass 100%.
  - **Tối ưu hóa & Hoàn thiện toàn diện PDF Splitter & PDF.js Offline**:
    - **Thiết lập trần bộ nhớ cố định O(1) & Dynamic Byte Chunking**:
      - Phân tách phần ZIP theo dung lượng byte cộng dồn (`DEFAULT_DESKTOP_PART_BYTES = 80MB`, `DEFAULT_MOBILE_PART_BYTES = 40MB`, kèm trần an toàn 300 trang), khống chế hoàn toàn đỉnh RAM của JSZip heap độc lập với độ dài cuốn sách.
      - Tích hợp **File System Access API (`showDirectoryPicker`)** trên Chromium Desktop: cho phép chọn thư mục đích, stream ghi trực tiếp từng phần ZIP vào ổ đĩa và giải phóng Blob tức thì khỏi RAM, giúp bộ nhớ giữa các phần xấp xỉ bằng 0.
      - Bổ sung tùy chọn giải phóng bộ nhớ thủ công từng phần (`releasePartBlob`) cho Safari/iOS.
    - **Lựa chọn Dải trang & Cơ chế Graceful Retry tự hạ chất lượng**:
      - Bổ sung chọn dải trang xử lý ("Từ trang X đến Y"), cho phép người dùng chia nhỏ phiên làm việc hoặc tiếp tục xử lý khi phiên trước bị ngắt quãng.
      - Cơ chế Graceful Retry per-page: Khi một trang gặp lỗi render canvas hoặc `toBlob`, tự động thử lại 1 lần ở `scale 1.0` và giảm quality JPEG xuống 0.75; nếu vẫn lỗi, ghi nhận vào `failedPages` và tiếp tục các trang kế tiếp mà không làm hỏng toàn bộ sách.
      - Tự động hạ scale xuống 1.5x và `MAX_CANVAS_PIXELS = 8Mpx` trên thiết bị di động hoặc máy có RAM <= 4GB (`navigator.deviceMemory`).
    - **Khắc phục lỗi ngốn RAM (Mục 1)**: Loại bỏ việc nhân bản buffer `arrayBuffer.slice(0)`. Sử dụng Zero-Copy Streaming qua `URL.createObjectURL(file)` truyền trực tiếp cho `pdfjsLib.getDocument({ url })`. Loại bỏ `probeDoc` thừa, tái sử dụng 1 bản thể `PdfJsDocument` duy nhất xuyên suốt.
    - **Đồng bộ hóa 2 vị trí nạp PDF cũ**:
      - Cập nhật `renderPdfPageToBlob` trong [`src/lib/utils/pdf.ts`](src/lib/utils/pdf.ts) chấp nhận `File | Blob | ArrayBuffer | Uint8Array`, dùng zero-copy streaming, áp dụng viewport clamping và giải phóng bộ nhớ canvas.
      - Cập nhật trích xuất bìa PDF và ảnh minh họa trong [`src/lib/epub-packer/state/epub-images-state.svelte.ts`](src/lib/epub-packer/state/epub-images-state.svelte.ts), quản lý vòng đời Object URL và dọn dẹp sạch sẽ tránh rò rỉ bộ nhớ.
    - **Xử lý dứt điểm Web Worker**: Gỡ bỏ hoàn toàn module worker lỗi thời bên ngoài (`pdf-splitter.worker.ts`), giải phóng triệt để dead code. Tận dụng trực tiếp worker native nội bộ của PDF.js kết hợp vòng lặp render tuần tự cooperative trên luồng chính với `page.cleanup()` và `setTimeout(0)`, duy trì UI 60fps mượt mà, triệt tiêu đỉnh RAM và nguy cơ rò rỉ worker.
    - **Bảo vệ Canvas & Minh bạch lỗi**:
      - Tích hợp thuật toán tính toán kích thước co giãn thích ứng [`getClampedViewport`](src/lib/pdf-splitter/pdf-splitter.ts), khống chế kích thước tối đa `MAX_CANVAS_DIMENSION = 4096px` và `MAX_CANVAS_PIXELS = 16M pixels` chống tràn bộ nhớ và crash canvas trên Safari iOS / thiết bị di động.
      - Giải phóng ngay lập tức bộ nhớ GPU/backing store sau mỗi trang bằng `canvas.width = 0; canvas.height = 0`.
    - **100% Ngoại tuyến (Offline hoàn toàn)**:
      - Self-host toàn bộ `pdf.min.js` (313 KB) và `pdf.worker.min.js` (1.1 MB) nội bộ vào thư mục [`static/vendor/pdfjs/`](static/vendor/pdfjs/).
      - Cập nhật [`src/app.html`](src/app.html) tải cục bộ `/vendor/pdfjs/pdf.min.js` kèm fallback CDN an toàn.
      - Đồng bộ [`initPdfWorker`](src/lib/utils/pdf.ts) trỏ trực tiếp worker của PDF.js vào `/vendor/pdfjs/pdf.worker.min.js`.
    - Toàn bộ **340/340 unit tests** và **12/12 Playwright E2E browser tests** pass 100%.
  - **Khắc phục lỗi Phông chữ Trang giới thiệu khi chuyển tiếp Mẫu (Fix Jacket Modal Font Persistence Across Templates)**:
    - Sửa triệt để sự cố phông chữ chỉ đổi ở Mẫu 1 và không phản ánh khi chuyển tiếp sang Mẫu 2, Mẫu 3 bằng nút 'Tiếp' / 'Trước'.
    - Chuyển toàn bộ CSS override của jacket font ra thẻ `<style id="jacket-font-override">` trong `<svelte:head>`, đồng thời gán CSS variable `--jacket-font` trực tiếp lên `.preview-wrap` và quy tắc toàn cục `:global(.preview-wrap, .preview-wrap *) { font-family: var(--jacket-font, inherit) !important; }`. Loại bỏ hoàn toàn việc lồng thẻ `<style>` bên trong thẻ `<div>` dễ gây lỗi desync DOM giữa các khối `{@html}`.
    - Chuẩn hóa chuỗi font family: lọc bỏ chuỗi rỗng `""` tránh lỗi cú pháp CSS khiến browser discard toàn bộ thuộc tính `font-family`.
    - Sử dụng biến cờ `wasOpen` để chỉ khởi tạo chỉ mục template khi modal mở lần đầu, ngăn ngừa việc điều hướng hoặc chọn font làm reset chỉ mục về mẫu 1.
    - Toàn bộ **311/311 unit tests** và **12/12 Playwright E2E browser tests** pass 100%.
  - **Trực quan hóa Phông chữ Trực tiếp ngay tại Bộ chọn (Live Font Preview Dropdown for H1, H2, Dropcap & Jacket Modal)**:
    - Xây dựng component giao diện tái sử dụng cao cấp [`FontSelect.svelte`](src/lib/components/FontSelect.svelte) hỗ trợ cả chế độ chuẩn (`h-11.5`) và chế độ thu gọn `compact` (`h-9`) cho toolbar.
    - Áp dụng đồng bộ cho cả khu vực cấu hình phông chữ nội dung ([`EpubFontSettingsSection.svelte`](src/lib/epub-packer/components/EpubFontSettingsSection.svelte)) và thanh công cụ của Modal xem trước Jacket ([`EpubJacketModal.svelte`](src/lib/epub-packer/components/EpubJacketModal.svelte)).
    - Render trực quan mọi tên phông chữ trong danh sách bằng chính kiểu dáng typography thực tế của phông chữ đó (`font-family` động tương ứng với từng font nhúng), kèm đoạn text tiếng Việt xem trước ("Chương 1: Bình minh") để đánh giá độ tương thích dấu thanh tiếng Việt trước khi chọn.
    - Hiển thị tên phông chữ đã chọn trên nút trigger bằng chính font tương ứng khi đóng menu. Tích hợp thanh tìm kiếm font tức thì và hỗ trợ phím Escape / click outside để đóng menu mượt mà.
    - Bảo toàn thẻ `<select>` gốc ẩn (`sr-only`) đồng bộ 2 chiều (`bind:value`), duy trì khả năng truy cập (accessibility) và tương thích hoàn toàn với automation/E2E test suite.
    - Bổ sung kịch bản kiểm thử E2E tự động mở listbox, chọn font và xác minh giá trị cập nhật trên cả trigger lẫn hidden select cho cả H1 và Jacket Modal.
    - Toàn bộ **311/311 unit tests** và **12/12 Playwright E2E browser tests** pass 100%.
  - **Tối ưu hóa UI Trang giới thiệu (Jacket Template Naming & Font Selection)**:
    - Đơn giản hóa toàn bộ tên 10 mẫu trang lót trong `jacket-templates.ts` chỉ còn thuần túy `Mẫu 1`, `Mẫu 2`, ..., `Mẫu 10` (loại bỏ hoàn toàn các hậu tố mô tả như 'Bất đối xứng', 'Cột dọc'...).
    - Di dời input lựa chọn phông chữ trang giới thiệu (`#jacket-font-select`) khỏi trang chính `EpubMetadataSection.svelte`, chỉ đặt lựa chọn phông chữ bên trong Preview Modal (`EpubJacketModal.svelte`) kèm huy hiệu phông chữ hiển thị tinh tế trên giao diện chính khi đã chọn.
    - Cập nhật kịch bản kiểm thử tự động Playwright E2E xác thực quy trình chọn font trong modal, xác nhận loại bỏ input thừa trên trang chính và bảo toàn trạng thái lựa chọn font.
    - Toàn bộ **311/311 unit tests** và **12/12 Playwright E2E browser tests** pass 100%.
  - **Khắc phục triệt để Race Condition khi hủy tác vụ Worker & Bổ sung Full Fallback cho Image Background Removal**:
    - `txt-parser.ts` & `duplicate-detector.ts`: Quản lý các tác vụ worker đang chạy theo `requestId` thông qua Map trung tâm. Khi một tác vụ bị hủy qua `AbortSignal`, chỉ hủy tác vụ đó và chỉ terminate worker khi không còn tác vụ nào khác (`pendingJobs.size === 0`), giải quyết triệt để nguy cơ làm treo Promise của các tác vụ chạy song song.
    - `image-bg-remove-ml.ts`: Tự động phục hồi sang xử lý trên luồng chính (`processOrnamentOnMainThread`) khi `worker.postMessage` ném lỗi thay vì reject Promise.
    - Mở rộng bộ kiểm thử đạt **308/308 unit tests pass 100%**.
  - **Tự động tắt Dropcap & Chuẩn hóa cú pháp `@` / `@@` trong `[letter]` và `[poem]`**:
    - Trong khối `[letter]` và `[poem]`, mặc định tự động tắt Dropcap (không chèn Dropcap tự động ngay sau tiêu đề), chỉ áp dụng khi người dùng chủ động chỉ định bằng cú pháp `[c]`.
    - Bảo vệ các khối `<div class="letter">` và `<div class="poem">` trong `chapter-builder.ts` khỏi thuật toán tự động tiêm dropcap.
    - Trong khối `[letter]` và `[poem]`, chỉ có `@@!` và `@!` được chuyển đổi thành tiêu đề (`h1.no-toc` / `h2.no-toc`). Nếu gặp `@@` hoặc `@` (không có `!`), hệ thống không dừng build (không báo lỗi cú pháp) mà phát cảnh báo (`warning`) và giữ nguyên thành đoạn văn thông thường `<p>@...</p>`, `<p>@@...</p>`.
    - Toàn bộ **305/305 unit tests** và **12/12 Playwright E2E browser tests** pass 100%.
  - **Chuẩn hóa toàn diện vòng đời Web Worker & Chống rò rỉ listener (Worker Lifecycle & Leak Prevention)**:
    - Rà soát và hoàn thiện cơ chế đăng ký và gỡ listener trên 4 modules Web Worker: [`txt-parser.ts`](src/lib/epub-packer/parser/txt-parser.ts), [`duplicate-detector.ts`](src/lib/epub-editor/cleaner/duplicate-detector.ts), [`pdf-splitter.ts`](src/lib/pdf-splitter/pdf-splitter.ts) và [`image-bg-remove-ml.ts`](src/lib/utils/image-bg-remove-ml.ts).
    - Bổ sung listener `error` và `messageerror`, đảm bảo `cleanup()` gỡ sạch 100% listener khỏi worker và `AbortSignal`, ngăn chặn triệt để nguy cơ treo Promise khi worker crash hoặc gặp sự cố tuần tự hóa dữ liệu.
    - Bọc an toàn `postMessage` trong try-catch với cơ chế fallback tự động sang tính toán trực tiếp trên luồng chính.
    - Mở rộng bộ kiểm thử đạt **300/300 unit tests pass 100%**.
  - **Nâng cấp TypeScript lên Strict Mode toàn diện (`strict: true`)**:
    - Xử lý triệt để 47 lỗi strict type & nullability trên toàn bộ codebase: `epub-chapter-utils.ts`, `epub-single-grouper.ts`, `epub-zip-grouper.ts`, `txt-parser.ts`, `chapter-builder.ts`, `pdf-splitter.ts`, và `+layout.svelte`.
    - Chuẩn hóa hàm `ensureChapterOpen` trả về `RawChapterItem` để đảm bảo an toàn kiểu dữ liệu và loại bỏ hoàn toàn các lỗi `possibly 'null'`.
    - Kích hoạt `"strict": true` trong `tsconfig.json`. `pnpm check` (`svelte-check`) đạt 0 errors, 0 warnings.
  - Chuẩn hóa hệ thống tài liệu quy trình & giao diện: Khởi tạo [AI_WORKFLOW.md](AI_WORKFLOW.md) và [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md), tích hợp toàn bộ ma trận kiểm thử và cheat sheet từ `DEVELOPMENT_WORKFLOW.md` vào `AI_WORKFLOW.md`, tinh gọn tài liệu dự án.
  - Cải tiến tính năng biên tập theo yêu cầu đánh giá (Vấn đề 2, 3, 4, 5, 7):
    - **Vấn đề 2 & 5 (Placeholder 'Giới Thiệu' & TOC gộp)**: Khối `[new]` và `[new:center]` mặc định nhận tiêu đề `Giới Thiệu` thay vì trùng tên sách; khi có `@@` hoặc `@` bên trong thì ưu tiên tuyệt đối tiêu đề đó và tự động khử trùng lặp mục lục TOC trong `nav-builder`.
    - **Vấn đề 3 (Bí danh đóng `[/new:center]`)**: Thêm hỗ trợ thẻ đóng `[/new:center]` dành riêng cho khối `[new:center]`; chặn dùng `[/new:center]` cho khối `[new]` thường; cho phép `[/new]` đóng được cả hai.
    - **Vấn đề 4 (Tắt auto-dropcap trên trang căn giữa)**: Tắt tự động dropcap chữ cái đầu đoạn trên các trang `hasCenterPage` (`[new:center]` như trang đề tặng), giữ dropcap thủ công bằng `[c]` theo chủ đích người dùng.
    - **Vấn đề 7 (Hỗ trợ `@@!`)**: Hỗ trợ cú pháp tiêu đề lớn `@@!` áp dụng kiểu dáng `h1.main-chap` (kèm class `no-toc` ẩn khỏi mục lục) trong cùng trang hiện tại mà không tách chương độc lập như thẻ `@@`. Cho phép dùng `@@!` bên trong `[letter-box]` an toàn.
  - Sửa toàn bộ 5 lỗi kiểm định & render trong nhóm 'NHOM 1' từ `review.md`:
    - **Mục 1 (Case-insensitive tags)**: Đồng bộ parser nhận diện không phân biệt hoa/thường cho tất cả các thẻ `[NEW]`, `[/NEW]`, `[NEW:CENTER]`, `[LETTER-BOX]`, `[/LETTER-BOX]`, `[POEM]`, `[LETTER]`, tránh rò rỉ nguyên văn tên thẻ ra sách.
    - **Mục 2 (Chặn `@@` vỡ layout trong `[letter-box]`)**: Validator chặn tiêu đề phân chương `@@` nằm bên trong `[letter-box]` khi không có wrapper `[new]`, bảo vệ cấu trúc XHTML chương.
    - **Mục 3 (Tránh dropcap lồng đôi)**: `chapter-builder` kiểm tra thêm `has-dropcap` và thẻ `dropcap` có sẵn từ cú pháp `[c]`, không tự động bọc thêm `dropcap` thứ hai ngay sau tiêu đề.
    - **Mục 4 (Cảnh báo `Chú thích:` lạc chỗ)**: Validator phát hiện và cảnh báo rõ ràng nếu sau dòng `Chú thích:` còn xuất hiện cú pháp `@@` hoặc `[new]`.
    - **Mục 5 (Gom thông báo lỗi validator)**: `parseTxtToChapters` gom toàn bộ danh sách lỗi kiểm định cú pháp phân cách bằng xuống dòng thay vì chỉ ném lỗi đầu tiên.
  - Dọn dẹp các thư mục rác / build artifact tạm thời an toàn (`coverage/`, `test-results/`, `.wrangler/`) và cấu hình `.gitignore` chặn thư mục `coverage/`.
  - Hỗ trợ cặp thẻ bao khối mới **`[letter-box]` $\leftrightarrow$ `[/letter-box]`**:
    - Tạo wrapper hộp có đường viền bo quanh (`<div class="letter-box">`) với CSS chuyên dụng (`quotes.css`), thụt lề chuẩn và ngắt trang linh hoạt (`box-decoration-break: clone`).
    - Hoạt động như một wrapper đa năng: cho phép lồng các thẻ tiêu đề (`@@t`, `@p`), trích dẫn (`~ quote`, `> author`), khối thư (`[letter] ... [/letter]`), chú thích chân trang (`{n}`) và định dạng inline.
    - Miễn nhiễm với cơ chế ghép nối đoạn tự động (`mergeBrokenParagraphs`), giữ nguyên 100% cấu trúc dòng của người dùng.
    - Cập nhật hệ thống kiểm định **TXT Syntax Pre-flight Validator**: bắt lỗi thẻ `[letter-box]` chưa đóng, cấm mở `[new]` bên trong `[letter-box]`, cho phép `[new]` hoặc `[new:center]` bọc bên ngoài `[letter-box]`.
    - Loại trừ `letter-box` khỏi nhận diện thẻ ảnh minh họa `isIllustrationTag`.
    - Hỗ trợ cơ chế dịch ngược **EPUB to TXT** (`htmlToCleanText` & `replaceNestedDiv`), nhận diện chính xác thẻ `<div>` lồng nhau.
    - Bổ sung hướng dẫn cú pháp vào bảng tra cứu `EpubSyntaxModal.svelte`.
    - Bộ kiểm thử mở rộng đạt 300/300 unit tests pass và 12/12 Playwright E2E tests pass.
  - Khắc phục lỗi CI/CD E2E trong test Playwright (`tests-e2e/epub-download-inspection.spec.ts` & `tests-e2e/epub-workflow.spec.ts`).
  - Khắc phục triệt để lỗi CI/CD Prettier format trên GitHub Actions: chuẩn hóa sinh metadata font (`scripts/generate-fonts-meta.js` dùng tab và newline chuẩn `.prettierrc`).
  - Nâng cấp [AI_WORKFLOW.md](AI_WORKFLOW.md) chốt chặn kiểm tra bắt buộc trước khi commit/push: yêu cầu chạy `pnpm format:check`, `pnpm check`, `pnpm lint`, `pnpm test`, `pnpm knip`, `pnpm build`, và `pnpm test:e2e` đồng bộ hoàn toàn với GitHub Actions `ci.yml`.
  - Khắc phục triệt để lỗi `knip` (`oxc-parser` cấp phát 6 GiB buffer) bằng `KNIP_DISABLE_RAW_TRANSFER=1`, đưa `pnpm knip` về trạng thái pass 100% không còn nợ kỹ thuật.
  - Hoàn tất khắc phục các điểm từ bản đánh giá lại `review.md`:
    - Khắc phục triệt để lỗi buffer detachment khi Worker fallback trong EPUB Cleaner (`duplicate-detector.ts`): chuyển sang cơ chế Lazy Fallback Loader nạp lại byte tươi nguyên từ ZIP thay vì dùng buffer detached.
    - Chuẩn hóa kiểm thử Web Worker Concurrency và Fallback trong `tests/epub-cleaner.test.ts` với `AsyncDuplicateWorkerMock` và mock `window`.
    - Hoàn thiện cơ chế tự phục hồi xử lý ảnh ML: bao phủ sự cố `worker.onerror`, `worker.onmessageerror` và response lỗi với `cleanupWorkerAndFallbackPending`, tự động hủy các tác vụ đã bị abort.
  - Hoàn tất tính năng xem trước Jacket: Tích hợp dropdown phông chữ trực tiếp vào Modal xem trước trang giới thiệu (`EpubJacketModal.svelte`), phản chiếu tức thì (real-time font reflection) lên khung preview và đồng bộ 2 chiều với cấu hình Jacket Font.
  - Bổ sung bộ chọn phông chữ riêng cho **"Font cho H2 Sub"** (`h2SubFont`), hỗ trợ quy tắc CSS `h2 + h2, .side-chap + .side-chap` để các tiêu đề H2 phụ liền kề (không có thẻ `<p>` xen giữa) tự động áp dụng phông chữ riêng biệt so với H2 chính.
  - Tái thiết kế bố cục phần cấu hình phông chữ (`EpubFontSettingsSection.svelte`) thành 2 cột dọc responsive (`grid-cols-1 lg:grid-cols-2`): Cột 1 gồm 4 bộ chọn phông (H1, H2, H2 Sub, Dropcap) và Cột 2 là khung Preview chương mẫu thời gian thực.
  - Tinh chỉnh logic nhận diện H2 & H2 Sub: Chỉ thẻ H2 đi ngay sau H1 (`h1 + h2`) mới được tính là Main H2 (nhận font H2). Tất cả các trường hợp H2 còn lại (đứng sau `<p>`, đứng sau H2 khác `h2 + h2`, hoặc đứng đầu chương không có H1) đều tự động nhận font H2 Sub.
  - **Tối ưu hóa Phân loại Phông chữ H2 & H2 Sub với Hoa văn Xen giữa (`<ornamenth1> h1 <ornamenth2> h2`)**:
    - Chuẩn hóa hàm `classifyChapterHeadings` trong `chapter-builder.ts`: Thuật toán kiểm tra tính liền kề `isAdjacent` tự động loại bỏ các khối hoa văn (`<div class="chapter-ornament">`, `<div class="subchapter-ornament">`) và thẻ ảnh hoa văn khi xét quan hệ giữa các tiêu đề.
    - Đảm bảo trường hợp `<ornamenth1> h1 <ornamenth2> h2` thì thẻ `h2` luôn được tính là **Main H2** (nhận `h2Font`) thay vì bị nhầm thành `h2SubFont`.
    - Bảo toàn quy tắc `H2 + H2` (kể cả có `<subchapter-ornament>` xen giữa) thì H2 đầu tiên là Main H2, H2 tiếp theo là H2 Sub (`h2-sub`).
    - Bổ sung các unit test bao phủ toàn diện cho trường hợp có hoa văn đầu chương và phân đoạn xen kẽ.
    - Bổ sung unit tests cho trường hợp khối trích dẫn có tối đa 3 footer liền mạch, trích dẫn bị ngắt bởi dòng trống và dịch ngược EPUB to TXT.
    - Mở rộng bộ kiểm thử đạt **321/321 unit tests pass** và **12/12 Playwright E2E browser tests pass 100%**.
- Cập nhật lần cuối: 2026-10-25 18:05
- Đang dở: Không
- Biết trước còn thiếu / nợ kỹ thuật: Không

---

## Changelog

### 2026-11-25 (Tinh gọn Thẻ Sửa file EPUB Trang chủ & Header TXT → PDF CJK)

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

### 2026-11-25 (Xóa bỏ Husky, Bổ sung Sơ đồ Kiến trúc Thư mục & Cập nhật Toàn diện Tài liệu Dự án)

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

### 2026-11-25 (Dọn dẹp Codebase: Xóa Module Mồ côi src/lib/epub, Chuyển fontkit sang devDependencies, Dọn dẹp Snapshot Lịch sử)

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

### 2026-11-24 (Tối ưu Hài hòa Header Sidebar & Logo Ebook Forge)

- Thêm/sửa:
  - `src/routes/+layout.svelte`:
    - Gỡ bỏ khung icon sách 40x40px và chữ phụ `Desk` tại header Sidebar và Header Mobile, giữ lại thương hiệu wordmark `Ebook Forge` tối giản, hiện đại.
    - Tinh chỉnh nút `<` thu gọn khi mở rộng nằm gọn gàng bên phải tiêu đề, và nút `>` mở rộng khi thu gọn sidebar đạt kích thước chuẩn 44x44px (`w-11 h-11 rounded-xl mx-auto`), thẳng hàng dọc tuyệt đối với các icon bên dưới.
- Kết quả pipeline: format ✅ | lint ✅ | type check (0 err, 0 warn) ✅ | test unit ✅ (367/367 pass) | knip ✅ (0 issues) | graphify: Rebuilt 4914 nodes, 10563 edges, 283 communities
- File chính bị ảnh hưởng:
  - `src/routes/+layout.svelte`
  - `README.md`

### 2026-11-24 (Gỡ bỏ Huy hiệu "Xử lý ngay trên máy bạn" trên Toàn bộ Tiêu đề Trang)

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

### 2026-11-24 (Tinh gọn Trang Tổng quan — Gỡ bỏ Badge ngoại tuyến, Chip tính năng và Khối gợi ý sách quét)

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

### 2026-11-24 (Tinh gọn & Hài hòa Giao diện Bước 3 Bìa và Hoa văn)

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

### 2026-11-24 (Chuẩn hóa Unicode NFC & Trích xuất Tiêu đề, Metadata Thông minh từ TXT)

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

### 2026-11-24 (Tối ưu Font-Stack Tiếng Việt & Khử lỗi Font Input/Placeholder)

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

### 2026-11-24 (Tinh gọn Carousel Jacket & Chuẩn hóa Phông mặc định Bookerly)

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

### 2026-11-24 (Bố cục Packer Mockup A, Đồng bộ Token Ok, SVG Icons & Chuẩn hóa Tài liệu)

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

### 2026-11-23 (Hoàn thiện giao diện chi tiết: PDF Splitter, Jacket Selector, Suggestion Flow & Token Ok)

- Thêm/sửa:
  - Trang `PDF → JPG` (`src/routes/pdf/+page.svelte`): Loại bỏ ~20 vị trí dùng `font-mono` ở các nhãn và nút ("10 trang", "20 trang", "Tải ảnh xem trước", "‹ Trước", "Sau ›", "Mặc định (Không cắt)"), bỏ uppercase trên nhãn "Header (px)" và "Footer (px)"; cập nhật toàn bộ nút điều chỉnh và ô số sang viền `border-field-border`, nền `bg-panel-2`, chiều cao 40–44px chuẩn mockup.
  - Tinh giảm `font-mono` trên các modal:
    - `EpubCleanerModal.svelte`: Chuyển nhãn thống kê ("Tổng dung lượng", "Ảnh không dùng", "Font không dùng", "Có thể giảm", "Tùy chọn dọn dẹp") sang `font-sans`, bỏ uppercase; chỉ giữ font-mono cho số liệu và đường dẫn file.
    - `EpubJacketModal.svelte`: Chuyển toàn bộ tiêu đề, nhãn mẫu, phông chữ và các nút sang `font-sans`, cao 40px viền `field-border`.
    - `EpubSyntaxModal.svelte`: Bảng quy ước và nút Đồng ý chuyển sang `font-sans`, chỉ giữ font-mono trong thẻ `<code>`.
    - `EpubEditorModal.svelte`, `EpubEditorSidebar.svelte`, `EpubMetadataModal.svelte`: Chuyển nút toggle files và tiêu đề sang `font-sans`.
  - Bước Thông tin sách (`EpubMetadataSection.svelte`): Thêm hàng thẻ chọn mẫu jacket trực quan (Mẫu 1–4 + Thẻ "Xem cả 10 mẫu →" kích hoạt modal), đổi nút "Xem trước & Tùy biến" sang nút phụ viền mảnh `border-field-border`.
  - Khối "Quy trình gợi ý cho sách quét" (`src/routes/+page.svelte`): Gỡ bỏ badge "Nội bộ/Bên ngoài" và dòng footer "Mở… →"; giữ giao diện thanh thoát với "Bước N", tiêu đề và 1 dòng mô tả; bổ sung mũi tên nối liền giữa các ô trên desktop.
  - Bỏ uppercase ở các tiêu đề nhóm trên trang chủ ("Bắt đầu với", "Quy trình gợi ý cho sách quét", "Công cụ lẻ & Mở rộng"); đổi dòng phụ "Desk" logo sidebar sang `font-sans`.
  - Chuẩn hóa Button và Token:
    - Bổ sung `size="lg"` (h-12) vào `Button.svelte`, thay thế cách ghi đè `[&>button]:!h-12` tại packer summary column.
    - Bỏ huy hiệu "Chế bản chính" trên thẻ Đóng gói EPUB.
    - Đồng bộ màu huy hiệu "Xử lý 100% ngoại tuyến" sang token `bg-ok/10 text-ok border-ok/20`.
  - Bảo toàn 100% logic: 0 file `.ts` bị ảnh hưởng trong `src/` (chỉ sửa các component `.svelte`).
- Kết quả pipeline: format ✅ | lint ✅ | type check (0 err, 0 warn) ✅ | test unit ✅ (350/350 pass) | knip ✅ (0 issues) | build production ✅
- File chính bị ảnh hưởng:
  - `src/lib/components/Button.svelte`
  - `src/lib/components/PageHeader.svelte`
  - `src/routes/pdf/+page.svelte`
  - `src/lib/epub-packer/components/EpubMetadataSection.svelte`
  - `src/lib/epub-packer/components/EpubJacketModal.svelte`
  - `src/lib/epub-packer/components/EpubSyntaxModal.svelte`
  - `src/lib/epub-editor/components/EpubCleanerModal.svelte`
  - `src/lib/epub-editor/components/EpubEditorModal.svelte`
  - `src/lib/epub-editor/components/EpubEditorSidebar.svelte`
  - `src/lib/epub-editor/components/EpubMetadataModal.svelte`
  - `src/routes/+layout.svelte`
  - `src/routes/+page.svelte`
  - `src/routes/epub-packer/+page.svelte`
  - `README.md`

### 2026-11-23 (Sửa lỗi vỡ layout trên Mobile View & Tối ưu Responsive Drawer/Cards)

- Thêm/sửa:
  - Khắc phục lỗi vỡ drawer navigation menu trên điện thoại (`+layout.svelte`): Khi người dùng đang ở các route công cụ, trạng thái `isCollapsed` kích hoạt khiến các nút tab bị gán nhầm kích thước `w-11` (44px) trên mobile trong khi nhãn chữ vẫn hiển thị; đã chuyển `w-11`, `justify-center`, `p-0`, `mx-auto` sang phạm vi `md:` để mobile drawer luôn hiển thị trọn vẹn icon và text label.
  - Phục hồi hiển thị tiêu đề các nhóm công cụ ("Tạo và tinh chỉnh", "Tiền xử lý", "Mở rộng") trên mobile drawer, sửa căn chỉnh header logo.
  - Thay thế `w-screen` thành `w-full max-w-full` chống giật và tràn ngang trên mobile; giảm padding container chính từ `p-6` xuống `p-4 sm:p-6 md:p-10` tối ưu diện tích hiển thị.
  - Cải tiến thanh điều hướng 5 bước tại `epub-packer/+page.svelte` trên di động thành dải cuộn ngang mượt mà (`flex overflow-x-auto min-w-max sm:min-w-0`), tránh tình trạng 5 bước bị chia thành 3 dòng cụt lủn với bước 5 lẻ loi.
  - Tối ưu hóa padding của các thẻ card `modern-card` trên toàn bộ section packer (`EpubCoverSection`, `EpubSourceSection`, `EpubOrnamentsSection`, `EpubIllustrationsSection`, `EpubMetadataSection`, `EpubFontSettingsSection`, `EpubPackSection`), các trang `pdf`, `epub-to-txt`, `txt-to-pdf`, `epub-editor` và modal về mức `p-5 sm:p-7`, các nút cắt lề `px-2.5 sm:px-3.5` chống tràn giao diện trên màn hình nhỏ.
  - Tuyệt đối bảo toàn 100% logic và không can thiệp vào bất kỳ file `.ts` nào trong `src/` (0 file `.ts` bị ảnh hưởng).
- Kết quả pipeline: format ✅ | lint ✅ | type check (0 err, 0 warn) ✅ | test unit ✅ (350/350 pass) | knip ✅ (0 issues) | build production ✅ | graphify ✅ (4884 nodes, 10359 edges)
- File chính bị ảnh hưởng:
  - `src/routes/+layout.svelte`
  - `src/routes/epub-packer/+page.svelte`
  - `src/lib/epub-packer/components/EpubSourceSection.svelte`
  - `src/lib/epub-packer/components/EpubCoverSection.svelte`
  - `src/lib/epub-packer/components/EpubOrnamentsSection.svelte`
  - `src/lib/epub-packer/components/EpubIllustrationsSection.svelte`
  - `src/lib/epub-packer/components/EpubMetadataSection.svelte`
  - `src/lib/epub-packer/components/EpubFontSettingsSection.svelte`
  - `src/lib/epub-packer/components/EpubPackSection.svelte`
  - `src/routes/epub-editor/+page.svelte`
  - `src/lib/epub-editor/components/EpubValidatorModal.svelte`
  - `src/lib/epub-editor/components/EpubCleanerModal.svelte`
  - `src/lib/epub-editor/components/EpubMetadataModal.svelte`
  - `src/routes/pdf/+page.svelte`
  - `src/routes/epub-to-txt/+page.svelte`
  - `src/routes/txt-to-pdf/+page.svelte`
  - `README.md`

### 2026-11-23 (Làm mới giao diện UI: Packer Sections, Slender Steps, Overview, Sidebar & SVG Icons)

- Thêm/sửa:
  - Nâng cấp đồng bộ giao diện người dùng theo thứ tự yêu cầu:
    1. Làm mới các section packer (`EpubSourceSection`, `EpubCoverSection`, `EpubOrnamentsSection`, `EpubIllustrationsSection`, `EpubMetadataSection`, `EpubPackSection`): bỏ font-mono/uppercase ở nhãn/tiêu đề; ô nhập dùng `bg-panel-2 border-field-border h-11`; nút cắt lề bìa cao 40px viền `field-border`.
    2. Đổi thanh 5 bước ở `epub-packer` sang kiểu thanh mảnh (vạch nối + vòng tròn số/dấu ✓ + tên + 1 dòng phụ), bỏ badge và viền thẻ.
    3. Cập nhật `PageHeader`: thêm breadcrumb và huy hiệu "Xử lý ngay trên máy bạn" dạng prop tùy chọn.
    4. Cập nhật Trang Tổng quan: thêm khối "Quy trình gợi ý" (OCR ngoài viền nét đứt), thêm chip tính năng vào 2 thẻ lớn, đổi "Công cụ lẻ" sang lưới 2 cột không cắt mô tả.
    5. Sidebar thu gọn: tối ưu bố cục logo và nút thu/mở ở trạng thái 72px xếp dọc, không bị chèn ép.
    6. Cột tóm tắt: định dạng danh sách nhãn–giá trị 13–14px, nút Đóng gói cao 48px (`h-12`), tiêu đề font-sans không uppercase.
    7. Thay thế toàn bộ emoji bằng SVG stroke trong editor modals, pdf, txt-to-pdf, các section packer; giảm font-mono tại các modal và trang pdf.
  - Tuyệt đối không thay đổi logic xử lý hay bất kỳ file `.ts` nào trong `src/` (0 file `.ts` bị ảnh hưởng).
- Kết quả pipeline: format ✅ | lint ✅ | type check (0 err, 0 warn) ✅ | test unit ✅ (350/350 pass) | knip ✅ (0 issues) | build production ✅ | graphify ✅ (4882 nodes, 10357 edges)
- File chính bị ảnh hưởng:
  - `src/lib/components/PageHeader.svelte`
  - `src/routes/epub-packer/+page.svelte`
  - `src/routes/+page.svelte`
  - `src/routes/+layout.svelte`
  - `src/lib/epub-packer/components/EpubSourceSection.svelte`
  - `src/lib/epub-packer/components/EpubCoverSection.svelte`
  - `src/lib/epub-packer/components/EpubOrnamentsSection.svelte`
  - `src/lib/epub-packer/components/EpubIllustrationsSection.svelte`
  - `src/lib/epub-packer/components/EpubMetadataSection.svelte`
  - `src/lib/epub-packer/components/EpubPackSection.svelte`
  - `src/lib/epub-editor/components/EpubValidatorModal.svelte`
  - `src/lib/epub-editor/components/EpubCleanerModal.svelte`
  - `src/lib/epub-editor/components/EpubEditorModal.svelte`
  - `src/lib/epub-editor/components/EpubEditorSidebar.svelte`
  - `src/lib/epub-editor/components/EpubEditorCodePane.svelte`
  - `src/lib/epub-editor/components/EpubEditorPreviewPane.svelte`
  - `src/lib/epub-editor/components/EpubMetadataModal.svelte`
  - `src/routes/epub-editor/+page.svelte`
  - `src/routes/pdf/+page.svelte`
  - `src/routes/epub-to-txt/+page.svelte`
  - `src/routes/txt-to-pdf/+page.svelte`
  - `README.md`

### 2026-11-23 (Chuẩn hóa viết hoa nhãn File & Dọn dẹp Layout)

- Thêm/sửa:
  - Viết hoa đầu câu/tiêu đề/nhãn cho "File": `File xuất` (epub-packer), `File PDF dung lượng lớn`, `File tải về:` (pdf), `File EPUB đạt chuẩn kiểm định!` (EpubValidatorModal), `File EPUB không chứa file nào hợp lệ.` (epub-editor-state), `File "${filePath}"...` (structure-rules), `File OPF...` (epub-reader-parser), `File TXT` (txt-parser).
  - Loại bỏ thẻ `div` rỗng mồ côi trong `src/routes/+layout.svelte` sau khi gỡ bỏ version badge.
- Kết quả pipeline: format ✅ | lint ✅ | type check (0 err, 0 warn) ✅ | test unit ✅ (350/350 pass) | knip ✅ (0 issues) | build production ✅
- File chính bị ảnh hưởng:
  - `src/routes/+layout.svelte`
  - `src/routes/epub-packer/+page.svelte`
  - `src/routes/pdf/+page.svelte`
  - `src/lib/epub-editor/components/EpubValidatorModal.svelte`
  - `src/lib/epub-editor/epub-editor-state.svelte.ts`
  - `src/lib/epub-editor/validator/structure-rules.ts`
  - `src/lib/epub/parser/epub-reader-parser.ts`
  - `src/lib/epub-packer/parser/txt-parser.ts`
  - `README.md`

### 2026-11-23 (Sửa lỗi suggestCanonicalClasses Tailwind & Gỡ bỏ tính năng Markdown Fixer)

- Thêm/sửa:
  - Thay thế toàn bộ các lớp arbitrary brackets không chuẩn của Tailwind bằng canonical utility tokens theo chẩn đoán của `suggestCanonicalClasses`: `h-dvh`, `w-67.5`, `w-18`, `w-58`, `h-14`, `max-w-55`, `max-w-27.5`, `min-w-50`, `min-w-40`, `min-w-42.5`, `min-h-19`, `wrap-break-word`, `text-sm`, `sm:text-3xl`, đồng thời loại bỏ xung đột lớp `h-screen h-dvh` tại `+layout.svelte`.
  - Gỡ bỏ hoàn toàn tính năng Markdown Fixer: xóa `src/routes/md/`, `src/lib/markdown-fixer/`, `src/lib/types/markdown-fixer.type.ts`, `tests/markdown-fixer.test.ts`, loại bỏ các mục liên quan trong sidebar, trang tổng quan và e2e specs.
  - Tối ưu sơ đồ quy trình gợi ý tại trang chủ thành 4 bước trực quan.
- Kết quả pipeline: format ✅ | lint ✅ | type check (0 err, 0 warn) ✅ | test unit ✅ (350/350 pass) | knip ✅ (0 issues) | e2e ✅ (14/14 browser workflows pass) | graphify ✅
- File chính bị ảnh hưởng:
  - `src/routes/+layout.svelte`
  - `src/routes/+page.svelte`
  - `src/routes/epub-packer/+page.svelte`
  - `src/routes/epub-editor/+page.svelte`
  - `src/lib/components/PageHeader.svelte`
  - `src/lib/epub-packer/components/EpubMetadataSection.svelte`
  - `src/lib/epub-packer/components/EpubSourceSection.svelte`
  - `src/lib/epub-editor/components/EpubEditorModal.svelte`
  - `src/lib/epub-editor/components/EpubMetadataModal.svelte`
  - `src/lib/types/index.ts`
  - `tests/real-world-workflows.test.ts`
  - `tests-e2e/epub-workflow.spec.ts`
  - `tests-e2e/epub-download-inspection.spec.ts`
  - `README.md`
  - `AI_WORKFLOW.md`

### 2026-11-23 (Giai đoạn 6: Áp Dụng Phong Cách Mới Lên Các Công Cụ Còn Lại)

- Thêm/sửa: Triển khai Giai đoạn 6 theo `UI_DIRECTION.md`:
  - `src/routes/epub-editor/+page.svelte` & modal components: Thay thế emoji ở các nút Thông tin, Kiểm định, Dọn rác EPUB, Mở trình chỉnh sửa bằng icon SVG stroke inline (Lucide style) trên nền nút phụ chuẩn `h-11`, bo góc `rounded-2xl` và màu Solarized chuẩn.
  - `src/routes/pdf/+page.svelte`: Thay emoji bằng icon SVG stroke, chuẩn hóa tiêu đề và các nút thao tác.
  - `src/routes/md/+page.svelte`: Chuẩn hóa tiêu đề, thẻ `modern-card`, bảo toàn logic xử lý Markdown.
  - `src/routes/epub-to-txt/+page.svelte`: Nâng cấp giao diện với tiêu đề và thanh tiến trình Solarized.
  - `src/routes/txt-to-pdf/+page.svelte`: Thay toàn bộ 9 emoji minh họa tính năng và tải xuống bằng hệ thống icon SVG stroke chuyên nghiệp.
- Kết quả pipeline: format ✅ | lint ✅ | type check (0 err, 0 warn) ✅ | test unit ✅ (361/361 pass) | knip ✅ (0 issues) | e2e ✅ (15/15 browser workflows pass)
- File chính bị ảnh hưởng:
  - `src/routes/epub-editor/+page.svelte`
  - `src/lib/epub-editor/components/EpubMetadataModal.svelte`
  - `src/lib/epub-editor/components/EpubValidatorModal.svelte`
  - `src/lib/epub-editor/components/EpubCleanerModal.svelte`
  - `src/routes/pdf/+page.svelte`
  - `src/routes/md/+page.svelte`
  - `src/routes/epub-to-txt/+page.svelte`
  - `src/routes/txt-to-pdf/+page.svelte`
  - `README.md`

### 2026-11-23 (Giai đoạn 5: Trang Đóng gói EPUB — Thanh 5 Bước & Cột Tóm Tắt Cố Định)

- Thêm/sửa: Triển khai Giai đoạn 5 theo `UI_DIRECTION.md`:
  - `src/routes/epub-packer/+page.svelte`: Tái cấu trúc thành giao diện chia 5 bước (1: Nguồn, 2: Thông tin, 3: Bìa và hoa văn, 4: Phông chữ, 5: Đóng gói) với thanh bước danh sách `<ol>` có `aria-current="step"` và trạng thái động.
  - Sử dụng cơ chế `class="hidden"` thay vì `{#if}` unmount để giữ nguyên vẹn 100% state cục bộ, preview blob URL và listener của tất cả 7 section components.
  - Xây dựng Cột tóm tắt sách (Persistent Summary Column) cố định bên phải (sticky trên desktop, tự xuống dưới ở mobile), luôn hiển thị ảnh bìa, siêu dữ liệu sách và 2 nút hành động chính "Đóng gói file EPUB" và "Tải file .EPUB" mà không cần cuộn trang.
  - Nâng cấp `EpubFontSettingsSection.svelte` với nền giấy màu kem `#fbf8ef`, `EpubCoverSection.svelte` với các nút căn lề 40px, chuẩn hóa các tiêu đề section bằng font Inter.
  - Cập nhật ca kiểm thử `tests-e2e/epub-workflow.spec.ts` hỗ trợ chuyển đổi giữa các bước tab wizard theo đúng quy định tại Section 1 Điều 3 `UI_DIRECTION.md`.
- Kết quả pipeline: format ✅ | lint ✅ | type check (0 err, 0 warn) ✅ | test unit ✅ (361/361 pass) | knip ✅ (0 issues) | e2e ✅ (15/15 browser workflows pass)
- File chính bị ảnh hưởng:
  - `src/routes/epub-packer/+page.svelte`
  - `src/lib/epub-packer/components/EpubSourceSection.svelte`
  - `src/lib/epub-packer/components/EpubMetadataSection.svelte`
  - `src/lib/epub-packer/components/EpubCoverSection.svelte`
  - `src/lib/epub-packer/components/EpubOrnamentsSection.svelte`
  - `src/lib/epub-packer/components/EpubIllustrationsSection.svelte`
  - `src/lib/epub-packer/components/EpubFontSettingsSection.svelte`
  - `src/lib/epub-packer/components/EpubPackSection.svelte`
  - `tests-e2e/epub-workflow.spec.ts`
  - `README.md`

### 2026-11-23 (Giai đoạn 4: Tái Cấu Trúc Trang Tổng Quan Bàn Làm Việc)

- Thêm/sửa: Triển khai Giai đoạn 4 theo `UI_DIRECTION.md`:
  - `src/routes/+page.svelte`: Thiết kế lại trang Tổng quan với tiêu đề Bàn làm việc, huy hiệu "file không rời khỏi máy bạn", 2 thẻ lớn bắt đầu nhanh với chips tính năng, sơ đồ 5 bước quy trình gợi ý cho sách quét, và danh sách thẻ ngang công cụ lẻ.
  - Bảo toàn 100% các đường dẫn liên kết (`href`) và khả năng điều hướng.
- Kết quả pipeline: format ✅ | lint ✅ | type check (0 err, 0 warn) ✅ | test unit ✅ (361/361 pass) | knip ✅ (0 issues) | e2e ✅ (15/15 browser workflows pass)
- File chính bị ảnh hưởng:
  - `src/routes/+page.svelte`
  - `README.md`

### 2026-11-23 (Giai đoạn 3: Khung Ứng Dụng & Sidebar Tự Thu Gọn 72px)

- Thêm/sửa: Triển khai Giai đoạn 3 theo `UI_DIRECTION.md`:
  - `src/routes/+layout.svelte`: Hỗ trợ 2 trạng thái sidebar desktop: mở rộng 232px ở trang chủ, tự động thu gọn 72px khi vào các công cụ. Bổ sung nút chuyển đổi thu gọn/mở rộng lưu tùy chọn vào `localStorage ('sidebar-collapsed')`. Thay thế emoji bằng hệ thống icon SVG stroke inline (Lucide style).
  - Phân nhóm điều hướng theo chuẩn mới: Tổng quan, Tạo & tinh chỉnh (Packer, Editor), Tiền xử lý (PDF, MD Fixer, EPUB to TXT), Mở rộng (TXT to PDF CJK).
  - Bảo toàn 100% drawer mobile `< md` và chức năng toggle theme Solarized.
- Kết quả pipeline: format ✅ | lint ✅ | type check (0 err, 0 warn) ✅ | test unit ✅ (361/361 pass) | knip ✅ (0 issues) | e2e ✅ (15/15 browser workflows pass)
- File chính bị ảnh hưởng:
  - `src/routes/+layout.svelte`
  - `src/lib/components/Input.svelte`
  - `README.md`

### 2026-11-23 (Giai đoạn 2: Chuẩn hóa Thành phần Dùng chung Button, Input, DropZone, PageHeader, FontSelect)

- Thêm/sửa: Triển khai Giai đoạn 2 theo `UI_DIRECTION.md`:
  - `src/lib/components/Button.svelte`: Chuẩn hóa chiều cao 44px (`h-11`), bo `rounded-xl`, chữ Inter 15px font-semibold/font-medium, hỗ trợ variant `secondary` (viền `field-border`), primary dùng `bg-accent-color text-on-accent`, disabled opacity 70%.
  - `src/lib/components/Input.svelte`: Chiều cao 44px (`h-11`), bo `rounded-[10px]`, viền `field-border`, nền `panel-2`, nhãn Inter 13px font-semibold không uppercase.
  - `src/lib/components/DropZone.svelte`: Bo `rounded-2xl`, bổ sung icon SVG upload stroke inline, bảo toàn 100% `input[type="file"]` và hành vi kéo-thả.
  - `src/lib/components/PageHeader.svelte`: Tiêu đề Inter 700 28–30px, mô tả `text-text-mute` dễ đọc.
  - `src/lib/components/FontSelect.svelte`: Chiều cao 52px chuẩn, 2 dòng thông tin (tên font và typography preview), nhãn 13px font-semibold, dropdown `rounded-2xl`, bảo toàn 100% id/aria selectors và chức năng cuộn tự động.
- Kết quả pipeline: format ✅ | lint ✅ | type check (0 err, 0 warn) ✅ | test unit ✅ (361/361 pass) | knip ✅ (0 issues) | e2e ✅ (15/15 browser workflows pass)
- File chính bị ảnh hưởng:
  - `src/lib/components/Button.svelte`
  - `src/lib/components/Input.svelte`
  - `src/lib/components/DropZone.svelte`
  - `src/lib/components/PageHeader.svelte`
  - `src/lib/components/FontSelect.svelte`
  - `README.md`

### 2026-11-23 (Giai đoạn 1: Nâng cấp Token màu Solarized & Typography Inter WCAG AA)

- Thêm/sửa: Triển khai Giai đoạn 1 làm mới giao diện theo `UI_DIRECTION.md`:
  - `src/routes/layout.css`: Cập nhật bảng màu Solarized đạt chuẩn tương phản cao (WCAG AA ≥ 4.5:1 đối với text và ≥ 3:1 đối với viền input). Bổ sung các biến CSS theme: `--color-field-border`, `--color-on-accent`, `--color-ok`. Tinh chỉnh `.modern-card` bo góc `rounded-2xl` và hiệu ứng hover tinh tế.
  - `DESIGN_SYSTEM.md`: Đồng bộ tài liệu quy chuẩn thiết kế, bảng ánh xạ Tailwind v4, quy chuẩn typography Inter cho toàn bộ UI và button variants.
- Kết quả pipeline: format ✅ | lint ✅ | type check (0 err, 0 warn) ✅ | test unit ✅ (361/361 pass) | knip ✅ (0 issues) | e2e ✅ (15/15 browser workflows pass)
- File chính bị ảnh hưởng:
  - `src/routes/layout.css`
  - `DESIGN_SYSTEM.md`
  - `README.md`

### 2026-11-18 (Khử số chú thích trong TOC & Loại bỏ trang không tiêu đề khỏi Mục lục & Preview UI)

- Thêm/sửa: Chuẩn hóa bóc tách mục lục TOC cho các file TXT đóng gói EPUB:
  - `txt-parser.ts`: Thêm hàm `stripFootnoteRefs`, loại bỏ khối thẻ chú thích footnote `<a class="noteref"...>...</a>`, `<sup>...</sup>` và `{n}` khỏi `titlePlain`. Ngăn chặn việc số chú thích bị dính liền vào tên chương khi dùng `@@ Tiêu đề{n}`. Đồng thời chỉ đánh dấu `hasCustomTitle = true` cho `@` khi không có cờ `isNoToc`.
  - `nav-builder.ts`: Khử bỏ chú thích footnote trong `innerContent` trước khi tạo `plainText` cho `headings`. Đối với các chương không có heading (`headings.length === 0`), kiểm tra `isGeneratedTitle` (`hasCustomTitle === false` hoặc `title === 'Giới Thiệu'`) để không đưa vào TOC, triệt tiêu hoàn toàn việc chèn các trang không tên, trang `[new]`/`[new:center]` không heading hoặc tên file fallback (`MTL Gop`) vào mục lục. Bổ sung fallback an toàn đảm bảo luôn có ít nhất 1 mục TOC khi tài liệu hoàn toàn không có tiêu đề nào.
  - `EpubSourceSection.svelte`: Đồng bộ danh sách hiển thị xem trước tab "Đầu mục tìm thấy" bằng `$derived.by tocChapters`, lọc bỏ các trang phụ/trang tiếp nối không tên để preview khớp chính xác 1:1 với mục lục trong sách EPUB hoàn thiện.
  - Bổ sung 4 unit tests mới bao phủ: khử số chú thích trong TOC, không đưa `[new]` không heading vào TOC, và quy trình thực tế với trang căn giữa `[new:center]` kèm trang nội dung tiếp nối không có heading.
- Kết quả pipeline: format ✅ | lint ✅ | type check (0 err, 0 warn) ✅ | test unit ✅ (361/361 pass) | knip ✅ (0 issues) | graphify ✅ (4877 nodes, 10536 edges, 283 communities)
- File chính bị ảnh hưởng:
  - `src/lib/epub-packer/parser/txt-parser.ts`
  - `src/lib/epub-packer/xml-builders/nav-builder.ts`
  - `src/lib/epub-packer/components/EpubSourceSection.svelte`
  - `tests/epub-parser.test.ts`
  - `tests/epub-packer.test.ts`
  - `README.md`

### 2026-11-06 (Dọn dẹp comment phân mục trong các file mẫu CSS template)

- Thêm/sửa: Tìm và xóa toàn bộ các dòng comment phân mục dạng `/* ===== ... ===== */` trong các file CSS template (`quotes.css`, `cover.css`, `ornaments.css`), giúp mã nguồn CSS thành phẩm trong sách EPUB tinh gọn, chuyên nghiệp và giảm thiểu dung lượng dư thừa.
- Kết quả pipeline: format ✅ | lint ✅ | type check (0 err, 0 warn) ✅ | test unit ✅ (357/357 pass) | knip ✅ | stylelint ✅ (0 warnings) | graphify ✅ (4861 nodes, 10377 edges, 256 communities)
- File chính bị ảnh hưởng:
  - `src/lib/epub-packer/templates/css-template/quotes.css`
  - `src/lib/epub-packer/templates/css-template/cover.css`
  - `src/lib/epub-packer/templates/css-template/ornaments.css`
  - `README.md`

### 2026-11-06 (Chuẩn hóa thứ tự Selector trong quotes.css sửa lỗi Stylelint no-descending-specificity)

- Thêm/sửa: Sắp xếp lại cấu trúc file `quotes.css` theo nguyên tắc tăng dần độ đặc hiệu (specificity): đặt các bộ chọn đơn (`.poem`, `.poem p`, `.letter-box p`, căn lề `blockquote.* p`, tiêu đề `h1/h2 + p`, `:first-child`, `:last-child`) lên trước, sau đó mới đến các bộ chọn lồng ghép nhiều cấp (`.letter .poem`, `.letter-box .poem`, `.letter .poem:first-child`, `.letter-box .poem:first-child`, `.letter .poem:last-child`, `.letter-box .poem:last-child`, `.letter .poem p`, `.letter-box .poem p`). Khắc phục triệt để 20 cảnh báo Stylelint `no-descending-specificity` khi kiểm định file EPUB thành phẩm.
- Kết quả pipeline: format ✅ | lint ✅ | type check (0 err, 0 warn) ✅ | test unit ✅ (357/357 pass) | knip ✅ | stylelint ✅ (0 warnings) | graphify ✅ (4861 nodes, 10377 edges, 256 communities)
- File chính bị ảnh hưởng:
  - `src/lib/epub-packer/templates/css-template/quotes.css`
  - `README.md`

### 2026-11-06 (Cân đối đối xứng khoảng cách trên/dưới cho border-left của [letter] và [letter-box])

- Thêm/sửa: Điều chỉnh kiểu dáng `.letter` (`padding: 0.5em 1.2em;`), bổ sung các quy tắc `:first-child` (`.letter p:first-child, .letter-box p:first-child { padding-top: 0; }` và `.letter .poem:first-child, .letter-box .poem:first-child { margin-top: 0; }`) trong `quotes.css`. Khắc phục triệt để hiện tượng viền xám `border-left` bị lệch (mép trên 0.8em so với mép dưới 0.3em), mang lại tỉ lệ hiển thị cân xứng chuẩn 0.5em cả hai đầu.
- Kết quả pipeline: format ✅ | lint ✅ | type check (0 err, 0 warn) ✅ | test unit ✅ (357/357 pass) | knip ✅ | graphify ✅ (4861 nodes, 10377 edges, 256 communities)
- File chính bị ảnh hưởng:
  - `src/lib/epub-packer/templates/css-template/quotes.css`
  - `README.md`

### 2026-11-06 (Triệt tiêu margin cho thẻ p của poem lồng trong letter và letter-box)

- Thêm/sửa: Bổ sung quy tắc CSS `.letter .poem p, .letter-box .poem p { margin: 0; }` trong `quotes.css` nhằm ngăn chặn bộ chọn con cháu `.letter p` và `.letter-box p` áp đặt `margin-bottom: 0.8em` lên các dòng thơ nằm bên trong lá thư/hộp viền, giúp khoảng cách giữa các câu thơ luôn sít sao và đồng đều đúng theo quy cách của thơ.
- Kết quả pipeline: format ✅ | lint ✅ | type check (0 err, 0 warn) ✅ | test unit ✅ (357/357 pass) | knip ✅ | graphify ✅ (4861 nodes, 10377 edges, 256 communities)
- File chính bị ảnh hưởng:
  - `src/lib/epub-packer/templates/css-template/quotes.css`
  - `README.md`

### 2026-11-06 (Nested Tags Support: [poem] inside [letter] and [letter-box])

- Thêm/sửa: Hỗ trợ cú pháp lồng thẻ bài thơ `[poem] ... [/poem]` vào bên trong khối thư `[letter] ... [/letter]` và hộp viền `[letter-box] ... [/letter-box]`:
  - `txt-syntax-validator.ts`: Cho phép `[poem]` được mở an toàn bên trong `[letter]`, kiểm soát chặt chẽ thứ tự đóng mở thẻ.
  - `txt-parser.ts`: Chuyển sang mô hình ngăn xếp `blockStack`, hỗ trợ bóc tách và sinh thẻ `<div>` lồng nhau đa cấp (`letter` $\rightarrow$ `poem`, `letter-box` $\rightarrow$ `letter` $\rightarrow$ `poem`).
  - `chapter-builder.ts`: Nâng cấp thuật toán bảo vệ khối `mergeBrokenParagraphs` và vùng miễn nhiễm Dropcap bằng balanced tag depth matching.
  - `epub-to-txt.ts`: Chuyển `letter` sang `replaceNestedDiv` với bộ bóc tách phần tử con theo thứ tự tài liệu, bảo toàn round-trip 100%.
  - `quotes.css` & `EpubSyntaxModal.svelte`: Căn chỉnh lề CSS `.letter .poem` và cập nhật tài liệu bảng tra cứu.
  - Bổ sung 10 unit tests mới nâng tổng số lên 357 tests.
- Kết quả pipeline: format ✅ | lint ✅ | type ✅ (0 err, 0 warn) | test ✅ (357/357 pass) | test e2e ✅ (15/15 pass) | knip ✅ (0 issues) | build production ✅ | graphify: [4871 nodes, 10522 edges, 285 communities]
- File chính bị ảnh hưởng:
  - `src/lib/epub-packer/parser/txt-syntax-validator.ts`
  - `src/lib/epub-packer/parser/txt-parser.ts`
  - `src/lib/epub-packer/xml-builders/chapter-builder.ts`
  - `src/lib/epub-to-txt/epub-to-txt.ts`
  - `src/lib/epub-packer/templates/css-template/quotes.css`
  - `src/lib/epub-packer/components/EpubSyntaxModal.svelte`
  - `tests/epub-parser.test.ts`
  - `tests/epub-packer.test.ts`
  - `tests/epub-to-txt.test.ts`
  - `README.md`

### 2026-11-03 (Dropdown Auto-Scroll to Active Font & 7 New Typography Fonts)

- Thêm/sửa: Cải tiến trải nghiệm chọn phông chữ và tích hợp phông chữ mới:
  - **Tự động cuộn đến phông chữ đang chọn (`FontSelect.svelte`)**: Khi mở dropdown bộ chọn phông chữ, danh sách tự động cuộn đến phông chữ hiện tại thay vì bị reset về vị trí số 0, giúp việc duyệt và thử liên tiếp các phông chữ kế cận thuận tiện, tiết kiệm thời gian. Tự động reset cuộn khi tìm kiếm.
  - **Khử trùng lặp & tích hợp 7 font mới**: Khử trùng lặp 3 font thừa (`iCiel-Downtown.otf`, `Batangas-Bold.otf`, `BebasNeue.otf`), tích hợp 7 font mới (`DFVN-Takashimura-Bold.otf`, `DeBorstel-Brush.ttf`, `Font-Lourena-Viet-Hoa.ttf`, `MJ-GeometricSlab703BT-Medium.otf`, `SVN-Georgia-Bold.otf`, `SVN-Georgia-Regular.otf`, `UTM-Bebas.ttf`), nâng tổng số lên 40 font.
  - Cập nhật `src/assets/fonts-metadata.json` qua `scripts/generate-fonts-meta.js`.
  - Mở rộng kiểm thử E2E (`tests-e2e/epub-workflow.spec.ts`) xác thực khả năng tự động cuộn giữ tầm nhìn (`toBeInViewport()`) và chuẩn hóa bộ chọn `UTM_Akashi`.
- Kết quả pipeline: format ✅ | lint ✅ | type ✅ (0 err, 0 warn) | test ✅ (347/347 pass) | test e2e ✅ (15/15 pass) | knip ✅ (0 issues) | build production ✅ | graphify: [4868 nodes, 10512 edges, 266 communities]
- File chính bị ảnh hưởng:
  - `src/lib/components/FontSelect.svelte`
  - `src/assets/fonts/*`
  - `src/assets/fonts-metadata.json`
  - `tests-e2e/epub-workflow.spec.ts`
  - `README.md`

### 2026-10-27 (Independent Alignment for Blockquote Footers: >t, >p, >c & Calibre CSS Specificity Fix)

- Thêm/sửa: Hỗ trợ căn lề độc lập cho thẻ footer trích dẫn (`>t`, `>p`, `>c`) tách biệt khỏi căn lề khối `~`, đồng thời bảo toàn tính kế thừa tự động khi dùng `>` thuần túy, và chuẩn hóa thứ tự độ đặc hiệu CSS (CSS Specificity) theo kiểm định Calibre / Stylelint:
  - **CSS Căn lề & Thứ tự Đặc hiệu (`quotes.css`)**: Gán `text-align` lên `blockquote.center`, `blockquote.left`, `blockquote.right` và `text-align: inherit` cho `blockquote footer`; bổ sung `footer.left, blockquote footer.left`, `footer.right, blockquote footer.right`, `footer.center, blockquote footer.center` theo đúng thứ tự tăng dần độ đặc hiệu; di chuyển `.letter-box p:last-child` về nhóm `:last-child` ở cuối file, loại bỏ hoàn toàn 9 lỗi `no-descending-specificity` từ Calibre Check Book.
  - **Parser (`txt-parser.ts`)**: Mở rộng regex nhận diện `^>(t|p|c)?\s+(.+)` sinh thẻ `<footer class="...">` cho `>t`, `>p`, `>c` hoặc `<footer>` kế thừa cho `>`.
  - **Reverse Parser (`epub-to-txt.ts`)**: Tự động nhận diện class căn lề trên `footer` khi dịch ngược EPUB sang TXT.
  - **UI Quy ước (`EpubSyntaxModal.svelte`)**: Cập nhật mô tả cú pháp `>t`, `>p`, `>c`.
- Kết quả pipeline: format ✅ | lint ✅ | type ✅ (0 err, 0 warn) | test ✅ (347/347 pass) | knip ✅ (0 issues) | graphify: [4866 nodes, 10510 edges, 323 communities, không có god node hay circular dependency mới]
- File chính bị ảnh hưởng:
  - `src/lib/epub-packer/templates/css-template/quotes.css`
  - `src/lib/epub-packer/parser/txt-parser.ts`
  - `src/lib/epub-to-txt/epub-to-txt.ts`
  - `src/lib/epub-packer/components/EpubSyntaxModal.svelte`
  - `tests/epub-parser.test.ts`
  - `tests/epub-to-txt.test.ts`

### 2026-10-26 (PDF Splitter Disk Stream Zero-byte Fix, UI Button State Sync & Playwright E2E Coverage)

- Thêm/sửa: Sửa triệt để lỗi nút "Đã lưu vào đĩa" tải ZIP 0-byte, dọn dẹp state và mở rộng E2E test suite:
  - **Sửa lỗi tải ZIP rỗng (`pdf-splitter.ts` & `download.ts`)**: `processPdfToJpg` trả về `zipBlob: undefined` khi toàn bộ các phần đã lưu trực tiếp ra đĩa (loại bỏ fallback `?? new Blob()` tạo đối tượng 0-byte). Bổ sung điều kiện `blob.size === 0` trong `triggerDownload` để không bao giờ kích hoạt tải file rỗng.
  - **Vô hiệu hóa nút khi đã lưu đĩa (`+page.svelte` & `pdf-splitter-state.svelte.ts`)**: Thêm thuộc tính derived `isSavedToDisk` và `canDownloadZip`. Nút hiển thị `"Đã lưu vào đĩa"` và tự động vô hiệu hóa (`disabled`) khi đã lưu xong vào thư mục trên đĩa.
  - **Hướng dẫn cho trình duyệt chặn tải liên tiếp**: Thêm lưu ý gợi ý tải từng phần riêng biệt cho Safari và Chrome khi tài liệu gồm nhiều phần.
  - **Dọn dẹp code thừa**: Loại bỏ `selectedDpi` dư thừa khỏi `PdfSplitterState`, đồng bộ hằng số `DEFAULT_DPI` từ thư viện.
  - **Playwright E2E Tests (`tests-e2e/pdf-workflow.spec.ts`)**: Bổ sung 3 kịch bản kiểm thử trình duyệt thực tế bao phủ toàn diện luồng PDF Splitter (Preview & Crop, Process & Tải ZIP hợp lệ, và Luồng ghi ra đĩa với mock File System Access API xác nhận nút disabled).
- Kết quả pipeline: format:check ✅ | lint ✅ | type check (0 err, 0 warn) ✅ | test unit ✅ (344/344 pass) | knip ✅ (0 issues) | build production ✅ | test e2e ✅ (15/15 pass) | graphify ✅ (4863 nodes, 10501 edges, 266 communities)
- File chính bị ảnh hưởng:
  - `src/lib/types/pdf-splitter.type.ts`
  - `src/lib/pdf-splitter/pdf-splitter.ts`
  - `src/lib/pdf-splitter/pdf-splitter-state.svelte.ts`
  - `src/lib/utils/download.ts`
  - `src/routes/pdf/+page.svelte`
  - `tests/pdf-splitter.test.ts`
  - `tests/helpers.test.ts`
  - `tests-e2e/pdf-workflow.spec.ts`
  - `README.md`

### 2026-10-25 (PDF Splitter OCR Optimization: 200 DPI Default, Zero-padded Filenames & Degraded Quality Tracking)

- Thêm/sửa: Chuẩn hóa tính năng tách trang PDF phục vụ nhận diện quang học OCR:
  - **Mặc định chuẩn 200 DPI**: Thiết lập mặc định 200 DPI ($scale \approx 2.778$, A4 $\approx 1654 \times 2339$px) đồng nhất trên mọi thiết bị (desktop lẫn mobile), đảm bảo độ nét và kích thước ký tự đủ lớn cho Vision OCR phân tích chính xác dấu tiếng Việt.
  - **Khóa cố định 200 DPI**: Loại bỏ bộ chọn DPI trên UI, khóa cứng chuẩn 200 DPI cho toàn bộ tiến trình để đơn giản hóa giao diện và ngăn người dùng vô tình chọn độ phân giải thấp gây lỗi nhận diện OCR.
  - **Đệm số 0 tên file (`page0001.jpg`)**: Đệm số 0 tự động theo số trang sách (`Math.max(4, String(totalDocPages).length)`), đảm bảo các script xử lý OCR tự động duyệt file theo thứ tự từ điển không bị đảo trang (tránh `page1, page10, page2`).
  - **Tách biệt điều kiện Mobile với DPI**: Điều kiện thiết bị di động/RAM thấp chỉ áp dụng để chia nhỏ phần ZIP (40MB/phần) nhằm kiểm soát RAM, không hạ ngầm DPI. Khắc phục việc laptop màn hình cảm ứng bị nhận diện nhầm thành điện thoại.
  - **Bảo toàn chất lượng khi thử lại & Minh bạch danh sách trang giảm độ phân giải**:
    - Khi trang gặp lỗi canvas và phải retry ở scale thấp hơn, giữ nguyên chất lượng nén JPEG tối thiểu 85% (`JPEG_QUALITY = 0.85`).
    - Ghi nhận danh sách `degradedPages` và hiển thị cảnh báo trực quan trên giao diện khi hoàn tất kèm danh sách số trang cụ thể.
- Kết quả pipeline: format:check ✅ | lint ✅ | type check (0 err, 0 warn) ✅ | test unit ✅ (342/342 pass) | knip ✅ (0 issues) | build production ✅ | test e2e ✅ (12/12 pass) | graphify ✅ (4860 nodes, 10494 edges, 271 communities)
- File chính bị ảnh hưởng:
  - `src/lib/types/pdf-splitter.type.ts`
  - `src/lib/pdf-splitter/pdf-splitter.ts`
  - `src/lib/pdf-splitter/pdf-splitter-state.svelte.ts`
  - `src/routes/pdf/+page.svelte`
  - `tests/pdf-splitter.test.ts`
  - `README.md`

### 2026-10-25 (PDF Memory Ceiling Hardening: Dynamic Byte Chunking, File System Access API & Page Range)

- Thêm/sửa: Triển khai toàn diện trần bộ nhớ cố định O(1), cơ chế stream trực tiếp ra đĩa và xử lý linh hoạt theo dải trang:
  - **Dynamic Byte Chunking (80MB desktop / 40MB mobile)**:
    - `src/lib/pdf-splitter/pdf-splitter.ts`: Chuyển điều kiện chia phần ZIP từ số trang cố định sang kiểm soát dung lượng cộng dồn `currentPartBytes >= maxPartBytes` (80MB desktop / 40MB mobile) kết hợp trần an toàn 300 trang. Đảm bảo đỉnh heap JSZip được giới hạn cố định $\le 160$MB trên desktop và $\le 80$MB trên mobile, triệt tiêu nguy cơ sập tab trên thiết bị yếu dù sách scan nặng hàng trăm trang.
  - **File System Access API (Stream ghi trực tiếp ra ổ đĩa & giải phóng RAM)**:
    - Tích hợp `window.showDirectoryPicker()` trên Chromium Desktop (`src/lib/pdf-splitter/pdf-splitter-state.svelte.ts` & `src/routes/pdf/+page.svelte`): người dùng chọn thư mục lưu trữ một lần trước khi bắt đầu. Mỗi phần ZIP được stream ghi thẳng vào file trên ổ đĩa và hủy ngay tham chiếu `Blob` khỏi RAM, đưa bộ nhớ đệm tích lũy giữa các phần về mức xấp xỉ 0.
    - Với Safari/iOS: Giữ `Blob` trong RAM và bổ sung nút giải phóng bộ nhớ thủ công từng phần (`releasePartBlob`) sau khi người dùng tải xong.
  - **Lựa chọn Dải trang & Graceful Retry per-page**:
    - Giao diện `src/routes/pdf/+page.svelte`: Bổ sung ô nhập dải trang xử lý ("Từ trang X đến trang Y") cho phép người dùng chia nhỏ hoặc tiếp tục xử lý cuốn sách từ vị trí bị gián đoạn mà không phải chạy lại từ đầu.
    - Cơ chế Graceful Retry: Nếu một trang vẽ canvas hoặc `toBlob` bị lỗi ở scale chuẩn, hệ thống tự động thử lại 1 lần ở `scale 1.0` (quality 0.75). Nếu vẫn lỗi, trang đó được đưa vào danh sách `failedPages` và tiến trình tiếp tục các trang tiếp theo thay vì làm hỏng toàn bộ sách.
    - Tự động hạ scale xuống 1.5x và `MAX_CANVAS_PIXELS = 8Mpx` trên thiết bị di động hoặc máy có RAM $\le$ 4GB (`navigator.deviceMemory`).
  - **Kiểm thử**: Mở rộng thêm 2 unit test suites mới cho dynamic byte chunking, dải trang, graceful retry và stream ghi ra đĩa với mock `FileSystemDirectoryHandle`.
- Kết quả pipeline: format:check ✅ | lint ✅ | type check (0 err, 0 warn) ✅ | test unit ✅ (340/340 pass) | knip ✅ (0 issues) | build production ✅ | test e2e ✅ (12/12 pass) | graphify ✅ (4861 nodes, 10489 edges, 267 communities)
- File chính bị ảnh hưởng:
  - `src/lib/types/pdf-splitter.type.ts`
  - `src/lib/utils/pdf.ts`
  - `src/lib/pdf-splitter/pdf-splitter.ts`
  - `src/lib/pdf-splitter/pdf-splitter-state.svelte.ts`
  - `src/routes/pdf/+page.svelte`
  - `tests/pdf-splitter.test.ts`
  - `README.md`

### 2026-10-25 (PDF Smart Split ZIP, Mobile Guard & Full Zero-Copy Synchronization)

- Thêm/sửa: Khắc phục triệt để vấn đề JSZip ngốn RAM khi nén hàng trăm trang PDF scan, bổ sung cảnh báo thiết bị di động và đồng bộ hóa Zero-Copy trên toàn bộ codebase:
  - **Đồng bộ hóa các vị trí nạp PDF cũ (`epub-images-state.svelte.ts` & `src/lib/utils/pdf.ts`)**:
    - `src/lib/utils/pdf.ts`: Cập nhật `renderPdfPageToBlob` chấp nhận `File | Blob | ArrayBuffer | Uint8Array`. Với `Blob`/`File`, truyền trực tiếp qua `URL.createObjectURL(pdfInput)` (zero-copy streaming) thay vì sao chép toàn bộ file vào mảng RAM; tự động thu hồi bằng `URL.revokeObjectURL(url)` trong `finally`.
    - Tích hợp `getClampedViewport(page, scale)` khống chế tối đa `4096px` / `16MP`, và giải phóng bộ nhớ texture/GPU ngay lập tức bằng `canvas.width = 0; canvas.height = 0`.
    - `src/lib/epub-packer/state/epub-images-state.svelte.ts`:
      - Trích xuất ảnh bìa PDF (`handleCoverFile`): Thay thế mã render thủ công bằng `renderPdfPageToBlob(file, 1, 2.0, 0.9)`, sử dụng Object URL thay vì chuỗi base64 khổng lồ, tự động thu hồi URL trong `removeCoverFile` và `resetCoverCrop`.
      - Trích xuất ảnh minh họa PDF (`handleIllustrationFiles`): Loại bỏ `file.arrayBuffer()`, truyền trực tiếp `file` hoặc `zip.files[name].async('blob')` cho `renderPdfPageToBlob`.
  - **Smart Split ZIP (Khắc phục JSZip gom hết ảnh trong RAM)**:
    - `src/lib/types/pdf-splitter.type.ts`: Bổ sung interface `PdfZipPart` và mở rộng `ProcessPdfResult` gồm `zipBlob: Blob` (tương thích ngược) và `zipParts: PdfZipPart[]`.
    - `src/lib/pdf-splitter/pdf-splitter.ts`: Thiết lập giới hạn `MAX_PAGES_PER_ZIP_PART = 200`. Khi file có nhiều trang (>200 trang), tiến trình tự động đóng gói từng phần ZIP độc lập và tái tạo `currentZip = new JSZip()`, giải phóng toàn bộ ảnh JPEG của phần trước khỏi heap JavaScript, khống chế đỉnh RAM dưới 100MB cho tài liệu scan hàng trăm trang.
  - **Cảnh báo thiết bị di động & Giao diện tải đa phần (UI/UX)**:
    - `src/lib/pdf-splitter/pdf-splitter-state.svelte.ts`: Bổ sung `pdfZipParts`, `pagesPerPart`, `isLargeFile`, `isMobile`, `hasMultipleParts`, cùng phương thức `downloadPart(index)` và `downloadAllParts()`.
    - `src/routes/pdf/+page.svelte`: Bổ sung banner cảnh báo file PDF lớn / thiết bị di động theo phong cách Solarized Glassmorphism, và hiển thị giao diện tải từng phần ZIP hoặc tải toàn bộ liên tiếp khi sách được chia thành nhiều phần.
  - **Kiểm thử**: Bổ sung unit tests cho multi-part ZIP splitting, `renderPdfPageToBlob` (zero-copy streaming & error handling), `PdfSplitterState` (download helpers & large-file detection) và trích xuất bìa PDF.
- Kết quả pipeline: format:check ✅ | lint ✅ | type check (0 err, 0 warn) ✅ | test unit ✅ (338/338 pass) | knip ✅ (0 issues) | build production ✅ | test e2e ✅ (12/12 pass) | graphify ✅ (4845 nodes, 10458 edges, 276 communities)
- File chính bị ảnh hưởng:
  - `src/lib/types/pdf-splitter.type.ts`
  - `src/lib/utils/pdf.ts`
  - `src/lib/pdf-splitter/pdf-splitter.ts`
  - `src/lib/pdf-splitter/pdf-splitter-state.svelte.ts`
  - `src/lib/epub-packer/state/epub-images-state.svelte.ts`
  - `src/routes/pdf/+page.svelte`
  - `tests/pdf-splitter.test.ts`
  - `tests/image-bg-remove.test.ts`
  - `README.md`

### 2026-10-25 (PDF Splitter Full Hardening: Zero-Copy, Canvas Guard, 100% Offline)

- Thêm/sửa: Khắc phục toàn diện 4 vấn đề kỹ thuật cốt lõi trong bộ tách trang PDF và thư viện PDF.js:
  - **Mục 1 & 2 (Khắc phục ngốn RAM & Xử lý dứt điểm Web Worker)**:
    - `src/lib/pdf-splitter/pdf-splitter.ts`: Loại bỏ hoàn toàn việc nhân bản buffer `arrayBuffer.slice(0)` trên mỗi luồng. Helper `openPdfDocument` sử dụng `URL.createObjectURL(file)` truyền trực tiếp cho `pdfjsLib.getDocument({ url })` đọc dữ liệu dạng streaming theo range requests từ đĩa/blob thay vì giữ toàn bộ buffer 1GB trong heap JavaScript.
    - Xóa bỏ việc tạo `probeDoc` thừa, khởi tạo và tái sử dụng 1 bản thể `PdfJsDocument` duy nhất xuyên suốt.
    - Chuyển sang vòng lặp render tuần tự từng trang trên main thread với `page.cleanup()` và `await new Promise(r => setTimeout(r, 0))` sau mỗi trang, đảm bảo đỉnh RAM tối thiểu và UI luôn đạt 60fps mượt mà.
    - Gỡ bỏ hoàn toàn file `src/lib/pdf-splitter/pdf-splitter.worker.ts` lỗi thời, loại trừ lỗi WHATWG spec `importScripts` trong module worker và triệt tiêu nguy cơ rò rỉ worker.
  - **Mục 3 (Bảo vệ Canvas & Minh bạch lỗi)**:
    - `src/lib/pdf-splitter/pdf-splitter.ts`: Tích hợp hàm tính toán tỉ lệ thích ứng `getClampedViewport`, tự động giới hạn `MAX_CANVAS_DIMENSION = 4096px` và `MAX_CANVAS_PIXELS = 16M pixels`, ngăn chặn việc tràn bộ nhớ hoặc crash canvas trên Safari iOS / thiết bị di động khi gặp trang scan khổ lớn.
    - Giải phóng lập tức bộ nhớ texture/GPU bằng `canvas.width = 0; canvas.height = 0` sau khi hoàn tất render / crop / toBlob mỗi trang.
    - Minh bạch lỗi: Ném ngoại lệ chi tiết khi `canvas.toBlob` trả về `null` hoặc không khởi tạo được context 2D, chấm dứt hoàn toàn tình trạng âm thầm bỏ qua trang lỗi khiến file ZIP thiếu trang.
  - **Mục 4 (100% Ngoại tuyến / Offline hoàn toàn)**:
    - Vendor trực tiếp thư viện `pdf.min.js` (313 KB) và `pdf.worker.min.js` (1.1 MB) vào `static/vendor/pdfjs/`.
    - `src/app.html`: Chuyển sang tải script cục bộ `/vendor/pdfjs/pdf.min.js` kèm cơ chế fallback sang CDN khi cần.
    - `src/lib/utils/pdf.ts`: Cập nhật `initPdfWorker` trỏ trực tiếp `GlobalWorkerOptions.workerSrc` vào `/vendor/pdfjs/pdf.worker.min.js`.
    - Bổ sung cấu hình `.prettierignore` và `eslint.config.js` loại trừ thư mục vendor bên thứ ba.
  - **Kiểm thử & Khắc phục**:
    - `tests/pdf-splitter.test.ts`: Bổ sung 5 unit tests mới kiểm tra tái sử dụng document duy nhất, thu hồi `URL.revokeObjectURL`, kiểm tra thuật toán giới hạn canvas `getClampedViewport`, kiểm tra giải phóng kích thước canvas về 0 và kiểm tra ném lỗi khi `toBlob` thất bại.
    - `tests/helpers.test.ts`: Đồng bộ kỳ vọng `workerSrc` cục bộ.
- Kết quả pipeline: format:check ✅ | lint ✅ | type check (0 err, 0 warn) ✅ | test unit ✅ (328/328 pass) | knip ✅ (0 issues) | build production ✅ | test e2e ✅ (12/12 pass) | graphify ✅ (4833 nodes, 10424 edges, 275 communities)
- File chính bị ảnh hưởng:
  - `src/lib/pdf-splitter/pdf-splitter.ts`
  - `src/lib/utils/pdf.ts`
  - `src/app.html`
  - `src/lib/types/pdf-splitter.type.ts`
  - `static/vendor/pdfjs/pdf.min.js` (thêm mới)
  - `static/vendor/pdfjs/pdf.worker.min.js` (thêm mới)
  - `src/lib/pdf-splitter/pdf-splitter.worker.ts` (đã xóa)
  - `tests/pdf-splitter.test.ts`
  - `tests/helpers.test.ts`
  - `.prettierignore`
  - `eslint.config.js`
  - `README.md`

### 2026-10-21 (Seamless Multi-Footers Support in Blockquote)

- Thêm/sửa: Hỗ trợ nhiều dòng footer `>` liền mạch (tối đa 3 dòng footer) trong khối trích dẫn `~`:
  - `src/lib/epub-packer/parser/txt-parser.ts`: Cập nhật logic nhận diện khối `~` (cả ở chế độ thông thường lẫn bên trong `[letter-box]`/`[new]`), cho phép quét tối đa 3 dòng footer `>` liên tiếp nếu viết liền mạch (không có dòng trống). Nếu gặp dòng trống ngắt quãng hoặc vượt quá 3 dòng, các dòng `>` phía sau tự động dừng gom nhóm và được render thành thẻ văn bản `<p>&gt; ...</p>` thông thường.
  - `src/lib/epub-to-txt/epub-to-txt.ts`: Đồng bộ cơ chế đảo ngược EPUB to TXT (`htmlToCleanText`), bắt tất cả các thẻ `<footer>`/`<cite>` bên trong `<blockquote>` xuất ra thành các dòng `> Footer` tương ứng.
  - `src/lib/epub-packer/components/EpubSyntaxModal.svelte`: Cập nhật hướng dẫn cú pháp modal ghi rõ hỗ trợ tối đa 3 footer liền mạch.
  - `tests/epub-parser.test.ts` & `tests/epub-to-txt.test.ts`: Bổ sung 2 unit test mới kiểm tra khối trích dẫn 3 footer liền mạch, trích dẫn bị ngắt bởi dòng trống, trích dẫn vượt quá 3 footer, và đảo ngược EPUB to TXT.
- Kết quả pipeline: format ✅ | lint ✅ | type check (0 err, 0 warn) ✅ | test unit ✅ (321/321 pass) | knip ✅ (0 issues) | graphify ✅ (918 nodes, 2088 edges)
- File chính bị ảnh hưởng:
  - `src/lib/epub-packer/parser/txt-parser.ts`
  - `src/lib/epub-to-txt/epub-to-txt.ts`
  - `src/lib/epub-packer/components/EpubSyntaxModal.svelte`
  - `tests/epub-parser.test.ts`
  - `tests/epub-to-txt.test.ts`
  - `README.md`

### 2026-10-16 (H2 Font Classification with Intervening Ornaments)

- Thêm/sửa: Hỗ trợ trường hợp hoa văn xen kẽ `<ornamenth1> h1 <ornamenth2> h2` trong logic phân loại phông chữ H2:
  - `src/lib/epub-packer/xml-builders/chapter-builder.ts`: Bổ sung `ORNAMENT_CONTAINER_REGEX` và `ORNAMENT_IMG_REGEX` vào hàm `classifyChapterHeadings`, đảm bảo việc kiểm tra tính liền kề giữa `h1` và `h2` bỏ qua các khối hoa văn chương/tiểu chương, giữ nguyên `h2` là Main H2 (`h2Font`).
  - `tests/epub-packer.test.ts`: Thêm test suites kiểm tra `<ornamenth1> h1 <ornamenth2> h2` và chuỗi `h2` có hoa văn xen kẽ.
- Kết quả pipeline: format ✅ | lint ✅ | type check (0 err, 0 warn) ✅ | test unit ✅ (319/319 pass) | test e2e ✅ (12/12 pass) | knip ✅ (0 issues) | graphify ✅ (923 nodes, 2094 edges)
- File chính bị ảnh hưởng:
  - `src/lib/epub-packer/xml-builders/chapter-builder.ts`
  - `tests/epub-packer.test.ts`
  - `README.md`

### 2026-10-16 (Refine H2 & H2 Sub Font Assignment Logic: Direct Sibling Only)

- Thêm/sửa: Điều chỉnh logic nhận diện Main H2 và H2 Sub theo quy tắc liền kề trực tiếp:
  - `src/lib/epub-packer/builders/stylesheet-builder.ts`:
    - Chỉ thẻ H2 đi **ngay sau H1** (`h1 + h2`, `h1.main-chap + h2.side-chap`, kèm hỗ trợ hoa văn phụ `h1 + .subchapter-ornament + h2`) mới được tính là Main H2 (áp dụng `h2Font`).
    - Tất cả các trường hợp H2 khác (ngay trước nó là đoạn văn `<p>`, đứng sau H2 khác `h2 + h2`, hoặc chương không có H1) đều mặc định là H2 Sub (áp dụng `h2SubFont`).
    - Giữ trọn vẹn cơ chế fallback an toàn về `h2Font` khi `h2SubFont` để `'default'`.
  - `src/lib/epub-packer/components/EpubFontSettingsSection.svelte`: Cập nhật nhãn và mô tả trong khung Preview: `H2 ngay sau H1` vs `H2 Sub (sau đoạn văn, tiếp nối H2 hoặc không có H1)`.
  - `tests/epub-packer.test.ts`: Cập nhật unit test xác thực các quy tắc CSS `h1 + h2` và `h2` trong `style.css`.
- Kết quả pipeline: format:check ✅ | lint ✅ | type check (0 err, 0 warn) ✅ | test unit ✅ (312/312 pass) | knip ✅ (0 issues) | build production ✅ | test e2e ✅ (12/12 pass) | graphify ✅ (922 nodes, 2090 edges)
- File chính bị ảnh hưởng:
  - `src/lib/epub-packer/builders/stylesheet-builder.ts`
  - `src/lib/epub-packer/components/EpubFontSettingsSection.svelte`
  - `tests/epub-packer.test.ts`
  - `README.md`

### 2026-10-16 (H2 Sub Font Selector & 2-Column Font Settings Layout)

- Thêm/sửa: Bổ sung bộ chọn phông chữ cho tiêu đề phụ H2 Sub và tái cấu trúc giao diện cài đặt phông:
  - `src/lib/types/epub.type.ts`: Bổ sung thuộc tính `h2SubFont?: string;` vào `EpubFontsConfig`.
  - `src/lib/epub-packer/state/epub-fonts-state.svelte.ts` & `src/lib/epub-packer/epub-state.svelte.ts`: Bổ sung `h2SubFont` vào state quản lý phông, danh sách phông cần tải và đóng gói vào file EPUB (`neededFonts`).
  - `src/lib/epub-packer/builders/asset-builder.ts`: Phân giải active fonts bao gồm `h2SubFont`.
  - `src/lib/epub-packer/builders/stylesheet-builder.ts`: Đăng ký `@font-face` khử trùng lặp cho `h2SubFont` và thêm quy tắc CSS `h2 + h2, .side-chap + .side-chap { font-family: "${f2Sub.cssFamily}", serif !important; }` (khi có `<p>` xen giữa, H2 tiếp theo tự động quay về font H2 chính).
  - `src/lib/epub-packer/components/EpubFontSettingsSection.svelte`: Chuyển đổi giao diện thành lưới 2 cột: Cột 1 chứa 4 bộ chọn `FontSelect` dọc (Font cho Tiêu đề lớn H1, Font cho Tiêu đề nhỏ H2, Font cho H2 Sub, Font cho Chữ hoa đầu đoạn Dropcap); Cột 2 chứa khung Preview trực tiếp chương sách với H1, H2, H2 Sub và Dropcap.
  - `tests/epub-packer.test.ts`: Bổ sung unit test xác thực quy tắc CSS `h2 + h2` được tiêm chính xác vào `style.css` của EPUB.
  - `tests-e2e/epub-workflow.spec.ts`: Mở rộng test E2E kiểm tra chọn phông chữ H2 Sub và phản chiếu trong DOM.
- Kết quả pipeline: format:check ✅ | lint ✅ | type check (0 err, 0 warn) ✅ | test unit ✅ (312/312 pass) | knip ✅ (0 issues) | build production ✅ | test e2e ✅ (12/12 pass) | graphify ✅ (920 nodes, 2087 edges)
- File chính bị ảnh hưởng:
  - `src/lib/types/epub.type.ts`
  - `src/lib/epub-packer/state/epub-fonts-state.svelte.ts`
  - `src/lib/epub-packer/epub-state.svelte.ts`
  - `src/lib/epub-packer/builders/asset-builder.ts`
  - `src/lib/epub-packer/builders/stylesheet-builder.ts`
  - `src/lib/epub-packer/components/EpubFontSettingsSection.svelte`
  - `tests/epub-packer.test.ts`
  - `tests-e2e/epub-workflow.spec.ts`
  - `README.md`

### 2026-10-16 (Fix Jacket Modal Font Persistence Across Templates)

- Thêm/sửa: Khắc phục sự cố phông chữ không phản ánh khi chuyển tiếp giữa các mẫu trang giới thiệu trong `EpubJacketModal.svelte`:
  - Khắc phục cơ chế tiêm style: Loại bỏ hoàn toàn thẻ `<style>` lồng trong container `.preview-wrap`, chuyển toàn bộ định nghĩa style ghi đè phông chữ vào `<svelte:head>` và đồng thời gán CSS custom property `--jacket-font` trực tiếp lên phần tử `.preview-wrap` kèm quy tắc `:global(.preview-wrap, .preview-wrap *) { font-family: var(--jacket-font, inherit) !important; }`.
  - Chuẩn hóa hàm sinh `jacketFontFamily`: Lọc sạch chuỗi rỗng `""`, loại bỏ lỗi cú pháp font-family khiến browser CSS parser bỏ qua toàn bộ thuộc tính.
  - Ổn định chỉ mục mẫu preview: Sử dụng biến trạng thái `wasOpen` để chỉ đồng bộ chỉ mục mẫu từ `epubState.jacket.jacketTemplateId` khi modal mở lần đầu, ngăn ngừa việc điều hướng 'Tiếp' / 'Trước' hoặc chọn phông chữ bị reset ngược về mẫu 1.
  - Cập nhật kịch bản kiểm thử Playwright E2E: Xác minh toàn diện việc chọn phông, chuyển tiếp qua lại giữa các Mẫu 1, 2, 3 và kiểm tra giá trị `fontFamily` thực tế tại từng bước.
- Kết quả pipeline: format:check ✅ | lint ✅ | type check (0 err, 0 warn) ✅ | test unit ✅ (311/311 pass) | knip ✅ (0 issues) | build production ✅ | test e2e ✅ (12/12 pass) | graphify ✅ (919 nodes, 2086 edges)
- File chính bị ảnh hưởng:
  - `src/lib/epub-packer/components/EpubJacketModal.svelte`
  - `tests-e2e/epub-workflow.spec.ts`
  - `README.md`

### 2026-10-16 (Live Font Preview Dropdown for H1, H2, Dropcap & Jacket Modal)

- Thêm/sửa: Trực quan hóa lựa chọn phông chữ H1, H2, Dropcap và Jacket Modal với typography thực tế ngay tại danh sách chọn:
  - `FontSelect.svelte`: Tạo mới component chọn font tùy biến theo chuẩn Solarized Glassmorphism, hỗ trợ prop `compact` cho toolbar. Mỗi mục trong danh sách được định kiểu trực tiếp bằng `font-family` của chính nó, hiển thị tên phông chữ và văn bản mẫu tiếng Việt có dấu ("Chương 1: Bình minh") cùng mã định danh font.
  - Tích hợp ô lọc tìm kiếm phông chữ (`searchQuery`) gõ nhanh theo tên hoặc ID. Nút trigger khi đóng hiển thị tên phông chữ được vẽ bằng chính font đang chọn.
  - Tích hợp thẻ `<select class="sr-only">` ẩn đồng bộ 2 chiều, đảm bảo tương thích 100% với form accessibility và các công cụ tự động hóa.
  - `EpubFontSettingsSection.svelte`: Nâng cấp bộ chọn font Tiêu đề lớn (H1), Tiêu đề nhỏ (H2) và Dropcap sang dùng `FontSelect`.
  - `EpubJacketModal.svelte`: Nâng cấp dropdown phông chữ trên thanh công cụ của Modal xem trước trang giới thiệu sang dùng `FontSelect` với chế độ `compact={true}`.
  - `src/routes/epub-packer/+page.svelte`: Đăng ký bổ sung `font.cssFamily` và `font-display: swap` vào định nghĩa `@font-face` để tăng tốc độ nạp font trong trình duyệt.
  - `tests-e2e/epub-workflow.spec.ts`: Bổ sung kiểm thử tương tác mở dropdown xem trước font H1 và Jacket Modal, chọn phông chữ và kiểm chứng phản chiếu giá trị.
- Kết quả pipeline: format:check ✅ | lint ✅ | type check (0 err, 0 warn) ✅ | test unit ✅ (311/311 pass) | knip ✅ (0 issues) | build production ✅ | test e2e ✅ (12/12 pass) | graphify ✅ (918 nodes, 2085 edges)
- File chính bị ảnh hưởng:
  - `src/lib/components/FontSelect.svelte`
  - `src/lib/types/components.type.ts`
  - `src/lib/epub-packer/components/EpubFontSettingsSection.svelte`
  - `src/lib/epub-packer/components/EpubJacketModal.svelte`
  - `src/routes/epub-packer/+page.svelte`
  - `tests-e2e/epub-workflow.spec.ts`
  - `README.md`

### 2026-10-16 (Jacket Template Name Simplification & Dedicated Modal Font Selection)

- Thêm/sửa: Chuẩn hóa tên mẫu trang giới thiệu và tinh gọn khu vực metadata:
  - `jacket-templates.ts`: Đổi tên toàn bộ 10 mẫu trang giới thiệu sách thành thuần túy `Mẫu 1`, `Mẫu 2`, `Mẫu 3`, ..., `Mẫu 10`, loại bỏ toàn bộ các tên phụ không cần thiết.
  - `EpubMetadataSection.svelte`: Loại bỏ trường input chọn phông chữ trang giới thiệu (`#jacket-font-select`), chuyển hoàn toàn tính năng chọn font vào bên trong Modal xem trước (`EpubJacketModal.svelte`). Hiển thị huy hiệu phông chữ gọn gàng bên cạnh tên mẫu đang chọn.
  - `EpubJacketModal.svelte`: Tinh chỉnh nhãn hiển thị mẫu trên thanh công cụ thành `{template.name} ({idx + 1}/{total})` (ví dụ `Mẫu 1 (1/10)`), tránh lặp lại từ 'Mẫu'.
  - `tests-e2e/epub-workflow.spec.ts`: Cập nhật kịch bản Playwright E2E kiểm chứng input font đã được gỡ bỏ khỏi trang chính, kiểm tra font chọn trong preview modal được phản chiếu và lưu trữ chính xác.
- Kết quả pipeline: format:check ✅ | lint ✅ | type check (0 err, 0 warn) ✅ | test unit ✅ (311/311 pass) | knip ✅ (0 issues) | build production ✅ | test e2e ✅ (12/12 pass) | graphify ✅ (914 nodes, 2078 edges)
- File chính bị ảnh hưởng:
  - `src/lib/epub-packer/templates/jacket-templates.ts`
  - `src/lib/epub-packer/components/EpubMetadataSection.svelte`
  - `src/lib/epub-packer/components/EpubJacketModal.svelte`
  - `tests-e2e/epub-workflow.spec.ts`
  - `README.md`

### 2026-10-16 (Jacket Preview Modal Real-Time Font Selection)

- Thêm/sửa: Bổ sung dropdown phông chữ trực tiếp trong Modal xem trước trang giới thiệu sách (Jacket Preview Modal):
  - `EpubJacketModal.svelte`: Bổ sung toolbar hiển thị tên mẫu trang giới thiệu và dropdown chọn phông chữ (`AVAILABLE_FONTS`), liên kết trực tiếp hai chiều với `epubState.fonts.jacketFont`.
  - Phản chiếu trực tiếp (Real-time reflection): cập nhật selector CSS động `.preview-wrap, .preview-wrap *` áp dụng ngay lập tức font chữ đã chọn lên toàn bộ tiêu đề, tác giả, dịch giả và thông tin xuất bản trong khung xem trước mà không cần đóng modal.
  - Đồng bộ tự động với `EpubMetadataSection.svelte` trên giao diện chính khi người dùng đổi font trong modal hoặc xác nhận chọn mẫu.
  - `tests-e2e/epub-workflow.spec.ts`: Cập nhật kịch bản Playwright E2E kiểm chứng mở modal xem trước, thay đổi phông chữ sang `Bookerly`, xác nhận preview phản chiếu và đồng bộ thành công sang section chính.
- Kết quả pipeline: format:check ✅ | lint ✅ | type check (0 err, 0 warn) ✅ | test unit ✅ (311/311 pass) | knip ✅ (0 issues) | build production ✅ | test e2e ✅ (12/12 pass) | graphify ✅ (913 nodes, 2078 edges)
- File chính bị ảnh hưởng:
  - `src/lib/epub-packer/components/EpubJacketModal.svelte`
  - `tests-e2e/epub-workflow.spec.ts`
  - `README.md`

### 2026-10-16 (Worker Detached Buffer Fallback, Concurrency Testing & ML Self-Healing)

- Thêm/sửa: Khắc phục triệt để các vấn đề rà soát từ `review.md`:
  - `duplicate-detector.ts`: Áp dụng cơ chế Lazy Fallback Loader (`fallbackLoader: () => Promise<ScanItemInput[]>`) khi Worker gặp lỗi, bảo toàn nguyên vẹn dữ liệu ảnh/font/CSS mà không bị lỗi detached buffer từ zero-copy transfer, đồng thời không gây tốn RAM ở luồng chính.
  - `tests/epub-cleaner.test.ts`: Tích hợp `AsyncDuplicateWorkerMock` và giả lập `window` trong môi trường kiểm thử Vitest, kiểm chứng toàn diện 4 điều kiện: chạy chung 1 Worker instance, abort 1 job không ngắt worker của job còn lại, job còn lại nhận kết quả chính xác, và worker ném `onerror` tự động fallback thành công với buffer nguyên vẹn.
  - `image-bg-remove-ml.ts`: Thay thế `cleanupWorkerAndRejectPending` bằng `cleanupWorkerAndFallbackPending(error)`, bao phủ triệt để các sự cố `onerror`, `onmessageerror` và lỗi xử lý worker để tự động phục hồi qua `processOrnamentOnMainThread()`, đảm bảo kiểm tra `signal?.aborted` tránh thực thi tác vụ bị hủy.
  - `tests/image-bg-remove.test.ts`: Bổ sung 2 unit tests kiểm tra `worker.onerror` tự động phục hồi trên luồng chính và xác nhận bỏ qua các job đã bị abort.
- Kết quả pipeline: format:check ✅ | lint ✅ | type check (0 err, 0 warn) ✅ | test unit ✅ (311/311 pass) | knip ✅ (0 issues) | build production ✅ | test e2e ✅ (12/12 pass) | graphify ✅ (907 nodes, 2063 edges)
- File chính bị ảnh hưởng:
  - `src/lib/epub-editor/cleaner/duplicate-detector.ts`
  - `src/lib/utils/image-bg-remove-ml.ts`
  - `tests/epub-cleaner.test.ts`
  - `tests/image-bg-remove.test.ts`
  - `review.md`
  - `README.md`

### 2026-10-16 (Worker Cancellation Race Condition & ML Fallback Hardening)

- Thêm/sửa: Khắc phục 2 lỗi tiềm ẩn từ `review.md`:
  - `txt-parser.ts` & `duplicate-detector.ts`: Thiết lập cơ chế đăng ký tác vụ trung tâm (`pendingTxtJobs` và `pendingDuplicateJobs`), tránh gọi `worker.terminate()` trên Worker Singleton dùng chung khi vẫn còn tác vụ khác đang chờ kết quả, bảo vệ an toàn cho các tác vụ chạy song song khi có 1 tác vụ bị abort.
  - `image-bg-remove-ml.ts`: Tách hàm `processOrnamentOnMainThread`, bổ sung cơ chế tự phục hồi chạy trên luồng chính khi `worker.postMessage` ném lỗi.
  - Bổ sung 3 unit tests mới cho `txt-parser`, `duplicate-detector` và `image-bg-remove` (nâng tổng số tests lên 308/308 pass).
- Kết quả pipeline: format:check ✅ | lint ✅ | type check (0 err, 0 warn) ✅ | test unit ✅ (308/308 pass) | knip ✅ (0 issues) | build production ✅ | test e2e ✅ (12/12 pass) | graphify ✅
- File chính bị ảnh hưởng:
  - `src/lib/epub-packer/parser/txt-parser.ts`
  - `src/lib/epub-editor/cleaner/duplicate-detector.ts`
  - `src/lib/utils/image-bg-remove-ml.ts`
  - `tests/epub-parser.test.ts`
  - `tests/epub-cleaner.test.ts`
  - `tests/image-bg-remove.test.ts`
  - `review.md`
  - `README.md`

### 2026-10-16 (Letter/Poem Dropcap Suppression & Heading Syntax Warning)

- Thêm/sửa: Chuẩn hóa tính năng Dropcap và tiêu đề trong khối `[letter]` và `[poem]`:
  - `chapter-builder.ts`: Tự động bảo vệ khối `[letter]` và `[poem]` (`<div class="letter">`, `<div class="poem">`) không bị tự động chèn dropcap sau tiêu đề `<h1>`/`<h2>`, chỉ giữ dropcap thủ công khi người dùng viết `[c]`.
  - `txt-parser.ts`: Render đoạn văn thông thường bên trong `currentBlock` thành thẻ `<p>` tiêu chuẩn; hỗ trợ dropcap cưỡng bức `[c]` và tiêu đề không mục lục `@@!`, `@!`.
  - `txt-syntax-validator.ts`: Chuyển đổi kiểm tra `@@` và `@` bên trong `[letter]` và `[poem]` sang `warning` (thay vì `error`), giữ `isValid: true` và không dừng tiến trình build, hiển thị cảnh báo chi tiết và render thành `<p>@...</p>`, `<p>@@...</p>`.
  - Bổ sung và cập nhật unit tests cho `buildChapterXhtml`, `validateTxtSyntax` và `parseTxtToChapters` (305/305 unit tests pass 100%, 12/12 Playwright E2E browser tests pass 100%).
- Kết quả pipeline: format:check ✅ | lint ✅ | type check (0 err, 0 warn) ✅ | test unit ✅ (305/305 pass) | knip ✅ (0 issues) | build production ✅ | test e2e ✅ (12/12 pass) | graphify ✅ (898 nodes, 2037 edges)
- File chính bị ảnh hưởng:
  - `src/lib/epub-packer/parser/txt-syntax-validator.ts`
  - `src/lib/epub-packer/parser/txt-parser.ts`
  - `src/lib/epub-packer/xml-builders/chapter-builder.ts`
  - `tests/epub-parser.test.ts`
  - `tests/epub-packer.test.ts`
  - `review.md`
  - `README.md`

### 2026-10-16 (Review Refinements: UI Error Wrap, Letter/Poem Headings, Ornament Fix & PDF Zero-Copy)

- Thêm/sửa: Hoàn tất 6 cải tiến chất lượng và hiệu năng từ `review.md`:
  - `EpubSourceSection.svelte`: Bổ sung class `whitespace-pre-line` vào khung báo lỗi, giúp danh sách lỗi cú pháp hiển thị xuống dòng trực quan.
  - `txt-syntax-validator.ts` & `txt-parser.ts`: Giới hạn cú pháp tiêu đề bên trong khối `[letter]` và `[poem]` chỉ cho phép `@@!` và `@!` (áp dụng `h1`/`h2` kèm class `no-toc`), ném lỗi cú pháp rõ ràng nếu người dùng dùng `@@` hoặc `@`.
  - `chapter-builder.ts`: Bổ sung điều kiện kiểm tra `no-toc` cho thẻ `<h1>` trước khi chèn `chapter-ornament`, loại bỏ tình trạng chèn lặp hoa văn khi xuất hiện `@@!`.
  - `pdf-splitter.ts`: Sửa lỗi nhân đôi bộ nhớ worker khi truyền ArrayBuffer, áp dụng cơ chế Zero-Copy Transfer (`workerBuf` dùng chung cho payload và transferList).
  - `txt-parser.ts` & `nav-builder.ts`: Dùng cờ `hasCustomTitle: false` trên chương và phát sinh warning khi khối `[new]` thiếu tiêu đề.
  - Bổ sung 3 unit tests mới cho `txt-parser` và 1 unit test cho `chapter-builder` (nâng tổng số tests lên 303/303 pass).
- Kết quả pipeline: format:check ✅ | lint ✅ | type check (0 err, 0 warn) ✅ | test unit ✅ (303/303 pass) | knip ✅ (0 issues) | build production ✅ | test e2e ✅ (12/12 pass) | graphify ✅ (888 nodes, 2024 edges)
- File chính bị ảnh hưởng:
  - `src/lib/epub-packer/components/EpubSourceSection.svelte`
  - `src/lib/epub-packer/parser/txt-syntax-validator.ts`
  - `src/lib/epub-packer/parser/txt-parser.ts`
  - `src/lib/epub-packer/xml-builders/chapter-builder.ts`
  - `src/lib/epub-packer/xml-builders/nav-builder.ts`
  - `src/lib/pdf-splitter/pdf-splitter.ts`
  - `tests/epub-parser.test.ts`
  - `tests/epub-packer.test.ts`
  - `README.md`

### 2026-10-16 (CI/CD Pipeline Hardening & Knip Resolution)

- Thêm/sửa: Chuẩn hóa toàn bộ quy trình xác thực CI/CD và giải quyết nợ kỹ thuật:
  - Khắc phục lỗi GitHub Actions `Code formatting check (Prettier)`: chỉnh sửa `scripts/generate-fonts-meta.js` xuất định dạng `src/assets/fonts-metadata.json` bằng tab (`\t`) và ký tự ngắt dòng cuối file (`\n`) đúng chuẩn `.prettierrc`.
  - Xử lý triệt để lỗi `knip` (do `oxc-parser` cố gắng cấp phát 6 GiB ArrayBuffer trên Linux): cấu hình script `"knip": "KNIP_DISABLE_RAW_TRANSFER=1 knip"` trong `package.json`, knip quét thành công 100% không phát hiện file rác / dead code.
  - Cập nhật [AI_WORKFLOW.md](AI_WORKFLOW.md) mục 2: thiết lập Chu trình kiểm tra cục bộ và Pipeline Chốt Chặn CI/CD bắt buộc 100% pass trước khi commit/push (bao gồm `pnpm format:check`, `pnpm build`, `pnpm test:e2e`).
- Kết quả pipeline: format:check ✅ | lint ✅ | type check (0 err, 0 warn) ✅ | test unit ✅ (300/300 pass) | knip ✅ (0 issues) | build production ✅ | test e2e ✅ (12/12 pass) | graphify ✅ (887 nodes, 2024 edges)
- File chính bị ảnh hưởng:
  - `scripts/generate-fonts-meta.js`
  - `src/assets/fonts-metadata.json`
  - `package.json`
  - `AI_WORKFLOW.md`
  - `README.md`

### 2026-10-16 (Web Worker Lifecycle Hardening & Listener Leak Prevention)

- Thêm/sửa: Chuẩn hóa toàn diện vòng đời Web Worker theo khuyến nghị trong `review.md`:
  - `txt-parser.ts`: Gỡ triệt để các listener `error` và `messageerror` trong `cleanup()`, bọc lời gọi fallback trực tiếp trong try-catch và bắt lỗi `postMessage`.
  - `duplicate-detector.ts`: Bổ sung listener `error` và `messageerror` trên worker, đảm bảo `cleanup()` dọn dẹp sạch listener `message`/`error`/`abort`, chống treo Promise khi worker gặp lỗi, xử lý fallback an toàn khi `postMessage` thất bại.
  - `pdf-splitter.ts`: Bổ sung listener `error` và `messageerror`, đảm bảo `cleanup()` gỡ listener `abort` khỏi `signal`, bọc `postMessage` với try-catch và cleanup an toàn.
  - `image-bg-remove-ml.ts`: Bọc `worker.postMessage` trong try-catch kèm cleanup khi xảy ra lỗi truyền dữ liệu.
  - Viết bổ sung 4 unit tests kiểm tra chạy worker bất đồng bộ, xử lý AbortSignal và thu hồi listener trong `tests/epub-parser.test.ts`, `tests/epub-cleaner.test.ts` và `tests/pdf-splitter.test.ts`.
- Kết quả pipeline: format ✅ | lint ✅ | type check (0 err, 0 warn) ✅ | test unit ✅ (300/300 pass) | knip: nợ kỹ thuật oxc-parser | graphify ✅ (884 nodes, 2020 edges)
- File chính bị ảnh hưởng:
  - `src/lib/epub-packer/parser/txt-parser.ts`
  - `src/lib/epub-editor/cleaner/duplicate-detector.ts`
  - `src/lib/pdf-splitter/pdf-splitter.ts`
  - `src/lib/utils/image-bg-remove-ml.ts`
  - `tests/epub-parser.test.ts`
  - `tests/epub-cleaner.test.ts`
  - `tests/pdf-splitter.test.ts`
  - `review.md`
  - `README.md`

### 2026-10-16 (TypeScript Strict Mode Full Compliance)

- Thêm/sửa: Nâng cấp toàn diện TypeScript lên `strict: true` theo khuyến nghị trong `review.md`:
  - Rà soát và xử lý triệt để 47 lỗi strict mode và nullability trên toàn bộ codebase.
  - Sửa lỗi xử lý `b.text` undefined trong `extractChunkBlocks` và `analyzeChapterCandidates` ([epub-chapter-utils.ts](src/lib/epub-packer/parser/epub-chapter-utils.ts)).
  - Bổ sung type guard cho khối text đầu tiên trong `epub-single-grouper.ts` và `epub-zip-grouper.ts`.
  - Chuẩn hóa hàm `ensureChapterOpen` trả về `RawChapterItem` để đảm bảo an toàn kiểu dữ liệu và chống nullability xuyên suốt parser ([txt-parser.ts](src/lib/epub-packer/parser/txt-parser.ts)).
  - Bổ sung type chú thích explicit cho regex replace callbacks trong `chapter-builder.ts`.
  - Khắc phục type narrowing cho `globalPdfjs` trong closure bất đồng bộ của `pdf-splitter.ts`.
  - Cập nhật render an toàn `children?.()` trong `+layout.svelte`.
  - Kích hoạt `"strict": true` trong `tsconfig.json`.
- Kết quả pipeline: format ✅ | lint ✅ | type check (0 err, 0 warn) ✅ | test unit ✅ (296/296 pass) | knip: nợ kỹ thuật oxc-parser | graphify ✅ (883 nodes, 2013 edges)
- File chính bị ảnh hưởng:
  - `tsconfig.json`
  - `src/lib/epub-packer/parser/epub-chapter-utils.ts`
  - `src/lib/epub-packer/parser/epub-single-grouper.ts`
  - `src/lib/epub-packer/parser/epub-zip-grouper.ts`
  - `src/lib/epub-packer/parser/txt-parser.ts`
  - `src/lib/epub-packer/xml-builders/chapter-builder.ts`
  - `src/lib/pdf-splitter/pdf-splitter.ts`
  - `src/routes/+layout.svelte`
  - `review.md`
  - `README.md`

### 2026-10-16 (Workflow & Documentation Consolidation)

- Thêm/sửa: Chuẩn hóa hệ thống tài liệu quy trình và giao diện:
  - Khởi tạo [AI_WORKFLOW.md](AI_WORKFLOW.md) kết hợp đầy đủ quy trình AI Coding Agent, quy tắc Svelte 5 Rune, pipeline 6 bước và tích hợp toàn bộ kiến trúc 4 tầng kiểm thử, Ma trận "Sửa gì - Chạy test gì" cùng Cheat Sheet từ `DEVELOPMENT_WORKFLOW.md`.
  - Khởi tạo [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) chuẩn hóa bảng màu Solarized, typography, tokens và quy chuẩn component UI.
  - Xóa file `DEVELOPMENT_WORKFLOW.md` sau khi gộp nội dung để tinh gọn kho lưu trữ.
  - Cập nhật liên kết tài liệu trong [README.md](README.md).
- Kết quả pipeline: format ✅ | lint ✅ | type check (0 err, 0 warn) ✅ | test unit ✅ (296/296 pass) | knip: nợ kỹ thuật oxc-parser | graphify ✅ (881 nodes, 2011 edges)
- File chính bị ảnh hưởng:
  - `AI_WORKFLOW.md`
  - `DESIGN_SYSTEM.md`
  - `DEVELOPMENT_WORKFLOW.md` (deleted)
  - `README.md`

### 2026-10-16 (CI/CD Verification & Expanded Test Coverage)

- Thêm/sửa: Kiểm tra toàn diện chu trình CI/CD và bổ sung các ca kiểm thử còn thiếu:
  - Đồng bộ cơ chế đảo ngược EPUB to TXT (`htmlToCleanText`) nhận diện thẻ `<h1 ... no-toc>` chuyển đổi thành `@@!`, `@@!t`, `@@!p`.
  - Bổ sung unit tests cho định dạng căn lề tiêu đề `@@!t` và `@@!p` không ngắt trang và không sinh TOC.
  - Bổ sung unit test xác thực định dạng inline trong tiêu đề của khối `[new:center]`.
  - Bổ sung unit test kiểm tra bảo toàn dropcap thủ công `[c]` trong khối `hasCenterPage` (trang đề tặng).
  - Bổ sung unit test kiểm tra bảo vệ khối `[letter-box]` trong thuật toán ghép nối đoạn `mergeBrokenParagraphs`.
  - Bổ sung unit test kiểm tra khử trùng lặp mục lục TOC khi tiêu đề là 'Giới Thiệu' hoặc trùng tiêu đề chương.
- Kết quả pipeline: format ✅ | lint ✅ | type check (0 err, 0 warn) ✅ | test unit ✅ (296/296 pass) | test e2e ✅ (12/12 pass) | build production ✅ | knip: nợ kỹ thuật oxc-parser | graphify ✅ (863 nodes, 1991 edges)
- File chính bị ảnh hưởng:
  - `src/lib/epub-to-txt/epub-to-txt.ts`
  - `tests/epub-to-txt.test.ts`
  - `tests/epub-parser.test.ts`
  - `tests/epub-packer.test.ts`
  - `README.md`

### 2026-10-16 (Refinements: TOC, Center Page, Dropcap & @@!)

- Thêm/sửa: Hoàn tất các cải tiến thiết kế và cú pháp:
  - Vấn đề 2 & 5: Dùng placeholder 'Giới Thiệu' cho `[new]` và `[new:center]` khi không có tiêu đề, tự động khử trùng lặp mục lục TOC khi có `h2`.
  - Vấn đề 3: Cho phép đóng `[/new:center]` cho `[new:center]` và kiểm định tính hợp lệ bất đối xứng (không cho đóng `[new]` thường).
  - Vấn đề 4: Tắt auto-dropcap trên các chương căn giữa `hasCenterPage` (trang đề tặng).
  - Vấn đề 7: Hỗ trợ cú pháp tiêu đề lớn `@@!` áp dụng kiểu dáng `h1.main-chap` (kèm class `no-toc`) cùng trang, không tách chương độc lập như `@@`.
  - Viết bổ sung 8 unit tests kiểm định toàn diện.
- Kết quả pipeline: format ✅ | lint ✅ | type check (0 err, 0 warn) ✅ | test unit ✅ (290/290 pass) | test e2e ✅ (12/12 pass) | knip: nợ kỹ thuật oxc-parser | graphify ✅ (863 nodes, 1991 edges)
- File chính bị ảnh hưởng:
  - `src/lib/epub-packer/parser/txt-parser.ts`
  - `src/lib/epub-packer/parser/txt-syntax-validator.ts`
  - `src/lib/epub-packer/xml-builders/chapter-builder.ts`
  - `src/lib/epub-packer/xml-builders/nav-builder.ts`
  - `tests/epub-parser.test.ts`
  - `tests/epub-packer.test.ts`
  - `README.md`

### 2026-10-16 (NHOM 1 Review Bug Fixes)

- Thêm/sửa: Sửa 5 lỗi tiềm ẩn và lệch pha validator/parser từ `review.md`:
  - 1. Parser nhận diện hoa/thường case-insensitive cho mọi thẻ khối (`[NEW]`, `[LETTER-BOX]`, `[POEM]`, v.v.).
  - 2. Chặn lỗi cú pháp `@@` nằm trong `[letter-box]` khi không có wrapper `[new]`.
  - 3. Khắc phục lỗi lồng đôi thẻ dropcap khi dùng thẻ `[c]` ngay dưới tiêu đề `<h1>`/`<h2>`.
  - 4. Cảnh báo cú pháp phân chương `@@` hoặc `[new]` bị đặt lạc sau khối `Chú thích:`.
  - 5. `parseTxtToChapters` gom đầy đủ danh sách lỗi cú pháp từ `validateTxtSyntax`.
  - Thêm test suites bao phủ toàn diện cho cả 5 trường hợp sửa lỗi.
- Kết quả pipeline: format ✅ | lint ✅ | type check (0 err, 0 warn) ✅ | test unit ✅ (282/282 pass) | test e2e ✅ (12/12 pass) | knip: nợ kỹ thuật oxc-parser | graphify ✅ (861 nodes, 1986 edges)
- File chính bị ảnh hưởng:
  - `src/lib/epub-packer/parser/txt-parser.ts`
  - `src/lib/epub-packer/parser/txt-syntax-validator.ts`
  - `src/lib/epub-packer/xml-builders/chapter-builder.ts`
  - `tests/epub-parser.test.ts`
  - `tests/epub-packer.test.ts`
  - `README.md`

### 2026-10-16 (Clean Up)

- Thêm/sửa: Dọn dẹp các file rác và artifacts tạm an toàn 100% (`coverage/`, `test-results/`, `.wrangler/`), cập nhật `.gitignore` bổ sung `/coverage` để ngăn file test coverage bị lọt vào repo.
- Kết quả pipeline: format ✅ | lint ✅ | type check (0 err, 0 warn) ✅ | test unit ✅ (276/276 pass) | knip: nợ kỹ thuật oxc-parser | graphify ✅ (859 nodes, 1985 edges)
- File chính bị ảnh hưởng:
  - `.gitignore`
  - `README.md`

### 2026-10-15 (letter-box wrapper)

- Thêm/sửa: Bổ sung cặp thẻ hộp viền `[letter-box]` ... `[/letter-box]` (`<div class="letter-box">`) khi đóng gói EPUB từ file TXT và chuyển đổi ngược EPUB sang TXT. Định nghĩa CSS viền 3px, padding và margin chuẩn. Bảo vệ khối hộp khỏi thuật toán gộp đoạn vỡ dòng `mergeBrokenParagraphs`. Cập nhật validator kiểm tra lỗi mở thẻ và quy tắc cấp bậc bọc thẻ (yêu cầu `[new]` bọc ngoài `[letter-box]`). Cập nhật hướng dẫn cú pháp trên UI Modal.
- Kết quả pipeline: format ✅ | lint ✅ | type check (0 err, 0 warn) ✅ | test unit ✅ (276/276 pass) | test e2e ✅ (12/12 pass) | graphify ✅ (859 nodes, 1979 edges)
- File chính bị ảnh hưởng:
  - `src/lib/epub-packer/templates/css-template/quotes.css`
  - `src/lib/epub-packer/parser/txt-parser.ts`
  - `src/lib/epub-packer/parser/txt-syntax-validator.ts`
  - `src/lib/epub-packer/xml-builders/chapter-builder.ts`
  - `src/lib/epub-to-txt/epub-to-txt.ts`
  - `src/lib/epub-packer/components/EpubSyntaxModal.svelte`
  - `tests/epub-parser.test.ts`
  - `tests/epub-to-txt.test.ts`
  - `README.md`

### 2026-10-15

- Thêm/sửa: Sửa lỗi kiểm thử E2E Playwright trên CI/CD (`epub-download-inspection.spec.ts` & `epub-workflow.spec.ts`), khớp chính xác thông báo kết quả đọc file `Đã xử lý file .TXT thành công`. Bổ sung tính năng kiểm định cú pháp thẻ mở/đóng cho file TXT đóng gói EPUB (`txt-syntax-validator.ts`), báo chính xác số dòng vi phạm và dừng tiến trình khi phát hiện lỗi thẻ chưa đóng. Mở rộng kiểm tra lỗi chú thích `{n}` thiếu ngoặc nhọn đóng và cảnh báo rút gọn rớt cặp định dạng inline (`*`, `/`, `_`), loại bỏ false flag cho các ký tự độc lập. Hỗ trợ khối chú thích footnote nhiều dòng (Multi-line Footnote Block) gom trọn vẹn vào thẻ `<aside>`. Tách riêng khu vực hiển thị cảnh báo trên UI.
- Kết quả pipeline: format ✅ | lint ✅ | type check (0 err, 0 warn) ✅ | test unit ✅ (272/272 pass) | test e2e ✅ (12/12 pass) | graphify ✅ (847 nodes, 1936 edges)
- File chính bị ảnh hưởng:
  - `src/lib/types/epub.type.ts`
  - `src/lib/epub-packer/parser/txt-syntax-validator.ts`
  - `src/lib/epub-packer/parser/txt-parser.ts`
  - `src/lib/epub-packer/parser/epub-source-parser.ts`
  - `src/lib/epub-packer/state/epub-source-state.svelte.ts`
  - `src/lib/epub-packer/components/EpubSourceSection.svelte`
  - `tests/epub-parser.test.ts`
  - `README.md`

### 2026-09-27

- Thêm/sửa: Nâng cấp Reverse Engine **EPUB to TXT** mở rộng hỗ trợ cho các file EPUB thông thường (nhận diện mọi `<h1>` &rarr; `@@`, `<h2>` &rarr; `@`, `<b>`/`<strong>` &rarr; `*bold*`, `<i>`/`<em>` &rarr; `/italic/`, tự động phát hiện mọi biến thể ngắt phân cảnh `***`, `* * *`, `• • •`, `---`, `*`, `hr` &rarr; `###`, `##`, `#`).
- Kết quả pipeline: format ✅ | lint ✅ | type check (0 err, 0 warn) ✅ | test ✅ (262/262 pass) | knip ✅ | graphify ✅
- File chính bị ảnh hưởng:
  - `src/lib/epub-to-txt/epub-to-txt.ts`
  - `tests/epub-to-txt.test.ts`
  - `README.md`

### 2026-09-27 (Trước đó)

- Thêm/sửa: Bảo vệ các khối `poem`, `letter`, `center-page`, `[new]`, `blockquote`, `aside` khỏi logic `mergeBrokenParagraphs` khi đóng gói TXT sang EPUB.
- Kết quả pipeline: format ✅ | lint ✅ | type check (0 err, 0 warn) ✅ | test ✅ (254/254 pass) | knip ✅
- File chính bị ảnh hưởng:
  - `src/lib/types/epub.type.ts`
  - `src/lib/epub-packer/parser/txt-parser.ts`
  - `src/lib/epub-packer/parser/epub-chapter-utils.ts`
  - `src/lib/epub-packer/xml-builders/chapter-builder.ts`
  - `tests/epub-packer.test.ts`
