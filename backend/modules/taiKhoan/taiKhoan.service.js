// Nghiep vu dang ky / dang nhap / quan ly ho so tai khoan
const jwt = require('jsonwebtoken');
const TaiKhoanModel = require('./taiKhoan.model');
const { maHoa, soSanh } = require('../../tienIch/maHoaMatKhau');
const { jwtSecret, jwtHetHan } = require('../../cauHinh/cauHinhBaoMat');

function taoToken(taiKhoan) {
  return jwt.sign({ id: taiKhoan.id, vaiTro: taiKhoan.vaiTro }, jwtSecret, { expiresIn: jwtHetHan });
}

const TaiKhoanService = {
  async dangKy(duLieu) {
    duLieu.email = duLieu.email.trim().toLowerCase();
    const daTonTai = TaiKhoanModel.timTheoEmail(duLieu.email);
    if (daTonTai) {
      const loi = new Error('Email đã được sử dụng');
      loi.maTrangThai = 409;
      throw loi;
    }

    const matKhauMaHoa = await maHoa(duLieu.matKhau);
    const taiKhoan = TaiKhoanModel.taoMoi({ ...duLieu, matKhauMaHoa });
    return { taiKhoan, token: taoToken(taiKhoan) };
  },

  async dangNhap({ email, matKhau }) {
    email = email.trim().toLowerCase();
    const taiKhoan = TaiKhoanModel.timTheoEmail(email);
    if (!taiKhoan) {
      const loi = new Error('Email hoặc mật khẩu không đúng');
      loi.maTrangThai = 401;
      throw loi;
    }

    const khop = await soSanh(matKhau, taiKhoan.matKhauMaHoa);
    if (!khop) {
      const loi = new Error('Email hoặc mật khẩu không đúng');
      loi.maTrangThai = 401;
      throw loi;
    }

    const { matKhauMaHoa, ...taiKhoanAnToan } = taiKhoan;
    return { taiKhoan: taiKhoanAnToan, token: taoToken(taiKhoan) };
  },

  layHoSo(id) {
    const taiKhoan = TaiKhoanModel.timTheoId(id);
    if (!taiKhoan) {
      const loi = new Error('Không tìm thấy tài khoản');
      loi.maTrangThai = 404;
      throw loi;
    }
    return taiKhoan;
  },

  capNhatHoSo(id, duLieu) {
    return TaiKhoanModel.capNhat(id, duLieu);
  },
};

module.exports = TaiKhoanService;
