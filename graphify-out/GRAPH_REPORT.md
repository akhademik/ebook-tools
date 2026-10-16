# Graph Report - ebook-tools  (2026-10-16)

## Corpus Check
- 144 files · ~103,346 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 48 file(s) not represented in the graph (top: .otf 18, .ttf 15, .css 10)

## Summary
- 919 nodes · 2086 edges · 51 communities (33 shown, 18 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 29 edges (avg confidence: 0.95)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `e9655d24`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- epub-source-parser.ts
- epub-editor-state.svelte.ts
- content-rules.ts
- Changelog
- fonts.ts
- image-bg-remove-ml.ts
- EBOOK-TOOLS — FULL REGRESSION TESTING INSTRUCTION
- cleaner-engine.ts
- zip-writer.ts
- pdf-splitter.ts
- package.json
- epub-download-inspection.spec.ts
- epub-reader-parser.ts
- devDependencies
- utils/index.ts
- scripts
- compilerOptions
- src_lib_epub_packer_parser_epub_source_parser_analyzechaptercandidates
- epub-book-ops.ts
- epub-state.svelte.ts
- real-world-workflows.test.ts
- dependencies
- EpubSourceState
- vite.config.js
- stylesheet-builder.ts
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
- src_lib_epub_packer_parser_epub_source_parser_assignsequentialchapterids
- src_lib_epub_packer_parser_epub_source_parser_cleanheaderfooterocr
- src_lib_epub_packer_parser_epub_source_parser_converttxtinline
- src_lib_epub_packer_parser_epub_source_parser_getcleanedlinesreport
- src_lib_epub_packer_parser_epub_source_parser_parsemarkdownblocks
- src_lib_epub_packer_parser_epub_source_parser_rendermarkdownblocks
- generate-fonts-meta.js
- AI_WORKFLOW.md — Quy trình làm việc & Kiểm thử bắt buộc cho AI Coding Agent

## God Nodes (most connected - your core abstractions)
1. `jszip` - 32 edges
2. `EBOOK-TOOLS — FULL REGRESSION TESTING INSTRUCTION` - 32 edges
3. `Logger` - 27 edges
4. `resolveRelativePath()` - 21 edges
5. `vitest` - 20 edges
6. `parseTxtToChapters()` - 20 edges
7. `EpubImagesState` - 20 edges
8. `escapeXml()` - 20 edges
9. `Changelog` - 20 edges
10. `scripts` - 19 edges

## Surprising Connections (you probably didn't know these)
- `2026-10-16 (Worker Cancellation Race Condition & ML Fallback Hardening)` --references--> `processOrnamentOnMainThread()`  [INFERRED]
  README.md → src/lib/utils/image-bg-remove-ml.ts
- `2. Xử lý lỗi tiềm ẩn trong EPUB Cleaner (Buffer Detachment khi Fallback) — [ĐÃ GIẢI QUYẾT XONG ✅]` --references--> `scanDuplicateResources()`  [INFERRED]
  review.md → src/lib/epub-editor/cleaner/duplicate-detector.ts
- `2026-09-27 (Trước đó)` --references--> `mergeBrokenParagraphs()`  [INFERRED]
  README.md → src/lib/epub-packer/xml-builders/chapter-builder.ts
- `2026-10-15 (letter-box wrapper)` --references--> `mergeBrokenParagraphs()`  [INFERRED]
  README.md → src/lib/epub-packer/xml-builders/chapter-builder.ts
- `Trạng thái hệ thống` --references--> `mergeBrokenParagraphs()`  [INFERRED]
  README.md → src/lib/epub-packer/xml-builders/chapter-builder.ts

## Import Cycles
- None detected.

## Communities (51 total, 18 thin omitted)

### Community 0 - "epub-source-parser.ts"
Cohesion: 0.06
Nodes (88): 2026-10-16 (Letter/Poem Dropcap Suppression & Heading Syntax Warning), 2026-10-16 (NHOM 1 Review Bug Fixes), 2026-10-16 (TypeScript Strict Mode Full Compliance), Trạng thái hệ thống, analyzeChapterCandidates(), assignSequentialChapterIds(), extractChunkBlocks(), extractMarkerTitle() (+80 more)

### Community 1 - "epub-editor-state.svelte.ts"
Cohesion: 0.06
Nodes (52): svelte, isDirty, categorizeFile(), exportEpubBlob(), parseSpineOrder(), parseZipEntries(), deobfuscateAdobeFont(), deobfuscateIdpfFont() (+44 more)

### Community 2 - "content-rules.ts"
Cohesion: 0.15
Nodes (20): src_lib_epub_editor_epub_cleaner_extractcssurls, src_lib_epub_editor_epub_cleaner_extracthtmlreferences, src_lib_epub_editor_epub_editor_isvalidfontmagic, src_lib_epub_editor_epub_editor_validatehtml, CssAndFontsRule, XhtmlPagesRule, NavigationRule, OpfPackageRule (+12 more)

### Community 3 - "Changelog"
Cohesion: 0.07
Nodes (31): 1. ✏️ Chỉnh sửa & Kiểm định EPUB Trực quan (EPUB Editor & Validator Suite), 2026-09-27, 2026-09-27 (Trước đó), 2026-10-15, 2026-10-15 (letter-box wrapper), 2026-10-16 (CI/CD Pipeline Hardening & Knip Resolution), 2026-10-16 (CI/CD Verification & Expanded Test Coverage), 2026-10-16 (Clean Up) (+23 more)

### Community 4 - "fonts.ts"
Cohesion: 0.11
Nodes (12): ref_css_template_intro_css_css_raw, src_assets_fonts_metadata, uniqueFamilies, AVAILABLE_FONTS, fontFiles, fontMetaMap, JACKET_TEMPLATES, FontInfo (+4 more)

### Community 5 - "image-bg-remove-ml.ts"
Cohesion: 0.07
Nodes (25): @imgly/background-removal, EpubImagesState, autoCropTransparentCanvas(), canvasToBlob(), cleanupWorkerAndFallbackPending(), compressAndResizeCanvas(), getOrCreateWorker(), loadImage() (+17 more)

### Community 6 - "EBOOK-TOOLS — FULL REGRESSION TESTING INSTRUCTION"
Cohesion: 0.05
Nodes (41): 10. PDF → EPUB USER FLOW, 11. EPUB EDITOR E2E, 12. EPUB CLEANER E2E, 13. EPUB VALIDATOR E2E, 14. IMAGE PROCESSING E2E, 15. WORKER TESTING, 16. REGRESSION TEST, 17. OUTPUT FILE VALIDATION (+33 more)

### Community 7 - "cleaner-engine.ts"
Cohesion: 0.06
Nodes (42): 2026-10-16 (Worker Detached Buffer Fallback, Concurrency Testing & ML Self-Healing), 2. Xử lý lỗi tiềm ẩn trong EPUB Cleaner (Buffer Detachment khi Fallback) — [ĐÃ GIẢI QUYẾT XONG ✅], 3. Kiểm thử Worker Concurrency & Fallback trong EPUB Cleaner — [ĐÃ GIẢI QUYẾT XONG ✅], 5. Fallback xử lý ảnh bao phủ mọi lỗi Worker — [ĐÃ GIẢI QUYẾT XONG ✅], 6. Trạng thái kiểm thử & CI/CD — [ĐÃ LÀM RÕ & XÁC THỰC 100% ✅], Kết quả xử lý rà soát (Worker Hardening & Fallback Optimization - 2026-10-16), analyzeEpub(), analyzeOptimizationPlan() (+34 more)

### Community 8 - "zip-writer.ts"
Cohesion: 0.30
Nodes (12): ref_templates_css_template_cover_css_raw, prepareChapters(), prepareMetadata(), resolveActiveFonts(), prepareFinalCss(), assembleEpubZip(), buildEpubBlob(), findFont() (+4 more)

### Community 9 - "pdf-splitter.ts"
Cohesion: 0.07
Nodes (28): App, Window, applyGrayscale(), cropCanvas(), formatEta(), loadPdfPreview(), pickConcurrency(), processPdfToJpg() (+20 more)

### Community 10 - "package.json"
Cohesion: 0.10
Nodes (20): name, packageManager, private, type, version, codemirror, @codemirror/commands, @codemirror/lang-css (+12 more)

### Community 11 - "epub-download-inspection.spec.ts"
Cohesion: 0.28
Nodes (4): ref_node_fs, ref_node_path, ref_node_process, @playwright/test

### Community 12 - "epub-reader-parser.ts"
Cohesion: 0.16
Nodes (19): categorizeResource(), extractEpubMetadata(), findOpfPath(), parseEpub(), parseOpfManifestAndSpine(), EpubBook, EpubBookMetadata, EpubContainer (+11 more)

### Community 13 - "devDependencies"
Cohesion: 0.10
Nodes (21): devDependencies, eslint, @eslint/js, eslint-plugin-svelte, globals, knip, @playwright/test, prettier (+13 more)

### Community 14 - "utils/index.ts"
Cohesion: 0.05
Nodes (39): MAX_EPUB_FILE_SIZE, MAX_IMAGE_FILE_SIZE, MAX_IMAGES_ZIP_FILE_SIZE, MAX_PDF_FILE_SIZE, MAX_TXT_FILE_SIZE, MAX_ZIP_FILE_SIZE, EpubToTxtResult, EpubToTxtState (+31 more)

### Community 15 - "scripts"
Cohesion: 0.11
Nodes (19): scripts, build, check, dev, format, format:check, knip, lint (+11 more)

### Community 16 - "compilerOptions"
Cohesion: 0.13
Nodes (14): ./.svelte-kit/tsconfig.json, compilerOptions, allowJs, checkJs, esModuleInterop, forceConsistentCasingInFileNames, moduleResolution, resolveJsonModule (+6 more)

### Community 19 - "epub-book-ops.ts"
Cohesion: 0.13
Nodes (25): reorderOpfSpine(), TocChapterInfo, updateBookMetadata(), replaceOrCreateTag(), getDynamicCss(), src_lib_epub_packer_epub_packer_getdynamiccss, buildChapterXhtml(), buildNavXhtml() (+17 more)

### Community 20 - "epub-state.svelte.ts"
Cohesion: 0.20
Nodes (12): src_lib_epub_packer_epub_packer_epub_css, src_lib_epub_packer_state_index_epubfontsstate, src_lib_epub_packer_state_index_epubimagesstate, src_lib_epub_packer_state_index_epubjacketstate, src_lib_epub_packer_state_index_epubmetadatastate, src_lib_epub_packer_state_index_epubsourcestate, CoverBlobItem, EpubFontsConfig (+4 more)

### Community 21 - "real-world-workflows.test.ts"
Cohesion: 0.12
Nodes (26): jszip, vitest, optimizeEpub(), extractBookMetadata(), findOpfPath(), rebuildEpubToc(), src_lib_epub_editor_epub_cleaner_analyzeoptimizationplan, src_lib_epub_editor_epub_cleaner_optimizeepub (+18 more)

### Community 22 - "dependencies"
Cohesion: 0.18
Nodes (11): dependencies, codemirror, @codemirror/commands, @codemirror/lang-css, @codemirror/lang-html, @codemirror/state, @codemirror/theme-one-dark, @codemirror/view (+3 more)

### Community 24 - "EpubSourceState"
Cohesion: 0.16
Nodes (7): EpubState, EpubFontsState, EpubJacketState, EpubMetadataState, EpubSourceState, src_lib_utils_index_ensureepubext, ensureEpubExt()

### Community 25 - "vite.config.js"
Cohesion: 0.25
Nodes (5): @sveltejs/adapter-cloudflare, @sveltejs/kit, @tailwindcss/vite, ref_types, vite

### Community 26 - "stylesheet-builder.ts"
Cohesion: 0.20
Nodes (8): ref_templates_css_template_base_css_raw, ref_templates_css_template_breaks_css_raw, ref_templates_css_template_center_page_css_raw, ref_templates_css_template_headings_css_raw, ref_templates_css_template_notes_css_raw, ref_templates_css_template_ornaments_css_raw, ref_templates_css_template_quotes_css_raw, EPUB_CSS

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
Cohesion: 0.23
Nodes (12): src_lib_epub_packer_parser_epub_source_parser_parsetxttochaptersasync, EpubSourceStateDependencies, EpubChapterItem, IllustrationImageItem, OrnamentsConfig, src_lib_types_index_cleanedlinesreportitem, src_lib_types_index_epubchapteritem, src_lib_types_index_epubmetadata (+4 more)

### Community 41 - "result.type.ts"
Cohesion: 0.40
Nodes (3): AppError, Result, ValidationError

### Community 42 - "eslint.config.js"
Cohesion: 0.29
Nodes (6): gitignorePath, eslint, @eslint/js, eslint-plugin-svelte, globals, typescript-eslint

### Community 51 - "generate-fonts-meta.js"
Cohesion: 0.18
Nodes (10): fontkit, ref_fs, ref_module, ref_path, files, fontkit, FONTS_DIR, metadata (+2 more)

### Community 52 - "AI_WORKFLOW.md — Quy trình làm việc & Kiểm thử bắt buộc cho AI Coding Agent"
Cohesion: 0.06
Nodes (31): 0. Thứ tự đọc khi mở lại project (BẮT BUỘC, không được bỏ qua bước nào), 1. Ngăn xếp công nghệ & quy tắc code bắt buộc, 2.1 Chu trình kiểm tra cục bộ khi sửa code (Local Dev Loop), 2.2 Pipeline Chốt Chặn CI/CD (BẮT BUỘC 100% PASS TRƯỚC KHI COMMIT HOẶC PUSH), 2.3 Quy tắc chỉnh sửa file (bắt buộc), 2. Pipeline bắt buộc sau MỌI lần chỉnh sửa code & Trước khi Commit, 3.1 Kiến trúc Hệ Thống Kiểm Thử 4 Tầng, 3.2 Ma Trận Hướng Dẫn: "Sửa Gì - Chạy Test Gì?" (Test Decision Matrix) (+23 more)

## Knowledge Gaps
- **239 isolated node(s):** `gitignorePath`, `$schema`, `project`, `entry`, `ignoreDependencies` (+234 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 366 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **18 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `jszip` connect `real-world-workflows.test.ts` to `epub-source-parser.ts`, `epub-editor-state.svelte.ts`, `content-rules.ts`, `image-bg-remove-ml.ts`, `cleaner-engine.ts`, `zip-writer.ts`, `epub-source-state.svelte.ts`, `package.json`, `pdf-splitter.ts`, `epub-reader-parser.ts`, `epub-download-inspection.spec.ts`, `utils/index.ts`, `epub-book-ops.ts`?**
  _High betweenness centrality (0.179) - this node is a cross-community bridge._
- **Why does `Trạng thái hệ thống` connect `epub-source-parser.ts` to `image-bg-remove-ml.ts`, `Changelog`, `real-world-workflows.test.ts`, `cleaner-engine.ts`?**
  _High betweenness centrality (0.089) - this node is a cross-community bridge._
- **Why does `⚒️ Ebook Forge — Bộ Công Cụ Chế Bản Sách Điện Tử` connect `Changelog` to `epub-source-parser.ts`, `AI_WORKFLOW.md — Quy trình làm việc & Kiểm thử bắt buộc cho AI Coding Agent`?**
  _High betweenness centrality (0.088) - this node is a cross-community bridge._
- **What connects `gitignorePath`, `$schema`, `project` to the rest of the system?**
  _239 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `epub-source-parser.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.0594059405940594 - nodes in this community are weakly interconnected._
- **Should `epub-editor-state.svelte.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05707762557077625 - nodes in this community are weakly interconnected._
- **Should `Changelog` be split into smaller, more focused modules?**
  _Cohesion score 0.06881720430107527 - nodes in this community are weakly interconnected._