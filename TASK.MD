Kiểm tra lại TXT → EPUB (commit 3bf20c8)

Các lỗi chính đã được sửa trong những mẫu cũ, nhưng ghép chú thích vẫn còn lỗi nặng. EPUB vẫn hợp lệ nhưng chú thích có thể trỏ sai nội dung. Mình nên sửa phần này trước khi dùng cho sách thật.

510/510 test pass và type check, lint không có lỗi (lint còn 3 cảnh báo). Cả 25 EPUB mình tạo lần này đều qua EPUBCheck. Mình không chạy lại build, E2E hay thử trên giao diện.

Phần đã ổn
Lỗi cũ Kết quả
Tự nối dòng Đã giữ nguyên từng dòng
Dấu đan chéo XHTML hợp lệ, có cảnh báo
Số chú thích lặp giữa các chương Đúng khi số lần gọi và số nội dung khớp 1–1, theo đúng thứ tự
Chú thích thiếu hoặc thừa, {2024} Mẫu cơ bản không còn link hỏng, có cảnh báo
Dòng "Chú thích" đứng riêng giữa sách Không còn nuốt chương sau
Thiếu ảnh Không còn trỏ tới file không tồn tại, nhưng còn lỗi hiển thị ở mục 3
README về nhận diện chương Đã ghi đúng phạm vi

Định dạng lồng nhau đúng thứ tự vẫn chạy tốt. Phân tích 9 triệu ký tự có chú thích mất khoảng 1,9 giây.

Cần sửa

1. Chú thích trỏ sai mà không cảnh báo (nặng nhất)

Parser đang ghép lần gọi {1} thứ N trên toàn sách với nội dung {1} thứ N. Khi hết nội dung thì dùng lại cái cuối.

Tình huống Kết quả sai
Chương 1 gọi {1} hai lần, chương 2 một lần; có hai nội dung cho C1 và C2 Lần gọi thứ hai ở C1 hiện chú thích của C2
Ba chương đều gọi {1}, thiếu nội dung của C2 C2 hiện chú thích của C3; C3 cũng dùng nội dung đó
Mỗi chương có một mục Chú thích: riêng Chỉ mục cuối được nhận. Chỗ gọi ở C1 hiện chú thích của C2, còn nội dung C1 nằm trong thân bài

Test mới chỉ kiểm tra trường hợp khớp đẹp 1–1.

Hướng sửa:

Khi một số có nhiều nội dung, cần ghép theo từng chương. Gọi lại cùng số trong một chương phải trỏ về cùng một nội dung.
Danh sách chú thích gộp ở cuối sách không cho biết nội dung nào thuộc chương nào. Nếu số chương có gọi {1} không bằng số nội dung {1}, nên báo lỗi hoặc cảnh báo và không tự đoán.
Với mục Chú thích: riêng từng chương, hoặc hỗ trợ hẳn, hoặc phát hiện và báo lỗi rõ ràng.
Khi chỉ có một nội dung được gọi nhiều lần, kiểu dùng chung hiện tại vẫn hợp lý. 2. Lỗi mới: không nhận mục chú thích có dòng mở đầu
text
Chú thích:
(Chú thích của dịch giả) ← hoặc ---
{1} Nội dung

Mình đã chạy hai mẫu này trên commit trước: bản cũ tạo được trang chú thích, bản mới thì không. Toàn bộ thành văn bản thường. Cảnh báo còn nói "văn bản không có mục 'Chú thích:'", dễ gây khó hiểu.

Nguyên nhân là findFootnoteSectionIndex() bắt dòng có nội dung đầu tiên sau tiêu đề phải là {n}. Vì vậy đoạn xử lý leadingFootnoteProse không còn bao giờ được dùng.

Hướng sửa: cho phép vài dòng mở đầu trước {n}, nhưng dừng tìm nếu gặp @@ hoặc [new]. Nếu thấy dòng Chú thích: có {n} gần đó mà không nhận được, cảnh báo đúng lý do.

3. Thiếu ảnh ngay sau tiêu đề thì bị dropcap

[hinh-9] đứng đầu chương hiện thành một chữ [ cỡ lớn, theo sau là hinh-9]. Nếu nằm giữa chương thì bình thường.

Hướng sửa: gắn no-dropcap cho đoạn giữ chỗ này và thêm test cho vị trí ngay sau tiêu đề.

Việc nhỏ, làm sau cũng được
Cảnh báo nhầm: km/h và ten_bien_nay được giữ đúng nhưng vẫn bị báo thiếu dấu.
Kiểm tra sau khi đóng gói: diff lần này chưa nối validateEpub vào luồng đóng gói. Đây là lớp kiểm tra nên có, nhưng không bắt được chú thích trỏ sai nội dung nếu link vẫn hợp lệ, nên vẫn phải sửa mục 1.
Nhận diện chương cho TXT: hiện vẫn dùng @@. README đã ghi rõ nên đây là tính năng có thể thêm, không phải lỗi.
TASK.MD: file này đã nằm trong commit. Nếu chỉ là ghi chú tạm thì bạn có thể bỏ ra.

Thứ tự nên làm: mục 1, rồi 2 và 3. Mỗi tình huống nên có một test kiểm tra đúng nội dung chú thích mà link trỏ tới, không chỉ kiểm tra ID có tồn tại.
