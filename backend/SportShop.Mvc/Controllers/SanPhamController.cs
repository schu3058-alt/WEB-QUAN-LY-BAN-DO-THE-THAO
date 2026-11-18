using System.ComponentModel.DataAnnotations;
using System.Data;
using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SportShop.Mvc.Data;
using SportShop.Mvc.Models;
using SportShop.Mvc.Services;

namespace SportShop.Mvc.Controllers;

[Route("api/san-pham")]
public sealed class SanPhamController(SportShopDbContext db, InventoryService inventory) : ApiControllerBase
{
    [HttpGet("tuy-chon-bo-loc")]
    [AllowAnonymous]
    public async Task<IActionResult> GetFilterOptions()
    {
        var brands = await db.SanPham.AsNoTracking()
            .Where(product => product.TrangThai == "dang_ban"
                && product.ThuongHieu != null
                && product.ThuongHieu != "")
            .Select(product => product.ThuongHieu!)
            .Distinct()
            .OrderBy(value => value)
            .ToArrayAsync();
        var sports = await db.SanPham.AsNoTracking()
            .Where(product => product.TrangThai == "dang_ban"
                && product.MonTheThao != null
                && product.MonTheThao != "")
            .Select(product => product.MonTheThao!)
            .Distinct()
            .OrderBy(value => value)
            .ToArrayAsync();
        var productIds = db.SanPham.AsNoTracking()
            .Where(product => product.TrangThai == "dang_ban")
            .Select(product => product.Id);
        var variants = db.BienTheSanPham.AsNoTracking()
            .Where(variant => variant.TrangThai == "dang_ban" && productIds.Contains(variant.SanPhamId));
        var sizes = await variants.Where(variant => variant.KichThuoc != null)
            .Select(variant => variant.KichThuoc!)
            .Distinct()
            .OrderBy(value => value)
            .ToArrayAsync();
        var colors = await variants.Where(variant => variant.MauSac != null)
            .Select(variant => variant.MauSac!)
            .Distinct()
            .OrderBy(value => value)
            .ToArrayAsync();

        return Success(new { thuongHieu = brands, monTheThao = sports, kichThuoc = sizes, mauSac = colors });
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> Search(
        [FromQuery] string? tuKhoa,
        [FromQuery] int? danhMucId,
        [FromQuery] string? thuongHieu,
        [FromQuery] string? monTheThao,
        [FromQuery] decimal? giaTu,
        [FromQuery] decimal? giaDen,
        [FromQuery] string? kichThuoc,
        [FromQuery] string? mauSac,
        [FromQuery] bool? chiConHang,
        [FromQuery] string? sapXep,
        [FromQuery] int trang = 1,
        [FromQuery] int soLuongMoiTrang = 20)
    {
        if (trang < 1 || soLuongMoiTrang is < 1 or > 100)
            return Failure(StatusCodes.Status400BadRequest, "Thông tin phân trang không hợp lệ");
        if (giaTu is < 0 || giaDen is < 0 || (giaTu.HasValue && giaDen.HasValue && giaTu > giaDen))
            return Failure(StatusCodes.Status400BadRequest, "Khoảng giá không hợp lệ");
        if (sapXep is not null && sapXep is not ("moi_nhat" or "gia_tang_dan" or "gia_giam_dan" or "ten_a_z"))
            return Failure(StatusCodes.Status400BadRequest, "Kiểu sắp xếp không hợp lệ");

        var query = db.SanPham.AsNoTracking().Include(x => x.DanhMuc).Include(x => x.BienThes).AsQueryable();
        if (!string.IsNullOrWhiteSpace(tuKhoa))
            query = query.Where(x => EF.Functions.Like(x.Ten, $"%{tuKhoa.Trim()}%"));
        if (danhMucId.HasValue)
            query = query.Where(x => x.DanhMucId == danhMucId.Value);
        if (!string.IsNullOrWhiteSpace(thuongHieu))
            query = query.Where(x => x.ThuongHieu == thuongHieu.Trim());
        if (!string.IsNullOrWhiteSpace(monTheThao))
            query = query.Where(x => x.MonTheThao == monTheThao.Trim());
        if (giaTu.HasValue)
            query = query.Where(x => x.Gia >= giaTu.Value);
        if (giaDen.HasValue)
            query = query.Where(x => x.Gia <= giaDen.Value);
        var sizeFilter = string.IsNullOrWhiteSpace(kichThuoc) ? null : kichThuoc.Trim();
        var colorFilter = string.IsNullOrWhiteSpace(mauSac) ? null : mauSac.Trim();
        if (sizeFilter is not null || colorFilter is not null || chiConHang == true)
        {
            query = query.Where(product => product.BienThes.Any(variant =>
                variant.TrangThai == "dang_ban"
                && (sizeFilter == null || variant.KichThuoc == sizeFilter)
                && (colorFilter == null || variant.MauSac == colorFilter)
                && (chiConHang != true || variant.SoLuongTon > 0)));
        }
        query = query.Where(x => x.TrangThai == "dang_ban");

        var total = await query.CountAsync();
        var sortedQuery = sapXep switch
        {
            "gia_tang_dan" => query.OrderBy(product => (double)product.Gia).ThenBy(product => product.Id),
            "gia_giam_dan" => query.OrderByDescending(product => (double)product.Gia).ThenBy(product => product.Id),
            "ten_a_z" => query.OrderBy(product => product.Ten).ThenBy(product => product.Id),
            _ => query.OrderByDescending(product => product.NgayTao).ThenByDescending(product => product.Id),
        };
        var products = await sortedQuery
            .Skip((trang - 1) * soLuongMoiTrang)
            .Take(soLuongMoiTrang)
            .ToListAsync();
        return Success(new
        {
            danhSach = products.Select(product => ProductView(product, false)),
            tongSo = total,
            trang,
            soLuongMoiTrang,
        });
    }

    [HttpGet("quan-tri")]
    [Authorize(Roles = "quan_tri")]
    public async Task<IActionResult> SearchAdmin(
        [FromQuery] string? tuKhoa,
        [FromQuery] int? danhMucId,
        [FromQuery] string? trangThai,
        [FromQuery] int trang = 1,
        [FromQuery] int soLuongMoiTrang = 20) =>
        await SearchAdminCore(tuKhoa, danhMucId, trangThai, trang, soLuongMoiTrang);

    private async Task<IActionResult> SearchAdminCore(
        string? tuKhoa, int? danhMucId, string? trangThai, int trang, int soLuongMoiTrang)
    {
        if (trang < 1 || soLuongMoiTrang is < 1 or > 100)
            return Failure(StatusCodes.Status400BadRequest, "Thông tin phân trang không hợp lệ");
        var query = db.SanPham.AsNoTracking().Include(x => x.DanhMuc).Include(x => x.BienThes).AsQueryable();
        if (!string.IsNullOrWhiteSpace(tuKhoa))
            query = query.Where(x => EF.Functions.Like(x.Ten, $"%{tuKhoa.Trim()}%"));
        if (danhMucId.HasValue)
            query = query.Where(x => x.DanhMucId == danhMucId.Value);
        if (!string.IsNullOrWhiteSpace(trangThai) && trangThai != "tat_ca")
            query = query.Where(x => x.TrangThai == trangThai);
        var total = await query.CountAsync();
        var products = await query.OrderByDescending(x => x.NgayTao)
            .Skip((trang - 1) * soLuongMoiTrang).Take(soLuongMoiTrang).ToListAsync();
        return Success(new
        {
            danhSach = products.Select(product => ProductView(product, true)),
            tongSo = total,
            trang,
            soLuongMoiTrang,
        });
    }

    [HttpGet("{id:int}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetById(int id)
    {
        var product = await db.SanPham.AsNoTracking().Include(x => x.DanhMuc).Include(x => x.BienThes)
            .SingleOrDefaultAsync(x => x.Id == id && x.TrangThai == "dang_ban");
        return product is null
            ? Failure(StatusCodes.Status404NotFound, "Không tìm thấy sản phẩm")
            : Success(ProductView(product, false));
    }

    [HttpPost]
    [Authorize(Roles = "quan_tri")]
    public async Task<IActionResult> Create(ProductRequest request)
    {
        if (!await db.DanhMuc.AnyAsync(x => x.Id == request.DanhMucId))
            return Failure(StatusCodes.Status400BadRequest, "Không tìm thấy danh mục sản phẩm");
        var inputs = request.BienThes is { Count: > 0 }
            ? request.BienThes
            : [new ProductVariantInput(null, null, null, request.SoLuongTon ?? 0, 5)];
        var skuError = await ValidateSkusAsync(inputs);
        if (skuError is not null)
            return Failure(StatusCodes.Status409Conflict, skuError);
        await using var transaction = await db.Database.BeginTransactionAsync(IsolationLevel.Serializable);

        var product = new Product
        {
            Ten = request.Ten.Trim(),
            MoTa = CleanHtml(request.MoTa),
            Gia = request.Gia,
            SoLuongTon = 0,
            DanhMucId = request.DanhMucId,
            ThuongHieu = CleanOptional(request.ThuongHieu),
            MonTheThao = CleanOptional(request.MonTheThao),
            HinhAnh = request.HinhAnh,
            TrangThai = "dang_ban",
            NgayTao = DateTime.UtcNow,
        };
        db.SanPham.Add(product);
        await db.SaveChangesAsync();

        var variants = new List<ProductVariant>();
        var reservedSkus = inputs.Where(input => !string.IsNullOrWhiteSpace(input.Sku))
            .Select(input => input.Sku!.Trim())
            .ToHashSet(StringComparer.OrdinalIgnoreCase);
        for (var index = 0; index < inputs.Count; index++)
        {
            var input = inputs[index];
            variants.Add(new ProductVariant
            {
                SanPhamId = product.Id,
                Sku = string.IsNullOrWhiteSpace(input.Sku)
                    ? await GenerateSkuAsync(product.Id, index, inputs.Count, reservedSkus)
                    : input.Sku.Trim(),
                KichThuoc = CleanOptional(input.KichThuoc),
                MauSac = CleanOptional(input.MauSac),
                SoLuongTon = input.SoLuongTon,
                NguongCanhBao = input.NguongCanhBao,
                TrangThai = "dang_ban",
            });
        }
        db.BienTheSanPham.AddRange(variants);
        await db.SaveChangesAsync();
        foreach (var variant in variants)
            await inventory.RecordInitialStockAsync(variant, CurrentUserId, "Tồn đầu kỳ khi tạo sản phẩm.");
        await inventory.SyncProductStockAsync(product.Id);
        await db.Entry(product).Reference(x => x.DanhMuc).LoadAsync();
        await db.Entry(product).Collection(x => x.BienThes).LoadAsync();
        await transaction.CommitAsync();
        return Success(ProductView(product, true), "Tạo sản phẩm thành công");
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "quan_tri")]
    public async Task<IActionResult> Update(int id, ProductRequest request)
    {
        var product = await db.SanPham.Include(x => x.DanhMuc).Include(x => x.BienThes)
            .SingleOrDefaultAsync(x => x.Id == id);
        if (product is null)
            return Failure(StatusCodes.Status404NotFound, "Không tìm thấy sản phẩm");
        if (!await db.DanhMuc.AnyAsync(x => x.Id == request.DanhMucId))
            return Failure(StatusCodes.Status400BadRequest, "Không tìm thấy danh mục sản phẩm");
        if (request.BienThes is { Count: > 0 })
            return Failure(StatusCodes.Status400BadRequest, "Hãy quản lý từng biến thể qua chức năng biến thể sản phẩm.");

        await using var transaction = await db.Database.BeginTransactionAsync(IsolationLevel.Serializable);
        if (request.SoLuongTon.HasValue)
        {
            var activeVariants = product.BienThes.Where(x => x.TrangThai == "dang_ban").ToArray();
            if (activeVariants.Length != 1)
                return Failure(StatusCodes.Status400BadRequest, "Hãy điều chỉnh tồn kho theo từng biến thể.");
            var change = request.SoLuongTon.Value - activeVariants[0].SoLuongTon;
            if (change != 0 && !await inventory.ApplyChangeAsync(
                    activeVariants[0].Id,
                    change,
                    change > 0 ? "nhap_kho" : "xuat_kho",
                    "Điều chỉnh tồn kho qua API cập nhật sản phẩm.",
                    CurrentUserId,
                    null))
            {
                await transaction.RollbackAsync();
                return Failure(StatusCodes.Status409Conflict, "Tồn kho không đủ cho lần điều chỉnh này.");
            }
            if (change != 0)
                await db.Entry(activeVariants[0]).ReloadAsync();
        }

        product.Ten = request.Ten.Trim();
        product.MoTa = CleanHtml(request.MoTa);
        product.Gia = request.Gia;
        product.DanhMucId = request.DanhMucId;
        product.ThuongHieu = CleanOptional(request.ThuongHieu);
        product.MonTheThao = CleanOptional(request.MonTheThao);
        product.HinhAnh = request.HinhAnh;
        await db.SaveChangesAsync();
        await transaction.CommitAsync();
        await db.Entry(product).Reference(x => x.DanhMuc).LoadAsync();
        await db.Entry(product).Collection(x => x.BienThes).LoadAsync();
        return Success(ProductView(product, true), "Cập nhật sản phẩm thành công");
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

    [HttpPost("{productId:int}/bien-the")]
    [Authorize(Roles = "quan_tri")]
    public async Task<IActionResult> CreateVariant(int productId, ProductVariantInput request)
    {
        if (!await db.SanPham.AnyAsync(product => product.Id == productId))
            return Failure(StatusCodes.Status404NotFound, "Không tìm thấy sản phẩm");
        if (!string.IsNullOrWhiteSpace(request.Sku)
            && await db.BienTheSanPham.AnyAsync(variant => variant.Sku == request.Sku.Trim()))
            return Failure(StatusCodes.Status409Conflict, "SKU đã được sử dụng");

        await using var transaction = await db.Database.BeginTransactionAsync(IsolationLevel.Serializable);
        var variant = new ProductVariant
        {
            SanPhamId = productId,
            Sku = string.IsNullOrWhiteSpace(request.Sku)
                ? await GenerateSkuAsync(productId, await db.BienTheSanPham.CountAsync(x => x.SanPhamId == productId), 2)
                : request.Sku.Trim(),
            KichThuoc = CleanOptional(request.KichThuoc),
            MauSac = CleanOptional(request.MauSac),
            SoLuongTon = request.SoLuongTon,
            NguongCanhBao = request.NguongCanhBao,
            TrangThai = "dang_ban",
        };
        db.BienTheSanPham.Add(variant);
        await db.SaveChangesAsync();
        await inventory.RecordInitialStockAsync(variant, CurrentUserId, "Tồn đầu kỳ khi tạo biến thể.");
        await inventory.SyncProductStockAsync(productId);
        await transaction.CommitAsync();
        return Success(VariantView(variant), "Tạo biến thể thành công");
    }

    [HttpPut("bien-the/{id:int}")]
    [Authorize(Roles = "quan_tri")]
    public async Task<IActionResult> UpdateVariant(int id, UpdateProductVariantRequest request)
    {
        var variant = await db.BienTheSanPham.SingleOrDefaultAsync(x => x.Id == id);
        if (variant is null)
            return Failure(StatusCodes.Status404NotFound, "Không tìm thấy biến thể");
        var sku = request.Sku.Trim();
        if (await db.BienTheSanPham.AnyAsync(x => x.Id != id && x.Sku == sku))
            return Failure(StatusCodes.Status409Conflict, "SKU đã được sử dụng");
        variant.Sku = sku;
        variant.KichThuoc = CleanOptional(request.KichThuoc);
        variant.MauSac = CleanOptional(request.MauSac);
        variant.NguongCanhBao = request.NguongCanhBao;
        await db.SaveChangesAsync();
        return Success(VariantView(variant), "Cập nhật biến thể thành công");
    }

    [HttpDelete("bien-the/{id:int}")]
    [Authorize(Roles = "quan_tri")]
    public async Task<IActionResult> DisableVariant(int id)
    {
        var variant = await db.BienTheSanPham.SingleOrDefaultAsync(x => x.Id == id);
        if (variant is null)
            return Failure(StatusCodes.Status404NotFound, "Không tìm thấy biến thể");
        if (variant.TrangThai == "ngung_kinh_doanh")
            return Success(VariantView(variant));
        if (variant.SoLuongTon > 0)
            return Failure(StatusCodes.Status409Conflict, "Hãy xuất hết tồn kho trước khi ngừng biến thể.");
        if (await db.GioHang.AnyAsync(x => x.BienTheId == id))
            return Failure(StatusCodes.Status409Conflict, "Biến thể đang có trong giỏ hàng của khách.");
        if (await db.ChiTietDonHang.AnyAsync(line =>
                line.BienTheId == id
                && (line.DonHang.TrangThai == "cho_xac_nhan" || line.DonHang.TrangThai == "dang_giao")))
            return Failure(StatusCodes.Status409Conflict, "Biến thể đang thuộc đơn hàng chưa hoàn tất.");
        await using var transaction = await db.Database.BeginTransactionAsync(IsolationLevel.Serializable);
        variant.TrangThai = "ngung_kinh_doanh";
        await db.SaveChangesAsync();
        await inventory.SyncProductStockAsync(variant.SanPhamId);
        await transaction.CommitAsync();
        return Success(VariantView(variant), "Đã ngừng kinh doanh biến thể");
    }

    private async Task<string?> ValidateSkusAsync(IReadOnlyCollection<ProductVariantInput> variants)
    {
        var skus = variants.Where(x => !string.IsNullOrWhiteSpace(x.Sku))
            .Select(x => x.Sku!.Trim()).ToArray();
        if (skus.Distinct(StringComparer.OrdinalIgnoreCase).Count() != skus.Length)
            return "SKU bị trùng trong danh sách biến thể.";
        return await db.BienTheSanPham.AnyAsync(x => skus.Contains(x.Sku))
            ? "SKU đã được sử dụng."
            : null;
    }

    private async Task<string> GenerateSkuAsync(
        int productId, int index, int totalVariants, ISet<string>? reservedSkus = null)
    {
        var suffix = totalVariants == 1 && index == 0 ? "STD" : (index + 1).ToString("D2");
        var candidate = $"SP{productId:D5}-{suffix}";
        while ((reservedSkus?.Contains(candidate) ?? false)
            || await db.BienTheSanPham.AnyAsync(variant => variant.Sku == candidate))
        {
            index++;
            candidate = $"SP{productId:D5}-{index + 1:D2}";
        }
        reservedSkus?.Add(candidate);
        return candidate;
    }

    private static object ProductView(Product product, bool includeInactiveVariants)
    {
        var variants = product.BienThes
            .Where(variant => includeInactiveVariants || variant.TrangThai == "dang_ban")
            .OrderBy(variant => variant.Id)
            .Select(VariantView)
            .ToArray();
        return new
        {
            product.Id,
            product.Ten,
            product.MoTa,
            product.Gia,
            soLuongTon = product.BienThes.Where(x => x.TrangThai == "dang_ban").Sum(x => x.SoLuongTon),
            product.DanhMucId,
            tenDanhMuc = product.DanhMuc?.Ten,
            product.ThuongHieu,
            product.MonTheThao,
            product.HinhAnh,
            product.TrangThai,
            product.NgayTao,
            bienThes = variants,
        };
    }

    private static object VariantView(ProductVariant variant) => new
    {
        variant.Id,
        variant.Sku,
        variant.KichThuoc,
        variant.MauSac,
        variant.SoLuongTon,
        variant.NguongCanhBao,
        variant.TrangThai,
    };

    private static string? CleanOptional(string? value) =>
        string.IsNullOrWhiteSpace(value) ? null : value.Trim();

    private static string? CleanHtml(string? html) =>
        html is null ? null : Regex.Replace(html, "<[^>]*>", "", RegexOptions.CultureInvariant);

    public sealed record ProductRequest(
        [param: Required, StringLength(200, MinimumLength = 2)] string Ten,
        string? MoTa,
        [param: Range(0, (double)decimal.MaxValue)] decimal Gia,
        [param: Range(0, int.MaxValue)] int? SoLuongTon,
        [param: Range(1, int.MaxValue)] int DanhMucId,
        [param: StringLength(500)] string? HinhAnh,
        [param: StringLength(100)] string? ThuongHieu,
        [param: StringLength(100)] string? MonTheThao,
        List<ProductVariantInput>? BienThes);

    public sealed record ProductVariantInput(
        [param: StringLength(64)] string? Sku,
        [param: StringLength(32)] string? KichThuoc,
        [param: StringLength(50)] string? MauSac,
        [param: Range(0, int.MaxValue)] int SoLuongTon = 0,
        [param: Range(0, int.MaxValue)] int NguongCanhBao = 5);

    public sealed record UpdateProductVariantRequest(
        [param: Required, StringLength(64, MinimumLength = 1)] string Sku,
        [param: StringLength(32)] string? KichThuoc,
        [param: StringLength(50)] string? MauSac,
        [param: Range(0, int.MaxValue)] int NguongCanhBao = 5);
}
