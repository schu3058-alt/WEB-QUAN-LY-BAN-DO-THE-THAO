const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
const cauHinhChung = require('../backend/cauHinh/cauHinhChung');

const sanPham = [
  { ten: 'Giày chạy bộ Pro X', moTa: 'Giày chạy bộ nhẹ, đệm khí tốt, phù hợp tập luyện hằng ngày.', gia: 1290000, soLuongTon: 50, danhMucId: 1, anh: 'giay-chay-bo-pro-x', loai: 'giay-chay', mau: '#fa654b' },
  { ten: 'Áo thun thể thao thoáng khí', moTa: 'Chất liệu polyester thoát mồ hôi, thoải mái khi vận động.', gia: 250000, soLuongTon: 100, danhMucId: 2, anh: 'ao-thun-the-thao-thoang-khi', loai: 'ao-thun', mau: '#238e75' },
  { ten: 'Tạ tay 2kg (cặp đôi)', moTa: 'Cặp tạ tay bọc cao su, chống trượt, phù hợp tập thể lực tại nhà.', gia: 180000, soLuongTon: 60, danhMucId: 3, anh: 'ta-tay-2kg', loai: 'ta-tay', mau: '#6877d8' },
  { ten: 'Bóng đá size 5', moTa: 'Bóng đá size 5 tiêu chuẩn, phù hợp tập luyện và thi đấu.', gia: 350000, soLuongTon: 80, danhMucId: 4, anh: 'bong-da-size-5', loai: 'bong-da', mau: '#ef7048' },
  { ten: 'Giày đá bóng sân cỏ nhân tạo', moTa: 'Đế đinh TF bám sân, thân giày ôm chân cho các trận bóng đá.', gia: 890000, soLuongTon: 35, danhMucId: 1, anh: 'giay-da-bong-san-co-nhan-tao', loai: 'giay-da-bong', mau: '#4a79d0' },
  { ten: 'Giày bóng rổ cổ cao', moTa: 'Giày bóng rổ cổ cao hỗ trợ cổ chân và bám sàn tốt.', gia: 1590000, soLuongTon: 24, danhMucId: 1, anh: 'giay-bong-ro-co-cao', loai: 'giay-bong-ro', mau: '#e69b36' },
  { ten: 'Giày tennis Court Flex', moTa: 'Giày tennis đế bám sân, thân lưới nhẹ và thoáng khí.', gia: 1190000, soLuongTon: 28, danhMucId: 1, anh: 'giay-tennis-court-flex', loai: 'giay-tennis', mau: '#43a982' },
  { ten: 'Giày đi bộ Everyday', moTa: 'Giày đi bộ đệm êm, thiết kế nhẹ cho những chuyến đi dài.', gia: 790000, soLuongTon: 40, danhMucId: 1, anh: 'giay-di-bo-everyday', loai: 'giay-di-bo', mau: '#8970c9' },
  { ten: 'Giày leo núi Trail Grip', moTa: 'Giày leo núi đế gai chống trượt, bảo vệ bàn chân trên đường mòn.', gia: 1390000, soLuongTon: 18, danhMucId: 1, anh: 'giay-leo-nui-trail-grip', loai: 'giay-leo-nui', mau: '#b06a48' },
  { ten: 'Áo bóng đá sân nhà', moTa: 'Áo bóng đá vải lưới thoáng khí, thoải mái khi thi đấu.', gia: 320000, soLuongTon: 55, danhMucId: 2, anh: 'ao-bong-da-san-nha', loai: 'ao-bong-da', mau: '#e94d4d' },
  { ten: 'Quần short chạy bộ', moTa: 'Quần short chạy bộ nhẹ, nhanh khô, có túi đựng vật dụng nhỏ.', gia: 210000, soLuongTon: 48, danhMucId: 2, anh: 'quan-short-chay-bo', loai: 'quan-short', mau: '#5271bd' },
  { ten: 'Quần legging tập gym', moTa: 'Quần legging co giãn bốn chiều, ôm gọn khi tập gym và yoga.', gia: 390000, soLuongTon: 32, danhMucId: 2, anh: 'quan-legging-tap-gym', loai: 'quan-legging', mau: '#755ab2' },
  { ten: 'Áo khoác thể thao chống gió', moTa: 'Áo khoác nhẹ chống gió, thích hợp khởi động và chạy ngoài trời.', gia: 650000, soLuongTon: 21, danhMucId: 2, anh: 'ao-khoac-chong-gio', loai: 'ao-khoac', mau: '#478c82' },
  { ten: 'Áo hoodie tập luyện', moTa: 'Áo hoodie thể thao mềm nhẹ, giữ ấm trước và sau buổi tập.', gia: 520000, soLuongTon: 26, danhMucId: 2, anh: 'ao-hoodie-tap-luyen', loai: 'ao-hoodie', mau: '#d16f47' },
  { ten: 'Dây nhảy tốc độ', moTa: 'Dây nhảy có thể điều chỉnh độ dài, phù hợp luyện tập cardio.', gia: 120000, soLuongTon: 70, danhMucId: 3, anh: 'day-nhay-toc-do', loai: 'day-nhay', mau: '#db5757' },
  { ten: 'Thảm tập yoga 6mm', moTa: 'Thảm yoga dày 6mm, bề mặt chống trượt và dễ cuộn mang theo.', gia: 290000, soLuongTon: 38, danhMucId: 3, anh: 'tham-tap-yoga-6mm', loai: 'tham-yoga', mau: '#41a188' },
  { ten: 'Bộ dây kháng lực 5 mức', moTa: 'Bộ dây kháng lực nhiều mức lực cho các bài tập sức mạnh.', gia: 260000, soLuongTon: 44, danhMucId: 3, anh: 'bo-day-khang-luc', loai: 'day-khang-luc', mau: '#8164c7' },
  { ten: 'Con lăn massage cơ', moTa: 'Con lăn massage giúp thư giãn cơ sau buổi tập và vận động.', gia: 230000, soLuongTon: 30, danhMucId: 3, anh: 'con-lan-massage-co', loai: 'con-lan', mau: '#e18b3e' },
  { ten: 'Bóng rổ size 7', moTa: 'Bóng rổ size 7 có bề mặt vân bám tay, phù hợp tập luyện.', gia: 420000, soLuongTon: 36, danhMucId: 4, anh: 'bong-ro-size-7', loai: 'bong-ro', mau: '#d98732' },
  { ten: 'Bóng chuyền thi đấu', moTa: 'Bóng chuyền mềm, đường may chắc chắn cho tập luyện và thi đấu.', gia: 380000, soLuongTon: 27, danhMucId: 4, anh: 'bong-chuyen-thi-dau', loai: 'bong-chuyen', mau: '#51a6c7' },
  { ten: 'Bóng tennis (ống 3 quả)', moTa: 'Bóng tennis nảy ổn định, gồm ba quả trong một ống đựng.', gia: 190000, soLuongTon: 60, danhMucId: 4, anh: 'bong-tennis-3-qua', loai: 'bong-tennis', mau: '#a7bd3f' },
  { ten: 'Quả cầu lông thi đấu', moTa: 'Ống cầu lông lông vũ có đường bay ổn định khi thi đấu.', gia: 150000, soLuongTon: 42, danhMucId: 4, anh: 'qua-cau-long-thi-dau', loai: 'cau-long', mau: '#78a96b' },
  { ten: 'Bóng đá futsal trong nhà', moTa: 'Bóng futsal size 4 có độ nảy thấp, phù hợp sân bóng trong nhà.', gia: 390000, soLuongTon: 25, danhMucId: 4, anh: 'bong-da-futsal', loai: 'bong-da', mau: '#5684d4' },
  { ten: 'Bộ tạ tay 2 quả 3kg', moTa: 'Bộ hai tạ tay bọc cao su, tiện tập luyện sức mạnh tại nhà.', gia: 340000, soLuongTon: 20, danhMucId: 3, anh: 'bo-ta-tay-3kg', loai: 'ta-tay', mau: '#d15a68' },
];

