const express = require('express');
const TaiKhoanController = require('./taiKhoan.controller');
const xacThuc = require('../../middleware/xacThuc');
const kiemTraDuLieu = require('../../tienIch/kiemTraDuLieu');
const { dangKy, dangNhap, capNhatHoSo } = require('./taiKhoan.validation');

const router = express.Router();

router.post('/dang-ky', kiemTraDuLieu(dangKy), TaiKhoanController.dangKy);
router.post('/dang-nhap', kiemTraDuLieu(dangNhap), TaiKhoanController.dangNhap);
router.get('/toi', xacThuc, TaiKhoanController.layHoSoHienTai);
router.put('/toi', xacThuc, kiemTraDuLieu(capNhatHoSo), TaiKhoanController.capNhatHoSoHienTai);

module.exports = router;
