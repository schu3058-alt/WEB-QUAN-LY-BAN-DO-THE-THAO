import { hienThiThongBao, taoTheTrong, thoatHtml, thoatUrlAnh, xuLyLoi } from '../../dungChung/giaoDien.js';
import {
  layIdsSoSanh,
  taiSanPhamTheoIds,
  xoaSanPhamKhoiSoSanh,
  xoaTatCaSoSanh,
} from '../../dungChung/tienIchMuaSam.js';
import { dinhDangTienTe } from '../../dungChung/dinhDang.js';

document.addEventListener('DOMContentLoaded', async () => {
  const vung = document.querySelector('#noi-dung-so-sanh');
  const thongBao = document.querySelector('#thong-bao-so-sanh');

  async function taiDanhSach() {
    hienThiThongBao(thongBao, '');
    const ids = layIdsSoSanh();
    if (!ids.length) {
      vung.replaceChildren(taoTheTrong('Chọn sản phẩm để bắt đầu so sánh.'));
      return;
    }

    const ketQua = await taiSanPhamTheoIds(ids);
    const sanPham = ketQua.danhSach;
    if (ketQua.soSanPhamLoi) {
      hienThiThongBao(thongBao, `Không tải được ${ketQua.soSanPhamLoi} sản phẩm. Vui lòng kiểm tra kết nối và thử lại.`, 'loi');
    }
    if (!sanPham.length) {
      vung.replaceChildren(taoTheTrong('Không có sản phẩm so sánh khả dụng.'));
      return;
    }

    const dong = (nhan, giaTri) => `
      <tr><th scope="row">${nhan}</th>${sanPham.map((muc) => `<td>${giaTri(muc)}</td>`).join('')}</tr>`;
    vung.innerHTML = `
      <div class="bang-khung bang-so-sanh">
        <table>
          <thead><tr><th scope="col">Thông tin</th>${sanPham.map((muc) => `
            <th scope="col"><a href="/san-pham/${Number(muc.id)}">${thoatHtml(muc.ten)}</a></th>`).join('')}</tr></thead>
          <tbody>
            ${dong('Ảnh', (muc) => `<img src="${thoatUrlAnh(muc.hinhAnh)}" alt="${thoatHtml(muc.ten)}">`)}
            ${dong('Giá', (muc) => `<strong>${dinhDangTienTe(muc.gia)}</strong>`)}
            ${dong('Danh mục', (muc) => thoatHtml(muc.tenDanhMuc || '—'))}
            ${dong('Thương hiệu', (muc) => thoatHtml(muc.thuongHieu || '—'))}
            ${dong('Môn thể thao', (muc) => thoatHtml(muc.monTheThao || '—'))}
            ${dong('Size', (muc) => thoatHtml([...new Set((muc.bienThes || []).map((bienThe) => bienThe.kichThuoc).filter(Boolean))].join(', ') || '—'))}
            ${dong('Màu sắc', (muc) => thoatHtml([...new Set((muc.bienThes || []).map((bienThe) => bienThe.mauSac).filter(Boolean))].join(', ') || '—'))}
            ${dong('Tồn kho', (muc) => String(Number(muc.soLuongTon)))}
            ${dong('Mô tả', (muc) => thoatHtml(muc.moTa || '—'))}
            <tr><th scope="row">Thao tác</th>${sanPham.map((muc) => `
              <td><button class="nut nut-phu nut-nho" type="button" data-xoa-so-sanh="${Number(muc.id)}">Bỏ so sánh</button></td>`).join('')}</tr>
          </tbody>
        </table>
      </div>
      <button id="nut-xoa-tat-ca-so-sanh" class="nut nut-nguy-hiem nut-nho" type="button">Xóa danh sách so sánh</button>`;

    vung.querySelectorAll('[data-xoa-so-sanh]').forEach((nut) => {
      nut.addEventListener('click', () => xoaSanPhamKhoiSoSanh(nut.dataset.xoaSoSanh));
    });
    vung.querySelector('#nut-xoa-tat-ca-so-sanh').addEventListener('click', xoaTatCaSoSanh);
  }

  try {
    await taiDanhSach();
  } catch (loi) {
    xuLyLoi(thongBao, loi);
    vung.replaceChildren(taoTheTrong('Không thể tải danh sách so sánh.'));
  }
  window.addEventListener('sportshop:thay-doi-mua-sam', () => {
    taiDanhSach().catch((loi) => xuLyLoi(thongBao, loi));
  });
});
