// Nghiep vu khuyen mai va ap dung voucher (Chuan SQLite 3)
const coSoDuLieu = require('../../cauHinh/ketNoiCoSoDuLieu');
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

  apDung(ma, tongTienGoc, taiKhoanId = null) {
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
    
    // 1. Kiểm tra tồn tại, thời hạn và số lượng còn lại của voucher
    if (!khuyenMai || !dangTrongThoiHan(khuyenMai, hienTai) || khuyenMai.soLuong <= 0) {
      const loi = new Error('Mã khuyến mãi không hợp lệ hoặc đã hết hạn');
      loi.maTrangThai = 400;
      throw loi;
    }

    // 2. Kiểm tra giới hạn số lần sử dụng của riêng khách hàng này (nếu có truyền taiKhoanId)
    if (taiKhoanId) {
      const soLanDaDung = coSoDuLieu.prepare(`
        SELECT COUNT(*) AS count 
        FROM lich_su_su_dung_voucher 
        WHERE khuyenMaiId = ? AND taiKhoanId = ?
      `).get(khuyenMai.id, taiKhoanId).count;

      const gioiHanMoiKhach = khuyenMai.gioiHanMoiKhach !== undefined ? khuyenMai.gioiHanMoiKhach : 1;
      if (soLanDaDung >= gioiHanMoiKhach) {
        const loi = new Error('Bạn đã hết lượt sử dụng mã giảm giá này');
        loi.maTrangThai = 403;
        throw loi;
      }

      // 3. Kiểm tra hạng thành viên tối thiểu yêu cầu (nếu voucher có quy định)
      if (khuyenMai.hangToiThieuId) {
        const thanhVien = coSoDuLieu.prepare(`
          SELECT hangThanhVienId 
          FROM tai_khoan 
          WHERE id = ?
        `).get(taiKhoanId);

        if (!thanhVien || thanhVien.hangThanhVienId < khuyenMai.hangToiThieuId) {
          const loi = new Error('Hạng thành viên của bạn chưa đủ điều kiện để sử dụng mã giảm giá này');
          loi.maTrangThai = 403;
          throw loi;
        }
      }
    }

    // Tính toán số tiền giảm (hỗ trợ cả phanTramGiam hoặc giaTriGiam tuỳ cấu trúc model)
    const phanTram = khuyenMai.phanTramGiam !== undefined ? khuyenMai.phanTramGiam : (khuyenMai.giaTriGiam || 0);
    const soTienGiam = khuyenMai.phanTramGiam !== undefined 
      ? (tongTien * phanTram) / 100 
      : Math.min(tongTien, phanTram);

    return {
      id: khuyenMai.id,
      ma: maKhuyenMai,
      tongTienGoc: tongTien,
      soTienGiam,
      tongTienSauGiam: Math.max(0, tongTien - soTienGiam),
    };
  },

  xoa(id) {
    return KhuyenMaiModel.xoa(id);
  },
};

module.exports = KhuyenMaiService;