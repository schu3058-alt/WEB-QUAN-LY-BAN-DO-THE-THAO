import { DIA_CHI_API_GOC, KHOA_LUU_TRU } from './hangSo.js';

async function goiApi(duongDan, tuyChon = {}) {
  const token = localStorage.getItem(KHOA_LUU_TRU.TOKEN);
  const headers = {
    Accept: 'application/json',
    ...(tuyChon.body ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(tuyChon.headers || {}),
  };
  let phanHoi;
  try {
    phanHoi = await fetch(`${DIA_CHI_API_GOC}${duongDan}`, {
      ...tuyChon,
      headers,
      body: tuyChon.body ? JSON.stringify(tuyChon.body) : undefined,
    });
  } catch {
    throw new Error('Không thể kết nối tới máy chủ. Vui lòng thử lại.');
  }

  const vanBan = await phanHoi.text();
  let ketQua;
  try {
    ketQua = vanBan ? JSON.parse(vanBan) : {};
  } catch {
    throw new Error(`Máy chủ trả về phản hồi không hợp lệ (HTTP ${phanHoi.status})`);
  }

  if (!phanHoi.ok || ketQua.thanhCong === false) {
    throw new Error(ketQua.thongBao || `Yêu cầu thất bại (HTTP ${phanHoi.status})`);
  }

  return ketQua.duLieu;
}

export const api = {
  get: (duongDan) => goiApi(duongDan, { method: 'GET' }),
  post: (duongDan, body) => goiApi(duongDan, { method: 'POST', body }),
  put: (duongDan, body) => goiApi(duongDan, { method: 'PUT', body }),
  del: (duongDan) => goiApi(duongDan, { method: 'DELETE' }),
};
