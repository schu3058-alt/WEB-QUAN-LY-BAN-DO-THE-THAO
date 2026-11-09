// Kiem thu middleware phanQuyen: chi quan_tri moi duoc thao tac voi danh muc/san pham
const phanQuyen = require('../../backend/middleware/phanQuyen');

function taoPhanHoiGia() {
  const phanHoi = {};
  phanHoi.status = (ma) => { phanHoi.maTrangThai = ma; return phanHoi; };
  phanHoi.json = (duLieu) => { phanHoi.duLieu = duLieu; return phanHoi; };
  return phanHoi;
}

describe('Middleware phanQuyen', () => {
  it('chan nguoi dung vai tro khach_hang truy cap route chi danh cho quan_tri', () => {
    const yeuCau = { nguoiDung: { id: 1, vaiTro: 'khach_hang' } };
    const phanHoi = taoPhanHoiGia();
    const tiepTheo = jest.fn();

    phanQuyen('quan_tri')(yeuCau, phanHoi, tiepTheo);

    expect(phanHoi.maTrangThai).toBe(403);
    expect(tiepTheo).not.toHaveBeenCalled();
  });
});
