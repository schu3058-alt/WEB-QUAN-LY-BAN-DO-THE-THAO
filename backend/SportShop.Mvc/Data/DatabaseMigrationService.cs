using System.Reflection;
using Microsoft.EntityFrameworkCore;

namespace SportShop.Mvc.Data;

public static class DatabaseMigrationService
{
    private const string LegacyConstraintsMigration = "20261112130530_LegacySchemaConstraints";

    private static readonly IReadOnlyDictionary<string, string[]> LegacyColumns = new Dictionary<string, string[]>
    {
        ["tai_khoan"] = ["id", "hoTen", "email", "matKhauMaHoa", "soDienThoai", "vaiTro", "ngayTao"],
        ["danh_muc"] = ["id", "ten", "moTa", "slug"],
        ["san_pham"] = ["id", "ten", "moTa", "gia", "soLuongTon", "danhMucId", "hinhAnh", "trangThai", "ngayTao"],
        ["gio_hang_chi_tiet"] = ["id", "taiKhoanId", "sanPhamId", "soLuong"],
        ["don_hang"] = ["id", "taiKhoanId", "diaChiNhan", "soDienThoaiNhan", "ghiChu", "tongTien", "trangThai", "ngayTao"],
        ["don_hang_chi_tiet"] = ["id", "donHangId", "sanPhamId", "soLuong", "donGia"],
        ["thanh_toan"] = ["id", "donHangId", "phuongThuc", "soTien", "trangThai", "ngayTao"],
        ["danh_gia"] = ["id", "sanPhamId", "taiKhoanId", "soSao", "noiDung", "ngayTao"],
        ["khuyen_mai"] = ["id", "ma", "phanTramGiam", "ngayBatDau", "ngayKetThuc"],
        ["thong_bao"] = ["id", "taiKhoanId", "noiDung", "daDoc", "ngayTao"],
    };

    public static async Task MigrateAsync(SportShopDbContext db, ILogger logger)
    {
        await BaselineExistingDatabaseAsync(db, logger);
        var pendingMigrations = await db.Database.GetPendingMigrationsAsync();
        if (pendingMigrations.Contains(LegacyConstraintsMigration, StringComparer.Ordinal))
            await ValidateLegacyDatabaseAsync(db);
        await db.Database.MigrateAsync();
    }

