import { api } from '../../dungChung/api.js';
import { hienThiThongBao, taoTheTrong, themVaoGio, xuLyLoi } from '../../dungChung/giaoDien.js';
import { layIdsVuaXem, taiSanPhamTheoIds } from '../../dungChung/tienIchMuaSam.js';
import { taoTheSanPham } from '../../thanhPhan/thanhPhanTheSanPham.js';

document.addEventListener('DOMContentLoaded', async () => {
  const form = document.querySelector('#form-tim-kiem');
  const inputTuKhoa = document.querySelector('#tu-khoa');
  const selectDanhMuc = document.querySelector('#loc-danh-muc');
  const inputThuongHieu = document.querySelector('#loc-thuong-hieu');
  const inputMonTheThao = document.querySelector('#loc-mon-the-thao');
  const inputGiaTu = document.querySelector('#gia-tu');
  const inputGiaDen = document.querySelector('#gia-den');
  const selectKichThuoc = document.querySelector('#loc-kich-thuoc');
  const selectMauSac = document.querySelector('#loc-mau-sac');
  const selectSapXep = document.querySelector('#sap-xep');
  const checkboxConHang = document.querySelector('#chi-con-hang');
  const vungSanPham = document.querySelector('#danh-sach-san-pham');
  const vungVuaXem = document.querySelector('#san-pham-vua-xem');
  const danhSachVuaXem = document.querySelector('#danh-sach-vua-xem');
  const thongBaoVuaXem = document.querySelector('#thong-bao-vua-xem');
  const thongBao = document.querySelector('#thong-bao-san-pham');
  const tongSo = document.querySelector('#tong-so-san-pham');
  const soTrang = document.querySelector('#so-trang');
  const nutTruoc = document.querySelector('#trang-truoc');
  const nutSau = document.querySelector('#trang-sau');
  const soLuongMoiTrang = 12;
  const thamSo = new URLSearchParams(location.search);
  let trang = 1;

  async function taiDanhMuc() {
    const danhMuc = await api.get('/danh-muc');
    selectDanhMuc.replaceChildren(new Option('Tất cả danh mục', ''));
    danhMuc.forEach((muc) => selectDanhMuc.add(new Option(muc.ten, muc.id)));
    if (thamSo.has('danhMucId')) selectDanhMuc.value = thamSo.get('danhMucId');
  }

  async function taiTuyChonBoLoc() {
    const tuyChon = await api.get('/san-pham/tuy-chon-bo-loc');
    const ganLuaChon = (select, nhanMacDinh, cacGiaTri, khoa) => {
      select.replaceChildren(new Option(nhanMacDinh, ''));
      cacGiaTri.forEach((giaTri) => select.add(new Option(giaTri, giaTri)));
      select.value = thamSo.get(khoa) || '';
    };
    ganLuaChon(inputThuongHieu, 'Tất cả thương hiệu', tuyChon.thuongHieu, 'thuongHieu');
    ganLuaChon(inputMonTheThao, 'Tất cả môn thể thao', tuyChon.monTheThao, 'monTheThao');
    ganLuaChon(selectKichThuoc, 'Tất cả kích thước', tuyChon.kichThuoc, 'kichThuoc');
    ganLuaChon(selectMauSac, 'Tất cả màu sắc', tuyChon.mauSac, 'mauSac');
  }

  function ganBoLocTuUrl() {
    inputTuKhoa.value = thamSo.get('tuKhoa') || '';
    inputGiaTu.value = thamSo.get('giaTu') || '';
    inputGiaDen.value = thamSo.get('giaDen') || '';
    checkboxConHang.checked = thamSo.get('chiConHang') === 'true';
    selectSapXep.value = thamSo.get('sapXep') || 'moi_nhat';
  }

  async function taiSanPham() {
    hienThiThongBao(thongBao, '');
    vungSanPham.setAttribute('aria-busy', 'true');
    const truyVan = new URLSearchParams({ trang: String(trang), soLuongMoiTrang: String(soLuongMoiTrang) });
    if (inputTuKhoa.value.trim()) truyVan.set('tuKhoa', inputTuKhoa.value.trim());
    if (selectDanhMuc.value) truyVan.set('danhMucId', selectDanhMuc.value);
    if (inputThuongHieu.value) truyVan.set('thuongHieu', inputThuongHieu.value);
    if (inputMonTheThao.value) truyVan.set('monTheThao', inputMonTheThao.value);
    if (inputGiaTu.value) truyVan.set('giaTu', inputGiaTu.value);
    if (inputGiaDen.value) truyVan.set('giaDen', inputGiaDen.value);
    if (selectKichThuoc.value) truyVan.set('kichThuoc', selectKichThuoc.value);
    if (selectMauSac.value) truyVan.set('mauSac', selectMauSac.value);
    if (checkboxConHang.checked) truyVan.set('chiConHang', 'true');
    if (selectSapXep.value) truyVan.set('sapXep', selectSapXep.value);

    try {
      const ketQua = await api.get(`/san-pham?${truyVan.toString()}`);
      const danhSach = ketQua.danhSach.filter((item) => item.trangThai === 'dang_ban');
      tongSo.textContent = `${ketQua.tongSo} sản phẩm`;
      soTrang.textContent = `Trang ${ketQua.trang}`;
      nutTruoc.disabled = trang <= 1;
      nutSau.disabled = trang * soLuongMoiTrang >= ketQua.tongSo;
      vungSanPham.replaceChildren(...(danhSach.length
        ? danhSach.map((item) => taoTheSanPham(item, (muc, bienTheId) =>
          themVaoGio(muc.id, 1, bienTheId).catch((loi) => xuLyLoi(thongBao, loi))))
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

  async function taiSanPhamVuaXem() {
    const ids = layIdsVuaXem();
    vungVuaXem.hidden = !ids.length;
    if (!ids.length) return;

    const ketQua = await taiSanPhamTheoIds(ids);
    danhSachVuaXem.replaceChildren(...(ketQua.danhSach.length
      ? ketQua.danhSach.map((sanPham) => taoTheSanPham(sanPham, (muc, bienTheId) =>
        themVaoGio(muc.id, 1, bienTheId).catch((loi) => xuLyLoi(thongBaoVuaXem, loi))))
      : [taoTheTrong('Không có sản phẩm vừa xem khả dụng.')] ));
    if (ketQua.soSanPhamLoi) {
      hienThiThongBao(thongBaoVuaXem, `Không tải được ${ketQua.soSanPhamLoi} sản phẩm vừa xem.`, 'loi');
    }
  }

  try {
    await Promise.all([taiTuyChonBoLoc(), taiDanhMuc()]);
    ganBoLocTuUrl();
    await taiSanPham();
    await taiSanPhamVuaXem();
  } catch (loi) {
    xuLyLoi(thongBao, loi);
  }
});
