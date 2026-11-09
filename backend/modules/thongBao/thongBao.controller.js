const ThongBaoService = require('./thongBao.service');
const { thanhCong } = require('../../tienIch/dinhDangPhanHoi');

const ThongBaoController = {
  layCuaToi(yeuCau, phanHoi, tiepTheo) {
    try {
      return thanhCong(phanHoi, ThongBaoService.layTheoTaiKhoan(yeuCau.nguoiDung.id));
    } catch (loi) {
      return tiepTheo(loi);
    }
  },
  danhDauDaDoc(yeuCau, phanHoi, tiepTheo) {
    try {
      ThongBaoService.danhDauDaDoc(yeuCau.params.id, yeuCau.nguoiDung.id);
      return thanhCong(phanHoi, null, 'Đã đánh dấu đã đọc');
    } catch (loi) {
      return tiepTheo(loi);
    }
  },
};

module.exports = ThongBaoController;
