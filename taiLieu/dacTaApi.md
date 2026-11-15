# Dac ta API — SportShop

Dia chi goc: `http://localhost:5150/api`
Dinh dang phan hoi chuan: `{ "thanhCong": boolean, "thongBao": string, "duLieu": any }`
Giao dien web duoc phuc vu tai `http://localhost:5150`; endpoint kiem tra may chu la `/api/health`.

## Tai khoan (`/tai-khoan`)
| Method | Duong dan      | Mo ta                     | Can dang nhap |
|--------|-----------------|----------------------------|---------------|
| POST   | /dang-ky        | Dang ky tai khoan moi      | Khong |
| POST   | /dang-nhap      | Dang nhap, tra ve JWT      | Khong |
| GET    | /toi            | Lay ho so ban than         | Co |
| PUT    | /toi            | Cap nhat ho so ban than    | Co |

## Danh muc (`/danh-muc`)
| Method | Duong dan | Mo ta                  | Can dang nhap |
|--------|-----------|--------------------------|---------------|
| GET    | /         | Danh sach danh muc       | Khong |
| GET    | /:id      | Chi tiet 1 danh muc      | Khong |
| POST   | /         | Tao danh muc (quan_tri)  | Co |
| PUT    | /:id      | Sua danh muc (quan_tri)  | Co |
| DELETE | /:id      | Xoa danh muc (quan_tri)  | Co |

## San pham (`/san-pham`)
| Method | Duong dan | Mo ta                              | Can dang nhap |
|--------|-----------|---------------------------------------|---------------|
| GET    | /         | Tim kiem/loc/phan trang san pham      | Khong |
| GET    | /quan-tri | Danh sach san pham, ke ca da ngung (quan_tri) | Co |
| GET    | /:id      | Chi tiet san pham                     | Khong |
| POST   | /         | Them san pham (quan_tri)              | Co |
| PUT    | /:id      | Sua san pham (quan_tri)               | Co |
| DELETE | /:id      | Ngung kinh doanh san pham (quan_tri)  | Co |

Danh sach cong khai chi hien san pham `dang_ban`. Tham so `trangThai=tat_ca` dung trong giao dien quan tri.

## Gio hang (`/gio-hang`) — tat ca deu can dang nhap
| Method | Duong dan       | Mo ta                     |
|--------|------------------|-----------------------------|
| GET    | /                | Xem gio hang hien tai       |
| POST   | /                | Them san pham vao gio       |
| PUT    | /:chiTietId      | Cap nhat so luong            |
| DELETE | /:chiTietId      | Xoa 1 dong trong gio hang    |

## Don hang (`/don-hang`) — tat ca deu can dang nhap
| Method | Duong dan          | Mo ta                             | Quyen |
|--------|---------------------|-------------------------------------|-------|
| POST   | /                   | Xac nhan dat hang tu gio hang; co the gui `maKhuyenMai` | Khach hang |
| GET    | /toi                | Danh sach don hang cua ban than     | Khach hang |
| GET    | /:id                | Chi tiet 1 don hang                 | Khach hang |
| GET    | /                   | Danh sach tat ca don hang           | Quan tri |
| PUT    | /:id/trang-thai     | Cap nhat trang thai don hang        | Quan tri |

## Thanh toan (`/thanh-toan`) — can dang nhap
| Method | Duong dan           | Mo ta                          |
|--------|----------------------|-----------------------------------|
| POST   | /                    | Tao yeu cau thanh toan cho don hang |
| GET    | /don-hang/:donHangId | Xem thanh toan cua 1 don hang       |
| PUT    | /:id/xac-nhan        | Xac nhan thanh toan (quan_tri)      |

Moi don hang chi tao duoc mot yeu cau thanh toan. Xac nhan thanh toan se chuyen don `cho_xac_nhan` sang `dang_giao`.

## Danh gia (`/danh-gia`)
| Method | Duong dan              | Mo ta                      | Can dang nhap |
|--------|--------------------------|-------------------------------|---------------|
| GET    | /san-pham/:sanPhamId     | Danh sach danh gia 1 san pham | Khong |
| POST   | /                        | Gui danh gia                   | Co |
| DELETE | /:id                     | Xoa danh gia cua ban than       | Co |

Khach hang chi duoc gui danh gia cho san pham trong don hang da giao.

## Khuyen mai (`/khuyen-mai`)
| Method | Duong dan   | Mo ta                     | Can dang nhap |
|--------|-------------|------------------------------|---------------|
| GET    | /           | Danh sach khuyen mai         | Khong |
| POST   | /ap-dung    | Ap dung ma khuyen mai        | Khong |
| POST   | /           | Tao khuyen mai moi (quan_tri)| Co |
| DELETE | /:id        | Xoa khuyen mai (quan_tri)    | Co |

## Thong bao (`/thong-bao`) — can dang nhap
| Method | Duong dan     | Mo ta                  |
|--------|----------------|---------------------------|
| GET    | /toi           | Danh sach thong bao cua toi |
| PUT    | /:id/da-doc    | Danh dau da doc              |

## Bao cao (`/bao-cao`) — can dang nhap, chi quan_tri
| Method | Duong dan     | Mo ta                         |
|--------|----------------|----------------------------------|
| GET    | /doanh-thu     | Doanh thu theo khoang ngay       |
| GET    | /tong-quan     | Thong ke trang thai don hang, san pham ban chay |

Khach hang chi xem duoc chi tiet don hang cua minh; quan tri vien co the xem moi don hang.
Trang thai chi duoc chuyen `cho_xac_nhan` -> `dang_giao`/`da_huy`, hoac `dang_giao` -> `da_giao`; huy don cho xac nhan se hoan lai ton kho.
