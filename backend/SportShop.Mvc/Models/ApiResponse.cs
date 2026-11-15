namespace SportShop.Mvc.Models;

public sealed record ApiResponse<T>(bool ThanhCong, string ThongBao, T? DuLieu)
{
    public static ApiResponse<T> Ok(T? duLieu, string thongBao = "Thành công") =>
        new(true, thongBao, duLieu);

    public static ApiResponse<T> Fail(string thongBao) =>
        new(false, thongBao, default);
}
