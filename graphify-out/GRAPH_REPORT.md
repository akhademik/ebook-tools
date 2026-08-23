# Graph Report - ebook-tools  (2026-08-23)

## Corpus Check
- 95 files · ~58,304 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 502 nodes · 1058 edges · 29 communities (26 shown, 3 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 7 edges (avg confidence: 0.98)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `9da34936`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- epub-parser.ts
- devDependencies
- epub-packer.ts
- utils/index.ts
- generate-fonts-meta.js
- scripts
- entry
- epub-editor-state.svelte.ts
- txt-parser.ts
- compilerOptions
- result.type.ts
- types/index.ts
- Icons Sprite Map
- README.md
- tests-e2e/tsconfig.json
- eslint.config.js
- tests/tsconfig.json
- EpubImagesState
- Favicon Logo
- epub-editor.ts

## God Nodes (most connected - your core abstractions)
1. `Logger` - 23 edges
2. `escapeXml()` - 20 edges
3. `EpubEditorState` - 17 edges
4. `buildEpubBlob()` - 17 edges
5. `EpubImagesState` - 16 edges
6. `resolveRelativePath()` - 14 edges
7. `scripts` - 12 edges
8. `getAssetDataUrl()` - 11 edges
9. `validateEpub()` - 11 edges
10. `compilerOptions` - 11 edges

## Surprising Connections (you probably didn't know these)
- `replaceOrCreateTag()` --calls--> `escapeXml()`  [EXTRACTED]
  src/lib/epub-editor/epub-book-ops.ts → src/lib/utils/xml.ts
- `BookMetadataDetails` --inherits--> `EpubMetadata`  [EXTRACTED]
  src/lib/epub-editor/epub-book-ops.ts → src/lib/types/epub.type.ts
- `updateBookMetadata()` --calls--> `escapeXml()`  [EXTRACTED]
  src/lib/epub-editor/epub-book-ops.ts → src/lib/utils/xml.ts
- `reorderOpfSpine()` --calls--> `resolveRelativePath()`  [EXTRACTED]
  src/lib/epub-editor/epub-book-ops.ts → src/lib/epub-editor/epub-editor.ts
- `rebuildEpubToc()` --calls--> `resolveRelativePath()`  [EXTRACTED]
  src/lib/epub-editor/epub-book-ops.ts → src/lib/epub-editor/epub-editor.ts

## Import Cycles
- None detected.

## Communities (29 total, 3 thin omitted)

### Community 0 - "epub-parser.ts"
Cohesion: 0.14
Nodes (38): analyzeChapterCandidates(), assignSequentialChapterIds(), extractChunkBlocks(), extractMarkerTitle(), isDecorationOnly(), makeChapterMatcher(), pushIfLineStart(), scoreHeadingCandidate() (+30 more)

### Community 1 - "devDependencies"
Cohesion: 0.05
Nodes (37): eslint, @eslint/js, eslint-plugin-svelte, globals, devDependencies, eslint, @eslint/js, eslint-plugin-svelte (+29 more)

### Community 2 - "epub-packer.ts"
Cohesion: 0.10
Nodes (32): buildEpubBlob(), getDynamicCss(), EpubSourceStateDependencies, findFont(), getFontCSSDeclaration(), getFontFileName(), JACKET_TEMPLATES, buildChapterXhtml() (+24 more)

### Community 3 - "utils/index.ts"
Cohesion: 0.05
Nodes (38): BOLD_ITALIC_PATTERNS, BOLD_PATTERNS, convertBrackets(), fixMarkdownZip(), ITALIC_PATTERNS, MarkdownFixerState, UNDERLINE_PATTERNS, applyGrayscale() (+30 more)

### Community 4 - "generate-fonts-meta.js"
Cohesion: 0.29
Nodes (6): files, fontkit, FONTS_DIR, metadata, OUTPUT_FILE, require

### Community 5 - "scripts"
Cohesion: 0.05
Nodes (36): @codemirror/commands, @codemirror/lang-css, @codemirror/lang-html, @codemirror/state, @codemirror/theme-one-dark, @codemirror/view, fontkit, jszip (+28 more)

### Community 6 - "entry"
Cohesion: 0.14
Nodes (13): entry, ignoreDependencies, project, $schema, src/**/*.{js,ts,svelte}, src/lib/epub-packer/parser/epub-parser.ts, src/lib/types/index.ts, src/lib/utils/index.ts (+5 more)

### Community 8 - "epub-editor-state.svelte.ts"
Cohesion: 0.09
Nodes (15): onMouseMove(), onMouseUp(), imagesCount, isDirty, othersCount, pagesCount, stylesCount, BookMetadataDetails (+7 more)

### Community 9 - "txt-parser.ts"
Cohesion: 0.21
Nodes (8): applyInlineFormatting(), escapeRegExp(), getClosingTag(), isIllustrationTag(), parseTxtToChapters(), stripHtmlTags(), EpubSourceState, CustomDefinition

### Community 10 - "compilerOptions"
Cohesion: 0.10
Nodes (19): src/**/*, .svelte-kit/ambient.d.ts, .svelte-kit/non-ambient.d.ts, ./.svelte-kit/tsconfig.json, .svelte-kit/types/**/$types.d.ts, compilerOptions, allowJs, checkJs (+11 more)

### Community 11 - "result.type.ts"
Cohesion: 0.40
Nodes (3): AppError, Result, ValidationError

### Community 12 - "types/index.ts"
Cohesion: 0.09
Nodes (13): EPUB_CSS, EpubState, EpubFontsState, EpubJacketState, EpubMetadataState, AVAILABLE_FONTS, fontFiles, fontMetaMap (+5 more)

### Community 13 - "Icons Sprite Map"
Cohesion: 0.29
Nodes (7): Bluesky Icon, Discord Icon, Documentation Icon, GitHub Icon, Icons Sprite Map, Social Icon, X Icon

### Community 15 - "README.md"
Cohesion: 0.40
Nodes (4): EPUB Packer, Markdown Fixer, PDF Processor, TXT to PDF CJK Desktop App

### Community 16 - "tests-e2e/tsconfig.json"
Cohesion: 0.18
Nodes (8): @playwright/test, compilerOptions, types, extends, include, ./**/*, node, ../tsconfig.json

### Community 19 - "tests/tsconfig.json"
Cohesion: 0.22
Nodes (8): vitest/globals, compilerOptions, types, extends, include, ./**/*, node, ../tsconfig.json

### Community 29 - "epub-editor.ts"
Cohesion: 0.07
Nodes (41): analyzeEpub(), cleanEpub(), EpubAnalysisResult, EpubCleanOptions, EpubCleanReport, EpubMissingReference, EpubResourceUsage, extractCssUrls() (+33 more)

## Knowledge Gaps
- **132 isolated node(s):** `gitignorePath`, `$schema`, `src/**/*.{js,ts,svelte}`, `tests/**/*.{js,ts}`, `src/routes/**/+page.{svelte,js,ts}` (+127 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Logger` connect `utils/index.ts` to `epub-parser.ts`, `epub-packer.ts`, `epub-editor-state.svelte.ts`, `txt-parser.ts`, `types/index.ts`, `epub-editor.ts`?**
  _High betweenness centrality (0.059) - this node is a cross-community bridge._
- **Why does `EpubImagesState` connect `EpubImagesState` to `epub-packer.ts`, `utils/index.ts`, `types/index.ts`?**
  _High betweenness centrality (0.033) - this node is a cross-community bridge._
- **Why does `EpubEditorState` connect `epub-editor.ts` to `epub-editor-state.svelte.ts`?**
  _High betweenness centrality (0.018) - this node is a cross-community bridge._
- **What connects `gitignorePath`, `$schema`, `src/**/*.{js,ts,svelte}` to the rest of the system?**
  _132 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `epub-parser.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.1427304964539007 - nodes in this community are weakly interconnected._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.05405405405405406 - nodes in this community are weakly interconnected._
- **Should `epub-packer.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.1036077705827937 - nodes in this community are weakly interconnected._