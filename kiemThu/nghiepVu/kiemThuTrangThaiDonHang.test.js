const DonHangService = require('../../backend/modules/donHang/donHang.service');
const coSoDuLieu = require('../../backend/cauHinh/ketNoiCoSoDuLieu');

describe('Nghiep vu - trang thai don hang', () => {
  it('quan_tri co the cap nhat trang thai don hang hop le va khong cho phep chuyen sai', () => {
    const taiKhoan = coSoDuLieu.prepare(
      `INSERT INTO tai_khoan (hoTen, email, matKhauMaHoa, vaiTro)
       VALUES ('Admin test', ?, 'hash', 'khach_hang')`
    ).run(`donhang-status-${Date.now()}@sportshop.vn`);
    const taiKhoanId = taiKhoan.lastInsertRowid;

    const sanPham = coSoDuLieu.prepare(
      `INSERT INTO san_pham (ten, gia, soLuongTon)
       VALUES ('San pham status', 100000, 2)`
    ).run();
    const sanPhamId = sanPham.lastInsertRowid;

    coSoDuLieu.prepare(
      'INSERT INTO gio_hang_chi_tiet (taiKhoanId, sanPhamId, soLuong) VALUES (?, ?, 1)'
    ).run(taiKhoanId, sanPhamId);

    const donHang = DonHangService.xacNhanDatHang(taiKhoanId, {
      diaChiNhan: '123 Duong Trang Thai',
      soDienThoaiNhan: '0900000000',
    });

    expect(donHang.trangThai).toBe('cho_xac_nhan');
    expect(DonHangService.capNhatTrangThai(donHang.id, 'dang_giao').trangThai).toBe('dang_giao');
    expect(() => DonHangService.capNhatTrangThai(donHang.id, 'da_huy')).toThrow('Không thể chuyển đơn hàng');

    coSoDuLieu.prepare('DELETE FROM don_hang WHERE id = ?').run(donHang.id);
    coSoDuLieu.prepare('DELETE FROM gio_hang_chi_tiet WHERE taiKhoanId = ?').run(taiKhoanId);
    coSoDuLieu.prepare('DELETE FROM tai_khoan WHERE id = ?').run(taiKhoanId);
    coSoDuLieu.prepare('DELETE FROM san_pham WHERE id = ?').run(sanPhamId);
  });
});
