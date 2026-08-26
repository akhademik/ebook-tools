# Graph Report - ebook-tools  (2026-08-26)

## Corpus Check
- 110 files · ~71,551 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 614 nodes · 1321 edges · 44 communities (30 shown, 14 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `83853677`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- epub-editor-state.svelte.ts
- epub-source-parser.ts
- zip-writer.ts
- lib/types/index.ts
- image-bg-remove-ml.ts
- dependencies
- devDependencies
- epub-reader-parser.ts
- epub-validator.ts
- compilerOptions
- 🔄 2. Chu trình Chỉnh Sửa Code Chuẩn (Edit-Check-Test-Graphify Flow)
- tests-e2e/tsconfig.json
- entry
- pdf-splitter.ts
- markdown-fixer.ts
- markdown-fixer-state.svelte.ts
- scripts
- tests/tsconfig.json
- utils/index.ts
- generate-fonts-meta.js
- result.type.ts
- ../src/lib/utils/logger.js?test=2
- eslint.config.js
- package.json
- PdfSplitterState
- eslint
- @eslint/js
- knip
- @playwright/test
- svelte
- svelte-check
- @sveltejs/kit
- @sveltejs/vite-plugin-svelte
- tailwindcss
- typescript
- vite
- vitest

## God Nodes (most connected - your core abstractions)
1. `Logger` - 24 edges
2. `escapeXml()` - 20 edges
3. `EpubEditorState` - 17 edges
4. `EpubImagesState` - 17 edges
5. `resolveRelativePath()` - 16 edges
6. `scripts` - 13 edges
7. `processOrnamentImage()` - 12 edges
8. `getAssetDataUrl()` - 11 edges
9. `buildEpubBlob()` - 11 edges
10. `parseTxtToChapters()` - 11 edges

## Surprising Connections (you probably didn't know these)
- `replaceOrCreateTag()` --calls--> `escapeXml()`  [EXTRACTED]
  src/lib/epub-editor/epub-book-ops.ts → src/lib/utils/xml.ts
- `BookMetadataDetails` --inherits--> `EpubMetadata`  [EXTRACTED]
  src/lib/epub-editor/epub-book-ops.ts → src/lib/types/epub.type.ts
- `updateBookMetadata()` --calls--> `escapeXml()`  [EXTRACTED]
  src/lib/epub-editor/epub-book-ops.ts → src/lib/utils/xml.ts
- `rebuildEpubToc()` --calls--> `buildNavXhtml()`  [EXTRACTED]
  src/lib/epub-editor/epub-book-ops.ts → src/lib/epub-packer/xml-builders/nav-builder.ts
- `rebuildEpubToc()` --calls--> `buildTocNcx()`  [EXTRACTED]
  src/lib/epub-editor/epub-book-ops.ts → src/lib/epub-packer/xml-builders/nav-builder.ts

## Import Cycles
- None detected.

## Communities (44 total, 14 thin omitted)

### Community 0 - "epub-editor-state.svelte.ts"
Cohesion: 0.05
Nodes (55): isDirty, BookMetadataDetails, extractBookMetadata(), findOpfPath(), rebuildEpubToc(), reorderOpfSpine(), TocChapterInfo, updateBookMetadata() (+47 more)

### Community 1 - "epub-source-parser.ts"
Cohesion: 0.09
Nodes (47): analyzeChapterCandidates(), assignSequentialChapterIds(), extractChunkBlocks(), extractMarkerTitle(), isDecorationOnly(), makeChapterMatcher(), pushIfLineStart(), scoreHeadingCandidate() (+39 more)

### Community 2 - "zip-writer.ts"
Cohesion: 0.09
Nodes (44): prepareChapters(), prepareMetadata(), resolveActiveFonts(), getDynamicCss(), prepareFinalCss(), assembleEpubZip(), buildEpubBlob(), EpubSourceStateDependencies (+36 more)

### Community 3 - "lib/types/index.ts"
Cohesion: 0.09
Nodes (12): EPUB_CSS, EpubState, EpubFontsState, EpubJacketState, EpubMetadataState, AVAILABLE_FONTS, fontFiles, fontMetaMap (+4 more)

### Community 4 - "image-bg-remove-ml.ts"
Cohesion: 0.09
Nodes (19): EpubImagesState, CoverBlobItem, autoCropTransparentCanvas(), canvasToBlob(), compressAndResizeCanvas(), getOrCreateWorker(), loadImage(), OrnamentProcessOptions (+11 more)

### Community 5 - "dependencies"
Cohesion: 0.10
Nodes (21): @codemirror/commands, @codemirror/lang-css, @codemirror/lang-html, @codemirror/state, @codemirror/theme-one-dark, @codemirror/view, fontkit, @imgly/background-removal (+13 more)

### Community 6 - "devDependencies"
Cohesion: 0.15
Nodes (13): eslint-plugin-svelte, globals, devDependencies, eslint-plugin-svelte, globals, @sveltejs/adapter-cloudflare, @tailwindcss/vite, @types/node (+5 more)

### Community 7 - "epub-reader-parser.ts"
Cohesion: 0.17
Nodes (18): categorizeResource(), extractEpubMetadata(), findOpfPath(), parseEpub(), parseOpfManifestAndSpine(), EpubBook, EpubBookMetadata, EpubContainer (+10 more)

### Community 8 - "epub-validator.ts"
Cohesion: 0.10
Nodes (17): CssAndFontsRule, DEFAULT_VALIDATION_RULES, ManifestItemInfo, NavigationRule, OpfPackageRule, SpineRule, StructureRule, validateEpub() (+9 more)

### Community 9 - "compilerOptions"
Cohesion: 0.10
Nodes (20): playwright.config.ts, src/**/*, .svelte-kit/ambient.d.ts, .svelte-kit/non-ambient.d.ts, ./.svelte-kit/tsconfig.json, .svelte-kit/types/**/$types.d.ts, compilerOptions, allowJs (+12 more)

### Community 10 - "🔄 2. Chu trình Chỉnh Sửa Code Chuẩn (Edit-Check-Test-Graphify Flow)"
Cohesion: 0.07
Nodes (27): 🔒 1. Quy tắc Quản lý Gói (Package Manager Rule), 🔄 2. Chu trình Chỉnh Sửa Code Chuẩn (Edit-Check-Test-Graphify Flow), 🔹 Bước 1: Viết / Sửa code, 🔹 Bước 2: Kiểm tra kiểu dữ liệu (Type Check), 🔹 Bước 3: Kiểm tra định dạng & cú pháp (Linting), 🔹 Bước 4: Quét mã rác & exports thừa (Dead Code Analysis), 🔹 Bước 5: Chạy Bộ Kiểm Thử Tự Động (Unit & Integration Tests), 🔹 Bước 6: Chạy Kiểm thử Giao diện Trình duyệt Thật (Playwright E2E) (+19 more)

### Community 11 - "tests-e2e/tsconfig.json"
Cohesion: 0.17
Nodes (8): @playwright/test, compilerOptions, types, extends, include, ./**/*, node, ../tsconfig.json

### Community 12 - "entry"
Cohesion: 0.12
Nodes (15): entry, ignoreDependencies, project, $schema, src/**/*.{js,ts,svelte}, src/lib/epub-editor/epub-validator.ts, src/lib/epub-packer/epub-packer.ts, src/lib/epub-packer/parser/epub-source-parser.ts (+7 more)

### Community 13 - "pdf-splitter.ts"
Cohesion: 0.14
Nodes (19): applyGrayscale(), cropCanvas(), formatEta(), loadPdfPreview(), pickConcurrency(), processPdfToJpg(), runWorker(), updateProgress() (+11 more)

### Community 14 - "markdown-fixer.ts"
Cohesion: 0.24
Nodes (9): BOLD_ITALIC_PATTERNS, BOLD_PATTERNS, convertBrackets(), fixMarkdownZip(), ITALIC_PATTERNS, UNDERLINE_PATTERNS, ConvertedBracketsResult, FixMarkdownZipResult (+1 more)

### Community 15 - "markdown-fixer-state.svelte.ts"
Cohesion: 0.19
Nodes (5): MarkdownFixerState, triggerDownload(), ensureEpubExt(), ensureZipExt(), slugify()

### Community 16 - "scripts"
Cohesion: 0.15
Nodes (13): scripts, build, check, dev, knip, lint, prebuild, prepare (+5 more)

### Community 17 - "tests/tsconfig.json"
Cohesion: 0.22
Nodes (8): vitest/globals, compilerOptions, types, extends, include, ./**/*, node, ../tsconfig.json

### Community 18 - "utils/index.ts"
Cohesion: 0.29
Nodes (4): Window, mockAnchor, mockDocument, mockPdfjsLib

### Community 19 - "generate-fonts-meta.js"
Cohesion: 0.29
Nodes (6): files, fontkit, FONTS_DIR, metadata, OUTPUT_FILE, require

### Community 21 - "result.type.ts"
Cohesion: 0.40
Nodes (3): AppError, Result, ValidationError

### Community 22 - "../src/lib/utils/logger.js?test=2"
Cohesion: 0.47
Nodes (4): ../src/lib/utils/logger.js?test=2, isDebug(), LogLevel, setDebug()

### Community 27 - "package.json"
Cohesion: 0.33
Nodes (5): name, packageManager, private, type, version

## Knowledge Gaps
- **168 isolated node(s):** `gitignorePath`, `$schema`, `src/**/*.{js,ts,svelte}`, `tests/**/*.{js,ts}`, `src/routes/**/+page.{svelte,js,ts}` (+163 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **14 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Logger` connect `epub-source-parser.ts` to `epub-editor-state.svelte.ts`, `zip-writer.ts`, `lib/types/index.ts`, `image-bg-remove-ml.ts`, `pdf-splitter.ts`, `markdown-fixer.ts`, `markdown-fixer-state.svelte.ts`, `../src/lib/utils/logger.js?test=2`?**
  _High betweenness centrality (0.059) - this node is a cross-community bridge._
- **Why does `EpubImagesState` connect `image-bg-remove-ml.ts` to `lib/types/index.ts`?**
  _High betweenness centrality (0.027) - this node is a cross-community bridge._
- **Why does `resolveRelativePath()` connect `epub-editor-state.svelte.ts` to `epub-validator.ts`, `epub-reader-parser.ts`?**
  _High betweenness centrality (0.014) - this node is a cross-community bridge._
- **What connects `gitignorePath`, `$schema`, `src/**/*.{js,ts,svelte}` to the rest of the system?**
  _168 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `epub-editor-state.svelte.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05147563486616335 - nodes in this community are weakly interconnected._
- **Should `epub-source-parser.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.09358178053830228 - nodes in this community are weakly interconnected._
- **Should `zip-writer.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.088841882601798 - nodes in this community are weakly interconnected._