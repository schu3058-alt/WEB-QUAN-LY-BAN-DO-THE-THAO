const express = require('express');
const GioHangController = require('./gioHang.controller');
const xacThuc = require('../../middleware/xacThuc');
const kiemTraDuLieu = require('../../tienIch/kiemTraDuLieu');
const { themVaoGio, capNhatSoLuong } = require('./gioHang.validation');

const router = express.Router();
router.use(xacThuc);

router.get('/', GioHangController.xemGioHang);
router.post('/', kiemTraDuLieu(themVaoGio), GioHangController.themSanPham);
router.put('/:chiTietId', kiemTraDuLieu(capNhatSoLuong), GioHangController.capNhatSoLuong);
router.delete('/:chiTietId', GioHangController.xoaDong);

module.exports = router;
