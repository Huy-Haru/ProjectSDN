# PT xác nhận kết quả buổi tập

PT mở Lịch dạy của tôi, chọn Hoàn thành buổi hoặc Ghi nhận vắng, kiểm tra tên học viên/ngày/giờ rồi xác nhận. Thao tác được lưu vào Booking và hiển thị lại sau khi tải dữ liệu.

## API và quy tắc

PATCH /api/trainer/bookings/:id/status nhận status là completed hoặc no_show.

- Yêu cầu tài khoản trainer đã xác thực và TrainerProfile đang hoạt động.
- Backend tìm Booking thuộc TrainerProfile của tài khoản hiện tại; không nhận trainer/member từ body để quyết định quyền.
- Chỉ chuyển từ booked sau giờ kết thúc tại Việt Nam. Không chốt buổi chưa kết thúc.
- Gửi lặp lại cùng trạng thái trả kết quả hiện có. Không đổi trạng thái đã chốt sang trạng thái khác, hoặc khôi phục buổi đã hủy.
- Optimistic concurrency bảo vệ khi hai yêu cầu cùng xác nhận một buổi; một yêu cầu thắng, yêu cầu xung đột nhận 409.
- completed và no_show tiếp tục chiếm hạn mức; chỉ hủy hợp lệ mới hoàn buổi.
- PT không có quyền hủy qua endpoint này. Member/Admin giữ các luồng hủy hiện có.

Admin và PT dùng chung bookingStatusService để áp dụng quy tắc thời gian và trạng thái. Luồng hủy của Member vẫn kiểm tra chủ sở hữu và hoàn quota như trước.

## Liên kết nghiệp vụ

Member chỉ có thể gửi Review cho buổi completed đã kết thúc, không thể đánh giá no_show. Ghi nhận tiến độ mới của PT tự đếm các buổi completed đến ngày ghi nhận; các bản ghi thể trạng trước đó là ảnh chụp tại thời điểm lưu và không tự đổi.

Tổng quan và danh sách lịch lấy dữ liệu hiện tại khi mở/tải lại màn hình, chưa có cập nhật realtime giữa hai phiên đăng nhập.

## Kiểm chứng

- Backend test:attendance: phân quyền Member/PT, lịch PT khác, PT khóa, giờ chưa kết thúc, lịch đã hủy, gọi lặp, đổi trạng thái đã chốt, hai yêu cầu cạnh tranh, giữ quota, Review và số buổi trong ProgressLog.
- test:integration và test:booking: Admin, hủy và hoàn hạn mức cũ vẫn đạt.
- Backend 17/17; frontend lint/build: đạt.
- Edge UAT: PT xác nhận completed/no_show → ghi nhận tiến độ → Member thấy số buổi hoàn thành và đánh giá buổi do PT chốt; các luồng cũ tiếp tục đạt.

Kiểm thử chỉ ghi vào database ngẫu nhiên riêng và tự dọn, không thêm dữ liệu mẫu vào fitmanager. CI đã bổ sung test:attendance; kết quả local không thay cho kết quả CI khi chưa chạy xong.
