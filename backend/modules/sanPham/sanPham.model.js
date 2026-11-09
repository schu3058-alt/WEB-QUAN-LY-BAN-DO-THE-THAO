// Truy van CSDL cho bang san_pham
const coSoDuLieu = require('../../cauHinh/ketNoiCoSoDuLieu');

const SanPhamModel = {
  timKiem({ tuKhoa, danhMucId, trangThai, trang = 1, soLuongMoiTrang = 20 }) {
    const dieuKien = [];
    const thamSo = [];

    if (tuKhoa) {
      dieuKien.push('sp.ten LIKE ?');
      thamSo.push(`%${tuKhoa}%`);
    }
    if (danhMucId) {
      dieuKien.push('sp.danhMucId = ?');
      thamSo.push(danhMucId);
    }
    if (trangThai && trangThai !== 'tat_ca') {
      dieuKien.push('sp.trangThai = ?');
      thamSo.push(trangThai);
    } else if (!trangThai) {
      dieuKien.push("sp.trangThai = 'dang_ban'");
    }

    const whereSql = dieuKien.length ? `WHERE ${dieuKien.join(' AND ')}` : '';
    const offset = (trang - 1) * soLuongMoiTrang;

    const danhSach = coSoDuLieu
      .prepare(
        `SELECT sp.*, dm.ten AS tenDanhMuc
         FROM san_pham sp
         LEFT JOIN danh_muc dm ON dm.id = sp.danhMucId
         ${whereSql}
         ORDER BY sp.ngayTao DESC
         LIMIT ? OFFSET ?`
      )
      .all(...thamSo, soLuongMoiTrang, offset);

    const { tongSo } = coSoDuLieu
      .prepare(`SELECT COUNT(*) AS tongSo FROM san_pham sp ${whereSql}`)
      .get(...thamSo);

    return { danhSach, tongSo, trang: Number(trang), soLuongMoiTrang };
  },

  timTheoId(id) {
    return coSoDuLieu
      .prepare(
        `SELECT sp.*, dm.ten AS tenDanhMuc
         FROM san_pham sp
         LEFT JOIN danh_muc dm ON dm.id = sp.danhMucId
         WHERE sp.id = ?`
      )
      .get(id);
  },

  taoMoi({ ten, moTa, gia, soLuongTon, danhMucId, hinhAnh }) {
    const ketQua = coSoDuLieu
      .prepare(
        `INSERT INTO san_pham (ten, moTa, gia, soLuongTon, danhMucId, hinhAnh, trangThai, ngayTao)
         VALUES (?, ?, ?, ?, ?, ?, 'dang_ban', datetime('now'))`
      )
      .run(ten, moTa, gia, soLuongTon, danhMucId, hinhAnh);
    return this.timTheoId(ketQua.lastInsertRowid);
  },

  capNhat(id, { ten, moTa, gia, soLuongTon, danhMucId, hinhAnh }) {
    coSoDuLieu
      .prepare(
        `UPDATE san_pham
         SET ten = ?, moTa = ?, gia = ?, soLuongTon = ?, danhMucId = ?, hinhAnh = ?
         WHERE id = ?`
      )
      .run(ten, moTa, gia, soLuongTon, danhMucId, hinhAnh, id);
    return this.timTheoId(id);
  },

  capNhatTrangThai(id, trangThai) {
    coSoDuLieu.prepare('UPDATE san_pham SET trangThai = ? WHERE id = ?').run(trangThai, id);
    return this.timTheoId(id);
  },

  giamSoLuongTon(id, soLuong) {
    const ketQua = coSoDuLieu
      .prepare('UPDATE san_pham SET soLuongTon = soLuongTon - ? WHERE id = ? AND soLuongTon >= ?')
      .run(soLuong, id, soLuong);
    if (ketQua.changes !== 1) {
      const loi = new Error('Số lượng tồn kho không đủ để đặt hàng');
      loi.maTrangThai = 409;
      throw loi;
    }
  },

  tangSoLuongTon(id, soLuong) {
    coSoDuLieu
      .prepare('UPDATE san_pham SET soLuongTon = soLuongTon + ? WHERE id = ?')
      .run(soLuong, id);
  },
};

module.exports = SanPhamModel;
