const express = require('express');
const SanPhamController = require('./sanPham.controller');
const xacThuc = require('../../middleware/xacThuc');
const phanQuyen = require('../../middleware/phanQuyen');
const kiemTraDuLieu = require('../../tienIch/kiemTraDuLieu');
const { taoHoacCapNhat, timKiem } = require('./sanPham.validation');

const router = express.Router();

router.get('/', kiemTraDuLieu(timKiem, 'query'), SanPhamController.timKiem);
router.get('/quan-tri', xacThuc, phanQuyen('quan_tri'), kiemTraDuLieu(timKiem, 'query'), SanPhamController.timKiemQuanTri);
router.get('/:id', SanPhamController.layTheoId);
router.post('/', xacThuc, phanQuyen('quan_tri'), kiemTraDuLieu(taoHoacCapNhat), SanPhamController.taoMoi);
router.put('/:id', xacThuc, phanQuyen('quan_tri'), kiemTraDuLieu(taoHoacCapNhat), SanPhamController.capNhat);
router.delete('/:id', xacThuc, phanQuyen('quan_tri'), SanPhamController.ngungKinhDoanh);

module.exports = router;
