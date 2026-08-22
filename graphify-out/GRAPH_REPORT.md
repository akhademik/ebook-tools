# Graph Report - ebook-tools  (2026-08-22)

## Corpus Check
- 75 files · ~40,672 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 432 nodes · 815 edges · 30 communities (23 shown, 7 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 12 edges (avg confidence: 0.92)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `136c7953`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- epub-parser.ts
- devDependencies
- epub-packer.ts
- Logger
- pdf-splitter.ts
- scripts
- entry
- EpubState
- txt-parser.ts
- types/index.ts
- compilerOptions
- generate-fonts-meta.js
- result.type.ts
- Icons Sprite Map
- README.md
- Graphify Agent Rule
- eslint.config.js
- Dropcap styling logic change
- EpubImagesState
- Favicon Logo
- EpubJacketState

## God Nodes (most connected - your core abstractions)
1. `EpubState` - 82 edges
2. `Logger` - 20 edges
3. `EpubImagesState` - 16 edges
4. `../src/lib/utils/logger.js?test=2` - 16 edges
5. `escapeXml()` - 16 edges
6. `buildEpubBlob()` - 14 edges
7. `scripts` - 11 edges
8. `EpubSourceState` - 10 edges
9. `compilerOptions` - 10 edges
10. `renderMarkdownBlocks()` - 9 edges

## Surprising Connections (you probably didn't know these)
- `EpubSectionBaseProps` --references--> `EpubState`  [EXTRACTED]
  src/lib/epub-packer/components/epub-components.type.ts → src/lib/epub-packer/epub-state.svelte.ts
- `EpubSourceSectionProps` --references--> `EpubState`  [EXTRACTED]
  src/lib/epub-packer/components/epub-components.type.ts → src/lib/epub-packer/epub-state.svelte.ts
- `EpubMetadataSectionProps` --references--> `EpubState`  [EXTRACTED]
  src/lib/epub-packer/components/epub-components.type.ts → src/lib/epub-packer/epub-state.svelte.ts
- `EpubPackSectionProps` --references--> `EpubState`  [EXTRACTED]
  src/lib/epub-packer/components/epub-components.type.ts → src/lib/epub-packer/epub-state.svelte.ts
- `EpubJacketModalProps` --references--> `EpubState`  [EXTRACTED]
  src/lib/epub-packer/components/epub-components.type.ts → src/lib/epub-packer/epub-state.svelte.ts

## Import Cycles
- None detected.

## Communities (30 total, 7 thin omitted)

### Community 0 - "epub-parser.ts"
Cohesion: 0.13
Nodes (41): analyzeChapterCandidates(), assignSequentialChapterIds(), extractChunkBlocks(), extractMarkerTitle(), isDecorationOnly(), makeChapterMatcher(), pushIfLineStart(), scoreHeadingCandidate() (+33 more)

### Community 1 - "devDependencies"
Cohesion: 0.06
Nodes (35): eslint, @eslint/js, eslint-plugin-svelte, globals, devDependencies, eslint, @eslint/js, eslint-plugin-svelte (+27 more)

### Community 2 - "epub-packer.ts"
Cohesion: 0.14
Nodes (27): buildEpubBlob(), EPUB_CSS, getDynamicCss(), AVAILABLE_FONTS, findFont(), fontFiles, fontMetaMap, getFontCSSDeclaration() (+19 more)

### Community 3 - "Logger"
Cohesion: 0.07
Nodes (27): EpubFontsState, EpubMetadataState, EpubSourceStateDependencies, BOLD_ITALIC_PATTERNS, BOLD_PATTERNS, convertBrackets(), fixMarkdownZip(), ITALIC_PATTERNS (+19 more)

### Community 4 - "pdf-splitter.ts"
Cohesion: 0.11
Nodes (16): applyGrayscale(), cropCanvas(), formatEta(), loadPdfPreview(), pickConcurrency(), processPdfToJpg(), runWorker(), updateProgress() (+8 more)

### Community 5 - "scripts"
Cohesion: 0.10
Nodes (20): fontkit, jszip, dependencies, fontkit, jszip, name, private, scripts (+12 more)

### Community 6 - "entry"
Cohesion: 0.14
Nodes (13): entry, ignoreDependencies, project, $schema, src/**/*.{js,ts,svelte}, src/lib/epub-packer/parser/epub-parser.ts, src/lib/types/index.ts, src/lib/utils/index.ts (+5 more)

### Community 8 - "txt-parser.ts"
Cohesion: 0.18
Nodes (9): applyInlineFormatting(), escapeRegExp(), getClosingTag(), isIllustrationTag(), parseTxtToChapters(), stripHtmlTags(), EpubSourceState, CustomDefinition (+1 more)

### Community 9 - "types/index.ts"
Cohesion: 0.08
Nodes (12): EpubJacketModalProps, EpubMetadataSectionProps, EpubPackSectionProps, EpubSectionBaseProps, EpubSourceSectionProps, EpubSyntaxModalProps, JACKET_TEMPLATES, ButtonProps (+4 more)

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
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `EpubState` connect `EpubState` to `epub-parser.ts`, `epub-packer.ts`, `Logger`, `txt-parser.ts`, `types/index.ts`, `EpubImagesState`, `EpubJacketState`?**
  _High betweenness centrality (0.201) - this node is a cross-community bridge._
- **Why does `Logger` connect `Logger` to `epub-parser.ts`, `txt-parser.ts`, `epub-packer.ts`, `pdf-splitter.ts`?**
  _High betweenness centrality (0.059) - this node is a cross-community bridge._
- **Why does `EpubImagesState` connect `EpubImagesState` to `epub-packer.ts`, `Logger`, `EpubState`?**
  _High betweenness centrality (0.041) - this node is a cross-community bridge._
- **What connects `gitignorePath`, `$schema`, `src/**/*.{js,ts,svelte}` to the rest of the system?**
  _102 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `epub-parser.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.12705882352941175 - nodes in this community are weakly interconnected._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.05714285714285714 - nodes in this community are weakly interconnected._
- **Should `epub-packer.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.14035087719298245 - nodes in this community are weakly interconnected._