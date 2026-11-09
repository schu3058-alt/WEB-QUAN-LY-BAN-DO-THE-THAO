const KhuyenMaiModel = require('./khuyenMai.model');

function dangTrongThoiHan(khuyenMai, hienTai) {
  const ngayBatDau = new Date(khuyenMai.ngayBatDau);
  const ngayKetThuc = new Date(khuyenMai.ngayKetThuc);
  if (/^\d{4}-\d{2}-\d{2}$/.test(khuyenMai.ngayKetThuc)) {
    ngayKetThuc.setUTCHours(23, 59, 59, 999);
  }
  return hienTai >= ngayBatDau && hienTai <= ngayKetThuc;
}

const KhuyenMaiService = {
  layTatCa: () => KhuyenMaiModel.layTatCa(),

  taoMoi(duLieu) {
    const daTonTai = KhuyenMaiModel.timTheoMa(duLieu.ma);
    if (daTonTai) {
      const loi = new Error('Mã khuyến mãi đã tồn tại');
      loi.maTrangThai = 409;
      throw loi;
    }
    return KhuyenMaiModel.taoMoi(duLieu);
  },

  apDung(ma, tongTienGoc) {
    const khuyenMai = KhuyenMaiModel.timTheoMa(ma);
    const hienTai = new Date();
    if (!khuyenMai || !dangTrongThoiHan(khuyenMai, hienTai)) {
      const loi = new Error('Mã khuyến mãi không hợp lệ hoặc đã hết hạn');
      loi.maTrangThai = 400;
      throw loi;
    }
    const soTienGiam = (tongTienGoc * khuyenMai.phanTramGiam) / 100;
    return { tongTienGoc, soTienGiam, tongTienSauGiam: tongTienGoc - soTienGiam };
  },

  xoa(id) {
    return KhuyenMaiModel.xoa(id);
  },
};

module.exports = KhuyenMaiService;
