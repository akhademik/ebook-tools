# Graph Report - .  (2026-08-29)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 728 nodes · 1672 edges · 43 communities (30 shown, 13 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `088ec37e`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- epub-editor-state.svelte.ts
- Logger
- lib/types/index.ts
- epub-source-parser.ts
- cleaner-engine.ts
- scripts
- image-bg-remove-ml.ts
- EBOOK-TOOLS — FULL REGRESSION TESTING INSTRUCTION
- pdf-splitter.ts
- epub-state.svelte.ts
- 🚀 Các công cụ chính
- @playwright/test
- epub-reader-parser.ts
- compilerOptions
- validator-engine.ts
- txt-parser.ts
- devDependencies
- entry
- knip.json
- generate-fonts-meta.js
- result.type.ts
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
1. `Logger` - 85 edges
2. `EBOOK-TOOLS — FULL REGRESSION TESTING INSTRUCTION` - 32 edges
3. `jszip` - 23 edges
4. `resolveRelativePath()` - 21 edges
5. `scripts` - 19 edges
6. `EpubImagesState` - 19 edges
7. `escapeXml()` - 19 edges
8. `EpubEditorState` - 18 edges
9. `buildEpubBlob()` - 16 edges
10. `parseTxtToChapters()` - 15 edges

## Surprising Connections (you probably didn't know these)
- `ensureEpubFixture()` --references--> `jszip`  [EXTRACTED]
  tests-e2e/epub-download-inspection.spec.ts → package.json
- `ensureEpubFixture()` --references--> `jszip`  [EXTRACTED]
  tests-e2e/epub-workflow.spec.ts → package.json
- `cleanEpub()` --references--> `jszip`  [EXTRACTED]
  src/lib/epub-editor/cleaner/cleaner-engine.ts → package.json
- `assembleEpubZip()` --references--> `jszip`  [EXTRACTED]
  src/lib/epub-packer/builders/zip-writer.ts → package.json
- `buildEpubBlob()` --references--> `jszip`  [EXTRACTED]
  src/lib/epub-packer/builders/zip-writer.ts → package.json

## Import Cycles
- None detected.

## Communities (43 total, 13 thin omitted)

### Community 0 - "epub-editor-state.svelte.ts"
Cohesion: 0.07
Nodes (36): jszip, jszip, isDirty, categorizeFile(), exportEpubBlob(), extractLinkedCssPaths(), parseSpineOrder(), parseZipEntries() (+28 more)

### Community 1 - "Logger"
Cohesion: 0.06
Nodes (34): MAX_EPUB_FILE_SIZE, MAX_IMAGE_FILE_SIZE, MAX_IMAGES_ZIP_FILE_SIZE, MAX_PDF_FILE_SIZE, MAX_TXT_FILE_SIZE, MAX_ZIP_FILE_SIZE, EpubSourceState, EpubSourceStateDependencies (+26 more)

### Community 2 - "lib/types/index.ts"
Cohesion: 0.10
Nodes (39): prepareChapters(), prepareMetadata(), resolveActiveFonts(), getDynamicCss(), prepareFinalCss(), assembleEpubZip(), buildEpubBlob(), assignSequentialChapterIds() (+31 more)

### Community 3 - "epub-source-parser.ts"
Cohesion: 0.11
Nodes (48): analyzeChapterCandidates(), extractChunkBlocks(), extractMarkerTitle(), isDecorationOnly(), makeChapterMatcher(), pushIfLineStart(), scoreHeadingCandidate(), stripDecoration() (+40 more)

### Community 4 - "cleaner-engine.ts"
Cohesion: 0.10
Nodes (30): analyzeEpub(), analyzeOptimizationPlan(), cleanEpub(), optimizeEpub(), getDuplicateWorker(), scanDuplicateResources(), computeDuplicateResources(), DuplicateDetectorWorkerRequest (+22 more)

### Community 5 - "scripts"
Cohesion: 0.05
Nodes (43): @codemirror/commands, @codemirror/lang-css, @codemirror/lang-html, @codemirror/state, @codemirror/theme-one-dark, @codemirror/view, fontkit, @imgly/background-removal (+35 more)

### Community 6 - "image-bg-remove-ml.ts"
Cohesion: 0.09
Nodes (19): EpubImagesState, autoCropTransparentCanvas(), canvasToBlob(), cleanupWorkerAndRejectPending(), compressAndResizeCanvas(), getOrCreateWorker(), loadImage(), OrnamentProcessOptions (+11 more)

### Community 7 - "EBOOK-TOOLS — FULL REGRESSION TESTING INSTRUCTION"
Cohesion: 0.05
Nodes (41): 10. PDF → EPUB USER FLOW, 11. EPUB EDITOR E2E, 12. EPUB CLEANER E2E, 13. EPUB VALIDATOR E2E, 14. IMAGE PROCESSING E2E, 15. WORKER TESTING, 16. REGRESSION TEST, 17. OUTPUT FILE VALIDATION (+33 more)

### Community 8 - "pdf-splitter.ts"
Cohesion: 0.07
Nodes (23): App, Window, applyGrayscale(), cropCanvas(), formatEta(), loadPdfPreview(), pickConcurrency(), processPdfToJpg() (+15 more)

### Community 9 - "epub-state.svelte.ts"
Cohesion: 0.11
Nodes (7): EPUB_CSS, EpubState, EpubFontsState, EpubJacketState, EpubMetadataState, fontFiles, fontMetaMap

