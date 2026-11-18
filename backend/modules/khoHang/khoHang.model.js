const coSoDuLieu = require('../../cauHinh/ketNoiCoSoDuLieu');

const khoHangModel = {
  taoBienThe(duLieu) {
    const stmt = coSoDuLieu.prepare(`
      INSERT INTO bien_the_san_pham
        (sanPhamId, sku, kichCo, mauSac, maMauHex, giaBan, giaKhuyenMai, soLuongTon, mucCanhBaoTon, hinhAnhUrl)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const info = stmt.run(
      duLieu.sanPhamId,
      duLieu.sku.toUpperCase().trim(),
      duLieu.kichCo,
      duLieu.mauSac,
      duLieu.maMauHex || null,
      duLieu.giaBan,
      duLieu.giaKhuyenMai || null,
      duLieu.soLuongTon || 0,
      duLieu.mucCanhBaoTon || 5,
      duLieu.hinhAnhUrl || null
    );
    return coSoDuLieu.prepare('SELECT * FROM bien_the_san_pham WHERE id = ?').get(info.lastInsertRowid);
  },

  taoPhieuNhapXuat({ loaiPhieu, nguoiThucHienId, donHangId = null, ghiChu = '', danhSachChiTiet }) {
    const thucHienGiaoDich = coSoDuLieu.transaction(() => {
      const maPhieu = `${loaiPhieu}-${Date.now()}`;
      const phieuInfo = coSoDuLieu.prepare(`
        INSERT INTO phieu_nhap_xuat_kho (maPhieu, loaiPhieu, nguoiThucHienId, donHangId, ghiChu)
        VALUES (?, ?, ?, ?, ?)
      `).run(maPhieu, loaiPhieu, nguoiThucHienId, donHangId, ghiChu);

      const phieuId = phieuInfo.lastInsertRowid;

      for (const item of danhSachChiTiet) {
        const bienThe = coSoDuLieu
          .prepare('SELECT id, sku, soLuongTon FROM bien_the_san_pham WHERE id = ?')
          .get(item.bienTheId);

        if (!bienThe) {
          throw new Error(`Không tìm thấy biến thể ID=${item.bienTheId}`);
        }

        const thayDoi = loaiPhieu === 'XUAT' ? -Math.abs(item.soLuong) : Math.abs(item.soLuong);
        const tonSau = bienThe.soLuongTon + thayDoi;

        if (tonSau < 0) {
          const loi = new Error(
            `SKU ${bienThe.sku} không đủ tồn kho (hiện có: ${bienThe.soLuongTon}, yêu cầu xuất: ${Math.abs(thayDoi)})`
          );
          loi.maTrangThai = 409;
          throw loi;
        }

        coSoDuLieu.prepare('UPDATE bien_the_san_pham SET soLuongTon = ? WHERE id = ?').run(tonSau, item.bienTheId);

        coSoDuLieu.prepare(`
          INSERT INTO chi_tiet_nhap_xuat_kho (phieuId, bienTheId, soLuongThayDoi, tonTruoc, tonSau, donGiaNhap)
          VALUES (?, ?, ?, ?, ?, ?)
        `).run(phieuId, item.bienTheId, thayDoi, bienThe.soLuongTon, tonSau, item.donGiaNhap || null);
      }

      return coSoDuLieu.prepare('SELECT * FROM phieu_nhap_xuat_kho WHERE id = ?').get(phieuId);
    });

    return thucHienGiaoDich();
  },

  layDanhSachCanhBaoTonKho() {
    return coSoDuLieu.prepare(`
      SELECT bt.id AS bienTheId, bt.sku, sp.ten AS tenSanPham, bt.kichCo, bt.mauSac,
             bt.soLuongTon, bt.mucCanhBaoTon
      FROM bien_the_san_pham bt
      JOIN san_pham sp ON bt.sanPhamId = sp.id
      WHERE bt.trangThai = 1 AND bt.soLuongTon <= bt.mucCanhBaoTon
      ORDER BY bt.soLuongTon ASC
    `).all();
  },

  layLichSuNhapXuat({ bienTheId, loaiPhieu } = {}) {
    const dieuKien = ['1=1'];
    const thamSo = [];

    if (bienTheId) {
      dieuKien.push('ct.bienTheId = ?');
      thamSo.push(bienTheId);
    }
    if (loaiPhieu) {
      dieuKien.push('p.loaiPhieu = ?');
      thamSo.push(loaiPhieu);
    }

    return coSoDuLieu.prepare(`
      SELECT p.maPhieu, p.loaiPhieu, p.ngayTao, p.ghiChu,
             bt.sku, sp.ten AS tenSanPham, bt.kichCo, bt.mauSac,
             ct.soLuongThayDoi, ct.tonTruoc, ct.tonSau, tk.hoTen AS nguoiThucHien
      FROM chi_tiet_nhap_xuat_kho ct
      JOIN phieu_nhap_xuat_kho p ON ct.phieuId = p.id
      JOIN bien_the_san_pham bt ON ct.bienTheId = bt.id
      JOIN san_pham sp ON bt.sanPhamId = sp.id
      JOIN tai_khoan tk ON p.nguoiThucHienId = tk.id
      WHERE ${dieuKien.join(' AND ')}
      ORDER BY p.ngayTao DESC
    `).all(...thamSo);
  }
};

module.exports = khoHangModel;