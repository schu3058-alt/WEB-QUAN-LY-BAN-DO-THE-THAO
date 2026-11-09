import { api } from '../../dungChung/api.js';
import { hienThiThongBao, taoTheTrong, thoatHtml, xuLyLoi, yeuCauDangNhap } from '../../dungChung/giaoDien.js';

document.addEventListener('DOMContentLoaded', async () => {
  const vungSanPham = document.querySelector('#san-pham-da-mua');
  const vungForm = document.querySelector('#vung-form-danh-gia');
  const form = document.querySelector('#form-danh-gia');
  const thongBao = document.querySelector('#thong-bao-danh-gia');
  let sanPhamIdDangChon;
  if (!yeuCauDangNhap()) return;

  try {
    const donHang = await api.get('/don-hang/toi');
    const daGiao = donHang.filter((muc) => muc.trangThai === 'da_giao');
    const chiTietDon = await Promise.all(daGiao.map((muc) => api.get(`/don-hang/${muc.id}`)));
    const sanPham = chiTietDon.flatMap((don) => don.chiTiet);
    if (!sanPham.length) {
      vungSanPham.replaceChildren(taoTheTrong('Sản phẩm có thể đánh giá sẽ hiển thị sau khi đơn hàng được giao.'));
      return;
    }
    vungSanPham.innerHTML = `<div class="bang-khung"><table><thead><tr><th>Sản phẩm</th><th>Đơn hàng</th><th></th></tr></thead><tbody>
      ${chiTietDon.flatMap((don) => don.chiTiet.map((muc) => `
        <tr><td>${thoatHtml(muc.ten)}</td><td>#${Number(don.id)}</td>
        <td><button class="nut nut-phu nut-nho nut-chon-san-pham" type="button" data-id="${Number(muc.sanPhamId)}" data-ten="${thoatHtml(muc.ten)}">Viết đánh giá</button></td></tr>
      `)).join('')}
    </tbody></table></div>`;
    vungSanPham.querySelectorAll('.nut-chon-san-pham').forEach((nut) => nut.addEventListener('click', () => {
      sanPhamIdDangChon = Number(nut.dataset.id);
      document.querySelector('#ten-san-pham-danh-gia').textContent = nut.dataset.ten;
      vungForm.hidden = false;
      vungForm.scrollIntoView({ behavior: 'smooth' });
    }));
  } catch (loi) {
    xuLyLoi(thongBao, loi);
    vungSanPham.replaceChildren(taoTheTrong('Không thể tải sản phẩm đã mua.'));
  }

  form.addEventListener('submit', async (suKien) => {
    suKien.preventDefault();
    if (!sanPhamIdDangChon) return;
    const duLieu = new FormData(form);
    try {
      await api.post('/danh-gia', {
        sanPhamId: sanPhamIdDangChon,
        soSao: Number(duLieu.get('soSao')),
        noiDung: duLieu.get('noiDung'),
      });
      hienThiThongBao(thongBao, 'Cảm ơn bạn đã đánh giá sản phẩm.');
      vungForm.hidden = true;
      form.reset();
    } catch (loi) { xuLyLoi(thongBao, loi); }
  });
});
