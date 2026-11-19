using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace SportShop.Mvc.Hubs
{
    [Authorize]
    public class ThongBaoHub : Hub
    {
        public async Task ThamGiaKenhCaNhan(string taiKhoanId)
        {
            var currentUserId = Context.User?.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(taiKhoanId, out var requestedUserId)
                || !int.TryParse(currentUserId, out var authenticatedUserId)
                || requestedUserId != authenticatedUserId)
            {
                throw new HubException("Không được phép tham gia kênh thông báo của tài khoản khác.");
            }

            await Groups.AddToGroupAsync(Context.ConnectionId, $"user_{authenticatedUserId}");
        }

        public async Task ThamGiaKenhQuanTri()
        {
            if (!Context.User?.IsInRole("quan_tri") ?? true)
                throw new HubException("Chỉ quản trị viên mới được tham gia kênh quản trị.");

            await Groups.AddToGroupAsync(Context.ConnectionId, "quan_tri_vien");
        }
    }
}