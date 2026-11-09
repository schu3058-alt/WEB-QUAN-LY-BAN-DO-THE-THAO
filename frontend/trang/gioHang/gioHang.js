import { api } from '../../dungChung/api.js';
import { dinhDangTienTe } from '../../dungChung/dinhDang.js';
import { hienThiThongBao, taoTheTrong, thoatHtml, xuLyLoi, yeuCauDangNhap } from '../../dungChung/giaoDien.js';

document.addEventListener('DOMContentLoaded', async () => {
  const vung = document.querySelector('#noi-dung-gio-hang');
  const thongBao = document.querySelector('#thong-bao-gio-hang');
  if (!yeuCauDangNhap()) return;

  async function taiGioHang() {
    const gioHang = await api.get('/gio-hang');
    if (!gioHang.danhSach.length) {
      vung.replaceChildren(taoTheTrong('Giỏ hàng đang trống. Hãy xem sản phẩm để bắt đầu mua sắm.'));
      return;
    }
    vung.innerHTML = `
      <div class="bang-khung"><table>
        <thead><tr><th>Sản phẩm</th><th>Đơn giá</th><th>Số lượng</th><th>Thành tiền</th><th></th></tr></thead>
        <tbody>${gioHang.danhSach.map((muc) => `
          <tr data-chi-tiet-id="${Number(muc.chiTietId)}">
            <td><a href="/san-pham/${Number(muc.sanPhamId)}">${thoatHtml(muc.ten)}</a></td>
            <td>${dinhDangTienTe(muc.gia)}</td>
            <td><input class="so-luong-gio" type="number" min="1" max="100" value="${Number(muc.soLuong)}" aria-label="Số lượng ${thoatHtml(muc.ten)}"></td>
            <td>${dinhDangTienTe(Number(muc.gia) * Number(muc.soLuong))}</td>
            <td><button class="nut nut-phu nut-nho nut-cap-nhat" type="button">Cập nhật</button>
              <button class="nut nut-nguy-hiem nut-nho nut-xoa" type="button">Xóa</button></td>
          </tr>
        `).join('')}</tbody>
      </table></div>
      <section class="khung-noi-dung" style="margin-top:20px">
        <p>Tổng cộng: <strong class="gia-lon">${dinhDangTienTe(gioHang.tongTien)}</strong></p>
        <a class="nut" href="/thanh-toan">Tiếp tục thanh toán</a>
      </section>`;

    vung.querySelectorAll('.nut-cap-nhat').forEach((nut) => nut.addEventListener('click', async () => {
      const dong = nut.closest('tr');
      const soLuong = Number(dong.querySelector('.so-luong-gio').value);
      if (!Number.isInteger(soLuong) || soLuong < 1 || soLuong > 100) {
        hienThiThongBao(thongBao, 'Số lượng phải từ 1 đến 100.', 'loi');
        return;
      }
      try {
        await api.put(`/gio-hang/${dong.dataset.chiTietId}`, { soLuong });
        await taiGioHang();
      } catch (loi) { xuLyLoi(thongBao, loi); }
    }));
    vung.querySelectorAll('.nut-xoa').forEach((nut) => nut.addEventListener('click', async () => {
      const id = nut.closest('tr').dataset.chiTietId;
      try {
        await api.del(`/gio-hang/${id}`);
        await taiGioHang();
      } catch (loi) { xuLyLoi(thongBao, loi); }
    }));
  }

  try {
    await taiGioHang();
  } catch (loi) {
    xuLyLoi(thongBao, loi);
    vung.replaceChildren(taoTheTrong('Không thể tải giỏ hàng.'));
  }
});
