const coSoDuLieu = require('../cauHinh/ketNoiCoSoDuLieu');

const ghiNhatKy = (doiTuong) => (req, res, next) => {
  res.on('finish', () => {
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method) && res.statusCode < 400) {
      try {
        const bodyAnToan = { ...(req.body || {}) };
        delete bodyAnToan.matKhau;

        coSoDuLieu.prepare(`
          INSERT INTO nhat_ky_hoat_dong (taiKhoanId, hanhDong, doiTuong, duLieuMoi, diaChiIP)
          VALUES (?, ?, ?, ?, ?)
        `).run(
          req.nguoiDung?.id || null,
          `${req.method} ${req.originalUrl}`,
          doiTuong,
          JSON.stringify(bodyAnToan),
          req.ip
        );
      } catch (e) {
        console.error('Lỗi ghi nhật ký hoạt động:', e.message);
      }
    }
  });
  next();
};

module.exports = ghiNhatKy;