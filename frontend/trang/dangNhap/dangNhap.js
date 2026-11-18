import { ganSuKienFormXacThuc } from '../../dungChung/xacThuc.js';

document.addEventListener('DOMContentLoaded', () => {
  const cheDoBanDau = new URLSearchParams(location.search).get('cheDo') === 'dang-ky'
    ? 'dang-ky'
    : 'dang-nhap';
  ganSuKienFormXacThuc({
    form: document.querySelector('#form-xac-thuc'),
    thongBao: document.querySelector('#thong-bao-dang-nhap'),
    tieuDe: document.querySelector('#tieu-de-xac-thuc'),
    nutGui: document.querySelector('#nut-xac-thuc'),
    nutDoiCheDo: document.querySelector('#doi-che-do'),
    truongHoTen: document.querySelector('#truong-ho-ten'),
    truongDienThoai: document.querySelector('#truong-so-dien-thoai'),
    cheDoBanDau,
  });
});
