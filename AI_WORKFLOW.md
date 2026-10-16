# AI_WORKFLOW.md — Quy trình làm việc & Kiểm thử bắt buộc cho AI Coding Agent

> File này là **bộ não quy trình** của AI và nhà phát triển khi làm việc trên dự án này.
> Đọc file này **mỗi lần bắt đầu phiên làm việc mới**, trước khi viết bất kỳ dòng code nào.

---

## 0. Thứ tự đọc khi mở lại project (BẮT BUỘC, không được bỏ qua bước nào)

Khi được giao việc trên project này, AI phải đọc theo đúng thứ tự sau trước khi code:

1. **`./graphify-out/GRAPH_REPORT.md`** (file report do `/graphiphy` tự sinh ra mỗi lần chạy)
   → Hiểu cấu trúc phụ thuộc hiện tại, phát hiện vòng lặp import, file mồ côi, node quá lớn (god node).
2. **`README.md`**
   → Đọc mục _"Trạng thái hệ thống"_ và _"Changelog"_ để biết lần cuối đã làm gì, cái gì đang dở, cái gì đã xong.
3. **`AI_WORKFLOW.md`** (chính file này)
   → Nhắc lại quy tắc, pipeline kiểm tra, ma trận test, cách cập nhật tài liệu.
4. **`DESIGN_SYSTEM.md`**
   → Bắt buộc đọc trước khi đụng vào bất kỳ UI/component nào (màu sắc, spacing, modal, typography...).

Nếu 1 trong 4 file trên chưa tồn tại → AI phải **khởi tạo trước** theo template ở cuối file này, rồi mới bắt đầu việc chính.

Sau khi đọc xong 4 file, AI tóm tắt ngắn gọn lại cho người dùng:

- Project đang ở trạng thái nào
- Việc dở dang gần nhất là gì
- Kế hoạch tiếp theo là gì

Chỉ sau khi xác nhận (hoặc người dùng đồng ý) mới bắt đầu code.

---

## 1. Ngăn xếp công nghệ & quy tắc code bắt buộc

- **SvelteKit 5** — dùng **Runes** (`$state`, `$derived`, `$effect`, `$props`), KHÔNG dùng cú pháp `export let`, `$:` reactive cũ.
- **TypeScript strict mode** — không dùng `any` trừ khi có comment `// TODO(reason)` giải thích rõ tại sao.
- **Tailwind CSS** — không viết inline style tùy tiện, không tạo class trùng lặp ý nghĩa với token đã có trong `DESIGN_SYSTEM.md`.
- **Tách type riêng file**: mọi `interface`/`type` dùng chung từ 2 nơi trở lên phải nằm trong `src/lib/types/*.ts`, KHÔNG khai báo type ngay trong file component.
- **Tránh "God Component/Node"**:
  - 1 component không vượt quá ~200 dòng logic (không tính markup thuần).
  - Nếu 1 file đảm nhiệm > 1 trách nhiệm rõ rệt (fetch data + render + xử lý form...) → tách thành:
    - component con (`ComponentName.svelte`)
    - logic riêng (`componentName.svelte.ts` dùng runes ngoài component nếu cần state chia sẻ)
    - type riêng (`types/componentName.ts`)
  - Ưu tiên composition (slot/snippet) thay vì nhồi nhét props/logic vào 1 chỗ.
- Đặt tên nhất quán: `PascalCase` cho component, `camelCase` cho biến/hàm, `kebab-case` cho route folder.

---

## 2. Pipeline bắt buộc sau MỌI lần chỉnh sửa code & Trước khi Commit

> **Package manager: chỉ dùng `pnpm`.** Tuyệt đối không dùng `npm`/`yarn`/`npx` dưới bất kỳ hình thức nào. Chạy binary chưa cài thì dùng `pnpm dlx ...`.

### 2.1 Chu trình kiểm tra cục bộ khi sửa code (Local Dev Loop)

Sau khi AI edit xong 1 tác vụ, chạy tuần tự để phát hiện sớm lỗi:

