# Graph Report - ebook-tools  (2026-10-15)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 847 nodes · 1936 edges · 41 communities (30 shown, 11 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 2 edges (avg confidence: 0.9)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `a5f80a72`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- epub-source-parser.ts
- zip-writer.ts
- epub-editor.test.ts
- real-world-workflows.test.ts
- epub-editor-state.svelte.ts
- image-bg-remove-ml.ts
- EBOOK-TOOLS — FULL REGRESSION TESTING INSTRUCTION
- cleaner-engine.ts
- 🚀 Các công cụ chính
- pdf-splitter.ts
- package.json
- content-rules.ts
- epub-reader-parser.ts
- devDependencies
- EpubSourceState
- scripts
- compilerOptions
- epub-source-state.svelte.ts
- markdown-fixer.ts
- pdf-splitter-state.svelte.ts
- epub-images-state.svelte.ts
- epub-to-txt-state.svelte.ts
- dependencies
- generate-fonts-meta.js
- epub-download-inspection.spec.ts
- vite.config.js
- PdfSplitterState
- tests-e2e/tsconfig.json
- Tuyển Tập Truyện Ngắn Đương Đại
- tests/tsconfig.json
- knip.json
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
3. `Logger` - 25 edges
4. `resolveRelativePath()` - 21 edges
5. `EpubImagesState` - 20 edges
6. `vitest` - 20 edges
7. `scripts` - 19 edges
8. `EpubEditorState` - 18 edges
9. `escapeXml()` - 17 edges
10. `buildEpubBlob()` - 14 edges

## Surprising Connections (you probably didn't know these)
- `2026-09-27 (Trước đó)` --references--> `mergeBrokenParagraphs()`  [INFERRED]
  README.md → src/lib/epub-packer/xml-builders/chapter-builder.ts
- `BookMetadataDetails` --inherits--> `EpubMetadata`  [EXTRACTED]
  src/lib/epub-editor/epub-book-ops.ts → src/lib/types/epub.type.ts
- `EpubState` --references--> `EpubImagesState`  [EXTRACTED]
  src/lib/epub-packer/epub-state.svelte.ts → src/lib/epub-packer/state/epub-images-state.svelte.ts
- `convertTxtInline()` --calls--> `escapeXml()`  [EXTRACTED]
  src/lib/epub-packer/parser/epub-markdown-utils.ts → src/lib/utils/xml.ts
- `renderMarkdownBlocks()` --calls--> `escapeXml()`  [EXTRACTED]
  src/lib/epub-packer/parser/epub-markdown-utils.ts → src/lib/utils/xml.ts

## Import Cycles
- None detected.

## Communities (41 total, 11 thin omitted)

### Community 0 - "epub-source-parser.ts"
Cohesion: 0.06
Nodes (77): analyzeChapterCandidates(), extractChunkBlocks(), extractMarkerTitle(), isDecorationOnly(), makeChapterMatcher(), pushIfLineStart(), scoreHeadingCandidate(), stripDecoration() (+69 more)

### Community 1 - "zip-writer.ts"
Cohesion: 0.05
Nodes (70): ref_css_template_intro_css_css_raw, ref_templates_css_template_base_css_raw, ref_templates_css_template_breaks_css_raw, ref_templates_css_template_center_page_css_raw, ref_templates_css_template_cover_css_raw, ref_templates_css_template_headings_css_raw, ref_templates_css_template_notes_css_raw, ref_templates_css_template_ornaments_css_raw (+62 more)

### Community 2 - "epub-editor.test.ts"
Cohesion: 0.06
Nodes (42): categorizeFile(), exportEpubBlob(), extractLinkedCssPaths(), parseSpineOrder(), parseZipEntries(), deobfuscateAdobeFont(), deobfuscateIdpfFont(), isValidFontMagic() (+34 more)

### Community 3 - "real-world-workflows.test.ts"
Cohesion: 0.09
Nodes (40): jszip, vitest, extractBookMetadata(), findOpfPath(), rebuildEpubToc(), reorderOpfSpine(), TocChapterInfo, updateBookMetadata() (+32 more)

### Community 4 - "epub-editor-state.svelte.ts"
Cohesion: 0.08
Nodes (14): svelte, isDirty, src_lib_epub_editor_epub_cleaner_epubanalysisresult, src_lib_epub_editor_epub_cleaner_epubcleanoptions, src_lib_epub_editor_epub_cleaner_epubcleanreport, ButtonProps, DropZoneProps, InputProps (+6 more)

### Community 5 - "image-bg-remove-ml.ts"
Cohesion: 0.08
Nodes (21): @imgly/background-removal, EpubImagesState, autoCropTransparentCanvas(), canvasToBlob(), cleanupWorkerAndRejectPending(), compressAndResizeCanvas(), getOrCreateWorker(), loadImage() (+13 more)

