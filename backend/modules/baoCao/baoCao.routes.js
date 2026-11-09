const express = require('express');
const BaoCaoController = require('./baoCao.controller');
const xacThuc = require('../../middleware/xacThuc');
const phanQuyen = require('../../middleware/phanQuyen');
const kiemTraDuLieu = require('../../tienIch/kiemTraDuLieu');
const { khoangNgay } = require('./baoCao.validation');

const router = express.Router();
router.use(xacThuc, phanQuyen('quan_tri'));

router.get('/doanh-thu', kiemTraDuLieu(khoangNgay, 'query'), BaoCaoController.doanhThuTheoNgay);
router.get('/tong-quan', BaoCaoController.tongQuan);

module.exports = router;