const xml = (giaTri) => giaTri.replace(/[<>&"']/g, (kyTu) => ({
  '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;',
}[kyTu]));

function veMonTheThao(loai, mau) {
  const net = '#273941';
  const giay = `<path d="M104 208c24-6 39-22 48-52l43-13c14 34 32 50 67 59l119 24c18 4 28 14 28 29v13H104z" fill="${mau}" stroke="${net}" stroke-width="7" stroke-linejoin="round"/><path d="M104 251h305c-3 22-18 32-40 32H141c-21 0-34-11-37-32z" fill="#fff" stroke="${net}" stroke-width="7"/><path d="m198 165 57 39m-76-17 54 38m-76-16 49 35" fill="none" stroke="#fff" stroke-width="9" stroke-linecap="round"/><path d="M145 267h240" stroke="${mau}" stroke-width="7" stroke-linecap="round"/>`;
  const ao = `<path d="m200 120 45 19 45-19 48 36-30 40-18-12v104H200V184l-18 12-30-40z" fill="${mau}" stroke="${net}" stroke-width="7" stroke-linejoin="round"/><path d="M226 125c0 24 38 24 38 0M205 204h80" fill="none" stroke="#fff" stroke-width="8" stroke-linecap="round"/>`;
  const bong = (nen, kieu) => {
    let duongNet = '';
    if (kieu === 'bong-da') duongNet = `<path d="m238 143 30-18 30 18-11 34h-38zm-41 53 30-19m82 19-30-19m-22 64v-64m-52 17-17 30m109-30 17 30" fill="${net}" stroke="${net}" stroke-width="9" stroke-linejoin="round"/>`;
    if (kieu === 'bong-ro') duongNet = `<path d="M267 117c-30 27-44 62-44 98s14 71 44 98m2-196c30 27 44 62 44 98s-14 71-44 98M173 215h188M194 150c46 35 99 35 146 0m-146 130c46-35 99-35 146 0" fill="none" stroke="${net}" stroke-width="8"/>`;
    if (kieu === 'bong-chuyen') duongNet = `<path d="M194 143c44 35 69 83 74 170m61-150c-59 23-100 65-123 132m-34-42c55 13 116 1 173-36m-157-91c25 30 41 62 47 98" fill="none" stroke="#fff" stroke-width="10"/>`;
    if (kieu === 'bong-tennis') duongNet = `<path d="M184 147c45 31 62 72 51 119-6 23-19 43-38 59m136-177c-45 31-62 72-51 119 6 23 19 43 38 59" fill="none" stroke="#fff" stroke-width="12"/>`;
    return `<circle cx="268" cy="215" r="105" fill="${nen}" stroke="${net}" stroke-width="7"/>${duongNet}`;
  };

  switch (loai) {
    case 'giay-chay':
    case 'giay-di-bo':
    case 'giay-tennis':
    case 'giay-leo-nui':
    case 'giay-da-bong':
    case 'giay-bong-ro':
      return giay + (loai === 'giay-da-bong' ? `<path d="m342 247 13-8m-31 6 13-8m-31 6 13-8" stroke="#fff" stroke-width="6" stroke-linecap="round"/>` : '');
    case 'ao-thun':
    case 'ao-bong-da':
    case 'ao-khoac':
      return ao + (loai === 'ao-bong-da' ? `<path d="M223 172h44v24h-44z" fill="#fff" opacity=".9"/><text x="245" y="190" text-anchor="middle" fill="${mau}" font-size="17" font-weight="700">10</text>` : '');
    case 'quan-short':
      return `<path d="M198 139h140l-12 98h-48l-10-49-10 49h-48z" fill="${mau}" stroke="${net}" stroke-width="7" stroke-linejoin="round"/><path d="M198 139v-15h140v15m-140 5h140m-70 0v34m-55-12 12 13m86-13-12 13m-50 41-2 13m44-13 2 13" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>`;
    case 'quan-legging':
      return `<path d="M204 139h128l-7 58-15 108h-43l-9-112-9 112h-43l-15-108z" fill="${mau}" stroke="${net}" stroke-width="7" stroke-linejoin="round"/><path d="M204 139v-15h128v15m-128 5h128m-64 0v39m-42-9 11 11m83-11-11 11m-72 96 42 1m30-1-42 1" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>`;
    case 'ao-hoodie':
      return `<path d="M221 137c-4-47 89-47 85 0l39 20 27 113-53 12-13-84v108h-85V198l-13 84-53-12 27-113z" fill="${mau}" stroke="${net}" stroke-width="7" stroke-linejoin="round"/><path d="M221 137c17 28 66 28 85 0m-43 16v104m-19-3h38" fill="none" stroke="#fff" stroke-width="7"/>`;
    case 'ta-tay':
      return `<g transform="rotate(-20 268 210)"><rect x="250" y="145" width="36" height="145" rx="15" fill="#fff" stroke="${net}" stroke-width="7"/><rect x="198" y="125" width="52" height="185" rx="21" fill="${mau}" stroke="${net}" stroke-width="7"/><rect x="286" y="125" width="52" height="185" rx="21" fill="${mau}" stroke="${net}" stroke-width="7"/></g>`;
    case 'day-nhay':
      return `<path d="M184 151c-71 53-74 149 7 151m161-151c71 53 74 149-7 151M185 151c48 47 223 47 334 0M191 302c52-47 230-47 328 0" fill="none" stroke="${mau}" stroke-width="9"/><rect x="166" y="136" width="22" height="57" rx="10" fill="#fff" stroke="${net}" stroke-width="6"/><rect x="350" y="136" width="22" height="57" rx="10" fill="#fff" stroke="${net}" stroke-width="6"/>`;
    case 'tham-yoga':
      return `<path d="M190 142h129a54 54 0 0 1 0 108H190z" fill="${mau}" stroke="${net}" stroke-width="7"/><ellipse cx="190" cy="196" rx="28" ry="54" fill="#fff" stroke="${net}" stroke-width="7"/><ellipse cx="190" cy="196" rx="12" ry="32" fill="${mau}" stroke="${net}" stroke-width="5"/><path d="M232 156v80m22-80v80m22-80v80" stroke="#fff" stroke-width="5" opacity=".8"/>`;
    case 'day-khang-luc':
      return `<path d="M185 166h38v102h-38c-25 0-25-102 0-102zm128 0h38v102h-38c-25 0-25-102 0-102z" fill="${mau}" stroke="${net}" stroke-width="7"/><path d="M218 178h107m-107 28h107m-107 28h107" stroke="#fff" stroke-width="8" stroke-linecap="round"/><rect x="155" y="152" width="30" height="131" rx="13" fill="#fff" stroke="${net}" stroke-width="6"/><rect x="346" y="152" width="30" height="131" rx="13" fill="#fff" stroke="${net}" stroke-width="6"/>`;
    case 'con-lan':
      return `<g transform="rotate(-18 268 214)"><rect x="192" y="136" width="151" height="160" rx="30" fill="${mau}" stroke="${net}" stroke-width="7"/><path d="M214 145v143m27-151v158m27-158v158m27-158v158m27-153v148" stroke="#fff" stroke-width="8" stroke-linecap="round" opacity=".85"/><path d="M192 176h151m-151 40h151m-151 40h151" stroke="${net}" stroke-width="5" opacity=".7"/></g>`;
    case 'bong-da':
    case 'bong-ro':
    case 'bong-chuyen':
      return bong(mau, loai);
    case 'cau-long':
      return `<path d="m203 150 106 105m-115-77 90 91m-58-133 92 92m-134-52 51 51" stroke="#fff" stroke-width="10"/><path d="m195 139 39-24 94 94-27 39z" fill="#fff" stroke="${net}" stroke-width="7" stroke-linejoin="round"/><path d="m195 139 56 57m-36-69 62 62m-42-74 68 68" stroke="${mau}" stroke-width="6"/><circle cx="322" cy="250" r="28" fill="${mau}" stroke="${net}" stroke-width="7"/>`;
    default:
      return bong(mau, 'bong-da');
  }
}

