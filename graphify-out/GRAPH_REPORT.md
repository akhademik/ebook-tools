# Graph Report - ebook-tools  (2026-08-22)

## Corpus Check
- 75 files · ~39,522 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 364 nodes · 731 edges · 29 communities (24 shown, 5 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 6 edges (avg confidence: 1.0)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `250117b9`
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
- EpubState
- epub-source-state.svelte.ts
- types/index.ts
- compilerOptions
- helpers.test.ts
- result.type.ts
- Icons Sprite Map
- README.md
- Graphify Agent Rule
- eslint.config.js
- Dropcap styling logic change
- EpubImagesState
- Favicon Logo

## God Nodes (most connected - your core abstractions)
1. `Logger` - 20 edges
2. `EpubImagesState` - 16 edges
3. `escapeXml()` - 16 edges
4. `buildEpubBlob()` - 14 edges
5. `EpubState` - 14 edges
6. `scripts` - 11 edges
7. `EpubSourceState` - 10 edges
8. `compilerOptions` - 10 edges
9. `renderMarkdownBlocks()` - 9 edges
10. `groupChaptersSingle()` - 9 edges

## Surprising Connections (you probably didn't know these)
- `EpubState` --references--> `EpubImagesState`  [EXTRACTED]
  src/lib/epub-packer/epub-state.svelte.ts → src/lib/epub-packer/state/epub-images-state.svelte.ts
- `EpubState` --references--> `EpubSourceState`  [EXTRACTED]
  src/lib/epub-packer/epub-state.svelte.ts → src/lib/epub-packer/state/epub-source-state.svelte.ts
- `EpubJacketModalProps` --references--> `EpubState`  [EXTRACTED]
  src/lib/types/epub-components.type.ts → src/lib/epub-packer/epub-state.svelte.ts
- `EpubMetadataSectionProps` --references--> `EpubState`  [EXTRACTED]
  src/lib/types/epub-components.type.ts → src/lib/epub-packer/epub-state.svelte.ts
- `EpubPackSectionProps` --references--> `EpubState`  [EXTRACTED]
  src/lib/types/epub-components.type.ts → src/lib/epub-packer/epub-state.svelte.ts

## Import Cycles
- 3-file cycle: `src/lib/epub-packer/epub-state.svelte.ts -> src/lib/types/index.ts -> src/lib/types/epub-components.type.ts -> src/lib/epub-packer/epub-state.svelte.ts`
- 4-file cycle: `src/lib/epub-packer/epub-packer.ts -> src/lib/types/index.ts -> src/lib/types/epub-components.type.ts -> src/lib/epub-packer/epub-state.svelte.ts -> src/lib/epub-packer/epub-packer.ts`
- 4-file cycle: `src/lib/epub-packer/epub-state.svelte.ts -> src/lib/epub-packer/templates/fonts.ts -> src/lib/types/index.ts -> src/lib/types/epub-components.type.ts -> src/lib/epub-packer/epub-state.svelte.ts`
- 5-file cycle: `src/lib/epub-packer/epub-packer.ts -> src/lib/epub-packer/templates/jacket-templates.ts -> src/lib/types/index.ts -> src/lib/types/epub-components.type.ts -> src/lib/epub-packer/epub-state.svelte.ts -> src/lib/epub-packer/epub-packer.ts`
- 5-file cycle: `src/lib/epub-packer/epub-packer.ts -> src/lib/epub-packer/templates/fonts.ts -> src/lib/types/index.ts -> src/lib/types/epub-components.type.ts -> src/lib/epub-packer/epub-state.svelte.ts -> src/lib/epub-packer/epub-packer.ts`
- 5-file cycle: `src/lib/epub-packer/epub-packer.ts -> src/lib/epub-packer/xml-builders/chapter-builder.ts -> src/lib/types/index.ts -> src/lib/types/epub-components.type.ts -> src/lib/epub-packer/epub-state.svelte.ts -> src/lib/epub-packer/epub-packer.ts`
- 5-file cycle: `src/lib/epub-packer/epub-packer.ts -> src/lib/epub-packer/xml-builders/nav-builder.ts -> src/lib/types/index.ts -> src/lib/types/epub-components.type.ts -> src/lib/epub-packer/epub-state.svelte.ts -> src/lib/epub-packer/epub-packer.ts`
- 5-file cycle: `src/lib/epub-packer/epub-packer.ts -> src/lib/epub-packer/xml-builders/opf-builder.ts -> src/lib/types/index.ts -> src/lib/types/epub-components.type.ts -> src/lib/epub-packer/epub-state.svelte.ts -> src/lib/epub-packer/epub-packer.ts`
- 5-file cycle: `src/lib/epub-packer/epub-state.svelte.ts -> src/lib/epub-packer/state/index.ts -> src/lib/epub-packer/state/epub-source-state.svelte.ts -> src/lib/types/index.ts -> src/lib/types/epub-components.type.ts -> src/lib/epub-packer/epub-state.svelte.ts`
- 5-file cycle: `src/lib/epub-packer/epub-state.svelte.ts -> src/lib/epub-packer/state/index.ts -> src/lib/epub-packer/state/epub-images-state.svelte.ts -> src/lib/types/index.ts -> src/lib/types/epub-components.type.ts -> src/lib/epub-packer/epub-state.svelte.ts`

## Communities (29 total, 5 thin omitted)

### Community 0 - "epub-parser.ts"
Cohesion: 0.23
Nodes (26): analyzeChapterCandidates(), extractChunkBlocks(), extractMarkerTitle(), isDecorationOnly(), makeChapterMatcher(), pushIfLineStart(), scoreHeadingCandidate(), stripDecoration() (+18 more)

### Community 1 - "devDependencies"
Cohesion: 0.06
Nodes (35): eslint, @eslint/js, eslint-plugin-svelte, globals, devDependencies, eslint, @eslint/js, eslint-plugin-svelte (+27 more)

### Community 2 - "epub-packer.ts"
Cohesion: 0.10
Nodes (34): buildEpubBlob(), EPUB_CSS, getDynamicCss(), AVAILABLE_FONTS, findFont(), fontFiles, fontMetaMap, getFontCSSDeclaration() (+26 more)

### Community 3 - "utils/index.ts"
Cohesion: 0.06
Nodes (34): BOLD_ITALIC_PATTERNS, BOLD_PATTERNS, convertBrackets(), fixMarkdownZip(), ITALIC_PATTERNS, MarkdownFixerState, UNDERLINE_PATTERNS, applyGrayscale() (+26 more)

### Community 4 - "generate-fonts-meta.js"
Cohesion: 0.29
Nodes (6): files, fontkit, FONTS_DIR, metadata, OUTPUT_FILE, require

### Community 5 - "scripts"
Cohesion: 0.10
Nodes (20): fontkit, jszip, dependencies, fontkit, jszip, name, private, scripts (+12 more)

### Community 6 - "entry"
Cohesion: 0.14
Nodes (13): entry, ignoreDependencies, project, $schema, src/**/*.{js,ts,svelte}, src/lib/epub-packer/parser/epub-parser.ts, src/lib/types/index.ts, src/lib/utils/index.ts (+5 more)

### Community 7 - "EpubState"
Cohesion: 0.17
Nodes (11): EpubState, EpubFontsState, EpubJacketState, EpubMetadataState, EpubJacketModalProps, EpubMetadataSectionProps, EpubPackSectionProps, EpubSectionBaseProps (+3 more)

### Community 8 - "epub-source-state.svelte.ts"
Cohesion: 0.12
Nodes (22): assignSequentialChapterIds(), endsWithSentencePunctuation(), parseMarkdownBlocks(), startsWithLowercaseLetter(), cleanHeaderFooterOcr(), compileCleanKeywords(), getCleanedLinesReport(), isLineHeaderFooter() (+14 more)

### Community 9 - "types/index.ts"
Cohesion: 0.17
Nodes (4): ButtonProps, DropZoneProps, InputProps, PageHeaderProps

### Community 10 - "compilerOptions"
Cohesion: 0.11
Nodes (17): src/**/*, .svelte-kit/ambient.d.ts, .svelte-kit/non-ambient.d.ts, ./.svelte-kit/tsconfig.json, .svelte-kit/types/**/$types.d.ts, compilerOptions, allowJs, checkJs (+9 more)

### Community 11 - "helpers.test.ts"
Cohesion: 0.29
Nodes (4): Window, mockAnchor, mockDocument, mockPdfjsLib

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

- **Why does `Logger` connect `utils/index.ts` to `epub-parser.ts`, `epub-source-state.svelte.ts`, `epub-packer.ts`?**
  _High betweenness centrality (0.050) - this node is a cross-community bridge._
- **Why does `EpubImagesState` connect `EpubImagesState` to `epub-packer.ts`, `utils/index.ts`, `EpubState`?**
  _High betweenness centrality (0.044) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `devDependencies` to `scripts`?**
  _High betweenness centrality (0.019) - this node is a cross-community bridge._
- **What connects `gitignorePath`, `$schema`, `src/**/*.{js,ts,svelte}` to the rest of the system?**
  _102 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.05714285714285714 - nodes in this community are weakly interconnected._
- **Should `epub-packer.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.10459183673469388 - nodes in this community are weakly interconnected._
- **Should `utils/index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.061952074810052604 - nodes in this community are weakly interconnected._