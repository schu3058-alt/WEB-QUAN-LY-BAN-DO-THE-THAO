import { api } from './api.js';
import { KHOA_LUU_TRU } from './hangSo.js';
import { hienThiThongBao } from './giaoDien.js';

export function ganSuKienFormXacThuc({
  form,
  thongBao,
  tieuDe,
  nutGui,
  nutDoiCheDo,
  truongHoTen,
  truongDienThoai,
  cheDoBanDau = 'dang-nhap',
  sauKhiXacThuc,
}) {
  let dangDangKy = cheDoBanDau === 'dang-ky';

  function capNhatCheDo() {
    tieuDe.textContent = dangDangKy ? 'Tạo tài khoản' : 'Đăng nhập';
    nutGui.textContent = dangDangKy ? 'Đăng ký' : 'Đăng nhập';
    nutDoiCheDo.textContent = dangDangKy ? 'Đã có tài khoản? Đăng nhập' : 'Chưa có tài khoản? Đăng ký';
    truongHoTen.hidden = !dangDangKy;
    truongDienThoai.hidden = !dangDangKy;
    form.elements.hoTen.required = dangDangKy;
    form.elements.matKhau.autocomplete = dangDangKy ? 'new-password' : 'current-password';
  }

  capNhatCheDo();
  nutDoiCheDo.addEventListener('click', () => {
    dangDangKy = !dangDangKy;
    hienThiThongBao(thongBao, '');
    capNhatCheDo();
  });

  form.addEventListener('submit', async (suKien) => {
    suKien.preventDefault();
    nutGui.disabled = true;
    const duLieu = Object.fromEntries(new FormData(form).entries());
    try {
      const ketQua = dangDangKy
        ? await api.post('/tai-khoan/dang-ky', duLieu)
        : await api.post('/tai-khoan/dang-nhap', { email: duLieu.email, matKhau: duLieu.matKhau });
      localStorage.setItem(KHOA_LUU_TRU.TOKEN, ketQua.token);
      localStorage.setItem(KHOA_LUU_TRU.THONG_TIN_TAI_KHOAN, JSON.stringify(ketQua.taiKhoan));

      if (sauKhiXacThuc) {
        sauKhiXacThuc(ketQua);
        return;
      }

      const duongDanTroLai = new URLSearchParams(location.search).get('tro-lai');
      const denTrang = duongDanTroLai?.startsWith('/') && !duongDanTroLai.startsWith('//')
        ? duongDanTroLai
        : ketQua.taiKhoan.vaiTro === 'quan_tri' ? '/quan-tri' : '/';
      location.href = denTrang;
    } catch (loi) {
      hienThiThongBao(thongBao, loi.message, 'loi');
    } finally {
      nutGui.disabled = false;
    }
  });
}
