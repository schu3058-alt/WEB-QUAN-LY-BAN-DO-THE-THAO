const ThanhToanService = require('./thanhToan.service');
const { thanhCong } = require('../../tienIch/dinhDangPhanHoi');

const ThanhToanController = {
  taoThanhToan(yeuCau, phanHoi, tiepTheo) {
    try {
      return thanhCong(
        phanHoi,
        ThanhToanService.taoThanhToan(yeuCau.body, yeuCau.nguoiDung.id, yeuCau.nguoiDung.vaiTro),
        'Da tao yeu cau thanh toan',
        201
      );
    } catch (loi) {
      return tiepTheo(loi);
    }
  },
  xacNhanThanhCong(yeuCau, phanHoi, tiepTheo) {
    try {
      return thanhCong(phanHoi, ThanhToanService.xacNhanThanhCong(yeuCau.params.id), 'Xác nhận thanh toán thành công');
    } catch (loi) {
      return tiepTheo(loi);
    }
  },
  layTheoDonHang(yeuCau, phanHoi, tiepTheo) {
    try {
      return thanhCong(
        phanHoi,
        ThanhToanService.layTheoDonHang(
          yeuCau.params.donHangId,
          yeuCau.nguoiDung.id,
          yeuCau.nguoiDung.vaiTro
        )
      );
    } catch (loi) {
      return tiepTheo(loi);
    }
  },
};

module.exports = ThanhToanController;
