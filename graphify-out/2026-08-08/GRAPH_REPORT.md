# Graph Report - ebook-tools  (2026-08-08)

## Corpus Check
- 16 files · ~10,754 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 171 nodes · 212 edges · 21 communities (19 shown, 2 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 6 edges (avg confidence: 0.5)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `88bc747e`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- scripts
- devDependencies
- epub/+page.svelte
- md/+page.svelte
- ⚒️ Ebook Forge — Bàn Xử Lý Tài Liệu
- pdf/+page.svelte
- escapeXml
- Graphify Agent Rule
- eslint.config.js
- groupChapters
- compilerOptions
- knip.json
- findAllMarkerPositionsCombined
- handleFile
- parseMarkdownBlocks

## God Nodes (most connected - your core abstractions)
1. `⚒️ Ebook Forge — Bàn Xử Lý Tài Liệu` - 9 edges
2. `scripts` - 8 edges
3. `escapeXml()` - 8 edges
4. `buildEpubBlob()` - 8 edges
5. `groupChapters()` - 8 edges
6. `jszip` - 5 edges
7. `slugify()` - 5 edges
8. `applyEpubGrouping()` - 5 edges
9. `handleFile()` - 5 edges
10. `💻 Hướng dẫn Cài đặt & Chạy ứng dụng` - 5 edges

## Surprising Connections (you probably didn't know these)
- `buildEpubBlob()` --references--> `jszip`  [EXTRACTED]
  src/routes/epub/+page.svelte → package.json
- `processMarkdownZip()` --references--> `jszip`  [EXTRACTED]
  src/routes/md/+page.svelte → package.json
- `loadZipContent()` --references--> `jszip`  [EXTRACTED]
  src/routes/epub/+page.svelte → package.json
- `handleFile()` --calls--> `slugify()`  [EXTRACTED]
  src/routes/epub/+page.svelte → src/lib/helpers.js
- `handleFile()` --calls--> `slugify()`  [EXTRACTED]
  src/routes/pdf/+page.svelte → src/lib/helpers.js

## Import Cycles
- None detected.

## Communities (21 total, 2 thin omitted)

### Community 0 - "scripts"
Cohesion: 0.12
Nodes (16): dependencies, jszip, jszip, name, private, scripts, build, dev (+8 more)

### Community 1 - "devDependencies"
Cohesion: 0.07
Nodes (27): eslint, @eslint/js, eslint-plugin-svelte, globals, devDependencies, eslint, @eslint/js, eslint-plugin-svelte (+19 more)

### Community 2 - "epub/+page.svelte"
Cohesion: 0.08
Nodes (21): author, cleanKeywords, epubBlob, epubChapters, epubFileSelected, epubOutName, epubOutNamePreview, epubRawFiles (+13 more)

### Community 3 - "md/+page.svelte"
Cohesion: 0.16
Nodes (13): ensureEpubExt(), ensureZipExt(), slugify(), triggerDownload(), downloadEpub(), convertBrackets(), downloadZip(), handleDrop() (+5 more)

### Community 4 - "⚒️ Ebook Forge — Bàn Xử Lý Tài Liệu"
Cohesion: 0.12
Nodes (16): 1. 📄 Tách trang PDF → JPG (PDF Processor), 2. ✍️ Markdown Fixer, 3. 📦 Đóng gói EPUB (EPUB Packer), 🛡️ Bảo mật & Quyền riêng tư, Chạy chế độ Phát triển (Development), Cài đặt, 🛠️ Công nghệ sử dụng, 📂 Cấu trúc dự án (+8 more)

### Community 5 - "pdf/+page.svelte"
Cohesion: 0.16
Nodes (7): applyGrayscale(), handleDrop(), handleFile(), handleFileChange(), loadPreview(), pickConcurrency(), processPdf()

### Community 6 - "escapeXml"
Cohesion: 0.25
Nodes (11): escapeXml(), buildChapterXhtml(), buildContainerXml(), buildContentOpf(), buildEpubBlob(), buildNavXhtml(), buildTocNcx(), convertInline() (+3 more)

### Community 9 - "groupChapters"
Cohesion: 0.25
Nodes (9): applyEpubGrouping(), assignSequentialChapterIds(), cleanHeaderFooterOcr(), extractChunkBlocks(), extractMarkerTitle(), groupChapters(), makeChapterMatcher(), normalizeCharPreserveLength() (+1 more)

### Community 11 - "compilerOptions"
Cohesion: 0.29
Nodes (6): compilerOptions, allowJs, checkJs, moduleResolution, extends, ./.svelte-kit/tsconfig.json

### Community 12 - "knip.json"
Cohesion: 0.50
Nodes (3): entry, $schema, index.html

### Community 13 - "findAllMarkerPositionsCombined"
Cohesion: 0.50
Nodes (4): findAllMarkerPositionsCombined(), isDecorationOnly(), pushIfLineStart(), scoreHeadingCandidate()

### Community 14 - "handleFile"
Cohesion: 0.67
Nodes (3): handleDrop(), handleFile(), handleFileChange()

### Community 15 - "parseMarkdownBlocks"
Cohesion: 0.67
Nodes (3): endsWithSentencePunctuation(), parseMarkdownBlocks(), startsWithLowercaseLetter()

## Knowledge Gaps
- **70 isolated node(s):** `gitignorePath`, `extends`, `./.svelte-kit/tsconfig.json`, `allowJs`, `checkJs` (+65 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `jszip` connect `scripts` to `md/+page.svelte`, `escapeXml`?**
  _High betweenness centrality (0.267) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `devDependencies` to `scripts`?**
  _High betweenness centrality (0.212) - this node is a cross-community bridge._
- **What connects `gitignorePath`, `extends`, `./.svelte-kit/tsconfig.json` to the rest of the system?**
  _70 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `scripts` be split into smaller, more focused modules?**
  _Cohesion score 0.11764705882352941 - nodes in this community are weakly interconnected._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.07407407407407407 - nodes in this community are weakly interconnected._
- **Should `epub/+page.svelte` be split into smaller, more focused modules?**
  _Cohesion score 0.08333333333333333 - nodes in this community are weakly interconnected._
- **Should `⚒️ Ebook Forge — Bàn Xử Lý Tài Liệu` be split into smaller, more focused modules?**
  _Cohesion score 0.11764705882352941 - nodes in this community are weakly interconnected._