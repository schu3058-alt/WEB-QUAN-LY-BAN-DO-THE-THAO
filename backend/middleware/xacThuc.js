// Middleware xac thuc nguoi dung bang JWT
const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../cauHinh/cauHinhBaoMat');

function xacThuc(yeuCau, phanHoi, tiepTheo) {
  const tieuDe = yeuCau.headers.authorization || '';
  const token = tieuDe.startsWith('Bearer ') ? tieuDe.slice(7) : null;

  if (!token) {
    return phanHoi.status(401).json({ thanhCong: false, thongBao: 'Thiếu mã xác thực' });
  }

  try {
    const payload = jwt.verify(token, jwtSecret);
    yeuCau.nguoiDung = payload; // { id, vaiTro }
    return tiepTheo();
  } catch (loi) {
    return phanHoi.status(401).json({ thanhCong: false, thongBao: 'Mã xác thực không hợp lệ hoặc đã hết hạn' });
  }
}

module.exports = xacThuc;
