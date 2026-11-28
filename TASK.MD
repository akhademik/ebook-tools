1. Dòng escape làm lọt EPUB hỏng
   text
   A{1}.

\@ dòng được escape có {1}

Chú thích:
{1} a

Không có lỗi hay cảnh báo, nhưng EPUBCheck báo trùng ID fnref1.

Nguyên nhân: bộ kiểm tra bỏ qua cả dòng bắt đầu bằng escape khi đếm, còn parser vẫn biến {1} trên dòng đó thành link.
Lỗi ngược lại: nếu lần gọi duy nhất nằm trên dòng escape, bộ kiểm tra báo "không có vị trí gọi" và chặn nhầm.
Cách sửa: vẫn đếm {n} trên các dòng này. \@ chỉ nên vô hiệu ký hiệu @ đầu dòng.

Nên sửa

1. Đoạn bắt đầu bằng &, <, > làm hỏng EPUB

Ví dụ ngay sau tiêu đề là & rồi họ đi. hoặc <Nhật ký> ngày đầu.

Kết quả: cả ba ký tự đều bị EPUBCheck báo FATAL, trong khi bước đọc TXT không báo gì.
Nguyên nhân: & đã được đổi thành &amp;, rồi dropcap cắt nó thành <span>&</span>amp;.
Mức độ: tôi xếp trên 3 lỗi trước, vì văn bản bình thường cũng có thể gặp. 2. Dropcap chọn sai ký tự
Đầu đoạn Chữ bị phóng to hoặc kết quả
— Anh đi đâu? hoặc - Anh đi đâu? Chỉ dấu gạch
… Rồi mọi chuyện Dấu …
(Trích nhật ký) Dấu (

### ngay sau tiêu đề Một chấm trong • • •

{1} đứng đầu đoạn Số chú thích
Emoji Emoji bị tách đôi, hiện thành ký tự lỗi

Với truyện tiếng Việt, đoạn thoại mở đầu bằng gạch ngang là trường hợp đáng lưu tâm nhất.

Cách sửa cho mục 1 và 2: dropcap phải xử lý theo ký tự thật, không cắt giữa mã như &amp; hay giữa emoji. Bỏ qua đoạn ngắt cảnh và link chú thích. Nếu đầu đoạn không phải chữ cái (có thể kèm dấu ngoặc kép), cách an toàn nhất là không tạo dropcap.

3. File sai bảng mã vẫn được nhận

Mình thử file UTF-16 và file chứa byte một-byte không hợp lệ với UTF-8. Cả hai đều không bị chặn hay cảnh báo, nội dung thành ��. Với UTF-16, tiêu đề @@ cũng không còn được nhận.

Cách sửa: nhận diện BOM để đọc UTF-16. Với UTF-8, dùng chế độ giải mã nghiêm ngặt và báo lỗi, thay vì âm thầm thay ký tự.

4. EPUB cũ vẫn còn sau khi thay đổi dữ liệu

Sau khi đóng gói, mình xóa ảnh hoặc đổi tên sách. EPUB cũ vẫn được giữ nguyên, kể cả khi bước đối chiếu ảnh đã báo không hợp lệ. Nút tải chỉ kiểm tra có file hay không, nên theo code người dùng vẫn tải được bản cũ và tưởng là bản mới. Mình kiểm tra ở phần xử lý, chưa bấm thử trên giao diện.

Cách sửa: khi đổi ảnh, bìa, thông tin sách, font hay trang lót, hãy xóa epubBlob hoặc ghi rõ "cần đóng gói lại". Nếu đang đóng gói dở thì nên hủy lượt đó.

Trường hợp hiếm, sửa sau được
Ký tự không hợp lệ trong XML: U+FFFF làm EPUB bị FATAL. Nên lọc hoặc báo lỗi.
Tên ảnh thừa dấu cách: với hinh-1 .png, bước đối chiếu báo hợp lệ nhưng sách không có ảnh. Hai bước đang chuẩn hóa tên khác nhau.
File chỉ xuống dòng bằng CR (kiểu Mac cũ): cả file bị dồn thành một đoạn.
Thứ tự nên làm
Dropcap làm hỏng EPUB (mục 1), sửa cùng mục 2.
Ba lỗi lần trước: dòng escape gây trùng ID, escape {n}, và thẻ ảnh gõ sai.
EPUB cũ và bảng mã.
Các trường hợp hiếm.

Nên thêm một lớp bảo vệ chung là kiểm tra từng file XHTML có đúng cú pháp XML trước khi cho tải. Lớp này chặn được lỗi & và U+FFFF. Lỗi trùng ID cần kiểm tra riêng, và lớp này không phát hiện chữ lỗi hay dropcap sai ký tự.
