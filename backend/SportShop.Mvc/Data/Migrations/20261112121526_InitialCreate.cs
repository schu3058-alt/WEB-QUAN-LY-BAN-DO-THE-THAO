using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SportShop.Mvc.Data.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "danh_muc",
                columns: table => new
                {
                    id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    ten = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    moTa = table.Column<string>(type: "TEXT", nullable: true),
                    slug = table.Column<string>(type: "TEXT", maxLength: 150, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_danh_muc", x => x.id);
                    table.CheckConstraint("ck_danh_muc_ten", "length(trim(ten)) > 0");
                });

            migrationBuilder.CreateTable(
                name: "khuyen_mai",
                columns: table => new
                {
                    id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    ma = table.Column<string>(type: "TEXT", maxLength: 80, nullable: false),
                    phanTramGiam = table.Column<double>(type: "REAL", nullable: false),
                    ngayBatDau = table.Column<string>(type: "TEXT", nullable: false),
                    ngayKetThuc = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_khuyen_mai", x => x.id);
                    table.CheckConstraint("ck_khuyen_mai_phanTramGiam", "phanTramGiam BETWEEN 1 AND 100");
                });

            migrationBuilder.CreateTable(
                name: "tai_khoan",
                columns: table => new
                {
                    id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    hoTen = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    email = table.Column<string>(type: "TEXT", maxLength: 254, nullable: false, collation: "NOCASE"),
                    matKhauMaHoa = table.Column<string>(type: "TEXT", nullable: false),
                    soDienThoai = table.Column<string>(type: "TEXT", maxLength: 11, nullable: true),
                    vaiTro = table.Column<string>(type: "TEXT", maxLength: 30, nullable: false),
                    ngayTao = table.Column<DateTime>(type: "TEXT", nullable: false, defaultValueSql: "datetime('now')")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tai_khoan", x => x.id);
                    table.CheckConstraint("ck_tai_khoan_vaiTro", "vaiTro IN ('khach_hang', 'quan_tri')");
                });

            migrationBuilder.CreateTable(
                name: "san_pham",
                columns: table => new
                {
                    id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    ten = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    moTa = table.Column<string>(type: "TEXT", nullable: true),
                    gia = table.Column<double>(type: "REAL", nullable: false),
                    soLuongTon = table.Column<int>(type: "INTEGER", nullable: false),
                    danhMucId = table.Column<int>(type: "INTEGER", nullable: true),
                    hinhAnh = table.Column<string>(type: "TEXT", nullable: true),
                    trangThai = table.Column<string>(type: "TEXT", maxLength: 30, nullable: false),
                    ngayTao = table.Column<DateTime>(type: "TEXT", nullable: false, defaultValueSql: "datetime('now')")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_san_pham", x => x.id);
                    table.CheckConstraint("ck_san_pham_gia", "gia >= 0");
                    table.CheckConstraint("ck_san_pham_soLuongTon", "soLuongTon >= 0");
                    table.CheckConstraint("ck_san_pham_trangThai", "trangThai IN ('dang_ban', 'ngung_kinh_doanh')");
                    table.ForeignKey(
                        name: "FK_san_pham_danh_muc_danhMucId",
                        column: x => x.danhMucId,
                        principalTable: "danh_muc",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "don_hang",
                columns: table => new
                {
                    id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    taiKhoanId = table.Column<int>(type: "INTEGER", nullable: false),
                    diaChiNhan = table.Column<string>(type: "TEXT", nullable: false),
                    soDienThoaiNhan = table.Column<string>(type: "TEXT", maxLength: 11, nullable: false),
                    ghiChu = table.Column<string>(type: "TEXT", nullable: true),
                    tongTien = table.Column<double>(type: "REAL", nullable: false),
                    trangThai = table.Column<string>(type: "TEXT", maxLength: 30, nullable: false),
                    ngayTao = table.Column<DateTime>(type: "TEXT", nullable: false, defaultValueSql: "datetime('now')")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_don_hang", x => x.id);
                    table.CheckConstraint("ck_don_hang_tongTien", "tongTien >= 0");
                    table.CheckConstraint("ck_don_hang_trangThai", "trangThai IN ('cho_xac_nhan', 'dang_giao', 'da_giao', 'da_huy')");
                    table.ForeignKey(
                        name: "FK_don_hang_tai_khoan_taiKhoanId",
                        column: x => x.taiKhoanId,
                        principalTable: "tai_khoan",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "thong_bao",
                columns: table => new
                {
                    id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    taiKhoanId = table.Column<int>(type: "INTEGER", nullable: false),
                    noiDung = table.Column<string>(type: "TEXT", nullable: false),
                    daDoc = table.Column<int>(type: "INTEGER", nullable: false),
                    ngayTao = table.Column<DateTime>(type: "TEXT", nullable: false, defaultValueSql: "datetime('now')")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_thong_bao", x => x.id);
                    table.CheckConstraint("ck_thong_bao_daDoc", "daDoc IN (0, 1)");
                    table.ForeignKey(
                        name: "FK_thong_bao_tai_khoan_taiKhoanId",
                        column: x => x.taiKhoanId,
                        principalTable: "tai_khoan",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "danh_gia",
                columns: table => new
                {
                    id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    sanPhamId = table.Column<int>(type: "INTEGER", nullable: false),
                    taiKhoanId = table.Column<int>(type: "INTEGER", nullable: false),
                    soSao = table.Column<int>(type: "INTEGER", nullable: false),
                    noiDung = table.Column<string>(type: "TEXT", nullable: true),
                    ngayTao = table.Column<DateTime>(type: "TEXT", nullable: false, defaultValueSql: "datetime('now')")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_danh_gia", x => x.id);
                    table.CheckConstraint("ck_danh_gia_soSao", "soSao BETWEEN 1 AND 5");
                    table.ForeignKey(
                        name: "FK_danh_gia_san_pham_sanPhamId",
                        column: x => x.sanPhamId,
                        principalTable: "san_pham",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_danh_gia_tai_khoan_taiKhoanId",
                        column: x => x.taiKhoanId,
                        principalTable: "tai_khoan",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "gio_hang_chi_tiet",
                columns: table => new
                {
                    id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    taiKhoanId = table.Column<int>(type: "INTEGER", nullable: false),
                    sanPhamId = table.Column<int>(type: "INTEGER", nullable: false),
                    soLuong = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_gio_hang_chi_tiet", x => x.id);
                    table.CheckConstraint("ck_gio_hang_soLuong", "soLuong > 0");
                    table.ForeignKey(
                        name: "FK_gio_hang_chi_tiet_san_pham_sanPhamId",
                        column: x => x.sanPhamId,
                        principalTable: "san_pham",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_gio_hang_chi_tiet_tai_khoan_taiKhoanId",
                        column: x => x.taiKhoanId,
                        principalTable: "tai_khoan",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "don_hang_chi_tiet",
                columns: table => new
                {
                    id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    donHangId = table.Column<int>(type: "INTEGER", nullable: false),
                    sanPhamId = table.Column<int>(type: "INTEGER", nullable: false),
                    soLuong = table.Column<int>(type: "INTEGER", nullable: false),
                    donGia = table.Column<double>(type: "REAL", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_don_hang_chi_tiet", x => x.id);
                    table.CheckConstraint("ck_don_hang_chi_tiet_donGia", "donGia >= 0");
                    table.CheckConstraint("ck_don_hang_chi_tiet_soLuong", "soLuong > 0");
                    table.ForeignKey(
                        name: "FK_don_hang_chi_tiet_don_hang_donHangId",
                        column: x => x.donHangId,
                        principalTable: "don_hang",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_don_hang_chi_tiet_san_pham_sanPhamId",
                        column: x => x.sanPhamId,
                        principalTable: "san_pham",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "thanh_toan",
                columns: table => new
                {
                    id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    donHangId = table.Column<int>(type: "INTEGER", nullable: false),
                    phuongThuc = table.Column<string>(type: "TEXT", maxLength: 30, nullable: false),
                    soTien = table.Column<double>(type: "REAL", nullable: false),
                    trangThai = table.Column<string>(type: "TEXT", maxLength: 30, nullable: false),
                    ngayTao = table.Column<DateTime>(type: "TEXT", nullable: false, defaultValueSql: "datetime('now')")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_thanh_toan", x => x.id);
                    table.CheckConstraint("ck_thanh_toan_soTien", "soTien >= 0");
                    table.CheckConstraint("ck_thanh_toan_trangThai", "trangThai IN ('cho_thanh_toan', 'da_thanh_toan', 'that_bai')");
                    table.ForeignKey(
                        name: "FK_thanh_toan_don_hang_donHangId",
                        column: x => x.donHangId,
                        principalTable: "don_hang",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_danh_gia_sanPhamId",
                table: "danh_gia",
                column: "sanPhamId");

            migrationBuilder.CreateIndex(
                name: "IX_danh_gia_taiKhoanId",
                table: "danh_gia",
                column: "taiKhoanId");

            migrationBuilder.CreateIndex(
                name: "IX_danh_muc_slug",
                table: "danh_muc",
                column: "slug",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_don_hang_taiKhoanId",
                table: "don_hang",
                column: "taiKhoanId");

            migrationBuilder.CreateIndex(
                name: "IX_don_hang_chi_tiet_donHangId",
                table: "don_hang_chi_tiet",
                column: "donHangId");

            migrationBuilder.CreateIndex(
                name: "IX_don_hang_chi_tiet_sanPhamId",
                table: "don_hang_chi_tiet",
                column: "sanPhamId");

            migrationBuilder.CreateIndex(
                name: "IX_gio_hang_chi_tiet_sanPhamId",
                table: "gio_hang_chi_tiet",
                column: "sanPhamId");

            migrationBuilder.CreateIndex(
                name: "IX_gio_hang_chi_tiet_taiKhoanId_sanPhamId",
                table: "gio_hang_chi_tiet",
                columns: new[] { "taiKhoanId", "sanPhamId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_khuyen_mai_ma",
                table: "khuyen_mai",
                column: "ma",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_san_pham_danhMucId",
                table: "san_pham",
                column: "danhMucId");

            migrationBuilder.CreateIndex(
                name: "ux_tai_khoan_email",
                table: "tai_khoan",
                column: "email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_thanh_toan_donHangId",
                table: "thanh_toan",
                column: "donHangId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_thong_bao_taiKhoanId",
                table: "thong_bao",
                column: "taiKhoanId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "danh_gia");

            migrationBuilder.DropTable(
                name: "don_hang_chi_tiet");

            migrationBuilder.DropTable(
                name: "gio_hang_chi_tiet");

            migrationBuilder.DropTable(
                name: "khuyen_mai");

            migrationBuilder.DropTable(
                name: "thanh_toan");

            migrationBuilder.DropTable(
                name: "thong_bao");

            migrationBuilder.DropTable(
                name: "san_pham");

            migrationBuilder.DropTable(
                name: "don_hang");

            migrationBuilder.DropTable(
                name: "danh_muc");

            migrationBuilder.DropTable(
                name: "tai_khoan");
        }
    }
}
