const DonHangService = require('./donHang.service');
const { thanhCong } = require('../../tienIch/dinhDangPhanHoi');

const DonHangController = {
  xacNhanDatHang(yeuCau, phanHoi, tiepTheo) {
    try {
      const donHang = DonHangService.xacNhanDatHang(yeuCau.nguoiDung.id, yeuCau.body);
      return thanhCong(phanHoi, donHang, 'Đặt hàng thành công', 201);
    } catch (loi) {
      return tiepTheo(loi);
    }
  },

  layDonHangCuaToi(yeuCau, phanHoi, tiepTheo) {
    try {
      return thanhCong(phanHoi, DonHangService.layDonHangCuaToi(yeuCau.nguoiDung.id));
    } catch (loi) {
      return tiepTheo(loi);
    }
  },

  layChiTiet(yeuCau, phanHoi, tiepTheo) {
    try {
      return thanhCong(
        phanHoi,
        DonHangService.layChiTiet(yeuCau.params.id, yeuCau.nguoiDung.id, yeuCau.nguoiDung.vaiTro)
      );
    } catch (loi) {
      return tiepTheo(loi);
    }
  },

  layTatCa(yeuCau, phanHoi, tiepTheo) {
    try {
      return thanhCong(phanHoi, DonHangService.layTatCa(yeuCau.query));
    } catch (loi) {
      return tiepTheo(loi);
    }
  },

  capNhatTrangThai(yeuCau, phanHoi, tiepTheo) {
    try {
      const donHang = DonHangService.capNhatTrangThai(yeuCau.params.id, yeuCau.body.trangThai);
      return thanhCong(phanHoi, donHang, 'Cập nhật trạng thái đơn hàng thành công');
    } catch (loi) {
      return tiepTheo(loi);
    }
  },
};

module.exports = DonHangController;
