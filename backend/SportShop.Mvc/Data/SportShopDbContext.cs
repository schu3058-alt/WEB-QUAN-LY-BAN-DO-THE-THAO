using Microsoft.EntityFrameworkCore;
using SportShop.Mvc.Models;

namespace SportShop.Mvc.Data;

public sealed class SportShopDbContext(DbContextOptions<SportShopDbContext> options) : DbContext(options)
{
    public DbSet<Account> TaiKhoan => Set<Account>();
    public DbSet<Category> DanhMuc => Set<Category>();
    public DbSet<Product> SanPham => Set<Product>();
    public DbSet<CartItem> GioHang => Set<CartItem>();
    public DbSet<Order> DonHang => Set<Order>();
    public DbSet<OrderItem> ChiTietDonHang => Set<OrderItem>();
    public DbSet<Payment> ThanhToan => Set<Payment>();
    public DbSet<Review> DanhGia => Set<Review>();
    public DbSet<Promotion> KhuyenMai => Set<Promotion>();
    public DbSet<Notification> ThongBao => Set<Notification>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Account>().ToTable(table =>
        {
            table.HasCheckConstraint("ck_tai_khoan_vaiTro", "vaiTro IN ('khach_hang', 'quan_tri')");
        });
        modelBuilder.Entity<Account>()
            .HasIndex(x => x.Email)
            .IsUnique()
            .HasDatabaseName("ux_tai_khoan_email");
        modelBuilder.Entity<Account>()
            .Property(x => x.Email)
            .UseCollation("NOCASE");
        modelBuilder.Entity<Account>().Property(x => x.NgayTao).HasDefaultValueSql("datetime('now')");
        modelBuilder.Entity<Category>().ToTable(table =>
            table.HasCheckConstraint("ck_danh_muc_ten", "length(trim(ten)) > 0"));
        modelBuilder.Entity<Category>()
            .HasIndex(x => x.Slug)
            .IsUnique();
        modelBuilder.Entity<Product>().ToTable(table =>
        {
            table.HasCheckConstraint("ck_san_pham_gia", "gia >= 0");
            table.HasCheckConstraint("ck_san_pham_soLuongTon", "soLuongTon >= 0");
            table.HasCheckConstraint("ck_san_pham_trangThai", "trangThai IN ('dang_ban', 'ngung_kinh_doanh')");
        });
        modelBuilder.Entity<Product>().Property(x => x.NgayTao).HasDefaultValueSql("datetime('now')");
        modelBuilder.Entity<CartItem>()
            .HasIndex(x => new { x.TaiKhoanId, x.SanPhamId })
            .IsUnique();
        modelBuilder.Entity<CartItem>().ToTable(table =>
            table.HasCheckConstraint("ck_gio_hang_soLuong", "soLuong > 0"));
        modelBuilder.Entity<CartItem>()
            .HasOne(x => x.TaiKhoan)
            .WithMany(x => x.GioHang)
            .HasForeignKey(x => x.TaiKhoanId)
            .OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<CartItem>()
            .HasOne(x => x.SanPham)
            .WithMany()
            .HasForeignKey(x => x.SanPhamId)
            .OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<Product>()
            .HasOne(x => x.DanhMuc)
            .WithMany(x => x.SanPham)
            .HasForeignKey(x => x.DanhMucId)
            .OnDelete(DeleteBehavior.SetNull);
        modelBuilder.Entity<Order>()
            .ToTable(table =>
            {
                table.HasCheckConstraint("ck_don_hang_tongTien", "tongTien >= 0");
                table.HasCheckConstraint("ck_don_hang_trangThai", "trangThai IN ('cho_xac_nhan', 'dang_giao', 'da_giao', 'da_huy')");
            });
        modelBuilder.Entity<Order>().Property(x => x.NgayTao).HasDefaultValueSql("datetime('now')");
        modelBuilder.Entity<Order>()
            .HasOne(x => x.TaiKhoan)
            .WithMany(x => x.DonHang)
            .HasForeignKey(x => x.TaiKhoanId)
            .OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<OrderItem>()
            .ToTable(table =>
            {
                table.HasCheckConstraint("ck_don_hang_chi_tiet_soLuong", "soLuong > 0");
                table.HasCheckConstraint("ck_don_hang_chi_tiet_donGia", "donGia >= 0");
            });
        modelBuilder.Entity<OrderItem>()
            .HasOne(x => x.DonHang)
            .WithMany(x => x.ChiTiet)
            .HasForeignKey(x => x.DonHangId)
            .OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<OrderItem>()
            .HasOne(x => x.SanPham)
            .WithMany(x => x.ChiTietDonHang)
            .HasForeignKey(x => x.SanPhamId)
            .OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<Payment>()
            .ToTable(table =>
            {
                table.HasCheckConstraint("ck_thanh_toan_soTien", "soTien >= 0");
                table.HasCheckConstraint("ck_thanh_toan_trangThai", "trangThai IN ('cho_thanh_toan', 'da_thanh_toan', 'that_bai')");
            });
        modelBuilder.Entity<Payment>().Property(x => x.NgayTao).HasDefaultValueSql("datetime('now')");
        modelBuilder.Entity<Payment>()
            .HasIndex(x => x.DonHangId)
            .IsUnique();
        modelBuilder.Entity<Payment>()
            .HasOne(x => x.DonHang)
            .WithOne(x => x.ThanhToan)
            .HasForeignKey<Payment>(x => x.DonHangId)
            .OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<Promotion>()
            .ToTable(table =>
                table.HasCheckConstraint("ck_khuyen_mai_phanTramGiam", "phanTramGiam BETWEEN 1 AND 100"));
        modelBuilder.Entity<Review>().ToTable(table =>
            table.HasCheckConstraint("ck_danh_gia_soSao", "soSao BETWEEN 1 AND 5"));
        modelBuilder.Entity<Review>().Property(x => x.NgayTao).HasDefaultValueSql("datetime('now')");
        modelBuilder.Entity<Review>()
            .HasOne(x => x.TaiKhoan)
            .WithMany(x => x.DanhGia)
            .HasForeignKey(x => x.TaiKhoanId)
            .OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<Review>()
            .HasOne(x => x.SanPham)
            .WithMany(x => x.DanhGia)
            .HasForeignKey(x => x.SanPhamId)
            .OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<Notification>().Property(x => x.NgayTao).HasDefaultValueSql("datetime('now')");
        modelBuilder.Entity<Notification>().ToTable(table =>
            table.HasCheckConstraint("ck_thong_bao_daDoc", "daDoc IN (0, 1)"));
        modelBuilder.Entity<Notification>()
            .HasOne(x => x.TaiKhoan)
            .WithMany(x => x.ThongBao)
            .HasForeignKey(x => x.TaiKhoanId)
            .OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<Promotion>()
            .HasIndex(x => x.Ma)
            .IsUnique();
        modelBuilder.Entity<Product>().Property(x => x.Gia).HasColumnType("REAL");
        modelBuilder.Entity<Order>().Property(x => x.TongTien).HasColumnType("REAL");
        modelBuilder.Entity<OrderItem>().Property(x => x.DonGia).HasColumnType("REAL");
        modelBuilder.Entity<Payment>().Property(x => x.SoTien).HasColumnType("REAL");
        modelBuilder.Entity<Promotion>().Property(x => x.PhanTramGiam).HasColumnType("REAL");
    }
}
