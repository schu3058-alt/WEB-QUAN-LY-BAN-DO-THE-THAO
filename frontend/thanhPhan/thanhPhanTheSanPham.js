// Thanh phan giao dien dung chung: the hien thi 1 san pham (dung trong danh sach, trang chu...)
import { dinhDangTienTe } from '../dungChung/dinhDang.js';
import { thoatHtml, thoatUrlAnh } from '../dungChung/giaoDien.js';
import {
  doiTrangThaiSoSanh,
  doiTrangThaiYeuThich,
  laSanPhamDangSoSanh,
  laSanPhamYeuThich,
} from '../dungChung/tienIchMuaSam.js';

export function taoTheSanPham(sanPham, khiBamThemVaoGio) {
  const variants = sanPham.bienThes || [];
  const stock = Number(sanPham.soLuongTon);
  const quickAddVariant = variants.length === 1 ? variants[0] : null;
  const the = document.createElement('div');
  the.className = 'the-san-pham';
  the.innerHTML = `
    <a class="anh-san-pham" href="/san-pham/${Number(sanPham.id)}">
      <img src="${thoatUrlAnh(sanPham.hinhAnh)}" alt="${thoatHtml(sanPham.ten)}" loading="lazy" />
    </a>
    <h3><a href="/san-pham/${Number(sanPham.id)}">${thoatHtml(sanPham.ten)}</a></h3>
    ${sanPham.tenDanhMuc ? `<p class="nhan-danh-muc">${thoatHtml(sanPham.tenDanhMuc)}</p>` : ''}
    ${[sanPham.thuongHieu, sanPham.monTheThao].filter(Boolean).length
      ? `<p class="mo-ta">${thoatHtml([sanPham.thuongHieu, sanPham.monTheThao].filter(Boolean).join(' · '))}</p>` : ''}
    <p>${dinhDangTienTe(sanPham.gia)}</p>
    <button class="nut" type="button" ${stock < 1 ? 'disabled' : ''}>
      ${stock < 1 ? 'Hết hàng' : quickAddVariant ? 'Thêm vào giỏ' : 'Chọn phân loại'}
    </button>
  `;
  the.querySelector('button').addEventListener('click', () => {
    if (stock < 1) return;
    if (quickAddVariant) khiBamThemVaoGio?.(sanPham, quickAddVariant.id);
    else location.href = `/san-pham/${Number(sanPham.id)}`;
  });
  the.append(taoNhomTuongTacSanPham(sanPham));
  return the;
}

export function taoNhomTuongTacSanPham(sanPham) {
  const nhom = document.createElement('div');
  nhom.className = 'tuong-tac-san-pham';
  const nutYeuThich = document.createElement('button');
  const nutSoSanh = document.createElement('button');
  const trangThai = document.createElement('span');

  for (const nut of [nutYeuThich, nutSoSanh]) {
    nut.type = 'button';
    nut.className = 'nut nut-phu nut-nho';
  }
  trangThai.className = 'trang-thai-tuong-tac';
  trangThai.setAttribute('role', 'status');
  trangThai.setAttribute('aria-live', 'polite');

  function capNhatNut() {
    const yeuThich = laSanPhamYeuThich(sanPham.id);
    const dangSoSanh = laSanPhamDangSoSanh(sanPham.id);
    nutYeuThich.textContent = yeuThich ? 'Đã yêu thích' : 'Yêu thích';
    nutYeuThich.setAttribute('aria-pressed', String(yeuThich));
    nutSoSanh.textContent = dangSoSanh ? 'Bỏ so sánh' : 'So sánh';
    nutSoSanh.setAttribute('aria-pressed', String(dangSoSanh));
  }

  nutYeuThich.addEventListener('click', () => {
    try {
      const yeuThich = doiTrangThaiYeuThich(sanPham.id);
      trangThai.textContent = yeuThich ? 'Đã thêm vào danh sách yêu thích.' : 'Đã bỏ khỏi danh sách yêu thích.';
      capNhatNut();
    } catch (loi) {
      trangThai.textContent = loi.message || 'Không thể cập nhật danh sách yêu thích.';
    }
  });
  nutSoSanh.addEventListener('click', () => {
    try {
      const ketQua = doiTrangThaiSoSanh(sanPham.id);
      trangThai.textContent = ketQua.quaGioiHan
        ? 'So sánh tối đa 4 sản phẩm. Hãy bỏ bớt một sản phẩm trước.'
        : ketQua.dangSoSanh
          ? 'Đã thêm vào danh sách so sánh.'
          : 'Đã bỏ khỏi danh sách so sánh.';
      capNhatNut();
    } catch (loi) {
      trangThai.textContent = loi.message || 'Không thể cập nhật danh sách so sánh.';
    }
  });

  nhom.append(nutYeuThich, nutSoSanh, trangThai);
  capNhatNut();
  return nhom;
}
