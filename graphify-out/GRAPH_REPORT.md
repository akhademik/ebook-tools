# Graph Report - ebook-tools  (2026-09-18)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 721 nodes · 1615 edges · 46 communities (26 shown, 15 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `b87bade2`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- epub-editor-state.svelte.ts
- zip-writer.ts
- lib/types/index.ts
- scripts
- epub-source-parser.ts
- EBOOK-TOOLS — FULL REGRESSION TESTING INSTRUCTION
- jszip
- cleaner-engine.ts
- image-bg-remove-ml.ts
- 🚀 Các công cụ chính
- Logger
- compilerOptions
- validator-engine.ts
- utils/index.ts
- markdown-fixer.ts
- tests-e2e/tsconfig.json
- EpubImagesState
- txt-parser.ts
- devDependencies
- epub-source-state.svelte.ts
- EpubSourceState
- pdf-splitter.type.ts
- entry
- knip.json
- PdfSplitterState
- generate-fonts-meta.js
- Tuyển Tập Truyện Ngắn Đương Đại
- helpers.test.ts
- eslint.config.js
- eslint-plugin-svelte
- knip
- prettier-plugin-svelte
- svelte-check
- @sveltejs/adapter-cloudflare
- @sveltejs/kit
- @sveltejs/vite-plugin-svelte
- @tailwindcss/vite
- @types/node
- typescript
- vite
- vitest

## God Nodes (most connected - your core abstractions)
1. `Logger` - 76 edges
2. `EBOOK-TOOLS — FULL REGRESSION TESTING INSTRUCTION` - 32 edges
3. `jszip` - 22 edges
4. `resolveRelativePath()` - 21 edges
5. `EpubImagesState` - 19 edges
6. `scripts` - 19 edges
7. `EpubEditorState` - 18 edges
8. `buildEpubBlob()` - 15 edges
9. `extractEpubToTxt()` - 13 edges
10. `getAssetDataUrl()` - 13 edges

## Surprising Connections (you probably didn't know these)
- `cleanEpub()` --references--> `jszip`  [EXTRACTED]
  src/lib/epub-editor/cleaner/cleaner-engine.ts → package.json
- `findOpfPath()` --references--> `jszip`  [EXTRACTED]
  src/lib/epub-editor/epub-book-ops.ts → package.json
- `rebuildEpubToc()` --references--> `jszip`  [EXTRACTED]
  src/lib/epub-editor/epub-book-ops.ts → package.json
- `extractEpubToTxt()` --references--> `jszip`  [EXTRACTED]
  src/lib/epub-to-txt/epub-to-txt.ts → package.json
- `exportEpubBlob()` --references--> `jszip`  [EXTRACTED]
  src/lib/epub-editor/editor/editor-ops.ts → package.json

## Import Cycles
- None detected.

## Communities (46 total, 15 thin omitted)

### Community 0 - "epub-editor-state.svelte.ts"
Cohesion: 0.07
Nodes (41): analyzeEpub(), analyzeOptimizationPlan(), cleanEpub(), optimizeEpub(), formatByteSize(), categorizeFile(), exportEpubBlob(), extractLinkedCssPaths() (+33 more)

### Community 1 - "zip-writer.ts"
Cohesion: 0.08
Nodes (45): prepareChapters(), prepareMetadata(), resolveActiveFonts(), getDynamicCss(), prepareFinalCss(), assembleEpubZip(), buildEpubBlob(), AVAILABLE_FONTS (+37 more)

### Community 2 - "lib/types/index.ts"
Cohesion: 0.07
Nodes (13): isDirty, EPUB_CSS, EpubState, EpubFontsState, EpubJacketState, EpubMetadataState, ButtonProps, DropZoneProps (+5 more)

### Community 3 - "scripts"
Cohesion: 0.05
Nodes (43): @codemirror/commands, @codemirror/lang-css, @codemirror/lang-html, @codemirror/state, @codemirror/theme-one-dark, @codemirror/view, fontkit, @imgly/background-removal (+35 more)

### Community 4 - "epub-source-parser.ts"
Cohesion: 0.15
Nodes (36): analyzeChapterCandidates(), extractChunkBlocks(), extractMarkerTitle(), isDecorationOnly(), makeChapterMatcher(), pushIfLineStart(), scoreHeadingCandidate(), stripDecoration() (+28 more)

