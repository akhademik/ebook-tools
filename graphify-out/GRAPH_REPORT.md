# Graph Report - ebook-tools  (2026-10-16)

## Corpus Check
- 144 files · ~104,104 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 48 file(s) not represented in the graph (top: .otf 18, .ttf 15, .css 10)

## Summary
- 920 nodes · 2087 edges · 58 communities (40 shown, 18 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 29 edges (avg confidence: 0.95)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `d9cbf261`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- epub-source-parser.ts
- epub-editor-state.svelte.ts
- content-rules.ts
- Changelog
- txt-parser.ts
- image-bg-remove-ml.ts
- EBOOK-TOOLS — FULL REGRESSION TESTING INSTRUCTION
- cleaner-engine.ts
- epub-to-txt-state.svelte.ts
- pdf-splitter.ts
- package.json
- epub-download-inspection.spec.ts
- epub-reader-parser.ts
- devDependencies
- markdown-fixer.ts
- scripts
- compilerOptions
- src_lib_epub_packer_parser_epub_source_parser_analyzechaptercandidates
- pdf-splitter-state.svelte.ts
- zip-writer.ts
- Kết quả xử lý rà soát (Worker Hardening & Fallback Optimization - 2026-10-16)
- real-world-workflows.test.ts
- dependencies
- epub-state.svelte.ts
- vite.config.js
- logger.ts
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
- epub-source-state.svelte.ts
- result.type.ts
- eslint.config.js
- txt-syntax-validator.ts
- PdfSplitterState
- src_lib_epub_packer_parser_epub_source_parser_assignsequentialchapterids
- src_lib_epub_packer_parser_epub_source_parser_cleanheaderfooterocr
- src_lib_epub_packer_parser_epub_source_parser_converttxtinline
- src_lib_epub_packer_parser_epub_source_parser_getcleanedlinesreport
- src_lib_epub_packer_parser_epub_source_parser_parsemarkdownblocks
- src_lib_epub_packer_parser_epub_source_parser_rendermarkdownblocks
- generate-fonts-meta.js
- AI_WORKFLOW.md — Quy trình làm việc & Kiểm thử bắt buộc cho AI Coding Agent
- utils/index.ts
- 🚀 Các công cụ chính
- ⚒️ Ebook Forge — Bộ Công Cụ Chế Bản Sách Điện Tử
- components.type.ts
- txt-parser.worker.ts

## God Nodes (most connected - your core abstractions)
1. `jszip` - 32 edges
2. `EBOOK-TOOLS — FULL REGRESSION TESTING INSTRUCTION` - 32 edges
3. `Logger` - 27 edges
4. `resolveRelativePath()` - 21 edges
5. `Changelog` - 21 edges
6. `vitest` - 20 edges
7. `parseTxtToChapters()` - 20 edges
8. `EpubImagesState` - 20 edges
9. `escapeXml()` - 20 edges
10. `scripts` - 19 edges

## Surprising Connections (you probably didn't know these)
- `2. Xử lý lỗi tiềm ẩn trong EPUB Cleaner (Buffer Detachment khi Fallback) — [ĐÃ GIẢI QUYẾT XONG ✅]` --references--> `scanDuplicateResources()`  [INFERRED]
  review.md → src/lib/epub-editor/cleaner/duplicate-detector.ts
- `2026-10-16 (Worker Cancellation Race Condition & ML Fallback Hardening)` --references--> `processOrnamentOnMainThread()`  [INFERRED]
  README.md → src/lib/utils/image-bg-remove-ml.ts
- `3. Kiểm thử Worker Concurrency & Fallback trong EPUB Cleaner — [ĐÃ GIẢI QUYẾT XONG ✅]` --references--> `getDuplicateWorker()`  [INFERRED]
  review.md → src/lib/epub-editor/cleaner/duplicate-detector.ts
- `2026-10-16 (NHOM 1 Review Bug Fixes)` --references--> `parseTxtToChapters()`  [INFERRED]
  README.md → src/lib/epub-packer/parser/txt-parser.ts
- `2026-10-16 (Letter/Poem Dropcap Suppression & Heading Syntax Warning)` --references--> `validateTxtSyntax()`  [INFERRED]
  README.md → src/lib/epub-packer/parser/txt-syntax-validator.ts

## Import Cycles
- None detected.

## Communities (58 total, 18 thin omitted)

### Community 0 - "epub-source-parser.ts"
Cohesion: 0.09
Nodes (60): 2026-10-16 (TypeScript Strict Mode Full Compliance), analyzeChapterCandidates(), extractChunkBlocks(), extractMarkerTitle(), isDecorationOnly(), makeChapterMatcher(), pushIfLineStart(), scoreHeadingCandidate() (+52 more)

### Community 1 - "epub-editor-state.svelte.ts"
Cohesion: 0.05
Nodes (54): formatByteSize(), isDirty, categorizeFile(), exportEpubBlob(), extractLinkedCssPaths(), parseSpineOrder(), parseZipEntries(), deobfuscateAdobeFont() (+46 more)

### Community 2 - "content-rules.ts"
Cohesion: 0.15
Nodes (20): src_lib_epub_editor_epub_cleaner_extractcssurls, src_lib_epub_editor_epub_cleaner_extracthtmlreferences, src_lib_epub_editor_epub_editor_isvalidfontmagic, src_lib_epub_editor_epub_editor_validatehtml, CssAndFontsRule, XhtmlPagesRule, NavigationRule, OpfPackageRule (+12 more)

### Community 3 - "Changelog"
Cohesion: 0.14
Nodes (14): 2026-09-27, 2026-10-15, 2026-10-16 (CI/CD Pipeline Hardening & Knip Resolution), 2026-10-16 (Clean Up), 2026-10-16 (Fix Jacket Modal Font Persistence Across Templates), 2026-10-16 (Jacket Preview Modal Real-Time Font Selection), 2026-10-16 (Jacket Template Name Simplification & Dedicated Modal Font Selection), 2026-10-16 (Live Font Preview Dropdown for H1, H2, Dropcap & Jacket Modal) (+6 more)

### Community 4 - "txt-parser.ts"
Cohesion: 0.29
Nodes (12): 2026-10-16 (Letter/Poem Dropcap Suppression & Heading Syntax Warning), Trạng thái hệ thống, applyInlineFormatting(), cleanupTxtWorkerAndFallback(), escapeRegExp(), getClosingTag(), getTxtParserWorker(), isIllustrationTag() (+4 more)

### Community 5 - "image-bg-remove-ml.ts"
Cohesion: 0.08
Nodes (25): @imgly/background-removal, EpubImagesState, autoCropTransparentCanvas(), canvasToBlob(), cleanupWorkerAndFallbackPending(), compressAndResizeCanvas(), getOrCreateWorker(), loadImage() (+17 more)

### Community 6 - "EBOOK-TOOLS — FULL REGRESSION TESTING INSTRUCTION"
Cohesion: 0.05
Nodes (41): 10. PDF → EPUB USER FLOW, 11. EPUB EDITOR E2E, 12. EPUB CLEANER E2E, 13. EPUB VALIDATOR E2E, 14. IMAGE PROCESSING E2E, 15. WORKER TESTING, 16. REGRESSION TEST, 17. OUTPUT FILE VALIDATION (+33 more)

### Community 7 - "cleaner-engine.ts"
Cohesion: 0.11
Nodes (29): analyzeEpub(), analyzeOptimizationPlan(), cleanEpub(), cleanupDuplicateWorkerAndFallback(), DuplicatePendingJob, getDuplicateWorker(), pendingDuplicateJobs, _resetDuplicateWorkerForTest() (+21 more)

### Community 8 - "epub-to-txt-state.svelte.ts"
Cohesion: 0.18
Nodes (4): MAX_EPUB_FILE_SIZE, EpubToTxtResult, EpubToTxtState, triggerDownload()

### Community 9 - "pdf-splitter.ts"
Cohesion: 0.09
Nodes (26): App, Window, applyGrayscale(), cropCanvas(), formatEta(), loadPdfPreview(), pickConcurrency(), processPdfToJpg() (+18 more)

### Community 10 - "package.json"
Cohesion: 0.10
Nodes (20): name, packageManager, private, type, version, codemirror, @codemirror/commands, @codemirror/lang-css (+12 more)

### Community 11 - "epub-download-inspection.spec.ts"
Cohesion: 0.28
Nodes (4): ref_node_fs, ref_node_path, ref_node_process, @playwright/test

### Community 12 - "epub-reader-parser.ts"
Cohesion: 0.18
Nodes (19): categorizeResource(), extractEpubMetadata(), findOpfPath(), parseEpub(), parseOpfManifestAndSpine(), EpubBook, EpubBookMetadata, EpubContainer (+11 more)

### Community 13 - "devDependencies"
Cohesion: 0.10
Nodes (21): devDependencies, eslint, @eslint/js, eslint-plugin-svelte, globals, knip, @playwright/test, prettier (+13 more)

### Community 14 - "markdown-fixer.ts"
Cohesion: 0.18
Nodes (12): BOLD_ITALIC_PATTERNS, BOLD_PATTERNS, convertBrackets(), fixMarkdownZip(), ITALIC_PATTERNS, UNDERLINE_PATTERNS, src_lib_types_index_convertedbracketsresult, src_lib_types_index_fixmarkdownzipresult (+4 more)

### Community 15 - "scripts"
Cohesion: 0.11
Nodes (19): scripts, build, check, dev, format, format:check, knip, lint (+11 more)

### Community 16 - "compilerOptions"
Cohesion: 0.13
Nodes (14): ./.svelte-kit/tsconfig.json, compilerOptions, allowJs, checkJs, esModuleInterop, forceConsistentCasingInFileNames, moduleResolution, resolveJsonModule (+6 more)

### Community 18 - "pdf-splitter-state.svelte.ts"
Cohesion: 0.24
Nodes (7): MarkdownFixerState, src_lib_types_index_pdfpreviewpage, src_lib_utils_index_ensurezipext, src_lib_utils_index_slugify, src_lib_utils_index_triggerdownload, ensureZipExt(), slugify()

### Community 19 - "zip-writer.ts"
Cohesion: 0.06
Nodes (63): 2026-09-27 (Trước đó), 2026-10-15 (letter-box wrapper), 2026-10-16 (CI/CD Verification & Expanded Test Coverage), ref_css_template_intro_css_css_raw, ref_templates_css_template_base_css_raw, ref_templates_css_template_breaks_css_raw, ref_templates_css_template_center_page_css_raw, ref_templates_css_template_cover_css_raw (+55 more)

### Community 20 - "Kết quả xử lý rà soát (Worker Hardening & Fallback Optimization - 2026-10-16)"
Cohesion: 0.20
Nodes (8): 2026-10-16 (Worker Detached Buffer Fallback, Concurrency Testing & ML Self-Healing), 2. Xử lý lỗi tiềm ẩn trong EPUB Cleaner (Buffer Detachment khi Fallback) — [ĐÃ GIẢI QUYẾT XONG ✅], 3. Kiểm thử Worker Concurrency & Fallback trong EPUB Cleaner — [ĐÃ GIẢI QUYẾT XONG ✅], 5. Fallback xử lý ảnh bao phủ mọi lỗi Worker — [ĐÃ GIẢI QUYẾT XONG ✅], 6. Trạng thái kiểm thử & CI/CD — [ĐÃ LÀM RÕ & XÁC THỰC 100% ✅], Kết quả xử lý rà soát (Worker Hardening & Fallback Optimization - 2026-10-16), PendingJob, AsyncDuplicateWorkerMock

### Community 21 - "real-world-workflows.test.ts"
Cohesion: 0.11
Nodes (28): jszip, vitest, optimizeEpub(), extractBookMetadata(), rebuildEpubToc(), src_lib_epub_editor_epub_cleaner_analyzeoptimizationplan, src_lib_epub_editor_epub_cleaner_optimizeepub, src_lib_epub_editor_epub_editor_buildpreviewhtml (+20 more)

### Community 22 - "dependencies"
Cohesion: 0.18
Nodes (11): dependencies, codemirror, @codemirror/commands, @codemirror/lang-css, @codemirror/lang-html, @codemirror/state, @codemirror/theme-one-dark, @codemirror/view (+3 more)

### Community 24 - "epub-state.svelte.ts"
Cohesion: 0.06
Nodes (21): src_assets_fonts_metadata, uniqueFamilies, src_lib_epub_packer_epub_packer_epub_css, EpubState, EpubFontsState, EpubJacketState, EpubMetadataState, EpubSourceState (+13 more)

### Community 25 - "vite.config.js"
Cohesion: 0.25
Nodes (5): @sveltejs/adapter-cloudflare, @sveltejs/kit, @tailwindcss/vite, ref_types, vite

### Community 26 - "logger.ts"
Cohesion: 0.24
Nodes (6): isDebug(), isDebugEnabled, src_lib_utils_logger_js_test_1, src_lib_utils_logger_js_test_2, LogLevel, setDebug()

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

### Community 39 - "epub-source-state.svelte.ts"
Cohesion: 0.18
Nodes (14): MAX_IMAGE_FILE_SIZE, MAX_IMAGES_ZIP_FILE_SIZE, MAX_PDF_FILE_SIZE, MAX_TXT_FILE_SIZE, MAX_ZIP_FILE_SIZE, src_lib_epub_packer_parser_epub_source_parser_parsetxttochaptersasync, EpubSourceStateDependencies, IllustrationImageItem (+6 more)

### Community 41 - "result.type.ts"
Cohesion: 0.40
Nodes (3): AppError, Result, ValidationError

### Community 42 - "eslint.config.js"
Cohesion: 0.29
Nodes (6): gitignorePath, eslint, @eslint/js, eslint-plugin-svelte, globals, typescript-eslint

### Community 43 - "txt-syntax-validator.ts"
Cohesion: 0.28
Nodes (8): 2026-10-16 (NHOM 1 Review Bug Fixes), checkFootnoteSyntax(), checkInlineFormatting(), OpenBlockInfo, validateTxtSyntax(), src_lib_types_index_txtsyntaxerror, src_lib_types_index_txtsyntaxvalidationresult, src_lib_types_index_txtsyntaxwarning

### Community 51 - "generate-fonts-meta.js"
Cohesion: 0.18
Nodes (10): fontkit, ref_fs, ref_module, ref_path, files, fontkit, FONTS_DIR, metadata (+2 more)

### Community 52 - "AI_WORKFLOW.md — Quy trình làm việc & Kiểm thử bắt buộc cho AI Coding Agent"
Cohesion: 0.06
Nodes (31): 0. Thứ tự đọc khi mở lại project (BẮT BUỘC, không được bỏ qua bước nào), 1. Ngăn xếp công nghệ & quy tắc code bắt buộc, 2.1 Chu trình kiểm tra cục bộ khi sửa code (Local Dev Loop), 2.2 Pipeline Chốt Chặn CI/CD (BẮT BUỘC 100% PASS TRƯỚC KHI COMMIT HOẶC PUSH), 2.3 Quy tắc chỉnh sửa file (bắt buộc), 2. Pipeline bắt buộc sau MỌI lần chỉnh sửa code & Trước khi Commit, 3.1 Kiến trúc Hệ Thống Kiểm Thử 4 Tầng, 3.2 Ma Trận Hướng Dẫn: "Sửa Gì - Chạy Test Gì?" (Test Decision Matrix) (+23 more)

### Community 53 - "utils/index.ts"
Cohesion: 0.29
Nodes (3): mockAnchor, mockDocument, mockPdfjsLib

### Community 54 - "🚀 Các công cụ chính"
Cohesion: 0.29
Nodes (7): 1. ✏️ Chỉnh sửa & Kiểm định EPUB Trực quan (EPUB Editor & Validator Suite), 2. 📦 Đóng gói EPUB (EPUB Packer), 3. 🎨 Tẩy Nền Hoa Văn Tự Động bằng AI (ML Ornament Background Removal), 4. 📄 Tách trang PDF → JPG (PDF Processor), 5. ✍️ Chuẩn hóa Markdown (Markdown Fixer), 6. 💻 Desktop App: TXT → PDF CJK, 🚀 Các công cụ chính

### Community 55 - "⚒️ Ebook Forge — Bộ Công Cụ Chế Bản Sách Điện Tử"
Cohesion: 0.29
Nodes (7): ⚒️ Ebook Forge — Bộ Công Cụ Chế Bản Sách Điện Tử, ⚡ Hướng dẫn Cài đặt & Sử dụng, Khởi chạy ứng dụng, 🧪 Quy chuẩn Kiểm thử & Chất lượng Mã nguồn (Quality Gates), 🛡️ Quyền riêng tư & Bảo mật, Yêu cầu hệ thống, Đóng gói ứng dụng (Production Build)

### Community 56 - "components.type.ts"
Cohesion: 0.29
Nodes (6): svelte, ButtonProps, DropZoneProps, FontSelectProps, InputProps, PageHeaderProps

### Community 57 - "txt-parser.worker.ts"
Cohesion: 0.40
Nodes (5): TxtParserPendingJob, ParseTxtWorkerRequest, ParseTxtWorkerResponse, ParseTxtOptions, src_lib_types_index_parsetxtoptions

## Knowledge Gaps
- **240 isolated node(s):** `gitignorePath`, `$schema`, `project`, `entry`, `ignoreDependencies` (+235 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 367 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **18 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `jszip` connect `real-world-workflows.test.ts` to `epub-editor-state.svelte.ts`, `content-rules.ts`, `image-bg-remove-ml.ts`, `cleaner-engine.ts`, `epub-source-state.svelte.ts`, `pdf-splitter.ts`, `package.json`, `epub-download-inspection.spec.ts`, `epub-reader-parser.ts`, `markdown-fixer.ts`, `zip-writer.ts`?**
  _High betweenness centrality (0.179) - this node is a cross-community bridge._
- **Why does `Trạng thái hệ thống` connect `txt-parser.ts` to `epub-source-parser.ts`, `image-bg-remove-ml.ts`, `zip-writer.ts`, `Kết quả xử lý rà soát (Worker Hardening & Fallback Optimization - 2026-10-16)`, `real-world-workflows.test.ts`, `⚒️ Ebook Forge — Bộ Công Cụ Chế Bản Sách Điện Tử`?**
  _High betweenness centrality (0.089) - this node is a cross-community bridge._
- **Why does `⚒️ Ebook Forge — Bộ Công Cụ Chế Bản Sách Điện Tử` connect `⚒️ Ebook Forge — Bộ Công Cụ Chế Bản Sách Điện Tử` to `Changelog`, `AI_WORKFLOW.md — Quy trình làm việc & Kiểm thử bắt buộc cho AI Coding Agent`, `txt-parser.ts`, `🚀 Các công cụ chính`?**
  _High betweenness centrality (0.088) - this node is a cross-community bridge._
- **What connects `gitignorePath`, `$schema`, `project` to the rest of the system?**
  _240 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `epub-source-parser.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.09292412617220801 - nodes in this community are weakly interconnected._
- **Should `epub-editor-state.svelte.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.050331731869137496 - nodes in this community are weakly interconnected._
- **Should `Changelog` be split into smaller, more focused modules?**
  _Cohesion score 0.14285714285714285 - nodes in this community are weakly interconnected._