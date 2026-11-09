const DanhGiaService = require('./danhGia.service');
const { thanhCong } = require('../../tienIch/dinhDangPhanHoi');

const DanhGiaController = {
  layTheoSanPham(yeuCau, phanHoi, tiepTheo) {
    try {
      return thanhCong(phanHoi, DanhGiaService.layTheoSanPham(yeuCau.params.sanPhamId));
    } catch (loi) {
      return tiepTheo(loi);
    }
  },
  taoMoi(yeuCau, phanHoi, tiepTheo) {
    try {
      return thanhCong(phanHoi, DanhGiaService.taoMoi(yeuCau.nguoiDung.id, yeuCau.body), 'Cảm ơn bạn đã đánh giá', 201);
    } catch (loi) {
      return tiepTheo(loi);
    }
  },
  xoa(yeuCau, phanHoi, tiepTheo) {
    try {
      DanhGiaService.xoa(yeuCau.params.id, yeuCau.nguoiDung.id);
      return thanhCong(phanHoi, null, 'Đã xóa đánh giá');
    } catch (loi) {
      return tiepTheo(loi);
    }
  },
};

module.exports = DanhGiaController;
