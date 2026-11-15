const DonHangService = require('../../backend/modules/donHang/donHang.service');
const ThanhToanService = require('../../backend/modules/thanhToan/thanhToan.service');
const KhuyenMaiModel = require('../../backend/modules/khuyenMai/khuyenMai.model');
const coSoDuLieu = require('../../backend/cauHinh/ketNoiCoSoDuLieu');

describe('Nghiep vu - gio hang -> khuyen mai -> dat hang -> thanh toan', () => {
  it('ap dung khuyen mai, dat hang, va thanh toan cap nhat trang thai don hang', () => {
    const taiKhoan = coSoDuLieu.prepare(
      `INSERT INTO tai_khoan (hoTen, email, matKhauMaHoa, vaiTro)
       VALUES ('Khach dat hang', ?, 'hash', 'khach_hang')`
    ).run(`kiem-thu-${Date.now()}@sportshop.vn`);
    const taiKhoanId = taiKhoan.lastInsertRowid;

    const sanPham = coSoDuLieu.prepare(
      `INSERT INTO san_pham (ten, gia, soLuongTon)
       VALUES ('San pham khuyen mai', 200000, 5)`
    ).run();
    const sanPhamId = sanPham.lastInsertRowid;

    const khuyenMai = KhuyenMaiModel.taoMoi({
      ma: 'SALE10',
      phanTramGiam: 10,
      ngayBatDau: '2025-01-01',
      ngayKetThuc: '2035-12-31',
    });

    coSoDuLieu.prepare(
      'INSERT INTO gio_hang_chi_tiet (taiKhoanId, sanPhamId, soLuong) VALUES (?, ?, ?)'
    ).run(taiKhoanId, sanPhamId, 1);

    const donHang = DonHangService.xacNhanDatHang(taiKhoanId, {
      diaChiNhan: '123 Duong Kiem Thu',
      soDienThoaiNhan: '0900000000',
      maKhuyenMai: khuyenMai.ma,
    });

    expect(donHang.tongTien).toBe(180000);
    expect(coSoDuLieu.prepare('SELECT soLuongTon FROM san_pham WHERE id = ?').get(sanPhamId).soLuongTon).toBe(4);

    const thongTinThanhToan = ThanhToanService.taoThanhToan(
      { donHangId: donHang.id, phuongThuc: 'momo', soTien: donHang.tongTien },
      taiKhoanId,
      'khach_hang'
    );

    expect(thongTinThanhToan.soTien).toBe(180000);

    const thanhToanXacNhan = ThanhToanService.xacNhanThanhCong(thongTinThanhToan.id);
    expect(thanhToanXacNhan.trangThai).toBe('da_thanh_toan');

    const donHangCapNhat = DonHangService.layChiTiet(donHang.id, taiKhoanId, 'khach_hang');
    expect(donHangCapNhat.trangThai).toBe('dang_giao');

    coSoDuLieu.prepare('DELETE FROM khuyen_mai WHERE ma = ?').run('SALE10');
    coSoDuLieu.prepare('DELETE FROM don_hang WHERE id = ?').run(donHang.id);
    coSoDuLieu.prepare('DELETE FROM thanh_toan WHERE donHangId = ?').run(donHang.id);
    coSoDuLieu.prepare('DELETE FROM gio_hang_chi_tiet WHERE taiKhoanId = ?').run(taiKhoanId);
    coSoDuLieu.prepare('DELETE FROM tai_khoan WHERE id = ?').run(taiKhoanId);
    coSoDuLieu.prepare('DELETE FROM san_pham WHERE id = ?').run(sanPhamId);
  });
});
