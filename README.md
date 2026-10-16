# ⚒️ Ebook Forge — Bộ Công Cụ Chế Bản Sách Điện Tử

> **Ebook Forge**: Bộ công cụ chuẩn hóa, đóng gói, biên tập và kiểm định sách điện tử hiệu năng cao, hoạt động **100% ngoại tuyến (offline)** trực tiếp trên trình duyệt web của bạn — tệp được xử lý cục bộ và không tải lên bất kỳ máy chủ nào.

---

## 🚀 Các công cụ chính

### 1. ✏️ Chỉnh sửa & Kiểm định EPUB Trực quan (EPUB Editor & Validator Suite)

Bộ công cụ biên tập, tối ưu và xem trước tệp `.epub` toàn diện ngay trên trình duyệt web:

- **Trình soạn thảo mã nguồn chuyên nghiệp**: Tích hợp CodeMirror 6 với syntax highlighting cho HTML, XHTML và CSS, hỗ trợ tự động căn lề, đóng mở thẻ thông minh và phím tắt chuẩn.
- **Xem trước thời gian thực (Live Preview)**: Khung xem trước song song hiển thị tức thì các thay đổi về bố cục, kiểu dáng CSS và hình ảnh.
- **Tự động giải mã Font nhúng (Font De-obfuscation)**: Tự động nhận diện và đảo ngược thuật toán mã hóa font theo chuẩn **IDPF** và **Adobe Mangling** (TTF, OTF, WOFF, WOFF2), hiển thị trung thực typography gốc của sách.
- **Đồng bộ hai chiều thông minh (Sync-View)**:
  - **Sync-Scroll**: Cuộn mã nguồn bên editor thì khung preview tự động cuộn theo vị trí tương ứng và ngược lại.
  - **Sync-Highlight**: Bôi đen một đoạn văn bản bên editor sẽ tự động tìm và làm nổi bật (amber highlight) trong preview; bôi đen bên preview sẽ đưa editor cuộn thẳng tới dòng mã nguồn liên quan.
- **Không gian làm việc linh hoạt**:
  - Thanh phân chia kéo thả (Resizable Split Pane) tùy biến tỷ lệ Editor / Preview.
  - Chế độ xem **100% Real View**
  - Thanh điều hướng cây tệp (File Tree Sidebar) có thể thu gọn tối đa để mở rộng không gian làm việc.
- **Dọn rác & Tối ưu dung lượng (EPUB Optimizer / Cleaner)**:
  - Tự động quét toàn bộ cây tài nguyên sách để lập kế hoạch tối ưu (**Optimization Plan**) chi tiết.
  - Phát hiện hình ảnh, font chữ, tệp CSS và trang XHTML mồ côi (không được tham chiếu trong OPF spine/manifest hoặc HTML).
  - Phát hiện tài nguyên trùng lặp nội dung dựa trên mã băm SHA-1 (Duplicate Detection).
  - Ước tính dung lượng tiết kiệm (Potential Savings) và dọn sạch an toàn chỉ với 1 cú click.
- **Kiểm định & Tương thích máy đọc sách (EPUB Validator)**:
  - Kiến trúc kiểm định DOM/XML nhiều tầng (**ValidationContext** + **ValidationRules**).
  - Kiểm tra chuẩn xác theo các hồ sơ: **Generic EPUB**, **EPUB 3.0** và tiêu chuẩn khắt khe của **Kobo e-Reader**.
  - Quét toàn diện: Cấu trúc ZIP & mimetype, `META-INF/container.xml`, OPF manifest/spine, tính hợp lệ của NCX/NAV TOC, cú pháp XHTML, ID trùng lặp, magic bytes của font chữ và hiển thị ảnh bìa sleep screen.
- **Quản lý Thông tin sách & Tái tạo Mục lục Tự động (Book Operations)**:
  - Chỉnh sửa trực tiếp Metadata sách (Tiêu đề, Tác giả, Ngôn ngữ, Nhà xuất bản, Identifier/ISBN, Ngày phát hành) trong `content.opf`.
  - 1-click tự động tái tạo đồng bộ mục lục thông qua mô hình trung gian **TocTree** thống nhất giữa `nav.xhtml` (EPUB 3) và `toc.ncx` (EPUB 2 / Kobo).
- **Kiểm tra cú pháp & Đóng gói an toàn**: Tự động kiểm tra lỗi cú pháp XML/XHTML trước khi lưu/xuất, cảnh báo khi đóng tab chưa lưu và đóng gói tải về tệp `.epub` hoàn chỉnh chuẩn kỹ thuật.

---

### 2. 📦 Đóng gói EPUB (EPUB Packer)

Tự động chuyển đổi văn bản thô `.txt` hoặc gói tệp Markdown `.zip` thành sách điện tử định dạng `.epub` tiêu chuẩn:

- **Hỗ trợ cú pháp quy ước nhanh cho file `.txt`**:
  - `@@ Tiêu đề` (`@@t`, `@@p`): Tiêu đề chính / tách chương thành file XHTML riêng, tự động đưa vào mục lục (TOC).
  - `@ Tiêu đề` (`@t`, `@p`): Tiêu đề phụ / chương nhỏ trong file, hiển thị trong mục lục.
  - `@! Tiêu đề` (`@!t`, `@!p`): Tiêu đề phụ, không đưa vào mục lục.
  - `[new] ... [/new]`: Gom toàn bộ nội dung bên trong thành 1 trang XHTML độc lập.
  - `[letter] ... [/letter]`, `[letter-box] ... [/letter-box]`, `[poem] ... [/poem]`: Khối định dạng thư từ, hộp viền bọc nội dung (không nối dòng, hỗ trợ lồng thẻ), bài thơ có căn lề và thụt đầu dòng riêng biệt.
  - `~ Lời thoại` / `> Tác giả`: Khối trích dẫn blockquote và tên tác giả.
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

