# Graph Report - ebook-tools  (2026-10-15)

## Corpus Check
- 141 files · ~89,878 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 48 file(s) not represented in the graph (top: .otf 18, .ttf 15, .css 10)

## Summary
- 850 nodes · 1977 edges · 35 communities (26 shown, 9 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 2 edges (avg confidence: 0.9)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `7c8e5435`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- pdf-splitter.ts
- epub-editor.test.ts
- zip-writer.ts
- lib/types/index.ts
- scripts
- epub-source-parser.ts
- EBOOK-TOOLS — FULL REGRESSION TESTING INSTRUCTION
- epub-editor-state.svelte.ts
- epub-reader-parser.ts
- 🚀 Các công cụ chính
- image-bg-remove-ml.ts
- EpubSourceState
- compilerOptions
- real-world-workflows.test.ts
- tests/tsconfig.json
- package.json
- devDependencies
- knip.json
- generate-fonts-meta.js
- Tuyển Tập Truyện Ngắn Đương Đại
- utils/index.ts
- dependencies
- epub-download-inspection.spec.ts
- components.type.ts
- vite.config.js
- tests-e2e/tsconfig.json
- src_lib_epub_packer_epub_packer_buildchapterxhtml
- src_lib_epub_packer_epub_packer_buildcontainerxml
- src_lib_epub_packer_epub_packer_buildcontentopf
- src_lib_epub_packer_epub_packer_buildnavxhtml
- src_lib_epub_packer_epub_packer_buildtocncx
- src_lib_epub_packer_epub_packer_gettocentries
- src_lib_epub_packer_epub_packer_injectheadingids
- src_lib_epub_packer_epub_packer_mergebrokenparagraphs

## God Nodes (most connected - your core abstractions)
1. `jszip` - 32 edges
2. `EBOOK-TOOLS — FULL REGRESSION TESTING INSTRUCTION` - 32 edges
3. `Logger` - 27 edges
4. `resolveRelativePath()` - 21 edges
5. `vitest` - 20 edges
6. `EpubImagesState` - 20 edges
7. `escapeXml()` - 20 edges
8. `scripts` - 19 edges
9. `EpubEditorState` - 18 edges
10. `parseTxtToChapters()` - 15 edges

## Surprising Connections (you probably didn't know these)
- `2026-09-27 (Trước đó)` --references--> `mergeBrokenParagraphs()`  [INFERRED]
  README.md → src/lib/epub-packer/xml-builders/chapter-builder.ts
- `analyzeOptimizationPlan()` --calls--> `resolveRelativePath()`  [EXTRACTED]
  src/lib/epub-editor/cleaner/cleaner-engine.ts → src/lib/utils/path.ts
- `cleanEpub()` --calls--> `resolveRelativePath()`  [EXTRACTED]
  src/lib/epub-editor/cleaner/cleaner-engine.ts → src/lib/utils/path.ts
- `computeDuplicateResources()` --calls--> `sha1HexAsync()`  [EXTRACTED]
  src/lib/epub-editor/cleaner/duplicate-detector.worker.ts → src/lib/utils/crypto.ts
- `parseSpineOrder()` --calls--> `resolveRelativePath()`  [EXTRACTED]
  src/lib/epub-editor/editor/editor-ops.ts → src/lib/utils/path.ts

## Import Cycles
- None detected.

## Communities (35 total, 9 thin omitted)

### Community 0 - "pdf-splitter.ts"
Cohesion: 0.07
Nodes (28): App, Window, applyGrayscale(), cropCanvas(), formatEta(), loadPdfPreview(), pickConcurrency(), processPdfToJpg() (+20 more)

### Community 1 - "epub-editor.test.ts"
Cohesion: 0.07
Nodes (51): deobfuscateAdobeFont(), deobfuscateIdpfFont(), isValidFontMagic(), validateDirtyPages(), validateHtml(), buildPreviewHtml(), escapeAttribute(), escapeRegExp() (+43 more)

### Community 2 - "zip-writer.ts"
Cohesion: 0.06
Nodes (61): ref_css_template_intro_css_css_raw, ref_templates_css_template_base_css_raw, ref_templates_css_template_breaks_css_raw, ref_templates_css_template_center_page_css_raw, ref_templates_css_template_cover_css_raw, ref_templates_css_template_headings_css_raw, ref_templates_css_template_notes_css_raw, ref_templates_css_template_ornaments_css_raw (+53 more)

### Community 3 - "lib/types/index.ts"
Cohesion: 0.05
Nodes (20): src_assets_fonts_metadata, isDirty, src_lib_epub_packer_epub_packer_epub_css, src_lib_epub_packer_state_index_epubfontsstate, src_lib_epub_packer_state_index_epubimagesstate, src_lib_epub_packer_state_index_epubjacketstate, src_lib_epub_packer_state_index_epubmetadatastate, src_lib_epub_packer_state_index_epubsourcestate (+12 more)

### Community 4 - "scripts"
Cohesion: 0.11
Nodes (19): scripts, build, check, dev, format, format:check, knip, lint (+11 more)

### Community 5 - "epub-source-parser.ts"
Cohesion: 0.08
Nodes (67): analyzeChapterCandidates(), assignSequentialChapterIds(), extractChunkBlocks(), extractMarkerTitle(), isDecorationOnly(), makeChapterMatcher(), pushIfLineStart(), scoreHeadingCandidate() (+59 more)

### Community 6 - "EBOOK-TOOLS — FULL REGRESSION TESTING INSTRUCTION"
Cohesion: 0.05
Nodes (41): 10. PDF → EPUB USER FLOW, 11. EPUB EDITOR E2E, 12. EPUB CLEANER E2E, 13. EPUB VALIDATOR E2E, 14. IMAGE PROCESSING E2E, 15. WORKER TESTING, 16. REGRESSION TEST, 17. OUTPUT FILE VALIDATION (+33 more)

### Community 7 - "epub-editor-state.svelte.ts"
Cohesion: 0.06
Nodes (40): analyzeEpub(), analyzeOptimizationPlan(), cleanEpub(), getDuplicateWorker(), scanDuplicateResources(), computeDuplicateResources(), DuplicateDetectorWorkerRequest, DuplicateDetectorWorkerResponse (+32 more)

### Community 8 - "epub-reader-parser.ts"
Cohesion: 0.17
Nodes (19): categorizeResource(), extractEpubMetadata(), findOpfPath(), parseEpub(), parseOpfManifestAndSpine(), EpubBook, EpubBookMetadata, EpubContainer (+11 more)

### Community 10 - "🚀 Các công cụ chính"
Cohesion: 0.06
Nodes (31): 🔒 1. Quy tắc Quản lý Gói (Package Manager Rule), 🧱 2. Kiến trúc Hệ Thống Kiểm Thử 4 Tầng (4-Tier Testing Strategy), 🎯 3. Ma Trận Hướng Dẫn: "Sửa Gì - Chạy Test Gì?" (Test Decision Matrix), 🔄 4. Chu trình Chỉnh Sửa Code Chuẩn (Standard Quality Gate Flow), ⚡ 5. Bảng Tra Cứu Lệnh Nhanh (Cheat Sheet), Chi tiết các bước Quality Gates:, 📋 QUY TRÌNH PHÁT TRIỂN & HỆ THỐNG KIỂM THỬ (DEVELOPMENT & TESTING WORKFLOW), 🔹 Tầng 1: Smoke Tests (`pnpm test:smoke`) (+23 more)

### Community 11 - "image-bg-remove-ml.ts"
Cohesion: 0.08
Nodes (21): @imgly/background-removal, EpubImagesState, autoCropTransparentCanvas(), canvasToBlob(), cleanupWorkerAndRejectPending(), compressAndResizeCanvas(), getOrCreateWorker(), loadImage() (+13 more)

### Community 12 - "EpubSourceState"
Cohesion: 0.16
Nodes (7): EpubState, EpubFontsState, EpubJacketState, EpubMetadataState, EpubSourceState, src_lib_utils_index_ensureepubext, ensureEpubExt()

### Community 13 - "compilerOptions"
Cohesion: 0.13
Nodes (14): ./.svelte-kit/tsconfig.json, compilerOptions, allowJs, checkJs, esModuleInterop, forceConsistentCasingInFileNames, moduleResolution, resolveJsonModule (+6 more)

### Community 15 - "real-world-workflows.test.ts"
Cohesion: 0.08
Nodes (39): jszip, vitest, optimizeEpub(), extractBookMetadata(), rebuildEpubToc(), updateBookMetadata(), src_lib_epub_editor_epub_cleaner_analyzeoptimizationplan, src_lib_epub_editor_epub_cleaner_optimizeepub (+31 more)

### Community 16 - "tests/tsconfig.json"
Cohesion: 0.33
Nodes (5): compilerOptions, types, extends, include, ../tsconfig.json

### Community 17 - "package.json"
Cohesion: 0.08
Nodes (26): gitignorePath, name, packageManager, private, type, version, codemirror, @codemirror/commands (+18 more)

### Community 19 - "devDependencies"
Cohesion: 0.10
Nodes (21): devDependencies, eslint, @eslint/js, eslint-plugin-svelte, globals, knip, @playwright/test, prettier (+13 more)

### Community 21 - "knip.json"
Cohesion: 0.40
Nodes (4): entry, ignoreDependencies, project, $schema

### Community 22 - "generate-fonts-meta.js"
Cohesion: 0.18
Nodes (10): fontkit, ref_fs, ref_module, ref_path, files, fontkit, FONTS_DIR, metadata (+2 more)

### Community 23 - "Tuyển Tập Truyện Ngắn Đương Đại"
Cohesion: 0.33
Nodes (5): 1.1 Buổi Sáng Ở Quán Cà Phê, 2.2 Kết Thúc Một Ngày, Chương 1: Ký Ức Mùa Thu, Chương 2: Tiếng Chuông Chiều, Tuyển Tập Truyện Ngắn Đương Đại

### Community 27 - "utils/index.ts"
Cohesion: 0.05
Nodes (45): MAX_EPUB_FILE_SIZE, MAX_IMAGE_FILE_SIZE, MAX_IMAGES_ZIP_FILE_SIZE, MAX_PDF_FILE_SIZE, MAX_TXT_FILE_SIZE, MAX_ZIP_FILE_SIZE, src_lib_epub_packer_parser_epub_source_parser_parsetxttochaptersasync, EpubSourceStateDependencies (+37 more)

### Community 33 - "dependencies"
Cohesion: 0.18
Nodes (11): dependencies, codemirror, @codemirror/commands, @codemirror/lang-css, @codemirror/lang-html, @codemirror/state, @codemirror/theme-one-dark, @codemirror/view (+3 more)

### Community 34 - "epub-download-inspection.spec.ts"
Cohesion: 0.28
Nodes (4): ref_node_fs, ref_node_path, ref_node_process, @playwright/test

### Community 37 - "components.type.ts"
Cohesion: 0.33
Nodes (5): svelte, ButtonProps, DropZoneProps, InputProps, PageHeaderProps

### Community 38 - "vite.config.js"
Cohesion: 0.25
Nodes (5): @sveltejs/adapter-cloudflare, @sveltejs/kit, @tailwindcss/vite, ref_types, vite

### Community 42 - "tests-e2e/tsconfig.json"
Cohesion: 0.33
Nodes (5): compilerOptions, types, extends, include, ../tsconfig.json

## Knowledge Gaps
- **208 isolated node(s):** `gitignorePath`, `$schema`, `project`, `entry`, `ignoreDependencies` (+203 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 326 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **9 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `jszip` connect `real-world-workflows.test.ts` to `pdf-splitter.ts`, `epub-editor.test.ts`, `zip-writer.ts`, `epub-download-inspection.spec.ts`, `epub-source-parser.ts`, `epub-editor-state.svelte.ts`, `epub-reader-parser.ts`, `image-bg-remove-ml.ts`, `package.json`, `utils/index.ts`?**
  _High betweenness centrality (0.183) - this node is a cross-community bridge._
- **Why does `vitest` connect `real-world-workflows.test.ts` to `pdf-splitter.ts`, `epub-editor.test.ts`, `zip-writer.ts`, `epub-source-parser.ts`, `epub-editor-state.svelte.ts`, `epub-reader-parser.ts`, `image-bg-remove-ml.ts`, `package.json`, `utils/index.ts`?**
  _High betweenness centrality (0.072) - this node is a cross-community bridge._
- **Why does `mergeBrokenParagraphs()` connect `zip-writer.ts` to `🚀 Các công cụ chính`, `epub-source-parser.ts`?**
  _High betweenness centrality (0.067) - this node is a cross-community bridge._
- **What connects `gitignorePath`, `$schema`, `project` to the rest of the system?**
  _208 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `pdf-splitter.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06755260243632337 - nodes in this community are weakly interconnected._
- **Should `epub-editor.test.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06682692307692308 - nodes in this community are weakly interconnected._
- **Should `zip-writer.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06360759493670887 - nodes in this community are weakly interconnected._