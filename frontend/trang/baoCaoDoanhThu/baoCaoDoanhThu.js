import { api } from '../../dungChung/api.js';
import { dinhDangTienTe } from '../../dungChung/dinhDang.js';
import { hienThiThongBao, taoTheTrong, thoatHtml, xuLyLoi, layTaiKhoanDaLuu } from '../../dungChung/giaoDien.js';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('#form-bao-cao');
  const thongBao = document.querySelector('#thong-bao-bao-cao');
  const vungTong = document.querySelector('#tong-doanh-thu');
  const vungBang = document.querySelector('#bang-doanh-thu');
  if (layTaiKhoanDaLuu()?.vaiTro !== 'quan_tri') {
    location.href = '/dang-nhap?tro-lai=%2Fquan-tri%2Fbao-cao';
    return;
  }
  const dinhDangNgayLocal = (ngay) => [
    ngay.getFullYear(),
    String(ngay.getMonth() + 1).padStart(2, '0'),
    String(ngay.getDate()).padStart(2, '0'),
  ].join('-');
  const homNay = new Date();
  const ngayTruoc = new Date(homNay);
  ngayTruoc.setDate(ngayTruoc.getDate() - 30);
  form.elements.denNgay.value = dinhDangNgayLocal(homNay);
  form.elements.tuNgay.value = dinhDangNgayLocal(ngayTruoc);

  async function taiBaoCao() {
    const tuNgay = form.elements.tuNgay.value;
    const denNgay = form.elements.denNgay.value;
    if (!tuNgay || !denNgay || tuNgay > denNgay) {
      hienThiThongBao(thongBao, 'Vui lòng chọn khoảng ngày hợp lệ.', 'loi');
      return;
    }
    try {
      const doanhThu = await api.get(`/bao-cao/doanh-thu?tuNgay=${encodeURIComponent(tuNgay)}&denNgay=${encodeURIComponent(denNgay)}`);
      const tongTien = doanhThu.reduce((tong, muc) => tong + Number(muc.doanhThu), 0);
      const tongDon = doanhThu.reduce((tong, muc) => tong + Number(muc.soDonHang), 0);
      vungTong.innerHTML = `
        <article class="the"><span>Tổng doanh thu</span><strong>${dinhDangTienTe(tongTien)}</strong></article>
        <article class="the"><span>Số đơn hàng</span><strong>${tongDon}</strong></article>
        <article class="the"><span>Số ngày có giao dịch</span><strong>${doanhThu.length}</strong></article>`;
      if (!doanhThu.length) {
        vungBang.replaceChildren(taoTheTrong('Không có doanh thu trong khoảng thời gian này.'));
        return;
      }
      vungBang.innerHTML = `<div class="bang-khung"><table><thead><tr><th>Ngày</th><th>Số đơn hàng</th><th>Doanh thu</th></tr></thead><tbody>
        ${doanhThu.map((muc) => `<tr><td>${thoatHtml(muc.ngay)}</td><td>${Number(muc.soDonHang)}</td><td>${dinhDangTienTe(muc.doanhThu)}</td></tr>`).join('')}
      </tbody></table></div>`;
      hienThiThongBao(thongBao, '');
    } catch (loi) { xuLyLoi(thongBao, loi); }
  }

  form.addEventListener('submit', (suKien) => {
    suKien.preventDefault();
    taiBaoCao();
  });
  taiBaoCao();
});
