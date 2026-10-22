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
| [09-admin-release-checklist.md](09-admin-release-checklist.md) | Đối chiếu H1–H4, release gate, sao lưu/khôi phục đã thử và CI |
| [10-admin-browser-uat.md](10-admin-browser-uat.md) | Bộ kiểm thử trình duyệt Admin chạy lại được, database tạm và CI browser |
| [11-frontend-quality.md](11-frontend-quality.md) | Full lint, vòng đời form/profile và regression phản hồi lọc cũ |
| [08-admin-implementation.md](08-admin-implementation.md) | Phần Admin đã triển khai, API, kiểm thử và hướng dẫn vận hành |
| [diagram/README.md](diagram/README.md) | Danh mục và cách mở sơ đồ draw.io |

## Cách đọc trạng thái

- **Hiện có:** xác nhận trực tiếp từ mã nguồn.
- **Yêu cầu/thiết kế:** mục tiêu cần triển khai; không phải cam kết đã chạy được.
- **Chưa kiểm chứng:** cần môi trường hoặc dữ liệu thực để xác nhận.

Tài liệu ban đầu ngày 11/10 ghi hiện trạng tại thời điểm đó. Cập nhật 23/10: đã tích hợp Auth/profile/PT từ nhánh Anh và triển khai Admin dùng API/MongoDB thật. Các màn hình Member còn dùng dữ liệu mẫu ở những phần chưa tích hợp. Chi tiết mới nhất và giới hạn nằm trong [phần Admin](08-admin-implementation.md); các trạng thái “chưa có API” của hồ sơ ban đầu là mốc lịch sử.

## Nguồn đối chiếu

`frontend/src/App.jsx`, `frontend/src/pages/`, `frontend/src/hooks/`, `frontend/src/data/mockData.js`, `backend/src/models/`, `backend/src/constants/`, `backend/src/routes/index.js`, `backend/test/backend.test.js`.

Nhánh làm việc: `HuyNHHE190724`, tạo từ `origin/main`. Hai nhánh `origin/anhnthe194418` (backend/model) và `origin/hieunhhe187023` (frontend) đã là tổ tiên của nhánh này; kiểm tra merge trả về `Already up to date` cho cả hai. Không cần tạo commit merge rỗng.

## Luồng Member/PT đã nối thêm

- [12-member-booking.md](12-member-booking.md): đặt/hủy lịch, hạn mức và đối soát.
- [13-progress-workout-plans.md](13-progress-workout-plans.md): PT ghi tiến độ, Member xem thể trạng và giáo án.
- Danh mục gói, đăng ký gói và lịch sử đăng ký cũng đã dùng API thật. Màn tổng quan, danh sách PT riêng và đánh giá còn phần dữ liệu mẫu; xem verification.md để biết kết quả kiểm chứng từng đợt.

## Cập nhật đánh giá và tổng quan

[14-reviews-live-dashboards.md](14-reviews-live-dashboards.md) mô tả luồng đánh giá buổi hoàn thành, danh sách PT thật và hai màn tổng quan Member/PT. Các trang chính hiện đã dùng API, thay cho dữ liệu mẫu được ghi trong những mốc lịch sử trước đó. Xem verification.md để đối chiếu kiểm thử từng đợt và giới hạn triển khai.