```bash
# 1. Format code
pnpm format

# 2. Type check & Lint
pnpm check
pnpm lint

# 3. Test nhanh
pnpm test:smoke      # hoặc pnpm test
```

### 2.2 Pipeline Chốt Chặn CI/CD (BẮT BUỘC 100% PASS TRƯỚC KHI COMMIT HOẶC PUSH)

Để đảm bảo GitHub Actions CI/CD (`.github/workflows/ci.yml`) **tuyệt đối không bao giờ fail**, trước khi commit/push, AI **PHẢI** chạy trọn vẹn chuỗi lệnh sau theo đúng thứ tự:

```bash
# 1. Format toàn bộ & Kiểm tra định dạng (Chống trôi style)
pnpm format
pnpm format:check    # BẮT BUỘC: Thoát mã 0, không có bất kỳ warning nào!

# 2. Kiểm tra Type & Linting
pnpm check           # SvelteKit sync & TypeScript strict mode (0 error, 0 warning)
pnpm lint            # ESLint

# 3. Chạy toàn bộ Unit & Regression Tests
pnpm test            # Đảm bảo 100% test suites đều pass

# 4. Quét Dead Code & Dependencies
pnpm knip            # Knip scan không phát hiện export thừa / rác

# 5. Build Production Bundle (Bắt buộc để kiểm tra Vite & prebuild scripts)
pnpm build           # Kiểm tra đóng gói production thành công

# 6. Kiểm tra lại Format sau Build
pnpm format:check    # Đảm bảo các script tự sinh file (như generate-fonts-meta.js) không làm lệch format

# 7. E2E Browser Tests
pnpm test:e2e        # Đảm bảo tất cả Playwright E2E browser tests pass

# 8. Phân tích cấu trúc & Dependency Graph
/graphiphy
```

> **Lưu ý cốt lõi:**
>
> - Mọi script tự sinh/cập nhật file tự động (ví dụ `scripts/generate-fonts-meta.js`) **PHẢI** tuân thủ cấu hình của `.prettierrc` (sử dụng tabs `\t`, trailing newline `\n`). Tuyệt đối không để script sinh file gây bẩn git working tree hoặc làm fail `pnpm format:check` sau khi chạy `pnpm build`.
> - Nếu `pnpm format:check` báo cảnh báo ở bất kỳ file nào → PHẢI format lại và tìm hiểu nguyên nhân tại sao file đó bị format sai trước khi commit.

**Quy tắc xử lý lỗi:**

- Nếu `format:check` fail → chạy `pnpm format`, kiểm tra nguyên nhân file bị lệch style, và chạy lại `pnpm format:check`.
- Nếu `lint` fail → tự sửa theo rule, không dùng `--fix` mù quáng nếu ảnh hưởng logic.
- Nếu `check` (type) fail → ưu tiên sửa type gốc trong `src/lib/types/`, không ép `as any`/`as unknown as X` để né lỗi.
- Nếu `test` fail → xác định do code mới sai hay test cũ outdated, sửa đúng nguồn gốc, không xoá test để "cho qua".
- Nếu `knip` báo file/export thừa → cân nhắc xoá thật, hoặc nếu vẫn cần (public API, dùng động...) thì thêm annotation loại trừ trong `knip.json` kèm lý do.
- Nếu `build` fail → kiểm tra lại import, SSR safety, dynamic imports, cấu hình vite và adapter.
- Nếu `/graphiphy` phát hiện vòng lặp import, node quá to (god node), hoặc file cô lập bất thường → phải xử lý (tách nhỏ, phá vòng lặp) trước khi coi task là "xong".

Không được báo cáo "hoàn thành" hoặc offer commit/push nếu bất kỳ bước nào trong pipeline trên còn fail.

---

### 2.3 Quy tắc chỉnh sửa file (bắt buộc)

