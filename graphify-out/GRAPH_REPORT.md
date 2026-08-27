# Graph Report - ebook-tools  (2026-08-27)

## Corpus Check
- 141 files · ~83,763 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 741 nodes · 1613 edges · 37 communities (34 shown, 3 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `280ef853`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- lib/types/index.ts
- epub-editor-state.svelte.ts
- PdfSplitterState
- epub-source-parser.ts
- result.type.ts
- scripts
- cleaner-engine.ts
- 🚀 Các công cụ chính
- markdown-fixer.ts
- validator-engine.ts
- image-bg-remove-ml.ts
- utils/index.ts
- resolveRelativePath
- epub-reader-parser.ts
- compilerOptions
- tests/tsconfig.json
- EBOOK-TOOLS — FULL REGRESSION TESTING INSTRUCTION
- devDependencies
- pdf-splitter.ts
- entry
- pdf-splitter.test.ts
- generate-fonts-meta.js
- eslint.config.js
- pdf-splitter.worker.ts
- ../src/lib/utils/logger.js?test=2
- pdf.ts
- Tuyển Tập Truyện Ngắn Đương Đại
- components.type.ts
- MarkdownFixerState
- @playwright/test

## God Nodes (most connected - your core abstractions)
1. `EBOOK-TOOLS — FULL REGRESSION TESTING INSTRUCTION` - 32 edges
2. `Logger` - 27 edges
3. `resolveRelativePath()` - 21 edges
4. `escapeXml()` - 20 edges
5. `scripts` - 19 edges
6. `EpubImagesState` - 19 edges
7. `EpubEditorState` - 18 edges
8. `buildEpubBlob()` - 14 edges
9. `parseTxtToChapters()` - 14 edges
10. `../src/lib/utils/logger.js?test=2` - 13 edges

## Surprising Connections (you probably didn't know these)
- `analyzeOptimizationPlan()` --calls--> `resolveRelativePath()`  [EXTRACTED]
  src/lib/epub-editor/cleaner/cleaner-engine.ts → src/lib/utils/path.ts
- `cleanEpub()` --calls--> `resolveRelativePath()`  [EXTRACTED]
  src/lib/epub-editor/cleaner/cleaner-engine.ts → src/lib/utils/path.ts
- `computeDuplicateResources()` --calls--> `sha1HexAsync()`  [EXTRACTED]
  src/lib/epub-editor/cleaner/duplicate-detector.worker.ts → src/lib/utils/crypto.ts
- `extractLinkedCssPaths()` --calls--> `resolveRelativePath()`  [EXTRACTED]
  src/lib/epub-editor/editor/editor-ops.ts → src/lib/utils/path.ts
- `BookMetadataDetails` --inherits--> `EpubMetadata`  [EXTRACTED]
  src/lib/epub-editor/epub-book-ops.ts → src/lib/types/epub.type.ts

## Import Cycles
- None detected.

## Communities (37 total, 3 thin omitted)

### Community 0 - "lib/types/index.ts"
Cohesion: 0.06
Nodes (42): replaceOrCreateTag(), prepareChapters(), prepareMetadata(), resolveActiveFonts(), EPUB_CSS, getDynamicCss(), prepareFinalCss(), assembleEpubZip() (+34 more)

### Community 1 - "epub-editor-state.svelte.ts"
Cohesion: 0.08
Nodes (17): MAX_EPUB_FILE_SIZE, optimizeEpub(), isDirty, BookMetadataDetails, extractBookMetadata(), findOpfPath(), rebuildEpubToc(), reorderOpfSpine() (+9 more)

### Community 3 - "epub-source-parser.ts"
Cohesion: 0.07
Nodes (64): analyzeChapterCandidates(), assignSequentialChapterIds(), extractChunkBlocks(), extractMarkerTitle(), isDecorationOnly(), makeChapterMatcher(), pushIfLineStart(), scoreHeadingCandidate() (+56 more)

### Community 4 - "result.type.ts"
Cohesion: 0.40
Nodes (3): AppError, Result, ValidationError

### Community 5 - "scripts"
Cohesion: 0.04
Nodes (45): @codemirror/commands, @codemirror/lang-css, @codemirror/lang-html, @codemirror/state, @codemirror/theme-one-dark, @codemirror/view, fontkit, @imgly/background-removal (+37 more)

### Community 6 - "cleaner-engine.ts"
Cohesion: 0.10
Nodes (24): analyzeEpub(), analyzeOptimizationPlan(), cleanEpub(), getDuplicateWorker(), scanDuplicateResources(), computeDuplicateResources(), DuplicateDetectorWorkerRequest, DuplicateDetectorWorkerResponse (+16 more)

### Community 7 - "🚀 Các công cụ chính"
Cohesion: 0.07
Nodes (26): 🔒 1. Quy tắc Quản lý Gói (Package Manager Rule), 🧱 2. Kiến trúc Hệ Thống Kiểm Thử 4 Tầng (4-Tier Testing Strategy), 🎯 3. Ma Trận Hướng Dẫn: "Sửa Gì - Chạy Test Gì?" (Test Decision Matrix), 🔄 4. Chu trình Chỉnh Sửa Code Chuẩn (Standard Quality Gate Flow), ⚡ 5. Bảng Tra Cứu Lệnh Nhanh (Cheat Sheet), Chi tiết các bước Quality Gates:, 📋 QUY TRÌNH PHÁT TRIỂN & HỆ THỐNG KIỂM THỬ (DEVELOPMENT & TESTING WORKFLOW), 🔹 Tầng 1: Smoke Tests (`pnpm test:smoke`) (+18 more)

### Community 8 - "markdown-fixer.ts"
Cohesion: 0.24
Nodes (9): BOLD_ITALIC_PATTERNS, BOLD_PATTERNS, convertBrackets(), fixMarkdownZip(), ITALIC_PATTERNS, UNDERLINE_PATTERNS, ConvertedBracketsResult, FixMarkdownZipResult (+1 more)

### Community 9 - "validator-engine.ts"
Cohesion: 0.20
Nodes (16): CssAndFontsRule, XhtmlPagesRule, NavigationRule, OpfPackageRule, SpineRule, StructureRule, ManifestItemInfo, ValidationCategory (+8 more)

### Community 10 - "image-bg-remove-ml.ts"
Cohesion: 0.08
Nodes (19): EpubImagesState, autoCropTransparentCanvas(), canvasToBlob(), cleanupWorkerAndRejectPending(), compressAndResizeCanvas(), getOrCreateWorker(), loadImage(), OrnamentProcessOptions (+11 more)

### Community 11 - "utils/index.ts"
Cohesion: 0.25
Nodes (7): MAX_IMAGE_FILE_SIZE, MAX_IMAGES_ZIP_FILE_SIZE, MAX_PDF_FILE_SIZE, MAX_TXT_FILE_SIZE, MAX_ZIP_FILE_SIZE, triggerDownload(), ensureZipExt()

### Community 12 - "resolveRelativePath"
Cohesion: 0.12
Nodes (27): categorizeFile(), exportEpubBlob(), parseSpineOrder(), parseZipEntries(), deobfuscateAdobeFont(), deobfuscateIdpfFont(), isValidFontMagic(), validateDirtyPages() (+19 more)

### Community 13 - "epub-reader-parser.ts"
Cohesion: 0.16
Nodes (19): categorizeResource(), extractEpubMetadata(), findOpfPath(), parseEpub(), parseOpfManifestAndSpine(), EpubBook, EpubBookMetadata, EpubContainer (+11 more)

### Community 14 - "compilerOptions"
Cohesion: 0.10
Nodes (20): playwright.config.ts, src/**/*, .svelte-kit/ambient.d.ts, .svelte-kit/non-ambient.d.ts, ./.svelte-kit/tsconfig.json, .svelte-kit/types/**/$types.d.ts, compilerOptions, allowJs (+12 more)

### Community 15 - "tests/tsconfig.json"
Cohesion: 0.22
Nodes (8): vitest/globals, compilerOptions, types, extends, include, ./**/*, node, ../tsconfig.json

### Community 16 - "EBOOK-TOOLS — FULL REGRESSION TESTING INSTRUCTION"
Cohesion: 0.05
Nodes (41): 10. PDF → EPUB USER FLOW, 11. EPUB EDITOR E2E, 12. EPUB CLEANER E2E, 13. EPUB VALIDATOR E2E, 14. IMAGE PROCESSING E2E, 15. WORKER TESTING, 16. REGRESSION TEST, 17. OUTPUT FILE VALIDATION (+33 more)

### Community 17 - "devDependencies"
Cohesion: 0.05
Nodes (41): eslint, @eslint/js, eslint-plugin-svelte, globals, devDependencies, eslint, @eslint/js, eslint-plugin-svelte (+33 more)

### Community 18 - "pdf-splitter.ts"
Cohesion: 0.23
Nodes (9): App, Window, PdfJsDocument, PdfJsLib, PdfJsPage, PdfJsViewport, PdfPreviewPage, PdfProgressInfo (+1 more)

### Community 19 - "entry"
Cohesion: 0.12
Nodes (15): entry, ignoreDependencies, project, $schema, src/**/*.{js,ts,svelte}, src/lib/epub-editor/epub-validator.ts, src/lib/epub-packer/epub-packer.ts, src/lib/epub-packer/parser/epub-source-parser.ts (+7 more)

### Community 20 - "pdf-splitter.test.ts"
Cohesion: 0.25
Nodes (8): formatEta(), pickConcurrency(), processPdfToJpg(), updateProgress(), createdCanvases, mockDoc, mockPage, mockPdfjsLib

### Community 21 - "generate-fonts-meta.js"
Cohesion: 0.29
Nodes (6): files, fontkit, FONTS_DIR, metadata, OUTPUT_FILE, require

### Community 23 - "pdf-splitter.worker.ts"
Cohesion: 0.29
Nodes (6): applyGrayscale(), cropCanvas(), runWorker(), PdfJsGlobal, PdfRenderWorkerRequest, PdfRenderWorkerResponse

### Community 24 - "../src/lib/utils/logger.js?test=2"
Cohesion: 0.32
Nodes (5): ../src/lib/utils/logger.js?test=2, isDebug(), isDebugEnabled, LogLevel, setDebug()

### Community 25 - "pdf.ts"
Cohesion: 0.33
Nodes (3): mockAnchor, mockDocument, mockPdfjsLib

### Community 26 - "Tuyển Tập Truyện Ngắn Đương Đại"
Cohesion: 0.33
Nodes (5): 1.1 Buổi Sáng Ở Quán Cà Phê, 2.2 Kết Thúc Một Ngày, Chương 1: Ký Ức Mùa Thu, Chương 2: Tiếng Chuông Chiều, Tuyển Tập Truyện Ngắn Đương Đại

### Community 27 - "components.type.ts"
Cohesion: 0.40
Nodes (4): ButtonProps, DropZoneProps, InputProps, PageHeaderProps

### Community 36 - "@playwright/test"
Cohesion: 0.14
Nodes (8): @playwright/test, compilerOptions, types, extends, include, ./**/*, node, ../tsconfig.json

## Knowledge Gaps
- **202 isolated node(s):** `gitignorePath`, `$schema`, `src/**/*.{js,ts,svelte}`, `tests/**/*.{js,ts}`, `src/routes/**/+page.{svelte,js,ts}` (+197 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Logger` connect `epub-source-parser.ts` to `lib/types/index.ts`, `epub-editor-state.svelte.ts`, `cleaner-engine.ts`, `markdown-fixer.ts`, `image-bg-remove-ml.ts`, `utils/index.ts`, `resolveRelativePath`, `pdf-splitter.ts`, `../src/lib/utils/logger.js?test=2`, `pdf.ts`?**
  _High betweenness centrality (0.051) - this node is a cross-community bridge._
- **Why does `EpubImagesState` connect `image-bg-remove-ml.ts` to `lib/types/index.ts`, `utils/index.ts`?**
  _High betweenness centrality (0.025) - this node is a cross-community bridge._
- **Why does `resolveRelativePath()` connect `resolveRelativePath` to `epub-editor-state.svelte.ts`, `epub-reader-parser.ts`, `cleaner-engine.ts`, `validator-engine.ts`?**
  _High betweenness centrality (0.016) - this node is a cross-community bridge._
- **What connects `gitignorePath`, `$schema`, `src/**/*.{js,ts,svelte}` to the rest of the system?**
  _202 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `lib/types/index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.062172284644194754 - nodes in this community are weakly interconnected._
- **Should `epub-editor-state.svelte.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07993197278911565 - nodes in this community are weakly interconnected._
- **Should `epub-source-parser.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.0654562828475872 - nodes in this community are weakly interconnected._