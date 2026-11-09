// Dinh tuyen phia client don gian: anh xa duong dan URL -> thu muc trang tuong ung
// Du an dang dung nhieu trang HTML tinh (multi-page), file nay chi dung lam ban do
// tham chieu cho lien ket noi bo va co the mo rong thanh SPA router sau nay.

export const BAN_DO_DUONG_DAN = {
  '/': 'trang/trangChu/index.html',
  '/san-pham': 'trang/danhSachSanPham/index.html',
  '/san-pham/:id': 'trang/chiTietSanPham/index.html',
  '/gio-hang': 'trang/gioHang/index.html',
  '/thanh-toan': 'trang/thanhToan/index.html',
  '/dang-nhap': 'trang/dangNhap/index.html',
  '/tai-khoan': 'trang/taiKhoan/index.html',
  '/don-hang': 'trang/theoDoiDonHang/index.html',
  '/danh-gia': 'trang/danhGiaSanPham/index.html',
  '/quan-tri': 'trang/quanTri/index.html',
  '/quan-tri/san-pham': 'trang/quanLySanPham/index.html',
  '/quan-tri/don-hang': 'trang/quanLyDonHang/index.html',
  '/quan-tri/bao-cao': 'trang/baoCaoDoanhThu/index.html',
};

export function layDuongDanTrang(duongDanUrl) {
  return BAN_DO_DUONG_DAN[duongDanUrl] || BAN_DO_DUONG_DAN['/'];
}
