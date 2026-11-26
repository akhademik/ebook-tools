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
├── DESIGN_SYSTEM.md                 # Quy chuẩn thiết kế UI & Design Tokens
└── CHANGELOG.md                     # Lịch sử chi tiết các phiên bản và cập nhật
```

> **Ghi chú về Git Hooks**: Dự án sử dụng **Husky** (`.husky/pre-commit`) kết hợp với `lint-staged` để tự động định dạng và bắt lỗi ESLint trước mỗi commit, kết hợp cùng GitHub Actions CI tự động ([ci.yml](.github/workflows/ci.yml)).

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

- Cập nhật lần cuối: 2026-11-26 09:30
- Đang dở / Đang hoàn thiện:
  - **P1: Đo Trước, Tối Ưu Hóa & Rà Soát Thực Tế**:
    - Đã vá lỗi ghi nhầm file khi chuyển tab nhanh (`activeTarget` trong `flushDocSync`).
    - Đã sửa bảo toàn vị trí cuộn preview khi sửa CSS (`lastScrollRatio` ghi nhận vô điều kiện).
    - Đã mở rộng `deduplicateWasmPlugin` quét đệ quy toàn bộ thư mục `workers/` và thêm assertion fail build nếu còn sót tham chiếu cũ.
    - Đã deflake `profile-p1.test.ts` và bổ sung 2 kịch bản Playwright E2E kiểm chứng.
    - Đang tiếp tục đo đạc thực tế trên file TXT lớn, EPUB nhiều ảnh và PDF scan.
- Đã hoàn thành:
  - **Giai đoạn P1 (Nền tảng Tối Ưu & Khử Trùng WASM theo TASKS.md)**:
    - **Lập Số Liệu Gốc (Baseline Profiling qua `tests/stress/profile-p1.test.ts`)**:
      - Phân tích & đóng gói văn bản lớn (1.16MB, ~197.600 từ, 200 chương): Parse ~212ms, Pack ~228ms, Heap delta ~4.4MB.
      - Soạn thảo CodeMirror 6: Thuộc tính O(1) `doc.length`/`doc.lines` thay thế tuần tự hóa `doc.toString()` trên mỗi phím bấm, giảm áp lực Garbage Collection.
      - Kết xuất Live Preview HTML: ~1.5ms cho mỗi trang XHTML kèm style và inline assets.
    - **Tối ưu hóa CodeMirror Editor & Đồng bộ (`EpubEditorCodePane.svelte`, `epub-editor-state.svelte.ts`)**:
      - Dùng thuộc tính O(1) `doc.length` và `doc.lines`; cập nhật tức thì trạng thái `dirtyPaths`.
      - Debounce đồng bộ chuỗi 250ms; bổ sung cơ chế `flushEditorSync()` tự động xả dữ liệu đồng bộ khi chuyển trang, mở modal, xuất file hoặc khi editor mất focus (`blur`).
      - Ngăn chặn hoàn toàn lượt gọi `view.state.doc.toString()` thứ 2 trong reactive effect khi thay đổi xuất phát từ chính editor nhờ cờ `lastSyncedDoc`.
    - **Duy trì Vị trí Cuộn Live Preview (`EpubEditorPreviewPane.svelte`)**:
      - Lưu trữ và tự động phục hồi `lastScrollRatio` sau khi iframe nạp lại `srcdoc`, giải quyết triệt để lỗi preview tự động giật nhảy về đầu trang khi người dùng đang soạn thảo trang hoặc CSS.
      - Tự động reset `lastScrollRatio = 0` khi người dùng chuyển sang xem trước một chương khác.
    - **Khử Trùng Lặp File WASM trong Bản Build (`vite.config.js`)**:
      - Xây dựng plugin `deduplicateWasmPlugin()` quét đệ quy toàn bộ `workers/`: tự động phát hiện và viết lại đường dẫn WASM trỏ trực tiếp về asset duy nhất tại `_app/immutable/assets/`.
      - Xóa bỏ file `ort-wasm-simd-threaded.jsep.wasm` trùng lặp trong `workers/assets/`, tiết kiệm trực tiếp **23.23 MB** dung lượng bản build production.
    - **Chất Lượng Mã Nguồn & Kiểm Thử Toàn Diện**:
      - Nâng tổng số test lên **409/409 unit tests pass 100% (20 test files)**.
      - Toàn bộ pipeline: 0 lỗi format, 0 lỗi TypeScript (svelte-check), 0 lỗi ESLint, 0 lỗi Knip, production build pass.
  - **Khắc phục Triệt để Toàn bộ Điểm Lỗi Dữ liệu, Sai chuẩn EPUB, Ngữ pháp TXT & Bảo mật (P0)**:
    - **Chuẩn Hóa Bộ Phân Tích Định Dạng TXT Inline (`applyInlineFormatting` trong `txt-parser.ts`)**:
      - Tự động mask toàn bộ URL (`https?://[^\s]+`) trước khi quét cú pháp định dạng inline.
      - Tách các ký tự đóng định dạng `*`, `_`, `/` và các dấu câu kết thúc `.,;:!?` ra khỏi URL để hỗ trợ chính xác `*https://a.com*.`, `/xem https://a.com/.`, `/xem https://a.com/, rồi đi`.
      - Hỗ trợ nhiều URL trên cùng một dòng mà không làm sai lệch tính chẵn lẻ của dấu in nghiêng (`https://x.com/p /xem https://a.com/`).
      - Siết chặt ranh giới ký tự/từ cho dấu in nghiêng `/`, in đậm `*`, và gạch chân `_` với negative lookbehind/lookahead `(?<![\p{L}\p{N}])` và `(?![\p{L}\p{N}])`, triệt tiêu hoàn toàn hiện tượng làm hỏng URL, ký hiệu đơn vị (`km/h/s`) và biến snake_case (`file_name_here`).
    - **Sửa Lỗi Undo Ghi Nhầm File trong Editor (`EpubEditorCodePane.svelte`)**:
      - Tách riêng `EditorState` cho từng file thông qua bộ nhớ đệm `SvelteMap<string, EditorState>`.
      - Chuyển file bằng `view.setState()` thay vì dispatch thay đổi nội dung trên cùng một state, bảo toàn 100% ngăn xếp Undo/Redo riêng biệt cho mỗi trang, loại bỏ nguy cơ bấm Ctrl+Z làm ghi đè nội dung file này vào file khác.
      - Tự động reconfigure `wrapCompartment` và `themeCompartment` ngay sau `view.setState()`, bảo đảm file vừa chuyển kế thừa tức thì cấu hình Wrap và Theme hiện tại.
    - **Chuẩn hóa File `mimetype` khi Xuất EPUB (`exportEpubBlob` trong `editor-ops.ts`)**:
      - Đảm bảo file `mimetype` luôn sử dụng phương thức nén `STORE` (không nén) và được đặt ở vị trí byte đầu tiên của archive ZIP (offset 0), tuân thủ nghiêm ngặt đặc tả OCF 3.3 §3.3.2.
    - **Chống Biến Dạng Metadata khi Chứa Ký Tự `$` (`updateBookMetadata` trong `epub-book-ops.ts`)**:
      - Thay thế toàn bộ chuỗi template replacement bằng hàm callback `(_match, p1, p2) => ...`, ngăn chặn việc JavaScript diễn giải nhầm các pattern `$1`, `$2`, `$$` thành thẻ XML mở/đóng, bảo vệ cấu trúc `content.opf`.
    - **Khắc phục Liên Kết Mục Lục Bị Hỏng (`rebuildEpubToc` trong `epub-book-ops.ts`)**:
      - Khi tự động sinh mã định danh anchor (`#section-X-Y`) cho các tiêu đề heading chưa có ID, hệ thống tự động ghi thuộc tính `id="section-X-Y"` ngược lại vào thẻ heading trong file XHTML tương ứng (cập nhật `editBuffer`/`zip`), đảm bảo mọi liên kết mục lục đều nhảy chính xác đến vị trí tiêu đề.
      - Đổi regex nhận diện ID thành `/(?:^|\s)id\s*=\s*["']([^"']+)["']/i` để không nhận nhầm `data-id="..."`.
      - Tự động kiểm tra chống trùng ID tự sinh với mọi ID có sẵn trên trang.
      - Tự động đưa các trang được thêm ID vào `dirtyPaths` của `EpubEditorState`.
    - **Bảo Toàn Thuộc Tính `linear="no"` khi Sắp Xếp Lại Spine (`reorderOpfSpine` trong `epub-book-ops.ts`)**:
      - Trích xuất và bảo lưu nguyên vẹn toàn bộ thẻ `<itemref>` gốc kèm các thuộc tính `linear="no"`, `properties="..."`, `id="..."` khi tái cấu trúc thứ tự spine trong `content.opf`.
    - **Vá Lỗ Hổng Bảo Mật PDF.js CVE-2024-4367 (`isEvalSupported: false`)**:
      - Đặt cờ bảo mật `isEvalSupported: false` tại tất cả các điểm gọi `getDocument()` trong `pdf-splitter-state.svelte.ts`, `pdf-splitter.ts`, và `pdf.ts`, vô hiệu hóa đường dẫn mã thực thi JavaScript độc hại khi người dùng mở các file PDF không rõ nguồn gốc.
    - **Mở Rộng Quét Tài Nguyên Tránh Xóa Nhầm & Bảo Vệ Khử Trùng Lặp (`reference-extractor.ts` & `cleaner-engine.ts`)**:
      - Bổ sung quét ảnh trong thuộc tính nội dòng `style="background: url(...)"` (hỗ trợ giải mã thực thể `&quot;`, `&apos;`, `&#34;`, `&#39;`), thuộc tính `srcset` trên `<img>`/`<source>`, và quét file stylesheet nhúng qua `@import "file.css"` trong `<style>`.
      - Đặt mặc định an toàn `deduplicateResources: false` trong options của `cleanEpub()`, loại bỏ trùng lặp khỏi dung lượng tiết kiệm dự kiến.
    - **Chất Lượng Mã Nguồn & Kiểm Thử Toàn Diện**:
      - Bổ sung 5 unit test mới và 1 E2E test Playwright, nâng tổng số test lên **404/404 unit tests pass 100% (19 test files)**.
      - Toàn bộ pipeline: 0 lỗi format, 0 lỗi TypeScript (svelte-check), 0 lỗi ESLint, 0 lỗi Knip, production build pass.
- Đang dở: Không.
- Biết trước còn thiếu / nợ kỹ thuật:
  - Tách thanh bước và nhóm menu trong `epub-packer/+page.svelte` và `+layout.svelte` thành component trình bày độc lập.

---

## 📜 Nhật ký thay đổi (Changelog)

Chi tiết toàn bộ lịch sử phát triển, cập nhật tính năng và sửa lỗi qua các phiên bản được lưu trữ tập trung tại [CHANGELOG.md](CHANGELOG.md).
