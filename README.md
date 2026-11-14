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
- ASP.NET Core MVC tren .NET 8, Entity Framework Core va SQLite
- HTML, CSS va JavaScript modules; API xac thuc bang JWT
- xUnit va ASP.NET Core TestServer cho kiem thu
- ASP.NET Core hosted service tu huy don qua han va tong hop doanh thu hang ngay

## Cai dat va chay (Windows PowerShell)

```powershell
dotnet restore backend\SportShop.Mvc\SportShop.Mvc.csproj
$bytes = New-Object byte[] 32
[System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
$env:JWT_SECRET = [Convert]::ToBase64String($bytes)
npm start
```

`JWT_SECRET` phai duoc dat trong moi terminal chay ung dung va co it nhat 32 byte. ASP.NET Core doc cau hinh tu environment variables; file `.env` khong duoc tu dong nap. CSDL mac dinh o `database/quan_ly_sportshop.sqlite`; ung dung ap dung EF Core migrations khi khoi dong.

De tao tai khoan demo va du lieu mau, dat `JWT_SECRET` theo huong dan ben duoi roi chay:

```powershell
Copy-Item .env.example .env
$bytes = New-Object byte[] 32
[System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
$env:JWT_SECRET = [Convert]::ToBase64String($bytes)
npm run db:seed
```

Ung dung chay tai <http://localhost:5150>; API co tien to `/api` va health check tai <http://localhost:5150/api/health>. `npm run db:init` ap dung EF Core migrations; ung dung cung tu ap dung migration khi khoi dong. CSDL cu co du bang/cot bat buoc se duoc ghi nhan migration nen ma khong xoa hay sua du lieu. Migration ke tiep bo sung rang buoc du lieu va chi muc con thieu; neu du lieu cu vi pham rang buoc hoac thieu khoa ngoai, migration dung va bao loi de xu ly thu cong, khong tu y sua/xoa du lieu. Schema cu thieu bang/cot bat buoc se bi tu choi ro rang.

`npm run db:seed` dung EF Core de tu ap dung migration va nap mau; chi hoat dong ngoai moi truong production va tu choi nap neu CSDL da co tai khoan, danh muc, san pham hoac khuyen mai. Lenh nay khong can cai dependency Node. EF Core migrations la nguon chinh thuc tao/cap nhat schema; cac file SQL tao bang cu khong con duoc script khoi tao su dung.

Tao migration moi bang local tool da ghim phien ban:

```powershell
dotnet tool restore
dotnet tool run dotnet-ef migrations add TenMigration --project backend\SportShop.Mvc\SportShop.Mvc.csproj
```

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
backend/SportShop.Mvc/ ASP.NET Core MVC controllers, models, services, EF Core va migrations
backend/modules/       Nguon Node.js cu, chua duoc loai bo khoi repository
database/              EF migration runner, du lieu mau va script san pham demo
frontend/              Giao dien, trang, thanh phan va tien ich dung chung
backend/SportShop.Mvc.Tests/ Kiem thu tich hop backend ASP.NET Core
taiLieu/                Dac ta, huong dan, so do CSDL va backlog
```

## Tai lieu

- [Huong dan cai dat](./taiLieu/huongDanCaiDat.md)
- [Huong dan su dung](./taiLieu/huongDanSuDung.md)
- [Dac ta yeu cau](./taiLieu/dacTaYeuCau.md)
- [Dac ta API](./taiLieu/dacTaApi.md)
- [So do co so du lieu](./taiLieu/soDoCoSoDuLieu.md)
