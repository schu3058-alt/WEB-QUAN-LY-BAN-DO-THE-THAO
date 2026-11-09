const Joi = require('joi');

const taoKhuyenMai = Joi.object({
  ma: Joi.string().uppercase().min(3).max(30).required(),
  phanTramGiam: Joi.number().min(1).max(100).required(),
  ngayBatDau: Joi.string().isoDate().required(),
  ngayKetThuc: Joi.string().isoDate().required(),
}).custom((duLieu, helpers) => {
  if (Date.parse(duLieu.ngayKetThuc) <= Date.parse(duLieu.ngayBatDau)) {
    return helpers.error('date.greaterThan');
  }
  return duLieu;
}).messages({ 'date.greaterThan': '"Ngày kết thúc" phải sau "Ngày bắt đầu"' });

const apDungKhuyenMai = Joi.object({
  ma: Joi.string().uppercase().min(3).max(30).required(),
  tongTienGoc: Joi.number().min(0).required(),
});

module.exports = { taoKhuyenMai, apDungKhuyenMai };