### Community 5 - "EBOOK-TOOLS — FULL REGRESSION TESTING INSTRUCTION"
Cohesion: 0.05
Nodes (41): 10. PDF → EPUB USER FLOW, 11. EPUB EDITOR E2E, 12. EPUB CLEANER E2E, 13. EPUB VALIDATOR E2E, 14. IMAGE PROCESSING E2E, 15. WORKER TESTING, 16. REGRESSION TEST, 17. OUTPUT FILE VALIDATION (+33 more)

### Community 6 - "jszip"
Cohesion: 0.09
Nodes (26): jszip, @playwright/test, @playwright/test, categorizeResource(), extractEpubMetadata(), findOpfPath(), parseEpub(), parseOpfManifestAndSpine() (+18 more)

### Community 7 - "cleaner-engine.ts"
Cohesion: 0.14
Nodes (24): getDuplicateWorker(), scanDuplicateResources(), computeDuplicateResources(), DuplicateDetectorWorkerRequest, DuplicateDetectorWorkerResponse, ScanItemInput, extractCssUrls(), extractHtmlReferences() (+16 more)

### Community 8 - "image-bg-remove-ml.ts"
Cohesion: 0.14
Nodes (18): autoCropTransparentCanvas(), canvasToBlob(), cleanupWorkerAndRejectPending(), compressAndResizeCanvas(), getOrCreateWorker(), loadImage(), OrnamentProcessOptions, OrnamentProcessResult (+10 more)

### Community 9 - "🚀 Các công cụ chính"
Cohesion: 0.07
Nodes (26): 🔒 1. Quy tắc Quản lý Gói (Package Manager Rule), 🧱 2. Kiến trúc Hệ Thống Kiểm Thử 4 Tầng (4-Tier Testing Strategy), 🎯 3. Ma Trận Hướng Dẫn: "Sửa Gì - Chạy Test Gì?" (Test Decision Matrix), 🔄 4. Chu trình Chỉnh Sửa Code Chuẩn (Standard Quality Gate Flow), ⚡ 5. Bảng Tra Cứu Lệnh Nhanh (Cheat Sheet), Chi tiết các bước Quality Gates:, 📋 QUY TRÌNH PHÁT TRIỂN & HỆ THỐNG KIỂM THỬ (DEVELOPMENT & TESTING WORKFLOW), 🔹 Tầng 1: Smoke Tests (`pnpm test:smoke`) (+18 more)

### Community 10 - "Logger"
Cohesion: 0.13
Nodes (9): EpubToTxtState, triggerDownload(), isDebug(), isDebugEnabled, Logger, LogLevel, setDebug(), ensureEpubExt() (+1 more)

### Community 11 - "compilerOptions"
Cohesion: 0.10
Nodes (20): playwright.config.ts, src/**/*, .svelte-kit/ambient.d.ts, .svelte-kit/non-ambient.d.ts, ./.svelte-kit/tsconfig.json, .svelte-kit/types/**/$types.d.ts, compilerOptions, allowJs (+12 more)

### Community 12 - "validator-engine.ts"
Cohesion: 0.20
Nodes (16): CssAndFontsRule, XhtmlPagesRule, NavigationRule, OpfPackageRule, SpineRule, StructureRule, ManifestItemInfo, ValidationCategory (+8 more)

### Community 13 - "utils/index.ts"
Cohesion: 0.15
Nodes (14): applyGrayscale(), cropCanvas(), formatEta(), loadPdfPreview(), pickConcurrency(), processPdfToJpg(), PdfJsGlobal, PdfRenderWorkerRequest (+6 more)

### Community 14 - "markdown-fixer.ts"
Cohesion: 0.16
Nodes (11): BOLD_ITALIC_PATTERNS, BOLD_PATTERNS, convertBrackets(), fixMarkdownZip(), ITALIC_PATTERNS, MarkdownFixerState, UNDERLINE_PATTERNS, ConvertedBracketsResult (+3 more)

### Community 15 - "tests-e2e/tsconfig.json"
Cohesion: 0.12
Nodes (14): vitest/globals, compilerOptions, types, extends, include, ./**/*, node, compilerOptions (+6 more)