- **KHÔNG** dùng `cat > file`, `cat <<EOF`, `node -e "..."`, hay các lệnh shell khác để tạo/ghi đè nội dung file. Các cách này thường khiến hệ thống yêu cầu xác nhận nhiều lần và làm chậm/khó theo dõi diff.
- **PHẢI** dùng công cụ edit file chuyên dụng có sẵn (edit/str_replace/patch theo tool của AI đang dùng) để:
  - Sửa 1 phần trong file đã tồn tại.
  - Tạo file mới (dùng tool tạo file, không dùng heredoc).
- Chỉ dùng lệnh shell (`pnpm`, git, chạy test...) cho việc **chạy** chương trình/pipeline, không dùng shell để **soạn nội dung code**.
- Mỗi lần sửa nên là 1 thay đổi rõ ràng, có thể review qua diff — tránh gộp nhiều thay đổi không liên quan trong 1 lần edit.

---

## 3. Kiến trúc Kiểm Thử 4 Tầng & Ma Trận: "Sửa Gì - Chạy Test Gì?"

### 3.1 Kiến trúc Hệ Thống Kiểm Thử 4 Tầng

```
                          ALL TEST SUITES
                                │
        ┌───────────────────────┼───────────────────────┬───────────────────────┐
        │                       │                       │                       │
     TẦNG 1                  TẦNG 2                  TẦNG 3                  TẦNG 4
   SMOKE TESTS          UNIT / INTEGRATION         REGRESSION             BROWSER E2E
   (test:smoke)            (test / unit)        (test:regression)         (test:e2e)
        │                       │                       │                       │
     ~350ms                   ~1s                     ~400ms                   ~15s
        │                       │                       │                       │
  Mỗi lần lưu code        Khi sửa module        Trước khi commit          Trước khi PR/Release
```

- **🔹 Tầng 1: Smoke Tests (`pnpm test:smoke`)**: Siêu nhanh (~350ms). Chạy liên tục mỗi khi lưu/thay đổi code để đảm bảo các luồng xương sống không gãy (TXT → EPUB, MD → EPUB, EPUB → TXT, EPUB Editor, Cleaner, Validator).
- **🔹 Tầng 2: Unit & Integration Tests (`pnpm test:unit` hoặc `pnpm test`)**: ~1 giây (290+ bài test). Kiểm tra chi tiết từng hàm logic, heuristic nhận diện chương, regex OCR, UTF-8 tiếng Việt, phân tách PDF, bóc tách ảnh nền ML.
- **🔹 Tầng 3: Regression Safety Net (`pnpm test:regression`)**: ~400ms. Tấm lưới an toàn vĩnh viễn chống lỗi phát sinh sau khi refactor (`TXT → EPUB → TXT` round-trip, bảo toàn TOC, cleaner safety, validator resilience).
- **🔹 Tầng 4: Full Browser E2E & Output Inspection (`pnpm test:e2e`)**: ~15s (Playwright Chromium). Mô phỏng tải file thực tế → bóc tách ZIP → kiểm tra từng thẻ XHTML và mục lục TOC.
- **🔹 Tầng Mở rộng: Stress & Heavy Load (`pnpm test:stress`)**: Kiểm thử sức chịu tải với tác phẩm lớn từ 1.000 đến 5.000 chương.

---

### 3.2 Ma Trận Hướng Dẫn: "Sửa Gì - Chạy Test Gì?" (Test Decision Matrix)

Trong quá trình đang phát triển / sửa dở dang một module, hãy tra cứu bảng sau để chạy nhanh các bài test tương ứng trước khi chạy toàn bộ pipeline ở mục 2:

