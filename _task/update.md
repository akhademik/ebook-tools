chinh tiep, khi dong epub tu .txt hoac tu .zip, sau khi dua vao cac ky tu thi chung ta da co cac chapter/header với thẻ `<h1>` và `<h2>`, sau đó hayx thay no vi du sau khi dong epub thi nguyen ban se la

`<h1 class="main-chap center">18 PHÚT</h1>

  <p>Mỗi giây là một năm</p>`

giờ hãy chỉnh cho code no chay là sẽ thành

`<h1 class="main-chap center">18 PHÚT</h1>

  <p><span class="dropcap">M</span>ỗi giây là một năm</p>`

de toi bo dropcap cho ky tu dau tien cua the P lien sau the h1 hoac h2, dong thoi inject luon do la

`h1 + p,
h2 + p {
text-indent: 0 !important;
}

.dropcap {
float: left;
font-size: 3em;
line-height: 0.9;
margin-right: 0.08em;
margin-top: 0.02em;
font-weight: bold;
}`

cai nay da duoc dua vao tron file headings.css roi
