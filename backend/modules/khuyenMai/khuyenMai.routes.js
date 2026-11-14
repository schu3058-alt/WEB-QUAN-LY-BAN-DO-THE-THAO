const express = require('express');
const KhuyenMaiController = require('./khuyenMai.controller');
const xacThuc = require('../../middleware/xacThuc');
const phanQuyen = require('../../middleware/phanQuyen');
const kiemTraDuLieu = require('../../tienIch/kiemTraDuLieu');
const { taoKhuyenMai, apDungKhuyenMai } = require('./khuyenMai.validation');

const router = express.Router();
router.use(xacThuc);

router.get('/', phanQuyen('quan_tri'), KhuyenMaiController.layTatCa);
router.post('/ap-dung', kiemTraDuLieu(apDungKhuyenMai), KhuyenMaiController.apDung);
router.post('/', phanQuyen('quan_tri'), kiemTraDuLieu(taoKhuyenMai), KhuyenMaiController.taoMoi);
router.delete('/:id', phanQuyen('quan_tri'), KhuyenMaiController.xoa);

module.exports = router;
