import { hienThiThongBao, taoTheTrong, themVaoGio, xuLyLoi } from '../../dungChung/giaoDien.js';
import { layIdsYeuThich, taiSanPhamTheoIds } from '../../dungChung/tienIchMuaSam.js';
import { taoTheSanPham } from '../../thanhPhan/thanhPhanTheSanPham.js';

document.addEventListener('DOMContentLoaded', async () => {
  const vungSanPham = document.querySelector('#danh-sach-yeu-thich');
  const thongBao = document.querySelector('#thong-bao-yeu-thich');

  async function taiDanhSach() {
    hienThiThongBao(thongBao, '');
    const ids = layIdsYeuThich();
    if (!ids.length) {
      vungSanPham.replaceChildren(taoTheTrong('Bạn chưa lưu sản phẩm yêu thích nào.'));
      return;
    }

    const ketQua = await taiSanPhamTheoIds(ids);
    if (ketQua.soSanPhamLoi) {
      hienThiThongBao(thongBao, `Không tải được ${ketQua.soSanPhamLoi} sản phẩm. Vui lòng kiểm tra kết nối và thử lại.`, 'loi');
    }
    vungSanPham.replaceChildren(...(ketQua.danhSach.length
      ? ketQua.danhSach.map((sanPham) => taoTheSanPham(sanPham, (muc, bienTheId) =>
        themVaoGio(muc.id, 1, bienTheId).catch((loi) => xuLyLoi(thongBao, loi))))
      : [taoTheTrong('Không có sản phẩm yêu thích khả dụng.')] ));
  }

  try {
    await taiDanhSach();
  } catch (loi) {
    xuLyLoi(thongBao, loi);
    vungSanPham.replaceChildren(taoTheTrong('Không thể tải sản phẩm yêu thích.'));
  }
  window.addEventListener('sportshop:thay-doi-mua-sam', () => {
    taiDanhSach().catch((loi) => xuLyLoi(thongBao, loi));
  });
});
