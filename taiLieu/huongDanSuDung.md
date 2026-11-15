# Huong dan su dung — SportShop

## Danh cho khach hang
1. Truy cap trang chu, xem danh muc va san pham noi bat.
2. Vao "Danh sach san pham" de tim kiem hoac loc theo danh muc.
3. Bam vao 1 san pham de xem chi tiet, chon "Them vao gio".
4. Vao "Gio hang" de kiem tra, chinh so luong hoac xoa bot san pham.
5. Bam "Thanh toan", nhap dia chi nhan hang, xac nhan dat hang.
6. Vao "Theo doi don hang" de xem trang thai don hang da dat.
7. Sau khi nhan hang, co the vao trang san pham da mua de gui danh gia.

## Danh cho quan tri vien
1. Dang nhap bang tai khoan co vai tro `quan_tri`.
2. Vao "Quan ly san pham" de them/sua/ngung kinh doanh san pham, quan ly danh muc.
3. Vao "Quan ly don hang" de xem don hang, xac nhan thanh toan va cap nhat trang thai theo trinh tu (cho xac nhan → dang giao → da giao). Don cho xac nhan co the bi huy; hang ton kho duoc hoan lai.
4. Vao "Bao cao doanh thu" de xem doanh thu theo ngay va san pham ban chay.
5. Backend tu dong kiem tra moi phut: don `cho_xac_nhan` qua 48 gio se bi huy, hoan ton kho, danh dau yeu cau thanh toan dang cho la that bai va gui thong bao cho khach hang. Moi ngay UTC, backend tong hop doanh thu cua ngay truoc (chi tinh thanh toan da xac nhan) va ghi ket qua vao nhat ky may chu.
