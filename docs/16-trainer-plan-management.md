# PT xem và chỉnh sửa giáo án

PT mở Học viên & Giáo án → Xem giáo án của học viên để xem danh sách giáo án do chính mình tạo, thời hạn, trạng thái và các bài tập. Chọn Sửa giáo án để cập nhật tên, mục tiêu, ngày bắt đầu/kết thúc, trạng thái active/completed/cancelled và danh sách bài tập.

Mỗi bài tập có ngày, tên, số hiệp nguyên dương, số lần lặp và ghi chú. Form hỗ trợ thêm/xóa bài, lưu hoặc bỏ thay đổi. Bản nháp được khởi tạo từ bản ghi đã chọn; bỏ thay đổi rồi mở lại không giữ nội dung chưa lưu. Nút đóng/tải lại bị khóa khi đang sửa để tránh mất bản nháp qua thao tác đó.

Member xem nội dung mới trong Tiến độ & Thể trạng khi mở/tải lại màn hình, không có cập nhật realtime giữa hai phiên.

## API và xung đột cập nhật

- GET /api/trainer/workout-plans?memberId=... chỉ trả giáo án của PT đang đăng nhập.
- PATCH /api/trainer/workout-plans/:id chỉ cho PT sở hữu cập nhật, không nhận thay đổi member/trainer.
- Form gửi expectedVersion lấy từ __v của bản ghi đã tải. Nếu phiên bản đã đổi, backend trả 409 và yêu cầu tải lại trước khi sửa; không ghi đè bản mới.
- Sau thông báo xung đột, chọn Bỏ thay đổi → Tải lại giáo án → Sửa giáo án để làm việc trên phiên bản mới.
- expectedVersion tùy chọn để tương thích các client cũ; giao diện mới luôn gửi. MongoDB document save vẫn dùng optimistic concurrency để phát hiện các lần ghi đồng thời trong backend.
- Kiểm tra cặp ngày khi lưu, kể cả cập nhật một ngày. PT có hồ sơ bị khóa không được tạo hoặc sửa giáo án. Payload tạo sai kiểu title/goal trả 400.

## Kiểm chứng

- test:trainer: quyền sở hữu, ngày hợp lệ, phiên bản cũ/sai kiểu, hai lần cập nhật cùng phiên bản, bài tập và trạng thái Member nhận được, PT khóa, dữ liệu tạo sai kiểu.
- Frontend lint/build: đạt.
- Edge UAT: tạo → xem → sửa số hiệp/lần lặp/trạng thái → bỏ bản nháp → mở lại → Member xem nội dung đã cập nhật. Các luồng điểm danh, đánh giá, gói tập, đặt/hủy lịch và Admin cũ vẫn đạt.

Các kiểm thử dùng database ngẫu nhiên riêng và tự dọn, không ghi dữ liệu kiểm thử vào fitmanager. Bộ CI hiện có đã chạy test:trainer và trình duyệt; kiểm thử local không đồng nghĩa CI đã hoàn tất.
