using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SportShop.Mvc.Data;
using SportShop.Mvc.Models;
using SportShop.Mvc.Services;

namespace SportShop.Mvc.Controllers;

[Route("api/tai-khoan")]
public sealed class TaiKhoanController(SportShopDbContext db, JwtTokenService tokens) : ApiControllerBase
{
    [HttpPost("dang-ky")]
    [AllowAnonymous]
    public async Task<IActionResult> Register(DangKyRequest request)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        if (await db.TaiKhoan.AnyAsync(x => x.Email == email))
            return Failure(StatusCodes.Status409Conflict, "Email đã được sử dụng");

        var account = new Account
        {
            HoTen = request.HoTen.Trim(),
            Email = email,
            MatKhauMaHoa = BCrypt.Net.BCrypt.HashPassword(request.MatKhau),
            SoDienThoai = request.SoDienThoai,
            VaiTro = "khach_hang",
            NgayTao = DateTime.UtcNow,
        };
        db.TaiKhoan.Add(account);
        await db.SaveChangesAsync();
        return Success(new { taiKhoan = PublicAccount(account), token = tokens.TaoToken(account) }, "Đăng ký thành công");
    }

    [HttpPost("dang-nhap")]
    [AllowAnonymous]
    public async Task<IActionResult> Login(DangNhapRequest request)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        var account = await db.TaiKhoan.SingleOrDefaultAsync(x => x.Email == email);
        if (account is null || !BCrypt.Net.BCrypt.Verify(request.MatKhau, account.MatKhauMaHoa))
            return Failure(StatusCodes.Status401Unauthorized, "Email hoặc mật khẩu không đúng");

        return Success(new { taiKhoan = PublicAccount(account), token = tokens.TaoToken(account) }, "Đăng nhập thành công");
    }

    [HttpGet("toi")]
    [Authorize]
    public async Task<IActionResult> Me()
    {
        var account = await db.TaiKhoan.AsNoTracking().SingleOrDefaultAsync(x => x.Id == CurrentUserId);
        return account is null
            ? Failure(StatusCodes.Status404NotFound, "Không tìm thấy tài khoản")
            : Success(PublicAccount(account));
    }

    [HttpPut("toi")]
    [Authorize]
    public async Task<IActionResult> UpdateProfile(CapNhatHoSoRequest request)
    {
        var account = await db.TaiKhoan.SingleOrDefaultAsync(x => x.Id == CurrentUserId);
        if (account is null)
            return Failure(StatusCodes.Status404NotFound, "Không tìm thấy tài khoản");

        account.HoTen = request.HoTen.Trim();
        account.SoDienThoai = request.SoDienThoai;
        await db.SaveChangesAsync();
        return Success(PublicAccount(account), "Cập nhật hồ sơ thành công");
    }

    private static object PublicAccount(Account account) => new
    {
        account.Id,
        account.HoTen,
        account.Email,
        account.SoDienThoai,
        account.VaiTro,
        account.NgayTao,
    };

    public sealed record DangKyRequest(
        [param: Required, StringLength(100, MinimumLength = 2)] string HoTen,
        [param: Required, EmailAddress, StringLength(254)] string Email,
        [param: Required, StringLength(72, MinimumLength = 6)] string MatKhau,
        [param: RegularExpression(@"^$|^[0-9]{9,11}$")] string? SoDienThoai);

    public sealed record DangNhapRequest(
        [param: Required, EmailAddress, StringLength(254)] string Email,
        [param: Required] string MatKhau);

    public sealed record CapNhatHoSoRequest(
        [param: Required, StringLength(100, MinimumLength = 2)] string HoTen,
        [param: RegularExpression(@"^$|^[0-9]{9,11}$")] string? SoDienThoai);
}
