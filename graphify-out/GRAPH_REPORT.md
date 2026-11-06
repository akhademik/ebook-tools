# Graph Report - ebook-tools  (2026-11-06)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 4861 nodes · 10377 edges · 256 communities (105 shown, 151 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 121 edges (avg confidence: 0.9)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `a28db38c`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- ConfigNamespace
- pdf.worker.min.js
- pdf.min.js
- TemplateNamespace
- CanvasGraphics
- XFAObjectArray
- zip-writer.ts
- epub-source-parser.ts
- lib/types/index.ts
- .add
- PartialEvaluator
- LocaleSetNamespace
- add
- .success
- AnnotationEditorUIManager
- has
- .get
- .push
- .resolve
- executeOpTree
- FreeTextEditor
- .addEventListener
- epub-editor-state.svelte.ts
- BaseFullReader
- AnnotationEditor
- InkEditor
- checkAndRepair
- Changelog
- xfaFactory
- real-world-workflows.test.ts
- AnnotationEditorLayer
- AI_WORKFLOW.md — Quy trình làm việc & Kiểm thử bắt buộc cho AI Coding Agent
- epub-state.svelte.ts
- XFAObject
- WidgetAnnotation
- AES256Cipher
- compileCharString
- EBOOK-TOOLS — FULL REGRESSION TESTING INSTRUCTION
- constructor
- .toString
- pdf-splitter.ts
- CanvasExtraState
- cleaner-engine.ts
- .remove
- .createDocumentHandler
- XhtmlObject
- .compile
- .getObj
- PDFDocumentProxy
- valueToHtml
- .createElement
- .i
- .makeFilter
- JpxError
- PDFImage
- .getArray
- CMap
- package.json
- duplicate-detector.ts
- .getTextContent
- fetchData
- Subform
- WorkerTransport
- Page
- Edge
- image-bg-remove-ml.ts
- fetchIfRef
- .onSymbolDictionary
- .a
- content-rules.ts
- Parser
- epub-reader-parser.ts
- .getByte
- .pop
- parse
- devDependencies
- PDFWorker
- .getBytes
- PDFWorkerStreamReader
- ExclGroup
- scripts
- BasePdfManager
- Word64
- ChunkedStream
- .constructor
- EpubImagesState
- pdf.ts
- .render
- PDFPageProxy
- parseTilePackets
- XmlObject
- process
- _bindElement
- Caption
- compilerOptions
- LabCS
- SimpleSegmentVisitor
- makeHexColor
- PDFDataRangeTransport
- P
- ContentObject
- PdfSplitterState
- CalRGBCS
- ColorSpace
- find
- pdf-splitter.type.ts
- Stream
- _walk
- NullOptimizer
- dependencies
- @playwright/test
- epub-parser.test.ts
- BitModel
- assignSequentialChapterIds
- LinkAnnotationElement
- build
- XFAAttribute
- PageViewport
- readNextChar
- Color
- vite.config.js
- image-bg-remove.worker.ts
- BaseCanvasFactory
- CommandManager
- AlternateCS
- PageArea
- Text
- TextState
- components.type.ts
- AnnotationBorderStyle
- parseCharString
- Template
- Xdp
- Datasets
- IndexedCS
- result.type.ts
- BaseFilterFactory
- RenderTask
- Br
- DeviceCmykCS
- EvaluatorPreprocessor
- ExData
- PageSet
- Signature
- transform
- tests-e2e/tsconfig.json
- Tuyển Tập Truyện Ngắn Đương Đại
- tests/tsconfig.json
- knip.json
- BaseShading
- Root
- DeviceGrayCS
- DeviceRgbCS
- Ref
- Stylesheet
- Traverse
- Ui
- Assist
- EquateRange
- Exclude
- .log
- Packets
- PageRange
- Picture
- Record
- Relevant
- Rename
- Script
- Uri
- Validate
- .decodeNode
- Linear
- Margin
- Occur
- Para
- Pattern
- SubjectDN
- XfaText
- Acrobat7
- AddSilentPrint
- AddViewerPreferences
- AdjustData
- AdobeExtensionLevel
- Base
- BatchOutput
- Bookend
- Change
- Cmd
- Comb
- Creator
- DefaultTypeface
- Destination
- DocumentAssembly
- DuplexOption
- Embed
- Enforce
- ExcludeNS
- FormFieldFilling
- IncrementalLoad
- IncrementalMerge
- Interactive
- Jog
- LabelPrinter
- Layout
- Level
- MediumInfo
- Mode
- ModifyAnnots
- MsgId
- NeverEmbed
- NumberOfCopies
- OpenAction
- OutputXSL
- PageOffset
- Pagination
- Pdf
- Pdfa
- Permissions
- PickTrayByPDFSize
- PlaintextMetadata
- Print
- PrinterName
- Producer
- RenderPolicy
- RunScripts
- ScriptModel
- Severity
- Staple
- StartNode
- StartPage
- SubmitFormat
- SubmitUrl
- SuppressBanner
- Tagged
- Threshold
- ValidationMessaging
- WebClient
- Xsl
- Zpl
- WsdlConnection
- XsdConnection
- Format
- Name
- Oid
- RefElement
- Submit
- Window
- src_lib_epub_packer_epub_packer_buildchapterxhtml
- src_lib_epub_packer_epub_packer_buildnavxhtml
- src_lib_epub_packer_epub_packer_buildtocncx
- src_lib_epub_packer_epub_packer_gettocentries
- src_lib_epub_packer_epub_packer_injectheadingids
- src_lib_epub_packer_epub_packer_mergebrokenparagraphs

