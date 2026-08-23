# Graph Report - ebook-tools  (2026-08-23)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 519 nodes · 1090 edges · 31 communities (28 shown, 3 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 7 edges (avg confidence: 0.98)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `0e2f1f1b`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- epub-editor.ts
- epub-packer/parser/epub-parser.ts
- devDependencies
- scripts
- epub-state.svelte.ts
- epub-packer.ts
- epub-editor-state.svelte.ts
- epub/parser/epub-parser.ts
- lib/types/index.ts
- @playwright/test
- compilerOptions
- EpubImagesState
- markdown-fixer.ts
- PdfSplitterState
- utils/index.ts
- txt-parser.ts
- generate-fonts-meta.js
- helpers.test.ts
- Icons Sprite Map
- result.type.ts
- README.md
- components.type.ts
- eslint.config.js
- Favicon Logo

## God Nodes (most connected - your core abstractions)
1. `Logger` - 20 edges
2. `EpubEditorState` - 17 edges
3. `EpubImagesState` - 16 edges
4. `resolveRelativePath()` - 16 edges
5. `escapeXml()` - 16 edges
6. `buildEpubBlob()` - 12 edges
7. `scripts` - 12 edges
8. `getAssetDataUrl()` - 11 edges
9. `validateEpub()` - 11 edges
10. `parseTxtToChapters()` - 11 edges

## Surprising Connections (you probably didn't know these)
- `ignoreDependencies` --extends--> `tailwindcss`  [EXTRACTED]
  knip.json → package.json
- `types` --extends--> `@playwright/test`  [EXTRACTED]
  tests-e2e/tsconfig.json → package.json
- `EpubState` --references--> `EpubSourceState`  [EXTRACTED]
  src/lib/epub-packer/epub-state.svelte.ts → src/lib/epub-packer/state/epub-source-state.svelte.ts
- `EpubSourceStateDependencies` --references--> `IllustrationImageItem`  [EXTRACTED]
  src/lib/epub-packer/state/epub-source-state.svelte.ts → src/lib/types/epub.type.ts
- `EpubState` --references--> `EpubImagesState`  [EXTRACTED]
  src/lib/epub-packer/epub-state.svelte.ts → src/lib/epub-packer/state/epub-images-state.svelte.ts

## Import Cycles
- None detected.

## Communities (31 total, 3 thin omitted)

### Community 0 - "epub-editor.ts"
Cohesion: 0.07
Nodes (41): analyzeEpub(), cleanEpub(), EpubAnalysisResult, EpubCleanOptions, EpubCleanReport, EpubMissingReference, EpubResourceUsage, extractCssUrls() (+33 more)

### Community 1 - "epub-packer/parser/epub-parser.ts"
Cohesion: 0.09
Nodes (49): analyzeChapterCandidates(), assignSequentialChapterIds(), extractChunkBlocks(), extractMarkerTitle(), isDecorationOnly(), makeChapterMatcher(), pushIfLineStart(), scoreHeadingCandidate() (+41 more)

### Community 2 - "devDependencies"
Cohesion: 0.04
Nodes (47): eslint, @eslint/js, eslint-plugin-svelte, globals, entry, ignoreDependencies, project, $schema (+39 more)

### Community 3 - "scripts"
Cohesion: 0.05
Nodes (36): @codemirror/commands, @codemirror/lang-css, @codemirror/lang-html, @codemirror/state, @codemirror/theme-one-dark, @codemirror/view, fontkit, jszip (+28 more)

### Community 4 - "epub-state.svelte.ts"
Cohesion: 0.10
Nodes (8): EPUB_CSS, EpubState, EpubFontsState, EpubJacketState, EpubMetadataState, JACKET_TEMPLATES, JacketTemplate, ensureEpubExt()

### Community 5 - "epub-packer.ts"
Cohesion: 0.13
Nodes (25): assembleEpubZip(), buildEpubBlob(), getDynamicCss(), prepareChapters(), prepareFinalCss(), prepareMetadata(), resolveActiveFonts(), AVAILABLE_FONTS (+17 more)

### Community 6 - "epub-editor-state.svelte.ts"
Cohesion: 0.12
Nodes (16): onMouseMove(), onMouseUp(), imagesCount, isDirty, othersCount, pagesCount, stylesCount, BookMetadataDetails (+8 more)

