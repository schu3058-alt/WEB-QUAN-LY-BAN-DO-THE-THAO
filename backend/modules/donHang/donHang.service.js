// Nghiep vu dat hang va xu ly don hang (Chuan Bien The & State Machine SQLite)
const coSoDuLieu = require('../../cauHinh/ketNoiCoSoDuLieu');
const DonHangModel = require('./donHang.model');
const GioHangModel = require('../gioHang/gioHang.model');
const KhoHangModel = require('../khoHang/khoHang.model');
const ThanhVienModel = require('../khachHangThanThiet/thanhVien.model');
const KhuyenMaiService = require('../khuyenMai/khuyenMai.service');
const ThongBaoService = require('../thongBao/thongBao.service');
const ThanhToanModel = require('../thanhToan/thanhToan.model');

// Bản đồ trạng thái hợp lệ (State Machine)
const LUONG_TRANG_THAI_HOP_LE = {
  cho_xac_nhan: ['da_xac_nhan', 'da_huy'],
  da_xac_nhan: ['dang_chuan_bi', 'da_huy'],
  dang_chuan_bi: ['dang_giao'],
  dang_giao: ['hoan_thanh', 'giao_that_bai'],
  giao_that_bai: ['dang_giao', 'da_huy'],
  hoan_thanh: [],
  da_huy: []
};

