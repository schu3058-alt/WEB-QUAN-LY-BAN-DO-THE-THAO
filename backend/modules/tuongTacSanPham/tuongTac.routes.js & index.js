// tuongTac.routes.js
const router = require('express').Router();
const ctrl = require('./tuongTac.controller');
const xacThuc = require('../../middleware/xacThuc');

router.post('/yeu-thich/:sanPhamId', xacThuc, ctrl.yeuThich);
router.get('/vua-xem', xacThuc, ctrl.vuaXem);
router.get('/so-sanh', ctrl.soSanh);
router.get('/goi-y/:sanPhamId', ctrl.goiY);

module.exports = router;

// index.js
module.exports = require('./tuongTac.routes');