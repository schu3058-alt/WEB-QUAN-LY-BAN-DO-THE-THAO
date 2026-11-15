using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Security.Cryptography;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;
using Microsoft.IdentityModel.Tokens;
using SportShop.Mvc.Data;
using SportShop.Mvc.Models;
using SportShop.Mvc.Services;

var builder = WebApplication.CreateBuilder(args);
var isMigrationOnly = args.Contains("--migrate-only", StringComparer.Ordinal);
var isSeedOnly = args.Contains("--seed-only", StringComparer.Ordinal);
if (isSeedOnly && builder.Environment.IsProduction())
    throw new InvalidOperationException("Không nạp tài khoản và dữ liệu demo trong môi trường production.");

var jwtSecret = builder.Configuration["JWT_SECRET"]?.Trim();
if ((isMigrationOnly || isSeedOnly) && string.IsNullOrWhiteSpace(jwtSecret))
    jwtSecret = Convert.ToBase64String(RandomNumberGenerator.GetBytes(32));
if (string.IsNullOrWhiteSpace(jwtSecret) || Encoding.UTF8.GetByteCount(jwtSecret) < 32)
{
    throw new InvalidOperationException("JWT_SECRET phải được cấu hình bằng chuỗi riêng tư có ít nhất 32 byte.");
}

var repositoryRoot = Path.GetFullPath(Path.Combine(builder.Environment.ContentRootPath, "..", ".."));
var databasePath = builder.Configuration["DUONG_DAN_CSDL"] ?? "./database/quan_ly_sportshop.sqlite";
var fullDatabasePath = Path.IsPathRooted(databasePath)
    ? Path.GetFullPath(databasePath)
    : Path.GetFullPath(Path.Combine(repositoryRoot, databasePath));
var connectionString = $"Data Source={fullDatabasePath}";
var frontendPath = Path.Combine(repositoryRoot, "frontend");
if (!Directory.Exists(frontendPath))
{
    throw new DirectoryNotFoundException($"Không tìm thấy thư mục giao diện: {frontendPath}");
}
builder.Environment.WebRootPath = frontendPath;
builder.Environment.WebRootFileProvider = new PhysicalFileProvider(frontendPath);

builder.Services
    .AddControllersWithViews()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    })
    .ConfigureApiBehaviorOptions(options =>
    {
        options.InvalidModelStateResponseFactory = context =>
        {
            var message = context.ModelState.Values
                .SelectMany(value => value.Errors)
                .Select(error => error.ErrorMessage)
                .FirstOrDefault() ?? "Dữ liệu không hợp lệ";
            return new Microsoft.AspNetCore.Mvc.BadRequestObjectResult(ApiResponse<object>.Fail(message));
        };
    });

builder.Services.AddDbContext<SportShopDbContext>(options => options.UseSqlite(connectionString));
builder.Services.AddScoped<JwtTokenService>();
builder.Services.AddScoped<OrderMaintenanceService>();
builder.Services.AddHostedService<OrderMaintenanceHostedService>();
builder.Services.AddCors(options => options.AddDefaultPolicy(policy =>
    policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod()));
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
            ValidateLifetime = true,
            ClockSkew = TimeSpan.FromSeconds(30),
            RoleClaimType = System.Security.Claims.ClaimTypes.Role,
            NameClaimType = System.Security.Claims.ClaimTypes.NameIdentifier,
        };
    });
builder.Services.AddRateLimiter(options =>
{
    options.AddFixedWindowLimiter("api", limiter =>
    {
        limiter.PermitLimit = builder.Configuration.GetValue("GIOI_HAN_SO_YEU_CAU", 100);
        limiter.Window = TimeSpan.FromMilliseconds(builder.Configuration.GetValue("GIOI_HAN_THOI_GIAN_MS", 900_000));
        limiter.QueueLimit = 0;
    });
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.OnRejected = async (context, _) =>
    {
        context.HttpContext.Response.ContentType = "application/json";
        await context.HttpContext.Response.WriteAsJsonAsync(ApiResponse<object>.Fail("Bạn gửi yêu cầu quá nhanh, vui lòng thử lại sau."));
    };
});

var app = builder.Build();
Directory.CreateDirectory(Path.GetDirectoryName(fullDatabasePath)!);
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<SportShopDbContext>();
    await DatabaseMigrationService.MigrateAsync(db, app.Logger);
}

if (isMigrationOnly)
    return;

if (isSeedOnly)
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<SportShopDbContext>();
    await DemoDataSeeder.SeedAsync(db, app.Environment.IsProduction());
    app.Logger.LogInformation("Đã nạp dữ liệu demo vào CSDL {DatabasePath}", fullDatabasePath);
    return;
}

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler(errorApp => errorApp.Run(async context =>
    {
        var exception = context.Features.Get<Microsoft.AspNetCore.Diagnostics.IExceptionHandlerFeature>()?.Error;
        app.Logger.LogError(exception, "Unhandled request exception");
        context.Response.StatusCode = StatusCodes.Status500InternalServerError;
        context.Response.ContentType = "application/json";
        await context.Response.WriteAsJsonAsync(ApiResponse<object>.Fail("Đã xảy ra lỗi máy chủ."));
    }));
    app.UseHsts();
}
else
{
    app.UseExceptionHandler(errorApp => errorApp.Run(async context =>
    {
        var exception = context.Features.Get<Microsoft.AspNetCore.Diagnostics.IExceptionHandlerFeature>()?.Error;
        app.Logger.LogError(exception, "Unhandled request exception");
        context.Response.StatusCode = StatusCodes.Status500InternalServerError;
        context.Response.ContentType = "application/json";
        await context.Response.WriteAsJsonAsync(ApiResponse<object>.Fail("Đã xảy ra lỗi máy chủ."));
    }));
}

app.UseStaticFiles();
app.UseRouting();
app.UseCors();
app.UseRateLimiter();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers().RequireRateLimiting("api");
app.MapControllerRoute(name: "default", pattern: "{controller=Frontend}/{action=Index}/{id?}");
app.Run();

public partial class Program;
