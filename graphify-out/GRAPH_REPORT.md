# Graph Report - ebook-tools  (2026-08-23)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 562 nodes · 1094 edges · 30 communities (27 shown, 3 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `f0830046`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- epub-editor-state.svelte.ts
- epub-source-parser.ts
- epub-packer.ts
- lib/types/index.ts
- image-bg-remove-ml.ts
- scripts
- devDependencies
- epub-reader-parser.ts
- epub-validator.ts
- compilerOptions
- epub.type.ts
- @playwright/test
- entry
- pdf-splitter-state.svelte.ts
- markdown-fixer.ts
- PdfSplitterState
- state/index.ts
- pdf-splitter.type.ts
- utils/index.ts
- generate-fonts-meta.js
- result.type.ts
- Logger
- eslint.config.js
- LogLevel

## God Nodes (most connected - your core abstractions)
1. `EpubEditorState` - 17 edges
2. `EpubImagesState` - 15 edges
3. `resolveRelativePath()` - 15 edges
4. `scripts` - 13 edges
5. `processOrnamentImage()` - 12 edges
6. `getAssetDataUrl()` - 11 edges
7. `buildEpubBlob()` - 11 edges
8. `compilerOptions` - 11 edges
9. `buildPreviewHtml()` - 10 edges
10. `assignSequentialChapterIds()` - 10 edges

## Surprising Connections (you probably didn't know these)
- `types` --extends--> `@playwright/test`  [EXTRACTED]
  tests-e2e/tsconfig.json → package.json
- `ignoreDependencies` --extends--> `tailwindcss`  [EXTRACTED]
  knip.json → package.json
- `rebuildEpubToc()` --calls--> `resolveRelativePath()`  [EXTRACTED]
  src/lib/epub-editor/epub-book-ops.ts → src/lib/utils/path.ts
- `reorderOpfSpine()` --calls--> `resolveRelativePath()`  [EXTRACTED]
  src/lib/epub-editor/epub-book-ops.ts → src/lib/utils/path.ts
- `parseOpfManifestAndSpine()` --calls--> `resolveRelativePath()`  [EXTRACTED]
  src/lib/epub/parser/epub-reader-parser.ts → src/lib/utils/path.ts

## Import Cycles
- None detected.

## Communities (30 total, 3 thin omitted)

### Community 0 - "epub-editor-state.svelte.ts"
Cohesion: 0.08
Nodes (40): BookMetadataDetails, analyzeEpub(), analyzeOptimizationPlan(), cleanEpub(), DuplicateResourceItem, EpubAnalysisResult, EpubCleanOptions, EpubCleanReport (+32 more)

### Community 1 - "epub-source-parser.ts"
Cohesion: 0.10
Nodes (41): analyzeChapterCandidates(), assignSequentialChapterIds(), extractChunkBlocks(), extractMarkerTitle(), isDecorationOnly(), makeChapterMatcher(), pushIfLineStart(), scoreHeadingCandidate() (+33 more)

### Community 2 - "epub-packer.ts"
Cohesion: 0.09
Nodes (35): extractBookMetadata(), findOpfPath(), rebuildEpubToc(), reorderOpfSpine(), TocChapterInfo, updateBookMetadata(), assembleEpubZip(), buildEpubBlob() (+27 more)

### Community 3 - "lib/types/index.ts"
Cohesion: 0.08
Nodes (14): isDirty, EPUB_CSS, EpubState, AVAILABLE_FONTS, fontFiles, fontMetaMap, ButtonProps, DropZoneProps (+6 more)

### Community 4 - "image-bg-remove-ml.ts"
Cohesion: 0.09
Nodes (18): EpubImagesState, autoCropTransparentCanvas(), canvasToBlob(), compressAndResizeCanvas(), getOrCreateWorker(), loadImage(), OrnamentProcessOptions, OrnamentProcessResult (+10 more)

### Community 5 - "scripts"
Cohesion: 0.05
Nodes (39): codemirror, @codemirror/commands, @codemirror/lang-css, @codemirror/lang-html, @codemirror/state, @codemirror/theme-one-dark, @codemirror/view, fontkit (+31 more)

### Community 6 - "devDependencies"
Cohesion: 0.06
Nodes (33): eslint, @eslint/js, eslint-plugin-svelte, globals, devDependencies, eslint, @eslint/js, eslint-plugin-svelte (+25 more)

