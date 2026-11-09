import { KHOA_LUU_TRU } from '../dungChung/hangSo.js';
import { layTaiKhoanDaLuu } from '../dungChung/giaoDien.js';

export function taoThanhDieuHuong() {
  const thanh = document.createElement('nav');
  thanh.className = 'thanh-dieu-huong';
  const lienKet = (ten, duongDan) => {
    const the = document.createElement('a');
    the.href = duongDan;
    the.textContent = ten;
    return the;
  };

  thanh.append(lienKet('SportShop', '/'), lienKet('Sản phẩm', '/san-pham'));
  if (localStorage.getItem(KHOA_LUU_TRU.TOKEN)) {
    thanh.append(lienKet('Giỏ hàng', '/gio-hang'), lienKet('Đơn hàng', '/don-hang'));
    const taiKhoan = layTaiKhoanDaLuu();
    if (taiKhoan?.vaiTro === 'quan_tri') thanh.append(lienKet('Quản trị', '/quan-tri'));
  } else {
    thanh.append(lienKet('Đăng nhập', '/dang-nhap'));
  }
  return thanh;
}
