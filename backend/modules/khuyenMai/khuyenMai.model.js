// Truy van CSDL cho bang khuyen_mai (ma giam gia)
const coSoDuLieu = require('../../cauHinh/ketNoiCoSoDuLieu');

const KhuyenMaiModel = {
  layTatCa() {
    return coSoDuLieu.prepare('SELECT * FROM khuyen_mai ORDER BY ngayBatDau DESC').all();
  },

  timTheoMa(ma) {
    return coSoDuLieu.prepare('SELECT * FROM khuyen_mai WHERE ma = ?').get(ma);
  },

  taoMoi({ ma, phanTramGiam, ngayBatDau, ngayKetThuc }) {
    const ketQua = coSoDuLieu
      .prepare(
        `INSERT INTO khuyen_mai (ma, phanTramGiam, ngayBatDau, ngayKetThuc)
         VALUES (?, ?, ?, ?)`
      )
      .run(ma, phanTramGiam, ngayBatDau, ngayKetThuc);
    return coSoDuLieu.prepare('SELECT * FROM khuyen_mai WHERE id = ?').get(ketQua.lastInsertRowid);
  },

  xoa(id) {
    return coSoDuLieu.prepare('DELETE FROM khuyen_mai WHERE id = ?').run(id);
  },
};

module.exports = KhuyenMaiModel;
