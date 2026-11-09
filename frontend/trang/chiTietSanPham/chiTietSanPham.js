import { api } from '../../dungChung/api.js';
import { dinhDangNgay } from '../../dungChung/dinhDang.js';
import { hienThiThongBao, taoTheTrong, themVaoGio, thoatHtml, xuLyLoi } from '../../dungChung/giaoDien.js';

document.addEventListener('DOMContentLoaded', async () => {
  const id = Number(location.pathname.split('/').filter(Boolean).pop() || new URLSearchParams(location.search).get('id'));
  const vungChiTiet = document.querySelector('#chi-tiet-san-pham');
  const vungDanhGia = document.querySelector('#danh-sach-danh-gia');
  const formDanhGia = document.querySelector('#form-danh-gia');
  const thongBao = document.querySelector('#thong-bao-chi-tiet');
  if (!Number.isInteger(id) || id < 1) {
    hienThiThongBao(thongBao, 'Đường dẫn sản phẩm không hợp lệ.', 'loi');
    return;
  }

  async function taiDanhGia() {
    const danhGia = await api.get(`/danh-gia/san-pham/${id}`);
    if (!danhGia.length) {
      vungDanhGia.replaceChildren(taoTheTrong('Sản phẩm chưa có đánh giá.'));
      return;
    }
    vungDanhGia.innerHTML = danhGia.map((muc) => `
      <article class="the khung-noi-dung">
        <strong>${thoatHtml(muc.hoTen || 'Khách hàng')} · ${'★'.repeat(Number(muc.soSao))}</strong>
        <p>${thoatHtml(muc.noiDung || 'Không có nhận xét.')}</p>
        <small>${thoatHtml(dinhDangNgay(muc.ngayTao))}</small>
      </article>
    `).join('');
  }

  try {
    const sanPham = await api.get(`/san-pham/${id}`);
    document.title = `${sanPham.ten} | SportShop`;
    vungChiTiet.innerHTML = `
      <img src="${thoatHtml(sanPham.hinhAnh || '/hinh-anh-san-pham/san-pham-placeholder.svg')}" alt="${thoatHtml(sanPham.ten)}">
      <div>
        <p class="mo-ta">${thoatHtml(sanPham.tenDanhMuc || 'Đồ thể thao')}</p>
        <h1>${thoatHtml(sanPham.ten)}</h1>
        <p class="gia-lon">${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(sanPham.gia)}</p>
        <p>${thoatHtml(sanPham.moTa || 'Sản phẩm thể thao chất lượng cao.')}</p>
        <p>Tồn kho: ${Number(sanPham.soLuongTon)} · ${sanPham.trangThai === 'dang_ban' ? 'Đang kinh doanh' : 'Tạm ngừng kinh doanh'}</p>
        <label class="truong">Số lượng
          <input id="so-luong-mua" type="number" min="1" max="${Math.max(1, Number(sanPham.soLuongTon))}" value="1">
        </label>
        <button id="nut-them-gio" class="nut" type="button" ${sanPham.trangThai !== 'dang_ban' || Number(sanPham.soLuongTon) < 1 ? 'disabled' : ''}>Thêm vào giỏ hàng</button>
      </div>
    `;
    document.querySelector('#nut-them-gio').addEventListener('click', async () => {
      try {
        await themVaoGio(id, document.querySelector('#so-luong-mua').value);
      } catch (loi) {
        xuLyLoi(thongBao, loi);
      }
    });
  } catch (loi) {
    xuLyLoi(thongBao, loi);
    vungChiTiet.replaceChildren(taoTheTrong('Không thể tải thông tin sản phẩm.'));
    return;
  }

  try {
    await taiDanhGia();
  } catch (loi) {
    xuLyLoi(thongBao, loi);
    vungDanhGia.replaceChildren(taoTheTrong('Không thể tải đánh giá sản phẩm.'));
  }

  formDanhGia.addEventListener('submit', async (suKien) => {
    suKien.preventDefault();
    const duLieu = new FormData(formDanhGia);
    try {
      await api.post('/danh-gia', {
        sanPhamId: id,
        soSao: Number(duLieu.get('soSao')),
        noiDung: duLieu.get('noiDung'),
      });
      formDanhGia.reset();
      hienThiThongBao(thongBao, 'Cảm ơn bạn đã đánh giá sản phẩm.');
      await taiDanhGia();
    } catch (loi) {
      xuLyLoi(thongBao, loi);
    }
  });
});
