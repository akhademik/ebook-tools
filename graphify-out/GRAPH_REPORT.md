# Graph Report - ebook-tools (2026-08-27)

## Corpus Check

- cluster-only mode — file stats not available

## Summary

- 661 nodes · 1358 edges · 46 communities (31 shown, 15 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness

- Built from commit: `fe8019fb`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)

- epub-source-parser.ts
- lib/types/index.ts
- utils/index.ts
- scripts
- epub-editor-state.svelte.ts
- EpubEditorState
- pdf-splitter.ts
- 🔄 2. Chu trình Chỉnh Sửa Code Chuẩn (Edit-Check-Test-Graphify Flow)
- real-world-workflows.test.ts
- image-bg-remove-ml.ts
- cleaner-engine.ts
- validator-engine.ts
- epub-reader-parser.ts
- compilerOptions
- tests-e2e/tsconfig.json
- EpubImagesState
- devDependencies
- entry
- knip.json
- crypto.ts
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
- @eslint/js
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
6. `getAssetDataUrl()` - 11 edges
7. `compilerOptions` - 11 edges
8. `assignSequentialChapterIds()` - 10 edges
9. `groupChaptersZip()` - 10 edges
10. `parseTxtToChapters()` - 10 edges

## Surprising Connections (you probably didn't know these)

- `types` --extends--> `@playwright/test` [EXTRACTED]
  tests-e2e/tsconfig.json → package.json
- `ignoreDependencies` --extends--> `tailwindcss` [EXTRACTED]
  knip.json → package.json
- `EpubSourceStateDependencies` --references--> `IllustrationImageItem` [EXTRACTED]
  src/lib/epub-packer/state/epub-source-state.svelte.ts → src/lib/types/epub.type.ts
- `BookMetadataDetails` --inherits--> `EpubMetadata` [EXTRACTED]
  src/lib/epub-editor/epub-book-ops.ts → src/lib/types/epub.type.ts
- `EpubBookMetadata` --inherits--> `EpubMetadata` [EXTRACTED]
  src/lib/epub/types/index.ts → src/lib/types/epub.type.ts

## Import Cycles

- None detected.

## Communities (46 total, 15 thin omitted)

### Community 0 - "epub-source-parser.ts"

Cohesion: 0.09
Nodes (48): analyzeChapterCandidates(), assignSequentialChapterIds(), extractChunkBlocks(), extractMarkerTitle(), isDecorationOnly(), makeChapterMatcher(), pushIfLineStart(), scoreHeadingCandidate() (+40 more)

### Community 1 - "lib/types/index.ts"

Cohesion: 0.09
Nodes (45): prepareChapters(), prepareMetadata(), resolveActiveFonts(), EPUB_CSS, getDynamicCss(), prepareFinalCss(), assembleEpubZip(), buildEpubBlob() (+37 more)

### Community 2 - "utils/index.ts"

Cohesion: 0.06
Nodes (24): MAX_IMAGE_FILE_SIZE, MAX_IMAGES_ZIP_FILE_SIZE, MAX_PDF_FILE_SIZE, MAX_TXT_FILE_SIZE, MAX_ZIP_FILE_SIZE, EpubFontsState, EpubJacketState, EpubMetadataState (+16 more)

### Community 3 - "scripts"

Cohesion: 0.05
Nodes (41): @codemirror/commands, @codemirror/lang-css, @codemirror/lang-html, @codemirror/state, @codemirror/theme-one-dark, @codemirror/view, fontkit, @imgly/background-removal (+33 more)

### Community 5 - "EpubEditorState"

Cohesion: 0.12
Nodes (19): categorizeFile(), exportEpubBlob(), extractLinkedCssPaths(), parseSpineOrder(), parseZipEntries(), deobfuscateAdobeFont(), deobfuscateIdpfFont(), isValidFontMagic() (+11 more)

### Community 6 - "pdf-splitter.ts"

Cohesion: 0.09
Nodes (22): App, Window, applyGrayscale(), cropCanvas(), formatEta(), loadPdfPreview(), pickConcurrency(), processPdfToJpg() (+14 more)

### Community 7 - "🔄 2. Chu trình Chỉnh Sửa Code Chuẩn (Edit-Check-Test-Graphify Flow)"

Cohesion: 0.07
Nodes (27): 🔒 1. Quy tắc Quản lý Gói (Package Manager Rule), 🔄 2. Chu trình Chỉnh Sửa Code Chuẩn (Edit-Check-Test-Graphify Flow), 🔹 Bước 1: Viết / Sửa code, 🔹 Bước 2: Kiểm tra kiểu dữ liệu (Type Check), 🔹 Bước 3: Kiểm tra định dạng & cú pháp (Linting), 🔹 Bước 4: Quét mã rác & exports thừa (Dead Code Analysis), 🔹 Bước 5: Chạy Bộ Kiểm Thử Tự Động (Unit & Integration Tests), 🔹 Bước 6: Chạy Kiểm thử Giao diện Trình duyệt Thật (Playwright E2E) (+19 more)

### Community 8 - "real-world-workflows.test.ts"

Cohesion: 0.14
Nodes (13): MAX_EPUB_FILE_SIZE, extractBookMetadata(), findOpfPath(), rebuildEpubToc(), reorderOpfSpine(), TocChapterInfo, updateBookMetadata(), cleanTextFormatting() (+5 more)

