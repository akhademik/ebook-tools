vấn đề 1:
tôi nhớ code của tôi là _text_ _text_ nghĩa là nó liên tục dính liền 2 chữ mà ví dụ km/h này /ăn cơm/ thì cũng ko thành công vì cái đầu là "/h còn cái sau là /ă" nhưng musoosn nó phải thì thẻ đógn phải là "/h something/" thì mới đúng mà, case nào thì nó bị bắt nhầm ?

vấn đề 3: đồng ý hướng giải quyết

vấn đề 4: đồng ý tắt auto dropcap, nếu muốn dropcap user tự chèn force dropcap vào (tôi quên mất ký tự gì rồi)

vấn đề 2, vấn đề 5:
Nếu tạo [new] hoặc [new:center] mà nội dung trong đó ko hề có @@ hoặc @ thì tự động cho title của nó vào TOC là 'blank page' (hoặc đề xuất placeholder nào đó phù hợp general hơn), còn nếu trong 2 block đó mà có @@ hoặc @ thì bỏ qua cái placeholder và ưu tiên sử dujgn @@ và @

vấn đề 6 ko sửa gì hết cứ để y nguyên tình trạng
vấn đề 7 cho thêm thẻ @@! vào parser
--------

vậy:

- vấn đề 1 bỏ qua
- vấn đề 4 thực hiện như ý của tôi
- vấn đề 2 và 5 hãy dùng place holder là 'Giới Thiệu' đi, nếu nó ko có @@ hay @
- vấn đề 3, thêm [/new:center] nhưng nó chỉ đi cùng khi thẻ mới là [new:center] thôi, ko cho phép [new] được đóng bằng [/new:center], nhưng cả 2 đều được phép đóng với [/new]
- vấn đề 6 giữ nguyên
- vấn đề 7 thực hiện như ý của tôi
