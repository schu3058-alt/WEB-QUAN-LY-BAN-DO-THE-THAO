using System.ComponentModel.DataAnnotations;
using System.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SportShop.Mvc.Data;
using SportShop.Mvc.Models;

namespace SportShop.Mvc.Controllers;

[Route("api/thanh-toan")]
[Authorize]
public sealed class ThanhToanController(SportShopDbContext db) : ApiControllerBase
{
    [HttpPost]
    public async Task<IActionResult> Create(CreatePaymentRequest request)
    {
        await using var transaction = await db.Database.BeginTransactionAsync(IsolationLevel.Serializable);
        var order = await db.DonHang.SingleOrDefaultAsync(x => x.Id == request.DonHangId);
        if (order is null || (!User.IsInRole("quan_tri") && order.TaiKhoanId != CurrentUserId))
            return Failure(StatusCodes.Status404NotFound, "Không tìm thấy đơn hàng");
        if (order.TrangThai == "da_huy")
            return Failure(StatusCodes.Status409Conflict, "Không thể tạo yêu cầu thanh toán cho đơn hàng đã hủy");
        if (await db.ThanhToan.AnyAsync(x => x.DonHangId == request.DonHangId))
            return Failure(StatusCodes.Status409Conflict, "Đơn hàng đã có yêu cầu thanh toán");
        var payment = new Payment
        {
            DonHangId = order.Id,
            PhuongThuc = request.PhuongThuc,
            SoTien = order.TongTien,
            TrangThai = "cho_thanh_toan",
            NgayTao = DateTime.UtcNow,
        };
        db.ThanhToan.Add(payment);
        await db.SaveChangesAsync();
        await transaction.CommitAsync();
        return Success(PaymentView(payment), "Tạo yêu cầu thanh toán thành công");
    }

    [HttpGet("don-hang/{donHangId:int}")]
    public async Task<IActionResult> GetByOrder(int donHangId)
    {
        var order = await db.DonHang.AsNoTracking().SingleOrDefaultAsync(x => x.Id == donHangId);
        if (order is null || (!User.IsInRole("quan_tri") && order.TaiKhoanId != CurrentUserId))
            return Failure(StatusCodes.Status404NotFound, "Không tìm thấy đơn hàng");
        var payment = await db.ThanhToan.AsNoTracking().SingleOrDefaultAsync(x => x.DonHangId == donHangId);
        return Success(payment is null ? null : PaymentView(payment));
    }

    [HttpPut("{id:int}/xac-nhan")]
    [Authorize(Roles = "quan_tri")]
    public async Task<IActionResult> Confirm(int id)
    {
        await using var transaction = await db.Database.BeginTransactionAsync(IsolationLevel.Serializable);
        var payment = await db.ThanhToan.SingleOrDefaultAsync(x => x.Id == id);
        if (payment is null)
            return Failure(StatusCodes.Status404NotFound, "Không tìm thấy yêu cầu thanh toán");
        if (payment.TrangThai == "da_thanh_toan")
            return Success(PaymentView(payment));
        var order = await db.DonHang.SingleOrDefaultAsync(x => x.Id == payment.DonHangId);
        if (order is null)
            return Failure(StatusCodes.Status404NotFound, "Không tìm thấy đơn hàng");
        if (order.TrangThai == "da_huy")
            return Failure(StatusCodes.Status409Conflict, "Không thể xác nhận thanh toán cho đơn hàng đã hủy");

        payment.TrangThai = "da_thanh_toan";
        if (order.TrangThai == "cho_xac_nhan")
        {
            order.TrangThai = "dang_giao";
            db.ThongBao.Add(new Notification
            {
                TaiKhoanId = order.TaiKhoanId,
                NoiDung = "Đơn hàng của bạn vừa chuyển sang trạng thái: đang giao",
                DaDoc = 0,
                NgayTao = DateTime.UtcNow,
            });
        }
        await db.SaveChangesAsync();
        await transaction.CommitAsync();
        return Success(PaymentView(payment), "Xác nhận thanh toán thành công");
    }

    private static object PaymentView(Payment payment) => new
    {
        payment.Id,
        payment.DonHangId,
        payment.PhuongThuc,
        payment.SoTien,
        payment.TrangThai,
        payment.NgayTao,
    };

    public sealed record CreatePaymentRequest(
        [param: Range(1, int.MaxValue)] int DonHangId,
        [param: Required, RegularExpression(@"^(tien_mat|chuyen_khoan|vi_dien_tu)$")] string PhuongThuc);
}
