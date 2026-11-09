const SanPhamService = require('./sanPham.service');
const { thanhCong } = require('../../tienIch/dinhDangPhanHoi');

const SanPhamController = {
  timKiem(yeuCau, phanHoi, tiepTheo) {
    try {
      return thanhCong(phanHoi, SanPhamService.timKiem(yeuCau.query));
    } catch (loi) {
      return tiepTheo(loi);
    }
  },
  timKiemQuanTri(yeuCau, phanHoi, tiepTheo) {
    try {
      return thanhCong(phanHoi, SanPhamService.timKiemQuanTri(yeuCau.query));
    } catch (loi) {
      return tiepTheo(loi);
    }
  },
  layTheoId(yeuCau, phanHoi, tiepTheo) {
    try {
      return thanhCong(phanHoi, SanPhamService.layTheoId(yeuCau.params.id));
    } catch (loi) {
      return tiepTheo(loi);
    }
  },
  taoMoi(yeuCau, phanHoi, tiepTheo) {
    try {
      return thanhCong(phanHoi, SanPhamService.taoMoi(yeuCau.body), 'Thêm sản phẩm thành công', 201);
    } catch (loi) {
      return tiepTheo(loi);
    }
  },
  capNhat(yeuCau, phanHoi, tiepTheo) {
    try {
      return thanhCong(phanHoi, SanPhamService.capNhat(yeuCau.params.id, yeuCau.body), 'Cập nhật sản phẩm thành công');
    } catch (loi) {
      return tiepTheo(loi);
    }
  },
  ngungKinhDoanh(yeuCau, phanHoi, tiepTheo) {
    try {
      SanPhamService.ngungKinhDoanh(yeuCau.params.id);
      return thanhCong(phanHoi, null, 'Đã ngừng kinh doanh sản phẩm');
    } catch (loi) {
      return tiepTheo(loi);
    }
  },
};

module.exports = SanPhamController;
