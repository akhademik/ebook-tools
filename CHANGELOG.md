# 📜 Nhật ký thay đổi (Changelog) — Ebook Forge

Tài liệu lưu trữ toàn bộ lịch sử phát triển, cập nhật tính năng, tối ưu hóa giao diện và tái cấu trúc hệ thống của **Ebook Forge**.

---

## 2026-11-25 (Khắc phục Triệt để Lỗi Calibre Audit, CSS Descending Specificity & Chuẩn hóa Accessibility EPUB 3)

- Thêm/sửa:
  - `src/lib/epub-packer/templates/css-template/heading-combinators.css`:
    - Tạo file mới chứa các adjacent sibling combinator giữa các heading (`h1.main-chap + h1.main-chap`, `h2.side-chap + h2.side-chap`, `h1.main-chap + h2.side-chap`).
  - `src/lib/epub-packer/templates/css-template/headings.css`:
    - Tách các selector combinator phức tạp sang file riêng, giữ lại thuần túy các class cơ sở (`.dropcap`, `.break-main-chap`, `.main-chap`, `.side-chap`, `.center`, `.left`, `.right`), ngăn chặn việc đảo ngược độ ưu tiên CSS (specificity inversion).
  - `src/lib/epub-packer/templates/css-template/ornaments.css`:
    - Tái cấu trúc selector hoa văn theo thứ tự tăng dần độ ưu tiên tuyệt đối: `.chapter-ornament, .subchapter-ornament` (0,1,0) -> `.chapter-ornament + h1`, `.subchapter-ornament + h2` (0,1,1) -> `.chapter-ornament + h1.main-chap`, `.subchapter-ornament + h2.side-chap` (0,2,1).
  - `src/lib/epub-packer/builders/stylesheet-builder.ts`:
    - Tái thiết kế toàn diện hàm `prepareFinalCss` theo kiến trúc 5 tầng độ ưu tiên (Layered Specificity Architecture):
      - Tầng 1: `@font-face` declarations.
      - Tầng 2: Quy tắc font cơ sở (`h1`, `h2, .side-chap`, `h1 + h2`, `h2 + h2`, `.dropcap`) độ ưu tiên (0,0,x)/(0,1,0).
      - Tầng 3: Quy tắc font cho phân mục phụ (`h2.h2-sub`, `h1 + .subchapter-ornament + h2`) độ ưu tiên (0,1,1)/(0,1,2).
      - Tầng 4: Quy tắc compound class (`.side-chap.h2-sub`, `.side-chap + .side-chap`) độ ưu tiên (0,2,0) cùng `headingCombinatorsCss`.
      - Tầng 5: Quy tắc độ ưu tiên cao (`h1.main-chap + h2.side-chap`, `h1.main-chap + .subchapter-ornament + h2.side-chap`) độ ưu tiên (0,2,2)/(0,3,2).
    - Giải quyết triệt để 5 lỗi Calibre Stylelint `no-descending-specificity` trên mọi kịch bản font và hoa văn.
  - `src/lib/epub-packer/xml-builders/opf-builder.ts`:
    - Tự động bổ sung siêu dữ liệu trợ năng W3C EPUB Accessibility 1.1 trong `content.opf`: `schema:accessMode` (textual, visual), `schema:accessModeSufficient` (textual), `schema:accessibilityFeature` (structuralNavigation, readingOrder, tableOfContents), `schema:accessibilityHazard` (none), và `schema:accessibilitySummary`.
  - `src/lib/epub-packer/builders/asset-builder.ts`:
    - Bổ sung `<title>Bìa sách</title>` và thuộc tính `role="img" aria-label="Bìa sách"` vào thẻ `<svg>` và `<image>` trong trang bìa `cover.xhtml`, giải quyết cảnh báo thiếu alternative text cho ảnh bìa.
  - `src/lib/epub-packer/xml-builders/nav-builder.ts`:
    - Thêm `role="doc-toc"` vào thẻ `<nav epub:type="toc">` trong `nav.xhtml`.
  - `src/lib/epub-packer/parser/txt-parser.ts` & `src/lib/epub-packer/parser/epub-markdown-utils.ts`:
    - Bổ sung các WAI-ARIA roles tương ứng cho các phần tử mang `epub:type`:
      - `role="doc-noteref"` cho link tham chiếu chú thích `<a class="noteref">`.
      - `role="doc-footnote"` cho khối nội dung chú thích `<aside epub:type="footnote">`.
      - `role="doc-backlink"` cho liên kết quay lại nội dung `<a class="notenum">`.
  - `tests/epub-css-specificity.test.ts`:
    - Xây dựng bộ kiểm thử tự động kiểm tra W3C CSS Specificity và mô phỏng chính xác thuật toán Stylelint `no-descending-specificity` của Calibre, kiểm thử EPUB 3 Accessibility metadata, SVG cover accessibility và WAI-ARIA roles.
  - `tests/epub-packer.test.ts`, `tests/epub-parser.test.ts`, `tests/epub-golden.test.ts`, `tests/txt-footnote-packing.test.ts`:
    - Đồng bộ hóa các kỳ vọng kiểm thử với cấu trúc CSS phân tầng và các thuộc tính WAI-ARIA mới.