### Community 17 - "txt-parser.ts"
Cohesion: 0.24
Nodes (11): applyInlineFormatting(), escapeRegExp(), getClosingTag(), getTxtParserWorker(), isIllustrationTag(), parseTxtToChapters(), parseTxtToChaptersAsync(), stripHtmlTags() (+3 more)

### Community 18 - "devDependencies"
Cohesion: 0.15
Nodes (13): eslint, @eslint/js, globals, devDependencies, eslint, @eslint/js, globals, prettier (+5 more)

### Community 19 - "epub-source-state.svelte.ts"
Cohesion: 0.23
Nodes (9): MAX_EPUB_FILE_SIZE, MAX_IMAGE_FILE_SIZE, MAX_IMAGES_ZIP_FILE_SIZE, MAX_PDF_FILE_SIZE, MAX_TXT_FILE_SIZE, MAX_ZIP_FILE_SIZE, EpubToTxtResult, CleanedLinesReportItem (+1 more)

### Community 20 - "EpubSourceState"
Cohesion: 0.33
Nodes (3): assignSequentialChapterIds(), EpubSourceState, EpubSourceStateDependencies

### Community 21 - "pdf-splitter.type.ts"
Cohesion: 0.24
Nodes (8): App, Window, PdfJsDocument, PdfJsLib, PdfJsPage, PdfJsViewport, PdfProgressInfo, ProcessPdfResult

### Community 22 - "entry"
Cohesion: 0.22
Nodes (9): entry, src/lib/epub-editor/epub-validator.ts, src/lib/epub-packer/epub-packer.ts, src/lib/epub-packer/parser/epub-source-parser.ts, src/lib/types/index.ts, src/lib/utils/index.ts, src/routes/**/+layout.{svelte,js,ts}, src/routes/**/+page.{svelte,js,ts} (+1 more)

### Community 23 - "knip.json"
Cohesion: 0.25
Nodes (7): ignoreDependencies, project, $schema, tailwindcss, src/**/*.{js,ts,svelte}, tests/**/*.{js,ts}, tailwindcss

### Community 25 - "generate-fonts-meta.js"
Cohesion: 0.29
Nodes (6): files, fontkit, FONTS_DIR, metadata, OUTPUT_FILE, require

### Community 26 - "Tuyển Tập Truyện Ngắn Đương Đại"
Cohesion: 0.33
Nodes (5): 1.1 Buổi Sáng Ở Quán Cà Phê, 2.2 Kết Thúc Một Ngày, Chương 1: Ký Ức Mùa Thu, Chương 2: Tiếng Chuông Chiều, Tuyển Tập Truyện Ngắn Đương Đại

### Community 27 - "helpers.test.ts"
Cohesion: 0.50
Nodes (3): mockAnchor, mockDocument, mockPdfjsLib

## Knowledge Gaps
- **196 isolated node(s):** `TocChapterInfo`, `EpubChapterFeatures`, `OrnamentItem`, `RenderMarkdownBlocksResult`, `LogLevel` (+191 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 243 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **15 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `jszip` connect `jszip` to `epub-editor-state.svelte.ts`, `zip-writer.ts`, `scripts`, `utils/index.ts`, `markdown-fixer.ts`, `EpubSourceState`?**
  _High betweenness centrality (0.240) - this node is a cross-community bridge._
- **Why does `dependencies` connect `scripts` to `jszip`?**
  _High betweenness centrality (0.190) - this node is a cross-community bridge._
- **Why does `Logger` connect `Logger` to `epub-editor-state.svelte.ts`, `zip-writer.ts`, `lib/types/index.ts`, `epub-source-parser.ts`, `cleaner-engine.ts`, `image-bg-remove-ml.ts`, `utils/index.ts`, `markdown-fixer.ts`, `txt-parser.ts`, `epub-source-state.svelte.ts`, `EpubSourceState`, `PdfSplitterState`?**
  _High betweenness centrality (0.158) - this node is a cross-community bridge._
- **What connects `TocChapterInfo`, `EpubChapterFeatures`, `OrnamentItem` to the rest of the system?**
  _196 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `epub-editor-state.svelte.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07405063291139241 - nodes in this community are weakly interconnected._
- **Should `zip-writer.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.08243727598566308 - nodes in this community are weakly interconnected._
- **Should `lib/types/index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07058823529411765 - nodes in this community are weakly interconnected._