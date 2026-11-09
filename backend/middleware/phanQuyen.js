// Middleware kiem tra vai tro nguoi dung truoc khi cho truy cap route
function phanQuyen(...vaiTroChoPhep) {
  return (yeuCau, phanHoi, tiepTheo) => {
    if (!yeuCau.nguoiDung) {
      return phanHoi.status(401).json({ thanhCong: false, thongBao: 'Chưa xác thực' });
    }
    if (!vaiTroChoPhep.includes(yeuCau.nguoiDung.vaiTro)) {
      return phanHoi.status(403).json({ thanhCong: false, thongBao: 'Không có quyền truy cập chức năng này' });
    }
    return tiepTheo();
  };
}

module.exports = phanQuyen;
