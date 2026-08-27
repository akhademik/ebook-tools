# Graph Report - ebook-tools  (2026-08-27)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 666 nodes · 1316 edges · 46 communities (30 shown, 16 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `8ee02b81`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- lib/types/index.ts
- epub-source-parser.ts
- utils/index.ts
- scripts
- cleaner-engine.ts
- 🔄 2. Chu trình Chỉnh Sửa Code Chuẩn (Edit-Check-Test-Graphify Flow)
- image-bg-remove-ml.ts
- epub-state.svelte.ts
- validator-engine.ts
- pdf-splitter.ts
- preview-builder.ts
- epub-reader-parser.ts
- logger.ts
- constants.ts
- compilerOptions
- tests-e2e/tsconfig.json
- EpubEditorState
- EpubImagesState
- devDependencies
- pdf-splitter.type.ts
- entry
- knip.json
- generate-fonts-meta.js
- result.type.ts
- components.type.ts
- epub-editor.type.ts
- markdown-fixer.type.ts
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
1. `EpubEditorState` - 18 edges
2. `EpubImagesState` - 17 edges
3. `scripts` - 15 edges
4. `EpubMetadata` - 11 edges
5. `findFont()` - 11 edges
6. `compilerOptions` - 11 edges
7. `PdfSplitterState` - 10 edges
8. `assembleEpubZip()` - 10 edges
9. `buildTocNcx()` - 10 edges
10. `groupChaptersZip()` - 10 edges

## Surprising Connections (you probably didn't know these)
- `types` --extends--> `@playwright/test`  [EXTRACTED]
  tests-e2e/tsconfig.json → package.json
- `ignoreDependencies` --extends--> `tailwindcss`  [EXTRACTED]
  knip.json → package.json
- `BookMetadataDetails` --inherits--> `EpubMetadata`  [EXTRACTED]
  src/lib/epub-editor/epub-book-ops.ts → src/lib/types/epub.type.ts
- `EpubBookMetadata` --inherits--> `EpubMetadata`  [EXTRACTED]
  src/lib/epub/types/index.ts → src/lib/types/epub.type.ts
- `prepareChapters()` --calls--> `assignSequentialChapterIds()`  [EXTRACTED]
  src/lib/epub-packer/builders/asset-builder.ts → src/lib/epub-packer/parser/epub-chapter-utils.ts

## Import Cycles
- None detected.

## Communities (46 total, 16 thin omitted)

### Community 0 - "lib/types/index.ts"
Cohesion: 0.09
Nodes (45): prepareChapters(), prepareMetadata(), resolveActiveFonts(), EPUB_CSS, getDynamicCss(), prepareFinalCss(), assembleEpubZip(), buildEpubBlob() (+37 more)

### Community 1 - "epub-source-parser.ts"
Cohesion: 0.09
Nodes (50): analyzeChapterCandidates(), assignSequentialChapterIds(), extractChunkBlocks(), extractMarkerTitle(), isDecorationOnly(), makeChapterMatcher(), pushIfLineStart(), scoreHeadingCandidate() (+42 more)

### Community 2 - "utils/index.ts"
Cohesion: 0.08
Nodes (22): MAX_EPUB_FILE_SIZE, isDirty, BookMetadataDetails, extractBookMetadata(), findOpfPath(), rebuildEpubToc(), reorderOpfSpine(), TocChapterInfo (+14 more)

### Community 3 - "scripts"
Cohesion: 0.05
Nodes (41): @codemirror/commands, @codemirror/lang-css, @codemirror/lang-html, @codemirror/state, @codemirror/theme-one-dark, @codemirror/view, fontkit, @imgly/background-removal (+33 more)

### Community 4 - "cleaner-engine.ts"
Cohesion: 0.10
Nodes (28): analyzeEpub(), analyzeOptimizationPlan(), cleanEpub(), optimizeEpub(), getDuplicateWorker(), scanDuplicateResources(), computeDuplicateResources(), DuplicateDetectorWorkerRequest (+20 more)

### Community 5 - "🔄 2. Chu trình Chỉnh Sửa Code Chuẩn (Edit-Check-Test-Graphify Flow)"
Cohesion: 0.07
Nodes (27): 🔒 1. Quy tắc Quản lý Gói (Package Manager Rule), 🔄 2. Chu trình Chỉnh Sửa Code Chuẩn (Edit-Check-Test-Graphify Flow), 🔹 Bước 1: Viết / Sửa code, 🔹 Bước 2: Kiểm tra kiểu dữ liệu (Type Check), 🔹 Bước 3: Kiểm tra định dạng & cú pháp (Linting), 🔹 Bước 4: Quét mã rác & exports thừa (Dead Code Analysis), 🔹 Bước 5: Chạy Bộ Kiểm Thử Tự Động (Unit & Integration Tests), 🔹 Bước 6: Chạy Kiểm thử Giao diện Trình duyệt Thật (Playwright E2E) (+19 more)

### Community 6 - "image-bg-remove-ml.ts"
Cohesion: 0.14
Nodes (18): autoCropTransparentCanvas(), canvasToBlob(), cleanupWorkerAndRejectPending(), compressAndResizeCanvas(), getOrCreateWorker(), loadImage(), OrnamentProcessOptions, OrnamentProcessResult (+10 more)

### Community 8 - "validator-engine.ts"
Cohesion: 0.14
Nodes (17): CssAndFontsRule, XhtmlPagesRule, NavigationRule, OpfPackageRule, SpineRule, StructureRule, ManifestItemInfo, ValidationCategory (+9 more)

