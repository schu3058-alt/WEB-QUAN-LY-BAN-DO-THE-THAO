const KhuyenMaiService = require('./khuyenMai.service');
const { thanhCong } = require('../../tienIch/dinhDangPhanHoi');

const KhuyenMaiController = {
  layTatCa(yeuCau, phanHoi, tiepTheo) {
    try {
      return thanhCong(phanHoi, KhuyenMaiService.layTatCa());
    } catch (loi) {
      return tiepTheo(loi);
    }
  },
  taoMoi(yeuCau, phanHoi, tiepTheo) {
    try {
      return thanhCong(phanHoi, KhuyenMaiService.taoMoi(yeuCau.body), 'Tạo khuyến mãi thành công', 201);
    } catch (loi) {
      return tiepTheo(loi);
    }
  },
  apDung(yeuCau, phanHoi, tiepTheo) {
    try {
      return thanhCong(phanHoi, KhuyenMaiService.apDung(yeuCau.body.ma, yeuCau.body.tongTienGoc));
    } catch (loi) {
      return tiepTheo(loi);
    }
  },
  xoa(yeuCau, phanHoi, tiepTheo) {
    try {
      KhuyenMaiService.xoa(yeuCau.params.id);
      return thanhCong(phanHoi, null, 'Đã xóa khuyến mãi');
    } catch (loi) {
      return tiepTheo(loi);
    }
  },
};

module.exports = KhuyenMaiController;
