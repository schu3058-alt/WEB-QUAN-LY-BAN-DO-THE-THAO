using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;
using SportShop.Mvc.Data;

namespace SportShop.Mvc.Tests;

public sealed class LegacyDatabaseMigrationTests
{
    [Fact]
    public async Task LegacyDatabaseMigrationPreservesDataAndAddsConstraints()
    {
        var databasePath = CreateLegacyDatabase();
        try
        {
            var options = new DbContextOptionsBuilder<SportShopDbContext>()
                .UseSqlite($"Data Source={databasePath};Foreign Keys=True")
                .Options;

            await using var db = new SportShopDbContext(options);
            await DatabaseMigrationService.MigrateAsync(db, NullLogger.Instance);

            Assert.Equal(1, await db.TaiKhoan.CountAsync());
            Assert.Equal("legacy@example.com", await db.TaiKhoan.Select(account => account.Email).SingleAsync());
            Assert.Equal("Legacy category", await db.DanhMuc.Select(category => category.Ten).SingleAsync());
            Assert.Equal("Legacy product", await db.SanPham.Select(product => product.Ten).SingleAsync());
            Assert.Equal(2, (await db.Database.GetAppliedMigrationsAsync()).Count());

            await Assert.ThrowsAsync<SqliteException>(() => db.Database.ExecuteSqlRawAsync(
                """INSERT INTO "tai_khoan" ("hoTen", "email", "matKhauMaHoa", "vaiTro") VALUES ('Invalid', 'invalid@example.com', 'hash', 'invalid')"""));
            await Assert.ThrowsAsync<SqliteException>(() => db.Database.ExecuteSqlRawAsync(
                """INSERT INTO "khuyen_mai" ("ma", "phanTramGiam", "ngayBatDau", "ngayKetThuc") VALUES ('BAD', 101, '2026-01-01', '2026-12-31')"""));
            await Assert.ThrowsAsync<SqliteException>(() => db.Database.ExecuteSqlRawAsync(
                """INSERT INTO "gio_hang_chi_tiet" ("taiKhoanId", "sanPhamId", "soLuong") VALUES (1, 1, 0)"""));
        }
        finally
        {
            DeleteDatabase(databasePath);
        }
    }

    [Fact]
    public async Task LegacyMigrationRejectsInvalidExistingDataWithoutChangingIt()
    {
        var databasePath = CreateLegacyDatabase(invalidAccountRole: true);
        try
        {
            var options = new DbContextOptionsBuilder<SportShopDbContext>()
                .UseSqlite($"Data Source={databasePath};Foreign Keys=True")
                .Options;

            await using var db = new SportShopDbContext(options);
            var exception = await Assert.ThrowsAsync<InvalidOperationException>(
                () => DatabaseMigrationService.MigrateAsync(db, NullLogger.Instance));

            Assert.Contains("vai trò tài khoản không hợp lệ", exception.Message);
            Assert.Equal(1, await db.TaiKhoan.CountAsync());
            Assert.Equal("legacy_invalid", await db.TaiKhoan.Select(account => account.VaiTro).SingleAsync());
            Assert.Single(await db.Database.GetAppliedMigrationsAsync());
        }
        finally
        {
            DeleteDatabase(databasePath);
        }
    }

