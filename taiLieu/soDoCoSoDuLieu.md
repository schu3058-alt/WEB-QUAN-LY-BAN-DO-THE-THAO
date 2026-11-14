# So do co so du lieu — SportShop

## Danh sach bang
- `tai_khoan` — tai khoan khach hang / quan tri vien (email duy nhat, khong phan biet hoa thuong)
- `danh_muc` — danh muc san pham
- `san_pham` — san pham thuoc 1 danh muc
- `gio_hang_chi_tiet` — gio hang cua tung tai khoan (1 dong / 1 san pham)
- `don_hang` — don hang cua tai khoan
- `don_hang_chi_tiet` — chi tiet san pham trong 1 don hang
- `thanh_toan` — thong tin thanh toan ung voi 1 don hang
- `danh_gia` — danh gia cua tai khoan cho 1 san pham
- `khuyen_mai` — ma giam gia
- `thong_bao` — thong bao gui cho tai khoan

## Quan he chinh
```
tai_khoan 1---N gio_hang_chi_tiet N---1 san_pham N---1 danh_muc
tai_khoan 1---N don_hang 1---N don_hang_chi_tiet N---1 san_pham
don_hang  1---1 thanh_toan
tai_khoan 1---N danh_gia N---1 san_pham
tai_khoan 1---N thong_bao
khuyen_mai — bang doc lap, ap dung o tang ung dung khi tao don_hang
```

Script tao bang day du: Moi don hang chi co toi da mot ban ghi thanh toan (`UNIQUE(donHangId)`).
Script tao bang day du: `database/taoBang.sql`. Chi muc: `database/chiMuc.sql`.

## Rang buoc va chi muc
- Email tai khoan khong phan biet hoa thuong; slug danh muc, ma khuyen mai, thanh toan theo don va san pham trong gio hang deu duy nhat theo quy tac tuong ung.
- CHECK rang buoc gioi han gia/tien va so luong khong am, trang thai hop le, ten danh muc khong rong, phan tram giam 1-100, so sao 1-5 va `daDoc` chi nhan 0/1.
- Chi muc bao phu khoa ngoai va cac truy van loc theo trang thai, ten san pham, tai khoan, don hang, san pham, danh gia va thong bao.
- EF Core migrations la nguon schema chinh thuc. CSDL cu duoc kiem tra du lieu va khoa ngoai truoc khi them chi muc/rang buoc bang trigger; neu co vi pham thi migration dung va giu nguyen du lieu.
