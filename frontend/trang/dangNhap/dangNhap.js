import { api } from '../../dungChung/api.js';
import { KHOA_LUU_TRU } from '../../dungChung/hangSo.js';
import { hienThiThongBao } from '../../dungChung/giaoDien.js';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('#form-xac-thuc');
  const thongBao = document.querySelector('#thong-bao-dang-nhap');
  const tieuDe = document.querySelector('#tieu-de-xac-thuc');
  const nutGui = document.querySelector('#nut-xac-thuc');
  const nutDoiCheDo = document.querySelector('#doi-che-do');
  const truongHoTen = document.querySelector('#truong-ho-ten');
  const truongDienThoai = document.querySelector('#truong-so-dien-thoai');
  let dangDangKy = new URLSearchParams(location.search).get('cheDo') === 'dang-ky';

  function capNhatCheDo() {
    tieuDe.textContent = dangDangKy ? 'Tạo tài khoản' : 'Đăng nhập';
    nutGui.textContent = dangDangKy ? 'Đăng ký' : 'Đăng nhập';
    nutDoiCheDo.textContent = dangDangKy ? 'Đã có tài khoản? Đăng nhập' : 'Chưa có tài khoản? Đăng ký';
    truongHoTen.hidden = !dangDangKy;
    truongDienThoai.hidden = !dangDangKy;
    form.elements.hoTen.required = dangDangKy;
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
    const formData = new FormData(form);
    const duLieu = Object.fromEntries(formData.entries());
    try {
      const ketQua = dangDangKy
        ? await api.post('/tai-khoan/dang-ky', duLieu)
        : await api.post('/tai-khoan/dang-nhap', { email: duLieu.email, matKhau: duLieu.matKhau });
      localStorage.setItem(KHOA_LUU_TRU.TOKEN, ketQua.token);
      localStorage.setItem(KHOA_LUU_TRU.THONG_TIN_TAI_KHOAN, JSON.stringify(ketQua.taiKhoan));
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
});
