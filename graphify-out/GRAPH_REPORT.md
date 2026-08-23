# Graph Report - ebook-tools  (2026-08-23)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 519 nodes · 1075 edges · 28 communities (25 shown, 3 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 7 edges (avg confidence: 0.98)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `69efb3ab`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- epub-editor-state.svelte.ts
- devDependencies
- lib/types/index.ts
- epub-packer/parser/epub-parser.ts
- epub-packer.ts
- utils/index.ts
- scripts
- pdf-splitter.ts
- epub.type.ts
- epub/parser/epub-parser.ts
- compilerOptions
- tests-e2e/tsconfig.json
- EpubSourceState
- EpubImagesState
- generate-fonts-meta.js
- Icons Sprite Map
- result.type.ts
- README.md
- eslint.config.js
- Favicon Logo

## God Nodes (most connected - your core abstractions)
1. `Logger` - 18 edges
2. `EpubEditorState` - 17 edges
3. `EpubImagesState` - 16 edges
4. `resolveRelativePath()` - 16 edges
5. `buildEpubBlob()` - 12 edges
6. `escapeXml()` - 12 edges
7. `scripts` - 12 edges
8. `getAssetDataUrl()` - 11 edges
9. `validateEpub()` - 11 edges
10. `parseTxtToChapters()` - 11 edges

## Surprising Connections (you probably didn't know these)
- `ignoreDependencies` --extends--> `tailwindcss`  [EXTRACTED]
  knip.json → package.json
- `types` --extends--> `@playwright/test`  [EXTRACTED]
  tests-e2e/tsconfig.json → package.json
- `BookMetadataDetails` --inherits--> `EpubMetadata`  [EXTRACTED]
  src/lib/epub-editor/epub-book-ops.ts → src/lib/types/epub.type.ts
- `EpubState` --references--> `EpubImagesState`  [EXTRACTED]
  src/lib/epub-packer/epub-state.svelte.ts → src/lib/epub-packer/state/epub-images-state.svelte.ts
- `EpubSourceStateDependencies` --references--> `IllustrationImageItem`  [EXTRACTED]
  src/lib/epub-packer/state/epub-source-state.svelte.ts → src/lib/types/epub.type.ts

## Import Cycles
- None detected.

## Communities (28 total, 3 thin omitted)

### Community 0 - "epub-editor-state.svelte.ts"
Cohesion: 0.07
Nodes (49): BookMetadataDetails, extractBookMetadata(), findOpfPath(), rebuildEpubToc(), reorderOpfSpine(), TocChapterInfo, updateBookMetadata(), analyzeEpub() (+41 more)

### Community 1 - "devDependencies"
Cohesion: 0.04
Nodes (47): eslint, @eslint/js, eslint-plugin-svelte, globals, entry, ignoreDependencies, project, $schema (+39 more)

### Community 2 - "lib/types/index.ts"
Cohesion: 0.08
Nodes (11): onMouseMove(), onMouseUp(), imagesCount, isDirty, othersCount, pagesCount, stylesCount, ButtonProps (+3 more)

### Community 3 - "epub-packer/parser/epub-parser.ts"
Cohesion: 0.15
Nodes (36): analyzeChapterCandidates(), assignSequentialChapterIds(), extractChunkBlocks(), extractMarkerTitle(), isDecorationOnly(), makeChapterMatcher(), pushIfLineStart(), scoreHeadingCandidate() (+28 more)

### Community 4 - "epub-packer.ts"
Cohesion: 0.10
Nodes (28): replaceOrCreateTag(), assembleEpubZip(), buildEpubBlob(), EPUB_CSS, getDynamicCss(), prepareChapters(), prepareFinalCss(), prepareMetadata() (+20 more)

### Community 5 - "utils/index.ts"
Cohesion: 0.09
Nodes (20): BOLD_ITALIC_PATTERNS, BOLD_PATTERNS, convertBrackets(), fixMarkdownZip(), ITALIC_PATTERNS, MarkdownFixerState, UNDERLINE_PATTERNS, ConvertedBracketsResult (+12 more)

