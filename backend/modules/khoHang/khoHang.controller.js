const khoHangService = require('./khoHang.service');

const khoHangController = {
  async taoBienThe(req, res, next) {
    try {
      const bienThe = await khoHangService.themBienTheSanPham(req.body);
      res.status(201).json({ thanhCong: true, duLieu: bienThe });
    } catch (err) { next(err); }
  },

  async lapPhieuKho(req, res, next) {
    try {
      const phieu = await khoHangService.nhapXuatKho({
        ...req.body,
        nguoiThucHienId: req.nguoiDung.id
      });
      res.status(201).json({ thanhCong: true, duLieu: phieu });
    } catch (err) { next(err); }
  },

  async danhSachCanhBao(req, res, next) {
    try {
      const ds = await khoHangService.layCanhBaoSapHet();
      res.json({ thanhCong: true, tongSo: ds.length, duLieu: ds });
    } catch (err) { next(err); }
  },

  async lichSuNhapXuat(req, res, next) {
    try {
      const ds = await khoHangService.layLichSuKho(req.query);
      res.json({ thanhCong: true, duLieu: ds });
    } catch (err) { next(err); }
  }
};

module.exports = khoHangController;