import { api } from './api.js';

const KHOA = {
  YEU_THICH: 'sportshop_yeu_thich',
  SO_SANH: 'sportshop_so_sanh',
  VUA_XEM: 'sportshop_vua_xem',
};

export const GIOI_HAN_SO_SANH = 4;
export const GIOI_HAN_VUA_XEM = 8;

function layDanhSachId(khoa, gioiHan = Number.MAX_SAFE_INTEGER) {
  const giaTri = localStorage.getItem(khoa);
  if (!giaTri) return [];

  let danhSach;
  try {
    danhSach = JSON.parse(giaTri);
  } catch {
    localStorage.removeItem(khoa);
    return [];
  }
  if (!Array.isArray(danhSach)) {
    localStorage.removeItem(khoa);
    return [];
  }

  return [...new Set(danhSach.map(Number).filter((id) => Number.isSafeInteger(id) && id > 0))]
    .slice(0, gioiHan);
}

function luuDanhSachId(khoa, danhSach) {
  localStorage.setItem(khoa, JSON.stringify(danhSach));
  window.dispatchEvent(new Event('sportshop:thay-doi-mua-sam'));
}

export function layIdsYeuThich() {
  return layDanhSachId(KHOA.YEU_THICH);
}

export function laSanPhamYeuThich(id) {
  return layIdsYeuThich().includes(Number(id));
}

export function doiTrangThaiYeuThich(id) {
  const sanPhamId = Number(id);
  const danhSach = layIdsYeuThich();
  const dangYeuThich = danhSach.includes(sanPhamId);
  luuDanhSachId(KHOA.YEU_THICH, dangYeuThich
    ? danhSach.filter((muc) => muc !== sanPhamId)
    : [sanPhamId, ...danhSach]);
  return !dangYeuThich;
}

export function layIdsSoSanh() {
  return layDanhSachId(KHOA.SO_SANH, GIOI_HAN_SO_SANH);
}

export function laSanPhamDangSoSanh(id) {
  return layIdsSoSanh().includes(Number(id));
}

export function doiTrangThaiSoSanh(id) {
  const sanPhamId = Number(id);
  const danhSach = layIdsSoSanh();
  if (danhSach.includes(sanPhamId)) {
    luuDanhSachId(KHOA.SO_SANH, danhSach.filter((muc) => muc !== sanPhamId));
    return { dangSoSanh: false, quaGioiHan: false };
  }
  if (danhSach.length >= GIOI_HAN_SO_SANH) {
    return { dangSoSanh: false, quaGioiHan: true };
  }
  luuDanhSachId(KHOA.SO_SANH, [...danhSach, sanPhamId]);
  return { dangSoSanh: true, quaGioiHan: false };
}

export function xoaSanPhamKhoiSoSanh(id) {
  const sanPhamId = Number(id);
  luuDanhSachId(KHOA.SO_SANH, layIdsSoSanh().filter((muc) => muc !== sanPhamId));
}

export function xoaTatCaSoSanh() {
  luuDanhSachId(KHOA.SO_SANH, []);
}

export function layIdsVuaXem() {
  return layDanhSachId(KHOA.VUA_XEM, GIOI_HAN_VUA_XEM);
}

export function ghiNhanSanPhamVuaXem(id) {
  const sanPhamId = Number(id);
  const danhSach = layIdsVuaXem();
  luuDanhSachId(KHOA.VUA_XEM, [sanPhamId, ...danhSach.filter((muc) => muc !== sanPhamId)]
    .slice(0, GIOI_HAN_VUA_XEM));
}

export async function taiSanPhamTheoIds(ids) {
  const ketQua = await Promise.allSettled(ids.map((id) => api.get(`/san-pham/${Number(id)}`)));
  return {
    danhSach: ketQua.filter((muc) => muc.status === 'fulfilled').map((muc) => muc.value),
    soSanPhamLoi: ketQua.filter((muc) => muc.status === 'rejected').length,
  };
}
