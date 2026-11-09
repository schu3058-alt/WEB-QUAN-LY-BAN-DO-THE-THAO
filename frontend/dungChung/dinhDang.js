// Cac ham dinh dang dung chung: tien te, ngay thang
export function dinhDangTienTe(soTien) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(soTien || 0);
}

export function dinhDangNgay(chuoiNgay) {
  if (!chuoiNgay) return '';
  const ngay = new Date(chuoiNgay);
  return ngay.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function dinhDangNgayGio(chuoiNgay) {
  if (!chuoiNgay) return '';
  const ngay = new Date(chuoiNgay);
  return ngay.toLocaleString('vi-VN');
}
