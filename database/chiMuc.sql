-- Chi muc giup tang toc cac truy van thuong gap

CREATE INDEX IF NOT EXISTS idx_san_pham_danhMucId ON san_pham (danhMucId);
CREATE INDEX IF NOT EXISTS idx_san_pham_trangThai ON san_pham (trangThai);
CREATE INDEX IF NOT EXISTS idx_san_pham_ten ON san_pham (ten);

CREATE INDEX IF NOT EXISTS idx_don_hang_taiKhoanId ON don_hang (taiKhoanId);
CREATE INDEX IF NOT EXISTS idx_don_hang_trangThai ON don_hang (trangThai);

CREATE INDEX IF NOT EXISTS idx_don_hang_chi_tiet_donHangId ON don_hang_chi_tiet (donHangId);

CREATE INDEX IF NOT EXISTS idx_gio_hang_chi_tiet_taiKhoanId ON gio_hang_chi_tiet (taiKhoanId);

CREATE INDEX IF NOT EXISTS idx_danh_gia_sanPhamId ON danh_gia (sanPhamId);

CREATE INDEX IF NOT EXISTS idx_thong_bao_taiKhoanId ON thong_bao (taiKhoanId);

CREATE UNIQUE INDEX IF NOT EXISTS idx_thanh_toan_donHangId ON thanh_toan (donHangId);
