const { taoKhuyenMai } = require('../../backend/modules/khuyenMai/khuyenMai.validation');

describe('Kiem tra khuyen mai', () => {
  const khuyenMai = {
    ma: 'GIAMGIA',
    phanTramGiam: 10,
    ngayBatDau: '2025-01-01',
    ngayKetThuc: '2025-01-02',
  };

  it('chap nhan ngay ket thuc sau ngay bat dau', () => {
    expect(taoKhuyenMai.validate(khuyenMai).error).toBeUndefined();
  });

  it('tu choi ngay ket thuc bang hoac truoc ngay bat dau', () => {
    for (const ngayKetThuc of ['2025-01-01', '2024-12-31']) {
      const { error } = taoKhuyenMai.validate({ ...khuyenMai, ngayKetThuc });
      expect(error).toBeDefined();
      expect(error.details[0].message).toBe('"Ngày kết thúc" phải sau "Ngày bắt đầu"');
    }
  });
});
