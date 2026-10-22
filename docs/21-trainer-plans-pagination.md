# Phân trang và lọc giáo án PT

GET /api/trainer/workout-plans hỗ trợ page (mặc định 1), limit (mặc định 10, tối đa 100), memberId và status (active/completed/cancelled). ID học viên, trạng thái và phân trang sai trả 400; query mảng không được chấp nhận cho các trường này.

Response data gồm plans, total, page, limit, pages. plans vẫn là mảng nhưng chỉ chứa trang đã yêu cầu. Tổng số tính trên cùng bộ lọc trainer/member/status. Mọi query luôn scope theo TrainerProfile của tài khoản đang đăng nhập. Populate member chỉ trả các trường thông tin cần hiển thị, không trả mật khẩu.

Sắp xếp createdAt rồi _id giảm dần để phân trang ổn định khi dữ liệu không đổi. Trang vượt phạm vi trả mảng rỗng, không tự đổi số trang ở backend. Offset paging không phải snapshot nếu có dữ liệu được thêm/sửa đồng thời.

## Giao diện

Xem giáo án của học viên tải 5 bản/trang, có tổng kết quả, trước/sau và bộ lọc trạng thái. Đổi trạng thái lọc quay về trang 1. Trong khi mở form sửa, các điều khiển lọc/chuyển trang bị khóa để tránh làm mất bản nháp.

Sau khi lưu sửa giáo án, panel tải lại trang đầu theo bộ lọc đang chọn. Nếu bản ghi vừa đổi sang trạng thái khác, nó rời khỏi bộ lọc cũ; panel hiển thị kết quả rỗng nếu không còn bản phù hợp. expectedVersion và xử lý xung đột vẫn giữ nguyên theo docs/16.

Endpoint Member xem giáo án /api/trainer/member/workout-plans không thay đổi trong đợt này và vẫn chưa phân trang; các màn Member không bị cắt dữ liệu theo giới hạn của API PT.

## Kiểm chứng

- test:trainer: 13 giáo án của PT, trang 5/5/3, không lặp id giữa trang, trang ngoài phạm vi, lọc active/completed, bỏ giáo án của PT khác và từ chối query sai.
- Edge UAT: panel có 12 giáo án với 5 bản/trang → trang 2 → lọc completed quay về trang 1 → sửa sang cancelled → bộ lọc completed không còn kết quả → lọc cancelled thấy đúng giáo án.
- Các kịch bản Member/PT/Admin, mobile, chống retry trùng tiến độ và sửa giáo án trước đó vẫn đạt trong browser suite.
- Frontend lint và production build đạt. Các fixture chỉ được tạo trong database tạm riêng và tự dọn, không ghi vào fitmanager.

NFR-05 chưa hoàn thành toàn hệ thống: danh sách Member và các endpoint PT khác còn cần phân trang. Không dùng kết quả này để khẳng định đã đo đạt hiệu năng p95.
