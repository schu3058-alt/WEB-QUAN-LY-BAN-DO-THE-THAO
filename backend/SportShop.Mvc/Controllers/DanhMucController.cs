using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SportShop.Mvc.Data;
using SportShop.Mvc.Models;

namespace SportShop.Mvc.Controllers;

[Route("api/danh-muc")]
public sealed class DanhMucController(SportShopDbContext db) : ApiControllerBase
{
    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetAll() =>
        Success(await db.DanhMuc.AsNoTracking().OrderBy(x => x.Ten).ToListAsync());

    [HttpGet("{id:int}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetById(int id)
    {
        var category = await db.DanhMuc.AsNoTracking().SingleOrDefaultAsync(x => x.Id == id);
        return category is null
            ? Failure(StatusCodes.Status404NotFound, "Không tìm thấy danh mục")
            : Success(category);
    }

    [HttpPost]
    [Authorize(Roles = "quan_tri")]
    public async Task<IActionResult> Create(CategoryRequest request)
    {
        var slug = request.Slug.Trim().ToLowerInvariant();
        if (await db.DanhMuc.AnyAsync(x => x.Slug == slug))
            return Failure(StatusCodes.Status409Conflict, "Đường dẫn danh mục đã được sử dụng");
        var category = new Category { Ten = request.Ten.Trim(), MoTa = request.MoTa, Slug = slug };
        db.DanhMuc.Add(category);
        await db.SaveChangesAsync();
        return Success(category, "Tạo danh mục thành công");
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "quan_tri")]
    public async Task<IActionResult> Update(int id, CategoryRequest request)
    {
        var category = await db.DanhMuc.SingleOrDefaultAsync(x => x.Id == id);
        if (category is null)
            return Failure(StatusCodes.Status404NotFound, "Không tìm thấy danh mục");
        var slug = request.Slug.Trim().ToLowerInvariant();
        if (await db.DanhMuc.AnyAsync(x => x.Id != id && x.Slug == slug))
            return Failure(StatusCodes.Status409Conflict, "Đường dẫn danh mục đã được sử dụng");
        category.Ten = request.Ten.Trim();
        category.MoTa = request.MoTa;
        category.Slug = slug;
        await db.SaveChangesAsync();
        return Success(category, "Cập nhật danh mục thành công");
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "quan_tri")]
    public async Task<IActionResult> Delete(int id)
    {
        var category = await db.DanhMuc.SingleOrDefaultAsync(x => x.Id == id);
        if (category is null)
            return Failure(StatusCodes.Status404NotFound, "Không tìm thấy danh mục");
        db.DanhMuc.Remove(category);
        await db.SaveChangesAsync();
        return Success(null, "Xóa danh mục thành công");
    }

    public sealed record CategoryRequest(
        [param: Required, StringLength(100, MinimumLength = 2)] string Ten,
        string? MoTa,
        [param: Required, RegularExpression(@"^[a-z0-9]+(?:-[a-z0-9]+)*$"), StringLength(150)] string Slug);
}
