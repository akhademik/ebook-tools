4. Nhưng có một vấn đề kiến trúc mình sẽ ưu tiên sửa

Bạn hiện đang có hai source of truth:

JSZip

- editBuffer

Trong một số operation, bạn lại ghi cả hai.

Ví dụ rebuildToc():

editBuffer.set(...)
zip.file(...)

Điều này về lâu dài rất dễ sinh bug kiểu:

editBuffer !== zip

Đặc biệt nguy hiểm với:

cleaner
metadata
TOC rebuild
export
preview
undo/redo sau này
Mình đề xuất

Chọn:

editBuffer là canonical state.

JSZip chỉ là:

immutable-ish input/output container

Tức là:

ZIP input
↓
FileStore / editBuffer
↓
Operations
↓
export
↓
new ZIP

Không nên mutate zip giữa quá trình edit nếu không thật sự cần.

Đây sẽ là một cải thiện kiến trúc đáng kể.

5. Performance: mình tìm thấy vài điểm đáng chú ý

Đây là phần quan trọng nhất nếu bạn đang muốn tối ưu project.

🔴 5.1. EPUB export đang DEFLATE level 9 toàn bộ ZIP

Trong buildEpubBlob():

zip.generateAsync({
type: 'blob',
mimeType: 'application/epub+zip',
compression: 'DEFLATE',
compressionOptions: { level: 9 }
});

Đây là một trong những điểm performance lớn nhất.

Level 9 cực kỳ tốn CPU.

Trong EPUB:

XHTML → compress tốt
CSS → compress tốt
XML → compress tốt
JPEG → gần như không thêm được gì
PNG → gần như không thêm được gì
WOFF/WOFF2 → đã compressed
TTF/OTF → ít lợi ích

Nhưng hiện tại bạn đang để JSZip xử lý chung.

Nên đổi thành per-file compression

Ví dụ concept:

XHTML/XML/CSS/NCX
→ DEFLATE

JPEG/PNG/WebP
→ STORE

WOFF/WOFF2
→ STORE

TTF/OTF
→ STORE

Và mình sẽ dùng:

DEFLATE level 6

thay vì 9.

Với mục tiêu của project, level 6 thường là sweet spot.

6. 🔴 Một vấn đề còn đáng chú ý hơn: font

Trong resolveActiveFonts() bạn đã làm khá tốt:

resolveActiveFonts()

và xác định font thực sự active.

Nhưng sau đó trong assembleEpubZip() bạn lại:

for (const [fontName, blob] of Object.entries(fonts.blobs)) {
...
fontsFolder.file(fileName, data);
}

Tức là:

Bạn xác định active fonts nhưng vẫn pack toàn bộ fonts.blobs.

Đây là một bug/performance issue khá rõ.

Nếu UI có 20 font:

Bookerly
Font A
Font B
Font C
...
Font T

nhưng user chỉ chọn:

H1 = Font A
H2 = Font B

thì EPUB vẫn có khả năng chứa toàn bộ fonts.

Nên sửa

Chỉ:

for (const fontName of activeFonts)

hoặc một tập font thực sự được sử dụng.

Đây có thể làm EPUB:

5 MB → 500 KB

tùy font collection.

Và quan trọng hơn:

giảm ZIP size
giảm RAM
giảm export time
giảm load time trên Kobo
giảm thời gian sync Kobo

7. 🔴 JSZip.loadAsync() đang load cả EPUB vào RAM

Trong editor:

const arrayBuffer = await file.arrayBuffer();
const loadedZip = await JSZip.loadAsync(arrayBuffer);
this.zip = loadedZip;

Đối với EPUB bình thường:

5–30 MB

không vấn đề.

Nhưng với EPUB:

100 MB
200 MB
500 MB

thì browser sẽ có:

File ArrayBuffer

- JSZip structures
- decompressed content
- editBuffer
- preview HTML
- Blob

RAM có thể tăng lên nhiều lần kích thước EPUB.

Đây là nơi mình sẽ chuẩn bị architecture cho large-book mode.

Không cần làm ngay, nhưng nên thiết kế:

Small EPUB
→ current JSZip path

Large EPUB
→ lazy entry loading

8. ensureFileLoaded() có một behavior tốt nhưng cũng có trade-off

Bạn cache:

editBuffer
originalContents

Điều này rất tốt cho performance khi user quay lại chapter.

Nhưng nếu sách có:

2,000 chapters

thì sau khi user duyệt toàn bộ sách:

2,000 XHTML strings

sẽ nằm trong memory.

Với project của bạn, đây là scenario thực tế, vì trước đây bạn cũng hướng tới ebook vài nghìn chương.

Mình sẽ thay:

originalContents: Map<string, string>
editBuffer: Map<string, string>

bằng concept:

originalContents
→ chỉ giữ dirty files

editBuffer
→ chỉ giữ loaded/dirty files

clean files
→ đọc lazy từ ZIP

Có thể giảm RAM rất mạnh.

9. Cleaner là feature rất tốt nhưng implementation hiện tại khá nặng

analyzeOptimizationPlan() đọc:

await file.async('uint8array')

cho mọi file trong ZIP.

Sau đó giữ:

resourceBytesMap

cho tất cả resource.

Đồng thời lại có:

allResources
resourceMap
missingReferences

Với EPUB lớn, đây là một memory spike.

Quan trọng:

Bạn không thực sự cần giữ bytes của tất cả file để phân tích orphan resources.

Bạn chỉ cần:

path
size
hash

và hash có thể tính streaming/chunked nếu library hỗ trợ.

Đừng giữ:

Uint8Array

cho toàn bộ EPUB.

10. SHA-1 tự viết là không cần thiết

Bạn có implementation SHA-1 riêng trong cleaner/editor.

Trong editor bạn thậm chí đã có:

crypto.subtle.digest('SHA-1')

và fallback pure JS.

Nhưng cleaner lại có implementation riêng.

Mình sẽ gom lại:

utils/crypto.ts

sha1Bytes()
sha1Text()

và dùng chung.

Hiện tại có một chút duplicate domain logic.

17. Golden test là hướng rất đúng

epub-golden.test.ts cho thấy bạn đã nghĩ đến output stability.

Nhưng mình sẽ tránh golden test kiểu:

SHA256 toàn bộ EPUB

vì ZIP metadata có thể khiến output thay đổi.

Tốt hơn:

EPUB
↓
normalize
↓
compare logical structure

Ví dụ:

manifest
spine
toc
metadata
chapter XHTML
CSS
resources

20. Packer architecture tốt nhưng đang hơi "God module"

epub-packer.ts hiện đảm nhiệm khá nhiều:

metadata
fonts
CSS
chapters
jacket
cover
images
ZIP
OPF
NAV
NCX

Nó chưa đến mức xấu, nhưng mình sẽ chia concept thành:

packer/
├── epub-builder.ts
├── asset-builder.ts
├── stylesheet-builder.ts
├── chapter-builder.ts
├── metadata-builder.ts
└── zip-writer.ts
