# Graph Report - ebook-tools  (2026-10-16)

## Corpus Check
- 143 files · ~97,772 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 48 file(s) not represented in the graph (top: .otf 18, .ttf 15, .css 10)

## Summary
- 888 nodes · 2024 edges · 50 communities (31 shown, 19 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 16 edges (avg confidence: 0.94)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `364dbe2f`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- epub-source-parser.ts
- epub-editor-state.svelte.ts
- eslint.config.js
- image-bg-remove-ml.ts
- EBOOK-TOOLS — FULL REGRESSION TESTING INSTRUCTION
- cleaner-engine.ts
- epub-to-txt.ts
- pdf-splitter.ts
- package.json
- jszip
- devDependencies
- EpubSourceState
- scripts
- compilerOptions
- src_lib_epub_packer_parser_epub_source_parser_analyzechaptercandidates
- epub-packer/+page.svelte
- real-world-workflows.test.ts
- epub-images-state.svelte.ts
- dependencies
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
- components.type.ts
- result.type.ts
- content-rules.ts
- src_lib_epub_packer_parser_epub_source_parser_assignsequentialchapterids
- src_lib_epub_packer_parser_epub_source_parser_cleanheaderfooterocr
- src_lib_epub_packer_parser_epub_source_parser_converttxtinline
- src_lib_epub_packer_parser_epub_source_parser_getcleanedlinesreport
- src_lib_epub_packer_parser_epub_source_parser_parsemarkdownblocks
- src_lib_epub_packer_parser_epub_source_parser_rendermarkdownblocks
- generate-fonts-meta.js
- AI_WORKFLOW.md — Quy trình làm việc & Kiểm thử bắt buộc cho AI Coding Agent
- pdf-splitter-state.svelte.ts
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
10. `parseTxtToChapters()` - 17 edges

## Surprising Connections (you probably didn't know these)
- `Trạng thái hệ thống` --references--> `isIllustrationTag()`  [INFERRED]
  README.md → src/lib/epub-packer/parser/txt-parser.ts
- `Trạng thái hệ thống` --references--> `parseTxtToChapters()`  [INFERRED]
  README.md → src/lib/epub-packer/parser/txt-parser.ts
- `2026-09-27 (Trước đó)` --references--> `mergeBrokenParagraphs()`  [INFERRED]
  README.md → src/lib/epub-packer/xml-builders/chapter-builder.ts
- `2026-10-15 (letter-box wrapper)` --references--> `mergeBrokenParagraphs()`  [INFERRED]
  README.md → src/lib/epub-packer/xml-builders/chapter-builder.ts
- `Trạng thái hệ thống` --references--> `RawChapterItem`  [INFERRED]
  README.md → src/lib/types/epub.type.ts

## Import Cycles
- None detected.

## Communities (50 total, 19 thin omitted)

### Community 0 - "epub-source-parser.ts"
Cohesion: 0.06
Nodes (86): 2026-10-16 (NHOM 1 Review Bug Fixes), 2026-10-16 (TypeScript Strict Mode Full Compliance), analyzeChapterCandidates(), assignSequentialChapterIds(), extractChunkBlocks(), extractMarkerTitle(), isDecorationOnly(), makeChapterMatcher() (+78 more)

### Community 1 - "epub-editor-state.svelte.ts"
Cohesion: 0.05
Nodes (63): vitest, categorizeFile(), exportEpubBlob(), extractLinkedCssPaths(), parseSpineOrder(), parseZipEntries(), deobfuscateAdobeFont(), deobfuscateIdpfFont() (+55 more)

### Community 2 - "eslint.config.js"
Cohesion: 0.29
Nodes (6): gitignorePath, eslint, @eslint/js, eslint-plugin-svelte, globals, typescript-eslint

### Community 5 - "image-bg-remove-ml.ts"
Cohesion: 0.05
Nodes (30): @imgly/background-removal, EpubImagesState, autoCropTransparentCanvas(), canvasToBlob(), cleanupWorkerAndRejectPending(), compressAndResizeCanvas(), getOrCreateWorker(), loadImage() (+22 more)

### Community 6 - "EBOOK-TOOLS — FULL REGRESSION TESTING INSTRUCTION"
Cohesion: 0.05
Nodes (41): 10. PDF → EPUB USER FLOW, 11. EPUB EDITOR E2E, 12. EPUB CLEANER E2E, 13. EPUB VALIDATOR E2E, 14. IMAGE PROCESSING E2E, 15. WORKER TESTING, 16. REGRESSION TEST, 17. OUTPUT FILE VALIDATION (+33 more)

### Community 7 - "cleaner-engine.ts"
Cohesion: 0.11
Nodes (27): analyzeEpub(), analyzeOptimizationPlan(), cleanEpub(), getDuplicateWorker(), scanDuplicateResources(), computeDuplicateResources(), DuplicateDetectorWorkerRequest, DuplicateDetectorWorkerResponse (+19 more)

### Community 8 - "epub-to-txt.ts"
Cohesion: 0.08
Nodes (40): 1. ✏️ Chỉnh sửa & Kiểm định EPUB Trực quan (EPUB Editor & Validator Suite), 2026-09-27, 2026-09-27 (Trước đó), 2026-10-15, 2026-10-15 (letter-box wrapper), 2026-10-16 (CI/CD Pipeline Hardening & Knip Resolution), 2026-10-16 (CI/CD Verification & Expanded Test Coverage), 2026-10-16 (Clean Up) (+32 more)

### Community 9 - "pdf-splitter.ts"
Cohesion: 0.11
Nodes (23): App, Window, applyGrayscale(), cropCanvas(), formatEta(), loadPdfPreview(), pickConcurrency(), processPdfToJpg() (+15 more)

### Community 10 - "package.json"
Cohesion: 0.10
Nodes (20): name, packageManager, private, type, version, codemirror, @codemirror/commands, @codemirror/lang-css (+12 more)

### Community 12 - "jszip"
Cohesion: 0.11
Nodes (23): jszip, ref_node_fs, ref_node_path, ref_node_process, @playwright/test, categorizeResource(), extractEpubMetadata(), findOpfPath() (+15 more)

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
Nodes (75): ref_css_template_intro_css_css_raw, ref_templates_css_template_base_css_raw, ref_templates_css_template_breaks_css_raw, ref_templates_css_template_center_page_css_raw, ref_templates_css_template_cover_css_raw, ref_templates_css_template_headings_css_raw, ref_templates_css_template_notes_css_raw, ref_templates_css_template_ornaments_css_raw (+67 more)

### Community 20 - "epub-images-state.svelte.ts"
Cohesion: 0.31
Nodes (7): MAX_IMAGE_FILE_SIZE, MAX_IMAGES_ZIP_FILE_SIZE, MAX_PDF_FILE_SIZE, MAX_TXT_FILE_SIZE, MAX_ZIP_FILE_SIZE, src_lib_utils_index_processornamentimage, src_lib_utils_index_renderpdfpagetoblob

### Community 22 - "dependencies"
Cohesion: 0.18
Nodes (11): dependencies, codemirror, @codemirror/commands, @codemirror/lang-css, @codemirror/lang-html, @codemirror/state, @codemirror/theme-one-dark, @codemirror/view (+3 more)

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

### Community 42 - "components.type.ts"
Cohesion: 0.33
Nodes (5): svelte, ButtonProps, DropZoneProps, InputProps, PageHeaderProps

### Community 43 - "result.type.ts"
Cohesion: 0.40
Nodes (3): AppError, Result, ValidationError

### Community 44 - "content-rules.ts"
Cohesion: 0.13
Nodes (19): src_lib_epub_editor_epub_editor_isvalidfontmagic, src_lib_epub_editor_epub_editor_validatehtml, CssAndFontsRule, XhtmlPagesRule, NavigationRule, OpfPackageRule, SpineRule, StructureRule (+11 more)

### Community 51 - "generate-fonts-meta.js"
Cohesion: 0.18
Nodes (10): fontkit, ref_fs, ref_module, ref_path, files, fontkit, FONTS_DIR, metadata (+2 more)

### Community 52 - "AI_WORKFLOW.md — Quy trình làm việc & Kiểm thử bắt buộc cho AI Coding Agent"
Cohesion: 0.06
Nodes (31): 0. Thứ tự đọc khi mở lại project (BẮT BUỘC, không được bỏ qua bước nào), 1. Ngăn xếp công nghệ & quy tắc code bắt buộc, 2.1 Chu trình kiểm tra cục bộ khi sửa code (Local Dev Loop), 2.2 Pipeline Chốt Chặn CI/CD (BẮT BUỘC 100% PASS TRƯỚC KHI COMMIT HOẶC PUSH), 2.3 Quy tắc chỉnh sửa file (bắt buộc), 2. Pipeline bắt buộc sau MỌI lần chỉnh sửa code & Trước khi Commit, 3.1 Kiến trúc Hệ Thống Kiểm Thử 4 Tầng, 3.2 Ma Trận Hướng Dẫn: "Sửa Gì - Chạy Test Gì?" (Test Decision Matrix) (+23 more)

### Community 53 - "pdf-splitter-state.svelte.ts"
Cohesion: 0.20
Nodes (7): MarkdownFixerState, src_lib_types_index_pdfpreviewpage, src_lib_types_index_processedmarkdownfilerow, src_lib_utils_index_ensurezipext, src_lib_utils_index_slugify, ensureZipExt(), slugify()

### Community 56 - "pdf-splitter.worker.ts"
Cohesion: 0.40
Nodes (3): PdfJsGlobal, PdfRenderWorkerRequest, PdfRenderWorkerResponse

## Knowledge Gaps
- **226 isolated node(s):** `gitignorePath`, `$schema`, `project`, `entry`, `ignoreDependencies` (+221 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 352 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **19 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `jszip` connect `jszip` to `epub-source-parser.ts`, `epub-editor-state.svelte.ts`, `image-bg-remove-ml.ts`, `cleaner-engine.ts`, `epub-to-txt.ts`, `pdf-splitter.ts`, `package.json`, `content-rules.ts`, `real-world-workflows.test.ts`, `epub-images-state.svelte.ts`, `markdown-fixer.ts`?**
  _High betweenness centrality (0.180) - this node is a cross-community bridge._
- **Why does `⚒️ Ebook Forge — Bộ Công Cụ Chế Bản Sách Điện Tử` connect `epub-to-txt.ts` to `AI_WORKFLOW.md — Quy trình làm việc & Kiểm thử bắt buộc cho AI Coding Agent`?**
  _High betweenness centrality (0.090) - this node is a cross-community bridge._
- **Why does `Trạng thái hệ thống` connect `epub-to-txt.ts` to `epub-source-parser.ts`?**
  _High betweenness centrality (0.089) - this node is a cross-community bridge._
- **What connects `gitignorePath`, `$schema`, `project` to the rest of the system?**
  _226 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `epub-source-parser.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06323232323232324 - nodes in this community are weakly interconnected._
- **Should `epub-editor-state.svelte.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05262027491408935 - nodes in this community are weakly interconnected._
- **Should `image-bg-remove-ml.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.053410893707033315 - nodes in this community are weakly interconnected._