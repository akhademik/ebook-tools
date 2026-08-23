Còn:

txt-to-pdf.zip

nên chuyển sang:

GitHub Release asset
hoặc external download
hoặc release artifact

Không nên tiếp tục commit những file 80–100 MB vào source tree.

6. Một vấn đề kiến trúc quan trọng: font đang được fetch trong quá trình build EPUB

Trong EpubState.processEpub():

const res = await fetch(font.url);

sau đó buildEpubBlob() lại có logic fetch Bookerly lần nữa.

Và trong epub-packer.ts cũng có:

// Bookerly dynamic fetch

Tức là hiện tại có một chút double responsibility.

Mình sẽ chọn một nơi duy nhất:

FontManager
↓
resolve required fonts
↓
Array/Map<font, Blob>
↓
buildEpubBlob()

buildEpubBlob() nên là pure-ish packer:

input
↓
EPUB files
↓
Blob

Nó không nên tự đi network fetch.

Điều này đặc biệt quan trọng vì bạn đang quảng bá app là:

100% offline

README nói toàn bộ quá trình xử lý diễn ra local và không upload file lên server.

Nếu font lại được fetch từ network thì về mặt UX/privacy:

"offline" không còn hoàn toàn offline.

Nếu font đã nằm trong app bundle thì tốt nhất:

font asset
↓
Blob
↓
packer

không fetch() remote.

7. Có một bug/thiết kế đáng chú ý trong buildContentOpf()

Đây là chỗ mình muốn bạn sửa trước.

Bạn đang tạo manifest image như:

const imgId =
img.id ||
`img-${img.fileName.replace(/[^a-zA-Z0-9_-]/g, '_')}`;

nhưng fileName và mimeType được đưa vào XML khá trực tiếp.

Ví dụ:

`<item id="${imgId}" href="images/${img.fileName}" media-type="${mime}"/>`

Nếu filename đến từ user upload thì đây là dữ liệu không nên đưa thẳng vào XML.

Bạn đã có:

escapeXml()

nhưng phần này chưa dùng nhất quán.

Mình sẽ tạo:

escapeXmlAttribute()

và dùng cho:

href
media-type
id
xml:lang

Không phải vì đây là một security vulnerability cực nghiêm trọng trong local-only app, mà vì nó sẽ giúp EPUB builder robust hơn với file name bất thường.

10. buildEpubBlob() đang hơi "god function"

Đây là điểm architecture mình sẽ ưu tiên refactor tiếp theo.

Hiện function đang làm rất nhiều việc:

metadata
↓
font fetching
↓
font resolution
↓
CSS generation
↓
jacket
↓
cover
↓
chapter IDs
↓
OPF
↓
NAV
↓
NCX
↓
images
↓
fonts
↓
XHTML
↓
JSZip
↓
Blob

buildEpubBlob() hiện đã khá dài.

Mình sẽ chia thành:

buildEpub()
│
├── prepareEpub()
│
├── buildMetadata()
│
├── buildStyles()
│
├── buildManifest()
│
├── buildNavigation()
│
├── buildTextFiles()
│
├── addImages()
│
├── addFonts()
│
└── zipEpub()

Không cần tạo 20 file ngay.

Chỉ cần tách những responsibility lớn.

11. Có một điểm rất tốt nhưng nên làm rõ: skipParagraphMerge

Bạn gọi:

buildEpubBlob(
...
isTxtMode,
...
)

và parameter lại tên:

skipParagraphMerge

Trong EpubState:

const isTxtMode = this.source.fileType === 'txt';

rồi truyền vào skipParagraphMerge.

Tên parameter và ý nghĩa thực tế hơi khó hiểu.

Nếu:

TXT → skip merge
MD → merge

thì nên đặt tên semantic hơn:

preserveParagraphs

hoặc:

mergeBrokenParagraphs

để call-site tự giải thích.

Đây là loại refactor nhỏ nhưng rất đáng làm.

12. Dynamic CSS là ý tưởng hay

Bạn có:

getDynamicCss(chapters)

và chỉ include:

headings.css
quotes.css
breaks.css
notes.css

khi thực sự cần.

Mình thích cách này.

Nó đặc biệt phù hợp với EPUB vì:

EPUB càng ít CSS thừa càng tốt.

