const express = require('express');
const BaoCaoController = require('./baoCao.controller');
const xuatBaoCaoService = require('./xuatBaoCao.service');
const khoHangModel = require('../khoHang/khoHang.model');
const xacThuc = require('../../middleware/xacThuc');
const phanQuyen = require('../../middleware/phanQuyen');
const kiemTraDuLieu = require('../../tienIch/kiemTraDuLieu');
const { khoangNgay } = require('./baoCao.validation');

const router = express.Router();

// Áp dụng xác thực và phân quyền quản trị cho toàn bộ các route báo cáo dưới đây
router.use(xacThuc, phanQuyen('quan_tri'));

// Các route báo cáo sẵn có
router.get('/doanh-thu', kiemTraDuLieu(khoangNgay, 'query'), BaoCaoController.doanhThuTheoNgay);
router.get('/tong-quan', BaoCaoController.tongQuan);

// BỔ SUNG: Route tải file Excel báo cáo cảnh báo tồn kho (Bước 6)
router.get('/xuat-ton-kho-excel', async (req, res, next) => {
  try {
    const danhSachCanhBao = khoHangModel.layDanhSachCanhBaoTonKho();
    await xuatBaoCaoService.xuatTonKhoExcel(danhSachCanhBao, res);
  } catch (e) {
    next(e);
  }
});

module.exports = router;