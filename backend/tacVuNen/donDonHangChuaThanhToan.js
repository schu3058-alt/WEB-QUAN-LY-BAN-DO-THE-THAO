const coSoDuLieu = require('../cauHinh/ketNoiCoSoDuLieu');
const { ghiThongTin } = require('../tienIch/ghiNhatKy');

function donDonHangQuaHan(soGioToiDa = 48) {
  if (!Number.isFinite(soGioToiDa) || soGioToiDa < 0) {
    throw new TypeError('So gio qua han phai la mot so khong am');
  }

  const donHangQuaHan = coSoDuLieu.transaction(() => {
    const danhSach = coSoDuLieu.prepare(
      `SELECT id, taiKhoanId
       FROM don_hang
       WHERE trangThai = 'cho_xac_nhan'
         AND datetime(ngayTao, '+' || ? || ' hours') < datetime('now')`
    ).all(soGioToiDa);
    const layChiTiet = coSoDuLieu.prepare(
      'SELECT sanPhamId, soLuong FROM don_hang_chi_tiet WHERE donHangId = ?'
    );
    const capNhatTonKho = coSoDuLieu.prepare(
      'UPDATE san_pham SET soLuongTon = soLuongTon + ? WHERE id = ?'
    );
    const capNhatDonHang = coSoDuLieu.prepare(
      "UPDATE don_hang SET trangThai = 'da_huy' WHERE id = ? AND trangThai = 'cho_xac_nhan'"
    );
    const capNhatThanhToan = coSoDuLieu.prepare(
      "UPDATE thanh_toan SET trangThai = 'that_bai' WHERE donHangId = ? AND trangThai = 'cho_thanh_toan'"
    );
    const taoThongBao = coSoDuLieu.prepare(
      "INSERT INTO thong_bao (taiKhoanId, noiDung, daDoc, ngayTao) VALUES (?, 'Don hang qua han da tu dong huy', 0, datetime('now'))"
    );

    let daHuy = 0;
    danhSach.forEach((donHang) => {
      const capNhat = capNhatDonHang.run(donHang.id);
      if (capNhat.changes !== 1) return;
      layChiTiet.all(donHang.id).forEach((dong) => capNhatTonKho.run(dong.soLuong, dong.sanPhamId));
      capNhatThanhToan.run(donHang.id);
      taoThongBao.run(donHang.taiKhoanId);
      daHuy += 1;
    });
    return daHuy;
  })();

  ghiThongTin(`Da tu dong huy ${donHangQuaHan} don hang qua han va hoan kho`);
  return donHangQuaHan;
}

module.exports = donDonHangQuaHan;