### Community 9 - "pdf-splitter.ts"
Cohesion: 0.13
Nodes (13): applyGrayscale(), cropCanvas(), formatEta(), loadPdfPreview(), pickConcurrency(), processPdfToJpg(), runWorker(), updateProgress() (+5 more)

### Community 10 - "preview-builder.ts"
Cohesion: 0.20
Nodes (17): categorizeFile(), exportEpubBlob(), extractLinkedCssPaths(), parseSpineOrder(), parseZipEntries(), deobfuscateAdobeFont(), deobfuscateIdpfFont(), isValidFontMagic() (+9 more)

### Community 11 - "epub-reader-parser.ts"
Cohesion: 0.16
Nodes (19): categorizeResource(), extractEpubMetadata(), findOpfPath(), parseEpub(), parseOpfManifestAndSpine(), EpubBook, EpubBookMetadata, EpubContainer (+11 more)

### Community 12 - "logger.ts"
Cohesion: 0.11
Nodes (10): EpubMetadataState, isDebug(), isDebugEnabled, Logger, LogLevel, setDebug(), ensureEpubExt(), mockAnchor (+2 more)

### Community 13 - "constants.ts"
Cohesion: 0.13
Nodes (9): MAX_IMAGE_FILE_SIZE, MAX_IMAGES_ZIP_FILE_SIZE, MAX_PDF_FILE_SIZE, MAX_TXT_FILE_SIZE, MAX_ZIP_FILE_SIZE, EpubFontsState, EpubJacketState, EpubSourceState (+1 more)

### Community 14 - "compilerOptions"
Cohesion: 0.10
Nodes (20): playwright.config.ts, src/**/*, .svelte-kit/ambient.d.ts, .svelte-kit/non-ambient.d.ts, ./.svelte-kit/tsconfig.json, .svelte-kit/types/**/$types.d.ts, compilerOptions, allowJs (+12 more)

### Community 15 - "tests-e2e/tsconfig.json"
Cohesion: 0.11
Nodes (16): @playwright/test, @playwright/test, vitest/globals, compilerOptions, types, extends, include, ./**/* (+8 more)

### Community 18 - "devDependencies"
Cohesion: 0.15
Nodes (13): eslint, @eslint/js, globals, devDependencies, eslint, @eslint/js, globals, prettier (+5 more)

### Community 19 - "pdf-splitter.type.ts"
Cohesion: 0.22
Nodes (9): App, Window, PdfJsDocument, PdfJsLib, PdfJsPage, PdfJsViewport, PdfPreviewPage, PdfProgressInfo (+1 more)

### Community 20 - "entry"
Cohesion: 0.22
Nodes (9): entry, src/lib/epub-editor/epub-validator.ts, src/lib/epub-packer/epub-packer.ts, src/lib/epub-packer/parser/epub-source-parser.ts, src/lib/types/index.ts, src/lib/utils/index.ts, src/routes/**/+layout.{svelte,js,ts}, src/routes/**/+page.{svelte,js,ts} (+1 more)

### Community 21 - "knip.json"
Cohesion: 0.25
Nodes (7): ignoreDependencies, project, $schema, tailwindcss, src/**/*.{js,ts,svelte}, tests/**/*.{js,ts}, tailwindcss

### Community 22 - "generate-fonts-meta.js"
Cohesion: 0.29
Nodes (6): files, fontkit, FONTS_DIR, metadata, OUTPUT_FILE, require

### Community 23 - "result.type.ts"
Cohesion: 0.40
Nodes (3): AppError, Result, ValidationError

### Community 24 - "components.type.ts"
Cohesion: 0.40
Nodes (4): ButtonProps, DropZoneProps, InputProps, PageHeaderProps

### Community 25 - "epub-editor.type.ts"
Cohesion: 0.40
Nodes (4): BuildPreviewHtmlOptions, EpubEditorFileItem, EpubFileCategory, EpubValidationError

### Community 26 - "markdown-fixer.type.ts"
Cohesion: 0.50
Nodes (3): ConvertedBracketsResult, FixMarkdownZipResult, ProcessedMarkdownFileRow

## Knowledge Gaps
- **169 isolated node(s):** `EpubChapterFeatures`, `OrnamentItem`, `ParseTxtOptions`, `ParseTxtWorkerRequest`, `ParseTxtWorkerResponse` (+164 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **16 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `EpubImagesState` connect `EpubImagesState` to `constants.ts`, `image-bg-remove-ml.ts`?**
  _High betweenness centrality (0.032) - this node is a cross-community bridge._
- **Why does `EpubEditorState` connect `EpubEditorState` to `utils/index.ts`?**
  _High betweenness centrality (0.030) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `devDependencies` to `@sveltejs/adapter-cloudflare`, `@sveltejs/kit`, `@sveltejs/vite-plugin-svelte`, `scripts`, `@tailwindcss/vite`, `@types/node`, `typescript`, `vite`, `vitest`, `tests-e2e/tsconfig.json`, `knip.json`, `eslint-plugin-svelte`, `knip`, `prettier-plugin-svelte`, `svelte-check`?**
  _High betweenness centrality (0.024) - this node is a cross-community bridge._
- **What connects `EpubChapterFeatures`, `OrnamentItem`, `ParseTxtOptions` to the rest of the system?**
  _169 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `lib/types/index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.08605769230769231 - nodes in this community are weakly interconnected._
- **Should `epub-source-parser.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.09265536723163842 - nodes in this community are weakly interconnected._
- **Should `utils/index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07692307692307693 - nodes in this community are weakly interconnected._