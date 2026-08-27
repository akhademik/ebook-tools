# Graph Report - ebook-tools  (2026-08-27)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 627 nodes · 1317 edges · 38 communities (27 shown, 11 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `0719be9c`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- epub-editor-state.svelte.ts
- lib/types/index.ts
- epub-source-parser.ts
- utils/index.ts
- epub-state.svelte.ts
- image-bg-remove-ml.ts
- scripts
- pdf-splitter.ts
- 🔄 2. Chu trình Chỉnh Sửa Code Chuẩn (Edit-Check-Test-Graphify Flow)
- epub-book-ops.ts
- epub-reader-parser.ts
- epub-validator.ts
- compilerOptions
- tests-e2e/tsconfig.json
- devDependencies
- entry
- knip.json
- generate-fonts-meta.js
- result.type.ts
- components.type.ts
- epub-editor.type.ts
- eslint.config.js
- @eslint/js
- eslint-plugin-svelte
- svelte-check
- @sveltejs/adapter-cloudflare
- @sveltejs/kit
- @tailwindcss/vite
- @types/node
- typescript-eslint
- vite
- vitest

## God Nodes (most connected - your core abstractions)
1. `Logger` - 24 edges
2. `EpubEditorState` - 17 edges
3. `EpubImagesState` - 17 edges
4. `escapeXml()` - 17 edges
5. `scripts` - 13 edges
6. `processOrnamentImage()` - 12 edges
7. `EpubMetadata` - 11 edges
8. `getAssetDataUrl()` - 11 edges
9. `buildEpubBlob()` - 11 edges
10. `findFont()` - 11 edges

## Surprising Connections (you probably didn't know these)
- `EpubSourceStateDependencies` --references--> `IllustrationImageItem`  [EXTRACTED]
  src/lib/epub-packer/state/epub-source-state.svelte.ts → src/lib/types/epub.type.ts
- `types` --extends--> `@playwright/test`  [EXTRACTED]
  tests-e2e/tsconfig.json → package.json
- `ignoreDependencies` --extends--> `tailwindcss`  [EXTRACTED]
  knip.json → package.json
- `BookMetadataDetails` --inherits--> `EpubMetadata`  [EXTRACTED]
  src/lib/epub-editor/epub-book-ops.ts → src/lib/types/epub.type.ts
- `EpubBookMetadata` --inherits--> `EpubMetadata`  [EXTRACTED]
  src/lib/epub/types/index.ts → src/lib/types/epub.type.ts

## Import Cycles
- None detected.

## Communities (38 total, 11 thin omitted)

### Community 0 - "epub-editor-state.svelte.ts"
Cohesion: 0.07
Nodes (42): isDirty, analyzeEpub(), analyzeOptimizationPlan(), cleanEpub(), DuplicateResourceItem, EpubAnalysisResult, EpubCleanOptions, EpubCleanReport (+34 more)

### Community 1 - "lib/types/index.ts"
Cohesion: 0.08
Nodes (48): replaceOrCreateTag(), prepareChapters(), prepareMetadata(), resolveActiveFonts(), getDynamicCss(), prepareFinalCss(), assembleEpubZip(), buildEpubBlob() (+40 more)

### Community 2 - "epub-source-parser.ts"
Cohesion: 0.12
Nodes (43): analyzeChapterCandidates(), extractChunkBlocks(), extractMarkerTitle(), isDecorationOnly(), makeChapterMatcher(), pushIfLineStart(), scoreHeadingCandidate(), stripDecoration() (+35 more)

### Community 3 - "utils/index.ts"
Cohesion: 0.07
Nodes (26): MAX_IMAGE_FILE_SIZE, MAX_IMAGES_ZIP_FILE_SIZE, MAX_PDF_FILE_SIZE, MAX_TXT_FILE_SIZE, MAX_ZIP_FILE_SIZE, EpubSourceStateDependencies, BOLD_ITALIC_PATTERNS, BOLD_PATTERNS (+18 more)

### Community 4 - "epub-state.svelte.ts"
Cohesion: 0.09
Nodes (7): EPUB_CSS, EpubState, EpubFontsState, EpubJacketState, EpubMetadataState, EpubSourceState, ensureEpubExt()

### Community 5 - "image-bg-remove-ml.ts"
Cohesion: 0.09
Nodes (19): EpubImagesState, autoCropTransparentCanvas(), canvasToBlob(), cleanupWorkerAndRejectPending(), compressAndResizeCanvas(), getOrCreateWorker(), loadImage(), OrnamentProcessOptions (+11 more)

### Community 6 - "scripts"
Cohesion: 0.05
Nodes (39): @codemirror/commands, @codemirror/lang-css, @codemirror/lang-html, @codemirror/state, @codemirror/theme-one-dark, @codemirror/view, fontkit, @imgly/background-removal (+31 more)

### Community 7 - "pdf-splitter.ts"
Cohesion: 0.09
Nodes (22): App, Window, applyGrayscale(), cropCanvas(), formatEta(), loadPdfPreview(), pickConcurrency(), processPdfToJpg() (+14 more)

