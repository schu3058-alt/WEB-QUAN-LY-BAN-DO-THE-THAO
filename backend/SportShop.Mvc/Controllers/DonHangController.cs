using System.ComponentModel.DataAnnotations;
using System.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SportShop.Mvc.Data;
using SportShop.Mvc.Models;

namespace SportShop.Mvc.Controllers;

[Route("api/don-hang")]
[Authorize]
public sealed class DonHangController(SportShopDbContext db) : ApiControllerBase
{
    [HttpPost]
    public async Task<IActionResult> PlaceOrder(DatHangRequest request)
    {
        await using var transaction = await db.Database.BeginTransactionAsync(IsolationLevel.Serializable);
        var cart = await db.GioHang.Where(x => x.TaiKhoanId == CurrentUserId)
            .Include(x => x.SanPham).ToListAsync();
        if (cart.Count == 0)
            return Failure(StatusCodes.Status400BadRequest, "Giỏ hàng đang trống, không thể đặt hàng");
        if (cart.Any(x => x.SanPham.TrangThai != "dang_ban"))
            return Failure(StatusCodes.Status409Conflict, "Có sản phẩm đã ngừng kinh doanh");
        if (cart.Any(x => x.SanPham.SoLuongTon < x.SoLuong))
            return Failure(StatusCodes.Status409Conflict, "Có sản phẩm không đủ tồn kho");

        var originalTotal = cart.Sum(x => x.SanPham.Gia * x.SoLuong);
        var total = originalTotal;
        if (!string.IsNullOrWhiteSpace(request.MaKhuyenMai))
        {
            var code = request.MaKhuyenMai.Trim().ToUpperInvariant();
            var promotion = await db.KhuyenMai.SingleOrDefaultAsync(x => x.Ma == code);
            if (promotion is null || !PromotionIsActive(promotion))
                return Failure(StatusCodes.Status400BadRequest, "Mã khuyến mãi không hợp lệ hoặc đã hết hạn");
            total -= originalTotal * promotion.PhanTramGiam / 100m;
        }

        foreach (var item in cart)
        {
            var changed = await db.SanPham
                .Where(x => x.Id == item.SanPhamId && x.SoLuongTon >= item.SoLuong)
                .ExecuteUpdateAsync(setters => setters.SetProperty(x => x.SoLuongTon, x => x.SoLuongTon - item.SoLuong));
            if (changed != 1)
            {
                await transaction.RollbackAsync();
                return Failure(StatusCodes.Status409Conflict, $"Sản phẩm {item.SanPham.Ten} không đủ tồn kho");
            }
        }

        var order = new Order
        {
            TaiKhoanId = CurrentUserId,
            DiaChiNhan = request.DiaChiNhan.Trim(),
            SoDienThoaiNhan = request.SoDienThoaiNhan.Trim(),
            GhiChu = request.GhiChu,
            TongTien = total,
            TrangThai = "cho_xac_nhan",
            NgayTao = DateTime.UtcNow,
            ChiTiet = cart.Select(x => new OrderItem
            {
                SanPhamId = x.SanPhamId,
                SoLuong = x.SoLuong,
                DonGia = x.SanPham.Gia,
            }).ToList(),
        };
        db.DonHang.Add(order);
        db.GioHang.RemoveRange(cart);
        await db.SaveChangesAsync();
        await transaction.CommitAsync();
        return await GetOrder(order.Id, CurrentUserId, false);
    }

    [HttpGet("toi")]
    public async Task<IActionResult> Mine()
    {
        var orders = await db.DonHang.AsNoTracking().Where(x => x.TaiKhoanId == CurrentUserId)
            .OrderByDescending(x => x.NgayTao).ToListAsync();
        return Success(orders);
    }

    [HttpGet]
    [Authorize(Roles = "quan_tri")]
    public async Task<IActionResult> GetAll([FromQuery] string? trangThai)
    {
        var query = db.DonHang.AsNoTracking().Include(x => x.TaiKhoan).AsQueryable();
        if (!string.IsNullOrWhiteSpace(trangThai))
            query = query.Where(x => x.TrangThai == trangThai);
        var orders = await query.OrderByDescending(x => x.NgayTao).ToListAsync();
        return Success(orders.Select(x => new
        {
            x.Id, x.TaiKhoanId, x.DiaChiNhan, x.SoDienThoaiNhan, x.GhiChu,
            x.TongTien, x.TrangThai, x.NgayTao,
            tenKhachHang = x.TaiKhoan.HoTen,
            x.TaiKhoan.Email,
        }));
    }

    [HttpGet("{id:int}")]
    public Task<IActionResult> GetMine(int id) => GetOrder(id, CurrentUserId, User.IsInRole("quan_tri"));