- Kết quả pipeline: format ✅ | lint ✅ | type check (0 err, 0 warn) ✅ | test unit ✅ (387/387 pass) | test e2e ✅ (21/21 pass) | knip ✅ (0 issues) | build ✅

---

## 2026-11-25 (Loại bỏ Thẻ `<title>` Mặc định cho Trang Căn Giữa `[new:center]` Không Có Heading)

- Thêm/sửa:
  - `src/lib/epub-packer/parser/txt-parser.ts`:
    - Khởi tạo `currentChapter.title = ''` cho khối `[new:center]` thay vì gán cứng placeholder `'Giới Thiệu'`.
    - Tắt cảnh báo thiếu tiêu đề khi đóng khối `[/new:center]` hoặc `[/new]` đối với trang căn giữa `[new:center]`, cho phép người dùng tự do tạo trang đề tặng, trích dẫn, lời tựa không heading mà không sinh cảnh báo gây nhiễu.
  - `src/lib/epub-packer/xml-builders/chapter-builder.ts`:
    - Nhận diện trang căn giữa không tiêu đề (`isCenterPageWithoutHeading = !!chapter.features?.hasCenterPage && (!chapter.hasCustomTitle || chapter.title === 'Giới Thiệu')`).
    - Khi `hasTitle` là false (trang không có tiêu đề hoặc là trang căn giữa không heading), không sinh thẻ `<title>` trong phần `<head>` của file XHTML. Ngăn chặn triệt để tình trạng các máy đọc sách (Apple Books, Kobo, Kindle) hiển thị running header/title không mong muốn như "Giới Thiệu" trên trang lời đề tặng.
  - `src/lib/epub-packer/xml-builders/nav-builder.ts` & `src/lib/epub-packer/components/EpubSourceSection.svelte`:
    - Cập nhật điều kiện lọc `isGeneratedTitle` bổ sung kiểm tra `!c.title?.trim()`, đồng bộ hóa việc loại trừ các trang không tiêu đề khỏi Mục lục (TOC) và danh sách xem trước đầu mục trên giao diện.
  - `tests/epub-parser.test.ts` & `tests/epub-packer.test.ts`:
    - Cập nhật test suite parser phản ánh tiêu đề rỗng cho `[new:center]` khi không có heading.
    - Bổ sung 3 unit tests trong `epub-packer.test.ts` xác thực không chèn thẻ `<title>` vào `<head>` cho trang căn giữa không tiêu đề, không chèn khi có tiêu đề mặc định 'Giới Thiệu' với `hasCustomTitle: false`, và vẫn chèn thẻ `<title>...</title>` chuẩn xác khi người dùng chủ động đặt tiêu đề `@` hoặc `@@`.
- Kết quả pipeline: format ✅ | lint ✅ | type check (0 err, 0 warn) ✅ | test unit ✅ (379/379 pass) | test e2e ✅ (21/21 pass) | knip ✅ (0 issues) | build ✅

---

## 2026-11-25 (Xem trước Trang lót sách đồng bộ Placeholder & Dữ liệu nhập thực tế)

