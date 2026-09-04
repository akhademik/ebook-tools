# Graph Report - .  (2026-09-04)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 719 nodes · 1625 edges · 42 communities (28 shown, 14 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `9565162f`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- real-world-workflows.test.ts
- lib/types/index.ts
- Logger
- epub-source-parser.ts
- scripts
- image-bg-remove-ml.ts
- EBOOK-TOOLS — FULL REGRESSION TESTING INSTRUCTION
- resolveRelativePath
- pdf-splitter.ts
- jszip
- cleaner-engine.ts
- 🚀 Các công cụ chính
- compilerOptions
- validator-engine.ts
- tests-e2e/tsconfig.json
- txt-parser.ts
- devDependencies
- entry
- knip.json
- generate-fonts-meta.js
- result.type.ts
- Tuyển Tập Truyện Ngắn Đương Đại
- epub-packer.test.ts
- helpers.test.ts
- eslint.config.js
- eslint-plugin-svelte
- knip
- @eslint/js
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
1. `Logger` - 82 edges
2. `EBOOK-TOOLS — FULL REGRESSION TESTING INSTRUCTION` - 32 edges
3. `jszip` - 23 edges
4. `resolveRelativePath()` - 21 edges
5. `scripts` - 19 edges
6. `EpubImagesState` - 19 edges
7. `EpubEditorState` - 18 edges
8. `buildEpubBlob()` - 15 edges
9. `getAssetDataUrl()` - 13 edges
10. `extractEpubToTxt()` - 13 edges

## Surprising Connections (you probably didn't know these)
- `createSampleEpubZip()` --references--> `jszip`  [EXTRACTED]
  tests/epub-cleaner.test.ts → package.json
- `createBaseBookZip()` --references--> `jszip`  [EXTRACTED]
  tests/real-world-workflows.test.ts → package.json
- `types` --extends--> `@playwright/test`  [EXTRACTED]
  tests-e2e/tsconfig.json → package.json
- `cleanEpub()` --references--> `jszip`  [EXTRACTED]
  src/lib/epub-editor/cleaner/cleaner-engine.ts → package.json
- `exportEpubBlob()` --references--> `jszip`  [EXTRACTED]
  src/lib/epub-editor/editor/editor-ops.ts → package.json

## Import Cycles
- None detected.

## Communities (42 total, 14 thin omitted)

### Community 0 - "real-world-workflows.test.ts"
Cohesion: 0.07
Nodes (52): optimizeEpub(), BookMetadataDetails, extractBookMetadata(), findOpfPath(), rebuildEpubToc(), reorderOpfSpine(), TocChapterInfo, updateBookMetadata() (+44 more)

### Community 1 - "lib/types/index.ts"
Cohesion: 0.06
Nodes (21): MAX_IMAGE_FILE_SIZE, MAX_IMAGES_ZIP_FILE_SIZE, MAX_PDF_FILE_SIZE, MAX_TXT_FILE_SIZE, MAX_ZIP_FILE_SIZE, isDirty, EpubState, assignSequentialChapterIds() (+13 more)

### Community 2 - "Logger"
Cohesion: 0.06
Nodes (22): MAX_EPUB_FILE_SIZE, formatByteSize(), EpubEditorState, EpubToTxtResult, EpubToTxtState, BOLD_ITALIC_PATTERNS, BOLD_PATTERNS, convertBrackets() (+14 more)

### Community 3 - "epub-source-parser.ts"
Cohesion: 0.12
Nodes (44): analyzeChapterCandidates(), extractChunkBlocks(), extractMarkerTitle(), isDecorationOnly(), makeChapterMatcher(), pushIfLineStart(), scoreHeadingCandidate(), stripDecoration() (+36 more)

### Community 4 - "scripts"
Cohesion: 0.05
Nodes (43): @codemirror/commands, @codemirror/lang-css, @codemirror/lang-html, @codemirror/state, @codemirror/theme-one-dark, @codemirror/view, fontkit, @imgly/background-removal (+35 more)

### Community 5 - "image-bg-remove-ml.ts"
Cohesion: 0.09
Nodes (19): EpubImagesState, autoCropTransparentCanvas(), canvasToBlob(), cleanupWorkerAndRejectPending(), compressAndResizeCanvas(), getOrCreateWorker(), loadImage(), OrnamentProcessOptions (+11 more)

### Community 6 - "EBOOK-TOOLS — FULL REGRESSION TESTING INSTRUCTION"
Cohesion: 0.05
Nodes (41): 10. PDF → EPUB USER FLOW, 11. EPUB EDITOR E2E, 12. EPUB CLEANER E2E, 13. EPUB VALIDATOR E2E, 14. IMAGE PROCESSING E2E, 15. WORKER TESTING, 16. REGRESSION TEST, 17. OUTPUT FILE VALIDATION (+33 more)

### Community 7 - "resolveRelativePath"
Cohesion: 0.13
Nodes (28): categorizeFile(), exportEpubBlob(), extractLinkedCssPaths(), parseSpineOrder(), parseZipEntries(), deobfuscateAdobeFont(), deobfuscateIdpfFont(), isValidFontMagic() (+20 more)

