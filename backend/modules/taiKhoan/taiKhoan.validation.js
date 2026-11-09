// Schema kiem tra du lieu dau vao cho module tai khoan
const Joi = require('joi');

const dangKy = Joi.object({
  hoTen: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().lowercase().trim().required(),
  matKhau: Joi.string().min(6).max(72).required(),
  soDienThoai: Joi.string().pattern(/^[0-9]{9,11}$/).allow('', null),
});

const dangNhap = Joi.object({
  email: Joi.string().email().lowercase().trim().required(),
  matKhau: Joi.string().required(),
});

const capNhatHoSo = Joi.object({
  hoTen: Joi.string().min(2).max(100).required(),
  soDienThoai: Joi.string().pattern(/^[0-9]{9,11}$/).allow('', null),
});

module.exports = { dangKy, dangNhap, capNhatHoSo };
