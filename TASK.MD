1. TXT → EPUB

Điểm tốt là bộ quy ước phong phú, bắt được thẻ khối chưa đóng và escape được ký tự đặc biệt trong URL. Phân tích 8,7 triệu ký tự mất khoảng 1,9 giây (chưa tính đóng gói).

Lỗi nên sửa trước
Lỗi Kết quả chạy thử
Tự nối dòng Thân em như tấm lụa đào xuống dòng phất phơ giữa chợ… bị gộp thành một đoạn. Danh sách không có dấu câu cũng vậy.
Dấu định dạng đan chéo _đậm /và_ nghiêng/ tạo XHTML sai cấu trúc (EPUBCheck báo FATAL), không có cảnh báo.
Số chú thích lặp lại Mỗi chương đánh lại từ {1} thì bị trùng ID, và cả hai link quay về đều trỏ tới chương 2.
Chú thích thiếu hoặc thừa Thiếu nội dung {2}, hoặc có nội dung mà không có chỗ gọi, đều tạo link hỏng.
{số} trong văn bản thường {2024} thành link chú thích. Nếu sách không có mục chú thích, link trỏ tới file không tồn tại.
Dòng "Chú thích" trong thân sách Dòng đứng riêng, có hoặc không có dấu :, khiến toàn bộ phần sau bị đưa vào trang chú thích. Mình chỉ thấy cảnh báo khi phía sau có @@ hoặc [new].
Thiếu ảnh Có [hinh-9] nhưng không tải ảnh lên thì EPUB trỏ tới ảnh không tồn tại, không cảnh báo.
Nguyên nhân lỗi nối dòng: assignSequentialChapterIds gọi mergeBrokenParagraphs trước khi đóng gói. Vì vậy chế độ TXT có bật preserveParagraphs cũng không cứu được. Việc nối dòng chỉ nên áp dụng cho nguồn OCR/Markdown, hoặc là một tùy chọn mặc định tắt.
README chưa khớp với code: README nói tự nhận diện chương cho văn bản chưa gán nhãn. Khi thử TXT có Chương 1, Chương 2, kết quả chỉ là một chương. Ô từ khóa và heuristic chỉ hiện với file ZIP.
