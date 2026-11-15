# Huong dan cai dat — SportShop

## Yeu cau he thong
- .NET SDK 8
- Node.js >= 18 va npm >= 9 (chi can neu chay kiem thu/ma JavaScript cu)

## Cac buoc cai dat
1. Khoi phuc backend ASP.NET Core MVC:
   ```bash
   dotnet restore backend\SportShop.Mvc\SportShop.Mvc.csproj
   ```
2. Dat khoa JWT ngau nhien cho terminal hien tai:
   ```bash
   $bytes = New-Object byte[] 32
   [System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
   $env:JWT_SECRET = [Convert]::ToBase64String($bytes)
   ```
   ASP.NET Core doc `JWT_SECRET` tu bien moi truong; file `.env` khong duoc tu dong nap.
3. Chay ung dung:
   ```bash
   dotnet run --project backend\SportShop.Mvc\SportShop.Mvc.csproj
   ```
   CSDL mac dinh tai `database\quan_ly_sportshop.sqlite`; EF Core migrations duoc ap dung khi app chay. Co the ap dung truoc bang `npm run db:init`.
4. Mo `http://localhost:5150` de su dung giao dien SportShop do ASP.NET Core phuc vu. Frontend goi API tai cung may chu, vi vay khong mo truc tiep cac file HTML bang `file://`.

## Nap du lieu demo
Lenh seed dung EF Core va khong can cai dependency Node:
```powershell
Copy-Item .env.example .env
$bytes = New-Object byte[] 32
[System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
$env:JWT_SECRET = [Convert]::ToBase64String($bytes)
npm run db:seed
```
Lenh seed chi chay ngoai production va tu choi nap vao CSDL da co tai khoan, danh muc, san pham hoac khuyen mai. `npm run db:init` chi ap dung migrations, khong nap du lieu mau. CSDL hien co va co du bang/cot bat buoc se duoc baseline de giu du lieu. Migration schema tiep theo them cac rang buoc du lieu va chi muc con thieu; neu phat hien du lieu khong hop le, ban ghi mo coi hoac thieu khoa ngoai, migration se dung va thong bao loi, khong tu dong sua/xoa du lieu. Schema khong day du se dung voi thong bao loi thay vi tu dong ghi de.

Tao migration moi:
```powershell
dotnet tool restore
dotnet tool run dotnet-ef migrations add TenMigration --project backend\SportShop.Mvc\SportShop.Mvc.csproj
```

## Tai khoan demo (chi co sau `npm run db:seed`)
- Quan tri vien: `admin@sportshop.vn` / `SportShopAdmin123!`
- Khach hang: `khachhang1@sportshop.vn` / `SportShopUser123!`

Khong dung thong tin dang nhap demo trong moi truong that.

## Kiem thu backend
```powershell
dotnet test backend\SportShop.Mvc.Tests\SportShop.Mvc.Tests.csproj
```