    private static string CreateLegacyDatabase(bool invalidAccountRole = false)
    {
        var databasePath = Path.Combine(Path.GetTempPath(), $"sportshop-legacy-test-{Guid.NewGuid():N}.sqlite");
        using var connection = new SqliteConnection($"Data Source={databasePath};Foreign Keys=True");
        connection.Open();
        using var command = connection.CreateCommand();
        command.CommandText = """
            CREATE TABLE tai_khoan (
                id INTEGER PRIMARY KEY AUTOINCREMENT, hoTen TEXT NOT NULL, email TEXT NOT NULL,
                matKhauMaHoa TEXT NOT NULL, soDienThoai TEXT, vaiTro TEXT NOT NULL, ngayTao TEXT NOT NULL
            );
            CREATE TABLE danh_muc (
                id INTEGER PRIMARY KEY AUTOINCREMENT, ten TEXT NOT NULL, moTa TEXT, slug TEXT NOT NULL
            );
            CREATE TABLE san_pham (
                id INTEGER PRIMARY KEY AUTOINCREMENT, ten TEXT NOT NULL, moTa TEXT, gia REAL NOT NULL,
                soLuongTon INTEGER NOT NULL, danhMucId INTEGER, hinhAnh TEXT, trangThai TEXT NOT NULL,
                ngayTao TEXT NOT NULL, FOREIGN KEY (danhMucId) REFERENCES danh_muc(id) ON DELETE SET NULL
            );
            CREATE TABLE gio_hang_chi_tiet (
                id INTEGER PRIMARY KEY AUTOINCREMENT, taiKhoanId INTEGER NOT NULL, sanPhamId INTEGER NOT NULL,
                soLuong INTEGER NOT NULL, FOREIGN KEY (taiKhoanId) REFERENCES tai_khoan(id) ON DELETE CASCADE,
                FOREIGN KEY (sanPhamId) REFERENCES san_pham(id) ON DELETE CASCADE
            );
            CREATE TABLE don_hang (
                id INTEGER PRIMARY KEY AUTOINCREMENT, taiKhoanId INTEGER NOT NULL, diaChiNhan TEXT NOT NULL,
                soDienThoaiNhan TEXT NOT NULL, ghiChu TEXT, tongTien REAL NOT NULL, trangThai TEXT NOT NULL,
                ngayTao TEXT NOT NULL, FOREIGN KEY (taiKhoanId) REFERENCES tai_khoan(id)
            );
            CREATE TABLE don_hang_chi_tiet (
                id INTEGER PRIMARY KEY AUTOINCREMENT, donHangId INTEGER NOT NULL, sanPhamId INTEGER NOT NULL,
                soLuong INTEGER NOT NULL, donGia REAL NOT NULL,
                FOREIGN KEY (donHangId) REFERENCES don_hang(id) ON DELETE CASCADE,
                FOREIGN KEY (sanPhamId) REFERENCES san_pham(id)
            );
            CREATE TABLE thanh_toan (
                id INTEGER PRIMARY KEY AUTOINCREMENT, donHangId INTEGER NOT NULL, phuongThuc TEXT NOT NULL,
                soTien REAL NOT NULL, trangThai TEXT NOT NULL, ngayTao TEXT NOT NULL,
                FOREIGN KEY (donHangId) REFERENCES don_hang(id) ON DELETE CASCADE
            );
            CREATE TABLE danh_gia (
                id INTEGER PRIMARY KEY AUTOINCREMENT, sanPhamId INTEGER NOT NULL, taiKhoanId INTEGER NOT NULL,
                soSao INTEGER NOT NULL, noiDung TEXT, ngayTao TEXT NOT NULL,
                FOREIGN KEY (sanPhamId) REFERENCES san_pham(id) ON DELETE CASCADE,
                FOREIGN KEY (taiKhoanId) REFERENCES tai_khoan(id) ON DELETE CASCADE
            );
            CREATE TABLE khuyen_mai (
                id INTEGER PRIMARY KEY AUTOINCREMENT, ma TEXT NOT NULL, phanTramGiam REAL NOT NULL,
                ngayBatDau TEXT NOT NULL, ngayKetThuc TEXT NOT NULL
            );
            CREATE TABLE thong_bao (
                id INTEGER PRIMARY KEY AUTOINCREMENT, taiKhoanId INTEGER NOT NULL, noiDung TEXT NOT NULL,
                daDoc INTEGER NOT NULL, ngayTao TEXT NOT NULL,
                FOREIGN KEY (taiKhoanId) REFERENCES tai_khoan(id) ON DELETE CASCADE
            );
            """;
        command.ExecuteNonQuery();

        using var insert = connection.CreateCommand();
        insert.CommandText = """
            INSERT INTO tai_khoan (hoTen, email, matKhauMaHoa, vaiTro, ngayTao)
            VALUES ('Legacy user', 'legacy@example.com', 'hash', $role, '2026-01-01');
            INSERT INTO danh_muc (ten, slug) VALUES ('Legacy category', 'legacy-category');
            INSERT INTO san_pham (ten, gia, soLuongTon, danhMucId, trangThai, ngayTao)
            VALUES ('Legacy product', 50, 5, 1, 'dang_ban', '2026-01-01');
            """;
        insert.Parameters.AddWithValue("$role", invalidAccountRole ? "legacy_invalid" : "khach_hang");
        insert.ExecuteNonQuery();
        return databasePath;
    }

    private static void DeleteDatabase(string databasePath)
    {
        SqliteConnection.ClearAllPools();
        foreach (var suffix in new[] { "", "-shm", "-wal" })
        {
            var path = databasePath + suffix;
            if (File.Exists(path))
                File.Delete(path);
        }
    }
}
