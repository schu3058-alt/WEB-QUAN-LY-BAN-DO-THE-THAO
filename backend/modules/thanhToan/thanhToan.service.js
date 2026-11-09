const ThanhToanModel = require('./thanhToan.model');
const DonHangModel = require('../donHang/donHang.model');
const coSoDuLieu = require('../../cauHinh/ketNoiCoSoDuLieu');
const ThongBaoService = require('../thongBao/thongBao.service');

const ThanhToanService = {
  taoThanhToan({ donHangId, phuongThuc }, taiKhoanId, vaiTro) {
    return coSoDuLieu.transaction(() => {
      const donHang = DonHangModel.timTheoId(donHangId);
      if (!donHang || (vaiTro !== 'quan_tri' && donHang.taiKhoanId !== taiKhoanId)) {
        const loi = new Error('Không tìm thấy đơn hàng');
        loi.maTrangThai = 404;
        throw loi;
      }
      const thanhToanDaCo = ThanhToanModel.timTheoDonHang(donHangId);
      if (thanhToanDaCo) {
        const loi = new Error('Đơn hàng đã có yêu cầu thanh toán');
        loi.maTrangThai = 409;
        throw loi;
      }
      return ThanhToanModel.taoBanGhi({ donHangId, phuongThuc, soTien: donHang.tongTien });
    })();
  },

  xacNhanThanhCong(id) {
    const banGhi = ThanhToanModel.timTheoId(id);
    if (!banGhi) {
      const loi = new Error('Không tìm thấy yêu cầu thanh toán');
      loi.maTrangThai = 404;
      throw loi;
    }
    if (banGhi.trangThai === 'da_thanh_toan') return banGhi;
    const donHang = DonHangModel.timTheoId(banGhi.donHangId);
    if (donHang.trangThai === 'da_huy') {
      const loi = new Error('Không thể xác nhận thanh toán cho đơn hàng đã hủy');
      loi.maTrangThai = 409;
      throw loi;
    }
    return coSoDuLieu.transaction(() => {
      const capNhat = ThanhToanModel.capNhatTrangThai(id, 'da_thanh_toan');
      if (donHang.trangThai === 'cho_xac_nhan') {
        DonHangModel.capNhatTrangThai(banGhi.donHangId, 'dang_giao');
        ThongBaoService.taoThongBaoChoDonHang(donHang.taiKhoanId, 'dang_giao');
      }
      return capNhat;
    })();
  },

  layTheoDonHang(donHangId, taiKhoanId, vaiTro) {
    const donHang = DonHangModel.timTheoId(donHangId);
    if (!donHang || (vaiTro !== 'quan_tri' && donHang.taiKhoanId !== taiKhoanId)) {
      const loi = new Error('Không tìm thấy đơn hàng');
      loi.maTrangThai = 404;
      throw loi;
    }
    return ThanhToanModel.timTheoDonHang(donHangId);
  },
};

module.exports = ThanhToanService;
