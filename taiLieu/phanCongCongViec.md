# 📋 PHÂN CÔNG CÔNG VIỆC DỰ ÁN SPORTSHOP (5 THÀNH VIÊN)

> **Thông tin chung:**
> - **Dự án:** Hệ thống Website Quản lý & Bán hàng Dụng cụ Thể thao (SportShop)
> - **Quy mô:** 5 thành viên
> - **Công nghệ hiện tại:** ASP.NET Core MVC (.NET 8), Entity Framework Core, SQLite, Vanilla JavaScript / HTML5 / CSS3, xUnit
> - **Backend Node.js/Express:** mã nguồn cũ còn trong `backend/modules/`; không còn là lệnh chạy mặc định của ứng dụng.

---

## 👥 BẢNG TỔNG QUAN PHÂN CÔNG VAI TRÒ

| STT | Vai trò | Thành viên phụ trách | Lĩnh vực chính |
| :---: | :--- | :--- | :--- |
| **1** | **Backend Lead & Authentication** | Thành viên 1 | Core Server, Middleware, Bảo mật, Tài khoản |
| **2** | **Backend Business Developer** | Thành viên 2 | Modules Sản phẩm, Đơn hàng, Giỏ hàng, Khuyến mãi & Tác vụ nền |
| **3** | **Frontend Client Developer** | Thành viên 3 | Giao diện Khách hàng (Trang chủ, Sản phẩm, Giỏ hàng, Thanh toán) |
| **4** | **Frontend Admin & UI/UX** | Thành viên 4 | Giao diện Quản trị (Admin Dashboard, Quản lý kho, Doanh thu) |
| **5** | **Database Architect & QA Tester** | Thành viên 5 | Cơ sở dữ liệu SQLite, Viết & thực thi bộ Kiểm thử (Automation Test) |

---

## 🛠️ CHI TIẾT NHIỆM VỤ & THƯ MỤC PHỤ TRÁCH

### 1️⃣ Thành viên 1: Backend Lead & Authentication
- **Nhiệm vụ chính:**
  - Thiết lập cấu hình hệ thống server, biến môi trường và kết nối CSDL (`backend/cauHinh/`).
  - Xây dựng hệ thống Middleware: Xác thực JWT, phân quyền RBAC, giới hạn request rate-limit, xử lý lỗi trung tâm (`backend/middleware/`).
  - Lập trình module Quản lý Tài khoản & Đăng nhập / Đăng ký (`backend/modules/taiKhoan/`).
  - Viết các hàm tiện ích dùng chung: Mã hóa mật khẩu, làm sạch HTML, định dạng phản hồi API (`backend/tienIch/`).
- **Thư mục quản lý:**
  - `backend/cauHinh/`
  - `backend/middleware/`
  - `backend/modules/taiKhoan/`
  - `backend/tienIch/`

---

### 2️⃣ Thành viên 2: Backend Business Developer
- **Nhiệm vụ chính:**
  - Lập trình logic nghiệp vụ Sản phẩm, Danh mục & Đánh giá (`backend/modules/sanPham/`, `danhMuc/`, `danhGia/`).
  - Xử lý các luồng nghiệp vụ Giỏ hàng, Đơn hàng & Thanh toán (`backend/modules/gioHang/`, `donHang/`, `thanhToan/`).
  - Phát triển module Khuyến mãi & Thông báo (`backend/modules/khuyenMai/`, `thongBao/`).
  - Lập trình các tác vụ tự động chạy ngầm: Hủy đơn hàng quá hạn, tổng hợp doanh thu theo ngày (`backend/tacVuNen/`).
- **Thư mục quản lý:**
  - `backend/modules/sanPham/`
  - `backend/modules/danhMuc/`
  - `backend/modules/danhGia/`
  - `backend/modules/gioHang/`
  - `backend/modules/donHang/`
  - `backend/modules/thanhToan/`
  - `backend/modules/khuyenMai/`
  - `backend/modules/thongBao/`
  - `backend/modules/baoCao/`
  - `backend/tacVuNen/`

---

