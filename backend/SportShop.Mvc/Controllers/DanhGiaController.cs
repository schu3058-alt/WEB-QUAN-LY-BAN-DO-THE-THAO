using System.ComponentModel.DataAnnotations;
using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SportShop.Mvc.Data;
using SportShop.Mvc.Models;

namespace SportShop.Mvc.Controllers;

[Route("api/danh-gia")]
public sealed class DanhGiaController(SportShopDbContext db) : ApiControllerBase
{
    [HttpGet("san-pham/{sanPhamId:int}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetByProduct(int sanPhamId)
    {
        var reviews = await (from review in db.DanhGia.AsNoTracking()
                             join account in db.TaiKhoan.AsNoTracking() on review.TaiKhoanId equals account.Id
                             where review.SanPhamId == sanPhamId
                             orderby review.NgayTao descending
                             select new
                             {
                                 review.Id,
                                 review.SanPhamId,
                                 review.TaiKhoanId,
                                 review.SoSao,
                                 review.NoiDung,
                                 review.NgayTao,
                                 hoTen = account.HoTen,
                             }).ToListAsync();
        return Success(reviews);
    }

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> Create(CreateReviewRequest request)
    {
        var eligible = await db.ChiTietDonHang.AnyAsync(line =>
            line.SanPhamId == request.SanPhamId
            && line.DonHang.TaiKhoanId == CurrentUserId
            && line.DonHang.TrangThai == "da_giao");
        if (!eligible)
            return Failure(StatusCodes.Status403Forbidden, "Bạn chỉ có thể đánh giá sản phẩm trong đơn hàng đã giao");
        var review = new Review
        {
            SanPhamId = request.SanPhamId,
            TaiKhoanId = CurrentUserId,
            SoSao = request.SoSao,
            NoiDung = CleanHtml(request.NoiDung),
            NgayTao = DateTime.UtcNow,
        };
        db.DanhGia.Add(review);
        await db.SaveChangesAsync();
        return Success(review, "Gửi đánh giá thành công");
    }

    [HttpDelete("{id:int}")]
    [Authorize]
    public async Task<IActionResult> Delete(int id)
    {
        var review = await db.DanhGia.SingleOrDefaultAsync(x => x.Id == id && x.TaiKhoanId == CurrentUserId);
        if (review is null)
            return Failure(StatusCodes.Status404NotFound, "Không tìm thấy đánh giá");
        db.DanhGia.Remove(review);
        await db.SaveChangesAsync();
        return Success(null, "Xóa đánh giá thành công");
    }

    private static string? CleanHtml(string? text) =>
        text is null ? null : Regex.Replace(text, "<[^>]*>", "", RegexOptions.CultureInvariant);

    public sealed record CreateReviewRequest(
        [param: Range(1, int.MaxValue)] int SanPhamId,
        [param: Range(1, 5)] int SoSao,
        [param: StringLength(2000)] string? NoiDung);
}