### Community 8 - "🔄 2. Chu trình Chỉnh Sửa Code Chuẩn (Edit-Check-Test-Graphify Flow)"
Cohesion: 0.07
Nodes (27): 🔒 1. Quy tắc Quản lý Gói (Package Manager Rule), 🔄 2. Chu trình Chỉnh Sửa Code Chuẩn (Edit-Check-Test-Graphify Flow), 🔹 Bước 1: Viết / Sửa code, 🔹 Bước 2: Kiểm tra kiểu dữ liệu (Type Check), 🔹 Bước 3: Kiểm tra định dạng & cú pháp (Linting), 🔹 Bước 4: Quét mã rác & exports thừa (Dead Code Analysis), 🔹 Bước 5: Chạy Bộ Kiểm Thử Tự Động (Unit & Integration Tests), 🔹 Bước 6: Chạy Kiểm thử Giao diện Trình duyệt Thật (Playwright E2E) (+19 more)

### Community 9 - "epub-book-ops.ts"
Cohesion: 0.16
Nodes (15): MAX_EPUB_FILE_SIZE, BookMetadataDetails, extractBookMetadata(), findOpfPath(), rebuildEpubToc(), reorderOpfSpine(), TocChapterInfo, updateBookMetadata() (+7 more)

### Community 10 - "epub-reader-parser.ts"
Cohesion: 0.17
Nodes (18): categorizeResource(), extractEpubMetadata(), findOpfPath(), parseEpub(), parseOpfManifestAndSpine(), EpubBook, EpubBookMetadata, EpubContainer (+10 more)

### Community 11 - "epub-validator.ts"
Cohesion: 0.10
Nodes (17): CssAndFontsRule, DEFAULT_VALIDATION_RULES, ManifestItemInfo, NavigationRule, OpfPackageRule, SpineRule, StructureRule, validateEpub() (+9 more)

### Community 12 - "compilerOptions"
Cohesion: 0.10
Nodes (20): playwright.config.ts, src/**/*, .svelte-kit/ambient.d.ts, .svelte-kit/non-ambient.d.ts, ./.svelte-kit/tsconfig.json, .svelte-kit/types/**/$types.d.ts, compilerOptions, allowJs (+12 more)

### Community 13 - "tests-e2e/tsconfig.json"
Cohesion: 0.11
Nodes (16): @playwright/test, @playwright/test, vitest/globals, compilerOptions, types, extends, include, ./**/* (+8 more)

### Community 14 - "devDependencies"
Cohesion: 0.15
Nodes (13): eslint, globals, devDependencies, eslint, globals, knip, svelte, @sveltejs/vite-plugin-svelte (+5 more)

### Community 15 - "entry"
Cohesion: 0.22
Nodes (9): entry, src/lib/epub-editor/epub-validator.ts, src/lib/epub-packer/epub-packer.ts, src/lib/epub-packer/parser/epub-source-parser.ts, src/lib/types/index.ts, src/lib/utils/index.ts, src/routes/**/+layout.{svelte,js,ts}, src/routes/**/+page.{svelte,js,ts} (+1 more)

### Community 16 - "knip.json"
Cohesion: 0.25
Nodes (7): ignoreDependencies, project, $schema, tailwindcss, src/**/*.{js,ts,svelte}, tests/**/*.{js,ts}, tailwindcss

### Community 17 - "generate-fonts-meta.js"
Cohesion: 0.29
Nodes (6): files, fontkit, FONTS_DIR, metadata, OUTPUT_FILE, require

### Community 18 - "result.type.ts"
Cohesion: 0.40
Nodes (3): AppError, Result, ValidationError

### Community 19 - "components.type.ts"
Cohesion: 0.40
Nodes (4): ButtonProps, DropZoneProps, InputProps, PageHeaderProps

### Community 20 - "epub-editor.type.ts"
Cohesion: 0.40
Nodes (4): BuildPreviewHtmlOptions, EpubEditorFileItem, EpubFileCategory, EpubValidationError

## Knowledge Gaps
- **168 isolated node(s):** `DuplicateResourceItem`, `EpubMissingReference`, `EpubOptimizationPlan`, `EpubOptimizationSavingsBreakdown`, `EpubOptimizeOptions` (+163 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **11 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Logger` connect `utils/index.ts` to `epub-editor-state.svelte.ts`, `lib/types/index.ts`, `epub-source-parser.ts`, `epub-state.svelte.ts`, `image-bg-remove-ml.ts`, `pdf-splitter.ts`?**
  _High betweenness centrality (0.057) - this node is a cross-community bridge._
- **Why does `EpubImagesState` connect `image-bg-remove-ml.ts` to `utils/index.ts`, `epub-state.svelte.ts`?**
  _High betweenness centrality (0.027) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `devDependencies` to `scripts`, `tests-e2e/tsconfig.json`, `knip.json`, `@eslint/js`, `eslint-plugin-svelte`, `svelte-check`, `@sveltejs/adapter-cloudflare`, `@sveltejs/kit`, `@tailwindcss/vite`, `@types/node`, `typescript-eslint`, `vite`, `vitest`?**
  _High betweenness centrality (0.024) - this node is a cross-community bridge._
- **What connects `DuplicateResourceItem`, `EpubMissingReference`, `EpubOptimizationPlan` to the rest of the system?**
  _168 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `epub-editor-state.svelte.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06582952815829528 - nodes in this community are weakly interconnected._
- **Should `lib/types/index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07746478873239436 - nodes in this community are weakly interconnected._
- **Should `epub-source-parser.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.12217194570135746 - nodes in this community are weakly interconnected._