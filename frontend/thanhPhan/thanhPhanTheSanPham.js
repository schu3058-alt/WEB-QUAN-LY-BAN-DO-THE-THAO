// Thanh phan giao dien dung chung: the hien thi 1 san pham (dung trong danh sach, trang chu...)
import { dinhDangTienTe } from '../dungChung/dinhDang.js';
import { thoatHtml } from '../dungChung/giaoDien.js';

export function taoTheSanPham(sanPham, khiBamThemVaoGio) {
  const the = document.createElement('div');
  the.className = 'the-san-pham';
  the.innerHTML = `
    <a class="anh-san-pham" href="/san-pham/${Number(sanPham.id)}">
      <img src="${thoatHtml(sanPham.hinhAnh || '/hinh-anh-san-pham/san-pham-placeholder.svg')}" alt="${thoatHtml(sanPham.ten)}" loading="lazy" />
    </a>
    <h3><a href="/san-pham/${Number(sanPham.id)}">${thoatHtml(sanPham.ten)}</a></h3>
    ${sanPham.tenDanhMuc ? `<p class="nhan-danh-muc">${thoatHtml(sanPham.tenDanhMuc)}</p>` : ''}
    <p>${dinhDangTienTe(sanPham.gia)}</p>
    <button class="nut" type="button" ${Number(sanPham.soLuongTon) < 1 ? 'disabled' : ''}>
      ${Number(sanPham.soLuongTon) < 1 ? 'Hết hàng' : 'Thêm vào giỏ'}
    </button>
  `;
  the.querySelector('button').addEventListener('click', () => khiBamThemVaoGio?.(sanPham));
  return the;
}
