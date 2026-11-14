using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SportShop.Mvc.Models;

[Table("tai_khoan")]
public sealed class Account
{
    [Key, Column("id")]
    public int Id { get; set; }

    [Required, MaxLength(100), Column("hoTen")]
    public string HoTen { get; set; } = "";

    [Required, MaxLength(254), Column("email")]
    public string Email { get; set; } = "";

    [Required, Column("matKhauMaHoa")]
    public string MatKhauMaHoa { get; set; } = "";

    [MaxLength(11), Column("soDienThoai")]
    public string? SoDienThoai { get; set; }

    [Required, MaxLength(30), Column("vaiTro")]
    public string VaiTro { get; set; } = "khach_hang";

    [Column("ngayTao")]
    public DateTime NgayTao { get; set; }

    public List<Order> DonHang { get; set; } = [];
    public List<CartItem> GioHang { get; set; } = [];
    public List<Review> DanhGia { get; set; } = [];
    public List<Notification> ThongBao { get; set; } = [];
}

[Table("danh_muc")]
public sealed class Category
{
    [Key, Column("id")]
    public int Id { get; set; }

    [Required, MaxLength(100), Column("ten")]
    public string Ten { get; set; } = "";

    [Column("moTa")]
    public string? MoTa { get; set; }

    [Required, MaxLength(150), Column("slug")]
    public string Slug { get; set; } = "";

    public List<Product> SanPham { get; set; } = [];
}

[Table("san_pham")]
public sealed class Product
{
    [Key, Column("id")]
    public int Id { get; set; }

    [Required, MaxLength(200), Column("ten")]
    public string Ten { get; set; } = "";

    [Column("moTa")]
    public string? MoTa { get; set; }

    [Column("gia")]
    public decimal Gia { get; set; }

    [Column("soLuongTon")]
    public int SoLuongTon { get; set; }

    [Column("danhMucId")]
    public int? DanhMucId { get; set; }

    [Column("hinhAnh")]
    public string? HinhAnh { get; set; }

    [Required, MaxLength(30), Column("trangThai")]
    public string TrangThai { get; set; } = "dang_ban";

    [Column("ngayTao")]
    public DateTime NgayTao { get; set; }

    public Category? DanhMuc { get; set; }
    public List<OrderItem> ChiTietDonHang { get; set; } = [];
    public List<Review> DanhGia { get; set; } = [];
}

[Table("gio_hang_chi_tiet")]
public sealed class CartItem
{
    [Key, Column("id")]
    public int Id { get; set; }

    [Column("taiKhoanId")]
    public int TaiKhoanId { get; set; }

    [Column("sanPhamId")]
    public int SanPhamId { get; set; }

    [Column("soLuong")]
    public int SoLuong { get; set; }

    public Account TaiKhoan { get; set; } = null!;
    public Product SanPham { get; set; } = null!;
}

[Table("don_hang")]
public sealed class Order
{
    [Key, Column("id")]
    public int Id { get; set; }

    [Column("taiKhoanId")]
    public int TaiKhoanId { get; set; }

    [Required, Column("diaChiNhan")]
    public string DiaChiNhan { get; set; } = "";

    [Required, MaxLength(11), Column("soDienThoaiNhan")]
    public string SoDienThoaiNhan { get; set; } = "";

    [Column("ghiChu")]
    public string? GhiChu { get; set; }

    [Column("tongTien")]
    public decimal TongTien { get; set; }

    [Required, MaxLength(30), Column("trangThai")]
    public string TrangThai { get; set; } = "cho_xac_nhan";

    [Column("ngayTao")]
    public DateTime NgayTao { get; set; }

    public Account TaiKhoan { get; set; } = null!;
    public List<OrderItem> ChiTiet { get; set; } = [];
    public Payment? ThanhToan { get; set; }
}

[Table("don_hang_chi_tiet")]
public sealed class OrderItem
{
    [Key, Column("id")]
    public int Id { get; set; }

    [Column("donHangId")]
    public int DonHangId { get; set; }

    [Column("sanPhamId")]
    public int SanPhamId { get; set; }

    [Column("soLuong")]
    public int SoLuong { get; set; }

    [Column("donGia")]
    public decimal DonGia { get; set; }

    public Order DonHang { get; set; } = null!;
    public Product SanPham { get; set; } = null!;
}

[Table("thanh_toan")]
public sealed class Payment
{
    [Key, Column("id")]
    public int Id { get; set; }

    [Column("donHangId")]
    public int DonHangId { get; set; }

    [Required, MaxLength(30), Column("phuongThuc")]
    public string PhuongThuc { get; set; } = "";

    [Column("soTien")]
    public decimal SoTien { get; set; }

    [Required, MaxLength(30), Column("trangThai")]
    public string TrangThai { get; set; } = "cho_thanh_toan";

    [Column("ngayTao")]
    public DateTime NgayTao { get; set; }

    public Order DonHang { get; set; } = null!;
}

[Table("danh_gia")]
public sealed class Review
{
    [Key, Column("id")]
    public int Id { get; set; }

    [Column("sanPhamId")]
    public int SanPhamId { get; set; }

    [Column("taiKhoanId")]
    public int TaiKhoanId { get; set; }

    [Column("soSao")]
    public int SoSao { get; set; }

    [Column("noiDung")]
    public string? NoiDung { get; set; }

    [Column("ngayTao")]
    public DateTime NgayTao { get; set; }

    public Account TaiKhoan { get; set; } = null!;
    public Product SanPham { get; set; } = null!;
}

[Table("khuyen_mai")]
public sealed class Promotion
{
    [Key, Column("id")]
    public int Id { get; set; }

    [Required, MaxLength(80), Column("ma")]
    public string Ma { get; set; } = "";

    [Column("phanTramGiam")]
    public decimal PhanTramGiam { get; set; }

    [Required, Column("ngayBatDau")]
    public string NgayBatDau { get; set; } = "";

    [Required, Column("ngayKetThuc")]
    public string NgayKetThuc { get; set; } = "";
}

[Table("thong_bao")]
public sealed class Notification
{
    [Key, Column("id")]
    public int Id { get; set; }

    [Column("taiKhoanId")]
    public int TaiKhoanId { get; set; }

    [Required, Column("noiDung")]
    public string NoiDung { get; set; } = "";

    [Column("daDoc")]
    public int DaDoc { get; set; }

    [Column("ngayTao")]
    public DateTime NgayTao { get; set; }

    public Account TaiKhoan { get; set; } = null!;
}
