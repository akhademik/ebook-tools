Chỉnh sửa lại cái nội dung sau:

# Đóng gói EPUB
- Ẩn "Ngôn ngữ sách" vì mặc định sách đóng luôn có ngôn ngữ là 'vi' tiếng Việt
- Thay chổ input "Ngôn ngữ sách" bằng "Dịch giả" , thông tin đó sau khi được thêm vào sẽ dùng làm trang giới thiệu
- Cập nhật lại code cho phần giới thiệu (jacket) (thêm nhìu biến thể, và cập nhật thêm input cho 'dịch giả')
- cập nhật thêm chổ qui tắc/ cú pháp, cũng như logic áp dụng luôn

 `### ngắt cảnh lớn	<p class="scene-break-big" role="separator">• • •</p>`
 `## ngắt cảnh nhỏ	<p class="scene-break-small" role="separator">*</p>`

- Sửa logic khi đóng sách epub tìm ### và ## để thay code tương ứng
- Thêm mục 'add trang bìa' hình đó sẽ dùng pdf/png/img v.v. và sau đó có cho preview để có thể lựa crop bớt, sau đó sẽ embeded (nhớ optimize size hình) cái hình đó vào trong epub dùng nó để làm cover cho sách, trình tự là 'cover', 'gioithieu', sau đó sẽ tới toàn bộ nội dung sách
