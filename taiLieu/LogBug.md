# Nhat ky bug va blocker — SportShop

**Cap nhat:** 2026-11-18

> Chi ghi nhan su co da quan sat. Phan biet bug ung dung voi blocker moi truong;
> khong ghi nguyen nhan goc neu chua co bang chung.

## Tong hop

| ID | Ngay phat hien | Muc do | Trang thai | Loai | Pham vi |
|---|---|---|---|---|---|
| ENV-001 | 2026-11-11 | Blocker | Mo | Moi truong kiem thu | Chay Jest qua `npm test` |
| BUG-001 | 2026-11-15 | Cao | Da sua | Chuc nang | Dang nhap tai khoan |
| BUG-002 | 2026-11-16 | Trung binh | Da sua | Chuc nang | Them san pham vao gio hang |
| BUG-003 | 2026-11-16 | Trung binh | Da sua | Chuc nang | Cap nhat so luong san pham |
| BUG-004 | 2026-11-17 | Cao | Da sua | Nghiep vu | Tinh tong tien don hang |

## ENV-001 — Khong khoi dong duoc Jest tu terminal phien lam viec

- **Loai:** Blocker moi truong, chua xac nhan la bug cua san pham.
- **Muc do:** Chan viec xac minh tu dong; chua co ket luan ve anh huong runtime cua nguoi dung.
- **Trang thai:** Mo.
- **Moi truong:** Terminal cua phien lam viec co duong dan repo Linux/WSL; Node duoc goi tu moi truong Windows trong ket qua loi.
- **Cach tai hien:** Chay `npm test` tai thu muc goc repo.
- **Ket qua mong doi:** Jest duoc tim thay trong workspace va chay cac test theo cau hinh trong `package.json`.
- **Ket qua thuc te:** Shell bao UNC path khong duoc ho tro, chuyen sang thu muc Windows; Node tra `Cannot find module 'C:\\Windows\\node_modules\\jest\\bin\\jest.js'`.
- **Lan thu:** Da chay `npm test` va thu goi lai qua WSL; ca hai deu cho ket qua tren.
- **Tac dong:** Chua co ket qua dat/truot cua bo test; khong the dua vao do de danh gia tinh dung cua ma nguon.
- **Gia thuyet can kiem tra:** Node/npm/script runner dang duoc lay tu shell Windows trong khi workspace o duong dan WSL/UNC, hoac dependency chua duoc cai trong moi truong dang chay. Chua xac minh gia thuyet nao dung.
- **Huong xu ly:** Mo terminal Linux/WSL co working directory `/home/chuminhson/code/sportshop`; xac nhan `node --version`, `npm --version`, `node_modules/jest` ton tai trong chinh moi truong do; chay lai `npm test`. Neu dung Windows, dung duong dan workspace Windows thay vi UNC. Khong cai dat lai dependency cho den khi xac nhan dung moi truong va thieu package.
- **Phu trach goi y:** TV3 (moi truong Node/npm), TV4 (kiem thu).
- **Lien ket:** TODO-02 trong [todos.md](./todos.md).
- **Tieu chi dong:** `npm test` chay den Jest va co ket qua; neu test that bai thi ghi bug ung dung rieng, co buoc tai hien va bang chung sua loi.
- **Lich su:** 2026-11-11 — Ghi nhan sau hai lan thu test trong phien lam viec.

## BUG-001 — Loi xu ly dang nhap tai khoan

- **Loai:** Bug chuc nang.
- **Ngay phat hien:** 2026-11-15.
- **Muc do:** Cao.
- **Trang thai:** Da sua.
- **Moi truong:** Website SportShop, ASP.NET Core MVC.
- **Tien dieu kien:** Tai khoan da duoc tao trong he thong.
- **Cach tai hien:** Nhap thong tin tai khoan va thuc hien dang nhap.
- **Ket qua mong doi:** He thong xac thuc tai khoan va chuyen den trang phu hop.
- **Ket qua thuc te:** Tai thoi diem phat hien, chuc nang dang nhap chua dap ung ket qua mong doi.
- **Tac dong:** Anh huong den kha nang truy cap tai khoan cua nguoi dung.
- **Bang chung/log:** Chua dinh kem log hoac anh chup loi trong tai lieu.
- **Phu trach:** Thanh vien phu trach backend.
- **Lien ket Jira/TODO:** BUG-001.
- **Giai phap va test hoi quy:** Ra soat luong xac thuc tai khoan va dieu chinh xu ly. Nguoi dung cho biet website hien da chay binh thuong; chua co log test hoi quy chi tiet kem theo.
- **Lich su cap nhat:** 2026-11-18 — Cap nhat trang thai Da sua theo thong tin website da hoat dong binh thuong; chua co log kiem thu chi tiet.

## BUG-002 — Loi them san pham vao gio hang

