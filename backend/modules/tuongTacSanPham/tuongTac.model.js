const coSoDuLieu = require('../../cauHinh/ketNoiCoSoDuLieu');

const tuongTacModel = {
  chuyenDoiYeuThich(taiKhoanId, sanPhamId) {
    const daCo = coSoDuLieu
      .prepare('SELECT 1 FROM san_pham_yeu_thich WHERE taiKhoanId = ? AND sanPhamId = ?')
      .get(taiKhoanId, sanPhamId);

    if (daCo) {
      coSoDuLieu
        .prepare('DELETE FROM san_pham_yeu_thich WHERE taiKhoanId = ? AND sanPhamId = ?')
        .run(taiKhoanId, sanPhamId);
      return { daYeuThich: false };
    }

    coSoDuLieu
      .prepare('INSERT INTO san_pham_yeu_thich (taiKhoanId, sanPhamId) VALUES (?, ?)')
      .run(taiKhoanId, sanPhamId);
    return { daYeuThich: true };
  },

  ghiNhanVuaXem(taiKhoanId, sanPhamId) {
    coSoDuLieu.prepare(`
      INSERT INTO lich_su_xem_san_pham (taiKhoanId, sanPhamId, soLanXem, lanXemCuoi)
      VALUES (?, ?, 1, datetime('now'))
      ON CONFLICT(taiKhoanId, sanPhamId) DO UPDATE SET
        soLanXem = soLanXem + 1,
        lanXemCuoi = datetime('now')
    `).run(taiKhoanId, sanPhamId);
  },

  laySanPhamVuaXem(taiKhoanId) {
    return coSoDuLieu.prepare(`
      SELECT sp.*, ls.lanXemCuoi, th.tenThuongHieu, mt.tenMon AS tenMonTheThao
      FROM lich_su_xem_san_pham ls
      JOIN san_pham sp ON ls.sanPhamId = sp.id
      LEFT JOIN thuong_hieu th ON sp.thuongHieuId = th.id
      LEFT JOIN mon_the_thao mt ON sp.monTheThaoId = mt.id
      WHERE ls.taiKhoanId = ?
      ORDER BY ls.lanXemCuoi DESC
      LIMIT 12
    `).all(taiKhoanId);
  },

  soSanhSanPham(danhSachIds) {
    const idsSach = danhSachIds.map(Number).filter(Boolean).slice(0, 4);
    if (idsSach.length < 2) {
      throw new Error('Cần chọn ít nhất 2 sản phẩm để so sánh');
    }
    const placeholders = idsSach.map(() => '?').join(',');

    return coSoDuLieu.prepare(`
      SELECT sp.id, sp.ten, sp.moTa, sp.gia, sp.hinhAnh,
             th.tenThuongHieu, mt.tenMon AS tenMonTheThao, dm.ten AS tenDanhMuc,
             (SELECT MIN(giaBan) FROM bien_the_san_pham WHERE sanPhamId = sp.id) AS giaThapNhat,
             (SELECT MAX(giaBan) FROM bien_the_san_pham WHERE sanPhamId = sp.id) AS giaCaoNhat,
             (SELECT GROUP_CONCAT(DISTINCT kichCo) FROM bien_the_san_pham WHERE sanPhamId = sp.id) AS cacKichCo,
             (SELECT GROUP_CONCAT(DISTINCT mauSac) FROM bien_the_san_pham WHERE sanPhamId = sp.id) AS cacMauSac,
             (SELECT IFNULL(AVG(soSao), 0) FROM danh_gia WHERE sanPhamId = sp.id) AS diemDanhGiaTB
      FROM san_pham sp
      LEFT JOIN thuong_hieu th ON sp.thuongHieuId = th.id
      LEFT JOIN mon_the_thao mt ON sp.monTheThaoId = mt.id
      LEFT JOIN danh_muc dm ON sp.danhMucId = dm.id
      WHERE sp.id IN (${placeholders})
    `).all(...idsSach);
  },

  goiYSanPham(sanPhamId) {
    return coSoDuLieu.prepare(`
      SELECT sp.*,
        (CASE WHEN sp.monTheThaoId = goc.monTheThaoId THEN 3 ELSE 0 END +
         CASE WHEN sp.thuongHieuId = goc.thuongHieuId THEN 2 ELSE 0 END +
         CASE WHEN sp.danhMucId = goc.danhMucId THEN 1 ELSE 0 END) AS diemTuongDong
      FROM san_pham sp
      CROSS JOIN (SELECT monTheThaoId, thuongHieuId, danhMucId FROM san_pham WHERE id = ?) goc
      WHERE sp.id <> ? AND sp.trangThai = 'dang_ban'
      ORDER BY diemTuongDong DESC, sp.id DESC
      LIMIT 8
    `).all(sanPhamId, sanPhamId);
  }
};

module.exports = tuongTacModel;