using Microsoft.AspNetCore.Mvc;

namespace SportShop.Mvc.Controllers;

public sealed class FrontendController(IWebHostEnvironment environment) : Controller
{
    private static readonly IReadOnlyDictionary<string, string> Pages = new Dictionary<string, string>
    {
        ["/"] = "trang/trangChu/index.html",
        ["/san-pham"] = "trang/danhSachSanPham/index.html",
        ["/gio-hang"] = "trang/gioHang/index.html",
        ["/thanh-toan"] = "trang/thanhToan/index.html",
        ["/dang-nhap"] = "trang/dangNhap/index.html",
        ["/tai-khoan"] = "trang/taiKhoan/index.html",
        ["/don-hang"] = "trang/theoDoiDonHang/index.html",
        ["/danh-gia"] = "trang/danhGiaSanPham/index.html",
        ["/quan-tri"] = "trang/quanTri/index.html",
        ["/quan-tri/san-pham"] = "trang/quanLySanPham/index.html",
        ["/quan-tri/don-hang"] = "trang/quanLyDonHang/index.html",
        ["/quan-tri/bao-cao"] = "trang/baoCaoDoanhThu/index.html",
    };

    [HttpGet("/")]
    [HttpGet("/san-pham")]
    [HttpGet("/gio-hang")]
    [HttpGet("/thanh-toan")]
    [HttpGet("/dang-nhap")]
    [HttpGet("/tai-khoan")]
    [HttpGet("/don-hang")]
    [HttpGet("/danh-gia")]
    [HttpGet("/quan-tri")]
    [HttpGet("/quan-tri/san-pham")]
    [HttpGet("/quan-tri/don-hang")]
    [HttpGet("/quan-tri/bao-cao")]
    public IActionResult Index()
    {
        var path = HttpContext.Request.Path.Value ?? "/";
        return Pages.TryGetValue(path, out var page)
            ? PhysicalFile(Path.Combine(environment.WebRootPath!, page), "text/html")
            : NotFound();
    }

    [HttpGet("/san-pham/{id:int}")]
    public IActionResult ProductDetails() =>
        PhysicalFile(Path.Combine(environment.WebRootPath!, "trang/chiTietSanPham/index.html"), "text/html");

    [HttpGet("/api/health")]
    public IActionResult Health() =>
        Ok(Models.ApiResponse<object>.Ok(new { status = "ok" }, "API SportShop đang hoạt động"));
}
