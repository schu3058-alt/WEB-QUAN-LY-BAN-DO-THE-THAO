// Kiem thu tich hop cac API chinh bang supertest + jest
const request = require('supertest');
const ungDung = require('../../backend/ungDung');

describe('API tai khoan', () => {
  it('tu choi dang nhap voi tai khoan khong ton tai', async () => {
    const phanHoi = await request(ungDung)
      .post('/api/tai-khoan/dang-nhap')
      .send({ email: 'khong-ton-tai@sportshop.vn', matKhau: 'sai-mat-khau' });

    expect(phanHoi.status).toBe(401);
    expect(phanHoi.body.thanhCong).toBe(false);
  });
});

describe('API san pham', () => {
  it('tra ve danh sach san pham dang phan trang', async () => {
    const phanHoi = await request(ungDung).get('/api/san-pham');

    expect(phanHoi.status).toBe(200);
    expect(phanHoi.body.thanhCong).toBe(true);
    expect(phanHoi.body.duLieu).toHaveProperty('danhSach');
    expect(phanHoi.body.duLieu).toHaveProperty('tongSo');
  });
});
