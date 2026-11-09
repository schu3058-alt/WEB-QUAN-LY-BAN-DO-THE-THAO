// Truy van CSDL cho bang tai_khoan
const coSoDuLieu = require('../../cauHinh/ketNoiCoSoDuLieu');

const TaiKhoanModel = {
  timTheoEmail(email) {
    return coSoDuLieu.prepare('SELECT * FROM tai_khoan WHERE email = ?').get(email);
  },

  timTheoId(id) {
    return coSoDuLieu
      .prepare('SELECT id, hoTen, email, soDienThoai, vaiTro, ngayTao FROM tai_khoan WHERE id = ?')
      .get(id);
  },

  taoMoi({ hoTen, email, matKhauMaHoa, soDienThoai, vaiTro = 'khach_hang' }) {
    const ketQua = coSoDuLieu
      .prepare(
        `INSERT INTO tai_khoan (hoTen, email, matKhauMaHoa, soDienThoai, vaiTro, ngayTao)
         VALUES (?, ?, ?, ?, ?, datetime('now'))`
      )
      .run(hoTen, email, matKhauMaHoa, soDienThoai, vaiTro);
    return this.timTheoId(ketQua.lastInsertRowid);
  },

  capNhat(id, { hoTen, soDienThoai }) {
    coSoDuLieu
      .prepare('UPDATE tai_khoan SET hoTen = ?, soDienThoai = ? WHERE id = ?')
      .run(hoTen, soDienThoai, id);
    return this.timTheoId(id);
  },
};

module.exports = TaiKhoanModel;
