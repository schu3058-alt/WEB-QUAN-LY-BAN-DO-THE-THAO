# TODO va theo doi cong viec — SportShop

**Cap nhat:** 2026-11-11
**Nguon chinh:** Jira project KAN. File nay la bang theo doi noi bo, khong thay the Jira.

## Quy uoc trang thai

- **Hoan thanh:** co bang chung da hoan tat; neu chua kiem thu thi phai ghi ro.
- **Dang lam:** dang duoc xu ly.
- **Cho lam:** chua bat dau.
- **Bi chan:** khong the tiep tuc truoc khi xu ly phu thuoc/blocker.
- **Can xac minh:** da thay tai lieu/ma nguon, nhung chua du bang chung de dong cong viec.

> Trang thai phan anh nhung gi da kiem tra duoc trong repo va cac lan chay lenh da ghi nhan.
> Khong tu dong suy ra trang thai Jira hoac tien do cua tung thanh vien.

## Backlog cong viec

| ID | Cong viec / ket qua can dat | Uu tien | Goi y phu trach | Trang thai | Phu thuoc / bang chung dong |
|---|---|---|---|---|---|
| TODO-01 | Doi chieu backlog, phan cong va bao cao Sprint voi Jira KAN; xac nhan Sprint hien tai | Cao | TV1 | Can xac minh | Cap nhat Jira va bang nay theo so lieu cua nhom; chua co quyen truy cap/du lieu Jira trong dot nay. |
| TODO-02 | Chay bo test Jest/Supertest tu thu muc repo | Cao | TV3, TV4 | Bi chan | Can xu ly ENV-001; ghi ket qua test dat/truot va tong so test. |
| TODO-03 | Xu ly bug san pham duoc test phat hien va them test hoi quy | Cao | TV3, TV4 | Cho lam | Phu thuoc TODO-02; moi bug co cach tai hien va bang chung fix. |
| TODO-04 | Kiem tra luong khach hang tren trinh duyet | Cao | TV2, TV4 | Can xac minh | Kiem tra tim/xem san pham, size, gio hang, ma giam gia, dat hang, thanh toan, theo doi/huy don va danh gia; ghi trinh duyet va ket qua. |
| TODO-05 | Kiem tra luong quan tri tren trinh duyet | Cao | TV2, TV4 | Can xac minh | Kiem tra phan quyen, danh muc/san pham, don hang, xac nhan thanh toan va bao cao; ghi ket qua. |
| TODO-06 | Doi chieu dac ta API, SRS, schema va hanh vi trong code | Trung binh | TV3, TV4 | Can xac minh | Cap nhat tai lieu hoac mo issue Jira cho moi sai lech duoc xac nhan. |
| TODO-07 | Kiem tra tao CSDL moi, seed va cac rang buoc du lieu | Trung binh | TV3, TV4 | Can xac minh | Chay `npm run db:init`/`npm run db:seed` trong moi truong test rieng; khong chay seed tren CSDL co du lieu can giu. |
| TODO-08 | Danh gia nhu cau migration schema co phien ban | Thap | TV1, TV3 | Cho lam | Ghi quyet dinh va ly do; neu them migration, co test nang cap tu schema hien tai. |
| TODO-09 | Cap nhat bao cao cho cac Sprint tiep theo theo tien do thuc te | Trung binh | TV1, TV4 | Cho lam | Chi bao cao cac muc da co bang chung; theo mau `taiLieu/baoCaoSprint/sprint01.md`. |
| TODO-10 | Tong ket, kiem tra huong dan cai dat/su dung va ban giao | Trung binh | TV1, TV2, TV3, TV4 | Cho lam | Hoan thanh test va kiem tra giao dien; cap nhat tai lieu, issue va danh sach viec con ton. |
| TODO-11 | Duy tri nhat ky cong tac voi AI | Thap | TV1, TV4 | Dang lam | Them ban ghi moi khi AI ho tro mot dot cong viec; phan biet de xuat, thay doi thuc te va ket qua da kiem chung. |

## Bang chung hien co

- Bao cao Sprint 1 ghi cac cong viec khoi dong/ke hoach la hoan thanh.
- Repo co cac module backend, cac trang frontend, schema SQLite va nhieu file test Jest/Supertest.
- Viec co file ma nguon/test khong du de ket luan tinh nang da chay dung.
- Hai lan thu `npm test` trong terminal cua phien lam viec deu bi chuyen qua `CMD.EXE`/duong dan UNC va khong tim thay Jest; xem ENV-001 trong `logBug.md`.

## Thu tu de tiep tuc

1. TV3/TV4 xu ly moi truong Jest va cap nhat ENV-001.
2. Chay test tu repo; ghi lai lenh, moi truong, tong ket va loi co the tai hien.
3. Xu ly loi da xac nhan, them test hoi quy, roi chay lai test lien quan.
4. TV2/TV4 kiem tra giao dien; TV3/TV4 doi chieu API va CSDL.
5. TV1 cap nhat Jira, trang thai tong the va bao cao Sprint.

## Cach cap nhat hang cong viec

- Tao/doi chieu Jira issue truoc khi bat dau theo `quyTacLamDuAn.md`.
- Khi bat dau hoac hoan tat, cap nhat Jira va cot trang thai; them ngay va bang chung neu can.
- Khi co bug, gan ID tu `logBug.md`; khong xoa lich su bug da dong.
- Chi chuyen sang **Hoan thanh** khi dat tieu chi dong; neu chi moi co ma nguon, dung **Can xac minh**.