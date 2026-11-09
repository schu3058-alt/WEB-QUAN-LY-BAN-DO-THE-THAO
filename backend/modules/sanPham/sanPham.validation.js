const Joi = require('joi');

const taoHoacCapNhat = Joi.object({
  ten: Joi.string().min(2).max(150).required(),
  moTa: Joi.string().max(2000).allow('', null),
  gia: Joi.number().positive().required(),
  soLuongTon: Joi.number().integer().min(0).required(),
  danhMucId: Joi.number().integer().required(),
  hinhAnh: Joi.string().uri({ scheme: ['http', 'https'] }).allow('', null),
});

const timKiem = Joi.object({
  tuKhoa: Joi.string().allow('', null),
  danhMucId: Joi.number().integer().allow(null),
  trang: Joi.number().integer().min(1).default(1),
  soLuongMoiTrang: Joi.number().integer().min(1).max(100).default(20),
});

module.exports = { taoHoacCapNhat, timKiem };
