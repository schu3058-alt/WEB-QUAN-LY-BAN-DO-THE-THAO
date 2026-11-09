const express = require('express');
const ThanhToanController = require('./thanhToan.controller');
const xacThuc = require('../../middleware/xacThuc');
const phanQuyen = require('../../middleware/phanQuyen');
const kiemTraDuLieu = require('../../tienIch/kiemTraDuLieu');
const { taoThanhToan } = require('./thanhToan.validation');

const router = express.Router();
router.use(xacThuc);

router.post('/', kiemTraDuLieu(taoThanhToan), ThanhToanController.taoThanhToan);
router.get('/don-hang/:donHangId', ThanhToanController.layTheoDonHang);
router.put('/:id/xac-nhan', phanQuyen('quan_tri'), ThanhToanController.xacNhanThanhCong);

module.exports = router;
