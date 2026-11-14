-- Ghi chu ve rang buoc SQLite; schema chinh thuc duoc quan ly bang EF Core migrations.

-- database/taoBang.sql luu cac rang buoc CHECK/UNIQUE cho schema moi.
-- Migration LegacySchemaConstraints bo sung trigger tuong duong cho CSDL cu
-- ma SQLite khong the ALTER TABLE de them CHECK/UNIQUE ma khong rebuild bang.
-- Migration kiem tra du lieu cu va dung ro rang neu co du lieu vi pham; khong tu sua/xoa.
-- Khoa ngoai va hanh vi xoa duoc khai bao trong taoBang.sql va SportShopDbContext.
