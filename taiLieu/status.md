# Trang thai du an — SportShop

**Ngay cap nhat:** 2026-11-11
**Trang thai tong the:** Dang xac minh; chua co ket qua chay bo test trong moi truong hien tai.

## Tom tat

Tai lieu mo ta pham vi hai nhom nguoi dung (khach hang, quan tri), ke hoach 10 Sprint va backlog Jira KAN. Repo hien co backend Express chia module, frontend HTML/CSS/JavaScript, schema SQLite va bo test Jest/Supertest.

Danh gia duoi day dua tren tai lieu va tep ma nguon da thay, khong thay the ket qua demo, kiem thu tren trinh duyet hay trang thai Jira.

## Tien do theo hang muc

| Hang muc | Trang thai | Bang chung | Viec can lam de xac nhan |
|---|---|---|---|
| Ke hoach/Sprint | Can xac minh | Co backlog 10 Epic/Sprint, phan chia cong viec va bao cao Sprint 1 | TV1 doi chieu Jira KAN, xac nhan Sprint hien tai va cap nhat bao cao. |
| Backend/API | Co ma nguon, chua xac minh runtime | Express dang ky cac module tai khoan, danh muc, san pham, gio hang, don hang, thanh toan, danh gia, khuyen mai, thong bao, bao cao | Chay API va test; doi chieu response/phan quyen voi dac ta API. |
| Database | Co schema va script | Co SQL tao bang, rang buoc, chi muc, du lieu mau va script khoi tao | Chay init/seed tren CSDL test rieng; kiem tra rang buoc va du lieu. |
| Frontend | Co cac trang chinh, chua xac minh UI | Co trang khach hang, checkout, theo doi don va quan tri | Chay tren trinh duyet, kiem tra luong chinh va responsive desktop/mobile. |
| Kiem thu tu dong | Chua co ket qua | Co cac file Jest/Supertest cho API, nghiep vu, bao mat, phan quyen, ton kho dong thoi va thanh toan | Xu ly blocker ENV-001, chay `npm test`, ghi ket qua va tao issue cho loi tai hien. |
| Quan ly bug | Moi ghi nhan blocker moi truong | ENV-001 mo trong `logBug.md`; chua ghi nhan bug san pham da xac nhan trong dot nay | Phan loai ket qua test sau khi chay duoc; khong danh dong blocker moi truong thanh bug ung dung. |
| Migration | Chua xac nhan co migration co phien ban | Schema hien duoc quan ly bang cac tep SQL va script khoi tao | Danh gia nhu cau; neu thay doi, bo sung quy trinh migration va test du lieu cu. |
| Nhat ky AI | Da co ban ghi dot dau | `nhatKyCongTacAI.md` | Them ban ghi cac dot ho tro tiep theo va ghi ro ket qua da kiem chung. |

## Chi tiet blocker kiem thu

- Lenh da chay: `npm test` tai repo va thu chay lai qua WSL.
- Ket qua quan sat: lenh bi chuyen vao `CMD.EXE`; UNC path khong duoc ho tro va Node khong tim thay Jest tai `C:\\Windows\\node_modules\\jest\\bin\\jest.js`.
- Ket luan hien tai: chua chay duoc Jest trong terminal cua phien lam viec. Chua du bang chung de ket luan day la loi trong ma nguon hay la loi cai dat/mapping shell.
- Theo doi: ENV-001 trong [logBug.md](./logBug.md).

## Viec uu tien tiep theo

1. TV3/TV4 xac dinh shell, Node/npm va thu muc lam viec dung; chay lai bo test.
2. Ghi ket qua test va xu ly loi co the tai hien, kem test hoi quy.
3. TV2/TV4 kiem tra luong mua hang va quan tri tren trinh duyet.
4. TV1 doi chieu Jira, xac nhan tien do Sprint va cap nhat bao cao.

Theo doi chi tiet trong [todos.md](./todos.md); lich su cong tac voi AI trong [nhatKyCongTacAI.md](./nhatKyCongTacAI.md).