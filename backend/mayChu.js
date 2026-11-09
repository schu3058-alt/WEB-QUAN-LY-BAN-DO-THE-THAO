// Diem khoi dong ung dung: lang nghe cong HTTP
const ungDung = require('./ungDung');
const cauHinhChung = require('./cauHinh/cauHinhChung');
const { ghiThongTin, ghiLoi } = require('./tienIch/ghiNhatKy');
const donDonHangQuaHan = require('./tacVuNen/donDonHangChuaThanhToan');
const tongHopDoanhThuHomNay = require('./tacVuNen/tongHopDoanhThuNgay');

ungDung.listen(cauHinhChung.congMayChu, () => {
  ghiThongTin(`SportShop API dang chay tai cong ${cauHinhChung.congMayChu} (moi truong: ${cauHinhChung.moiTruong})`);

  const xuLyLoiTacVu = (tacVu) => {
    try {
      tacVu();
    } catch (loi) {
      ghiLoi(loi);
    }
  };
  xuLyLoiTacVu(donDonHangQuaHan);
  const timerDonQuaHan = setInterval(() => xuLyLoiTacVu(donDonHangQuaHan), 60 * 60 * 1000);
  if (timerDonQuaHan.unref) timerDonQuaHan.unref();

  const lapLichDoanhThuNgay = () => {
    const thoiGianHienTai = new Date();
    const lanChayTiepTheo = new Date(thoiGianHienTai);
    lanChayTiepTheo.setHours(24, 0, 0, 0);
    const timer = setTimeout(() => {
      const ngayCanTongHop = new Date();
      ngayCanTongHop.setDate(ngayCanTongHop.getDate() - 1);
      const ngay = [
        ngayCanTongHop.getFullYear(),
        String(ngayCanTongHop.getMonth() + 1).padStart(2, '0'),
        String(ngayCanTongHop.getDate()).padStart(2, '0'),
      ].join('-');
      xuLyLoiTacVu(() => tongHopDoanhThuHomNay(ngay));
      lapLichDoanhThuNgay();
    }, lanChayTiepTheo.getTime() - thoiGianHienTai.getTime());
    if (timer.unref) timer.unref();
  };
  xuLyLoiTacVu(tongHopDoanhThuHomNay);
  lapLichDoanhThuNgay();
});
