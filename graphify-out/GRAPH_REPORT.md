# Graph Report - ebook-tools  (2026-08-22)

## Corpus Check
- 84 files · ~49,051 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 442 nodes · 891 edges · 30 communities (26 shown, 4 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 6 edges (avg confidence: 1.0)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `11108013`
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
- epub-editor.ts
- epub-source-state.svelte.ts

## God Nodes (most connected - your core abstractions)
1. `Logger` - 22 edges
2. `EpubEditorState` - 17 edges
3. `EpubImagesState` - 16 edges
4. `escapeXml()` - 16 edges
5. `buildEpubBlob()` - 14 edges
6. `EpubState` - 14 edges
7. `scripts` - 11 edges
8. `getAssetDataUrl()` - 11 edges
9. `EpubSourceState` - 10 edges
10. `compilerOptions` - 10 edges

## Surprising Connections (you probably didn't know these)
- `EpubEditorCodePaneProps` --references--> `EpubEditorState`  [EXTRACTED]
  src/lib/types/epub-editor.type.ts → src/lib/epub-editor/epub-editor-state.svelte.ts
- `EpubEditorModalProps` --references--> `EpubEditorState`  [EXTRACTED]
  src/lib/types/epub-editor.type.ts → src/lib/epub-editor/epub-editor-state.svelte.ts
- `EpubEditorPreviewPaneProps` --references--> `EpubEditorState`  [EXTRACTED]
  src/lib/types/epub-editor.type.ts → src/lib/epub-editor/epub-editor-state.svelte.ts
- `EpubEditorSidebarProps` --references--> `EpubEditorState`  [EXTRACTED]
  src/lib/types/epub-editor.type.ts → src/lib/epub-editor/epub-editor-state.svelte.ts
- `EpubState` --references--> `EpubFontsState`  [EXTRACTED]
  src/lib/epub-packer/epub-state.svelte.ts → src/lib/epub-packer/state/epub-fonts-state.svelte.ts

## Import Cycles
- 3-file cycle: `src/lib/epub-packer/epub-state.svelte.ts -> src/lib/types/index.ts -> src/lib/types/epub-components.type.ts -> src/lib/epub-packer/epub-state.svelte.ts`
- 3-file cycle: `src/lib/epub-editor/epub-editor-state.svelte.ts -> src/lib/types/index.ts -> src/lib/types/epub-editor.type.ts -> src/lib/epub-editor/epub-editor-state.svelte.ts`
- 4-file cycle: `src/lib/epub-packer/epub-state.svelte.ts -> src/lib/epub-packer/templates/fonts.ts -> src/lib/types/index.ts -> src/lib/types/epub-components.type.ts -> src/lib/epub-packer/epub-state.svelte.ts`
- 4-file cycle: `src/lib/epub-packer/epub-packer.ts -> src/lib/types/index.ts -> src/lib/types/epub-components.type.ts -> src/lib/epub-packer/epub-state.svelte.ts -> src/lib/epub-packer/epub-packer.ts`
- 4-file cycle: `src/lib/epub-editor/epub-editor-state.svelte.ts -> src/lib/epub-editor/epub-editor.ts -> src/lib/types/index.ts -> src/lib/types/epub-editor.type.ts -> src/lib/epub-editor/epub-editor-state.svelte.ts`
- 5-file cycle: `src/lib/epub-packer/epub-packer.ts -> src/lib/epub-packer/templates/fonts.ts -> src/lib/types/index.ts -> src/lib/types/epub-components.type.ts -> src/lib/epub-packer/epub-state.svelte.ts -> src/lib/epub-packer/epub-packer.ts`
- 5-file cycle: `src/lib/epub-packer/epub-packer.ts -> src/lib/epub-packer/templates/jacket-templates.ts -> src/lib/types/index.ts -> src/lib/types/epub-components.type.ts -> src/lib/epub-packer/epub-state.svelte.ts -> src/lib/epub-packer/epub-packer.ts`
- 5-file cycle: `src/lib/epub-packer/epub-packer.ts -> src/lib/epub-packer/xml-builders/chapter-builder.ts -> src/lib/types/index.ts -> src/lib/types/epub-components.type.ts -> src/lib/epub-packer/epub-state.svelte.ts -> src/lib/epub-packer/epub-packer.ts`
- 5-file cycle: `src/lib/epub-packer/epub-packer.ts -> src/lib/epub-packer/xml-builders/nav-builder.ts -> src/lib/types/index.ts -> src/lib/types/epub-components.type.ts -> src/lib/epub-packer/epub-state.svelte.ts -> src/lib/epub-packer/epub-packer.ts`
- 5-file cycle: `src/lib/epub-packer/epub-packer.ts -> src/lib/epub-packer/xml-builders/opf-builder.ts -> src/lib/types/index.ts -> src/lib/types/epub-components.type.ts -> src/lib/epub-packer/epub-state.svelte.ts -> src/lib/epub-packer/epub-packer.ts`
- 5-file cycle: `src/lib/epub-packer/epub-state.svelte.ts -> src/lib/epub-packer/state/index.ts -> src/lib/epub-packer/state/epub-images-state.svelte.ts -> src/lib/types/index.ts -> src/lib/types/epub-components.type.ts -> src/lib/epub-packer/epub-state.svelte.ts`
- 5-file cycle: `src/lib/epub-packer/epub-state.svelte.ts -> src/lib/epub-packer/state/index.ts -> src/lib/epub-packer/state/epub-source-state.svelte.ts -> src/lib/types/index.ts -> src/lib/types/epub-components.type.ts -> src/lib/epub-packer/epub-state.svelte.ts`

## Communities (30 total, 4 thin omitted)

### Community 0 - "epub-parser.ts"
Cohesion: 0.18
Nodes (30): analyzeChapterCandidates(), assignSequentialChapterIds(), extractChunkBlocks(), extractMarkerTitle(), isDecorationOnly(), makeChapterMatcher(), pushIfLineStart(), scoreHeadingCandidate() (+22 more)

### Community 1 - "devDependencies"
Cohesion: 0.06
Nodes (35): eslint, @eslint/js, eslint-plugin-svelte, globals, devDependencies, eslint, @eslint/js, eslint-plugin-svelte (+27 more)

### Community 2 - "epub-packer.ts"
Cohesion: 0.09
Nodes (36): buildEpubBlob(), EPUB_CSS, getDynamicCss(), EpubFontsState, EpubJacketState, AVAILABLE_FONTS, findFont(), fontFiles (+28 more)

### Community 3 - "utils/index.ts"
Cohesion: 0.06
Nodes (36): EpubMetadataState, BOLD_ITALIC_PATTERNS, BOLD_PATTERNS, convertBrackets(), fixMarkdownZip(), ITALIC_PATTERNS, MarkdownFixerState, UNDERLINE_PATTERNS (+28 more)

### Community 4 - "generate-fonts-meta.js"
Cohesion: 0.29
Nodes (6): files, fontkit, FONTS_DIR, metadata, OUTPUT_FILE, require

### Community 5 - "scripts"
Cohesion: 0.06
Nodes (34): @codemirror/commands, @codemirror/lang-css, @codemirror/lang-html, @codemirror/state, @codemirror/theme-one-dark, @codemirror/view, fontkit, jszip (+26 more)

### Community 6 - "entry"
Cohesion: 0.14
Nodes (13): entry, ignoreDependencies, project, $schema, src/**/*.{js,ts,svelte}, src/lib/epub-packer/parser/epub-parser.ts, src/lib/types/index.ts, src/lib/utils/index.ts (+5 more)

### Community 9 - "types/index.ts"
Cohesion: 0.08
Nodes (9): imagesCount, isDirty, othersCount, pagesCount, stylesCount, ButtonProps, DropZoneProps, InputProps (+1 more)

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

### Community 23 - "EpubImagesState"
Cohesion: 0.12
Nodes (8): EpubState, EpubImagesState, EpubJacketModalProps, EpubMetadataSectionProps, EpubPackSectionProps, EpubSectionBaseProps, EpubSourceSectionProps, EpubSyntaxModalProps

### Community 29 - "epub-editor.ts"
Cohesion: 0.12
Nodes (28): buildPreviewHtml(), categorizeFile(), deobfuscateAdobeFont(), deobfuscateIdpfFont(), escapeAttribute(), escapeRegExp(), exportEpubBlob(), extractLinkedCssPaths() (+20 more)

### Community 30 - "epub-source-state.svelte.ts"
Cohesion: 0.14
Nodes (18): cleanHeaderFooterOcr(), compileCleanKeywords(), getCleanedLinesReport(), isLineHeaderFooter(), shouldSkipHeaderFooter(), applyInlineFormatting(), escapeRegExp(), getClosingTag() (+10 more)

## Knowledge Gaps
- **114 isolated node(s):** `gitignorePath`, `$schema`, `src/**/*.{js,ts,svelte}`, `tests/**/*.{js,ts}`, `src/routes/**/+page.{svelte,js,ts}` (+109 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Logger` connect `utils/index.ts` to `epub-parser.ts`, `epub-packer.ts`, `epub-editor.ts`, `epub-source-state.svelte.ts`?**
  _High betweenness centrality (0.055) - this node is a cross-community bridge._
- **Why does `EpubImagesState` connect `EpubImagesState` to `epub-packer.ts`?**
  _High betweenness centrality (0.038) - this node is a cross-community bridge._
- **What connects `gitignorePath`, `$schema`, `src/**/*.{js,ts,svelte}` to the rest of the system?**
  _114 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.05714285714285714 - nodes in this community are weakly interconnected._
- **Should `epub-packer.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.08888888888888889 - nodes in this community are weakly interconnected._
- **Should `utils/index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05901639344262295 - nodes in this community are weakly interconnected._
- **Should `scripts` be split into smaller, more focused modules?**
  _Cohesion score 0.05714285714285714 - nodes in this community are weakly interconnected._