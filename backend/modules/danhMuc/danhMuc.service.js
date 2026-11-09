const DanhMucModel = require('./danhMuc.model');

function kiemTraTonTai(id) {
  const danhMuc = DanhMucModel.timTheoId(id);
  if (!danhMuc) {
    const loi = new Error('Không tìm thấy danh mục');
    loi.maTrangThai = 404;
    throw loi;
  }
  return danhMuc;
}

const DanhMucService = {
  layTatCa: () => DanhMucModel.layTatCa(),
  layTheoId: (id) => kiemTraTonTai(id),
  taoMoi(duLieu) {
    if (DanhMucModel.timTheoSlug(duLieu.slug)) {
      const loi = new Error('Đường dẫn danh mục đã được sử dụng');
      loi.maTrangThai = 409;
      throw loi;
    }
    return DanhMucModel.taoMoi(duLieu);
  },
  capNhat(id, duLieu) {
    kiemTraTonTai(id);
    const danhMucCungSlug = DanhMucModel.timTheoSlug(duLieu.slug);
    if (danhMucCungSlug && danhMucCungSlug.id !== Number(id)) {
      const loi = new Error('Đường dẫn danh mục đã được sử dụng');
      loi.maTrangThai = 409;
      throw loi;
    }
    return DanhMucModel.capNhat(id, duLieu);
  },
  xoa(id) {
    kiemTraTonTai(id);
    return DanhMucModel.xoa(id);
  },
};

module.exports = DanhMucService;