## God Nodes (most connected - your core abstractions)
1. `ConfigNamespace` - 141 edges
2. `TemplateNamespace` - 115 edges
3. `CanvasGraphics` - 96 edges
4. `AnnotationEditorUIManager` - 80 edges
5. `AnnotationEditor` - 78 edges
6. `XFAObjectArray` - 66 edges
7. `has()` - 65 edges
8. `XFAObject` - 56 edges
9. `create()` - 56 edges
10. `InkEditor` - 53 edges

## Surprising Connections (you probably didn't know these)
- `2026-10-25 (PDF Smart Split ZIP, Mobile Guard & Full Zero-Copy Synchronization)` --references--> `PdfZipPart`  [INFERRED]
  README.md → src/lib/types/pdf-splitter.type.ts
- `2026-10-25 (PDF Smart Split ZIP, Mobile Guard & Full Zero-Copy Synchronization)` --references--> `ProcessPdfResult`  [INFERRED]
  README.md → src/lib/types/pdf-splitter.type.ts
- `2026-10-16 (H2 Font Classification with Intervening Ornaments)` --references--> `classifyChapterHeadings()`  [INFERRED]
  README.md → src/lib/epub-packer/xml-builders/chapter-builder.ts
- `2026-10-16 (Worker Cancellation Race Condition & ML Fallback Hardening)` --references--> `processOrnamentOnMainThread()`  [INFERRED]
  README.md → src/lib/utils/image-bg-remove-ml.ts
- `2026-10-25 (PDF Smart Split ZIP, Mobile Guard & Full Zero-Copy Synchronization)` --references--> `PdfSplitterState`  [INFERRED]
  README.md → src/lib/pdf-splitter/pdf-splitter-state.svelte.ts

## Import Cycles
- None detected.

## Communities (256 total, 151 thin omitted)

### Community 0 - "ConfigNamespace"
Cohesion: 0.01
Nodes (43): AlwaysEmbed, Amd, Attributes, AutoSave, BehaviorOverride, Compress, Compression, CompressLogicalStructure (+35 more)

### Community 1 - "pdf.worker.min.js"
Cohesion: 0.02
Nodes (67): accept(), ADBE_JSConsole, ADBE_JSDebugger, applyTransform(), BaseException(), bezierBoundingBox(), bytesToString(), CFFEncoding (+59 more)

### Community 2 - "pdf.min.js"
Cohesion: 0.03
Nodes (64): addNativeFontFace(), AnnotationElementFactory, BaseException(), bind(), bytesToString(), CMYK_HTML(), CMYK_RGB(), composeSMaskBackdrop() (+56 more)

### Community 3 - "TemplateNamespace"
Cohesion: 0.02
Nodes (31): AppearanceFilter, Barcode, Break, Certificate, Certificates, Connect, DefaultUi, DigestMethod (+23 more)

### Community 4 - "CanvasGraphics"
Cohesion: 0.05
Nodes (15): applyTransform(), CanvasGraphics, clip(), composeSMask(), copyCtxState(), drawImageAtIntegerCoords(), getAxialAlignedBoundingBox(), group() (+7 more)

### Community 5 - "XFAObjectArray"
Cohesion: 0.02
Nodes (28): Acrobat, Agent, Common, Config, Data, Desc, DigestMethods, Encodings (+20 more)

