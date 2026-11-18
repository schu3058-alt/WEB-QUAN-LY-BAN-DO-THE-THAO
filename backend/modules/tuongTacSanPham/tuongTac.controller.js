// tuongTac.controller.js
const tuongTacModel = require('./tuongTac.model');

module.exports = {
  async yeuThich(req, res, next) {
    try {
      const kq = await tuongTacModel.chuyenDoiYeuThich(req.nguoiDung.id, req.params.sanPhamId);
      res.json({ thanhCong: true, ...kq });
    } catch (e) { next(e); }
  },
  async vuaXem(req, res, next) {
    try {
      const ds = await tuongTacModel.laySanPhamVuaXem(req.nguoiDung.id);
      res.json({ thanhCong: true, duLieu: ds });
    } catch (e) { next(e); }
  },
  async soSanh(req, res, next) {
    try {
      const ids = (req.query.ids || '').split(',');
      const ds = await tuongTacModel.soSanhSanPham(ids);
      res.json({ thanhCong: true, duLieu: ds });
    } catch (e) { next(e); }
  },
  async goiY(req, res, next) {
    try {
      const ds = await tuongTacModel.goiYSanPham(req.params.sanPhamId);
      res.json({ thanhCong: true, duLieu: ds });
    } catch (e) { next(e); }
  }
};