import { api } from '../../dungChung/api.js';
import { dinhDangTienTe } from '../../dungChung/dinhDang.js';
import { hienThiThongBao, taoTheTrong, thoatHtml, xuLyLoi } from '../../dungChung/giaoDien.js';
import { khoiTaoMenuQuanTri, kiemTraQuyenQuanTri } from '../../thanhPhan/thanhPhanQuanTri.js';
import { taoPhanTrang } from '../../thanhPhan/thanhPhanPhanTrang.js';

const ANH_MAC_DINH = '/hinh-anh-san-pham/san-pham-placeholder.svg';
const NGUONG_MAC_DINH = 5;
const NGUONG_TOI_DA = 1000;
const SO_DONG_MOI_TRANG = 15;
const SO_TRANG_TAI_TOI_DA = 20;
const SO_NHAT_KY_TOI_DA = 30;
const TON_KHO_TOI_DA = 1000000;

const NHAN_TINH_TRANG = { het: 'Hết hàng', sap_het: 'Sắp hết', con: 'Còn hàng' };
const LOP_TINH_TRANG = { het: 'trang-thai-huy', sap_het: 'trang-thai-cho', con: 'trang-thai-ban' };
const CAC_TAB = [
  { ma: '', ten: 'Tất cả' },
  { ma: 'het', ten: 'Hết hàng' },
  { ma: 'sap_het', ten: 'Sắp hết' },
  { ma: 'con', ten: 'Còn hàng' },
];

function phanLoaiTonKho(soLuong, nguong) {
  if (soLuong <= 0) return 'het';
  if (soLuong <= nguong) return 'sap_het';
  return 'con';
}

