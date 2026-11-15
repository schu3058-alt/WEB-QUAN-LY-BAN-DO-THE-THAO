// Cau hinh lien quan bao mat: JWT, ma hoa mat khau, gioi han yeu cau
require('dotenv').config();

const moiTruong = process.env.NODE_ENV || 'development';
const jwtSecret = process.env.JWT_SECRET?.trim();
const cacSecretMacDinh = [
  'doi_chuoi_bi_mat_nay',
  'doi_chuoi_bi_mat_nay_truoc_khi_trien_khai',
];

if (
  !jwtSecret ||
  Buffer.byteLength(jwtSecret, 'utf8') < 32 ||
  cacSecretMacDinh.includes(jwtSecret)
) {
  throw new Error(`JWT_SECRET phải là giá trị riêng tư, ngẫu nhiên và có ít nhất 32 byte (môi trường: ${moiTruong})`);
}

const cauHinhBaoMat = {
  jwtSecret,
  jwtHetHan: process.env.JWT_HET_HAN || '7d',
  soVongMaHoaMatKhau: Number(process.env.SO_VONG_MA_HOA_MAT_KHAU) || 10,
  gioiHanSoYeuCau: Number(process.env.GIOI_HAN_SO_YEU_CAU) || 100,
  gioiHanThoiGianMs: Number(process.env.GIOI_HAN_THOI_GIAN_MS) || 15 * 60 * 1000,
};

module.exports = cauHinhBaoMat;