Tuy nhiên heuristic hiện tại:

html.includes('note')
html.includes('chapter')
html.includes('blockquote')

hơi "stringly typed".

Ví dụ chữ:

"Please take note of..."

cũng có thể trigger notesCss.

Không nghiêm trọng, nhưng về lâu dài tốt hơn nếu parser tạo metadata:

chapter.features = {
headings: true,
quotes: false,
notes: true,
sceneBreaks: false
}

sau đó CSS dựa vào feature flags.

15. Testing hiện là phần mình muốn thấy mạnh hơn

package.json đã có:

vitest
playwright

đây là rất tốt.

Nhưng với project này, test quan trọng nhất không phải UI.

Mình sẽ ưu tiên:

Unit tests
parser
chapter detection
heading detection
TOC
XML builders
HTML escaping
filename sanitization
font manifest
Golden/snapshot tests

Input:

book.md

Output:

expected EPUB structure

Sau đó unzip EPUB và assert:

mimetype
container.xml
content.opf
nav.xhtml
toc.ncx
chapter files
CSS
fonts
images
E2E

Chỉ cần vài workflow quan trọng:

upload TXT
→ detect chapters
→ configure
→ generate
→ download

và:

open EPUB
→ edit XHTML
→ preview
→ save

16. Mình đặc biệt khuyên thêm EPUB validation thật sự

Nếu mục tiêu cuối cùng của bạn là Kobo, đây sẽ là bước nâng repo lên một level khác.

Pipeline nên là:

Generate EPUB
↓
Structural validation
↓
EPUBCheck
↓
Custom Kobo checks
↓
Download

Thay vì:

Generate
↓
Download

Bạn có thể hiển thị:

✓ EPUB container
✓ OPF
✓ Manifest
✓ Spine
✓ Navigation
✓ XHTML
✓ CSS
✓ Images
✓ Fonts

⚠ Kobo:

- ...

Đây sẽ là một feature rất mạnh.

17. Home page hiện hơi "tool list"

+page.svelte hiện là grid 5 tool cards.

Không xấu.

Nhưng nếu project tiếp tục lớn lên, mình sẽ đổi mental model thành:

Ebook Forge

[ EPUB Editor ]
[ EPUB Packer ]

────────────

[ PDF Processor ]
[ Markdown Fixer ]

────────────

[ CJK Tools ]

thay vì tất cả tool ngang hàng.

Bởi vì:

Core
EPUB Editor
EPUB Packer
Preparation
PDF → JPG
Markdown Fixer
Advanced
TXT → PDF CJK

Kiến trúc product sẽ rõ hơn.

18. Có một vấn đề nhỏ về accessibility

Các card hiện là:

<a href="/pdf">
    ...
    <div> Mở công cụ </div>
</a>

Phần CTA là div nằm trong a.

Không sai về HTML, nhưng semantic/accessibility tốt hơn là:

<a href="/pdf">
    ...
    <span class="...">
        Mở công cụ
    </span>
</a>

hoặc style toàn bộ anchor thành button-like card.

Ngoài ra emoji:

📄
✍️
📦
✏️
💻

không phải vấn đề lớn nhưng nếu muốn UI professional hơn, icon system sẽ đồng nhất hơn.

19. Một vấn đề mình sẽ xử lý ngay: naming

Hiện project có:

src/lib/epub-packer/epub-state.svelte.ts
src/lib/epub-packer/epub-packer.ts

Hai cái tên:

epub-state
epub-packer

khá dễ nhầm.

Mình sẽ đổi conceptual structure thành:

epub/
├── state/
├── packer/
├── parser/
├── builders/
├── templates/
└── components/

hoặc nếu không muốn refactor lớn:

epub-packer/
├── state/
├── pack/
├── parser/
├── xml-builders/
├── templates/
└── components/

Không cần đổi ngay, nhưng nên có convention.

20. CI đang có nhưng mình muốn nó enforce hơn

Bạn đã có:

.github/workflows/ci.yml

và scripts:

lint
check
test
test:e2e
knip

Một CI lý tưởng cho repo này:

pnpm install --frozen-lockfile

pnpm lint
pnpm check
pnpm test
pnpm build
pnpm knip

E2E có thể chạy riêng nếu Playwright browser install làm CI nặng.
