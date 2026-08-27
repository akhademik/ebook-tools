# Graph Report - ebook-tools  (2026-08-27)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 670 nodes · 1321 edges · 41 communities (27 shown, 14 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `5181db5b`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- zip-writer.ts
- epub-book-ops.ts
- utils/index.ts
- epub-source-parser.ts
- lib/types/index.ts
- scripts
- cleaner-engine.ts
- 🔄 2. Chu trình Chỉnh Sửa Code Chuẩn (Edit-Check-Test-Graphify Flow)
- real-world-workflows.test.ts
- validator-engine.ts
- image-bg-remove-ml.ts
- constants.ts
- preview-builder.ts
- epub-reader-parser.ts
- compilerOptions
- tests-e2e/tsconfig.json
- EpubImagesState
- devDependencies
- pdf-splitter.type.ts
- entry
- knip.json
- generate-fonts-meta.js
- eslint.config.js
- @types/node
- eslint-plugin-svelte
- knip
- prettier-plugin-svelte
- svelte-check
- @sveltejs/adapter-cloudflare
- @sveltejs/kit
- @sveltejs/vite-plugin-svelte
- @tailwindcss/vite
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
- `rebuildEpubToc()` --calls--> `buildNavXhtml()`  [EXTRACTED]
  src/lib/epub-editor/epub-book-ops.ts → src/lib/epub-packer/xml-builders/nav-builder.ts

## Import Cycles
- None detected.

## Communities (41 total, 14 thin omitted)

### Community 0 - "zip-writer.ts"
Cohesion: 0.08
Nodes (48): prepareChapters(), prepareMetadata(), resolveActiveFonts(), EPUB_CSS, getDynamicCss(), prepareFinalCss(), assembleEpubZip(), buildEpubBlob() (+40 more)

### Community 1 - "epub-book-ops.ts"
Cohesion: 0.08
Nodes (16): MAX_EPUB_FILE_SIZE, isDirty, BookMetadataDetails, extractBookMetadata(), findOpfPath(), rebuildEpubToc(), reorderOpfSpine(), TocChapterInfo (+8 more)

### Community 2 - "utils/index.ts"
Cohesion: 0.06
Nodes (24): applyGrayscale(), cropCanvas(), formatEta(), loadPdfPreview(), pickConcurrency(), processPdfToJpg(), runWorker(), updateProgress() (+16 more)

### Community 3 - "epub-source-parser.ts"
Cohesion: 0.14
Nodes (37): analyzeChapterCandidates(), extractChunkBlocks(), extractMarkerTitle(), isDecorationOnly(), makeChapterMatcher(), pushIfLineStart(), scoreHeadingCandidate(), stripDecoration() (+29 more)

### Community 4 - "lib/types/index.ts"
Cohesion: 0.07
Nodes (15): EpubState, ButtonProps, DropZoneProps, InputProps, PageHeaderProps, BuildPreviewHtmlOptions, EpubEditorFileItem, EpubFileCategory (+7 more)

### Community 5 - "scripts"
Cohesion: 0.05
Nodes (41): @codemirror/commands, @codemirror/lang-css, @codemirror/lang-html, @codemirror/state, @codemirror/theme-one-dark, @codemirror/view, fontkit, @imgly/background-removal (+33 more)

### Community 6 - "cleaner-engine.ts"
Cohesion: 0.10
Nodes (28): analyzeEpub(), analyzeOptimizationPlan(), cleanEpub(), optimizeEpub(), getDuplicateWorker(), scanDuplicateResources(), computeDuplicateResources(), DuplicateDetectorWorkerRequest (+20 more)

### Community 7 - "🔄 2. Chu trình Chỉnh Sửa Code Chuẩn (Edit-Check-Test-Graphify Flow)"
Cohesion: 0.07
Nodes (27): 🔒 1. Quy tắc Quản lý Gói (Package Manager Rule), 🔄 2. Chu trình Chỉnh Sửa Code Chuẩn (Edit-Check-Test-Graphify Flow), 🔹 Bước 1: Viết / Sửa code, 🔹 Bước 2: Kiểm tra kiểu dữ liệu (Type Check), 🔹 Bước 3: Kiểm tra định dạng & cú pháp (Linting), 🔹 Bước 4: Quét mã rác & exports thừa (Dead Code Analysis), 🔹 Bước 5: Chạy Bộ Kiểm Thử Tự Động (Unit & Integration Tests), 🔹 Bước 6: Chạy Kiểm thử Giao diện Trình duyệt Thật (Playwright E2E) (+19 more)

### Community 8 - "real-world-workflows.test.ts"
Cohesion: 0.11
Nodes (17): applyInlineFormatting(), escapeRegExp(), getClosingTag(), getTxtParserWorker(), isIllustrationTag(), parseTxtToChapters(), parseTxtToChaptersAsync(), stripHtmlTags() (+9 more)

