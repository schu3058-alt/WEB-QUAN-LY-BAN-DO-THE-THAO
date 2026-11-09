// Kiem thu nghiep vu: quy trinh tu gio hang den don hang
const DonHangService = require('../../backend/modules/donHang/donHang.service');
const coSoDuLieu = require('../../backend/cauHinh/ketNoiCoSoDuLieu');

describe('Nghiep vu - dat hang', () => {
  it('tu choi dat hang khi gio hang dang trong', () => {
    expect(() => DonHangService.xacNhanDatHang(999999, {
      diaChiNhan: '123 Duong ABC',
      soDienThoaiNhan: '0900000000',
    })).toThrow('Giỏ hàng đang trống');
  });

  it('khoi phuc ton kho dung mot lan khi don hang cho xac nhan bi huy', () => {
    const taiKhoan = coSoDuLieu.prepare(
      `INSERT INTO tai_khoan (hoTen, email, matKhauMaHoa, vaiTro)
       VALUES ('Khach kiem thu', ?, 'hash', 'khach_hang')`
    ).run(`kiem-thu-${Date.now()}@sportshop.vn`);
    const taiKhoanId = taiKhoan.lastInsertRowid;
    const sanPham = coSoDuLieu.prepare(
      `INSERT INTO san_pham (ten, gia, soLuongTon)
       VALUES ('San pham dat hang test', 10000, 1)`
    ).run();
    const sanPhamId = sanPham.lastInsertRowid;
    coSoDuLieu.prepare(
      'INSERT INTO gio_hang_chi_tiet (taiKhoanId, sanPhamId, soLuong) VALUES (?, ?, 1)'
    ).run(taiKhoanId, sanPhamId);

    let donHangId;
    try {
      const donHang = DonHangService.xacNhanDatHang(taiKhoanId, {
        diaChiNhan: '123 Duong Kiem Thu',
        soDienThoaiNhan: '0900000000',
      });
      donHangId = donHang.id;
      expect(coSoDuLieu.prepare('SELECT soLuongTon FROM san_pham WHERE id = ?').get(sanPhamId).soLuongTon).toBe(0);

      DonHangService.capNhatTrangThai(donHangId, 'da_huy');

      expect(coSoDuLieu.prepare('SELECT soLuongTon FROM san_pham WHERE id = ?').get(sanPhamId).soLuongTon).toBe(1);
      expect(() => DonHangService.capNhatTrangThai(donHangId, 'da_giao')).toThrow('Không thể chuyển đơn hàng');
      expect(coSoDuLieu.prepare('SELECT soLuongTon FROM san_pham WHERE id = ?').get(sanPhamId).soLuongTon).toBe(1);
    } finally {
      if (donHangId) coSoDuLieu.prepare('DELETE FROM don_hang WHERE id = ?').run(donHangId);
      coSoDuLieu.prepare('DELETE FROM tai_khoan WHERE id = ?').run(taiKhoanId);
      coSoDuLieu.prepare('DELETE FROM san_pham WHERE id = ?').run(sanPhamId);
    }
  });
});
