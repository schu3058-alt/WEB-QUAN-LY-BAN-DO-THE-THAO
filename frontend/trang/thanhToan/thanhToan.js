import { api } from '../../dungChung/api.js';
import { dinhDangTienTe } from '../../dungChung/dinhDang.js';
import { hienThiThongBao, taoTheTrong, thoatHtml, xuLyLoi, yeuCauDangNhap } from '../../dungChung/giaoDien.js';

document.addEventListener('DOMContentLoaded', async () => {
  const form = document.querySelector('#form-thanh-toan');
  const vungTomTat = document.querySelector('#tom-tat-gio-hang');
  const thongBao = document.querySelector('#thong-bao-thanh-toan');
  const nutDatHang = document.querySelector('#nut-dat-hang');
  const inputMaKhuyenMai = document.querySelector('#ma-khuyen-mai');
  const nutApDungKhuyenMai = document.querySelector('#nut-ap-dung-khuyen-mai');
  const thongBaoKhuyenMai = document.querySelector('#thong-bao-khuyen-mai');
  let maKhuyenMaiHopLe = '';
  if (!yeuCauDangNhap()) return;

  try {
    const [gioHang, taiKhoan] = await Promise.all([api.get('/gio-hang'), api.get('/tai-khoan/toi')]);
    if (!gioHang.danhSach.length) {
      form.hidden = true;
      vungTomTat.replaceChildren(taoTheTrong('Giỏ hàng đang trống. Hãy thêm sản phẩm trước khi thanh toán.'));
      return;
    }
    const tongTienGoc = Number(gioHang.tongTien);
    if (taiKhoan.soDienThoai) form.elements.soDienThoaiNhan.value = taiKhoan.soDienThoai;
    vungTomTat.innerHTML = `
      <ul>${gioHang.danhSach.map((muc) => `<li>${thoatHtml(muc.ten)} × ${Number(muc.soLuong)} — ${dinhDangTienTe(Number(muc.gia) * Number(muc.soLuong))}</li>`).join('')}</ul>
      <p>Tổng thanh toán: <strong id="tong-tien-don-hang" class="gia-lon">${dinhDangTienTe(gioHang.tongTien)}</strong></p>`;

    nutApDungKhuyenMai.addEventListener('click', async () => {
      const ma = inputMaKhuyenMai.value.trim().toUpperCase();
      if (!ma) {
        hienThiThongBao(thongBaoKhuyenMai, 'Vui lòng nhập mã khuyến mãi.', 'loi');
        return;
      }
      try {
        const ketQua = await api.post('/khuyen-mai/ap-dung', { ma, tongTienGoc });
        maKhuyenMaiHopLe = ma;
        document.querySelector('#tong-tien-don-hang').textContent = dinhDangTienTe(ketQua.tongTienSauGiam);
        hienThiThongBao(
          thongBaoKhuyenMai,
          `Đã áp dụng mã ${ma}. Giảm ${dinhDangTienTe(ketQua.soTienGiam)}; thanh toán ${dinhDangTienTe(ketQua.tongTienSauGiam)}.`
        );
      } catch (loi) {
        maKhuyenMaiHopLe = '';
        document.querySelector('#tong-tien-don-hang').textContent = dinhDangTienTe(tongTienGoc);
        xuLyLoi(thongBaoKhuyenMai, loi);
      }
    });
    inputMaKhuyenMai.addEventListener('input', () => {
      maKhuyenMaiHopLe = '';
      document.querySelector('#tong-tien-don-hang').textContent = dinhDangTienTe(tongTienGoc);
      hienThiThongBao(thongBaoKhuyenMai, '');
    });
  } catch (loi) {
    xuLyLoi(thongBao, loi);
    return;
  }

  form.addEventListener('submit', async (suKien) => {
    suKien.preventDefault();
    nutDatHang.disabled = true;
    const duLieuForm = new FormData(form);
    const { phuongThuc, ...thongTinGiaoHang } = Object.fromEntries(duLieuForm.entries());
    if (maKhuyenMaiHopLe) thongTinGiaoHang.maKhuyenMai = maKhuyenMaiHopLe;
    try {
      const donHang = await api.post('/don-hang', thongTinGiaoHang);
      try {
        await api.post('/thanh-toan', { donHangId: donHang.id, phuongThuc });
      } catch (loiThanhToan) {
        hienThiThongBao(thongBao, `Đơn hàng #${donHang.id} đã được tạo nhưng chưa tạo được yêu cầu thanh toán: ${loiThanhToan.message}. Hãy liên hệ cửa hàng để được hỗ trợ.`, 'loi');
        return;
      }
      location.href = `/don-hang?moi=${encodeURIComponent(donHang.id)}`;
    } catch (loi) {
      xuLyLoi(thongBao, loi);
    } finally {
      nutDatHang.disabled = false;
    }
  });
});
