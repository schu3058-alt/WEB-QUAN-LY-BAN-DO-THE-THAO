import { api } from '../../dungChung/api.js';
import { hienThiThongBao, taoTheTrong, themVaoGio, xuLyLoi } from '../../dungChung/giaoDien.js';
import { taoTheSanPham } from '../../thanhPhan/thanhPhanTheSanPham.js';

document.addEventListener('DOMContentLoaded', async () => {
  const vungDanhMuc = document.querySelector('#danh-sach-danh-muc');
  const vungSanPham = document.querySelector('#san-pham-noi-bat');
  const thongBao = document.querySelector('#thong-bao-trang-chu');

  try {
    const [danhMuc, ketQuaSanPham] = await Promise.all([
      api.get('/danh-muc'),
      api.get('/san-pham?trang=1&soLuongMoiTrang=8'),
    ]);

    vungDanhMuc.replaceChildren(...danhMuc.map((muc) => {
      const nut = document.createElement('a');
      nut.className = 'nut nut-phu';
      nut.href = `/san-pham?danhMucId=${encodeURIComponent(muc.id)}`;
      nut.textContent = muc.ten;
      return nut;
    }));

    const sanPham = ketQuaSanPham.danhSach.filter((item) => item.trangThai === 'dang_ban');
    if (!sanPham.length) {
      vungSanPham.replaceChildren(taoTheTrong('Hiện chưa có sản phẩm đang bán.'));
      return;
    }
    vungSanPham.replaceChildren(...sanPham.map((item) => taoTheSanPham(item, (muc) => themVaoGio(muc.id).catch((loi) => xuLyLoi(thongBao, loi)))));
  } catch (loi) {
    hienThiThongBao(thongBao, `Không thể tải nội dung trang chủ: ${loi.message}`, 'loi');
    vungDanhMuc.replaceChildren(taoTheTrong('Không tải được danh mục.'));
    vungSanPham.replaceChildren(taoTheTrong('Không tải được sản phẩm.'));
  }
});
