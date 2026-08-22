# Graph Report - ebook-tools  (2026-08-22)

## Corpus Check
- 62 files · ~39,148 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 335 nodes · 644 edges · 28 communities (23 shown, 5 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 6 edges (avg confidence: 1.0)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `4947295a`
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
- epub-state.svelte.ts
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
1. `../src/lib/helpers/logger.js?test=2` - 26 edges
2. `EpubState` - 21 edges
3. `escapeXml()` - 17 edges
4. `buildEpubBlob()` - 14 edges
5. `scripts` - 11 edges
6. `compilerOptions` - 10 edges
7. `renderMarkdownBlocks()` - 9 edges
8. `groupChaptersSingle()` - 9 edges
9. `groupChaptersZip()` - 9 edges
10. `parseTxtToChapters()` - 9 edges

## Surprising Connections (you probably didn't know these)
- `convertInline()` --calls--> `escapeXml()`  [EXTRACTED]
  src/lib/epub-packer/parser/epub-markdown-utils.ts → src/lib/utils/xml.ts
- `renderMarkdownBlocks()` --calls--> `escapeXml()`  [EXTRACTED]
  src/lib/epub-packer/parser/epub-markdown-utils.ts → src/lib/utils/xml.ts
- `convertTxtInline()` --calls--> `escapeXml()`  [EXTRACTED]
  src/lib/epub-packer/parser/epub-markdown-utils.ts → src/lib/utils/xml.ts
- `applyInlineFormatting()` --calls--> `escapeXml()`  [EXTRACTED]
  src/lib/epub-packer/parser/txt-parser.ts → src/lib/utils/xml.ts
- `parseTxtToChapters()` --calls--> `escapeXml()`  [EXTRACTED]
  src/lib/epub-packer/parser/txt-parser.ts → src/lib/utils/xml.ts

## Import Cycles
- None detected.

## Communities (28 total, 5 thin omitted)

### Community 0 - "epub-parser.ts"
Cohesion: 0.14
Nodes (40): analyzeChapterCandidates(), assignSequentialChapterIds(), ChapterCandidateItem, ChapterCutPoint, ChapterMatcher, extractChunkBlocks(), extractMarkerTitle(), isDecorationOnly() (+32 more)

### Community 1 - "devDependencies"
Cohesion: 0.06
Nodes (35): eslint, @eslint/js, eslint-plugin-svelte, globals, devDependencies, eslint, @eslint/js, eslint-plugin-svelte (+27 more)

### Community 2 - "epub-packer.ts"
Cohesion: 0.14
Nodes (25): buildEpubBlob(), CoverBlobItem, getDynamicCss(), findFont(), getFontCSSDeclaration(), getFontFileName(), JACKET_TEMPLATES, JacketTemplate (+17 more)

### Community 3 - "../src/lib/helpers/logger.js?test=2"
Cohesion: 0.09
Nodes (26): Window, ../src/lib/helpers/logger.js?test=2, error(), isDebug(), log(), Logger, LogLevel, setDebug() (+18 more)

### Community 4 - "pdf-splitter.ts"
Cohesion: 0.11
Nodes (16): applyGrayscale(), cropCanvas(), formatEta(), loadPdfPreview(), PdfPreviewPage, PdfProgressInfo, pickConcurrency(), ProcessPdfResult (+8 more)

### Community 5 - "scripts"
Cohesion: 0.10
Nodes (20): fontkit, jszip, dependencies, fontkit, jszip, name, private, scripts (+12 more)

### Community 6 - "entry"
Cohesion: 0.14
Nodes (13): entry, ignore, ignoreDependencies, project, $schema, src/**/*.{js,svelte}, src/lib/epub-packer/parser/epub-parser.js, src/lib/index.js (+5 more)

### Community 8 - "txt-parser.ts"
Cohesion: 0.39
Nodes (8): CustomDefinition, applyInlineFormatting(), escapeRegExp(), getClosingTag(), isIllustrationTag(), ParseTxtOptions, parseTxtToChapters(), stripHtmlTags()

### Community 9 - "epub-state.svelte.ts"
Cohesion: 0.14
Nodes (7): EPUB_CSS, EpubFontsConfig, EpubJacketConfig, AVAILABLE_FONTS, fontFiles, FontInfo, fontMetaMap

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
- **103 isolated node(s):** `gitignorePath`, `$schema`, `src/**/*.{js,svelte}`, `tests/**/*.js`, `src/routes/**/+page.{svelte,js,ts}` (+98 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `../src/lib/helpers/logger.js?test=2` connect `../src/lib/helpers/logger.js?test=2` to `epub-parser.ts`, `epub-packer.ts`, `pdf-splitter.ts`, `txt-parser.ts`, `epub-state.svelte.ts`?**
  _High betweenness centrality (0.129) - this node is a cross-community bridge._
- **Why does `EpubState` connect `EpubState` to `epub-state.svelte.ts`, `epub-packer.ts`?**
  _High betweenness centrality (0.051) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `devDependencies` to `scripts`?**
  _High betweenness centrality (0.023) - this node is a cross-community bridge._
- **What connects `gitignorePath`, `$schema`, `src/**/*.{js,svelte}` to the rest of the system?**
  _103 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `epub-parser.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.13829787234042554 - nodes in this community are weakly interconnected._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.05714285714285714 - nodes in this community are weakly interconnected._
- **Should `epub-packer.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.13940256045519203 - nodes in this community are weakly interconnected._