import { api } from '../../dungChung/api.js';
import { dinhDangNgay, dinhDangTienTe } from '../../dungChung/dinhDang.js';
import { hienThiThongBao, taoTheTrong, thoatHtml, xuLyLoi, yeuCauDangNhap } from '../../dungChung/giaoDien.js';
import { NHAN_TRANG_THAI_DON_HANG } from '../../dungChung/hangSo.js';

document.addEventListener('DOMContentLoaded', async () => {
  const vung = document.querySelector('#danh-sach-don-hang');
  const thongBao = document.querySelector('#thong-bao-don-hang');
  if (!yeuCauDangNhap()) return;
  try {
    const donHang = await api.get('/don-hang/toi');
    const donMoi = new URLSearchParams(location.search).get('moi');
    if (donMoi) hienThiThongBao(thongBao, `Đặt hàng #${donMoi} thành công. Cảm ơn bạn đã mua sắm!`);
    if (!donHang.length) {
      vung.replaceChildren(taoTheTrong('Bạn chưa có đơn hàng nào.'));
      return;
    }
    const cacChiTiet = await Promise.all(donHang.map((muc) => api.get(`/don-hang/${muc.id}`)));
    vung.innerHTML = cacChiTiet.map((muc) => `
      <article class="khung-noi-dung" style="margin-bottom:16px">
        <div class="hang-nut">
          <h2>Đơn hàng #${Number(muc.id)}</h2>
          <span class="the-trang-thai">${thoatHtml(NHAN_TRANG_THAI_DON_HANG[muc.trangThai] || muc.trangThai)}</span>
        </div>
        <p>Ngày đặt: ${thoatHtml(dinhDangNgay(muc.ngayTao))} · Tổng tiền: <strong>${dinhDangTienTe(muc.tongTien)}</strong></p>
        <ul>${muc.chiTiet.map((ct) => `<li>${thoatHtml(ct.ten)} × ${Number(ct.soLuong)} — ${dinhDangTienTe(Number(ct.donGia) * Number(ct.soLuong))}</li>`).join('')}</ul>
        ${muc.trangThai === 'da_giao' ? `<a class="nut nut-phu" href="/danh-gia?donHangId=${Number(muc.id)}">Đánh giá sản phẩm</a>` : ''}
      </article>
    `).join('');
  } catch (loi) {
    xuLyLoi(thongBao, loi);
    vung.replaceChildren(taoTheTrong('Không thể tải danh sách đơn hàng.'));
  }
});
