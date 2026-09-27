# Graph Report - ebook-tools  (2026-09-27)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 756 nodes · 1649 edges · 42 communities (24 shown, 18 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `79d29ae5`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Logger
- epub-editor-state.svelte.ts
- real-world-workflows.test.ts
- lib/types/index.ts
- scripts
- epub-source-parser.ts
- EBOOK-TOOLS — FULL REGRESSION TESTING INSTRUCTION
- cleaner-engine.ts
- epub-reader-parser.ts
- epub-to-txt.ts
- 🚀 Các công cụ chính
- image-bg-remove-ml.ts
- epub-source-state.svelte.ts
- compilerOptions
- validator-engine.ts
- txt-parser.ts
- tests-e2e/tsconfig.json
- EpubImagesState
- epub-packer.test.ts
- devDependencies
- entry
- knip.json
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
1. `Logger` - 65 edges
2. `EBOOK-TOOLS — FULL REGRESSION TESTING INSTRUCTION` - 32 edges
3. `jszip` - 20 edges
4. `EpubImagesState` - 19 edges
5. `resolveRelativePath()` - 19 edges
6. `scripts` - 19 edges
7. `EpubEditorState` - 18 edges
8. `buildEpubBlob()` - 15 edges
9. `getAssetDataUrl()` - 13 edges
10. `buildPreviewHtml()` - 12 edges

## Surprising Connections (you probably didn't know these)
- `fixMarkdownZip()` --references--> `jszip`  [EXTRACTED]
  src/lib/markdown-fixer/markdown-fixer.ts → package.json
- `processPdfToJpg()` --references--> `jszip`  [EXTRACTED]
  src/lib/pdf-splitter/pdf-splitter.ts → package.json
- `findOpfPath()` --references--> `jszip`  [EXTRACTED]
  src/lib/epub-editor/epub-book-ops.ts → package.json
- `rebuildEpubToc()` --references--> `jszip`  [EXTRACTED]
  src/lib/epub-editor/epub-book-ops.ts → package.json
- `exportEpubBlob()` --references--> `jszip`  [EXTRACTED]
  src/lib/epub-editor/editor/editor-ops.ts → package.json

## Import Cycles
- None detected.

## Communities (42 total, 18 thin omitted)

### Community 0 - "Logger"
Cohesion: 0.05
Nodes (42): App, Window, BOLD_ITALIC_PATTERNS, BOLD_PATTERNS, convertBrackets(), fixMarkdownZip(), ITALIC_PATTERNS, MarkdownFixerState (+34 more)

### Community 1 - "epub-editor-state.svelte.ts"
Cohesion: 0.07
Nodes (37): isDirty, categorizeFile(), exportEpubBlob(), extractLinkedCssPaths(), parseSpineOrder(), parseZipEntries(), deobfuscateAdobeFont(), deobfuscateIdpfFont() (+29 more)

### Community 2 - "real-world-workflows.test.ts"
Cohesion: 0.08
Nodes (51): prepareChapters(), prepareMetadata(), resolveActiveFonts(), EPUB_CSS, getDynamicCss(), prepareFinalCss(), assembleEpubZip(), buildEpubBlob() (+43 more)

### Community 3 - "lib/types/index.ts"
Cohesion: 0.08
Nodes (11): EpubState, EpubFontsState, EpubJacketState, EpubMetadataState, ButtonProps, DropZoneProps, InputProps, PageHeaderProps (+3 more)

### Community 4 - "scripts"
Cohesion: 0.05
Nodes (43): @codemirror/commands, @codemirror/lang-css, @codemirror/lang-html, @codemirror/state, @codemirror/theme-one-dark, @codemirror/view, fontkit, @imgly/background-removal (+35 more)

### Community 5 - "epub-source-parser.ts"
Cohesion: 0.14
Nodes (36): analyzeChapterCandidates(), extractChunkBlocks(), extractMarkerTitle(), isDecorationOnly(), makeChapterMatcher(), pushIfLineStart(), scoreHeadingCandidate(), stripDecoration() (+28 more)

