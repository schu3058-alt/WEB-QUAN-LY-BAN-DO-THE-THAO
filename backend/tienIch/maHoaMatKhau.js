// Ma hoa va so sanh mat khau bang bcrypt
const bcrypt = require('bcryptjs');
const { soVongMaHoaMatKhau } = require('../cauHinh/cauHinhBaoMat');

async function maHoa(matKhauGoc) {
  return bcrypt.hash(matKhauGoc, soVongMaHoaMatKhau);
}

async function soSanh(matKhauGoc, matKhauDaMaHoa) {
  return bcrypt.compare(matKhauGoc, matKhauDaMaHoa);
}

module.exports = { maHoa, soSanh };
