# Graph Report - .  (2026-08-14)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 260 nodes · 462 edges · 29 communities (22 shown, 7 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 7 edges (avg confidence: 0.83)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `dd8d5f03`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- epub-parser.js
- devDependencies
- epub-packer.js
- pdf-splitter.js
- scripts
- helpers.js
- logger.js
- EpubState
- entry
- Ebook Forge
- compilerOptions
- epub-ocr-utils.js
- generate-fonts-meta.js
- EPUB Logic Update
- Q: dua vao report cua graphify, xem thu project co van de gi ko, co gi can phai sua chua dieu chinh khong
- Bluesky Icon
- helpers.test.js
- app.html
- Graphify Agent Rule
- eslint.config.js
- Application Branding
- Documentation Icon
- Social Icon

## God Nodes (most connected - your core abstractions)
1. `buildEpubBlob()` - 15 edges
2. `EpubState` - 13 edges
3. `escapeXml()` - 13 edges
4. `scripts` - 10 edges
5. `findFont()` - 10 edges
6. `renderMarkdownBlocks()` - 9 edges
7. `groupChaptersSingle()` - 9 edges
8. `groupChaptersZip()` - 9 edges
9. `PdfSplitterState` - 9 edges
10. `Ebook Forge` - 8 edges

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
- **Markdown to HTML Conversion Rules** — _task_update_markdown_bold, _task_update_markdown_italic [EXTRACTED 1.00]
- **Ebook Forge Web Features** — readme_pdf_processor, readme_markdown_fixer, readme_epub_packer [EXTRACTED 1.00]
- **Icons SVG Sprite Sheet Collection** — static_icons_bluesky_icon, static_icons_discord_icon, static_icons_documentation_icon, static_icons_github_icon, static_icons_social_icon, static_icons_x_icon [EXTRACTED 1.00]

## Communities (29 total, 7 thin omitted)

### Community 0 - "epub-parser.js"
Cohesion: 0.18
Nodes (29): analyzeChapterCandidates(), extractChunkBlocks(), extractMarkerTitle(), isDecorationOnly(), makeChapterMatcher(), pushIfLineStart(), scoreHeadingCandidate(), stripDecoration() (+21 more)

### Community 1 - "devDependencies"
Cohesion: 0.07
Nodes (29): eslint, @eslint/js, eslint-plugin-svelte, globals, devDependencies, eslint, @eslint/js, eslint-plugin-svelte (+21 more)

### Community 2 - "epub-packer.js"
Cohesion: 0.18
Nodes (19): buildChapterXhtml(), buildContainerXml(), buildContentOpf(), buildEpubBlob(), buildNavXhtml(), buildTocNcx(), EPUB_CSS, getDynamicCss() (+11 more)

### Community 3 - "pdf-splitter.js"
Cohesion: 0.12
Nodes (10): applyGrayscale(), formatEta(), loadPdfPreview(), pickConcurrency(), processPdfToJpg(), PdfSplitterState, createdCanvases, mockDoc (+2 more)

### Community 4 - "scripts"
Cohesion: 0.10
Nodes (19): fontkit, jszip, dependencies, fontkit, jszip, name, private, scripts (+11 more)

### Community 5 - "helpers.js"
Cohesion: 0.20
Nodes (5): ensureEpubExt(), ensureZipExt(), slugify(), triggerDownload(), MarkdownFixerState

### Community 6 - "logger.js"
Cohesion: 0.21
Nodes (11): error(), isDebug(), log(), setDebug(), warn(), BOLD_ITALIC_PATTERNS, BOLD_PATTERNS, convertBrackets() (+3 more)

### Community 8 - "entry"
Cohesion: 0.17
Nodes (11): entry, ignore, project, $schema, src/**/*.{js,svelte}, src/lib/epub-packer/epub-parser.js, src/lib/index.js, src/routes/**/+layout.{svelte,js,ts} (+3 more)

### Community 9 - "Ebook Forge"
Cohesion: 0.18
Nodes (11): Cloudflare Pages Deployment, Ebook Forge, EPUB Packer, jszip, Markdown Fixer, PDF Processor, pdf.js, SvelteKit (+3 more)

### Community 10 - "compilerOptions"
Cohesion: 0.29
Nodes (6): compilerOptions, allowJs, checkJs, moduleResolution, extends, ./.svelte-kit/tsconfig.json

### Community 11 - "epub-ocr-utils.js"
Cohesion: 0.67
Nodes (6): cleanHeaderFooterOcr(), compileCleanKeywords(), getCleanedLinesReport(), isLineHeaderFooter(), shouldSkipHeaderFooter(), normalizeCharPreserveLength()

### Community 12 - "generate-fonts-meta.js"
Cohesion: 0.29
Nodes (6): files, fontkit, FONTS_DIR, metadata, OUTPUT_FILE, require

### Community 13 - "EPUB Logic Update"
Cohesion: 0.40
Nodes (5): EPUB Logic Update, Markdown Bold Conversion, Markdown Italic Conversion, Raw Format Toggle, ZIP Heuristic Processing

### Community 14 - "Q: dua vao report cua graphify, xem thu project co van de gi ko, co gi can phai sua chua dieu chinh khong"
Cohesion: 0.40
Nodes (4): Answer, Outcome, Q: dua vao report cua graphify, xem thu project co van de gi ko, co gi can phai sua chua dieu chinh khong, Source Nodes

### Community 15 - "Bluesky Icon"
Cohesion: 0.67
Nodes (4): Bluesky Icon, Discord Icon, GitHub Icon, X Icon

### Community 16 - "helpers.test.js"
Cohesion: 0.50
Nodes (3): mockAnchor, mockDocument, mockPdfjsLib

## Knowledge Gaps
- **84 isolated node(s):** `gitignorePath`, `extends`, `./.svelte-kit/tsconfig.json`, `allowJs`, `checkJs` (+79 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `jszip` connect `scripts` to `epub-packer.js`, `pdf-splitter.js`, `logger.js`, `EpubState`?**
  _High betweenness centrality (0.212) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `devDependencies` to `scripts`?**
  _High betweenness centrality (0.143) - this node is a cross-community bridge._
- **What connects `gitignorePath`, `extends`, `./.svelte-kit/tsconfig.json` to the rest of the system?**
  _84 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.06896551724137931 - nodes in this community are weakly interconnected._
- **Should `pdf-splitter.js` be split into smaller, more focused modules?**
  _Cohesion score 0.12380952380952381 - nodes in this community are weakly interconnected._
- **Should `scripts` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._