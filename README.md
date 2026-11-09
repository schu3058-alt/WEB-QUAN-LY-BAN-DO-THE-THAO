# SportShop

SportShop la ung dung web quan ly va ban do the thao. Khach hang co the xem san pham, dat hang va theo doi don; quan tri vien quan ly hang hoa, xu ly don va xem bao cao.

## Chuc nang

### Khach hang
- Dang ky, dang nhap, cap nhat ho so va dang xuat.
- Tim kiem, loc theo danh muc, xem chi tiet va danh gia san pham da nhan.
- Them, cap nhat va xoa san pham trong gio hang; kiem tra ton kho khi dat hang.
- Dat hang, ap dung ma khuyen mai, theo doi trang thai va nhan thong bao.

### Quan tri vien
- Quan ly danh muc va san pham (them, sua, ngung kinh doanh).
- Xem don hang, xac nhan thanh toan va cap nhat trang thai.
- Tao/xoa ma khuyen mai; xem doanh thu va san pham ban chay.

## Cong nghe
- Node.js 18 tro len, Express 4, SQLite (`better-sqlite3`)
- HTML, CSS va JavaScript modules; API xac thuc bang JWT
- Jest va Supertest cho kiem thu

## Cai dat va chay (Windows PowerShell)

```powershell
npm install
Copy-Item .env.example .env
```

Sua `.env`: dat `JWT_SECRET` thanh chuoi ngau nhien rieng truoc khi chia se/deploy. Khoi tao CSDL va du lieu demo:

```powershell
npm run db:seed
npm run dev
```

Mo giao dien tai <http://localhost:3000>; API co tien to `/api` va health check tai <http://localhost:3000/api/health>.
Neu chi can tao cac bang rong, chay `npm run db:init`. `db:seed` chi danh cho moi truong phat trien va tu choi nap mau neu CSDL da co tai khoan, danh muc, san pham hoac khuyen mai.

Tai khoan demo duoc tao boi `npm run db:seed`:

| Vai tro | Email | Mat khau |
|---|---|---|
| Quan tri | `admin@sportshop.vn` | `SportShopAdmin123!` |
| Khach hang | `khachhang1@sportshop.vn` | `SportShopUser123!` |

Khong su dung tai khoan/mat khau demo trong moi truong that. De dang ky tai khoan khach hang moi, su dung chuc nang Dang ky tren website.

Them 20 san pham demo kem anh minh hoa SVG duoc luu tai may:

```powershell
npm run products:add
```

Lenh co the chay lai an toan: khong tao trung san pham va se tao/cap nhat anh noi bo tai `frontend/hinh-anh-san-pham`.

## Kiem thu

```powershell
npm test
```

## Cau truc

```text
backend/       Express app, middleware, API modules va tac vu nen
database/      Schema, chi muc, du lieu mau va lenh khoi tao CSDL
frontend/      Giao dien, trang, thanh phan va tien ich dung chung
kiemThu/       Kiem thu API, bao mat, nghiep vu, ton kho va thanh toan
taiLieu/       Dac ta, huong dan, so do CSDL va backlog
```

## Tai lieu

- [Huong dan cai dat](./taiLieu/huongDanCaiDat.md)
- [Huong dan su dung](./taiLieu/huongDanSuDung.md)
- [Dac ta yeu cau](./taiLieu/dacTaYeuCau.md)
- [Dac ta API](./taiLieu/dacTaApi.md)
- [So do co so du lieu](./taiLieu/soDoCoSoDuLieu.md)
