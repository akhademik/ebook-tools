# Graph Report - ebook-tools  (2026-08-08)

## Corpus Check
- 18 files · ~11,684 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 136 nodes · 170 edges · 17 communities (15 shown, 2 thin omitted)
- Extraction: 94% EXTRACTED · 6% INFERRED · 0% AMBIGUOUS · INFERRED: 10 edges (avg confidence: 0.71)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `58dc89b5`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- package.json
- devDependencies
- pdf-utils.js
- jszip
- ⚒️ Ebook Forge — Bàn Xử Lý Tài Liệu
- pdf/+page.svelte
- epub-utils.js
- Graphify Agent Rule
- eslint.config.js
- compilerOptions

## God Nodes (most connected - your core abstractions)
1. `⚒️ Ebook Forge — Bàn Xử Lý Tài Liệu` - 9 edges
2. `escapeXml()` - 8 edges
3. `buildEpubBlob()` - 7 edges
4. `groupChapters()` - 7 edges
5. `scripts` - 6 edges
6. `💻 Hướng dẫn Cài đặt & Chạy ứng dụng` - 6 edges
7. `jszip` - 5 edges
8. `🚀 Các tính năng chính` - 5 edges
9. `compilerOptions` - 4 edges
10. `renderMarkdownBlocks()` - 4 edges

## Surprising Connections (you probably didn't know these)
- `buildEpubBlob()` --references--> `jszip`  [EXTRACTED]
  src/routes/epub/epub-utils.js → package.json
- `processPdfToJpg()` --references--> `jszip`  [EXTRACTED]
  src/routes/pdf/pdf-utils.js → package.json
- `fixMarkdownZip()` --references--> `jszip`  [EXTRACTED]
  src/routes/md/md-utils.js → package.json
- `handleFile()` --calls--> `slugify()`  [EXTRACTED]
  src/routes/pdf/+page.svelte → src/lib/helpers/helpers.js
- `downloadZip()` --calls--> `triggerDownload()`  [EXTRACTED]
  src/routes/pdf/+page.svelte → src/lib/helpers/helpers.js

## Import Cycles
- None detected.

## Communities (17 total, 2 thin omitted)

### Community 0 - "package.json"
Cohesion: 0.18
Nodes (10): name, private, scripts, build, dev, lint, prepare, preview (+2 more)

### Community 1 - "devDependencies"
Cohesion: 0.08
Nodes (25): eslint, @eslint/js, eslint-plugin-svelte, globals, devDependencies, eslint, @eslint/js, eslint-plugin-svelte (+17 more)

### Community 2 - "pdf-utils.js"
Cohesion: 0.28
Nodes (6): loadPreview(), processPdf(), applyGrayscale(), loadPdfPreview(), pickConcurrency(), processPdfToJpg()

### Community 3 - "jszip"
Cohesion: 0.29
Nodes (7): dependencies, jszip, jszip, BOLD_ITALIC_PATTERNS, convertBrackets(), fixMarkdownZip(), ITALIC_PATTERNS

### Community 4 - "⚒️ Ebook Forge — Bàn Xử Lý Tài Liệu"
Cohesion: 0.11
Nodes (18): 1. 📄 Tách trang PDF → JPG (PDF Processor), 2. ✍️ Markdown Fixer, 3. 📦 Đóng gói EPUB (EPUB Packer), 4. 💻 Desktop App: TXT → PDF CJK, 🛡️ Bảo mật & Quyền riêng tư, Chạy chế độ Phát triển (Development), Cài đặt, 🚀 Các tính năng chính (+10 more)

### Community 5 - "pdf/+page.svelte"
Cohesion: 0.18
Nodes (8): slugify(), triggerDownload(), downloadZip(), handleDragLeave(), handleDragOver(), handleDrop(), handleFile(), handleFileChange()

### Community 6 - "epub-utils.js"
Cohesion: 0.15
Nodes (25): escapeXml(), buildChapterXhtml(), buildContainerXml(), buildContentOpf(), buildEpubBlob(), buildNavXhtml(), buildTocNcx(), cleanHeaderFooterOcr() (+17 more)

### Community 11 - "compilerOptions"
Cohesion: 0.29
Nodes (6): compilerOptions, allowJs, checkJs, moduleResolution, extends, ./.svelte-kit/tsconfig.json

## Knowledge Gaps
- **48 isolated node(s):** `gitignorePath`, `extends`, `./.svelte-kit/tsconfig.json`, `allowJs`, `checkJs` (+43 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `jszip` connect `jszip` to `pdf-utils.js`, `epub-utils.js`?**
  _High betweenness centrality (0.267) - this node is a cross-community bridge._
- **Why does `dependencies` connect `jszip` to `package.json`?**
  _High betweenness centrality (0.243) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `devDependencies` to `package.json`?**
  _High betweenness centrality (0.223) - this node is a cross-community bridge._
- **What connects `gitignorePath`, `extends`, `./.svelte-kit/tsconfig.json` to the rest of the system?**
  _48 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._
- **Should `⚒️ Ebook Forge — Bàn Xử Lý Tài Liệu` be split into smaller, more focused modules?**
  _Cohesion score 0.10526315789473684 - nodes in this community are weakly interconnected._
- **Should `epub-utils.js` be split into smaller, more focused modules?**
  _Cohesion score 0.14814814814814814 - nodes in this community are weakly interconnected._