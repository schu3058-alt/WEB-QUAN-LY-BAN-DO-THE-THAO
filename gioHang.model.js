// Truy van CSDL cho gio_hang va gio_hang_chi_tiet (Chuan Bien The SQLite)
const coSoDuLieu = require('../../cauHinh/ketNoiCoSoDuLieu');

const GioHangModel = {
  layGioHangTheoTaiKhoan(taiKhoanId) {
    return coSoDuLieu
      .prepare(
        `SELECT ct.id AS chiTietId, ct.soLuong, 
                bt.id AS bienTheId, bt.sku, bt.kichCo, bt.mauSac, 
                COALESCE(bt.giaKhuyenMai, bt.giaBan) AS gia, 
                COALESCE(bt.hinhAnhUrl, sp.hinhAnh) AS hinhAnh,
                sp.id AS sanPhamId, sp.ten
         FROM gio_hang_chi_tiet ct
         JOIN bien_the_san_pham bt ON bt.id = ct.bienTheId
         JOIN san_pham sp ON sp.id = bt.sanPhamId
         WHERE ct.taiKhoanId = ?`
      )
      .all(taiKhoanId);
  },

  timDong(taiKhoanId, bienTheId) {
    return coSoDuLieu
      .prepare('SELECT * FROM gio_hang_chi_tiet WHERE taiKhoanId = ? AND bienTheId = ?')
      .get(taiKhoanId, bienTheId);
  },

  themSanPham(taiKhoanId, bienTheId, soLuong) {
    // 1. Kiểm tra tồn kho và trạng thái của biến thể
    const bienThe = coSoDuLieu
      .prepare('SELECT id, soLuongTon, trangThai FROM bien_the_san_pham WHERE id = ?')
      .get(bienTheId);

    if (!bienThe || bienThe.trangThai !== 1) {
      const loi = new Error('Phân loại sản phẩm này không tồn tại hoặc đã ngừng kinh doanh');
      loi.maTrangThai = 404;
      throw loi;
    }

    // 2. Kiểm tra dòng trong giỏ hàng hiện tại
    const dongHienCo = this.timDong(taiKhoanId, bienTheId);
    const soLuongMoi = dongHienCo ? dongHienCo.soLuong + Number(soLuong) : Number(soLuong);

    if (soLuongMoi > bienThe.soLuongTon) {
      const loi = new Error(`Số lượng yêu cầu (${soLuongMoi}) vượt quá tồn kho hiện tại (${bienThe.soLuongTon}) của phân loại này`);
      loi.maTrangThai = 409;
      throw loi;
    }

    if (dongHienCo) {
      coSoDuLieu
        .prepare('UPDATE gio_hang_chi_tiet SET soLuong = ? WHERE id = ?')
        .run(soLuongMoi, dongHienCo.id);
    } else {
      coSoDuLieu
        .prepare('INSERT INTO gio_hang_chi_tiet (taiKhoanId, bienTheId, soLuong) VALUES (?, ?, ?)')
        .run(taiKhoanId, bienTheId, soLuong);
    }

    return this.layGioHangTheoTaiKhoan(taiKhoanId);
  },

  capNhatSoLuong(taiKhoanId, chiTietId, soLuong) {
    // Lấy thông tin biến thể từ chi tiết giỏ hàng để kiểm tra tồn kho
    const chiTiet = coSoDuLieu
      .prepare('SELECT bienTheId FROM gio_hang_chi_tiet WHERE id = ? AND taiKhoanId = ?')
      .get(chiTietId, taiKhoanId);

    if (!chiTiet) {
      const loi = new Error('Không tìm thấy sản phẩm trong giỏ hàng');
      loi.maTrangThai = 404;
      throw loi;
    }

    const bienThe = coSoDuLieu
      .prepare('SELECT soLuongTon FROM bien_the_san_pham WHERE id = ?')
      .get(chiTiet.bienTheId);

    if (Number(soLuong) > bienThe.soLuongTon) {
      const loi = new Error(`Số lượng vượt quá tồn kho hiện tại (${bienThe.soLuongTon}) của phân loại này`);
      loi.maTrangThai = 409;
      throw loi;
    }

    coSoDuLieu
      .prepare('UPDATE gio_hang_chi_tiet SET soLuong = ? WHERE id = ? AND taiKhoanId = ?')
      .run(soLuong, chiTietId, taiKhoanId);

    return this.layGioHangTheoTaiKhoan(taiKhoanId);
  },

  xoaDong(taiKhoanId, chiTietId) {
    coSoDuLieu
      .prepare('DELETE FROM gio_hang_chi_tiet WHERE id = ? AND taiKhoanId = ?')
      .run(chiTietId, taiKhoanId);
    return this.layGioHangTheoTaiKhoan(taiKhoanId);
  },

  xoaToanBo(taiKhoanId) {
    coSoDuLieu.prepare('DELETE FROM gio_hang_chi_tiet WHERE taiKhoanId = ?').run(taiKhoanId);
  },
};

module.exports = GioHangModel;  