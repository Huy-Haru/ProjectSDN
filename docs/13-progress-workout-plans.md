# Tiến độ và giáo án của hội viên

## Phạm vi đã triển khai

PT mở Học viên & Giáo án → Ghi nhận tiến độ để lưu ngày đo, cân nặng (kg), chiều cao (cm), tỷ lệ mỡ (%) và nhận xét. Member mở Tiến độ & Thể trạng để xem lịch sử đo và toàn bộ giáo án được giao, gồm PT, thời hạn, mục tiêu, trạng thái và từng bài tập.

Không tạo chỉ số mặc định khi chưa có dữ liệu. Chỉ số không được nhập hiển thị bằng dấu —. Dữ liệu do PT ghi nhận; Member không tự sửa hoặc xóa ghi nhận của PT.

## API và quyền truy cập

| Phương thức | Đường dẫn | Quyền |
|---|---|---|
| GET | /api/trainer/members/:memberId/progress | PT đang hoạt động, có lịch chưa hủy với học viên; chỉ xem ghi nhận do chính mình tạo |
| POST | /api/trainer/members/:memberId/progress | Cùng điều kiện; tạo ghi nhận cho học viên |
| GET | /api/member/progress | Member chỉ xem ghi nhận của chính mình, từ mọi PT |
| GET | /api/trainer/member/workout-plans | Member chỉ xem giáo án giao cho chính mình |

POST nhận date dạng YYYY-MM-DD, weight, height, bodyFat, note. Ngày mặc định là hôm nay tại Việt Nam; không nhận ngày tương lai hoặc ngày không tồn tại. Các chỉ số phải là số hữu hạn, không âm; tỷ lệ mỡ tối đa 100. Phải có ít nhất một chỉ số hoặc nhận xét. Nhận xét tối đa 2000 ký tự.

Member và TrainerProfile được backend xác định từ đường dẫn và tài khoản đã xác thực. Không nhận các trường chủ sở hữu hoặc attendedSessions từ client. Học viên phải hoạt động và có ít nhất một Booking với PT ở trạng thái booked/completed/no_show; chỉ có lịch đã hủy không đủ điều kiện.

attendedSessions là số Booking hiện mang trạng thái completed, với PT này, có ngày tập không sau ngày ghi nhận. Đây là ảnh chụp khi lưu, không tự cập nhật sau các lần xác nhận buổi tập về sau. Ngày ghi nhận được lưu ở 00:00 giờ Việt Nam và hiển thị theo Asia/Ho_Chi_Minh.

## Kiểm thử

- `npm run test:progress` ở backend: cách ly dữ liệu PT/Member, quan hệ học viên, PT bị khóa, số liệu sai, ngày sai/tương lai, ghi chú đơn lẻ, chống sửa chủ sở hữu và số buổi từ client, thứ tự lịch sử.
- `npm run test:trainer` và backend 17 bài: đạt.
- Frontend lint và build: đạt.
- `PLAYWRIGHT_CHANNEL=msedge npm run test:admin:ui`: PT lưu chỉ số và tạo giáo án; Member xem chỉ số, nhận xét và bài tập. Mở lại form giáo án khởi tạo bản nháp mới. Các luồng đăng ký gói, đặt/hủy lịch và Admin cũ vẫn đạt.

Các kiểm thử tạo database ngẫu nhiên riêng và tự dọn, không ghi dữ liệu mẫu vào fitmanager. Tính năng sửa/xóa lịch sử đo và biểu đồ thể trạng chưa nằm trong đợt này; màn tổng quan và đánh giá vẫn cần nối API ở bước tiếp theo.
