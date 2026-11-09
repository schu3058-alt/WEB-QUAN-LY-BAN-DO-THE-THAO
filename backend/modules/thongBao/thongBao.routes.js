const express = require('express');
const ThongBaoController = require('./thongBao.controller');
const xacThuc = require('../../middleware/xacThuc');

const router = express.Router();
router.use(xacThuc);

router.get('/toi', ThongBaoController.layCuaToi);
router.put('/:id/da-doc', ThongBaoController.danhDauDaDoc);

module.exports = router;
