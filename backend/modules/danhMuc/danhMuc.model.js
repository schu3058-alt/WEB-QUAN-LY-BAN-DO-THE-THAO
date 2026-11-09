// Truy van CSDL cho bang danh_muc
const coSoDuLieu = require('../../cauHinh/ketNoiCoSoDuLieu');

const DanhMucModel = {
  layTatCa() {
    return coSoDuLieu.prepare('SELECT * FROM danh_muc ORDER BY ten ASC').all();
  },

  timTheoId(id) {
    return coSoDuLieu.prepare('SELECT * FROM danh_muc WHERE id = ?').get(id);
  },

  timTheoSlug(slug) {
    return coSoDuLieu.prepare('SELECT * FROM danh_muc WHERE slug = ?').get(slug);
  },

  taoMoi({ ten, moTa, slug }) {
    const ketQua = coSoDuLieu
      .prepare('INSERT INTO danh_muc (ten, moTa, slug) VALUES (?, ?, ?)')
      .run(ten, moTa, slug);
    return this.timTheoId(ketQua.lastInsertRowid);
  },

  capNhat(id, { ten, moTa, slug }) {
    coSoDuLieu
      .prepare('UPDATE danh_muc SET ten = ?, moTa = ?, slug = ? WHERE id = ?')
      .run(ten, moTa, slug, id);
    return this.timTheoId(id);
  },

  xoa(id) {
    return coSoDuLieu.prepare('DELETE FROM danh_muc WHERE id = ?').run(id);
  },
};

module.exports = DanhMucModel;
