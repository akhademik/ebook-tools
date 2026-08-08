# Graph Report - ebook-tools  (2026-08-08)

## Corpus Check
- 19 files · ~10,944 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 142 nodes · 180 edges · 17 communities (15 shown, 2 thin omitted)
- Extraction: 94% EXTRACTED · 6% INFERRED · 0% AMBIGUOUS · INFERRED: 10 edges (avg confidence: 0.71)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `ed8f513f`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- scripts
- devDependencies
- pdf-utils.js
- jszip
- ⚒️ Ebook Forge — Bàn Xử Lý Tài Liệu
- pdf/+page.svelte
- epub-utils.js
- Graphify Agent Rule
- eslint.config.js
- compilerOptions
- knip.json

## God Nodes (most connected - your core abstractions)
1. `escapeXml()` - 9 edges
2. `⚒️ Ebook Forge — Bàn Xử Lý Tài Liệu` - 9 edges
3. `scripts` - 8 edges
4. `buildEpubBlob()` - 7 edges
5. `groupChapters()` - 7 edges
6. `jszip` - 5 edges
7. `💻 Hướng dẫn Cài đặt & Chạy ứng dụng` - 5 edges
8. `compilerOptions` - 4 edges
9. `renderMarkdownBlocks()` - 4 edges
10. `buildChapterXhtml()` - 4 edges

## Surprising Connections (you probably didn't know these)
- `buildEpubBlob()` --references--> `jszip`  [EXTRACTED]
  src/lib/epub-utils.js → package.json
- `processPdfToJpg()` --references--> `jszip`  [EXTRACTED]
  src/lib/pdf-utils.js → package.json
- `fixMarkdownZip()` --references--> `jszip`  [EXTRACTED]
  src/lib/md-utils.js → package.json
- `convertInline()` --calls--> `escapeXml()`  [EXTRACTED]
  src/lib/epub-utils.js → src/lib/helpers.js
- `renderMarkdownBlocks()` --calls--> `escapeXml()`  [EXTRACTED]
  src/lib/epub-utils.js → src/lib/helpers.js

## Import Cycles
- None detected.

## Communities (17 total, 2 thin omitted)

### Community 0 - "scripts"
Cohesion: 0.15
Nodes (12): name, private, scripts, build, dev, lint, prepare, preview (+4 more)

### Community 1 - "devDependencies"
Cohesion: 0.07
Nodes (27): eslint, @eslint/js, eslint-plugin-svelte, globals, devDependencies, eslint, @eslint/js, eslint-plugin-svelte (+19 more)

### Community 2 - "pdf-utils.js"
Cohesion: 0.28
Nodes (6): applyGrayscale(), loadPdfPreview(), pickConcurrency(), processPdfToJpg(), loadPreview(), processPdf()

### Community 3 - "jszip"
Cohesion: 0.29
Nodes (7): dependencies, jszip, jszip, BOLD_ITALIC_PATTERNS, convertBrackets(), fixMarkdownZip(), ITALIC_PATTERNS

### Community 4 - "⚒️ Ebook Forge — Bàn Xử Lý Tài Liệu"
Cohesion: 0.12
Nodes (16): 1. 📄 Tách trang PDF → JPG (PDF Processor), 2. ✍️ Markdown Fixer, 3. 📦 Đóng gói EPUB (EPUB Packer), 🛡️ Bảo mật & Quyền riêng tư, Chạy chế độ Phát triển (Development), Cài đặt, 🛠️ Công nghệ sử dụng, 📂 Cấu trúc dự án (+8 more)

### Community 5 - "pdf/+page.svelte"
Cohesion: 0.19
Nodes (10): ensureEpubExt(), ensureZipExt(), slugify(), triggerDownload(), downloadZip(), handleDragLeave(), handleDragOver(), handleDrop() (+2 more)

### Community 6 - "epub-utils.js"
Cohesion: 0.15
Nodes (25): buildChapterXhtml(), buildContainerXml(), buildContentOpf(), buildEpubBlob(), buildNavXhtml(), buildTocNcx(), cleanHeaderFooterOcr(), convertInline() (+17 more)

### Community 11 - "compilerOptions"
Cohesion: 0.29
Nodes (6): compilerOptions, allowJs, checkJs, moduleResolution, extends, ./.svelte-kit/tsconfig.json

### Community 12 - "knip.json"
Cohesion: 0.50
Nodes (3): entry, $schema, index.html

## Knowledge Gaps
- **51 isolated node(s):** `gitignorePath`, `extends`, `./.svelte-kit/tsconfig.json`, `allowJs`, `checkJs` (+46 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `jszip` connect `jszip` to `pdf-utils.js`, `epub-utils.js`?**
  _High betweenness centrality (0.273) - this node is a cross-community bridge._
- **Why does `dependencies` connect `jszip` to `scripts`?**
  _High betweenness centrality (0.251) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `devDependencies` to `scripts`?**
  _High betweenness centrality (0.232) - this node is a cross-community bridge._
- **What connects `gitignorePath`, `extends`, `./.svelte-kit/tsconfig.json` to the rest of the system?**
  _51 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.07407407407407407 - nodes in this community are weakly interconnected._
- **Should `⚒️ Ebook Forge — Bàn Xử Lý Tài Liệu` be split into smaller, more focused modules?**
  _Cohesion score 0.11764705882352941 - nodes in this community are weakly interconnected._
- **Should `epub-utils.js` be split into smaller, more focused modules?**
  _Cohesion score 0.14814814814814814 - nodes in this community are weakly interconnected._