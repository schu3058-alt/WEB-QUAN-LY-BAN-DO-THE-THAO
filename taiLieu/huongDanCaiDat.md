# Huong dan cai dat — SportShop

## Yeu cau he thong
- Node.js >= 18
- npm >= 9

## Cac buoc cai dat
1. Cai dat thu vien:
   ```bash
   npm install
   ```
2. Sao chep file cau hinh mau:
   ```bash
   cp .env.example .env
   ```
   Chinh sua `.env` neu can (vi du doi `JWT_SECRET` truoc khi trien khai that).
3. Khoi tao co so du lieu va nap du lieu demo:
   ```bash
   npm run db:seed
   ```
   Neu chi can tao cac bang rong, dung `npm run db:init`. Lenh seed chi danh cho phat trien va khong nap lai vao CSDL da co tai khoan/danh muc/san pham/khuyen mai.
4. Chay ung dung o che do phat trien:
   ```bash
   npm run dev
   ```
   May chu mac dinh chay tai `http://localhost:3000`.
5. Mo `http://localhost:3000` de su dung giao dien SportShop do Express phuc vu.
   Frontend goi API tai cung may chu, vi vay khong mo truc tiep cac file HTML bang `file://`.

## Tai khoan demo (chi co sau `npm run db:seed`)
- Quan tri vien: `admin@sportshop.vn` / `SportShopAdmin123!`
- Khach hang: `khachhang1@sportshop.vn` / `SportShopUser123!`

Khong dung thong tin dang nhap demo trong moi truong that.
