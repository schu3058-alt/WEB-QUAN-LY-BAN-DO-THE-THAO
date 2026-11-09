import { api } from '../../dungChung/api.js';
import { hienThiThongBao, taoTheTrong, thoatHtml, xuLyLoi, yeuCauDangNhap } from '../../dungChung/giaoDien.js';
import { KHOA_LUU_TRU } from '../../dungChung/hangSo.js';
import { dinhDangNgayGio } from '../../dungChung/dinhDang.js';

document.addEventListener('DOMContentLoaded', async () => {
  const form = document.querySelector('#form-tai-khoan');
  const thongBao = document.querySelector('#thong-bao-tai-khoan');
  const vungThongBao = document.querySelector('#danh-sach-thong-bao');
  if (!yeuCauDangNhap()) return;
  try {
    const taiKhoan = await api.get('/tai-khoan/toi');
    form.elements.hoTen.value = taiKhoan.hoTen || '';
    form.elements.email.value = taiKhoan.email || '';
    form.elements.soDienThoai.value = taiKhoan.soDienThoai || '';
  } catch (loi) {
    xuLyLoi(thongBao, loi);
    form.hidden = true;
    return;
  }

  try {
    const danhSachThongBao = await api.get('/thong-bao/toi');
    if (!danhSachThongBao.length) {
      vungThongBao.replaceChildren(taoTheTrong('Bạn chưa có thông báo.'));
    } else {
      vungThongBao.innerHTML = danhSachThongBao.map((muc) => `
        <article class="khung-noi-dung" style="margin-bottom:12px">
          <p>${thoatHtml(muc.noiDung)}</p><small>${thoatHtml(dinhDangNgayGio(muc.ngayTao))}</small>
          ${muc.daDoc ? '<span class="the-trang-thai">Đã đọc</span>' : `<button class="nut nut-phu nut-nho nut-da-doc" type="button" data-id="${Number(muc.id)}">Đánh dấu đã đọc</button>`}
        </article>`).join('');
      vungThongBao.querySelectorAll('.nut-da-doc').forEach((nut) => nut.addEventListener('click', async () => {
        try {
          await api.put(`/thong-bao/${nut.dataset.id}/da-doc`, {});
          nut.replaceWith(Object.assign(document.createElement('span'), { className: 'the-trang-thai', textContent: 'Đã đọc' }));
        } catch (loi) { xuLyLoi(thongBao, loi); }
      }));
    }
  } catch (loi) {
    xuLyLoi(thongBao, loi);
  }

  form.addEventListener('submit', async (suKien) => {
    suKien.preventDefault();
    const duLieu = new FormData(form);
    try {
      const taiKhoan = await api.put('/tai-khoan/toi', {
        hoTen: duLieu.get('hoTen'),
        soDienThoai: duLieu.get('soDienThoai'),
      });
      const thongTinDaLuu = JSON.parse(localStorage.getItem(KHOA_LUU_TRU.THONG_TIN_TAI_KHOAN) || '{}');
      localStorage.setItem(KHOA_LUU_TRU.THONG_TIN_TAI_KHOAN, JSON.stringify({ ...thongTinDaLuu, ...taiKhoan }));
      hienThiThongBao(thongBao, 'Cập nhật hồ sơ thành công.');
    } catch (loi) { xuLyLoi(thongBao, loi); }
  });
});