### Community 10 - "🚀 Các công cụ chính"
Cohesion: 0.07
Nodes (26): 🔒 1. Quy tắc Quản lý Gói (Package Manager Rule), 🧱 2. Kiến trúc Hệ Thống Kiểm Thử 4 Tầng (4-Tier Testing Strategy), 🎯 3. Ma Trận Hướng Dẫn: "Sửa Gì - Chạy Test Gì?" (Test Decision Matrix), 🔄 4. Chu trình Chỉnh Sửa Code Chuẩn (Standard Quality Gate Flow), ⚡ 5. Bảng Tra Cứu Lệnh Nhanh (Cheat Sheet), Chi tiết các bước Quality Gates:, 📋 QUY TRÌNH PHÁT TRIỂN & HỆ THỐNG KIỂM THỬ (DEVELOPMENT & TESTING WORKFLOW), 🔹 Tầng 1: Smoke Tests (`pnpm test:smoke`) (+18 more)

### Community 11 - "@playwright/test"
Cohesion: 0.09
Nodes (18): @playwright/test, @playwright/test, vitest/globals, ensureEpubFixture(), ensureEpubFixture(), compilerOptions, types, extends (+10 more)

### Community 12 - "epub-reader-parser.ts"
Cohesion: 0.17
Nodes (18): categorizeResource(), extractEpubMetadata(), findOpfPath(), parseEpub(), parseOpfManifestAndSpine(), EpubBook, EpubBookMetadata, EpubContainer (+10 more)

### Community 13 - "compilerOptions"
Cohesion: 0.10
Nodes (20): playwright.config.ts, src/**/*, .svelte-kit/ambient.d.ts, .svelte-kit/non-ambient.d.ts, ./.svelte-kit/tsconfig.json, .svelte-kit/types/**/$types.d.ts, compilerOptions, allowJs (+12 more)

### Community 14 - "validator-engine.ts"
Cohesion: 0.20
Nodes (16): CssAndFontsRule, XhtmlPagesRule, NavigationRule, OpfPackageRule, SpineRule, StructureRule, ManifestItemInfo, ValidationCategory (+8 more)

### Community 15 - "txt-parser.ts"
Cohesion: 0.25
Nodes (11): applyInlineFormatting(), escapeRegExp(), getClosingTag(), getTxtParserWorker(), isIllustrationTag(), parseTxtToChapters(), parseTxtToChaptersAsync(), stripHtmlTags() (+3 more)

### Community 16 - "devDependencies"
Cohesion: 0.15
Nodes (13): eslint, @eslint/js, globals, devDependencies, eslint, @eslint/js, globals, prettier (+5 more)

### Community 17 - "entry"
Cohesion: 0.22
Nodes (9): entry, src/lib/epub-editor/epub-validator.ts, src/lib/epub-packer/epub-packer.ts, src/lib/epub-packer/parser/epub-source-parser.ts, src/lib/types/index.ts, src/lib/utils/index.ts, src/routes/**/+layout.{svelte,js,ts}, src/routes/**/+page.{svelte,js,ts} (+1 more)

### Community 18 - "knip.json"
Cohesion: 0.25
Nodes (7): ignoreDependencies, project, $schema, tailwindcss, src/**/*.{js,ts,svelte}, tests/**/*.{js,ts}, tailwindcss

### Community 19 - "generate-fonts-meta.js"
Cohesion: 0.29
Nodes (6): files, fontkit, FONTS_DIR, metadata, OUTPUT_FILE, require

### Community 20 - "result.type.ts"
Cohesion: 0.40
Nodes (3): AppError, Result, ValidationError

### Community 21 - "Tuyển Tập Truyện Ngắn Đương Đại"
Cohesion: 0.33
Nodes (5): 1.1 Buổi Sáng Ở Quán Cà Phê, 2.2 Kết Thúc Một Ngày, Chương 1: Ký Ức Mùa Thu, Chương 2: Tiếng Chuông Chiều, Tuyển Tập Truyện Ngắn Đương Đại

### Community 22 - "helpers.test.ts"
Cohesion: 0.50
Nodes (3): mockAnchor, mockDocument, mockPdfjsLib

## Knowledge Gaps
- **196 isolated node(s):** `10. PDF → EPUB USER FLOW`, `11. EPUB EDITOR E2E`, `12. EPUB CLEANER E2E`, `13. EPUB VALIDATOR E2E`, `14. IMAGE PROCESSING E2E` (+191 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **13 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `jszip` connect `epub-editor-state.svelte.ts` to `Logger`, `lib/types/index.ts`, `cleaner-engine.ts`, `scripts`, `image-bg-remove-ml.ts`, `pdf-splitter.ts`, `@playwright/test`, `epub-reader-parser.ts`?**
  _High betweenness centrality (0.239) - this node is a cross-community bridge._
- **Why does `dependencies` connect `scripts` to `epub-editor-state.svelte.ts`?**
  _High betweenness centrality (0.188) - this node is a cross-community bridge._
- **Why does `Logger` connect `Logger` to `epub-editor-state.svelte.ts`, `lib/types/index.ts`, `epub-source-parser.ts`, `cleaner-engine.ts`, `image-bg-remove-ml.ts`, `pdf-splitter.ts`, `epub-state.svelte.ts`, `txt-parser.ts`?**
  _High betweenness centrality (0.184) - this node is a cross-community bridge._
- **What connects `10. PDF → EPUB USER FLOW`, `11. EPUB EDITOR E2E`, `12. EPUB CLEANER E2E` to the rest of the system?**
  _196 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `epub-editor-state.svelte.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06621004566210045 - nodes in this community are weakly interconnected._
- **Should `Logger` be split into smaller, more focused modules?**
  _Cohesion score 0.06259780907668232 - nodes in this community are weakly interconnected._
- **Should `lib/types/index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.10286382232612508 - nodes in this community are weakly interconnected._