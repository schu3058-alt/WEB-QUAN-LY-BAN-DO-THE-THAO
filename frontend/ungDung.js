import { layTaiKhoanDaLuu } from './dungChung/giaoDien.js';
import { KHOA_LUU_TRU } from './dungChung/hangSo.js';
import { GIOI_HAN_SO_SANH, layIdsSoSanh, layIdsYeuThich } from './dungChung/tienIchMuaSam.js';
import { ganSuKienFormXacThuc } from './dungChung/xacThuc.js';

function taoLienKet(ten, duongDan) {
  const lienKet = document.createElement('a');
  lienKet.href = duongDan;
  lienKet.textContent = ten;
  return lienKet;
}

function khoiTaoDieuHuong() {
  const vung = document.querySelector('[data-vung-dieu-huong]');
  if (!vung) return;

  const taiKhoan = layTaiKhoanDaLuu();
  const thanh = document.createElement('nav');
  const lienKetYeuThich = taoLienKet('Yêu thích (0)', '/yeu-thich');
  const lienKetSoSanh = taoLienKet(`So sánh (0/${GIOI_HAN_SO_SANH})`, '/so-sanh');
  let hopThoai;
  thanh.className = 'thanh-dieu-huong';
  thanh.append(
    taoLienKet('SportShop', '/'),
    taoLienKet('Sản phẩm', '/san-pham'),
    lienKetYeuThich,
    lienKetSoSanh,
  );

  function capNhatSoLuongMuaSam() {
    lienKetYeuThich.textContent = `Yêu thích (${layIdsYeuThich().length})`;
    lienKetSoSanh.textContent = `So sánh (${layIdsSoSanh().length}/${GIOI_HAN_SO_SANH})`;
  }

  capNhatSoLuongMuaSam();
  window.addEventListener('sportshop:thay-doi-mua-sam', capNhatSoLuongMuaSam);
  window.addEventListener('storage', capNhatSoLuongMuaSam);

  if (localStorage.getItem(KHOA_LUU_TRU.TOKEN)) {
    thanh.append(taoLienKet('Giỏ hàng', '/gio-hang'), taoLienKet('Đơn hàng', '/don-hang'));
    thanh.append(taoLienKet('Tài khoản', '/tai-khoan'));
    if (taiKhoan?.vaiTro === 'quan_tri') {
      thanh.append(taoLienKet('Quản trị', '/quan-tri'));
    }
    const dangXuat = document.createElement('button');
    dangXuat.className = 'nut nut-phu';
    dangXuat.type = 'button';
    dangXuat.textContent = 'Đăng xuất';
    dangXuat.addEventListener('click', () => {
      localStorage.removeItem(KHOA_LUU_TRU.TOKEN);
      localStorage.removeItem(KHOA_LUU_TRU.THONG_TIN_TAI_KHOAN);
      location.href = '/';
    });
    thanh.append(dangXuat);
  } else {
    const dangNhap = taoLienKet('Đăng nhập', '/dang-nhap');
    dangNhap.addEventListener('click', (suKien) => {
      suKien.preventDefault();
      hopThoai.showModal();
      hopThoai.querySelector('[name="email"]').focus();
    });
    thanh.append(dangNhap);
  }

  vung.replaceChildren(thanh);

  if (!localStorage.getItem(KHOA_LUU_TRU.TOKEN)) {
    hopThoai = document.createElement('dialog');
    hopThoai.className = 'hop-thoai-xac-thuc';
    hopThoai.setAttribute('aria-labelledby', 'tieu-de-modal-xac-thuc');
    hopThoai.innerHTML = `
      <section class="noi-dung-hop-thoai">
        <div class="dau-hop-thoai">
          <div>
            <p class="nhan-hop-thoai">SPORTSHOP</p>
            <h2 id="tieu-de-modal-xac-thuc">Đăng nhập</h2>
          </div>
          <button class="nut-dong-hop-thoai" type="button" aria-label="Đóng cửa sổ">×</button>
        </div>
        <p class="mo-ta">Chào mừng bạn đến với SportShop</p>
        <div class="thong-bao" role="alert" hidden></div>
        <form>
          <label class="truong truong-ho-ten" hidden>Họ và tên
            <input name="hoTen" type="text" minlength="2" maxlength="100" autocomplete="name">
          </label>
          <label class="truong">Địa chỉ email
            <input name="email" type="email" required autocomplete="email">
          </label>
          <label class="truong">Mật khẩu
            <input name="matKhau" type="password" required minlength="6" autocomplete="current-password">
          </label>
          <label class="truong truong-so-dien-thoai" hidden>Số điện thoại
            <input name="soDienThoai" type="tel" pattern="[0-9]{9,11}" autocomplete="tel">
          </label>
          <button class="nut nut-gui-xac-thuc" type="submit">Đăng nhập</button>
        </form>
        <div class="doi-che-do-xac-thuc">
          <button class="nut nut-phu" type="button">Đăng ký</button>
        </div>
      </section>`;
    document.body.append(hopThoai);
    hopThoai.querySelector('.nut-dong-hop-thoai').addEventListener('click', () => hopThoai.close());
    hopThoai.addEventListener('click', (suKien) => {
      if (suKien.target === hopThoai) hopThoai.close();
    });
    ganSuKienFormXacThuc({
      form: hopThoai.querySelector('form'),
      thongBao: hopThoai.querySelector('.thong-bao'),
      tieuDe: hopThoai.querySelector('h2'),
      nutGui: hopThoai.querySelector('.nut-gui-xac-thuc'),
      nutDoiCheDo: hopThoai.querySelector('.doi-che-do-xac-thuc button'),
      truongHoTen: hopThoai.querySelector('.truong-ho-ten'),
      truongDienThoai: hopThoai.querySelector('.truong-so-dien-thoai'),
      sauKhiXacThuc: () => location.reload(),
    });
  }
}

document.addEventListener('DOMContentLoaded', khoiTaoDieuHuong);
