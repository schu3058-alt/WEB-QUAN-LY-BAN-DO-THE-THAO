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