### Community 6 - "zip-writer.ts"
Cohesion: 0.06
Nodes (62): ref_css_template_intro_css_css_raw, ref_templates_css_template_base_css_raw, ref_templates_css_template_breaks_css_raw, ref_templates_css_template_center_page_css_raw, ref_templates_css_template_cover_css_raw, ref_templates_css_template_headings_css_raw, ref_templates_css_template_notes_css_raw, ref_templates_css_template_ornaments_css_raw (+54 more)

### Community 7 - "epub-source-parser.ts"
Cohesion: 0.07
Nodes (70): 2026-10-16 (TypeScript Strict Mode Full Compliance), analyzeChapterCandidates(), extractChunkBlocks(), extractMarkerTitle(), isDecorationOnly(), makeChapterMatcher(), pushIfLineStart(), scoreHeadingCandidate() (+62 more)

### Community 8 - "lib/types/index.ts"
Cohesion: 0.05
Nodes (45): MAX_EPUB_FILE_SIZE, MAX_IMAGE_FILE_SIZE, MAX_IMAGES_ZIP_FILE_SIZE, MAX_PDF_FILE_SIZE, MAX_TXT_FILE_SIZE, MAX_ZIP_FILE_SIZE, src_lib_epub_packer_parser_epub_source_parser_parsetxttochaptersasync, EpubFontsState (+37 more)

### Community 9 - ".add"
Cohesion: 0.05
Nodes (18): AnnotationElement, CaretAnnotationElement, CircleAnnotationElement, FileAttachmentAnnotationElement, FreeTextAnnotationElement, getRectDims(), HighlightAnnotationElement, InkAnnotationElement (+10 more)

### Community 10 - "PartialEvaluator"
Cohesion: 0.06
Nodes (12): EvalState, forEach(), getCached(), load(), loadXfaFonts(), OperatorList, parseShading(), PartialEvaluator (+4 more)

### Community 11 - "LocaleSetNamespace"
Cohesion: 0.03
Nodes (24): CalendarSymbols, CurrencySymbol, CurrencySymbols, DatePattern, DatePatterns, DateTimeSymbols, Day, DayNames (+16 more)

### Community 12 - "add"
Cohesion: 0.05
Nodes (19): add(), addPdfFont(), CFF, CFFCharset, CFFCompiler, CFFDict, CFFIndex, CFFOffsetTracker (+11 more)

### Community 13 - ".success"
Cohesion: 0.04
Nodes (22): applyAssist(), ariaLabel(), BreakAfter, BreakBefore, Button, CheckButton, ChoiceList, ContentArea (+14 more)

### Community 15 - "has"
Cohesion: 0.05
Nodes (14): addChildren(), adjustMapping(), Catalog, appendIfJavaScriptDict(), addPageDict(), _collectJS(), fetchAsync(), fetchDestination() (+6 more)

### Community 16 - ".get"
Cohesion: 0.06
Nodes (11): Annotation, Dict, FakeUnicodeFont, formInfo(), FreeTextAnnotation, generateImages(), getPdfColor(), _hasOnlyDocumentSignatures() (+3 more)

### Community 17 - ".push"
Cohesion: 0.06
Nodes (36): #a(), CaretAnnotation, CircleAnnotation, create(), getInt(), fetchIfRefAsync(), fieldObjects(), FileAttachmentAnnotation (+28 more)

### Community 18 - ".resolve"
Cohesion: 0.04
Nodes (15): #de(), _fetchDocument(), getArrayBuffer(), _onProgress(), _onReceiveData(), PDFDataTransportStreamRangeReader, PDFDataTransportStreamReader, PDFNetworkStreamFullRequestReader (+7 more)

### Community 19 - "executeOpTree"
Cohesion: 0.06
Nodes (49): addFontStyle(), beginText(), closeEOFillStroke(), closeFillStroke(), closePath(), closeStroke(), constructPath(), endPath() (+41 more)

### Community 20 - "FreeTextEditor"
Cohesion: 0.05
Nodes (3): FreeTextEditor, KeyboardManager, toDateObject()

### Community 21 - ".addEventListener"
Cohesion: 0.06
Nodes (12): AnnotationStorage, CheckboxWidgetAnnotationElement, ChoiceWidgetAnnotationElement, PrintAnnotationStorage, PushButtonWidgetAnnotationElement, RadioButtonWidgetAnnotationElement, render(), setAttributes() (+4 more)

### Community 22 - "epub-editor-state.svelte.ts"
Cohesion: 0.07
Nodes (42): isDirty, categorizeFile(), exportEpubBlob(), extractLinkedCssPaths(), parseSpineOrder(), parseZipEntries(), deobfuscateAdobeFont(), deobfuscateIdpfFont() (+34 more)

