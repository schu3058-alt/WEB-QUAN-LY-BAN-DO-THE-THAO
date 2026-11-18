const express = require('express');
const router = express.Router();
const doiTraController = require('./doiTra.controller');
const xacThuc = require('../../middleware/xacThuc');
const phanQuyen = require('../../middleware/phanQuyen');

// Luồng dành cho Khách hàng (đã đăng nhập)
router.post('/', xacThuc, doiTraController.taoYeuCau);
router.get('/cua-toi', xacThuc, doiTraController.danhSachCuaToi);

// Luồng dành cho Admin & Nhân viên CSKH
router.get('/', xacThuc, phanQuyen(['ADMIN', 'NHAN_VIEN_CSKH']), doiTraController.danhSachQuanTri);
router.patch('/:id/xu-ly', xacThuc, phanQuyen(['ADMIN', 'NHAN_VIEN_CSKH']), doiTraController.xuLyYeuCau);

module.exports = router;