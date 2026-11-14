const fs = require('fs');
const os = require('os');
const path = require('path');
const Database = require('better-sqlite3');

process.env.JWT_SECRET = process.env.JWT_SECRET || 'sportshop-jest-only-secret-do-not-use-outside-tests';

const thuMucTam = fs.mkdtempSync(path.join(os.tmpdir(), 'sportshop-jest-'));
const duongDanCsdl = path.join(thuMucTam, 'kiem-thu.sqlite');
process.env.DUONG_DAN_CSDL = duongDanCsdl;
global.__sportshopThuMucCSDL = thuMucTam;

const coSoDuLieu = new Database(duongDanCsdl);
coSoDuLieu.pragma('foreign_keys = ON');
coSoDuLieu.exec(fs.readFileSync(path.join(__dirname, '..', 'database', 'taoBang.sql'), 'utf8'));
coSoDuLieu.exec(fs.readFileSync(path.join(__dirname, '..', 'database', 'chiMuc.sql'), 'utf8'));
coSoDuLieu.close();
