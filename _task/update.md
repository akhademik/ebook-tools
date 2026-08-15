xu ly loi nay cho toi, cai the nao ma co drop cap thi p truoc do se duoc dung <p class="has-dropcap"><span class="dropcap">N</span>oi dung </p>

va đồng thời bỏ luôn

h1 + p,
h2 + p {
text-indent: 0 !important;
}

vì cái đó do logic là sẽ tạo dropcap tự động khi nó nằm dưới thẻ h1, h2, nhưng bây giờ cứ khi nào add dropcap thì thẻ p trước đó đều dược thêm class has-dropcap rồi
