namespace SportShop.Mvc.Services;

public sealed class OrderMaintenanceHostedService(
    IServiceScopeFactory scopeFactory,
    ILogger<OrderMaintenanceHostedService> logger) : BackgroundService
{
    private static readonly TimeSpan Interval = TimeSpan.FromMinutes(1);

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        DateOnly? lastSummarizedDate = null;
        using var timer = new PeriodicTimer(Interval);

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await RunCycleAsync(lastSummarizedDate, stoppingToken);
                var yesterday = DateOnly.FromDateTime(DateTime.UtcNow).AddDays(-1);
                if (lastSummarizedDate != yesterday)
                    lastSummarizedDate = yesterday;
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                break;
            }
            catch (Exception exception)
            {
                logger.LogError(exception, "Tác vụ bảo trì đơn hàng và doanh thu thất bại; sẽ thử lại ở chu kỳ kế tiếp.");
            }

            if (!await timer.WaitForNextTickAsync(stoppingToken))
                break;
        }
    }

    private async Task RunCycleAsync(DateOnly? lastSummarizedDate, CancellationToken cancellationToken)
    {
        await using var scope = scopeFactory.CreateAsyncScope();
        var maintenance = scope.ServiceProvider.GetRequiredService<OrderMaintenanceService>();
        var now = DateTime.UtcNow;
        var canceledCount = await maintenance.CancelExpiredOrdersAsync(now, cancellationToken);
        if (canceledCount > 0)
            logger.LogInformation("Đã tự động hủy {CanceledOrderCount} đơn quá hạn và hoàn tồn kho.", canceledCount);

        var yesterday = DateOnly.FromDateTime(now).AddDays(-1);
        if (lastSummarizedDate == yesterday)
            return;

        var summary = await maintenance.AggregateDailyRevenueAsync(yesterday, cancellationToken);
        logger.LogInformation(
            "Tổng hợp doanh thu ngày UTC {RevenueDate}: {PaidOrderCount} đơn đã thanh toán, tổng {TotalRevenue} VND.",
            summary.Date,
            summary.PaidOrderCount,
            summary.TotalRevenue);
    }
}
