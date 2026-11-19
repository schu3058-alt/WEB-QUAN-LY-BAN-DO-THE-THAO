import { api } from '../../dungChung/api.js';
import { dinhDangNgay } from '../../dungChung/dinhDang.js';
import { hienThiThongBao, taoTheTrong, themVaoGio, thoatHtml, thoatUrlAnh, xuLyLoi } from '../../dungChung/giaoDien.js';
import { ghiNhanSanPhamVuaXem, layIdsVuaXem, taiSanPhamTheoIds } from '../../dungChung/tienIchMuaSam.js';
import { taoTheSanPham, taoNhomTuongTacSanPham } from '../../thanhPhan/thanhPhanTheSanPham.js';

document.addEventListener('DOMContentLoaded', async () => {
  const id = Number(location.pathname.split('/').filter(Boolean).pop() || new URLSearchParams(location.search).get('id'));
  const vungChiTiet = document.querySelector('#chi-tiet-san-pham');
  const vungDanhGia = document.querySelector('#danh-sach-danh-gia');
  const khuVucGoiY = document.querySelector('#khu-vuc-goi-y');
  const danhSachGoiY = document.querySelector('#danh-sach-goi-y');
  const thongBaoGoiY = document.querySelector('#thong-bao-goi-y');
  const khuVucVuaXem = document.querySelector('#khu-vuc-vua-xem');
  const danhSachVuaXem = document.querySelector('#danh-sach-vua-xem');
  const thongBaoVuaXem = document.querySelector('#thong-bao-vua-xem');
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
    const bienThes = sanPham.bienThes || [];
    document.title = `${sanPham.ten} | SportShop`;
    vungChiTiet.innerHTML = `
      <img src="${thoatUrlAnh(sanPham.hinhAnh)}" alt="${thoatHtml(sanPham.ten)}">
      <div>
        <p class="mo-ta">${thoatHtml(sanPham.tenDanhMuc || 'Đồ thể thao')}</p>
        <h1>${thoatHtml(sanPham.ten)}</h1>
        <p>${thoatHtml([sanPham.thuongHieu, sanPham.monTheThao].filter(Boolean).join(' · '))}</p>
        <p class="gia-lon">${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(sanPham.gia)}</p>
        <p>${thoatHtml(sanPham.moTa || 'Sản phẩm thể thao chất lượng cao.')}</p>
        ${bienThes.length > 1 ? `<label class="truong">Size / màu / SKU
          <select id="bien-the-mua">${bienThes.map((bienThe) => `<option value="${Number(bienThe.id)}" ${Number(bienThe.soLuongTon) < 1 ? 'disabled' : ''}>
            ${thoatHtml([bienThe.kichThuoc, bienThe.mauSac, bienThe.sku].filter(Boolean).join(' · '))} — tồn ${Number(bienThe.soLuongTon)}
          </option>`).join('')}</select>
        </label>` : ''}
        <p id="ton-kho-bien-the"></p>
        <label class="truong">Số lượng
          <input id="so-luong-mua" type="number" min="1" value="1">
        </label>
        <button id="nut-them-gio" class="nut" type="button">Thêm vào giỏ hàng</button>
      </div>
    `;
    vungChiTiet.querySelector('div').append(taoNhomTuongTacSanPham(sanPham));
    try {
      ghiNhanSanPhamVuaXem(sanPham.id);
    } catch (loi) {
      hienThiThongBao(thongBao, loi.message || 'Không thể lưu lịch sử xem sản phẩm.', 'loi');
    }

    const selectBienThe = document.querySelector('#bien-the-mua');
    const inputSoLuong = document.querySelector('#so-luong-mua');
    const nutThemGio = document.querySelector('#nut-them-gio');
    const vungTonKho = document.querySelector('#ton-kho-bien-the');
    function capNhatBienThe() {
      const bienThe = bienThes.find((item) => item.id === Number(selectBienThe?.value)) || bienThes[0];
      const tonKho = Number(bienThe?.soLuongTon || 0);
      vungTonKho.textContent = bienThe
        ? `${bienThe.sku}${bienThe.kichThuoc || bienThe.mauSac ? ` · ${[bienThe.kichThuoc, bienThe.mauSac].filter(Boolean).join(' / ')}` : ''} · Tồn kho: ${tonKho}`
        : 'Sản phẩm chưa có biến thể để bán.';
      inputSoLuong.max = String(Math.max(1, tonKho));
      inputSoLuong.value = '1';
      nutThemGio.disabled = sanPham.trangThai !== 'dang_ban' || tonKho < 1 || !bienThe;
    }
    selectBienThe?.addEventListener('change', capNhatBienThe);
    capNhatBienThe();
    nutThemGio.addEventListener('click', async () => {
      try {
        const bienTheId = selectBienThe ? Number(selectBienThe.value) : bienThes[0]?.id;
        if (!bienTheId) throw new Error('Vui lòng chọn biến thể còn hàng.');
        await themVaoGio(id, inputSoLuong.value, bienTheId);
      } catch (loi) {
        xuLyLoi(thongBao, loi);
      }
    });

    async function taiGoiY() {
      const truyVan = new URLSearchParams({ trang: '1', soLuongMoiTrang: '8' });
      if (sanPham.danhMucId) truyVan.set('danhMucId', String(sanPham.danhMucId));
      if (sanPham.monTheThao) truyVan.set('monTheThao', sanPham.monTheThao);
      let ketQua = await api.get(`/san-pham?${truyVan.toString()}`);
      let goiY = ketQua.danhSach.filter((muc) => muc.id !== sanPham.id && muc.trangThai === 'dang_ban');
      if (!goiY.length && sanPham.monTheThao) {
        const theoMon = new URLSearchParams({ trang: '1', soLuongMoiTrang: '8', monTheThao: sanPham.monTheThao });
        ketQua = await api.get(`/san-pham?${theoMon.toString()}`);
        goiY = ketQua.danhSach.filter((muc) => muc.id !== sanPham.id && muc.trangThai === 'dang_ban');
      }
      if (!goiY.length) {
        ketQua = await api.get('/san-pham?trang=1&soLuongMoiTrang=8');
        goiY = ketQua.danhSach.filter((muc) => muc.id !== sanPham.id && muc.trangThai === 'dang_ban');
      }
      khuVucGoiY.hidden = !goiY.length;
      danhSachGoiY.replaceChildren(...goiY.slice(0, 4).map((muc) => taoTheSanPham(muc, (sanPhamGoiY, bienTheId) =>
        themVaoGio(sanPhamGoiY.id, 1, bienTheId).catch((loi) => xuLyLoi(thongBaoGoiY, loi)))));
    }

    async function taiVuaXem() {
      const ids = layIdsVuaXem().filter((sanPhamId) => sanPhamId !== sanPham.id).slice(0, 4);
      khuVucVuaXem.hidden = !ids.length;
      if (!ids.length) return;
      const ketQua = await taiSanPhamTheoIds(ids);
      danhSachVuaXem.replaceChildren(...(ketQua.danhSach.length
        ? ketQua.danhSach.map((muc) => taoTheSanPham(muc, (sanPhamVuaXem, bienTheId) =>
          themVaoGio(sanPhamVuaXem.id, 1, bienTheId).catch((loi) => xuLyLoi(thongBaoVuaXem, loi))))
        : [taoTheTrong('Không có sản phẩm vừa xem khả dụng.')] ));
      if (ketQua.soSanPhamLoi) {
        hienThiThongBao(thongBaoVuaXem, `Không tải được ${ketQua.soSanPhamLoi} sản phẩm vừa xem.`, 'loi');
      }
    }

    taiGoiY().catch((loi) => {
      xuLyLoi(thongBaoGoiY, loi);
      khuVucGoiY.hidden = false;
      danhSachGoiY.replaceChildren(taoTheTrong('Không thể tải gợi ý sản phẩm.'));
    });
    taiVuaXem().catch((loi) => {
      xuLyLoi(thongBaoVuaXem, loi);
      khuVucVuaXem.hidden = false;
      danhSachVuaXem.replaceChildren(taoTheTrong('Không thể tải lịch sử xem.'));
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
