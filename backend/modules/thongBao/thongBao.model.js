// Truy van CSDL cho bang thong_bao (thong bao gui cho tai khoan, vi du cap nhat trang thai don hang)
const coSoDuLieu = require('../../cauHinh/ketNoiCoSoDuLieu');

const ThongBaoModel = {
  layTheoTaiKhoan(taiKhoanId) {
    return coSoDuLieu
      .prepare('SELECT * FROM thong_bao WHERE taiKhoanId = ? ORDER BY ngayTao DESC')
      .all(taiKhoanId);
  },

  taoMoi({ taiKhoanId, noiDung }) {
    const ketQua = coSoDuLieu
      .prepare(
        `INSERT INTO thong_bao (taiKhoanId, noiDung, daDoc, ngayTao)
         VALUES (?, ?, 0, datetime('now'))`
      )
      .run(taiKhoanId, noiDung);
    return coSoDuLieu.prepare('SELECT * FROM thong_bao WHERE id = ?').get(ketQua.lastInsertRowid);
  },

  danhDauDaDoc(id, taiKhoanId) {
    coSoDuLieu
      .prepare('UPDATE thong_bao SET daDoc = 1 WHERE id = ? AND taiKhoanId = ?')
      .run(id, taiKhoanId);
  },
};

module.exports = ThongBaoModel;
