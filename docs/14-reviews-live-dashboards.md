# Đánh giá PT và tổng quan dữ liệu thật

## Luồng đánh giá

Member mở Đánh giá HLV, chọn buổi tập đã hoàn thành và kết thúc theo giờ Việt Nam, chọn 1–5 sao nguyên và nhập nhận xét tùy chọn (tối đa 2000 ký tự). Mỗi Booking chỉ có một Review, được bảo vệ bằng unique index ngay cả khi hai yêu cầu đến đồng thời.

Member chỉ xem đánh giá của mình; PT mở Đánh giá từ Học viên để xem phản hồi dành cho chính mình. Tên học viên được hiển thị, không trả email hoặc số điện thoại trong danh sách đánh giá của PT. Chưa có chức năng sửa/xóa đánh giá trong đợt này.

Backend tự lấy member và trainer từ Booking. Không nhận các trường chủ sở hữu từ client. Lịch booked, cancelled, no_show, lịch của người khác và buổi chưa kết thúc không đủ điều kiện. Nếu một buổi đã được đánh giá, nó không xuất hiện trong lựa chọn gửi đánh giá nữa.

| Phương thức | API | Quyền và dữ liệu |
|---|---|---|
| GET | /api/member/reviews | Member: reviews riêng và eligible (buổi chưa đánh giá) |
| POST | /api/member/reviews | Member: bookingId, rating, comment |
| GET | /api/trainer/reviews | PT: reviews dành cho mình và summary count/average |

Danh sách PT đang hoạt động dùng API thật. Điểm sao và số lượt đánh giá được tổng hợp trực tiếp từ Review, tránh hiển thị cache cũ khi các cập nhật đồng thời. Chọn Đặt lịch với PT này sẽ chuyển sang form đặt lịch có PT đã chọn sẵn. API danh sách PT hiện yêu cầu đăng nhập Member.

## Tổng quan

- Member: số gói đã thanh toán và đang có hiệu lực, lịch sắp tới, số buổi hoàn thành, buổi kế tiếp, chỉ số PT ghi nhận gần nhất và điều hướng sang lịch/tiến độ.
- PT: số học viên từng đặt lịch, số buổi sắp dạy/đã hoàn thành, đánh giá trung bình và tối đa năm buổi sắp tới.
- Các màn dùng API theo quyền của tài khoản hiện tại, có trạng thái tải, lỗi/thử lại và dữ liệu trống; không thay lỗi kết nối bằng số liệu mẫu.
- Thời hạn gói, lịch tương lai được xét khi tải màn hình. Thời gian buổi tập theo giờ Việt Nam. Số liệu cập nhật khi vào lại hoặc tải lại màn hình, chưa có cập nhật realtime.

App và các trang trong frontend/src/pages không còn import mockData/useSchedule/useProgress. Các form mẫu cũ còn được giữ làm fixture kiểm thử vòng đời modal, không còn là luồng gửi đánh giá trong App.

## Kiểm chứng

- Backend `npm run test:review`: quyền sở hữu/role, trạng thái và thời điểm buổi tập, dữ liệu sai, hai yêu cầu gửi trùng, thông tin thành viên giới hạn, tổng điểm chính xác kể cả cache bị lệch.
- Backend `test:booking`, `test:progress`, bộ 17 bài kiểm thử nền: đạt.
- Frontend lint và production build: đạt.
- Edge UAT: Member đánh giá buổi được Admin xác nhận hoàn thành → tải lại vẫn thấy đánh giá → danh sách PT hiển thị điểm → PT xem phản hồi và tổng điểm. Kiểm tra số buổi hoàn thành, thể trạng và điểm sao trên tổng quan Member/PT. Các luồng cũ vẫn đạt.

Các kiểm thử dùng database tạm ngẫu nhiên, tự dọn và không ghi dữ liệu kiểm thử vào fitmanager. CI đã được cấu hình chạy thêm test:review; kết quả local không đồng nghĩa với kết quả CI đã chạy xong.
