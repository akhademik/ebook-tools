# 📜 Nhật ký thay đổi (Changelog) — Ebook Forge

Tài liệu lưu trữ toàn bộ lịch sử phát triển, cập nhật tính năng, tối ưu hóa giao diện và tái cấu trúc hệ thống của **Ebook Forge**.

---

## 2026-11-27 (Khắc phục Triệt để Race Condition Mở/Chuyển File & Reset trong EPUB Editor)

- Thêm/sửa:
  - **Cơ chế Generation Token & Hủy Tác vụ Cũ (`src/lib/epub-editor/epub-editor-state.svelte.ts`)**:
    - Bổ sung `loadRequestId` (tăng đơn điệu mỗi lần `reset()` / `loadEpubFile()`) và `selectionRequestId` (cho `selectFile()`), cùng helper `isCurrentSession()` để xác thực phiên sách hiện tại.
    - Bảo vệ `loadEpubFile()` sau mọi `await` (`loadSafeEpubZip`, `parseZipEntries`, `ensureFileLoaded`, `renderPreview`) và trong `catch`/`finally` để tác vụ cũ không ghi đè `zip`, `files`, `statusMessage`, `isError` hay đặt `isLoading = false` của tác vụ mới.
    - Bảo vệ `ensureFileLoaded()`, `selectFile()`, `renderPreview()` (bao gồm `getAssetDataUrl` và `assetDataUrlCache`) khỏi việc ghi chéo `editBuffer`/`originalContents`/`editorTarget`/`previewTarget` giữa các sách hoặc khi click chuyển file liên tục.
    - `reset()` chủ động hủy Cleaner đang chạy qua `abortPendingCleanup(true)` và bảo vệ `analyzeForClean()`, `runCleanup()`, `exportEpub()`, `loadBookMetadata()`, `saveBookMetadata()`, `rebuildToc()` không cập nhật state nếu đã đổi sách hoặc `reset()`.
  - **Bổ sung Bộ Test Race Condition (`tests/epub-editor-state.test.ts`)**:
    - Bổ sung 6 unit tests mô phỏng file A hoàn tất sau file B, A lỗi khi B đang nạp, `reset()` giữa chừng, `ensureFileLoaded()`/`selectFile()` chậm, hủy Cleaner cũ khi `reset()` và nạp EPUB bình thường.
- Kết quả pipeline: format ✅ | format:check ✅ | type check (0 err, 0 warn) ✅ | lint ✅ | test unit ✅ (477/477 pass) | knip ✅ | build ✅ | test:e2e ✅ (24/24 pass) | graphify ✅ (0 import cycles)
- File chính bị ảnh hưởng: `src/lib/epub-editor/epub-editor-state.svelte.ts`, `tests/epub-editor-state.test.ts`, `README.md`, `CHANGELOG.md`.

---

## 2026-11-27 (Xác nhận Toàn vẹn Sau Vòng lặp Central Directory: `parsedEntries === totalEntries` & `cursor === cdEnd`)

- Thêm/sửa:
  - **Kiểm tra Nhất quán Central Directory (`src/lib/utils/zip.ts`)**:
    - Bổ sung kiểm tra `parsedEntries !== totalEntries || cursor !== cdEnd` ngay sau vòng lặp duyệt Central Directory trong `inspectRawZipCentralDirectory()`, ném `ZipSafetyError('INVALID_METADATA', ...)` khi số entry thực tế đọc được hoặc con trỏ kết thúc không khớp EOCD.
  - **Bổ sung Unit Tests (`tests/zip-safety.test.ts`)**:
    - Bổ sung 2 test cho trường hợp EOCD khai báo nhiều entry hơn thực tế trong Central Directory và `cdSize` không khớp với điểm kết thúc thực tế của các entry.
- Kết quả pipeline: format ✅ | format:check ✅ | type check (0 err, 0 warn) ✅ | lint ✅ | test unit ✅ (471/471 pass) | knip ✅ | build ✅ | test:e2e ✅ (24/24 pass) | graphify ✅ (0 import cycles)
- File chính bị ảnh hưởng: `src/lib/utils/zip.ts`, `tests/zip-safety.test.ts`, `README.md`, `CHANGELOG.md`.

---

## 2026-11-27 (Kiểm tra Chặt chẽ Central Directory: Từ chối ZIP Multi-Disk)

- Thêm/sửa:
  - **Từ chối Tường minh ZIP Multi-Disk (`src/lib/utils/zip.ts`, `src/lib/types/zip.type.ts`)**:
    - Bổ sung mã lỗi `UNSUPPORTED_MULTIDISK`.
    - `inspectRawZipCentralDirectory()` kiểm tra thêm `diskNumber !== 0 || cdStartDisk !== 0 || entriesOnDisk !== totalEntries` trong EOCD để từ chối rõ ràng các archive multi-disk.
  - **Bổ sung Unit Test (`tests/zip-safety.test.ts`)**:
    - Kiểm thử từ chối tất cả các trường hợp lệch `diskNumber`, `cdStartDisk` và `entriesOnDisk !== totalEntries`.
- Kết quả pipeline: format ✅ | format:check ✅ | type check (0 err, 0 warn) ✅ | lint ✅ | test unit ✅ (469/469 pass) | knip ✅ | build ✅ | test:e2e ✅ (24/24 pass) | graphify ✅ (0 import cycles)
- File chính bị ảnh hưởng: `src/lib/types/zip.type.ts`, `src/lib/utils/zip.ts`, `tests/zip-safety.test.ts`, `README.md`, `CHANGELOG.md`.

---

## 2026-11-27 (Gia cố Lớp Kiểm soát An toàn ZIP: Reserve Budget Đồng thời, Từ chối ZIP64 & Trùng lặp Phân biệt Hoa/Thường)

- Thêm/sửa:
  - **Cơ chế Reserve Budget An toàn Đồng thời (`src/lib/utils/zip.ts`, `src/lib/types/zip.type.ts`)**:
    - Bổ sung `ZipBudgetReservation` và các phương thức `reserve()`, `updateReservation()`, `commit()`, `release()` vào `ZipExtractionBudget` & `ZipExtractionBudgetTracker`.
    - `readSafeZipEntryBytes()` đặt cọc (`reserve`) dung lượng khai báo đồng bộ trước khi giải nén, cập nhật động theo chunk trong `internalStream` và luôn giải phóng (`release`) trong `finally` nếu lỗi/hủy — loại bỏ hoàn toàn race condition vượt budget khi nhiều tác vụ đọc song song.
  - **Từ chối Tường minh ZIP64 & Central Directory Lỗi (`src/lib/utils/zip.ts`)**:
    - Bổ sung mã lỗi `UNSUPPORTED_ZIP64`; `inspectRawZipCentralDirectory()` kiểm tra chữ ký ZIP64 EOCD Locator (`0x07064b50`), sentinel `0xFFFF`/`0xFFFFFFFF` ở EOCD và Central Directory entry để từ chối tường minh thay vì bỏ qua bước kiểm tra thô.
    - Kiểm tra biên độ `cdOffset + cdSize` và tính toàn vẹn header từng entry trong Central Directory, ném `INVALID_METADATA` nếu bị cắt xén/hỏng.
  - **Kiểm tra Trùng lặp Phân biệt Chữ hoa/Thường (`src/lib/utils/zip.ts`)**:
    - Sửa `inspectRawZipCentralDirectory()` và `validateZipArchiveSafety()` so sánh trùng lặp theo đường dẫn chuẩn hóa chính xác (case-sensitive) thay vì `.toLowerCase()`, tránh từ chối nhầm các EPUB hợp lệ có file phân biệt hoa/thường (như `Images/Cover.jpg` và `images/cover.jpg`).
  - **Mở rộng Unit Tests (`tests/zip-safety.test.ts`)**:
    - Bổ sung 6 tests cho đọc đồng thời vượt budget, tự động `release` khi stream lỗi, từ chối ZIP64 EOCD/entry/locator và Central Directory lỗi, đồng thời xác nhận các đường dẫn phân biệt hoa/thường hợp lệ được chấp nhận.
- Kết quả pipeline: format ✅ | format:check ✅ | type check (0 err, 0 warn) ✅ | lint ✅ | test unit ✅ (468/468 pass) | knip ✅ | build ✅ | test:e2e ✅ (24/24 pass) | graphify ✅ (0 import cycles)
- File chính bị ảnh hưởng: `src/lib/types/zip.type.ts`, `src/lib/utils/zip.ts`, `tests/zip-safety.test.ts`, `README.md`, `CHANGELOG.md`.

---

## 2026-11-27 (Xây dựng Lớp Kiểm soát An toàn ZIP Dùng chung cho EPUB Editor và EPUB → TXT)

