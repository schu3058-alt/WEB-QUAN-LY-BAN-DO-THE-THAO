const crypto = require('crypto');
const coSoDuLieu = require('../../cauHinh/ketNoiCoSoDuLieu');

const congThanhToanService = {
  taoGiaoDich({ donHangId, congThanhToan, soTien, idempotencyKey }) {
    const daCo = coSoDuLieu
      .prepare('SELECT * FROM giao_dich_thanh_toan WHERE maThamChieuNoiBo = ?')
      .get(idempotencyKey);

    if (daCo) return daCo;

    const info = coSoDuLieu.prepare(`
      INSERT INTO giao_dich_thanh_toan (donHangId, congThanhToan, maThamChieuNoiBo, soTien)
      VALUES (?, ?, ?, ?)
    `).run(donHangId, congThanhToan, idempotencyKey, soTien);

    return coSoDuLieu.prepare('SELECT * FROM giao_dich_thanh_toan WHERE id = ?').get(info.lastInsertRowid);
  },

  xuLyWebhook({ maThamChieuNoiBo, maGiaoDichDoiTac, soTien, maTrangThai, chuKyNhanDuoc, rawPayload }) {
    const secret = process.env.PAYMENT_WEBHOOK_SECRET || 'sportshop_secret_key';
    const chuKyHopLe = crypto
      .createHmac('sha256', secret)
      .update(`${maThamChieuNoiBo}|${maGiaoDichDoiTac}|${soTien}|${maTrangThai}`)
      .digest('hex');

    if (chuKyNhanDuoc !== chuKyHopLe) {
      throw new Error('Chữ ký Webhook không hợp lệ');
    }

    const thucHien = coSoDuLieu.transaction(() => {
      const gd = coSoDuLieu
        .prepare('SELECT * FROM giao_dich_thanh_toan WHERE maThamChieuNoiBo = ?')
        .get(maThamChieuNoiBo);

      if (!gd) throw new Error('Không tìm thấy giao dịch');

      if (gd.trangThai === 'THANH_CONG') {
        return { daXuLyTruocDo: true, donHangId: gd.donHangId };
      }

      const trangThaiMoi = maTrangThai === '00' ? 'THANH_CONG' : 'THAT_BAI';

      coSoDuLieu.prepare(`
        UPDATE giao_dich_thanh_toan
        SET maGiaoDichDoiTac = ?, trangThai = ?, payloadWebhook = ?, ngayXacNhan = datetime('now')
        WHERE id = ?
      `).run(maGiaoDichDoiTac, trangThaiMoi, JSON.stringify(rawPayload), gd.id);

      if (trangThaiMoi === 'THANH_CONG') {
        coSoDuLieu
          .prepare("UPDATE don_hang SET trangThaiThanhToan = 'DA_THANH_TOAN', trangThai = 'DA_XAC_NHAN' WHERE id = ?")
          .run(gd.donHangId);
      }

      return { daXuLyTruocDo: false, donHangId: gd.donHangId, trangThai: trangThaiMoi };
    });

    return thucHien();
  }
};

module.exports = congThanhToanService;