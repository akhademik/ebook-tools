hãy update thêm logic để thêm qui chuẩn

Mã gõ Ý nghĩa Thẻ HTML sinh ra
[letter] ... [/letter] Khối thư, mỗi dòng bên trong là 1 đoạn, có thụt lề riêng theo CSS <div class="letter"><p>...</p>...</div>
[poem] ... [/poem] Khối thơ, mỗi dòng bên trong là 1 đoạn, luôn canh giữa (cố định, không có biến thể) <div class="poem"><p>...</p>...</div>

ví dụ

[letter]
Hà Nội, ngày 12 tháng 8 năm 2026

Con gái yêu của mẹ,

Mẹ biết con sẽ đọc được lá thư này khi mẹ không còn ở bên con nữa. Đừng _buồn_, vì mẹ đã sống một cuộc đời trọn vẹn.

Yêu con nhiều,
Mẹ
[/letter]

kết quả sẽ là

<div class="letter">
  <p>Hà Nội, ngày 12 tháng 8 năm 2026</p>
  <p>Con gái yêu của mẹ,</p>
  <p>Mẹ biết con sẽ đọc được lá thư này khi mẹ không còn ở bên con nữa. Đừng <b>buồn</b>, vì mẹ đã sống một cuộc đời trọn vẹn.</p>
  <p>Yêu con nhiều,</p>
  <p>Mẹ</p>
</div>

và

[poem]
Quê hương là chùm khế ngọt
Cho con trèo hái mỗi ngày
_Quê hương_ là đường đi học
Con về /rợp bướm/ vàng bay
[/poem]

sẽ là

<div class="poem">
  <p>Quê hương là chùm khế ngọt</p>
  <p>Cho con trèo hái mỗi ngày</p>
  <p><b>Quê hương</b> là đường đi học</p>
  <p>Con về <i>rợp bướm</i> vàng bay</p>
</div>

va day là css di kem voi 2 dinh nghia moi
/_ ===== KHỐI THƯ (LETTER) ===== _/
.letter {
margin: 1.5em 1em;
padding: 1em 1.2em;
font-style: italic;
border-left: 2px solid #999;
}

.letter p {
margin: 0 0 0.8em 0;
text-indent: 0; /_ thư thường không thụt đầu dòng như văn xuôi thường _/
}

.letter p:last-child {
margin-bottom: 0;
}

/_ ===== KHỐI THƠ (POEM) ===== _/
.poem {
margin: 1.5em auto;
text-align: center;
font-style: italic;
}

.poem p {
margin: 0 0 0.3em 0;
text-indent: 0; /_ không thụt đầu dòng _/
line-height: 1.5;
}

.poem p:last-child {
margin-bottom: 0;
}
