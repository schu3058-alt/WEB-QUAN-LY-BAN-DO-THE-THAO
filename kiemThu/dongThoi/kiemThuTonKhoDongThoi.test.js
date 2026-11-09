// Kiem thu dieu kien dua (race condition) khi nhieu don hang cung tru ton kho 1 san pham
// Muc tieu: dam bao soLuongTon khong bi am khi co nhieu yeu cau dat hang dong thoi
const SanPhamModel = require('../../backend/modules/sanPham/sanPham.model');
const coSoDuLieu = require('../../backend/cauHinh/ketNoiCoSoDuLieu');

describe('Dong thoi - tru ton kho', () => {
  let sanPhamId;

  beforeEach(() => {
    const ketQua = coSoDuLieu.prepare(
      `INSERT INTO san_pham (ten, gia, soLuongTon, trangThai)
       VALUES ('Kiem thu ton kho dong thoi', 1000, 1, 'dang_ban')`
    ).run();
    sanPhamId = ketQua.lastInsertRowid;
  });

  afterEach(() => {
    coSoDuLieu.prepare('DELETE FROM san_pham WHERE id = ?').run(sanPhamId);
  });

  it('chi cho phep mot yeu cau tru khi ton kho chi con mot san pham', async () => {
    const ketQua = await Promise.allSettled([
      Promise.resolve().then(() => SanPhamModel.giamSoLuongTon(sanPhamId, 1)),
      Promise.resolve().then(() => SanPhamModel.giamSoLuongTon(sanPhamId, 1)),
    ]);
    const soLanThanhCong = ketQua.filter((muc) => muc.status === 'fulfilled').length;
    const sanPham = coSoDuLieu.prepare('SELECT soLuongTon FROM san_pham WHERE id = ?').get(sanPhamId);

    expect(soLanThanhCong).toBe(1);
    expect(sanPham.soLuongTon).toBe(0);
  });
});