| Bạn vừa sửa module nào?                 | Các file liên quan                                                                  | Lệnh Test nhanh tương ứng                                                                                              |
| :-------------------------------------- | :---------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------- |
| **Mọi thay đổi nhỏ / Lưu code**         | Bất kỳ file nào trong `src/`                                                        | `pnpm test:smoke`                                                                                                      |
| **TXT Parser & EPUB Packer**            | `src/lib/epub-packer/**`                                                            | `pnpm test:smoke`<br/>`vitest tests/epub-packer.test.ts tests/real-world-workflows.test.ts`<br/>`pnpm test:regression` |
| **Markdown Fixer & ZIP Grouper**        | `src/lib/markdown-fixer/**`<br/>`src/lib/epub-packer/parser/epub-markdown-utils.ts` | `vitest tests/markdown-fixer.test.ts tests/real-world-workflows.test.ts`<br/>`pnpm test:regression`                    |
| **EPUB to TXT Converter**               | `src/lib/epub-to-txt/**`                                                            | `vitest tests/epub-to-txt.test.ts`<br/>`pnpm test:smoke`<br/>`pnpm test:regression`                                    |
| **EPUB Editor & TOC Operations**        | `src/lib/epub-editor/epub-editor.ts`<br/>`src/lib/epub-editor/epub-book-ops.ts`     | `vitest tests/epub-editor.test.ts tests/epub-book-ops.test.ts`<br/>`pnpm test:regression`<br/>`pnpm test:e2e`          |
| **EPUB Cleaner & Optimizer**            | `src/lib/epub-editor/epub-cleaner.ts`                                               | `vitest tests/epub-cleaner.test.ts`<br/>`pnpm test:regression`                                                         |
| **EPUB Validator (Generic/Kobo/EPUB3)** | `src/lib/epub-editor/epub-validator.ts`                                             | `vitest tests/epub-validator.test.ts`<br/>`pnpm test:regression`                                                       |
| **PDF Splitter & OCR Helpers**          | `src/lib/pdf-splitter/**`<br/>`src/lib/epub-packer/parser/epub-ocr-utils.ts`        | `vitest tests/pdf-splitter.test.ts tests/real-world-workflows.test.ts`                                                 |
| **Image Background Removal (ML)**       | `src/lib/image-bg-remove/**`                                                        | `vitest tests/image-bg-remove.test.ts`                                                                                 |
| **Core Types / Refactor diện rộng**     | `src/lib/types/**`<br/>`src/lib/utils/**`                                           | `pnpm test`<br/>`pnpm test:regression`<br/>`pnpm test:e2e`                                                             |
| **Giao diện trang (UI Routes)**         | `src/routes/**`                                                                     | `pnpm test:e2e`                                                                                                        |

---

### 3.3 Bảng Tra Cứu Lệnh Nhanh (Cheat Sheet)

| Lệnh                   | Ý nghĩa                                           | Thời gian  | Khi nào dùng                |
| :--------------------- | :------------------------------------------------ | :--------- | :-------------------------- |
| `pnpm dev`             | Khởi chạy máy chủ phát triển (localhost:5173)     | —          | Khi lập trình giao diện     |
| `pnpm check`           | Kiểm tra lỗi TypeScript & Svelte Rune             | ~2s        | Sau khi sửa code            |
| `pnpm lint`            | Kiểm tra lỗi ESLint                               | ~1s        | Trước khi commit            |
| `pnpm format`          | Tự động format toàn bộ codebase bằng Prettier     | ~1s        | Trước khi commit            |
| `pnpm format:check`    | Kiểm tra tính tuân thủ định dạng Prettier         | ~1s        | Trong CI / Quality Gate     |
| `pnpm knip`            | Quét file/export rác                              | ~2s        | Trước khi commit            |
| `pnpm test:smoke`      | Chạy bộ kiểm thử nhanh các luồng xương sống       | **~350ms** | **Mỗi khi lưu code**        |
| `pnpm test:unit`       | Chạy toàn bộ các bài unit test đơn lẻ             | ~1s        | Khi phát triển module       |
| `pnpm test:regression` | Chạy kiểm thử an toàn chống regression            | **~400ms** | **Trước khi commit**        |
| `pnpm test:e2e`        | Chạy trình duyệt Playwright E2E & soi file output | ~15s       | **Trước khi release/PR**    |
| `pnpm test:stress`     | Chạy kiểm thử tải nặng (1.000+ chương)            | ~500ms     | Định kỳ kiểm tra tải        |
| `pnpm test`            | Chạy toàn bộ unit/integration test suites         | ~1s        | Thường xuyên trong khi code |
| `pnpm test:watch`      | Chế độ tự động test lại khi lưu file              | —          | Khi viết tính năng mới      |
| `pnpm build`           | Đóng gói bản Production                           | ~3s        | Trước khi deploy            |

