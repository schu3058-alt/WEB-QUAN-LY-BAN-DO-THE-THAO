// Truy van CSDL cho bang thanh_toan (ghi nhan phuong thuc & trang thai thanh toan cua don hang)
const coSoDuLieu = require('../../cauHinh/ketNoiCoSoDuLieu');

const ThanhToanModel = {
  taoBanGhi({ donHangId, phuongThuc, soTien }) {
    const ketQua = coSoDuLieu
      .prepare(
        `INSERT INTO thanh_toan (donHangId, phuongThuc, soTien, trangThai, ngayTao)
         VALUES (?, ?, ?, 'cho_thanh_toan', datetime('now'))`
      )
      .run(donHangId, phuongThuc, soTien);
    return this.timTheoId(ketQua.lastInsertRowid);
  },

  timTheoId(id) {
    return coSoDuLieu.prepare('SELECT * FROM thanh_toan WHERE id = ?').get(id);
  },

  timTheoDonHang(donHangId) {
    return coSoDuLieu.prepare('SELECT * FROM thanh_toan WHERE donHangId = ?').get(donHangId);
  },

  capNhatTrangThai(id, trangThai) {
    coSoDuLieu.prepare('UPDATE thanh_toan SET trangThai = ? WHERE id = ?').run(trangThai, id);
    return this.timTheoId(id);
  },
};

module.exports = ThanhToanModel;
