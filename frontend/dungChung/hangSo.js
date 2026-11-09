// Cac hang so dung chung cho toan bo frontend
export const DIA_CHI_API_GOC = `${window.location.origin}/api`;

export const TRANG_THAI_DON_HANG = {
  CHO_XAC_NHAN: 'cho_xac_nhan',
  DANG_GIAO: 'dang_giao',
  DA_GIAO: 'da_giao',
  DA_HUY: 'da_huy',
};

export const NHAN_TRANG_THAI_DON_HANG = {
  [TRANG_THAI_DON_HANG.CHO_XAC_NHAN]: 'Chờ xác nhận',
  [TRANG_THAI_DON_HANG.DANG_GIAO]: 'Đang giao',
  [TRANG_THAI_DON_HANG.DA_GIAO]: 'Đã giao',
  [TRANG_THAI_DON_HANG.DA_HUY]: 'Đã hủy',
};

export const VAI_TRO = {
  KHACH_HANG: 'khach_hang',
  QUAN_TRI: 'quan_tri',
};

export const KHOA_LUU_TRU = {
  TOKEN: 'sportshop_token',
  THONG_TIN_TAI_KHOAN: 'sportshop_tai_khoan',
};