### Community 7 - "epub/parser/epub-parser.ts"
Cohesion: 0.17
Nodes (19): categorizeResource(), extractEpubMetadata(), findOpfPath(), parseEpub(), parseOpfManifestAndSpine(), EpubBook, EpubBookMetadata, EpubContainer (+11 more)

### Community 8 - "lib/types/index.ts"
Cohesion: 0.17
Nodes (15): applyGrayscale(), cropCanvas(), formatEta(), loadPdfPreview(), pickConcurrency(), processPdfToJpg(), runWorker(), updateProgress() (+7 more)

### Community 9 - "@playwright/test"
Cohesion: 0.10
Nodes (16): @playwright/test, @playwright/test, vitest/globals, compilerOptions, types, extends, include, ./**/* (+8 more)

### Community 10 - "compilerOptions"
Cohesion: 0.10
Nodes (19): src/**/*, .svelte-kit/ambient.d.ts, .svelte-kit/non-ambient.d.ts, ./.svelte-kit/tsconfig.json, .svelte-kit/types/**/$types.d.ts, compilerOptions, allowJs, checkJs (+11 more)

### Community 12 - "markdown-fixer.ts"
Cohesion: 0.22
Nodes (10): BOLD_ITALIC_PATTERNS, BOLD_PATTERNS, convertBrackets(), fixMarkdownZip(), ITALIC_PATTERNS, UNDERLINE_PATTERNS, ConvertedBracketsResult, FixMarkdownZipResult (+2 more)

### Community 13 - "PdfSplitterState"
Cohesion: 0.15
Nodes (4): MarkdownFixerState, PdfSplitterState, triggerDownload(), slugify()

### Community 14 - "utils/index.ts"
Cohesion: 0.33
Nodes (4): isDebug(), Logger, LogLevel, setDebug()

### Community 15 - "txt-parser.ts"
Cohesion: 0.36
Nodes (8): applyInlineFormatting(), escapeRegExp(), getClosingTag(), isIllustrationTag(), parseTxtToChapters(), stripHtmlTags(), CustomDefinition, ParseTxtOptions

### Community 16 - "generate-fonts-meta.js"
Cohesion: 0.29
Nodes (6): files, fontkit, FONTS_DIR, metadata, OUTPUT_FILE, require

### Community 17 - "helpers.test.ts"
Cohesion: 0.29
Nodes (4): Window, mockAnchor, mockDocument, mockPdfjsLib

### Community 18 - "Icons Sprite Map"
Cohesion: 0.29
Nodes (7): Bluesky Icon, Discord Icon, Documentation Icon, GitHub Icon, Icons Sprite Map, Social Icon, X Icon

### Community 19 - "result.type.ts"
Cohesion: 0.40
Nodes (3): AppError, Result, ValidationError

### Community 20 - "README.md"
Cohesion: 0.40
Nodes (4): EPUB Packer, Markdown Fixer, PDF Processor, TXT to PDF CJK Desktop App

### Community 21 - "components.type.ts"
Cohesion: 0.40
Nodes (4): ButtonProps, DropZoneProps, InputProps, PageHeaderProps

## Knowledge Gaps
- **128 isolated node(s):** `EpubMissingReference`, `EpubResourceUsage`, `ValidationCategory`, `ValidationIssue`, `ValidationProfile` (+123 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Logger` connect `utils/index.ts` to `epub-editor.ts`, `epub-packer/parser/epub-parser.ts`, `epub-state.svelte.ts`, `epub-editor-state.svelte.ts`, `lib/types/index.ts`, `markdown-fixer.ts`, `txt-parser.ts`?**
  _High betweenness centrality (0.048) - this node is a cross-community bridge._
- **Why does `EpubImagesState` connect `EpubImagesState` to `epub-state.svelte.ts`, `utils/index.ts`?**
  _High betweenness centrality (0.033) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `devDependencies` to `@playwright/test`, `scripts`?**
  _High betweenness centrality (0.033) - this node is a cross-community bridge._
- **What connects `EpubMissingReference`, `EpubResourceUsage`, `ValidationCategory` to the rest of the system?**
  _128 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `epub-editor.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06947996589940324 - nodes in this community are weakly interconnected._
- **Should `epub-packer/parser/epub-parser.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.09375 - nodes in this community are weakly interconnected._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.041666666666666664 - nodes in this community are weakly interconnected._