const DonHangService = {
  xacNhanDatHang(taiKhoanId, thongTinGiaoHang) {
    if (!thongTinGiaoHang || !thongTinGiaoHang.diaChiNhan || !thongTinGiaoHang.soDienThoaiNhan) {
      const loi = new Error('Thiếu thông tin giao hàng');
      loi.maTrangThai = 400;
      throw loi;
    }

    const { maKhuyenMai, ...thongTinDonHang } = thongTinGiaoHang;
    const taoDonHangGiaoDich = coSoDuLieu.transaction(() => {
      const gioHang = GioHangModel.layGioHangTheoTaiKhoan(taiKhoanId);
      if (!gioHang.length) {
        const loi = new Error('Giỏ hàng đang trống, không thể đặt hàng');
        loi.maTrangThai = 400;
        throw loi;
      }

      // Kiểm tra tồn kho của từng biến thể trong giỏ hàng
      const thongTinChiTiet = gioHang.map((dong) => {
        const bienThe = coSoDuLieu
          .prepare('SELECT id, soLuongTon, giaBan, giaKhuyenMai, trangThai FROM bien_the_san_pham WHERE id = ?')
          .get(dong.bienTheId);

        if (!bienThe || bienThe.trangThai !== 1) {
          const loi = new Error(`Phân loại sản phẩm "${dong.ten} - Size: ${dong.kichCo}, Màu: ${dong.mauSac}" đã ngừng kinh doanh`);
          loi.maTrangThai = 409;
          throw loi;
        }
        if (bienThe.soLuongTon < dong.soLuong) {
          const loi = new Error(`Sản phẩm "${dong.ten}" không đủ tồn kho (còn lại: ${bienThe.soLuongTon})`);
          loi.maTrangThai = 409;
          throw loi;
        }
        const giaApDung = bienThe.giaKhuyenMai !== null ? bienThe.giaKhuyenMai : bienThe.giaBan;
        return { ...dong, gia: giaApDung };
      });

      const tongTienGoc = thongTinChiTiet.reduce((tong, dong) => tong + dong.gia * dong.soLuong, 0);
      const thongTinKhuyenMai = maKhuyenMai ? KhuyenMaiService.apDung(maKhuyenMai, tongTienGoc) : {
        ma: null,
        tongTienGoc,
        soTienGiam: 0,
        tongTienSauGiam: tongTienGoc,
      };

      const donHangId = DonHangModel.taoDonHang({
        taiKhoanId,
        ...thongTinDonHang,
        tongTienGoc: thongTinKhuyenMai.tongTienGoc,
        tienGiam: thongTinKhuyenMai.soTienGiam,
        tongTienSauGiam: thongTinKhuyenMai.tongTienSauGiam,
        maKhuyenMai: thongTinKhuyenMai.ma,
        tongTien: thongTinKhuyenMai.tongTienSauGiam,
      });

      // Ghi lịch sử trạng thái ban đầu
      coSoDuLieu.prepare(`
        INSERT INTO lich_su_trang_thai_don_hang (donHangId, trangThaiCu, trangThaiMoi, ghiChu)
        VALUES (?, NULL, 'cho_xac_nhan', 'Khởi tạo đơn hàng mới')
      `).run(donHangId);

      // Thêm chi tiết đơn hàng và giữ chỗ kho (chờ admin xác nhận hoặc trừ kho trực tiếp tùy nghiệp vụ)
      thongTinChiTiet.forEach((dong) => {
        DonHangModel.themChiTiet(donHangId, {
          bienTheId: dong.bienTheId,
          soLuong: dong.soLuong,
          donGia: dong.gia,
        });
      });

      GioHangModel.xoaToanBo(taiKhoanId);
      return donHangId;
    });

    const donHangId = taoDonHangGiaoDich();
    return DonHangModel.timTheoId(donHangId);
  },

  layDonHangCuaToi(taiKhoanId) {
    return DonHangModel.layTheoTaiKhoan(taiKhoanId);
  },

  layChiTiet(id, taiKhoanId, vaiTro) {
    const donHang = DonHangModel.timTheoId(id);
    if (!donHang || (vaiTro !== 'quan_tri' && donHang.taiKhoanId !== taiKhoanId)) {
      const loi = new Error('Không tìm thấy đơn hàng');
      loi.maTrangThai = 404;
      throw loi;
    }
    return donHang;
  },

  layTatCa(boLoc) {
    return DonHangModel.layTatCa(boLoc);
  },

  capNhatTrangThai(id, trangThai, adminId = null, ghiChu = '') {
    const capNhatGiaoDich = coSoDuLieu.transaction(() => {
      const donHang = this.layChiTiet(id, null, 'quan_tri');
      const trangThaiHienTai = donHang.trangThai;

      if (trangThaiHienTai === trangThai) return donHang;

      // Kiểm tra luồng trạng thái hợp lệ (State Machine)
      if (!LUONG_TRANG_THAI_HOP_LE[trangThaiHienTai]?.includes(trangThai)) {
        const loi = new Error(`Không thể chuyển đơn hàng từ trạng thái [${trangThaiHienTai}] sang [${trangThai}]`);
        loi.maTrangThai = 409;
        throw loi;
      }

      // Xử lý khi đơn hàng chuyển sang 'da_xac_nhan' -> Trừ kho biến thể tự động
      if (trangThai === 'da_xac_nhan') {
        const chiTietDon = DonHangModel.layChiTietDonHang(id); // Hoặc thuộc tính donHang.chiTiet tùy model của bạn
        KhoHangModel.taoPhieuNhapXuat({
          loaiPhieu: 'XUAT',
          nguoiThucHienId: adminId || 1,
          donHangId: id,
          ghiChu: `Xuất kho tự động cho đơn hàng #${id}`,
          danhSachChiTiet: chiTietDon.map(c => ({ bienTheId: c.bienTheId, soLuong: c.soLuong }))
        });
      }

      // Xử lý khi đơn hàng bị hủy ('da_huy')
      if (trangThai === 'da_huy') {
        const thanhToan = ThanhToanModel.timTheoDonHang(id);
        if (thanhToan?.trangThai === 'da_thanh_toan') {
          const loi = new Error('Không thể hủy đơn hàng đã thanh toán trực tuyến');
          loi.maTrangThai = 409;
          throw loi;
        }
        // Nếu đã từng xác nhận (tức là đã trừ kho), cần hoàn trả kho
        if (trangThaiHienTai !== 'cho_xac_nhan') {
          const chiTietDon = DonHangModel.layChiTietDonHang(id);
          KhoHangModel.taoPhieuNhapXuat({
            loaiPhieu: 'HOAN_TRA',
            nguoiThucHienId: adminId || 1,
            donHangId: id,
            ghiChu: `Hoàn kho do hủy đơn hàng #${id}`,
            danhSachChiTiet: chiTietDon.map(c => ({ bienTheId: c.bienTheId, soLuong: c.soLuong }))
          });
        }
      }

      // Xử lý khi hoàn thành đơn hàng ('hoan_thanh') -> Tích điểm cho khách hàng
      if (trangThai === 'hoan_thanh') {
        ThanhVienModel.tichDiemTuDonHang(donHang.taiKhoanId, donHang.id, donHang.tongTien);
      }

      // Ghi lịch sử thay đổi trạng thái
      coSoDuLieu.prepare(`
        INSERT INTO lich_su_trang_thai_don_hang (donHangId, trangThaiCu, trangThaiMoi, nguoiCapNhatId, ghiChu)
        VALUES (?, ?, ?, ?, ?)
      `).run(id, trangThaiHienTai, trangThai, adminId, ghiChu || `Cập nhật trạng thái thành ${trangThai}`);

      const ketQua = DonHangModel.capNhatTrangThai(id, trangThai);
      ThongBaoService.taoThongBaoChoDonHang(donHang.taiKhoanId, trangThai);
      return ketQua;
    });

    return capNhatGiaoDich();
  },
};

module.exports = DonHangService;