using System.Security.Claims;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.AspNetCore.Mvc;
using SportShop.Mvc.Models;

namespace SportShop.Mvc.Controllers;

[ApiController]
[EnableRateLimiting("api")]
public abstract class ApiControllerBase : ControllerBase
{
    protected int CurrentUserId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    protected IActionResult Success(object? data, string message = "Thành công") =>
        Ok(ApiResponse<object>.Ok(data, message));

    protected IActionResult Failure(int status, string message) =>
        StatusCode(status, ApiResponse<object>.Fail(message));
}
