const BaoCaoService = require('./baoCao.service');
const { thanhCong } = require('../../tienIch/dinhDangPhanHoi');

const BaoCaoController = {
  doanhThuTheoNgay(yeuCau, phanHoi, tiepTheo) {
    try {
      const { tuNgay, denNgay } = yeuCau.query;
      return thanhCong(phanHoi, BaoCaoService.doanhThuTheoNgay(tuNgay, denNgay));
    } catch (loi) {
      return tiepTheo(loi);
    }
  },
  tongQuan(yeuCau, phanHoi, tiepTheo) {
    try {
      return thanhCong(phanHoi, BaoCaoService.thongKeTongQuan());
    } catch (loi) {
      return tiepTheo(loi);
    }
  },
};

module.exports = BaoCaoController;
