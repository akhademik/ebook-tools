# Graph Report - ebook-tools  (2026-08-26)

## Corpus Check
- 105 files · ~70,999 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 606 nodes · 1273 edges · 30 communities (29 shown, 1 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `1d7a16a1`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- epub-editor.ts
- epub-source-parser.ts
- epub-packer.ts
- lib/types/index.ts
- image-bg-remove-ml.ts
- scripts
- devDependencies
- epub-reader-parser.ts
- epub-cleaner.ts
- compilerOptions
- 🔄 2. Chu trình Chỉnh Sửa Code Chuẩn (Edit-Check-Test-Graphify Flow)
- tests-e2e/tsconfig.json
- entry
- pdf-splitter.ts
- markdown-fixer.ts
- markdown-fixer-state.svelte.ts
- EpubSourceState
- tests/tsconfig.json
- utils/index.ts
- generate-fonts-meta.js
- result.type.ts
- Logger
- eslint.config.js

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
- `reorderOpfSpine()` --calls--> `resolveRelativePath()`  [EXTRACTED]
  src/lib/epub-editor/epub-book-ops.ts → src/lib/utils/path.ts
- `rebuildEpubToc()` --calls--> `resolveRelativePath()`  [EXTRACTED]
  src/lib/epub-editor/epub-book-ops.ts → src/lib/utils/path.ts
- `analyzeOptimizationPlan()` --calls--> `resolveRelativePath()`  [EXTRACTED]
  src/lib/epub-editor/epub-cleaner.ts → src/lib/utils/path.ts
- `optimizeEpub()` --calls--> `resolveRelativePath()`  [EXTRACTED]
  src/lib/epub-editor/epub-cleaner.ts → src/lib/utils/path.ts

## Import Cycles
- None detected.

## Communities (30 total, 1 thin omitted)

### Community 0 - "epub-editor.ts"
Cohesion: 0.12
Nodes (25): buildPreviewHtml(), categorizeFile(), deobfuscateAdobeFont(), deobfuscateIdpfFont(), escapeAttribute(), escapeRegExp(), exportEpubBlob(), extractLinkedCssPaths() (+17 more)

### Community 1 - "epub-source-parser.ts"
Cohesion: 0.10
Nodes (52): analyzeChapterCandidates(), extractChunkBlocks(), extractMarkerTitle(), isDecorationOnly(), makeChapterMatcher(), pushIfLineStart(), scoreHeadingCandidate(), stripDecoration() (+44 more)

### Community 2 - "epub-packer.ts"
Cohesion: 0.08
Nodes (42): BookMetadataDetails, extractBookMetadata(), findOpfPath(), rebuildEpubToc(), reorderOpfSpine(), TocChapterInfo, updateBookMetadata(), replaceOrCreateTag() (+34 more)

### Community 3 - "lib/types/index.ts"
Cohesion: 0.08
Nodes (10): isDirty, EPUB_CSS, AVAILABLE_FONTS, fontFiles, fontMetaMap, ButtonProps, DropZoneProps, InputProps (+2 more)

### Community 4 - "image-bg-remove-ml.ts"
Cohesion: 0.08
Nodes (19): EpubImagesState, CoverBlobItem, autoCropTransparentCanvas(), canvasToBlob(), compressAndResizeCanvas(), getOrCreateWorker(), loadImage(), OrnamentProcessOptions (+11 more)

### Community 5 - "scripts"
Cohesion: 0.05
Nodes (39): @codemirror/commands, @codemirror/lang-css, @codemirror/lang-html, @codemirror/state, @codemirror/theme-one-dark, @codemirror/view, fontkit, @imgly/background-removal (+31 more)

### Community 6 - "devDependencies"
Cohesion: 0.05
Nodes (37): eslint, @eslint/js, eslint-plugin-svelte, globals, devDependencies, eslint, @eslint/js, eslint-plugin-svelte (+29 more)

### Community 7 - "epub-reader-parser.ts"
Cohesion: 0.17
Nodes (18): categorizeResource(), extractEpubMetadata(), findOpfPath(), parseEpub(), parseOpfManifestAndSpine(), EpubBook, EpubBookMetadata, EpubContainer (+10 more)

### Community 8 - "epub-cleaner.ts"
Cohesion: 0.06
Nodes (35): analyzeEpub(), analyzeOptimizationPlan(), cleanEpub(), DuplicateResourceItem, EpubAnalysisResult, EpubCleanOptions, EpubCleanReport, EpubMissingReference (+27 more)

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
Cohesion: 0.22
Nodes (9): BOLD_ITALIC_PATTERNS, BOLD_PATTERNS, convertBrackets(), fixMarkdownZip(), ITALIC_PATTERNS, UNDERLINE_PATTERNS, ConvertedBracketsResult, FixMarkdownZipResult (+1 more)

### Community 15 - "markdown-fixer-state.svelte.ts"
Cohesion: 0.18
Nodes (4): MarkdownFixerState, PdfSplitterState, triggerDownload(), slugify()

### Community 16 - "EpubSourceState"
Cohesion: 0.20
Nodes (4): EpubState, EpubFontsState, EpubJacketState, EpubSourceState

### Community 17 - "tests/tsconfig.json"
Cohesion: 0.22
Nodes (8): vitest/globals, compilerOptions, types, extends, include, ./**/*, node, ../tsconfig.json

### Community 18 - "utils/index.ts"
Cohesion: 0.18
Nodes (7): EpubMetadataState, EpubSourceStateDependencies, IllustrationImageItem, Window, mockAnchor, mockDocument, mockPdfjsLib

### Community 19 - "generate-fonts-meta.js"
Cohesion: 0.29
Nodes (6): files, fontkit, FONTS_DIR, metadata, OUTPUT_FILE, require

### Community 21 - "result.type.ts"
Cohesion: 0.40
Nodes (3): AppError, Result, ValidationError

### Community 22 - "Logger"
Cohesion: 0.27
Nodes (7): ../src/lib/utils/logger.js?test=2, isDebug(), Logger, LogLevel, setDebug(), ensureEpubExt(), ensureZipExt()

## Knowledge Gaps
- **168 isolated node(s):** `gitignorePath`, `$schema`, `src/**/*.{js,ts,svelte}`, `tests/**/*.{js,ts}`, `src/routes/**/+page.{svelte,js,ts}` (+163 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Logger` connect `Logger` to `epub-editor.ts`, `epub-source-parser.ts`, `epub-packer.ts`, `lib/types/index.ts`, `image-bg-remove-ml.ts`, `epub-cleaner.ts`, `pdf-splitter.ts`, `markdown-fixer.ts`, `markdown-fixer-state.svelte.ts`, `utils/index.ts`?**
  _High betweenness centrality (0.062) - this node is a cross-community bridge._
- **Why does `EpubImagesState` connect `image-bg-remove-ml.ts` to `EpubSourceState`, `utils/index.ts`, `lib/types/index.ts`?**
  _High betweenness centrality (0.027) - this node is a cross-community bridge._
- **Why does `resolveRelativePath()` connect `epub-editor.ts` to `epub-cleaner.ts`, `epub-packer.ts`, `epub-reader-parser.ts`?**
  _High betweenness centrality (0.014) - this node is a cross-community bridge._
- **What connects `gitignorePath`, `$schema`, `src/**/*.{js,ts,svelte}` to the rest of the system?**
  _168 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `epub-editor.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.11829268292682926 - nodes in this community are weakly interconnected._
- **Should `epub-source-parser.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.09573412698412699 - nodes in this community are weakly interconnected._
- **Should `epub-packer.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.08397337429595494 - nodes in this community are weakly interconnected._