### Community 23 - "BaseFullReader"
Cohesion: 0.04
Nodes (24): fontkit, ref_fs, ref_http, ref_https, ref_module, ref_path, files, fontkit (+16 more)

### Community 26 - "checkAndRepair"
Cohesion: 0.05
Nodes (37): adjustWidths(), charCodeOf(), _charToGlyph(), checkAndRepair(), readNameTable(), readOpenTypeHeader(), sanitizeGlyph(), CompositeGlyph (+29 more)

### Community 27 - "Changelog"
Cohesion: 0.07
Nodes (46): 2026-09-27, 2026-09-27 (Trước đó), 2026-10-15, 2026-10-15 (letter-box wrapper), 2026-10-16 (CI/CD Pipeline Hardening & Knip Resolution), 2026-10-16 (CI/CD Verification & Expanded Test Coverage), 2026-10-16 (Clean Up), 2026-10-16 (Fix Jacket Modal Font Persistence Across Templates) (+38 more)

### Community 28 - "xfaFactory"
Cohesion: 0.05
Nodes (10): isWhitespace(), onBeginElement(), onCdata(), onText(), parseFromString(), SimpleDOMNode, xfaFactory(), XFAParser (+2 more)

### Community 29 - "real-world-workflows.test.ts"
Cohesion: 0.09
Nodes (32): 2026-10-16 (Letter/Poem Dropcap Suppression & Heading Syntax Warning), 2026-10-16 (NHOM 1 Review Bug Fixes), jszip, vitest, optimizeEpub(), src_lib_epub_editor_epub_cleaner_analyzeoptimizationplan, src_lib_epub_editor_epub_cleaner_optimizeepub, src_lib_epub_editor_epub_editor_buildpreviewhtml (+24 more)

### Community 30 - "AnnotationEditorLayer"
Cohesion: 0.07
Nodes (3): AnnotationEditorLayer, getEditableAnnotation(), has()

### Community 31 - "AI_WORKFLOW.md — Quy trình làm việc & Kiểm thử bắt buộc cho AI Coding Agent"
Cohesion: 0.04
Nodes (44): 0. Thứ tự đọc khi mở lại project (BẮT BUỘC, không được bỏ qua bước nào), 1. Ngăn xếp công nghệ & quy tắc code bắt buộc, 2.1 Chu trình kiểm tra cục bộ khi sửa code (Local Dev Loop), 2.3 Quy tắc chỉnh sửa file (bắt buộc), 2. Pipeline bắt buộc sau MỌI lần chỉnh sửa code & Trước khi Commit, 3.1 Kiến trúc Hệ Thống Kiểm Thử 4 Tầng, 3.2 Ma Trận Hướng Dẫn: "Sửa Gì - Chạy Test Gì?" (Test Decision Matrix), 3.3 Bảng Tra Cứu Lệnh Nhanh (Cheat Sheet) (+36 more)

### Community 32 - "epub-state.svelte.ts"
Cohesion: 0.07
Nodes (15): src_assets_fonts_metadata, uniqueFamilies, src_lib_epub_packer_epub_packer_epub_css, EpubState, src_lib_epub_packer_state_index_epubfontsstate, src_lib_epub_packer_state_index_epubimagesstate, src_lib_epub_packer_state_index_epubjacketstate, src_lib_epub_packer_state_index_epubmetadatastate (+7 more)

### Community 34 - "WidgetAnnotation"
Cohesion: 0.09
Nodes (10): addString(), ButtonWidgetAnnotation, charsToGlyphs(), ChoiceWidgetAnnotation, documentInfo(), encodeString(), getCharPositions(), loadXfaImages() (+2 more)

### Community 35 - "AES256Cipher"
Cohesion: 0.08
Nodes (10): AES128Cipher, AES256Cipher, AESBaseCipher, ARCFourCipher, calculateSHA384(), CipherTransformFactory, Encrypt, NullCipher (+2 more)

### Community 36 - "compileCharString"
Cohesion: 0.06
Nodes (20): compileCharString(), bezierCurveTo(), lineTo(), moveTo(), CompiledFont, compileGlyf(), lineTo(), moveTo() (+12 more)

### Community 37 - "EBOOK-TOOLS — FULL REGRESSION TESTING INSTRUCTION"
Cohesion: 0.05
Nodes (41): 10. PDF → EPUB USER FLOW, 11. EPUB EDITOR E2E, 12. EPUB CLEANER E2E, 13. EPUB VALIDATOR E2E, 14. IMAGE PROCESSING E2E, 15. WORKER TESTING, 16. REGRESSION TEST, 17. OUTPUT FILE VALIDATION (+33 more)

