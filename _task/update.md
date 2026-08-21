toi muon them 1 logic do la trong file txt khi user add vao trong noi dung file txt la [hinh-1], [hinh-2] thi code se chen

<figure class="illust-box">
  <img class="illust-img" src="../[hinh-1].[ext]" alt="hinh-1" />
</figure>

voi css tuong ung inject vao la

/_ Khung chứa ảnh: Căn giữa, ngắt dòng và chống dính lề _/
figure.illust-box {
margin: 1.5em auto;
padding: 0;
text-align: center;
page-break-inside: avoid;
break-inside: avoid;
}

img.illust-img {
display: block;
max-width: 100%;  
 max-height: 90vh;  
 height: auto;  
 width: auto;  
 margin: 0 auto;  
 border: 0;
}

yeu cau o trang dong goi epub,lam em 1 input cho phep user phai add hinh, 1 tam hinh, hoac la 1 file zip chua nhiu tam hinh, va cac tam hinh do can phai duoc luu ten trung voi ten duoc add trong text txt vi du trong txt add la [hinh-1] thi file hinh tuong ung phai la "hinh-1", he thong se tu quet duoi file va inject vao code cho dung, vi du file la jpg thi add .jpg, cac hinh do se duoc giai nen va embeded vao file epub luon khi dong goi.
