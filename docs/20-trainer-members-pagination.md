# Phân trang học viên PT

GET /api/trainer/members hỗ trợ page (mặc định 1), limit (mặc định 10, tối đa 100) và search (tối đa 120 ký tự). page/limit phải là số nguyên hợp lệ, không chấp nhận mảng hoặc offset vượt giới hạn số nguyên an toàn.

Response data gồm members, total, page, limit, pages và trainerProfileId. members vẫn là mảng như trước nhưng giờ chỉ chứa trang đã yêu cầu. total là tổng số học viên phù hợp truy vấn, không phải số buổi hoặc số phần tử của trang. pages=0 khi không có dữ liệu; trang ngoài phạm vi trả mảng rỗng và giữ metadata tổng.

## Truy vấn và quyền

- Chỉ PT xem danh sách gắn với TrainerProfile của mình, không lấy trainer từ query/body để quyết định quyền.
- Booking được nhóm theo member, đếm tổng buổi và số completed; latestBooking chọn theo ngày, startTime và _id giảm dần.
- Tổng buổi và quan hệ học viên bao gồm cả lịch cancelled để giữ lịch sử. Điều này không cấp quyền ghi tiến độ khi học viên chỉ có lịch đã hủy; endpoint tiến độ giữ chính sách riêng.
- Lookup User có role member, trả whitelist fullName/email/phone/avatar/createdAt, không trả password.
- Tìm theo tên/email, không phân biệt hoa thường, ký tự regex được escape. Sắp xếp tên và _id để phân trang ổn định khi dữ liệu không đổi.
- Dùng một aggregation có facet cho trang và tổng số, thay vì tải toàn bộ User rồi count/find riêng từng học viên. Vẫn cần truy vấn TrainerProfile để xác định quyền.

Đây là phân trang offset, không phải snapshot giữa nhiều request: nếu User/Booking thay đổi giữa hai lần chuyển trang, thành phần trang có thể thay đổi. Chưa có số liệu benchmark để khẳng định đáp ứng mục tiêu p95.

## Giao diện

Học viên & Giáo án có form tìm kiếm backend, tổng kết quả và nút trước/sau. Gửi tìm kiếm quay về trang 1; thay trang/tìm kiếm đóng panel học viên cũ. Loading/error/empty và vòng đời request dùng useApiResource để phản hồi cũ không thay kết quả mới.

Dashboard PT yêu cầu limit=1 và dùng metadata total, không đếm độ dài members để tính tổng học viên.

Admin và PT dùng chung hàm validate page/limit. Những endpoint Member/PT khác chưa được phân trang trong thay đổi này; NFR-05 toàn hệ thống vẫn chưa hoàn tất.

## Kiểm chứng

- test:trainer: 13 học viên qua ba trang với limit=5, không lặp id giữa các trang; trang ngoài phạm vi; thống kê total/completed/latest; tìm ký tự đặc biệt, tìm email; cách ly PT, whitelist và query sai.
- test:integration: các trang Admin vẫn đạt sau khi chuyển sang helper validation chung.
- Backend 17/17; frontend lint/build: đạt.
- Edge browser UAT: 13 học viên → trang đầu 10/trang sau 3 → tìm [Pro] một kết quả → kết quả rỗng → bỏ lọc; dashboard vẫn tổng 13. Các kiểm tra mobile và luồng nghiệp vụ cũ tiếp tục đạt.

Toàn bộ fixture kiểm thử chỉ nằm trong database tạm ngẫu nhiên, tự dọn; không tạo học viên mẫu trong fitmanager.