### Community 38 - "constructor"
Cohesion: 0.07
Nodes (28): amend(), amendFallbackToUnicode(), applyStandardFontGlyphMap(), buildToFontChar(), byteIn(), constructor(), _createBuiltInEncoding(), DatasetXMLParser (+20 more)

### Community 39 - ".toString"
Cohesion: 0.06
Nodes (14): addNode(), addTopLevelNode(), calculationOrderIds(), parseNestedOrder(), parseOnOff(), parseOrder(), fingerprints(), hexString() (+6 more)

### Community 40 - "pdf-splitter.ts"
Cohesion: 0.07
Nodes (34): 2026-10-26 (PDF Splitter Disk Stream Zero-byte Fix, UI Button State Sync & Playwright E2E Coverage), applyGrayscale(), cropCanvas(), DEFAULT_DESKTOP_PART_BYTES, DEFAULT_DPI, DEFAULT_MAX_PAGES_PER_PART, DEFAULT_MOBILE_PART_BYTES, dpiToScale() (+26 more)

### Community 41 - "CanvasExtraState"
Cohesion: 0.08
Nodes (12): applyBoundingBox(), BaseShadingPattern, bezierBoundingBox(), CachedCanvases, CanvasExtraState, DummyShadingPattern, getImageSmoothingEnabled(), intersect() (+4 more)

### Community 42 - "cleaner-engine.ts"
Cohesion: 0.12
Nodes (17): analyzeEpub(), analyzeOptimizationPlan(), cleanEpub(), extractCssUrls(), extractHtmlReferences(), formatByteSize(), EpubAnalysisResult, EpubCleanOptions (+9 more)

### Community 44 - ".createDocumentHandler"
Cohesion: 0.10
Nodes (22): annotationGlobals(), checkFirstPage(), checkLastPage(), createGlobals(), ensure(), _getPageIndex(), on(), requestLoadedStream() (+14 more)

### Community 45 - "XhtmlObject"
Cohesion: 0.07
Nodes (11): Body, Html, Li, mapStyle(), Ol, Span, Sub, Sup (+3 more)

### Community 46 - ".compile"
Cohesion: 0.09
Nodes (12): AstArgument, AstBinaryOperation, AstLiteral, AstMin, AstNode, AstVariable, AstVariableDefinition, buildAddOperation() (+4 more)

### Community 47 - ".getObj"
Cohesion: 0.12
Nodes (22): expectInt(), expectString(), getNumber(), Lexer, nextChar(), parseBfChar(), parseBfRange(), parseCidChar() (+14 more)

### Community 49 - "valueToHtml"
Cohesion: 0.06
Nodes (8): BooleanElement, DateElement, DateTime, Decimal, Float, Integer, Time, valueToHtml()

### Community 50 - ".createElement"
Cohesion: 0.10
Nodes (8): appendText(), BaseSVGFactory, get(), getCtx(), getPathGenerator(), layout(), PopupElement, TextLayerRenderTask

### Community 51 - ".i"
Cohesion: 0.08
Nodes (12): ConnectionSet, ConnectionSetNamespace, EffectiveInputPolicy, EffectiveOutputPolicy, getMeasurement(), Operation, parseExpression(), RootElement (+4 more)

### Community 52 - ".makeFilter"
Cohesion: 0.08
Nodes (8): Ascii85Stream, AsciiHexStream, CCITTFaxStream, JpegStream, JpxStream, LZWStream, PredictorStream, RunLengthStream

### Community 53 - "JpxError"
Cohesion: 0.09
Nodes (21): buildCodeblocks(), buildPackets(), buildPrecincts(), Calculate, calculateComponentDimensions(), calculateTileGrids(), ComponentPositionResolutionLayerIterator(), createPacket() (+13 more)

### Community 54 - "PDFImage"
Cohesion: 0.11
Nodes (5): decodeAndClamp(), Fill, ImageResizer, PDFImage, resizeImageMask()

### Community 55 - ".getArray"
Cohesion: 0.11
Nodes (7): _cache(), createFromArray(), getTransformMatrix(), PDFFunction, PostScriptCompiler, RadialAxialShading, toNumberArray()

### Community 56 - "CMap"
Cohesion: 0.08
Nodes (4): CMap, createBuiltInCMap(), extendCMap(), IdentityCMap

### Community 57 - "package.json"
Cohesion: 0.08
Nodes (26): gitignorePath, name, packageManager, private, type, version, codemirror, @codemirror/commands (+18 more)

