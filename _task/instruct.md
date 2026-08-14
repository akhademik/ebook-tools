2.4 Block đa dòng (Thư / Thơ)
regex
Mở: ^\[(letter|poem)\]\s*$
Đóng: ^\[/(letter|poem)\]\s*$
Khi khớp dòng mở: lưu trạng thái current_block = "letter" hoặc "poem", mở <div class="{current_block}">, KHÔNG đóng/mở file (chỉ append vào buffer file đang mở, tự mở file đầu tiên nếu chưa có file nào — giống quy tắc 2.5).
Mọi dòng tiếp theo, cho đến khi gặp đúng mã đóng tương ứng ([/letter] hoặc [/poem], phải khớp cùng tên với mã mở), được xử lý:
Dòng trống → bỏ qua (ranh giới đoạn, không sinh <p> rỗng).
Dòng có nội dung → áp inline formatting (mục 2.6) → bọc <p>{content}</p> → append vào buffer trong div.
Khi khớp dòng đóng: đóng </div>, reset current_block = None.
Lưu ý parser: trong lúc current_block đang mở (letter/poem), KHÔNG áp các regex heading (2.1), quote (2.2), ngắt cảnh (2.3) — mọi dòng bên trong chỉ được coi là đoạn văn thường của block đó, trừ chính dòng đóng [/letter]/[/poem]. Điều này để tránh trường hợp thư/thơ có dòng bắt đầu bằng @, ~... bị hiểu nhầm thành lệnh khác.
Nếu gặp EOF (hết file) mà current_block vẫn đang mở (thiếu mã đóng) → tự động đóng </div> và ghi log cảnh báo "thiếu mã đóng block" để người dùng biết mà sửa file gốc.