    private static async Task ValidateLegacyDatabaseAsync(SportShopDbContext db)
    {
        await db.Database.OpenConnectionAsync();
        try
        {
            var connection = db.Database.GetDbConnection();
            var tableCount = 0;
            await using (var tableCommand = connection.CreateCommand())
            {
                tableCommand.CommandText = """
                    SELECT COUNT(*) FROM sqlite_master
                    WHERE type = 'table' AND name IN (
                        'tai_khoan', 'danh_muc', 'san_pham', 'gio_hang_chi_tiet', 'don_hang',
                        'don_hang_chi_tiet', 'thanh_toan', 'danh_gia', 'khuyen_mai', 'thong_bao'
                    )
                    """;
                tableCount = Convert.ToInt32(await tableCommand.ExecuteScalarAsync());
            }

            if (tableCount == 0)
                return;
            if (tableCount != LegacyColumns.Count)
                throw new InvalidOperationException("Không thể nâng cấp CSDL vì schema cũ chỉ có một phần các bảng bắt buộc.");

            var invalidDataQueries = new (string Description, string Sql)[]
            {
                ("vai trò tài khoản không hợp lệ", """SELECT COUNT(*) FROM "tai_khoan" WHERE "vaiTro" NOT IN ('khach_hang', 'quan_tri')"""),
                ("email tài khoản bị trùng", """SELECT COUNT(*) FROM (SELECT "email" COLLATE NOCASE FROM "tai_khoan" GROUP BY "email" COLLATE NOCASE HAVING COUNT(*) > 1)"""),
                ("tên danh mục rỗng", """SELECT COUNT(*) FROM "danh_muc" WHERE length(trim("ten")) = 0"""),
                ("slug danh mục bị trùng", """SELECT COUNT(*) FROM (SELECT "slug" FROM "danh_muc" GROUP BY "slug" HAVING COUNT(*) > 1)"""),
                ("giá, tồn kho hoặc trạng thái sản phẩm không hợp lệ", """SELECT COUNT(*) FROM "san_pham" WHERE "gia" < 0 OR "soLuongTon" < 0 OR "trangThai" NOT IN ('dang_ban', 'ngung_kinh_doanh')"""),
                ("số lượng hoặc sản phẩm trong giỏ hàng không hợp lệ", """SELECT COUNT(*) FROM "gio_hang_chi_tiet" WHERE "soLuong" <= 0"""),
                ("sản phẩm bị trùng trong giỏ hàng của tài khoản", """SELECT COUNT(*) FROM (SELECT "taiKhoanId", "sanPhamId" FROM "gio_hang_chi_tiet" GROUP BY "taiKhoanId", "sanPhamId" HAVING COUNT(*) > 1)"""),
                ("tổng tiền hoặc trạng thái đơn hàng không hợp lệ", """SELECT COUNT(*) FROM "don_hang" WHERE "tongTien" < 0 OR "trangThai" NOT IN ('cho_xac_nhan', 'dang_giao', 'da_giao', 'da_huy')"""),
                ("số lượng hoặc đơn giá chi tiết đơn hàng không hợp lệ", """SELECT COUNT(*) FROM "don_hang_chi_tiet" WHERE "soLuong" <= 0 OR "donGia" < 0"""),
                ("số tiền hoặc trạng thái thanh toán không hợp lệ", """SELECT COUNT(*) FROM "thanh_toan" WHERE "soTien" < 0 OR "trangThai" NOT IN ('cho_thanh_toan', 'da_thanh_toan', 'that_bai')"""),
                ("đơn hàng có nhiều bản ghi thanh toán", """SELECT COUNT(*) FROM (SELECT "donHangId" FROM "thanh_toan" GROUP BY "donHangId" HAVING COUNT(*) > 1)"""),
                ("số sao đánh giá không hợp lệ", """SELECT COUNT(*) FROM "danh_gia" WHERE "soSao" NOT BETWEEN 1 AND 5"""),
                ("phần trăm khuyến mãi không hợp lệ", """SELECT COUNT(*) FROM "khuyen_mai" WHERE "phanTramGiam" NOT BETWEEN 1 AND 100"""),
                ("mã khuyến mãi bị trùng", """SELECT COUNT(*) FROM (SELECT "ma" FROM "khuyen_mai" GROUP BY "ma" HAVING COUNT(*) > 1)"""),
                ("trạng thái đã đọc thông báo không hợp lệ", """SELECT COUNT(*) FROM "thong_bao" WHERE "daDoc" NOT IN (0, 1)"""),
            };

            foreach (var (description, sql) in invalidDataQueries)
            {
                await using var command = connection.CreateCommand();
                command.CommandText = sql;
                if (Convert.ToInt64(await command.ExecuteScalarAsync()) > 0)
                    throw new InvalidOperationException(
                        $"Không thể nâng cấp CSDL: phát hiện dữ liệu {description}. Hãy xử lý dữ liệu này trước khi chạy migration.");
            }

            await ValidateLegacyForeignKeysAsync(connection);
        }
        finally
        {
            await db.Database.CloseConnectionAsync();
        }
    }

    private static async Task ValidateLegacyForeignKeysAsync(System.Data.Common.DbConnection connection)
    {
        var expectedForeignKeys = new (string Table, string Column, string PrincipalTable, string PrincipalColumn)[]
        {
            ("san_pham", "danhMucId", "danh_muc", "id"),
            ("gio_hang_chi_tiet", "taiKhoanId", "tai_khoan", "id"),
            ("gio_hang_chi_tiet", "sanPhamId", "san_pham", "id"),
            ("don_hang", "taiKhoanId", "tai_khoan", "id"),
            ("don_hang_chi_tiet", "donHangId", "don_hang", "id"),
            ("don_hang_chi_tiet", "sanPhamId", "san_pham", "id"),
            ("thanh_toan", "donHangId", "don_hang", "id"),
            ("danh_gia", "sanPhamId", "san_pham", "id"),
            ("danh_gia", "taiKhoanId", "tai_khoan", "id"),
            ("thong_bao", "taiKhoanId", "tai_khoan", "id"),
        };

        foreach (var table in expectedForeignKeys.Select(key => key.Table).Distinct(StringComparer.Ordinal))
        {
            var actualForeignKeys = new HashSet<(string Table, string Column, string PrincipalColumn)>();
            await using var command = connection.CreateCommand();
            command.CommandText = $"PRAGMA foreign_key_list(\"{table}\")";
            await using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
                actualForeignKeys.Add((reader.GetString(2), reader.GetString(3), reader.GetString(4)));

            var missingForeignKeys = expectedForeignKeys
                .Where(key => key.Table == table && !actualForeignKeys.Contains((key.PrincipalTable, key.Column, key.PrincipalColumn)))
                .ToArray();
            if (missingForeignKeys.Length > 0)
                throw new InvalidOperationException(
                    $"Không thể nâng cấp CSDL: bảng {table} thiếu khóa ngoại cho cột {string.Join(", ", missingForeignKeys.Select(key => key.Column))}.");
        }

        await using var integrityCommand = connection.CreateCommand();
        integrityCommand.CommandText = "PRAGMA foreign_key_check";
        await using var integrityReader = await integrityCommand.ExecuteReaderAsync();
        if (await integrityReader.ReadAsync())
            throw new InvalidOperationException(
                $"Không thể nâng cấp CSDL: phát hiện bản ghi mồ côi trong bảng {integrityReader.GetString(0)} (id={integrityReader.GetValue(1)}).");
    }

