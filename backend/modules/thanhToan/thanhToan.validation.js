const Joi = require('joi');

const taoThanhToan = Joi.object({
  donHangId: Joi.number().integer().required(),
  phuongThuc: Joi.string().valid('tien_mat', 'chuyen_khoan', 'vi_dien_tu').required(),
});

const capNhatTrangThai = Joi.object({
  trangThai: Joi.string().valid('cho_thanh_toan', 'da_thanh_toan', 'that_bai').required(),
});

module.exports = { taoThanhToan, capNhatTrangThai };
