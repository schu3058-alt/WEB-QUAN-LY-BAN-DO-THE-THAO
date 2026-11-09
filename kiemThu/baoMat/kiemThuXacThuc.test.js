// Kiem thu bao mat: cac route can dang nhap phai tu choi khi thieu token
const request = require('supertest');
const ungDung = require('../../backend/ungDung');

describe('Bao mat - xac thuc', () => {
  it('tu choi truy cap gio hang khi khong co token', async () => {
    const phanHoi = await request(ungDung).get('/api/gio-hang');
    expect(phanHoi.status).toBe(401);
  });

  it('tu choi tao san pham khi khong co quyen quan tri', async () => {
    const phanHoi = await request(ungDung)
      .post('/api/san-pham')
      .send({ ten: 'San pham test', gia: 100000, soLuongTon: 1, danhMucId: 1 });
    expect(phanHoi.status).toBe(401);
  });
});
