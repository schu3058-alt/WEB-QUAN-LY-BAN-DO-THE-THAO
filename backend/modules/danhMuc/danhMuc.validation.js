const Joi = require('joi');

const taoHoacCapNhat = Joi.object({
  ten: Joi.string().min(2).max(100).required(),
  moTa: Joi.string().max(500).allow('', null),
  slug: Joi.string().pattern(/^[a-z0-9-]+$/).required(),
});

module.exports = { taoHoacCapNhat };