### Community 9 - "image-bg-remove-ml.ts"

Cohesion: 0.15
Nodes (18): autoCropTransparentCanvas(), canvasToBlob(), cleanupWorkerAndRejectPending(), compressAndResizeCanvas(), getOrCreateWorker(), loadImage(), OrnamentProcessOptions, OrnamentProcessResult (+10 more)

### Community 10 - "cleaner-engine.ts"

Cohesion: 0.15
Nodes (18): analyzeEpub(), analyzeOptimizationPlan(), cleanEpub(), optimizeEpub(), scanDuplicateResources(), extractCssUrls(), extractHtmlReferences(), formatByteSize() (+10 more)

### Community 11 - "validator-engine.ts"

Cohesion: 0.14
Nodes (17): CssAndFontsRule, XhtmlPagesRule, NavigationRule, OpfPackageRule, SpineRule, StructureRule, ManifestItemInfo, ValidationCategory (+9 more)

### Community 12 - "epub-reader-parser.ts"

Cohesion: 0.16
Nodes (19): categorizeResource(), extractEpubMetadata(), findOpfPath(), parseEpub(), parseOpfManifestAndSpine(), EpubBook, EpubBookMetadata, EpubContainer (+11 more)

### Community 13 - "compilerOptions"

Cohesion: 0.10
Nodes (20): playwright.config.ts, src/**/\*, .svelte-kit/ambient.d.ts, .svelte-kit/non-ambient.d.ts, ./.svelte-kit/tsconfig.json, .svelte-kit/types/**/$types.d.ts, compilerOptions, allowJs (+12 more)

### Community 14 - "tests-e2e/tsconfig.json"

Cohesion: 0.11
Nodes (16): @playwright/test, @playwright/test, vitest/globals, compilerOptions, types, extends, include, ./**/* (+8 more)

### Community 16 - "devDependencies"

Cohesion: 0.15
Nodes (13): eslint, globals, devDependencies, eslint, globals, prettier, svelte, @sveltejs/kit (+5 more)

### Community 17 - "entry"

Cohesion: 0.22
Nodes (9): entry, src/lib/epub-editor/epub-validator.ts, src/lib/epub-packer/epub-packer.ts, src/lib/epub-packer/parser/epub-source-parser.ts, src/lib/types/index.ts, src/lib/utils/index.ts, src/routes/**/+layout.{svelte,js,ts}, src/routes/**/+page.{svelte,js,ts} (+1 more)

### Community 18 - "knip.json"

Cohesion: 0.25
Nodes (7): ignoreDependencies, project, $schema, tailwindcss, src/**/\*.{js,ts,svelte}, tests/**/*.{js,ts}, tailwindcss

### Community 19 - "crypto.ts"

Cohesion: 0.64
Nodes (6): hashBytes(), sha1(), sha1Async(), sha1Bytes(), sha1Hex(), sha1HexAsync()

### Community 20 - "generate-fonts-meta.js"

Cohesion: 0.29
Nodes (6): files, fontkit, FONTS_DIR, metadata, OUTPUT_FILE, require

### Community 21 - "result.type.ts"

Cohesion: 0.40
Nodes (3): AppError, Result, ValidationError

### Community 22 - "components.type.ts"

Cohesion: 0.40
Nodes (4): ButtonProps, DropZoneProps, InputProps, PageHeaderProps

### Community 23 - "epub-editor.type.ts"

Cohesion: 0.40
Nodes (4): BuildPreviewHtmlOptions, EpubEditorFileItem, EpubFileCategory, EpubValidationError

### Community 24 - "markdown-fixer.type.ts"

Cohesion: 0.50
Nodes (3): ConvertedBracketsResult, FixMarkdownZipResult, ProcessedMarkdownFileRow

## Knowledge Gaps

- **162 isolated node(s):** `EpubChapterFeatures`, `OrnamentItem`, `EpubOptimizationSavingsBreakdown`, `EpubOptimizeOptions`, `EpubOptimizeReport` (+157 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **15 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions

_Questions this graph is uniquely positioned to answer:_

- **Why does `EpubImagesState` connect `EpubImagesState` to `image-bg-remove-ml.ts`, `utils/index.ts`?**
  _High betweenness centrality (0.026) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `devDependencies` to `@sveltejs/vite-plugin-svelte`, `@tailwindcss/vite`, `@types/node`, `scripts`, `typescript`, `vite`, `vitest`, `tests-e2e/tsconfig.json`, `knip.json`, `eslint-plugin-svelte`, `knip`, `prettier-plugin-svelte`, `svelte-check`, `@sveltejs/adapter-cloudflare`, `@eslint/js`?**
  _High betweenness centrality (0.024) - this node is a cross-community bridge._
- **Why does `EpubEditorState` connect `EpubEditorState` to `cleaner-engine.ts`, `epub-editor-state.svelte.ts`?**
  _High betweenness centrality (0.016) - this node is a cross-community bridge._
- **What connects `EpubChapterFeatures`, `OrnamentItem`, `EpubOptimizationSavingsBreakdown` to the rest of the system?**
  _162 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `epub-source-parser.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.09226594301221167 - nodes in this community are weakly interconnected._
- **Should `lib/types/index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.08509615384615385 - nodes in this community are weakly interconnected._
- **Should `utils/index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05877551020408163 - nodes in this community are weakly interconnected._
