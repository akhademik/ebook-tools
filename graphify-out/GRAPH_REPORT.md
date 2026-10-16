# Graph Report - ebook-tools  (2026-10-16)

## Corpus Check
- 142 files · ~92,037 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 48 file(s) not represented in the graph (top: .otf 18, .ttf 15, .css 10)

## Summary
- 861 nodes · 1986 edges · 51 communities (30 shown, 21 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 7 edges (avg confidence: 0.94)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `81c7e4b6`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- epub-source-parser.ts
- content-rules.ts
- epub-editor-state.svelte.ts
- image-bg-remove-ml.ts
- EBOOK-TOOLS — FULL REGRESSION TESTING INSTRUCTION
- cleaner-engine.ts
- 🚀 Các công cụ chính
- pdf-splitter.ts
- package.json
- utils/index.ts
- epub-reader-parser.ts
- devDependencies
- EpubSourceState
- scripts
- compilerOptions
- src_lib_epub_packer_parser_epub_source_parser_analyzechaptercandidates
- markdown-fixer.ts
- real-world-workflows.test.ts
- epub-source-state.svelte.ts
- jszip
- dependencies
- epub-download-inspection.spec.ts
- state/index.ts
- vite.config.js
- src_lib_utils_index_logger
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
- EpubToTxtState
- components.type.ts
- result.type.ts
- src_lib_epub_packer_parser_epub_source_parser_assignsequentialchapterids
- src_lib_epub_packer_parser_epub_source_parser_cleanheaderfooterocr
- src_lib_epub_packer_parser_epub_source_parser_converttxtinline
- src_lib_epub_packer_parser_epub_source_parser_getcleanedlinesreport
- src_lib_epub_packer_parser_epub_source_parser_parsemarkdownblocks
- src_lib_epub_packer_parser_epub_source_parser_rendermarkdownblocks
- generate-fonts-meta.js

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
- `2026-10-15 (letter-box wrapper)` --references--> `mergeBrokenParagraphs()`  [INFERRED]
  README.md → src/lib/epub-packer/xml-builders/chapter-builder.ts
- `Trạng thái hệ thống` --references--> `isIllustrationTag()`  [INFERRED]
  README.md → src/lib/epub-packer/parser/txt-parser.ts
- `Trạng thái hệ thống` --references--> `mergeBrokenParagraphs()`  [INFERRED]
  README.md → src/lib/epub-packer/xml-builders/chapter-builder.ts
- `Trạng thái hệ thống` --references--> `replaceNestedDiv()`  [INFERRED]
  README.md → src/lib/epub-to-txt/epub-to-txt.ts

## Import Cycles
- None detected.

## Communities (51 total, 21 thin omitted)

### Community 0 - "epub-source-parser.ts"
Cohesion: 0.06
Nodes (81): analyzeChapterCandidates(), assignSequentialChapterIds(), extractChunkBlocks(), extractMarkerTitle(), isDecorationOnly(), makeChapterMatcher(), pushIfLineStart(), scoreHeadingCandidate() (+73 more)

### Community 1 - "content-rules.ts"
Cohesion: 0.17
Nodes (19): src_lib_epub_editor_epub_editor_isvalidfontmagic, src_lib_epub_editor_epub_editor_validatehtml, CssAndFontsRule, XhtmlPagesRule, NavigationRule, OpfPackageRule, SpineRule, StructureRule (+11 more)

### Community 2 - "epub-editor-state.svelte.ts"
Cohesion: 0.06
Nodes (43): formatByteSize(), isDirty, categorizeFile(), exportEpubBlob(), extractLinkedCssPaths(), parseSpineOrder(), parseZipEntries(), deobfuscateAdobeFont() (+35 more)

### Community 5 - "image-bg-remove-ml.ts"
Cohesion: 0.08
Nodes (21): @imgly/background-removal, EpubImagesState, autoCropTransparentCanvas(), canvasToBlob(), cleanupWorkerAndRejectPending(), compressAndResizeCanvas(), getOrCreateWorker(), loadImage() (+13 more)

### Community 6 - "EBOOK-TOOLS — FULL REGRESSION TESTING INSTRUCTION"
Cohesion: 0.05
Nodes (41): 10. PDF → EPUB USER FLOW, 11. EPUB EDITOR E2E, 12. EPUB CLEANER E2E, 13. EPUB VALIDATOR E2E, 14. IMAGE PROCESSING E2E, 15. WORKER TESTING, 16. REGRESSION TEST, 17. OUTPUT FILE VALIDATION (+33 more)

### Community 7 - "cleaner-engine.ts"
Cohesion: 0.09
Nodes (33): analyzeEpub(), analyzeOptimizationPlan(), cleanEpub(), getDuplicateWorker(), scanDuplicateResources(), computeDuplicateResources(), DuplicateDetectorWorkerRequest, DuplicateDetectorWorkerResponse (+25 more)

### Community 8 - "🚀 Các công cụ chính"
Cohesion: 0.06
Nodes (32): 🔒 1. Quy tắc Quản lý Gói (Package Manager Rule), 🧱 2. Kiến trúc Hệ Thống Kiểm Thử 4 Tầng (4-Tier Testing Strategy), 🎯 3. Ma Trận Hướng Dẫn: "Sửa Gì - Chạy Test Gì?" (Test Decision Matrix), 🔄 4. Chu trình Chỉnh Sửa Code Chuẩn (Standard Quality Gate Flow), ⚡ 5. Bảng Tra Cứu Lệnh Nhanh (Cheat Sheet), Chi tiết các bước Quality Gates:, 📋 QUY TRÌNH PHÁT TRIỂN & HỆ THỐNG KIỂM THỬ (DEVELOPMENT & TESTING WORKFLOW), 🔹 Tầng 1: Smoke Tests (`pnpm test:smoke`) (+24 more)

### Community 9 - "pdf-splitter.ts"
Cohesion: 0.07
Nodes (28): App, Window, applyGrayscale(), cropCanvas(), formatEta(), loadPdfPreview(), pickConcurrency(), processPdfToJpg() (+20 more)

### Community 10 - "package.json"
Cohesion: 0.08
Nodes (26): gitignorePath, name, packageManager, private, type, version, codemirror, @codemirror/commands (+18 more)

### Community 11 - "utils/index.ts"
Cohesion: 0.15
Nodes (10): isDebug(), isDebugEnabled, src_lib_utils_logger_js_test_1, src_lib_utils_logger_js_test_2, Logger, LogLevel, setDebug(), mockAnchor (+2 more)

### Community 12 - "epub-reader-parser.ts"
Cohesion: 0.17
Nodes (18): categorizeResource(), extractEpubMetadata(), findOpfPath(), parseEpub(), parseOpfManifestAndSpine(), EpubBook, EpubBookMetadata, EpubContainer (+10 more)

### Community 13 - "devDependencies"
Cohesion: 0.10
Nodes (21): devDependencies, eslint, @eslint/js, eslint-plugin-svelte, globals, knip, @playwright/test, prettier (+13 more)

### Community 14 - "EpubSourceState"
Cohesion: 0.25
Nodes (5): EpubState, EpubFontsState, EpubJacketState, EpubMetadataState, EpubSourceState

### Community 15 - "scripts"
Cohesion: 0.11
Nodes (19): scripts, build, check, dev, format, format:check, knip, lint (+11 more)

### Community 16 - "compilerOptions"
Cohesion: 0.13
Nodes (14): ./.svelte-kit/tsconfig.json, compilerOptions, allowJs, checkJs, esModuleInterop, forceConsistentCasingInFileNames, moduleResolution, resolveJsonModule (+6 more)

### Community 18 - "markdown-fixer.ts"
Cohesion: 0.18
Nodes (12): BOLD_ITALIC_PATTERNS, BOLD_PATTERNS, convertBrackets(), fixMarkdownZip(), ITALIC_PATTERNS, UNDERLINE_PATTERNS, src_lib_types_index_convertedbracketsresult, src_lib_types_index_fixmarkdownzipresult (+4 more)

### Community 19 - "real-world-workflows.test.ts"
Cohesion: 0.06
Nodes (74): ref_css_template_intro_css_css_raw, ref_templates_css_template_base_css_raw, ref_templates_css_template_breaks_css_raw, ref_templates_css_template_center_page_css_raw, ref_templates_css_template_cover_css_raw, ref_templates_css_template_headings_css_raw, ref_templates_css_template_notes_css_raw, ref_templates_css_template_ornaments_css_raw (+66 more)

### Community 20 - "epub-source-state.svelte.ts"
Cohesion: 0.20
Nodes (11): MAX_EPUB_FILE_SIZE, MAX_IMAGE_FILE_SIZE, MAX_IMAGES_ZIP_FILE_SIZE, MAX_PDF_FILE_SIZE, MAX_TXT_FILE_SIZE, MAX_ZIP_FILE_SIZE, src_lib_epub_packer_parser_epub_source_parser_parsetxttochaptersasync, EpubSourceStateDependencies (+3 more)

### Community 21 - "jszip"
Cohesion: 0.11
Nodes (31): Trạng thái hệ thống, jszip, vitest, extractBookMetadata(), findOpfPath(), rebuildEpubToc(), reorderOpfSpine(), TocChapterInfo (+23 more)

### Community 22 - "dependencies"
Cohesion: 0.18
Nodes (11): dependencies, codemirror, @codemirror/commands, @codemirror/lang-css, @codemirror/lang-html, @codemirror/state, @codemirror/theme-one-dark, @codemirror/view (+3 more)

### Community 23 - "epub-download-inspection.spec.ts"
Cohesion: 0.28
Nodes (4): ref_node_fs, ref_node_path, ref_node_process, @playwright/test

### Community 25 - "vite.config.js"
Cohesion: 0.25
Nodes (5): @sveltejs/adapter-cloudflare, @sveltejs/kit, @tailwindcss/vite, ref_types, vite

### Community 26 - "src_lib_utils_index_logger"
Cohesion: 0.25
Nodes (8): MarkdownFixerState, triggerDownload(), src_lib_utils_index_ensurezipext, src_lib_utils_index_logger, src_lib_utils_index_slugify, src_lib_utils_index_triggerdownload, ensureZipExt(), slugify()

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

### Community 42 - "components.type.ts"
Cohesion: 0.33
Nodes (5): svelte, ButtonProps, DropZoneProps, InputProps, PageHeaderProps

### Community 43 - "result.type.ts"
Cohesion: 0.40
Nodes (3): AppError, Result, ValidationError

### Community 51 - "generate-fonts-meta.js"
Cohesion: 0.18
Nodes (10): fontkit, ref_fs, ref_module, ref_path, files, fontkit, FONTS_DIR, metadata (+2 more)

## Knowledge Gaps
- **208 isolated node(s):** `gitignorePath`, `$schema`, `project`, `entry`, `ignoreDependencies` (+203 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 334 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **21 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `jszip` connect `jszip` to `epub-source-parser.ts`, `content-rules.ts`, `epub-editor-state.svelte.ts`, `image-bg-remove-ml.ts`, `cleaner-engine.ts`, `pdf-splitter.ts`, `package.json`, `epub-reader-parser.ts`, `markdown-fixer.ts`, `real-world-workflows.test.ts`, `epub-source-state.svelte.ts`, `epub-download-inspection.spec.ts`?**
  _High betweenness centrality (0.186) - this node is a cross-community bridge._
- **Why does `vitest` connect `jszip` to `epub-source-parser.ts`, `epub-editor-state.svelte.ts`, `image-bg-remove-ml.ts`, `cleaner-engine.ts`, `pdf-splitter.ts`, `package.json`, `utils/index.ts`, `epub-reader-parser.ts`, `markdown-fixer.ts`, `real-world-workflows.test.ts`?**
  _High betweenness centrality (0.065) - this node is a cross-community bridge._
- **Why does `Trạng thái hệ thống` connect `jszip` to `🚀 Các công cụ chính`, `epub-source-parser.ts`, `real-world-workflows.test.ts`?**
  _High betweenness centrality (0.056) - this node is a cross-community bridge._
- **What connects `gitignorePath`, `$schema`, `project` to the rest of the system?**
  _208 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `epub-source-parser.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06382978723404255 - nodes in this community are weakly interconnected._
- **Should `epub-editor-state.svelte.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05974124809741248 - nodes in this community are weakly interconnected._
- **Should `image-bg-remove-ml.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07922705314009662 - nodes in this community are weakly interconnected._