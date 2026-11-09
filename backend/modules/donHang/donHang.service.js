// Nghiep vu dat hang: chuyen gio hang hop le thanh don hang, tru ton kho, xoa gio hang
const coSoDuLieu = require('../../cauHinh/ketNoiCoSoDuLieu');
const DonHangModel = require('./donHang.model');
const GioHangModel = require('../gioHang/gioHang.model');
const SanPhamModel = require('../sanPham/sanPham.model');
const KhuyenMaiService = require('../khuyenMai/khuyenMai.service');
const ThongBaoService = require('../thongBao/thongBao.service');
const ThanhToanModel = require('../thanhToan/thanhToan.model');

const DonHangService = {
  xacNhanDatHang(taiKhoanId, thongTinGiaoHang) {
    const { maKhuyenMai, ...thongTinDonHang } = thongTinGiaoHang;
    const taoDonHangGiaoDich = coSoDuLieu.transaction(() => {
      const gioHang = GioHangModel.layGioHangTheoTaiKhoan(taiKhoanId);
      if (!gioHang.length) {
        const loi = new Error('Giỏ hàng đang trống, không thể đặt hàng');
        loi.maTrangThai = 400;
        throw loi;
      }

      const thongTinChiTiet = gioHang.map((dong) => {
        const sanPham = SanPhamModel.timTheoId(dong.sanPhamId);
        if (!sanPham || sanPham.trangThai !== 'dang_ban') {
          const loi = new Error(`Sản phẩm ${dong.ten} đã ngừng kinh doanh`);
          loi.maTrangThai = 409;
          throw loi;
        }
        if (sanPham.soLuongTon < dong.soLuong) {
          const loi = new Error(`Sản phẩm ${dong.ten} không đủ tồn kho`);
          loi.maTrangThai = 409;
          throw loi;
        }
        return { ...dong, gia: sanPham.gia };
      });
      const tongTienGoc = thongTinChiTiet.reduce((tong, dong) => tong + dong.gia * dong.soLuong, 0);
      const tongTien = maKhuyenMai
        ? KhuyenMaiService.apDung(maKhuyenMai, tongTienGoc).tongTienSauGiam
        : tongTienGoc;
      const donHangId = DonHangModel.taoDonHang({ taiKhoanId, ...thongTinDonHang, tongTien });
      thongTinChiTiet.forEach((dong) => {
        DonHangModel.themChiTiet(donHangId, {
          sanPhamId: dong.sanPhamId,
          soLuong: dong.soLuong,
          donGia: dong.gia,
        });
        SanPhamModel.giamSoLuongTon(dong.sanPhamId, dong.soLuong);
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

  capNhatTrangThai(id, trangThai) {
    const capNhatGiaoDich = coSoDuLieu.transaction(() => {
      const donHang = this.layChiTiet(id, null, 'quan_tri');
      if (donHang.trangThai === trangThai) return donHang;
      const cacTrangThaiHopLe = {
        cho_xac_nhan: ['dang_giao', 'da_huy'],
        dang_giao: ['da_giao'],
        da_giao: [],
        da_huy: [],
      };
      if (!cacTrangThaiHopLe[donHang.trangThai]?.includes(trangThai)) {
        const loi = new Error('Không thể chuyển đơn hàng sang trạng thái này');
        loi.maTrangThai = 409;
        throw loi;
      }
      if (trangThai === 'da_huy') {
        const thanhToan = ThanhToanModel.timTheoDonHang(id);
        if (thanhToan?.trangThai === 'da_thanh_toan') {
          const loi = new Error('Không thể hủy đơn hàng đã thanh toán');
          loi.maTrangThai = 409;
          throw loi;
        }
        donHang.chiTiet.forEach((dong) => SanPhamModel.tangSoLuongTon(dong.sanPhamId, dong.soLuong));
      }
      const ketQua = DonHangModel.capNhatTrangThai(id, trangThai);
      ThongBaoService.taoThongBaoChoDonHang(donHang.taiKhoanId, trangThai);
      return ketQua;
    });
    return capNhatGiaoDich();
  },
};

module.exports = DonHangService;
