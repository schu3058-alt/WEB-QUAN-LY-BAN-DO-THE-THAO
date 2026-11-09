const ThongBaoModel = require('./thongBao.model');

const ThongBaoService = {
  layTheoTaiKhoan: (taiKhoanId) => ThongBaoModel.layTheoTaiKhoan(taiKhoanId),
  taoThongBaoChoDonHang(taiKhoanId, trangThaiDonHang) {
    const nhanTrangThai = {
      cho_xac_nhan: 'chờ xác nhận',
      dang_giao: 'đang giao',
      da_giao: 'đã giao',
      da_huy: 'đã hủy',
    }[trangThaiDonHang] || trangThaiDonHang;
    const noiDung = `Đơn hàng của bạn vừa chuyển sang trạng thái: ${nhanTrangThai}`;
    return ThongBaoModel.taoMoi({ taiKhoanId, noiDung });
  },
  danhDauDaDoc(id, taiKhoanId) {
    return ThongBaoModel.danhDauDaDoc(id, taiKhoanId);
  },
};

module.exports = ThongBaoService;
