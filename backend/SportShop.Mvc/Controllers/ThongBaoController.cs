using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SportShop.Mvc.Data;
using SportShop.Mvc.Models;

namespace SportShop.Mvc.Controllers;

[Route("api/thong-bao")]
[Authorize]
public sealed class ThongBaoController(SportShopDbContext db) : ApiControllerBase
{
    [HttpGet("toi")]
    public async Task<IActionResult> GetMine()
    {
        var notifications = await db.ThongBao.AsNoTracking()
            .Where(x => x.TaiKhoanId == CurrentUserId)
            .OrderByDescending(x => x.NgayTao)
            .ToListAsync();
        return Success(notifications);
    }

    [HttpPut("{id:int}/da-doc")]
    public async Task<IActionResult> MarkRead(int id)
    {
        var notification = await db.ThongBao.SingleOrDefaultAsync(x => x.Id == id && x.TaiKhoanId == CurrentUserId);
        if (notification is null)
            return Failure(StatusCodes.Status404NotFound, "Không tìm thấy thông báo");
        notification.DaDoc = 1;
        await db.SaveChangesAsync();
        return Success(notification);
    }
}