- Thêm/sửa:
  - `src/lib/epub-packer/templates/jacket-templates.ts`:
    - Xuất hằng số cấu hình tập trung `JACKET_SAMPLE_PLACEHOLDERS` (`title: 'Mật Mã Da Vinci'`, `originalTitle: 'The Da Vinci Code'`, `author: 'Dan Brown'`, `translator: 'Đỗ Thu Hà'`, `publisher: '1980 Books'`, `distributor: 'NXB Văn hóa Thông tin'`) làm nguồn chân lý duy nhất (Single Source of Truth) cho dữ liệu mẫu xem trước và placeholder ô nhập.
  - `src/lib/epub-packer/components/EpubMetadataSection.svelte`:
    - Đồng bộ toàn bộ thuộc tính `placeholder` của 6 trường thông tin sách trong Bước 2 (Tiêu đề, Tác giả, Tác phẩm gốc, Dịch giả, Nhà xuất bản, Đơn vị liên kết) trực tiếp với `JACKET_SAMPLE_PLACEHOLDERS`, loại bỏ các chuỗi tĩnh rời rạc.
  - `src/lib/epub-packer/components/EpubJacketCarousel.svelte`:
    - Tích hợp các rune `$derived` theo dõi trạng thái `hasUserInput`.
    - Khi người dùng chưa nhập bất kỳ thông tin nào: Khung xem trước (Jacket Preview) hiển thị toàn bộ nội dung mẫu từ `JACKET_SAMPLE_PLACEHOLDERS`, cho cái nhìn trực quan và sinh động về bố cục trang lót sách.
    - Ngay khi người dùng nhập dữ liệu vào form: Khung xem trước chuyển tức thì sang hiển thị bằng chính dữ liệu người dùng nhập, đảm bảo các trường không nhập (như dịch giả đối với tác phẩm không dịch) không bị lọt thông tin mẫu giả lập vào.
  - `tests/epub-packer.test.ts`:
    - Bổ sung unit test xác thực `JACKET_SAMPLE_PLACEHOLDERS` và kiểm thử toàn diện hành vi render Jacket Preview ở cả 2 trạng thái: dùng placeholder mẫu khi form trống và hiển thị chính xác dữ liệu nhập của người dùng.
- Kết quả pipeline: format ✅ | lint ✅ | type check (0 err, 0 warn) ✅ | test unit ✅ (376/376 pass) | test e2e ✅ (21/21 pass) | knip ✅ (0 issues) | build ✅

---

## 2026-11-25 (Chiết xuất Ngữ cảnh Cảnh báo Cú pháp TXT & Nhận diện Địa chỉ/Số nhà)

- Thêm/sửa:
  - `src/lib/types/epub.type.ts`:
    - Bổ sung trường `context?: string` cho `TxtSyntaxWarning` nhằm lưu trữ trích đoạn ngữ cảnh chứa ký tự bị cảnh báo.
  - `src/lib/epub-packer/parser/txt-syntax-validator.ts`:
    - **Chiết xuất ngữ cảnh 5 ký tự trước & sau**: Bổ sung hàm `extractContextSnippet` tự động trích xuất ~5 ký tự trước và 5 ký tự sau dấu format (`/`, `*`, `_`), hiển thị trực tiếp trong thông báo cảnh báo (ví dụ: `Dòng 171: Có khả năng thiếu dấu '/' (ngữ cảnh: "...21/1 Lê...")`).
    - **Cơ chế Masking giữ nguyên Offset (`maskWithSpaces`)**: Thay thế thao tác xóa chuỗi bằng cơ chế thay thế bằng khoảng trắng cùng độ dài, đảm bảo chỉ số vị trí trích xuất từ dòng gốc `line` luôn chính xác 100%, không bị lệch offset khi có URL hoặc thẻ tag phía trước.
    - **Khớp thông minh số nhà / địa chỉ Việt Nam**: Mở rộng biểu thức lọc số nhà, phân số và ngày tháng (`\b\d+[\p{L}]?(?:\/\d+[\p{L}]?)+\b/gu`), tự động bỏ qua các số nhà phổ biến như `21/1`, `21/1A`, `21/1/3` mà không sinh cảnh báo rác, đồng thời vẫn bảo toàn khả năng phát hiện thiếu dấu in nghiêng `/.../`.
  - `tests/epub-parser.test.ts`:
    - Cập nhật và bổ sung 2 test unit kiểm thử chiết xuất ngữ cảnh 5 ký tự cho dấu `/`, `*`, `_` và xác thực tự động bỏ qua số nhà Việt Nam chuẩn.
- Kết quả pipeline: format ✅ | lint ✅ | type check (0 err, 0 warn) ✅ | test unit ✅ (375/375 pass) | test e2e ✅ (21/21 pass) | knip ✅ (0 issues) | build ✅

---

## 2026-11-25 (Kiểm thử Toàn diện postMessage Thất bại, Benchmark Thực tế Timeout & Chuẩn hóa Changelog)

