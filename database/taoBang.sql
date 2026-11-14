-- Script tao toan bo bang cho CSDL SportShop (SQLite)

CREATE TABLE IF NOT EXISTS tai_khoan (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  hoTen           TEXT NOT NULL,
  email           TEXT NOT NULL COLLATE NOCASE UNIQUE,
  matKhauMaHoa    TEXT NOT NULL,
  soDienThoai     TEXT,
  vaiTro          TEXT NOT NULL DEFAULT 'khach_hang' CHECK (vaiTro IN ('khach_hang', 'quan_tri')),
  ngayTao         TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS danh_muc (
  id      INTEGER PRIMARY KEY AUTOINCREMENT,
  ten     TEXT NOT NULL CHECK (length(trim(ten)) > 0),
  moTa    TEXT,
  slug    TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS san_pham (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  ten           TEXT NOT NULL,
  moTa          TEXT,
  gia           REAL NOT NULL CHECK (gia >= 0),
  soLuongTon    INTEGER NOT NULL DEFAULT 0 CHECK (soLuongTon >= 0),
  danhMucId     INTEGER,
  hinhAnh       TEXT,
  trangThai     TEXT NOT NULL DEFAULT 'dang_ban' CHECK (trangThai IN ('dang_ban', 'ngung_kinh_doanh')),
  ngayTao       TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (danhMucId) REFERENCES danh_muc(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS gio_hang_chi_tiet (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  taiKhoanId  INTEGER NOT NULL,
  sanPhamId   INTEGER NOT NULL,
  soLuong     INTEGER NOT NULL CHECK (soLuong > 0),
  FOREIGN KEY (taiKhoanId) REFERENCES tai_khoan(id) ON DELETE CASCADE,
  FOREIGN KEY (sanPhamId) REFERENCES san_pham(id) ON DELETE CASCADE,
  UNIQUE (taiKhoanId, sanPhamId)
);

CREATE TABLE IF NOT EXISTS don_hang (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  taiKhoanId        INTEGER NOT NULL,
  diaChiNhan        TEXT NOT NULL,
  soDienThoaiNhan   TEXT NOT NULL,
  ghiChu            TEXT,
  tongTienGoc       REAL NOT NULL DEFAULT 0 CHECK (tongTienGoc >= 0),
  tienGiam          REAL NOT NULL DEFAULT 0 CHECK (tienGiam >= 0),
  tongTienSauGiam   REAL NOT NULL DEFAULT 0 CHECK (tongTienSauGiam >= 0),
  maKhuyenMai       TEXT,
  tongTien          REAL NOT NULL CHECK (tongTien >= 0),
  trangThai         TEXT NOT NULL DEFAULT 'cho_xac_nhan' CHECK (trangThai IN ('cho_xac_nhan', 'dang_giao', 'da_giao', 'da_huy')),
  ngayTao           TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (taiKhoanId) REFERENCES tai_khoan(id)
);

CREATE TABLE IF NOT EXISTS don_hang_chi_tiet (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  donHangId   INTEGER NOT NULL,
  sanPhamId   INTEGER NOT NULL,
  soLuong     INTEGER NOT NULL CHECK (soLuong > 0),
  donGia      REAL NOT NULL CHECK (donGia >= 0),
  FOREIGN KEY (donHangId) REFERENCES don_hang(id) ON DELETE CASCADE,
  FOREIGN KEY (sanPhamId) REFERENCES san_pham(id)
);

CREATE TABLE IF NOT EXISTS thanh_toan (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  donHangId   INTEGER NOT NULL UNIQUE,
  phuongThuc  TEXT NOT NULL, -- tien_mat | chuyen_khoan | vi_dien_tu
  soTien      REAL NOT NULL CHECK (soTien >= 0),
  trangThai   TEXT NOT NULL DEFAULT 'cho_thanh_toan' CHECK (trangThai IN ('cho_thanh_toan', 'da_thanh_toan', 'that_bai')),
  ngayTao     TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (donHangId) REFERENCES don_hang(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS danh_gia (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  sanPhamId   INTEGER NOT NULL,
  taiKhoanId  INTEGER NOT NULL,
  soSao       INTEGER NOT NULL CHECK (soSao BETWEEN 1 AND 5),
  noiDung     TEXT,
  ngayTao     TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (sanPhamId) REFERENCES san_pham(id) ON DELETE CASCADE,
  FOREIGN KEY (taiKhoanId) REFERENCES tai_khoan(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS khuyen_mai (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  ma              TEXT NOT NULL UNIQUE,
  phanTramGiam    REAL NOT NULL CHECK (phanTramGiam BETWEEN 1 AND 100),
  dieuKienApDung  REAL NOT NULL DEFAULT 0 CHECK (dieuKienApDung >= 0),
  trangThai       TEXT NOT NULL DEFAULT 'hoat_dong' CHECK (trangThai IN ('hoat_dong', 'tam_dung', 'het_han')),
  ngayBatDau      TEXT NOT NULL,
  ngayKetThuc     TEXT NOT NULL,
  ngayTao         TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS thong_bao (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  taiKhoanId  INTEGER NOT NULL,
  noiDung     TEXT NOT NULL,
  daDoc       INTEGER NOT NULL DEFAULT 0 CHECK (daDoc IN (0, 1)),
  ngayTao     TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (taiKhoanId) REFERENCES tai_khoan(id) ON DELETE CASCADE
);
