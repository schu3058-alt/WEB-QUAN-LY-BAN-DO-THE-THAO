const khoHangModel = require('./khoHang.model');

const khoHangService = {
  themBienTheSanPham: (duLieu) => khoHangModel.taoBienThe(duLieu),
  nhapXuatKho: (duLieu) => khoHangModel.taoPhieuNhapXuat(duLieu),
  layCanhBaoSapHet: () => khoHangModel.layDanhSachCanhBaoTonKho(),
  layLichSuKho: (boLoc) => khoHangModel.layLichSuNhapXuat(boLoc)
};

module.exports = khoHangService;