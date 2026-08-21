# Graph Report - ebook-tools  (2026-08-21)

## Corpus Check
- 46 files · ~32,215 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 259 nodes · 467 edges · 28 communities (23 shown, 5 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 7 edges (avg confidence: 0.97)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `7d0e1115`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- epub-parser.js
- devDependencies
- epub-packer.js
- helpers.js
- pdf-splitter.js
- scripts
- entry
- EpubState
- ../src/lib/helpers/logger.js?test=2
- compilerOptions
- generate-fonts-meta.js
- epub-ocr-utils.js
- Icons Sprite Map
- Graphify Query Memory 20260808
- README.md
- Graphify Agent Rule
- eslint.config.js
- Dropcap styling logic change
- Favicon Logo

## God Nodes (most connected - your core abstractions)
1. `EpubState` - 17 edges
2. `../src/lib/helpers/logger.js?test=2` - 16 edges
3. `buildEpubBlob()` - 14 edges
4. `escapeXml()` - 14 edges
5. `scripts` - 10 edges
6. `renderMarkdownBlocks()` - 9 edges
7. `groupChaptersSingle()` - 9 edges
8. `groupChaptersZip()` - 9 edges
9. `PdfSplitterState` - 9 edges
10. `makeChapterMatcher()` - 8 edges

## Surprising Connections (you probably didn't know these)
- `makeChapterMatcher()` --calls--> `normalizeCharPreserveLength()`  [EXTRACTED]
  src/lib/epub-packer/parser/epub-chapter-utils.js → src/lib/helpers/helpers.js
- `convertInline()` --calls--> `escapeXml()`  [EXTRACTED]
  src/lib/epub-packer/parser/epub-markdown-utils.js → src/lib/helpers/helpers.js
- `renderMarkdownBlocks()` --calls--> `escapeXml()`  [EXTRACTED]
  src/lib/epub-packer/parser/epub-markdown-utils.js → src/lib/helpers/helpers.js
- `convertTxtInline()` --calls--> `escapeXml()`  [EXTRACTED]
  src/lib/epub-packer/parser/epub-markdown-utils.js → src/lib/helpers/helpers.js
- `applyInlineFormatting()` --calls--> `escapeXml()`  [EXTRACTED]
  src/lib/epub-packer/parser/txt-parser.js → src/lib/helpers/helpers.js

## Import Cycles
- None detected.

## Communities (28 total, 5 thin omitted)

### Community 0 - "epub-parser.js"
Cohesion: 0.23
Nodes (24): analyzeChapterCandidates(), extractChunkBlocks(), extractMarkerTitle(), isDecorationOnly(), makeChapterMatcher(), pushIfLineStart(), scoreHeadingCandidate(), stripDecoration() (+16 more)

### Community 1 - "devDependencies"
Cohesion: 0.07
Nodes (29): eslint, @eslint/js, eslint-plugin-svelte, globals, devDependencies, eslint, @eslint/js, eslint-plugin-svelte (+21 more)

### Community 2 - "epub-packer.js"
Cohesion: 0.17
Nodes (21): buildChapterXhtml(), buildContainerXml(), buildContentOpf(), buildEpubBlob(), buildNavXhtml(), buildTocNcx(), EPUB_CSS, getDynamicCss() (+13 more)

### Community 3 - "helpers.js"
Cohesion: 0.10
Nodes (14): ensureZipExt(), slugify(), triggerDownload(), BOLD_ITALIC_PATTERNS, BOLD_PATTERNS, convertBrackets(), fixMarkdownZip(), ITALIC_PATTERNS (+6 more)

### Community 4 - "pdf-splitter.js"
Cohesion: 0.22
Nodes (12): applyGrayscale(), cropCanvas(), formatEta(), loadPdfPreview(), pickConcurrency(), processPdfToJpg(), runWorker(), updateProgress() (+4 more)

### Community 5 - "scripts"
Cohesion: 0.10
Nodes (19): fontkit, jszip, dependencies, fontkit, jszip, name, private, scripts (+11 more)

### Community 6 - "entry"
Cohesion: 0.14
Nodes (13): entry, ignore, ignoreDependencies, project, $schema, src/**/*.{js,svelte}, src/lib/epub-packer/parser/epub-parser.js, src/lib/index.js (+5 more)

### Community 8 - "../src/lib/helpers/logger.js?test=2"
Cohesion: 0.27
Nodes (11): applyInlineFormatting(), escapeRegExp(), getClosingTag(), parseTxtToChapters(), stripHtmlTags(), ../src/lib/helpers/logger.js?test=2, error(), isDebug() (+3 more)

### Community 10 - "compilerOptions"
Cohesion: 0.29
Nodes (6): compilerOptions, allowJs, checkJs, moduleResolution, extends, ./.svelte-kit/tsconfig.json

### Community 11 - "generate-fonts-meta.js"
Cohesion: 0.29
Nodes (6): files, fontkit, FONTS_DIR, metadata, OUTPUT_FILE, require

### Community 12 - "epub-ocr-utils.js"
Cohesion: 0.67
Nodes (6): cleanHeaderFooterOcr(), compileCleanKeywords(), getCleanedLinesReport(), isLineHeaderFooter(), shouldSkipHeaderFooter(), normalizeCharPreserveLength()

### Community 13 - "Icons Sprite Map"
Cohesion: 0.29
Nodes (7): Bluesky Icon, Discord Icon, Documentation Icon, GitHub Icon, Icons Sprite Map, Social Icon, X Icon

### Community 14 - "Graphify Query Memory 20260808"
Cohesion: 0.40
Nodes (4): Graphify Query Memory 20260808, epub-utils.js low cohesion suggestion, JSZip duplication warning, txt-to-pdf helper modularization suggestion

### Community 15 - "README.md"
Cohesion: 0.40
Nodes (4): EPUB Packer, Markdown Fixer, PDF Processor, TXT to PDF CJK Desktop App

## Knowledge Gaps
- **77 isolated node(s):** `gitignorePath`, `extends`, `./.svelte-kit/tsconfig.json`, `allowJs`, `checkJs` (+72 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `../src/lib/helpers/logger.js?test=2` connect `../src/lib/helpers/logger.js?test=2` to `epub-parser.js`, `epub-packer.js`, `helpers.js`, `pdf-splitter.js`, `epub-ocr-utils.js`?**
  _High betweenness centrality (0.085) - this node is a cross-community bridge._
- **Why does `EpubState` connect `EpubState` to `epub-packer.js`?**
  _High betweenness centrality (0.048) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `devDependencies` to `scripts`?**
  _High betweenness centrality (0.028) - this node is a cross-community bridge._
- **What connects `gitignorePath`, `extends`, `./.svelte-kit/tsconfig.json` to the rest of the system?**
  _77 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.06896551724137931 - nodes in this community are weakly interconnected._
- **Should `helpers.js` be split into smaller, more focused modules?**
  _Cohesion score 0.10114942528735632 - nodes in this community are weakly interconnected._
- **Should `scripts` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._