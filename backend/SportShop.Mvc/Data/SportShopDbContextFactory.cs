using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace SportShop.Mvc.Data;

public sealed class SportShopDbContextFactory : IDesignTimeDbContextFactory<SportShopDbContext>
{
    public SportShopDbContext CreateDbContext(string[] args)
    {
        var repositoryRoot = FindRepositoryRoot();
        var databasePath = Environment.GetEnvironmentVariable("DUONG_DAN_CSDL")
            ?? "./database/quan_ly_sportshop.sqlite";
        var fullDatabasePath = Path.IsPathRooted(databasePath)
            ? Path.GetFullPath(databasePath)
            : Path.GetFullPath(Path.Combine(repositoryRoot, databasePath));
        Directory.CreateDirectory(Path.GetDirectoryName(fullDatabasePath)!);

        var options = new DbContextOptionsBuilder<SportShopDbContext>()
            .UseSqlite($"Data Source={fullDatabasePath}")
            .Options;
        return new SportShopDbContext(options);
    }

    private static string FindRepositoryRoot()
    {
        DirectoryInfo? directory = new(Directory.GetCurrentDirectory());
        while (directory is not null)
        {
            if (Directory.Exists(Path.Combine(directory.FullName, "frontend"))
                && Directory.Exists(Path.Combine(directory.FullName, "backend", "SportShop.Mvc")))
                return directory.FullName;
            directory = directory.Parent;
        }

        throw new DirectoryNotFoundException("Không tìm thấy thư mục gốc SportShop để cấu hình CSDL.");
    }
}
