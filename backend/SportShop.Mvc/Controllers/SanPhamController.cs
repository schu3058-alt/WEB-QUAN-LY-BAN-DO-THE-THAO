using System.ComponentModel.DataAnnotations;
using System.Text.Encodings.Web;
using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SportShop.Mvc.Data;
using SportShop.Mvc.Models;

namespace SportShop.Mvc.Controllers;

[Route("api/san-pham")]
public sealed class SanPhamController(SportShopDbContext db) : ApiControllerBase
{
    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> Search(
        [FromQuery] string? tuKhoa,
        [FromQuery] int? danhMucId,
        [FromQuery] int trang = 1,
        [FromQuery] int soLuongMoiTrang = 20)
    {
        if (trang < 1 || soLuongMoiTrang is < 1 or > 100)
            return Failure(StatusCodes.Status400BadRequest, "Thông tin phân trang không hợp lệ");
        var query = db.SanPham.AsNoTracking().Include(x => x.DanhMuc).AsQueryable();
        if (!string.IsNullOrWhiteSpace(tuKhoa))
            query = query.Where(x => EF.Functions.Like(x.Ten, $"%{tuKhoa.Trim()}%"));
        if (danhMucId.HasValue)
            query = query.Where(x => x.DanhMucId == danhMucId.Value);
        query = query.Where(x => x.TrangThai == "dang_ban");

        var total = await query.CountAsync();
        var products = await query
            .OrderByDescending(x => x.NgayTao)
            .Skip((trang - 1) * soLuongMoiTrang)
            .Take(soLuongMoiTrang)
            .ToListAsync();
        return Success(new
        {
            danhSach = products.Select(ProductView),
            tongSo = total,
            trang,
            soLuongMoiTrang,
        });
    }

    [HttpGet("quan-tri")]
    [Authorize(Roles = "quan_tri")]
    public Task<IActionResult> SearchAdmin(
        [FromQuery] string? tuKhoa,
        [FromQuery] int? danhMucId,
        [FromQuery] string? trangThai,
        [FromQuery] int trang = 1,
        [FromQuery] int soLuongMoiTrang = 20) =>
        SearchAdminCore(tuKhoa, danhMucId, trangThai, trang, soLuongMoiTrang);

    private async Task<IActionResult> SearchAdminCore(
        string? tuKhoa, int? danhMucId, string? trangThai, int trang, int soLuongMoiTrang)
    {
        if (trang < 1 || soLuongMoiTrang is < 1 or > 100)
            return Failure(StatusCodes.Status400BadRequest, "Thông tin phân trang không hợp lệ");
        var query = db.SanPham.AsNoTracking().Include(x => x.DanhMuc).AsQueryable();
        if (!string.IsNullOrWhiteSpace(tuKhoa))
            query = query.Where(x => EF.Functions.Like(x.Ten, $"%{tuKhoa.Trim()}%"));
        if (danhMucId.HasValue)
            query = query.Where(x => x.DanhMucId == danhMucId.Value);
        if (!string.IsNullOrWhiteSpace(trangThai) && trangThai != "tat_ca")
            query = query.Where(x => x.TrangThai == trangThai);
        var total = await query.CountAsync();
        var products = await query.OrderByDescending(x => x.NgayTao)
            .Skip((trang - 1) * soLuongMoiTrang).Take(soLuongMoiTrang).ToListAsync();
        return Success(new { danhSach = products.Select(ProductView), tongSo = total, trang, soLuongMoiTrang });
    }

    [HttpGet("{id:int}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetById(int id)
    {
        var product = await db.SanPham.AsNoTracking().Include(x => x.DanhMuc)
            .SingleOrDefaultAsync(x => x.Id == id && x.TrangThai == "dang_ban");
        return product is null
            ? Failure(StatusCodes.Status404NotFound, "Không tìm thấy sản phẩm")
            : Success(ProductView(product));
    }

    [HttpPost]
    [Authorize(Roles = "quan_tri")]
    public async Task<IActionResult> Create(ProductRequest request)
    {
        if (!await db.DanhMuc.AnyAsync(x => x.Id == request.DanhMucId))
            return Failure(StatusCodes.Status400BadRequest, "Không tìm thấy danh mục sản phẩm");
        var product = new Product
        {
            Ten = request.Ten.Trim(),
            MoTa = CleanHtml(request.MoTa),
            Gia = request.Gia,
            SoLuongTon = request.SoLuongTon,
            DanhMucId = request.DanhMucId,
            HinhAnh = request.HinhAnh,
            TrangThai = "dang_ban",
            NgayTao = DateTime.UtcNow,
        };
        db.SanPham.Add(product);
        await db.SaveChangesAsync();
        await db.Entry(product).Reference(x => x.DanhMuc).LoadAsync();
        return Success(ProductView(product), "Tạo sản phẩm thành công");
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "quan_tri")]
    public async Task<IActionResult> Update(int id, ProductRequest request)
    {
        var product = await db.SanPham.Include(x => x.DanhMuc).SingleOrDefaultAsync(x => x.Id == id);
        if (product is null)
            return Failure(StatusCodes.Status404NotFound, "Không tìm thấy sản phẩm");
        if (!await db.DanhMuc.AnyAsync(x => x.Id == request.DanhMucId))
            return Failure(StatusCodes.Status400BadRequest, "Không tìm thấy danh mục sản phẩm");
        product.Ten = request.Ten.Trim();
        product.MoTa = CleanHtml(request.MoTa);
        product.Gia = request.Gia;
        product.SoLuongTon = request.SoLuongTon;
        product.DanhMucId = request.DanhMucId;
        product.HinhAnh = request.HinhAnh;
        await db.SaveChangesAsync();
        await db.Entry(product).Reference(x => x.DanhMuc).LoadAsync();
        return Success(ProductView(product), "Cập nhật sản phẩm thành công");
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "quan_tri")]
    public async Task<IActionResult> Disable(int id)
    {
        var product = await db.SanPham.SingleOrDefaultAsync(x => x.Id == id);
        if (product is null)
            return Failure(StatusCodes.Status404NotFound, "Không tìm thấy sản phẩm");
        product.TrangThai = "ngung_kinh_doanh";
        await db.SaveChangesAsync();
        return Success(new { id = product.Id, trangThai = product.TrangThai }, "Đã ngừng kinh doanh sản phẩm");
    }

    private static object ProductView(Product product) => new
    {
        product.Id,
        product.Ten,
        product.MoTa,
        product.Gia,
        product.SoLuongTon,
        product.DanhMucId,
        tenDanhMuc = product.DanhMuc?.Ten,
        product.HinhAnh,
        product.TrangThai,
        product.NgayTao,
    };

    private static string? CleanHtml(string? html) =>
        html is null ? null : Regex.Replace(html, "<[^>]*>", "", RegexOptions.CultureInvariant);

    public sealed record ProductRequest(
        [param: Required, StringLength(200, MinimumLength = 2)] string Ten,
        string? MoTa,
        [param: Range(0, (double)decimal.MaxValue)] decimal Gia,
        [param: Range(0, int.MaxValue)] int SoLuongTon,
        [param: Range(1, int.MaxValue)] int DanhMucId,
        [param: StringLength(500)] string? HinhAnh);
}
