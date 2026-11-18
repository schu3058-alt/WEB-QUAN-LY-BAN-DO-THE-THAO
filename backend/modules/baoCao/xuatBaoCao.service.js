// Service xuất báo cáo Excel và PDF (Chuẩn SQLite 3 - better-sqlite3)
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');

const xuatBaoCaoService = {
  async xuatTonKhoExcel(danhSachTonKho, res) {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('BaoCaoTonKho');

    sheet.columns = [
      { header: 'Mã SKU', key: 'sku', width: 20 },
      { header: 'Tên sản phẩm', key: 'tenSanPham', width: 35 },
      { header: 'Kích cỡ', key: 'kichCo', width: 12 },
      { header: 'Màu sắc', key: 'mauSac', width: 15 },
      { header: 'Tồn kho', key: 'soLuongTon', width: 12 },
      { header: 'Mức cảnh báo', key: 'mucCanhBaoTon', width: 15 }
    ];
    
    sheet.getRow(1).font = { bold: true };
    sheet.addRows(danhSachTonKho);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=bao-cao-ton-kho.xlsx');
    await workbook.xlsx.write(res);
    res.end();
  },

  xuatDoanhThuPDF(duLieuDoanhThu, res) {
    const doc = new PDFDocument({ margin: 40 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=bao-cao-doanh-thu.pdf');
    doc.pipe(res);

    doc.fontSize(18).text('SPORTSHOP - BAO CAO DOANH THU', { align: 'center' });
    doc.moveDown();
    
    duLieuDoanhThu.forEach((dong, idx) => {
      // Khớp chuẩn các key: dong.ngay, dong.soDon, dong.doanhThu
      const ngayStr = dong.ngay || dong.Ngay || 'N/A';
      const soDonVal = dong.soDon || dong.SoDon || 0;
      const doanhThuVal = dong.doanhThu || dong.DoanhThu || 0;

      doc.fontSize(11).text(
        `${idx + 1}. Ngày: ${ngayStr} | Số đơn: ${soDonVal} | Doanh thu: ${Number(doanhThuVal).toLocaleString('vi-VN')} VND`
      );
    });
    
    doc.end();
  }
};

module.exports = xuatBaoCaoService;