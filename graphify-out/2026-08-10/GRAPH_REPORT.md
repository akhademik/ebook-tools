# Graph Report - ebook-tools  (2026-08-10)

## Corpus Check
- 38 files · ~22,574 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 205 nodes · 355 edges · 26 communities (19 shown, 7 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 6 edges (avg confidence: 0.83)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `ba291a31`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- devDependencies
- compilerOptions
- helpers.js
- epub-parser.js
- scripts
- Ebook Forge
- epub-packer.js
- logger.js
- Bluesky Icon
- Graphify Agent Rule
- Application Branding
- Documentation Icon
- Social Icon
- EpubState
- Q: dua vao report cua graphify, xem thu project co van de gi ko, co gi can phai sua chua dieu chinh khong
- app.html
- eslint.config.js
- helpers.test.js

## God Nodes (most connected - your core abstractions)
1. `buildEpubBlob()` - 10 edges
2. `escapeXml()` - 10 edges
3. `groupChaptersSingle()` - 9 edges
4. `groupChaptersZip()` - 9 edges
5. `PdfSplitterState` - 9 edges
6. `scripts` - 8 edges
7. `renderMarkdownBlocks()` - 8 edges
8. `EpubState` - 8 edges
9. `Ebook Forge` - 8 edges
10. `cleanHeaderFooterOcr()` - 7 edges

## Surprising Connections (you probably didn't know these)
- `Robots.txt Policy` --conceptually_related_to--> `Ebook Forge`  [INFERRED]
  static/robots.txt → README.md
- `buildEpubBlob()` --references--> `jszip`  [EXTRACTED]
  src/lib/epub-packer/epub-packer.js → package.json
- `fixMarkdownZip()` --references--> `jszip`  [EXTRACTED]
  src/lib/markdown-fixer/markdown-fixer.js → package.json
- `processPdfToJpg()` --references--> `jszip`  [EXTRACTED]
  src/lib/pdf-splitter/pdf-splitter.js → package.json
- `convertInline()` --calls--> `escapeXml()`  [EXTRACTED]
  src/lib/epub-packer/epub-parser.js → src/lib/helpers/helpers.js

## Import Cycles
- 2-file cycle: `src/lib/epub-packer/epub-parser.js -> src/lib/epub-packer/epub-single-grouper.js -> src/lib/epub-packer/epub-parser.js`

## Hyperedges (group relationships)
- **Ebook Forge Web Features** — readme_pdf_processor, readme_markdown_fixer, readme_epub_packer [EXTRACTED 1.00]
- **Icons SVG Sprite Sheet Collection** — static_icons_bluesky_icon, static_icons_discord_icon, static_icons_documentation_icon, static_icons_github_icon, static_icons_social_icon, static_icons_x_icon [EXTRACTED 1.00]

## Communities (26 total, 7 thin omitted)

### Community 0 - "devDependencies"
Cohesion: 0.07
Nodes (27): eslint, @eslint/js, eslint-plugin-svelte, globals, devDependencies, eslint, @eslint/js, eslint-plugin-svelte (+19 more)

### Community 1 - "compilerOptions"
Cohesion: 0.29
Nodes (6): compilerOptions, allowJs, checkJs, moduleResolution, extends, ./.svelte-kit/tsconfig.json

### Community 2 - "helpers.js"
Cohesion: 0.14
Nodes (10): ensureEpubExt(), ensureZipExt(), slugify(), triggerDownload(), BOLD_ITALIC_PATTERNS, convertBrackets(), fixMarkdownZip(), ITALIC_PATTERNS (+2 more)

### Community 3 - "epub-parser.js"
Cohesion: 0.17
Nodes (32): analyzeChapterCandidates(), assignSequentialChapterIds(), cleanHeaderFooterOcr(), compileCleanKeywords(), convertInline(), convertTxtInline(), endsWithSentencePunctuation(), escapeRegExp() (+24 more)

### Community 4 - "scripts"
Cohesion: 0.12
Nodes (15): jszip, dependencies, jszip, name, private, scripts, build, cover (+7 more)

### Community 5 - "Ebook Forge"
Cohesion: 0.18
Nodes (11): Cloudflare Pages Deployment, Ebook Forge, EPUB Packer, jszip, Markdown Fixer, PDF Processor, pdf.js, SvelteKit (+3 more)

### Community 6 - "epub-packer.js"
Cohesion: 0.33
Nodes (11): buildChapterXhtml(), buildContainerXml(), buildContentOpf(), buildEpubBlob(), buildNavXhtml(), buildTocNcx(), EPUB_CSS, mergeBrokenParagraphs() (+3 more)

### Community 8 - "logger.js"
Cohesion: 0.14
Nodes (14): error(), isDebug(), log(), setDebug(), warn(), applyGrayscale(), formatEta(), loadPdfPreview() (+6 more)

### Community 9 - "Bluesky Icon"
Cohesion: 0.67
Nodes (4): Bluesky Icon, Discord Icon, GitHub Icon, X Icon

### Community 20 - "Q: dua vao report cua graphify, xem thu project co van de gi ko, co gi can phai sua chua dieu chinh khong"
Cohesion: 0.40
Nodes (4): Answer, Outcome, Q: dua vao report cua graphify, xem thu project co van de gi ko, co gi can phai sua chua dieu chinh khong, Source Nodes

### Community 23 - "helpers.test.js"
Cohesion: 0.50
Nodes (3): mockAnchor, mockDocument, mockPdfjsLib

## Knowledge Gaps
- **60 isolated node(s):** `gitignorePath`, `extends`, `./.svelte-kit/tsconfig.json`, `allowJs`, `checkJs` (+55 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `jszip` connect `scripts` to `logger.js`, `helpers.js`, `EpubState`, `epub-packer.js`?**
  _High betweenness centrality (0.242) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `devDependencies` to `scripts`?**
  _High betweenness centrality (0.176) - this node is a cross-community bridge._
- **What connects `gitignorePath`, `extends`, `./.svelte-kit/tsconfig.json` to the rest of the system?**
  _60 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.07407407407407407 - nodes in this community are weakly interconnected._
- **Should `helpers.js` be split into smaller, more focused modules?**
  _Cohesion score 0.13768115942028986 - nodes in this community are weakly interconnected._
- **Should `scripts` be split into smaller, more focused modules?**
  _Cohesion score 0.125 - nodes in this community are weakly interconnected._
- **Should `logger.js` be split into smaller, more focused modules?**
  _Cohesion score 0.14285714285714285 - nodes in this community are weakly interconnected._