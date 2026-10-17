# Phân tích và thiết kế hệ thống

## 1. Kiến trúc

Browser → React/Vite → REST API Express → controller → service → Mongoose model → MongoDB. Middleware xác thực/phân quyền/validation là thiết kế mục tiêu; hiện mới có CORS, JSON parsing, xử lý lỗi và health route.

React chịu trách nhiệm hiển thị và tương tác. Express kiểm tra dữ liệu và quyền trước khi gọi service. Service xử lý hiệu lực gói, xung đột lịch và doanh thu. Mongoose mô tả schema và index. MongoDB là nguồn dữ liệu bền vững. Secret chỉ nằm ở backend.

`context.drawio` thể hiện tác nhân ngoài hệ thống; `database.drawio` thể hiện cấu trúc lưu trữ, không đưa MongoDB thành một người dùng nghiệp vụ.

## 2. Hiện trạng tích hợp

Frontend đã có `services/api.js` và `ConnectionStatus` gọi GET /api/health. Backend ping MongoDB trước khi trả trạng thái thành công. Đây là luồng kiểm tra kết nối ba tầng. Các trang nghiệp vụ vẫn dùng dữ liệu mẫu; không tự fallback sang mock để giả lập lưu thành công khi API lỗi.

User trong frontend hiện có tên trường và role khác schema; mỗi API cần DTO mapping. Ví dụ `User.fullName` → tên hiển thị; `_id` → id; role member/trainer/admin → vai trò UI tương ứng. Không dùng ObjectId giả từ mockData khi ghi database.

## 3. Module mục tiêu

| Module | Trách nhiệm | Model |
| --- | --- | --- |
| Auth/User | Tài khoản, phiên, phân quyền, khóa tài khoản | User |
| Catalog | Gói tập và hồ sơ PT | MembershipPackage, TrainerProfile |
| Subscription | Đăng ký gói, xác nhận thanh toán, hiệu lực | Subscription |
| Booking | Đặt/hủy/hoàn thành lịch và xung đột | Booking |
| Training | Giáo án và tiến độ | WorkoutPlan, ProgressLog |
| Review | Đánh giá và điểm tổng hợp | Review, TrainerProfile |
| Reporting | Dashboard và doanh thu | Các model trên |

## 4. API hiện có

| Method/path | Hành vi |
| --- | --- |
| GET / | Trả thông báo chào |
| GET /api/health | 200 nếu MongoDB connected và ping thành công; 503 nếu unavailable |

Thành công: `{ "success": true, "message": "Success", "data": {} }`. Lỗi: `{ "success": false, "message": "Error message" }`. Route không có trả 404, JSON sai trả 400, body > 1 MB trả 413; lỗi nội bộ trả thông báo chung.

## 5. Hợp đồng API đề xuất — chưa triển khai

| Method/path | Quyền | Ghi chú |
| --- | --- | --- |
| POST /api/auth/register | Khách | Whitelist fullName,email,password,phone; role luôn member |
| POST /api/auth/login | Khách | Kiểm tra active và mật khẩu |
| POST /api/auth/logout | Đã đăng nhập | Thu hồi phiên theo cơ chế chọn |
| GET /api/auth/me | Đã đăng nhập | User an toàn, không password |
| PATCH /api/users/me | Member/PT/Admin | Profile chung của mình, whitelist; không đổi role/isActive/password |
| GET /api/packages | Công khai | Chỉ active; phân trang |
| POST/PATCH /api/packages[/:id] | Admin | Tạo/cập nhật/khóa |
| GET /api/trainers | Công khai | Profile populate User với trường an toàn |
| POST/PATCH /api/trainers[/:id] | Admin | Kiểm tra User role trainer |
| GET/PATCH /api/users[/:id] | Admin | Quản lý tài khoản |
| POST /api/subscriptions | Member | Lấy member từ phiên, chốt giá tại server |
| GET /api/subscriptions/me | Member | Chỉ đăng ký của mình |
| PATCH /api/subscriptions/:id/payment | Admin | Xác nhận paid; đã có paidAt; cần audit |
| GET /api/bookings | Đã đăng nhập | Lọc theo quyền và khoảng ngày |
| POST /api/bookings | Member | Kiểm tra gói và khoảng giờ |
| PATCH /api/bookings/:id/cancel | Owner/Admin | Cập nhật trạng thái, không delete |
| PATCH /api/bookings/:id/status | PT liên quan/Admin | completed/no_show theo state machine |
| GET/POST/PATCH /api/workout-plans[/:id] | Owner xem; PT liên quan ghi | Validate items và khoảng ngày |
| GET/POST /api/progress-logs | Owner xem; PT liên quan ghi | Không công khai chỉ số cơ thể |
| GET/POST /api/reviews | Xem theo chính sách; member ghi | Booking completed và chưa có Review |
| GET /api/reports/revenue | Admin | Paid only; phân kỳ theo paidAt |

