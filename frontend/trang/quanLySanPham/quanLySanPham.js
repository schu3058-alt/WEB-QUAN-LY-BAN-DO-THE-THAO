import { api } from '../../dungChung/api.js';
import { dinhDangNgay, dinhDangTienTe } from '../../dungChung/dinhDang.js';
import { hienThiThongBao, taoTheTrong, thoatHtml, xuLyLoi, layTaiKhoanDaLuu } from '../../dungChung/giaoDien.js';

document.addEventListener('DOMContentLoaded', async () => {
  const formSanPham = document.querySelector('#form-san-pham');
  const formDanhMuc = document.querySelector('#form-danh-muc');
  const vungSanPham = document.querySelector('#danh-sach-san-pham');
  const vungDanhMuc = document.querySelector('#danh-sach-danh-muc');
  const vungCanhBao = document.querySelector('#danh-sach-canh-bao');
  const thongBao = document.querySelector('#thong-bao-quan-ly-san-pham');
  const selectDanhMuc = formSanPham.elements.danhMucId;
  const cacBienTheMoi = document.querySelector('#cac-bien-the-moi');
  const khuVucBienTheMoi = document.querySelector('#khu-vuc-bien-the-moi');
  if (layTaiKhoanDaLuu()?.vaiTro !== 'quan_tri') {
    location.href = '/dang-nhap?tro-lai=%2Fquan-tri%2Fsan-pham';
    return;
  }

  let danhMucHienCo = [];
  function taoSlug(ten) {
    return ten.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D')
      .toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  function themDongBienTheMoi(duLieu = {}) {
    const dong = document.createElement('div');
    dong.className = 'khung-noi-dung';
    dong.innerHTML = `
      <div class="luoi-form">
        <label class="truong">SKU (để trống để tự tạo)<input name="sku" maxlength="64" value="${thoatHtml(duLieu.sku || '')}"></label>
        <label class="truong">Size<input name="kichThuoc" maxlength="32" value="${thoatHtml(duLieu.kichThuoc || '')}"></label>
        <label class="truong">Màu sắc<input name="mauSac" maxlength="50" value="${thoatHtml(duLieu.mauSac || '')}"></label>
        <label class="truong">Tồn ban đầu<input name="soLuongTon" type="number" min="0" step="1" value="${Number(duLieu.soLuongTon || 0)}" required></label>
        <label class="truong">Cảnh báo khi còn dưới<input name="nguongCanhBao" type="number" min="0" step="1" value="${Number(duLieu.nguongCanhBao ?? 5)}" required></label>
      </div>
      <button class="nut nut-phu nut-nho nut-xoa-bien-the-moi" type="button">Xóa biến thể</button>`;
    dong.querySelector('.nut-xoa-bien-the-moi').addEventListener('click', () => dong.remove());
    cacBienTheMoi.append(dong);
  }

  function datLaiFormSanPham() {
    formSanPham.reset();
    formSanPham.elements.id.value = '';
    document.querySelector('#tieu-de-form-san-pham').textContent = 'Thêm sản phẩm';
    khuVucBienTheMoi.hidden = false;
    cacBienTheMoi.replaceChildren();
    themDongBienTheMoi();
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

  async function taiCanhBao() {
    const canhBao = await api.get('/kho/canh-bao');
    if (!canhBao.length) {
      vungCanhBao.replaceChildren(taoTheTrong('Không có biến thể nào dưới ngưỡng cảnh báo.'));
      return;
    }
    vungCanhBao.innerHTML = `<div class="bang-khung"><table><thead><tr><th>Sản phẩm</th><th>SKU</th><th>Size / màu</th><th>Tồn</th><th>Ngưỡng</th></tr></thead><tbody>
      ${canhBao.map((muc) => `<tr><td>${thoatHtml(muc.tenSanPham)}</td><td>${thoatHtml(muc.sku)}</td>
        <td>${thoatHtml([muc.kichThuoc, muc.mauSac].filter(Boolean).join(' / ') || 'Mặc định')}</td>
        <td>${Number(muc.soLuongTon)}</td><td>${Number(muc.nguongCanhBao)}</td></tr>`).join('')}
      </tbody></table></div>`;
  }

  async function taiSanPham() {
    const ketQua = await api.get('/san-pham/quan-tri?trang=1&soLuongMoiTrang=100');
    const danhSach = ketQua.danhSach;
    if (!danhSach.length) {
      vungSanPham.replaceChildren(taoTheTrong('Chưa có sản phẩm nào.'));
      return;
    }
    vungSanPham.innerHTML = `<div class="bang-khung"><table><thead><tr><th>Sản phẩm</th><th>Danh mục</th><th>Giá</th><th>Tồn kho</th><th>Biến thể và kho</th><th>Trạng thái</th><th>Thao tác</th></tr></thead><tbody>
      ${danhSach.map((muc) => `<tr>
        <td>${thoatHtml(muc.ten)}<br><small>${thoatHtml([muc.thuongHieu, muc.monTheThao].filter(Boolean).join(' · '))}</small></td>
        <td>${thoatHtml(muc.tenDanhMuc || 'Chưa phân loại')}</td>
        <td>${dinhDangTienTe(muc.gia)}</td><td>${Number(muc.soLuongTon)}</td>
        <td><details><summary>${(muc.bienThes || []).length} biến thể</summary>
          <div class="bang-khung"><table><thead><tr><th>SKU</th><th>Size / màu</th><th>Tồn / ngưỡng</th><th>Trạng thái</th><th></th></tr></thead><tbody>
            ${(muc.bienThes || []).map((bt) => `<tr>
              <td>${thoatHtml(bt.sku)}</td><td>${thoatHtml([bt.kichThuoc, bt.mauSac].filter(Boolean).join(' / ') || 'Mặc định')}</td>
              <td>${Number(bt.soLuongTon)} / ${Number(bt.nguongCanhBao)}</td><td>${bt.trangThai === 'dang_ban' ? 'Đang bán' : 'Ngừng bán'}</td>
              <td><button class="nut nut-phu nut-nho nut-sua-bien-the" data-id="${Number(bt.id)}" type="button">Sửa</button>
                ${bt.trangThai === 'dang_ban' ? `<button class="nut nut-nho nut-nhap-kho" data-id="${Number(bt.id)}" type="button">Nhập</button>
                  <button class="nut nut-phu nut-nho nut-xuat-kho" data-id="${Number(bt.id)}" type="button">Xuất</button>` : ''}
                <button class="nut nut-phu nut-nho nut-lich-su" data-id="${Number(bt.id)}" type="button">Lịch sử</button>
                ${bt.trangThai === 'dang_ban' ? `<button class="nut nut-nguy-hiem nut-nho nut-ngung-bien-the" data-id="${Number(bt.id)}" type="button">Ngừng</button>` : ''}</td>
            </tr>`).join('')}
          </tbody></table></div>
          <form class="form-them-bien-the" data-product-id="${Number(muc.id)}">
            <h4>Thêm biến thể</h4>
            <div class="luoi-form">
              <label class="truong">SKU (tự tạo nếu trống)<input name="sku" maxlength="64"></label>
              <label class="truong">Size<input name="kichThuoc" maxlength="32"></label>
              <label class="truong">Màu<input name="mauSac" maxlength="50"></label>
              <label class="truong">Tồn ban đầu<input name="soLuongTon" type="number" min="0" value="0" required></label>
              <label class="truong">Ngưỡng cảnh báo<input name="nguongCanhBao" type="number" min="0" value="5" required></label>
            </div><button class="nut nut-nho" type="submit">Lưu biến thể</button>
          </form>
        </details></td>
        <td>${muc.trangThai === 'dang_ban' ? 'Đang bán' : 'Ngừng bán'}</td>
        <td><button class="nut nut-phu nut-nho nut-sua" data-id="${Number(muc.id)}" type="button">Sửa</button>
        ${muc.trangThai === 'dang_ban' ? `<button class="nut nut-nguy-hiem nut-nho nut-ngung" data-id="${Number(muc.id)}" type="button">Ngừng bán</button>` : ''}</td>
      </tr>`).join('')}
    </tbody></table></div>`;
    vungSanPham.querySelectorAll('.nut-sua').forEach((nut) => nut.addEventListener('click', () => {
      const muc = danhSach.find((item) => item.id === Number(nut.dataset.id));
      if (!muc) return;
      Object.entries({
        id: muc.id, ten: muc.ten, moTa: muc.moTa || '', gia: muc.gia,
        danhMucId: muc.danhMucId || '', hinhAnh: muc.hinhAnh || '',
        thuongHieu: muc.thuongHieu || '', monTheThao: muc.monTheThao || '',
      }).forEach(([ten, giaTri]) => { formSanPham.elements[ten].value = giaTri; });
      khuVucBienTheMoi.hidden = true;
      cacBienTheMoi.replaceChildren();
      document.querySelector('#tieu-de-form-san-pham').textContent = `Cập nhật sản phẩm #${muc.id}`;
      formSanPham.scrollIntoView({ behavior: 'smooth' });
    }));
    vungSanPham.querySelectorAll('.form-them-bien-the').forEach((form) => form.addEventListener('submit', async (suKien) => {
      suKien.preventDefault();
      const duLieu = Object.fromEntries(new FormData(form).entries());
      duLieu.soLuongTon = Number(duLieu.soLuongTon);
      duLieu.nguongCanhBao = Number(duLieu.nguongCanhBao);
      try {
        await api.post(`/san-pham/${form.dataset.productId}/bien-the`, duLieu);
        hienThiThongBao(thongBao, 'Đã thêm biến thể.');
        await Promise.all([taiSanPham(), taiCanhBao()]);
      } catch (loi) { xuLyLoi(thongBao, loi); }
    }));
    vungSanPham.querySelectorAll('.nut-sua-bien-the').forEach((nut) => nut.addEventListener('click', async () => {
      const variant = danhSach.flatMap((product) => product.bienThes || []).find((item) => item.id === Number(nut.dataset.id));
      if (!variant) return;
      const sku = window.prompt('SKU', variant.sku);
      if (sku === null) return;
      const kichThuoc = window.prompt('Size', variant.kichThuoc || '');
      if (kichThuoc === null) return;
      const mauSac = window.prompt('Màu sắc', variant.mauSac || '');
      if (mauSac === null) return;
      const nguongCanhBao = window.prompt('Cảnh báo khi tồn kho bằng hoặc thấp hơn', variant.nguongCanhBao);
      if (nguongCanhBao === null) return;
      try {
        await api.put(`/san-pham/bien-the/${variant.id}`, {
          sku, kichThuoc, mauSac, nguongCanhBao: Number(nguongCanhBao),
        });
        hienThiThongBao(thongBao, 'Đã cập nhật biến thể.');
        await Promise.all([taiSanPham(), taiCanhBao()]);
      } catch (loi) { xuLyLoi(thongBao, loi); }
    }));
    for (const [selector, loai] of [['.nut-nhap-kho', 'nhap_kho'], ['.nut-xuat-kho', 'xuat_kho']]) {
      vungSanPham.querySelectorAll(selector).forEach((nut) => nut.addEventListener('click', async () => {
        const soLuong = window.prompt(`Số lượng ${loai === 'nhap_kho' ? 'nhập' : 'xuất'}:`);
        if (soLuong === null) return;
        const ghiChu = window.prompt('Lý do điều chỉnh kho:');
        if (ghiChu === null) return;
        try {
          await api.post(`/kho/bien-the/${nut.dataset.id}/dieu-chinh`, {
            loai, soLuong: Number(soLuong), ghiChu,
          });
          hienThiThongBao(thongBao, 'Đã cập nhật tồn kho.');
          await Promise.all([taiSanPham(), taiCanhBao()]);
        } catch (loi) { xuLyLoi(thongBao, loi); }
      }));
    }
    vungSanPham.querySelectorAll('.nut-lich-su').forEach((nut) => nut.addEventListener('click', async () => {
      try {
        const lichSu = await api.get(`/kho/bien-the/${nut.dataset.id}/lich-su`);
        const noiDung = lichSu.length
          ? lichSu.map((item) => `${dinhDangNgay(item.ngayTao)} | ${item.loai} | ${Number(item.soLuongThayDoi) > 0 ? '+' : ''}${Number(item.soLuongThayDoi)} | ${item.ghiChu || ''}`).join('\n')
          : 'Chưa có lịch sử kho.';
        window.alert(noiDung);
      } catch (loi) { xuLyLoi(thongBao, loi); }
    }));
    vungSanPham.querySelectorAll('.nut-ngung-bien-the').forEach((nut) => nut.addEventListener('click', async () => {
      if (!window.confirm('Ngừng kinh doanh biến thể này?')) return;
      try {
        await api.del(`/san-pham/bien-the/${nut.dataset.id}`);
        hienThiThongBao(thongBao, 'Đã ngừng kinh doanh biến thể.');
        await Promise.all([taiSanPham(), taiCanhBao()]);
      } catch (loi) { xuLyLoi(thongBao, loi); }
    }));
    vungSanPham.querySelectorAll('.nut-ngung').forEach((nut) => nut.addEventListener('click', async () => {
      if (!window.confirm('Ngừng kinh doanh sản phẩm này?')) return;
      try {
        await api.del(`/san-pham/${nut.dataset.id}`);
        hienThiThongBao(thongBao, 'Đã ngừng kinh doanh sản phẩm.');
        await Promise.all([taiSanPham(), taiCanhBao()]);
      } catch (loi) { xuLyLoi(thongBao, loi); }
    }));
  }

  document.querySelector('#nut-them-bien-the-moi').addEventListener('click', () => themDongBienTheMoi());
  formSanPham.addEventListener('submit', async (suKien) => {
    suKien.preventDefault();
    const duLieu = Object.fromEntries(new FormData(formSanPham).entries());
    const id = duLieu.id;
    delete duLieu.id;
    duLieu.gia = Number(duLieu.gia);
    duLieu.danhMucId = Number(duLieu.danhMucId);
    ['sku', 'kichThuoc', 'mauSac', 'soLuongTon', 'nguongCanhBao'].forEach((truong) => { delete duLieu[truong]; });
    if (!id) {
      duLieu.bienThes = [...cacBienTheMoi.querySelectorAll('.khung-noi-dung')].map((dong) => ({
          sku: dong.querySelector('[name="sku"]').value,
          kichThuoc: dong.querySelector('[name="kichThuoc"]').value,
          mauSac: dong.querySelector('[name="mauSac"]').value,
          soLuongTon: Number(dong.querySelector('[name="soLuongTon"]').value),
          nguongCanhBao: Number(dong.querySelector('[name="nguongCanhBao"]').value),
        }));
    }
    try {
      if (id) await api.put(`/san-pham/${id}`, duLieu);
      else await api.post('/san-pham', duLieu);
      datLaiFormSanPham();
      hienThiThongBao(thongBao, id ? 'Cập nhật sản phẩm thành công.' : 'Thêm sản phẩm thành công.');
      await Promise.all([taiSanPham(), taiCanhBao()]);
    } catch (loi) { xuLyLoi(thongBao, loi); }
  });
  document.querySelector('#huy-sua').addEventListener('click', datLaiFormSanPham);

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

  datLaiFormSanPham();
  try {
    await taiDanhMuc();
    await Promise.all([taiSanPham(), taiCanhBao()]);
  } catch (loi) { xuLyLoi(thongBao, loi); }
});
