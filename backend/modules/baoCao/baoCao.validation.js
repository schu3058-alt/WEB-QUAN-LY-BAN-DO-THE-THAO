const Joi = require('joi');

const khoangNgay = Joi.object({
  tuNgay: Joi.string().isoDate().required(),
  denNgay: Joi.string().isoDate().required(),
}).custom((duLieu, helpers) => {
  if (duLieu.denNgay < duLieu.tuNgay) return helpers.error('date.lessThan');
  return duLieu;
}).messages({ 'date.lessThan': '"Đến ngày" phải bằng hoặc sau "Từ ngày"' });

module.exports = { khoangNgay };