function taoAnh(sanPham) {
  const cacTu = sanPham.ten.split(/\s+/);
  let dongDau = sanPham.ten;
  let dongCuoi = '';
  if (cacTu.length > 4) {
    const diemCat = Math.ceil(cacTu.length / 2);
    dongDau = cacTu.slice(0, diemCat).join(' ');
    dongCuoi = cacTu.slice(diemCat).join(' ');
  }
  const tieuDe = xml(sanPham.ten);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480" role="img" aria-labelledby="tieu-de">
  <title id="tieu-de">${tieuDe}</title>
  <defs><linearGradient id="nen" x2="1" y2="1"><stop stop-color="#f2f7f3"/><stop offset="1" stop-color="#dceae2"/></linearGradient><filter id="bong" x="-30%" y="-30%" width="160%" height="180%"><feDropShadow dx="0" dy="10" stdDeviation="9" flood-color="#26443a" flood-opacity=".16"/></filter></defs>
  <rect width="640" height="480" rx="30" fill="url(#nen)"/>
  <circle cx="536" cy="91" r="76" fill="${sanPham.mau}" opacity=".1"/>
  <circle cx="98" cy="343" r="98" fill="${sanPham.mau}" opacity=".08"/>
  <rect x="32" y="28" width="576" height="424" rx="24" fill="none" stroke="#fff" stroke-width="3" opacity=".8"/>
  <g filter="url(#bong)">${veMonTheThao(sanPham.loai, sanPham.mau)}</g>
  <path d="M42 363h556" stroke="#aec5b8" stroke-width="2"/>
  <text x="320" y="400" text-anchor="middle" fill="#243a32" font-family="Arial,sans-serif" font-size="25" font-weight="700">${xml(dongDau)}</text>
  ${dongCuoi ? `<text x="320" y="432" text-anchor="middle" fill="#243a32" font-family="Arial,sans-serif" font-size="23" font-weight="700">${xml(dongCuoi)}</text>` : ''}
  <text x="320" y="343" text-anchor="middle" fill="#587166" font-family="Arial,sans-serif" font-size="16" letter-spacing="3">SPORTSHOP</text>
</svg>\n`;
}

const thuMucDuAn = path.resolve(__dirname, '..');
const thuMucAnh = path.join(thuMucDuAn, 'frontend', 'hinh-anh-san-pham');
fs.mkdirSync(thuMucAnh, { recursive: true });

const duongDanDauTien = '/hinh-anh-san-pham/';
const sanPhamMacDinh = {
  ten: 'Sản phẩm thể thao',
  loai: 'bong-da',
  mau: '#238e75',
  anh: 'san-pham-placeholder',
};
fs.writeFileSync(path.join(thuMucAnh, `${sanPhamMacDinh.anh}.svg`), taoAnh(sanPhamMacDinh), 'utf8');
sanPham.forEach((muc) => {
  fs.writeFileSync(path.join(thuMucAnh, `${muc.anh}.svg`), taoAnh(muc), 'utf8');
});

const duongDanCsdl = path.resolve(thuMucDuAn, cauHinhChung.duongDanCsdl);
const coSoDuLieu = new Database(duongDanCsdl);
try {
  coSoDuLieu.pragma('foreign_keys = ON');
  const luuSanPham = coSoDuLieu.prepare(`
    INSERT INTO san_pham (ten, moTa, gia, soLuongTon, danhMucId, hinhAnh)
    VALUES (@ten, @moTa, @gia, @soLuongTon, @danhMucId, @hinhAnh)
  `);
  const capNhatAnh = coSoDuLieu.prepare('UPDATE san_pham SET hinhAnh = ? WHERE id = ?');
  const timTheoTen = coSoDuLieu.prepare('SELECT id FROM san_pham WHERE ten = ?');
  const themHoacCapNhat = coSoDuLieu.transaction(() => {
    let soSanPhamMoi = 0;
    for (const muc of sanPham) {
      const hinhAnh = `${duongDanDauTien}${muc.anh}.svg`;
      const hienCo = timTheoTen.get(muc.ten);
      if (hienCo) {
        capNhatAnh.run(hinhAnh, hienCo.id);
      } else {
        luuSanPham.run({ ...muc, hinhAnh });
        soSanPhamMoi += 1;
      }
    }
    return soSanPhamMoi;
  });

  const soSanPhamMoi = themHoacCapNhat();
  console.log(`Da them ${soSanPhamMoi} san pham moi; anh SVG da duoc luu tai ${path.relative(thuMucDuAn, thuMucAnh)}.`);
} finally {
  coSoDuLieu.close();
}
