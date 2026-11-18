using System.Data;
using Microsoft.EntityFrameworkCore;
using SportShop.Mvc.Data;
using SportShop.Mvc.Models;

namespace SportShop.Mvc.Services;

public sealed class InventoryService(SportShopDbContext db)
{
    public async Task<bool> ApplyChangeAsync(
        int variantId,
        int quantityChange,
        string type,
        string? note,
        int? actorId,
        int? orderId,
        CancellationToken cancellationToken = default)
    {
        if (quantityChange == 0)
            throw new ArgumentOutOfRangeException(nameof(quantityChange), "Số lượng thay đổi phải khác 0.");
        if (quantityChange == int.MinValue)
            throw new ArgumentOutOfRangeException(nameof(quantityChange), "Số lượng thay đổi vượt quá giới hạn.");

        await using var transaction = db.Database.CurrentTransaction is null
            ? await db.Database.BeginTransactionAsync(IsolationLevel.Serializable, cancellationToken)
            : null;

        var productId = await db.BienTheSanPham.AsNoTracking()
            .Where(variant => variant.Id == variantId)
            .Select(variant => (int?)variant.SanPhamId)
            .SingleOrDefaultAsync(cancellationToken);
        if (productId is null)
            return false;

        var updated = await db.BienTheSanPham
            .Where(variant => variant.Id == variantId
                && (quantityChange > 0 || variant.SoLuongTon >= -quantityChange))
            .ExecuteUpdateAsync(
                setters => setters.SetProperty(variant => variant.SoLuongTon, variant => variant.SoLuongTon + quantityChange),
                cancellationToken);
        if (updated != 1)
            return false;

        db.LichSuTonKho.Add(new InventoryMovement
        {
            BienTheId = variantId,
            Loai = type,
            SoLuongThayDoi = quantityChange,
            DonHangId = orderId,
            NguoiThucHienId = actorId,
            GhiChu = note,
            NgayTao = DateTime.UtcNow,
        });
        await db.SaveChangesAsync(cancellationToken);

        await SyncProductStockAsync(productId.Value, cancellationToken);
        if (transaction is not null)
            await transaction.CommitAsync(cancellationToken);
        return true;
    }

    public async Task SyncProductStockAsync(int productId, CancellationToken cancellationToken = default)
    {
        var totalStock = await db.BienTheSanPham
            .Where(variant => variant.SanPhamId == productId && variant.TrangThai == "dang_ban")
            .SumAsync(variant => variant.SoLuongTon, cancellationToken);
        await db.SanPham
            .Where(product => product.Id == productId)
            .ExecuteUpdateAsync(
                setters => setters.SetProperty(product => product.SoLuongTon, totalStock),
                cancellationToken);
    }

    public async Task RecordInitialStockAsync(
        ProductVariant variant,
        int? actorId,
        string note,
        CancellationToken cancellationToken = default)
    {
        if (variant.SoLuongTon <= 0)
            return;

        db.LichSuTonKho.Add(new InventoryMovement
        {
            BienTheId = variant.Id,
            Loai = "ton_dau",
            SoLuongThayDoi = variant.SoLuongTon,
            NguoiThucHienId = actorId,
            GhiChu = note,
            NgayTao = DateTime.UtcNow,
        });
        await db.SaveChangesAsync(cancellationToken);
    }
}
