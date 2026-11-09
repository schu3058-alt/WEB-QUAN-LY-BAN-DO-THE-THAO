// Chuan hoa hinh dang JSON tra ve cho moi API trong he thong
function thanhCong(phanHoi, duLieu = null, thongBao = 'Thành công', maTrangThai = 200) {
  return phanHoi.status(maTrangThai).json({ thanhCong: true, thongBao, duLieu });
}

function thatBai(phanHoi, thongBao = 'Có lỗi xảy ra', maTrangThai = 400, chiTiet = undefined) {
  return phanHoi.status(maTrangThai).json({ thanhCong: false, thongBao, chiTiet });
}

module.exports = { thanhCong, thatBai };