Ký hiệu `[/:id]` là cách rút gọn trong tài liệu; router thực phải đăng ký riêng từng path. Mã lỗi mục tiêu: 400 dữ liệu lỗi, 401 chưa xác thực, 403 thiếu quyền, 404 không tìm thấy, 409 trùng/xung đột, 503 database không sẵn sàng.

## 6. Luồng đặt lịch và cạnh tranh

1. Lấy User từ phiên; không tin member gửi trong body.
2. Kiểm tra PT active, Subscription đúng chủ, active/paid và bao phủ ngày hẹn.
3. Chuẩn hóa ngày theo múi giờ nghiệp vụ; kiểm tra HH:mm, start < end và thời gian tương lai.
4. Kiểm tra giao nhau của mọi booking booked/completed có liên quan cho PT và hội viên.
5. Kiểm tra số buổi có thể sử dụng theo chính sách.
6. Lưu booking và trả kết quả; lỗi unique phải chuyển thành 409.

Query kiểm tra trước rồi insert riêng lẻ không đảm bảo an toàn khi hai request đồng thời. Cần chọn cơ chế slot cố định với khóa unique, hoặc document lịch theo PT/ngày được cập nhật nguyên tử/khóa và transaction phù hợp. Partial unique index hiện tại chỉ chặn cùng startTime, không chặn 09:00–10:00 với 09:30–10:30. MongoDB standalone local không hỗ trợ transaction nhiều document; muốn dùng transaction phải cấu hình replica set. Đây là quyết định thiết kế chưa triển khai.

## 7. Trạng thái

- Subscription: pending → active khi thanh toán và ngày hợp lệ; active → expired khi quá hạn; pending/active → cancelled theo chính sách.
- Payment: unpaid → paid bởi admin. Hoàn tiền chưa có trạng thái/model.
- Booking: booked → completed, cancelled hoặc no_show; không chuyển ngược trạng thái kết thúc.
- WorkoutPlan: active → completed hoặc cancelled.

Enum chỉ giới hạn giá trị, không tự bảo vệ các phép chuyển trạng thái. Service phải kiểm tra trạng thái cũ và xử lý lặp idempotent.

## 8. Bảo mật và vận hành mục tiêu

Chọn phiên cookie HttpOnly/Secure/SameSite hoặc access token với vòng đời và thu hồi rõ ràng. Nếu dùng cookie, bổ sung bảo vệ CSRF và cấu hình credentials phù hợp. Không nhận role, amount, ratingAverage từ public body. Query phải whitelist trường để tránh mass assignment. Validate ObjectId trước query và chuyển lỗi validation/duplicate thành phản hồi rõ ràng.

Mật khẩu hash bằng bcrypt hook `save`; update trực tiếp password qua findOneAndUpdate sẽ không chạy hook này, nên luồng đổi mật khẩu phải xử lý riêng. `.env` không commit. CORS origin cấu hình cụ thể. Thêm rate limit đăng nhập, log hành động admin và sao lưu là yêu cầu triển khai tiếp.

## 9. Bất đồng hiện có cần giải quyết

Frontend có thao tác hội viên tự hoàn thành buổi và hủy bằng cách loại lịch khỏi state, trong khi thiết kế giao quyền hoàn thành cho PT/admin và giữ lịch sử hủy. UI hiển thị chu kỳ tháng/năm nhưng MembershipPackage chỉ có một price và durationDays; cần thống nhất danh mục gói hoặc mở rộng pricing trước khi tích hợp thanh toán. Schema có paidAt nhưng chưa có lịch rảnh PT, phân công hội viên bền vững và model giao dịch thu tiền; không mô tả những phần này là đã triển khai.
