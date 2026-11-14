using System.Globalization;
using Microsoft.EntityFrameworkCore;
using SportShop.Mvc.Models;

namespace SportShop.Mvc.Data;

public static class DemoDataSeeder
{
    public static async Task SeedAsync(SportShopDbContext db, bool isProduction)
    {
        if (isProduction)
            throw new InvalidOperationException("Không nạp tài khoản và dữ liệu demo trong môi trường production.");

        await using var transaction = await db.Database.BeginTransactionAsync();
        if (await db.TaiKhoan.AnyAsync()
            || await db.DanhMuc.AnyAsync()
            || await db.SanPham.AnyAsync()
            || await db.KhuyenMai.AnyAsync())
        {
            throw new InvalidOperationException(
                "Không nạp dữ liệu demo vào CSDL đã có tài khoản, danh mục, sản phẩm hoặc khuyến mãi.");
        }

        var categories = new[]
        {
            new Category { Ten = "Giày thể thao", MoTa = "Giày chạy bộ, giày bóng đá, giày bóng rổ", Slug = "giay-the-thao" },
            new Category { Ten = "Quần áo thể thao", MoTa = "Áo quần tập luyện, thi đấu", Slug = "quan-ao-the-thao" },
            new Category { Ten = "Dụng cụ tập luyện", MoTa = "Tạ, dây nhảy, thảm tập yoga", Slug = "dung-cu-tap-luyen" },
            new Category { Ten = "Bóng thể thao", MoTa = "Bóng đá, bóng rổ, bóng chuyền", Slug = "bong-the-thao" },
        };
        var now = DateTime.UtcNow;
        var accounts = new[]
        {
            new Account
            {
                HoTen = "Quản trị viên",
                Email = "admin@sportshop.vn",
                MatKhauMaHoa = BCrypt.Net.BCrypt.HashPassword("SportShopAdmin123!", workFactor: 10),
                SoDienThoai = "0900000000",
                VaiTro = "quan_tri",
                NgayTao = now,
            },
            new Account
            {
                HoTen = "Nguyễn Văn A",
                Email = "khachhang1@sportshop.vn",
                MatKhauMaHoa = BCrypt.Net.BCrypt.HashPassword("SportShopUser123!", workFactor: 10),
                SoDienThoai = "0901111111",
                VaiTro = "khach_hang",
                NgayTao = now,
            },
        };

        db.DanhMuc.AddRange(categories);
        db.TaiKhoan.AddRange(accounts);
        await db.SaveChangesAsync();

        db.SanPham.AddRange(
            new Product
            {
                Ten = "Giày chạy bộ Pro X",
                MoTa = "Giày chạy bộ nhẹ, đệm khí tốt",
                Gia = 1_290_000,
                SoLuongTon = 50,
                DanhMucId = categories[0].Id,
                TrangThai = "dang_ban",
                NgayTao = now,
            },
            new Product
            {
                Ten = "Áo thun thể thao thoáng khí",
                MoTa = "Chất liệu polyester thoát mồ hôi",
                Gia = 250_000,
                SoLuongTon = 100,
                DanhMucId = categories[1].Id,
                TrangThai = "dang_ban",
                NgayTao = now,
            },
            new Product
            {
                Ten = "Tạ tay 2kg (cặp đôi)",
                MoTa = "Tạ tay bọc cao su, chống trượt",
                Gia = 180_000,
                SoLuongTon = 60,
                DanhMucId = categories[2].Id,
                TrangThai = "dang_ban",
                NgayTao = now,
            },
            new Product
            {
                Ten = "Bóng đá size 5",
                MoTa = "Bóng đá thi đấu tiêu chuẩn FIFA",
                Gia = 350_000,
                SoLuongTon = 80,
                DanhMucId = categories[3].Id,
                TrangThai = "dang_ban",
                NgayTao = now,
            });
        var startDate = DateOnly.FromDateTime(now).ToString("yyyy-MM-dd", CultureInfo.InvariantCulture);
        var endDate = DateOnly.FromDateTime(now.AddDays(30)).ToString("yyyy-MM-dd", CultureInfo.InvariantCulture);
        db.KhuyenMai.Add(new Promotion
        {
            Ma = "CHAOMUNG10",
            PhanTramGiam = 10,
            NgayBatDau = startDate,
            NgayKetThuc = endDate,
        });

        await db.SaveChangesAsync();
        await transaction.CommitAsync();
    }
}