- Thêm/sửa:
  - `src/lib/pdf-splitter/pdf-splitter.ts`:
    - Xuất hàm `cleanupGrayscaleWorker` và `getPendingGrayscaleJobsCount` hỗ trợ kiểm thử và giám sát trạng thái hàng đợi Worker.
  - `tests/pdf-splitter.test.ts`:
    - **Kiểm thử lỗi đồng bộ `worker.postMessage()` (Review Item A)**: Mô phỏng tình huống `postMessage()` ném lỗi đồng bộ (`DataCloneError: ArrayBuffer at transfer list is detached`). Xác thực: Promise được xử lý fallback sang main thread thành công (`mockCtx.putImageData` được gọi), timer được hủy ngay lập tức (`clearTimeout` được gọi), job bị xóa khỏi map `pendingGrayscaleJobs`, Worker không bị hủy oan (`terminate` không bị gọi), và các job in-flight khác đang chờ trong Worker vẫn an toàn tuyệt đối và hoàn tất thành công.
    - **Benchmark thực nghiệm hiệu năng Grayscale & Biên độ Timeout Thích ứng (Review Item B)**: Đo lường thời gian thực tế xử lý bộ đệm pixel của `processGrayscaleBuffer` trên các kích thước trang PDF quét thực tế:
      - 1MP Text (800x1250): ~31.6ms | Timeout: 15s | Biên độ an toàn: 474x
      - 4MP A4 200 DPI Scan (1654x2338): ~83.5ms | Timeout: 15s | Biên độ an toàn: 180x
      - 8.7MP A4 300 DPI Scan (2480x3508): ~81.1ms | Timeout: 22.05s | Biên độ an toàn: 272x
      - 24MP 600 DPI / Scan khổ lớn (4000x6000): ~226.9ms | Timeout: 45s | Biên độ an toàn: 198x
      - 50MP Scan cực đại 2 trang mở (6000x8333): ~458.6ms | Timeout: 60s | Biên độ an toàn: 131x
      - Kết luận: Thời gian xử lý thực tế luôn < 500ms ngay cả với trang 50MP (190.7MB buffer), chứng minh trần timeout 15s–60s mang lại biên độ an toàn từ 130x đến gần 500x, loại bỏ hoàn toàn nguy cơ timeout giả kể cả trên CPU thiết bị di động bị bóp hiệu năng (throttled).
  - `README.md`:
    - Dọn dẹp toàn bộ các khối changelog trùng lặp theo đúng chỉ đạo người dùng, chuyển liên kết tập trung sang `CHANGELOG.md`.
- Kết quả pipeline: format ✅ | lint ✅ | type check (0 err, 0 warn) ✅ | test unit ✅ (373/373 pass) | test e2e ✅ (21/21 pass) | knip ✅ (0 issues) | build ✅

---

## 2026-11-25 (Bắt lỗi Đồng bộ postMessage Worker & Timeout Thích ứng theo Kích thước Pixel)

- Thêm/sửa:
  - `src/lib/pdf-splitter/pdf-splitter.ts`:
    - **Bắt lỗi đồng bộ `worker.postMessage()`**: Bọc lệnh gọi gửi tin nhắn trong `try ... catch`. Khi `postMessage()` ném lỗi đồng bộ (như buffer bị detached hoặc worker dừng), timer được hủy ngay lập tức qua `clearTimeout(timeoutId)` và job bị xóa khỏi `pendingGrayscaleJobs`, ngăn chặn timer ma kích hoạt `handleWorkerFailure()` làm gián đoạn các job khác sau 15s.
    - **Timeout thích ứng theo độ phân giải (`calculateGrayscaleTimeout`)**: Thay thế giá trị cố định 15s bằng công thức tính toán động thích ứng theo số lượng pixel trang và thông số thiết bị (15s–60s). Trang 2–4MP giữ timeout 15s, trang quét lớn 10–25MP tự động mở rộng thời gian chờ tương ứng, loại bỏ triệt để hiện tượng timeout giả gây x2 tải CPU.
  - `tests/pdf-splitter.test.ts`: Bổ sung kiểm thử unit xác thực hàm `calculateGrayscaleTimeout` với các mức độ phân giải từ 1MP đến 100MP.
  - Làm rõ kiến trúc bộ nhớ: 160MB là trần bộ nhớ của các Blob ZIP được giữ lại trong danh sách kết quả (sliding window 2 phần), giúp RAM không tăng tuyến tính theo độ dài tài liệu.
- Kết quả pipeline: format ✅ | lint ✅ | type check (0 err, 0 warn) ✅ | test unit ✅ (371/371 pass) | test e2e ✅ (21/21 pass) | knip ✅ (0 issues) | build ✅

---

## 2026-11-25 (Khắc phục Triệt để Worker Timeout, An toàn Ngoại lệ & Cửa sổ Trượt Tải ZIP)

