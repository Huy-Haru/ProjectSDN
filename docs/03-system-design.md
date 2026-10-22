# Thiết kế hệ thống FitManager

Cập nhật 23/10/2026 theo mã nguồn nhánh HuyNHHE190724.

## 1. Kiến trúc

React/Vite gọi Express REST JSON; Express xác thực và xử lý nghiệp vụ qua Mongoose/MongoDB local fitmanager. Trình duyệt không truy cập trực tiếp database. Frontend mặc định localhost:3000, backend localhost:5000/api. Base URL frontend cấu hình bằng VITE_API_URL; backend dùng MONGODB_URI, CORS_ORIGIN, PORT, JWT_SECRET, JWT_EXPIRES_IN.

App và các trang nghiệp vụ dùng API thật với trạng thái loading/error/empty. _id là ObjectId thật, tên người dùng là fullName, role thống nhất member/trainer/admin. Dữ liệu mẫu cũ chỉ còn ở các thành phần không dùng trong luồng chính và fixture kiểm thử modal.

## 2. Xác thực và response

Auth cấp JWT bearer HS256; request xác minh chữ ký/hết hạn rồi tải User từ database để kiểm tra isActive và role hiện tại. Không tin role tự gửi từ client. Frontend lưu token để khôi phục phiên; đăng xuất xóa token phía client. Chưa có denylist thu hồi JWT trước hạn.

Response thành công gồm success, message, data; lỗi được chuyển qua errorHandler. Mã lỗi: 400 validation, 401 xác thực, 403 quyền, 404 không tìm thấy, 409 duplicate/version/state conflict, 503 database không sẵn sàng. Lỗi bất ngờ không trả stack hoặc secret. Đổi mật khẩu đi qua document save để chạy bcrypt hook.

## 3. Endpoint hiện có

Các path bắt đầu /api. Danh sách dưới đây ghi phương thức đầy đủ, không dùng ký hiệu route đề xuất.

| Nhóm | Phương thức và path | Quyền / nội dung |
|---|---|---|
| Health | GET /health | Công khai; ping MongoDB |
| Auth | POST /auth/register; POST /auth/login | Công khai; đăng ký chỉ tạo Member |
| Auth | POST /auth/logout; GET /auth/me | Đã đăng nhập; logout trả kết quả, client xóa token |
| Profile | GET /profile/me; PATCH /profile/me; POST /profile/change-password | Tài khoản đã đăng nhập, dữ liệu của mình |
| Profile PT | PATCH /profile/trainer | PT sửa trường mở rộng được phép |
| Danh mục gói | GET /member/packages | Công khai; chỉ gói hoạt động |
| Đăng ký gói | GET /member/subscriptions; POST /member/subscriptions | Member, đúng chủ; server chốt amount/quyền lợi |
| Danh mục PT | GET /member/trainers | Member; User và TrainerProfile hoạt động |
| Lịch Member | GET /member/bookings; POST /member/bookings; POST /member/bookings/:id/cancel | Member, đúng chủ |
| Tiến độ Member | GET /member/progress | Member, chỉ log của mình |
| Đánh giá Member | GET /member/reviews; POST /member/reviews | Member, completed đã kết thúc, một Review/buổi |
| Lịch và học viên PT | GET /trainer/schedule; GET /trainer/members | PT, tài nguyên liên quan |
| Kết quả buổi tập | PATCH /trainer/bookings/:id/status | PT sở hữu, sau giờ kết thúc; completed/no_show |
| Giáo án PT | GET /trainer/workout-plans; POST /trainer/workout-plans; GET /trainer/workout-plans/:planId; PATCH /trainer/workout-plans/:planId | PT sở hữu; tạo cho học viên liên quan |
| Giáo án Member | GET /trainer/member/workout-plans | Member, chỉ giáo án giao cho mình |
| Tiến độ PT | GET /trainer/members/:memberId/progress; POST /trainer/members/:memberId/progress | PT hoạt động, quan hệ lịch chưa hủy; chỉ xem log của mình |
| Đánh giá PT | GET /trainer/reviews | PT, phản hồi dành cho mình và tổng điểm |
| Danh mục Admin | GET /admin/packages; POST /admin/packages; PATCH /admin/packages/:id | Admin; tạo/sửa/khóa |
| Tài khoản Admin | GET /admin/users; GET /admin/users/:id; POST /admin/users; PATCH /admin/users/:id | Admin; Member/PT và soft lock, không tự đổi role qua profile |
| Lịch Admin | GET /admin/bookings; PATCH /admin/bookings/:id/status | Admin; lọc và chốt kết quả/hủy theo quy tắc |
| Thanh toán Admin | GET /admin/subscriptions; POST /admin/subscriptions/:id/confirm-payment | Admin; lưu paid/paidAt/active, gọi lặp không tạo khoản thu mới |
| Báo cáo Admin | GET /admin/reports/revenue; GET /admin/dashboard | Admin; tổng hợp paid theo paidAt |

