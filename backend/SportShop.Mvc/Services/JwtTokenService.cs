using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using SportShop.Mvc.Models;

namespace SportShop.Mvc.Services;

public sealed class JwtTokenService(IConfiguration configuration)
{
    private readonly string _secret = ResolveSecret(configuration);

    private static string ResolveSecret(IConfiguration configuration)
    {
        var secret = configuration["JWT_SECRET"]?.Trim();
        if (string.IsNullOrWhiteSpace(secret))
        {
            var environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT");
            if (string.Equals(environment, "Development", StringComparison.OrdinalIgnoreCase))
                secret = "SportShop_Dev_JWT_Secret_2026_1234567890";
        }

        if (string.IsNullOrWhiteSpace(secret) || Encoding.UTF8.GetByteCount(secret) < 32)
            throw new InvalidOperationException("JWT_SECRET chưa được cấu hình hoặc quá ngắn.");

        return secret;
    }

    public string TaoToken(Account account)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_secret));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, account.Id.ToString()),
            new Claim(ClaimTypes.Role, account.VaiTro),
        };
        var token = new JwtSecurityToken(
            claims: claims,
            expires: DateTime.UtcNow.AddDays(7),
            signingCredentials: credentials);
        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
