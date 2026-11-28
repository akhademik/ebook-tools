# ⚒️ Ebook Forge — Bộ Công Cụ Chế Bản Sách Điện Tử

> **Ebook Forge** là bộ công cụ chuẩn hóa, đóng gói, biên tập và kiểm định sách điện tử hiệu năng cao, hoạt động **100% ngoại tuyến (offline)** trực tiếp trên trình duyệt web của bạn — toàn bộ dữ liệu được xử lý an toàn trong bộ nhớ máy tính cục bộ và tuyệt đối không tải lên bất kỳ máy chủ nào.

---

## Trạng thái hệ thống

- Cập nhật lần cuối: 2026-11-28 16:03
- Đã hoàn thành: Siết chặt quy chuẩn chú thích & ảnh minh họa TXT → EPUB (`txt-syntax-validator.ts`, `txt-parser.ts`, `EpubSourceState`, `EpubState`, `EpubIllustrationsSection`, `EpubPackSection`, `EpubSyntaxModal`): bắt buộc mỗi file có tối đa 1 mục `Chú thích:` ở cuối sách và dòng không rỗng đầu tiên sau `Chú thích:` phải bắt đầu bằng `{n}` (dừng ngay nếu có nội dung khác hoặc >1 mục `Chú thích:`/`@@` sau chú thích), bắt buộc mọi `{n}` (gồm cả `{2024}`) xuất hiện đúng 2 lần (1 trong thân bài + 1 sau `Chú thích:`), bỏ ghép chú thích theo chương; siết thẻ ảnh theo pattern `[hinh-N]` (không sinh `<p>[hinh-9]</p>` hay dropcap ở Bước 1), đối soát 2 chiều khi tải ảnh ở Bước 3 và chặn đóng gói tại Bước 5 nếu thiếu/dư/lệch tên ảnh; đồng thời sửa cảnh báo giả `km/h` và `ten_bien_nay`. Toàn bộ pipeline đạt chuẩn (513/513 unit tests trong 24 files + 24/24 E2E tests pass).
- Đang dở: Không có
- Biết trước còn thiếu / nợ kỹ thuật: Helper ZIP phụ thuộc API nội bộ của JSZip (`_data`, `internalStream`) — đã cô lập hoàn toàn trong `src/lib/utils/zip.ts` (P3). Lưu ý `internalStream` là lớp kiểm soát bổ sung trên đầu ra, không bảo đảm chống OOM tuyệt đối nếu JSZip cấp phát bộ nhớ nội bộ trước khi phát chunk.

---

## 🌟 Điểm nổi bật cốt lõi

- 🔒 **Bảo mật & Riêng tư Tuyệt đối (100% Client-Side)**: Mọi thao tác giải nén, bóc tách AI, chỉnh sửa và đóng gói file PDF, EPUB, TXT diễn ra hoàn toàn trên thiết bị của bạn. Không cần kết nối internet, không lo rò rỉ bản thảo.
- ⚡ **Tốc độ cao & Xử lý Dung lượng lớn**: Tối ưu hóa bộ nhớ chuyên sâu, xử lý mượt mà các pho tiểu thuyết và bộ sách đồ sộ hàng trăm chương, hàng nghìn trang.
- 📖 **Chuẩn Mực Xuất Bản Quốc Tế**: Hỗ trợ chuẩn EPUB 3.0 và EPUB 2, tối ưu hóa hiển thị sắc nét trên các dòng máy đọc sách chuyên dụng (Kobo, Kindle, Boox) cũng như các ứng dụng đọc sách di động (Apple Books, Google Play Books).
- 🎨 **Giao diện Solarized Thanh lịch**: Thiết kế êm dịu cho mắt với tông màu ấm Cream/Sand (Light Mode) và Deep Navy Teal (Dark Mode), phù hợp cho việc đọc và chế bản trong thời gian dài.

---

## 🚀 Các công cụ & Tính năng chính

### 1. ✏️ Biên tập & Kiểm định EPUB Trực quan (EPUB Editor & Validator Suite)

Không gian làm việc toàn diện để duyệt, sửa đổi, kiểm tra và tối ưu file `.epub` có sẵn:

