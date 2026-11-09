// Truy van CSDL cho gio_hang va gio_hang_chi_tiet
const coSoDuLieu = require('../../cauHinh/ketNoiCoSoDuLieu');

const GioHangModel = {
  layGioHangTheoTaiKhoan(taiKhoanId) {
    return coSoDuLieu
      .prepare(
        `SELECT ct.id AS chiTietId, ct.soLuong, sp.id AS sanPhamId, sp.ten, sp.gia, sp.hinhAnh
         FROM gio_hang_chi_tiet ct
         JOIN san_pham sp ON sp.id = ct.sanPhamId
         WHERE ct.taiKhoanId = ?`
      )
      .all(taiKhoanId);
  },

  timDong(taiKhoanId, sanPhamId) {
    return coSoDuLieu
      .prepare('SELECT * FROM gio_hang_chi_tiet WHERE taiKhoanId = ? AND sanPhamId = ?')
      .get(taiKhoanId, sanPhamId);
  },

  themSanPham(taiKhoanId, sanPhamId, soLuong) {
    const dongHienCo = this.timDong(taiKhoanId, sanPhamId);
    if (dongHienCo) {
      coSoDuLieu
        .prepare('UPDATE gio_hang_chi_tiet SET soLuong = soLuong + ? WHERE id = ?')
        .run(soLuong, dongHienCo.id);
    } else {
      coSoDuLieu
        .prepare('INSERT INTO gio_hang_chi_tiet (taiKhoanId, sanPhamId, soLuong) VALUES (?, ?, ?)')
        .run(taiKhoanId, sanPhamId, soLuong);
    }
    return this.layGioHangTheoTaiKhoan(taiKhoanId);
  },

  capNhatSoLuong(taiKhoanId, chiTietId, soLuong) {
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
