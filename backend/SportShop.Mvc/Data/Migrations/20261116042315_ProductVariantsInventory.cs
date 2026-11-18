using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SportShop.Mvc.Data.Migrations
{
    /// <inheritdoc />
    public partial class ProductVariantsInventory : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                DROP INDEX IF EXISTS "IX_gio_hang_chi_tiet_taiKhoanId_sanPhamId";
                DROP TRIGGER IF EXISTS "trg_gio_hang_unique_insert";
                DROP TRIGGER IF EXISTS "trg_gio_hang_unique_update";
                """);

            migrationBuilder.AddColumn<string>(
                name: "monTheThao",
                table: "san_pham",
                type: "TEXT",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "thuongHieu",
                table: "san_pham",
                type: "TEXT",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "bienTheId",
                table: "gio_hang_chi_tiet",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "bienTheId",
                table: "don_hang_chi_tiet",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "san_pham_bien_the",
                columns: table => new
                {
                    id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    sanPhamId = table.Column<int>(type: "INTEGER", nullable: false),
                    sku = table.Column<string>(type: "TEXT", maxLength: 64, nullable: false, collation: "NOCASE"),
                    kichThuoc = table.Column<string>(type: "TEXT", maxLength: 32, nullable: true),
                    mauSac = table.Column<string>(type: "TEXT", maxLength: 50, nullable: true),
                    soLuongTon = table.Column<int>(type: "INTEGER", nullable: false),
                    nguongCanhBao = table.Column<int>(type: "INTEGER", nullable: false),
                    trangThai = table.Column<string>(type: "TEXT", maxLength: 30, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_san_pham_bien_the", x => x.id);
                    table.CheckConstraint("ck_san_pham_bien_the_nguongCanhBao", "nguongCanhBao >= 0");
                    table.CheckConstraint("ck_san_pham_bien_the_soLuongTon", "soLuongTon >= 0");
                    table.CheckConstraint("ck_san_pham_bien_the_trangThai", "trangThai IN ('dang_ban', 'ngung_kinh_doanh')");
                    table.ForeignKey(
                        name: "FK_san_pham_bien_the_san_pham_sanPhamId",
                        column: x => x.sanPhamId,
                        principalTable: "san_pham",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "lich_su_ton_kho",
                columns: table => new
                {
                    id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    bienTheId = table.Column<int>(type: "INTEGER", nullable: false),
                    loai = table.Column<string>(type: "TEXT", maxLength: 30, nullable: false),
                    soLuongThayDoi = table.Column<int>(type: "INTEGER", nullable: false),
                    donHangId = table.Column<int>(type: "INTEGER", nullable: true),
                    nguoiThucHienId = table.Column<int>(type: "INTEGER", nullable: true),
                    ghiChu = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true),
                    ngayTao = table.Column<DateTime>(type: "TEXT", nullable: false, defaultValueSql: "datetime('now')")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_lich_su_ton_kho", x => x.id);
                    table.CheckConstraint("ck_lich_su_ton_kho_loai", "loai IN ('ton_dau', 'nhap_kho', 'xuat_kho', 'ban_hang', 'huy_don')");
                    table.CheckConstraint("ck_lich_su_ton_kho_soLuongThayDoi", "soLuongThayDoi <> 0");
                    table.ForeignKey(
                        name: "FK_lich_su_ton_kho_don_hang_donHangId",
                        column: x => x.donHangId,
                        principalTable: "don_hang",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_lich_su_ton_kho_san_pham_bien_the_bienTheId",
                        column: x => x.bienTheId,
                        principalTable: "san_pham_bien_the",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_lich_su_ton_kho_tai_khoan_nguoiThucHienId",
                        column: x => x.nguoiThucHienId,
                        principalTable: "tai_khoan",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateIndex(
                name: "IX_san_pham_monTheThao",
                table: "san_pham",
                column: "monTheThao");

            migrationBuilder.CreateIndex(
                name: "IX_san_pham_thuongHieu",
                table: "san_pham",
                column: "thuongHieu");

            migrationBuilder.CreateIndex(
                name: "IX_gio_hang_chi_tiet_bienTheId",
                table: "gio_hang_chi_tiet",
                column: "bienTheId");

            migrationBuilder.CreateIndex(
                name: "IX_gio_hang_chi_tiet_taiKhoanId_bienTheId",
                table: "gio_hang_chi_tiet",
                columns: new[] { "taiKhoanId", "bienTheId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_don_hang_chi_tiet_bienTheId",
                table: "don_hang_chi_tiet",
                column: "bienTheId");

            migrationBuilder.CreateIndex(
                name: "IX_lich_su_ton_kho_bienTheId_ngayTao",
                table: "lich_su_ton_kho",
                columns: new[] { "bienTheId", "ngayTao" });

            migrationBuilder.CreateIndex(
                name: "IX_lich_su_ton_kho_donHangId",
                table: "lich_su_ton_kho",
                column: "donHangId");

            migrationBuilder.CreateIndex(
                name: "IX_lich_su_ton_kho_nguoiThucHienId",
                table: "lich_su_ton_kho",
                column: "nguoiThucHienId");

            migrationBuilder.CreateIndex(
                name: "IX_san_pham_bien_the_sanPhamId",
                table: "san_pham_bien_the",
                column: "sanPhamId");

            migrationBuilder.CreateIndex(
                name: "ux_san_pham_bien_the_sku",
                table: "san_pham_bien_the",
                column: "sku",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_don_hang_chi_tiet_san_pham_bien_the_bienTheId",
                table: "don_hang_chi_tiet",
                column: "bienTheId",
                principalTable: "san_pham_bien_the",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_gio_hang_chi_tiet_san_pham_bien_the_bienTheId",
                table: "gio_hang_chi_tiet",
                column: "bienTheId",
                principalTable: "san_pham_bien_the",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.Sql("""
                INSERT INTO "san_pham_bien_the"
                    ("sanPhamId", "sku", "kichThuoc", "mauSac", "soLuongTon", "nguongCanhBao", "trangThai")
                SELECT "id", 'SP' || printf('%05d', "id") || '-STD', NULL, NULL, "soLuongTon", 5,
                    CASE WHEN "trangThai" = 'dang_ban' THEN 'dang_ban' ELSE 'ngung_kinh_doanh' END
                FROM "san_pham";

                UPDATE "gio_hang_chi_tiet"
                SET "bienTheId" = (
                    SELECT variant."id" FROM "san_pham_bien_the" AS variant
                    WHERE variant."sanPhamId" = "gio_hang_chi_tiet"."sanPhamId"
                    ORDER BY variant."id" LIMIT 1
                );

                UPDATE "don_hang_chi_tiet"
                SET "bienTheId" = (
                    SELECT variant."id" FROM "san_pham_bien_the" AS variant
                    WHERE variant."sanPhamId" = "don_hang_chi_tiet"."sanPhamId"
                    ORDER BY variant."id" LIMIT 1
                );

                INSERT INTO "lich_su_ton_kho"
                    ("bienTheId", "loai", "soLuongThayDoi", "ghiChu", "ngayTao")
                SELECT "id", 'ton_dau', "soLuongTon",
                    'Tồn đầu kỳ khi chuyển sang quản lý theo biến thể', datetime('now')
                FROM "san_pham_bien_the"
                WHERE "soLuongTon" > 0;
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_don_hang_chi_tiet_san_pham_bien_the_bienTheId",
                table: "don_hang_chi_tiet");

            migrationBuilder.DropForeignKey(
                name: "FK_gio_hang_chi_tiet_san_pham_bien_the_bienTheId",
                table: "gio_hang_chi_tiet");

            migrationBuilder.DropTable(
                name: "lich_su_ton_kho");

            migrationBuilder.DropTable(
                name: "san_pham_bien_the");

            migrationBuilder.DropIndex(
                name: "IX_san_pham_monTheThao",
                table: "san_pham");

            migrationBuilder.DropIndex(
                name: "IX_san_pham_thuongHieu",
                table: "san_pham");

            migrationBuilder.DropIndex(
                name: "IX_gio_hang_chi_tiet_bienTheId",
                table: "gio_hang_chi_tiet");

            migrationBuilder.DropIndex(
                name: "IX_gio_hang_chi_tiet_taiKhoanId_bienTheId",
                table: "gio_hang_chi_tiet");

            migrationBuilder.DropIndex(
                name: "IX_don_hang_chi_tiet_bienTheId",
                table: "don_hang_chi_tiet");

            migrationBuilder.DropColumn(
                name: "monTheThao",
                table: "san_pham");

            migrationBuilder.DropColumn(
                name: "thuongHieu",
                table: "san_pham");

            migrationBuilder.DropColumn(
                name: "bienTheId",
                table: "gio_hang_chi_tiet");

            migrationBuilder.DropColumn(
                name: "bienTheId",
                table: "don_hang_chi_tiet");

            migrationBuilder.CreateIndex(
                name: "IX_gio_hang_chi_tiet_taiKhoanId_sanPhamId",
                table: "gio_hang_chi_tiet",
                columns: new[] { "taiKhoanId", "sanPhamId" },
                unique: true);

            migrationBuilder.Sql("""
                CREATE TRIGGER IF NOT EXISTS "trg_gio_hang_unique_insert"
                BEFORE INSERT ON "gio_hang_chi_tiet"
                WHEN EXISTS (SELECT 1 FROM "gio_hang_chi_tiet"
                    WHERE "taiKhoanId" = NEW."taiKhoanId" AND "sanPhamId" = NEW."sanPhamId")
                BEGIN SELECT RAISE(ABORT, 'UX_gio_hang_taiKhoan_sanPham'); END;
                CREATE TRIGGER IF NOT EXISTS "trg_gio_hang_unique_update"
                BEFORE UPDATE OF "taiKhoanId", "sanPhamId" ON "gio_hang_chi_tiet"
                WHEN EXISTS (SELECT 1 FROM "gio_hang_chi_tiet"
                    WHERE "taiKhoanId" = NEW."taiKhoanId" AND "sanPhamId" = NEW."sanPhamId" AND "id" <> NEW."id")
                BEGIN SELECT RAISE(ABORT, 'UX_gio_hang_taiKhoan_sanPham'); END;
                """);
        }
    }
}
