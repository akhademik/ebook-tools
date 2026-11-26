Mình đang review riêng luồng EPUB Packer trên develop, không đánh giá các module khác. Branch hiện tại ở commit 5bec2c0 (feat(ui): simplify FontSelect...).

Mình đã thấy một rủi ro đáng ưu tiên: quá trình đọc file nguồn chưa được cô lập theo từng lần chọn file. Nếu chọn ZIP/TXT A rồi nhanh chóng chọn B, tác vụ đọc A có thể hoàn thành muộn và ghi dữ liệu A đè lên trạng thái của B. Đây là vấn đề ở vòng đời nạp nguồn, không phải thuật toán tạo EPUB.
Các rủi ro cần xử lý

1. P1 — Chọn file mới khi file cũ đang được đọc
   Ưu tiên cao
   File: epub-source-state.svelte.ts

Có hai tình huống:

Với TXT:

1. Chọn TXT A, bắt đầu await file.text().
2. Chọn TXT B.
3. B đọc xong và bắt đầu parse.
4. A đọc xong muộn hơn, ghi rawTxtText của A vào state rồi gọi applyTxtGrouping().
5. A có thể hủy quá trình parse B và thay thế nội dung bằng A.
   Với ZIP:
6. Chọn ZIP A, bắt đầu JSZip.loadAsync(file).
7. Chọn ZIP B.
8. B đọc xong trước, cập nhật epubRawFiles và epubChapters.
9. A hoàn thành muộn hơn, tiếp tục ghi đè dữ liệu B.
   Vấn đề nằm ở chỗ handleFile() không có generation token cho toàn bộ quá trình đọc file. cancelParseTask() chỉ quản lý quá trình parse TXT, không bảo vệ quá trình đọc file và giải nén ZIP.

Hướng sửa:

- Tạo fileLoadGeneration tăng mỗi lần chọn file hợp lệ.
- Kiểm tra generation sau mỗi await file.text(), JSZip.loadAsync() và quá trình giải nén.
- Chỉ cho phép generation mới nhất cập nhật state.
- Hủy parse TXT cũ ngay khi bắt đầu chọn file mới, bất kể file mới là TXT hay ZIP.

2. P1 — Đang đóng gói nhưng người dùng đổi nguồn, kết quả cũ vẫn được ghi nhận
   Ưu tiên cao
   File: epub-state.svelte.ts

Đây là lỗi mình đánh giá nguy hiểm nhất đối với tính toàn vẹn của file xuất ra.

processEpub() có nhiều thao tác bất đồng bộ:

- Tối ưu ảnh bìa.
- Tải các font cần thiết.
- Gọi buildEpubBlob().
  Trong lúc chờ tải font, dữ liệu nguồn vẫn có thể thay đổi. Đáng chú ý:
- Metadata được đọc vào biến metadata ở khoảng dòng 97.
- Danh sách chương lại được lấy từ this.source.epubChapters ở khoảng dòng 193.
- Danh sách ảnh minh họa cũng được truyền từ state hiện tại.
  Do đó, có thể xảy ra trường hợp metadata thuộc sách A nhưng nội dung chương thuộc sách B.

Còn một tình huống tệ hơn:

1. Bắt đầu đóng gói sách A.
2. Quay lại bước nguồn và chọn sách B.
3. onFileLoaded() xóa epubBlob cũ.
4. Quá trình đóng gói A hoàn thành.
5. A ghi this.epubBlob = blob và thông báo thành công.
   Khi đó giao diện đang hiển thị sách B nhưng file tải xuống có thể là kết quả của A.

Nút đóng gói đã bị vô hiệu hóa khi processing = true, nhưng điều đó chỉ ngăn bấm đóng gói lần nữa. Nó không khóa việc chuyển bước và thay đổi nguồn.

Hướng sửa:

Mình khuyên dùng hai lớp bảo vệ:

- Snapshot: Sao chép toàn bộ dữ liệu cần đóng gói ngay lúc bắt đầu: chapters, metadata, jacket, fonts, ornaments, cover và illustrations. Không đọc lại state trực tiếp sau các await.
- Generation token: Khi bắt đầu một lần đóng gói mới hoặc thay đổi nguồn, tăng generation. Chỉ tác vụ có generation hiện hành mới được phép ghi epubBlob, status, isError và processing.
  Nếu muốn đơn giản hơn, có thể khóa việc thay đổi nguồn và cấu hình khi đang đóng gói, nhưng vẫn nên có snapshot để tránh phụ thuộc vào UI.

3. P2 — ZIP có thể làm cạn RAM khi giải nén
   File: epub-source-state.svelte.ts

File ZIP có giới hạn nén 250 MB, nhưng mình chưa thấy giới hạn tương ứng cho:

- Tổng dung lượng sau giải nén.
- Số lượng file .md.
- Dung lượng từng file .md.
- Tổng dung lượng văn bản được giữ trong RAM.
  Hiện tại logic đọc ZIP:

1. JSZip.loadAsync(file) nạp archive.
2. Lấy danh sách tất cả file Markdown.
3. Giải nén lần lượt từng file thành chuỗi.
4. Giữ tất cả chuỗi trong mảng files.
5. Tiếp tục parse và tạo HTML chương.
   Với ZIP có tỷ lệ nén cao hoặc chứa rất nhiều file Markdown, dung lượng thực tế trong RAM có thể lớn hơn nhiều so với 250 MB ban đầu.

Đây không nhất thiết là lỗi với các file thông thường, nhưng là rủi ro thực tế khi xử lý sách lớn.

Hướng sửa:

- Giới hạn tổng dung lượng giải nén.
- Giới hạn số lượng file và dung lượng từng file.
- Kiểm tra kích thước trước khi giải nén nội dung nếu có thể.
- Báo lỗi rõ ràng khi vượt giới hạn, thay vì để trình duyệt bị treo hoặc hết RAM.

4. P2 — Tên file ảnh có thể ghi đè tài nguyên khác trong EPUB
   File: zip-writer.ts

Đây là lỗi có thể tái hiện bằng một trường hợp đơn giản:

- Ảnh bìa được ghi vào OEBPS/images/cover.jpg.
- Sau đó, ảnh minh họa được ghi vào cùng thư mục bằng tên file người dùng tải lên.
- Nếu ảnh minh họa cũng có tên cover.jpg, JSZip sẽ ghi đè file bìa trước đó.
  Kết quả:
- Ảnh bìa thực tế bị thay thế.
- OPF vẫn có mục cover-image.
- OPF đồng thời có thêm mục manifest cho ảnh minh họa cùng đường dẫn.
  Tình huống tương tự có thể xảy ra với tên file họa tiết pre-chap.png hoặc pre-small-chap.png.

Ngoài ra, tại opf-builder.ts, ID của ảnh được tạo bằng cách thay các ký tự không hợp lệ bằng _. Hai tên file khác nhau vẫn có thể tạo ra cùng một ID sau khi chuẩn hóa.

Hướng sửa:

- Dùng tên nội bộ riêng cho từng nhóm tài nguyên, chẳng hạn cover.jpg, illustration_001.jpg, ornament_chapter.png.
- Kiểm tra trùng đường dẫn trước khi ghi ZIP.
- Kiểm tra trùng ID trong OPF trước khi tạo manifest.