### Community 6 - "EBOOK-TOOLS — FULL REGRESSION TESTING INSTRUCTION"
Cohesion: 0.05
Nodes (41): 10. PDF → EPUB USER FLOW, 11. EPUB EDITOR E2E, 12. EPUB CLEANER E2E, 13. EPUB VALIDATOR E2E, 14. IMAGE PROCESSING E2E, 15. WORKER TESTING, 16. REGRESSION TEST, 17. OUTPUT FILE VALIDATION (+33 more)

### Community 7 - "cleaner-engine.ts"
Cohesion: 0.11
Nodes (28): analyzeEpub(), analyzeOptimizationPlan(), cleanEpub(), optimizeEpub(), getDuplicateWorker(), scanDuplicateResources(), computeDuplicateResources(), DuplicateDetectorWorkerRequest (+20 more)

### Community 8 - "🚀 Các công cụ chính"
Cohesion: 0.06
Nodes (31): 🔒 1. Quy tắc Quản lý Gói (Package Manager Rule), 🧱 2. Kiến trúc Hệ Thống Kiểm Thử 4 Tầng (4-Tier Testing Strategy), 🎯 3. Ma Trận Hướng Dẫn: "Sửa Gì - Chạy Test Gì?" (Test Decision Matrix), 🔄 4. Chu trình Chỉnh Sửa Code Chuẩn (Standard Quality Gate Flow), ⚡ 5. Bảng Tra Cứu Lệnh Nhanh (Cheat Sheet), Chi tiết các bước Quality Gates:, 📋 QUY TRÌNH PHÁT TRIỂN & HỆ THỐNG KIỂM THỬ (DEVELOPMENT & TESTING WORKFLOW), 🔹 Tầng 1: Smoke Tests (`pnpm test:smoke`) (+23 more)

### Community 9 - "pdf-splitter.ts"
Cohesion: 0.09
Nodes (26): App, Window, applyGrayscale(), cropCanvas(), formatEta(), loadPdfPreview(), pickConcurrency(), processPdfToJpg() (+18 more)

### Community 10 - "package.json"
Cohesion: 0.08
Nodes (26): gitignorePath, name, packageManager, private, type, version, codemirror, @codemirror/commands (+18 more)

### Community 11 - "content-rules.ts"
Cohesion: 0.17
Nodes (19): src_lib_epub_editor_epub_editor_isvalidfontmagic, src_lib_epub_editor_epub_editor_validatehtml, CssAndFontsRule, XhtmlPagesRule, NavigationRule, OpfPackageRule, SpineRule, StructureRule (+11 more)

### Community 12 - "epub-reader-parser.ts"
Cohesion: 0.16
Nodes (19): categorizeResource(), extractEpubMetadata(), findOpfPath(), parseEpub(), parseOpfManifestAndSpine(), EpubBook, EpubBookMetadata, EpubContainer (+11 more)

### Community 13 - "devDependencies"
Cohesion: 0.10
Nodes (21): devDependencies, eslint, @eslint/js, eslint-plugin-svelte, globals, knip, @playwright/test, prettier (+13 more)

### Community 14 - "EpubSourceState"
Cohesion: 0.16
Nodes (7): EpubState, EpubFontsState, EpubJacketState, EpubMetadataState, EpubSourceState, src_lib_utils_index_ensureepubext, ensureEpubExt()

### Community 15 - "scripts"
Cohesion: 0.11
Nodes (19): scripts, build, check, dev, format, format:check, knip, lint (+11 more)

### Community 16 - "compilerOptions"
Cohesion: 0.13
Nodes (14): ./.svelte-kit/tsconfig.json, compilerOptions, allowJs, checkJs, esModuleInterop, forceConsistentCasingInFileNames, moduleResolution, resolveJsonModule (+6 more)

### Community 17 - "epub-source-state.svelte.ts"
Cohesion: 0.16
Nodes (13): src_lib_epub_packer_parser_epub_source_parser_analyzechaptercandidates, src_lib_epub_packer_parser_epub_source_parser_assignsequentialchapterids, src_lib_epub_packer_parser_epub_source_parser_cleanheaderfooterocr, src_lib_epub_packer_parser_epub_source_parser_converttxtinline, src_lib_epub_packer_parser_epub_source_parser_getcleanedlinesreport, src_lib_epub_packer_parser_epub_source_parser_parsemarkdownblocks, src_lib_epub_packer_parser_epub_source_parser_parsetxttochapters, src_lib_epub_packer_parser_epub_source_parser_parsetxttochaptersasync (+5 more)

### Community 18 - "markdown-fixer.ts"
Cohesion: 0.20
Nodes (11): BOLD_ITALIC_PATTERNS, BOLD_PATTERNS, convertBrackets(), fixMarkdownZip(), ITALIC_PATTERNS, UNDERLINE_PATTERNS, src_lib_types_index_convertedbracketsresult, src_lib_types_index_fixmarkdownzipresult (+3 more)