### Community 7 - "epub-reader-parser.ts"
Cohesion: 0.16
Nodes (19): categorizeResource(), extractEpubMetadata(), findOpfPath(), parseEpub(), parseOpfManifestAndSpine(), EpubBook, EpubBookMetadata, EpubContainer (+11 more)

### Community 8 - "epub-validator.ts"
Cohesion: 0.10
Nodes (17): CssAndFontsRule, DEFAULT_VALIDATION_RULES, ManifestItemInfo, NavigationRule, OpfPackageRule, SpineRule, StructureRule, validateEpub() (+9 more)

### Community 9 - "compilerOptions"
Cohesion: 0.10
Nodes (20): node, playwright.config.ts, src/**/*, .svelte-kit/ambient.d.ts, .svelte-kit/non-ambient.d.ts, ./.svelte-kit/tsconfig.json, .svelte-kit/types/**/$types.d.ts, compilerOptions (+12 more)

### Community 10 - "epub.type.ts"
Cohesion: 0.10
Nodes (20): ChapterCandidateItem, ChapterCutPoint, ChapterMatcher, CoverBlobItem, CustomDefinition, EpubChapterFeatures, EpubFontsConfig, EpubJacketConfig (+12 more)

### Community 11 - "@playwright/test"
Cohesion: 0.10
Nodes (16): @playwright/test, @playwright/test, vitest/globals, compilerOptions, types, extends, include, ./**/* (+8 more)

### Community 12 - "entry"
Cohesion: 0.12
Nodes (16): entry, ignoreDependencies, project, $schema, tailwindcss, src/**/*.{js,ts,svelte}, src/lib/epub-editor/epub-validator.ts, src/lib/epub-packer/epub-packer.ts (+8 more)

### Community 13 - "pdf-splitter-state.svelte.ts"
Cohesion: 0.24
Nodes (12): applyGrayscale(), cropCanvas(), formatEta(), loadPdfPreview(), pickConcurrency(), processPdfToJpg(), runWorker(), updateProgress() (+4 more)

### Community 14 - "markdown-fixer.ts"
Cohesion: 0.24
Nodes (9): BOLD_ITALIC_PATTERNS, BOLD_PATTERNS, convertBrackets(), fixMarkdownZip(), ITALIC_PATTERNS, UNDERLINE_PATTERNS, ConvertedBracketsResult, FixMarkdownZipResult (+1 more)

### Community 15 - "PdfSplitterState"
Cohesion: 0.14
Nodes (4): MarkdownFixerState, PdfSplitterState, triggerDownload(), slugify()

### Community 16 - "state/index.ts"
Cohesion: 0.25
Nodes (4): EpubFontsState, EpubJacketState, EpubMetadataState, ensureEpubExt()

### Community 17 - "pdf-splitter.type.ts"
Cohesion: 0.25
Nodes (7): PdfJsDocument, PdfJsLib, PdfJsPage, PdfJsViewport, PdfPreviewPage, PdfProgressInfo, ProcessPdfResult

### Community 18 - "utils/index.ts"
Cohesion: 0.25
Nodes (4): Window, mockAnchor, mockDocument, mockPdfjsLib

### Community 19 - "generate-fonts-meta.js"
Cohesion: 0.29
Nodes (6): files, fontkit, FONTS_DIR, metadata, OUTPUT_FILE, require

### Community 21 - "result.type.ts"
Cohesion: 0.40
Nodes (3): AppError, Result, ValidationError

## Knowledge Gaps
- **168 isolated node(s):** `DuplicateResourceItem`, `EpubMissingReference`, `EpubOptimizationPlan`, `EpubOptimizationSavingsBreakdown`, `EpubOptimizeOptions` (+163 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `devDependencies` connect `devDependencies` to `@playwright/test`, `entry`, `scripts`?**
  _High betweenness centrality (0.030) - this node is a cross-community bridge._
- **What connects `DuplicateResourceItem`, `EpubMissingReference`, `EpubOptimizationPlan` to the rest of the system?**
  _168 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `epub-editor-state.svelte.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07787698412698413 - nodes in this community are weakly interconnected._
- **Should `epub-source-parser.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.09518773135906927 - nodes in this community are weakly interconnected._
- **Should `epub-packer.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.09411764705882353 - nodes in this community are weakly interconnected._
- **Should `lib/types/index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07585568917668825 - nodes in this community are weakly interconnected._
- **Should `image-bg-remove-ml.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.08710801393728224 - nodes in this community are weakly interconnected._