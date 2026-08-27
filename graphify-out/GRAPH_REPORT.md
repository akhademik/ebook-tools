# Graph Report - ebook-tools  (2026-08-27)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 660 nodes · 1308 edges · 43 communities (29 shown, 14 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `187ac32c`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- zip-writer.ts
- epub-book-ops.ts
- lib/types/index.ts
- epub-source-parser.ts
- scripts
- cleaner-engine.ts
- 🔄 2. Chu trình Chỉnh Sửa Code Chuẩn (Edit-Check-Test-Graphify Flow)
- image-bg-remove-ml.ts
- utils/index.ts
- preview-builder.ts
- epub-reader-parser.ts
- pdf-splitter.ts
- real-world-workflows.test.ts
- compilerOptions
- validator-engine.ts
- txt-parser.ts
- tests-e2e/tsconfig.json
- EpubImagesState
- devDependencies
- pdf-splitter.type.ts
- entry
- knip.json
- generate-fonts-meta.js
- result.type.ts
- eslint.config.js
- @eslint/js
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
1. `EpubEditorState` - 17 edges
2. `EpubImagesState` - 15 edges
3. `scripts` - 15 edges
4. `EpubMetadata` - 11 edges
5. `findFont()` - 11 edges
6. `compilerOptions` - 11 edges
7. `assembleEpubZip()` - 10 edges
8. `buildTocNcx()` - 10 edges
9. `parseTxtToChapters()` - 10 edges
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

## Communities (43 total, 14 thin omitted)

### Community 0 - "zip-writer.ts"
Cohesion: 0.08
Nodes (48): prepareChapters(), prepareMetadata(), resolveActiveFonts(), EPUB_CSS, getDynamicCss(), prepareFinalCss(), assembleEpubZip(), buildEpubBlob() (+40 more)

### Community 1 - "epub-book-ops.ts"
Cohesion: 0.08
Nodes (16): MAX_EPUB_FILE_SIZE, isDirty, BookMetadataDetails, extractBookMetadata(), findOpfPath(), rebuildEpubToc(), reorderOpfSpine(), TocChapterInfo (+8 more)

### Community 2 - "lib/types/index.ts"
Cohesion: 0.06
Nodes (21): MAX_IMAGE_FILE_SIZE, MAX_IMAGES_ZIP_FILE_SIZE, MAX_PDF_FILE_SIZE, MAX_TXT_FILE_SIZE, MAX_ZIP_FILE_SIZE, EpubState, EpubFontsState, EpubJacketState (+13 more)

### Community 3 - "epub-source-parser.ts"
Cohesion: 0.14
Nodes (37): analyzeChapterCandidates(), extractChunkBlocks(), extractMarkerTitle(), isDecorationOnly(), makeChapterMatcher(), pushIfLineStart(), scoreHeadingCandidate(), stripDecoration() (+29 more)

### Community 4 - "scripts"
Cohesion: 0.05
Nodes (41): @codemirror/commands, @codemirror/lang-css, @codemirror/lang-html, @codemirror/state, @codemirror/theme-one-dark, @codemirror/view, fontkit, @imgly/background-removal (+33 more)

### Community 5 - "cleaner-engine.ts"
Cohesion: 0.10
Nodes (28): analyzeEpub(), analyzeOptimizationPlan(), cleanEpub(), optimizeEpub(), getDuplicateWorker(), scanDuplicateResources(), computeDuplicateResources(), DuplicateDetectorWorkerRequest (+20 more)

### Community 6 - "🔄 2. Chu trình Chỉnh Sửa Code Chuẩn (Edit-Check-Test-Graphify Flow)"
Cohesion: 0.07
Nodes (27): 🔒 1. Quy tắc Quản lý Gói (Package Manager Rule), 🔄 2. Chu trình Chỉnh Sửa Code Chuẩn (Edit-Check-Test-Graphify Flow), 🔹 Bước 1: Viết / Sửa code, 🔹 Bước 2: Kiểm tra kiểu dữ liệu (Type Check), 🔹 Bước 3: Kiểm tra định dạng & cú pháp (Linting), 🔹 Bước 4: Quét mã rác & exports thừa (Dead Code Analysis), 🔹 Bước 5: Chạy Bộ Kiểm Thử Tự Động (Unit & Integration Tests), 🔹 Bước 6: Chạy Kiểm thử Giao diện Trình duyệt Thật (Playwright E2E) (+19 more)

### Community 7 - "image-bg-remove-ml.ts"
Cohesion: 0.15
Nodes (18): autoCropTransparentCanvas(), canvasToBlob(), cleanupWorkerAndRejectPending(), compressAndResizeCanvas(), getOrCreateWorker(), loadImage(), OrnamentProcessOptions, OrnamentProcessResult (+10 more)

