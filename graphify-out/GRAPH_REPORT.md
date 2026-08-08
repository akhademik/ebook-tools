# Graph Report - /home/hajtran/dev/ebook-tools  (2026-08-08)

## Corpus Check
- Corpus is ~11,851 words - fits in a single context window. You may not need a graph.

## Summary
- 146 nodes · 188 edges · 19 communities (15 shown, 4 thin omitted)
- Extraction: 91% EXTRACTED · 9% INFERRED · 0% AMBIGUOUS · INFERRED: 17 edges (avg confidence: 0.76)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Build & Dev Tooling
- Configurations & Aggregated Entrypoints
- User Interface Views & Layouts
- EPUB Parser Utilities
- Package Scripts
- Core Architecture & Overview
- EPUB Packers & Assembly
- PDF Pages to Image Processing
- Project Dependencies & Markdown Fixer
- Social Icons Assets
- Agent Customizations & Rules
- App Favicon Asset
- Documentation SVG Icon
- Social SVG Icon

## God Nodes (most connected - your core abstractions)
1. `escapeXml()` - 9 edges
2. `Ebook Forge` - 8 edges
3. `Query: Project Issues and Recommendations` - 8 edges
4. `buildEpubBlob()` - 7 edges
5. `groupChapters()` - 7 edges
6. `scripts` - 6 edges
7. `jszip` - 5 edges
8. `compilerOptions` - 4 edges
9. `buildChapterXhtml()` - 4 edges
10. `renderMarkdownBlocks()` - 4 edges

## Surprising Connections (you probably didn't know these)
- `Ignore Isolated Configuration Nodes` --rationale_for--> `allowJs`  [EXTRACTED]
  graphify-out/memory/query_20260808_104941_dua_vao_report_cua_graphify__xem_thu_project_co_va.md → jsconfig.json
- `Ignore Isolated Configuration Nodes` --rationale_for--> `checkJs`  [EXTRACTED]
  graphify-out/memory/query_20260808_104941_dua_vao_report_cua_graphify__xem_thu_project_co_va.md → jsconfig.json
- `Robots.txt Policy` --conceptually_related_to--> `Ebook Forge`  [INFERRED]
  static/robots.txt → README.md
- `buildEpubBlob()` --references--> `jszip`  [EXTRACTED]
  src/routes/epub/epub-packer.js → package.json
- `processPdfToJpg()` --references--> `jszip`  [EXTRACTED]
  src/routes/pdf/pdf-utils.js → package.json

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Ebook Forge Web Features** — readme_pdf_processor, readme_markdown_fixer, readme_epub_packer [EXTRACTED 1.00]
- **Icons SVG Sprite Sheet Collection** — static_icons_bluesky_icon, static_icons_discord_icon, static_icons_documentation_icon, static_icons_github_icon, static_icons_social_icon, static_icons_x_icon [EXTRACTED 1.00]
- **Graphify Analysis Findings and Recommendations** — graphify_out_memory_query_20260808_104941_dua_vao_report_cua_graphify__xem_thu_project_co_va_epub_split_concept, graphify_out_memory_query_20260808_104941_dua_vao_report_cua_graphify__xem_thu_project_co_va_jszip_duplication_concept, graphify_out_memory_query_20260808_104941_dua_vao_report_cua_graphify__xem_thu_project_co_va_txt_to_pdf_modularization_concept, graphify_out_memory_query_20260808_104941_dua_vao_report_cua_graphify__xem_thu_project_co_va_isolate_config_declutter [EXTRACTED 1.00]

## Communities (19 total, 4 thin omitted)

### Community 0 - "Build & Dev Tooling"
Cohesion: 0.08
Nodes (25): eslint, @eslint/js, eslint-plugin-svelte, globals, devDependencies, eslint, @eslint/js, eslint-plugin-svelte (+17 more)

### Community 1 - "Configurations & Aggregated Entrypoints"
Cohesion: 0.13
Nodes (14): gitignorePath, Split epub-utils.js, Ignore Isolated Configuration Nodes, JSZip Duplication Avoidance, Query: Project Issues and Recommendations, txt-to-pdf Helper Modularization, compilerOptions, allowJs (+6 more)

### Community 2 - "User Interface Views & Layouts"
Cohesion: 0.18
Nodes (8): slugify(), triggerDownload(), downloadZip(), handleDragLeave(), handleDragOver(), handleDrop(), handleFile(), handleFileChange()

### Community 3 - "EPUB Parser Utilities"
Cohesion: 0.20
Nodes (16): cleanHeaderFooterOcr(), convertInline(), endsWithSentencePunctuation(), extractChunkBlocks(), extractMarkerTitle(), findAllMarkerPositionsCombined(), groupChapters(), isDecorationOnly() (+8 more)

### Community 4 - "Package Scripts"
Cohesion: 0.18
Nodes (10): name, private, scripts, build, dev, lint, prepare, preview (+2 more)

### Community 5 - "Core Architecture & Overview"
Cohesion: 0.18
Nodes (11): Cloudflare Pages Deployment, Ebook Forge, EPUB Packer, jszip, Markdown Fixer, PDF Processor, pdf.js, SvelteKit (+3 more)

### Community 6 - "EPUB Packers & Assembly"
Cohesion: 0.42
Nodes (9): escapeXml(), buildChapterXhtml(), buildContainerXml(), buildContentOpf(), buildEpubBlob(), buildNavXhtml(), buildTocNcx(), EPUB_CSS (+1 more)

### Community 7 - "PDF Pages to Image Processing"
Cohesion: 0.28
Nodes (6): loadPreview(), processPdf(), applyGrayscale(), loadPdfPreview(), pickConcurrency(), processPdfToJpg()

### Community 8 - "Project Dependencies & Markdown Fixer"
Cohesion: 0.29
Nodes (7): dependencies, jszip, jszip, BOLD_ITALIC_PATTERNS, convertBrackets(), fixMarkdownZip(), ITALIC_PATTERNS

### Community 9 - "Social Icons Assets"
Cohesion: 0.67
Nodes (4): Bluesky Icon, Discord Icon, GitHub Icon, X Icon

## Knowledge Gaps
- **44 isolated node(s):** `gitignorePath`, `extends`, `./.svelte-kit/tsconfig.json`, `moduleResolution`, `name` (+39 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `jszip` connect `Project Dependencies & Markdown Fixer` to `EPUB Packers & Assembly`, `PDF Pages to Image Processing`?**
  _High betweenness centrality (0.308) - this node is a cross-community bridge._
- **Why does `dependencies` connect `Project Dependencies & Markdown Fixer` to `Package Scripts`?**
  _High betweenness centrality (0.283) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `Build & Dev Tooling` to `Package Scripts`?**
  _High betweenness centrality (0.241) - this node is a cross-community bridge._
- **What connects `gitignorePath`, `extends`, `./.svelte-kit/tsconfig.json` to the rest of the system?**
  _44 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Build & Dev Tooling` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._
- **Should `Configurations & Aggregated Entrypoints` be split into smaller, more focused modules?**
  _Cohesion score 0.12631578947368421 - nodes in this community are weakly interconnected._