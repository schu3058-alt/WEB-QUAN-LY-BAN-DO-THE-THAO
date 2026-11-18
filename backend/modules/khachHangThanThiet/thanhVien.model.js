const coSoDuLieu = require('../../cauHinh/ketNoiCoSoDuLieu');

const thanhVienModel = {
  tichDiemTuDonHang(taiKhoanId, donHangId, tongTienThanhToan) {
    const tk = coSoDuLieu.prepare(`
      SELECT tk.id, tk.diemTichLuy, h.tiLeTichDiem
      FROM tai_khoan tk
      JOIN hang_thanh_vien h ON tk.hangThanhVienId = h.id
      WHERE tk.id = ?
    `).get(taiKhoanId);

    if (!tk) return;

    const diemCong = Math.floor((tongTienThanhToan / 100000) * 10 * tk.tiLeTichDiem);
    if (diemCong <= 0) return;

    const tongDiemMoi = tk.diemTichLuy + diemCong;

    const hangMoi = coSoDuLieu
      .prepare('SELECT id FROM hang_thanh_vien WHERE diemToiThieu <= ? ORDER BY diemToiThieu DESC LIMIT 1')
      .get(tongDiemMoi);

    coSoDuLieu
      .prepare('UPDATE tai_khoan SET diemTichLuy = ?, hangThanhVienId = ? WHERE id = ?')
      .run(tongDiemMoi, hangMoi.id, taiKhoanId);

    coSoDuLieu.prepare(`
      INSERT INTO lich_su_tich_diem (taiKhoanId, donHangId, soDiemThayDoi, loaiGiaoDich, moTa)
      VALUES (?, ?, ?, 'TICH_DIEM_DON_HANG', ?)
    `).run(taiKhoanId, donHangId, diemCong, `Tích điểm hoàn thành đơn hàng #${donHangId}`);
  },

  doiDiemLayVoucher(taiKhoanId, khuyenMaiId) {
    const thucHien = coSoDuLieu.transaction(() => {
      const tk = coSoDuLieu.prepare('SELECT diemTichLuy FROM tai_khoan WHERE id = ?').get(taiKhoanId);
      const km = coSoDuLieu
        .prepare('SELECT * FROM khuyen_mai WHERE id = ? AND diemCanDoi IS NOT NULL AND diemCanDoi > 0')
        .get(khuyenMaiId);

      if (!km) throw new Error('Voucher này không thuộc danh mục đổi điểm');
      if (!tk || tk.diemTichLuy < km.diemCanDoi) {
        throw new Error('Bạn không đủ điểm tích lũy để đổi voucher này');
      }

      const maRieng = `${km.maKhuyenMai}-${taiKhoanId}-${Math.floor(1000 + Math.random() * 9000)}`;

      coSoDuLieu
        .prepare('UPDATE tai_khoan SET diemTichLuy = diemTichLuy - ? WHERE id = ?')
        .run(km.diemCanDoi, taiKhoanId);

      coSoDuLieu.prepare(`
        INSERT INTO lich_su_tich_diem (taiKhoanId, soDiemThayDoi, loaiGiaoDich, moTa)
        VALUES (?, ?, 'DOI_VOUCHER', ?)
      `).run(taiKhoanId, -km.diemCanDoi, `Đổi điểm lấy mã ${maRieng}`);

      const kmMoiInfo = coSoDuLieu.prepare(`
        INSERT INTO khuyen_mai (maKhuyenMai, tenKhuyenMai, loaiGiam, giaTriGiam, soLuong, gioiHanMoiKhach, ngayBatDau, ngayKetThuc)
        VALUES (?, ?, ?, ?, 1, 1, datetime('now'), ?)
      `).run(maRieng, `[Đổi điểm] ${km.tenKhuyenMai}`, km.loaiGiam, km.giaTriGiam, km.ngayKetThuc);

      return coSoDuLieu.prepare('SELECT * FROM khuyen_mai WHERE id = ?').get(kmMoiInfo.lastInsertRowid);
    });

    return thucHien();
  }
};

module.exports = thanhVienModel;