    private static async Task BaselineExistingDatabaseAsync(SportShopDbContext db, ILogger logger)
    {
        await db.Database.OpenConnectionAsync();
        try
        {
            var connection = db.Database.GetDbConnection();
            var tables = new HashSet<string>(StringComparer.Ordinal);
            await using (var command = connection.CreateCommand())
            {
                command.CommandText = "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'";
                await using var reader = await command.ExecuteReaderAsync();
                while (await reader.ReadAsync())
                    tables.Add(reader.GetString(0));
            }

            var hasHistory = tables.Contains("__EFMigrationsHistory");
            if (hasHistory)
            {
                await using var historyCommand = connection.CreateCommand();
                historyCommand.CommandText = "SELECT COUNT(*) FROM \"__EFMigrationsHistory\"";
                if (Convert.ToInt64(await historyCommand.ExecuteScalarAsync()) > 0)
                    return;
            }

            var existingTables = tables.Where(table => table != "__EFMigrationsHistory").ToArray();
            if (existingTables.Length == 0)
                return;

            var missingTables = LegacyColumns.Keys.Where(table => !tables.Contains(table)).ToArray();
            if (missingTables.Length > 0)
                throw new InvalidOperationException(
                    $"Không thể tự nâng cấp CSDL chưa hoàn chỉnh. Thiếu bảng: {string.Join(", ", missingTables)}.");

            foreach (var (table, requiredColumns) in LegacyColumns)
            {
                var existingColumns = new HashSet<string>(StringComparer.Ordinal);
                await using var columnsCommand = connection.CreateCommand();
                columnsCommand.CommandText = $"PRAGMA table_info(\"{table}\")";
                await using var columnsReader = await columnsCommand.ExecuteReaderAsync();
                while (await columnsReader.ReadAsync())
                    existingColumns.Add(columnsReader.GetString(1));

                var missingColumns = requiredColumns.Where(column => !existingColumns.Contains(column)).ToArray();
                if (missingColumns.Length > 0)
                    throw new InvalidOperationException(
                        $"Không thể tự nâng cấp CSDL chưa tương thích. Bảng {table} thiếu cột: {string.Join(", ", missingColumns)}.");
            }

            var initialMigration = db.Database.GetMigrations()
                .OrderBy(migration => migration, StringComparer.Ordinal)
                .FirstOrDefault();
            if (initialMigration is null)
                throw new InvalidOperationException("Không tìm thấy migration để ghi nhận schema CSDL hiện có.");

            var informationalVersion = typeof(DbContext).Assembly
                .GetCustomAttribute<AssemblyInformationalVersionAttribute>()?.InformationalVersion;
            var productVersion = informationalVersion?.Split('+')[0] ?? "8.0.12";
            await using var baselineCommand = connection.CreateCommand();
            baselineCommand.CommandText = """
                CREATE TABLE IF NOT EXISTS "__EFMigrationsHistory" (
                    "MigrationId" TEXT NOT NULL CONSTRAINT "PK___EFMigrationsHistory" PRIMARY KEY,
                    "ProductVersion" TEXT NOT NULL
                );
                INSERT OR IGNORE INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
                VALUES ($migrationId, $productVersion);
                """;
            var migrationParameter = baselineCommand.CreateParameter();
            migrationParameter.ParameterName = "$migrationId";
            migrationParameter.Value = initialMigration;
            baselineCommand.Parameters.Add(migrationParameter);
            var versionParameter = baselineCommand.CreateParameter();
            versionParameter.ParameterName = "$productVersion";
            versionParameter.Value = productVersion;
            baselineCommand.Parameters.Add(versionParameter);
            await baselineCommand.ExecuteNonQueryAsync();

            logger.LogWarning(
                "Đã nhận diện schema SQLite cũ có đủ bảng/cột bắt buộc và ghi nhận migration nền {MigrationId} mà không thay đổi dữ liệu.",
                initialMigration);
        }
        finally
        {
            await db.Database.CloseConnectionAsync();
        }
    }
}
