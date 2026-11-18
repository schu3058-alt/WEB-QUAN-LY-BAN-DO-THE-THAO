const coSoDuLieu = require('../../cauHinh/ketNoiCoSoDuLieu');
const khoHangModel = require('../khoHang/khoHang.model');

const doiTraModel = {
  taoYeuCau({ donHangId, taiKhoanId, loaiYeuCau, lyDo, hinhAnhMinhChung, chiTiet }) {
    const donHang = coSoDuLieu
      .prepare('SELECT id, trangThai FROM don_hang WHERE id = ? AND taiKhoanId = ?')
      .get(donHangId, taiKhoanId);

    if (!donHang) throw new Error('Không tìm thấy đơn hàng của bạn');
    if (donHang.trangThai !== 'HOAN_THANH' && donHang.trangThai !== 'hoan_thanh') {
      throw new Error('Chỉ có thể yêu cầu đổi/trả đối với đơn hàng đã hoàn thành');
    }

    const thucHien = coSoDuLieu.transaction(() => {
      const maYeuCau = `DT-${Date.now()}`;
      const ycInfo = coSoDuLieu.prepare(`
        INSERT INTO yeu_cau_doi_tra (maYeuCau, donHangId, taiKhoanId, loaiYeuCau, lyDo, hinhAnhMinhChung)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(maYeuCau, donHangId, taiKhoanId, loaiYeuCau, lyDo, JSON.stringify(hinhAnhMinhChung || []));

      const yeuCauId = ycInfo.lastInsertRowid;

      const stmtChiTiet = coSoDuLieu.prepare(`
        INSERT INTO chi_tiet_doi_tra (yeuCauDoiTraId, bienTheCuId, bienTheMoiId, soLuong)
        VALUES (?, ?, ?, ?)
      `);
      for (const item of chiTiet) {
        stmtChiTiet.run(yeuCauId, item.bienTheCuId, item.bienTheMoiId || null, item.soLuong);
      }

      return coSoDuLieu.prepare('SELECT * FROM yeu_cau_doi_tra WHERE id = ?').get(yeuCauId);
    });

    return thucHien();
  },

  xuLyYeuCau(yeuCauId, trangThaiMoi, phanHoiAdmin, adminId) {
    const yc = coSoDuLieu.prepare('SELECT * FROM yeu_cau_doi_tra WHERE id = ?').get(yeuCauId);
    if (!yc) throw new Error('Yêu cầu đổi trả không tồn tại');

    coSoDuLieu.prepare(`
      UPDATE yeu_cau_doi_tra
      SET trangThai = ?, phanHoiAdmin = ?, ngayCapNhat = datetime('now')
      WHERE id = ?
    `).run(trangThaiMoi, phanHoiAdmin || '', yeuCauId);

    if (trangThaiMoi === 'HOAN_TAT') {
      const dsChiTiet = coSoDuLieu
        .prepare('SELECT * FROM chi_tiet_doi_tra WHERE yeuCauDoiTraId = ?')
        .all(yeuCauId);

      // Nhập hoàn trả biến thể cũ về kho
      khoHangModel.taoPhieuNhapXuat({
        loaiPhieu: 'HOAN_TRA',
        nguoiThucHienId: adminId,
        donHangId: yc.donHangId,
        ghiChu: `Hoàn kho từ yêu cầu ${yc.maYeuCau}`,
        danhSachChiTiet: dsChiTiet.map(c => ({ bienTheId: c.bienTheCuId, soLuong: c.soLuong }))
      });

      // Nếu là DOI_HANG thì xuất biến thể mới cho khách
      const dsDoiMoi = dsChiTiet.filter(c => c.bienTheMoiId);
      if (yc.loaiYeuCau === 'DOI_HANG' && dsDoiMoi.length > 0) {
        khoHangModel.taoPhieuNhapXuat({
          loaiPhieu: 'XUAT',
          nguoiThucHienId: adminId,
          donHangId: yc.donHangId,
          ghiChu: `Xuất đổi hàng cho yêu cầu ${yc.maYeuCau}`,
          danhSachChiTiet: dsDoiMoi.map(c => ({ bienTheId: c.bienTheMoiId, soLuong: c.soLuong }))
        });
      }
    }

    return { id: yeuCauId, trangThai: trangThaiMoi };
  },

  layDanhSachTheoTaiKhoan(taiKhoanId) {
    return coSoDuLieu.prepare(`
      SELECT yc.*, dh.maDonHang
      FROM yeu_cau_doi_tra yc
      JOIN don_hang dh ON yc.donHangId = dh.id
      WHERE yc.taiKhoanId = ?
      ORDER BY yc.ngayTao DESC
    `).all(taiKhoanId);
  },

  layTatCaYeuCau(trangThai) {
    if (trangThai) {
      return coSoDuLieu.prepare(`
        SELECT yc.*, dh.maDonHang, tk.hoTen AS tenKhachHang, tk.soDienThoai
        FROM yeu_cau_doi_tra yc
        JOIN don_hang dh ON yc.donHangId = dh.id
        JOIN tai_khoan tk ON yc.taiKhoanId = tk.id
        WHERE yc.trangThai = ?
        ORDER BY yc.ngayTao DESC
      `).all(trangThai);
    }

    return coSoDuLieu.prepare(`
      SELECT yc.*, dh.maDonHang, tk.hoTen AS tenKhachHang, tk.soDienThoai
      FROM yeu_cau_doi_tra yc
      JOIN don_hang dh ON yc.donHangId = dh.id
      JOIN tai_khoan tk ON yc.taiKhoanId = tk.id
      ORDER BY yc.ngayTao DESC
    `).all();
  }
};

module.exports = doiTraModel;