### Community 58 - "duplicate-detector.ts"
Cohesion: 0.14
Nodes (22): cleanupDuplicateWorkerAndFallback(), DuplicatePendingJob, getDuplicateWorker(), pendingDuplicateJobs, _resetDuplicateWorkerForTest(), scanDuplicateResources(), computeDuplicateResources(), DuplicateDetectorWorkerRequest (+14 more)

### Community 59 - ".getTextContent"
Cohesion: 0.14
Nodes (15): 2.2 Pipeline Chốt Chặn CI/CD (BẮT BUỘC 100% PASS TRƯỚC KHI COMMIT HOẶC PUSH), BaseLocalCache, addFakeSpaces(), appendEOL(), applyInverseRotation(), buildTextContentItem(), compareWithLastPosition(), ensureTextContentItem() (+7 more)

### Community 60 - "fetchData"
Cohesion: 0.08
Nodes (12): BaseCMapReaderFactory, BaseStandardFontDataFactory, cancelAllRequests(), createFetchOptions(), createHeaders(), DOMCMapReaderFactory, DOMStandardFontDataFactory, fetchData() (+4 more)

### Community 61 - "Subform"
Cohesion: 0.07
Nodes (4): Area, getContainedChildren(), Subform, SubformSet

### Community 63 - "Page"
Cohesion: 0.11
Nodes (3): Page, printNewAnnotations(), saveNewAnnotations()

### Community 64 - "Edge"
Cohesion: 0.08
Nodes (7): Arc, Border, Corner, Edge, hasMargin(), Line, Rectangle

### Community 65 - "image-bg-remove-ml.ts"
Cohesion: 0.18
Nodes (22): @imgly/background-removal, autoCropTransparentCanvas(), canvasToBlob(), cleanupWorkerAndFallbackPending(), compressAndResizeCanvas(), getOrCreateWorker(), loadImage(), OrnamentProcessOptions (+14 more)

### Community 66 - "fetchIfRef"
Cohesion: 0.14
Nodes (7): fetch(), fetchCompressed(), fetchIfRef(), fetchUncompressed(), getNewTemporaryRef(), StructTreeRoot, XRefEntryException

### Community 67 - ".onSymbolDictionary"
Cohesion: 0.16
Nodes (11): decodeIAID(), decodeInteger(), decodeRefinement(), decodeTextRegion(), getCustomHuffmanTable(), getStandardTable(), HuffmanLine, HuffmanTable (+3 more)

### Community 68 - ".a"
Cohesion: 0.14
Nodes (9): ref_url, constructor(), DOMFilterFactory, DOMSVGFactory, getRGB(), _onProgressiveDone(), OptionalContentGroup, setVisibility() (+1 more)

### Community 69 - "content-rules.ts"
Cohesion: 0.16
Nodes (19): src_lib_epub_editor_epub_cleaner_extractcssurls, src_lib_epub_editor_epub_editor_isvalidfontmagic, src_lib_epub_editor_epub_editor_validatehtml, CssAndFontsRule, XhtmlPagesRule, NavigationRule, OpfPackageRule, SpineRule (+11 more)

### Community 70 - "Parser"
Cohesion: 0.18
Nodes (4): CipherTransform, DecryptStream, Parser, ParserEOFException

### Community 71 - "epub-reader-parser.ts"
Cohesion: 0.17
Nodes (18): categorizeResource(), extractEpubMetadata(), findOpfPath(), parseEpub(), parseOpfManifestAndSpine(), EpubBook, EpubBookMetadata, EpubContainer (+10 more)

### Community 72 - ".getByte"
Cohesion: 0.13
Nodes (3): BaseStream, FlateStream, parseImageProperties()

### Community 73 - ".pop"
Cohesion: 0.11
Nodes (7): AppearanceStreamEvaluator, buildHuffmanTable(), sanitizeTTProgram(), clean(), PostScriptEvaluator, PostScriptStack, serialize()

### Community 74 - "parse"
Cohesion: 0.14
Nodes (17): buildComponentData(), readBits(), decodeScan(), decodeBlock(), decodeHuffman(), decodeMcu(), readBit(), receive() (+9 more)

### Community 75 - "devDependencies"
Cohesion: 0.10
Nodes (21): devDependencies, eslint, @eslint/js, eslint-plugin-svelte, globals, knip, @playwright/test, prettier (+13 more)

