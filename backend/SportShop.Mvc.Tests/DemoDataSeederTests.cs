using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using SportShop.Mvc.Data;

namespace SportShop.Mvc.Tests;

public sealed class DemoDataSeederTests
{
    [Fact]
    public async Task SeederCreatesDemoDataAndRejectsProductionOrRepeatedSeeding()
    {
        var databasePath = Path.Combine(Path.GetTempPath(), $"sportshop-seed-test-{Guid.NewGuid():N}.sqlite");
        try
        {
            var options = new DbContextOptionsBuilder<SportShopDbContext>()
                .UseSqlite($"Data Source={databasePath};Foreign Keys=True")
                .Options;

            await using var db = new SportShopDbContext(options);
            await db.Database.MigrateAsync();
            await Assert.ThrowsAsync<InvalidOperationException>(() => DemoDataSeeder.SeedAsync(db, isProduction: true));
            Assert.Empty(await db.TaiKhoan.ToListAsync());

            await DemoDataSeeder.SeedAsync(db, isProduction: false);

            Assert.Equal(2, await db.TaiKhoan.CountAsync());
            Assert.Equal(4, await db.DanhMuc.CountAsync());
            Assert.Equal(4, await db.SanPham.CountAsync());
            Assert.Equal(1, await db.KhuyenMai.CountAsync());
            Assert.True(BCrypt.Net.BCrypt.Verify(
                "SportShopAdmin123!",
                await db.TaiKhoan.Where(account => account.Email == "admin@sportshop.vn")
                    .Select(account => account.MatKhauMaHoa).SingleAsync()));

            await Assert.ThrowsAsync<InvalidOperationException>(() => DemoDataSeeder.SeedAsync(db, isProduction: false));
            Assert.Equal(2, await db.TaiKhoan.CountAsync());
        }
        finally
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
}
