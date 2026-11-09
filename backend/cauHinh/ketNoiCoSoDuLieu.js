// Khoi tao ket noi SQLite dung chung cho toan bo ung dung
const Database = require('better-sqlite3');
const duongDan = require('path').resolve(__dirname, '../../', require('./cauHinhChung').duongDanCsdl);

const coSoDuLieu = new Database(duongDan);
coSoDuLieu.pragma('journal_mode = WAL');
coSoDuLieu.pragma('foreign_keys = ON');

module.exports = coSoDuLieu;
