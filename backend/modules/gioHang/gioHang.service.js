const GioHangModel = require('./gioHang.model');
const SanPhamModel = require('../sanPham/sanPham.model');

function tinhTongTien(danhSach) {
  return danhSach.reduce((tong, dong) => tong + dong.gia * dong.soLuong, 0);
}

const GioHangService = {
  xemGioHang(taiKhoanId) {
    const danhSach = GioHangModel.layGioHangTheoTaiKhoan(taiKhoanId);
    return { danhSach, tongTien: tinhTongTien(danhSach) };
  },

  themSanPham(taiKhoanId, { sanPhamId, soLuong }) {
    const sanPham = SanPhamModel.timTheoId(sanPhamId);
    if (!sanPham || sanPham.trangThai !== 'dang_ban') {
      const loi = new Error('Sản phẩm không tồn tại hoặc đã ngừng kinh doanh');
      loi.maTrangThai = 404;
      throw loi;
    }
    const dongHienTai = GioHangModel.timDong(taiKhoanId, sanPhamId);
    if (sanPham.soLuongTon < (dongHienTai?.soLuong || 0) + soLuong) {
      const loi = new Error('Số lượng đặt vượt quá tồn kho hiện có');
      loi.maTrangThai = 409;
      throw loi;
    }
    const danhSach = GioHangModel.themSanPham(taiKhoanId, sanPhamId, soLuong);
    return { danhSach, tongTien: tinhTongTien(danhSach) };
  },

  capNhatSoLuong(taiKhoanId, chiTietId, soLuong) {
    const dong = GioHangModel.layGioHangTheoTaiKhoan(taiKhoanId).find((muc) => muc.chiTietId === Number(chiTietId));
    if (!dong) {
      const loi = new Error('Không tìm thấy sản phẩm trong giỏ hàng');
      loi.maTrangThai = 404;
      throw loi;
    }
    const sanPham = SanPhamModel.timTheoId(dong.sanPhamId);
    if (!sanPham || sanPham.trangThai !== 'dang_ban' || soLuong > sanPham.soLuongTon) {
      const loi = new Error('Số lượng sản phẩm vượt quá tồn kho hoặc sản phẩm đã ngừng kinh doanh');
      loi.maTrangThai = 409;
      throw loi;
    }
    const danhSach = GioHangModel.capNhatSoLuong(taiKhoanId, chiTietId, soLuong);
    return { danhSach, tongTien: tinhTongTien(danhSach) };
  },

  xoaDong(taiKhoanId, chiTietId) {
    const danhSach = GioHangModel.xoaDong(taiKhoanId, chiTietId);
    return { danhSach, tongTien: tinhTongTien(danhSach) };
  },
};

module.exports = GioHangService;
