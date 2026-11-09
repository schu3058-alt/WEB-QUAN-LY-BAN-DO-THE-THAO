# Quy chuan phat trien — SportShop

## Dat ten
- Thu muc, file, bien, ham: tieng Viet khong dau, kieu `camelCase` (vi du: `danhMucId`, `taoMoi`)
- Ten bang/truong CSDL: `snake_case` cho ten bang (`don_hang_chi_tiet`), `camelCase` cho cot
- Ten route API: tieng Viet khong dau, noi bang dau gach ngang (`/dang-ky`, `/trang-thai`)

## Cau truc module backend
Moi module trong `backend/modules/<ten>/` gom:
- `<ten>.model.js` — truy van CSDL
- `<ten>.service.js` — nghiep vu, kiem tra dieu kien
- `<ten>.controller.js` — nhan request, goi service, tra response
- `<ten>.routes.js` — khai bao route va middleware
- `<ten>.validation.js` — schema Joi kiem tra du lieu dau vao
- `index.js` — export router cua module

## Nguyen tac
- Khong goi truc tiep model trong controller, luon qua service
- Moi loi nghiep vu nem `Error` kem `maTrangThai`, de middleware `xuLyLoi` xu ly tap trung
- Du lieu dau vao luon di qua middleware `kiemTraDuLieu` (Joi) truoc khi vao controller
- Noi dung HTML tu nguoi dung (mo ta san pham, danh gia...) phai qua `lamSachHtml` truoc khi luu

## Commit & nhanh
Xem `huongDanGit.sh` o thu muc goc.
