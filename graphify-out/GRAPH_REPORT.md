# Graph Report - ebook-tools  (2026-10-21)

## Corpus Check
- 143 files · ~105,717 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 48 file(s) not represented in the graph (top: .otf 18, .ttf 15, .css 10)

## Summary
- 918 nodes · 2088 edges · 55 communities (36 shown, 19 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 28 edges (avg confidence: 0.95)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `f4acaeed`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- epub-source-parser.ts
- epub-editor-state.svelte.ts
- utils/index.ts
- Changelog
- real-world-workflows.test.ts
- image-bg-remove-ml.ts
- EBOOK-TOOLS — FULL REGRESSION TESTING INSTRUCTION
- cleaner-engine.ts
- epub-source-state.svelte.ts
- pdf-splitter.ts
- package.json
- txt-parser.ts
- epub-reader-parser.ts
- devDependencies
- txt-syntax-validator.ts
- scripts
- compilerOptions
- src_lib_epub_packer_parser_epub_source_parser_analyzechaptercandidates
- EpubSourceState
- lib/types/index.ts
- markdown-fixer.ts
- dependencies
- app.d.ts
- vite.config.js
- epub-download-inspection.spec.ts
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
- PdfSplitterState
- result.type.ts
- 🚀 Các công cụ chính
- ⚒️ Ebook Forge — Bộ Công Cụ Chế Bản Sách Điện Tử
- txt-parser.worker.ts
- src_lib_epub_packer_parser_epub_source_parser_assignsequentialchapterids
- src_lib_epub_packer_parser_epub_source_parser_cleanheaderfooterocr
- src_lib_epub_packer_parser_epub_source_parser_converttxtinline
- src_lib_epub_packer_parser_epub_source_parser_getcleanedlinesreport
- src_lib_epub_packer_parser_epub_source_parser_parsemarkdownblocks
- src_lib_epub_packer_parser_epub_source_parser_rendermarkdownblocks
- generate-fonts-meta.js
- AI_WORKFLOW.md — Quy trình làm việc & Kiểm thử bắt buộc cho AI Coding Agent
- AsyncDuplicateWorkerMock
- components.type.ts

## God Nodes (most connected - your core abstractions)
1. `jszip` - 32 edges
2. `EBOOK-TOOLS — FULL REGRESSION TESTING INSTRUCTION` - 32 edges
3. `Logger` - 27 edges
4. `Changelog` - 24 edges
5. `resolveRelativePath()` - 21 edges
6. `vitest` - 20 edges
7. `parseTxtToChapters()` - 20 edges
8. `EpubImagesState` - 20 edges
9. `escapeXml()` - 20 edges
10. `scripts` - 19 edges

## Surprising Connections (you probably didn't know these)
- `2026-10-16 (H2 Font Classification with Intervening Ornaments)` --references--> `classifyChapterHeadings()`  [INFERRED]
  README.md → src/lib/epub-packer/xml-builders/chapter-builder.ts
- `2026-10-16 (H2 Sub Font Selector & 2-Column Font Settings Layout)` --references--> `EpubFontsConfig`  [INFERRED]
  README.md → src/lib/types/epub.type.ts
- `2026-10-16 (Letter/Poem Dropcap Suppression & Heading Syntax Warning)` --references--> `parseTxtToChapters()`  [INFERRED]
  README.md → src/lib/epub-packer/parser/txt-parser.ts
- `2026-10-16 (NHOM 1 Review Bug Fixes)` --references--> `parseTxtToChapters()`  [INFERRED]
  README.md → src/lib/epub-packer/parser/txt-parser.ts
- `2026-09-27 (Trước đó)` --references--> `mergeBrokenParagraphs()`  [INFERRED]
  README.md → src/lib/epub-packer/xml-builders/chapter-builder.ts

## Import Cycles
- None detected.

## Communities (55 total, 19 thin omitted)

### Community 0 - "epub-source-parser.ts"
Cohesion: 0.09
Nodes (64): 2026-10-16 (TypeScript Strict Mode Full Compliance), analyzeChapterCandidates(), assignSequentialChapterIds(), extractChunkBlocks(), extractMarkerTitle(), isDecorationOnly(), makeChapterMatcher(), pushIfLineStart() (+56 more)

### Community 1 - "epub-editor-state.svelte.ts"
Cohesion: 0.05
Nodes (54): formatByteSize(), isDirty, categorizeFile(), exportEpubBlob(), extractLinkedCssPaths(), parseSpineOrder(), parseZipEntries(), deobfuscateAdobeFont() (+46 more)

### Community 2 - "utils/index.ts"
Cohesion: 0.13
Nodes (12): triggerDownload(), isDebug(), isDebugEnabled, src_lib_utils_logger_js_test_1, src_lib_utils_logger_js_test_2, Logger, LogLevel, setDebug() (+4 more)

### Community 3 - "Changelog"
Cohesion: 0.11
Nodes (20): 2026-09-27, 2026-09-27 (Trước đó), 2026-10-15, 2026-10-15 (letter-box wrapper), 2026-10-16 (CI/CD Pipeline Hardening & Knip Resolution), 2026-10-16 (CI/CD Verification & Expanded Test Coverage), 2026-10-16 (Clean Up), 2026-10-16 (Fix Jacket Modal Font Persistence Across Templates) (+12 more)

### Community 4 - "real-world-workflows.test.ts"
Cohesion: 0.08
Nodes (32): jszip, vitest, analyzeOptimizationPlan(), cleanEpub(), optimizeEpub(), extractBookMetadata(), findOpfPath(), rebuildEpubToc() (+24 more)

### Community 5 - "image-bg-remove-ml.ts"
Cohesion: 0.07
Nodes (27): 2026-10-16 (Worker Cancellation Race Condition & ML Fallback Hardening), @imgly/background-removal, EpubImagesState, autoCropTransparentCanvas(), canvasToBlob(), cleanupWorkerAndFallbackPending(), compressAndResizeCanvas(), getOrCreateWorker() (+19 more)

### Community 6 - "EBOOK-TOOLS — FULL REGRESSION TESTING INSTRUCTION"
Cohesion: 0.05
Nodes (41): 10. PDF → EPUB USER FLOW, 11. EPUB EDITOR E2E, 12. EPUB CLEANER E2E, 13. EPUB VALIDATOR E2E, 14. IMAGE PROCESSING E2E, 15. WORKER TESTING, 16. REGRESSION TEST, 17. OUTPUT FILE VALIDATION (+33 more)

### Community 7 - "cleaner-engine.ts"
Cohesion: 0.07
Nodes (46): analyzeEpub(), cleanupDuplicateWorkerAndFallback(), DuplicatePendingJob, getDuplicateWorker(), pendingDuplicateJobs, _resetDuplicateWorkerForTest(), scanDuplicateResources(), computeDuplicateResources() (+38 more)

### Community 8 - "epub-source-state.svelte.ts"
Cohesion: 0.17
Nodes (15): MAX_EPUB_FILE_SIZE, MAX_IMAGE_FILE_SIZE, MAX_IMAGES_ZIP_FILE_SIZE, MAX_PDF_FILE_SIZE, MAX_TXT_FILE_SIZE, MAX_ZIP_FILE_SIZE, src_lib_epub_packer_parser_epub_source_parser_parsetxttochaptersasync, EpubSourceStateDependencies (+7 more)

### Community 9 - "pdf-splitter.ts"
Cohesion: 0.11
Nodes (23): applyGrayscale(), cropCanvas(), formatEta(), loadPdfPreview(), pickConcurrency(), processPdfToJpg(), runWorker(), updateProgress() (+15 more)

### Community 10 - "package.json"
Cohesion: 0.08
Nodes (26): gitignorePath, name, packageManager, private, type, version, codemirror, @codemirror/commands (+18 more)

### Community 11 - "txt-parser.ts"
Cohesion: 0.33
Nodes (11): Trạng thái hệ thống, applyInlineFormatting(), cleanupTxtWorkerAndFallback(), escapeRegExp(), getClosingTag(), getTxtParserWorker(), isIllustrationTag(), parseTxtToChapters() (+3 more)

### Community 12 - "epub-reader-parser.ts"
Cohesion: 0.17
Nodes (18): categorizeResource(), extractEpubMetadata(), findOpfPath(), parseEpub(), parseOpfManifestAndSpine(), EpubBook, EpubBookMetadata, EpubContainer (+10 more)

### Community 13 - "devDependencies"
Cohesion: 0.10
Nodes (21): devDependencies, eslint, @eslint/js, eslint-plugin-svelte, globals, knip, @playwright/test, prettier (+13 more)

### Community 14 - "txt-syntax-validator.ts"
Cohesion: 0.24
Nodes (9): 2026-10-16 (Letter/Poem Dropcap Suppression & Heading Syntax Warning), 2026-10-16 (NHOM 1 Review Bug Fixes), checkFootnoteSyntax(), checkInlineFormatting(), OpenBlockInfo, validateTxtSyntax(), src_lib_types_index_txtsyntaxerror, src_lib_types_index_txtsyntaxvalidationresult (+1 more)

### Community 15 - "scripts"
Cohesion: 0.11
Nodes (19): scripts, build, check, dev, format, format:check, knip, lint (+11 more)

### Community 16 - "compilerOptions"
Cohesion: 0.13
Nodes (14): ./.svelte-kit/tsconfig.json, compilerOptions, allowJs, checkJs, esModuleInterop, forceConsistentCasingInFileNames, moduleResolution, resolveJsonModule (+6 more)

### Community 18 - "EpubSourceState"
Cohesion: 0.16
Nodes (7): EpubState, EpubFontsState, EpubJacketState, EpubMetadataState, EpubSourceState, src_lib_utils_index_ensureepubext, ensureEpubExt()

### Community 19 - "lib/types/index.ts"
Cohesion: 0.06
Nodes (74): ref_css_template_intro_css_css_raw, ref_templates_css_template_base_css_raw, ref_templates_css_template_breaks_css_raw, ref_templates_css_template_center_page_css_raw, ref_templates_css_template_cover_css_raw, ref_templates_css_template_headings_css_raw, ref_templates_css_template_notes_css_raw, ref_templates_css_template_ornaments_css_raw (+66 more)

### Community 20 - "markdown-fixer.ts"
Cohesion: 0.18
Nodes (13): BOLD_ITALIC_PATTERNS, BOLD_PATTERNS, convertBrackets(), fixMarkdownZip(), ITALIC_PATTERNS, UNDERLINE_PATTERNS, src_lib_types_index_convertedbracketsresult, src_lib_types_index_fixmarkdownzipresult (+5 more)

### Community 22 - "dependencies"
Cohesion: 0.18
Nodes (11): dependencies, codemirror, @codemirror/commands, @codemirror/lang-css, @codemirror/lang-html, @codemirror/state, @codemirror/theme-one-dark, @codemirror/view (+3 more)

### Community 23 - "app.d.ts"
Cohesion: 0.67
Nodes (3): App, Window, PdfJsLib

### Community 25 - "vite.config.js"
Cohesion: 0.25
Nodes (5): @sveltejs/adapter-cloudflare, @sveltejs/kit, @tailwindcss/vite, ref_types, vite

### Community 26 - "epub-download-inspection.spec.ts"
Cohesion: 0.28
Nodes (4): ref_node_fs, ref_node_path, ref_node_process, @playwright/test

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

### Community 39 - "PdfSplitterState"
Cohesion: 0.17
Nodes (3): MarkdownFixerState, PdfSplitterState, slugify()

### Community 41 - "result.type.ts"
Cohesion: 0.40
Nodes (3): AppError, Result, ValidationError

### Community 42 - "🚀 Các công cụ chính"
Cohesion: 0.29
Nodes (7): 1. ✏️ Chỉnh sửa & Kiểm định EPUB Trực quan (EPUB Editor & Validator Suite), 2. 📦 Đóng gói EPUB (EPUB Packer), 3. 🎨 Tẩy Nền Hoa Văn Tự Động bằng AI (ML Ornament Background Removal), 4. 📄 Tách trang PDF → JPG (PDF Processor), 5. ✍️ Chuẩn hóa Markdown (Markdown Fixer), 6. 💻 Desktop App: TXT → PDF CJK, 🚀 Các công cụ chính

### Community 43 - "⚒️ Ebook Forge — Bộ Công Cụ Chế Bản Sách Điện Tử"
Cohesion: 0.29
Nodes (7): ⚒️ Ebook Forge — Bộ Công Cụ Chế Bản Sách Điện Tử, ⚡ Hướng dẫn Cài đặt & Sử dụng, Khởi chạy ứng dụng, 🧪 Quy chuẩn Kiểm thử & Chất lượng Mã nguồn (Quality Gates), 🛡️ Quyền riêng tư & Bảo mật, Yêu cầu hệ thống, Đóng gói ứng dụng (Production Build)

### Community 44 - "txt-parser.worker.ts"
Cohesion: 0.40
Nodes (5): TxtParserPendingJob, ParseTxtWorkerRequest, ParseTxtWorkerResponse, ParseTxtOptions, src_lib_types_index_parsetxtoptions

### Community 51 - "generate-fonts-meta.js"
Cohesion: 0.18
Nodes (10): fontkit, ref_fs, ref_module, ref_path, files, fontkit, FONTS_DIR, metadata (+2 more)

### Community 52 - "AI_WORKFLOW.md — Quy trình làm việc & Kiểm thử bắt buộc cho AI Coding Agent"
Cohesion: 0.06
Nodes (31): 0. Thứ tự đọc khi mở lại project (BẮT BUỘC, không được bỏ qua bước nào), 1. Ngăn xếp công nghệ & quy tắc code bắt buộc, 2.1 Chu trình kiểm tra cục bộ khi sửa code (Local Dev Loop), 2.2 Pipeline Chốt Chặn CI/CD (BẮT BUỘC 100% PASS TRƯỚC KHI COMMIT HOẶC PUSH), 2.3 Quy tắc chỉnh sửa file (bắt buộc), 2. Pipeline bắt buộc sau MỌI lần chỉnh sửa code & Trước khi Commit, 3.1 Kiến trúc Hệ Thống Kiểm Thử 4 Tầng, 3.2 Ma Trận Hướng Dẫn: "Sửa Gì - Chạy Test Gì?" (Test Decision Matrix) (+23 more)

### Community 56 - "components.type.ts"
Cohesion: 0.29
Nodes (6): svelte, ButtonProps, DropZoneProps, FontSelectProps, InputProps, PageHeaderProps

## Knowledge Gaps
- **241 isolated node(s):** `gitignorePath`, `$schema`, `project`, `entry`, `ignoreDependencies` (+236 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 367 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **19 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `jszip` connect `real-world-workflows.test.ts` to `epub-source-parser.ts`, `epub-editor-state.svelte.ts`, `image-bg-remove-ml.ts`, `cleaner-engine.ts`, `epub-source-state.svelte.ts`, `pdf-splitter.ts`, `package.json`, `epub-reader-parser.ts`, `lib/types/index.ts`, `markdown-fixer.ts`, `epub-download-inspection.spec.ts`?**
  _High betweenness centrality (0.178) - this node is a cross-community bridge._
- **Why does `⚒️ Ebook Forge — Bộ Công Cụ Chế Bản Sách Điện Tử` connect `⚒️ Ebook Forge — Bộ Công Cụ Chế Bản Sách Điện Tử` to `txt-parser.ts`, `🚀 Các công cụ chính`, `Changelog`, `AI_WORKFLOW.md — Quy trình làm việc & Kiểm thử bắt buộc cho AI Coding Agent`?**
  _High betweenness centrality (0.088) - this node is a cross-community bridge._
- **Why does `Trạng thái hệ thống` connect `txt-parser.ts` to `epub-source-parser.ts`, `Changelog`, `real-world-workflows.test.ts`, `image-bg-remove-ml.ts`, `⚒️ Ebook Forge — Bộ Công Cụ Chế Bản Sách Điện Tử`, `lib/types/index.ts`, `AsyncDuplicateWorkerMock`?**
  _High betweenness centrality (0.086) - this node is a cross-community bridge._
- **What connects `gitignorePath`, `$schema`, `project` to the rest of the system?**
  _241 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `epub-source-parser.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.08599695585996955 - nodes in this community are weakly interconnected._
- **Should `epub-editor-state.svelte.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.052125100240577385 - nodes in this community are weakly interconnected._
- **Should `utils/index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.12648221343873517 - nodes in this community are weakly interconnected._