# Graph Report - ebook-tools  (2026-10-16)

## Corpus Check
- 143 files · ~99,718 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 48 file(s) not represented in the graph (top: .otf 18, .ttf 15, .css 10)

## Summary
- 903 nodes · 2055 edges · 55 communities (36 shown, 19 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 21 edges (avg confidence: 0.95)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `7da80942`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- epub-source-parser.ts
- epub-editor.test.ts
- txt-parser.ts
- Kết quả xử lý rà soát (Worker Cancellation & Fallback Resolutions - 2026-10-16)
- lib/types/index.ts
- image-bg-remove-ml.ts
- EBOOK-TOOLS — FULL REGRESSION TESTING INSTRUCTION
- epub-editor-state.svelte.ts
- epub-to-txt.ts
- pdf-splitter.ts
- package.json
- epub-book-ops.ts
- jszip
- devDependencies
- EpubSourceState
- scripts
- compilerOptions
- src_lib_epub_packer_parser_epub_source_parser_analyzechaptercandidates
- zip-writer.ts
- epub-source-state.svelte.ts
- real-world-workflows.test.ts
- dependencies
- stylesheet-builder.ts
- pdf-splitter.type.ts
- vite.config.js
- src_lib_utils_index_logger
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
- eslint.config.js
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
- slugify
- PdfSplitterState

## God Nodes (most connected - your core abstractions)
1. `jszip` - 32 edges
2. `EBOOK-TOOLS — FULL REGRESSION TESTING INSTRUCTION` - 32 edges
3. `Logger` - 27 edges
4. `resolveRelativePath()` - 21 edges
5. `vitest` - 20 edges
6. `parseTxtToChapters()` - 20 edges
7. `EpubImagesState` - 20 edges
8. `escapeXml()` - 20 edges
9. `scripts` - 19 edges
10. `EpubEditorState` - 18 edges

## Surprising Connections (you probably didn't know these)
- `Trạng thái hệ thống` --references--> `isIllustrationTag()`  [INFERRED]
  README.md → src/lib/epub-packer/parser/txt-parser.ts
- `Trạng thái hệ thống` --references--> `parseTxtToChapters()`  [INFERRED]
  README.md → src/lib/epub-packer/parser/txt-parser.ts
- `2026-09-27 (Trước đó)` --references--> `mergeBrokenParagraphs()`  [INFERRED]
  README.md → src/lib/epub-packer/xml-builders/chapter-builder.ts
- `2026-10-15 (letter-box wrapper)` --references--> `mergeBrokenParagraphs()`  [INFERRED]
  README.md → src/lib/epub-packer/xml-builders/chapter-builder.ts
- `2026-10-16 (Letter/Poem Dropcap Suppression & Heading Syntax Warning)` --references--> `buildChapterXhtml()`  [INFERRED]
  README.md → src/lib/epub-packer/xml-builders/chapter-builder.ts

## Import Cycles
- None detected.

## Communities (55 total, 19 thin omitted)

### Community 0 - "epub-source-parser.ts"
Cohesion: 0.09
Nodes (62): 2026-10-16 (TypeScript Strict Mode Full Compliance), analyzeChapterCandidates(), extractChunkBlocks(), extractMarkerTitle(), isDecorationOnly(), makeChapterMatcher(), pushIfLineStart(), scoreHeadingCandidate() (+54 more)

### Community 1 - "epub-editor.test.ts"
Cohesion: 0.06
Nodes (60): categorizeFile(), exportEpubBlob(), parseSpineOrder(), parseZipEntries(), deobfuscateAdobeFont(), deobfuscateIdpfFont(), isValidFontMagic(), validateDirtyPages() (+52 more)

### Community 2 - "txt-parser.ts"
Cohesion: 0.13
Nodes (24): 2026-10-16 (Letter/Poem Dropcap Suppression & Heading Syntax Warning), 2026-10-16 (NHOM 1 Review Bug Fixes), applyInlineFormatting(), cleanupTxtWorkerAndFallback(), escapeRegExp(), getClosingTag(), getTxtParserWorker(), isIllustrationTag() (+16 more)

### Community 3 - "Kết quả xử lý rà soát (Worker Cancellation & Fallback Resolutions - 2026-10-16)"
Cohesion: 0.50
Nodes (3): 1. Hủy tác vụ Worker — Đã xử lý triệt để race condition ✅ [ĐÃ HOÀN THÀNH], 2. Image Background Removal — Hoàn thiện fallback tự phục hồi ✅ [ĐÃ HOÀN THÀNH], Kết quả xử lý rà soát (Worker Cancellation & Fallback Resolutions - 2026-10-16)

### Community 4 - "lib/types/index.ts"
Cohesion: 0.12
Nodes (18): ref_css_template_intro_css_css_raw, prepareChapters(), EPUB_CSS, src_lib_epub_packer_epub_packer_epub_css, src_lib_epub_packer_state_index_epubfontsstate, src_lib_epub_packer_state_index_epubimagesstate, src_lib_epub_packer_state_index_epubjacketstate, src_lib_epub_packer_state_index_epubmetadatastate (+10 more)

### Community 5 - "image-bg-remove-ml.ts"
Cohesion: 0.07
Nodes (24): 2026-10-16 (Worker Cancellation Race Condition & ML Fallback Hardening), @imgly/background-removal, EpubImagesState, autoCropTransparentCanvas(), canvasToBlob(), cleanupWorkerAndRejectPending(), compressAndResizeCanvas(), getOrCreateWorker() (+16 more)

### Community 6 - "EBOOK-TOOLS — FULL REGRESSION TESTING INSTRUCTION"
Cohesion: 0.05
Nodes (41): 10. PDF → EPUB USER FLOW, 11. EPUB EDITOR E2E, 12. EPUB CLEANER E2E, 13. EPUB VALIDATOR E2E, 14. IMAGE PROCESSING E2E, 15. WORKER TESTING, 16. REGRESSION TEST, 17. OUTPUT FILE VALIDATION (+33 more)

### Community 7 - "epub-editor-state.svelte.ts"
Cohesion: 0.05
Nodes (38): analyzeEpub(), analyzeOptimizationPlan(), cleanEpub(), cleanupDuplicateWorkerAndFallback(), DuplicatePendingJob, getDuplicateWorker(), pendingDuplicateJobs, scanDuplicateResources() (+30 more)

### Community 8 - "epub-to-txt.ts"
Cohesion: 0.07
Nodes (41): 1. ✏️ Chỉnh sửa & Kiểm định EPUB Trực quan (EPUB Editor & Validator Suite), 2026-09-27, 2026-09-27 (Trước đó), 2026-10-15, 2026-10-15 (letter-box wrapper), 2026-10-16 (CI/CD Pipeline Hardening & Knip Resolution), 2026-10-16 (CI/CD Verification & Expanded Test Coverage), 2026-10-16 (Clean Up) (+33 more)

### Community 9 - "pdf-splitter.ts"
Cohesion: 0.14
Nodes (19): applyGrayscale(), cropCanvas(), formatEta(), loadPdfPreview(), pickConcurrency(), processPdfToJpg(), runWorker(), updateProgress() (+11 more)

### Community 10 - "package.json"
Cohesion: 0.10
Nodes (20): name, packageManager, private, type, version, codemirror, @codemirror/commands, @codemirror/lang-css (+12 more)

### Community 11 - "epub-book-ops.ts"
Cohesion: 0.17
Nodes (20): extractBookMetadata(), rebuildEpubToc(), reorderOpfSpine(), TocChapterInfo, updateBookMetadata(), replaceOrCreateTag(), src_lib_epub_editor_epub_editor_resolverelativepath, buildNavXhtml() (+12 more)

### Community 12 - "jszip"
Cohesion: 0.11
Nodes (23): jszip, ref_node_fs, ref_node_path, ref_node_process, @playwright/test, categorizeResource(), extractEpubMetadata(), findOpfPath() (+15 more)

### Community 13 - "devDependencies"
Cohesion: 0.10
Nodes (21): devDependencies, eslint, @eslint/js, eslint-plugin-svelte, globals, knip, @playwright/test, prettier (+13 more)

### Community 14 - "EpubSourceState"
Cohesion: 0.16
Nodes (8): EpubState, assignSequentialChapterIds(), EpubFontsState, EpubJacketState, EpubMetadataState, EpubSourceState, src_lib_utils_index_ensureepubext, ensureEpubExt()

### Community 15 - "scripts"
Cohesion: 0.11
Nodes (19): scripts, build, check, dev, format, format:check, knip, lint (+11 more)

### Community 16 - "compilerOptions"
Cohesion: 0.13
Nodes (14): ./.svelte-kit/tsconfig.json, compilerOptions, allowJs, checkJs, esModuleInterop, forceConsistentCasingInFileNames, moduleResolution, resolveJsonModule (+6 more)

### Community 19 - "zip-writer.ts"
Cohesion: 0.13
Nodes (22): ref_templates_css_template_cover_css_raw, src_assets_fonts_metadata, prepareMetadata(), resolveActiveFonts(), getDynamicCss(), prepareFinalCss(), assembleEpubZip(), buildEpubBlob() (+14 more)

### Community 20 - "epub-source-state.svelte.ts"
Cohesion: 0.18
Nodes (13): MAX_IMAGE_FILE_SIZE, MAX_IMAGES_ZIP_FILE_SIZE, MAX_PDF_FILE_SIZE, MAX_TXT_FILE_SIZE, MAX_ZIP_FILE_SIZE, src_lib_epub_packer_parser_epub_source_parser_parsetxttochaptersasync, EpubSourceStateDependencies, IllustrationImageItem (+5 more)

### Community 21 - "real-world-workflows.test.ts"
Cohesion: 0.17
Nodes (11): vitest, optimizeEpub(), src_lib_epub_editor_epub_cleaner_analyzeoptimizationplan, src_lib_epub_editor_epub_cleaner_optimizeepub, src_lib_epub_editor_epub_editor_buildpreviewhtml, src_lib_epub_editor_epub_editor_parsezipentries, src_lib_epub_editor_epub_validator_validateepub, validateEpub() (+3 more)

### Community 22 - "dependencies"
Cohesion: 0.18
Nodes (11): dependencies, codemirror, @codemirror/commands, @codemirror/lang-css, @codemirror/lang-html, @codemirror/state, @codemirror/theme-one-dark, @codemirror/view (+3 more)

### Community 23 - "stylesheet-builder.ts"
Cohesion: 0.14
Nodes (17): ref_templates_css_template_base_css_raw, ref_templates_css_template_breaks_css_raw, ref_templates_css_template_center_page_css_raw, ref_templates_css_template_headings_css_raw, ref_templates_css_template_notes_css_raw, ref_templates_css_template_ornaments_css_raw, ref_templates_css_template_quotes_css_raw, EpubChapterItem (+9 more)

### Community 24 - "pdf-splitter.type.ts"
Cohesion: 0.24
Nodes (8): App, Window, PdfJsDocument, PdfJsLib, PdfJsPage, PdfJsViewport, PdfProgressInfo, ProcessPdfResult

### Community 25 - "vite.config.js"
Cohesion: 0.25
Nodes (5): @sveltejs/adapter-cloudflare, @sveltejs/kit, @tailwindcss/vite, ref_types, vite

### Community 26 - "src_lib_utils_index_logger"
Cohesion: 0.17
Nodes (14): BOLD_ITALIC_PATTERNS, BOLD_PATTERNS, convertBrackets(), fixMarkdownZip(), ITALIC_PATTERNS, UNDERLINE_PATTERNS, src_lib_types_index_convertedbracketsresult, src_lib_types_index_fixmarkdownzipresult (+6 more)

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
Cohesion: 0.18
Nodes (4): MAX_EPUB_FILE_SIZE, EpubToTxtState, triggerDownload(), src_lib_utils_index_triggerdownload

### Community 41 - "eslint.config.js"
Cohesion: 0.29
Nodes (6): gitignorePath, eslint, @eslint/js, eslint-plugin-svelte, globals, typescript-eslint

### Community 42 - "components.type.ts"
Cohesion: 0.33
Nodes (5): svelte, ButtonProps, DropZoneProps, InputProps, PageHeaderProps

### Community 43 - "result.type.ts"
Cohesion: 0.40
Nodes (3): AppError, Result, ValidationError

### Community 44 - "utils/index.ts"
Cohesion: 0.14
Nodes (11): isDebug(), isDebugEnabled, src_lib_utils_logger_js_test_1, src_lib_utils_logger_js_test_2, Logger, LogLevel, setDebug(), ensureZipExt() (+3 more)

### Community 51 - "generate-fonts-meta.js"
Cohesion: 0.18
Nodes (10): fontkit, ref_fs, ref_module, ref_path, files, fontkit, FONTS_DIR, metadata (+2 more)

### Community 52 - "AI_WORKFLOW.md — Quy trình làm việc & Kiểm thử bắt buộc cho AI Coding Agent"
Cohesion: 0.06
Nodes (31): 0. Thứ tự đọc khi mở lại project (BẮT BUỘC, không được bỏ qua bước nào), 1. Ngăn xếp công nghệ & quy tắc code bắt buộc, 2.1 Chu trình kiểm tra cục bộ khi sửa code (Local Dev Loop), 2.2 Pipeline Chốt Chặn CI/CD (BẮT BUỘC 100% PASS TRƯỚC KHI COMMIT HOẶC PUSH), 2.3 Quy tắc chỉnh sửa file (bắt buộc), 2. Pipeline bắt buộc sau MỌI lần chỉnh sửa code & Trước khi Commit, 3.1 Kiến trúc Hệ Thống Kiểm Thử 4 Tầng, 3.2 Ma Trận Hướng Dẫn: "Sửa Gì - Chạy Test Gì?" (Test Decision Matrix) (+23 more)

## Knowledge Gaps
- **233 isolated node(s):** `gitignorePath`, `$schema`, `project`, `entry`, `ignoreDependencies` (+228 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 359 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **19 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `jszip` connect `jszip` to `epub-source-parser.ts`, `epub-editor.test.ts`, `txt-parser.ts`, `image-bg-remove-ml.ts`, `epub-editor-state.svelte.ts`, `epub-to-txt.ts`, `pdf-splitter.ts`, `package.json`, `epub-book-ops.ts`, `zip-writer.ts`, `epub-source-state.svelte.ts`, `real-world-workflows.test.ts`, `src_lib_utils_index_logger`?**
  _High betweenness centrality (0.178) - this node is a cross-community bridge._
- **Why does `⚒️ Ebook Forge — Bộ Công Cụ Chế Bản Sách Điện Tử` connect `epub-to-txt.ts` to `AI_WORKFLOW.md — Quy trình làm việc & Kiểm thử bắt buộc cho AI Coding Agent`?**
  _High betweenness centrality (0.089) - this node is a cross-community bridge._
- **Why does `Trạng thái hệ thống` connect `epub-to-txt.ts` to `epub-source-parser.ts`, `txt-parser.ts`, `image-bg-remove-ml.ts`?**
  _High betweenness centrality (0.088) - this node is a cross-community bridge._
- **What connects `gitignorePath`, `$schema`, `project` to the rest of the system?**
  _233 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `epub-source-parser.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.08893360160965795 - nodes in this community are weakly interconnected._
- **Should `epub-editor.test.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.055379746835443035 - nodes in this community are weakly interconnected._
- **Should `txt-parser.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.12962962962962962 - nodes in this community are weakly interconnected._