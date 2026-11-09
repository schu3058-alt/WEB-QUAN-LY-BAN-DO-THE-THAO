// Tac vu nen chay dinh ky (vi du moi dem) de tong hop doanh thu trong ngay
const coSoDuLieu = require('../cauHinh/ketNoiCoSoDuLieu');
const { ghiThongTin } = require('../tienIch/ghiNhatKy');

function tongHopDoanhThuHomNay(ngay) {
  const ketQua = coSoDuLieu
    .prepare(
      `SELECT COUNT(*) AS soDonHang, COALESCE(SUM(tongTien), 0) AS tongDoanhThu
       FROM don_hang
       WHERE date(ngayTao) = COALESCE(date(?), date('now')) AND trangThai != 'da_huy'`
    )
    .get(ngay || null);

  ghiThongTin(`Tong hop doanh thu ${ngay || 'hom nay'}: ${ketQua.soDonHang} don, ${ketQua.tongDoanhThu} VND`);
  return ketQua;
}

module.exports = tongHopDoanhThuHomNay;
