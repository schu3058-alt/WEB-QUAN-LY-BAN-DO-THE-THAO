import { api } from '../../dungChung/api.js';
import { hienThiThongBao, taoTheTrong, themVaoGio, xuLyLoi } from '../../dungChung/giaoDien.js';
import { taoTheSanPham } from '../../thanhPhan/thanhPhanTheSanPham.js';

document.addEventListener('DOMContentLoaded', async () => {
  const form = document.querySelector('#form-tim-kiem');
  const inputTuKhoa = document.querySelector('#tu-khoa');
  const selectDanhMuc = document.querySelector('#loc-danh-muc');
  const vungSanPham = document.querySelector('#danh-sach-san-pham');
  const thongBao = document.querySelector('#thong-bao-san-pham');
  const tongSo = document.querySelector('#tong-so-san-pham');
  const soTrang = document.querySelector('#so-trang');
  const nutTruoc = document.querySelector('#trang-truoc');
  const nutSau = document.querySelector('#trang-sau');
  const soLuongMoiTrang = 12;
  const thamSo = new URLSearchParams(location.search);
  let trang = 1;

  inputTuKhoa.value = thamSo.get('tuKhoa') || '';
  selectDanhMuc.value = thamSo.get('danhMucId') || '';

  async function taiDanhMuc() {
    const danhMuc = await api.get('/danh-muc');
    selectDanhMuc.replaceChildren(new Option('Tất cả danh mục', ''));
    danhMuc.forEach((muc) => selectDanhMuc.add(new Option(muc.ten, muc.id)));
    if (thamSo.has('danhMucId')) selectDanhMuc.value = thamSo.get('danhMucId');
  }

  async function taiSanPham() {
    hienThiThongBao(thongBao, '');
    vungSanPham.setAttribute('aria-busy', 'true');
    const truyVan = new URLSearchParams({ trang: String(trang), soLuongMoiTrang: String(soLuongMoiTrang) });
    if (inputTuKhoa.value.trim()) truyVan.set('tuKhoa', inputTuKhoa.value.trim());
    if (selectDanhMuc.value) truyVan.set('danhMucId', selectDanhMuc.value);

    try {
      const ketQua = await api.get(`/san-pham?${truyVan.toString()}`);
      const danhSach = ketQua.danhSach.filter((item) => item.trangThai === 'dang_ban');
      tongSo.textContent = `${ketQua.tongSo} sản phẩm`;
      soTrang.textContent = `Trang ${ketQua.trang}`;
      nutTruoc.disabled = trang <= 1;
      nutSau.disabled = trang * soLuongMoiTrang >= ketQua.tongSo;
      vungSanPham.replaceChildren(...(danhSach.length
        ? danhSach.map((item) => taoTheSanPham(item, (muc) => themVaoGio(muc.id).catch((loi) => xuLyLoi(thongBao, loi))))
        : [taoTheTrong('Không tìm thấy sản phẩm phù hợp.')]));
      const url = new URL(location.href);
      url.search = truyVan.toString();
      history.replaceState(null, '', url);
    } catch (loi) {
      xuLyLoi(thongBao, loi);
      vungSanPham.replaceChildren(taoTheTrong('Không thể tải sản phẩm.'));
    } finally {
      vungSanPham.removeAttribute('aria-busy');
    }
  }

  form.addEventListener('submit', (suKien) => {
    suKien.preventDefault();
    trang = 1;
    taiSanPham();
  });
  nutTruoc.addEventListener('click', () => { trang -= 1; taiSanPham(); });
  nutSau.addEventListener('click', () => { trang += 1; taiSanPham(); });

  try {
    await taiDanhMuc();
    await taiSanPham();
  } catch (loi) {
    xuLyLoi(thongBao, loi);
  }
});
