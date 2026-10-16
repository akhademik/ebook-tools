# Graph Report - ebook-tools  (2026-10-16)

## Corpus Check
- 143 files · ~98,605 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 48 file(s) not represented in the graph (top: .otf 18, .ttf 15, .css 10)

## Summary
- 898 nodes · 2037 edges · 58 communities (38 shown, 20 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 17 edges (avg confidence: 0.94)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `96f72cf8`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- epub-source-parser.ts
- epub-editor-state.svelte.ts
- EpubEditorCodePane.svelte
- epub-download-inspection.spec.ts
- image-bg-remove-ml.ts
- EBOOK-TOOLS — FULL REGRESSION TESTING INSTRUCTION
- cleaner-engine.ts
- epub-to-txt.ts
- pdf-splitter.ts
- package.json
- Kết quả rà soát và xử lý (Review & Resolutions - 2026-10-16)
- epub-reader-parser.ts
- devDependencies
- EpubSourceState
- scripts
- compilerOptions
- src_lib_epub_packer_parser_epub_source_parser_analyzechaptercandidates
- real-world-workflows.test.ts
- epub-images-state.svelte.ts
- DESIGN_SYSTEM.md — Hệ Thống Thiết Kế & Quy Chuẩn Giao Diện (Ebook Forge)
- dependencies
- 🚀 Các công cụ chính
- ⚒️ Ebook Forge — Bộ Công Cụ Chế Bản Sách Điện Tử
- vite.config.js
- markdown-fixer.ts
- tests-e2e/tsconfig.json
- Tuyển Tập Truyện Ngắn Đương Đại
- tests/tsconfig.json
- knip.json
- src_lib_epub_packer_epub_packer_buildchapterxhtml
- src_lib_epub_packer_epub_packer_buildcontainerxml
- src_lib_epub_packer_epub_packer_buildcontentopf
- src_lib_epub_packer_epub_packer_buildnavxhtml
- src_lib_epub_packer_epub_packer_buildtocncx
- src_lib_epub_packer_epub_packer_gettocentries
- src_lib_epub_packer_epub_packer_injectheadingids
- src_lib_epub_packer_epub_packer_mergebrokenparagraphs
- epub-to-txt-state.svelte.ts
- 4. Quy chuẩn Thành phần Giao diện (Components)
- components.type.ts
- result.type.ts
- utils/index.ts
- src_lib_epub_packer_parser_epub_source_parser_assignsequentialchapterids
- src_lib_epub_packer_parser_epub_source_parser_cleanheaderfooterocr
- src_lib_epub_packer_parser_epub_source_parser_converttxtinline
- src_lib_epub_packer_parser_epub_source_parser_getcleanedlinesreport
- src_lib_epub_packer_parser_epub_source_parser_parsemarkdownblocks
- src_lib_epub_packer_parser_epub_source_parser_rendermarkdownblocks
- generate-fonts-meta.js
- AI_WORKFLOW.md — Quy trình làm việc & Kiểm thử bắt buộc cho AI Coding Agent
- pdf-splitter-state.svelte.ts
- 2. Pipeline bắt buộc sau MỌI lần chỉnh sửa code & Trước khi Commit
- 4. Cập nhật tài liệu sau khi pipeline pass
- pdf-splitter.worker.ts
- PdfSplitterState

## God Nodes (most connected - your core abstractions)
1. `jszip` - 32 edges
2. `EBOOK-TOOLS — FULL REGRESSION TESTING INSTRUCTION` - 32 edges
3. `Logger` - 27 edges
4. `resolveRelativePath()` - 21 edges
5. `vitest` - 20 edges
6. `EpubImagesState` - 20 edges
7. `escapeXml()` - 20 edges
8. `scripts` - 19 edges
9. `EpubEditorState` - 18 edges
10. `parseTxtToChapters()` - 18 edges

## Surprising Connections (you probably didn't know these)
- `1. Hiển thị lỗi gộp trên giao diện ✅ [ĐÃ HOÀN THÀNH]` --references--> `parseTxtToChapters()`  [INFERRED]
  review.md → src/lib/epub-packer/parser/txt-parser.ts
- `2026-09-27 (Trước đó)` --references--> `mergeBrokenParagraphs()`  [INFERRED]
  README.md → src/lib/epub-packer/xml-builders/chapter-builder.ts
- `2026-10-15 (letter-box wrapper)` --references--> `mergeBrokenParagraphs()`  [INFERRED]
  README.md → src/lib/epub-packer/xml-builders/chapter-builder.ts
- `Trạng thái hệ thống` --references--> `mergeBrokenParagraphs()`  [INFERRED]
  README.md → src/lib/epub-packer/xml-builders/chapter-builder.ts
- `Trạng thái hệ thống` --references--> `replaceNestedDiv()`  [INFERRED]
  README.md → src/lib/epub-to-txt/epub-to-txt.ts

## Import Cycles
- None detected.

## Communities (58 total, 20 thin omitted)

### Community 0 - "epub-source-parser.ts"
Cohesion: 0.06
Nodes (87): 2026-10-16 (NHOM 1 Review Bug Fixes), 2026-10-16 (TypeScript Strict Mode Full Compliance), Trạng thái hệ thống, analyzeChapterCandidates(), assignSequentialChapterIds(), extractChunkBlocks(), extractMarkerTitle(), isDecorationOnly() (+79 more)

### Community 1 - "epub-editor-state.svelte.ts"
Cohesion: 0.05
Nodes (58): jszip, vitest, categorizeFile(), exportEpubBlob(), extractLinkedCssPaths(), parseSpineOrder(), parseZipEntries(), deobfuscateAdobeFont() (+50 more)

### Community 4 - "epub-download-inspection.spec.ts"
Cohesion: 0.28
Nodes (4): ref_node_fs, ref_node_path, ref_node_process, @playwright/test

### Community 5 - "image-bg-remove-ml.ts"
Cohesion: 0.08
Nodes (21): @imgly/background-removal, EpubImagesState, autoCropTransparentCanvas(), canvasToBlob(), cleanupWorkerAndRejectPending(), compressAndResizeCanvas(), getOrCreateWorker(), loadImage() (+13 more)

### Community 6 - "EBOOK-TOOLS — FULL REGRESSION TESTING INSTRUCTION"
Cohesion: 0.05
Nodes (41): 10. PDF → EPUB USER FLOW, 11. EPUB EDITOR E2E, 12. EPUB CLEANER E2E, 13. EPUB VALIDATOR E2E, 14. IMAGE PROCESSING E2E, 15. WORKER TESTING, 16. REGRESSION TEST, 17. OUTPUT FILE VALIDATION (+33 more)

### Community 7 - "cleaner-engine.ts"
Cohesion: 0.09
Nodes (34): analyzeEpub(), analyzeOptimizationPlan(), cleanEpub(), optimizeEpub(), getDuplicateWorker(), scanDuplicateResources(), computeDuplicateResources(), DuplicateDetectorWorkerRequest (+26 more)

### Community 8 - "epub-to-txt.ts"
Cohesion: 0.14
Nodes (25): 2026-09-27, 2026-09-27 (Trước đó), 2026-10-15, 2026-10-15 (letter-box wrapper), 2026-10-16 (CI/CD Pipeline Hardening & Knip Resolution), 2026-10-16 (CI/CD Verification & Expanded Test Coverage), 2026-10-16 (Clean Up), 2026-10-16 (Refinements: TOC, Center Page, Dropcap & @@!) (+17 more)

### Community 9 - "pdf-splitter.ts"
Cohesion: 0.11
Nodes (23): App, Window, applyGrayscale(), cropCanvas(), formatEta(), loadPdfPreview(), pickConcurrency(), processPdfToJpg() (+15 more)

### Community 10 - "package.json"
Cohesion: 0.08
Nodes (26): gitignorePath, name, packageManager, private, type, version, codemirror, @codemirror/commands (+18 more)

### Community 11 - "Kết quả rà soát và xử lý (Review & Resolutions - 2026-10-16)"
Cohesion: 0.22
Nodes (9): 1. Hiển thị lỗi gộp trên giao diện ✅ [ĐÃ HOÀN THÀNH], 2. Quy tắc tiêu đề và Dropcap trong khối `[letter]` và `[poem]` ✅ [ĐÃ HOÀN THÀNH], 3. `@@!` nhận hoa văn chương ✅ [ĐÃ HOÀN THÀNH], 4. `@@!` đổi nghĩa so với phiên bản cũ ✅ [XÁC NHẬN CHỦ Ý], 5. Cải tiến trang thiếu tiêu đề & cảnh báo `[new]` ✅ [ĐÃ HOÀN THÀNH], 6. Làm phẳng mục lục trang có hai `@` ✅ [XÁC NHẬN HỢP LÝ], 7. Tối ưu bộ nhớ `pdf-splitter` (Zero-Copy Transfer) ✅ [ĐÃ HOÀN THÀNH], 8. Vòng đời Web Worker & TypeScript Strict Mode ✅ [XÁC NHẬN TỐT] (+1 more)

### Community 12 - "epub-reader-parser.ts"
Cohesion: 0.17
Nodes (18): categorizeResource(), extractEpubMetadata(), findOpfPath(), parseEpub(), parseOpfManifestAndSpine(), EpubBook, EpubBookMetadata, EpubContainer (+10 more)

### Community 13 - "devDependencies"
Cohesion: 0.10
Nodes (21): devDependencies, eslint, @eslint/js, eslint-plugin-svelte, globals, knip, @playwright/test, prettier (+13 more)

### Community 14 - "EpubSourceState"
Cohesion: 0.16
Nodes (7): EpubState, EpubFontsState, EpubJacketState, EpubMetadataState, EpubSourceState, src_lib_utils_index_ensureepubext, ensureEpubExt()

### Community 15 - "scripts"
Cohesion: 0.11
Nodes (19): scripts, build, check, dev, format, format:check, knip, lint (+11 more)

### Community 16 - "compilerOptions"
Cohesion: 0.13
Nodes (14): ./.svelte-kit/tsconfig.json, compilerOptions, allowJs, checkJs, esModuleInterop, forceConsistentCasingInFileNames, moduleResolution, resolveJsonModule (+6 more)

### Community 19 - "real-world-workflows.test.ts"
Cohesion: 0.05
Nodes (74): ref_css_template_intro_css_css_raw, ref_templates_css_template_base_css_raw, ref_templates_css_template_breaks_css_raw, ref_templates_css_template_center_page_css_raw, ref_templates_css_template_cover_css_raw, ref_templates_css_template_headings_css_raw, ref_templates_css_template_notes_css_raw, ref_templates_css_template_ornaments_css_raw (+66 more)

### Community 20 - "epub-images-state.svelte.ts"
Cohesion: 0.31
Nodes (7): MAX_IMAGE_FILE_SIZE, MAX_IMAGES_ZIP_FILE_SIZE, MAX_PDF_FILE_SIZE, MAX_TXT_FILE_SIZE, MAX_ZIP_FILE_SIZE, src_lib_utils_index_processornamentimage, src_lib_utils_index_renderpdfpagetoblob

### Community 21 - "DESIGN_SYSTEM.md — Hệ Thống Thiết Kế & Quy Chuẩn Giao Diện (Ebook Forge)"
Cohesion: 0.25
Nodes (7): 1. Triết lý Thiết Kế & Chủ đề (Theme Philosophy), 2.1 CSS Theme Variables, 2.2 Tailwind CSS Utility Mapping, 2. Bảng Màu & CSS Tokens (`src/routes/layout.css`), 3. Typography, 5. Quy tắc Bắt buộc Khi Viết UI, DESIGN_SYSTEM.md — Hệ Thống Thiết Kế & Quy Chuẩn Giao Diện (Ebook Forge)

### Community 22 - "dependencies"
Cohesion: 0.18
Nodes (11): dependencies, codemirror, @codemirror/commands, @codemirror/lang-css, @codemirror/lang-html, @codemirror/state, @codemirror/theme-one-dark, @codemirror/view (+3 more)

### Community 23 - "🚀 Các công cụ chính"
Cohesion: 0.29
Nodes (7): 1. ✏️ Chỉnh sửa & Kiểm định EPUB Trực quan (EPUB Editor & Validator Suite), 2. 📦 Đóng gói EPUB (EPUB Packer), 3. 🎨 Tẩy Nền Hoa Văn Tự Động bằng AI (ML Ornament Background Removal), 4. 📄 Tách trang PDF → JPG (PDF Processor), 5. ✍️ Chuẩn hóa Markdown (Markdown Fixer), 6. 💻 Desktop App: TXT → PDF CJK, 🚀 Các công cụ chính

### Community 24 - "⚒️ Ebook Forge — Bộ Công Cụ Chế Bản Sách Điện Tử"
Cohesion: 0.29
Nodes (7): ⚒️ Ebook Forge — Bộ Công Cụ Chế Bản Sách Điện Tử, ⚡ Hướng dẫn Cài đặt & Sử dụng, Khởi chạy ứng dụng, 🧪 Quy chuẩn Kiểm thử & Chất lượng Mã nguồn (Quality Gates), 🛡️ Quyền riêng tư & Bảo mật, Yêu cầu hệ thống, Đóng gói ứng dụng (Production Build)

### Community 25 - "vite.config.js"
Cohesion: 0.25
Nodes (5): @sveltejs/adapter-cloudflare, @sveltejs/kit, @tailwindcss/vite, ref_types, vite

### Community 26 - "markdown-fixer.ts"
Cohesion: 0.20
Nodes (11): BOLD_ITALIC_PATTERNS, BOLD_PATTERNS, convertBrackets(), fixMarkdownZip(), ITALIC_PATTERNS, UNDERLINE_PATTERNS, src_lib_types_index_convertedbracketsresult, src_lib_types_index_fixmarkdownzipresult (+3 more)

### Community 27 - "tests-e2e/tsconfig.json"
Cohesion: 0.33
Nodes (5): compilerOptions, types, extends, include, ../tsconfig.json

### Community 28 - "Tuyển Tập Truyện Ngắn Đương Đại"
Cohesion: 0.33
Nodes (5): 1.1 Buổi Sáng Ở Quán Cà Phê, 2.2 Kết Thúc Một Ngày, Chương 1: Ký Ức Mùa Thu, Chương 2: Tiếng Chuông Chiều, Tuyển Tập Truyện Ngắn Đương Đại

### Community 29 - "tests/tsconfig.json"
Cohesion: 0.33
Nodes (5): compilerOptions, types, extends, include, ../tsconfig.json

### Community 30 - "knip.json"
Cohesion: 0.40
Nodes (4): entry, ignoreDependencies, project, $schema

### Community 39 - "epub-to-txt-state.svelte.ts"
Cohesion: 0.17
Nodes (5): MAX_EPUB_FILE_SIZE, EpubToTxtResult, EpubToTxtState, triggerDownload(), src_lib_utils_index_triggerdownload

### Community 41 - "4. Quy chuẩn Thành phần Giao diện (Components)"
Cohesion: 0.40
Nodes (5): 4.1 Nút bấm (`Button.svelte`), 4.2 Khu vực Kéo thả Tệp (`DropZone.svelte`), 4.3 Thẻ Card Hiện Đại (`.modern-card`), 4.4 Hộp Thoại Modal & Popup, 4. Quy chuẩn Thành phần Giao diện (Components)

### Community 42 - "components.type.ts"
Cohesion: 0.33
Nodes (5): svelte, ButtonProps, DropZoneProps, InputProps, PageHeaderProps

### Community 43 - "result.type.ts"
Cohesion: 0.40
Nodes (3): AppError, Result, ValidationError

### Community 44 - "utils/index.ts"
Cohesion: 0.08
Nodes (29): src_lib_epub_editor_epub_editor_isvalidfontmagic, src_lib_epub_editor_epub_editor_validatehtml, CssAndFontsRule, XhtmlPagesRule, NavigationRule, OpfPackageRule, SpineRule, StructureRule (+21 more)

### Community 51 - "generate-fonts-meta.js"
Cohesion: 0.18
Nodes (10): fontkit, ref_fs, ref_module, ref_path, files, fontkit, FONTS_DIR, metadata (+2 more)

### Community 52 - "AI_WORKFLOW.md — Quy trình làm việc & Kiểm thử bắt buộc cho AI Coding Agent"
Cohesion: 0.18
Nodes (11): 0. Thứ tự đọc khi mở lại project (BẮT BUỘC, không được bỏ qua bước nào), 1. Ngăn xếp công nghệ & quy tắc code bắt buộc, 3.1 Kiến trúc Hệ Thống Kiểm Thử 4 Tầng, 3.2 Ma Trận Hướng Dẫn: "Sửa Gì - Chạy Test Gì?" (Test Decision Matrix), 3.3 Bảng Tra Cứu Lệnh Nhanh (Cheat Sheet), 3. Kiến trúc Kiểm Thử 4 Tầng & Ma Trận: "Sửa Gì - Chạy Test Gì?", 5. Nguyên tắc chung khi AI làm việc trên project này, 6. Template khởi tạo nếu file chưa tồn tại (+3 more)

### Community 53 - "pdf-splitter-state.svelte.ts"
Cohesion: 0.20
Nodes (7): MarkdownFixerState, src_lib_types_index_pdfpreviewpage, src_lib_types_index_processedmarkdownfilerow, src_lib_utils_index_ensurezipext, src_lib_utils_index_slugify, ensureZipExt(), slugify()

### Community 54 - "2. Pipeline bắt buộc sau MỌI lần chỉnh sửa code & Trước khi Commit"
Cohesion: 0.50
Nodes (4): 2.1 Chu trình kiểm tra cục bộ khi sửa code (Local Dev Loop), 2.2 Pipeline Chốt Chặn CI/CD (BẮT BUỘC 100% PASS TRƯỚC KHI COMMIT HOẶC PUSH), 2.3 Quy tắc chỉnh sửa file (bắt buộc), 2. Pipeline bắt buộc sau MỌI lần chỉnh sửa code & Trước khi Commit

### Community 55 - "4. Cập nhật tài liệu sau khi pipeline pass"
Cohesion: 0.50
Nodes (4): 4.1 Cập nhật `README.md`, 4.2 Cập nhật `DESIGN_SYSTEM.md`, 4.3 Báo cáo `/graphiphy`, 4. Cập nhật tài liệu sau khi pipeline pass

### Community 56 - "pdf-splitter.worker.ts"
Cohesion: 0.40
Nodes (3): PdfJsGlobal, PdfRenderWorkerRequest, PdfRenderWorkerResponse

## Knowledge Gaps
- **234 isolated node(s):** `gitignorePath`, `$schema`, `project`, `entry`, `ignoreDependencies` (+229 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 359 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **20 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `jszip` connect `epub-editor-state.svelte.ts` to `epub-source-parser.ts`, `epub-download-inspection.spec.ts`, `image-bg-remove-ml.ts`, `cleaner-engine.ts`, `epub-to-txt.ts`, `pdf-splitter.ts`, `package.json`, `utils/index.ts`, `epub-reader-parser.ts`, `real-world-workflows.test.ts`, `epub-images-state.svelte.ts`, `markdown-fixer.ts`?**
  _High betweenness centrality (0.179) - this node is a cross-community bridge._
- **Why does `⚒️ Ebook Forge — Bộ Công Cụ Chế Bản Sách Điện Tử` connect `⚒️ Ebook Forge — Bộ Công Cụ Chế Bản Sách Điện Tử` to `epub-to-txt.ts`, `epub-source-parser.ts`, `README.md`, `🚀 Các công cụ chính`?**
  _High betweenness centrality (0.079) - this node is a cross-community bridge._
- **Why does `Trạng thái hệ thống` connect `epub-source-parser.ts` to `⚒️ Ebook Forge — Bộ Công Cụ Chế Bản Sách Điện Tử`, `epub-to-txt.ts`?**
  _High betweenness centrality (0.077) - this node is a cross-community bridge._
- **What connects `gitignorePath`, `$schema`, `project` to the rest of the system?**
  _234 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `epub-source-parser.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06257425742574257 - nodes in this community are weakly interconnected._
- **Should `epub-editor-state.svelte.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.052795031055900624 - nodes in this community are weakly interconnected._
- **Should `EpubEditorCodePane.svelte` be split into smaller, more focused modules?**
  _Cohesion score 0.125 - nodes in this community are weakly interconnected._