- **Trình soạn thảo mã nguồn chuyên nghiệp**: Tích hợp CodeMirror 6 hỗ trợ highlight cú pháp HTML, XHTML, CSS, tự động căn lề, đóng mở thẻ thông minh và phím tắt chuẩn.
- **Xem trước thời gian thực (Live Preview)**: Khung xem trước song song phản hồi tức thì mọi thay đổi về văn bản, bố cục, hình ảnh và kiểu dáng CSS. Tự động giữ nguyên vị trí cuộn khi chỉnh sửa mã nguồn.
- **Đồng bộ hai chiều thông minh (Sync-View)**:
  - _Sync-Scroll_: Cuộn mã nguồn bên editor thì khung preview tự động cuộn đến vị trí tương ứng và ngược lại.
  - _Sync-Highlight_: Bôi đen văn bản bên editor sẽ tự động làm nổi bật đoạn văn tương ứng trong preview; bôi đen bên preview sẽ cuộn editor đến đúng dòng mã nguồn.
- **Tự động giải mã Phông chữ (Font De-obfuscation)**: Tự động phát hiện và đảo ngược thuật toán mã hóa phông theo chuẩn IDPF và Adobe Mangling (TTF, OTF, WOFF, WOFF2), hiển thị trung thực typography gốc của sách.
- **Dọn rác & Tối ưu dung lượng (EPUB Optimizer / Cleaner)**:
  - Tự động quét toàn bộ cây tài nguyên sách để lập kế hoạch tối ưu chi tiết.
  - Phát hiện và dọn dẹp an toàn các file hình ảnh, phông chữ, stylesheet và trang nội dung mồ côi (không được sử dụng trong sách).
  - Nhận diện tài nguyên trùng lặp nội dung dựa trên mã băm để tiết kiệm tối đa dung lượng file.
- **Kiểm định chuẩn xuất bản (EPUB Validator)**:
  - Kiểm tra tính hợp lệ của cấu trúc sách theo hồ sơ chuẩn: **Generic EPUB**, **EPUB 3.0** và tiêu chuẩn khắt khe của **Kobo e-Reader**.
  - Quét toàn diện: Cấu trúc container, OPF manifest/spine, tính toàn vẹn của mục lục NCX/NAV, cú pháp XHTML, ID trùng lặp, magic bytes phông chữ và ảnh bìa sleep screen.
- **Quản lý Thông tin sách & Tái tạo Mục lục 1-Click**:
  - Chỉnh sửa trực tiếp siêu dữ liệu (Metadata): Tiêu đề, Tác giả, Ngôn ngữ, Nhà xuất bản, ISBN/Identifier, Ngày phát hành.
  - Tự động quét các thẻ tiêu đề (H1, H2, H3...) trong sách để tái tạo đồng bộ mục lục điều hướng (`nav.xhtml` và `toc.ncx`) chỉ với một cú nhấp chuột.

---

### 2. 📦 Đóng gói EPUB Tự động (EPUB Packer)

Biến các tệp văn bản thô `.txt` hoặc gói file Markdown `.zip` thành tác phẩm sách điện tử chuẩn mực:

- **Hệ thống Cú pháp Quy ước Nhanh (Quy chuẩn định dạng file `.txt`)**:

| Ký hiệu / Cú pháp                | Ý nghĩa & Kết quả hiển thị                                                                                                           |
| :------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------- |
| `@@ Tiêu đề` (`@@t`, `@@p`)      | Tiêu đề chính: Tách thành một file/chương XHTML riêng, tự động đưa vào Mục lục (TOC). Hỗ trợ căn trái (`@@t`) hoặc căn phải (`@@p`). |
| `@ Tiêu đề` (`@t`, `@p`)         | Tiêu đề phụ: Nằm trong cùng chương, hiển thị trong Mục lục.                                                                          |
| `@! Tiêu đề` (`@!t`, `@!p`)      | Tiêu đề phụ: Nằm trong cùng chương, **không** đưa vào Mục lục.                                                                       |
| `[new] ... [/new]`               | Gom toàn bộ khối nội dung bên trong thành một trang XHTML độc lập (lời nói đầu, giới thiệu, thông tin xuất bản...).                  |
| `[letter] ... [/letter]`         | Khối định dạng thư từ, điện tín (giữ nguyên ngắt dòng, lùi dòng trang trọng).                                                        |
| `[letter-box] ... [/letter-box]` | Khối văn bản đóng khung viền trang nhã (hỗ trợ lồng ghép nhiều thẻ con).                                                             |
| `[poem] ... [/poem]`             | Khối thơ ca: Căn lề thụt đầu dòng riêng biệt, giữ nguyên cấu trúc khổ thơ.                                                           |
| `~ Lời thoại` / `> Tác giả`      | Khối trích dẫn đối thoại (`~`, `~t`, `~p`) và tên tác giả trích dẫn (`>`, `>t`, `>p`, `>c` - tự động căn đều theo lề trích dẫn).     |
| `[c]`                            | Tạo chữ hoa đầu dòng lớn trang trí (Dropcap) cho đoạn văn.                                                                           |
| `!D Nội dung`                    | Tắt tự động dropcap đầu đoạn sau tiêu đề.                                                                                            |
| `{n}` ... `{n} Chú thích`        | Chú thích chân trang tự động (Footnotes popup chuẩn EPUB 3: bấm vào số chú thích hiển thị bảng giải thích).                          |
| `[hinh-1]`, `[hinh-2]`           | Đánh dấu vị trí chèn ảnh minh họa tương ứng với file ảnh tải lên.                                                                    |
| `###` / `##` / `#`               | Đường phân đoạn cảnh lớn (`• • •`), phân cảnh nhỏ (`*`), hoặc phân cảnh khoảng trắng.                                                |
| `*chữ đậm*`                      | Định dạng chữ in đậm.                                                                                                                |
| `/chữ nghiêng/`                  | Định dạng chữ in nghiêng.                                                                                                            |
| `_chữ gạch chân_`                | Định dạng chữ gạch chân.                                                                                                             |

- **Xử lý Bìa Sách Chuyên Nghiệp**:
  - Tải ảnh bìa trực tiếp từ máy tính hoặc tự động trích xuất trang bìa đầu tiên từ file PDF.
  - Tích hợp công cụ cắt chỉnh tỉ lệ khung hình bìa trực quan ngay trên giao diện.
- **Tùy biến Trang lót (Book Jacket)**:
  - Cung cấp nhiều mẫu trang lót trang trọng trình bày đầy đủ tựa sách, tác giả, dịch giả, năm sáng tác và nhà xuất bản.
- **Kho Phông Chữ Nhúng Tuyển Chọn (40+ Fonts)**:
  - Tích hợp sẵn bộ sưu tập phông chữ Việt hóa và bản quyền chuyên dùng cho sách (Bookerly, Georgia, Noto Serif, UTM, SVN...).
  - Cho phép tùy biến độc lập phông chữ cho: Nội dung chính, Tiêu đề chương (H1), Khối trích dẫn và Tên tác giả trích dẫn.
  - Cơ chế tối ưu thông minh: Tự động loại bỏ trùng lặp để chỉ nhúng phông thực tế được sử dụng, giảm thiểu tối đa dung lượng sách.
- **Nhận diện Chương Thông minh (Heuristic Chapter Detection)**:
  - Tự động nhận diện cấu trúc phân chương cho gói file Markdown/OCR `.ZIP` dựa trên từ khóa tùy chỉnh hoặc thuật toán Heuristic chấm điểm tiêu đề (chữ HOA, độ dài, dấu câu); riêng file `.TXT` phân chương trực tiếp theo cú pháp `@@`.

---

### 3. 🎨 Tẩy Nền Hoa Văn Tự Động bằng AI (ML Ornament Background Removal)

Công cụ chuẩn bị đồ họa sách điện tử hoàn toàn tự động:

- **Tách nền thông minh ngay trong trình duyệt**: Ứng dụng mô hình Machine Learning WebAssembly chạy trực tiếp trên máy của bạn, tự động bóc tách hoa văn, họa tiết đầu chương và phân đoạn trang sách mà không gửi ảnh ra bên ngoài.
- **Tự động xén biên trong suốt (Auto-Crop)**: Tự động phát hiện và loại bỏ các khoảng trống thừa xung quanh họa tiết sau khi tách nền.
- **Tối ưu hóa máy đọc sách E-Ink**: Tự động chuyển đổi sang thang độ xám (Grayscale), tăng độ tương phản chi tiết để hoa văn hiển thị sắc sảo, không bị răng cưa hay lem mực trên màn hình e-ink.

---

### 4. 📄 Tách Trang & Xử Lý Tài Liệu PDF (PDF Processor)

- **Trích xuất ảnh hàng loạt**: Chuyển đổi các trang tài liệu PDF thành bộ ảnh JPG độc lập với độ phân giải tùy chọn, đóng gói tải về dưới dạng `.zip`.
- **Bộ lọc tăng cường cho OCR**: Chuyển ảnh sang thang độ xám và tăng độ tương phản, tối ưu hóa chất lượng hình ảnh phục vụ các công cụ nhận dạng chữ quang học (OCR).
- **Cắt bỏ Header / Footer hàng loạt**: Xem trước trực quan và thiết lập vùng xén đầu trang / chân trang đồng loạt cho toàn bộ tài liệu để loại bỏ số trang và tiêu đề lặp lại.

---

### 5. 💻 Ứng Dụng Desktop: TXT → PDF CJK

- Phần mềm máy tính độc lập dành cho Windows chuyên xử lý các văn bản chữ Hán / Nôm / CJK sang file tài liệu PDF chất lượng cao.
- **Sửa lỗi mã hóa ký tự**: Tự động nhận diện và khôi phục các ký tự thuộc vùng PUA (chữ hiếm, chữ Nôm dị thể bị mã hóa lệch) về chuẩn Unicode chính xác.
- **Bộ phông chữ toàn diện**: Tích hợp sẵn các đại phông Noto Serif CJK và HanaMin, đảm bảo không bị lỗi ô vuông trống (tofu) đối với bất kỳ ký tự cổ hay chữ hiếm nào.

---

## 🛡️ Cam kết Quyền riêng tư & An toàn Dữ liệu

Ebook Forge được phát triển theo triết lý **Privacy-First (Ưu tiên quyền riêng tư)**:

1. **100% Client-Side**: Toàn bộ quá trình đọc tệp, bóc tách AI, giải nén, biên tập và xuất bản file diễn ra trong bộ nhớ trình duyệt máy tính của bạn.
2. **Không Lưu Trữ Trên Máy Chủ**: Không có bất kỳ tệp tin, hình ảnh, văn bản hay bản thảo nào được tải lên máy chủ lưu trữ.
3. **Hoạt Động Không Cần Mạng**: Bạn hoàn toàn có thể ngắt kết nối internet sau khi trang web đã tải xong mà vẫn sử dụng đầy đủ mọi tính năng.

---

## ⚡ Hướng dẫn Khởi chạy Nhanh (Dành cho Tự Host / Local)

Nếu bạn muốn tự chạy Ebook Forge trên máy tính cá nhân hoặc máy chủ riêng:

### Yêu cầu

- **Node.js**: Phiên bản 20.19+ hoặc 22.12 trở lên.
- **pnpm**: Phiên bản 10 trở lên.

### Khởi chạy

```bash
# 1. Cài đặt các gói phụ thuộc
pnpm install

# 2. Khởi chạy máy chủ phát triển
pnpm dev
```

Mở trình duyệt và truy cập: `http://localhost:5173`

### Đóng gói ứng dụng (Production Build)

```bash
pnpm build
```

---

## 📜 Lịch sử Phát triển & Giấy phép

- **Lịch sử cập nhật**: Xem chi tiết các mốc phát triển, tính năng mới và cải tiến qua các phiên bản tại [CHANGELOG.md](CHANGELOG.md).
- **Giấy phép**: Dự án được phát hành theo giấy phép mã nguồn mở [MIT License](LICENSE).
