const express = require('express');
const DanhMucController = require('./danhMuc.controller');
const xacThuc = require('../../middleware/xacThuc');
const phanQuyen = require('../../middleware/phanQuyen');
const kiemTraDuLieu = require('../../tienIch/kiemTraDuLieu');
const { taoHoacCapNhat } = require('./danhMuc.validation');

const router = express.Router();

router.get('/', DanhMucController.layTatCa);
router.get('/:id', DanhMucController.layTheoId);
router.post('/', xacThuc, phanQuyen('quan_tri'), kiemTraDuLieu(taoHoacCapNhat), DanhMucController.taoMoi);
router.put('/:id', xacThuc, phanQuyen('quan_tri'), kiemTraDuLieu(taoHoacCapNhat), DanhMucController.capNhat);
router.delete('/:id', xacThuc, phanQuyen('quan_tri'), DanhMucController.xoa);

module.exports = router;