### 3️⃣ Thành viên 3: Frontend Client Developer
- **Nhiệm vụ chính:**
  - Xây dựng giao diện Khách hàng: Trang chủ, Danh sách sản phẩm, Chi tiết sản phẩm (`frontend/trang/trangChu/`, `danhSachSanPham/`, `chiTietSanPham/`).
  - Phát triển giao diện Mua hàng: Giỏ hàng, Thanh toán, Theo dõi đơn hàng (`frontend/trang/gioHang/`, `thanhToan/`, `theoDoiDonHang/`).
  - Xây dựng trang Hồ sơ cá nhân & Đánh giá sản phẩm (`frontend/trang/taiKhoan/`, `danhGiaSanPham/`).
  - Kết nối API Backend với giao diện phía người dùng thông qua `frontend/dungChung/api.js`.
- **Thư mục quản lý:**
  - `frontend/trang/trangChu/`
  - `frontend/trang/danhSachSanPham/`
  - `frontend/trang/chiTietSanPham/`
  - `frontend/trang/gioHang/`
  - `frontend/trang/thanhToan/`
  - `frontend/trang/theoDoiDonHang/`
  - `frontend/trang/taiKhoan/`
  - `frontend/trang/danhGiaSanPham/`
  - `frontend/trang/dangNhap/`

---

### 4️⃣ Thành viên 4: Frontend Admin & UI/UX
- **Nhiệm vụ chính:**
  - Xây dựng Bảng điều khiển Quản trị viên (Admin Dashboard) (`frontend/trang/quanTri/`).
  - Xây dựng giao diện Quản lý Sản phẩm & Danh mục cho Admin (`frontend/trang/quanLySanPham/`).
  - Phát triển trang Quản lý Đơn hàng & Báo cáo Doanh thu (`frontend/trang/quanLyDonHang/`, `baoCaoDoanhThu/`).
  - Chuẩn hóa các thành phần giao diện dùng chung, định tuyến client-side và tài nguyên hình ảnh SVG (`frontend/thanhPhan/`, `dinhTuyen/`, `hinh-anh-san-pham/`).
- **Thư mục quản lý:**
  - `frontend/trang/quanTri/`
  - `frontend/trang/quanLySanPham/`
  - `frontend/trang/quanLyDonHang/`
  - `frontend/trang/baoCaoDoanhThu/`
  - `frontend/thanhPhan/`
  - `frontend/dinhTuyen/`
  - `frontend/tepGiaoDien.css`
  - `frontend/hinh-anh-san-pham/`

---

### 5️⃣ Thành viên 5: Database Architect & QA Tester
- **Nhiệm vụ chính:**
  - Thiết kế sơ đồ CSDL, khởi tạo bảng, thiết lập ràng buộc khóa ngoại & chỉ mục tìm kiếm (`database/`).
  - Viết script khởi tạo CSDL và chèn dữ liệu mẫu cho toàn bộ hệ thống (`database/duLieuMau.sql`, `themSanPhamMau.js`).
  - Viết và thực thi kiểm thử tích hợp ASP.NET Core (xUnit/TestServer) cho xác thực, phân quyền và giao dịch tồn kho (`backend/SportShop.Mvc.Tests/`).
  - Bộ Jest cũ còn tại `kiemThu/` để đối chiếu trong quá trình chuyển đổi.
- **Thư mục quản lý:**
  - `database/`
  - `kiemThu/`

---

## 📌 BẢNG TIẾN ĐỘ CÔNG VIỆC (CHECKLIST)

- [ ] **Thành viên 1:** Hoàn thiện kết nối DB, JWT Authentication & Middleware phân quyền
- [ ] **Thành viên 2:** Hoàn thiện API Sản phẩm, Đơn hàng, Giỏ hàng & Tác vụ nền
- [ ] **Thành viên 3:** Complete Giao diện người dùng (Client Web Flow)
- [ ] **Thành viên 4:** Complete Trang Quản trị Admin & Thống kê Doanh thu
- [ ] **Thành viên 5:** Đạt 100% test cases thành công (API, Security, Concurrency, Business)
