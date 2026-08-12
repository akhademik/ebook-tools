1. sửa lại logic đóng epub từ file .zip như sau:

`**hai dấu sao**` thì sẽ chuyển thành ĐẬM `<b> ... </b>`
`*một dấu sao*` thì sẽ chuyển thành NGHIÊNG `<i> ... </i>`
`***ba dấu sao**` thì sẽ chuyển thành ĐẬM + NGHIÊNG `<b><i> ... </i></b>`

ngoài ra khi upload file .zip để đóng epub, cho thêm 1 radio check/toggle để bỏ qua mọi format, nghĩa là cái file markdown nó như thế nào thì print ra y nguyên như vậy chứ ko chuyển code, ví dụ trong file md tìm thấy `**hai dấu sao**` hoặc `*tôi*` thì vẫn hiện nguyên vậy là `**hai dấu sao**`, `*tôi*` chứ ko được phép chuyển thành `<b>hai dấu sao</b>` và `<i>tôi</i>'. Nếu check bỏ qua thì bỏ qua hết, còn không check bỏ qua thì xử lý như logic ở trên để chuyển đổi sang các thẻ html tương ứng. Tuy nhiên phải đảm bảo heuristic cho file .zip vẫn hoạt động bình thường dù cho radio check/toggler có chọn true/false gì đi nữa
