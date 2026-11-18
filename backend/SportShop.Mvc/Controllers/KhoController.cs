using System.ComponentModel.DataAnnotations;
using System.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SportShop.Mvc.Data;
using SportShop.Mvc.Services;

namespace SportShop.Mvc.Controllers;

[Route("api/kho")]
[Authorize(Roles = "quan_tri")]
public sealed class KhoController(SportShopDbContext db, InventoryService inventory) : ApiControllerBase
{
    [HttpGet("canh-bao")]
    public async Task<IActionResult> LowStock()
    {
        var variants = await db.BienTheSanPham.AsNoTracking()
            .Where(variant => variant.TrangThai == "dang_ban"
                && variant.SanPham.TrangThai == "dang_ban"
                && variant.SoLuongTon <= variant.NguongCanhBao)
            .OrderBy(variant => variant.SoLuongTon)
            .Select(variant => new
            {
                sanPhamId = variant.SanPhamId,
                tenSanPham = variant.SanPham.Ten,
                thuongHieu = variant.SanPham.ThuongHieu,
                monTheThao = variant.SanPham.MonTheThao,
                bienTheId = variant.Id,
                variant.Sku,
                variant.KichThuoc,
                variant.MauSac,
                variant.SoLuongTon,
                variant.NguongCanhBao,
            })
            .ToListAsync();
        return Success(variants);
    }

    [HttpGet("bien-the/{id:int}/lich-su")]
    public async Task<IActionResult> History(int id)
    {
        if (!await db.BienTheSanPham.AnyAsync(variant => variant.Id == id))
            return Failure(StatusCodes.Status404NotFound, "Không tìm thấy biến thể");
        var movements = await db.LichSuTonKho.AsNoTracking()
            .Where(movement => movement.BienTheId == id)
            .OrderByDescending(movement => movement.NgayTao)
            .ThenByDescending(movement => movement.Id)
            .Select(movement => new
            {
                movement.Id,
                movement.Loai,
                movement.SoLuongThayDoi,
                movement.DonHangId,
                nguoiThucHien = movement.NguoiThucHien == null ? null : movement.NguoiThucHien.HoTen,
                movement.GhiChu,
                movement.NgayTao,
            })
            .ToListAsync();
        return Success(movements);
    }

    [HttpPost("bien-the/{id:int}/dieu-chinh")]
    public async Task<IActionResult> Adjust(int id, StockAdjustmentRequest request)
    {
        if (request.Loai is not ("nhap_kho" or "xuat_kho"))
            return Failure(StatusCodes.Status400BadRequest, "Loại điều chỉnh chỉ được là nhập kho hoặc xuất kho.");
        var variant = await db.BienTheSanPham.AsNoTracking()
            .Where(item => item.Id == id)
            .Select(item => new { item.SanPhamId, item.TrangThai })
            .SingleOrDefaultAsync();
        if (variant is null)
            return Failure(StatusCodes.Status404NotFound, "Không tìm thấy biến thể");
        if (variant.TrangThai != "dang_ban")
            return Failure(StatusCodes.Status409Conflict, "Không thể điều chỉnh tồn kho của biến thể đã ngừng kinh doanh.");

        await using var transaction = await db.Database.BeginTransactionAsync(IsolationLevel.Serializable);
        var quantityChange = request.Loai == "nhap_kho" ? request.SoLuong : -request.SoLuong;
        if (!await inventory.ApplyChangeAsync(
                id,
                quantityChange,
                request.Loai,
                request.GhiChu.Trim(),
                CurrentUserId,
                null))
            return Failure(StatusCodes.Status409Conflict, "Tồn kho không đủ cho lần điều chỉnh này.");
        await transaction.CommitAsync();

        var stock = await db.BienTheSanPham.AsNoTracking()
            .Where(item => item.Id == id)
            .Select(item => item.SoLuongTon)
            .SingleAsync();
        return Success(new { bienTheId = id, soLuongThayDoi = quantityChange, soLuongTon = stock },
            "Cập nhật tồn kho thành công");
    }

    public sealed record StockAdjustmentRequest(
        [param: Required, RegularExpression("^(nhap_kho|xuat_kho)$")] string Loai,
        [param: Range(1, int.MaxValue)] int SoLuong,
        [param: Required, StringLength(500, MinimumLength = 3)] string GhiChu);
}
