const doiTraModel = require('./doiTra.model');

const TRANG_THAI_HOP_LE = ['CHO_DUYET', 'DA_DUYET', 'TU_CHOI', 'DANG_XU_LY', 'HOAN_TAT'];
const LOAI_YEU_CAU_HOP_LE = ['DOI_HANG', 'TRA_HANG_HOAN_TIEN'];

const doiTraController = {
  // POST /api/doi-tra — Khách hàng tạo yêu cầu đổi/trả hàng
  async taoYeuCau(req, res, next) {
    try {
      const { donHangId, loaiYeuCau, lyDo, hinhAnhMinhChung, chiTiet } = req.body;

      if (!donHangId || !LOAI_YEU_CAU_HOP_LE.includes(loaiYeuCau)) {
        return res.status(400).json({
          thanhCong: false,
          thongBao: 'Thiếu mã đơn hàng hoặc loại yêu cầu không hợp lệ (DOI_HANG / TRA_HANG_HOAN_TIEN)'
        });
      }
      if (!lyDo || !lyDo.trim()) {
        return res.status(400).json({ thanhCong: false, thongBao: 'Vui lòng nhập lý do đổi/trả hàng' });
      }
      if (!Array.isArray(chiTiet) || chiTiet.length === 0) {
        return res.status(400).json({ thanhCong: false, thongBao: 'Danh sách sản phẩm đổi/trả không được rỗng' });
      }

      const yeuCau = await doiTraModel.taoYeuCau({
        donHangId: Number(donHangId),
        taiKhoanId: req.nguoiDung.id,
        loaiYeuCau,
        lyDo: lyDo.trim(),
        hinhAnhMinhChung,
        chiTiet
      });

      res.status(201).json({
        thanhCong: true,
        thongBao: 'Gửi yêu cầu đổi/trả thành công',
        duLieu: yeuCau
      });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/doi-tra/cua-toi — Khách hàng xem lịch sử yêu cầu đổi/trả của mình
  async danhSachCuaToi(req, res, next) {
    try {
      const ds = await doiTraModel.layDanhSachTheoTaiKhoan(req.nguoiDung.id);
      res.json({ thanhCong: true, duLieu: ds });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/doi-tra — Admin/CSKH xem danh sách toàn bộ yêu cầu
  async danhSachQuanTri(req, res, next) {
    try {
      const ds = await doiTraModel.layTatCaYeuCau(req.query.trangThai);
      res.json({ thanhCong: true, tongSo: ds.length, duLieu: ds });
    } catch (err) {
      next(err);
    }
  },

  // PATCH /api/doi-tra/:id/xu-ly — Admin/CSKH duyệt, từ chối hoặc hoàn tất (tự động hoàn kho)
  async xuLyYeuCau(req, res, next) {
    try {
      const yeuCauId = Number(req.params.id);
      const { trangThaiMoi, phanHoiAdmin } = req.body;

      if (!TRANG_THAI_HOP_LE.includes(trangThaiMoi)) {
        return res.status(400).json({
          thanhCong: false,
          thongBao: `Trạng thái mới không hợp lệ. Chỉ chấp nhận: ${TRANG_THAI_HOP_LE.join(', ')}`
        });
      }

      const ketQua = await doiTraModel.xuLyYeuCau(
        yeuCauId,
        trangThaiMoi,
        phanHoiAdmin,
        req.nguoiDung.id
      );

      res.json({
        thanhCong: true,
        thongBao: `Đã cập nhật yêu cầu đổi trả sang trạng thái ${trangThaiMoi}`,
        duLieu: ketQua
      });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = doiTraController;