### Community 6 - "EBOOK-TOOLS — FULL REGRESSION TESTING INSTRUCTION"
Cohesion: 0.05
Nodes (41): 10. PDF → EPUB USER FLOW, 11. EPUB EDITOR E2E, 12. EPUB CLEANER E2E, 13. EPUB VALIDATOR E2E, 14. IMAGE PROCESSING E2E, 15. WORKER TESTING, 16. REGRESSION TEST, 17. OUTPUT FILE VALIDATION (+33 more)

### Community 7 - "cleaner-engine.ts"
Cohesion: 0.12
Nodes (24): analyzeEpub(), analyzeOptimizationPlan(), cleanEpub(), optimizeEpub(), getDuplicateWorker(), scanDuplicateResources(), computeDuplicateResources(), DuplicateDetectorWorkerRequest (+16 more)

### Community 8 - "epub-reader-parser.ts"
Cohesion: 0.10
Nodes (26): jszip, @playwright/test, @playwright/test, categorizeResource(), extractEpubMetadata(), findOpfPath(), parseEpub(), parseOpfManifestAndSpine() (+18 more)

### Community 9 - "epub-to-txt.ts"
Cohesion: 0.11
Nodes (23): ref_jszip, MAX_EPUB_FILE_SIZE, MAX_IMAGE_FILE_SIZE, MAX_IMAGES_ZIP_FILE_SIZE, MAX_PDF_FILE_SIZE, src_lib_epub_editor_epub_editor_resolverelativepath, cleanTextFormatting(), convertInlineHtmlToTxt() (+15 more)

### Community 10 - "🚀 Các công cụ chính"
Cohesion: 0.07
Nodes (26): 🔒 1. Quy tắc Quản lý Gói (Package Manager Rule), 🧱 2. Kiến trúc Hệ Thống Kiểm Thử 4 Tầng (4-Tier Testing Strategy), 🎯 3. Ma Trận Hướng Dẫn: "Sửa Gì - Chạy Test Gì?" (Test Decision Matrix), 🔄 4. Chu trình Chỉnh Sửa Code Chuẩn (Standard Quality Gate Flow), ⚡ 5. Bảng Tra Cứu Lệnh Nhanh (Cheat Sheet), Chi tiết các bước Quality Gates:, 📋 QUY TRÌNH PHÁT TRIỂN & HỆ THỐNG KIỂM THỬ (DEVELOPMENT & TESTING WORKFLOW), 🔹 Tầng 1: Smoke Tests (`pnpm test:smoke`) (+18 more)

### Community 11 - "image-bg-remove-ml.ts"
Cohesion: 0.15
Nodes (18): autoCropTransparentCanvas(), canvasToBlob(), cleanupWorkerAndRejectPending(), compressAndResizeCanvas(), getOrCreateWorker(), loadImage(), OrnamentProcessOptions, OrnamentProcessResult (+10 more)

### Community 12 - "epub-source-state.svelte.ts"
Cohesion: 0.18
Nodes (12): MAX_TXT_FILE_SIZE, MAX_ZIP_FILE_SIZE, cleanHeaderFooterOcr(), compileCleanKeywords(), getCleanedLinesReport(), isLineHeaderFooter(), shouldSkipHeaderFooter(), EpubSourceState (+4 more)

### Community 13 - "compilerOptions"
Cohesion: 0.10
Nodes (20): playwright.config.ts, src/**/*, .svelte-kit/ambient.d.ts, .svelte-kit/non-ambient.d.ts, ./.svelte-kit/tsconfig.json, .svelte-kit/types/**/$types.d.ts, compilerOptions, allowJs (+12 more)

### Community 14 - "validator-engine.ts"
Cohesion: 0.20
Nodes (16): CssAndFontsRule, XhtmlPagesRule, NavigationRule, OpfPackageRule, SpineRule, StructureRule, ManifestItemInfo, ValidationCategory (+8 more)

### Community 15 - "txt-parser.ts"
Cohesion: 0.18
Nodes (14): applyInlineFormatting(), escapeRegExp(), getClosingTag(), getTxtParserWorker(), isIllustrationTag(), parseTxtToChapters(), parseTxtToChaptersAsync(), stripHtmlTags() (+6 more)

