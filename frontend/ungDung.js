import { layTaiKhoanDaLuu } from './dungChung/giaoDien.js';
import { KHOA_LUU_TRU } from './dungChung/hangSo.js';

function taoLienKet(ten, duongDan) {
  const lienKet = document.createElement('a');
  lienKet.href = duongDan;
  lienKet.textContent = ten;
  return lienKet;
}

function khoiTaoDieuHuong() {
  const vung = document.querySelector('[data-vung-dieu-huong]');
  if (!vung) return;

  const taiKhoan = layTaiKhoanDaLuu();
  const thanh = document.createElement('nav');
  thanh.className = 'thanh-dieu-huong';
  thanh.append(taoLienKet('SportShop', '/'), taoLienKet('Sản phẩm', '/san-pham'));

  if (localStorage.getItem(KHOA_LUU_TRU.TOKEN)) {
    thanh.append(taoLienKet('Giỏ hàng', '/gio-hang'), taoLienKet('Đơn hàng', '/don-hang'));
    thanh.append(taoLienKet('Tài khoản', '/tai-khoan'));
    if (taiKhoan?.vaiTro === 'quan_tri') {
      thanh.append(taoLienKet('Quản trị', '/quan-tri'));
    }
    const dangXuat = document.createElement('button');
    dangXuat.className = 'nut nut-phu';
    dangXuat.type = 'button';
    dangXuat.textContent = 'Đăng xuất';
    dangXuat.addEventListener('click', () => {
      localStorage.removeItem(KHOA_LUU_TRU.TOKEN);
      localStorage.removeItem(KHOA_LUU_TRU.THONG_TIN_TAI_KHOAN);
      location.href = '/';
    });
    thanh.append(dangXuat);
  } else {
    thanh.append(taoLienKet('Đăng nhập', '/dang-nhap'));
  }

  vung.replaceChildren(thanh);
}

document.addEventListener('DOMContentLoaded', khoiTaoDieuHuong);
