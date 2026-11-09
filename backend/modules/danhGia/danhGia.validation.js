const Joi = require('joi');

const taoDanhGia = Joi.object({
  sanPhamId: Joi.number().integer().required(),
  soSao: Joi.number().integer().min(1).max(5).required(),
  noiDung: Joi.string().max(1000).allow('', null),
});

module.exports = { taoDanhGia };