function thoatCsv(giaTri) {
  const chuoi = String(giaTri);
  return /[",\n\r]/.test(chuoi) ? `"${chuoi.replace(/"/g, '""')}"` : chuoi;
}

async function taiTatCaSanPham() {
  const tatCa = [];
  for (let trang = 1; trang <= SO_TRANG_TAI_TOI_DA; trang += 1) {
    const ketQua = await api.get(`/san-pham/quan-tri?trangThai=tat_ca&trang=${trang}&soLuongMoiTrang=100`);
    tatCa.push(...ketQua.danhSach);
    if (!ketQua.danhSach.length || tatCa.length >= ketQua.tongSo) break;
  }
  return tatCa;
}

document.addEventListener('DOMContentLoaded', async () => {
  if (!kiemTraQuyenQuanTri()) return;
  khoiTaoMenuQuanTri('kho');

  const thongBao = document.querySelector('#thong-bao-kho');
  const vungThongKe = document.querySelector('#thong-ke-kho');
  const form = document.querySelector('#form-loc-kho');
  const vungTab = document.querySelector('#tab-tinh-trang');
  const demKetQua = document.querySelector('#dem-ket-qua-kho');
  const vungDanhSach = document.querySelector('#danh-sach-kho');
  const vungPhanTrang = document.querySelector('#phan-trang-kho');
  const nutXuatCsv = document.querySelector('#xuat-csv-kho');
  const vungNhatKy = document.querySelector('#nhat-ky-kho');

  let tatCa = [];
  let tinhTrangLoc = '';
  let trangHienTai = 1;
  let dangXuLy = false;
  let danhSachDangHienThi = [];
  const nhatKy = [];

  function docNguong() {
    const goc = form.elements.nguong.value.trim();
    if (goc === '') return NGUONG_MAC_DINH;
    const so = Math.floor(Number(goc));
    if (!Number.isFinite(so)) return NGUONG_MAC_DINH;
    return Math.min(NGUONG_TOI_DA, Math.max(0, so));
  }

  function locTheoBoLoc() {
    const tuKhoa = form.elements.tuKhoa.value.trim().toLowerCase().replace(/^#/, '');
    const danhMuc = form.elements.danhMucId.value;
    const trangThai = form.elements.trangThai.value;
    return tatCa.filter((muc) => {
      if (trangThai !== 'tat_ca' && muc.trangThai !== trangThai) return false;
      if (danhMuc && String(muc.danhMucId) !== danhMuc) return false;
      if (!tuKhoa) return true;
      return String(muc.ten).toLowerCase().includes(tuKhoa) || String(muc.id) === tuKhoa;
    });
  }

  function sapXep(danhSach) {
    const cachSapXep = form.elements.sapXep.value;
    const giaTriTon = (muc) => Number(muc.gia) * Number(muc.soLuongTon);
    const soSanhTen = (a, b) => String(a.ten).localeCompare(String(b.ten), 'vi');
    const bang = {
      ton_tang: (a, b) => Number(a.soLuongTon) - Number(b.soLuongTon) || soSanhTen(a, b),
      ton_giam: (a, b) => Number(b.soLuongTon) - Number(a.soLuongTon) || soSanhTen(a, b),
      gia_tri_giam: (a, b) => giaTriTon(b) - giaTriTon(a) || soSanhTen(a, b),
      ten: soSanhTen,
    };
    return [...danhSach].sort(bang[cachSapXep] || bang.ton_tang);
  }

  function veThongKe() {
    const dangBan = tatCa.filter((muc) => muc.trangThai === 'dang_ban');
    const nguong = docNguong();
    const tongSoLuong = dangBan.reduce((tong, muc) => tong + Number(muc.soLuongTon), 0);
    const giaTriTon = dangBan.reduce((tong, muc) => tong + Number(muc.gia) * Number(muc.soLuongTon), 0);
    const soHet = dangBan.filter((muc) => phanLoaiTonKho(Number(muc.soLuongTon), nguong) === 'het').length;
    const soSapHet = dangBan.filter((muc) => phanLoaiTonKho(Number(muc.soLuongTon), nguong) === 'sap_het').length;
    const the = (nhan, giaTri, canChuY = false) => `<article class="the${canChuY ? ' can-chu-y' : ''}"><span>${thoatHtml(nhan)}</span><strong>${thoatHtml(giaTri)}</strong></article>`;
    vungThongKe.innerHTML = [
      the('Sản phẩm đang bán', dangBan.length),
      the('Tổng số lượng tồn', tongSoLuong.toLocaleString('vi-VN')),
      the('Giá trị tồn kho', dinhDangTienTe(giaTriTon)),
      the('Hết hàng', soHet, soHet > 0),
      the(`Sắp hết (từ 1 đến ${nguong})`, soSapHet, soSapHet > 0),
    ].join('');
  }

  function veTab(demTheoTinhTrang, tong) {
    vungTab.replaceChildren(...CAC_TAB.map((tab) => {
      const nut = document.createElement('button');
      nut.type = 'button';
      nut.className = `nut nut-nho${tab.ma === tinhTrangLoc ? '' : ' nut-phu'}`;
      nut.textContent = `${tab.ten} (${tab.ma ? demTheoTinhTrang[tab.ma] : tong})`;
      nut.setAttribute('aria-pressed', String(tab.ma === tinhTrangLoc));
      nut.addEventListener('click', () => {
        tinhTrangLoc = tab.ma;
        trangHienTai = 1;
        ve();
      });
      return nut;
    }));
  }

  function veNhatKy() {
    vungNhatKy.innerHTML = nhatKy.length
      ? nhatKy.map((dong) => `<li>${thoatHtml(dong)}</li>`).join('')
      : '<li>Chưa có thao tác nào.</li>';
  }

  function ghiNhatKy(tenSanPham, noiDung) {
    const gio = new Date().toLocaleTimeString('vi-VN');
    nhatKy.unshift(`${gio} - ${tenSanPham}: ${noiDung}`);
    if (nhatKy.length > SO_NHAT_KY_TOI_DA) nhatKy.length = SO_NHAT_KY_TOI_DA;
    veNhatKy();
  }

  function ve() {
    veThongKe();
    const nguong = docNguong();
    const sauLoc = locTheoBoLoc();
    const demTheoTinhTrang = { het: 0, sap_het: 0, con: 0 };
    sauLoc.forEach((muc) => { demTheoTinhTrang[phanLoaiTonKho(Number(muc.soLuongTon), nguong)] += 1; });
    veTab(demTheoTinhTrang, sauLoc.length);

    const hienThi = sapXep(tinhTrangLoc
      ? sauLoc.filter((muc) => phanLoaiTonKho(Number(muc.soLuongTon), nguong) === tinhTrangLoc)
      : sauLoc);
    danhSachDangHienThi = hienThi;
    nutXuatCsv.disabled = !hienThi.length;

    const tongSoTrang = Math.max(1, Math.ceil(hienThi.length / SO_DONG_MOI_TRANG));
    if (trangHienTai > tongSoTrang) trangHienTai = tongSoTrang;
    vungPhanTrang.replaceChildren(taoPhanTrang({
      trangHienTai,
      tongSoTrang,
      khiChuyenTrang: (trang) => { trangHienTai = trang; ve(); },
    }));

    if (!hienThi.length) {
      demKetQua.textContent = '';
      vungDanhSach.replaceChildren(taoTheTrong('Không có sản phẩm phù hợp.'));
      return;
    }
    const batDau = (trangHienTai - 1) * SO_DONG_MOI_TRANG;
    const trang = hienThi.slice(batDau, batDau + SO_DONG_MOI_TRANG);
    demKetQua.textContent = `Hiển thị ${batDau + 1} - ${batDau + trang.length} trên ${hienThi.length} sản phẩm`;
    vungDanhSach.innerHTML = `<div class="bang-khung"><table><thead><tr><th>Sản phẩm</th><th>Đơn giá</th><th>Tồn kho</th><th>Tình trạng</th><th>Giá trị tồn</th><th>Thao tác kho</th></tr></thead><tbody>
      ${trang.map((muc) => {
        const ton = Number(muc.soLuongTon);
        const tinhTrang = phanLoaiTonKho(ton, nguong);
        const ngung = muc.trangThai !== 'dang_ban';
        return `<tr>
          <td><div class="o-san-pham"><img class="anh-nho" src="${thoatHtml(muc.hinhAnh || ANH_MAC_DINH)}" alt="" loading="lazy">
            <span>${thoatHtml(muc.ten)}<br><small class="ghi-chu">Mã #${Number(muc.id)} - ${thoatHtml(muc.tenDanhMuc || 'Chưa phân loại')}${ngung ? ' - Ngừng bán' : ''}</small></span></div></td>
          <td>${dinhDangTienTe(muc.gia)}</td>
          <td class="${tinhTrang === 'con' ? '' : 'ton-kho-thap'}">${ton}</td>
          <td><span class="trang-thai ${LOP_TINH_TRANG[tinhTrang]}">${NHAN_TINH_TRANG[tinhTrang]}</span></td>
          <td>${dinhDangTienTe(Number(muc.gia) * ton)}</td>
          <td><div class="cot-thao-tac">
            <input class="o-so-luong" type="number" min="0" max="${TON_KHO_TOI_DA}" step="1" inputmode="numeric" placeholder="SL" data-id="${Number(muc.id)}" aria-label="Số lượng cần thao tác cho ${thoatHtml(muc.ten)}">
            <button class="nut nut-nho" type="button" data-hanh-dong="nhap" data-id="${Number(muc.id)}">Nhập kho</button>
            <button class="nut nut-phu nut-nho" type="button" data-hanh-dong="xuat" data-id="${Number(muc.id)}">Xuất kho</button>
            <button class="nut nut-phu nut-nho" type="button" data-hanh-dong="dat" data-id="${Number(muc.id)}">Đặt thành</button>
          </div></td>
        </tr>`;
      }).join('')}
    </tbody></table></div>`;
    vungDanhSach.querySelectorAll('img').forEach((anh) => anh.addEventListener('error', () => {
      if (!anh.src.endsWith(ANH_MAC_DINH)) anh.src = ANH_MAC_DINH;
    }));
  }

  async function layBanGhiMoiNhat(sanPham) {
    const ketQua = await api.get(`/san-pham/quan-tri?tuKhoa=${encodeURIComponent(sanPham.ten)}&trangThai=tat_ca&soLuongMoiTrang=100`);
    return ketQua.danhSach.find((muc) => muc.id === sanPham.id) || null;
  }

  async function thucHienThaoTac(id, loai, soLuong) {
    const hienCo = tatCa.find((muc) => muc.id === id);
    if (!hienCo) return;
    const moiNhat = await layBanGhiMoiNhat(hienCo);
    if (!moiNhat) {
      hienThiThongBao(thongBao, 'Không tìm thấy sản phẩm. Hãy bấm Tải lại để cập nhật danh sách.', 'loi');
      return;
    }
    if (Number(moiNhat.soLuongTon) !== Number(hienCo.soLuongTon)) {
      Object.assign(hienCo, moiNhat);
      ve();
      hienThiThongBao(thongBao, `Tồn kho của "${hienCo.ten}" vừa thay đổi (hiện còn ${Number(moiNhat.soLuongTon)}). Số liệu đã được cập nhật, vui lòng kiểm tra và thao tác lại.`, 'loi');
      return;
    }
    if (!moiNhat.danhMucId) {
      hienThiThongBao(thongBao, `Sản phẩm "${hienCo.ten}" chưa có danh mục. Hãy gán danh mục ở trang Sản phẩm trước khi điều chỉnh kho.`, 'loi');
      return;
    }
    const tonCu = Number(moiNhat.soLuongTon);
    const tonMoi = { nhap: tonCu + soLuong, xuat: tonCu - soLuong, dat: soLuong }[loai];
    if (tonMoi < 0) {
      hienThiThongBao(thongBao, `Không thể xuất ${soLuong}: "${hienCo.ten}" chỉ còn ${tonCu}.`, 'loi');
      return;
    }
    if (tonMoi > TON_KHO_TOI_DA) {
      hienThiThongBao(thongBao, `Tồn kho tối đa là ${TON_KHO_TOI_DA.toLocaleString('vi-VN')}.`, 'loi');
      return;
    }
    await api.put(`/san-pham/${id}`, {
      ten: moiNhat.ten,
      moTa: moiNhat.moTa || null,
      gia: Number(moiNhat.gia),
      soLuongTon: tonMoi,
      danhMucId: moiNhat.danhMucId,
      hinhAnh: moiNhat.hinhAnh || null,
    });
    Object.assign(hienCo, moiNhat, { soLuongTon: tonMoi });
    const mota = { nhap: `nhập thêm ${soLuong}`, xuat: `xuất ${soLuong}`, dat: 'đặt lại tồn kho' }[loai];
    ghiNhatKy(hienCo.ten, `${mota}, tồn ${tonCu} thành ${tonMoi}`);
    hienThiThongBao(thongBao, `Đã cập nhật kho "${hienCo.ten}": ${tonCu} thành ${tonMoi}.`);
    ve();
  }

  vungDanhSach.addEventListener('click', async (suKien) => {
    const nut = suKien.target.closest('button[data-hanh-dong]');
    if (!nut || dangXuLy) return;
    const id = Number(nut.dataset.id);
    const loai = nut.dataset.hanhDong;
    const o = vungDanhSach.querySelector(`input.o-so-luong[data-id="${id}"]`);
    const goc = o ? o.value.trim() : '';
    const soLuong = Number(goc);
    const toiThieu = loai === 'dat' ? 0 : 1;
    if (goc === '' || !Number.isInteger(soLuong) || soLuong < toiThieu || soLuong > TON_KHO_TOI_DA) {
      hienThiThongBao(thongBao, loai === 'dat'
        ? `Nhập số lượng thực tế (số nguyên từ 0 đến ${TON_KHO_TOI_DA.toLocaleString('vi-VN')}).`
        : `Nhập số lượng là số nguyên từ 1 đến ${TON_KHO_TOI_DA.toLocaleString('vi-VN')}.`, 'loi');
      if (o) o.focus();
      return;
    }
    if (loai === 'dat') {
      const muc = tatCa.find((item) => item.id === id);
      if (!window.confirm(`Đặt tồn kho của "${muc?.ten}" thành ${soLuong}?`)) return;
    }
    dangXuLy = true;
    nut.disabled = true;
    try {
      await thucHienThaoTac(id, loai, soLuong);
    } catch (loi) {
      xuLyLoi(thongBao, loi);
    } finally {
      dangXuLy = false;
      nut.disabled = false;
    }
  });

  nutXuatCsv.addEventListener('click', () => {
    const nguong = docNguong();
    const hang = [['Mã', 'Tên sản phẩm', 'Danh mục', 'Đơn giá (VND)', 'Tồn kho', 'Tình trạng kho', 'Giá trị tồn (VND)', 'Trạng thái bán'],
      ...danhSachDangHienThi.map((muc) => [
        muc.id, muc.ten, muc.tenDanhMuc || 'Chưa phân loại', Math.round(Number(muc.gia)), Number(muc.soLuongTon),
        NHAN_TINH_TRANG[phanLoaiTonKho(Number(muc.soLuongTon), nguong)], Math.round(Number(muc.gia) * Number(muc.soLuongTon)),
        muc.trangThai === 'dang_ban' ? 'Đang bán' : 'Ngừng bán',
      ])];
    const noiDung = `\uFEFF${hang.map((cot) => cot.map(thoatCsv).join(',')).join('\r\n')}`; // BOM de Excel doc dung tieng Viet
    const duongDan = URL.createObjectURL(new Blob([noiDung], { type: 'text/csv;charset=utf-8' }));
    const lienKet = document.createElement('a');
    lienKet.href = duongDan;
    lienKet.download = `ton-kho_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.append(lienKet);
    lienKet.click();
    lienKet.remove();
    URL.revokeObjectURL(duongDan);
  });

  let boDemTimKiem;
  form.addEventListener('submit', (suKien) => suKien.preventDefault());
  form.elements.tuKhoa.addEventListener('input', () => {
    clearTimeout(boDemTimKiem);
    boDemTimKiem = setTimeout(() => { trangHienTai = 1; ve(); }, 250);
  });
  ['danhMucId', 'trangThai', 'sapXep', 'nguong'].forEach((ten) => form.elements[ten].addEventListener('change', () => {
    trangHienTai = 1;
    ve();
  }));
  document.querySelector('#xoa-loc-kho').addEventListener('click', () => {
    form.reset();
    tinhTrangLoc = '';
    trangHienTai = 1;
    ve();
  });

  async function taiDuLieu(thongDiep) {
    tatCa = await taiTatCaSanPham();
    ve();
    if (thongDiep) hienThiThongBao(thongBao, thongDiep);
  }
  document.querySelector('#tai-lai-kho').addEventListener('click', async () => {
    try {
      await taiDuLieu('Đã tải lại dữ liệu kho.');
    } catch (loi) { xuLyLoi(thongBao, loi); }
  });

  veNhatKy();
  const thamSoUrl = new URLSearchParams(location.search);
  const tuKhoaUrl = thamSoUrl.get('tuKhoa');
  if (tuKhoaUrl) form.elements.tuKhoa.value = tuKhoaUrl.slice(0, 100);
  const tinhTrangUrl = thamSoUrl.get('tinhTrang');
  if (Object.keys(NHAN_TINH_TRANG).includes(tinhTrangUrl)) tinhTrangLoc = tinhTrangUrl;

  form.elements.danhMucId.replaceChildren(new Option('Tất cả danh mục', ''));
  try {
    const danhMuc = await api.get('/danh-muc');
    danhMuc.forEach((muc) => form.elements.danhMucId.add(new Option(muc.ten, muc.id)));
  } catch (loi) { xuLyLoi(thongBao, loi); }

  try {
    await taiDuLieu();
  } catch (loi) {
    xuLyLoi(thongBao, loi);
    vungDanhSach.replaceChildren(taoTheTrong('Không thể tải dữ liệu kho.'));
  }
});

