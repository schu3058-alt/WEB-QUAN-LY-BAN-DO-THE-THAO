# Dac ta yeu cau phan mem — SportShop (SRS)

## 1. Gioi thieu
SportShop la website quan ly va ban do the thao, phuc vu hai nhom nguoi dung: khach hang
va quan tri vien.

## 2. Yeu cau chuc nang

### 2.1 Khach hang
- Xem, tim kiem, loc san pham theo danh muc
- Dang ky, dang nhap, dang xuat, quan ly tai khoan
- Them/sua/xoa san pham trong gio hang
- Dat hang (nhap thong tin nhan hang, xac nhan don hang)
- Theo doi trang thai don hang
- Danh gia san pham da mua
- Ap dung ma khuyen mai

### 2.2 Quan tri vien
- Dang nhap trang quan tri (phan quyen rieng)
- Quan ly san pham: them, sua, xoa/ngung kinh doanh
- Quan ly danh muc san pham
- Quan ly don hang: xem danh sach, cap nhat trang thai
- Xem bao cao doanh thu, san pham ban chay
- Quan ly ma khuyen mai

## 3. Yeu cau phi chuc nang
- Bao mat: mat khau duoc ma hoa (bcrypt), xac thuc bang JWT, gioi han so luong yeu cau
- Don hang duoc tru ton kho trong giao dich; huy don cho xac nhan se hoan ton kho, khong the huy don da thanh toan
- Don cho xac nhan qua 48 gio duoc tu dong huy, hoan ton kho, cap nhat trang thai thanh toan dang cho va thong bao cho khach
- Doanh thu ngay duoc tong hop theo UTC tu cac don da thanh toan va ghi vao nhat ky may chu
- Kha dung: API tra loi trong thoi gian hop ly voi du lieu vua phai
- Tuong thich: giao dien hien thi tot tren trinh duyet pho bien (desktop & mobile)
- De su dung: thong bao loi ro rang bang tieng Viet

## 4. Kien truc va cong nghe
- Backend: ASP.NET Core MVC tren .NET 8, gom Controllers, Models, Services va Data (Entity Framework Core).
- CSDL: SQLite; quan he va khoa ngoai duoc khai bao trong Entity Framework Core va schema SQL.
- Frontend: HTML, CSS va JavaScript modules; ASP.NET Core phuc vu tai nguyen frontend va REST API tai `/api`.
- Xac thuc: JWT; endpoint quan tri duoc bao ve bang role `quan_tri`.
