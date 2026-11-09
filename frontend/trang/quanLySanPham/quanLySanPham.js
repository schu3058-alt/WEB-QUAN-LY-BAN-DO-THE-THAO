import { api } from '../../dungChung/api.js';
import { dinhDangTienTe } from '../../dungChung/dinhDang.js';
import { hienThiThongBao, taoTheTrong, thoatHtml, xuLyLoi, layTaiKhoanDaLuu } from '../../dungChung/giaoDien.js';

document.addEventListener('DOMContentLoaded', async () => {
  const formSanPham = document.querySelector('#form-san-pham');
  const formDanhMuc = document.querySelector('#form-danh-muc');
  const vungSanPham = document.querySelector('#danh-sach-san-pham');
  const vungDanhMuc = document.querySelector('#danh-sach-danh-muc');
  const thongBao = document.querySelector('#thong-bao-quan-ly-san-pham');
  const selectDanhMuc = formSanPham.elements.danhMucId;
  if (layTaiKhoanDaLuu()?.vaiTro !== 'quan_tri') {
    location.href = '/dang-nhap?tro-lai=%2Fquan-tri%2Fsan-pham';
    return;
  }

  let danhMucHienCo = [];
  function taoSlug(ten) {
    return ten.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D')
      .toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  async function taiDanhMuc() {
    danhMucHienCo = await api.get('/danh-muc');
    selectDanhMuc.replaceChildren(new Option('Chọn danh mục', ''));
    danhMucHienCo.forEach((muc) => selectDanhMuc.add(new Option(muc.ten, muc.id)));
    vungDanhMuc.innerHTML = danhMucHienCo.length
      ? `<div class="danh-sach-lien-ket">${danhMucHienCo.map((muc) => `<span class="the-trang-thai">${thoatHtml(muc.ten)}
        <button class="nut-sua-danh-muc" data-id="${Number(muc.id)}" type="button">Sửa</button>
        <button class="nut-xoa-danh-muc" data-id="${Number(muc.id)}" type="button" aria-label="Xóa ${thoatHtml(muc.ten)}">×</button></span>`).join('')}</div>`
      : '<p>Chưa có danh mục.</p>';
    vungDanhMuc.querySelectorAll('.nut-sua-danh-muc').forEach((nut) => nut.addEventListener('click', () => {
      const muc = danhMucHienCo.find((item) => item.id === Number(nut.dataset.id));
      if (!muc) return;
      formDanhMuc.elements.id.value = muc.id;
      formDanhMuc.elements.ten.value = muc.ten;
      formDanhMuc.elements.moTa.value = muc.moTa || '';
      document.querySelector('#nut-luu-danh-muc').textContent = 'Cập nhật danh mục';
      document.querySelector('#huy-sua-danh-muc').hidden = false;
      formDanhMuc.scrollIntoView({ behavior: 'smooth' });
    }));
    vungDanhMuc.querySelectorAll('.nut-xoa-danh-muc').forEach((nut) => nut.addEventListener('click', async () => {
      if (!window.confirm('Xóa danh mục này?')) return;
      try {
        await api.del(`/danh-muc/${nut.dataset.id}`);
        await taiDanhMuc();
        await taiSanPham();
      } catch (loi) { xuLyLoi(thongBao, loi); }
    }));
  }

  async function taiSanPham() {
    const ketQua = await api.get('/san-pham/quan-tri?trang=1&soLuongMoiTrang=100');
    const danhSach = ketQua.danhSach;
    if (!danhSach.length) {
      vungSanPham.replaceChildren(taoTheTrong('Chưa có sản phẩm nào.'));
      return;
    }
    vungSanPham.innerHTML = `<div class="bang-khung"><table><thead><tr><th>Sản phẩm</th><th>Danh mục</th><th>Giá</th><th>Tồn kho</th><th>Trạng thái</th><th>Thao tác</th></tr></thead><tbody>
      ${danhSach.map((muc) => `<tr>
        <td>${thoatHtml(muc.ten)}</td><td>${thoatHtml(muc.tenDanhMuc || 'Chưa phân loại')}</td>
        <td>${dinhDangTienTe(muc.gia)}</td><td>${Number(muc.soLuongTon)}</td><td>${muc.trangThai === 'dang_ban' ? 'Đang bán' : 'Ngừng bán'}</td>
        <td><button class="nut nut-phu nut-nho nut-sua" data-id="${Number(muc.id)}" type="button">Sửa</button>
        ${muc.trangThai === 'dang_ban' ? `<button class="nut nut-nguy-hiem nut-nho nut-ngung" data-id="${Number(muc.id)}" type="button">Ngừng bán</button>` : ''}</td>
      </tr>`).join('')}
    </tbody></table></div>`;
    vungSanPham.querySelectorAll('.nut-sua').forEach((nut) => nut.addEventListener('click', () => {
      const muc = danhSach.find((item) => item.id === Number(nut.dataset.id));
      if (!muc) return;
      Object.entries({ id: muc.id, ten: muc.ten, moTa: muc.moTa || '', gia: muc.gia, soLuongTon: muc.soLuongTon, danhMucId: muc.danhMucId || '', hinhAnh: muc.hinhAnh || '' })
        .forEach(([ten, giaTri]) => { formSanPham.elements[ten].value = giaTri; });
      document.querySelector('#tieu-de-form-san-pham').textContent = `Cập nhật sản phẩm #${muc.id}`;
      formSanPham.scrollIntoView({ behavior: 'smooth' });
    }));
    vungSanPham.querySelectorAll('.nut-ngung').forEach((nut) => nut.addEventListener('click', async () => {
      if (!window.confirm('Ngừng kinh doanh sản phẩm này?')) return;
      try {
        await api.del(`/san-pham/${nut.dataset.id}`);
        hienThiThongBao(thongBao, 'Đã ngừng kinh doanh sản phẩm.');
        await taiSanPham();
      } catch (loi) { xuLyLoi(thongBao, loi); }
    }));
  }

  formSanPham.addEventListener('submit', async (suKien) => {
    suKien.preventDefault();
    const duLieu = Object.fromEntries(new FormData(formSanPham).entries());
    const id = duLieu.id;
    delete duLieu.id;
    duLieu.gia = Number(duLieu.gia);
    duLieu.soLuongTon = Number(duLieu.soLuongTon);
    duLieu.danhMucId = Number(duLieu.danhMucId);
    try {
      if (id) await api.put(`/san-pham/${id}`, duLieu);
      else await api.post('/san-pham', duLieu);
      formSanPham.reset();
      formSanPham.elements.id.value = '';
      document.querySelector('#tieu-de-form-san-pham').textContent = 'Thêm sản phẩm';
      hienThiThongBao(thongBao, id ? 'Cập nhật sản phẩm thành công.' : 'Thêm sản phẩm thành công.');
      await taiSanPham();
    } catch (loi) { xuLyLoi(thongBao, loi); }
  });
  document.querySelector('#huy-sua').addEventListener('click', () => {
    formSanPham.reset();
    formSanPham.elements.id.value = '';
    document.querySelector('#tieu-de-form-san-pham').textContent = 'Thêm sản phẩm';
  });

  formDanhMuc.addEventListener('submit', async (suKien) => {
    suKien.preventDefault();
    const duLieu = Object.fromEntries(new FormData(formDanhMuc).entries());
    const id = duLieu.id;
    delete duLieu.id;
    duLieu.slug = taoSlug(duLieu.ten);
    try {
      if (id) await api.put(`/danh-muc/${id}`, duLieu);
      else await api.post('/danh-muc', duLieu);
      formDanhMuc.reset();
      document.querySelector('#nut-luu-danh-muc').textContent = 'Thêm danh mục';
      document.querySelector('#huy-sua-danh-muc').hidden = true;
      await taiDanhMuc();
      hienThiThongBao(thongBao, id ? 'Cập nhật danh mục thành công.' : 'Thêm danh mục thành công.');
    } catch (loi) { xuLyLoi(thongBao, loi); }
  });
  document.querySelector('#huy-sua-danh-muc').addEventListener('click', () => {
    formDanhMuc.reset();
    document.querySelector('#nut-luu-danh-muc').textContent = 'Thêm danh mục';
    document.querySelector('#huy-sua-danh-muc').hidden = true;
  });

  try {
    await taiDanhMuc();
    await taiSanPham();
  } catch (loi) { xuLyLoi(thongBao, loi); }
});
