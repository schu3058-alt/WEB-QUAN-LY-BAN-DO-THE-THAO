const Joi = require('joi');

const themVaoGio = Joi.object({
  sanPhamId: Joi.number().integer().required(),
  soLuong: Joi.number().integer().min(1).default(1),
});

const capNhatSoLuong = Joi.object({
  soLuong: Joi.number().integer().min(1).required(),
});

module.exports = { themVaoGio, capNhatSoLuong };