### Community 16 - "tests-e2e/tsconfig.json"
Cohesion: 0.12
Nodes (14): vitest/globals, compilerOptions, types, extends, include, ./**/*, node, compilerOptions (+6 more)

### Community 18 - "epub-packer.test.ts"
Cohesion: 0.13
Nodes (13): ref_vitest, src_lib_epub_packer_epub_packer_buildchapterxhtml, src_lib_epub_packer_epub_packer_buildcontainerxml, src_lib_epub_packer_epub_packer_buildcontentopf, src_lib_epub_packer_epub_packer_buildepubblob, src_lib_epub_packer_epub_packer_buildnavxhtml, src_lib_epub_packer_epub_packer_buildtocncx, src_lib_epub_packer_epub_packer_getdynamiccss (+5 more)

### Community 19 - "devDependencies"
Cohesion: 0.15
Nodes (13): eslint, @eslint/js, globals, devDependencies, eslint, @eslint/js, globals, prettier (+5 more)

### Community 20 - "entry"
Cohesion: 0.22
Nodes (9): entry, src/lib/epub-editor/epub-validator.ts, src/lib/epub-packer/epub-packer.ts, src/lib/epub-packer/parser/epub-source-parser.ts, src/lib/types/index.ts, src/lib/utils/index.ts, src/routes/**/+layout.{svelte,js,ts}, src/routes/**/+page.{svelte,js,ts} (+1 more)

### Community 21 - "knip.json"
Cohesion: 0.25
Nodes (7): ignoreDependencies, project, $schema, tailwindcss, src/**/*.{js,ts,svelte}, tests/**/*.{js,ts}, tailwindcss

### Community 22 - "generate-fonts-meta.js"
Cohesion: 0.29
Nodes (6): files, fontkit, FONTS_DIR, metadata, OUTPUT_FILE, require

### Community 23 - "Tuyển Tập Truyện Ngắn Đương Đại"
Cohesion: 0.33
Nodes (5): 1.1 Buổi Sáng Ở Quán Cà Phê, 2.2 Kết Thúc Một Ngày, Chương 1: Ký Ức Mùa Thu, Chương 2: Tiếng Chuông Chiều, Tuyển Tập Truyện Ngắn Đương Đại

### Community 24 - "helpers.test.ts"
Cohesion: 0.50
Nodes (3): mockAnchor, mockDocument, mockPdfjsLib

## Knowledge Gaps
- **197 isolated node(s):** `LogLevel`, `PdfJsDocument`, `PdfJsPage`, `PdfJsViewport`, `PdfJsGlobal` (+192 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 267 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **18 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `jszip` connect `epub-reader-parser.ts` to `Logger`, `epub-editor-state.svelte.ts`, `real-world-workflows.test.ts`, `scripts`, `cleaner-engine.ts`, `epub-source-state.svelte.ts`?**
  _High betweenness centrality (0.232) - this node is a cross-community bridge._
- **Why does `dependencies` connect `scripts` to `epub-reader-parser.ts`?**
  _High betweenness centrality (0.185) - this node is a cross-community bridge._
- **Why does `Logger` connect `Logger` to `epub-editor-state.svelte.ts`, `real-world-workflows.test.ts`, `lib/types/index.ts`, `epub-source-parser.ts`, `cleaner-engine.ts`, `epub-to-txt.ts`, `image-bg-remove-ml.ts`, `epub-source-state.svelte.ts`?**
  _High betweenness centrality (0.136) - this node is a cross-community bridge._
- **What connects `LogLevel`, `PdfJsDocument`, `PdfJsPage` to the rest of the system?**
  _197 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Logger` be split into smaller, more focused modules?**
  _Cohesion score 0.05009009009009009 - nodes in this community are weakly interconnected._
- **Should `epub-editor-state.svelte.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07433489827856025 - nodes in this community are weakly interconnected._
- **Should `real-world-workflows.test.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07672634271099744 - nodes in this community are weakly interconnected._