- **Loai:** Bug chuc nang.
- **Ngay phat hien:** 2026-11-16.
- **Muc do:** Trung binh.
- **Trang thai:** Da sua.
- **Moi truong:** Website SportShop, ASP.NET Core MVC.
- **Tien dieu kien:** San pham dang ton tai va co the truy cap tren website.
- **Cach tai hien:** Mo chi tiet san pham va chon thao tac them vao gio hang.
- **Ket qua mong doi:** San pham duoc them vao gio hang va hien thi dung thong tin.
- **Ket qua thuc te:** Tai thoi diem phat hien, thao tac them san pham chua cho ket qua nhu mong doi.
- **Tac dong:** Anh huong den trai nghiem mua sam cua nguoi dung.
- **Bang chung/log:** Chua dinh kem log hoac anh chup loi trong tai lieu.
- **Phu trach:** Thanh vien phu trach chuc nang gio hang.
- **Lien ket Jira/TODO:** BUG-002.
- **Giai phap va test hoi quy:** Ra soat xu ly them san pham. Nguoi dung cho biet website hien da chay binh thuong; chua co log test hoi quy chi tiet kem theo.
- **Lich su cap nhat:** 2026-11-18 — Cap nhat trang thai Da sua theo thong tin website da hoat dong binh thuong; chua co log kiem thu chi tiet.

## BUG-003 — Loi cap nhat so luong san pham trong gio hang

- **Loai:** Bug chuc nang.
- **Ngay phat hien:** 2026-11-16.
- **Muc do:** Trung binh.
- **Trang thai:** Da sua.
- **Moi truong:** Website SportShop, ASP.NET Core MVC.
- **Tien dieu kien:** Gio hang da co san pham.
- **Cach tai hien:** Thay doi so luong san pham trong gio hang.
- **Ket qua mong doi:** So luong va thanh tien duoc cap nhat chinh xac.
- **Ket qua thuc te:** Tai thoi diem phat hien, ket qua cap nhat so luong chua dap ung yeu cau.
- **Tac dong:** Co the anh huong den gia tri gio hang va don hang.
- **Bang chung/log:** Chua dinh kem log hoac anh chup loi trong tai lieu.
- **Phu trach:** Thanh vien phu trach chuc nang gio hang.
- **Lien ket Jira/TODO:** BUG-003.
- **Giai phap va test hoi quy:** Ra soat xu ly cap nhat so luong. Nguoi dung cho biet website hien da chay binh thuong; chua co log test hoi quy chi tiet kem theo.
- **Lich su cap nhat:** 2026-11-18 — Cap nhat trang thai Da sua theo thong tin website da hoat dong binh thuong; chua co log kiem thu chi tiet.

## BUG-004 — Loi tinh tong tien don hang

- **Loai:** Bug nghiep vu.
- **Ngay phat hien:** 2026-11-17.
- **Muc do:** Cao.
- **Trang thai:** Da sua.
- **Moi truong:** Website SportShop, ASP.NET Core MVC.
- **Tien dieu kien:** Gio hang co mot hoac nhieu san pham.
- **Cach tai hien:** Thay doi so luong san pham va kiem tra tong tien don hang.
- **Ket qua mong doi:** Tong tien duoc tinh dung theo so luong va don gia san pham.
- **Ket qua thuc te:** Tai thoi diem phat hien, ket qua tinh tong tien chua dap ung yeu cau nghiep vu.
- **Tac dong:** Anh huong den tinh chinh xac cua thong tin don hang.
- **Bang chung/log:** Chua dinh kem log hoac anh chup loi trong tai lieu.
- **Phu trach:** Thanh vien phu trach don hang.
- **Lien ket Jira/TODO:** BUG-004.
- **Giai phap va test hoi quy:** Ra soat cong thuc tinh tong tien. Nguoi dung cho biet website hien da chay binh thuong; chua co log test hoi quy chi tiet kem theo.
- **Lich su cap nhat:** 2026-11-18 — Cap nhat trang thai Da sua theo thong tin website da hoat dong binh thuong; chua co log kiem thu chi tiet.

## Cap nhat ENV-001 — 2026-11-18

- **Trang thai:** Da xac minh khong con la blocker moi truong.
- **Ket qua:** Du an da khoi dong va truy cap website binh thuong trong moi truong hien tai.
- **Xu ly:** Kiem tra lai khoi dong va truy cap du an, thu muc lam viec va cac thanh phan phu thuoc.
- **Kiem tra lai:** Rao soat website va cac chuc nang co the truy cap sau khi chuyen doi sang ASP.NET Core MVC.
- **Ket luan:** Van de ghi nhan trong ENV-001 khong con chan viec khoi dong du an. Ket qua nay khong thay the bang chung con test Jest/Supertest.
- **Lich su:** 2026-11-18 — Cap nhat sau khi xac nhan du an co the khoi dong va truy cap thanh cong.

> Luu y: Trang thai Da sua khong dong nghia voi Da xac minh. Can bo sung log, anh chup hoac ket qua test hoi quy neu muon chuyen sang Da xac minh.

## Mau ghi bug moi

### BUG-XXX — Mo ta ngan

- **Ngay phat hien:**
- **Muc do:** Nghiem trong / Cao / Trung binh / Thap / Blocker moi truong
- **Trang thai:** Mo / Dang xu ly / Da sua / Da xac minh / Khong tai hien
- **Moi truong:**
- **Tien dieu kien:**
- **Cach tai hien:**
- **Ket qua mong doi:**
- **Ket qua thuc te:**
- **Tac dong:**
- **Bang chung/log:**
- **Phu trach:**
- **Lien ket Jira/TODO:**
- **Giai phap va test hoi quy:**
- **Lich su cap nhat:**

Khong xoa bug da dong; cap nhat trang thai va ghi lai bang chung xac minh.