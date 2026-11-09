const express = require('express');
const DanhGiaController = require('./danhGia.controller');
const xacThuc = require('../../middleware/xacThuc');
const kiemTraDuLieu = require('../../tienIch/kiemTraDuLieu');
const { taoDanhGia } = require('./danhGia.validation');

const router = express.Router();

router.get('/san-pham/:sanPhamId', DanhGiaController.layTheoSanPham);
router.post('/', xacThuc, kiemTraDuLieu(taoDanhGia), DanhGiaController.taoMoi);
router.delete('/:id', xacThuc, DanhGiaController.xoa);

module.exports = router;