### Community 6 - "scripts"
Cohesion: 0.05
Nodes (36): @codemirror/commands, @codemirror/lang-css, @codemirror/lang-html, @codemirror/state, @codemirror/theme-one-dark, @codemirror/view, fontkit, jszip (+28 more)

### Community 7 - "pdf-splitter.ts"
Cohesion: 0.12
Nodes (16): applyGrayscale(), cropCanvas(), formatEta(), loadPdfPreview(), pickConcurrency(), processPdfToJpg(), runWorker(), updateProgress() (+8 more)

### Community 8 - "epub.type.ts"
Cohesion: 0.11
Nodes (22): applyInlineFormatting(), escapeRegExp(), getClosingTag(), isIllustrationTag(), parseTxtToChapters(), stripHtmlTags(), EpubSourceStateDependencies, ChapterCandidateItem (+14 more)

### Community 9 - "epub/parser/epub-parser.ts"
Cohesion: 0.17
Nodes (19): categorizeResource(), extractEpubMetadata(), findOpfPath(), parseEpub(), parseOpfManifestAndSpine(), EpubBook, EpubBookMetadata, EpubContainer (+11 more)

### Community 10 - "compilerOptions"
Cohesion: 0.10
Nodes (19): src/**/*, .svelte-kit/ambient.d.ts, .svelte-kit/non-ambient.d.ts, ./.svelte-kit/tsconfig.json, .svelte-kit/types/**/$types.d.ts, compilerOptions, allowJs, checkJs (+11 more)

### Community 11 - "tests-e2e/tsconfig.json"
Cohesion: 0.11
Nodes (16): @playwright/test, @playwright/test, vitest/globals, compilerOptions, types, extends, include, ./**/* (+8 more)

### Community 12 - "EpubSourceState"
Cohesion: 0.15
Nodes (6): EpubState, EpubFontsState, EpubJacketState, EpubMetadataState, EpubSourceState, ensureEpubExt()

### Community 14 - "generate-fonts-meta.js"
Cohesion: 0.29
Nodes (6): files, fontkit, FONTS_DIR, metadata, OUTPUT_FILE, require

### Community 15 - "Icons Sprite Map"
Cohesion: 0.29
Nodes (7): Bluesky Icon, Discord Icon, Documentation Icon, GitHub Icon, Icons Sprite Map, Social Icon, X Icon

### Community 16 - "result.type.ts"
Cohesion: 0.40
Nodes (3): AppError, Result, ValidationError

### Community 17 - "README.md"
Cohesion: 0.40
Nodes (4): EPUB Packer, Markdown Fixer, PDF Processor, TXT to PDF CJK Desktop App

## Knowledge Gaps
- **130 isolated node(s):** `TocChapterInfo`, `EpubMissingReference`, `EpubResourceUsage`, `ValidationCategory`, `ValidationIssue` (+125 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Logger` connect `utils/index.ts` to `epub-editor-state.svelte.ts`, `lib/types/index.ts`, `epub-packer/parser/epub-parser.ts`, `pdf-splitter.ts`, `epub.type.ts`?**
  _High betweenness centrality (0.043) - this node is a cross-community bridge._
- **Why does `EpubImagesState` connect `EpubImagesState` to `lib/types/index.ts`, `EpubSourceState`, `utils/index.ts`?**
  _High betweenness centrality (0.033) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `devDependencies` to `tests-e2e/tsconfig.json`, `scripts`?**
  _High betweenness centrality (0.032) - this node is a cross-community bridge._
- **What connects `TocChapterInfo`, `EpubMissingReference`, `EpubResourceUsage` to the rest of the system?**
  _130 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `epub-editor-state.svelte.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06553041434028799 - nodes in this community are weakly interconnected._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.041666666666666664 - nodes in this community are weakly interconnected._
- **Should `lib/types/index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.08350951374207188 - nodes in this community are weakly interconnected._