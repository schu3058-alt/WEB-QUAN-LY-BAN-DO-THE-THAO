import { api } from '../../dungChung/api.js';
import { dinhDangNgay, dinhDangTienTe } from '../../dungChung/dinhDang.js';
import { hienThiThongBao, taoTheTrong, thoatHtml, xuLyLoi, layTaiKhoanDaLuu } from '../../dungChung/giaoDien.js';
import { TRANG_THAI_DON_HANG, NHAN_TRANG_THAI_DON_HANG } from '../../dungChung/hangSo.js';

const NHAN_PHUONG_THUC_THANH_TOAN = {
  tien_mat: 'Tiền mặt khi nhận hàng',
  chuyen_khoan: 'Chuyển khoản',
  vi_dien_tu: 'Ví điện tử',
};
const NHAN_TRANG_THAI_THANH_TOAN = {
  cho_thanh_toan: 'Chờ thanh toán',
  da_thanh_toan: 'Đã thanh toán',
  that_bai: 'Thất bại',
};

document.addEventListener('DOMContentLoaded', async () => {
  const vung = document.querySelector('#danh-sach-don-hang');
  const thongBao = document.querySelector('#thong-bao-quan-ly-don-hang');
  const loc = document.querySelector('#loc-trang-thai');
  if (layTaiKhoanDaLuu()?.vaiTro !== 'quan_tri') {
    location.href = '/dang-nhap?tro-lai=%2Fquan-tri%2Fdon-hang';
    return;
  }

  async function taiDonHang() {
    try {
      const query = loc.value ? `?trangThai=${encodeURIComponent(loc.value)}` : '';
      const donHangGoc = await api.get(`/don-hang${query}`);
      const donHang = await Promise.all(donHangGoc.map(async (muc) => ({
        ...muc,
        thanhToan: await api.get(`/thanh-toan/don-hang/${muc.id}`),
        chiTiet: (await api.get(`/don-hang/${muc.id}`)).chiTiet,
      })));
      if (!donHang.length) {
        vung.replaceChildren(taoTheTrong('Không có đơn hàng phù hợp.'));
        return;
      }
      vung.innerHTML = `<div class="bang-khung"><table><thead><tr><th>Mã đơn / khách hàng</th><th>Ngày đặt</th><th>Địa chỉ nhận</th><th>SĐT</th><th>Tổng tiền</th><th>Thanh toán</th><th>Trạng thái đơn</th><th>Thao tác</th></tr></thead><tbody>
        ${donHang.map((muc) => `<tr data-id="${Number(muc.id)}">
          <td>#${Number(muc.id)}<br>${thoatHtml(muc.tenKhachHang || '')}<br><small>${thoatHtml(muc.email || '')}</small>
            <details><summary>Chi tiết đơn hàng</summary><ul>${muc.chiTiet.map((dong) => `<li>${thoatHtml(dong.ten)} × ${Number(dong.soLuong)} — ${dinhDangTienTe(Number(dong.donGia) * Number(dong.soLuong))}</li>`).join('')}</ul></details>
          </td><td>${thoatHtml(dinhDangNgay(muc.ngayTao))}</td>
          <td>${thoatHtml(muc.diaChiNhan)}</td><td>${thoatHtml(muc.soDienThoaiNhan)}</td><td>${dinhDangTienTe(muc.tongTien)}</td>
          <td>${muc.thanhToan ? `${thoatHtml(NHAN_PHUONG_THUC_THANH_TOAN[muc.thanhToan.phuongThuc] || muc.thanhToan.phuongThuc)}<br>${thoatHtml(NHAN_TRANG_THAI_THANH_TOAN[muc.thanhToan.trangThai] || muc.thanhToan.trangThai)}${muc.thanhToan.trangThai === 'cho_thanh_toan' ? `<br><button class="nut nut-nho nut-xac-nhan-thanh-toan" type="button" data-id="${Number(muc.thanhToan.id)}">Xác nhận</button>` : ''}` : 'Chưa có yêu cầu'}</td>
          <td><span>${thoatHtml(NHAN_TRANG_THAI_DON_HANG[muc.trangThai])}</span>
            ${['cho_xac_nhan', 'dang_giao'].includes(muc.trangThai) ? `<select class="chon-trang-thai" aria-label="Trạng thái mới">${[muc.trangThai, ...(muc.trangThai === 'cho_xac_nhan' ? ['dang_giao', 'da_huy'] : ['da_giao'])].map((ma) => `<option value="${ma}">${thoatHtml(NHAN_TRANG_THAI_DON_HANG[ma])}</option>`).join('')}</select>` : ''}</td>
          <td>${['cho_xac_nhan', 'dang_giao'].includes(muc.trangThai) ? '<button class="nut nut-nho nut-cap-nhat" type="button">Lưu</button>' : '—'}</td>
        </tr>`).join('')}
      </tbody></table></div>`;
      vung.querySelectorAll('.nut-cap-nhat').forEach((nut) => nut.addEventListener('click', async () => {
        const dong = nut.closest('tr');
        try {
          await api.put(`/don-hang/${dong.dataset.id}/trang-thai`, { trangThai: dong.querySelector('.chon-trang-thai').value });
          hienThiThongBao(thongBao, `Đã cập nhật đơn hàng #${dong.dataset.id}.`);
          await taiDonHang();
        } catch (loi) { xuLyLoi(thongBao, loi); }
      }));
      vung.querySelectorAll('.nut-xac-nhan-thanh-toan').forEach((nut) => nut.addEventListener('click', async () => {
        try {
          await api.put(`/thanh-toan/${nut.dataset.id}/xac-nhan`, {});
          hienThiThongBao(thongBao, 'Đã xác nhận thanh toán.');
          await taiDonHang();
        } catch (loi) { xuLyLoi(thongBao, loi); }
      }));
    } catch (loi) {
      xuLyLoi(thongBao, loi);
      vung.replaceChildren(taoTheTrong('Không thể tải đơn hàng.'));
    }
  }

  loc.addEventListener('change', taiDonHang);
  await taiDonHang();
});
