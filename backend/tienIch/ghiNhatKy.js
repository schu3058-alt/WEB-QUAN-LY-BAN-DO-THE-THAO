// Ghi nhat ky don gian ra console (co the thay bang winston/pino sau nay)
function ghiThongTin(noiDung) {
  console.log(`[THONG-TIN] ${new Date().toISOString()} - ${noiDung}`);
}

function ghiLoi(loi) {
  console.error(`[LOI] ${new Date().toISOString()} - ${loi.message}`);
  if (loi.stack) console.error(loi.stack);
}

module.exports = { ghiThongTin, ghiLoi };
