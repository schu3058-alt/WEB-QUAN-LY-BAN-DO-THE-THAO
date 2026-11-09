const GioHangService = require('./gioHang.service');
const { thanhCong } = require('../../tienIch/dinhDangPhanHoi');

const GioHangController = {
  xemGioHang(yeuCau, phanHoi, tiepTheo) {
    try {
      return thanhCong(phanHoi, GioHangService.xemGioHang(yeuCau.nguoiDung.id));
    } catch (loi) {
      return tiepTheo(loi);
    }
  },
  themSanPham(yeuCau, phanHoi, tiepTheo) {
    try {
      return thanhCong(phanHoi, GioHangService.themSanPham(yeuCau.nguoiDung.id, yeuCau.body), 'Đã thêm vào giỏ hàng');
    } catch (loi) {
      return tiepTheo(loi);
    }
  },
  capNhatSoLuong(yeuCau, phanHoi, tiepTheo) {
    try {
      return thanhCong(
        phanHoi,
        GioHangService.capNhatSoLuong(yeuCau.nguoiDung.id, yeuCau.params.chiTietId, yeuCau.body.soLuong),
        'Da cap nhat so luong'
      );
    } catch (loi) {
      return tiepTheo(loi);
    }
  },
  xoaDong(yeuCau, phanHoi, tiepTheo) {
    try {
      return thanhCong(
        phanHoi,
        GioHangService.xoaDong(yeuCau.nguoiDung.id, yeuCau.params.chiTietId),
        'Da xoa san pham khoi gio hang'
      );
    } catch (loi) {
      return tiepTheo(loi);
    }
  },
};

module.exports = GioHangController;
