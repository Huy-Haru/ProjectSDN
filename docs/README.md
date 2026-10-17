# Hồ sơ dự án FitManager

Website quản lý phòng tập và huấn luyện viên — SDN302. Phiên bản tài liệu 1.0, ngày 11/10/2026. Công nghệ: React + Vite; Node.js + Express; Mongoose; MongoDB.

## Danh mục

| Tệp | Nội dung |
| --- | --- |
| [01-project-report.md](01-project-report.md) | Báo cáo tổng thể, mục tiêu, phạm vi, kết quả và kế hoạch |
| [02-srs.md](02-srs.md) | Đặc tả yêu cầu, phân quyền, use case, tiêu chí nghiệm thu |
| [03-system-design.md](03-system-design.md) | Kiến trúc, luồng xử lý, thiết kế API và bảo mật |
| [04-database-design.md](04-database-design.md) | Từ điển dữ liệu, quan hệ, index và giới hạn schema |
| [05-setup-and-testing.md](05-setup-and-testing.md) | Chạy local, xác minh kết nối và kế hoạch kiểm thử |
| [06-mongodb-optimization.md](06-mongodb-optimization.md) | Profile ba vai trò, validation, index và migration |
| [07-work-plan-4-weeks.md](07-work-plan-4-weeks.md) | Kế hoạch 12/10–08/11/2026; Huy–Admin, Hiếu–Member, Anh–PT/Auth |
| [diagram/README.md](diagram/README.md) | Danh mục và cách mở sơ đồ draw.io |

## Cách đọc trạng thái

- **Hiện có:** xác nhận trực tiếp từ mã nguồn.
- **Yêu cầu/thiết kế:** mục tiêu cần triển khai; không phải cam kết đã chạy được.
- **Chưa kiểm chứng:** cần môi trường hoặc dữ liệu thực để xác nhận.

Tài liệu mô tả sản phẩm mục tiêu và đối chiếu với phiên bản hiện tại. Frontend nghiệp vụ vẫn dùng `mockData` và state trong trình duyệt. Backend đã có 8 model, cấu hình MongoDB và API `GET /api/health`; chưa có API đăng nhập, phân quyền hoặc CRUD nghiệp vụ. Kiểm tra kết nối trên giao diện không có nghĩa mọi chức năng đã lưu dữ liệu vào MongoDB.

## Nguồn đối chiếu

`frontend/src/App.jsx`, `frontend/src/pages/`, `frontend/src/hooks/`, `frontend/src/data/mockData.js`, `backend/src/models/`, `backend/src/constants/`, `backend/src/routes/index.js`, `backend/test/backend.test.js`.

Nhánh làm việc: `HuyNHHE190724`, tạo từ `origin/main`. Hai nhánh `origin/anhnthe194418` (backend/model) và `origin/hieunhhe187023` (frontend) đã là tổ tiên của nhánh này; kiểm tra merge trả về `Already up to date` cho cả hai. Không cần tạo commit merge rỗng.
