const Joi = require('joi');

const xacNhanDatHang = Joi.object({
  diaChiNhan: Joi.string().min(5).max(255).required(),
  soDienThoaiNhan: Joi.string().pattern(/^[0-9]{9,11}$/).required(),
  ghiChu: Joi.string().max(500).allow('', null),
  maKhuyenMai: Joi.string().uppercase().min(3).max(30).allow('', null),
});

const capNhatTrangThai = Joi.object({
  trangThai: Joi.string()
    .valid('cho_xac_nhan', 'dang_giao', 'da_giao', 'da_huy')
    .required(),
});

module.exports = { xacNhanDatHang, capNhatTrangThai };
