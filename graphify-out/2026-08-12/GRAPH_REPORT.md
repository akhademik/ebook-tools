# Graph Report - ebook-tools  (2026-08-12)

## Corpus Check
- 42 files · ~28,251 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 240 nodes · 431 edges · 27 communities (20 shown, 7 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 6 edges (avg confidence: 0.83)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `7f5500bf`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- devDependencies
- compilerOptions
- epub-state.svelte.js
- epub-parser.js
- scripts
- Ebook Forge
- epub-packer.js
- entry
- helpers.js
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
- logger.js

## God Nodes (most connected - your core abstractions)
1. `buildEpubBlob()` - 14 edges
2. `EpubState` - 13 edges
3. `escapeXml()` - 13 edges
4. `scripts` - 9 edges
5. `renderMarkdownBlocks()` - 9 edges
6. `groupChaptersSingle()` - 9 edges
7. `groupChaptersZip()` - 9 edges
8. `PdfSplitterState` - 9 edges
9. `makeChapterMatcher()` - 8 edges
10. `cleanHeaderFooterOcr()` - 8 edges

## Surprising Connections (you probably didn't know these)
- `Robots.txt Policy` --conceptually_related_to--> `Ebook Forge`  [INFERRED]
  static/robots.txt → README.md
- `buildEpubBlob()` --references--> `jszip`  [EXTRACTED]
  src/lib/epub-packer/epub-packer.js → package.json
- `fixMarkdownZip()` --references--> `jszip`  [EXTRACTED]
  src/lib/markdown-fixer/markdown-fixer.js → package.json
- `processPdfToJpg()` --references--> `jszip`  [EXTRACTED]
  src/lib/pdf-splitter/pdf-splitter.js → package.json
- `makeChapterMatcher()` --calls--> `normalizeCharPreserveLength()`  [EXTRACTED]
  src/lib/epub-packer/epub-chapter-utils.js → src/lib/helpers/helpers.js

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Ebook Forge Web Features** — readme_pdf_processor, readme_markdown_fixer, readme_epub_packer [EXTRACTED 1.00]
- **Icons SVG Sprite Sheet Collection** — static_icons_bluesky_icon, static_icons_discord_icon, static_icons_documentation_icon, static_icons_github_icon, static_icons_social_icon, static_icons_x_icon [EXTRACTED 1.00]

## Communities (27 total, 7 thin omitted)

### Community 0 - "devDependencies"
Cohesion: 0.07
Nodes (29): eslint, @eslint/js, eslint-plugin-svelte, globals, devDependencies, eslint, @eslint/js, eslint-plugin-svelte (+21 more)

### Community 1 - "compilerOptions"
Cohesion: 0.29
Nodes (6): compilerOptions, allowJs, checkJs, moduleResolution, extends, ./.svelte-kit/tsconfig.json

### Community 2 - "epub-state.svelte.js"
Cohesion: 0.47
Nodes (7): cleanHeaderFooterOcr(), compileCleanKeywords(), getCleanedLinesReport(), isLineHeaderFooter(), shouldSkipHeaderFooter(), EPUB_CSS, normalizeCharPreserveLength()

### Community 3 - "epub-parser.js"
Cohesion: 0.18
Nodes (29): analyzeChapterCandidates(), extractChunkBlocks(), extractMarkerTitle(), isDecorationOnly(), makeChapterMatcher(), pushIfLineStart(), scoreHeadingCandidate(), stripDecoration() (+21 more)

### Community 4 - "scripts"
Cohesion: 0.12
Nodes (16): jszip, dependencies, jszip, name, private, scripts, build, cover (+8 more)

### Community 5 - "Ebook Forge"
Cohesion: 0.18
Nodes (11): Cloudflare Pages Deployment, Ebook Forge, EPUB Packer, jszip, Markdown Fixer, PDF Processor, pdf.js, SvelteKit (+3 more)

### Community 6 - "epub-packer.js"
Cohesion: 0.23
Nodes (14): buildChapterXhtml(), buildContainerXml(), buildContentOpf(), buildEpubBlob(), buildNavXhtml(), buildTocNcx(), getDynamicCss(), getFontCSSDeclaration() (+6 more)

### Community 7 - "entry"
Cohesion: 0.17
Nodes (11): entry, ignore, project, $schema, src/**/*.{js,svelte}, src/lib/epub-packer/epub-parser.js, src/lib/index.js, src/routes/**/+layout.{svelte,js,ts} (+3 more)

### Community 8 - "helpers.js"
Cohesion: 0.10
Nodes (15): ensureEpubExt(), ensureZipExt(), slugify(), triggerDownload(), MarkdownFixerState, applyGrayscale(), formatEta(), loadPdfPreview() (+7 more)

### Community 9 - "Bluesky Icon"
Cohesion: 0.67
Nodes (4): Bluesky Icon, Discord Icon, GitHub Icon, X Icon

### Community 20 - "Q: dua vao report cua graphify, xem thu project co van de gi ko, co gi can phai sua chua dieu chinh khong"
Cohesion: 0.40
Nodes (4): Answer, Outcome, Q: dua vao report cua graphify, xem thu project co van de gi ko, co gi can phai sua chua dieu chinh khong, Source Nodes

### Community 23 - "helpers.test.js"
Cohesion: 0.50
Nodes (3): mockAnchor, mockDocument, mockPdfjsLib

### Community 24 - "logger.js"
Cohesion: 0.21
Nodes (11): error(), isDebug(), log(), setDebug(), warn(), BOLD_ITALIC_PATTERNS, BOLD_PATTERNS, convertBrackets() (+3 more)

## Knowledge Gaps
- **72 isolated node(s):** `gitignorePath`, `extends`, `./.svelte-kit/tsconfig.json`, `allowJs`, `checkJs` (+67 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `jszip` connect `scripts` to `logger.js`, `helpers.js`, `EpubState`, `epub-packer.js`?**
  _High betweenness centrality (0.225) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `devDependencies` to `scripts`?**
  _High betweenness centrality (0.160) - this node is a cross-community bridge._
- **What connects `gitignorePath`, `extends`, `./.svelte-kit/tsconfig.json` to the rest of the system?**
  _72 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.06896551724137931 - nodes in this community are weakly interconnected._
- **Should `scripts` be split into smaller, more focused modules?**
  _Cohesion score 0.11764705882352941 - nodes in this community are weakly interconnected._
- **Should `helpers.js` be split into smaller, more focused modules?**
  _Cohesion score 0.10080645161290322 - nodes in this community are weakly interconnected._