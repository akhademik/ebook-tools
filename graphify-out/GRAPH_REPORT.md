# Graph Report - ebook-tools  (2026-08-23)

## Corpus Check
- 111 files · ~69,355 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 569 nodes · 1228 edges · 24 communities (23 shown, 1 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Community 0
- Community 1
- Community 2
- Community 3
- Community 4
- Community 5
- Community 6
- Community 7
- Community 8
- Community 9
- Community 10
- Community 11
- Community 12
- Community 13
- Community 15
- Community 16
- Community 17

## God Nodes (most connected - your core abstractions)
1. `Logger` - 24 edges
2. `escapeXml()` - 20 edges
3. `EpubEditorState` - 17 edges
4. `EpubImagesState` - 17 edges
5. `resolveRelativePath()` - 15 edges
6. `scripts` - 13 edges
7. `processOrnamentImage()` - 12 edges
8. `getAssetDataUrl()` - 11 edges
9. `buildEpubBlob()` - 11 edges
10. `parseTxtToChapters()` - 11 edges

## Surprising Connections (you probably didn't know these)
- `replaceOrCreateTag()` --calls--> `escapeXml()`  [EXTRACTED]
  src/lib/epub-editor/epub-book-ops.ts → src/lib/utils/xml.ts
- `BookMetadataDetails` --inherits--> `EpubMetadata`  [EXTRACTED]
  src/lib/epub-editor/epub-book-ops.ts → src/lib/types/epub.type.ts
- `updateBookMetadata()` --calls--> `escapeXml()`  [EXTRACTED]
  src/lib/epub-editor/epub-book-ops.ts → src/lib/utils/xml.ts
- `rebuildEpubToc()` --calls--> `buildNavXhtml()`  [EXTRACTED]
  src/lib/epub-editor/epub-book-ops.ts → src/lib/epub-packer/xml-builders/nav-builder.ts
- `rebuildEpubToc()` --calls--> `buildTocNcx()`  [EXTRACTED]
  src/lib/epub-editor/epub-book-ops.ts → src/lib/epub-packer/xml-builders/nav-builder.ts

## Import Cycles
- None detected.

## Communities (24 total, 1 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.07
Nodes (60): analyzeChapterCandidates(), assignSequentialChapterIds(), extractChunkBlocks(), extractMarkerTitle(), isDecorationOnly(), makeChapterMatcher(), pushIfLineStart(), scoreHeadingCandidate() (+52 more)

### Community 1 - "Community 1"
Cohesion: 0.07
Nodes (51): BookMetadataDetails, extractBookMetadata(), findOpfPath(), rebuildEpubToc(), reorderOpfSpine(), TocChapterInfo, updateBookMetadata(), replaceOrCreateTag() (+43 more)

### Community 2 - "Community 2"
Cohesion: 0.05
Nodes (38): BOLD_ITALIC_PATTERNS, BOLD_PATTERNS, convertBrackets(), fixMarkdownZip(), ITALIC_PATTERNS, MarkdownFixerState, UNDERLINE_PATTERNS, applyGrayscale() (+30 more)

### Community 3 - "Community 3"
Cohesion: 0.11
Nodes (33): assembleEpubZip(), buildEpubBlob(), getDynamicCss(), prepareChapters(), prepareFinalCss(), prepareMetadata(), resolveActiveFonts(), AVAILABLE_FONTS (+25 more)

### Community 4 - "Community 4"
Cohesion: 0.08
Nodes (11): isDirty, EPUB_CSS, EpubState, EpubFontsState, EpubJacketState, EpubMetadataState, ButtonProps, DropZoneProps (+3 more)

### Community 5 - "Community 5"
Cohesion: 0.09
Nodes (18): EpubImagesState, autoCropTransparentCanvas(), canvasToBlob(), compressAndResizeCanvas(), getOrCreateWorker(), loadImage(), OrnamentProcessOptions, OrnamentProcessResult (+10 more)

### Community 6 - "Community 6"
Cohesion: 0.05
Nodes (39): @codemirror/commands, @codemirror/lang-css, @codemirror/lang-html, @codemirror/state, @codemirror/theme-one-dark, @codemirror/view, fontkit, @imgly/background-removal (+31 more)

### Community 7 - "Community 7"
Cohesion: 0.05
Nodes (37): eslint, @eslint/js, eslint-plugin-svelte, globals, devDependencies, eslint, @eslint/js, eslint-plugin-svelte (+29 more)

### Community 8 - "Community 8"
Cohesion: 0.10
Nodes (17): CssAndFontsRule, DEFAULT_VALIDATION_RULES, ManifestItemInfo, NavigationRule, OpfPackageRule, SpineRule, StructureRule, validateEpub() (+9 more)

### Community 9 - "Community 9"
Cohesion: 0.18
Nodes (18): categorizeResource(), extractEpubMetadata(), findOpfPath(), parseEpub(), parseOpfManifestAndSpine(), EpubBook, EpubBookMetadata, EpubContainer (+10 more)

### Community 10 - "Community 10"
Cohesion: 0.10
Nodes (20): playwright.config.ts, src/**/*, .svelte-kit/ambient.d.ts, .svelte-kit/non-ambient.d.ts, ./.svelte-kit/tsconfig.json, .svelte-kit/types/**/$types.d.ts, compilerOptions, allowJs (+12 more)

### Community 11 - "Community 11"
Cohesion: 0.12
Nodes (15): entry, ignoreDependencies, project, $schema, src/**/*.{js,ts,svelte}, src/lib/epub-editor/epub-validator.ts, src/lib/epub-packer/epub-packer.ts, src/lib/epub-packer/parser/epub-parser.ts (+7 more)

### Community 12 - "Community 12"
Cohesion: 0.18
Nodes (8): @playwright/test, compilerOptions, types, extends, include, ./**/*, node, ../tsconfig.json

### Community 13 - "Community 13"
Cohesion: 0.22
Nodes (8): vitest/globals, compilerOptions, types, extends, include, ./**/*, node, ../tsconfig.json

### Community 15 - "Community 15"
Cohesion: 0.29
Nodes (6): files, fontkit, FONTS_DIR, metadata, OUTPUT_FILE, require

### Community 16 - "Community 16"
Cohesion: 0.40
Nodes (3): AppError, Result, ValidationError

## Knowledge Gaps
- **143 isolated node(s):** `gitignorePath`, `$schema`, `src/**/*.{js,ts,svelte}`, `tests/**/*.{js,ts}`, `src/routes/**/+page.{svelte,js,ts}` (+138 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Logger` connect `Community 2` to `Community 0`, `Community 1`, `Community 3`, `Community 4`, `Community 5`?**
  _High betweenness centrality (0.072) - this node is a cross-community bridge._
- **Why does `EpubImagesState` connect `Community 5` to `Community 0`, `Community 4`?**
  _High betweenness centrality (0.030) - this node is a cross-community bridge._
- **What connects `gitignorePath`, `$schema`, `src/**/*.{js,ts,svelte}` to the rest of the system?**
  _143 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.06918767507002802 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.06660006660006661 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.05384615384615385 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.11008325624421832 - nodes in this community are weakly interconnected._