### Community 76 - "PDFWorker"
Cohesion: 0.12
Nodes (7): getDataProp(), getDocument(), getUrlProp(), LoopbackPort, PDFDocumentLoadingTask, PDFWorker, send()

### Community 77 - ".getBytes"
Cohesion: 0.11
Nodes (6): readTableEntry(), readTables(), DecodeStream, indexObjects(), Jbig2Stream, readBlock()

### Community 78 - "PDFWorkerStreamReader"
Cohesion: 0.10
Nodes (8): cancelAllRequests(), DefaultAppearanceEvaluator, getFullReader(), getRangeReader(), PDFWorkerStreamRangeReader, PDFWorkerStreamReader, sendProgressiveData(), getPdfManager()

### Community 79 - "ExclGroup"
Cohesion: 0.10
Nodes (3): ExclGroup, Image, Value

### Community 80 - "scripts"
Cohesion: 0.11
Nodes (19): scripts, build, check, dev, format, format:check, knip, lint (+11 more)

### Community 82 - "Word64"
Cohesion: 0.20
Nodes (8): ch(), littleSigma(), littleSigmaPrime(), maj(), rotr(), sigma(), sigmaPrime(), Word64

### Community 84 - ".constructor"
Cohesion: 0.23
Nodes (3): getB(), MeshShading, MeshStreamReader

### Community 86 - "pdf.ts"
Cohesion: 0.13
Nodes (14): 2026-10-25 (PDF Splitter Full Hardening: Zero-Copy, Canvas Guard, 100% Offline), openPdfDocument(), src_lib_types_index_pdfjspage, src_lib_types_index_pdfjsviewport, PdfJsDocument, getClampedViewport(), initPdfWorker(), MAX_CANVAS_DIMENSION (+6 more)

### Community 87 - ".render"
Cohesion: 0.20
Nodes (3): clear(), InternalRenderTask, RenderingCancelledException

### Community 89 - "parseTilePackets"
Cohesion: 0.15
Nodes (6): InclusionTree, parseTilePackets(), readCodingpasses(), skipBytes(), skipMarkerIfEqual(), TagTree

### Community 91 - "process"
Cohesion: 0.22
Nodes (7): addHex(), BinaryCMapStream, hexToInt(), hexToStr(), incHex(), process(), readNumber()

### Community 92 - "_bindElement"
Cohesion: 0.17
Nodes (13): bind(), _bindElement(), _bindItems(), _bindOccurrences(), _bindValue(), _createOccurrences(), createText(), _findDataByNameToConsume() (+5 more)

### Community 93 - "Caption"
Cohesion: 0.12
Nodes (4): Caption, Draw, Field, _setValue()

### Community 94 - "compilerOptions"
Cohesion: 0.13
Nodes (14): ./.svelte-kit/tsconfig.json, compilerOptions, allowJs, checkJs, esModuleInterop, forceConsistentCasingInFileNames, moduleResolution, resolveJsonModule (+6 more)

### Community 96 - "SimpleSegmentVisitor"
Cohesion: 0.22
Nodes (5): ContextCache, decodeBitmap(), decodeMMRBitmap(), DecodingContext, SimpleSegmentVisitor

### Community 97 - "makeHexColor"
Cohesion: 0.18
Nodes (5): ColorManager, makeHexColor(), setFillRGBColor(), setStrokeRGBColor(), TilingPattern

### Community 99 - "P"
Cohesion: 0.14
Nodes (6): addPara(), B, I, P, popFont(), pushData()

### Community 100 - "ContentObject"
Cohesion: 0.14
Nodes (4): ContentObject, IntegerObject, OptionObject, StringObject

### Community 104 - "find"
Cohesion: 0.19
Nodes (5): find(), FontInfo, FontSelector, getDefault(), startXRef()

### Community 105 - "pdf-splitter.type.ts"
Cohesion: 0.20
Nodes (10): App, Window, PdfJsLib, PdfJsPage, PdfJsViewport, PdfPreviewPage, PdfProgressInfo, PdfZipPart (+2 more)

### Community 106 - "Stream"
Cohesion: 0.17
Nodes (3): checkHeader(), parseCff(), Stream

### Community 107 - "_walk"
Cohesion: 0.23
Nodes (12): getBaseStreams(), getBeginChunk(), getEndChunk(), groupChunks(), onProgress(), onReceiveData(), requestAllChunks(), _requestChunks() (+4 more)

### Community 109 - "dependencies"
Cohesion: 0.18
Nodes (11): dependencies, codemirror, @codemirror/commands, @codemirror/lang-css, @codemirror/lang-html, @codemirror/state, @codemirror/theme-one-dark, @codemirror/view (+3 more)

