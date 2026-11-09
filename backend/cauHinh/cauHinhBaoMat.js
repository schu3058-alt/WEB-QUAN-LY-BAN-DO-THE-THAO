// Cau hinh lien quan bao mat: JWT, ma hoa mat khau, gioi han yeu cau
require('dotenv').config();

const moiTruong = process.env.NODE_ENV || 'development';
const jwtSecret = process.env.JWT_SECRET;

if (moiTruong === 'production' && (!jwtSecret || jwtSecret === 'doi_chuoi_bi_mat_nay_truoc_khi_trien_khai')) {
  throw new Error('JWT_SECRET phải được cấu hình bằng một giá trị riêng trước khi chạy production');
}

const cauHinhBaoMat = {
  jwtSecret: jwtSecret || 'doi_chuoi_bi_mat_nay',
  jwtHetHan: process.env.JWT_HET_HAN || '7d',
  soVongMaHoaMatKhau: Number(process.env.SO_VONG_MA_HOA_MAT_KHAU) || 10,
  gioiHanSoYeuCau: Number(process.env.GIOI_HAN_SO_YEU_CAU) || 100,
  gioiHanThoiGianMs: Number(process.env.GIOI_HAN_THOI_GIAN_MS) || 15 * 60 * 1000,
};

module.exports = cauHinhBaoMat;
