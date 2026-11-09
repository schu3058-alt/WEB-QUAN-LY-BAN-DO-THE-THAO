const express = require('express');
const DonHangController = require('./donHang.controller');
const xacThuc = require('../../middleware/xacThuc');
const phanQuyen = require('../../middleware/phanQuyen');
const kiemTraDuLieu = require('../../tienIch/kiemTraDuLieu');
const { xacNhanDatHang, capNhatTrangThai } = require('./donHang.validation');

const router = express.Router();
router.use(xacThuc);

router.post('/', kiemTraDuLieu(xacNhanDatHang), DonHangController.xacNhanDatHang);
router.get('/toi', DonHangController.layDonHangCuaToi);
router.get('/:id', DonHangController.layChiTiet);

// Chi quan tri vien duoc xem tat ca don hang va cap nhat trang thai
router.get('/', phanQuyen('quan_tri'), DonHangController.layTatCa);
router.put('/:id/trang-thai', phanQuyen('quan_tri'), kiemTraDuLieu(capNhatTrangThai), DonHangController.capNhatTrangThai);

module.exports = router;
