const BaoCaoModel = require('./baoCao.model');

const BaoCaoService = {
  doanhThuTheoNgay(tuNgay, denNgay) {
    return BaoCaoModel.doanhThuTheoNgay(tuNgay, denNgay);
  },
  thongKeTongQuan() {
    return {
      theoTrangThai: BaoCaoModel.thongKeTheoTrangThai(),
      sanPhamBanChay: BaoCaoModel.sanPhamBanChay(5),
    };
  },
};

module.exports = BaoCaoService;