### Community 8 - "pdf-splitter.ts"
Cohesion: 0.07
Nodes (23): App, Window, applyGrayscale(), cropCanvas(), formatEta(), loadPdfPreview(), pickConcurrency(), processPdfToJpg() (+15 more)

### Community 9 - "jszip"
Cohesion: 0.10
Nodes (25): jszip, jszip, @playwright/test, @playwright/test, categorizeResource(), extractEpubMetadata(), findOpfPath(), parseEpub() (+17 more)

### Community 10 - "cleaner-engine.ts"
Cohesion: 0.15
Nodes (22): analyzeEpub(), analyzeOptimizationPlan(), cleanEpub(), getDuplicateWorker(), scanDuplicateResources(), computeDuplicateResources(), DuplicateDetectorWorkerRequest, DuplicateDetectorWorkerResponse (+14 more)

### Community 11 - "🚀 Các công cụ chính"
Cohesion: 0.07
Nodes (26): 🔒 1. Quy tắc Quản lý Gói (Package Manager Rule), 🧱 2. Kiến trúc Hệ Thống Kiểm Thử 4 Tầng (4-Tier Testing Strategy), 🎯 3. Ma Trận Hướng Dẫn: "Sửa Gì - Chạy Test Gì?" (Test Decision Matrix), 🔄 4. Chu trình Chỉnh Sửa Code Chuẩn (Standard Quality Gate Flow), ⚡ 5. Bảng Tra Cứu Lệnh Nhanh (Cheat Sheet), Chi tiết các bước Quality Gates:, 📋 QUY TRÌNH PHÁT TRIỂN & HỆ THỐNG KIỂM THỬ (DEVELOPMENT & TESTING WORKFLOW), 🔹 Tầng 1: Smoke Tests (`pnpm test:smoke`) (+18 more)

### Community 12 - "compilerOptions"
Cohesion: 0.10
Nodes (20): playwright.config.ts, src/**/*, .svelte-kit/ambient.d.ts, .svelte-kit/non-ambient.d.ts, ./.svelte-kit/tsconfig.json, .svelte-kit/types/**/$types.d.ts, compilerOptions, allowJs (+12 more)

### Community 13 - "validator-engine.ts"
Cohesion: 0.20
Nodes (16): CssAndFontsRule, XhtmlPagesRule, NavigationRule, OpfPackageRule, SpineRule, StructureRule, ManifestItemInfo, ValidationCategory (+8 more)

### Community 14 - "tests-e2e/tsconfig.json"
Cohesion: 0.12
Nodes (14): vitest/globals, compilerOptions, types, extends, include, ./**/*, node, compilerOptions (+6 more)

### Community 15 - "txt-parser.ts"
Cohesion: 0.24
Nodes (11): applyInlineFormatting(), escapeRegExp(), getClosingTag(), getTxtParserWorker(), isIllustrationTag(), parseTxtToChapters(), parseTxtToChaptersAsync(), stripHtmlTags() (+3 more)

### Community 16 - "devDependencies"
Cohesion: 0.15
Nodes (13): eslint, globals, devDependencies, eslint, globals, prettier, prettier-plugin-svelte, svelte (+5 more)

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

### Community 23 - "helpers.test.ts"
Cohesion: 0.50
Nodes (3): mockAnchor, mockDocument, mockPdfjsLib

## Knowledge Gaps
- **197 isolated node(s):** `10. PDF → EPUB USER FLOW`, `11. EPUB EDITOR E2E`, `12. EPUB CLEANER E2E`, `13. EPUB VALIDATOR E2E`, `14. IMAGE PROCESSING E2E` (+192 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **14 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `jszip` connect `jszip` to `real-world-workflows.test.ts`, `lib/types/index.ts`, `Logger`, `scripts`, `image-bg-remove-ml.ts`, `resolveRelativePath`, `pdf-splitter.ts`, `cleaner-engine.ts`?**
  _High betweenness centrality (0.242) - this node is a cross-community bridge._
- **Why does `dependencies` connect `scripts` to `jszip`?**
  _High betweenness centrality (0.190) - this node is a cross-community bridge._
- **Why does `Logger` connect `Logger` to `real-world-workflows.test.ts`, `lib/types/index.ts`, `epub-source-parser.ts`, `image-bg-remove-ml.ts`, `resolveRelativePath`, `pdf-splitter.ts`, `cleaner-engine.ts`, `txt-parser.ts`?**
  _High betweenness centrality (0.175) - this node is a cross-community bridge._
- **What connects `10. PDF → EPUB USER FLOW`, `11. EPUB EDITOR E2E`, `12. EPUB CLEANER E2E` to the rest of the system?**
  _197 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `real-world-workflows.test.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07492507492507493 - nodes in this community are weakly interconnected._
- **Should `lib/types/index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06054054054054054 - nodes in this community are weakly interconnected._
- **Should `Logger` be split into smaller, more focused modules?**
  _Cohesion score 0.06390977443609022 - nodes in this community are weakly interconnected._