### Community 19 - "pdf-splitter-state.svelte.ts"
Cohesion: 0.21
Nodes (7): MarkdownFixerState, src_lib_types_index_pdfpreviewpage, src_lib_types_index_processedmarkdownfilerow, src_lib_utils_index_ensurezipext, src_lib_utils_index_slugify, ensureZipExt(), slugify()

### Community 20 - "epub-images-state.svelte.ts"
Cohesion: 0.21
Nodes (10): MAX_IMAGE_FILE_SIZE, MAX_IMAGES_ZIP_FILE_SIZE, MAX_PDF_FILE_SIZE, MAX_TXT_FILE_SIZE, MAX_ZIP_FILE_SIZE, IllustrationImageItem, src_lib_types_index_coverblobitem, src_lib_types_index_illustrationimageitem (+2 more)

### Community 21 - "epub-to-txt-state.svelte.ts"
Cohesion: 0.18
Nodes (5): MAX_EPUB_FILE_SIZE, EpubToTxtResult, EpubToTxtState, triggerDownload(), src_lib_utils_index_triggerdownload

### Community 22 - "dependencies"
Cohesion: 0.18
Nodes (11): dependencies, codemirror, @codemirror/commands, @codemirror/lang-css, @codemirror/lang-html, @codemirror/state, @codemirror/theme-one-dark, @codemirror/view (+3 more)

### Community 23 - "generate-fonts-meta.js"
Cohesion: 0.18
Nodes (10): fontkit, ref_fs, ref_module, ref_path, files, fontkit, FONTS_DIR, metadata (+2 more)

### Community 24 - "epub-download-inspection.spec.ts"
Cohesion: 0.28
Nodes (4): ref_node_fs, ref_node_path, ref_node_process, @playwright/test

### Community 25 - "vite.config.js"
Cohesion: 0.25
Nodes (5): @sveltejs/adapter-cloudflare, @sveltejs/kit, @tailwindcss/vite, ref_types, vite

### Community 27 - "tests-e2e/tsconfig.json"
Cohesion: 0.33
Nodes (5): compilerOptions, types, extends, include, ../tsconfig.json

### Community 28 - "Tuyển Tập Truyện Ngắn Đương Đại"
Cohesion: 0.33
Nodes (5): 1.1 Buổi Sáng Ở Quán Cà Phê, 2.2 Kết Thúc Một Ngày, Chương 1: Ký Ức Mùa Thu, Chương 2: Tiếng Chuông Chiều, Tuyển Tập Truyện Ngắn Đương Đại

### Community 29 - "tests/tsconfig.json"
Cohesion: 0.33
Nodes (5): compilerOptions, types, extends, include, ../tsconfig.json

### Community 30 - "knip.json"
Cohesion: 0.40
Nodes (4): entry, ignoreDependencies, project, $schema

## Knowledge Gaps
- **212 isolated node(s):** `LogLevel`, `OpenBlockInfo`, `EpubChapterFeatures`, `OrnamentItem`, `TxtSyntaxError` (+207 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 320 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **11 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `jszip` connect `real-world-workflows.test.ts` to `zip-writer.ts`, `epub-editor.test.ts`, `epub-editor-state.svelte.ts`, `image-bg-remove-ml.ts`, `cleaner-engine.ts`, `pdf-splitter.ts`, `package.json`, `content-rules.ts`, `epub-reader-parser.ts`, `epub-source-state.svelte.ts`, `markdown-fixer.ts`, `epub-images-state.svelte.ts`, `epub-download-inspection.spec.ts`?**
  _High betweenness centrality (0.183) - this node is a cross-community bridge._
- **Why does `vitest` connect `real-world-workflows.test.ts` to `epub-source-parser.ts`, `zip-writer.ts`, `epub-editor.test.ts`, `image-bg-remove-ml.ts`, `cleaner-engine.ts`, `pdf-splitter.ts`, `package.json`, `epub-reader-parser.ts`, `epub-source-state.svelte.ts`, `markdown-fixer.ts`?**
  _High betweenness centrality (0.076) - this node is a cross-community bridge._
- **Why does `mergeBrokenParagraphs()` connect `zip-writer.ts` to `🚀 Các công cụ chính`, `epub-source-parser.ts`?**
  _High betweenness centrality (0.067) - this node is a cross-community bridge._
- **What connects `LogLevel`, `OpenBlockInfo`, `EpubChapterFeatures` to the rest of the system?**
  _212 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `epub-source-parser.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05531914893617021 - nodes in this community are weakly interconnected._
- **Should `zip-writer.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05445665445665446 - nodes in this community are weakly interconnected._
- **Should `epub-editor.test.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06409130816505706 - nodes in this community are weakly interconnected._