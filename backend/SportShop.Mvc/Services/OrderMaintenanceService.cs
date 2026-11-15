using System.Data;
using Microsoft.EntityFrameworkCore;
using SportShop.Mvc.Data;
using SportShop.Mvc.Models;

namespace SportShop.Mvc.Services;

public sealed class OrderMaintenanceService(SportShopDbContext db)
{
    public async Task<int> CancelExpiredOrdersAsync(DateTime utcNow, CancellationToken cancellationToken = default)
    {
        var cutoff = DateTime.SpecifyKind(utcNow, DateTimeKind.Utc).AddHours(-48);
        await using var transaction = await db.Database.BeginTransactionAsync(IsolationLevel.Serializable, cancellationToken);
        var expiredOrders = await db.DonHang.AsNoTracking()
            .Where(order => order.TrangThai == "cho_xac_nhan"
                && order.NgayTao <= cutoff
                && !db.ThanhToan.Any(payment =>
                    payment.DonHangId == order.Id && payment.TrangThai == "da_thanh_toan"))
            .Include(order => order.ChiTiet)
            .ToListAsync(cancellationToken);

        var canceledCount = 0;
        foreach (var order in expiredOrders)
        {
            var changed = await db.DonHang
                .Where(candidate => candidate.Id == order.Id
                    && candidate.TrangThai == "cho_xac_nhan"
                    && candidate.NgayTao <= cutoff
                    && !db.ThanhToan.Any(payment =>
                        payment.DonHangId == candidate.Id && payment.TrangThai == "da_thanh_toan"))
                .ExecuteUpdateAsync(
                    setters => setters.SetProperty(candidate => candidate.TrangThai, "da_huy"),
                    cancellationToken);
            if (changed == 0)
                continue;

            await db.ThanhToan
                .Where(payment => payment.DonHangId == order.Id && payment.TrangThai == "cho_thanh_toan")
                .ExecuteUpdateAsync(
                    setters => setters.SetProperty(payment => payment.TrangThai, "that_bai"),
                    cancellationToken);

            foreach (var line in order.ChiTiet)
            {
                await db.SanPham
                    .Where(product => product.Id == line.SanPhamId)
                    .ExecuteUpdateAsync(
                        setters => setters.SetProperty(product => product.SoLuongTon, product => product.SoLuongTon + line.SoLuong),
                        cancellationToken);
            }

            db.ThongBao.Add(new Notification
            {
                TaiKhoanId = order.TaiKhoanId,
                NoiDung = "Đơn hàng quá hạn đã tự động hủy; tồn kho đã được hoàn lại.",
                DaDoc = 0,
                NgayTao = utcNow,
            });
            canceledCount++;
        }

        await db.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);
        return canceledCount;
    }

    public async Task<DailyRevenueSummary> AggregateDailyRevenueAsync(
        DateOnly date,
        CancellationToken cancellationToken = default)
    {
        var start = date.ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc);
        var end = date.AddDays(1).ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc);
        var paidPayments = from payment in db.ThanhToan.AsNoTracking()
                           join order in db.DonHang.AsNoTracking() on payment.DonHangId equals order.Id
                           where payment.TrangThai == "da_thanh_toan"
                               && order.NgayTao >= start
                               && order.NgayTao < end
                           select payment;

        var count = await paidPayments.CountAsync(cancellationToken);
        var total = count == 0 ? 0m : (decimal)await paidPayments.SumAsync(payment => (double)payment.SoTien, cancellationToken);
        return new DailyRevenueSummary(date, count, total);
    }
}

public sealed record DailyRevenueSummary(DateOnly Date, int PaidOrderCount, decimal TotalRevenue);
