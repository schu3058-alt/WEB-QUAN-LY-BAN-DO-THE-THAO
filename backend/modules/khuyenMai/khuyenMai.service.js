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
    const ma = String(duLieu.ma || '').trim().toUpperCase();
    const daTonTai = KhuyenMaiModel.timTheoMa(ma);
    if (daTonTai) {
      const loi = new Error('Mã khuyến mãi đã tồn tại');
      loi.maTrangThai = 409;
      throw loi;
    }
    return KhuyenMaiModel.taoMoi({ ...duLieu, ma });
  },

  apDung(ma, tongTienGoc) {
    const maKhuyenMai = String(ma || '').trim().toUpperCase();
    const tongTien = Number(tongTienGoc);
    if (!maKhuyenMai) {
      const loi = new Error('Thiếu mã khuyến mãi');
      loi.maTrangThai = 400;
      throw loi;
    }
    if (!Number.isFinite(tongTien) || tongTien <= 0) {
      const loi = new Error('Tổng tiền đơn hàng không hợp lệ');
      loi.maTrangThai = 400;
      throw loi;
    }

    const khuyenMai = KhuyenMaiModel.timTheoMa(maKhuyenMai);
    const hienTai = new Date();
    if (!khuyenMai || !dangTrongThoiHan(khuyenMai, hienTai)) {
      const loi = new Error('Mã khuyến mãi không hợp lệ hoặc đã hết hạn');
      loi.maTrangThai = 400;
      throw loi;
    }

    const soTienGiam = (tongTien * khuyenMai.phanTramGiam) / 100;
    return {
      ma: maKhuyenMai,
      tongTienGoc: tongTien,
      soTienGiam,
      tongTienSauGiam: tongTien - soTienGiam,
    };
  },

  xoa(id) {
    return KhuyenMaiModel.xoa(id);
  },
};

module.exports = KhuyenMaiService;
