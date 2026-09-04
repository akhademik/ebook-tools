# Graph Report - .  (2026-09-04)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 719 nodes · 1649 edges · 41 communities (28 shown, 13 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `37297013`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- zip-writer.ts
- epub-book-ops.ts
- epub-source-parser.ts
- lib/types/index.ts
- Logger
- scripts
- image-bg-remove-ml.ts
- epub-editor-state.svelte.ts
- EBOOK-TOOLS — FULL REGRESSION TESTING INSTRUCTION
- resolveRelativePath
- pdf-splitter.ts
- jszip
- 🚀 Các công cụ chính
- compilerOptions
- validator-engine.ts
- tests-e2e/tsconfig.json
- devDependencies
- entry
- knip.json
- generate-fonts-meta.js
- result.type.ts
- Tuyển Tập Truyện Ngắn Đương Đại
- helpers.test.ts
- eslint.config.js
- @eslint/js
- @sveltejs/vite-plugin-svelte
- knip
- prettier-plugin-svelte
- svelte-check
- @sveltejs/adapter-cloudflare
- @sveltejs/kit
- @tailwindcss/vite
- @types/node
- typescript
- vite
- vitest

## God Nodes (most connected - your core abstractions)
1. `Logger` - 84 edges
2. `EBOOK-TOOLS — FULL REGRESSION TESTING INSTRUCTION` - 32 edges
3. `jszip` - 23 edges
4. `resolveRelativePath()` - 21 edges
5. `scripts` - 19 edges
6. `EpubImagesState` - 19 edges
7. `EpubEditorState` - 18 edges
8. `escapeXml()` - 17 edges
9. `buildEpubBlob()` - 15 edges
10. `parseTxtToChapters()` - 15 edges

## Surprising Connections (you probably didn't know these)
- `createSampleEpubZip()` --references--> `jszip`  [EXTRACTED]
  tests/epub-cleaner.test.ts → package.json
- `types` --extends--> `@playwright/test`  [EXTRACTED]
  tests-e2e/tsconfig.json → package.json
- `cleanEpub()` --references--> `jszip`  [EXTRACTED]
  src/lib/epub-editor/cleaner/cleaner-engine.ts → package.json
- `exportEpubBlob()` --references--> `jszip`  [EXTRACTED]
  src/lib/epub-editor/editor/editor-ops.ts → package.json
- `parseZipEntries()` --references--> `jszip`  [EXTRACTED]
  src/lib/epub-editor/editor/editor-ops.ts → package.json

## Import Cycles
- None detected.

## Communities (41 total, 13 thin omitted)

### Community 0 - "zip-writer.ts"
Cohesion: 0.08
Nodes (28): prepareChapters(), prepareMetadata(), resolveActiveFonts(), EPUB_CSS, getDynamicCss(), prepareFinalCss(), assembleEpubZip(), buildEpubBlob() (+20 more)

### Community 1 - "epub-book-ops.ts"
Cohesion: 0.09
Nodes (38): optimizeEpub(), BookMetadataDetails, extractBookMetadata(), findOpfPath(), rebuildEpubToc(), TocChapterInfo, updateBookMetadata(), validateEpub() (+30 more)

### Community 2 - "epub-source-parser.ts"
Cohesion: 0.12
Nodes (45): analyzeChapterCandidates(), assignSequentialChapterIds(), extractChunkBlocks(), extractMarkerTitle(), isDecorationOnly(), makeChapterMatcher(), pushIfLineStart(), scoreHeadingCandidate() (+37 more)

### Community 3 - "lib/types/index.ts"
Cohesion: 0.08
Nodes (25): MAX_IMAGE_FILE_SIZE, MAX_IMAGES_ZIP_FILE_SIZE, MAX_PDF_FILE_SIZE, MAX_TXT_FILE_SIZE, MAX_ZIP_FILE_SIZE, EpubMetadataState, EpubSourceState, EpubSourceStateDependencies (+17 more)

### Community 4 - "Logger"
Cohesion: 0.08
Nodes (13): MAX_EPUB_FILE_SIZE, formatByteSize(), EpubEditorState, EpubToTxtResult, EpubToTxtState, MarkdownFixerState, triggerDownload(), isDebug() (+5 more)

### Community 5 - "scripts"
Cohesion: 0.05
Nodes (43): @codemirror/commands, @codemirror/lang-css, @codemirror/lang-html, @codemirror/state, @codemirror/theme-one-dark, @codemirror/view, fontkit, @imgly/background-removal (+35 more)

### Community 6 - "image-bg-remove-ml.ts"
Cohesion: 0.09
Nodes (19): EpubImagesState, autoCropTransparentCanvas(), canvasToBlob(), cleanupWorkerAndRejectPending(), compressAndResizeCanvas(), getOrCreateWorker(), loadImage(), OrnamentProcessOptions (+11 more)

