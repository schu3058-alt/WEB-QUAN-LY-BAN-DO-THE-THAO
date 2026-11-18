using System.ComponentModel.DataAnnotations;
using System.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SportShop.Mvc.Data;
using SportShop.Mvc.Models;

namespace SportShop.Mvc.Controllers;

[Route("api/gio-hang")]
[Authorize]
public sealed class GioHangController(SportShopDbContext db) : ApiControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var rows = await CartRows(CurrentUserId);
        return Success(new { danhSach = rows, tongTien = rows.Sum(x => x.gia * x.soLuong) });
    }

    [HttpPost]
    public async Task<IActionResult> Add(AddCartItemRequest request)
    {
        await using var transaction = await db.Database.BeginTransactionAsync(IsolationLevel.Serializable);
        var product = await db.SanPham.SingleOrDefaultAsync(x => x.Id == request.SanPhamId);
        if (product is null || product.TrangThai != "dang_ban")
            return Failure(StatusCodes.Status404NotFound, "Sản phẩm không tồn tại hoặc đã ngừng kinh doanh");

        var variants = db.BienTheSanPham.Where(variant =>
            variant.SanPhamId == product.Id && variant.TrangThai == "dang_ban");
        int variantId;
        if (request.BienTheId.HasValue)
        {
            variantId = request.BienTheId.Value;
        }
        else
        {
            var availableVariants = await variants.Select(variant => variant.Id).Take(2).ToListAsync();
            if (availableVariants.Count != 1)
                return Failure(StatusCodes.Status400BadRequest, "Vui lòng chọn biến thể sản phẩm.");
            variantId = availableVariants[0];
        }

        var variant = await variants.SingleOrDefaultAsync(item => item.Id == variantId);
        if (variant is null)
            return Failure(StatusCodes.Status404NotFound, "Biến thể không tồn tại hoặc đã ngừng kinh doanh");
        var item = await db.GioHang.SingleOrDefaultAsync(x =>
            x.TaiKhoanId == CurrentUserId && x.BienTheId == variantId);
        if (variant.SoLuongTon < (item?.SoLuong ?? 0) + request.SoLuong)
            return Failure(StatusCodes.Status409Conflict, "Số lượng đặt vượt quá tồn kho hiện có");
        if (item is null)
        {
            db.GioHang.Add(new CartItem
            {
                TaiKhoanId = CurrentUserId,
                SanPhamId = product.Id,
                BienTheId = variantId,
                SoLuong = request.SoLuong,
            });
        }
        else
        {
            item.SoLuong += request.SoLuong;
        }
        await db.SaveChangesAsync();
        await transaction.CommitAsync();
        return await Get();
    }

    [HttpPut("{chiTietId:int}")]
    public async Task<IActionResult> Update(int chiTietId, UpdateCartItemRequest request)
    {
        await using var transaction = await db.Database.BeginTransactionAsync(IsolationLevel.Serializable);
        var item = await db.GioHang.Include(x => x.SanPham).Include(x => x.BienThe)
            .SingleOrDefaultAsync(x => x.Id == chiTietId && x.TaiKhoanId == CurrentUserId);
        if (item is null)
            return Failure(StatusCodes.Status404NotFound, "Không tìm thấy sản phẩm trong giỏ hàng");
        if (item.SanPham.TrangThai != "dang_ban" || item.BienThe is null
            || item.BienThe.TrangThai != "dang_ban")
            return Failure(StatusCodes.Status409Conflict, "Sản phẩm hoặc biến thể đã ngừng kinh doanh");
        if (request.SoLuong > item.BienThe.SoLuongTon)
            return Failure(StatusCodes.Status409Conflict, "Số lượng sản phẩm vượt quá tồn kho hiện có");

        item.SoLuong = request.SoLuong;
        await db.SaveChangesAsync();
        await transaction.CommitAsync();
        return await Get();
    }

    [HttpDelete("{chiTietId:int}")]
    public async Task<IActionResult> Delete(int chiTietId)
    {
        var item = await db.GioHang.SingleOrDefaultAsync(x => x.Id == chiTietId && x.TaiKhoanId == CurrentUserId);
        if (item is null)
            return Failure(StatusCodes.Status404NotFound, "Không tìm thấy sản phẩm trong giỏ hàng");
        db.GioHang.Remove(item);
        await db.SaveChangesAsync();
        return await Get();
    }

    private async Task<List<CartRow>> CartRows(int accountId)
    {
        var items = await db.GioHang.AsNoTracking().Where(x => x.TaiKhoanId == accountId)
            .Select(x => new
            {
                chiTietId = x.Id,
                soLuong = x.SoLuong,
                sanPhamId = x.SanPhamId,
                ten = x.SanPham.Ten,
                gia = x.SanPham.Gia,
                hinhAnh = x.SanPham.HinhAnh,
                sku = x.BienThe == null ? null : x.BienThe.Sku,
                kichThuoc = x.BienThe == null ? null : x.BienThe.KichThuoc,
                mauSac = x.BienThe == null ? null : x.BienThe.MauSac,
                bienTheId = x.BienTheId,
            }).ToListAsync();
        return items.Select(x => new CartRow(
            x.chiTietId, x.soLuong, x.sanPhamId, x.ten, x.gia, x.hinhAnh,
            x.sku, x.kichThuoc, x.mauSac, x.bienTheId)).ToList();
    }

    private sealed record CartRow(
        int chiTietId, int soLuong, int sanPhamId, string ten, decimal gia, string? hinhAnh,
        string? sku, string? kichThuoc, string? mauSac, int? bienTheId);

    public sealed record AddCartItemRequest(
        [param: Range(1, int.MaxValue)] int SanPhamId,
        [param: Range(1, 1000)] int SoLuong,
        [param: Range(1, int.MaxValue)] int? BienTheId);

    public sealed record UpdateCartItemRequest([param: Range(1, 1000)] int SoLuong);
}