    [HttpPut("{id:int}/trang-thai")]
    [Authorize(Roles = "quan_tri")]
    public async Task<IActionResult> UpdateStatus(int id, UpdateOrderStatusRequest request)
    {
        await using var transaction = await db.Database.BeginTransactionAsync(IsolationLevel.Serializable);
        var order = await db.DonHang.Include(x => x.ChiTiet).Include(x => x.ThanhToan)
            .SingleOrDefaultAsync(x => x.Id == id);
        if (order is null)
            return Failure(StatusCodes.Status404NotFound, "Không tìm thấy đơn hàng");
        if (order.TrangThai == request.TrangThai)
            return Success(await OrderView(id));

        var allowed = order.TrangThai switch
        {
            "cho_xac_nhan" => new[] { "dang_giao", "da_huy" },
            "dang_giao" => new[] { "da_giao" },
            _ => Array.Empty<string>(),
        };
        if (!allowed.Contains(request.TrangThai))
            return Failure(StatusCodes.Status409Conflict, "Không thể chuyển đơn hàng sang trạng thái này");
        if (request.TrangThai == "da_huy")
        {
            if (order.ThanhToan?.TrangThai == "da_thanh_toan")
                return Failure(StatusCodes.Status409Conflict, "Không thể hủy đơn hàng đã thanh toán");
            if (order.ThanhToan?.TrangThai == "cho_thanh_toan")
                order.ThanhToan.TrangThai = "that_bai";
            foreach (var line in order.ChiTiet)
            {
                await db.SanPham.Where(x => x.Id == line.SanPhamId)
                    .ExecuteUpdateAsync(setters => setters.SetProperty(x => x.SoLuongTon, x => x.SoLuongTon + line.SoLuong));
            }
        }
        order.TrangThai = request.TrangThai;
        db.ThongBao.Add(new Notification
        {
            TaiKhoanId = order.TaiKhoanId,
            NoiDung = $"Đơn hàng của bạn vừa chuyển sang trạng thái: {StatusText(request.TrangThai)}",
            DaDoc = 0,
            NgayTao = DateTime.UtcNow,
        });
        await db.SaveChangesAsync();
        await transaction.CommitAsync();
        return Success(await OrderView(id), "Cập nhật trạng thái đơn hàng thành công");
    }

    private async Task<IActionResult> GetOrder(int id, int accountId, bool isAdmin)
    {
        var order = await db.DonHang.AsNoTracking().Include(x => x.ChiTiet).ThenInclude(x => x.SanPham)
            .SingleOrDefaultAsync(x => x.Id == id && (isAdmin || x.TaiKhoanId == accountId));
        return order is null
            ? Failure(StatusCodes.Status404NotFound, "Không tìm thấy đơn hàng")
            : Success(OrderView(order));
    }

    private async Task<object?> OrderView(int id)
    {
        var order = await db.DonHang.AsNoTracking().Include(x => x.ChiTiet).ThenInclude(x => x.SanPham)
            .SingleOrDefaultAsync(x => x.Id == id);
        return order is null ? null : OrderView(order);
    }

    private static object OrderView(Order order) => new
    {
        order.Id, order.TaiKhoanId, order.DiaChiNhan, order.SoDienThoaiNhan,
        order.GhiChu, order.TongTien, order.TrangThai, order.NgayTao,
        chiTiet = order.ChiTiet.Select(x => new
        {
            x.Id, x.DonHangId, x.SanPhamId, x.SoLuong, x.DonGia,
            ten = x.SanPham.Ten, hinhAnh = x.SanPham.HinhAnh,
        }),
    };

    private static bool PromotionIsActive(Promotion promotion)
    {
        var now = DateTime.UtcNow;
        return DateTime.TryParse(promotion.NgayBatDau, out var start)
            && DateTime.TryParse(promotion.NgayKetThuc, out var end)
            && now >= start
            && now <= (end.TimeOfDay == TimeSpan.Zero ? end.Date.AddDays(1).AddTicks(-1) : end);
    }

    private static string StatusText(string status) => status switch
    {
        "cho_xac_nhan" => "chờ xác nhận",
        "dang_giao" => "đang giao",
        "da_giao" => "đã giao",
        "da_huy" => "đã hủy",
        _ => status,
    };

    public sealed record DatHangRequest(
        [param: Required, StringLength(500, MinimumLength = 5)] string DiaChiNhan,
        [param: Required, RegularExpression(@"^[0-9]{9,11}$")] string SoDienThoaiNhan,
        [param: StringLength(1000)] string? GhiChu,
        [param: StringLength(80)] string? MaKhuyenMai);

    public sealed record UpdateOrderStatusRequest(
        [param: Required, RegularExpression(@"^(dang_giao|da_giao|da_huy)$")] string TrangThai);
}