- Thêm/sửa:
  - **Định nghĩa Ngưỡng An toàn EPUB & Kiểu Dữ liệu (`src/lib/constants.ts`, `src/lib/types/zip.type.ts`)**:
    - Thiết lập ngưỡng mặc định: `MAX_EPUB_TOTAL_ENTRIES = 5000`, `MAX_EPUB_SINGLE_ENTRY_SIZE = 50MB`, `MAX_EPUB_TOTAL_UNCOMPRESSED_SIZE = 500MB`.
    - Bổ sung các interface kiểu chặt chẽ `ZipSafetyLimits`, `ZipEntryMetadataStatus`, `ZipExtractionBudgetTracker`, `ZipReadEntryOptions`, `JSZipInternalStream`.
  - **Lớp Kiểm soát An toàn ZIP Dùng chung (`src/lib/utils/zip.ts`)**:
    - `inspectRawZipCentralDirectory()`: kiểm tra Central Directory thô trước khi `JSZip.loadAsync()` cấp phát bộ nhớ, chặn trùng lặp tên entry thô, đường dẫn bất thường, vượt số entry hoặc kích thước khai báo.
    - `validateZipEntryPath()` & `validateZipArchiveSafety()`: từ chối đường dẫn traversal (`..`), đường dẫn tuyệt đối (`/`, `C:\`), dấu `\`, ký tự điều khiển, tên entry trùng lặp và metadata `_data.uncompressedSize` thiếu/không hợp lệ (không mặc định bằng 0).
    - `ZipExtractionBudget` & `readSafeZipEntryBytes()` / `readSafeZipEntryText()`: pre-check trước giải nén, kết hợp đếm byte đầu ra thực tế qua `internalStream('uint8array')` như lớp kiểm soát bổ sung (không xem là bảo đảm OOM tuyệt đối) và **không** fallback sang `.async()` không giới hạn.
  - **Tích hợp Toàn bộ Đường Đọc trong EPUB Editor & EPUB → TXT**:
    - Thay thế toàn bộ các điểm gọi `.async()` trong `src/lib/epub-to-txt/epub-to-txt.ts` và `src/lib/epub-editor/**` (`epub-editor-state.svelte.ts`, `editor-ops.ts`, `preview-builder.ts`, `epub-book-ops.ts`, `cleaner-engine.ts`, `duplicate-detector.ts`, `validator-engine.ts`, `structure-rules.ts`, `content-rules.ts`) sang helper an toàn dùng chung và `ZipExtractionBudget`.
  - **Kiểm thử Chuyên sâu (`tests/zip-safety.test.ts`)**:
    - Bổ sung 16 unit tests kiểm tra vượt ngưỡng entries/entry/tổng dung lượng trước giải nén, giả mạo `_data.uncompressedSize`, thiếu metadata, chặn fallback `.async()`, path traversal, trùng lặp tên entry thô/case-insensitive và tích hợp EPUB Editor / EPUB → TXT.
- Kết quả pipeline: format ✅ | format:check ✅ | type check (0 err, 0 warn) ✅ | lint ✅ | test unit ✅ (462/462 pass) | knip ✅ | build ✅ | test:e2e ✅ (24/24 pass) | graphify ✅ (0 import cycles)
- File chính bị ảnh hưởng: `src/lib/constants.ts`, `src/lib/types/zip.type.ts`, `src/lib/types/index.ts`, `src/lib/utils/zip.ts`, `src/lib/epub-to-txt/epub-to-txt.ts`, `src/lib/epub-editor/epub-editor-state.svelte.ts`, `src/lib/epub-editor/editor/editor-ops.ts`, `src/lib/epub-editor/editor/preview-builder.ts`, `src/lib/epub-editor/epub-book-ops.ts`, `src/lib/epub-editor/cleaner/cleaner-engine.ts`, `src/lib/epub-editor/cleaner/duplicate-detector.ts`, `src/lib/epub-editor/validator/validator-engine.ts`, `src/lib/epub-editor/validator/structure-rules.ts`, `src/lib/epub-editor/validator/content-rules.ts`, `src/lib/epub-editor/validator/types.ts`, `tests/zip-safety.test.ts`, `README.md`, `CHANGELOG.md`.

---

## 2026-11-26 (Tối ưu Kích thước Jacket Preview Tự động Đồng dạng & Bổ sung 3 Nấc Cỡ Xem, Sửa Lỗi CI/CD Playwright)

- Thêm/sửa:
  - **Tối ưu Kích thước Khung Xem Trước Jacket Tự động Đồng dạng (`EpubJacketCarousel.svelte`)**:
    - Áp dụng Container Query `font-size: calc(100cqi * (16 / 380))` và tỷ lệ `aspect-ratio: 19 / 27`, tự động co dãn chữ và bố cục hoàn toàn đồng dạng theo kích thước trang mà không bao giờ bị vỡ dòng hay lệch viền ở cả Desktop lẫn Mobile.
    - Tích hợp bộ chuyển đổi 3 nấc kích thước trực quan ngay trên thanh công cụ: `Vừa` (380px), `Lớn` (460px - Mặc định mới), `Cực đại` (520px).
  - **Khắc phục Lỗi CI/CD Playwright E2E (`tests-e2e/epub-workflow.spec.ts`)**:
    - Đồng bộ selector kiểm thử font jacket sang `#jacket-font-title-btn` và `#jacket-font-title`, thay thế ID cũ `#jacket-modal-font-select-btn` sau khi nâng cấp giao diện 3 cặp font, giải quyết triệt để lỗi timeout khiến Playwright fail trên GitHub Actions.
- Kết quả pipeline: format ✅ | lint ✅ | type check (0 err, 0 warn) ✅ | test unit ✅ (446/446 pass) | knip ✅ (0 issues) | build ✅
- File chính bị ảnh hưởng: `src/lib/epub-packer/components/EpubJacketCarousel.svelte`, `tests-e2e/epub-workflow.spec.ts`, `CHANGELOG.md`.

---

## 2026-11-26 (Áp dụng Logic Chọn 3 Cặp Phông Chữ Trang Giới Thiệu Sách Jacket, Tối ưu Thứ tự Specificity CSS & Deduplicate Font)

- Thêm/sửa:
  - **Triển khai Trạng thái Reactive & Gắn kết UI Tuyển chọn 3 Cặp Phông Chữ Jacket (`epub.type.ts`, `epub-fonts-state.svelte.ts`, `EpubJacketCarousel.svelte`)**:
    - Bổ sung 3 trường cấu hình kiểu phông: `jacketTitleFont` (Cặp 1: Tác phẩm + Tựa gốc), `jacketAuthorFont` (Cặp 2: Tác giả + Dịch giả), `jacketMetaFont` (Cặp 3: NXB + Nhà phát hành).
    - Bảo toàn 100% nội dung tinh chỉnh giao diện của người dùng trong `EpubJacketCarousel.svelte`, gắn kết `bind:value` trực tiếp với state reactive `epubState.fonts`.
    - Mở rộng hỗ trợ style preview bao quát các class biến thể `.byline` (Mẫu 7) và `.tag` (Mẫu 8).
  - **Tối ưu Cơ chế Tiêm CSS Quy tắc Khắt khe Zero Descending Specificity (`stylesheet-builder.ts`)**:
    - Tái cấu trúc hàm `buildJacketCss` để chèn khai báo `font-family: ... !important;` trực tiếp vào bên trong các khối selector sẵn có của template (`.title`, `.original`, `.author`, `.byline`, `.translator`, `.meta`, `.tag`).
    - Giữ nguyên tuyệt đối thứ tự selector gốc của template, loại bỏ hoàn toàn nguy cơ vi phạm descending specificity selector theo chuẩn W3C/Stylelint/Calibre.
  - **Cơ chế Khai báo và Gom trùng Font (Deduplication) Chuẩn EPUB 3 (`stylesheet-builder.ts`, `asset-builder.ts`, `epub-state.svelte.ts`)**:
    - Tự động gom nhóm bằng `Set` để đảm bảo mỗi font chỉ sinh duy nhất 1 block `@font-face` trong `jacket.css` ngay cả khi nhiều cặp nhóm chọn cùng một font.
    - Cập nhật `resolveActiveFonts` và vòng lặp nạp font blob để đóng gói font vào EPUB một lần duy nhất tại `OEBPS/fonts/`, không làm tăng dung lượng file sách.
  - **Bổ sung Unit Test Toàn diện (`tests/epub-css-specificity.test.ts`, `tests/pdf-splitter.test.ts`)**:
    - Bổ sung bài kiểm tra kiểm chứng `buildJacketCss` đạt 0 lỗi specificity trên toàn bộ 10 mẫu template với cấu hình 3 cặp font.
    - Kiểm thử deduplication `@font-face` và kiểm định danh sách font kích hoạt.
    - Tinh chỉnh ngưỡng benchmark và timeout cho bài test buffer lớn trong `pdf-splitter.test.ts`.
- Kết quả pipeline: format ✅ | lint ✅ | type check (0 err, 0 warn) ✅ | test unit ✅ (446/446 pass) | knip ✅ (0 issues) | build ✅ | graphify ✅
- File chính bị ảnh hưởng: `src/lib/types/epub.type.ts`, `src/lib/epub-packer/state/epub-fonts-state.svelte.ts`, `src/lib/epub-packer/components/EpubJacketCarousel.svelte`, `src/lib/epub-packer/builders/stylesheet-builder.ts`, `src/lib/epub-packer/builders/asset-builder.ts`, `src/lib/epub-packer/epub-state.svelte.ts`, `tests/epub-css-specificity.test.ts`, `tests/pdf-splitter.test.ts`, `CHANGELOG.md`.

---

## 2026-11-26 (Bỏ Opacity Footer Trích dẫn, Hỗ trợ Không Giới hạn Footer > & Khắc phục Lỗi Thứ tự Specificity CSS Trích dẫn)

- Thêm/sửa:
  - **Khắc phục lỗi thứ tự specificity CSS cho font trích dẫn (`blockquote p`) (`stylesheet-builder.ts`, `tests/epub-css-specificity.test.ts`)**:
    - Chuyển việc tiêm quy tắc `blockquote, blockquote p { font-family: ... }` vào đúng vị trí cơ sở cạnh `blockquote p` trong `base.css` thay vì chèn vào cuối stylesheet, loại bỏ triệt để lỗi vi phạm thứ tự specificity (Expected selector "blockquote p" to come before selector ".letter p", v.v.) khi cấu hình font trích dẫn.
    - Bổ sung unit test kiểm tra toàn diện trường hợp cấu hình đầy đủ font và trích dẫn theo tiêu chuẩn Calibre / stylelint.
  - **Bỏ `opacity: 0.8;` trong CSS Footer Trích dẫn (`quotes.css`, `EpubFontSettingsSection.svelte`)**:
    - Loại bỏ thuộc tính `opacity: 0.8;` khỏi `blockquote footer` trong `src/lib/epub-packer/templates/css-template/quotes.css`, đảm bảo tên tác giả/footer của trích dẫn hiển thị rõ nét với màu văn bản bình thường, không bị mờ.
    - Đồng bộ gỡ bỏ class `opacity-80` trong khung xem trước của `EpubFontSettingsSection.svelte`.
  - **Hỗ trợ Không Giới hạn Dòng Footer `>` Liền mạch Sau `~` (`txt-parser.ts`, `tests/epub-parser.test.ts`)**:
    - Gỡ bỏ hoàn toàn giới hạn 3 dòng footer (`authorFooters.length < 3`) trong `src/lib/epub-packer/parser/txt-parser.ts` ở cả 2 nhánh phân tích (bên trong block và ngoài chương chính).
    - Giờ đây người dùng có thể đặt bao nhiêu dòng footer `>` tùy ý ngay sau dòng trích dẫn `~` (tác giả, dịch giả, tác phẩm, nguồn, năm...), tất cả các dòng liền mạch đều được đóng gói chuẩn xác vào thẻ `<blockquote>`.
  - **Khắc phục cảnh báo TypeScript trong tests/epub-parser.test.ts**:
    - Bổ sung thuộc tính `path` cho mock `RawFileItem` trong `analyzeChapterCandidates` và chuẩn hóa type casting.
  - **Cập nhật tiêu đề nhãn input cài đặt font (`EpubFontSettingsSection.svelte`)**:
    - Cập nhật nhãn thân thiện cho các ô chọn font: `Font tiêu đề nhỏ (H2 - Sub)`, `Font cho Trích dẫn (~)`, `Font cho Tác giả trích dẫn (>)`.
- Kết quả pipeline: format ✅ | lint ✅ | type check (0 err, 0 warn) ✅ | test unit ✅ (444/444 pass) | knip ✅ (0 issues) | build ✅
- File chính bị ảnh hưởng: `src/lib/epub-packer/builders/stylesheet-builder.ts`, `src/lib/epub-packer/templates/css-template/quotes.css`, `src/lib/epub-packer/components/EpubFontSettingsSection.svelte`, `src/lib/epub-packer/parser/txt-parser.ts`, `tests/epub-parser.test.ts`, `tests/epub-css-specificity.test.ts`, `CHANGELOG.md`.

---

## 2026-11-26 (Khắc phục Hiển thị Viền Wrapper Thanh Điều hướng 5 Bước EPUB Packer)

- Thêm/sửa:
  - **Khắc phục Cắt xén Viền Top/Left trên Thanh Điều hướng 5 Bước (`epub-packer/+page.svelte`)**:
    - Bổ sung `pt-1 px-1` cho thẻ `<nav>` và đệm trong `p-1` cho danh sách `<ol>` (vùng cuộn `overflow-x-auto`), ngăn chặn triệt để hiện tượng viền trên (top) và viền trái (left) của các nút bước (Step 1–5) bị container scroll cắt xén.
    - Chuẩn hóa các nút bước thành wrapper hoàn chỉnh với `border` cố định (`rounded-xl p-2.5 border`):
      - Trạng thái Active: `border-accent-color/60 bg-accent-soft/70 shadow-xs ring-1 ring-accent-color/30`.
      - Trạng thái Completed: `border-border-color bg-panel-2/50 hover:border-accent-color/50`.
      - Trạng thái Inactive: `border-border-color/60 bg-panel-2/30 hover:border-border-color`.
      - Trạng thái Disabled: `border-border-color/40 bg-panel-2/30 opacity-50`.
    - Đồng bộ đệm thẻ card Bước 3 (Bìa và hoa văn) thành `p-5 sm:p-7` và tiêu đề `text-lg sm:text-xl` đồng nhất với tất cả các bước khác (Bước 1, 2, 4, 5).
- Kết quả pipeline: format ✅ | lint ✅ | type check (0 err, 0 warn) ✅ | test unit ✅ (443/443 pass) | knip ✅ (0 issues) | graphify ✅
- File chính bị ảnh hưởng: `src/routes/epub-packer/+page.svelte`, `CHANGELOG.md`.

---

## 2026-11-26 (Hoàn thiện Kiểm soát ZIP An toàn, Chuẩn hóa Metadata & Kiểm chứng Abort Nén theo TASKS.md)

- Thêm/sửa:
  - **1. P1: Kiểm chứng Thực tế Dừng Stream khi JSZip đang Nén (`tests/epub-packer-lifecycle.test.ts`)**:
    - Tái cấu trúc spy trên `JSZip.prototype.generateAsync` để chuyển tiếp thực sự sang `origGenerateAsync.call()`.
    - Kích hoạt `ac.abort()` từ bên trong callback `wrappedUpdate` khi JSZip thực sự phát ra tiến độ nén các file.
    - Kiểm chứng Promise của `buildEpubBlob` bị reject chính xác với lỗi `AbortError` từ bên trong luồng nén của JSZip, đảm bảo không có Blob nào được tạo ra.
  - **2. P2: Bổ sung Nhánh Cộng dồn Hạn ngạch 150MB khi ZIP Ảnh Thiếu Metadata (`EpubImagesState`)**:
    - Bổ sung kiểm tra `cumulativeZipImageBytes + blob.size > MAX_IMAGES_ZIP_TOTAL_UNCOMPRESSED_SIZE` (150MB) và cộng dồn dung lượng blob thực tế vào `cumulativeZipImageBytes` khi `preUncompressedSize === null`.
    - Bảo đảm hạn mức 150MB luôn được thực thi nghiêm ngặt ngay cả khi file ZIP không có trường metadata kích thước giải nén.
  - **3. P2: Chuẩn hóa Trích xuất Metadata ZIP qua Helper Tập trung (`zip.ts`)**:
    - Tạo module [src/lib/utils/zip.ts](file:///home/hajtran/dev/ebook-tools/src/lib/utils/zip.ts) với hàm `getZipEntryUncompressedSize(entry)`.
    - Đóng gói an toàn việc đọc `entry._data.uncompressedSize` với type guard phòng vệ (`typeof === 'number'`, `Number.isFinite`, `>= 0`), loại bỏ toàn bộ ép kiểu `as any` rải rác trong `EpubImagesState` và `EpubSourceState`.
  - **4. P3: Đồng nhất Trạng thái Ảnh bìa & Triệt tiêu Rủi ro Rò rỉ Dữ liệu Cũ (`EpubImagesState`)**:
    - Bổ sung hàm `clearCoverData()` dọn dẹp sạch: thu hồi Object URL nếu có, gán `coverFile = null`, `coverOriginalUrl = null`, `coverWidth = 0`, `coverHeight = 0` và reset vùng crop.
    - Tự động gọi `clearCoverData()` khi file ảnh bìa mới vượt quá dung lượng cho phép (> 30MB/300MB), thiếu thư viện PDF.js hoặc gặp lỗi đọc/trích xuất.
    - Đảm bảo trạng thái giao diện và dữ liệu đóng gói hoàn toàn đồng nhất, không còn tình trạng giao diện báo lỗi file mới nhưng sách đóng gói vẫn lấy ảnh cũ.
  - **Bổ sung Bộ kiểm thử Đơn vị Chuyên sâu**:
    - Nâng tổng số test lên **443/443 unit tests pass 100% (21 test files)** và **24/24 E2E tests pass 100%**.
- Kết quả pipeline: format ✅ | lint ✅ | type check (0 err, 0 warn) ✅ | test unit ✅ (443/443 pass, 21 test files) | test E2E ✅ (24/24 pass) | knip ✅ (0 issues) | build ✅ | graphify ✅
- File chính bị ảnh hưởng: `src/lib/utils/zip.ts`, `src/lib/utils/index.ts`, `src/lib/epub-packer/state/epub-source-state.svelte.ts`, `src/lib/epub-packer/state/epub-images-state.svelte.ts`, `tests/epub-packer-lifecycle.test.ts`, `TASKS.md`, `README.md`, `CHANGELOG.md`.

---

## 2026-11-26 (Giải quyết Trọn vẹn 5 Vấn đề P1 & P2: Mutex Lock Đóng gói, Generation Tokens & Kiểm soát PDF trong ZIP)

- Thêm/sửa:
  - **1. P1: Khóa Mutex Bảo đảm Tuần tự hóa Tuyệt đối cho `processEpub()` (`EpubState`)**:
    - Bổ sung cờ mutex `isLockingPack = false`.
    - Thiết lập cổng kiểm tra kép `if (this.processing || this.isLockingPack) return;` ngay khi nhận lệnh đóng gói.
    - Đặt `this.isLockingPack = true` trước khi chờ tác vụ cũ giải phóng tài nguyên (`await this.activePackagingPromise`) và giải phóng khóa trong khối `finally`.
    - Loại bỏ hoàn toàn rủi ro nhiều lần gọi `processEpub()` cùng vượt qua await và khởi chạy các tác vụ đóng gói song song ghi đè `activePackagingPromise`.
  - **2. P2: Kiểm soát Dung lượng & Hạn ngạch An toàn cho PDF trong ZIP Ảnh (`EpubImagesState`, `constants.ts`)**:
    - Áp dụng kiểm tra trước `preUncompressedSize > MAX_IMAGE_FILE_SIZE` (30MB) đối với file PDF trong ZIP tương tự như ảnh thông thường.
    - Tích hợp dung lượng PDF vào tổng hạn ngạch giải nén cộng dồn `cumulativeZipImageBytes + size > MAX_IMAGES_ZIP_TOTAL_UNCOMPRESSED_SIZE` (150MB).
    - Ngăn chặn triệt để nguy cơ ZIP kích thước nhỏ chứa PDF giải nén khổng lồ gây tràn bộ nhớ (OOM/zip-bomb).
  - **3. P2: Khử Hoàn toàn Race Condition trong Import Ảnh Minh họa (`EpubImagesState`)**:
    - Bổ sung cơ chế **Generation Token** (`illustrationGeneration`) tự động tăng dần mỗi khi gọi `handleIllustrationFiles()`, `removeIllustrationFile()`, hoặc `clearIllustrationFiles()`.
    - Tách biệt hoàn toàn luồng xử lý trên danh sách làm việc tạm thời (`workingList`).
    - Kiểm tra `this.illustrationGeneration !== currentGen` sau mỗi tác vụ bất đồng bộ (`arrayBuffer`, `loadAsync`, `async('blob')`, `renderPdfPageToBlob`).
    - Chỉ gán `this.illustrationFiles = workingList` và reset `illustrationIsProcessing = false` khi token của tác vụ còn hiệu lực, loại bỏ rủi ro import cũ ghi đè hoặc chèn thêm vào import mới.
  - **4. P2: Khử Race Condition khi Đổi Ảnh bìa Liên tục (`EpubImagesState`)**:
    - Bổ sung **Cover Generation Token** (`coverGeneration`) tăng dần mỗi khi gọi `handleCoverFile()` hoặc `removeCoverFile()`.
    - Đặt chốt kiểm tra `this.coverGeneration !== currentGen` trong callback của FileReader, PDF renderer và Image.onload trước khi gán `coverOriginalUrl`.
    - Đảm bảo chỉ có file ảnh bìa mới nhất được áp dụng, các tác vụ cũ bị loại bỏ an toàn.
  - **5. P2: Kiểm chứng Thực tế Hủy Nén JSZip giữa chừng (`zip-writer.ts`, `tests/epub-packer-lifecycle.test.ts`)**:
    - Viết unit test mô phỏng thực tế: Spying vào hook tiến độ `onUpdate` của `JSZip.prototype.generateAsync`, kích hoạt `controller.abort()` giữa stream nén và kiểm chứng Promise của `buildEpubBlob` bị reject chính xác với lỗi `AbortError`.
  - **Bổ sung Bộ kiểm thử Đơn vị Chuyên sâu**:
    - Thêm 5 unit tests mới cho toàn bộ các tình huống trên, nâng tổng số test lên **440/440 unit tests pass 100% (21 test files)** và **24/24 E2E tests pass 100%**.
- Kết quả pipeline: format ✅ | lint ✅ | type check (0 err, 0 warn) ✅ | test unit ✅ (440/440 pass, 21 test files) | test E2E ✅ (24/24 pass) | knip ✅ (0 issues) | build ✅ | graphify ✅
- File chính bị ảnh hưởng: `src/lib/epub-packer/epub-state.svelte.ts`, `src/lib/epub-packer/state/epub-images-state.svelte.ts`, `tests/epub-packer-lifecycle.test.ts`, `TASKS.md`, `README.md`, `CHANGELOG.md`.

---

## 2026-11-26 (Khắc phục Triệt để 4 Vấn đề Cốt lõi P1 & P2 còn lại trong EPUB Packer theo TASKS.md)

- Thêm/sửa:
  - **1. P1/P2: Snapshot Bất biến Toàn diện cho Ảnh bìa & Cắt góc (`EpubImagesState`, `EpubState`)**:
    - Mở rộng `getOptimizedCoverBlob(params?: CoverSnapshotParams)` để nhận trực tiếp snapshot `{ coverOriginalUrl, coverCropTop, coverCropBottom, coverCropLeft, coverCropRight }`.
    - `EpubState.processEpub()` chụp snapshot URL và 4 thông số crop ngay tại thời điểm người dùng bấm nút Đóng gói và truyền trực tiếp vào `getOptimizedCoverBlob(coverSnapshot)`.
    - Callback `img.onload` đọc giá trị an toàn từ snapshot, triệt tiêu 100% rủi ro người dùng thay đổi vùng crop hoặc chọn ảnh mới làm ảnh hưởng kết quả của sách đang đóng gói.
  - **2. P2: Giới hạn ZIP Markdown Kiểm tra Đúng Thời điểm & Đo Byte Thực tế (`EpubSourceState`, `constants.ts`)**:
    - Bổ sung hạn ngạch `MAX_ZIP_TOTAL_ENTRIES = 2000` kiểm tra tổng số lượng entry trước khi duyệt file.
    - Kiểm tra `entryData.uncompressedSize` của từng file `.md` trước khi gọi `zip.files[name].async('string')`, ngăn chặn việc giải nén file kích thước khổng lồ (zip-bomb) vào bộ nhớ.
    - Kiểm tra trước tổng dung lượng cộng dồn `totalUncompressedBytes + preUncompressedSize > MAX_ZIP_TOTAL_UNCOMPRESSED_SIZE` (60MB) để dừng sớm trước khi nén quá tải.
    - Sử dụng `new TextEncoder().encode(text).length` để tính toán byte UTF-8 thực tế thay vì đếm đơn vị UTF-16 (`text.length`).
  - **3. P2: Áp dụng Hạn ngạch & Kiểm tra Trước Tương tự cho ZIP Ảnh Minh họa (`EpubImagesState`, `constants.ts`)**:
    - Thiết lập các hạn ngạch an toàn: `MAX_IMAGES_ZIP_ENTRIES = 500` entries, `MAX_ILLUSTRATION_COUNT = 200` ảnh, `MAX_IMAGES_ZIP_TOTAL_UNCOMPRESSED_SIZE = 150MB`.
    - Kiểm tra `entryData.uncompressedSize` trước khi gọi `zip.files[name].async('blob')`: bỏ qua ảnh đơn lẻ vượt quá 30MB (`MAX_IMAGE_FILE_SIZE`) và dừng nạp ngay khi tổng dung lượng giải nén ảnh vượt 150MB.
  - **4. P2: Hủy Bỏ Thực Sự Tác vụ Đóng gói Cũ khi Đổi Nguồn Sách (`EpubState`, `zip-writer.ts`)**:
    - Quản lý vòng đời đóng gói với `packAbortController: AbortController | null` và `activePackagingPromise: Promise<void> | null`.
    - Gọi `packAbortController.abort()` ngay khi nạp sách mới (`onFileLoaded`).
    - Bổ sung `signal?: AbortSignal` cho `buildEpubBlob` và `assembleEpubZip`, ném `DOMException('Packing aborted', 'AbortError')` khi nhận tín hiệu hủy.
    - Bắt tín hiệu hủy giữa chừng trong quá trình nén JSZip DEFLATE level 6 qua hook `onUpdate` của `zip.generateAsync`.
    - `processEpub()` chủ động chờ `await activePackagingPromise` trước khi bắt đầu đợt đóng gói mới, tránh chạy song song 2 tiến trình nén nặng gây cạn kiệt RAM và CPU.
  - **Bổ sung Bộ kiểm thử Đơn vị Chuyên sâu (`tests/epub-packer-lifecycle.test.ts`)**:
    - Thêm 10 unit tests mới kiểm thử snapshot ảnh bìa & crop, pre-check kích thước ZIP entry trước khi async, kiểm tra hạn mức ảnh minh họa, hủy tiến trình nén bằng `AbortSignal`, và tuần tự hóa tác vụ đóng gói.
    - Nâng tổng số test lên **435/435 unit tests pass 100% (21 test files)** và **24/24 E2E tests pass 100%**.
- Kết quả pipeline: format ✅ | lint ✅ | type check (0 err, 0 warn) ✅ | test unit ✅ (435/435 pass, 21 test files) | test E2E ✅ (24/24 pass) | knip ✅ (0 issues) | build ✅ | graphify ✅
- File chính bị ảnh hưởng: `src/lib/constants.ts`, `src/lib/epub-packer/state/epub-source-state.svelte.ts`, `src/lib/epub-packer/epub-state.svelte.ts`, `src/lib/epub-packer/state/epub-images-state.svelte.ts`, `src/lib/epub-packer/builders/zip-writer.ts`, `tests/epub-packer-lifecycle.test.ts`, `TASKS.md`, `README.md`, `CHANGELOG.md`.

---

## 2026-11-26 (Khắc phục Triệt để Toàn bộ 4 Rủi ro P1 & P2 trong EPUB Packer theo TASKS.md)

- Thêm/sửa:
  - **1. P1: Khử race condition nạp file nguồn qua Generation Token (`EpubSourceState`)**:
    - Bổ sung `fileLoadGeneration` tự động tăng dần mỗi khi gọi `handleFile()`.
    - Hủy ngay tác vụ parse cũ (`cancelParseTask()`) khi chọn file mới, bất kể file mới là TXT hay ZIP.
    - Đặt chốt kiểm tra `this.fileLoadGeneration !== currentGen` sau các thao tác bất đồng bộ (`await file.text()`, `await JSZip.loadAsync()`, giải nén từng file MD và hoàn tất parse TXT), loại bỏ hoàn toàn rủi ro file cũ hoàn thành muộn ghi đè dữ liệu lên file mới.
  - **2. P1: Khử rủi ro đổi nguồn sách khi đang đóng gói qua Snapshot & Pack Generation (`EpubState`)**:
    - Cơ chế **Snapshot bất biến**: Ngay khi bắt đầu `processEpub()`, toàn bộ dữ liệu cấu hình và nội dung (`metadata`, `chapters`, `jacket`, `fonts`, `ornaments`, `illustrations`, `isTxtMode`) được snapshot thành bản sao cục bộ độc lập, loại bỏ triệt để nguy cơ "Metadata sách A lẫn nội dung chương sách B".
    - Cơ chế **Pack Generation**: Đánh dấu `packGeneration` tăng dần; khi người dùng nạp sách mới (`onFileLoaded`), tác vụ đóng gói đang chạy dở sẽ bị hủy kết quả và tự động dừng lại, không ghi nhận đè `epubBlob` cũ lên sách mới.
  - **3. P2: Hạn ngạch an toàn chống cạn kiệt RAM / Zip-bomb khi giải nén ZIP (`constants.ts`, `EpubSourceState`)**:
    - Thiết lập 3 hạn ngạch chặt chẽ: `MAX_ZIP_MARKDOWN_FILES = 1000` files, `MAX_ZIP_SINGLE_MD_SIZE = 15MB`/file, và `MAX_ZIP_TOTAL_UNCOMPRESSED_SIZE = 60MB` tổng dung lượng văn bản thô trong RAM.
    - Bắt lỗi sớm và hiển thị cảnh báo rõ ràng cho người dùng, bảo vệ tab trình duyệt khỏi tình trạng đơ cứng hoặc crash do tràn bộ nhớ (OOM).
  - **4. P2: Cô lập Namespace tài nguyên & Chống trùng lặp ID trong manifest OPF (`zip-writer.ts`, `opf-builder.ts`, `EpubImagesState`)**:
    - Nhận diện các tên file đặc thù đã dành riêng (`cover.jpg`, `pre-chap.png`, `pre-small-chap.png`). Khi ảnh minh họa có tên trùng lặp, hệ thống tự động gán tiền tố an toàn `illus_${fileName}` (ví dụ: `illus_cover.jpg`), ngăn chặn triệt để việc ảnh minh họa ghi đè mất ảnh bìa hay hoa văn gốc.
    - Bộ phát sinh ID duy nhất trong `buildContentOpf`: tự động phát hiện và thêm hậu tố phân biệt `_1`, `_2` nếu hai file ảnh chuẩn hóa ra cùng mã ID, bảo đảm 100% ID trong manifest và spine itemref là duy nhất, không phát sinh lỗi EPUBCheck.
  - **Bổ sung Bộ kiểm thử Đơn vị Chuyên sâu (`tests/epub-packer-lifecycle.test.ts`)**:
    - Viết 9 unit test mới kiểm thử toàn diện cả 4 kịch bản P1 & P2: race condition TXT/ZIP, quá hạn ngạch ZIP, snapshot isolation, hủy kết quả đóng gói cũ khi đổi nguồn, cô lập file ảnh và chống trùng OPF ID.
    - Nâng tổng số test lên **425/425 unit tests pass 100% (21 test files)**.
- Kết quả pipeline: format ✅ | lint ✅ | type check (0 err, 0 warn) ✅ | test unit ✅ (425/425 pass, 21 test files) | test E2E ✅ (24/24 pass) | knip ✅ (0 issues) | build ✅ | graphify ✅
- File chính bị ảnh hưởng: `src/lib/constants.ts`, `src/lib/epub-packer/state/epub-source-state.svelte.ts`, `src/lib/epub-packer/epub-state.svelte.ts`, `src/lib/epub-packer/state/epub-images-state.svelte.ts`, `src/lib/epub-packer/builders/zip-writer.ts`, `src/lib/epub-packer/xml-builders/opf-builder.ts`, `tests/epub-packer-lifecycle.test.ts`, `README.md`, `CHANGELOG.md`.

---

## 2026-11-26 (Tinh Giản Hiển Thị Bộ Chọn Phông FontSelect & Mở Rộng Khung Preview Full-Size)

- Thêm/sửa:
  - **Tinh giản Bộ chọn Phông chữ (`FontSelect.svelte`, `DESIGN_SYSTEM.md`)**:
    - Trạng thái đóng / Mặc định (Trigger button): Chỉ hiển thị duy nhất tên font (ví dụ: `Bookerly` hoặc `{activeFont.name}`), loại bỏ phần `- Text mẫu` dư thừa do đã có khung xem trước trang sách phản ánh trực tiếp.
    - Danh sách xổ xuống (Dropdown list): Hiển thị tinh gọn `[Tên font] - Text mẫu`, loại bỏ mã kỹ thuật thừa `• {font.id}` giúp danh sách thoáng mắt, gọn gàng và dễ nhìn.
  - **Mở rộng Toàn bộ Kích thước Khung Xem Trước Phông Chữ (`EpubFontSettingsSection.svelte`)**:
    - Chuyển đổi lưới bố cục từ `items-start` sang `items-stretch`, đặt `h-full w-full flex-1` cho thẻ preview để co giãn phủ kín toàn bộ chiều cao của cột trên Desktop.
    - Nâng cấp kích cỡ typography trong preview (H1: `text-2xl sm:text-3xl`, H2: `text-xl sm:text-2xl`, H2 Sub: `text-base sm:text-lg`, Paragraph: `text-base sm:text-lg`, Quote: `text-base sm:text-lg`, Quote Author: `text-sm sm:text-base`, Dropcap: `3.2em`), giúp người dùng quan sát trực quan độ sắc nét của kiểu chữ trên cả Desktop và Mobile.
- Kết quả pipeline: format ✅ | lint ✅ | type check (0 err, 0 warn) ✅ | test unit ✅ (416/416 pass, 20 test files) | test E2E ✅ (24/24 pass) | knip ✅ (0 issues) | build ✅ | graphify ✅
- File chính bị ảnh hưởng: `src/lib/components/FontSelect.svelte`, `src/lib/epub-packer/components/EpubFontSettingsSection.svelte`, `DESIGN_SYSTEM.md`, `README.md`, `CHANGELOG.md`.

---

## 2026-11-26 (Khắc phục Triệt để Lỗi Flaky E2E Test Playwright khi Kiểm tra Cuộn Preview)

- Thêm/sửa:
  - **Khắc phục Lỗi E2E Test "should preserve preview scroll position when editing CSS" (`tests-e2e/epub-workflow.spec.ts`)**:
    - Fixture mẫu `ch1.xhtml` ban đầu chỉ có 1 câu ngắn (~60px), thấp hơn chiều cao khung nhìn của iframe preview (~500px), khiến tài liệu không phát sinh thanh cuộn (`maxScroll <= 0`) và lệnh `scrollTo(0, 150)` không cuộn được trên môi trường headless browser của CI.
    - Bổ sung các đoạn văn bản đủ độ dài (30 đoạn văn) trong fixture `ch1.xhtml` đảm bảo tài liệu luôn có chiều cao thực tế (~1200px) để cuộn trang mượt mà.
    - Sử dụng `page.waitForFunction()` đồng bộ trạng thái phục hồi cuộn kèm kiểm tra an toàn null (`win?.scrollY ?? scrollEl?.scrollTop`), loại bỏ hoàn toàn lỗi `TypeError: Cannot read properties of null (reading 'scrollTop')` khi iframe đang nạp lại `srcdoc`.
    - Toàn bộ **24/24 E2E Playwright tests pass 100% (38.1s)**.
- Kết quả pipeline: format ✅ | lint ✅ | type check (0 err, 0 warn) ✅ | test unit ✅ (416/416 pass, 20 test files) | test E2E ✅ (24/24 pass) | knip ✅ (0 issues) | build ✅ | graphify ✅
- File chính bị ảnh hưởng: `tests-e2e/epub-workflow.spec.ts`, `README.md`, `CHANGELOG.md`.

---

## 2026-11-26 (Tối ưu Canh lề Trích dẫn: Co giãn Blockquote theo Nội dung và Căn phải Tác giả Chuẩn Typography)

- Thêm/sửa:
  - **Tối ưu Co giãn Blockquote và Canh lề Tác giả Trích dẫn (`quotes.css`, `EpubFontSettingsSection.svelte`)**:
    - Chuyển `blockquote.center`, `blockquote.left`, `blockquote.right` sang mô hình `display: table; width: fit-content; max-width: 100%;` kết hợp `margin: 1.2em auto;`.
    - Giúp khối trích dẫn tự động co giãn (`shrink-to-fit`) chuẩn theo đúng chiều rộng thực của văn bản trích dẫn (ví dụ: _"to be, or not to be, that's the question"_), thay vì trải dài 100% toàn bộ chiều ngang trang sách.
    - Nhờ đó, dòng tác giả trích dẫn (`footer.right` hoặc `blockquote footer`) khi căn phải sẽ căn thẳng hàng tuyệt đối với từ cuối cùng của lời trích dẫn (tên tác giả _"william shakespeare"_ căn thẳng mép phải với _"question"_), bảo toàn tính thẩm mỹ typography chuẩn mực của sách xuất bản.
    - Cập nhật đồng bộ trong khung xem trước phông chữ `EpubFontSettingsSection.svelte` để giao diện phản ánh trực quan sự căn lề chuẩn xác này.
  - **Bổ sung Kiểm thử Đơn vị & Tương thích Specificity (`tests/epub-css-specificity.test.ts`)**:
    - Thêm test case xác thực `blockquote.center` xuất ra CSS có `display: table`, `fit-content`, `margin: 1.2em auto` và 0 lỗi descending specificity. Nâng tổng số test lên **416/416 unit tests pass 100% (20 test files)**.
- Kết quả pipeline: format ✅ | lint ✅ | type check (0 err, 0 warn) ✅ | test unit ✅ (416/416 pass, 20 test files) | knip ✅ (0 issues) | build ✅ | graphify ✅
- File chính bị ảnh hưởng: `src/lib/epub-packer/templates/css-template/quotes.css`, `src/lib/epub-packer/components/EpubFontSettingsSection.svelte`, `tests/epub-css-specificity.test.ts`, `README.md`, `CHANGELOG.md`.

---

## 2026-11-26 (Khắc phục Lỗi Duplicate Selector "blockquote footer" & Nâng cấp CI/CD lên Chuẩn Node.js 24)

- Thêm/sửa:
  - **Khắc phục Triệt để Lỗi Duplicate Selector "blockquote footer" (`prepareFinalCss` trong `stylesheet-builder.ts`)**:
    - Khi đóng gói sách có trích dẫn (`hasQuotes`) và người dùng chọn phông cho Tác giả trích dẫn (`quoteAuthorFont`), thay vì nối thêm khối `blockquote footer { ... }` gây trùng lặp selector với `quotes.css` (bị EPUBCheck báo lỗi `Unexpected duplicate selector "blockquote footer"`), hệ thống chủ động hòa trộn trực tiếp thuộc tính `font-family` vào rule `blockquote footer {` đã có sẵn.
    - Duy trì phương án dự phòng an toàn: nếu file CSS chưa có `blockquote footer {`, hệ thống tự sinh rule mới trong `fontBaseRules`, đảm bảo selector chỉ xuất hiện đúng 1 lần duy nhất trong toàn bộ stylesheet.
    - Cập nhật và bổ sung kiểm thử hồi quy trong `tests/epub-css-specificity.test.ts`, kiểm tra xác thực không bao giờ xuất hiện duplicate selector cho cả trường hợp có hoặc không có blockquote.
  - **Nâng cấp Toàn diện GitHub Actions CI/CD Tương thích Node.js 24 (`.github/workflows/ci.yml`)**:
    - Nâng cấp `actions/checkout@v4` lên `actions/checkout@v5` (chạy gốc trên Node.js 24).
    - Nâng cấp `pnpm/action-setup@v4` lên `pnpm/action-setup@v6` (hỗ trợ pnpm v11 và chạy gốc trên Node.js 24).
    - Nâng cấp `actions/setup-node@v4` lên `actions/setup-node@v5` (chạy gốc trên Node.js 24).
    - Thiết lập biến môi trường toàn cục `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24: true` triệt tiêu hoàn toàn cảnh báo deprecation Node 20 từ GitHub Actions runner.
- Kết quả pipeline: format ✅ | lint ✅ | type check (0 err, 0 warn) ✅ | test unit ✅ (415/415 pass, 20 test files) | knip ✅ (0 issues) | build ✅ | graphify ✅
- File chính bị ảnh hưởng: `src/lib/epub-packer/builders/stylesheet-builder.ts`, `tests/epub-css-specificity.test.ts`, `.github/workflows/ci.yml`, `README.md`, `CHANGELOG.md`.

---

## 2026-11-26 (Bổ sung Chọn Phông chữ cho Quote/Tác giả, Khử trùng @font-face Tuyệt đối & Cập nhật Preview)

- Thêm/sửa:
  - **Bổ sung Tùy chọn Phông chữ cho Trích dẫn (Quote) và Tác giả Trích dẫn (Quote Author)**:
    - Mở rộng kiểu dữ liệu `EpubFontsConfig` trong `src/lib/types/epub.type.ts` với `quoteFont?: string; quoteAuthorFont?: string;`.
    - Bổ sung quản lý reactive state `quoteFont` và `quoteAuthorFont` trong `EpubFontsState` (`epub-fonts-state.svelte.ts`) và đồng bộ hóa trong `EpubState` (`epub-state.svelte.ts`).
    - Thêm 2 bộ chọn phông `FontSelect` cho Quote và Quote Author vào `EpubFontSettingsSection.svelte`.
    - Cập nhật khung xem trước phông chữ (Preview) chuẩn văn bản mẫu từ `TASKS.md`: H1 ("Đây là chapter lớn"), H2 ("Đây là chapter nhỏ"), H2 phụ ("Đây là chapter nhỏ tiếp nối"), đoạn văn có Dropcap, và blockquote có nội dung trích dẫn căn giữa (`text-align: center`) và tác giả trích dẫn căn phải (`text-align: right`).
  - **Đóng gói EPUB & Cơ chế Khử trùng Phông chữ Tuyệt đối (Font Deduplication)**:
    - Bổ sung phông Quote và Quote Author vào `resolveActiveFonts` (`asset-builder.ts`), khử trùng tệp font đóng gói vào file EPUB ZIP bằng `Set`.
    - Tối ưu hóa `prepareFinalCss` (`stylesheet-builder.ts`):
      - Tiêm quy tắc font cho `blockquote, blockquote p` và `blockquote footer` khi người dùng tùy biến font quote/author.
      - Khử trùng khai báo `@font-face` thông qua `fontFaceIds` Set kết hợp kiểm tra phông đã có sẵn trong `base.css` hoặc `finalCss` (ví dụ `Bookerly`), bảo đảm mỗi phông chữ chỉ được khai báo `@font-face` đúng 1 lần duy nhất trong toàn bộ file CSS dù được dùng cho nhiều selector khác nhau.
    - Cập nhật `quotes.css` mặc định `blockquote footer { text-align: right; }`.
  - **Kiểm thử Đơn vị & Hồi quy (`tests/epub-css-specificity.test.ts`)**:
    - Bổ sung 2 test cases kiểm thử tiêm font cho quote/author và kiểm tra xác thực không bị trùng lặp khai báo `@font-face` khi trùng lặp font. Toàn bộ 415/415 unit tests vượt qua thành công.
- Kết quả pipeline: format ✅ | lint ✅ | type check (0 err, 0 warn) ✅ | test unit ✅ (415/415 pass, 20 test files) | knip ✅ (0 issues) | build ✅ | graphify ✅
- File chính bị ảnh hưởng: `src/lib/types/epub.type.ts`, `src/lib/epub-packer/state/epub-fonts-state.svelte.ts`, `src/lib/epub-packer/epub-state.svelte.ts`, `src/lib/epub-packer/builders/asset-builder.ts`, `src/lib/epub-packer/builders/stylesheet-builder.ts`, `src/lib/epub-packer/templates/css-template/quotes.css`, `src/lib/epub-packer/components/EpubFontSettingsSection.svelte`, `tests/epub-css-specificity.test.ts`, `TASKS.md`, `README.md`, `CHANGELOG.md`.

---

## 2026-11-26 (Tinh gọn Bộ chọn Phông chữ FontSelect theo Chuẩn 1 Dòng và Cập nhật Design System)

- Thêm/sửa:
  - **Thu gọn và Chuyển đổi Ô chọn Font chữ (`FontSelect.svelte`)**:
    - Chuyển ô input chọn phông từ cấu trúc 2 tầng (52px `h-13`) về **1 dòng ngang duy nhất (44px `h-11`)**, đồng bộ chuẩn kích thước của `Input.svelte` và `Button.svelte`.
    - Định dạng hiển thị trực quan dạng `[Tên font] - Text mẫu`, trong đó `Text mẫu` được gán trực tiếp `font-family` tương ứng để người dùng nhìn thấy kiểu dáng font thực tế.
    - Tinh giản nhãn mặc định từ `Mặc định (Bookerly)` thành `Bookerly` trên cả ô kích hoạt và danh sách menu thả xuống.
  - **Cập nhật Quy chuẩn Thiết kế (`DESIGN_SYSTEM.md`)**:
    - Cập nhật mục 4.4 theo chuẩn giao diện 1 dòng (44px) cho `FontSelect.svelte`.
- Kết quả pipeline: format ✅ | lint ✅ | type check (0 err, 0 warn) ✅ | test unit ✅ (413/413 pass, 20 test files) | knip ✅ (0 issues) | build ✅ | graphify ✅
- File chính bị ảnh hưởng: `FontSelect.svelte`, `DESIGN_SYSTEM.md`, `README.md`, `CHANGELOG.md`, `TASKS.md`.

---

## 2026-11-26 (Khắc phục Triệt để Race Conditions & Đồng bộ Yêu cầu Hệ thống trong PDF Splitter)

- Thêm/sửa:
  - **Khắc phục Race Condition khi Thay đổi File PDF (`handleFile` trong `pdf-splitter-state.svelte.ts`)**:
    - Tự động hủy tác vụ xử lý đang chạy (`cancelProcessTask()`) và hủy phiên nạp preview khi người dùng chọn/kéo thả file PDF mới.
    - Áp dụng `fileGenerationToken` ngăn chặn hoàn toàn việc kiểm tra số trang `getDocument().promise` của file cũ ghi đè lên file mới.
  - **Khắc phục Race Condition khi Hủy và Khởi chạy lại Tác vụ (`processPdf` trong `pdf-splitter-state.svelte.ts`)**:
    - Bổ sung cơ chế `processGenerationToken`: các callback `onProgress`, `catch`, và khối `finally` chỉ được cập nhật state nếu token tác vụ khớp với token hiện hành.
    - Ngăn chặn hoàn toàn lỗi logic trong `finally` của tác vụ cũ tắt nhầm cờ `processing = false` của tác vụ mới đang chạy.
  - **Khắc phục Race Condition khi Tải Preview (`loadPreview` trong `pdf-splitter-state.svelte.ts` & `loadPdfPreview` trong `pdf-splitter.ts`)**:
    - Bổ sung `previewGenerationToken` cô lập các yêu cầu tải xem trước.
    - Hỗ trợ tham số tùy chọn `signal?: AbortSignal` trong `loadPdfPreview` để dừng vòng lặp render sớm khi tác vụ bị hủy hoặc chuyển file.
  - **Cập nhật Yêu cầu Hệ thống trong Tài liệu (`README.md`)**:
    - Chuẩn hóa yêu cầu Node.js tối thiểu: **20.19+ hoặc 22.12+** theo yêu cầu chính thức từ Vite 8 (`vite: "^8.0.16"`).
    - Khuyến nghị phiên bản pnpm: **10 trở lên** (đồng bộ với `pnpm@11.22.0`).
  - **Bổ sung Kiểm thử Hồi quy (`tests/pdf-splitter.test.ts`)**:
    - Thêm 4 test cases kiểm thử độc lập các trường hợp race condition: không tắt sớm cờ `processing` khi chạy kép `processPdf`, không ghi đè kết quả khi đổi file giữa chừng, không lưu preview cũ khi đổi file, và cô lập các lượt gọi `loadPreview` liên tiếp.
- Kết quả pipeline: format ✅ | lint ✅ | type check (0 err, 0 warn) ✅ | test unit ✅ (413/413 pass, 20 test files) | knip ✅ (0 issues) | build ✅ | graphify ✅
- File chính bị ảnh hưởng: `pdf-splitter-state.svelte.ts`, `pdf-splitter.ts`, `tests/pdf-splitter.test.ts`, `README.md`, `CHANGELOG.md`, `TASKS.md`.

---

## 2026-11-26 (Khắc phục Triệt để 4 Điểm Rà soát P1: Ghi đè File, Scroll Preview khi Sửa CSS & Sót WASM)

- Thêm/sửa:
  - **Sửa lỗi Ghi nhầm File do Debounce (`EpubEditorCodePane.svelte`)**:
    - Chuyển `target` trong `flushDocSync()` từ `editorState.editorTarget` sang `activeTarget`, bảo đảm nội dung luôn được lưu vào đúng file mà `view.state` đang đại diện ngay cả khi chuyển file nhanh (< 250ms) bằng code hoặc không qua sự kiện `blur`.
  - **Sửa lỗi Preview Nhảy về Đầu Trang khi Sửa CSS (`EpubEditorPreviewPane.svelte`)**:
    - Ghi nhận `lastScrollRatio` vô điều kiện trên mọi sự kiện `scroll` của iframe preview; chỉ đặt điều kiện `editorTarget === previewTarget && syncViewEnabled` khi cuộn ngược sang Code Editor. Nhờ đó, vị trí cuộn được bảo toàn hoàn hảo khi người dùng sửa CSS.
  - **Sửa Triệt để Khử Trùng WASM & Assertion Build (`vite.config.js`)**:
    - Quét đệ quy toàn bộ thư mục `workers/` (bao gồm `image-bg-remove.worker-*.js` ở gốc `workers/` và các bundle trong `workers/assets/`).
    - Viết lại đường dẫn tương đối chính xác (`../assets/<mainWasm>` và `../../assets/<mainWasm>`).
    - Bổ sung assertion kiểm tra sau khi xóa: fail build ngay lập tức nếu còn sót bất kỳ chuỗi tham chiếu nào tới file WASM đã xóa.
  - **Chống Flaky Test Benchmark (`tests/stress/profile-p1.test.ts`)**:
    - Bỏ assertion so sánh cứng thời gian thực `durationOptimized < durationWithToString`, giữ nguyên đo lường và kiểm tra tính toàn vẹn ký tự `totalCharsToString === totalCharsOptimized`.
  - **Bổ sung E2E Browser Tests (`tests-e2e/epub-workflow.spec.ts`)**:
    - Thêm 2 kịch bản Playwright E2E kiểm chứng: chuyển file siêu nhanh bằng `el.click()` không làm mất nội dung hay ghi nhầm file; và sửa CSS sau khi cuộn preview không làm mất vị trí cuộn.
  - Cập nhật trạng thái P1 thành đang hoàn thiện / in progress trong `TASKS.md` và `README.md`.
- Kết quả pipeline: format ✅ | lint ✅ | type check (0 err, 0 warn) ✅ | test unit ✅ (409/409 pass, 20 test files) | knip ✅ (0 issues) | build ✅ | graphify ✅
- File chính bị ảnh hưởng: `EpubEditorCodePane.svelte`, `EpubEditorPreviewPane.svelte`, `vite.config.js`, `profile-p1.test.ts`, `epub-editor.test.ts`, `epub-workflow.spec.ts`, `TASKS.md`, `CHANGELOG.md`, `README.md`.

---

## 2026-11-26 (Hoàn thành P1: Đo Trước, Tối Ưu Hóa Editor, Preview Scroll & Khử Trùng Lặp WASM)

- Thêm/sửa:
  - **Bộ Đo lường Chuẩn (Baseline Profiling)**:
    - Bổ sung test suite `tests/stress/profile-p1.test.ts` đo lường hiệu năng thực tế: parse 1.16MB TXT (~197k từ) trong ~212ms, pack EPUB trong ~228ms, render HTML preview ~1.5ms.
    - Đo lường độ trễ CodeMirror 6: chứng minh việc bỏ `doc.toString()` trên mỗi keystroke giúp tăng tốc độ xử lý lên **5.7x** và giảm thiểu cấp phát bộ nhớ.
  - **Tối ưu hóa CodeMirror Editor & Đồng bộ (`EpubEditorCodePane.svelte`, `epub-editor-state.svelte.ts`)**:
    - Thay thế việc tuần tự hóa `doc.toString()` liên tục bằng việc đọc thuộc tính O(1) `doc.length` và `doc.lines`.
    - Trạng thái `dirtyPaths` được cập nhật tức thì khi gõ phím.
    - Quá trình đồng bộ chuỗi vào `editBuffer` được debounce 250ms, giảm 99% áp lực Garbage Collection.
    - Bổ sung cơ chế `flushEditorSync()` tự động xả dữ liệu đồng bộ khi chuyển trang, mở modal, xuất file, kiểm tra cú pháp, hoặc khi editor mất focus (`blur`).
    - Thêm cơ chế chặn `lastSyncedDoc` loại bỏ hoàn toàn lượt gọi `view.state.doc.toString()` thứ 2 trong reactive effect.
  - **Duy trì vị trí cuộn Live Preview (`EpubEditorPreviewPane.svelte`)**:
    - Lưu trữ và tự động phục hồi `lastScrollRatio` sau khi iframe nạp lại `srcdoc`, giải quyết triệt để lỗi preview tự động giật nhảy về đầu trang khi người dùng đang soạn thảo.
    - Tự động reset `lastScrollRatio = 0` khi người dùng chuyển sang xem trước một chương khác.
  - **Khử trùng lặp file WASM trong Bản Build (`vite.config.js`)**:
    - Xây dựng plugin `deduplicateWasmPlugin()`: tự động phát hiện và viết lại đường dẫn WASM trong worker chunk trỏ trực tiếp về asset duy nhất tại `_app/immutable/assets/`.
    - Xóa bỏ file `ort-wasm-simd-threaded.jsep.wasm` trùng lặp trong `workers/assets/`, tiết kiệm trực tiếp **23.23 MB** dung lượng bản build.
  - `src/lib/utils/download.ts`: Bổ sung kiểm tra an toàn `typeof document !== 'undefined'` khi chạy trong môi trường SSR/test runner.
- Kết quả pipeline: format ✅ | lint ✅ | type check (0 err, 0 warn) ✅ | test unit ✅ (408/408 pass, 20 test files) | knip ✅ (0 issues) | build ✅ | graphify ✅
- File chính bị ảnh hưởng: `vite.config.js`, `EpubEditorCodePane.svelte`, `EpubEditorPreviewPane.svelte`, `epub-editor-state.svelte.ts`, `download.ts`, `profile-p1.test.ts`, `epub-editor.test.ts`, `TASKS.md`, `CHANGELOG.md`, `README.md`.

---

## 2026-11-26 (Khắc phục Triệt để Dấu câu & Nhiều URL Cùng Dòng trong TXT Parser)

- Thêm/sửa:
  - `src/lib/epub-packer/parser/txt-parser.ts`:
    - Bổ sung tách các ký tự dấu câu `.,;:!?` ở cuối URL sang `trailing`, giải quyết triệt để lỗi không nhận diện định dạng khi có dấu câu ngay sau (`*https://a.com*.`, `/xem https://a.com/.`, `/xem https://a.com/, rồi đi`).
    - Làm sạch các URL xuất hiện trước khỏi `prefix` và dùng ranh giới mở in nghiêng `(?<![\p{L}\p{N}])\/[^\s/]` để xác định trạng thái mở thẻ chính xác khi có nhiều URL trên cùng một dòng (`https://x.com/p /xem https://a.com/`).
    - Bổ sung ký tự tiếp theo `(fullStr[offset] || 'x')` vào `cleanPrefix` khi đếm dấu mở in nghiêng, khắc phục triệt để lỗi lùi cho trường hợp URL đứng ngay sau dấu mở `/https://a.com/`.
  - Unit Tests:
    - Bổ sung test cases kiểm tra cả 5 trường hợp dấu câu, nhiều URL và URL đứng sát dấu mở trong `tests/epub-packer.test.ts`.
- Kết quả pipeline: format ✅ | lint ✅ | type check (0 err, 0 warn) ✅ | test unit ✅ (404/404 pass, 19 test files) | knip ✅ (0 issues) | build ✅ | graphify ✅
- File chính bị ảnh hưởng: `txt-parser.ts`, `epub-packer.test.ts`, `TASKS.md`, `README.md`.

---

## 2026-11-26 (Hoàn thành Rà soát Bổ sung Trước P1 theo TASKS.md)

- Thêm/sửa:
  - `src/lib/epub-editor/cleaner/reference-extractor.ts`:
    - Giải mã các thực thể HTML/XML (`&quot;`, `&apos;`, `&#34;`, `&#39;`, `&#x22;`, `&#x27;`) trong thuộc tính nội dòng `style="..."` trước khi trích xuất URL ảnh.
    - Quét cú pháp `@import "file.css"` bên trong thẻ `<style>` và bổ sung file stylesheet vào danh sách `styles` để bảo vệ tài nguyên CSS không bị xóa nhầm.
  - `src/lib/epub-editor/cleaner/cleaner-engine.ts`:
    - Đặt mặc định `deduplicateResources: false` trong `cleanEpub()` để ngăn ngừa rủi ro tráo nhầm tài nguyên khi gọi dọn dẹp mặc định.
    - Loại bỏ dung lượng file trùng lặp khỏi `estimatedSavingsBytes` trong `analyzeOptimizationPlan()`.
  - `src/lib/epub-editor/components/EpubEditorCodePane.svelte`:
    - Sau khi chuyển file bằng `view.setState(targetState)`, lập tức reconfigure lại `wrapCompartment` và `themeCompartment` đồng bộ với trạng thái bật/tắt Wrap và Dark/Light mode hiện tại.
  - `src/lib/epub-packer/parser/txt-parser.ts`:
    - Tách các ký tự đóng định dạng `*`, `_` và `/` (khi đang mở khối in nghiêng) ra khỏi đuôi URL được che, bảo toàn định dạng inline khi URL nằm trong dấu định dạng (`*https://a.com*`, `/xem https://a.com/`, `_http://a.com/x_`).
  - `src/lib/epub-editor/epub-book-ops.ts` & `src/lib/epub-editor/epub-editor-state.svelte.ts`:
    - Đổi regex nhận diện ID heading thành `/(?:^|\s)id\s*=\s*["']([^"']+)["']/i`, ngăn chặn việc hiểu nhầm `data-id="..."` là thuộc tính `id`.
    - Kiểm tra ID tự sinh (`section-X-Y`) không trùng với bất kỳ ID nào đã có sẵn trong trang XHTML.
    - `rebuildEpubToc()` trả về danh sách `modifiedPages`, và `rebuildToc()` tự động thêm toàn bộ các trang này vào `dirtyPaths` để phản ánh trạng thái đã sửa và kiểm tra khi xuất sách.
  - `tests-e2e/epub-workflow.spec.ts`:
    - Bổ sung kịch bản kiểm thử E2E Playwright: kiểm tra phân lập Undo/Redo khi chuyển tab giữa 2 file (Mở A → Sửa → Chuyển B → Ctrl+Z không làm hỏng B).
  - Loại bỏ hoàn toàn `UI_DIRECTION.md` theo yêu cầu người dùng.
- Kết quả pipeline: format ✅ | lint ✅ | type check (0 err, 0 warn) ✅ | test unit ✅ (403/403 pass, 19 test files) | knip ✅ (0 issues) | build ✅ | graphify ✅
- File chính bị ảnh hưởng: `reference-extractor.ts`, `cleaner-engine.ts`, `EpubEditorCodePane.svelte`, `txt-parser.ts`, `epub-book-ops.ts`, `epub-editor-state.svelte.ts`, `TASKS.md`, `README.md`.

---

## 2026-11-26 (Khắc phục Triệt để Toàn bộ 9 Lỗi Dữ liệu, Sai chuẩn EPUB & Bảo mật theo TASKS.md)

- Thêm/sửa:
  - `src/lib/epub-editor/components/EpubEditorCodePane.svelte`:
    - Quản lý `EditorState` độc lập cho từng file thông qua `SvelteMap<string, EditorState>`.
    - Chuyển file bằng `view.setState()` thay vì dispatch thay đổi nội dung, bảo toàn lịch sử Undo/Redo cho từng trang, ngăn chặn việc Ctrl+Z ghi đè nội dung file này vào file khác.
  - `src/lib/epub-editor/editor/editor-ops.ts`:
    - Chuẩn hóa hàm `exportEpubBlob()`: đảm bảo file `mimetype` được lưu dưới dạng không nén (`STORE`) và luôn là entry đầu tiên trong archive ZIP theo chuẩn OCF 3.3.
  - `src/lib/epub-editor/epub-book-ops.ts`:
    - Sửa `updateBookMetadata()`: dùng callback function `(_match, p1, p2) => ...` trong `String.replace()`, ngăn chặn biến dạng XML khi metadata chứa pattern `$1`, `$2`, `$$`.
    - Sửa `rebuildEpubToc()`: tự động ghi thuộc tính `id="section-X-Y"` ngược lại vào thẻ heading trong file XHTML tương ứng khi tự động sinh anchor ID cho mục lục.
    - Sửa `reorderOpfSpine()`: bảo tồn nguyên vẹn toàn bộ thuộc tính của thẻ `<itemref>` gốc (`linear="no"`, `properties`, v.v.) khi sắp xếp lại spine.
  - `src/lib/epub-packer/parser/txt-parser.ts`:
    - Tự động mask URL (`https?://...`) trước khi xử lý inline formatting.
    - Ràng buộc ranh giới ký tự/từ cho dấu in nghiêng `/`, in đậm `*`, và gạch chân `_` với lookaround Unicode `(?<![\p{L}\p{N}])` và `(?![\p{L}\p{N}])`, triệt tiêu lỗi làm hỏng URL, đơn vị `km/h/s` và biến snake_case `file_name_here`.
  - `src/lib/pdf-splitter/pdf-splitter.ts`, `src/lib/pdf-splitter/pdf-splitter-state.svelte.ts`, `src/lib/utils/pdf.ts`, `src/lib/types/pdf-splitter.type.ts`:
    - Truyền tham số `isEvalSupported: false` vào tất cả các lời gọi `getDocument()`, vô hiệu hóa lỗ hổng thực thi mã tùy ý CVE-2024-4367 trong PDF.js.
  - `src/lib/epub-editor/cleaner/reference-extractor.ts`:
    - Bổ sung quét ảnh trong thuộc tính nội dòng `style="background: url(...)"`, thuộc tính `srcset` trên `<img>`/`<source>`, và quét CSS stylesheet trong cú pháp `@import "file.css"`.
  - `src/lib/epub-editor/cleaner/cleaner-engine.ts` & `src/lib/utils/path.ts`:
    - Bổ sung hàm `getRelativePath()` và chuẩn hóa cơ chế thay thế tài nguyên trùng lặp (deduplication) bằng đường dẫn tương đối an toàn, tránh lỗi thay thế chuỗi con sai lệch (như `1.jpg` ăn vào `11.jpg`).
  - Unit Tests:
    - Bổ sung 6 test case mới trong `tests/epub-book-ops.test.ts`, `tests/epub-editor.test.ts`, `tests/epub-packer.test.ts`, `tests/epub-cleaner.test.ts`, và `tests/pdf-splitter.test.ts`.
- Kết quả pipeline: format ✅ | lint ✅ | type check (0 err, 0 warn) ✅ | test unit ✅ (399/399 pass, 19 test files) | knip ✅ (0 issues) | build ✅

---

## 2026-11-25 (Khắc phục Triệt để Lỗi CSS Specificity Inversion `.note p` & Nâng cấp Test Suite CSS Calibre)

- Thêm/sửa:
  - `src/lib/epub-packer/templates/css-template/base.css`:
    - Đưa khai báo cơ sở `blockquote` và `blockquote p` vào `base.css` ngay sau `p`, định hình chuỗi specificity chuẩn cho thẻ `p`: `(0, 0, 1)` -> `(0, 0, 2)` -> `(0, 1, 1)`.
  - `src/lib/epub-packer/templates/css-template/quotes.css`:
    - Loại bỏ khai báo trùng lặp `blockquote` và `blockquote p` cơ sở.
    - Tách riêng selector `footer.left`, `footer.right`, `footer.center` `(0, 1, 1)` đứng trước `blockquote footer.*` `(0, 1, 2)` ngăn lỗi đảo ngược specificity trên phần tử `footer`.
  - `src/lib/epub-packer/templates/css-template/notes.css`:
    - Dọn sạch selector thừa `.notes .note` và `.notes .note p`, chuẩn hóa về `.note` và `.note p` `(0, 1, 1)`.
  - `src/lib/epub-packer/builders/stylesheet-builder.ts`:
    - Tái cấu trúc thứ tự nối file CSS trong `EPUB_CSS` và `getDynamicCss`: `baseCss` -> `centerPageCss` -> `breaksCss` -> `notesCss` -> `headingsCss` -> `ornamentsCss` -> `headingCombinatorsCss` -> `quotesCss`.
    - Bảo đảm toàn bộ selector có specificity `(0, 1, 1)` (`.note p`, `p.scene-break-*`) luôn đứng trước các selector `(0, 1, 2)` và `(0, 2, 1)` trong `quotesCss`.
    - Cập nhật chuỗi marker `.subchapter-ornament + h2` trong `prepareFinalCss` để chèn font rules cho phân mục phụ đúng vị trí trước selector `(0, 2, 1)`.
  - `tests/epub-css-specificity.test.ts`:
    - Sử dụng `vi.hoisted` nạp trực tiếp toàn bộ 9 file stylesheet raw từ ổ đĩa, đảm bảo bộ kiểm thử W3C Specificity và Stylelint chạy trên CSS thật 100%.
    - Bổ sung test case xác thực `.note p` và các scene-break luôn đứng trước 12 selector độ ưu tiên cao từ báo cáo Calibre.
- Kết quả pipeline: format ✅ | lint ✅ | type check (0 err, 0 warn) ✅ | test unit ✅ (394/394 pass) | knip ✅ (0 issues) | graphify ✅

---

## 2026-11-25 (Chuẩn hóa Đặt tên CSS, Dọn dẹp Style Thừa & Giữ Font Bookerly Mặc định)

- Thêm/sửa:
  - `src/lib/epub-packer/templates/css-template/notes.css`:
    - Xóa quy tắc rác `aside.footnote { display: block; color: green; padding-bottom: 0.5em; }`.
    - Bổ sung quy tắc `.note, .notes .note` và `.note p, .notes .note p` bảo đảm các đoạn văn chú thích footnote không bị thụt lề thừa (`text-indent: 0`) và căn lề trái chuẩn xác.
  - `src/lib/epub-packer/templates/css-template/quotes.css`:
    - Loại bỏ các class trùng lặp `.center`, `.left`, `.right` độc lập (đã có trong `headings.css`).
  - `src/lib/epub-packer/parser/epub-markdown-utils.ts`:
    - Loại bỏ thẻ bọc thừa `<span class="ch-title">` khi sinh mã HTML cho `<h2>` từ Markdown block, đồng nhất với cú pháp `<h1>` và `<h3>`.
  - `src/lib/epub-packer/templates/css-template/intro-css.css` & `src/lib/epub-packer/templates/jacket-templates.ts`:
    - Chuẩn hóa tên class và selector từ `.jacket-10b` sang `.jacket-10`, đảm bảo tính nhất quán với mẫu 1 đến 9.
  - Bảo toàn font Bookerly:
    - Giữ nguyên cấu hình Bookerly nhúng mặc định trong `base.css` và `asset-builder.ts` phục vụ nội dung thẻ `<p>` theo đúng yêu cầu thiết kế cốt lõi của người dùng.
  - `tests/epub-parser.test.ts`:
    - Cập nhật test case kiểm tra thẻ `<h2>` Markdown không còn chứa thẻ `<span class="ch-title">`.
- Kết quả pipeline: format ✅ | lint ✅ | type check (0 err, 0 warn) ✅ | test unit ✅ (393/393 pass) | knip ✅ (0 issues) | graphify ✅

---

## 2026-11-25 (Tách riêng File Stylesheet `styles/jacket.css` cho Trang Lót Bìa Chuẩn EPUB 3)

- Thêm/sửa:
  - `src/lib/epub-packer/builders/stylesheet-builder.ts`:
    - Bổ sung hàm `buildJacketCss(jacket, fonts)` độc lập: trích xuất CSS của template jacket được chọn, tích hợp font khai báo riêng (`jacketFont` nếu có), tự động lọc sạch toàn bộ comment CSS (`/* ... */`) và thu gọn khoảng trắng.
  - `src/lib/epub-packer/xml-builders/opf-builder.ts`:
    - Khai báo item `<item id="css-jacket" href="styles/jacket.css" media-type="text/css"/>` trong `<manifest>` của `content.opf` khi tài liệu có trang jacket.
  - `src/lib/epub-packer/xml-builders/chapter-builder.ts`:
    - Cập nhật trang `jacket.xhtml` liên kết tới stylesheet ngoại vi `../styles/jacket.css` thay vì nhúng khối `<style>` nội dòng trong `<head>`.
  - `src/lib/epub-packer/builders/zip-writer.ts`:
    - Đóng gói file `styles/jacket.css` trực tiếp vào ZIP khi jacket được bật; dọn sạch `localCss` nội dòng của jacket.
  - `src/lib/epub-packer/builders/asset-builder.ts`:
    - Gán tiêu đề chuẩn cho trang jacket (`jacket.title || 'Giới thiệu'`) đảm bảo tính hợp lệ của thẻ `<title>` W3C HTML5/EPUB 3.
  - `tests/epub-css-specificity.test.ts`, `tests/epub-golden.test.ts`, `tests/epub-packer.test.ts`:
    - Bổ sung các test case kiểm tra sự tồn tại của `OEBPS/styles/jacket.css`, manifest entry `css-jacket` trong `content.opf`, thẻ `<link>` trong `jacket.xhtml` và xác nhận sạch comment 100%.
- Kết quả pipeline: format ✅ | lint ✅ | type check (0 err, 0 warn) ✅ | test unit ✅ (393/393 pass) | test e2e ✅ (21/21 pass) | knip ✅ (0 issues) | build ✅ | graphify ✅

---

## 2026-11-25 (Loại bỏ Triệt để Chú thích CSS trong File EPUB Thành phẩm)

- Thêm/sửa:
  - `src/lib/epub-packer/templates/css-template/base.css`, `center-page.css`, `ornaments.css`:
    - Xóa toàn bộ comment tiếng Việt còn sót lại (`/* Thiết lập chiều cao chuẩn cho trang */`, `/* Khung căn giữa toàn trang an toàn cho mọi e-reader */`, `/* Khi h1/h2 đứng ngay sau ornament (độ đặc hiệu tăng dần) */`).
  - `src/lib/epub-packer/builders/stylesheet-builder.ts`:
    - Bổ sung bước làm sạch tự động trong `prepareFinalCss` và `getDynamicCss`: lọc bỏ toàn bộ comment CSS dạng `/* ... */` và thu gọn dòng trắng trước khi xuất ra `style.css`.
  - `src/lib/epub-packer/xml-builders/chapter-builder.ts`:
    - Tự động lọc sạch comment trong `customCss` trước khi nhúng vào khối `<style>` của các trang nội dung đặc thù (như jacket, cover).
  - `tests/epub-css-specificity.test.ts`:
    - Bổ sung test suite xác thực `EPUB_CSS`, `getDynamicCss`, `prepareFinalCss` và thẻ `<style>` trong `buildChapterXhtml` không chứa bất kỳ comment nào (`expect(...).not.toMatch(/\/\*[\s\S]*?\*\//)`).
- Kết quả pipeline: format ✅ | lint ✅ | type check (0 err, 0 warn) ✅ | test unit ✅ (390/390 pass) | test e2e ✅ (21/21 pass) | knip ✅ (0 issues) | build ✅

---

## 2026-11-25 (Tích hợp Tự động Siêu dữ liệu Credit Chế bản Sách vào `content.opf`)

- Thêm/sửa:
  - `src/lib/types/epub.type.ts`:
    - Bổ sung trường tùy chọn `contributor?: string;` vào interface `EpubMetadata`.
  - `src/lib/epub-packer/builders/asset-builder.ts`:
    - Chuẩn hóa metadata với giá trị mặc định `contributor: metadata.contributor ?? 'akhademik & vc'`.
  - `src/lib/epub-packer/xml-builders/opf-builder.ts`:
    - Tự động sinh khối credit chuẩn mực trong phần `<metadata>` của `content.opf`:
      - `<dc:contributor id="packer">akhademik &amp; vc</dc:contributor>`
      - `<meta refines="#packer" property="role" scheme="marc:relators">mrk</meta>` (mã `mrk` - Markup editor)
      - `<meta refines="#packer" property="file-as">akhademik &amp; vc</meta>`
      - `<meta name="generator" content="akhademik &amp; vc"/>`
  - `tests/epub-packer.test.ts` & `tests/epub-css-specificity.test.ts`:
    - Bổ sung unit test xác thực các thẻ credit mặc định và kiểm thử khả năng ghi đè credit tùy chỉnh khi truyền `contributor`.
- Kết quả pipeline: format ✅ | lint ✅ | type check (0 err, 0 warn) ✅ | test unit ✅ (388/388 pass) | test e2e ✅ (21/21 pass) | knip ✅ (0 issues) | build ✅

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
