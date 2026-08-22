# Graph Report - ebook-tools  (2026-08-22)

## Corpus Check
- 67 files · ~39,545 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 347 nodes · 712 edges · 28 communities (23 shown, 5 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 6 edges (avg confidence: 1.0)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `73541bf5`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- epub-parser.ts
- devDependencies
- epub-packer.ts
- ../src/lib/helpers/logger.js?test=2
- pdf-splitter.ts
- scripts
- entry
- EpubState
- txt-parser.ts
- index.ts
- compilerOptions
- generate-fonts-meta.js
- result.type.ts
- Icons Sprite Map
- README.md
- Graphify Agent Rule
- eslint.config.js
- Dropcap styling logic change
- Favicon Logo

## God Nodes (most connected - your core abstractions)
1. `EpubState` - 27 edges
2. `../src/lib/helpers/logger.js?test=2` - 23 edges
3. `Logger` - 18 edges
4. `escapeXml()` - 17 edges
5. `buildEpubBlob()` - 14 edges
6. `scripts` - 11 edges
7. `compilerOptions` - 10 edges
8. `renderMarkdownBlocks()` - 9 edges
9. `groupChaptersSingle()` - 9 edges
10. `groupChaptersZip()` - 9 edges

## Surprising Connections (you probably didn't know these)
- `EpubJacketModalProps` --references--> `EpubState`  [EXTRACTED]
  src/lib/types/components.type.ts → src/lib/epub-packer/epub-state.svelte.ts
- `EpubMetadataSectionProps` --references--> `EpubState`  [EXTRACTED]
  src/lib/types/components.type.ts → src/lib/epub-packer/epub-state.svelte.ts
- `EpubPackSectionProps` --references--> `EpubState`  [EXTRACTED]
  src/lib/types/components.type.ts → src/lib/epub-packer/epub-state.svelte.ts
- `EpubSectionBaseProps` --references--> `EpubState`  [EXTRACTED]
  src/lib/types/components.type.ts → src/lib/epub-packer/epub-state.svelte.ts
- `EpubSourceSectionProps` --references--> `EpubState`  [EXTRACTED]
  src/lib/types/components.type.ts → src/lib/epub-packer/epub-state.svelte.ts

## Import Cycles
- 3-file cycle: `src/lib/epub-packer/epub-state.svelte.ts -> src/lib/types/index.ts -> src/lib/types/components.type.ts -> src/lib/epub-packer/epub-state.svelte.ts`
- 4-file cycle: `src/lib/epub-packer/epub-packer.ts -> src/lib/types/index.ts -> src/lib/types/components.type.ts -> src/lib/epub-packer/epub-state.svelte.ts -> src/lib/epub-packer/epub-packer.ts`
- 4-file cycle: `src/lib/epub-packer/epub-state.svelte.ts -> src/lib/epub-packer/parser/epub-parser.ts -> src/lib/types/index.ts -> src/lib/types/components.type.ts -> src/lib/epub-packer/epub-state.svelte.ts`
- 4-file cycle: `src/lib/epub-packer/epub-state.svelte.ts -> src/lib/epub-packer/templates/fonts.ts -> src/lib/types/index.ts -> src/lib/types/components.type.ts -> src/lib/epub-packer/epub-state.svelte.ts`
- 5-file cycle: `src/lib/epub-packer/epub-state.svelte.ts -> src/lib/epub-packer/parser/epub-parser.ts -> src/lib/epub-packer/parser/txt-parser.ts -> src/lib/types/index.ts -> src/lib/types/components.type.ts -> src/lib/epub-packer/epub-state.svelte.ts`
- 5-file cycle: `src/lib/epub-packer/epub-packer.ts -> src/lib/epub-packer/templates/fonts.ts -> src/lib/types/index.ts -> src/lib/types/components.type.ts -> src/lib/epub-packer/epub-state.svelte.ts -> src/lib/epub-packer/epub-packer.ts`
- 5-file cycle: `src/lib/epub-packer/epub-packer.ts -> src/lib/epub-packer/templates/jacket-templates.ts -> src/lib/types/index.ts -> src/lib/types/components.type.ts -> src/lib/epub-packer/epub-state.svelte.ts -> src/lib/epub-packer/epub-packer.ts`
- 5-file cycle: `src/lib/epub-packer/epub-packer.ts -> src/lib/epub-packer/xml-builders/chapter-builder.ts -> src/lib/types/index.ts -> src/lib/types/components.type.ts -> src/lib/epub-packer/epub-state.svelte.ts -> src/lib/epub-packer/epub-packer.ts`
- 5-file cycle: `src/lib/epub-packer/epub-packer.ts -> src/lib/epub-packer/xml-builders/nav-builder.ts -> src/lib/types/index.ts -> src/lib/types/components.type.ts -> src/lib/epub-packer/epub-state.svelte.ts -> src/lib/epub-packer/epub-packer.ts`
- 5-file cycle: `src/lib/epub-packer/epub-packer.ts -> src/lib/epub-packer/xml-builders/opf-builder.ts -> src/lib/types/index.ts -> src/lib/types/components.type.ts -> src/lib/epub-packer/epub-state.svelte.ts -> src/lib/epub-packer/epub-packer.ts`
- 5-file cycle: `src/lib/epub-packer/epub-state.svelte.ts -> src/lib/epub-packer/parser/epub-parser.ts -> src/lib/epub-packer/parser/epub-chapter-utils.ts -> src/lib/types/index.ts -> src/lib/types/components.type.ts -> src/lib/epub-packer/epub-state.svelte.ts`
- 5-file cycle: `src/lib/epub-packer/epub-state.svelte.ts -> src/lib/epub-packer/parser/epub-parser.ts -> src/lib/epub-packer/parser/epub-markdown-utils.ts -> src/lib/types/index.ts -> src/lib/types/components.type.ts -> src/lib/epub-packer/epub-state.svelte.ts`
- 5-file cycle: `src/lib/epub-packer/epub-state.svelte.ts -> src/lib/epub-packer/parser/epub-parser.ts -> src/lib/epub-packer/parser/epub-ocr-utils.ts -> src/lib/types/index.ts -> src/lib/types/components.type.ts -> src/lib/epub-packer/epub-state.svelte.ts`
- 5-file cycle: `src/lib/epub-packer/epub-state.svelte.ts -> src/lib/epub-packer/parser/epub-parser.ts -> src/lib/epub-packer/parser/epub-single-grouper.ts -> src/lib/types/index.ts -> src/lib/types/components.type.ts -> src/lib/epub-packer/epub-state.svelte.ts`
- 5-file cycle: `src/lib/epub-packer/epub-state.svelte.ts -> src/lib/epub-packer/parser/epub-parser.ts -> src/lib/epub-packer/parser/epub-zip-grouper.ts -> src/lib/types/index.ts -> src/lib/types/components.type.ts -> src/lib/epub-packer/epub-state.svelte.ts`

## Communities (28 total, 5 thin omitted)

### Community 0 - "epub-parser.ts"
Cohesion: 0.14
Nodes (38): analyzeChapterCandidates(), assignSequentialChapterIds(), extractChunkBlocks(), extractMarkerTitle(), isDecorationOnly(), makeChapterMatcher(), pushIfLineStart(), scoreHeadingCandidate() (+30 more)

### Community 1 - "devDependencies"
Cohesion: 0.06
Nodes (35): eslint, @eslint/js, eslint-plugin-svelte, globals, devDependencies, eslint, @eslint/js, eslint-plugin-svelte (+27 more)

### Community 2 - "epub-packer.ts"
Cohesion: 0.13
Nodes (33): buildEpubBlob(), EPUB_CSS, getDynamicCss(), AVAILABLE_FONTS, findFont(), fontFiles, fontMetaMap, getFontCSSDeclaration() (+25 more)

### Community 3 - "../src/lib/helpers/logger.js?test=2"
Cohesion: 0.10
Nodes (23): Window, ../src/lib/helpers/logger.js?test=2, isDebug(), Logger, LogLevel, setDebug(), BOLD_ITALIC_PATTERNS, BOLD_PATTERNS (+15 more)

### Community 4 - "pdf-splitter.ts"
Cohesion: 0.11
Nodes (16): applyGrayscale(), cropCanvas(), formatEta(), loadPdfPreview(), pickConcurrency(), processPdfToJpg(), runWorker(), updateProgress() (+8 more)

### Community 5 - "scripts"
Cohesion: 0.10
Nodes (20): fontkit, jszip, dependencies, fontkit, jszip, name, private, scripts (+12 more)

### Community 6 - "entry"
Cohesion: 0.14
Nodes (13): entry, ignoreDependencies, project, $schema, src/**/*.{js,ts,svelte}, src/lib/epub-packer/parser/epub-parser.ts, src/lib/helpers/helpers.ts, src/lib/types/index.ts (+5 more)

### Community 7 - "EpubState"
Cohesion: 0.10
Nodes (11): EpubState, ButtonProps, DropZoneProps, EpubJacketModalProps, EpubMetadataSectionProps, EpubPackSectionProps, EpubSectionBaseProps, EpubSourceSectionProps (+3 more)

### Community 8 - "txt-parser.ts"
Cohesion: 0.43
Nodes (7): applyInlineFormatting(), escapeRegExp(), getClosingTag(), isIllustrationTag(), parseTxtToChapters(), stripHtmlTags(), ParseTxtOptions

### Community 10 - "compilerOptions"
Cohesion: 0.11
Nodes (17): src/**/*, .svelte-kit/ambient.d.ts, .svelte-kit/non-ambient.d.ts, ./.svelte-kit/tsconfig.json, .svelte-kit/types/**/$types.d.ts, compilerOptions, allowJs, checkJs (+9 more)

### Community 11 - "generate-fonts-meta.js"
Cohesion: 0.29
Nodes (6): files, fontkit, FONTS_DIR, metadata, OUTPUT_FILE, require

### Community 12 - "result.type.ts"
Cohesion: 0.40
Nodes (3): AppError, Result, ValidationError

### Community 13 - "Icons Sprite Map"
Cohesion: 0.29
Nodes (7): Bluesky Icon, Discord Icon, Documentation Icon, GitHub Icon, Icons Sprite Map, Social Icon, X Icon

### Community 15 - "README.md"
Cohesion: 0.40
Nodes (4): EPUB Packer, Markdown Fixer, PDF Processor, TXT to PDF CJK Desktop App

## Knowledge Gaps
- **102 isolated node(s):** `gitignorePath`, `$schema`, `src/**/*.{js,ts,svelte}`, `tests/**/*.{js,ts}`, `src/routes/**/+page.{svelte,js,ts}` (+97 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `EpubState` connect `EpubState` to `epub-parser.ts`, `epub-packer.ts`?**
  _High betweenness centrality (0.057) - this node is a cross-community bridge._
- **Why does `../src/lib/helpers/logger.js?test=2` connect `../src/lib/helpers/logger.js?test=2` to `epub-parser.ts`, `epub-packer.ts`, `pdf-splitter.ts`, `txt-parser.ts`, `index.ts`?**
  _High betweenness centrality (0.044) - this node is a cross-community bridge._
- **Why does `Logger` connect `../src/lib/helpers/logger.js?test=2` to `epub-parser.ts`, `txt-parser.ts`, `epub-packer.ts`, `pdf-splitter.ts`?**
  _High betweenness centrality (0.027) - this node is a cross-community bridge._
- **What connects `gitignorePath`, `$schema`, `src/**/*.{js,ts,svelte}` to the rest of the system?**
  _102 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `epub-parser.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.14246068455134134 - nodes in this community are weakly interconnected._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.05714285714285714 - nodes in this community are weakly interconnected._
- **Should `epub-packer.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.12790697674418605 - nodes in this community are weakly interconnected._