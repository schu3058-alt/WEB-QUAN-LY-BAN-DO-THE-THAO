const SanPhamModel = require('./sanPham.model');
const DanhMucModel = require('../danhMuc/danhMuc.model');
const lamSachHtml = require('../../tienIch/lamSachHtml');

function kiemTraDanhMuc(danhMucId) {
  if (!DanhMucModel.timTheoId(danhMucId)) {
    const loi = new Error('Không tìm thấy danh mục sản phẩm');
    loi.maTrangThai = 400;
    throw loi;
  }
}

function kiemTraTonTai(id) {
  const sanPham = SanPhamModel.timTheoId(id);
  if (!sanPham) {
    const loi = new Error('Không tìm thấy sản phẩm');
    loi.maTrangThai = 404;
    throw loi;
  }
  return sanPham;
}

const SanPhamService = {
  timKiem: (dieuKien) => SanPhamModel.timKiem(dieuKien),
  timKiemQuanTri(dieuKien) {
    return SanPhamModel.timKiem({ ...dieuKien, trangThai: 'tat_ca' });
  },
  layTheoId(id) {
    const sanPham = kiemTraTonTai(id);
    if (sanPham.trangThai !== 'dang_ban') {
      const loi = new Error('Không tìm thấy sản phẩm');
      loi.maTrangThai = 404;
      throw loi;
    }
    return sanPham;
  },

  taoMoi(duLieu) {
    kiemTraDanhMuc(duLieu.danhMucId);
    return SanPhamModel.taoMoi({ ...duLieu, moTa: lamSachHtml(duLieu.moTa) });
  },

  capNhat(id, duLieu) {
    kiemTraTonTai(id);
    kiemTraDanhMuc(duLieu.danhMucId);
    return SanPhamModel.capNhat(id, { ...duLieu, moTa: lamSachHtml(duLieu.moTa) });
  },

  ngungKinhDoanh(id) {
    kiemTraTonTai(id);
    return SanPhamModel.capNhatTrangThai(id, 'ngung_kinh_doanh');
  },
};

module.exports = SanPhamService;
