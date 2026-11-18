// khoHang.routes.js
const express = require('express');
const router = express.Router();
const khoHangController = require('./khoHang.controller');
const xacThuc = require('../../middleware/xacThuc');
const phanQuyen = require('../../middleware/phanQuyen');

router.post('/bien-the', xacThuc, phanQuyen(['ADMIN', 'QUAN_LY_KHO']), khoHangController.taoBienThe);
router.post('/phieu', xacThuc, phanQuyen(['ADMIN', 'QUAN_LY_KHO']), khoHangController.lapPhieuKho);
router.get('/canh-bao-ton', xacThuc, phanQuyen(['ADMIN', 'QUAN_LY_KHO']), khoHangController.danhSachCanhBao);
router.get('/lich-su', xacThuc, phanQuyen(['ADMIN', 'QUAN_LY_KHO']), khoHangController.lichSuNhapXuat);

module.exports = router;

// index.js
module.exports = require('./khoHang.routes');