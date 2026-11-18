import { api } from '../../dungChung/api.js';
import { hienThiThongBao, taoTheTrong, themVaoGio, xuLyLoi } from '../../dungChung/giaoDien.js';
import { layIdsVuaXem, taiSanPhamTheoIds } from '../../dungChung/tienIchMuaSam.js';
import { taoTheSanPham } from '../../thanhPhan/thanhPhanTheSanPham.js';

document.addEventListener('DOMContentLoaded', async () => {
  const vungDanhMuc = document.querySelector('#danh-sach-danh-muc');
  const vungSanPham = document.querySelector('#san-pham-noi-bat');
  const khuVucGoiY = document.querySelector('#khu-vuc-goi-y');
  const vungGoiY = document.querySelector('#danh-sach-goi-y');
  const thongBaoGoiY = document.querySelector('#thong-bao-goi-y');
  const khuVucVuaXem = document.querySelector('#khu-vuc-vua-xem');
  const vungVuaXem = document.querySelector('#danh-sach-vua-xem');
  const thongBaoVuaXem = document.querySelector('#thong-bao-vua-xem');
  const thongBao = document.querySelector('#thong-bao-trang-chu');

  try {
    const [danhMuc, ketQuaSanPham] = await Promise.all([
      api.get('/danh-muc'),
      api.get('/san-pham?trang=1&soLuongMoiTrang=8'),
    ]);

    vungDanhMuc.replaceChildren(...danhMuc.map((muc) => {
      const nut = document.createElement('a');
      nut.className = 'nut nut-phu';
      nut.href = `/san-pham?danhMucId=${encodeURIComponent(muc.id)}`;
      nut.textContent = muc.ten;
      return nut;
    }));

    const sanPham = ketQuaSanPham.danhSach.filter((item) => item.trangThai === 'dang_ban');
    if (!sanPham.length) {
      vungSanPham.replaceChildren(taoTheTrong('Hiện chưa có sản phẩm đang bán.'));
      return;
    }
    vungSanPham.replaceChildren(...sanPham.map((item) => taoTheSanPham(item, (muc, bienTheId) =>
      themVaoGio(muc.id, 1, bienTheId).catch((loi) => xuLyLoi(thongBao, loi)))));

    async function taiGoiY() {
      const recentIds = layIdsVuaXem();
      const sanPhamGoiY = recentIds.length ? await api.get(`/san-pham/${recentIds[0]}`) : sanPham[0];
      const truyVan = new URLSearchParams({ trang: '1', soLuongMoiTrang: '8' });
      if (sanPhamGoiY.danhMucId) truyVan.set('danhMucId', String(sanPhamGoiY.danhMucId));
      if (sanPhamGoiY.monTheThao) truyVan.set('monTheThao', sanPhamGoiY.monTheThao);
      let ketQua = await api.get(`/san-pham?${truyVan.toString()}`);
      let goiY = ketQua.danhSach.filter((muc) => muc.id !== sanPhamGoiY.id && muc.trangThai === 'dang_ban');
      if (!goiY.length && sanPhamGoiY.monTheThao) {
        const theoMon = new URLSearchParams({
          trang: '1',
          soLuongMoiTrang: '8',
          monTheThao: sanPhamGoiY.monTheThao,
        });
        ketQua = await api.get(`/san-pham?${theoMon.toString()}`);
        goiY = ketQua.danhSach.filter((muc) => muc.id !== sanPhamGoiY.id && muc.trangThai === 'dang_ban');
      }
      if (!goiY.length) {
        goiY = sanPham.filter((muc) => muc.id !== sanPhamGoiY.id);
      }
      khuVucGoiY.hidden = !goiY.length;
      vungGoiY.replaceChildren(...goiY.slice(0, 4).map((muc) => taoTheSanPham(muc, (sanPhamKhac, bienTheId) =>
        themVaoGio(sanPhamKhac.id, 1, bienTheId).catch((loi) => xuLyLoi(thongBaoGoiY, loi)))));
    }

    async function taiVuaXem() {
      const ids = layIdsVuaXem();
      khuVucVuaXem.hidden = !ids.length;
      if (!ids.length) return;
      const ketQua = await taiSanPhamTheoIds(ids);
      vungVuaXem.replaceChildren(...(ketQua.danhSach.length
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
      vungGoiY.replaceChildren(taoTheTrong('Không thể tải gợi ý sản phẩm.'));
    });
    taiVuaXem().catch((loi) => {
      xuLyLoi(thongBaoVuaXem, loi);
      khuVucVuaXem.hidden = false;
      vungVuaXem.replaceChildren(taoTheTrong('Không thể tải lịch sử xem.'));
    });
  } catch (loi) {
    hienThiThongBao(thongBao, `Không thể tải nội dung trang chủ: ${loi.message}`, 'loi');
    vungDanhMuc.replaceChildren(taoTheTrong('Không tải được danh mục.'));
    vungSanPham.replaceChildren(taoTheTrong('Không tải được sản phẩm.'));
  }
});
