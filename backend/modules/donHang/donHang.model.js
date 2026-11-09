// Truy van CSDL cho don_hang va don_hang_chi_tiet
const coSoDuLieu = require('../../cauHinh/ketNoiCoSoDuLieu');

const DonHangModel = {
  taoDonHang({ taiKhoanId, diaChiNhan, soDienThoaiNhan, ghiChu, tongTien }) {
    const ketQua = coSoDuLieu
      .prepare(
        `INSERT INTO don_hang (taiKhoanId, diaChiNhan, soDienThoaiNhan, ghiChu, tongTien, trangThai, ngayTao)
         VALUES (?, ?, ?, ?, ?, 'cho_xac_nhan', datetime('now'))`
      )
      .run(taiKhoanId, diaChiNhan, soDienThoaiNhan, ghiChu, tongTien);
    return ketQua.lastInsertRowid;
  },

  themChiTiet(donHangId, { sanPhamId, soLuong, donGia }) {
    coSoDuLieu
      .prepare(
        `INSERT INTO don_hang_chi_tiet (donHangId, sanPhamId, soLuong, donGia)
         VALUES (?, ?, ?, ?)`
      )
      .run(donHangId, sanPhamId, soLuong, donGia);
  },

  timTheoId(id) {
    const donHang = coSoDuLieu.prepare('SELECT * FROM don_hang WHERE id = ?').get(id);
    if (!donHang) return null;
    donHang.chiTiet = coSoDuLieu
      .prepare(
        `SELECT ct.*, sp.ten, sp.hinhAnh
         FROM don_hang_chi_tiet ct
         JOIN san_pham sp ON sp.id = ct.sanPhamId
         WHERE ct.donHangId = ?`
      )
      .all(id);
    return donHang;
  },

  layTheoTaiKhoan(taiKhoanId) {
    return coSoDuLieu
      .prepare('SELECT * FROM don_hang WHERE taiKhoanId = ? ORDER BY ngayTao DESC')
      .all(taiKhoanId);
  },

  layTatCa({ trangThai } = {}) {
    if (trangThai) {
      return coSoDuLieu
        .prepare(`SELECT dh.*, tk.hoTen AS tenKhachHang, tk.email
                  FROM don_hang dh JOIN tai_khoan tk ON tk.id = dh.taiKhoanId
                  WHERE dh.trangThai = ? ORDER BY dh.ngayTao DESC`)
        .all(trangThai);
    }
    return coSoDuLieu
      .prepare(`SELECT dh.*, tk.hoTen AS tenKhachHang, tk.email
                FROM don_hang dh JOIN tai_khoan tk ON tk.id = dh.taiKhoanId
                ORDER BY dh.ngayTao DESC`)
      .all();
  },

  capNhatTrangThai(id, trangThai) {
    coSoDuLieu.prepare('UPDATE don_hang SET trangThai = ? WHERE id = ?').run(trangThai, id);
    return this.timTheoId(id);
  },
};

module.exports = DonHangModel;
