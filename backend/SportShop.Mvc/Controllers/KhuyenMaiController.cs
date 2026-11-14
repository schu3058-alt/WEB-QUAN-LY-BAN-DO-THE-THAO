using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SportShop.Mvc.Data;
using SportShop.Mvc.Models;

namespace SportShop.Mvc.Controllers;

[Route("api/khuyen-mai")]
public sealed class KhuyenMaiController(SportShopDbContext db) : ApiControllerBase
{
    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetAll() =>
        Success(await db.KhuyenMai.AsNoTracking().OrderBy(x => x.NgayBatDau).ToListAsync());

    [HttpPost("ap-dung")]
    [AllowAnonymous]
    public async Task<IActionResult> Apply(ApplyPromotionRequest request)
    {
        var code = request.Ma.Trim().ToUpperInvariant();
        var promotion = await db.KhuyenMai.AsNoTracking().SingleOrDefaultAsync(x => x.Ma == code);
        if (promotion is null || !PromotionIsActive(promotion))
            return Failure(StatusCodes.Status400BadRequest, "Mã khuyến mãi không hợp lệ hoặc đã hết hạn");
        var discount = request.TongTienGoc * promotion.PhanTramGiam / 100m;
        return Success(new
        {
            tongTienGoc = request.TongTienGoc,
            soTienGiam = discount,
            tongTienSauGiam = request.TongTienGoc - discount,
        });
    }

    [HttpPost]
    [Authorize(Roles = "quan_tri")]
    public async Task<IActionResult> Create(CreatePromotionRequest request)
    {
        var code = request.Ma.Trim().ToUpperInvariant();
        if (await db.KhuyenMai.AnyAsync(x => x.Ma == code))
            return Failure(StatusCodes.Status409Conflict, "Mã khuyến mãi đã tồn tại");
        if (!DateTime.TryParse(request.NgayBatDau, out var start) ||
            !DateTime.TryParse(request.NgayKetThuc, out var end) || end < start)
            return Failure(StatusCodes.Status400BadRequest, "Ngày kết thúc phải sau ngày bắt đầu");
        var promotion = new Promotion
        {
            Ma = code,
            PhanTramGiam = request.PhanTramGiam,
            NgayBatDau = request.NgayBatDau,
            NgayKetThuc = request.NgayKetThuc,
        };
        db.KhuyenMai.Add(promotion);
        await db.SaveChangesAsync();
        return Success(promotion, "Tạo mã khuyến mãi thành công");
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "quan_tri")]
    public async Task<IActionResult> Delete(int id)
    {
        var promotion = await db.KhuyenMai.SingleOrDefaultAsync(x => x.Id == id);
        if (promotion is null)
            return Failure(StatusCodes.Status404NotFound, "Không tìm thấy mã khuyến mãi");
        db.KhuyenMai.Remove(promotion);
        await db.SaveChangesAsync();
        return Success(null, "Xóa mã khuyến mãi thành công");
    }

    private static bool PromotionIsActive(Promotion promotion)
    {
        var now = DateTime.UtcNow;
        return DateTime.TryParse(promotion.NgayBatDau, out var start)
            && DateTime.TryParse(promotion.NgayKetThuc, out var end)
            && now >= start
            && now <= (end.TimeOfDay == TimeSpan.Zero ? end.Date.AddDays(1).AddTicks(-1) : end);
    }

    public sealed record ApplyPromotionRequest(
        [param: Required, StringLength(80)] string Ma,
        [param: Range(0, (double)decimal.MaxValue)] decimal TongTienGoc);

    public sealed record CreatePromotionRequest(
        [param: Required, StringLength(80)] string Ma,
        [param: Range(1, 100)] decimal PhanTramGiam,
        [param: Required] string NgayBatDau,
        [param: Required] string NgayKetThuc);
}