### Community 8 - "utils/index.ts"
Cohesion: 0.12
Nodes (10): EpubMetadataState, isDebug(), isDebugEnabled, Logger, LogLevel, setDebug(), ensureEpubExt(), mockAnchor (+2 more)

### Community 9 - "preview-builder.ts"
Cohesion: 0.20
Nodes (17): categorizeFile(), exportEpubBlob(), extractLinkedCssPaths(), parseSpineOrder(), parseZipEntries(), deobfuscateAdobeFont(), deobfuscateIdpfFont(), isValidFontMagic() (+9 more)

### Community 10 - "epub-reader-parser.ts"
Cohesion: 0.16
Nodes (19): categorizeResource(), extractEpubMetadata(), findOpfPath(), parseEpub(), parseOpfManifestAndSpine(), EpubBook, EpubBookMetadata, EpubContainer (+11 more)

### Community 11 - "pdf-splitter.ts"
Cohesion: 0.13
Nodes (13): applyGrayscale(), cropCanvas(), formatEta(), loadPdfPreview(), pickConcurrency(), processPdfToJpg(), runWorker(), updateProgress() (+5 more)

### Community 12 - "real-world-workflows.test.ts"
Cohesion: 0.11
Nodes (8): validateEpub(), BOLD_ITALIC_PATTERNS, BOLD_PATTERNS, convertBrackets(), fixMarkdownZip(), ITALIC_PATTERNS, MarkdownFixerState, UNDERLINE_PATTERNS

### Community 13 - "compilerOptions"
Cohesion: 0.10
Nodes (20): playwright.config.ts, src/**/*, .svelte-kit/ambient.d.ts, .svelte-kit/non-ambient.d.ts, ./.svelte-kit/tsconfig.json, .svelte-kit/types/**/$types.d.ts, compilerOptions, allowJs (+12 more)

### Community 14 - "validator-engine.ts"
Cohesion: 0.20
Nodes (16): CssAndFontsRule, XhtmlPagesRule, NavigationRule, OpfPackageRule, SpineRule, StructureRule, ManifestItemInfo, ValidationCategory (+8 more)

### Community 15 - "txt-parser.ts"
Cohesion: 0.17
Nodes (11): applyInlineFormatting(), escapeRegExp(), getClosingTag(), getTxtParserWorker(), isIllustrationTag(), parseTxtToChapters(), parseTxtToChaptersAsync(), stripHtmlTags() (+3 more)

### Community 16 - "tests-e2e/tsconfig.json"
Cohesion: 0.11
Nodes (16): @playwright/test, @playwright/test, vitest/globals, compilerOptions, types, extends, include, ./**/* (+8 more)

### Community 18 - "devDependencies"
Cohesion: 0.15
Nodes (13): eslint, eslint-plugin-svelte, globals, devDependencies, eslint, eslint-plugin-svelte, globals, prettier (+5 more)

### Community 19 - "pdf-splitter.type.ts"
Cohesion: 0.24
Nodes (8): App, Window, PdfJsDocument, PdfJsLib, PdfJsPage, PdfJsViewport, PdfProgressInfo, ProcessPdfResult

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

## Knowledge Gaps
- **168 isolated node(s):** `EpubChapterFeatures`, `OrnamentItem`, `ParseTxtOptions`, `TocChapterInfo`, `ManifestItemInfo` (+163 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **14 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `EpubImagesState` connect `EpubImagesState` to `lib/types/index.ts`, `image-bg-remove-ml.ts`?**
  _High betweenness centrality (0.026) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `devDependencies` to `@tailwindcss/vite`, `@types/node`, `typescript`, `vite`, `scripts`, `vitest`, `tests-e2e/tsconfig.json`, `knip.json`, `@eslint/js`, `knip`, `prettier-plugin-svelte`, `svelte-check`, `@sveltejs/adapter-cloudflare`, `@sveltejs/kit`, `@sveltejs/vite-plugin-svelte`?**
  _High betweenness centrality (0.024) - this node is a cross-community bridge._
- **What connects `EpubChapterFeatures`, `OrnamentItem`, `ParseTxtOptions` to the rest of the system?**
  _168 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `zip-writer.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07869742198100407 - nodes in this community are weakly interconnected._
- **Should `epub-book-ops.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07597402597402597 - nodes in this community are weakly interconnected._
- **Should `lib/types/index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06289308176100629 - nodes in this community are weakly interconnected._
- **Should `epub-source-parser.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.13737373737373737 - nodes in this community are weakly interconnected._