Dashboard Member/PT hiện tổng hợp các API có scope của tài khoản, không có endpoint dashboard riêng cho hai role này.

## 4. Quy tắc dữ liệu và cạnh tranh

Đăng ký gói chốt giá/thời hạn/includesPT/sessionLimit tại server, pending/unpaid; Admin xác nhận thủ công. Không có ngân hàng hoặc tự động hoàn tiền. Gói hết ngày bị từ chối dùng dù status chưa được tác vụ đổi thành expired.

Booking mới dùng ca 60 phút bắt đầu giờ tròn 08:00–21:00, ngày YYYY-MM-DD lưu UTC midnight và giờ buổi tập diễn giải tại Việt Nam. Kiểm tra cả PT/Member, gói đúng chủ paid/active và bao phủ toàn bộ buổi. Precheck giao khoảng giờ hỗ trợ lịch cũ giờ lẻ; hai partial unique indexes bảo vệ slot cố định khi ghi đồng thời.

Subscription.reservedSessions giữ quota bằng cập nhật có điều kiện nguyên tử; Booking.quotaReserved phân biệt lịch mới và lịch cũ. Lịch booked/completed/no_show chiếm buổi, cancelled giải phóng. Có bù quota khi tạo Booking thất bại. MongoDB standalone không có transaction nhiều document: không bảo đảm nguyên tử giữa counter và Booking qua dừng tiến trình/lỗi kết nối. Cần đối soát sau sự cố bằng db:quota trong chế độ bảo trì; xem [12-member-booking.md](12-member-booking.md).

bookingStatusService dùng chung cho Admin/PT; trạng thái cuối không đổi ngược, lặp cùng trạng thái trả bản hiện có. Member chỉ hủy lịch của mình trước giờ bắt đầu. PT/Admin chỉ chốt completed/no_show sau giờ kết thúc. Optimistic concurrency bảo vệ ghi đồng thời.

Giáo án dùng document save để validate cả khoảng ngày. Form sửa gửi expectedVersion và backend so __v; từ chối bản cũ với 409. Các client cũ chưa gửi expectedVersion vẫn được hỗ trợ. Tiến độ tự đếm buổi hoàn thành tại thời điểm lưu. Review suy ra chủ sở hữu từ Booking; unique booking chống đánh giá lặp, danh sách PT tổng hợp điểm từ Review thật.

## 5. Vận hành và giới hạn

Runtime kiểm tra cấu hình trước khi mở server; .env không commit. Công cụ additive indexes, backup/restore có bảo vệ và đối soát quota được mô tả trong docs/05, docs/09 và docs/12. Bộ kiểm thử backend/browser dùng database tạm riêng; CI chạy MongoDB service và Chromium Linux.

Chưa có rate limiting đăng nhập, thu hồi JWT phía server, audit log bất biến cho thanh toán, lịch rảnh PT, cổng thanh toán, scheduler hết hạn hoặc cập nhật realtime. Không ghi các phần này là đã hoàn thành. Hosting, review chéo và nghiệm thu nhóm cần biên bản riêng.
