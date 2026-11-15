using System.Globalization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SportShop.Mvc.Data;

namespace SportShop.Mvc.Controllers;

[Route("api/bao-cao")]
[Authorize(Roles = "quan_tri")]
public sealed class BaoCaoController(SportShopDbContext db) : ApiControllerBase
{
    [HttpGet("doanh-thu")]
    public async Task<IActionResult> Revenue([FromQuery] string tuNgay, [FromQuery] string denNgay)
    {
        if (!DateOnly.TryParseExact(tuNgay, "yyyy-MM-dd", CultureInfo.InvariantCulture, DateTimeStyles.None, out var start)
            || !DateOnly.TryParseExact(denNgay, "yyyy-MM-dd", CultureInfo.InvariantCulture, DateTimeStyles.None, out var end)
            || end < start)
            return Failure(StatusCodes.Status400BadRequest, "Khoảng ngày không hợp lệ");

        var startDate = start.ToDateTime(TimeOnly.MinValue);
        var endDate = end.AddDays(1).ToDateTime(TimeOnly.MinValue);
        var aggregates = await (from order in db.DonHang.AsNoTracking()
                                join payment in db.ThanhToan.AsNoTracking() on order.Id equals payment.DonHangId
                                where payment.TrangThai == "da_thanh_toan"
                                    && order.NgayTao >= startDate
                                    && order.NgayTao < endDate
                                group new { order, payment } by order.NgayTao.Date into day
                                orderby day.Key
                                select new
                                {
                                    ngay = day.Key,
                                    doanhThu = day.Sum(x => (double)x.payment.SoTien),
                                    soDonHang = day.Count(),
                                }).ToListAsync();
        var rows = aggregates.Select(x => new
        {
            ngay = x.ngay.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture),
            doanhThu = (decimal)x.doanhThu,
            x.soDonHang,
        });
        return Success(rows);
    }

    [HttpGet("tong-quan")]
    public async Task<IActionResult> Overview()
    {
        var statuses = await db.DonHang.AsNoTracking()
            .GroupBy(x => x.TrangThai)
            .Select(group => new { trangThai = group.Key, soLuong = group.Count() })
            .ToListAsync();
        var bestSellers = await (from line in db.ChiTietDonHang.AsNoTracking()
                                 join order in db.DonHang.AsNoTracking() on line.DonHangId equals order.Id
                                 join payment in db.ThanhToan.AsNoTracking() on order.Id equals payment.DonHangId
                                 join product in db.SanPham.AsNoTracking() on line.SanPhamId equals product.Id
                                 where payment.TrangThai == "da_thanh_toan"
                                 group line by new { product.Id, product.Ten } into productGroup
                                 orderby productGroup.Sum(x => x.SoLuong) descending
                                 select new
                                 {
                                     productGroup.Key.Id,
                                     productGroup.Key.Ten,
                                     tongSoLuongBan = productGroup.Sum(x => x.SoLuong),
                                 }).Take(5).ToListAsync();
        return Success(new { theoTrangThai = statuses, sanPhamBanChay = bestSellers });
    }
}
