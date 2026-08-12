1. hãy sửa lại markdown fixer, trong đó quét cái file .md trong file .zip để tìm các mã qui định của markdown và chuyển đổi nó thành

nếu là đậm markdown -> \b{nội dung}b\
nếu là nghiêng markdown -> \i{nội dung}i\
nếu là gạch chân markdown -> \u{nội dung}u\

thay cho các logic đang dùng trước đây, đồng thời ở nội dung hướng dẫn bên dưới markdown fixer, bỏ hết các nội dung input đi, chỉ ghi lại việc chuyển đổi từ đậm -> \b{nội dung}b\ và các thẻ còn lại cho user biết.

2. ở trong mục đóng gói epub, đưa nội dung 'xem bảng quy ước' ra trước khi upload file, để user biết mà điều chỉnh file cho phù hợp trước khi đóng gói, nghĩa là chỉ cần clik vào tab "Đóng gói Epub" là bên dưới cái File Browser, sẽ đưa cái div
   "Bảng quy ước Xem bảng quy ước" vào ngay bên dưới đó