### Community 9 - "validator-engine.ts"
Cohesion: 0.14
Nodes (17): CssAndFontsRule, XhtmlPagesRule, NavigationRule, OpfPackageRule, SpineRule, StructureRule, ManifestItemInfo, ValidationCategory (+9 more)

### Community 10 - "image-bg-remove-ml.ts"
Cohesion: 0.15
Nodes (18): autoCropTransparentCanvas(), canvasToBlob(), cleanupWorkerAndRejectPending(), compressAndResizeCanvas(), getOrCreateWorker(), loadImage(), OrnamentProcessOptions, OrnamentProcessResult (+10 more)

### Community 11 - "constants.ts"
Cohesion: 0.11
Nodes (11): MAX_IMAGE_FILE_SIZE, MAX_IMAGES_ZIP_FILE_SIZE, MAX_PDF_FILE_SIZE, MAX_TXT_FILE_SIZE, MAX_ZIP_FILE_SIZE, EpubFontsState, EpubJacketState, EpubMetadataState (+3 more)

### Community 12 - "preview-builder.ts"
Cohesion: 0.19
Nodes (17): categorizeFile(), exportEpubBlob(), extractLinkedCssPaths(), parseSpineOrder(), parseZipEntries(), deobfuscateAdobeFont(), deobfuscateIdpfFont(), isValidFontMagic() (+9 more)

### Community 13 - "epub-reader-parser.ts"
Cohesion: 0.16
Nodes (19): categorizeResource(), extractEpubMetadata(), findOpfPath(), parseEpub(), parseOpfManifestAndSpine(), EpubBook, EpubBookMetadata, EpubContainer (+11 more)

### Community 14 - "compilerOptions"
Cohesion: 0.10
Nodes (20): playwright.config.ts, src/**/*, .svelte-kit/ambient.d.ts, .svelte-kit/non-ambient.d.ts, ./.svelte-kit/tsconfig.json, .svelte-kit/types/**/$types.d.ts, compilerOptions, allowJs (+12 more)

### Community 15 - "tests-e2e/tsconfig.json"
Cohesion: 0.11
Nodes (16): @playwright/test, @playwright/test, vitest/globals, compilerOptions, types, extends, include, ./**/* (+8 more)

### Community 17 - "devDependencies"
Cohesion: 0.15
Nodes (13): eslint, @eslint/js, globals, devDependencies, eslint, @eslint/js, globals, prettier (+5 more)

### Community 18 - "pdf-splitter.type.ts"
Cohesion: 0.22
Nodes (9): App, Window, PdfJsDocument, PdfJsLib, PdfJsPage, PdfJsViewport, PdfPreviewPage, PdfProgressInfo (+1 more)

### Community 19 - "entry"
Cohesion: 0.22
Nodes (9): entry, src/lib/epub-editor/epub-validator.ts, src/lib/epub-packer/epub-packer.ts, src/lib/epub-packer/parser/epub-source-parser.ts, src/lib/types/index.ts, src/lib/utils/index.ts, src/routes/**/+layout.{svelte,js,ts}, src/routes/**/+page.{svelte,js,ts} (+1 more)

### Community 20 - "knip.json"
Cohesion: 0.25
Nodes (7): ignoreDependencies, project, $schema, tailwindcss, src/**/*.{js,ts,svelte}, tests/**/*.{js,ts}, tailwindcss

### Community 21 - "generate-fonts-meta.js"
Cohesion: 0.29
Nodes (6): files, fontkit, FONTS_DIR, metadata, OUTPUT_FILE, require

## Knowledge Gaps
- **172 isolated node(s):** `EpubChapterFeatures`, `OrnamentItem`, `ParseTxtOptions`, `TocChapterInfo`, `OrnamentProcessOptions` (+167 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **14 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `EpubImagesState` connect `EpubImagesState` to `image-bg-remove-ml.ts`, `constants.ts`?**
  _High betweenness centrality (0.032) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `devDependencies` to `typescript`, `vite`, `vitest`, `scripts`, `tests-e2e/tsconfig.json`, `knip.json`, `@types/node`, `eslint-plugin-svelte`, `knip`, `prettier-plugin-svelte`, `svelte-check`, `@sveltejs/adapter-cloudflare`, `@sveltejs/kit`, `@sveltejs/vite-plugin-svelte`, `@tailwindcss/vite`?**
  _High betweenness centrality (0.024) - this node is a cross-community bridge._
- **What connects `EpubChapterFeatures`, `OrnamentItem`, `ParseTxtOptions` to the rest of the system?**
  _172 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `zip-writer.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07869742198100407 - nodes in this community are weakly interconnected._
- **Should `epub-book-ops.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07609427609427609 - nodes in this community are weakly interconnected._
- **Should `utils/index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.058823529411764705 - nodes in this community are weakly interconnected._
- **Should `epub-source-parser.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.13737373737373737 - nodes in this community are weakly interconnected._