- Trích xuất các trang từ tệp tài liệu PDF thành bộ ảnh JPG độc lập đóng gói dạng `.zip`.
- Chuyển đổi ảnh sang thang độ xám (Grayscale) và tăng độ tương phản, tối ưu hóa cho các phần mềm nhận dạng chữ OCR.
- Xem trước trực quan và thiết lập vùng cắt bỏ **Header / Footer** hàng loạt cho toàn bộ trang sách với xử lý song song đa luồng.

---

### 5. ✍️ Chuẩn hóa Markdown (Markdown Fixer)

- Tự động phát hiện và chuẩn hóa các kiểu định dạng in nghiêng (`*text*`), đậm nghiêng (`***text***`) từ các tệp Markdown OCR thô.
- Thay thế bằng các cặp định dạng ngoặc vuông tùy biến mà vẫn bảo vệ an toàn cho các công thức toán học và footnote dấu sao (`*`).

---

### 6. 💻 Desktop App: TXT → PDF CJK

- Ứng dụng desktop độc lập dành cho Windows chuyên xử lý văn bản chữ Hán / Nôm / CJK sang tệp PDF chất lượng cao.
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

## 🧪 Quy chuẩn Kiểm thử & Chất lượng Mã nguồn (Quality Gates)

Dự án tuân thủ quy trình kiểm thử và chất lượng nghiêm ngặt theo [AI_WORKFLOW.md](AI_WORKFLOW.md):

```bash
# 1. Kiểm tra kiểu dữ liệu TypeScript & Svelte Rune (0 errors, 0 warnings)
pnpm check

# 2. Kiểm tra định dạng & cú pháp ESLint
pnpm lint

# 3. Quét mã rác, file thừa và dependencies không dùng
pnpm knip

# 4. Chạy toàn bộ Unit & Integration Tests (214+ tests)
pnpm test

# 5. Chạy Kiểm thử Giao diện Trình duyệt Thật (Playwright E2E)
pnpm test:e2e
```

---

## 🛡️ Quyền riêng tư & Bảo mật

- **100% Client-Side**: Toàn bộ quá trình đọc, giải nén, bóc tách AI, chỉnh sửa và đóng gói tệp PDF, EPUB, TXT diễn ra hoàn toàn trong bộ nhớ trình duyệt máy tính của bạn.
- **An toàn dữ liệu**: Tệp được xử lý trực tiếp trên thiết bị của bạn và tuyệt đối không tải lên bất kỳ máy chủ bên ngoài nào.

---

## Trạng thái hệ thống

- Cập nhật lần cuối: 2026-10-16 15:25
- Đã hoàn thành:
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
  - Cơ chế **TXT Syntax Pre-flight Validator & Fail-Fast** khi đóng gói EPUB từ tệp `.TXT`.
- Đang dở: Không
- Biết trước còn thiếu / nợ kỹ thuật:
  - `knip` (oxc-parser) gặp lỗi cấp phát bộ nhớ ảo 6 GiB ArrayBuffer trên môi trường Linux có giới hạn virtual memory (`vm.overcommit_memory=0`).

---

## Changelog

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

- Thêm/sửa: Bổ sung cặp thẻ hộp viền `[letter-box]` ... `[/letter-box]` (`<div class="letter-box">`) khi đóng gói EPUB từ tệp TXT và chuyển đổi ngược EPUB sang TXT. Định nghĩa CSS viền 3px, padding và margin chuẩn. Bảo vệ khối hộp khỏi thuật toán gộp đoạn vỡ dòng `mergeBrokenParagraphs`. Cập nhật validator kiểm tra lỗi mở thẻ và quy tắc cấp bậc bọc thẻ (yêu cầu `[new]` bọc ngoài `[letter-box]`). Cập nhật hướng dẫn cú pháp trên UI Modal.
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

- Thêm/sửa: Sửa lỗi kiểm thử E2E Playwright trên CI/CD (`epub-download-inspection.spec.ts` & `epub-workflow.spec.ts`), khớp chính xác thông báo kết quả đọc file `Đã xử lý file .TXT thành công`. Bổ sung tính năng kiểm định cú pháp thẻ mở/đóng cho tệp TXT đóng gói EPUB (`txt-syntax-validator.ts`), báo chính xác số dòng vi phạm và dừng tiến trình khi phát hiện lỗi thẻ chưa đóng. Mở rộng kiểm tra lỗi chú thích `{n}` thiếu ngoặc nhọn đóng và cảnh báo rút gọn rớt cặp định dạng inline (`*`, `/`, `_`), loại bỏ false flag cho các ký tự độc lập. Hỗ trợ khối chú thích footnote nhiều dòng (Multi-line Footnote Block) gom trọn vẹn vào thẻ `<aside>`. Tách riêng khu vực hiển thị cảnh báo trên UI.
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

- Thêm/sửa: Nâng cấp Reverse Engine **EPUB to TXT** mở rộng hỗ trợ cho các tệp EPUB thông thường (nhận diện mọi `<h1>` &rarr; `@@`, `<h2>` &rarr; `@`, `<b>`/`<strong>` &rarr; `*bold*`, `<i>`/`<em>` &rarr; `/italic/`, tự động phát hiện mọi biến thể ngắt phân cảnh `***`, `* * *`, `• • •`, `---`, `*`, `hr` &rarr; `###`, `##`, `#`).
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
