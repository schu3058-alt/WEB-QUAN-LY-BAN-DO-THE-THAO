const DanhMucService = require('./danhMuc.service');
const { thanhCong } = require('../../tienIch/dinhDangPhanHoi');

const DanhMucController = {
  layTatCa(yeuCau, phanHoi, tiepTheo) {
    try {
      return thanhCong(phanHoi, DanhMucService.layTatCa());
    } catch (loi) {
      return tiepTheo(loi);
    }
  },
  layTheoId(yeuCau, phanHoi, tiepTheo) {
    try {
      return thanhCong(phanHoi, DanhMucService.layTheoId(yeuCau.params.id));
    } catch (loi) {
      return tiepTheo(loi);
    }
  },
  taoMoi(yeuCau, phanHoi, tiepTheo) {
    try {
      return thanhCong(phanHoi, DanhMucService.taoMoi(yeuCau.body), 'Tạo danh mục thành công', 201);
    } catch (loi) {
      return tiepTheo(loi);
    }
  },
  capNhat(yeuCau, phanHoi, tiepTheo) {
    try {
      return thanhCong(phanHoi, DanhMucService.capNhat(yeuCau.params.id, yeuCau.body), 'Cập nhật danh mục thành công');
    } catch (loi) {
      return tiepTheo(loi);
    }
  },
  xoa(yeuCau, phanHoi, tiepTheo) {
    try {
      DanhMucService.xoa(yeuCau.params.id);
      return thanhCong(phanHoi, null, 'Xóa danh mục thành công');
    } catch (loi) {
      return tiepTheo(loi);
    }
  },
};

module.exports = DanhMucController;
