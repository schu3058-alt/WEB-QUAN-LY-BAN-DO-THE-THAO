const DanhGiaModel = require('./danhGia.model');
const lamSachHtml = require('../../tienIch/lamSachHtml');

const DanhGiaService = {
  layTheoSanPham: (sanPhamId) => DanhGiaModel.layTheoSanPham(sanPhamId),

  taoMoi(taiKhoanId, { sanPhamId, soSao, noiDung }) {
    if (!DanhGiaModel.daMuaVaNhan(taiKhoanId, sanPhamId)) {
      const loi = new Error('Bạn chỉ có thể đánh giá sản phẩm trong đơn hàng đã giao');
      loi.maTrangThai = 403;
      throw loi;
    }
    return DanhGiaModel.taoMoi({ sanPhamId, taiKhoanId, soSao, noiDung: lamSachHtml(noiDung) });
  },

  xoa(id, taiKhoanId) {
    return DanhGiaModel.xoa(id, taiKhoanId);
  },
};

module.exports = DanhGiaService;