### Community 7 - "epub-editor-state.svelte.ts"
Cohesion: 0.10
Nodes (23): analyzeEpub(), analyzeOptimizationPlan(), cleanEpub(), getDuplicateWorker(), scanDuplicateResources(), computeDuplicateResources(), DuplicateDetectorWorkerRequest, DuplicateDetectorWorkerResponse (+15 more)

### Community 8 - "EBOOK-TOOLS — FULL REGRESSION TESTING INSTRUCTION"
Cohesion: 0.05
Nodes (41): 10. PDF → EPUB USER FLOW, 11. EPUB EDITOR E2E, 12. EPUB CLEANER E2E, 13. EPUB VALIDATOR E2E, 14. IMAGE PROCESSING E2E, 15. WORKER TESTING, 16. REGRESSION TEST, 17. OUTPUT FILE VALIDATION (+33 more)

### Community 9 - "resolveRelativePath"
Cohesion: 0.13
Nodes (29): categorizeFile(), exportEpubBlob(), extractLinkedCssPaths(), parseSpineOrder(), parseZipEntries(), deobfuscateAdobeFont(), deobfuscateIdpfFont(), isValidFontMagic() (+21 more)

### Community 10 - "pdf-splitter.ts"
Cohesion: 0.07
Nodes (23): App, Window, applyGrayscale(), cropCanvas(), formatEta(), loadPdfPreview(), pickConcurrency(), processPdfToJpg() (+15 more)

### Community 11 - "jszip"
Cohesion: 0.10
Nodes (26): jszip, jszip, @playwright/test, @playwright/test, categorizeResource(), extractEpubMetadata(), findOpfPath(), parseEpub() (+18 more)

### Community 12 - "🚀 Các công cụ chính"
Cohesion: 0.07
Nodes (26): 🔒 1. Quy tắc Quản lý Gói (Package Manager Rule), 🧱 2. Kiến trúc Hệ Thống Kiểm Thử 4 Tầng (4-Tier Testing Strategy), 🎯 3. Ma Trận Hướng Dẫn: "Sửa Gì - Chạy Test Gì?" (Test Decision Matrix), 🔄 4. Chu trình Chỉnh Sửa Code Chuẩn (Standard Quality Gate Flow), ⚡ 5. Bảng Tra Cứu Lệnh Nhanh (Cheat Sheet), Chi tiết các bước Quality Gates:, 📋 QUY TRÌNH PHÁT TRIỂN & HỆ THỐNG KIỂM THỬ (DEVELOPMENT & TESTING WORKFLOW), 🔹 Tầng 1: Smoke Tests (`pnpm test:smoke`) (+18 more)

### Community 13 - "compilerOptions"
Cohesion: 0.10
Nodes (20): playwright.config.ts, src/**/*, .svelte-kit/ambient.d.ts, .svelte-kit/non-ambient.d.ts, ./.svelte-kit/tsconfig.json, .svelte-kit/types/**/$types.d.ts, compilerOptions, allowJs (+12 more)

### Community 14 - "validator-engine.ts"
Cohesion: 0.20
Nodes (16): CssAndFontsRule, XhtmlPagesRule, NavigationRule, OpfPackageRule, SpineRule, StructureRule, ManifestItemInfo, ValidationCategory (+8 more)

### Community 15 - "tests-e2e/tsconfig.json"
Cohesion: 0.12
Nodes (14): vitest/globals, compilerOptions, types, extends, include, ./**/*, node, compilerOptions (+6 more)

### Community 16 - "devDependencies"
Cohesion: 0.15
Nodes (13): eslint, eslint-plugin-svelte, globals, devDependencies, eslint, eslint-plugin-svelte, globals, prettier (+5 more)

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

- **Why does `jszip` connect `jszip` to `zip-writer.ts`, `epub-book-ops.ts`, `lib/types/index.ts`, `Logger`, `scripts`, `image-bg-remove-ml.ts`, `epub-editor-state.svelte.ts`, `resolveRelativePath`, `pdf-splitter.ts`?**
  _High betweenness centrality (0.242) - this node is a cross-community bridge._
- **Why does `dependencies` connect `scripts` to `jszip`?**
  _High betweenness centrality (0.190) - this node is a cross-community bridge._
- **Why does `Logger` connect `Logger` to `zip-writer.ts`, `epub-book-ops.ts`, `epub-source-parser.ts`, `lib/types/index.ts`, `image-bg-remove-ml.ts`, `epub-editor-state.svelte.ts`, `resolveRelativePath`, `pdf-splitter.ts`?**
  _High betweenness centrality (0.183) - this node is a cross-community bridge._
- **What connects `10. PDF → EPUB USER FLOW`, `11. EPUB EDITOR E2E`, `12. EPUB CLEANER E2E` to the rest of the system?**
  _196 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `zip-writer.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07814207650273224 - nodes in this community are weakly interconnected._
- **Should `epub-book-ops.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.08636363636363636 - nodes in this community are weakly interconnected._
- **Should `epub-source-parser.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.11688311688311688 - nodes in this community are weakly interconnected._