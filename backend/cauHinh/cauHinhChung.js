// Cau hinh chung cho toan bo ung dung, doc tu bien moi truong (.env)
require('dotenv').config();

const cauHinhChung = {
  moiTruong: process.env.NODE_ENV || 'development',
  congMayChu: Number(process.env.PORT) || 3000,
  duongDanCsdl: process.env.DUONG_DAN_CSDL || './database/quan_ly_sportshop.sqlite',
};

module.exports = cauHinhChung;
