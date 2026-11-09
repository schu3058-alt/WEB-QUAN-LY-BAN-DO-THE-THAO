require('dotenv').config();

const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const cauHinhChung = require('../backend/cauHinh/cauHinhChung');
const cauHinhBaoMat = require('../backend/cauHinh/cauHinhBaoMat');

const duongDanCsdl = path.resolve(__dirname, '..', cauHinhChung.duongDanCsdl);
fs.mkdirSync(path.dirname(duongDanCsdl), { recursive: true });

const coSoDuLieu = new Database(duongDanCsdl);
try {
  coSoDuLieu.pragma('foreign_keys = ON');
  coSoDuLieu.exec(fs.readFileSync(path.join(__dirname, 'taoBang.sql'), 'utf8'));
  coSoDuLieu.exec(fs.readFileSync(path.join(__dirname, 'chiMuc.sql'), 'utf8'));
  coSoDuLieu.exec(fs.readFileSync(path.join(__dirname, 'rangBuoc.sql'), 'utf8'));

  if (process.argv.includes('--seed')) {
    if (cauHinhChung.moiTruong === 'production') {
      throw new Error('Khong nap tai khoan va du lieu demo trong moi truong production.');
    }
    const daCoDuLieu = ['tai_khoan', 'danh_muc', 'san_pham', 'khuyen_mai']
      .some((bang) => coSoDuLieu.prepare(`SELECT EXISTS (SELECT 1 FROM ${bang}) AS daCo`).get().daCo);
    if (daCoDuLieu) {
      throw new Error('Khong nap du lieu mau vao co so du lieu da co du lieu.');
    }
    coSoDuLieu.transaction(() => {
      coSoDuLieu.exec(fs.readFileSync(path.join(__dirname, 'duLieuMau.sql'), 'utf8'));
      const capNhatMatKhau = coSoDuLieu.prepare('UPDATE tai_khoan SET matKhauMaHoa = ? WHERE email = ?');
      capNhatMatKhau.run(bcrypt.hashSync('SportShopAdmin123!', cauHinhBaoMat.soVongMaHoaMatKhau), 'admin@sportshop.vn');
      capNhatMatKhau.run(bcrypt.hashSync('SportShopUser123!', cauHinhBaoMat.soVongMaHoaMatKhau), 'khachhang1@sportshop.vn');
    })();
  }
} finally {
  coSoDuLieu.close();
}
console.log(`Da khoi tao co so du lieu SportShop: ${duongDanCsdl}`);
