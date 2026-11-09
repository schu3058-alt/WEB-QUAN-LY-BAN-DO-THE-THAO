// Khoi tao Express app: cau hinh middleware chung va gan cac module route
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

const gioiHanYeuCau = require('./middleware/gioiHanYeuCau');
const xuLyLoi = require('./middleware/xuLyLoi');

const taiKhoanRoutes = require('./modules/taiKhoan');
const danhMucRoutes = require('./modules/danhMuc');
const sanPhamRoutes = require('./modules/sanPham');
const gioHangRoutes = require('./modules/gioHang');
const donHangRoutes = require('./modules/donHang');
const thanhToanRoutes = require('./modules/thanhToan');
const danhGiaRoutes = require('./modules/danhGia');
const khuyenMaiRoutes = require('./modules/khuyenMai');
const thongBaoRoutes = require('./modules/thongBao');
const baoCaoRoutes = require('./modules/baoCao');

const ungDung = express();
const duongDanGiaoDien = path.resolve(__dirname, '../frontend');

ungDung.use(cors());
ungDung.use(express.json());
ungDung.use(morgan('dev'));
ungDung.use(gioiHanYeuCau);

ungDung.use('/api/tai-khoan', taiKhoanRoutes);
ungDung.use('/api/danh-muc', danhMucRoutes);
ungDung.use('/api/san-pham', sanPhamRoutes);
ungDung.use('/api/gio-hang', gioHangRoutes);
ungDung.use('/api/don-hang', donHangRoutes);
ungDung.use('/api/thanh-toan', thanhToanRoutes);
ungDung.use('/api/danh-gia', danhGiaRoutes);
ungDung.use('/api/khuyen-mai', khuyenMaiRoutes);
ungDung.use('/api/thong-bao', thongBaoRoutes);
ungDung.use('/api/bao-cao', baoCaoRoutes);

ungDung.get('/api/health', (yeuCau, phanHoi) => {
  phanHoi.json({ thanhCong: true, thongBao: 'API SportShop đang hoạt động' });
});

ungDung.use(express.static(duongDanGiaoDien));

const cacTrang = {
  '/': 'trang/trangChu/index.html',
  '/san-pham': 'trang/danhSachSanPham/index.html',
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

Object.entries(cacTrang).forEach(([duongDan, tep]) => {
  ungDung.get(duongDan, (yeuCau, phanHoi, tiepTheo) => {
    phanHoi.sendFile(path.join(duongDanGiaoDien, tep), (loi) => {
      if (loi) tiepTheo(loi);
    });
  });
});

ungDung.get('/san-pham/:id', (yeuCau, phanHoi, tiepTheo) => {
  phanHoi.sendFile(path.join(duongDanGiaoDien, 'trang/chiTietSanPham/index.html'), (loi) => {
    if (loi) tiepTheo(loi);
  });
});

// Middleware xu ly loi phai dat sau cung
ungDung.use(xuLyLoi);

module.exports = ungDung;
