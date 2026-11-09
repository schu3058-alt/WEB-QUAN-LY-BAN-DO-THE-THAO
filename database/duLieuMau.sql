-- Du lieu mau de phat trien va demo (khong dung cho moi truong production)

INSERT INTO tai_khoan (hoTen, email, matKhauMaHoa, soDienThoai, vaiTro) VALUES
  ('Quản trị viên', 'admin@sportshop.vn', '$2a$10$8K1p/a0dURXAm7QiTRqguOQ5xoQ5XZ7ZBu5F4y6bN.Xm2y9bN8m6a', '0900000000', 'quan_tri'),
  ('Nguyễn Văn A', 'khachhang1@sportshop.vn', '$2a$10$8K1p/a0dURXAm7QiTRqguOQ5xoQ5XZ7ZBu5F4y6bN.Xm2y9bN8m6a', '0901111111', 'khach_hang');

INSERT INTO danh_muc (ten, moTa, slug) VALUES
  ('Giày thể thao', 'Giày chạy bộ, giày bóng đá, giày bóng rổ', 'giay-the-thao'),
  ('Quần áo thể thao', 'Áo quần tập luyện, thi đấu', 'quan-ao-the-thao'),
  ('Dụng cụ tập luyện', 'Tạ, dây nhảy, thảm tập yoga', 'dung-cu-tap-luyen'),
  ('Bóng thể thao', 'Bóng đá, bóng rổ, bóng chuyền', 'bong-the-thao');

INSERT INTO san_pham (ten, moTa, gia, soLuongTon, danhMucId, hinhAnh) VALUES
  ('Giày chạy bộ Pro X', 'Giày chạy bộ nhẹ, đệm khí tốt', 1290000, 50, 1, NULL),
  ('Áo thun thể thao thoáng khí', 'Chất liệu polyester thoát mồ hôi', 250000, 100, 2, NULL),
  ('Tạ tay 2kg (cặp đôi)', 'Tạ tay bọc cao su, chống trượt', 180000, 60, 3, NULL),
  ('Bóng đá size 5', 'Bóng đá thi đấu tiêu chuẩn FIFA', 350000, 80, 4, NULL);

INSERT INTO khuyen_mai (ma, phanTramGiam, ngayBatDau, ngayKetThuc) VALUES
  ('CHAOMUNG10', 10, date('now'), date('now', '+30 days'));
