Chỉnh sửa lại cái nội dung sau:

trong folder src/asets/fonts có 3 fonts,

font: Akashi

@font-face {
font-family: "Akashi";
src: url(UTM_Akashi.ttf);
}

h1,h2 {
font-family: "Akashi";
}

=====
font: Polliwog-Regular

@font-face {
font-family: "Polliwog";
src: url(Polliwog-Regular.otf);
}

h1,h2 {
font-family: "Polliwog";
}

=====
font: UTM_Charlotte.ttf

@font-face {
font-family: "Charlotte";
src: url(UTM_Charlotte.ttf);
}

h1,h2 {
font-family: "Charlotte";
}

them chuc nang, khi nhap thong tin ve metada/jackett, khi bam preview, cho phep chon lua 1
trong 3 font toi vua update vao thu muc src/assets/fonts, khi chon font nao thi se lay khai bao toi co huong dau
trong file @\_task/update.md, sau do khai bao ngay trong trang jacket va sua het toan bo noi dung trong trang jackett
deu dung dung font do, va khi preview trang jacket dong thoi cung ap dung font do cho preview luon de nguoi dung de
nhan dien. Ben duoi cho chon anh bia, cho them 1 div trong do cho phep lua chon the <h1> dung font gi va the <h2>
dung font gi, sau do cho preview 1 model don gian thoi va trang do fix noi dung, voi 3 the <h1>day la chapter
lon</h1> <h2>day la chapter nho</h2> <p>dummy text</p> muc dich la preview cho user thay sau khi chon 1 chuong thi
noi dung no se hien thi nhu the nao, o the <p> thi sex lay font sans-serif tren may user preview la duoc. Sau khi bam
dong goi thi user chon cac font nao o jacket va the h1, h2 se duoc dong goi vao file epub, luy y khi tach css nho dam
bao lay dung duong dan chua file font da embeded vao file epub la duoc
