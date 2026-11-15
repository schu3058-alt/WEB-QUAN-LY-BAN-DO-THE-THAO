using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SportShop.Mvc.Data.Migrations
{
    /// <inheritdoc />
    public partial class LegacySchemaConstraints : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("CREATE INDEX IF NOT EXISTS \"IX_danh_gia_taiKhoanId\" ON \"danh_gia\" (\"taiKhoanId\");");
            migrationBuilder.Sql("CREATE INDEX IF NOT EXISTS \"IX_don_hang_chi_tiet_sanPhamId\" ON \"don_hang_chi_tiet\" (\"sanPhamId\");");
            migrationBuilder.Sql("CREATE INDEX IF NOT EXISTS \"IX_gio_hang_chi_tiet_sanPhamId\" ON \"gio_hang_chi_tiet\" (\"sanPhamId\");");
            migrationBuilder.Sql("CREATE INDEX IF NOT EXISTS \"idx_san_pham_trangThai\" ON \"san_pham\" (\"trangThai\");");
            migrationBuilder.Sql("CREATE INDEX IF NOT EXISTS \"idx_san_pham_ten\" ON \"san_pham\" (\"ten\");");
            migrationBuilder.Sql("CREATE INDEX IF NOT EXISTS \"idx_don_hang_trangThai\" ON \"don_hang\" (\"trangThai\");");

            migrationBuilder.Sql("""
                CREATE TRIGGER IF NOT EXISTS "trg_tai_khoan_vaiTro_insert"
                BEFORE INSERT ON "tai_khoan"
                WHEN NEW."vaiTro" NOT IN ('khach_hang', 'quan_tri')
                BEGIN SELECT RAISE(ABORT, 'ck_tai_khoan_vaiTro'); END;
                """);
            migrationBuilder.Sql("""
                CREATE TRIGGER IF NOT EXISTS "trg_tai_khoan_vaiTro_update"
                BEFORE UPDATE OF "vaiTro" ON "tai_khoan"
                WHEN NEW."vaiTro" NOT IN ('khach_hang', 'quan_tri')
                BEGIN SELECT RAISE(ABORT, 'ck_tai_khoan_vaiTro'); END;
                """);
            migrationBuilder.Sql("""
                CREATE TRIGGER IF NOT EXISTS "trg_tai_khoan_email_insert"
                BEFORE INSERT ON "tai_khoan"
                WHEN EXISTS (SELECT 1 FROM "tai_khoan" WHERE "email" = NEW."email" COLLATE NOCASE)
                BEGIN SELECT RAISE(ABORT, 'ux_tai_khoan_email'); END;
                """);
            migrationBuilder.Sql("""
                CREATE TRIGGER IF NOT EXISTS "trg_tai_khoan_email_update"
                BEFORE UPDATE OF "email" ON "tai_khoan"
                WHEN EXISTS (SELECT 1 FROM "tai_khoan" WHERE "email" = NEW."email" COLLATE NOCASE AND "id" <> NEW."id")
                BEGIN SELECT RAISE(ABORT, 'ux_tai_khoan_email'); END;
                """);

            migrationBuilder.Sql("""
                CREATE TRIGGER IF NOT EXISTS "trg_danh_muc_ten_insert"
                BEFORE INSERT ON "danh_muc"
                WHEN length(trim(NEW."ten")) = 0
                BEGIN SELECT RAISE(ABORT, 'ck_danh_muc_ten'); END;
                """);
            migrationBuilder.Sql("""
                CREATE TRIGGER IF NOT EXISTS "trg_danh_muc_ten_update"
                BEFORE UPDATE OF "ten" ON "danh_muc"
                WHEN length(trim(NEW."ten")) = 0
                BEGIN SELECT RAISE(ABORT, 'ck_danh_muc_ten'); END;
                """);
            migrationBuilder.Sql("""
                CREATE TRIGGER IF NOT EXISTS "trg_danh_muc_slug_insert"
                BEFORE INSERT ON "danh_muc"
                WHEN EXISTS (SELECT 1 FROM "danh_muc" WHERE "slug" = NEW."slug")
                BEGIN SELECT RAISE(ABORT, 'UX_danh_muc_slug'); END;
                """);
            migrationBuilder.Sql("""
                CREATE TRIGGER IF NOT EXISTS "trg_danh_muc_slug_update"
                BEFORE UPDATE OF "slug" ON "danh_muc"
                WHEN EXISTS (SELECT 1 FROM "danh_muc" WHERE "slug" = NEW."slug" AND "id" <> NEW."id")
                BEGIN SELECT RAISE(ABORT, 'UX_danh_muc_slug'); END;
                """);

            migrationBuilder.Sql("""
                CREATE TRIGGER IF NOT EXISTS "trg_san_pham_check_insert"
                BEFORE INSERT ON "san_pham"
                WHEN NEW."gia" < 0 OR NEW."soLuongTon" < 0 OR NEW."trangThai" NOT IN ('dang_ban', 'ngung_kinh_doanh')
                BEGIN SELECT RAISE(ABORT, 'ck_san_pham'); END;
                """);
            migrationBuilder.Sql("""
                CREATE TRIGGER IF NOT EXISTS "trg_san_pham_check_update"
                BEFORE UPDATE OF "gia", "soLuongTon", "trangThai" ON "san_pham"
                WHEN NEW."gia" < 0 OR NEW."soLuongTon" < 0 OR NEW."trangThai" NOT IN ('dang_ban', 'ngung_kinh_doanh')
                BEGIN SELECT RAISE(ABORT, 'ck_san_pham'); END;
                """);

            migrationBuilder.Sql("""
                CREATE TRIGGER IF NOT EXISTS "trg_gio_hang_soLuong_insert"
                BEFORE INSERT ON "gio_hang_chi_tiet"
                WHEN NEW."soLuong" <= 0
                BEGIN SELECT RAISE(ABORT, 'ck_gio_hang_soLuong'); END;
                """);
            migrationBuilder.Sql("""
                CREATE TRIGGER IF NOT EXISTS "trg_gio_hang_soLuong_update"
                BEFORE UPDATE OF "soLuong" ON "gio_hang_chi_tiet"
                WHEN NEW."soLuong" <= 0
                BEGIN SELECT RAISE(ABORT, 'ck_gio_hang_soLuong'); END;
                """);
            migrationBuilder.Sql("""
                CREATE TRIGGER IF NOT EXISTS "trg_gio_hang_unique_insert"
                BEFORE INSERT ON "gio_hang_chi_tiet"
                WHEN EXISTS (SELECT 1 FROM "gio_hang_chi_tiet"
                    WHERE "taiKhoanId" = NEW."taiKhoanId" AND "sanPhamId" = NEW."sanPhamId")
                BEGIN SELECT RAISE(ABORT, 'UX_gio_hang_taiKhoan_sanPham'); END;
                """);
            migrationBuilder.Sql("""
                CREATE TRIGGER IF NOT EXISTS "trg_gio_hang_unique_update"
                BEFORE UPDATE OF "taiKhoanId", "sanPhamId" ON "gio_hang_chi_tiet"
                WHEN EXISTS (SELECT 1 FROM "gio_hang_chi_tiet"
                    WHERE "taiKhoanId" = NEW."taiKhoanId" AND "sanPhamId" = NEW."sanPhamId" AND "id" <> NEW."id")
                BEGIN SELECT RAISE(ABORT, 'UX_gio_hang_taiKhoan_sanPham'); END;
                """);

            migrationBuilder.Sql("""
                CREATE TRIGGER IF NOT EXISTS "trg_don_hang_check_insert"
                BEFORE INSERT ON "don_hang"
                WHEN NEW."tongTien" < 0 OR NEW."trangThai" NOT IN ('cho_xac_nhan', 'dang_giao', 'da_giao', 'da_huy')
                BEGIN SELECT RAISE(ABORT, 'ck_don_hang'); END;
                """);
            migrationBuilder.Sql("""
                CREATE TRIGGER IF NOT EXISTS "trg_don_hang_check_update"
                BEFORE UPDATE OF "tongTien", "trangThai" ON "don_hang"
                WHEN NEW."tongTien" < 0 OR NEW."trangThai" NOT IN ('cho_xac_nhan', 'dang_giao', 'da_giao', 'da_huy')
                BEGIN SELECT RAISE(ABORT, 'ck_don_hang'); END;
                """);

            migrationBuilder.Sql("""
                CREATE TRIGGER IF NOT EXISTS "trg_don_hang_chi_tiet_check_insert"
                BEFORE INSERT ON "don_hang_chi_tiet"
                WHEN NEW."soLuong" <= 0 OR NEW."donGia" < 0
                BEGIN SELECT RAISE(ABORT, 'ck_don_hang_chi_tiet'); END;
                """);
            migrationBuilder.Sql("""
                CREATE TRIGGER IF NOT EXISTS "trg_don_hang_chi_tiet_check_update"
                BEFORE UPDATE OF "soLuong", "donGia" ON "don_hang_chi_tiet"
                WHEN NEW."soLuong" <= 0 OR NEW."donGia" < 0
                BEGIN SELECT RAISE(ABORT, 'ck_don_hang_chi_tiet'); END;
                """);

            migrationBuilder.Sql("""
                CREATE TRIGGER IF NOT EXISTS "trg_thanh_toan_check_insert"
                BEFORE INSERT ON "thanh_toan"
                WHEN NEW."soTien" < 0 OR NEW."trangThai" NOT IN ('cho_thanh_toan', 'da_thanh_toan', 'that_bai')
                BEGIN SELECT RAISE(ABORT, 'ck_thanh_toan'); END;
                """);
            migrationBuilder.Sql("""
                CREATE TRIGGER IF NOT EXISTS "trg_thanh_toan_check_update"
                BEFORE UPDATE OF "soTien", "trangThai" ON "thanh_toan"
                WHEN NEW."soTien" < 0 OR NEW."trangThai" NOT IN ('cho_thanh_toan', 'da_thanh_toan', 'that_bai')
                BEGIN SELECT RAISE(ABORT, 'ck_thanh_toan'); END;
                """);
            migrationBuilder.Sql("""
                CREATE TRIGGER IF NOT EXISTS "trg_thanh_toan_unique_insert"
                BEFORE INSERT ON "thanh_toan"
                WHEN EXISTS (SELECT 1 FROM "thanh_toan" WHERE "donHangId" = NEW."donHangId")
                BEGIN SELECT RAISE(ABORT, 'UX_thanh_toan_donHangId'); END;
                """);
            migrationBuilder.Sql("""
                CREATE TRIGGER IF NOT EXISTS "trg_thanh_toan_unique_update"
                BEFORE UPDATE OF "donHangId" ON "thanh_toan"
                WHEN EXISTS (SELECT 1 FROM "thanh_toan" WHERE "donHangId" = NEW."donHangId" AND "id" <> NEW."id")
                BEGIN SELECT RAISE(ABORT, 'UX_thanh_toan_donHangId'); END;
                """);

            migrationBuilder.Sql("""
                CREATE TRIGGER IF NOT EXISTS "trg_danh_gia_soSao_insert"
                BEFORE INSERT ON "danh_gia"
                WHEN NEW."soSao" NOT BETWEEN 1 AND 5
                BEGIN SELECT RAISE(ABORT, 'ck_danh_gia_soSao'); END;
                """);
            migrationBuilder.Sql("""
                CREATE TRIGGER IF NOT EXISTS "trg_danh_gia_soSao_update"
                BEFORE UPDATE OF "soSao" ON "danh_gia"
                WHEN NEW."soSao" NOT BETWEEN 1 AND 5
                BEGIN SELECT RAISE(ABORT, 'ck_danh_gia_soSao'); END;
                """);

            migrationBuilder.Sql("""
                CREATE TRIGGER IF NOT EXISTS "trg_khuyen_mai_check_insert"
                BEFORE INSERT ON "khuyen_mai"
                WHEN NEW."phanTramGiam" NOT BETWEEN 1 AND 100
                BEGIN SELECT RAISE(ABORT, 'ck_khuyen_mai_phanTramGiam'); END;
                """);
            migrationBuilder.Sql("""
                CREATE TRIGGER IF NOT EXISTS "trg_khuyen_mai_check_update"
                BEFORE UPDATE OF "phanTramGiam" ON "khuyen_mai"
                WHEN NEW."phanTramGiam" NOT BETWEEN 1 AND 100
                BEGIN SELECT RAISE(ABORT, 'ck_khuyen_mai_phanTramGiam'); END;
                """);
            migrationBuilder.Sql("""
                CREATE TRIGGER IF NOT EXISTS "trg_khuyen_mai_unique_insert"
                BEFORE INSERT ON "khuyen_mai"
                WHEN EXISTS (SELECT 1 FROM "khuyen_mai" WHERE "ma" = NEW."ma")
                BEGIN SELECT RAISE(ABORT, 'UX_khuyen_mai_ma'); END;
                """);
            migrationBuilder.Sql("""
                CREATE TRIGGER IF NOT EXISTS "trg_khuyen_mai_unique_update"
                BEFORE UPDATE OF "ma" ON "khuyen_mai"
                WHEN EXISTS (SELECT 1 FROM "khuyen_mai" WHERE "ma" = NEW."ma" AND "id" <> NEW."id")
                BEGIN SELECT RAISE(ABORT, 'UX_khuyen_mai_ma'); END;
                """);

            migrationBuilder.Sql("""
                CREATE TRIGGER IF NOT EXISTS "trg_thong_bao_daDoc_insert"
                BEFORE INSERT ON "thong_bao"
                WHEN NEW."daDoc" NOT IN (0, 1)
                BEGIN SELECT RAISE(ABORT, 'ck_thong_bao_daDoc'); END;
                """);
            migrationBuilder.Sql("""
                CREATE TRIGGER IF NOT EXISTS "trg_thong_bao_daDoc_update"
                BEFORE UPDATE OF "daDoc" ON "thong_bao"
                WHEN NEW."daDoc" NOT IN (0, 1)
                BEGIN SELECT RAISE(ABORT, 'ck_thong_bao_daDoc'); END;
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("DROP TRIGGER IF EXISTS \"trg_thong_bao_daDoc_update\";");
            migrationBuilder.Sql("DROP TRIGGER IF EXISTS \"trg_thong_bao_daDoc_insert\";");
            migrationBuilder.Sql("DROP TRIGGER IF EXISTS \"trg_khuyen_mai_unique_update\";");
            migrationBuilder.Sql("DROP TRIGGER IF EXISTS \"trg_khuyen_mai_unique_insert\";");
            migrationBuilder.Sql("DROP TRIGGER IF EXISTS \"trg_khuyen_mai_check_update\";");
            migrationBuilder.Sql("DROP TRIGGER IF EXISTS \"trg_khuyen_mai_check_insert\";");
            migrationBuilder.Sql("DROP TRIGGER IF EXISTS \"trg_danh_gia_soSao_update\";");
            migrationBuilder.Sql("DROP TRIGGER IF EXISTS \"trg_danh_gia_soSao_insert\";");
            migrationBuilder.Sql("DROP TRIGGER IF EXISTS \"trg_thanh_toan_unique_update\";");
            migrationBuilder.Sql("DROP TRIGGER IF EXISTS \"trg_thanh_toan_unique_insert\";");
            migrationBuilder.Sql("DROP TRIGGER IF EXISTS \"trg_thanh_toan_check_update\";");
            migrationBuilder.Sql("DROP TRIGGER IF EXISTS \"trg_thanh_toan_check_insert\";");
            migrationBuilder.Sql("DROP TRIGGER IF EXISTS \"trg_don_hang_chi_tiet_check_update\";");
            migrationBuilder.Sql("DROP TRIGGER IF EXISTS \"trg_don_hang_chi_tiet_check_insert\";");
            migrationBuilder.Sql("DROP TRIGGER IF EXISTS \"trg_don_hang_check_update\";");
            migrationBuilder.Sql("DROP TRIGGER IF EXISTS \"trg_don_hang_check_insert\";");
            migrationBuilder.Sql("DROP TRIGGER IF EXISTS \"trg_gio_hang_unique_update\";");
            migrationBuilder.Sql("DROP TRIGGER IF EXISTS \"trg_gio_hang_unique_insert\";");
            migrationBuilder.Sql("DROP TRIGGER IF EXISTS \"trg_gio_hang_soLuong_update\";");
            migrationBuilder.Sql("DROP TRIGGER IF EXISTS \"trg_gio_hang_soLuong_insert\";");
            migrationBuilder.Sql("DROP TRIGGER IF EXISTS \"trg_san_pham_check_update\";");
            migrationBuilder.Sql("DROP TRIGGER IF EXISTS \"trg_san_pham_check_insert\";");
            migrationBuilder.Sql("DROP TRIGGER IF EXISTS \"trg_danh_muc_slug_update\";");
            migrationBuilder.Sql("DROP TRIGGER IF EXISTS \"trg_danh_muc_slug_insert\";");
            migrationBuilder.Sql("DROP TRIGGER IF EXISTS \"trg_danh_muc_ten_update\";");
            migrationBuilder.Sql("DROP TRIGGER IF EXISTS \"trg_danh_muc_ten_insert\";");
            migrationBuilder.Sql("DROP TRIGGER IF EXISTS \"trg_tai_khoan_email_update\";");
            migrationBuilder.Sql("DROP TRIGGER IF EXISTS \"trg_tai_khoan_email_insert\";");
            migrationBuilder.Sql("DROP TRIGGER IF EXISTS \"trg_tai_khoan_vaiTro_update\";");
            migrationBuilder.Sql("DROP TRIGGER IF EXISTS \"trg_tai_khoan_vaiTro_insert\";");
        }
    }
}
