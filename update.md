tôi muốn tái sử dụng thẻ [new] với biến thể mới là [new:center] và thẻ dóng vẫn là [/new]

khi gặp cặp thẻ

[new:center]
....
[/new]

thì nội dung bên trong sẽ được tách rời và canh giữa trang, (nhưng ko canh giữa text, các canh trái phải giữa sẽ được qui định với nội dung bên trong)

đây là css đi kèm, hãy bỏ vào template và ịnject khi đóng gói epub, tuyệt đội không hardcoded, tôi muốn mọi css phải nằm trong tempalte, va kiểm tra luôn khi đóng có bị inject duplicate ko ví dụ body margin0, padding0, hay @page marigni : 0, tại thấy nhìu css template đều có dòng khai báo đó, nếu nó ko ảnh hưởng thì có thể cho nó vào template khi khởi tạo epub luôn để các mã ịnject không cần phải inject nó vào thêm nữa, xem như nó là mặc định khi đóng gói epub luôn.

/_ Thiết lập chiều cao chuẩn cho trang _/
html, body {
height: 100%;
margin: 0;
padding: 0;
}

/_ Khung căn giữa toàn trang an toàn cho mọi e-reader _/
.center-page {
display: table;
width: 100%;
height: 100%;
margin: 0 auto;

}

.center-page-content {
display: table-cell;
vertical-align: middle;

}

còn đây là ví dụ sau khi quét thấy thẻ [new:center] và được tạo ra html cùng với nội dung

<section class="center-page">
  <div class="center-page-content">
    <h2 class='center'>TẬP THỨ NHẤT</h2>
    <p>Dành tặng những người bạn đồng hành...</p>
  </div>
</section>

mã tương ứng

[new:center]
@ TẬP THỨ NHẤT
Dành tặng những người bạn đồng hành...
[/new]
