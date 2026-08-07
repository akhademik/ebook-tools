# Graph Report - .  (2026-08-07)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 54 nodes · 68 edges · 13 communities (9 shown, 4 thin omitted)
- Extraction: 91% EXTRACTED · 9% INFERRED · 0% AMBIGUOUS · INFERRED: 6 edges (avg confidence: 0.85)
- Token cost: 312 input · 36 output

## Graph Freshness
- Built from commit: `fa4038bb`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Project Metadata and Styling
- Linting Dependencies
- Ebook Tool Components
- scripts
- helpers.js
- triggerDownload
- Social & UI Icons
- Hero Isometric Illustration
- JavaScript Logo
- Vite Logo

## God Nodes (most connected - your core abstractions)
1. `triggerDownload()` - 7 edges
2. `scripts` - 6 edges
3. `ensureZipExt()` - 5 edges
4. `initEpubPacker()` - 4 edges
5. `slugify()` - 4 edges
6. `initMdFixer()` - 4 edges
7. `initPdfProcessor()` - 4 edges
8. `ensureEpubExt()` - 3 edges
9. `Ebook Forge Index` - 3 edges
10. `Dashboard Panel` - 3 edges

## Surprising Connections (you probably didn't know these)
- `Ebook Forge Index` --references--> `Ebook Forge Logo`  [EXTRACTED]
  index.html → public/favicon.svg
- `initEpubPacker()` --calls--> `triggerDownload()`  [EXTRACTED]
  src/js/epub-packer.js → src/js/helpers.js
- `initEpubPacker()` --calls--> `ensureEpubExt()`  [EXTRACTED]
  src/js/epub-packer.js → src/js/helpers.js
- `initMdFixer()` --calls--> `ensureZipExt()`  [EXTRACTED]
  src/js/md-fixer.js → src/js/helpers.js
- `initPdfProcessor()` --calls--> `ensureZipExt()`  [EXTRACTED]
  src/js/pdf-processor.js → src/js/helpers.js

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Ebook Forge Toolset** — index_pdf_tool, index_md_tool, index_epub_tool [EXTRACTED 1.00]

## Communities (13 total, 4 thin omitted)

### Community 0 - "Project Metadata and Styling"
Cohesion: 0.20
Nodes (9): dependencies, tailwindcss, @tailwindcss/vite, name, private, type, version, tailwindcss (+1 more)

### Community 1 - "Linting Dependencies"
Cohesion: 0.22
Nodes (9): eslint, @eslint/js, globals, devDependencies, eslint, @eslint/js, globals, vite (+1 more)

### Community 2 - "Ebook Tool Components"
Cohesion: 0.32
Nodes (8): Dashboard Panel, EPUB Packaging Tool, Ebook Forge Index, Markdown Fixer Tool, PDF to JPG Tool, JSZip Library, PDF.js Library, Ebook Forge Logo

### Community 3 - "scripts"
Cohesion: 0.33
Nodes (6): scripts, build, dev, lint, lint:fix, preview

### Community 4 - "helpers.js"
Cohesion: 0.60
Nodes (4): initEpubPacker(), ensureEpubExt(), escapeXml(), slugify()

### Community 5 - "triggerDownload"
Cohesion: 0.67
Nodes (4): ensureZipExt(), triggerDownload(), initMdFixer(), initPdfProcessor()

## Knowledge Gaps
- **20 isolated node(s):** `name`, `version`, `private`, `type`, `dev` (+15 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `devDependencies` connect `Linting Dependencies` to `Project Metadata and Styling`?**
  _High betweenness centrality (0.110) - this node is a cross-community bridge._
- **Why does `scripts` connect `scripts` to `Project Metadata and Styling`?**
  _High betweenness centrality (0.076) - this node is a cross-community bridge._
- **What connects `name`, `version`, `private` to the rest of the system?**
  _20 weakly-connected nodes found - possible documentation gaps or missing edges._