- Thêm/sửa:
  - `src/lib/pdf-splitter/pdf-splitter.ts`:
    - **Worker Timeout Failover**: Khi timeout 15s kích hoạt, chuyển sang gọi `handleWorkerFailure()` để terminate triệt để Worker bị đơ, reject toàn bộ pending jobs chuyển sang Main Thread fallback và giải phóng worker cũ, ngăn ngừa tình trạng nhân đôi tải CPU.
    - **Exception Safety cho Reference Count**: Đưa `openPdfDocument()` và toàn bộ logic nạp tài liệu vào trong khối `try ... finally`, đảm bảo `activeGrayscaleTasks` luôn luôn được giảm chính xác kể cả khi mở file PDF thất bại.
    - **Cơ chế Cửa sổ Trượt (Sliding Window Safe Retention)**: Khi bật `autoDownloadParts`, hệ thống duy trì bộ đệm tối đa 2 phần ZIP gần nhất trong RAM thay vì xóa ngay Blob khi vừa gọi `triggerDownload()`. Giúp người dùng có thể tải lại ngay lập tức nếu trình duyệt chặn popup tải nhiều file (Multiple downloads prompt), đồng thời vẫn khóa trần RAM không vượt quá 2 phần (160MB).
  - `src/lib/types/pdf-splitter.type.ts`: Bổ sung các trường `downloadTriggered` và `blobReleased` cho `PdfZipPart` để phản ánh trung thực trạng thái tải.
  - `src/routes/pdf/+page.svelte`: Cập nhật chú thích quyền tải nhiều file trên trình duyệt và hiển thị huy hiệu trạng thái chính xác: `Đã gửi lệnh tải · Trong RAM` / `Đã gửi lệnh tải · Đã giải phóng RAM`.
  - `tests/pdf-splitter.test.ts`: Cập nhật kiểm thử tự động xác thực cơ chế cửa sổ trượt (sliding window) với 3 phần ZIP.
- Kết quả pipeline: format ✅ | lint ✅ | type check (0 err, 0 warn) ✅ | test unit ✅ (371/371 pass) | test e2e ✅ (21/21 pass) | knip ✅ (0 issues) | build ✅

---

## 2026-11-25 (Khắc phục Worker Hang/Timeout, Bảo vệ Đồng thời & Tối ưu Bộ nhớ RAM cho PDF và EPUB)

- Thêm/sửa:
  - `src/lib/pdf-splitter/pdf-splitter.ts`:
    - Thêm `handleWorkerFailure`: khi Web Worker gặp sự cố (`onerror` / `onmessageerror`), toàn bộ pending jobs trong Map được duyệt và reject có thông điệp lỗi cụ thể, kích hoạt khối `catch` chuyển hướng sang Main Thread an toàn thay vì treo vĩnh viễn Promise.
    - Bổ sung timeout an toàn 15s cho từng job gửi Worker, tự động hủy và fallback nếu worker bị đơ.
    - Quản lý vòng đời Worker theo reference count (`activeGrayscaleTasks`), ngăn việc hủy sớm worker khi có tác vụ chạy gối đầu.
    - Hỗ trợ `autoDownloadParts`: tự động kích hoạt tải về trình duyệt và giải phóng Blob (40–80MB/phần) khỏi RAM ngay khi đóng gói xong từng phần ZIP.
  - `src/lib/epub-packer/builders/zip-writer.ts`:
    - Thêm `resolveZipBinaryData`: truyền trực tiếp `Blob` vào JSZip trong môi trường trình duyệt thay vì ép kiểu qua `await blob.arrayBuffer()`, triệt tiêu hoàn toàn việc nhân bản dữ liệu nhị phân trên V8 Heap đối với ảnh bìa, ảnh minh họa, hoa văn và font chữ.
  - `src/routes/pdf/+page.svelte` & `src/lib/pdf-splitter/pdf-splitter-state.svelte.ts`:
    - Bổ sung checkbox tùy chọn tự động tải & giải phóng RAM từng phần ZIP khi không chọn thư mục lưu trực tiếp; hiển thị badge trạng thái "Đã tải (Đã giải phóng RAM)".
  - `tests/pdf-splitter.test.ts`: Bổ sung kiểm thử tự động xác thực tính năng `autoDownloadParts` giải phóng Blob khỏi RAM.
- Kết quả pipeline: format ✅ | lint ✅ | type check (0 err, 0 warn) ✅ | test unit ✅ (371/371 pass) | test e2e ✅ (21/21 pass) | knip ✅ (0 issues) | build ✅

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
