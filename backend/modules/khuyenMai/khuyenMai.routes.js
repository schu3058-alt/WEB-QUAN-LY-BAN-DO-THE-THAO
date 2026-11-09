const express = require('express');
const KhuyenMaiController = require('./khuyenMai.controller');
const xacThuc = require('../../middleware/xacThuc');
const phanQuyen = require('../../middleware/phanQuyen');
const kiemTraDuLieu = require('../../tienIch/kiemTraDuLieu');
const { taoKhuyenMai, apDungKhuyenMai } = require('./khuyenMai.validation');

const router = express.Router();

router.get('/', KhuyenMaiController.layTatCa);
router.post('/ap-dung', kiemTraDuLieu(apDungKhuyenMai), KhuyenMaiController.apDung);
router.post('/', xacThuc, phanQuyen('quan_tri'), kiemTraDuLieu(taoKhuyenMai), KhuyenMaiController.taoMoi);
router.delete('/:id', xacThuc, phanQuyen('quan_tri'), KhuyenMaiController.xoa);

module.exports = router;
