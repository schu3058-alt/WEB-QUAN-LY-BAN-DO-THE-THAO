PRAGMA foreign_keys = ON;

-- ==========================================================
-- GIAI ĐOẠN 1: THƯƠNG HIỆU, MÔN THỂ THAO, BIẾN THỂ & KHO
-- ==========================================================
CREATE TABLE IF NOT EXISTS thuong_hieu (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tenThuongHieu TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    logoUrl TEXT,
    moTa TEXT,
    trangThai INTEGER NOT NULL DEFAULT 1,
    ngayTao TEXT NOT NULL DEFAULT (datetime('now'))
);
-- ==========================================================
-- BỔ SUNG: BẢNG GIỎ HÀNG CHI TIẾT THEO BIẾN THỂ SẢN PHẨM
-- ==========================================================
CREATE TABLE IF NOT EXISTS gio_hang_chi_tiet (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    taiKhoanId INTEGER NOT NULL REFERENCES tai_khoan(id) ON DELETE CASCADE,
    bienTheId INTEGER NOT NULL REFERENCES bien_the_san_pham(id) ON DELETE CASCADE,
    soLuong INTEGER NOT NULL DEFAULT 1 CHECK (soLuong > 0),
    ngayThem TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE (taiKhoanId, bienTheId)
);

CREATE TABLE IF NOT EXISTS mon_the_thao (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tenMon TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    iconUrl TEXT,
    trangThai INTEGER NOT NULL DEFAULT 1
);

-- Bổ sung cột khóa ngoại vào bảng san_pham
ALTER TABLE san_pham ADD COLUMN thuongHieuId INTEGER REFERENCES thuong_hieu(id);
ALTER TABLE san_pham ADD COLUMN monTheThaoId INTEGER REFERENCES mon_the_thao(id);

CREATE TABLE IF NOT EXISTS bien_the_san_pham (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sanPhamId INTEGER NOT NULL REFERENCES san_pham(id) ON DELETE CASCADE,
    sku TEXT NOT NULL UNIQUE,
    kichCo TEXT NOT NULL,
    mauSac TEXT NOT NULL,
    maMauHex TEXT,
    giaBan REAL NOT NULL CHECK (giaBan >= 0),
    giaKhuyenMai REAL,
    soLuongTon INTEGER NOT NULL DEFAULT 0 CHECK (soLuongTon >= 0),
    mucCanhBaoTon INTEGER NOT NULL DEFAULT 5,
    hinhAnhUrl TEXT,
    trangThai INTEGER NOT NULL DEFAULT 1,
    UNIQUE (sanPhamId, kichCo, mauSac)
);