---

## 4. Cập nhật tài liệu sau khi pipeline pass

### 4.1 Cập nhật `README.md`

Sau khi pipeline ở mục 2 pass, cập nhật 2 phần trong README:

**a) Mục "Trạng thái hệ thống"** (ghi đè, luôn phản ánh hiện tại):

```markdown
## Trạng thái hệ thống

- Cập nhật lần cuối: YYYY-MM-DD HH:mm
- Đã hoàn thành: [liệt kê tính năng/module đã chạy được]
- Đang dở: [nếu có]
- Biết trước còn thiếu / nợ kỹ thuật: [nếu có]
```

**b) Mục "Changelog"** (append, không xoá lịch sử cũ):

```markdown
## Changelog

### YYYY-MM-DD

- Thêm/sửa: mô tả ngắn gọn việc đã làm
- Kết quả pipeline: format ✅ | lint ✅ | type ✅ | test ✅ (x/y pass) | knip ✅ | graphiphy: [tóm tắt phát hiện chính nếu có]
- File chính bị ảnh hưởng: liệt kê
```

### 4.2 Cập nhật `DESIGN_SYSTEM.md`

Chỉ cập nhật khi có **quyết định thiết kế mới** (thêm màu, thêm biến thể modal, thay đổi spacing scale...). Không tự ý đổi giá trị đã có sẵn — nếu thấy cần đổi, phải hỏi người dùng trước vì sẽ ảnh hưởng toàn bộ UI cũ.

### 4.3 Báo cáo `/graphiphy`

Chạy `/graphiphy` sẽ tự ghi đè `./graphify-out/GRAPH_REPORT.md` — không cần AI tự tạo hay copy file này đi đâu khác.

Nếu phát hiện vấn đề quan trọng (vòng lặp import, god node mới xuất hiện) thì AI chỉ cần **tóm tắt lại** phát hiện đó vào `README.md` (mục Changelog, xem 4.1) để không bị mất khi report bị ghi đè ở lần chạy sau.

---

## 5. Nguyên tắc chung khi AI làm việc trên project này

- Không tự thay đổi kiến trúc lớn (routing structure, state management pattern) mà không nêu lý do và hỏi trước.
- Mỗi task nên là 1 đơn vị nhỏ, chạy đủ pipeline rồi mới sang task tiếp theo — không gộp nhiều thay đổi lớn rồi mới kiểm tra 1 lần.
- Ưu tiên tính nhất quán với pattern đã có trong `DESIGN_SYSTEM.md` hơn là sáng tạo pattern mới.
- Nếu phát hiện code cũ vi phạm chính các quy tắc trong file này (god component, type lẫn trong component, màu sắc lệch design system...), ghi chú lại thành nợ kỹ thuật trong README thay vì tự ý sửa hàng loạt ngoài phạm vi task đang làm.

---

## 6. Template khởi tạo nếu file chưa tồn tại

### Template `README.md` (phần cần có)

```markdown
# Tên dự án

## Trạng thái hệ thống

- Cập nhật lần cuối: (chưa có)
- Đã hoàn thành: (chưa có)
- Đang dở: (chưa có)

## Changelog

(chưa có mục nào)
```

### Về `./graphify-out/GRAPH_REPORT.md`

File này do `/graphiphy` tự sinh ra khi chạy, AI không cần tạo sẵn. Nếu ở bước 0 chưa thấy file này tồn tại (project chưa từng chạy `/graphiphy` lần nào) → AI chỉ cần chạy `/graphiphy` một lần để nó tự sinh ra, rồi đọc tiếp.

Xem template đầy đủ của `DESIGN_SYSTEM.md` trong file riêng cùng cấp.
