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
├── UI_DIRECTION.md                  # Định hướng làm mới giao diện người dùng
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

- Cập nhật lần cuối: 2026-11-25 14:25
- Đã hoàn thành:
  - **Xem trước Trang lót sách (Jacket Preview) đồng bộ Placeholder & Dữ liệu nhập thực tế**:
    - Tách và xuất cấu hình mẫu chuẩn `JACKET_SAMPLE_PLACEHOLDERS` dùng chung làm giá trị gợi ý (`placeholder`) cho các ô nhập liệu tiêu đề, tác giả, tác phẩm gốc, dịch giả, nhà xuất bản, đơn vị liên kết.
    - Khung xem trước bìa lót (Jacket Preview) tự động chuyển đổi thông minh: hiển thị toàn bộ sách mẫu chân thực khi chưa nhập dữ liệu; ngay khi người dùng nhập bất kỳ trường thông tin nào, chuyển sang chế độ hiển thị động theo đúng dữ liệu người dùng nhập, đảm bảo không lẫn lộn dữ liệu mẫu vào sách thực tế.
  - **Bắt lỗi Đồng bộ `postMessage` & Timeout Thích ứng Pixel PDF Splitter**:
    - Bọc `worker.postMessage()` bằng xử lý lỗi đồng bộ, hủy timer và xóa job tức thì nếu gửi thất bại, triệt tiêu nguy cơ timer ma hủy nhầm worker.
    - Tính toán timeout động theo số lượng pixel thực tế (`calculateGrayscaleTimeout`) từ 15s đến tối đa 60s, loại bỏ tình trạng timeout giả trên các trang quét dung lượng lớn (10–25MP).
  - **Hoàn thiện Triệt để Độ tin cậy & Quản lý Bộ nhớ PDF Splitter**:
    - **Worker Timeout Failover**: Kích hoạt `handleWorkerFailure()` ngay khi timeout 15s phát sinh, terminate worker đơ và failover toàn bộ job sang Main Thread, tránh nhân đôi tải CPU.
    - **Exception-safe Reference Counting**: Đảm bảo `activeGrayscaleTasks` luôn được giải phóng trong `finally` kể cả khi nạp tài liệu PDF lỗi.
    - **Cửa sổ trượt tải ZIP an toàn (Sliding Window)**: Tự động kích hoạt tải và duy trì an toàn 2 phần ZIP gần nhất trong RAM, bảo vệ người dùng không bị mất file nếu trình duyệt chặn quyền tải nhiều file, đồng thời kiểm soát trần RAM cố định.
  - **Khắc phục Worker Hang/Timeout & Bảo vệ Đồng thời PDF Splitter**:
    - Xử lý triệt để lỗi treo Promise vĩnh viễn khi Web Worker gặp sự cố bằng cách duyệt và reject toàn bộ pending jobs, kích hoạt fallback sang Main Thread mượt mà.
    - Thêm timeout an toàn 15 giây cho mỗi job gửi tới Worker.
    - Quản lý vòng đời Worker theo reference count (`activeGrayscaleTasks`), ngăn việc hủy sớm worker dùng chung.
  - **Tối ưu hóa RAM cho PDF Splitter & EPUB Packer**:
    - **PDF Splitter**: Bổ sung cơ chế `autoDownloadParts` tự động tải và giải phóng RAM từng phần ZIP (40–80MB/phần) ngay khi đóng gói xong, giữ RAM luôn dưới ngưỡng an toàn kể cả khi tách PDF hàng nghìn trang mà không chọn thư mục đĩa.
    - **EPUB Packer**: Loại bỏ hoàn toàn việc chuyển đổi thừa `await blob.arrayBuffer()` trong `zip-writer.ts`, truyền trực tiếp `Blob` vào JSZip giúp loại bỏ việc nhân bản bộ nhớ heap cho tất cả ảnh minh họa, ảnh bìa, hoa văn và font chữ.
  - **Tối ưu tốc độ Xem trước PDF (Preview) với Màu Gốc Mặc định**: Bỏ hoàn toàn việc tính toán grayscale ở mức pixel canvas trong `loadPdfPreview()`, hiển thị trực tiếp màu gốc ở 96 DPI giúp tăng tốc tải preview thêm 25–40% (0ms tải CPU). Chỉ áp dụng chuyển đổi sang ảnh xám qua Web Worker khi người dùng bấm nút "Bắt đầu tách trang".
  - **Tối ưu hóa Hiệu năng PDF Splitter (Giai đoạn 1)**:
    - Chuyển toàn bộ vòng lặp xử lý ảnh đen trắng & độ tương phản sang Web Worker `src/lib/pdf-splitter/pdf-grayscale.worker.ts` với cơ chế zero-copy ArrayBuffer transfer, giải phóng hoàn toàn Main Thread giúp giao diện duy trì 60 FPS, thanh tiến trình mượt mà và nút "Hủy" phản hồi tức thì.
    - Tách riêng tỷ lệ render xem trước `PREVIEW_DPI = 96` (thay vì 200 DPI in ấn), tăng tốc độ xem trước file PDF nhanh gấp 4–6 lần và giảm 77% dung lượng bộ nhớ Canvas.
  - **Khắc phục Race Condition & Cache Preview EPUB Editor (Giai đoạn 3)**:
    - Bổ sung `latestPreviewRequestId` ngăn chặn triệt để tình trạng render chậm của chương cũ ghi đè lên chương mới khi người dùng chuyển trang nhanh.
    - Tích hợp bộ nhớ đệm `assetDataUrlCache` (`SvelteMap`) tái sử dụng Data URL của hình ảnh và phông chữ nhúng, giảm thời gian dựng lại Preview khi gõ chỉnh sửa từ ~300ms xuống dưới 10ms.
  - **Hoàn thiện UI Solarized Clean & Crisp**: Chuẩn hóa toàn bộ token màu ngữ nghĩa (`--color-danger`, `--color-warn`, `--color-ok`), loại bỏ hoàn toàn các class màu cứng `red-500`, `emerald-*`, `amber-*`.
  - **Nâng cấp cỡ chữ & Typography**: Nâng toàn bộ font chữ nhỏ dưới 12px lên tối thiểu `text-xs` (12px), loại bỏ `font-mono` ở các nhãn chữ tiếng Việt và nút bấm. Tối ưu typography trong `EpubCleanerModal` với `font-sans tabular-nums`.
  - **Khôi phục khối gợi ý quy trình**: Bổ sung sơ đồ 4 bước _"Gợi ý quy trình xử lý sách quét"_ (PDF → OCR ngoài → Đóng gói EPUB → Sửa EPUB) trên trang Tổng quan.
  - **Đồng bộ hóa luồng đóng gói EPUB**: Bố trí bảng điều khiển tóm tắt thông tin sách tập trung tại Bước 5 (Đóng gói), giải phóng 100% không gian hiển thị cho các bước cắt bìa, hoa văn và chọn phông.
  - **Khôi phục Husky & lint-staged**: Tích hợp Git hook pre-commit với `lint-staged` tự động format (Prettier) và lint (ESLint) các file staged trước khi commit. Chặt chẽ hóa script prepare `svelte-kit sync && (husky || true)`.
  - **Tối ưu hóa kho lưu trữ**: Bỏ theo dõi `graphify-out/` trong Git (chỉ dùng cục bộ cho AI, giảm hơn 26.000 dòng diff).
  - **Chuẩn hóa bộ test E2E**: Chuyển đường dẫn ảnh chụp sang `testInfo.outputPath()` chuẩn CI/mọi máy, bổ sung các assertion kiểm tra responsive, chống tràn ngang và điều hướng bàn phím.
  - **Kiểm thử đóng gói TXT Footnotes & Unicode NFC**: Bổ sung test tự động `tests/txt-footnote-packing.test.ts` kiểm thử toàn diện bóc tách metadata, tạo chú thích `{1}`/`<aside epub:type="footnote">`, phân giải backlink và đóng gói file EPUB ZIP chuẩn hóa Unicode NFC.
  - **Tách nhật ký phát triển**: Chuyển toàn bộ lịch sử chi tiết sang [CHANGELOG.md](CHANGELOG.md), tinh gọn README.
  - **Chất lượng mã nguồn**: Toàn bộ 376/376 unit/integration tests pass (18 test files), 21/21 E2E browser tests pass, 0 lỗi TypeScript, 0 lỗi ESLint, 0 lỗi Knip, production build pass.
- Đang dở: Không.
- Biết trước còn thiếu / nợ kỹ thuật:
  - Tách thanh bước và nhóm menu trong `epub-packer/+page.svelte` và `+layout.svelte` thành component trình bày độc lập (thực hiện sau khi merge branch UI).

---

## 📜 Nhật ký thay đổi (Changelog)

Chi tiết toàn bộ lịch sử phát triển, cập nhật tính năng và sửa lỗi qua các phiên bản được lưu trữ tập trung tại [CHANGELOG.md](CHANGELOG.md).