CREATE TABLE IF NOT EXISTS phieu_nhap_xuat_kho (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    maPhieu TEXT NOT NULL UNIQUE,
    loaiPhieu TEXT NOT NULL CHECK (loaiPhieu IN ('NHAP', 'XUAT', 'DIEU_CHINH', 'HOAN_TRA')),
    nguoiThucHienId INTEGER NOT NULL REFERENCES tai_khoan(id),
    donHangId INTEGER,
    ghiChu TEXT,
    ngayTao TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS chi_tiet_nhap_xuat_kho (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    phieuId INTEGER NOT NULL REFERENCES phieu_nhap_xuat_kho(id) ON DELETE CASCADE,
    bienTheId INTEGER NOT NULL REFERENCES bien_the_san_pham(id),
    soLuongThayDoi INTEGER NOT NULL,
    tonTruoc INTEGER NOT NULL,
    tonSau INTEGER NOT NULL,
    donGiaNhap REAL
);

-- ==========================================================
-- GIAI ĐOẠN 2: YÊU THÍCH & LỊCH SỬ XEM SẢN PHẨM
-- ==========================================================
CREATE TABLE IF NOT EXISTS san_pham_yeu_thich (
    taiKhoanId INTEGER NOT NULL REFERENCES tai_khoan(id) ON DELETE CASCADE,
    sanPhamId INTEGER NOT NULL REFERENCES san_pham(id) ON DELETE CASCADE,
    ngayThem TEXT NOT NULL DEFAULT (datetime('now')),
    PRIMARY KEY (taiKhoanId, sanPhamId)
);

CREATE TABLE IF NOT EXISTS lich_su_xem_san_pham (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    taiKhoanId INTEGER NOT NULL REFERENCES tai_khoan(id) ON DELETE CASCADE,
    sanPhamId INTEGER NOT NULL REFERENCES san_pham(id) ON DELETE CASCADE,
    soLanXem INTEGER NOT NULL DEFAULT 1,
    lanXemCuoi TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE (taiKhoanId, sanPhamId)
);

-- ==========================================================
-- GIAI ĐOẠN 3: LỊCH SỬ TRẠNG THÁI ĐƠN & ĐỔI TRẢ TRỰC TUYẾN
-- ==========================================================
CREATE TABLE IF NOT EXISTS lich_su_trang_thai_don_hang (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    donHangId INTEGER NOT NULL REFERENCES don_hang(id) ON DELETE CASCADE,
    trangThaiCu TEXT,
    trangThaiMoi TEXT NOT NULL,
    nguoiCapNhatId INTEGER REFERENCES tai_khoan(id),
    ghiChu TEXT,
    thoiGian TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS yeu_cau_doi_tra (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    maYeuCau TEXT NOT NULL UNIQUE,
    donHangId INTEGER NOT NULL REFERENCES don_hang(id),
    taiKhoanId INTEGER NOT NULL REFERENCES tai_khoan(id),
    loaiYeuCau TEXT NOT NULL CHECK (loaiYeuCau IN ('DOI_HANG', 'TRA_HANG_HOAN_TIEN')),
    lyDo TEXT NOT NULL,
    hinhAnhMinhChung TEXT,
    trangThai TEXT NOT NULL DEFAULT 'CHO_DUYET'
        CHECK (trangThai IN ('CHO_DUYET', 'DA_DUYET', 'TU_CHOI', 'DANG_XU_LY', 'HOAN_TAT')),
    phanHoiAdmin TEXT,
    ngayTao TEXT NOT NULL DEFAULT (datetime('now')),
    ngayCapNhat TEXT
);

CREATE TABLE IF NOT EXISTS chi_tiet_doi_tra (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    yeuCauDoiTraId INTEGER NOT NULL REFERENCES yeu_cau_doi_tra(id) ON DELETE CASCADE,
    bienTheCuId INTEGER NOT NULL REFERENCES bien_the_san_pham(id),
    bienTheMoiId INTEGER REFERENCES bien_the_san_pham(id),
    soLuong INTEGER NOT NULL CHECK (soLuong > 0)
);

-- ==========================================================
-- GIAI ĐOẠN 4: HẠNG THÀNH VIÊN, TÍCH ĐIỂM & VOUCHER NÂNG CAO
-- ==========================================================
CREATE TABLE IF NOT EXISTS hang_thanh_vien (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tenHang TEXT NOT NULL UNIQUE,
    diemToiThieu INTEGER NOT NULL DEFAULT 0,
    tiLeTichDiem REAL NOT NULL DEFAULT 1.0,
    phanTramGiamMacDinh REAL NOT NULL DEFAULT 0
);

INSERT OR IGNORE INTO hang_thanh_vien (id, tenHang, diemToiThieu, tiLeTichDiem, phanTramGiamMacDinh)
VALUES (1, 'Thành viên Đồng', 0, 1.0, 0),
       (2, 'Thành viên Bạc', 500, 1.5, 2),
       (3, 'Thành viên Vàng', 2000, 2.0, 5),
       (4, 'Thành viên Kim Cương', 5000, 3.0, 8);

ALTER TABLE tai_khoan ADD COLUMN diemTichLuy INTEGER NOT NULL DEFAULT 0;
ALTER TABLE tai_khoan ADD COLUMN hangThanhVienId INTEGER NOT NULL DEFAULT 1 REFERENCES hang_thanh_vien(id);

CREATE TABLE IF NOT EXISTS lich_su_tich_diem (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    taiKhoanId INTEGER NOT NULL REFERENCES tai_khoan(id),
    donHangId INTEGER REFERENCES don_hang(id),
    soDiemThayDoi INTEGER NOT NULL,
    loaiGiaoDich TEXT NOT NULL CHECK (loaiGiaoDich IN ('TICH_DIEM_DON_HANG', 'DOI_VOUCHER', 'HOAN_DIEM')),
    moTa TEXT,
    ngayTao TEXT NOT NULL DEFAULT (datetime('now'))
);

ALTER TABLE khuyen_mai ADD COLUMN gioiHanMoiKhach INTEGER NOT NULL DEFAULT 1;
ALTER TABLE khuyen_mai ADD COLUMN hangToiThieuId INTEGER REFERENCES hang_thanh_vien(id);
ALTER TABLE khuyen_mai ADD COLUMN diemCanDoi INTEGER;

CREATE TABLE IF NOT EXISTS lich_su_su_dung_voucher (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    khuyenMaiId INTEGER NOT NULL REFERENCES khuyen_mai(id),
    taiKhoanId INTEGER NOT NULL REFERENCES tai_khoan(id),
    donHangId INTEGER NOT NULL REFERENCES don_hang(id),
    soTienGiam REAL NOT NULL,
    ngaySuDung TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ==========================================================
-- GIAI ĐOẠN 5: PHÂN QUYỀN RBAC & NHẬT KÝ HOẠT ĐỘNG
-- ==========================================================
CREATE TABLE IF NOT EXISTS vai_tro (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    maVaiTro TEXT NOT NULL UNIQUE,
    tenVaiTro TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS quyen_han (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    maQuyen TEXT NOT NULL UNIQUE,
    moTa TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS vai_tro_quyen_han (
    vaiTroId INTEGER NOT NULL REFERENCES vai_tro(id) ON DELETE CASCADE,
    quyenHanId INTEGER NOT NULL REFERENCES quyen_han(id) ON DELETE CASCADE,
    PRIMARY KEY (vaiTroId, quyenHanId)
);

CREATE TABLE IF NOT EXISTS nhat_ky_hoat_dong (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    taiKhoanId INTEGER REFERENCES tai_khoan(id),
    hanhDong TEXT NOT NULL,
    doiTuong TEXT,
    duLieuCu TEXT,
    duLieuMoi TEXT,
    diaChiIP TEXT,
    thoiGian TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ==========================================================
-- GIAI ĐOẠN 6: GIAO DỊCH THANH TOÁN & CHỐNG TRÙNG
-- ==========================================================
CREATE TABLE IF NOT EXISTS giao_dich_thanh_toan (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    donHangId INTEGER NOT NULL REFERENCES don_hang(id),
    congThanhToan TEXT NOT NULL,
    maThamChieuNoiBo TEXT NOT NULL UNIQUE,
    maGiaoDichDoiTac TEXT UNIQUE,
    soTien REAL NOT NULL,
    trangThai TEXT NOT NULL DEFAULT 'KHOI_TAO'
        CHECK (trangThai IN ('KHOI_TAO', 'THANH_CONG', 'THAT_BAI', 'HOAN_TIEN')),
    payloadWebhook TEXT,
    ngayTao TEXT NOT NULL DEFAULT (datetime('now')),
    ngayXacNhan TEXT
);