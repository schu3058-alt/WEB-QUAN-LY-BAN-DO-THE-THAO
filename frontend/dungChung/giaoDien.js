import { api } from './api.js';
import { KHOA_LUU_TRU } from './hangSo.js';

export function thoatHtml(giaTri = '') {
  return String(giaTri).replace(/[&<>"']/g, (kyTu) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[kyTu]);
}

export function hienThiThongBao(vung, noiDung, loai = 'thanh-cong') {
  if (!vung) return;
  vung.textContent = noiDung;
  vung.className = `thong-bao ${loai}`;
  vung.hidden = !noiDung;
}

export function layTaiKhoanDaLuu() {
  try {
    return JSON.parse(localStorage.getItem(KHOA_LUU_TRU.THONG_TIN_TAI_KHOAN) || 'null');
  } catch {
    return null;
  }
}

export function yeuCauDangNhap() {
  if (!localStorage.getItem(KHOA_LUU_TRU.TOKEN)) {
    const trangHienTai = `${location.pathname}${location.search}`;
    location.href = `/dang-nhap?tro-lai=${encodeURIComponent(trangHienTai)}`;
    return false;
  }
  return true;
}

export async function themVaoGio(sanPhamId, soLuong = 1) {
  if (!yeuCauDangNhap()) return;
  await api.post('/gio-hang', { sanPhamId: Number(sanPhamId), soLuong: Number(soLuong) });
  window.alert('Đã thêm sản phẩm vào giỏ hàng.');
}

export function taoTheTrong(thongDiep) {
  const the = document.createElement('p');
  the.className = 'trong-rong';
  the.textContent = thongDiep;
  return the;
}

export function xuLyLoi(vung, loi) {
  hienThiThongBao(vung, loi.message || 'Đã xảy ra lỗi. Vui lòng thử lại.', 'loi');
}
