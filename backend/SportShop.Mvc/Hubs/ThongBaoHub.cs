using Microsoft.AspNetCore.SignalR;

namespace SportShop.Mvc.Hubs
{
    public class ThongBaoHub : Hub
    {
        // Khách hàng tham gia kênh riêng theo TaiKhoanId để nhận cập nhật đơn hàng
        public async Task ThamGiaKenhCaNhan(string taiKhoanId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"user_{taiKhoanId}");
        }

        // Admin/Nhân viên tham gia kênh quản trị để nhận cảnh báo đơn mới & hết hàng
        public async Task ThamGiaKenhQuanTri()
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, "quan_tri_vien");
        }
    }
}