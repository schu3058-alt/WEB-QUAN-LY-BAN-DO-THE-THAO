const fs = require('fs');
const path = require('path');
const coSoDuLieu = require('../backend/cauHinh/ketNoiCoSoDuLieu');

afterAll(() => {
  coSoDuLieu.close();
  fs.rmSync(global.__sportshopThuMucCSDL, { recursive: true, force: true });
});