### Community 110 - "@playwright/test"
Cohesion: 0.25
Nodes (4): ref_node_fs, ref_node_path, ref_node_process, @playwright/test

### Community 111 - "epub-parser.test.ts"
Cohesion: 0.18
Nodes (10): src_lib_epub_packer_parser_epub_source_parser_analyzechaptercandidates, src_lib_epub_packer_parser_epub_source_parser_assignsequentialchapterids, src_lib_epub_packer_parser_epub_source_parser_cleanheaderfooterocr, src_lib_epub_packer_parser_epub_source_parser_converttxtinline, src_lib_epub_packer_parser_epub_source_parser_getcleanedlinesreport, src_lib_epub_packer_parser_epub_source_parser_parsemarkdownblocks, src_lib_epub_packer_parser_epub_source_parser_parsetxttochapters, src_lib_epub_packer_parser_epub_source_parser_rendermarkdownblocks (+2 more)

### Community 115 - "build"
Cohesion: 0.22
Nodes (6): _addNamespacePrefix(), build(), Empty, _getNamespaceToUse(), _searchNamespace(), UnknownNamespace

### Community 118 - "readNextChar"
Cohesion: 0.50
Nodes (9): _addPixels(), _addPixelsNeg(), _eatBits(), _findTableCode(), _getBlackCode(), _getTwoDimCode(), _getWhiteCode(), _lookBits() (+1 more)

### Community 119 - "Color"
Cohesion: 0.22
Nodes (3): Color, makeHexColor(), Stipple

### Community 120 - "vite.config.js"
Cohesion: 0.25
Nodes (5): @sveltejs/adapter-cloudflare, @sveltejs/kit, @tailwindcss/vite, ref_types, vite

### Community 128 - "components.type.ts"
Cohesion: 0.29
Nodes (6): svelte, ButtonProps, DropZoneProps, FontSelectProps, InputProps, PageHeaderProps

### Community 130 - "parseCharString"
Cohesion: 0.29
Nodes (5): CFFFDSelect, parseCharString(), parseCharStrings(), parseFDSelect(), stackFn()

### Community 135 - "result.type.ts"
Cohesion: 0.40
Nodes (3): AppError, Result, ValidationError

### Community 145 - "tests-e2e/tsconfig.json"
Cohesion: 0.33
Nodes (5): compilerOptions, types, extends, include, ../tsconfig.json

### Community 146 - "Tuyển Tập Truyện Ngắn Đương Đại"
Cohesion: 0.33
Nodes (5): 1.1 Buổi Sáng Ở Quán Cà Phê, 2.2 Kết Thúc Một Ngày, Chương 1: Ký Ức Mùa Thu, Chương 2: Tiếng Chuông Chiều, Tuyển Tập Truyện Ngắn Đương Đại

### Community 147 - "tests/tsconfig.json"
Cohesion: 0.33
Nodes (5): compilerOptions, types, extends, include, ../tsconfig.json

### Community 148 - "knip.json"
Cohesion: 0.40
Nodes (4): entry, ignoreDependencies, project, $schema

## Knowledge Gaps
- **256 isolated node(s):** `PdfJsPage`, `PdfJsViewport`, `PdfPreviewPage`, `PdfProgressInfo`, `ProcessPdfOptions` (+251 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1568 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **151 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `appendText()` connect `.createElement` to `pdf.min.js`, `CanvasGraphics`, `.a`?**
  _High betweenness centrality (0.101) - this node is a cross-community bridge._
- **Why does `setVisibility()` connect `.a` to `pdf.min.js`?**
  _High betweenness centrality (0.082) - this node is a cross-community bridge._
- **Why does `XhtmlNamespace` connect `XhtmlObject` to `pdf.worker.min.js`, `.a`, `Br`, `.i`, `.getArray`, `real-world-workflows.test.ts`?**
  _High betweenness centrality (0.079) - this node is a cross-community bridge._
- **What connects `PdfJsPage`, `PdfJsViewport`, `PdfPreviewPage` to the rest of the system?**
  _256 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `ConfigNamespace` be split into smaller, more focused modules?**
  _Cohesion score 0.014492753623188406 - nodes in this community are weakly interconnected._
- **Should `pdf.worker.min.js` be split into smaller, more focused modules?**
  _Cohesion score 0.02043452730475631 - nodes in this community are weakly interconnected._
- **Should `pdf.min.js` be split into smaller, more focused modules?**
  _Cohesion score 0.028926422053970103 - nodes in this community are weakly interconnected._