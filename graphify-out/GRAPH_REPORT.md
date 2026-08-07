# Graph Report - .  (2026-08-07)

## Corpus Check
- Corpus is ~10,910 words - fits in a single context window. You may not need a graph.

## Summary
- 50 nodes · 64 edges · 11 communities (9 shown, 2 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Package Dependencies & Styling
- ESLint Configuration & Tooling
- NPM Build & Lint Scripts
- EPUB Packing & XML Helpers
- PDF & Markdown File Processors
- UI Layout & Application Panels
- Graphify Rule & Workflow Configs
- Assets & Visual Media

## God Nodes (most connected - your core abstractions)
1. `triggerDownload()` - 7 edges
2. `scripts` - 6 edges
3. `ensureZipExt()` - 5 edges
4. `initEpubPacker()` - 4 edges
5. `slugify()` - 4 edges
6. `initMdFixer()` - 4 edges
7. `initPdfProcessor()` - 4 edges
8. `Ebook Forge UI Layout` - 4 edges
9. `ensureEpubExt()` - 3 edges
10. `@eslint/js` - 2 edges

## Surprising Connections (you probably didn't know these)
- `Ebook Forge UI Layout` --references--> `Favicon SVG Icon`  [EXTRACTED]
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

## Communities (11 total, 2 thin omitted)

### Community 0 - "Package Dependencies & Styling"
Cohesion: 0.20
Nodes (9): dependencies, tailwindcss, @tailwindcss/vite, name, private, type, version, tailwindcss (+1 more)

### Community 1 - "ESLint Configuration & Tooling"
Cohesion: 0.22
Nodes (9): eslint, @eslint/js, globals, devDependencies, eslint, @eslint/js, globals, vite (+1 more)

### Community 2 - "NPM Build & Lint Scripts"
Cohesion: 0.33
Nodes (6): scripts, build, dev, lint, lint:fix, preview

### Community 3 - "EPUB Packing & XML Helpers"
Cohesion: 0.60
Nodes (4): initEpubPacker(), ensureEpubExt(), escapeXml(), slugify()

### Community 4 - "PDF & Markdown File Processors"
Cohesion: 0.67
Nodes (4): ensureZipExt(), triggerDownload(), initMdFixer(), initPdfProcessor()

### Community 5 - "UI Layout & Application Panels"
Cohesion: 0.40
Nodes (5): Ebook Forge UI Layout, EPUB Packer Tool Panel, Markdown Fixer Tool Panel, PDF to JPG Tool Panel, Favicon SVG Icon

## Knowledge Gaps
- **22 isolated node(s):** `name`, `version`, `private`, `type`, `dev` (+17 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `devDependencies` connect `ESLint Configuration & Tooling` to `Package Dependencies & Styling`?**
  _High betweenness centrality (0.129) - this node is a cross-community bridge._
- **Why does `scripts` connect `NPM Build & Lint Scripts` to `Package Dependencies & Styling`?**
  _High betweenness centrality (0.089) - this node is a cross-community bridge._
- **What connects `name`, `version`, `private` to the rest of the system?**
  _22 weakly-connected nodes found - possible documentation gaps or missing edges._