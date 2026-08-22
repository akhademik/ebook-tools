# Graph Report - ebook-tools  (2026-08-22)

## Corpus Check
- 62 files · ~37,379 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 281 nodes · 532 edges · 28 communities (22 shown, 6 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 6 edges (avg confidence: 1.0)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `ab41d311`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- epub-parser.js
- devDependencies
- epub-packer.js
- ../src/lib/helpers/logger.js?test=2
- pdf-splitter.js
- scripts
- entry
- EpubState
- txt-parser.js
- epub/+page.svelte
- compilerOptions
- generate-fonts-meta.js
- Icons Sprite Map
- README.md
- Graphify Agent Rule
- eslint.config.js
- Dropcap styling logic change
- Favicon Logo

## God Nodes (most connected - your core abstractions)
1. `../src/lib/helpers/logger.js?test=2` - 25 edges
2. `EpubState` - 21 edges
3. `escapeXml()` - 17 edges
4. `buildEpubBlob()` - 14 edges
5. `scripts` - 10 edges
6. `renderMarkdownBlocks()` - 9 edges
7. `groupChaptersSingle()` - 9 edges
8. `groupChaptersZip()` - 9 edges
9. `parseTxtToChapters()` - 9 edges
10. `findFont()` - 9 edges

## Surprising Connections (you probably didn't know these)
- `convertInline()` --calls--> `escapeXml()`  [EXTRACTED]
  src/lib/epub-packer/parser/epub-markdown-utils.js → src/lib/utils/xml.js
- `renderMarkdownBlocks()` --calls--> `escapeXml()`  [EXTRACTED]
  src/lib/epub-packer/parser/epub-markdown-utils.js → src/lib/utils/xml.js
- `convertTxtInline()` --calls--> `escapeXml()`  [EXTRACTED]
  src/lib/epub-packer/parser/epub-markdown-utils.js → src/lib/utils/xml.js
- `applyInlineFormatting()` --calls--> `escapeXml()`  [EXTRACTED]
  src/lib/epub-packer/parser/txt-parser.js → src/lib/utils/xml.js
- `parseTxtToChapters()` --calls--> `escapeXml()`  [EXTRACTED]
  src/lib/epub-packer/parser/txt-parser.js → src/lib/utils/xml.js

## Import Cycles
- None detected.

## Communities (28 total, 6 thin omitted)

### Community 0 - "epub-parser.js"
Cohesion: 0.17
Nodes (31): analyzeChapterCandidates(), assignSequentialChapterIds(), extractChunkBlocks(), extractMarkerTitle(), isDecorationOnly(), makeChapterMatcher(), pushIfLineStart(), scoreHeadingCandidate() (+23 more)

### Community 1 - "devDependencies"
Cohesion: 0.07
Nodes (29): eslint, @eslint/js, eslint-plugin-svelte, globals, devDependencies, eslint, @eslint/js, eslint-plugin-svelte (+21 more)

### Community 2 - "epub-packer.js"
Cohesion: 0.21
Nodes (18): buildEpubBlob(), getDynamicCss(), AVAILABLE_FONTS, findFont(), fontFiles, getFontCSSDeclaration(), getFontFileName(), buildChapterXhtml() (+10 more)

### Community 3 - "../src/lib/helpers/logger.js?test=2"
Cohesion: 0.11
Nodes (22): EPUB_CSS, ../src/lib/helpers/logger.js?test=2, error(), isDebug(), log(), Logger, setDebug(), warn() (+14 more)

### Community 4 - "pdf-splitter.js"
Cohesion: 0.13
Nodes (13): applyGrayscale(), cropCanvas(), formatEta(), loadPdfPreview(), pickConcurrency(), processPdfToJpg(), runWorker(), updateProgress() (+5 more)

### Community 5 - "scripts"
Cohesion: 0.10
Nodes (19): fontkit, jszip, dependencies, fontkit, jszip, name, private, scripts (+11 more)

### Community 6 - "entry"
Cohesion: 0.14
Nodes (13): entry, ignore, ignoreDependencies, project, $schema, src/**/*.{js,svelte}, src/lib/epub-packer/parser/epub-parser.js, src/lib/index.js (+5 more)

### Community 8 - "txt-parser.js"
Cohesion: 0.52
Nodes (6): applyInlineFormatting(), escapeRegExp(), getClosingTag(), isIllustrationTag(), parseTxtToChapters(), stripHtmlTags()

### Community 10 - "compilerOptions"
Cohesion: 0.29
Nodes (6): compilerOptions, allowJs, checkJs, moduleResolution, extends, ./.svelte-kit/tsconfig.json

### Community 11 - "generate-fonts-meta.js"
Cohesion: 0.29
Nodes (6): files, fontkit, FONTS_DIR, metadata, OUTPUT_FILE, require

### Community 13 - "Icons Sprite Map"
Cohesion: 0.29
Nodes (7): Bluesky Icon, Discord Icon, Documentation Icon, GitHub Icon, Icons Sprite Map, Social Icon, X Icon

### Community 15 - "README.md"
Cohesion: 0.40
Nodes (4): EPUB Packer, Markdown Fixer, PDF Processor, TXT to PDF CJK Desktop App

## Knowledge Gaps
- **77 isolated node(s):** `gitignorePath`, `extends`, `./.svelte-kit/tsconfig.json`, `allowJs`, `checkJs` (+72 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `../src/lib/helpers/logger.js?test=2` connect `../src/lib/helpers/logger.js?test=2` to `epub-parser.js`, `epub-packer.js`, `pdf-splitter.js`, `txt-parser.js`, `epub/+page.svelte`?**
  _High betweenness centrality (0.134) - this node is a cross-community bridge._
- **Why does `EpubState` connect `EpubState` to `epub-parser.js`, `../src/lib/helpers/logger.js?test=2`?**
  _High betweenness centrality (0.063) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `devDependencies` to `scripts`?**
  _High betweenness centrality (0.024) - this node is a cross-community bridge._
- **What connects `gitignorePath`, `extends`, `./.svelte-kit/tsconfig.json` to the rest of the system?**
  _77 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.06896551724137931 - nodes in this community are weakly interconnected._
- **Should `../src/lib/helpers/logger.js?test=2` be split into smaller, more focused modules?**
  _Cohesion score 0.10634920634920635 - nodes in this community are weakly interconnected._
- **Should `pdf-splitter.js` be split into smaller, more focused modules?**
  _Cohesion score 0.12648221343873517 - nodes in this community are weakly interconnected._