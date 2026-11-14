using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using System.Globalization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using SportShop.Mvc.Data;
using SportShop.Mvc.Models;
using SportShop.Mvc.Services;

namespace SportShop.Mvc.Tests;

public sealed class BackendTests : IClassFixture<SportShopFactory>
{
    private readonly SportShopFactory _factory;
    private readonly HttpClient _client;

    public BackendTests(SportShopFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task CustomerCanPlaceOrderAndAdminRoutesRejectCustomer()
    {
        var healthResponse = await _client.GetAsync("/api/health");
        Assert.Equal(HttpStatusCode.OK, healthResponse.StatusCode);
        await using (var migrationScope = _factory.Services.CreateAsyncScope())
        {
            var db = migrationScope.ServiceProvider.GetRequiredService<SportShopDbContext>();
            Assert.NotEmpty(await db.Database.GetAppliedMigrationsAsync());
            Assert.Equal(1L, await db.Database.SqlQueryRaw<long>(
                """SELECT COUNT(*) AS "Value" FROM sqlite_master WHERE type = 'trigger' AND name = 'trg_tai_khoan_vaiTro_insert'""")
                .SingleAsync());
            Assert.Equal(1L, await db.Database.SqlQueryRaw<long>(
                """SELECT COUNT(*) AS "Value" FROM sqlite_master WHERE type = 'index' AND name = 'IX_gio_hang_chi_tiet_sanPhamId'""")
                .SingleAsync());
            await Assert.ThrowsAsync<SqliteException>(() => db.Database.ExecuteSqlRawAsync(
                """INSERT INTO "tai_khoan" ("hoTen", "email", "matKhauMaHoa", "vaiTro") VALUES ('Invalid', 'invalid-role@example.com', 'hash', 'invalid')"""));
        }
        Assert.Contains(
            _factory.Services.GetServices<IHostedService>(),
            service => service is OrderMaintenanceHostedService);

        var unauthenticatedCart = await _client.GetAsync("/api/gio-hang");
        Assert.Equal(HttpStatusCode.Unauthorized, unauthenticatedCart.StatusCode);

        var registrationResponse = await _client.PostAsJsonAsync("/api/tai-khoan/dang-ky", new
        {
            hoTen = "Test Buyer",
            email = "buyer@example.com",
            matKhau = "StrongPass123",
            soDienThoai = "0901234567",
        });
        Assert.Equal(HttpStatusCode.OK, registrationResponse.StatusCode);
        using var registrationJson = JsonDocument.Parse(await registrationResponse.Content.ReadAsStringAsync());
        var token = registrationJson.RootElement.GetProperty("duLieu").GetProperty("token").GetString();
        Assert.False(string.IsNullOrWhiteSpace(token));
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var deniedAdminRequest = await _client.PostAsJsonAsync("/api/san-pham", new { });
        Assert.Equal(HttpStatusCode.Forbidden, deniedAdminRequest.StatusCode);

        int discontinuedProductId;
        await using (var scope = _factory.Services.CreateAsyncScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<SportShopDbContext>();
            var category = new Category { Ten = "Test", Slug = "test-category" };
            db.DanhMuc.Add(category);
            await db.SaveChangesAsync();
            db.SanPham.Add(new Product
            {
                Ten = "Test product",
                Gia = 100,
                SoLuongTon = 3,
                DanhMucId = category.Id,
                TrangThai = "dang_ban",
                NgayTao = DateTime.UtcNow,
            });
            var discontinuedProduct = new Product
            {
                Ten = "Discontinued test product",
                Gia = 80,
                SoLuongTon = 0,
                DanhMucId = category.Id,
                TrangThai = "ngung_kinh_doanh",
                NgayTao = DateTime.UtcNow,
            };
            db.SanPham.Add(discontinuedProduct);
            await db.SaveChangesAsync();
            discontinuedProductId = discontinuedProduct.Id;
        }

        var publicProductResponse = await _client.GetAsync("/api/san-pham?trangThai=tat_ca");
        Assert.Equal(HttpStatusCode.OK, publicProductResponse.StatusCode);
        using (var publicProductsJson = JsonDocument.Parse(await publicProductResponse.Content.ReadAsStringAsync()))
        {
            var publicProductIds = publicProductsJson.RootElement.GetProperty("duLieu")
                .GetProperty("danhSach")
                .EnumerateArray()
                .Select(product => product.GetProperty("id").GetInt32())
                .ToArray();
            Assert.Contains(1, publicProductIds);
            Assert.DoesNotContain(discontinuedProductId, publicProductIds);
        }

        var addToCartResponse = await _client.PostAsJsonAsync("/api/gio-hang", new { sanPhamId = 1, soLuong = 2 });
        Assert.Equal(HttpStatusCode.OK, addToCartResponse.StatusCode);
        using (var cartJson = JsonDocument.Parse(await addToCartResponse.Content.ReadAsStringAsync()))
        {
            var cartItemId = cartJson.RootElement.GetProperty("duLieu").GetProperty("danhSach")[0]
                .GetProperty("chiTietId").GetInt32();
            var updateCartResponse = await _client.PutAsJsonAsync($"/api/gio-hang/{cartItemId}", new { soLuong = 1 });
            Assert.Equal(HttpStatusCode.OK, updateCartResponse.StatusCode);

            var deleteCartResponse = await _client.DeleteAsync($"/api/gio-hang/{cartItemId}");
            Assert.Equal(HttpStatusCode.OK, deleteCartResponse.StatusCode);
        }
        await using (var inventoryScope = _factory.Services.CreateAsyncScope())
        {
            var db = inventoryScope.ServiceProvider.GetRequiredService<SportShopDbContext>();
            var stock = await db.SanPham.Where(product => product.Id == 1)
                .Select(product => product.SoLuongTon).SingleAsync();
            Assert.Equal(3, stock);
        }
        addToCartResponse = await _client.PostAsJsonAsync("/api/gio-hang", new { sanPhamId = 1, soLuong = 2 });
        Assert.Equal(HttpStatusCode.OK, addToCartResponse.StatusCode);
        var orderResponse = await _client.PostAsJsonAsync("/api/don-hang", new
        {
            diaChiNhan = "123 Test Street",
            soDienThoaiNhan = "0901234567",
            ghiChu = "test",
        });
        Assert.Equal(HttpStatusCode.OK, orderResponse.StatusCode);
        using var orderJson = JsonDocument.Parse(await orderResponse.Content.ReadAsStringAsync());
        var orderId = orderJson.RootElement.GetProperty("duLieu").GetProperty("id").GetInt32();

        var paymentResponse = await _client.PostAsJsonAsync("/api/thanh-toan", new
        {
            donHangId = orderId,
            phuongThuc = "tien_mat",
        });
        Assert.Equal(HttpStatusCode.OK, paymentResponse.StatusCode);
        using var paymentJson = JsonDocument.Parse(await paymentResponse.Content.ReadAsStringAsync());
        var paymentId = paymentJson.RootElement.GetProperty("duLieu").GetProperty("id").GetInt32();
        var customerConfirmPayment = await _client.PutAsync($"/api/thanh-toan/{paymentId}/xac-nhan", null);
        Assert.Equal(HttpStatusCode.Forbidden, customerConfirmPayment.StatusCode);
        var customerAccessReport = await _client.GetAsync("/api/bao-cao/tong-quan");
        Assert.Equal(HttpStatusCode.Forbidden, customerAccessReport.StatusCode);

        string adminToken;
        await using (var adminScope = _factory.Services.CreateAsyncScope())
        {
            var db = adminScope.ServiceProvider.GetRequiredService<SportShopDbContext>();
            var admin = new Account
            {
                HoTen = "Test Admin",
                Email = "admin@example.com",
                MatKhauMaHoa = "test-hash",
                VaiTro = "quan_tri",
                NgayTao = DateTime.UtcNow,
            };
            db.TaiKhoan.Add(admin);
            await db.SaveChangesAsync();
            adminToken = adminScope.ServiceProvider.GetRequiredService<JwtTokenService>().TaoToken(admin);
        }

        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", adminToken);
        var today = DateOnly.FromDateTime(DateTime.UtcNow).ToString("yyyy-MM-dd", CultureInfo.InvariantCulture);
        var revenueReport = await _client.GetAsync($"/api/bao-cao/doanh-thu?tuNgay={today}&denNgay={today}");
        Assert.Equal(HttpStatusCode.OK, revenueReport.StatusCode);
        var overviewReport = await _client.GetAsync("/api/bao-cao/tong-quan");
        Assert.Equal(HttpStatusCode.OK, overviewReport.StatusCode);

        await using (var expireScope = _factory.Services.CreateAsyncScope())
        {
            var db = expireScope.ServiceProvider.GetRequiredService<SportShopDbContext>();
            var expiredAt = DateTime.UtcNow.AddHours(-49);
            await db.DonHang.Where(order => order.Id == orderId)
                .ExecuteUpdateAsync(setters => setters.SetProperty(order => order.NgayTao, expiredAt));
            var paidExpiredOrder = new Order
            {
                TaiKhoanId = 1,
                DiaChiNhan = "Paid order address",
                SoDienThoaiNhan = "0901234567",
                TongTien = 250,
                TrangThai = "cho_xac_nhan",
                NgayTao = expiredAt,
                ThanhToan = new Payment
                {
                    PhuongThuc = "chuyen_khoan",
                    SoTien = 250,
                    TrangThai = "da_thanh_toan",
                    NgayTao = expiredAt,
                },
            };
            db.DonHang.Add(paidExpiredOrder);
            await db.SaveChangesAsync();
        }

        int canceledByWorker;
        int canceledAgain;
        SportShop.Mvc.Services.DailyRevenueSummary dailyRevenue;
        await using (var maintenanceScope = _factory.Services.CreateAsyncScope())
        {
            var maintenance = maintenanceScope.ServiceProvider.GetRequiredService<OrderMaintenanceService>();
            canceledByWorker = await maintenance.CancelExpiredOrdersAsync(DateTime.UtcNow);
            canceledAgain = await maintenance.CancelExpiredOrdersAsync(DateTime.UtcNow);
            dailyRevenue = await maintenance.AggregateDailyRevenueAsync(
                DateOnly.FromDateTime(DateTime.UtcNow.AddHours(-49)));
        }
        Assert.Equal(1, canceledByWorker);
        Assert.Equal(0, canceledAgain);
        Assert.Equal(1, dailyRevenue.PaidOrderCount);
        Assert.Equal(250m, dailyRevenue.TotalRevenue);

        var cancelOrder = await _client.PutAsJsonAsync($"/api/don-hang/{orderId}/trang-thai", new { trangThai = "da_huy" });
        Assert.Equal(HttpStatusCode.OK, cancelOrder.StatusCode);
        var retryCanceledPayment = await _client.PostAsJsonAsync("/api/thanh-toan", new
        {
            donHangId = orderId,
            phuongThuc = "tien_mat",
        });
        Assert.Equal(HttpStatusCode.Conflict, retryCanceledPayment.StatusCode);
        var confirmCanceledOrder = await _client.PutAsync($"/api/thanh-toan/{paymentId}/xac-nhan", null);
        Assert.Equal(HttpStatusCode.Conflict, confirmCanceledOrder.StatusCode);

        await using var verifyScope = _factory.Services.CreateAsyncScope();
        var verifyDb = verifyScope.ServiceProvider.GetRequiredService<SportShopDbContext>();
        var remainingStock = await verifyDb.SanPham.Where(x => x.Id == 1).Select(x => x.SoLuongTon).SingleAsync();
        Assert.Equal(3, remainingStock);
        var canceledPaymentStatus = await verifyDb.ThanhToan.Where(x => x.Id == paymentId)
            .Select(x => x.TrangThai).SingleAsync();
        Assert.Equal("that_bai", canceledPaymentStatus);
        var paidOrderStatus = await verifyDb.DonHang
            .Where(order => order.TongTien == 250)
            .Select(order => order.TrangThai).SingleAsync();
        Assert.Equal("cho_xac_nhan", paidOrderStatus);
        var cancellationNotification = await verifyDb.ThongBao
            .AnyAsync(notification => notification.TaiKhoanId == 1
                && notification.NoiDung.Contains("tự động hủy"));
        Assert.True(cancellationNotification);
    }
}

public sealed class SportShopFactory : WebApplicationFactory<Program>
{
    private readonly string _databasePath = Path.Combine(Path.GetTempPath(), $"sportshop-test-{Guid.NewGuid():N}.sqlite");
    private const string JwtSecret = "sportshop-integration-test-secret-minimum-32-bytes";

    public SportShopFactory()
    {
        Environment.SetEnvironmentVariable("JWT_SECRET", JwtSecret);
        Environment.SetEnvironmentVariable("DUONG_DAN_CSDL", _databasePath);
    }

    protected override void ConfigureWebHost(IWebHostBuilder builder) =>
        builder.UseEnvironment("Development");

    protected override void Dispose(bool disposing)
    {
        base.Dispose(disposing);
        Microsoft.Data.Sqlite.SqliteConnection.ClearAllPools();
        foreach (var suffix in new[] { "", "-shm", "-wal" })
        {
            var path = _databasePath + suffix;
            if (File.Exists(path))
                File.Delete(path);
        }
        Environment.SetEnvironmentVariable("JWT_SECRET", null);
        Environment.SetEnvironmentVariable("DUONG_DAN_CSDL", null);
    }
}
