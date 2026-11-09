// Truy van tong hop (doanh thu, so don hang) tu bang don_hang
const coSoDuLieu = require('../../cauHinh/ketNoiCoSoDuLieu');

const BaoCaoModel = {
  doanhThuTheoNgay(tuNgay, denNgay) {
    return coSoDuLieu
      .prepare(
        `SELECT date(ngayTao) AS ngay, SUM(tongTien) AS doanhThu, COUNT(*) AS soDonHang
         FROM don_hang
         WHERE trangThai != 'da_huy' AND date(ngayTao) BETWEEN ? AND ?
         GROUP BY date(ngayTao)
         ORDER BY ngay ASC`
      )
      .all(tuNgay, denNgay);
  },

  thongKeTheoTrangThai() {
    return coSoDuLieu
      .prepare('SELECT trangThai, COUNT(*) AS soLuong FROM don_hang GROUP BY trangThai')
      .all();
  },

  sanPhamBanChay(soLuongTop = 5) {
    return coSoDuLieu
      .prepare(
        `SELECT sp.id, sp.ten, SUM(ct.soLuong) AS tongSoLuongBan
         FROM don_hang_chi_tiet ct
        JOIN don_hang dh ON dh.id = ct.donHangId AND dh.trangThai != 'da_huy'
        JOIN san_pham sp ON sp.id = ct.sanPhamId
         GROUP BY sp.id
         ORDER BY tongSoLuongBan DESC
         LIMIT ?`
      )
      .all(soLuongTop);
  },
};

module.exports = BaoCaoModel;
