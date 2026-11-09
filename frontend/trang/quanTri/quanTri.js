import { api } from '../../dungChung/api.js';
import { hienThiThongBao, taoTheTrong, thoatHtml, xuLyLoi, layTaiKhoanDaLuu } from '../../dungChung/giaoDien.js';

document.addEventListener('DOMContentLoaded', async () => {
  const thongBao = document.querySelector('#thong-bao-quan-tri');
  const thongKe = document.querySelector('#thong-ke-quan-tri');
  const vungSanPham = document.querySelector('#san-pham-ban-chay');
  const formKhuyenMai = document.querySelector('#form-khuyen-mai');
  const vungKhuyenMai = document.querySelector('#danh-sach-khuyen-mai');
  const thongBaoKhuyenMai = document.querySelector('#thong-bao-khuyen-mai-quan-tri');
  if (layTaiKhoanDaLuu()?.vaiTro !== 'quan_tri') {
    location.href = '/dang-nhap?tro-lai=%2Fquan-tri';
    return;
  }
  try {
    const tongQuan = await api.get('/bao-cao/tong-quan');
    const tongDon = tongQuan.theoTrangThai.reduce((tong, muc) => tong + Number(muc.soLuong), 0);
    const daGiao = tongQuan.theoTrangThai.find((muc) => muc.trangThai === 'da_giao')?.soLuong || 0;
    thongKe.innerHTML = `
      <article class="the"><span>Tổng đơn hàng</span><strong>${tongDon}</strong></article>
      <article class="the"><span>Đơn đã giao</span><strong>${Number(daGiao)}</strong></article>
      <article class="the"><span>Sản phẩm bán chạy</span><strong>${tongQuan.sanPhamBanChay.length}</strong></article>`;
    if (!tongQuan.sanPhamBanChay.length) {
      vungSanPham.replaceChildren(taoTheTrong('Chưa có dữ liệu sản phẩm bán chạy.'));
    } else {
      vungSanPham.innerHTML = `<div class="bang-khung"><table><thead><tr><th>Sản phẩm</th><th>Đã bán</th></tr></thead><tbody>
        ${tongQuan.sanPhamBanChay.map((muc) => `<tr><td>${thoatHtml(muc.ten)}</td><td>${Number(muc.tongSoLuongBan)}</td></tr>`).join('')}
      </tbody></table></div>`;
    }
  } catch (loi) {
    xuLyLoi(thongBao, loi);
    thongKe.replaceChildren(taoTheTrong('Không thể tải số liệu tổng quan.'));
  }

  async function taiKhuyenMai() {
    const danhSach = await api.get('/khuyen-mai');
    if (!danhSach.length) {
      vungKhuyenMai.replaceChildren(taoTheTrong('Chưa có mã khuyến mãi.'));
      return;
    }
    vungKhuyenMai.innerHTML = `<div class="bang-khung"><table><thead><tr><th>Mã</th><th>Giảm</th><th>Bắt đầu</th><th>Kết thúc</th><th></th></tr></thead><tbody>
      ${danhSach.map((muc) => `<tr>
        <td>${thoatHtml(muc.ma)}</td><td>${Number(muc.phanTramGiam)}%</td>
        <td>${thoatHtml(muc.ngayBatDau)}</td><td>${thoatHtml(muc.ngayKetThuc)}</td>
        <td><button class="nut nut-nguy-hiem nut-nho nut-xoa-khuyen-mai" data-id="${Number(muc.id)}" type="button">Xóa</button></td>
      </tr>`).join('')}
    </tbody></table></div>`;
    vungKhuyenMai.querySelectorAll('.nut-xoa-khuyen-mai').forEach((nut) => nut.addEventListener('click', async () => {
      if (!window.confirm('Xóa mã khuyến mãi này?')) return;
      try {
        await api.del(`/khuyen-mai/${nut.dataset.id}`);
        await taiKhuyenMai();
      } catch (loi) { xuLyLoi(thongBaoKhuyenMai, loi); }
    }));
  }

  formKhuyenMai.addEventListener('submit', async (suKien) => {
    suKien.preventDefault();
    const duLieu = Object.fromEntries(new FormData(formKhuyenMai).entries());
    duLieu.ma = duLieu.ma.trim().toUpperCase();
    duLieu.phanTramGiam = Number(duLieu.phanTramGiam);
    try {
      await api.post('/khuyen-mai', duLieu);
      formKhuyenMai.reset();
      hienThiThongBao(thongBaoKhuyenMai, 'Tạo mã khuyến mãi thành công.');
      await taiKhuyenMai();
    } catch (loi) { xuLyLoi(thongBaoKhuyenMai, loi); }
  });
  taiKhuyenMai().catch((loi) => xuLyLoi(thongBaoKhuyenMai, loi));
});
