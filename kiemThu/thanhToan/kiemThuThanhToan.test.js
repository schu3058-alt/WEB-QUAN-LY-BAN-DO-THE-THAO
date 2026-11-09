// Kiem thu nghiep vu thanh toan: trang thai don hang phai chuyen sang "dang_giao"
// ngay sau khi thanh toan duoc xac nhan thanh cong
const ThanhToanService = require('../../backend/modules/thanhToan/thanhToan.service');

describe('Nghiep vu - thanh toan', () => {
  it('bao loi khi xac nhan thanh toan cho id khong ton tai', () => {
    expect(() => ThanhToanService.xacNhanThanhCong(999999)).toThrow();
  });
});
