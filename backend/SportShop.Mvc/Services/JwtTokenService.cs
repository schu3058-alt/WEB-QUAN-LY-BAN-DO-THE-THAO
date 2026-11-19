using System.Globalization;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using SportShop.Mvc.Models;

namespace SportShop.Mvc.Services;

public sealed class JwtTokenService(IConfiguration configuration)
{
    private readonly string _secret = ResolveSecret(configuration);
    private readonly TimeSpan _tokenLifetime = ResolveLifetime(configuration);

    private static string ResolveSecret(IConfiguration configuration)
    {
        var secret = configuration["JWT_SECRET"]?.Trim();
        if (string.IsNullOrWhiteSpace(secret) || Encoding.UTF8.GetByteCount(secret) < 32)
            throw new InvalidOperationException("JWT_SECRET chưa được cấu hình hoặc quá ngắn.");

        return secret;
    }

    private static TimeSpan ResolveLifetime(IConfiguration configuration)
    {
        var configuredLifetime = configuration["JWT_HET_HAN"]?.Trim();
        if (string.IsNullOrWhiteSpace(configuredLifetime))
            return TimeSpan.FromDays(7);

        if (TimeSpan.TryParse(configuredLifetime, CultureInfo.InvariantCulture, out var timeSpan)
            && timeSpan > TimeSpan.Zero)
        {
            return timeSpan;
        }

        if (configuredLifetime.Length > 1
            && double.TryParse(
                configuredLifetime[..^1],
                NumberStyles.Float,
                CultureInfo.InvariantCulture,
                out var amount)
            && amount > 0)
        {
            try
            {
                return configuredLifetime[^1] switch
                {
                    'd' => TimeSpan.FromDays(amount),
                    'h' => TimeSpan.FromHours(amount),
                    'm' => TimeSpan.FromMinutes(amount),
                    's' => TimeSpan.FromSeconds(amount),
                    _ => throw new FormatException(),
                };
            }
            catch (OverflowException)
            {
                // Fall through to the same explicit configuration error.
            }
        }

        throw new InvalidOperationException(
            "JWT_HET_HAN không hợp lệ. Dùng định dạng như 7d, 24h, 30m hoặc TimeSpan.");
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
            expires: DateTime.UtcNow.Add(_tokenLifetime),
            signingCredentials: credentials);
        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
